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
| Invoice generation | Not implemented | BMS/backend invoices | Order creation should generate immutable invoice snapshots with invoice numbers and future HTML/PDF output. |
| Invoice PDF downloads | Not implemented | BMS/backend invoices | Admin and customer downloads should be served through authenticated routes, not direct private storage URLs. |
| Payment status | Not implemented | BMS/payment backend | BMS should track COD, online payment, failed, paid, refunded states. |
| Payment gateway settings | Not implemented | BMS/Admin payment settings | Admin should configure supported online payment gateways without exposing secret keys to the browser. |
| Payment transactions | Not implemented | BMS/payment backend | Online payment attempts, gateway references, amounts, statuses, and refunds should be stored as canonical backend records. |
| Payment events | Not implemented | BMS/payment backend | Gateway webhook/status-sync payloads should be logged safely and used to update order payment status server-side. |
| Delivery status | Not implemented | BMS/order fulfillment | BMS should track processing, shipped, delivered, cancelled, returned. |
| Pathao courier credentials | Not implemented | BMS/Admin courier settings | Merchant credentials should be server-only and encrypted or stored in protected environment configuration. |
| Courier shipments | Not implemented | BMS/order fulfillment | Shipment creation, courier tracking IDs, delivery status, and shipment snapshots should be owned by BMS/backend. |
| Courier city/zone/area mapping | Not implemented | BMS/Admin courier settings | Pathao city, zone, and area IDs should be mapped to checkout/order addresses before shipment creation. |
| Courier events | Not implemented | BMS/order fulfillment | Pathao shipment status sync and tracking events should be stored as backend event logs. |
| Customer fraud/risk checks | Not implemented | BMS/order risk service | Phone-based risk checks should summarize previous order outcomes and expose a LOW/MEDIUM/HIGH risk label to admins. |
| Customer risk notes | Not implemented | BMS/Admin orders | Risk notes should be visible in order details and should not be trusted from frontend input. |
| OTP login | Placeholder frontend UI | BMS/backend auth | OTP send/verify must be server-backed. |
| Customer profile | Not implemented | BMS/backend customer service | Includes name, phone, email, and preferences. |
| Saved addresses | Not implemented | BMS/backend customer service | Checkout should eventually support customer address book. |
| Wishlist persistence | Frontend client store | BMS/backend customer service | Guest wishlist can remain local, authenticated wishlist should persist. |
| Order history | Not implemented | BMS/backend customer service | Customer account should read canonical order history from API. |
| Customer invoice history | Not implemented | BMS/backend invoices | Customer dashboard should show invoice number, order date, total, payment status, and PDF download access for owned orders. |
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

Order operations should eventually include payment transaction tracking, courier shipment creation, shipment status sync, and customer risk checks. Admins should make fulfillment decisions from backend-owned payment, courier, and risk records, never from frontend-calculated status.

### Invoices

BMS/backend should automatically generate an invoice when a customer places an order.

Invoice generation should:

- Create a unique invoice number.
- Create an immutable invoice snapshot from the order snapshot.
- Support future HTML and PDF invoice output.
- Preserve invoice content after creation even if product, customer, address, or order source data changes.

Admin invoice access should allow admins to:

- View an invoice from order details.
- Download the invoice PDF.
- Regenerate an invoice only when a future policy explicitly allows it.
- See customer order and invoice history.

Customer invoice access should allow authenticated customers to:

- View invoices under My Orders.
- Download invoice PDFs for their own orders.
- See invoice number, order date, total, and payment status.

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

### Payment Gateway

BMS/Admin should support payment gateway settings, payment transactions, payment status sync, COD and online payment, order payment status updates, and refund tracking when required.

Future table ideas:

- `payment_gateways`
- `payment_transactions`
- `payment_events`

Payment gateway records should separate configuration from transaction history. Transactions should store gateway reference IDs, order IDs, amount, currency, status, payment method, provider response summaries, and refund references where applicable.

### Pathao Courier

BMS/Admin should support Pathao merchant credentials, shipment creation from orders, courier city/zone/area mapping, delivery charge calculation if Pathao exposes it, shipment tracking, delivery status sync, and courier events/logs.

Future table ideas:

- `courier_accounts`
- `courier_shipments`
- `courier_events`
- `courier_area_mappings`

Pathao integration should be backend-only. Order details can expose shipment actions later, but API calls and credentials must stay server-side.

### Customer Fraud and Risk

BMS/Admin should support phone-number based fraud/risk checks. If Pathao merchant/customer history data is available, the risk service can combine it with internal order history.

Risk check output should include:

- Total previous orders.
- Delivered count.
- Cancelled count.
- Returned count.
- Success rate.
- Risk label: LOW, MEDIUM, or HIGH.
- Risk notes for order details.

Future table idea:

- `customer_risk_checks`

Risk labels should guide admin review, not automatically reject customers unless a future business rule explicitly requires it.

### Customers

BMS/backend should own OTP login, customer profile, saved addresses, wishlist persistence, and order history.

Guest-only frontend state can remain local until the customer authenticates.

### Store Settings

BMS/Admin should control logo, store name, contact info, social links, footer links, delivery fee, payment methods, policy pages, SEO/meta, PWA/app metadata, and optional theme settings.

Core frontend layout and design tokens should stay in the codebase unless the business explicitly needs theme customization.

## Future Order Details Workflow

```text
Order created
  |
  v
Invoice snapshot generated
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

## Security Notes

- API credentials must stay in environment variables or encrypted database fields.
- Never expose Pathao, courier, or payment gateway secret keys to browser code.
- All courier and payment API calls must run server-side only.
- Store API logs safely and avoid persisting unnecessary secrets or full sensitive payloads.
- Do not trust frontend payment status, courier status, delivery fee, fraud status, or risk labels.
- Gateway webhooks and courier sync jobs must verify provider authenticity before mutating order state.
- Customer invoice routes must verify invoice ownership before returning invoice details or downloads.
- Admin invoice routes must require authenticated admin access.
- Invoice PDF URLs should not expose private storage directly if invoice files contain sensitive customer/order data.
- Invoice snapshots must remain unchanged when product, customer, address, or order data changes later.

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
- Payment, courier, and fraud/risk status changes must be derived from backend services, admin actions, or verified provider callbacks.
- Generate invoices from backend-owned order snapshots, not client-calculated checkout data.
