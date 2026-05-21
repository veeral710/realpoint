"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isLocalSupabase } from "@/lib/admin";

type Mode = "email" | "phone";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const isLocal = isLocalSupabase();
  const [mode, setMode] = useState<Mode>("email");
  const [email, setEmail] = useState("admin@realpoint.local");
  const [password, setPassword] = useState("realpoint123");
  const [phone, setPhone] = useState("9876543210");
  const [otp, setOtp] = useState("");
  const [phoneStep, setPhoneStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("error") === "auth") {
      setError("Login link expired or invalid. Try password sign-in.");
    }
  }, [searchParams]);

  async function signInWithPassword(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    window.location.href = "/admin";
  }

  async function sendEmailLink(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    setLoading(true);
    setError(null);
    setMessage(null);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin`,
      },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setMessage(
      "Check Mailpit: http://127.0.0.1:54324 — click the login link in the email."
    );
  }

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    setLoading(true);
    setError(null);
    const formatted = phone.startsWith("+")
      ? phone
      : `+91${phone.replace(/\D/g, "")}`;
    const { error: err } = await supabase.auth.signInWithOtp({ phone: formatted });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setPhoneStep("otp");
    setMessage("Enter OTP if SMS test mode is enabled.");
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    setLoading(true);
    setError(null);
    const formatted = phone.startsWith("+")
      ? phone
      : `+91${phone.replace(/\D/g, "")}`;
    const { error: err } = await supabase.auth.verifyOtp({
      phone: formatted,
      token: otp,
      type: "sms",
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    window.location.href = "/admin";
  }

  return (
    <>
      <nav className="nav">
        <Link href="/" className="brand">
          RealPoint
        </Link>
      </nav>
      <main className="container" style={{ maxWidth: 420 }}>
        <h1>Admin login</h1>

        {error && <div className="alert">{error}</div>}

        {isLocal ? (
          <>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
              Local dev: email + password (phone OTP is not available locally).
            </p>
            <form onSubmit={signInWithPassword} className="card">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button className="btn" type="submit" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </button>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--muted)",
                  marginTop: "0.75rem",
                }}
              >
                First time? Run in terminal:{" "}
                <code>bash scripts/seed-dev-admin.sh</code>
              </p>
            </form>
          </>
        ) : (
          <>
            <div
              style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}
            >
              <button
                type="button"
                className={mode === "email" ? "btn" : "btn btn-secondary"}
                onClick={() => {
                  setMode("email");
                  setError(null);
                  setMessage(null);
                }}
              >
                Email
              </button>
              <button
                type="button"
                className={mode === "phone" ? "btn" : "btn btn-secondary"}
                onClick={() => {
                  setMode("phone");
                  setError(null);
                  setMessage(null);
                }}
              >
                Phone
              </button>
            </div>
            {message && (
              <div
                className="alert"
                style={{ background: "#e8f5ee", borderColor: "#1b6b4a" }}
              >
                {message}
              </div>
            )}
            {mode === "email" ? (
              <form onSubmit={sendEmailLink} className="card">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button className="btn" type="submit" disabled={loading}>
                  {loading ? "Sending…" : "Send magic link"}
                </button>
              </form>
            ) : phoneStep === "phone" ? (
              <form onSubmit={sendOtp} className="card">
                <label>Phone number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <button className="btn" type="submit" disabled={loading}>
                  {loading ? "Sending…" : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={verifyOtp} className="card">
                <label>OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <button className="btn" type="submit" disabled={loading}>
                  {loading ? "Verifying…" : "Verify"}
                </button>
              </form>
            )}
          </>
        )}
      </main>
    </>
  );
}
