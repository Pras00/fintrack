"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";
import { useModalStore } from "@/stores/use-modal-store";
import { getTransactionsAction } from "@/actions/transactions";
import {
  Search,
  Plus,
  Download,
  Briefcase,
  Utensils,
  Receipt,
  Car,
  Laptop,
  ArrowRightLeft,
  ShoppingBag,
  TrendingUp,
  Gift,
  PlusCircle,
  Gamepad2,
  HeartPulse,
  GraduationCap,
  Tag,
  Loader2,
  RefreshCw,
} from "lucide-react";
import type { TransactionItem, TransactionType } from "@/types";

function resolveIcon(iconName?: string, type?: TransactionType) {
  switch (iconName) {
    case "briefcase":
      return Briefcase;
    case "utensils":
      return Utensils;
    case "receipt":
      return Receipt;
    case "car":
      return Car;
    case "laptop":
      return Laptop;
    case "shopping-bag":
      return ShoppingBag;
    case "trending-up":
      return TrendingUp;
    case "gift":
      return Gift;
    case "plus-circle":
      return PlusCircle;
    case "gamepad-2":
      return Gamepad2;
    case "heart-pulse":
      return HeartPulse;
    case "graduation-cap":
      return GraduationCap;
    case "arrow-right-left":
      return ArrowRightLeft;
    default:
      return type === "INCOME" ? TrendingUp : type === "TRANSFER" ? ArrowRightLeft : Tag;
  }
}

export default function TransactionsPage() {
  const { openTransactionModal } = useModalStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<"ALL" | TransactionType>("ALL");
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getTransactionsAction();
      setTransactions(data);
    } catch (err) {
      console.error("Gagal memuat transaksi:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();

    const handleCreated = () => {
      fetchTransactions();
    };

    window.addEventListener("fintrack:transaction-created", handleCreated);
    return () => {
      window.removeEventListener("fintrack:transaction-created", handleCreated);
    };
  }, [fetchTransactions]);

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.wallet.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "ALL" || tx.type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalIncome = filtered
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filtered
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <DashboardShell>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Buku Transaksi Keuangan
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-2 py-0.5 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
              Live Database
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Riwayat lengkap mutasi kas masuk, kas keluar, dan transfer antar dompet langsung tersinkronisasi
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTransactions}
            disabled={isLoading}
            className="h-10 rounded-xl px-3 text-xs font-medium gap-1.5 shadow-xs"
            title="Muat Ulang Transaksi"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => alert("Fitur Export CSV segera siap!")}
            className="h-10 rounded-xl px-4 text-xs font-semibold gap-2 shadow-xs"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            onClick={() => openTransactionModal("EXPENSE")}
            className="h-10 rounded-xl px-4.5 text-xs font-semibold gap-2 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Tambah Transaksi
          </Button>
        </div>
      </div>

      {/* Mini Stat Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <span className="text-xs text-muted-foreground block font-medium">
            Total Transaksi Tercatat
          </span>
          <span className="text-xl font-bold tabular-nums text-foreground mt-1 block">
            {isLoading ? "..." : `${filtered.length} Aktivitas`}
          </span>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-muted-foreground block font-medium">
            Akumulasi Kas Masuk
          </span>
          <span className="text-xl font-bold tabular-nums text-emerald-500 mt-1 block">
            {isLoading ? "..." : `+${formatRupiah(totalIncome)}`}
          </span>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-muted-foreground block font-medium">
            Akumulasi Kas Keluar
          </span>
          <span className="text-xl font-bold tabular-nums text-rose-500 mt-1 block">
            {isLoading ? "..." : `-${formatRupiah(totalExpense)}`}
          </span>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari transaksi, kategori, atau dompet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>

            {/* Segmented Type Filter */}
            <div className="flex items-center rounded-lg border border-border/70 bg-muted/40 p-1 text-xs w-full sm:w-auto">
              <button
                onClick={() => setSelectedType("ALL")}
                className={`flex-1 sm:flex-none rounded-md px-3 py-1 font-medium transition-all ${
                  selectedType === "ALL"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setSelectedType("INCOME")}
                className={`flex-1 sm:flex-none rounded-md px-3 py-1 font-medium transition-all ${
                  selectedType === "INCOME"
                    ? "bg-background text-emerald-500 shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Pemasukan
              </button>
              <button
                onClick={() => setSelectedType("EXPENSE")}
                className={`flex-1 sm:flex-none rounded-md px-3 py-1 font-medium transition-all ${
                  selectedType === "EXPENSE"
                    ? "bg-background text-rose-500 shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Pengeluaran
              </button>
              <button
                onClick={() => setSelectedType("TRANSFER")}
                className={`flex-1 sm:flex-none rounded-md px-3 py-1 font-medium transition-all ${
                  selectedType === "TRANSFER"
                    ? "bg-background text-sky-400 shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Transfer
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ledger Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
            <span className="text-xs">Memuat buku transaksi dari database NeonDB...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Tidak ada transaksi yang cocok dengan kriteria pencarian.
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {filtered.map((tx) => {
              const Icon = resolveIcon(tx.iconName, tx.type);
              const isIncome = tx.type === "INCOME";
              const isTransfer = tx.type === "TRANSFER";

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                        isIncome
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                          : isTransfer
                          ? "border-sky-500/20 bg-sky-500/10 text-sky-500"
                          : "border-rose-500/20 bg-rose-500/10 text-rose-500"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span className="truncate">{tx.wallet}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant={isIncome ? "income" : isTransfer ? "transfer" : "expense"}
                      className="hidden sm:inline-flex text-xs font-medium"
                    >
                      {tx.category}
                    </Badge>

                    <div className="text-right">
                      <span
                        className={`text-xs sm:text-sm font-bold tabular-nums ${
                          isIncome
                            ? "text-emerald-600 dark:text-emerald-400"
                            : isTransfer
                            ? "text-sky-600 dark:text-sky-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isIncome ? "+" : isTransfer ? "" : "-"}
                        {formatRupiah(tx.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </DashboardShell>
  );
}
