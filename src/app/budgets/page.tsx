"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";
import { useModalStore } from "@/stores/use-modal-store";
import {
  getBudgetsAction,
  deleteBudgetAction,
  BudgetsOverviewResponse,
} from "@/actions/budgets";
import { toast } from "sonner";
import {
  Plus,
  Target,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Utensils,
  Receipt,
  ShoppingBag,
  Car,
  Gamepad2,
  HeartPulse,
  GraduationCap,
  Briefcase,
  Tag,
  Pencil,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Tv,
  Music,
  Film,
  Ticket,
  Home,
  Baby,
  Wrench,
  Zap,
  Bath,
  Smartphone,
  Laptop,
  Camera,
  Headphones,
  Wifi,
  Dog,
  Cat,
  Dumbbell,
  Activity,
  Pill,
  Bike,
  Coffee,
  Pizza,
  Shirt,
  Gift,
  Plane,
  Fuel,
  Bus,
  Compass,
  BookOpen,
  Palette,
  MoreHorizontal,
} from "lucide-react";
import type { BudgetItem } from "@/types";

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  utensils: Utensils,
  receipt: Receipt,
  "shopping-bag": ShoppingBag,
  car: Car,
  "gamepad-2": Gamepad2,
  "heart-pulse": HeartPulse,
  "graduation-cap": GraduationCap,
  briefcase: Briefcase,
  tag: Tag,
  tv: Tv,
  music: Music,
  film: Film,
  ticket: Ticket,
  home: Home,
  baby: Baby,
  wrench: Wrench,
  zap: Zap,
  bath: Bath,
  smartphone: Smartphone,
  laptop: Laptop,
  camera: Camera,
  headphones: Headphones,
  wifi: Wifi,
  dog: Dog,
  cat: Cat,
  dumbbell: Dumbbell,
  activity: Activity,
  pill: Pill,
  bike: Bike,
  coffee: Coffee,
  pizza: Pizza,
  shirt: Shirt,
  gift: Gift,
  plane: Plane,
  fuel: Fuel,
  bus: Bus,
  compass: Compass,
  "book-open": BookOpen,
  palette: Palette,
  sparkles: Sparkles,
  "more-horizontal": MoreHorizontal,
};

function resolveCategoryIcon(iconName?: string) {
  if (!iconName) return Tag;
  return ICON_MAP[iconName] || Tag;
}

export default function BudgetsPage() {
  const { openBudgetModal } = useModalStore();

  const [month, setMonth] = useState(9); // Default September
  const [year, setYear] = useState(2026); // Default 2026
  const [data, setData] = useState<BudgetsOverviewResponse>({
    budgets: [],
    totalLimit: 0,
    totalSpent: 0,
    remainingBudget: 0,
    overallPercent: 0,
    activeMonth: 9,
    activeYear: 2026,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBudgets = useCallback(async (m: number, y: number) => {
    setIsLoading(true);
    try {
      const res = await getBudgetsAction(m, y);
      setData(res);
    } catch (err) {
      console.error("Gagal memuat anggaran:", err);
      toast.error("Gagal memuat data anggaran");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets(month, year);
  }, [fetchBudgets, month, year]);

  // Reactive listener for budget updates and transaction creation
  useEffect(() => {
    const handleRefresh = () => {
      fetchBudgets(month, year);
    };

    window.addEventListener("fintrack:budget-updated", handleRefresh);
    window.addEventListener("fintrack:transaction-created", handleRefresh);
    return () => {
      window.removeEventListener("fintrack:budget-updated", handleRefresh);
      window.removeEventListener("fintrack:transaction-created", handleRefresh);
    };
  }, [fetchBudgets, month, year]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((prev) => prev - 1);
    } else {
      setMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((prev) => prev + 1);
    } else {
      setMonth((prev) => prev + 1);
    }
  };

  const handleDeleteBudget = async (budget: BudgetItem) => {
    if (!confirm(`Hapus batas anggaran untuk kategori "${budget.name}"?`)) {
      return;
    }

    setDeletingId(budget.id);
    try {
      const res = await deleteBudgetAction(budget.id);
      if (res.success) {
        toast.success(`Anggaran ${budget.name} berhasil dihapus`);
        fetchBudgets(month, year);
      } else {
        toast.error(res.error || "Gagal menghapus anggaran");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat menghapus anggaran");
    } finally {
      setDeletingId(null);
    }
  };

  const { budgets, totalLimit, totalSpent, remainingBudget, overallPercent } = data;

  return (
    <DashboardShell>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Perencanaan & Kontrol Anggaran
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
              Live Database
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Tetapkan batas belanja per kategori untuk menjaga stabilitas finansial bulanan Anda
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month / Year Navigator */}
          <div className="flex items-center gap-1 rounded-xl border border-border/80 bg-background/80 p-1 shadow-xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Bulan sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-foreground">
              <Calendar className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>
                {MONTH_NAMES[month - 1]} {year}
              </span>
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Bulan berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Add Budget Button */}
          <Button
            onClick={() => openBudgetModal("CREATE")}
            className="h-10 rounded-xl px-4 text-xs font-bold gap-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Batas Anggaran Baru</span>
          </Button>
        </div>
      </div>

      {/* Overview Metric Banner */}
      <Card className="p-6 border-border/70">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-medium">
              Alokasi Total Anggaran Bulan Ini ({MONTH_NAMES[month - 1]} {year})
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold tabular-nums text-foreground">
                {isLoading ? "..." : formatRupiah(totalSpent)}
              </span>
              <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                dari batas {isLoading ? "..." : formatRupiah(totalLimit)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              {remainingBudget >= 0 ? (
                <>
                  Sisa alokasi dana aman:{" "}
                  <span className="font-bold text-emerald-500 tabular-nums">
                    {formatRupiah(remainingBudget)}
                  </span>
                </>
              ) : (
                <>
                  Defisit batas anggaran:{" "}
                  <span className="font-bold text-rose-500 tabular-nums">
                    -{formatRupiah(Math.abs(remainingBudget))}
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="w-full lg:w-72 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-muted-foreground">Kapasitas Terpakai</span>
              <span
                className={`font-bold tabular-nums ${
                  overallPercent >= 100
                    ? "text-rose-500"
                    : overallPercent >= 80
                    ? "text-amber-500"
                    : "text-emerald-500"
                }`}
              >
                {isLoading ? "..." : `${overallPercent}%`}
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-muted/60 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overallPercent >= 100
                    ? "bg-rose-500"
                    : overallPercent >= 80
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(overallPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Budgets Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 text-muted-foreground gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-teal-600 dark:text-teal-400" />
          <span className="text-xs font-medium">Memuat data anggaran dari database NeonDB...</span>
        </div>
      ) : budgets.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-border/80">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-3">
            <Target className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground">
            Belum Ada Batas Anggaran di Periode Ini
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-5">
            Tetapkan batas maksimal pengeluaran bulanan Anda untuk kategori seperti Makanan, Tagihan, atau Transportasi.
          </p>
          <Button
            onClick={() => openBudgetModal("CREATE")}
            className="h-9 rounded-xl px-4 text-xs font-bold gap-2 bg-teal-600 hover:bg-teal-700 text-white cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tetapkan Anggaran Pertama</span>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {budgets.map((b) => {
            const Icon = resolveCategoryIcon(b.categoryIcon);
            const isOver = b.percent >= 100;
            const isWarning = b.percent >= 80 && !isOver;
            const remaining = b.limit - b.spent;
            const color = b.categoryColor || "#10B981";

            return (
              <Card
                key={b.id}
                className="p-5 border-border/70 space-y-3.5 hover:border-border transition-all shadow-xs"
              >
                {/* Top Row: Icon, Category Name, and Status Badge */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: `${color}18`,
                        color: color,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-foreground truncate">
                        {b.name}
                      </h3>
                      <span className="text-[11px] text-muted-foreground block">
                        Limit Bulanan
                      </span>
                    </div>
                  </div>

                  {/* Actions & Badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isOver ? (
                      <span className="flex items-center gap-1 rounded-lg bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold text-rose-500 border border-rose-500/20">
                        <AlertCircle className="h-3 w-3" />
                        Melebihi Limit
                      </span>
                    ) : isWarning ? (
                      <span className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-500 border border-amber-500/20">
                        <AlertTriangle className="h-3 w-3" />
                        Mendekati Limit
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-500 border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" />
                        Aman
                      </span>
                    )}

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => openBudgetModal("EDIT", b)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title="Edit batas anggaran"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteBudget(b)}
                      disabled={deletingId === b.id}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 hover:bg-rose-500/10 hover:border-rose-500/30 text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                      title="Hapus anggaran"
                    >
                      {deletingId === b.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-500" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Progress bar and values */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground tabular-nums">
                      {formatRupiah(b.spent)}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      Batas: {formatRupiah(b.limit)} ({b.percent}%)
                    </span>
                  </div>

                  <div className="h-2.5 w-full rounded-full bg-muted/60 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver
                          ? "bg-rose-500"
                          : isWarning
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(b.percent, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <span className="text-muted-foreground">
                      Status:{" "}
                      <strong className={isOver ? "text-rose-500" : isWarning ? "text-amber-500" : "text-emerald-500"}>
                        {b.percent}%
                      </strong>
                    </span>
                    <span className="text-muted-foreground">
                      {remaining >= 0 ? (
                        <>
                          Sisa:{" "}
                          <span className="font-semibold text-foreground tabular-nums">
                            {formatRupiah(remaining)}
                          </span>
                        </>
                      ) : (
                        <>
                          Kelebihan:{" "}
                          <span className="font-semibold text-rose-500 tabular-nums">
                            +{formatRupiah(Math.abs(remaining))}
                          </span>
                        </>
                      )}
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
