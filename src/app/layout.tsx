import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter, JetBrains_Mono } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import { SiteShell } from "@/components/layout/site-shell";
import { getStorefrontProducts } from "@/data/catalog-access";
import { getStorefrontNavigation } from "@/data/category-access";
import { getStorefrontSettings } from "@/lib/api/clients/settings-client";
import { toSearchProduct } from "@/lib/product-search";
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

const rawDomEventRejectionNormalizerScript = `
(() => {
  if (window.__styleverseRawEventRejectionNormalizer) {
    return;
  }

  window.__styleverseRawEventRejectionNormalizer = true;
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;

    if (Object.prototype.toString.call(reason) !== "[object Event]") {
      return;
    }

    const target = reason.target || reason.srcElement;
    const source = target && (target.currentSrc || target.src || target.href);
    const message = source
      ? \`Resource load failed: \${source}\`
      : \`Resource event rejected a promise: \${reason.type || "unknown"}\`;

    event.preventDefault();
    event.stopImmediatePropagation();

    window.setTimeout(() => {
      Promise.reject(new Error(message));
    }, 0);
  }, true);
})();
`;

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
  const [settings, navigation, products] = await Promise.all([
    getStorefrontSettings(),
    getStorefrontNavigation(),
    getStorefrontProducts(),
  ]);
  const searchProducts = products.map(toSearchProduct);

  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${bebasNeue.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: rawDomEventRejectionNormalizerScript,
          }}
        />
        <AppProviders>
          <SiteShell
            navigation={navigation}
            searchProducts={searchProducts}
            settings={settings}
          >
            {children}
          </SiteShell>
        </AppProviders>
      </body>
    </html>
  );
}
