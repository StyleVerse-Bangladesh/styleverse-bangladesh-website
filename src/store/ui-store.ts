import { create } from "zustand";

type UiState = {
  isMobileCategoryDrawerOpen: boolean;
  isMobileCartDrawerOpen: boolean;
  isMobileWishlistDrawerOpen: boolean;
  isMobileAuthModalOpen: boolean;
  activeMegaMenu: string | null;
  setMobileCategoryDrawerOpen: (open: boolean) => void;
  setMobileCartDrawerOpen: (open: boolean) => void;
  setMobileWishlistDrawerOpen: (open: boolean) => void;
  setMobileAuthModalOpen: (open: boolean) => void;
  setActiveMegaMenu: (menuKey: string | null) => void;
};

export const useUiStore = create<UiState>((set) => ({
  isMobileCategoryDrawerOpen: false,
  isMobileCartDrawerOpen: false,
  isMobileWishlistDrawerOpen: false,
  isMobileAuthModalOpen: false,
  activeMegaMenu: null,
  setMobileCategoryDrawerOpen: (isMobileCategoryDrawerOpen) =>
    set({ isMobileCategoryDrawerOpen }),
  setMobileCartDrawerOpen: (isMobileCartDrawerOpen) =>
    set({ isMobileCartDrawerOpen }),
  setMobileWishlistDrawerOpen: (isMobileWishlistDrawerOpen) =>
    set({ isMobileWishlistDrawerOpen }),
  setMobileAuthModalOpen: (isMobileAuthModalOpen) =>
    set({ isMobileAuthModalOpen }),
  setActiveMegaMenu: (activeMegaMenu) => set({ activeMegaMenu }),
}));
