"use client";

import Link from "next/link";
import { useFilterStore } from "@/stores/use-filter-store";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/brand/logo";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useSidebarStore } from "@/stores/use-sidebar-store";
import {
  Plus,
  Calendar,
  Command,
  Menu,
  PanelLeftOpen,
} from "lucide-react";

export function Header() {
  const { dateLabel } = useFilterStore();
  const { toggleMobile, isCollapsed, toggleCollapse } = useSidebarStore();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border/70 bg-background/85 px-4 sm:px-6 lg:px-8 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Left: Sidebar Toggle, Brand & Title */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile & Tablet Drawer Toggle Button */}
        <button
          type="button"
          onClick={toggleMobile}
          aria-label="Buka Menu Navigasi"
          title="Buka Menu Navigasi"
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card/70 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer shadow-2xs active:scale-95 shrink-0"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>

        {/* Desktop Sidebar Toggle (shown when sidebar is collapsed) */}
        {isCollapsed && (
          <button
            type="button"
            onClick={toggleCollapse}
            aria-label="Buka Sidebar (Ctrl+B)"
            title="Buka Sidebar (Ctrl+B)"
            className="hidden lg:flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card/70 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer shadow-2xs active:scale-95 shrink-0"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}

        <Link href="/dashboard" className="lg:hidden flex items-center shrink-0 hover:opacity-85 transition-opacity">
          <LogoMark size={28} />
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
