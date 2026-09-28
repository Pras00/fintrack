"use client";

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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/actions/auth";

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

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="hidden lg:flex w-64 h-screen shrink-0 flex-col border-r border-border/70 bg-card/60 backdrop-blur-md">
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center justify-between px-5 border-b border-border/40">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-bold text-sm">
            FT
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-foreground">
              FinTrack
            </span>
            <span className="text-[11px] text-muted-foreground leading-none">
              Manajemen Keuangan
            </span>
          </div>
        </Link>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
          Menu Utama
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center rounded-xl px-3.5 py-2.5 text-xs transition-all duration-300 ease-out min-h-[42px] overflow-hidden",
                isActive
                  ? "bg-[#0F172A] text-white dark:bg-slate-800 dark:text-white shadow-xs font-semibold"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground font-medium"
              )}
            >
              {/* Subtle Active Indicator Pill on the left edge */}
              <span
                className={cn(
                  "absolute left-1.5 top-1/2 -translate-y-1/2 w-1 rounded-full bg-teal-400 transition-all duration-300 ease-out",
                  isActive ? "h-5 opacity-100 scale-100" : "h-0 opacity-0 scale-50"
                )}
              />

              {/* Icon and Text with smooth rightward shift when active */}
              <div
                className={cn(
                  "flex items-center gap-3 transition-transform duration-300 ease-out",
                  isActive ? "translate-x-2" : "translate-x-0 group-hover:translate-x-1"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors duration-200",
                    isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span
                  className={cn(
                    "transition-all duration-200 whitespace-nowrap",
                    isActive ? "text-white font-semibold" : "text-muted-foreground font-medium group-hover:text-foreground"
                  )}
                >
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Security Assurance Card */}
      <div className="p-3 border-t border-border/40">
        <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>Data Terproteksi</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Standar finansial tingkat eksekutif dengan enkripsi data aktif.
          </p>
        </div>

        {/* User profile capsule */}
        <div className="mt-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs font-bold border border-emerald-500/30">
              P
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">Prasz</p>
              <p className="text-[10px] text-muted-foreground truncate">Pengguna Terdaftar</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/settings" title="Pengaturan" className="text-muted-foreground hover:text-foreground p-1 transition-colors">
              <Settings className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={handleLogout}
              title="Keluar dari Akun"
              className="text-muted-foreground hover:text-rose-500 p-1 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
