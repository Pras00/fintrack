"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils";
import { CreditCard, ArrowRightLeft, AlertTriangle, Loader2 } from "lucide-react";
import { useModalStore } from "@/stores/use-modal-store";
import { getTransactionFormDataAction } from "@/actions/transactions";

interface WalletItem {
  id: string;
  name: string;
  type: string;
  balance: number;
  accountNumber: string;
}

const BUDGET_ITEMS = [
  { name: "Makanan & Minuman", spent: 3450000, limit: 4000000, percent: 86 },
  { name: "Tagihan & Utilitas", spent: 2100000, limit: 2500000, percent: 84 },
  { name: "Belanja & Lifestyle", spent: 1350000, limit: 2000000, percent: 67 },
];

export function WalletSnapshot() {
  const { openTransactionModal } = useModalStore();
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadWallets = async () => {
    try {
      const data = await getTransactionFormDataAction();
      setWallets(
        data.wallets.map((w) => {
          let typeDesc = "Rekening Tabungan";
          let accNo = "•••• " + w.id.slice(-4).toUpperCase();
          if (w.name.includes("BCA")) {
            typeDesc = "Rekening Utama";
            accNo = "•••• 8921";
          } else if (w.name.includes("Mandiri")) {
            typeDesc = "Gaji & Operasional";
            accNo = "•••• 3144";
          } else if (w.name.includes("GoPay") || w.type === "EWALLET") {
            typeDesc = "E-Wallet Harian";
            accNo = "•••• 0812";
          } else if (w.name.includes("Tunai") || w.type === "CASH") {
            typeDesc = "Dompet Tunai";
            accNo = "Cash Pocket";
          }
          return {
            id: w.id,
            name: w.name,
            type: typeDesc,
            balance: w.balance,
            accountNumber: accNo,
          };
        })
      );
    } catch (e) {
      console.error("Gagal mengambil data dompet:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWallets();

    const handleCreated = () => {
      loadWallets();
    };

    window.addEventListener("fintrack:transaction-created", handleCreated);
    return () => {
      window.removeEventListener("fintrack:transaction-created", handleCreated);
    };
  }, []);

  return (
    <Card className="col-span-1 lg:col-span-5 flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-emerald-500" />
            Dompet & Rekening Aktif
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Alokasi dana per instrumen dari database
          </CardDescription>
        </div>
        <button
          onClick={() => openTransactionModal("TRANSFER")}
          className="flex items-center gap-1 text-xs font-medium text-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer"
        >
          <ArrowRightLeft className="h-3 w-3" />
          Transfer
        </button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Wallet Cards Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-6 gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
            <span>Memuat saldo dompet...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {wallets.map((w) => (
              <div
                key={w.id}
                className="rounded-lg border border-border/70 bg-muted/20 p-3 hover:border-emerald-500/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground truncate">{w.name}</span>
                  <span className="text-[10px] tabular-nums font-mono">{w.accountNumber}</span>
                </div>
                <div className="mt-2">
                  <span className="text-xs font-bold text-foreground tabular-nums block group-hover:text-primary transition-colors">
                    {formatRupiah(w.balance)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{w.type}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Budget Progress Status */}
        <div className="border-t border-border/40 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground/90">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Monitoring Anggaran Kritis (&gt;80%)
            </span>
            <span className="text-[11px] text-muted-foreground">Bulan Ini</span>
          </div>

          <div className="space-y-2.5">
            {BUDGET_ITEMS.map((b) => (
              <div key={b.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground truncate">{b.name}</span>
                  <div className="flex items-center gap-1.5 tabular-nums">
                    <span className="font-semibold">{formatRupiah(b.spent)}</span>
                    <span className="text-muted-foreground text-[11px]">/ {formatRupiah(b.limit)}</span>
                    <span className={`text-[11px] font-bold ${b.percent >= 80 ? "text-amber-500" : "text-emerald-500"}`}>
                      ({b.percent}%)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      b.percent >= 85
                        ? "bg-rose-500"
                        : b.percent >= 80
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${b.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
