"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ArrowRightLeft,
  WalletCards,
  PieChart,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/actions/auth";
import { Logo } from "@/components/brand/logo";
import { useSidebarStore } from "@/stores/use-sidebar-store";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transaksi", href: "/transactions", icon: ArrowRightLeft },
  { name: "Dompet & Rekening", href: "/wallets", icon: WalletCards },
  { name: "Perencanaan Anggaran", href: "/budgets", icon: PieChart },
  { name: "Laporan & Analitik", href: "/analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const {
    isOpen,
    isMobileOpen,
    toggleSidebar,
    toggleMobile,
    closeMobile,
    toggle,
  } = useSidebarStore();

  const handleLogout = async () => {
    await logoutUser();
    closeMobile();
    router.push("/login");
    router.refresh();
  };

  // Close mobile drawer on route navigation
  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  // Handle ESC and Ctrl+B / Cmd+B keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        closeMobile();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen, closeMobile, toggle]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  return (
    <>
      {/* ========================================================= */}
      {/* 1. MOBILE & TABLET SLIDE-OVER DRAWER (Screens < 1024px)   */}
      {/* ========================================================= */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden transition-all duration-300",
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden={!isMobileOpen}
      >
        {/* Backdrop overlay */}
        <div
          onClick={closeMobile}
          className={cn(
            "fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300",
            isMobileOpen ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Drawer panel */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-card border-r border-border shadow-2xl flex flex-col transition-transform duration-300 ease-out z-10",
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Mobile Header: Full Brand Logo & Close Button */}
          <div className="flex h-16 shrink-0 items-center justify-between px-5 border-b border-border/40">
            <Logo size="md" href="/dashboard" />
            <button
              type="button"
              onClick={closeMobile}
              title="Tutup Navigasi"
              className="h-8 w-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile Nav Menu */}
          <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5">
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              Menu Utama
            </div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || (item.href === "/dashboard" && pathname === "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobile}
                  className={cn(
                    "group relative flex items-center rounded-xl px-3.5 py-2.5 text-xs transition-all duration-200 min-h-[42px] overflow-hidden",
                    isActive
                      ? "bg-[#0F172A] text-white dark:bg-slate-800 dark:text-white shadow-xs font-semibold"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground font-medium"
                  )}
                >
                  <span
                    className={cn(
                      "absolute left-1.5 top-1/2 -translate-y-1/2 w-1 rounded-full bg-teal-400 transition-all duration-200",
                      isActive ? "h-5 opacity-100 scale-100" : "h-0 opacity-0 scale-50"
                    )}
                  />
                  <div
                    className={cn(
                      "flex items-center gap-3 transition-transform duration-200",
                      isActive ? "translate-x-2" : "translate-x-0 group-hover:translate-x-1"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    <span
                      className={cn(
                        "whitespace-nowrap",
                        isActive
                          ? "text-white font-semibold"
                          : "text-muted-foreground font-medium group-hover:text-foreground"
                      )}
                    >
                      {item.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Mobile Footer */}
          <div className="p-3 border-t border-border/40">
            {/* Security Assurance Card */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>Data Terproteksi</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Standar finansial tingkat eksekutif dengan enkripsi data aktif.
              </p>
            </div>

            {/* User profile capsule */}
            <div className="mt-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs font-bold border border-emerald-500/30 shrink-0">
                  P
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">Prasz</p>
                  <p className="text-[10px] text-muted-foreground truncate">Pengguna Terdaftar</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Link
                  href="/settings"
                  title="Pengaturan"
                  onClick={closeMobile}
                  className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                >
                  <Settings className="h-3.5 w-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Keluar dari Akun"
                  className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 p-1 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Middle Toggle Tab Button on Mobile Drawer Edge */}
          <button
            type="button"
            onClick={closeMobile}
            aria-label="Tutup Navigasi"
            title="Tutup Navigasi"
            className={cn(
              "absolute left-full top-1/2 -translate-y-1/2 z-50",
              "flex items-center justify-center cursor-pointer select-none",
              "h-12 w-5.5 rounded-r-xl border-y border-r border-border/80",
              "bg-card/95 hover:bg-muted dark:bg-slate-900/95 dark:hover:bg-slate-800",
              "text-muted-foreground hover:text-foreground shadow-md active:scale-95 transition-all duration-200"
            )}
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
          </button>
        </aside>
      </div>

      {/* Mobile & Tablet Edge Toggle Button (when drawer is closed) */}
      <button
        type="button"
        onClick={toggleMobile}
        aria-label="Buka Navigasi"
        title="Buka Navigasi"
        className={cn(
          "lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-40",
          "flex items-center justify-center cursor-pointer select-none",
          "h-12 w-5.5 rounded-r-xl border-y border-r border-border/80",
          "bg-card/95 hover:bg-muted dark:bg-slate-900/95 dark:hover:bg-slate-800",
          "text-muted-foreground hover:text-foreground shadow-md hover:w-6.5 active:scale-95 transition-all duration-200",
          isMobileOpen && "opacity-0 pointer-events-none"
        )}
      >
        <ChevronRight className="h-4 w-4 shrink-0" />
      </button>

      {/* ========================================================= */}
      {/* 2. DESKTOP COLLAPSIBLE SIDEBAR (Screens >= 1024px)        */}
      {/* ========================================================= */}
      <aside
        className={cn(
          "hidden lg:block relative h-screen shrink-0 border-r border-border/70 bg-card/60 backdrop-blur-md transition-all duration-300 ease-in-out z-30 select-none",
          isOpen ? "w-64" : "w-0 border-r-0"
        )}
      >
        {/* Inner Content Wrapper (Fixed 256px width, clipped cleanly when aside width is 0) */}
        <div className="w-64 h-full flex flex-col overflow-hidden">
          {/* Brand Header: Clean Full Logo (Logo does not get crowded or disappear) */}
          <div className="flex h-16 shrink-0 items-center px-6 border-b border-border/40">
            <Logo size="md" href="/dashboard" />
          </div>

          {/* Nav Menu */}
          <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5">
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              Menu Utama
            </div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || (item.href === "/dashboard" && pathname === "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center rounded-xl px-3.5 py-2.5 text-xs transition-all duration-200 min-h-[42px] overflow-hidden",
                    isActive
                      ? "bg-[#0F172A] text-white dark:bg-slate-800 dark:text-white shadow-xs font-semibold"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground font-medium"
                  )}
                >
                  {/* Active Indicator Pill */}
                  <span
                    className={cn(
                      "absolute left-1.5 top-1/2 -translate-y-1/2 w-1 rounded-full bg-teal-400 transition-all duration-200",
                      isActive ? "h-5 opacity-100 scale-100" : "h-0 opacity-0 scale-50"
                    )}
                  />
                  <div
                    className={cn(
                      "flex items-center gap-3 transition-transform duration-200",
                      isActive ? "translate-x-2" : "translate-x-0 group-hover:translate-x-1"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    <span
                      className={cn(
                        "whitespace-nowrap transition-all duration-200",
                        isActive
                          ? "text-white font-semibold"
                          : "text-muted-foreground font-medium group-hover:text-foreground"
                      )}
                    >
                      {item.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Desktop Footer */}
          <div className="p-3 border-t border-border/40">
            {/* Security Assurance Card */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>Data Terproteksi</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Standar finansial tingkat eksekutif dengan enkripsi data aktif.
              </p>
            </div>

            {/* User profile capsule */}
            <div className="mt-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs font-bold border border-emerald-500/30 shrink-0">
                  P
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">Prasz</p>
                  <p className="text-[10px] text-muted-foreground truncate">Pengguna Terdaftar</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Link
                  href="/settings"
                  title="Pengaturan"
                  className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/70 transition-colors"
                >
                  <Settings className="h-3.5 w-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Keluar dari Akun"
                  className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 p-1 rounded-md hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MIDDLE TOGGLE BUTTON TAB (Placement as in user Image 2)   */}
        {/* ========================================================= */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={isOpen ? "Tutup Sidebar (Ctrl+B)" : "Buka Sidebar (Ctrl+B)"}
          title={isOpen ? "Tutup Sidebar (Ctrl+B)" : "Buka Sidebar (Ctrl+B)"}
          className={cn(
            "absolute left-full top-1/2 -translate-y-1/2 z-40",
            "flex items-center justify-center cursor-pointer select-none",
            "h-12 w-5.5 rounded-r-xl border-y border-r border-border/80",
            "bg-card/95 hover:bg-muted dark:bg-slate-900/95 dark:hover:bg-slate-800",
            "text-muted-foreground hover:text-foreground shadow-md hover:w-6.5 active:scale-95 transition-all duration-200"
          )}
        >
          {isOpen ? (
            <ChevronLeft className="h-4 w-4 shrink-0 transition-transform" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 transition-transform" />
          )}
        </button>
      </aside>
    </>
  );
}
