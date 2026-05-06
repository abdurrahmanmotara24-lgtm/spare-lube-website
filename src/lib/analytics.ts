type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

export function trackEvent(event: string, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return;
  const detail = { event, ...payload, ts: Date.now() };
  window.dispatchEvent(new CustomEvent("sparelube:analytics", { detail }));
  if (import.meta.env.DEV) {
    console.debug("[analytics]", detail);
  }
}
