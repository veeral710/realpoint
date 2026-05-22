import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <nav className="nav">
        <span className="brand">RealPoint</span>
        <Link href="/explore">Explore</Link>
        <Link href="/admin">Admin</Link>
        <Link href="/login">Login</Link>
      </nav>
      <main className="container">
        <section style={{ padding: "3rem 0" }}>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
            Surat&apos;s reliable real estate companion
          </h1>
          <p style={{ fontSize: "1.2rem", color: "var(--muted)", maxWidth: 560 }}>
            Government updates, circulars, and local property listings — starting
            with Surat district.
          </p>
          <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
            <a
              className="btn"
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get on Android
            </a>
            <a
              className="btn btn-secondary"
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get on iOS
            </a>
          </div>
        </section>
        <section className="card">
          <h2>Features</h2>
          <ul>
            <li>Government news &amp; circulars for Surat</li>
            <li>Buy, sell &amp; rent listings — land, plots, houses, commercial</li>
            <li>Local areas: Adajan, Vesu, Varachha, Palsana &amp; more</li>
          </ul>
          <p className="alert" style={{ marginTop: "1rem" }}>
            RealPoint is not affiliated with any government body. Verify all
            information independently before transacting.
          </p>
          <p style={{ marginTop: "1rem" }}>
            <Link href="/privacy">Privacy Policy</Link>
          </p>
        </section>
      </main>
    </>
  );
}
