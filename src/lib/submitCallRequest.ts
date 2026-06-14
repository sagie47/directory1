import { isSupabaseConfigured } from './supabase';
import { trackEvent } from './analytics';
import type { CallOffer } from './callOffers';

export interface CallRequestData {
  offer: CallOffer;
  name: string;
  businessName: string;
  trade: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  teamSize?: string;
  primaryNeed: string;
  stripePaymentUrl?: string;
  scheduleUrl?: string;
}

export interface SubmitCallRequestResult {
  success: boolean;
  error?: string;
}

const MAX_RETRIES = 2;

function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

export async function submitCallRequest(data: CallRequestData): Promise<SubmitCallRequestResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Database not configured' };
  }

  trackEvent('call_request_submit_started', { offer: data.offer });

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { success: false, error: 'Database not configured' };
  }

  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/submit-call-request`;
  const idempotencyKey = generateIdempotencyKey();
  let lastError = 'Unknown error';

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey}`,
          'x-idempotency-key': idempotencyKey,
        },
        body: JSON.stringify({
          offer: data.offer,
          name: data.name,
          businessName: data.businessName,
          trade: data.trade,
          city: data.city,
          phone: data.phone,
          email: data.email,
          website: data.website || undefined,
          teamSize: data.teamSize || undefined,
          primaryNeed: data.primaryNeed,
          stripePaymentUrl: data.stripePaymentUrl || undefined,
          scheduleUrl: data.scheduleUrl || undefined,
        }),
      });

      if (response.ok) {
        trackEvent('call_request_submit_succeeded', { offer: data.offer });
        return { success: true };
      }

      const responseData = await response.json().catch(() => ({}));
      lastError = responseData.error || `Request failed with status ${response.status}`;

      // Rate limited - don't retry immediately
      if (response.status === 429) {
        break;
      }

      // Server error - may retry
      if (response.status >= 500) {
        continue;
      }

      // Client error - don't retry
      break;
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Network error. Please try again.';
    }
  }

  console.error('Call request submission failed after retries:', lastError);
  trackEvent('call_request_submit_failed', { offer: data.offer, error: lastError });
  return { success: false, error: 'Submission failed. Please try again later.' };
}
