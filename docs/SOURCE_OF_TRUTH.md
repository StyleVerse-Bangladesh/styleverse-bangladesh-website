# StyleVerse Source of Truth

This document records the current storefront ownership model and the intended future ownership model for BMS/Admin integration.

The future BMS/Admin panel should become the single dynamic control center for business data, storefront content, order operations, customers, and store settings. Static data in the frontend should remain only as a development fallback until BMS APIs are connected.

## Ownership Table

| Feature | Current Owner | Future Owner | Notes |
| --- | --- | --- | --- |
| Products | Frontend static JSON in `src/data/products.json` | BMS/Admin catalog | Product records should be fetched from API and mapped into storefront models. |
| Product images | Frontend/public image paths in product data | BMS/Admin media library | BMS should manage image order, alt text, and publishing state. |
| Product variants | Frontend static product variant arrays | BMS/Admin catalog | Variant IDs, color, size, stock, and status must be stable API data. |
| Prices | Frontend static product data | BMS/backend pricing | Frontend prices are display previews only once APIs are connected. |
| Compare prices | Frontend static product data | BMS/Admin catalog | Used for merchandising and sale display. |
| Inventory | Frontend variant fields plus helper logic | BMS/backend inventory | Backend must validate stock before order creation. |
| Preorder settings | Frontend variant preorder fields | BMS/Admin inventory controls | BMS should control preorder enablement, ship date, and quantity limit. |
| Root categories | `src/data/category-taxonomy.ts` | BMS/Admin category manager | Static taxonomy should become fallback only. |
| Subcategories | `src/data/category-taxonomy.ts` | BMS/Admin category manager | Parent-child hierarchy must come from API. |
| Child categories | `src/data/category-taxonomy.ts` | BMS/Admin category manager | Nested category routes must use API-backed category paths later. |
| Category sort order | Frontend taxonomy seed data | BMS/Admin category manager | BMS should control navigation and listing order. |
| Nav visibility | Frontend taxonomy flags | BMS/Admin category manager | Header/nav should consume API-normalized category models. |
| Filter visibility | Frontend taxonomy flags | BMS/Admin category manager | Listing filters should use API category metadata. |
| Category SEO | Frontend taxonomy SEO fields | BMS/Admin SEO controls | BMS should own title, description, canonical policy, and index state. |
| Hero banners | Hardcoded home component data | BMS/Admin CMS | BMS should control slides, links, schedule, and publish state. |
| Shop by Category | Hardcoded home component data | BMS/Admin CMS/category curation | Should reference category IDs instead of duplicated links. |
| New Arrivals | Hardcoded home product array | BMS/Admin merchandising | Should become a curated product collection or API query. |
| Product You May Like | Static product list passed from frontend data | BMS/Admin merchandising or recommendations API | Can start as curated collection before personalization. |
| Feature strip | Hardcoded home component data | BMS/Admin CMS/settings | Delivery, exchange, support, and trust messages should be editable. |
| Campaign sections | Not yet dynamic | BMS/Admin CMS | Future promotional sections should be controlled by BMS. |
| Promotional content | Hardcoded content and static marketing copy | BMS/Admin CMS | Includes banners, campaign text, and merchandising blocks. |
| Coupons | `src/data/coupons.ts` | BMS/backend marketing | Frontend coupons should become fallback examples only. |
| Discounts | Frontend coupon helpers | BMS/backend pricing engine | Backend must calculate authoritative discounts. |
| Flash sales | Not yet implemented | BMS/backend marketing | Needs schedule, eligibility, inventory, and pricing rules. |
| Free shipping rules | Frontend coupon and pricing helpers | BMS/backend shipping rules | Backend must validate final shipping discount. |
| Cart pricing validation | Frontend `useCartSummary()` and `pricing.ts` | BMS/backend pricing API | Frontend totals are preview only. |
| Coupon validation | Frontend `validateCoupon()` | BMS/backend coupon API | Backend must validate coupon before order creation. |
| Inventory validation | Frontend inventory helpers | BMS/backend inventory API | Backend must check stock/preorder limits at checkout. |
| Order creation | Not implemented | BMS/backend orders | Checkout currently does not create orders. |
| Payment status | Not implemented | BMS/payment backend | BMS should track COD, online payment, failed, paid, refunded states. |
| Delivery status | Not implemented | BMS/order fulfillment | BMS should track processing, shipped, delivered, cancelled, returned. |
| OTP login | Placeholder frontend UI | BMS/backend auth | OTP send/verify must be server-backed. |
| Customer profile | Not implemented | BMS/backend customer service | Includes name, phone, email, and preferences. |
| Saved addresses | Not implemented | BMS/backend customer service | Checkout should eventually support customer address book. |
| Wishlist persistence | Frontend client store | BMS/backend customer service | Guest wishlist can remain local, authenticated wishlist should persist. |
| Order history | Not implemented | BMS/backend customer service | Customer account should read canonical order history from API. |
| Logo | Header/footer static image paths | BMS/Admin store settings | Frontend may keep fallback assets. |
| Store name | `src/lib/constants/site.ts` and metadata | BMS/Admin store settings | API/settings should supply display name later. |
| Contact info | Hardcoded footer/contact content | BMS/Admin store settings | Phone, email, address, and support hours should be editable. |
| Social links | Hardcoded footer links | BMS/Admin store settings | BMS should control channels and active state. |
| Footer links | Hardcoded footer sections | BMS/Admin store settings/CMS | Policy and content links should be configurable. |
| Delivery fee | Hardcoded in `src/lib/pricing.ts` | BMS/backend shipping rules | Backend must calculate authoritative delivery fee. |
| Payment methods | Checkout component constants | BMS/Admin payment settings | BMS should enable/disable COD and online methods. |
| Policy pages | Static frontend pages | BMS/Admin CMS | Static fallback is acceptable, but editable policy content should come from CMS. |
| SEO/meta | Frontend layout and route metadata | BMS/Admin SEO settings | App shell defaults can remain frontend fallback. |
| PWA/app metadata | Frontend manifest and layout metadata | BMS/Admin store settings plus frontend manifest | App icons/routes remain frontend assets; display values can become configurable. |
| Theme settings | Frontend CSS/design system | BMS/Admin theme settings if needed | Keep core design in frontend; expose limited brand settings only if required. |

## Future BMS Control Scope

### Catalog

BMS/Admin should control products, product images, product variants, prices, compare prices, inventory, and preorder settings.

The storefront should consume normalized product models. Components should not depend directly on raw BMS response shapes.

### Categories

BMS/Admin should control root categories, subcategories, child categories, sort order, navigation visibility, filter visibility, and category SEO.

Category IDs and paths must be stable because product pages, category routes, breadcrumbs, navigation, filters, and metadata depend on them.

### Homepage and CMS

BMS/Admin should control hero banners, Shop by Category, New Arrivals, Product You May Like, feature strip, campaign sections, and promotional content.

Homepage blocks should be returned by API as ordered, typed content sections. Components should render normalized section models.

### Marketing

BMS/Admin should control coupons, discounts, flash sales, and free shipping rules.

Marketing rules must be validated by backend services. Frontend validation can remain as a fast preview only.

### Orders

BMS/backend must own cart pricing validation, coupon validation, inventory validation, order creation, payment status, and delivery status.

The frontend should submit product IDs, variant IDs, quantities, customer details, address, delivery method, payment method, and optional coupon code. The backend should calculate final totals and store the order snapshot.

### Customers

BMS/backend should own OTP login, customer profile, saved addresses, wishlist persistence, and order history.

Guest-only frontend state can remain local until the customer authenticates.

### Store Settings

BMS/Admin should control logo, store name, contact info, social links, footer links, delivery fee, payment methods, policy pages, SEO/meta, PWA/app metadata, and optional theme settings.

Core frontend layout and design tokens should stay in the codebase unless the business explicitly needs theme customization.

## Developer Rules

- Do not hardcode future business data in components.
- Components should receive normalized frontend models.
- API adapters should map BMS DTOs to existing UI models.
- Static JSON and data files are fallback only.
- Frontend totals are preview only.
- BMS/backend must be the source of truth for price, inventory, coupon validity, order totals, delivery fee, and payment status.
- Keep BMS-specific response shapes out of UI components.
- Keep fallback data small, obvious, and easy to delete after API integration.
- Revalidate cart, coupon, inventory, delivery fee, and payment status server-side before order creation.
