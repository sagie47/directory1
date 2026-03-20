import { supabase, isSupabaseConfigured } from './supabase';
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

export async function submitCallRequest(data: CallRequestData): Promise<SubmitCallRequestResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Database not configured' };
  }

  trackEvent('call_request_submit_started', { offer: data.offer });

  const { error } = await supabase.from('call_requests').insert({
    offer: data.offer,
    name: data.name,
    business_name: data.businessName,
    trade: data.trade,
    city: data.city,
    phone: data.phone,
    email: data.email,
    website: data.website || null,
    team_size: data.teamSize || null,
    primary_need: data.primaryNeed,
    stripe_payment_url: data.stripePaymentUrl || null,
    schedule_url: data.scheduleUrl || null,
  });

  if (error) {
    console.error('Call request submission failed:', error);
    trackEvent('call_request_submit_failed', { offer: data.offer, error: error.message });
    return { success: false, error: error.message };
  }

  trackEvent('call_request_submit_succeeded', { offer: data.offer });
  return { success: true };
}