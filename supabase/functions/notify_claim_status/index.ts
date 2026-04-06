import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const resendApiKey = Deno.env.get('RESEND_API_KEY');
const webhookSecret = Deno.env.get('WEBHOOK_SECRET');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'revoked';
type NotificationStatus = 'pending' | 'sending' | 'sent' | 'failed' | 'skipped';

interface NotificationPayload {
  type?: string;
  retry?: boolean;
  claim_id?: string;
  record?: {
    id?: string;
    status?: ClaimStatus;
  };
  old_record?: {
    id?: string;
    status?: ClaimStatus;
  };
}

interface ClaimNotificationRow {
  id: string;
  status: ClaimStatus;
  claimant_email: string;
  rejection_reason: string | null;
  notification_status: NotificationStatus;
  notification_retry_count: number;
  notification_sent_at: string | null;
}

interface ClaimAttemptRow {
  id: string;
  status: ClaimStatus;
  claimant_email: string;
  rejection_reason: string | null;
  notification_retry_count: number;
}

class NotificationSendError extends Error {
  code: string;
  retryable: boolean;
  httpStatus: number | null;
  responseBody: string | null;

  constructor({
    code,
    message,
    retryable,
    httpStatus = null,
    responseBody = null,
  }: {
    code: string;
    message: string;
    retryable: boolean;
    httpStatus?: number | null;
    responseBody?: string | null;
  }) {
    super(message);
    this.name = 'NotificationSendError';
    this.code = code;
    this.retryable = retryable;
    this.httpStatus = httpStatus;
    this.responseBody = responseBody;
  }
}

function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function truncate(input: string, maxLength = 1400): string {
  if (input.length <= maxLength) {
    return input;
  }
  return `${input.slice(0, maxLength)}...`;
}

function parseClaimId(payload: NotificationPayload): string | null {
  if (typeof payload.claim_id === 'string' && payload.claim_id.trim().length > 0) {
    return payload.claim_id.trim();
  }

  if (typeof payload.record?.id === 'string' && payload.record.id.trim().length > 0) {
    return payload.record.id.trim();
  }

  return null;
}

function shouldProcessPayload(payload: NotificationPayload, claimId: string | null) {
  const explicitRetry = payload.retry === true;
  const isDirectAdminCall = typeof payload.claim_id === 'string' && payload.claim_id.trim().length > 0;
  const isWebhookUpdate = payload.type === 'UPDATE' && Boolean(payload.record) && Boolean(payload.old_record);

  if (!claimId) {
    return { process: false, message: 'Ignored: Missing claim id', explicitRetry };
  }

  if (isDirectAdminCall) {
    return { process: true, message: '', explicitRetry };
  }

  if (!isWebhookUpdate) {
    return { process: false, message: 'Ignored: Not a supported event payload', explicitRetry };
  }

  if (!payload.record || !payload.old_record || payload.record.id !== payload.old_record.id) {
    return { process: false, message: 'Ignored: Invalid webhook payload', explicitRetry };
  }

  const statusChanged = payload.old_record.status !== payload.record.status;
  const becameTerminal = payload.record.status === 'approved' || payload.record.status === 'rejected';

  if (!statusChanged || !becameTerminal) {
    return { process: false, message: 'Ignored: Status did not transition to a terminal state', explicitRetry };
  }

  return { process: true, message: '', explicitRetry };
}

function buildEmail(status: ClaimStatus, rejectionReason: string | null) {
  if (status === 'approved') {
    return {
      subject: 'Your Business Claim has been Approved!',
      html: `
        <h2>Congratulations!</h2>
        <p>Your request to claim your business has been <strong>approved</strong>.</p>
        <p>You can now access your Owner Dashboard to manage your listing, respond to inquiries, and update your business details.</p>
        <p><a href="https://okanagantradesdirectory.com/owner/dashboard">Go to Owner Dashboard</a></p>
      `,
    };
  }

  return {
    subject: 'Update on your Business Claim Request',
    html: `
      <h2>Claim Status Update</h2>
      <p>Unfortunately, your request to claim the business has been <strong>rejected</strong>.</p>
      ${rejectionReason ? `<p><strong>Reason provided:</strong> ${escapeHtml(rejectionReason)}</p>` : ''}
      <p>If you believe this is an error, please reach out to our support team.</p>
    `,
  };
}

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  let response: Response;

  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Okanagan Trades <noreply@okanagantradesdirectory.com>',
        to,
        subject,
        html,
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new NotificationSendError({
      code: 'NETWORK_ERROR',
      message: `Failed to reach Resend: ${message}`,
      retryable: true,
    });
  }

  if (!response.ok) {
    const responseBody = truncate(await response.text());
    throw new NotificationSendError({
      code: 'RESEND_HTTP_ERROR',
      message: `Resend returned HTTP ${response.status}.`,
      retryable: response.status >= 500 || response.status === 429,
      httpStatus: response.status,
      responseBody,
    });
  }

  return response.status;
}

async function fetchClaimNotificationRow(supabase: ReturnType<typeof createClient>, claimId: string) {
  const { data, error } = await supabase
    .from('business_claims')
    .select('id, status, claimant_email, rejection_reason, notification_status, notification_retry_count, notification_sent_at')
    .eq('id', claimId)
    .maybeSingle();

  if (error || !data) {
    console.error('Failed to read claim for notification:', error);
    return null;
  }

  return data as ClaimNotificationRow;
}

serve(async (req) => {
  try {
    const signature = req.headers.get('x-webhook-signature');
    const authHeader = req.headers.get('authorization');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Allow either trusted webhook signature or authenticated admin invocation.
    const signatureMatches = Boolean(webhookSecret) && signature === webhookSecret;
    if (!signatureMatches) {
      if (!authHeader?.startsWith('Bearer ')) {
        return new Response(null, { status: 401 });
      }

      if (!supabaseAnonKey) {
        throw new Error('SUPABASE_ANON_KEY is required for auth-based notification invocation');
      }

      const authClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      });

      const { data: userData, error: userError } = await authClient.auth.getUser();
      if (userError || !userData.user) {
        return new Response(null, { status: 401 });
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .maybeSingle();

      if (profileError || profile?.role !== 'admin') {
        return new Response(null, { status: 403 });
      }
    }

    const payload = (await req.json()) as NotificationPayload;
    const claimId = parseClaimId(payload);
    const payloadDecision = shouldProcessPayload(payload, claimId);
    if (!payloadDecision.process || !claimId) {
      return new Response(JSON.stringify({ message: payloadDecision.message }), { status: 200 });
    }

    const dbClaim = await fetchClaimNotificationRow(supabase, claimId);
    if (!dbClaim) {
      return new Response(JSON.stringify({ message: 'Ignored: Claim row not available' }), { status: 200 });
    }

    if (dbClaim.status !== 'approved' && dbClaim.status !== 'rejected') {
      return new Response(JSON.stringify({ message: 'Ignored: Claim is not in a terminal status in DB' }), { status: 200 });
    }

    if (dbClaim.notification_status === 'sent') {
      return new Response(JSON.stringify({ message: 'Ignored: Notification already sent' }), { status: 200 });
    }

    const claimedAt = new Date().toISOString();
    const nextRetryCount = dbClaim.notification_retry_count + 1;
    const claimableStatuses: NotificationStatus[] = payloadDecision.explicitRetry
      ? ['pending', 'failed', 'skipped', 'sending']
      : ['pending'];

    const { data: claimResult, error: claimError } = await supabase
      .from('business_claims')
      .update({
        notification_status: 'sending',
        notification_retry_count: nextRetryCount,
        notification_last_attempt_at: claimedAt,
        notification_last_error_code: null,
        notification_last_error: null,
        notification_last_http_status: null,
        notification_last_response_body: null,
      })
      .eq('id', claimId)
      .in('status', ['approved', 'rejected'])
      .in('notification_status', claimableStatuses)
      .eq('notification_retry_count', dbClaim.notification_retry_count)
      .select('id, status, claimant_email, rejection_reason, notification_retry_count')
      .maybeSingle();

    if (claimError) {
      console.error('Failed to claim notification attempt:', claimError);
      throw new Error('Unable to claim notification attempt.');
    }

    if (!claimResult) {
      return new Response(JSON.stringify({ message: 'Ignored: Notification is already being processed or was already sent' }), { status: 200 });
    }

    const claimedClaim = claimResult as ClaimAttemptRow;

    if (!resendApiKey) {
      console.log('RESEND_API_KEY is not set. Skipping notification (dry-run mode):', {
        claimId: claimedClaim.id,
        status: claimedClaim.status,
        to: claimedClaim.claimant_email,
      });
      const { error: skipError } = await supabase
        .from('business_claims')
        .update({
          notification_status: 'skipped',
          notification_last_failure_at: claimedAt,
          notification_last_error_code: 'DRY_RUN',
          notification_last_error: 'RESEND_API_KEY is not configured. Notification delivery skipped.',
        })
        .eq('id', claimId)
        .eq('notification_status', 'sending');

      if (skipError) {
        console.error('Failed to persist dry-run notification metadata:', skipError);
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Dry-run: Notification skipped and metadata persisted',
      }), { status: 200 });
    }

    const email = buildEmail(claimedClaim.status, claimedClaim.rejection_reason);

    try {
      const responseStatus = await sendEmail({
        to: claimedClaim.claimant_email,
        subject: email.subject,
        html: email.html,
      });

      const { error: markSentError } = await supabase
        .from('business_claims')
        .update({
          notification_status: 'sent',
          notification_sent_at: new Date().toISOString(),
          notification_last_success_at: new Date().toISOString(),
          notification_last_error_code: null,
          notification_last_error: null,
          notification_last_http_status: responseStatus,
          notification_last_response_body: null,
          notification_last_failure_at: null,
        })
        .eq('id', claimId)
        .eq('notification_status', 'sending');

      if (markSentError) {
        console.error('Failed to persist notification success metadata:', markSentError);
        return new Response(JSON.stringify({
          success: true,
          claim_id: claimId,
          message: 'Notification sent, but success metadata update failed. Manual audit recommended.',
          metadata_persisted: false,
        }), { status: 200 });
      }
    } catch (sendError) {
      let sendFailure: NotificationSendError;
      if (sendError instanceof NotificationSendError) {
        sendFailure = sendError;
      } else {
        const message = sendError instanceof Error ? sendError.message : String(sendError);
        sendFailure = new NotificationSendError({
          code: 'UNKNOWN_SEND_ERROR',
          message,
          retryable: true,
        });
      }

      const rollback = await supabase
        .from('business_claims')
        .update({
          notification_status: 'failed',
          notification_last_failure_at: new Date().toISOString(),
          notification_last_error_code: sendFailure.code,
          notification_last_error: sendFailure.message,
          notification_last_http_status: sendFailure.httpStatus,
          notification_last_response_body: sendFailure.responseBody,
        })
        .eq('id', claimId)
        .eq('notification_status', 'sending');

      if (rollback.error) {
        console.error('Failed to persist notification failure metadata:', rollback.error);
      }

      return new Response(JSON.stringify({
        error: sendFailure.message,
        code: sendFailure.code,
        retryable: sendFailure.retryable,
      }), { status: 500 });
    }

    return new Response(JSON.stringify({
      success: true,
      claim_id: claimId,
      message: 'Notification sent successfully',
      attempt: claimedClaim.notification_retry_count,
      retry: payloadDecision.explicitRetry,
    }), { status: 200 });

  } catch (error) {
    console.error('Error processing webhook:', error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message, retryable: true }), { status: 500 });
  }
});
