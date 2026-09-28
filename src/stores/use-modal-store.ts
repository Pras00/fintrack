import { create } from "zustand";
import type { BudgetItem } from "@/types";

export type ModalTransactionType = "EXPENSE" | "INCOME" | "TRANSFER";
export type BudgetModalMode = "CREATE" | "EDIT";

interface ModalState {
  isTransactionModalOpen: boolean;
  defaultType: ModalTransactionType;
  openTransactionModal: (type?: ModalTransactionType) => void;
  closeTransactionModal: () => void;

  isWalletModalOpen: boolean;
  openWalletModal: () => void;
  closeWalletModal: () => void;

  isBudgetModalOpen: boolean;
  budgetModalMode: BudgetModalMode;
  editingBudget: BudgetItem | null;
  openBudgetModal: (mode?: BudgetModalMode, budget?: BudgetItem | null) => void;
  closeBudgetModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isTransactionModalOpen: false,
  defaultType: "EXPENSE",
  openTransactionModal: (type = "EXPENSE") =>
    set({ isTransactionModalOpen: true, defaultType: type }),
  closeTransactionModal: () => set({ isTransactionModalOpen: false }),

  isWalletModalOpen: false,
  openWalletModal: () => set({ isWalletModalOpen: true }),
  closeWalletModal: () => set({ isWalletModalOpen: false }),

  isBudgetModalOpen: false,
  budgetModalMode: "CREATE",
  editingBudget: null,
  openBudgetModal: (mode = "CREATE", budget = null) =>
    set({ isBudgetModalOpen: true, budgetModalMode: mode, editingBudget: budget }),
  closeBudgetModal: () =>
    set({ isBudgetModalOpen: false, editingBudget: null }),
}));
