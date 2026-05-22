import { supabase } from "../supabase";

/** Local Supabase test OTP — see supabase/config.toml [auth.sms.test_otp] */
export const DEMO_PHONE = "+919876543210";
export const DEMO_OTP = "123456";

export async function sendDemoOtp(phone: string) {
  const normalized = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;
  return supabase.auth.signInWithOtp({ phone: normalized });
}

export async function verifyDemoOtp(phone: string, token: string) {
  const normalized = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;
  return supabase.auth.verifyOtp({
    phone: normalized,
    token,
    type: "sms",
  });
}
