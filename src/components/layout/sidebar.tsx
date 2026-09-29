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
  PanelLeftClose,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/actions/auth";
import { Logo, LogoMark } from "@/components/brand/logo";
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
    isMobileOpen,
    isCollapsed,
    closeMobile,
    toggleCollapse,
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
        toggleCollapse();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen, closeMobile, toggleCollapse]);

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
          {/* Mobile Header: Logo & Close Button */}
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
        </aside>
      </div>

      {/* ========================================================= */}
      {/* 2. DESKTOP COLLAPSIBLE SIDEBAR (Screens >= 1024px)        */}
      {/* ========================================================= */}
      <aside
        className={cn(
          "hidden lg:flex h-screen shrink-0 flex-col border-r border-border/70 bg-card/60 backdrop-blur-md transition-all duration-300 ease-in-out relative z-30 select-none",
          isCollapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-border/40 transition-all duration-300",
            isCollapsed ? "justify-center px-2" : "justify-between px-5"
          )}
        >
          {isCollapsed ? (
            <button
              type="button"
              onClick={toggleCollapse}
              title="Buka Sidebar (Ctrl+B)"
              className="flex items-center justify-center p-1 rounded-xl hover:bg-muted/70 transition-transform hover:scale-105 cursor-pointer"
            >
              <LogoMark size={32} />
            </button>
          ) : (
            <>
              <Logo size="md" href="/dashboard" />
              <button
                type="button"
                onClick={toggleCollapse}
                title="Tutup Sidebar (Ctrl+B)"
                className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Nav Menu */}
        <div
          className={cn(
            "flex-1 overflow-y-auto py-4 space-y-1.5 transition-all duration-300",
            isCollapsed ? "px-2" : "px-3.5"
          )}
        >
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              Menu Utama
            </div>
          )}

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href === "/dashboard" && pathname === "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={cn(
                  "group relative flex items-center rounded-xl text-xs transition-all duration-200 min-h-[42px] overflow-hidden",
                  isCollapsed ? "justify-center px-0 py-2.5" : "px-3.5 py-2.5",
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

                {isCollapsed ? (
                  <Icon
                    className={cn(
                      "h-4.5 w-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                      isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                ) : (
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
                )}
              </Link>
            );
          })}
        </div>

        {/* Desktop Footer */}
        <div className="p-3 border-t border-border/40">
          {/* Security Assurance Card (Expanded mode only) */}
          {!isCollapsed ? (
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>Data Terproteksi</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Standar finansial tingkat eksekutif dengan enkripsi data aktif.
              </p>
            </div>
          ) : (
            <div className="flex justify-center pb-1">
              <div
                title="Data Terproteksi: Standar finansial tingkat eksekutif dengan enkripsi aktif"
                className="h-8 w-8 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-400 bg-teal-500/10 cursor-help"
              >
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
          )}

          {/* User profile capsule */}
          {isCollapsed ? (
            <div className="mt-2.5 flex flex-col items-center gap-2">
              <div
                title="Prasz - Pengguna Terdaftar"
                className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs font-bold border border-emerald-500/30 cursor-default"
              >
                P
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Keluar dari Akun"
                className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
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
          )}
        </div>
      </aside>
    </>
  );
}
