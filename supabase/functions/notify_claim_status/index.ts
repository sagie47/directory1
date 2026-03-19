import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const resendApiKey = Deno.env.get('RESEND_API_KEY');
const webhookSecret = Deno.env.get('WEBHOOK_SECRET');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
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

    const payload = await req.json();
    const { record, old_record } = payload;

    // Check if it's a valid update
    if (payload.type !== 'UPDATE' || !record || !old_record) {
      return new Response(JSON.stringify({ message: 'Ignored: Not an update' }), { status: 200 });
    }

    if (!record.id || record.id !== old_record.id) {
      return new Response(JSON.stringify({ message: 'Ignored: Invalid claim payload' }), { status: 200 });
    }

    // Only trigger on transition from pending to approved/rejected
    const statusChanged = old_record.status !== record.status;
    const isTerminalStatus = record.status === 'approved' || record.status === 'rejected';
    
    if (!statusChanged || !isTerminalStatus) {
      return new Response(JSON.stringify({ message: 'Ignored: Status did not change to a terminal state' }), { status: 200 });
    }

    // Check dry-run mode BEFORE claiming to avoid marking as sent
    if (!resendApiKey) {
      console.log('RESEND_API_KEY is not set. Skipping notification (dry-run mode):', {
        claimId: record.id,
        status: record.status,
        to: record.claimant_email,
      });
      return new Response(JSON.stringify({ success: true, message: 'Dry-run: Notification skipped, DB not updated' }), { status: 200 });
    }

    // Atomic claim to prevent race conditions
    const { data: claimResult, error: claimError } = await supabase
      .from('business_claims')
      .update({ notification_sent_at: new Date().toISOString() })
      .eq('id', record.id)
      .is('notification_sent_at', null)
      .select('id');

    if (claimError) {
      console.error('Failed to claim notification:', claimError);
    }

    // If no row was updated, another worker already claimed this
    if (!claimResult || claimResult.length === 0) {
      return new Response(JSON.stringify({ message: 'Ignored: Notification already processed' }), { status: 200 });
    }

    let emailSubject = '';
    let emailHtml = '';

    if (record.status === 'approved') {
      emailSubject = 'Your Business Claim has been Approved!';
      emailHtml = `
        <h2>Congratulations!</h2>
        <p>Your request to claim your business has been <strong>approved</strong>.</p>
        <p>You can now access your Owner Dashboard to manage your listing, respond to inquiries, and update your business details.</p>
        <p><a href="https://okanagantradesdirectory.com/owner/dashboard">Go to Owner Dashboard</a></p>
      `;
    } else if (record.status === 'rejected') {
      emailSubject = 'Update on your Business Claim Request';
      emailHtml = `
        <h2>Claim Status Update</h2>
        <p>Unfortunately, your request to claim the business has been <strong>rejected</strong>.</p>
        ${record.rejection_reason ? `<p><strong>Reason provided:</strong> ${escapeHtml(record.rejection_reason)}</p>` : ''}
        <p>If you believe this is an error, please reach out to our support team.</p>
      `;
    }

    // Send the email via Resend
    if (resendApiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Okanagan Trades <noreply@okanagantradesdirectory.com>',
          to: record.claimant_email,
          subject: emailSubject,
          html: emailHtml,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Resend Error: ${errText}`);
      }
    } else {
      console.log('RESEND_API_KEY is not set. Skipping email send (dry-run mode):', { to: record.claimant_email, subject: emailSubject });
      // Don't mark as sent in dry-run mode
      return new Response(JSON.stringify({ success: true, message: 'Dry-run: Notification skipped' }), { status: 200 });
    }

    return new Response(JSON.stringify({ success: true, message: 'Notification sent successfully' }), { status: 200 });

  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
