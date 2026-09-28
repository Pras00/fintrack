import type { LucideIcon } from "lucide-react";

export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";
export type WalletType = "BANK" | "EWALLET" | "CASH" | "INVESTMENT" | "OTHER";
export type CategoryType = "INCOME" | "EXPENSE";

export interface TransactionItem {
  id: string;
  description: string;
  category: string;
  wallet: string;
  type: TransactionType;
  amount: number;
  date: string;
  iconName?: string;
  icon?: LucideIcon;
}

export interface WalletItem {
  id: string;
  name: string;
  type: string;
  balance: number;
  accountNumber?: string;
  color?: string;
  icon?: string;
}

export interface BudgetItem {
  name: string;
  spent: number;
  limit: number;
  percent: number;
}

export interface ActionResponse<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}
