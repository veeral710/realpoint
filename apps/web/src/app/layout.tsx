import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RealPoint — Surat Real Estate",
  description:
    "Surat's reliable real estate companion — government updates and local property listings.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
