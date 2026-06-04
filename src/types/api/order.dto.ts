export type OrderItemDto = {
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: number;
};

export type OrderAddressDto = {
  address: string;
  apartment?: string;
  city: string;
  postalCode?: string;
};

export type CreateOrderRequestDto = {
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  address: OrderAddressDto;
  items: OrderItemDto[];
  subtotal: number;
  deliveryFee: number;
  couponCode?: string;
  couponDiscount: number;
  shippingDiscount: number;
  total: number;
  paymentMethod: string;
  deliveryMethod: string;
};

export type CreateOrderResponseDto = {
  orderId: string;
  orderNumber?: string;
  status: "pending" | "confirmed" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  deliveryStatus: "pending" | "processing" | "shipped" | "delivered";
  subtotal: number;
  deliveryFee: number;
  couponDiscount: number;
  shippingDiscount: number;
  total: number;
  createdAt: string;
};
