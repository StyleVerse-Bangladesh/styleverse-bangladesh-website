import { CartSummary } from "@/components/cart/cart-summary";
import { RouteShell } from "@/components/shared/route-shell";
import { getStorefrontSettings } from "@/lib/api/clients/settings-client";

export default async function CartPage() {
  const settings = await getStorefrontSettings();

  return (
    <RouteShell title="Cart" description="Cart route skeleton wired to Zustand state.">
      <CartSummary deliverySettings={settings.delivery} />
    </RouteShell>
  );
}
