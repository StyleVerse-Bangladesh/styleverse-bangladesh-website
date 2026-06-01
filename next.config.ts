import type { NextConfig } from "next";

function getImageHostname(value: string | undefined) {
  const trimmedValue = value?.trim() ?? "";

  if (!trimmedValue) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    try {
      return new URL(trimmedValue).hostname;
    } catch {
      return "";
    }
  }

  return trimmedValue.replace(/^\/+/, "").split("/")[0].split(":")[0];
}

const imageCdnHostnames = (
  [
    process.env.NEXT_PUBLIC_IMAGE_CDN_HOSTNAMES,
    process.env.IMAGE_CDN_HOSTNAMES,
    getImageHostname(process.env.NEXT_PUBLIC_IMAGE_BASE_URL),
  ]
    .filter(Boolean)
    .join(",")
)
  .split(",")
  .map((hostname) => getImageHostname(hostname))
  .filter(Boolean);

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 192, 256, 320],
    remotePatterns: imageCdnHostnames.map((hostname) => ({
      protocol: "https",
      hostname,
      pathname: "/**",
    })),
  },
};

export default nextConfig;
