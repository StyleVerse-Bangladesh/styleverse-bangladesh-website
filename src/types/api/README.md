# API DTO Types

Future BMS/Admin API response and request DTO types should live in this folder.

Rules:

- Keep raw BMS DTO types separate from storefront UI models.
- Components should not consume raw BMS responses directly.
- API adapters should map DTOs into normalized frontend models before data reaches components.
- Static JSON/data files are development fallback only.
- Backend/BMS must remain the source of truth for price, inventory, coupon validity, order totals, delivery fee, and payment status.

Expected future DTO groups:

- Product DTOs.
- Category DTOs.
- Homepage/CMS DTOs.
- Store settings DTOs.
- Pricing and coupon validation DTOs.
- Order DTOs.
- Customer/auth DTOs.
