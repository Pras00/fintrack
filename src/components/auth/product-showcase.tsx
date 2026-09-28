import {
  ArrowUpRight,
  Landmark,
  CreditCard,
  Banknote,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";

export function ProductShowcase() {
  return (
    <div className="flex flex-col justify-center space-y-5 max-w-lg">
      {/* Brand Header & Value Proposition */}
      <div className="space-y-2.5">
        <Logo size="md" showTagline />
        <div className="space-y-1 pt-0.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-snug">
            Kendali Penuh Arus Kas & Saldo Rekening
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Satu platform untuk mencatat transaksi harian, mengonsolidasi saldo bank, dan memantau batas anggaran bulanan secara akurat.
          </p>
        </div>
      </div>

      {/* Creative Financial Snapshot Slate */}
      <div className="rounded-2xl border border-border/80 bg-card/90 dark:bg-slate-900/80 backdrop-blur-md p-4 sm:p-5 shadow-xs space-y-3.5">
        {/* Slate Top Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-foreground tracking-wide uppercase">
              Ringkasan Finansial Terpadu
            </span>
          </div>
        </div>

        {/* Total Net Balance Metric */}
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[11px] text-muted-foreground font-medium block">
              Total Kekayaan Terkonsolidasi
            </span>
            <div className="text-2xl sm:text-[26px] font-bold tracking-tight text-foreground font-sans mt-0.5 tabular-nums">
              Rp 54.780.000
            </div>
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-semibold">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>+8.4% Arus Bersih</span>
          </div>
        </div>

        {/* Multi-Wallet Status Strip */}
        <div className="grid grid-cols-3 gap-2 pt-0.5">
          <div className="rounded-xl border border-border/60 bg-muted/40 p-2 sm:p-2.5">
            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-medium">
              <Landmark className="h-3 w-3 text-blue-500 shrink-0" />
              <span className="truncate">BCA Prioritas</span>
            </div>
            <div className="text-xs font-bold text-foreground mt-1 tabular-nums truncate">
              Rp 54.780.000
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/40 p-2 sm:p-2.5">
            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-medium">
              <CreditCard className="h-3 w-3 text-teal-500 shrink-0" />
              <span className="truncate">GoPay Wallet</span>
            </div>
            <div className="text-xs font-bold text-foreground mt-1 tabular-nums truncate">
              Rp 450.000
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/40 p-2 sm:p-2.5">
            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-medium">
              <Banknote className="h-3 w-3 text-emerald-500 shrink-0" />
              <span className="truncate">Kas Fisik</span>
            </div>
            <div className="text-xs font-bold text-foreground mt-1 tabular-nums truncate">
              Rp 250.000
            </div>
          </div>
        </div>

        {/* Split 2-Column: Mini Ledger & Budget Discipline */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50 text-xs">
          {/* Column 1: Recent Movements */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Mutasi Terakhir
            </span>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] py-0.5">
                <span className="text-foreground/90 truncate pr-1">Gaji Bulanan</span>
                <span className="font-semibold text-teal-600 dark:text-teal-400 tabular-nums shrink-0">
                  +45.000.000
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] py-0.5">
                <span className="text-foreground/90 truncate pr-1">Makan & Belanja</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums shrink-0">
                  -120.000
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Budget Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Batas Anggaran</span>
              <span className="text-teal-600 dark:text-teal-400 font-medium">terkendali</span>
            </div>
            <div className="space-y-1 pt-0.5">
              <div>
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Makanan & Minuman</span>
                  <span className="font-mono text-foreground font-semibold">60%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full w-[60%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Infrastructure Assurance */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-0.5">
        <div className="flex items-center gap-1.5 text-[11px]">
          <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>Sistem pencatatan privat dengan enkripsi data terisolasi</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[10px] shrink-0">
          <Lock className="h-3 w-3" />
          <span>NeonDB SSL</span>
        </div>
      </div>
    </div>
  );
}
