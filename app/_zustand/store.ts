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
    label: "15% off your order",
  },
  WELCOME20: {
    discountPercent: 20,
    freeShipping: false,
    label: "20% welcome discount",
  },
  FREESHIP: {
    discountPercent: 0,
    freeShipping: true,
    label: "Free doorstep delivery",
  },
};

function computeTotals(products: ProductInCart[]) {
  let allQuantity = 0;
  let total = 0;
  for (const item of products) {
    const qty = Math.max(1, Math.floor(Number(item.amount) || 1));
    const price = Math.max(0, Number(item.price) || 0);
    allQuantity += qty;
    total += qty * price;
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
  syncWithCatalog: (catalog: Product[]) => string | null;
  calculateTotals: () => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => { ok: boolean; message: string };
  removePromoCode: () => void;
};

export const useProductStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      products: [],
      allQuantity: 0,
      total: 0,
      promoCode: null,
      discountPercent: 0,
      freeShipping: false,

      addToCart: (newProduct) => {
        set((state) => {
          const id = String(newProduct.id);
          const exists = state.products.find((item) => item.id === id);
          const addQty = Math.max(1, Math.floor(Number(newProduct.amount) || 1));
          const maxStock =
            typeof newProduct.inStock === "number" && newProduct.inStock > 0
              ? newProduct.inStock
              : 999;

          const nextProducts = exists
            ? state.products.map((item) => {
                if (item.id !== id) return item;
                const cap =
                  typeof (newProduct.inStock ?? item.inStock) === "number" &&
                  Number(newProduct.inStock ?? item.inStock) > 0
                    ? Number(newProduct.inStock ?? item.inStock)
                    : 999;
                return {
                  ...item,
                  title: newProduct.title || item.title,
                  price: Number(newProduct.price ?? item.price),
                  image: newProduct.image || item.image,
                  amount: Math.min(cap, item.amount + addQty),
                  slug: newProduct.slug || item.slug,
                  inStock: newProduct.inStock ?? item.inStock,
                };
              })
            : [
                ...state.products,
                {
                  ...newProduct,
                  id,
                  price: Math.max(0, Number(newProduct.price) || 0),
                  amount: Math.min(maxStock, addQty),
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
          const empty = nextProducts.length === 0;
          return {
            products: nextProducts,
            ...(empty
              ? { promoCode: null, discountPercent: 0, freeShipping: false }
              : {}),
            ...computeTotals(nextProducts),
          };
        });
      },

      updateCartAmount: (id, quantity) => {
        set((state) => {
          const safeQty = Math.max(1, Math.round(Number(quantity) || 1));
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

      syncWithCatalog: (catalog) => {
        if (!Array.isArray(catalog) || catalog.length === 0) return null;
        const current = get().products;
        if (current.length === 0) return null;

        const byId = new Map(catalog.map((p) => [String(p.id), p]));
        const nextProducts: ProductInCart[] = [];
        const notes: string[] = [];

        for (const item of current) {
          const live = byId.get(String(item.id));
          if (!live) {
            notes.push(`Removed unavailable item "${item.title}"`);
            continue;
          }
          const stock = Math.max(0, Number(live.inStock) || 0);
          if (stock <= 0) {
            notes.push(`"${live.title}" just went out of stock and was removed`);
            continue;
          }
          const nextQty = Math.min(stock, Math.max(1, item.amount));
          if (nextQty < item.amount) {
            notes.push(`Adjusted "${live.title}" quantity to ${nextQty} (available stock)`);
          }
          nextProducts.push({
            id: String(live.id),
            title: live.title,
            price: Number(live.price),
            image: live.mainImage,
            slug: live.slug,
            inStock: stock,
            amount: nextQty,
          });
        }

        set({
          products: nextProducts,
          ...(nextProducts.length === 0
            ? { promoCode: null, discountPercent: 0, freeShipping: false }
            : {}),
          ...computeTotals(nextProducts),
        });

        return notes.length > 0 ? notes[0] : null;
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
            message: "Unknown code. Try SAVE10, WELCOME20, or FREESHIP.",
          };
        }
        set({
          promoCode: code,
          discountPercent: promo.discountPercent,
          freeShipping: promo.freeShipping,
        });
        return { ok: true, message: `${code} applied — ${promo.label}!` };
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
