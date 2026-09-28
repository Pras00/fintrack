"use client";

import Link from "next/link";
import { useFilterStore, DatePreset } from "@/stores/use-filter-store";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/brand/logo";
import {
  Plus,
  Calendar,
  Command,
} from "lucide-react";

export function Header() {
  const { datePreset, setDatePreset } = useFilterStore();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full py-8 items-center justify-between border-b border-border/70 bg-background/85 px-6 sm:px-8 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Left: Breadcrumbs / Title */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <Link href="/dashboard" className="lg:hidden flex items-center shrink-0">
          <LogoMark size={30} />
        </Link>
        <div>
          <h1 className="text-sm sm:text-base font-bold text-foreground tracking-tight leading-tight">
            Dashboard Keuangan
          </h1>
          <span className="sm:hidden text-[10px] text-muted-foreground block -mt-0.5">
            September 2026
          </span>
        </div>
        <span className="hidden sm:inline-block text-muted-foreground text-xs">•</span>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 text-emerald-500" />
          Periode: September 2026
        </span>
      </div>

      {/* Right Actions: Filter, Quick Entry, Theme, Profile */}
      <div className="flex items-center gap-3 sm:gap-3.5">
        {/* Date Filter Segmented Select */}
        <select
          value={datePreset}
          onChange={(e) => setDatePreset(e.target.value as DatePreset)}
          className="hidden md:inline-flex h-10 rounded-xl border border-border/70 bg-background/60 px-4 text-xs font-medium text-foreground/90 shadow-xs focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer hover:bg-muted/40 transition-colors"
        >
          <option value="7d">7 Hari Terakhir</option>
          <option value="30d">30 Hari Terakhir</option>
          <option value="this_month">Bulan Ini (Sep 2026)</option>
          <option value="last_month">Bulan Lalu (Agu 2026)</option>
          <option value="this_year">Tahun 2026</option>
        </select>

        {/* Global Action Button - Diarahkan ke Halaman Buku Transaksi */}
        <Link
          href="/transactions"
          className={cn(
            buttonVariants({ variant: "default" }),
            "h-10 rounded-xl gap-2 px-4.5 text-xs font-semibold shadow-xs bg-[#0F172A] text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors"
          )}
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Transaksi</span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-white/20 bg-white/10 dark:border-slate-300 dark:bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-mono">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </Link>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
