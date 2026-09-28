"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";
import { getTransactionsAction } from "@/actions/transactions";
import {
  Utensils,
  Receipt,
  Car,
  Briefcase,
  Laptop,
  ArrowRightLeft,
  TrendingUp,
  Gift,
  PlusCircle,
  Gamepad2,
  HeartPulse,
  GraduationCap,
  ShoppingBag,
  Tag,
  Loader2,
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

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await getTransactionsAction();
      setTransactions(data.slice(0, 6));
    } catch (e) {
      console.error("Gagal mengambil transaksi terbaru:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleCreated = () => {
      loadData();
    };

    window.addEventListener("fintrack:transaction-created", handleCreated);
    return () => {
      window.removeEventListener("fintrack:transaction-created", handleCreated);
    };
  }, []);

  return (
    <Card className="col-span-1 lg:col-span-7">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold">
            Riwayat Transaksi Terbaru
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Aktivitas kas masuk dan keluar terkini dari database
          </CardDescription>
        </div>
        <Link
          href="/transactions"
          className="text-xs font-medium text-emerald-500 hover:text-emerald-600 transition-colors"
        >
          Lihat Semua →
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-10 gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
            <span>Memuat aktivitas terkini...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Belum ada rekaman transaksi di akun Anda.
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {transactions.map((tx) => {
              const Icon = resolveIcon(tx.iconName, tx.type);
              const isIncome = tx.type === "INCOME";
              const isTransfer = tx.type === "TRANSFER";

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors group"
                >
                  {/* Left: Icon & Details */}
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
                      <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span className="truncate">{tx.wallet}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Category badge & Amount */}
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant={isIncome ? "income" : isTransfer ? "transfer" : "expense"}
                      className="hidden sm:inline-flex text-xs font-medium"
                    >
                      {tx.category}
                    </Badge>

                    <div className="text-right">
                      <span
                        className={`text-xs font-semibold tabular-nums ${
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
      </CardContent>
    </Card>
  );
}
