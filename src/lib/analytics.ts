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
