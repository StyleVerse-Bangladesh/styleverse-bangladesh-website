const imageRoot = "/images";
const imageBaseUrl = normalizeImageBaseUrl(
  process.env.NEXT_PUBLIC_IMAGE_BASE_URL,
);

export const assetFolders = {
  images: {
    products: `${imageRoot}/products`,
    banners: `${imageRoot}/banners`,
    hero: `${imageRoot}/hero`,
    categories: `${imageRoot}/categories`,
    megaMenu: `${imageRoot}/mega-menu`,
    campaigns: `${imageRoot}/campaigns`,
    lookbook: `${imageRoot}/lookbook`,
    placeholders: `${imageRoot}/placeholders`,
  },
  logo: "/logo",
  icons: "/icons",
  favicon: "/favicon",
} as const;

export const appIconPaths = {
  favicon: "/favicon.ico",
  icon: "/icon.png",
  appleTouchIcon: "/apple-icon.png",
  largeIcon: "/icon1.png",
} as const;

export type WebpAssetFile = `${string}.webp`;
export type SvgAssetFile = `${string}.svg`;
export type FaviconAssetFile = `${string}.ico` | `${string}.png`;

function assetPath(folder: string, fileName: string) {
  return `${folder}/${fileName}`;
}

function normalizeImageBaseUrl(baseUrl: string | undefined) {
  const trimmedBaseUrl = baseUrl?.trim().replace(/\/+$/, "") ?? "";

  if (!trimmedBaseUrl) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmedBaseUrl)) {
    return trimmedBaseUrl;
  }

  return `https://${trimmedBaseUrl}`;
}

function isAbsoluteImageUrl(path: string) {
  return /^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(path);
}

function isInlineImageUrl(path: string) {
  return /^(?:data|blob):/i.test(path);
}

export function getImageUrl(
  path: string | null | undefined,
  fallbackPath = "",
): string {
  const imagePath = path?.trim() ?? "";

  if (!imagePath) {
    return fallbackPath ? getImageUrl(fallbackPath) : "";
  }

  if (isAbsoluteImageUrl(imagePath) || isInlineImageUrl(imagePath)) {
    return imagePath;
  }

  const localPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

  if (!imageBaseUrl) {
    return localPath;
  }

  return `${imageBaseUrl}/${localPath.replace(/^\/+/, "")}`;
}

// Format rules:
// - Use WebP for product, banner, hero, category, campaign, mega-menu, and lookbook imagery.
// - Use SVG for logos, icons, vector marks, and UI decorative vector assets.
// - Use PNG or ICO only for favicon, apple touch icon, and app icon files.
export const assets = {
  productImage: (fileName: WebpAssetFile) =>
    getImageUrl(assetPath(assetFolders.images.products, fileName)),
  bannerImage: (fileName: WebpAssetFile) =>
    getImageUrl(assetPath(assetFolders.images.banners, fileName)),
  categoryImage: (fileName: WebpAssetFile) =>
    getImageUrl(assetPath(assetFolders.images.categories, fileName)),
  heroImage: (fileName: WebpAssetFile) =>
    getImageUrl(assetPath(assetFolders.images.hero, fileName)),
  campaignImage: (fileName: WebpAssetFile) =>
    getImageUrl(assetPath(assetFolders.images.campaigns, fileName)),
  megaMenuImage: (fileName: WebpAssetFile) =>
    getImageUrl(assetPath(assetFolders.images.megaMenu, fileName)),
  lookbookImage: (fileName: WebpAssetFile) =>
    getImageUrl(assetPath(assetFolders.images.lookbook, fileName)),
  placeholderImage: (fileName: WebpAssetFile) =>
    getImageUrl(assetPath(assetFolders.images.placeholders, fileName)),
  logo: (fileName: SvgAssetFile) => assetPath(assetFolders.logo, fileName),
  icon: (fileName: SvgAssetFile) => assetPath(assetFolders.icons, fileName),
  favicon: (fileName: FaviconAssetFile) =>
    assetPath(assetFolders.favicon, fileName),
} as const;

export const defaultImagePlaceholders = {
  product: assets.placeholderImage("product-placeholder.webp"),
  banner: assets.placeholderImage("banner-placeholder.webp"),
  category: assets.placeholderImage("category-placeholder.webp"),
} as const;

export const imageSizes = {
  productCard:
    "(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 25vw",
  productGallery: "(max-width: 1023px) 100vw, 50vw",
  hero: "100vw",
  newArrivalCard: "(max-width: 767px) calc(50vw - 1.375rem), 290px",
  megaMenuThumbnail: "(max-width: 1024px) 100vw, 280px",
} as const;
