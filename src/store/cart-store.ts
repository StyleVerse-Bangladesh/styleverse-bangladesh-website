import { create } from "zustand";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";

type CartState = {
  items: CartItem[];
  addItem: (product: Product, variantId?: string, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  updateItemVariant: (
    productId: string,
    currentVariantId: string | undefined,
    nextVariantId: string,
  ) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (product, variantId, quantity = 1) =>
    set((state) => {
      const existing = state.items.find(
        (item) => item.product.id === product.id && item.variantId === variantId,
      );

      if (existing) {
        return {
          items: state.items.map((item) =>
            item.product.id === product.id && item.variantId === variantId
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          ),
        };
      }

      return { items: [...state.items, { product, variantId, quantity }] };
    }),
  removeItem: (productId, variantId) =>
    set((state) => ({
      items: state.items.filter(
        (item) => !(item.product.id === productId && item.variantId === variantId),
      ),
    })),
  updateQuantity: (productId, quantity, variantId) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId && item.variantId === variantId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item,
      ),
    })),
  updateItemVariant: (productId, currentVariantId, nextVariantId) =>
    set((state) => {
      if (currentVariantId === nextVariantId) {
        return state;
      }

      const currentItem = state.items.find(
        (item) =>
          item.product.id === productId && item.variantId === currentVariantId,
      );

      if (!currentItem) {
        return state;
      }

      const targetItem = state.items.find(
        (item) =>
          item.product.id === productId && item.variantId === nextVariantId,
      );

      if (targetItem) {
        return {
          items: state.items.flatMap((item) => {
            if (
              item.product.id === productId &&
              item.variantId === currentVariantId
            ) {
              return [];
            }

            if (
              item.product.id === productId &&
              item.variantId === nextVariantId
            ) {
              return [
                { ...item, quantity: item.quantity + currentItem.quantity },
              ];
            }

            return [item];
          }),
        };
      }

      return {
        items: state.items.map((item) =>
          item.product.id === productId && item.variantId === currentVariantId
            ? { ...item, variantId: nextVariantId }
            : item,
        ),
      };
    }),
  clearCart: () => set({ items: [] }),
}));
