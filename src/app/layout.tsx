import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter, JetBrains_Mono } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import { SiteShell } from "@/components/layout/site-shell";
import { getStorefrontSettings } from "@/lib/api/clients/settings-client";
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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStorefrontSettings();

  return {
    metadataBase: new URL("https://styleverse-bangladesh.local"),
    title: {
      default: settings.storeName,
      template: `%s | ${settings.storeName}`,
    },
    description: settings.description,
    applicationName: settings.storeName,
    manifest: "/manifest.webmanifest",
    keywords: ["fashion", "ecommerce", "Bangladesh", "menswear", "womenswear"],
    appleWebApp: {
      capable: true,
      title: settings.shortName,
      statusBarStyle: "default",
    },
    openGraph: {
      title: settings.storeName,
      description: settings.description,
      type: "website",
      locale: settings.locale.replace("-", "_"),
      siteName: settings.storeName,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#111111",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getStorefrontSettings();

  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${bebasNeue.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <AppProviders>
          <SiteShell settings={settings}>{children}</SiteShell>
        </AppProviders>
      </body>
    </html>
  );
}
