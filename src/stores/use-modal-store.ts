import { create } from "zustand";

export type ModalTransactionType = "EXPENSE" | "INCOME" | "TRANSFER";

interface ModalState {
  isTransactionModalOpen: boolean;
  defaultType: ModalTransactionType;
  openTransactionModal: (type?: ModalTransactionType) => void;
  closeTransactionModal: () => void;

  isWalletModalOpen: boolean;
  openWalletModal: () => void;
  closeWalletModal: () => void;
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
}));
