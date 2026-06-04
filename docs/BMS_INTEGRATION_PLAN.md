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
- Trigger invoice snapshot generation after successful order creation.
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

Future order records should also be able to connect to payment transactions, courier shipments, courier events, and customer risk checks.

## Phase 6C: Invoice Generation Module

Add backend invoice generation for completed order creation.

Invoice generation should run when a customer places an order and should:

- Auto-generate a unique invoice number.
- Create an immutable invoice snapshot from the order snapshot.
- Store customer, address, item, pricing, discount, delivery fee, grand total, payment status, and order date context.
- Support future HTML invoice rendering.
- Support future PDF generation and storage.
- Keep invoice content unchanged after creation, even if product, customer, address, or order data changes later.

Admin/BMS should support:

- Viewing an invoice from order details.
- Downloading invoice PDFs.
- Regenerating an invoice only when allowed by a future business policy.
- Showing customer order and invoice history.

Customer dashboard should support:

- Viewing invoices under My Orders.
- Downloading invoice PDFs for owned orders.
- Showing invoice number, order date, total, and payment status.

Recommended dedicated table:

- `invoices`

Recommended fields:

- `id`
- `orderId`
- `customerId`
- `invoiceNumber`
- `invoiceStatus`
- `subtotalSnapshot`
- `deliveryFeeSnapshot`
- `couponDiscountSnapshot`
- `shippingDiscountSnapshot`
- `grandTotalSnapshot`
- `customerSnapshot` jsonb
- `addressSnapshot` jsonb
- `itemsSnapshot` jsonb
- `pdfUrl`
- `generatedAt`
- `createdAt`

Future routes and APIs:

- Admin view: `GET /admin/orders/:id/invoice`
- Admin download: `GET /api/admin/orders/:id/invoice/download`
- Customer view: `GET /account/orders/:id/invoice`
- Customer download: `GET /api/account/orders/:id/invoice/download`

Future build roadmap:

- Add invoices table.
- Add invoice number generator.
- Add invoice HTML template.
- Add PDF generation.
- Add admin download button.
- Add customer dashboard invoice download.

Migration notes:

- Invoice generation must run server-side.
- Customer invoice access must be scoped to the authenticated customer.
- Admin invoice access must require authenticated admin authorization.
- Invoice PDF URLs should not expose private storage directly if invoice files contain sensitive customer/order data.
- Invoice snapshots must not change when product, customer, address, or order records change later.

## Phase 6A: Payment Settings Module

Add Admin/BMS controls for payment gateway configuration and payment method availability.

Admin/BMS should support:

- Payment gateway settings.
- COD and online payment method controls.
- Active/coming-soon status for payment methods.
- Gateway provider labels and operational metadata.
- Server-side credentials only.

Future table ideas:

- `payment_gateways`

Migration notes:

- Do not expose payment gateway secret keys to the browser.
- Keep gateway credentials in environment variables or encrypted database fields.
- Payment settings should not create transactions by themselves; they only configure available providers and methods.

## Phase 6B: Payment Gateway Integration

Add backend payment transaction creation, status sync, and refund tracking.

Backend should support:

- Creating online payment attempts for an order.
- Storing gateway transaction references.
- Syncing payment status through verified callbacks/webhooks or server-side status checks.
- Updating order payment status from backend-owned transaction state.
- Tracking refunds if the selected gateway supports or requires it.
- Preserving COD orders without forcing gateway transaction creation.

Future table ideas:

- `payment_transactions`
- `payment_events`

Payment transaction records should store order ID, gateway ID, method, amount, currency, status, gateway reference, gateway response summary, and refund references when applicable.

Migration notes:

- Frontend payment status is never authoritative.
- Gateway webhook handlers must verify provider signatures or authenticity before mutating orders.
- API logs should avoid storing secrets, full card data, or unnecessary sensitive payloads.

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

## Phase 8: Pathao Courier Settings Module

Add Admin/BMS controls for Pathao courier account setup and geographic mapping.

Admin/BMS should support:

- Pathao merchant credentials.
- Courier account activation state.
- Courier city/zone/area mapping.
- Mapping checkout/order addresses to Pathao IDs.
- Delivery charge calculation if the Pathao API supports it.

Future table ideas:

- `courier_accounts`
- `courier_area_mappings`

Migration notes:

- Pathao credentials must stay server-side only.
- Credentials should live in environment variables or encrypted database fields.
- City/zone/area mappings should be editable or refreshable without changing storefront code.

## Phase 9: Fraud Check Service

Add phone-number based customer fraud/risk checks for order review.

Risk service should support:

- Lookup by customer phone number.
- Internal order history summary.
- Pathao merchant/customer history data if available.
- Total previous orders.
- Delivered count.
- Cancelled count.
- Returned count.
- Success rate.
- Risk label: LOW, MEDIUM, or HIGH.
- Risk notes for order details.

Future table ideas:

- `customer_risk_checks`

Migration notes:

- Risk checks should be backend-generated.
- Risk labels should guide admin review, not replace admin judgment unless a later business rule explicitly requires auto-rejection.
- Do not trust risk labels or risk notes supplied by frontend requests.

## Phase 10: Order Details Courier Action

Add order-detail fulfillment actions for creating courier shipments from confirmed orders.

Order details workflow:

```text
Order created
  |
  v
Admin opens order
  |
  v
Fraud check by phone
  |
  v
Admin confirms or rejects
  |
  v
Courier shipment created via Pathao
  |
  v
Payment and courier status sync
  |
  v
Delivery complete
```

Backend should support:

- Creating a Pathao shipment from an order.
- Storing courier shipment IDs and tracking references.
- Capturing shipment address snapshots.
- Preventing duplicate shipment creation unless explicitly allowed.
- Recording admin user/action metadata.

Future table ideas:

- `courier_shipments`

Migration notes:

- Shipment creation must run server-side.
- Order address, customer phone, package weight, item value, and delivery method should be validated before calling Pathao.
- Shipment creation should not rely on frontend-calculated delivery status.

## Phase 11: Shipment Tracking Sync

Add courier tracking status sync and event logging.

Backend should support:

- Pulling or receiving Pathao shipment status updates.
- Mapping courier statuses to internal delivery statuses.
- Recording courier events/logs.
- Updating order delivery status from verified backend sync only.
- Showing tracking history in admin order details later.

Future table ideas:

- `courier_events`

Migration notes:

- Courier sync jobs should be idempotent.
- Store raw provider payloads carefully and avoid persisting secrets.
- Delivery status changes should append history rather than silently overwrite operational context.

## Phase 12: Admin/BMS Controls for All Storefront Content and Settings

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
- Payment gateway settings.
- Pathao courier settings.
- Invoice generation and PDF downloads.
- Customer fraud/risk checks.
- Courier shipments and tracking.
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
- Payment transaction history.
- Courier event history.
- Invoice history.
- Customer risk check history.
- Role-based admin access.

## Security Notes

- API credentials must stay in environment variables or encrypted database fields.
- Never expose Pathao or payment gateway secret keys to browser code.
- All courier and payment API calls must run server-side only.
- Store API logs safely and avoid unnecessary sensitive payload storage.
- Do not trust frontend payment status, courier status, delivery fee, fraud status, or risk labels.
- Payment gateway webhooks must verify provider authenticity before updating payment or order state.
- Pathao courier sync should update delivery state only through backend-verified API responses or trusted callbacks.
- Admin actions should be authorized, audited, and tied to an admin user ID.
- Customer invoice routes must verify ownership before returning invoice details or downloads.
- Invoice PDFs should be served through authenticated download endpoints when private customer/order data is present.
- Invoice snapshots must remain immutable after generation.

## Integration Principles

- Do not hardcode future business data in components.
- Components should receive normalized frontend models.
- API adapters should map BMS DTOs to existing UI models.
- Static JSON/data files are fallback only.
- Frontend totals are preview only.
- BMS/backend must be source of truth for price, inventory, coupon validity, order totals, delivery fee, and payment status.
- Keep API failures graceful by falling back only where it is safe to do so.
- Never create an order from client-calculated totals.
- Never update payment, courier, or fraud/risk status from untrusted frontend state.
- Never generate invoices from client-calculated checkout data.
