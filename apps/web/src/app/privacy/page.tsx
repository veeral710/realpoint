import Link from "next/link";
import { DISCLAIMER_TEXT } from "@realpoint/shared";

export default function PrivacyPage() {
  return (
    <>
      <nav className="nav">
        <Link href="/" className="brand">
          RealPoint
        </Link>
      </nav>
      <main className="container">
        <h1>Privacy Policy</h1>
        <p>Last updated: May 2026</p>
        <div className="card">
          <h2>Overview</h2>
          <p>
            RealPoint (&quot;we&quot;) operates the RealPoint mobile application
            and website for Surat real estate information and listings.
          </p>
          <h2>Data we collect</h2>
          <ul>
            <li>Phone number (for OTP authentication)</li>
            <li>Profile information you provide (name, role)</li>
            <li>Property listings and inquiries you submit</li>
            <li>Push notification tokens (if you enable notifications)</li>
          </ul>
          <h2>How we use data</h2>
          <p>
            To authenticate you, display listings, deliver government news
            updates, and respond to inquiries between buyers and sellers.
          </p>
          <h2>Data sharing</h2>
          <p>
            We do not sell personal data. Listing contact details are shown to
            users who view your published listings.
          </p>
          <h2>Disclaimer</h2>
          <p>{DISCLAIMER_TEXT}</p>
          <h2>Contact</h2>
          <p>
            Email: care@realpoint.app (update with your support email)
          </p>
          <h2>Deletion</h2>
          <p>
            Request account and data deletion by contacting support. We will
            remove your profile and listings within 30 days.
          </p>
        </div>
      </main>
    </>
  );
}
