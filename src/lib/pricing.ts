export type PricingItem =
  | {
      product: {
        price: number;
      };
      quantity: number;
    }
  | {
      price: number;
      quantity: number;
    };

export function getCartSubtotal(items: PricingItem[]) {
  return items.reduce((total, item) => total + getLineItemTotal(item), 0);
}

export function getLineItemTotal(item: PricingItem) {
  return getItemPrice(item) * item.quantity;
}

export function getDeliveryFee(subtotal: number) {
  return subtotal > 0 ? 80 : 0;
}

export function getDiscountAmount() {
  return 0;
}

export function getOrderTotal({
  subtotal,
  discount,
  deliveryFee,
}: {
  subtotal: number;
  discount: number;
  deliveryFee: number;
}) {
  return subtotal - discount + deliveryFee;
}

export function getOrderPricing(items: PricingItem[]) {
  const subtotal = getCartSubtotal(items);
  const discount = getDiscountAmount();
  const deliveryFee = getDeliveryFee(subtotal);
  const total = getOrderTotal({ subtotal, discount, deliveryFee });

  return {
    subtotal,
    discount,
    deliveryFee,
    total,
  };
}

function getItemPrice(item: PricingItem) {
  if ("product" in item) {
    return item.product.price;
  }

  return item.price;
}
