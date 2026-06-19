import { create } from "zustand";
import type { Product } from "@/types/product";

type WishlistState = {
  productIds: string[];
  productsById: Record<string, Product>;
  toggleWishlist: (productId: string, product?: Product) => void;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  productIds: [],
  productsById: {},
  toggleWishlist: (productId, product) =>
    set((state) => {
      if (state.productIds.includes(productId)) {
        const productsById = { ...state.productsById };
        delete productsById[productId];

        return {
          productIds: state.productIds.filter((id) => id !== productId),
          productsById,
        };
      }

      return {
        productIds: [...state.productIds, productId],
        productsById: product
          ? { ...state.productsById, [productId]: product }
          : state.productsById,
      };
    }),
  isWishlisted: (productId) => get().productIds.includes(productId),
  clearWishlist: () => set({ productIds: [], productsById: {} }),
}));
