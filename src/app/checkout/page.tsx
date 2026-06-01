import { CheckoutForm } from "@/components/forms/checkout-form";
import { RouteShell } from "@/components/shared/route-shell";

export default function CheckoutPage() {
  return (
    <RouteShell title="Checkout" description="Checkout form skeleton with Zod validation.">
      <CheckoutForm />
    </RouteShell>
  );
}
