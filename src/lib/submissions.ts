import { supabase, isSupabaseConfigured } from './supabase';
import { trackEvent } from './analytics';

export type DemoRequestData = {
  name: string;
  businessName: string;
  trade: string;
  phone: string;
  email: string;
  city: string;
  website?: string;
  leadsPerWeek: string;
  biggestIssue: string;
};

export type SubmitDemoResult = {
  success: boolean;
  error?: string;
};

const MAX_RETRIES = 2;

export async function submitDemoRequest(
  data: DemoRequestData
): Promise<SubmitDemoResult> {
  if (!isSupabaseConfigured() || !supabase) {
    console.error('Supabase is not configured');
    return { success: false, error: 'Service temporarily unavailable. Please try again later.' };
  }

  trackEvent('demo_submit_started', { trade: data.trade });

  let lastError = 'Unknown error';

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const { error } = await supabase.from('demo_requests').insert({
      name: data.name,
      business_name: data.businessName,
      trade: data.trade,
      phone: data.phone,
      email: data.email,
      city: data.city,
      website: data.website || null,
      leads_per_week: data.leadsPerWeek,
      biggest_issue: data.biggestIssue,
    });

    if (!error) {
      trackEvent('demo_submit_succeeded', { trade: data.trade });
      return { success: true };
    }

    lastError = error.message ?? 'Submission failed. Please try again.';

    const errorCode = error.code ?? '';
    if (errorCode.startsWith('23')) {
      break;
    }
  }

  console.error('Demo request submission failed after retries:', lastError);
  trackEvent('demo_submit_failed', { trade: data.trade, error: lastError });
  return { success: false, error: lastError };
}
