# BMS Integration Plan

This plan describes how to migrate StyleVerse from static storefront data to a BMS/Admin-controlled storefront without forcing a large rewrite.

The main rule: frontend components should consume stable storefront models, while API adapters map BMS DTOs into those models. Static data should remain as development fallback until the corresponding API is ready.

## Phase 1: DTO and API Adapter Layer With Static Fallback

Create DTO types under `src/types/api/` and API adapters under `src/lib/api/`.

Initial goals:

- Define BMS response DTOs separately from UI models.
- Add adapter functions that map DTOs into current storefront models.
- Keep static JSON/data files as fallback providers.
- Avoid importing raw BMS DTOs into UI components.
- Add clear ownership boundaries for catalog, categories, CMS, settings, pricing, orders, and customers.

Expected files later:

- `src/types/api/product-dto.ts`
- `src/types/api/category-dto.ts`
- `src/types/api/homepage-dto.ts`
- `src/types/api/settings-dto.ts`
- `src/types/api/pricing-dto.ts`
- `src/types/api/order-dto.ts`
- `src/types/api/customer-dto.ts`
- `src/lib/api/client.ts`
- `src/lib/api/catalog.ts`
- `src/lib/api/categories.ts`
- `src/lib/api/homepage.ts`
- `src/lib/api/settings.ts`
- `src/lib/api/pricing.ts`
- `src/lib/api/orders.ts`
- `src/lib/api/customer.ts`

## Phase 2: Products and Categories API

Move catalog and taxonomy reads behind API adapter functions.

API should support:

- Product listing.
- Product detail by slug.
- Category tree.
- Category detail by path.
- Category product listing.
- Product search.

Migration notes:

- Preserve current product and category UI models at the component boundary.
- Keep `src/data/products.json` and `src/data/category-taxonomy.ts` as fallback only.
- Plan carefully around static generation, dynamic category paths, and product slugs.
- Keep category IDs stable so navigation, breadcrumbs, filters, and product associations do not drift.

## Phase 3: Homepage CMS API

Move homepage content to typed CMS sections.

BMS/Admin should control:

- Hero banners.
- Shop by Category.
- New Arrivals.
- Product You May Like.
- Feature strip.
- Campaign sections.
- Promotional content.

Migration notes:

- Homepage API should return ordered sections with a section type.
- Sections should reference product IDs, category IDs, or campaign IDs instead of duplicated URLs.
- Frontend should map CMS sections into existing home component props.
- Keep static home sections as fallback only.

## Phase 4: Store Settings API

Move store-level settings to API.

BMS/Admin should control:

- Logo.
- Store name.
- Contact info.
- Social links.
- Footer links.
- Delivery fee settings.
- Payment methods.
- Policy pages.
- SEO/meta defaults.
- PWA/app metadata.
- Theme settings if needed.

Migration notes:

- Keep essential app shell defaults in frontend for resilience.
- Do not let settings API destabilize route structure or SSR.
- Limit theme customization to safe values such as brand colors, logos, and text content.

## Phase 5: Pricing, Coupon, and Inventory Validation API

Add backend pricing validation before order creation.

API should accept:

- Product IDs.
- Variant IDs.
- Quantities.
- Delivery method.
- Coupon code.
- Customer context when available.

API should return:

- Canonical line prices.
- Subtotal.
- Delivery fee.
- Coupon discount.
- Shipping discount.
- Grand total.
- Coupon validity.
- Inventory warnings.
- Out-of-stock or preorder status.

Migration notes:

- Frontend totals are preview only.
- Backend must be source of truth for price, inventory, coupon validity, order totals, delivery fee, and payment status.
- Existing frontend pricing helpers can remain for fast preview and fallback, but not for final order creation.

## Phase 6: Order Creation API

Implement real order creation through BMS/backend.

Order request should include:

- Customer/contact information.
- Delivery address.
- Delivery method.
- Payment method.
- Product IDs, variant IDs, and quantities.
- Coupon code if applied.
- Client preview totals for debugging only.

Backend should:

- Recalculate products, prices, discounts, shipping, and grand total.
- Revalidate coupon eligibility.
- Revalidate inventory and preorder limits.
- Create order with immutable pricing and coupon snapshots.
- Return order ID and status.

Order snapshot should store:

- Product ID.
- Variant ID.
- Product name.
- Variant labels.
- Unit price.
- Quantity.
- Line total.
- Coupon ID/code/type/value.
- Coupon discount.
- Shipping discount.
- Subtotal.
- Delivery fee.
- Grand total.
- Payment status.
- Delivery status.

## Phase 7: Customer Auth, Profile, Wishlist, and Order History API

Connect customer-facing account features.

API should support:

- OTP send.
- OTP verify.
- Login/register.
- Current customer profile.
- Saved addresses.
- Wishlist persistence.
- Order history.

Migration notes:

- Guest wishlist/cart may remain local initially.
- Authenticated wishlist should sync to backend.
- Checkout should be able to use saved addresses once customer auth exists.
- Order history must read from backend orders, not local state.

## Phase 8: Admin/BMS Controls for All Storefront Content and Settings

Complete BMS control surfaces for:

- Catalog.
- Categories.
- Inventory.
- Coupons.
- Campaigns.
- Homepage CMS.
- Orders.
- Customers.
- Store settings.
- Policy pages.
- SEO/meta.
- PWA/app metadata.

Operational requirements:

- Publish/unpublish controls.
- Draft support where needed.
- Audit fields.
- Usage tracking for coupons.
- Inventory adjustment history.
- Order status history.
- Role-based admin access.

## Integration Principles

- Do not hardcode future business data in components.
- Components should receive normalized frontend models.
- API adapters should map BMS DTOs to existing UI models.
- Static JSON/data files are fallback only.
- Frontend totals are preview only.
- BMS/backend must be source of truth for price, inventory, coupon validity, order totals, delivery fee, and payment status.
- Keep API failures graceful by falling back only where it is safe to do so.
- Never create an order from client-calculated totals.
