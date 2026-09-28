"use client";

import { useState, useEffect } from "react";
import { useModalStore } from "@/stores/use-modal-store";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  createBudgetAction,
  updateBudgetAction,
  getBudgetCategoriesAction,
  BudgetCategoryOption,
} from "@/actions/budgets";
import {
  X,
  Target,
  Sparkles,
  Utensils,
  Receipt,
  ShoppingBag,
  Car,
  Gamepad2,
  HeartPulse,
  GraduationCap,
  MoreHorizontal,
  Briefcase,
  Tag,
  Loader2,
  Calendar,
  Check,
} from "lucide-react";

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

function resolveCategoryIcon(iconName?: string) {
  switch (iconName) {
    case "utensils":
      return Utensils;
    case "receipt":
      return Receipt;
    case "shopping-bag":
      return ShoppingBag;
    case "car":
      return Car;
    case "gamepad-2":
      return Gamepad2;
    case "heart-pulse":
      return HeartPulse;
    case "graduation-cap":
      return GraduationCap;
    case "briefcase":
      return Briefcase;
    case "more-horizontal":
      return MoreHorizontal;
    default:
      return Tag;
  }
}

export function BudgetModal() {
  const {
    isBudgetModalOpen,
    budgetModalMode,
    editingBudget,
    closeBudgetModal,
  } = useModalStore();

  const [categories, setCategories] = useState<BudgetCategoryOption[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [month, setMonth] = useState(9); // Default September
  const [year, setYear] = useState(2026); // Default 2026
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Load available expense categories
  useEffect(() => {
    if (!isBudgetModalOpen) return;

    let isMounted = true;
    async function load() {
      setIsLoadingCategories(true);
      try {
        const cats = await getBudgetCategoriesAction();
        if (isMounted) {
          setCategories(cats);
          if (budgetModalMode === "CREATE" && cats.length > 0 && !selectedCategoryId) {
            setSelectedCategoryId(cats[0].id);
          }
        }
      } catch (err) {
        console.error("Gagal memuat kategori anggaran:", err);
      } finally {
        if (isMounted) setIsLoadingCategories(false);
      }
    }
    load();

    return () => {
      isMounted = false;
    };
  }, [isBudgetModalOpen, budgetModalMode]);

  // Sync state when editing or opening
  useEffect(() => {
    if (isBudgetModalOpen) {
      if (budgetModalMode === "EDIT" && editingBudget) {
        setSelectedCategoryId(editingBudget.categoryId);
        setAmountStr(editingBudget.limit.toString());
        setMonth(editingBudget.month || 9);
        setYear(editingBudget.year || 2026);
      } else {
        setAmountStr("");
        setMonth(9);
        setYear(2026);
      }
    }
  }, [isBudgetModalOpen, budgetModalMode, editingBudget]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isBudgetModalOpen) {
        closeBudgetModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isBudgetModalOpen, closeBudgetModal]);

  if (!isBudgetModalOpen) return null;

  const currentNumericAmount = parseFloat(amountStr) || 0;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setAmountStr(val);
  };

  const handleQuickAdd = (additional: number) => {
    const nextVal = currentNumericAmount + additional;
    setAmountStr(nextVal.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentNumericAmount <= 0) {
      toast.error("Nominal batas anggaran harus lebih besar dari Rp 0");
      return;
    }

    if (budgetModalMode === "CREATE" && !selectedCategoryId) {
      toast.error("Silakan pilih kategori pengeluaran");
      return;
    }

    setIsSubmitting(true);
    try {
      if (budgetModalMode === "EDIT" && editingBudget) {
        const res = await updateBudgetAction({
          id: editingBudget.id,
          amountLimit: currentNumericAmount,
        });

        if (res.success) {
          toast.success(`Batas anggaran ${editingBudget.name} berhasil diperbarui!`);
          window.dispatchEvent(new CustomEvent("fintrack:budget-updated"));
          closeBudgetModal();
        } else {
          toast.error(res.error || "Gagal memperbarui batas anggaran");
        }
      } else {
        const res = await createBudgetAction({
          categoryId: selectedCategoryId,
          amountLimit: currentNumericAmount,
          month,
          year,
        });

        if (res.success) {
          const cat = categories.find((c) => c.id === selectedCategoryId);
          toast.success(
            `Batas anggaran ${cat ? cat.name : "kategori"} berhasil ditetapkan!`
          );
          window.dispatchEvent(new CustomEvent("fintrack:budget-updated"));
          closeBudgetModal();
        } else {
          toast.error(res.error || "Gagal menyimpan batas anggaran");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan sistem saat menyimpan anggaran");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const SelectedIcon = resolveCategoryIcon(
    editingBudget ? editingBudget.categoryIcon : selectedCategory?.icon
  );
  const categoryColor = editingBudget
    ? editingBudget.categoryColor || "#10B981"
    : selectedCategory?.color || "#10B981";

  // Calculate live preview metrics for edit mode
  const projectedPercent =
    editingBudget && currentNumericAmount > 0
      ? Math.round((editingBudget.spent / currentNumericAmount) * 100)
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 text-foreground animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">
                  {budgetModalMode === "EDIT"
                    ? "Sesuaikan Batas Anggaran"
                    : "Tambah Batas Anggaran Baru"}
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-600 dark:text-teal-400">
                  {MONTH_NAMES[month - 1]} {year}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {budgetModalMode === "EDIT"
                  ? `Perbarui plafon pengeluaran untuk kategori ${editingBudget?.name}`
                  : "Tetapkan pagu belanja untuk menjaga kontrol finansial Anda"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeBudgetModal}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* CATEGORY SELECTOR */}
          {budgetModalMode === "CREATE" ? (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Kategori Pengeluaran</span>
                {isLoadingCategories && (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Memuat kategori...
                  </span>
                )}
              </label>

              <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const Icon = resolveCategoryIcon(cat.icon);
                  const isSelected = selectedCategoryId === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-teal-500 bg-teal-500/10 text-teal-900 dark:text-teal-100 ring-1 ring-teal-500"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: `${cat.color}20`,
                          color: cat.color,
                        }}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-medium truncate flex-1">
                        {cat.name}
                      </span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* EDIT MODE CATEGORY BADGE */
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: `${categoryColor}20`,
                    color: categoryColor,
                  }}
                >
                  <SelectedIcon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block font-medium">
                    Kategori Target
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {editingBudget?.name}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-muted-foreground block">
                  Realisasi Saat Ini
                </span>
                <span className="text-xs font-bold tabular-nums text-foreground">
                  {formatRupiah(editingBudget?.spent || 0)}
                </span>
              </div>
            </div>
          )}

          {/* AMOUNT LIMIT INPUT */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Batas Maksimal Anggaran (Plafon)</span>
              {currentNumericAmount > 0 && (
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 tabular-nums">
                  {formatRupiah(currentNumericAmount)}
                </span>
              )}
            </label>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                Rp
              </span>
              <Input
                type="text"
                value={amountStr ? parseInt(amountStr, 10).toLocaleString("id-ID") : ""}
                onChange={handleAmountChange}
                placeholder="Contoh: 3.500.000"
                className="pl-11 h-11 text-sm font-semibold tabular-nums rounded-xl border-slate-200 dark:border-slate-800"
                required
                autoFocus
              />
            </div>

            {/* QUICK AMOUNT CHIPS */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[500000, 1000000, 2000000, 5000000].map((nominal) => (
                <button
                  key={nominal}
                  type="button"
                  onClick={() => handleQuickAdd(nominal)}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-teal-500/10 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-500/30 transition-all cursor-pointer"
                >
                  +{formatRupiah(nominal)}
                </button>
              ))}
            </div>
          </div>

          {/* LIVE IMPACT PREVIEW (FOR EDIT MODE) */}
          {budgetModalMode === "EDIT" && editingBudget && currentNumericAmount > 0 && (
            <div className="p-3.5 rounded-xl border border-teal-500/30 bg-teal-500/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Proyeksi Kapasitas</span>
                <span
                  className={`font-bold tabular-nums ${
                    (projectedPercent || 0) > 100
                      ? "text-rose-500"
                      : (projectedPercent || 0) > 80
                      ? "text-amber-500"
                      : "text-emerald-500"
                  }`}
                >
                  {projectedPercent}% terpakai
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    (projectedPercent || 0) > 100
                      ? "bg-rose-500"
                      : (projectedPercent || 0) > 80
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(projectedPercent || 0, 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center justify-between pt-0.5">
                <span>Sisa dana tersedia:</span>
                <span className="font-bold tabular-nums text-foreground">
                  {formatRupiah(Math.max(0, currentNumericAmount - editingBudget.spent))}
                </span>
              </p>
            </div>
          )}

          {/* PERIOD SELECTION (CREATE MODE ONLY) */}
          {budgetModalMode === "CREATE" && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Bulan Target
                </label>
                <div className="relative">
                  <select
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-background px-3 text-xs font-medium text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    {MONTH_NAMES.map((name, idx) => (
                      <option key={name} value={idx + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Tahun Target
                </label>
                <div className="relative">
                  <select
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value, 10))}
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-background px-3 text-xs font-medium text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    {[2025, 2026, 2027].map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={closeBudgetModal}
              disabled={isSubmitting}
              className="h-10 rounded-xl px-4 text-xs font-semibold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || currentNumericAmount <= 0}
              className="h-10 rounded-xl px-5 text-xs font-bold gap-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 shadow-xs transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>
                    {budgetModalMode === "EDIT"
                      ? "Perbarui Batas Anggaran"
                      : "Simpan Batas Anggaran"}
                  </span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
