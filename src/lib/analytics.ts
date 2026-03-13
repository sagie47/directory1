export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    const dataLayer = (window as any).dataLayer || [];
    dataLayer.push({
      event: eventName,
      ...properties
    });
  }
}
