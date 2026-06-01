# Image Asset Guide

This project keeps asset formats predictable so images stay optimized, searchable, and easy to replace.

All ecommerce raster images should use WebP paths in code. Real final images can replace placeholders later.

## Format Rules

Use `.webp` for raster commerce and marketing imagery:

- Product images
- Hero banners
- Campaign banners
- Category images
- Mega menu images
- Lookbook and editorial images

Use `.svg` for vector assets:

- Logos
- Icons
- Vector marks
- UI decorative vector assets

Use `.png` or `.ico` only for app/browser icons:

- Favicon
- Apple touch icon
- App icons when Next.js requires PNG output

## Folder Locations

- `public/images/products/` for product photography
- `public/images/banners/` for general site banners
- `public/images/hero/` for homepage or landing hero imagery
- `public/images/categories/` for category tiles and landing pages
- `public/images/mega-menu/` for navigation menu imagery
- `public/images/campaigns/` for campaign and seasonal visuals
- `public/images/lookbook/` for editorial collections
- `public/images/placeholders/` for temporary image placeholders
- `public/logo/` for SVG logo assets
- `public/icons/` for SVG icon assets
- `public/favicon/` for public favicon/app icon source files
- `src/app/favicon.ico`, `src/app/icon.png`, and `src/app/apple-icon.png` for Next.js App Router icon routes

## CDN Usage

Image paths should stay written as project-relative paths such as `/images/products/black-drop-shoulder-tshirt.webp`. Components and asset helpers should pass ecommerce raster images through `getImageUrl()` from `src/lib/constants/assets.ts`.

By default, `getImageUrl("/images/products/tshirt.webp")` returns `/images/products/tshirt.webp`, so local files in `public/` continue to work.

To switch ecommerce images to a CDN later, set `NEXT_PUBLIC_IMAGE_BASE_URL`:

```env
NEXT_PUBLIC_IMAGE_BASE_URL=https://cdn.styleversebd.com
```

Then the same path resolves to `https://cdn.styleversebd.com/images/products/tshirt.webp`.

Add the CDN hostname to `NEXT_PUBLIC_IMAGE_CDN_HOSTNAMES` or `IMAGE_CDN_HOSTNAMES` when using remote images with Next.js Image. The Next config also reads the hostname from `NEXT_PUBLIC_IMAGE_BASE_URL`.

Logos, icons, favicon files, and App Router icon files can remain local unless the brand asset workflow changes later.

## Naming Convention

- Use lowercase only
- Use hyphen-separated names
- Do not use spaces
- Do not use random camera names such as `IMG_1234`
- Include product or category keywords
- Include color, fit, material, season, or style when useful

## Examples

- `black-drop-shoulder-tshirt.webp`
- `women-summer-dress-banner.webp`
- `styleverse-logo.svg`
- `favicon.ico`
