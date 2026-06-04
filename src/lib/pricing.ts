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

export type DeliveryPricingRule = {
  id?: string;
  deliveryMethod: string;
  defaultFee: number;
  freeShippingMinimum?: number;
  city?: string;
  isActive?: boolean;
  sortOrder?: number;
};

export type DeliveryPricingOptions = {
  city?: string;
  defaultFee?: number;
  freeShippingMinimum?: number;
  selectedRuleId?: string;
  rules?: DeliveryPricingRule[];
};

export function getCartSubtotal(items: PricingItem[]) {
  return items.reduce((total, item) => total + getLineItemTotal(item), 0);
}

export function getLineItemTotal(item: PricingItem) {
  return getItemPrice(item) * item.quantity;
}

export function getDeliveryFee(
  subtotal: number,
  options: DeliveryPricingOptions = {},
) {
  if (subtotal <= 0) {
    return 0;
  }

  const rule = resolveDeliveryRule(options);
  const freeShippingMinimum =
    rule?.freeShippingMinimum ?? options.freeShippingMinimum;

  if (
    typeof freeShippingMinimum === "number" &&
    freeShippingMinimum > 0 &&
    subtotal >= freeShippingMinimum
  ) {
    return 0;
  }

  return Math.max(0, rule?.defaultFee ?? options.defaultFee ?? 80);
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

export function getOrderPricing(
  items: PricingItem[],
  deliveryOptions?: DeliveryPricingOptions,
) {
  const subtotal = getCartSubtotal(items);
  const discount = getDiscountAmount();
  const deliveryFee = getDeliveryFee(subtotal, deliveryOptions);
  const total = getOrderTotal({ subtotal, discount, deliveryFee });

  return {
    subtotal,
    discount,
    deliveryFee,
    total,
  };
}

function resolveDeliveryRule(options: DeliveryPricingOptions) {
  const activeRules = (options.rules ?? [])
    .filter((rule) => rule.isActive !== false)
    .sort(
      (left, right) =>
        (left.sortOrder ?? 0) - (right.sortOrder ?? 0) ||
        left.deliveryMethod.localeCompare(right.deliveryMethod),
    );

  if (!activeRules.length) {
    return null;
  }

  const normalizedCity = normalizeCity(options.city);
  const selectedRule = activeRules.find(
    (rule) => rule.id && rule.id === options.selectedRuleId,
  );

  if (selectedRule) {
    const citySpecificRule = normalizedCity
      ? activeRules.find(
          (rule) =>
            rule.deliveryMethod === selectedRule.deliveryMethod &&
            normalizeCity(rule.city) === normalizedCity,
        )
      : undefined;

    return citySpecificRule ?? selectedRule;
  }

  if (normalizedCity) {
    const cityRule = activeRules.find(
      (rule) => normalizeCity(rule.city) === normalizedCity,
    );

    if (cityRule) {
      return cityRule;
    }
  }

  return activeRules.find((rule) => !rule.city) ?? activeRules[0] ?? null;
}

function normalizeCity(city: string | undefined) {
  return city?.trim().toLowerCase() || "";
}

function getItemPrice(item: PricingItem) {
  if ("product" in item) {
    return item.product.price;
  }

  return item.price;
}
