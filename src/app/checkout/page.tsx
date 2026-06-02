import { CheckoutForm } from "@/components/forms/checkout-form";
import { RouteShell } from "@/components/shared/route-shell";

export default function CheckoutPage() {
  return (
    <RouteShell
      title="Checkout"
      description="Review your cart, delivery details, and payment method."
    >
      <CheckoutForm />
    </RouteShell>
  );
}
