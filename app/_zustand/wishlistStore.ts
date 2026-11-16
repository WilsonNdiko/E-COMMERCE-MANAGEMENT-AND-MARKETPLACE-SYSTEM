import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type State = {
  wishlist: ProductInWishlist[];
  wishQuantity: number;
};

export type Actions = {
  addToWishlist: (product: ProductInWishlist) => void;
  removeFromWishlist: (id: string) => void;
  setWishlist: (wishlist: ProductInWishlist[]) => void;
  clearWishlist: () => void;
  isInWishlist: (id: string) => boolean;
};

export const useWishlistStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      wishlist: [],
      wishQuantity: 0,
      addToWishlist: (product) => {
        set((state) => {
          const exists = state.wishlist.some((item) => item.id === product.id);
          if (exists) {
            return state;
          }
          const next = [...state.wishlist, product];
          return { wishlist: next, wishQuantity: next.length };
        });
      },
      removeFromWishlist: (id) => {
        set((state) => {
          const next = state.wishlist.filter((item) => item.id !== id);
          return { wishlist: next, wishQuantity: next.length };
        });
      },
      setWishlist: (wishlist: ProductInWishlist[]) => {
        set({ wishlist: [...wishlist], wishQuantity: wishlist.length });
      },
      clearWishlist: () => {
        set({ wishlist: [], wishQuantity: 0 });
      },
      isInWishlist: (id: string) => {
        return get().wishlist.some((item) => item.id === id);
      },
    }),
    {
      name: "singitronic-wishlist-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
