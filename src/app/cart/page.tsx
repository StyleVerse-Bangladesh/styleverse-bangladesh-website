import { CartSummary } from "@/components/cart/cart-summary";
import { RouteShell } from "@/components/shared/route-shell";

export default function CartPage() {
  return (
    <RouteShell title="Cart" description="Cart route skeleton wired to Zustand state.">
      <CartSummary />
    </RouteShell>
  );
}
