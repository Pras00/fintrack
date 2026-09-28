import {
  TrendingUp,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";

export function ProductShowcase() {
  return (
    <div className="relative flex flex-col justify-between h-full p-8 lg:p-14 overflow-hidden bg-muted/20 border-r border-border/60">
      {/* Background Subtle Ambience */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="relative z-10">
        <Logo size="lg" showTagline />
      </div>

      {/* Center Value Proposition & Showcase Cards */}
      <div className="relative z-10 my-auto py-8 space-y-6 max-w-lg">
        <div className="space-y-2.5">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground leading-snug">
            Kendali Finansial Terstruktur dalam Satu Tempat.
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Pantau arus kas riil, kelompokkan pos pengeluaran, dan amankan target anggaran bulanan Anda secara terintegrasi dan akurat.
          </p>
        </div>

        {/* Realistic Financial Snapshot Card 1 */}
        <div className="rounded-xl border border-border/80 bg-card/80 backdrop-blur-md p-4.5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Wallet className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-semibold text-foreground">
                Ringkasan Kekayaan Bersih
              </span>
            </div>
            <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +8.4%
            </span>
          </div>

          <div>
            <div className="text-2xl font-bold tracking-tight text-foreground font-sans">
              Rp 84.500.000
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Total terkonsolidasi dari 4 rekening & dompet aktif
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40 text-xs">
            <div>
              <span className="text-muted-foreground text-[11px] block">Pemasukan Bulan Ini</span>
              <span className="font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1 mt-0.5 tabular-nums">
                <ArrowUpRight className="h-3 w-3" />
                Rp 46.500.000
              </span>
            </div>
            <div>
              <span className="text-muted-foreground text-[11px] block">Pengeluaran Bulan Ini</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-0.5 tabular-nums">
                <ArrowDownRight className="h-3 w-3" />
                Rp 9.550.000
              </span>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>Rekonsiliasi mutasi rekening bank dan dompet digital dalam satu pintu</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>Alokasi batas anggaran per kategori pengeluaran tanpa spreadsheet manual</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>Laporan analitik pengeluaran dan rasio tabungan siap pakai</span>
          </div>
        </div>
      </div>

      {/* Footer Assurance */}
      <div className="relative z-10 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
          <span>Privasi dan enkripsi data terjaga</span>
        </div>
        <span>© 2026 FinTrack</span>
      </div>
    </div>
  );
}
