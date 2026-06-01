import type { Product } from "./product";

export type CartItem = {
  product: Product;
  variantId?: string;
  quantity: number;
};
