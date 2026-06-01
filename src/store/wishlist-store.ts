import { create } from "zustand";

type WishlistState = {
  productIds: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  productIds: [],
  toggleWishlist: (productId) =>
    set((state) => ({
      productIds: state.productIds.includes(productId)
        ? state.productIds.filter((id) => id !== productId)
        : [...state.productIds, productId],
    })),
  isWishlisted: (productId) => get().productIds.includes(productId),
  clearWishlist: () => set({ productIds: [] }),
}));
