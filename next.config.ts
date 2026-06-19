import type { NextConfig } from "next";

const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();

const cloudinaryRemotePattern = cloudinaryCloudName
  ? {
      protocol: "https" as const,
      hostname: "res.cloudinary.com",
      pathname: `/${cloudinaryCloudName}/image/upload/**`,
    }
  : {
      protocol: "https" as const,
      hostname: "res.cloudinary.com",
    };

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 95],
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 192, 256, 320],
    remotePatterns: [cloudinaryRemotePattern],
  },
};

export default nextConfig;
