# API Adapter Layer

Future API clients and adapter functions for BMS/Admin integration should live in this folder.

Rules:

- Fetch raw BMS DTOs here.
- Map raw BMS DTOs into normalized storefront models here.
- Keep UI components unaware of backend response shapes.
- Keep static JSON/data providers as development fallback only.
- Do not trust frontend totals for order creation.
- Backend/BMS must validate price, inventory, coupon validity, order totals, delivery fee, and payment status.

Expected future adapters:

- Catalog adapter.
- Category adapter.
- Homepage/CMS adapter.
- Store settings adapter.
- Pricing and coupon validation adapter.
- Order adapter.
- Customer/auth adapter.
