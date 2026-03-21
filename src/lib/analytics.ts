type AnalyticsProperties = Record<string, unknown>;

export function trackEvent(eventName: string, properties?: AnalyticsProperties) {
  if (typeof window === 'undefined') return;

  const win = window as Window & { dataLayer?: Array<Record<string, unknown>> };
  const dataLayer = win.dataLayer ?? (win.dataLayer = []);

  dataLayer.push({
    event: eventName,
    ...(properties ?? {})
  });
}

interface OfferAnalyticsProperties extends AnalyticsProperties {
  offer: string;
}

interface FormAnalyticsProperties extends AnalyticsProperties {
  form_id: string;
  offer?: string;
}

interface PaidPlanIntentProperties extends AnalyticsProperties {
  plan_id: string;
  source_page: string;
  plan_category: 'directory' | 'service';
  cta_label?: string;
  destination?: string;
}

export function trackOfferPageViewed(properties: OfferAnalyticsProperties) {
  trackEvent('offer_page_viewed', properties);
}

export function trackOfferCtaClicked(properties: OfferAnalyticsProperties) {
  trackEvent('offer_cta_clicked', properties);
}

export function trackFormViewed(properties: FormAnalyticsProperties) {
  trackEvent('form_viewed', properties);
}

export function trackFormStarted(properties: FormAnalyticsProperties) {
  trackEvent('form_started', properties);
}

export function trackFormSubmitted(properties: FormAnalyticsProperties) {
  trackEvent('form_submitted', properties);
}

export function trackFormSubmitFailed(properties: FormAnalyticsProperties) {
  trackEvent('form_submit_failed', properties);
}

export function trackStripeRedirectStarted(properties: FormAnalyticsProperties) {
  trackEvent('stripe_redirect_started', properties);
}

export function trackPaidPlanIntentViewed(properties: PaidPlanIntentProperties) {
  trackEvent('paid_plan_intent_viewed', properties);
}

export function trackPaidPlanIntentClicked(properties: PaidPlanIntentProperties) {
  trackEvent('paid_plan_intent_clicked', properties);
}
