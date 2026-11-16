import { create } from "zustand";

export type State = {
  page: number;
  totalPages: number;
  totalCount: number;
};

export type Actions = {
  incrementPage: () => void;
  decrementPage: () => void;
  setPage: (page: number) => void;
  setMeta: (totalCount: number, totalPages: number) => void;
};

export const usePaginationStore = create<State & Actions>((set) => ({
  page: 1,
  totalPages: 1,
  totalCount: 0,
  incrementPage: () => {
    set((state) => ({
      page: state.page < state.totalPages ? state.page + 1 : state.page,
    }));
  },
  decrementPage: () => {
    set((state) => ({
      page: state.page > 1 ? state.page - 1 : 1,
    }));
  },
  setPage: (page: number) => {
    set({ page: Math.max(1, page) });
  },
  setMeta: (totalCount: number, totalPages: number) => {
    set({ totalCount, totalPages: Math.max(1, totalPages) });
  },
}));
