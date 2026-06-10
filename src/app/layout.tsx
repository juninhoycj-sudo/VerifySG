import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SafeSG – Digital Shield",
  description: "AI-powered scam detection and community protection for Singapore",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
