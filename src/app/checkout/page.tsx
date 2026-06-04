import { CheckoutForm } from "@/components/forms/checkout-form";
import { RouteShell } from "@/components/shared/route-shell";
import { getStorefrontSettings } from "@/lib/api/clients/settings-client";

export default async function CheckoutPage() {
  const settings = await getStorefrontSettings();

  return (
    <RouteShell
      title="Checkout"
      description="Review your cart, delivery details, and payment method."
    >
      <CheckoutForm settings={settings} />
    </RouteShell>
  );
}
