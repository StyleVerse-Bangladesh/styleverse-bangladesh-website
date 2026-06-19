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

## Image Delivery

Image paths should stay written as project-relative paths such as `/images/products/black-drop-shoulder-tshirt.webp`. Components and asset helpers should pass ecommerce raster images through `getImageUrl()` from `src/lib/constants/assets.ts`.

`getImageUrl("/images/products/tshirt.webp")` returns `/images/products/tshirt.webp`, so local files in `public/` continue to work. Relative paths such as `images/products/tshirt.webp` are normalized to `/images/products/tshirt.webp`.

Uploaded admin media is stored in Cloudinary. Where applicable, the app stores the Cloudinary delivery `url`, original `secureUrl`, and `publicId` so media can be previewed, selected, and deleted through the existing admin flow.

Cloudinary full URLs such as `https://res.cloudinary.com/...` are supported alongside local public paths such as `/images/...` and `/logo/...`. The Next.js image config allows `res.cloudinary.com`; when `CLOUDINARY_CLOUD_NAME` is configured, that remote pattern is restricted to the configured cloud's image upload path.

The Cloudinary server credentials are:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER`

`CLOUDINARY_API_SECRET` must remain server-side only. Do not expose Cloudinary API credentials through `NEXT_PUBLIC_` variables.

The old custom image CDN environment variables are no longer used. Legacy `/uploads/media/...` database rows are unrelated to this env cleanup and should be handled separately if those files need migration.

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
