"use client";

import { useState, useEffect, useRef } from "react";
import { useModalStore } from "@/stores/use-modal-store";
import { formatRupiah, cn } from "@/lib/utils";
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
  CalendarDays,
  ChevronDown,
  Check,
  Sparkles,
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

// Curated collection of 38 financial & lifestyle icons from lucide-react
const CURATED_ICONS: Array<{
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  // Hiburan & Streaming
  { key: "tv", label: "TV / Streaming", icon: Tv },
  { key: "music", label: "Musik & Lagu", icon: Music },
  { key: "film", label: "Bioskop / Film", icon: Film },
  { key: "gamepad-2", label: "Gaming", icon: Gamepad2 },
  { key: "ticket", label: "Tiket & Event", icon: Ticket },

  // Rumah & Keluarga
  { key: "home", label: "Rumah / Tempat Tinggal", icon: Home },
  { key: "baby", label: "Kebutuhan Anak / Bayi", icon: Baby },
  { key: "wrench", label: "Servis & Perbaikan", icon: Wrench },
  { key: "zap", label: "Listrik & Utilitas", icon: Zap },
  { key: "bath", label: "Kebutuhan Mandi & Sanitasi", icon: Bath },

  // Gadget & Teknologi
  { key: "smartphone", label: "Pulsa & Paket Data", icon: Smartphone },
  { key: "laptop", label: "Perangkat Kerja & Laptop", icon: Laptop },
  { key: "camera", label: "Fotografi & Hobi", icon: Camera },
  { key: "headphones", label: "Aksesoris & Audio", icon: Headphones },
  { key: "wifi", label: "Langganan Internet", icon: Wifi },

  // Hewan Peliharaan
  { key: "dog", label: "Perawatan Peliharaan (Dog)", icon: Dog },
  { key: "cat", label: "Perawatan Kucing (Cat)", icon: Cat },

  // Kesehatan & Olahraga
  { key: "dumbbell", label: "Fitness & Gym", icon: Dumbbell },
  { key: "bike", label: "Sepeda & Gowes", icon: Bike },
  { key: "heart-pulse", label: "Kesehatan & Medis", icon: HeartPulse },
  { key: "activity", label: "Aktivitas Fisik", icon: Activity },
  { key: "pill", label: "Farmasi & Obat-obatan", icon: Pill },

  // Makanan & Kuliner
  { key: "coffee", label: "Kopi & Cafe", icon: Coffee },
  { key: "pizza", label: "Fast Food & Kuliner", icon: Pizza },
  { key: "utensils", label: "Makanan Pokok", icon: Utensils },

  // Belanja & Fashion
  { key: "shopping-bag", label: "Belanja & Lifestyle", icon: ShoppingBag },
  { key: "shirt", label: "Pakaian & Fashion", icon: Shirt },
  { key: "gift", label: "Hadiah & Donasi", icon: Gift },

  // Transportasi & Liburan
  { key: "car", label: "Mobil & Kendaraan", icon: Car },
  { key: "fuel", label: "Bahan Bakar & Bensin", icon: Fuel },
  { key: "bus", label: "Transportasi Umum", icon: Bus },
  { key: "plane", label: "Tiket Pesawat & Liburan", icon: Plane },
  { key: "compass", label: "Petualangan & Wisata", icon: Compass },

  // Edukasi, Hobi & Kreatif
  { key: "graduation-cap", label: "Pendidikan & Kursus", icon: GraduationCap },
  { key: "book-open", label: "Buku & Literasi", icon: BookOpen },
  { key: "palette", label: "Seni & Kerajinan", icon: Palette },
  { key: "sparkles", label: "Kecantikan & Skincare", icon: Sparkles },
  { key: "tag", label: "Umum / Lainnya", icon: Tag },
];

const CURATED_COLORS = [
  { hex: "#10B981", name: "Emerald" },
  { hex: "#0D9488", name: "Teal" },
  { hex: "#0EA5E9", name: "Sky" },
  { hex: "#3B82F6", name: "Blue" },
  { hex: "#8B5CF6", name: "Purple" },
  { hex: "#EC4899", name: "Pink" },
  { hex: "#F97316", name: "Orange" },
  { hex: "#EAB308", name: "Amber" },
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  receipt: Receipt,
  briefcase: Briefcase,
  "more-horizontal": MoreHorizontal,
};
CURATED_ICONS.forEach((item) => {
  ICON_MAP[item.key] = item.icon;
});

function resolveCategoryIcon(iconName?: string) {
  if (!iconName) return Tag;
  return ICON_MAP[iconName] || Tag;
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

  // Custom Category State (for "Pengeluaran Lainnya")
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [customCategoryIcon, setCustomCategoryIcon] = useState("sparkles");
  const [customCategoryColor, setCustomCategoryColor] = useState("#10B981");
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  // Custom Dropdown states
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);
  const iconPickerRef = useRef<HTMLDivElement>(null);

  // Close custom popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        monthDropdownRef.current &&
        !monthDropdownRef.current.contains(e.target as Node)
      ) {
        setIsMonthDropdownOpen(false);
      }
      if (
        yearDropdownRef.current &&
        !yearDropdownRef.current.contains(e.target as Node)
      ) {
        setIsYearDropdownOpen(false);
      }
      if (
        iconPickerRef.current &&
        !iconPickerRef.current.contains(e.target as Node)
      ) {
        setIsIconPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      setIsMonthDropdownOpen(false);
      setIsYearDropdownOpen(false);
      setIsIconPickerOpen(false);
      if (budgetModalMode === "EDIT" && editingBudget) {
        setSelectedCategoryId(editingBudget.categoryId);
        setAmountStr(editingBudget.limit.toString());
        setMonth(editingBudget.month || 9);
        setYear(editingBudget.year || 2026);
      } else {
        setAmountStr("");
        setCustomCategoryName("");
        setCustomCategoryIcon("sparkles");
        setCustomCategoryColor("#10B981");
        setMonth(9);
        setYear(2026);
      }
    }
  }, [isBudgetModalOpen, budgetModalMode, editingBudget]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isBudgetModalOpen) {
        if (isIconPickerOpen) {
          setIsIconPickerOpen(false);
          return;
        }
        if (isMonthDropdownOpen) {
          setIsMonthDropdownOpen(false);
          return;
        }
        if (isYearDropdownOpen) {
          setIsYearDropdownOpen(false);
          return;
        }
        closeBudgetModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isBudgetModalOpen,
    isIconPickerOpen,
    isMonthDropdownOpen,
    isYearDropdownOpen,
    closeBudgetModal,
  ]);

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

  const toggleMonthDropdown = () => {
    setIsMonthDropdownOpen((prev) => !prev);
    setIsYearDropdownOpen(false);
    setIsIconPickerOpen(false);
  };

  const toggleYearDropdown = () => {
    setIsYearDropdownOpen((prev) => !prev);
    setIsMonthDropdownOpen(false);
    setIsIconPickerOpen(false);
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const isOtherSelected =
    budgetModalMode === "CREATE" &&
    selectedCategory?.name.toLowerCase().includes("lainnya");

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
        const finalCustomName =
          isOtherSelected && customCategoryName.trim()
            ? customCategoryName.trim()
            : undefined;

        const res = await createBudgetAction({
          categoryId: selectedCategoryId,
          customCategoryName: finalCustomName,
          customCategoryIcon: isOtherSelected ? customCategoryIcon : undefined,
          customCategoryColor: isOtherSelected ? customCategoryColor : undefined,
          amountLimit: currentNumericAmount,
          month,
          year,
        });

        if (res.success) {
          const displayCatName = finalCustomName || selectedCategory?.name || "Kategori";
          toast.success(`Batas anggaran ${displayCatName} berhasil ditetapkan!`);
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

  const SelectedIcon = resolveCategoryIcon(
    editingBudget ? editingBudget.categoryIcon : selectedCategory?.icon
  );
  const categoryColor = editingBudget
    ? editingBudget.categoryColor || "#10B981"
    : selectedCategory?.color || "#10B981";

  const CustomActiveIcon = resolveCategoryIcon(customCategoryIcon);

  // Calculate live preview metrics for edit mode
  const projectedPercent =
    editingBudget && currentNumericAmount > 0
      ? Math.round((editingBudget.spent / currentNumericAmount) * 100)
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 text-foreground animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
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
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-2.5 py-0.5 text-[10px] font-bold text-teal-600 dark:text-teal-400">
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

              {/* Enhanced Container with padding to prevent border & ring clipping */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/30 p-2 max-h-52 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const Icon = resolveCategoryIcon(cat.icon);
                    const isSelected = selectedCategoryId === cat.id;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={cn(
                          "flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer relative",
                          isSelected
                            ? "border-teal-500 bg-teal-500/10 text-teal-900 dark:text-teal-100 ring-1 ring-teal-500 shadow-xs font-semibold"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/70 text-muted-foreground hover:text-foreground"
                        )}
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
                          <Check className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0 ml-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CUSTOM CATEGORY SECTION: When "Pengeluaran Lainnya" is selected */}
              {isOtherSelected && (
                <div className="mt-3 rounded-2xl border border-teal-500/30 bg-teal-500/5 p-4 space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300">
                      <Sparkles className="h-4 w-4 shrink-0" />
                      <span className="text-xs font-bold">
                        Kustomisasi Kategori Pengeluaran
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded-full">
                      Tersimpan Otomatis
                    </span>
                  </div>

                  {/* Manual Title Input */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      Judul / Nama Kategori Kustom
                    </label>
                    <Input
                      type="text"
                      value={customCategoryName}
                      onChange={(e) => setCustomCategoryName(e.target.value)}
                      placeholder="Contoh: Langganan Streaming, Kucing & Pet, Hobi..."
                      className="h-10 text-xs rounded-xl bg-background border-slate-200 dark:border-slate-800"
                    />
                  </div>

                  {/* Icon & Color Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Icon Selection */}
                    <div className="space-y-1.5 relative" ref={iconPickerRef}>
                      <label className="text-[11px] font-semibold text-muted-foreground">
                        Pilih Ikon Kategori
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsIconPickerOpen(!isIconPickerOpen)}
                        className="w-full flex h-10 items-center justify-between px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-background hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs font-semibold text-foreground transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-6 w-6 items-center justify-center rounded-md"
                            style={{
                              backgroundColor: `${customCategoryColor}20`,
                              color: customCategoryColor,
                            }}
                          >
                            <CustomActiveIcon className="h-3.5 w-3.5" />
                          </div>
                          <span className="capitalize">{customCategoryIcon}</span>
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0",
                            isIconPickerOpen && "rotate-180"
                          )}
                        />
                      </button>

                      {/* Icon Selection Popover */}
                      {isIconPickerOpen && (
                        <div className="absolute bottom-full mb-1.5 left-0 z-50 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-3 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1 block">
                            Koleksi Ikon Terkurasi (Lucide)
                          </span>
                          <div className="grid grid-cols-6 gap-1.5 max-h-48 overflow-y-auto p-1">
                            {CURATED_ICONS.map((item) => {
                              const IconComp = item.icon;
                              const isSelectedIcon =
                                customCategoryIcon === item.key;
                              return (
                                <button
                                  key={item.key}
                                  type="button"
                                  onClick={() => {
                                    setCustomCategoryIcon(item.key);
                                    setIsIconPickerOpen(false);
                                  }}
                                  title={item.label}
                                  className={cn(
                                    "flex h-9 w-9 items-center justify-center rounded-xl transition-all cursor-pointer",
                                    isSelectedIcon
                                      ? "bg-teal-500 text-white dark:text-slate-950 font-bold shadow-xs scale-105"
                                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground"
                                  )}
                                >
                                  <IconComp className="h-4 w-4" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Color Palette */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground">
                        Warna Aksen Kategori
                      </label>
                      <div className="flex items-center gap-1.5 h-10 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-background overflow-x-auto">
                        {CURATED_COLORS.map((c) => {
                          const isSelected = customCategoryColor === c.hex;
                          return (
                            <button
                              key={c.hex}
                              type="button"
                              onClick={() => setCustomCategoryColor(c.hex)}
                              title={c.name}
                              className={cn(
                                "h-6 w-6 rounded-full shrink-0 transition-transform cursor-pointer relative flex items-center justify-center",
                                isSelected
                                  ? "scale-110 ring-2 ring-offset-2 ring-teal-500"
                                  : "hover:scale-105 opacity-80 hover:opacity-100"
                              )}
                              style={{ backgroundColor: c.hex }}
                            >
                              {isSelected && (
                                <Check className="h-3 w-3 text-white drop-shadow-xs" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
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

          {/* CUSTOM PROFESSIONAL PERIOD SELECTION (CREATE MODE ONLY) */}
          {budgetModalMode === "CREATE" && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* BULAN TARGET DROPDOWN */}
              <div className="space-y-1.5 relative" ref={monthDropdownRef}>
                <label className="text-xs font-semibold text-muted-foreground">
                  Bulan Target
                </label>
                <button
                  type="button"
                  onClick={toggleMonthDropdown}
                  className={cn(
                    "w-full flex h-10 items-center justify-between px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-background hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs font-semibold text-foreground transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-500",
                    isMonthDropdownOpen && "border-teal-500 ring-1 ring-teal-500 bg-muted/20"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Calendar className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>{MONTH_NAMES[month - 1]}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0",
                      isMonthDropdownOpen && "rotate-180 text-foreground"
                    )}
                  />
                </button>

                {/* Floating Month Menu */}
                {isMonthDropdownOpen && (
                  <div className="absolute bottom-full mb-1.5 left-0 z-50 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-1.5 space-y-0.5 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                    {MONTH_NAMES.map((name, idx) => {
                      const isSelected = month === idx + 1;
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => {
                            setMonth(idx + 1);
                            setIsMonthDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer",
                            isSelected
                              ? "bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300 font-bold"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-foreground"
                          )}
                        >
                          <span>{name}</span>
                          {isSelected && (
                            <Check className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* TAHUN TARGET DROPDOWN */}
              <div className="space-y-1.5 relative" ref={yearDropdownRef}>
                <label className="text-xs font-semibold text-muted-foreground">
                  Tahun Target
                </label>
                <button
                  type="button"
                  onClick={toggleYearDropdown}
                  className={cn(
                    "w-full flex h-10 items-center justify-between px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-background hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs font-semibold text-foreground transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-500",
                    isYearDropdownOpen && "border-teal-500 ring-1 ring-teal-500 bg-muted/20"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <CalendarDays className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>{year}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0",
                      isYearDropdownOpen && "rotate-180 text-foreground"
                    )}
                  />
                </button>

                {/* Floating Year Menu */}
                {isYearDropdownOpen && (
                  <div className="absolute bottom-full mb-1.5 left-0 z-50 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                    {[2025, 2026, 2027].map((yr) => {
                      const isSelected = year === yr;
                      return (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => {
                            setYear(yr);
                            setIsYearDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer",
                            isSelected
                              ? "bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300 font-bold"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-foreground"
                          )}
                        >
                          <span>{yr}</span>
                          {isSelected && (
                            <Check className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
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
