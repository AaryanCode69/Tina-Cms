import Link from 'next/link';
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Terraform Config Builder",
  description:
    "Generate schema-compliant Terraform JSON configurations through a guided form interface. No manual JSON editing required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header className="app-header">
          <div className="app-header__inner">
            <Link href="/" className="app-header__logo">
              <span className="app-header__logo-icon">⬡</span>
              <span className="app-header__logo-text">Terraform Config Builder</span>
            </Link>
            <nav className="app-header__nav">
              <Link href="/subscriptions/new" className="app-header__link">
                Create Subscription
              </Link>
            </nav>
          </div>
        </header>
        <main className="app-main">{children}</main>
      </body>
    </html>
  );
}
