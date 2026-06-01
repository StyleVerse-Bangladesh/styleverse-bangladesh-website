import { useCartStore } from "@/store/cart-store";

export function useCartSummary() {
  const items = useCartStore((state) => state.items);

  return {
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    ),
  };
}
