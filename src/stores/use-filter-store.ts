import { create } from "zustand";

export type DatePreset = "7d" | "30d" | "this_month" | "last_month" | "this_year" | "all";

interface FilterState {
  datePreset: DatePreset;
  selectedWalletId: string; // 'all' or specific wallet id
  selectedCategoryId: string; // 'all' or specific category id
  setDatePreset: (preset: DatePreset) => void;
  setSelectedWalletId: (walletId: string) => void;
  setSelectedCategoryId: (categoryId: string) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  datePreset: "this_month",
  selectedWalletId: "all",
  selectedCategoryId: "all",
  setDatePreset: (preset) => set({ datePreset: preset }),
  setSelectedWalletId: (walletId) => set({ selectedWalletId: walletId }),
  setSelectedCategoryId: (categoryId) => set({ selectedCategoryId: categoryId }),
  resetFilters: () =>
    set({
      datePreset: "this_month",
      selectedWalletId: "all",
      selectedCategoryId: "all",
    }),
}));
