"use client";

import Link from "next/link";
import { useFilterStore } from "@/stores/use-filter-store";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/brand/logo";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Plus,
  Calendar,
  Command,
} from "lucide-react";

export function Header() {
  const { dateLabel } = useFilterStore();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full py-8 items-center justify-between border-b border-border/70 bg-background/85 px-4 sm:px-8 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Left: Breadcrumbs / Title */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <Link href="/dashboard" className="lg:hidden flex items-center shrink-0">
          <LogoMark size={30} />
        </Link>
        <div>
          <h1 className="text-sm sm:text-base font-bold text-foreground tracking-tight leading-tight">
            Dashboard Keuangan
          </h1>
          <span className="sm:hidden text-[10px] text-muted-foreground block -mt-0.5 truncate max-w-[130px]">
            {dateLabel}
          </span>
        </div>
        <span className="hidden sm:inline-block text-muted-foreground text-xs">•</span>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
          <span>Periode: <strong className="font-semibold text-foreground">{dateLabel}</strong></span>
        </span>
      </div>

      {/* Right Actions: Interactive Date Range Filter, Quick Entry, Theme */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Interactive Custom Date Range & Preset Picker */}
        <DateRangePicker />

        {/* Global Action Button - Tambah Transaksi */}
        <Link
          href="/transactions"
          className={cn(
            buttonVariants({ variant: "default" }),
            "hidden sm:inline-flex h-10 rounded-xl gap-2 px-4 text-xs font-semibold shadow-xs bg-[#0F172A] text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors"
          )}
        >
          <Plus className="h-4 w-4" />
          <span>Tambah</span>
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
