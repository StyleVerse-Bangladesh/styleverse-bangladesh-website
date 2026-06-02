import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter, JetBrains_Mono } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import { SiteShell } from "@/components/layout/site-shell";
import "./globals.css";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://styleverse-bangladesh.local"),
  title: {
    default: "StyleVerse Bangladesh",
    template: "%s | StyleVerse Bangladesh",
  },
  description:
    "Premium fashion ecommerce frontend foundation for StyleVerse Bangladesh.",
  applicationName: "StyleVerse Bangladesh",
  manifest: "/manifest.webmanifest",
  keywords: ["fashion", "ecommerce", "Bangladesh", "menswear", "womenswear"],
  appleWebApp: {
    capable: true,
    title: "StyleVerse",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "StyleVerse Bangladesh",
    description:
      "Premium fashion ecommerce frontend foundation for StyleVerse Bangladesh.",
    type: "website",
    locale: "en_BD",
    siteName: "StyleVerse Bangladesh",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#111111",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${bebasNeue.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <AppProviders>
          <SiteShell>{children}</SiteShell>
        </AppProviders>
      </body>
    </html>
  );
}
