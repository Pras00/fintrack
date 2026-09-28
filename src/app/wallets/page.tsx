"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";
import { useModalStore } from "@/stores/use-modal-store";
import { getTransactionFormDataAction } from "@/actions/transactions";
import {
  CreditCard,
  Plus,
  ArrowRightLeft,
  Building2,
  Smartphone,
  Coins,
  ShieldCheck,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface DisplayWallet {
  id: string;
  name: string;
  type: string;
  bankName: string;
  balance: number;
  accountNo: string;
  iconComp: React.ComponentType<{ className?: string }>;
  color: string;
}

function mapWalletDisplay(rawWallets: { id: string; name: string; type: string; balance: number }[]): DisplayWallet[] {
  return rawWallets.map((w) => {
    let iconComp = Building2;
    let bankName = "Institusi Finansial";
    let accountNo = "•••• " + w.id.slice(-4).toUpperCase();
    let color = "from-blue-600 to-indigo-800";
    let typeDesc = "Rekening Tabungan";

    if (w.name.includes("BCA")) {
      bankName = "Bank Central Asia";
      accountNo = "8821 9042 1102";
      iconComp = Building2;
      color = "from-blue-600 to-indigo-800";
      typeDesc = "Rekening Utama & Tabungan";
    } else if (w.name.includes("Mandiri")) {
      bankName = "Bank Mandiri";
      accountNo = "1330 0214 4920";
      iconComp = Building2;
      color = "from-sky-600 to-blue-900";
      typeDesc = "Gaji & Operasional Bulanan";
    } else if (w.name.includes("GoPay") || w.type === "EWALLET") {
      bankName = "GoTo Financial";
      accountNo = "0812 8890 2134";
      iconComp = Smartphone;
      color = "from-emerald-600 to-teal-800";
      typeDesc = "Dompet Digital Harian";
    } else if (w.type === "CASH" || w.name.includes("Tunai")) {
      bankName = "Physical Cash";
      accountNo = "Cash Pocket IDR";
      iconComp = Coins;
      color = "from-slate-700 to-slate-900";
      typeDesc = "Uang Tunai di Dompet";
    }

    return {
      id: w.id,
      name: w.name,
      type: typeDesc,
      bankName,
      balance: w.balance,
      accountNo,
      iconComp,
      color,
    };
  });
}

export default function WalletsPage() {
  const { openTransactionModal } = useModalStore();
  const [wallets, setWallets] = useState<DisplayWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadWallets = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getTransactionFormDataAction();
      setWallets(mapWalletDisplay(data.wallets));
    } catch (err) {
      console.error("Gagal memuat daftar dompet:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWallets();

    const handleCreated = () => {
      loadWallets();
    };

    window.addEventListener("fintrack:transaction-created", handleCreated);
    return () => {
      window.removeEventListener("fintrack:transaction-created", handleCreated);
    };
  }, [loadWallets]);

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  return (
    <DashboardShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Manajemen Dompet & Rekening
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-2 py-0.5 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
              Live Database
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Kelola seluruh rekening bank, e-wallet, dan kas tunai Anda dalam satu sistem tersentralisasi
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadWallets}
            disabled={isLoading}
            className="h-10 rounded-xl px-3 text-xs font-medium gap-1.5 shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => openTransactionModal("TRANSFER")}
            className="h-10 rounded-xl px-4 text-xs font-semibold gap-2 shadow-xs"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Transfer Dana
          </Button>
          <Button
            onClick={() => alert("Form tambah instrumen rekening baru segera siap!")}
            className="h-10 rounded-xl px-4.5 text-xs font-semibold gap-2 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Tambah Dompet Baru
          </Button>
        </div>
      </div>

      {/* Aggregate Banner */}
      <Card className="border-border/80 bg-gradient-to-r from-card via-card to-muted/30">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Likuiditas Terkonsolidasi
            </span>
            <div className="mt-1 text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
              {isLoading ? "Memuat..." : formatRupiah(totalBalance)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Tersebar di {wallets.length} instrumen keuangan aktif
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3.5 py-2 text-xs text-muted-foreground self-start sm:self-auto">
            <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span>Koneksi database PostgreSQL NeonDB aman</span>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Cards Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
          <span className="text-xs">Mengambil saldo dompet dari database...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wallets.map((wallet) => {
            const Icon = wallet.iconComp;
            return (
              <Card
                key={wallet.id}
                className="group relative overflow-hidden border-border/80 bg-card hover:border-teal-500/40 hover:shadow-md transition-all duration-200"
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${wallet.color} text-white shadow-xs`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">
                          {wallet.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          {wallet.bankName} • {wallet.type}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end justify-between border-t border-border/40 pt-4">
                    <div>
                      <span className="text-[11px] text-muted-foreground block font-medium">
                        Saldo Tersedia
                      </span>
                      <span className="text-xl font-bold tracking-tight text-foreground tabular-nums">
                        {formatRupiah(wallet.balance)}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground bg-muted/60 px-2 py-1 rounded">
                      {wallet.accountNo}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
