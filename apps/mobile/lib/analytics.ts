import { supabase } from "./supabase";

export async function trackEvent(
  eventName: string,
  screen?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("analytics_events").insert({
      event_name: eventName,
      screen: screen ?? null,
      user_id: user?.id ?? null,
      metadata: metadata ?? {},
    });
  } catch {
    /* demo-only; ignore offline errors */
  }
}
