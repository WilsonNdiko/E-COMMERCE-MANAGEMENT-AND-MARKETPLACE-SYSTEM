import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ProductInCart = {
  id: string;
  title: string;
  price: number;
  image: string;
  amount: number;
  slug?: string;
  inStock?: number;
};

export const PROMO_CODES: Record<
  string,
  { discountPercent: number; freeShipping: boolean; label: string }
> = {
  SAVE10: {
    discountPercent: 10,
    freeShipping: false,
    label: "10% off your order",
  },
  TECH15: {
    discountPercent: 15,
    freeShipping: false,
    label: "15% off electronics",
  },
  WELCOME20: {
    discountPercent: 20,
    freeShipping: false,
    label: "20% welcome discount",
  },
  FREESHIP: {
    discountPercent: 0,
    freeShipping: true,
    label: "Free express shipping",
  },
};

function computeTotals(products: ProductInCart[]) {
  let allQuantity = 0;
  let total = 0;
  for (const item of products) {
    allQuantity += item.amount;
    total += item.amount * item.price;
  }
  return { allQuantity, total: Math.round(total * 100) / 100 };
}

export type State = {
  products: ProductInCart[];
  allQuantity: number;
  total: number;
  promoCode: string | null;
  discountPercent: number;
  freeShipping: boolean;
};

export type Actions = {
  addToCart: (newProduct: ProductInCart) => void;
  removeFromCart: (id: string) => void;
  updateCartAmount: (id: string, quantity: number) => void;
  calculateTotals: () => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => { ok: boolean; message: string };
  removePromoCode: () => void;
};

export const useProductStore = create<State & Actions>()(
  persist(
    (set) => ({
      products: [],
      allQuantity: 0,
      total: 0,
      promoCode: null,
      discountPercent: 0,
      freeShipping: false,

      addToCart: (newProduct) => {
        set((state) => {
          const exists = state.products.find((item) => item.id === newProduct.id);
          const maxStock =
            typeof newProduct.inStock === "number" && newProduct.inStock > 0
              ? newProduct.inStock
              : 999;
          const nextProducts = exists
            ? state.products.map((item) => {
                if (item.id !== newProduct.id) return item;
                const cap =
                  typeof (newProduct.inStock ?? item.inStock) === "number" &&
                  Number(newProduct.inStock ?? item.inStock) > 0
                    ? Number(newProduct.inStock ?? item.inStock)
                    : 999;
                return {
                  ...item,
                  amount: Math.min(cap, item.amount + Math.max(1, newProduct.amount)),
                  slug: newProduct.slug || item.slug,
                  inStock: newProduct.inStock ?? item.inStock,
                };
              })
            : [
                ...state.products,
                {
                  ...newProduct,
                  amount: Math.min(maxStock, Math.max(1, newProduct.amount)),
                },
              ];
          return {
            products: nextProducts,
            ...computeTotals(nextProducts),
          };
        });
      },

      removeFromCart: (id) => {
        set((state) => {
          const nextProducts = state.products.filter((item) => item.id !== id);
          return {
            products: nextProducts,
            ...computeTotals(nextProducts),
          };
        });
      },

      updateCartAmount: (id, quantity) => {
        set((state) => {
          const safeQty = Math.max(1, Math.round(quantity));
          const nextProducts = state.products.map((item) => {
            if (item.id !== id) return item;
            const cap =
              typeof item.inStock === "number" && item.inStock > 0
                ? item.inStock
                : 999;
            return { ...item, amount: Math.min(cap, safeQty) };
          });
          return {
            products: nextProducts,
            ...computeTotals(nextProducts),
          };
        });
      },

      calculateTotals: () => {
        set((state) => ({
          ...computeTotals(state.products),
        }));
      },

      clearCart: () => {
        set({
          products: [],
          allQuantity: 0,
          total: 0,
          promoCode: null,
          discountPercent: 0,
          freeShipping: false,
        });
      },

      applyPromoCode: (rawCode) => {
        const code = rawCode.trim().toUpperCase();
        if (!code) {
          return { ok: false, message: "Please enter a promo code" };
        }
        const promo = PROMO_CODES[code];
        if (!promo) {
          return {
            ok: false,
            message: "Invalid code. Try SAVE10, TECH15, WELCOME20, or FREESHIP.",
          };
        }
        set({
          promoCode: code,
          discountPercent: promo.discountPercent,
          freeShipping: promo.freeShipping,
        });
        return { ok: true, message: `Promo "${code}" applied — ${promo.label}!` };
      },

      removePromoCode: () => {
        set({
          promoCode: null,
          discountPercent: 0,
          freeShipping: false,
        });
      },
    }),
    {
      name: "singitronic-cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
