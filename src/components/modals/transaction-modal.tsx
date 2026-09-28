"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useModalStore, ModalTransactionType } from "@/stores/use-modal-store";
import { formatRupiah, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  createTransactionAction,
  getTransactionFormDataAction,
} from "@/actions/transactions";
import {
  X,
  ArrowDownRight,
  ArrowUpRight,
  ArrowRightLeft,
  Calendar,
  Wallet,
  Tag,
  FileText,
  Loader2,
  ChevronDown,
  Check,
  Building2,
  Smartphone,
  Banknote,
  ChevronLeft,
  ChevronRight,
  Utensils,
  Receipt,
  ShoppingBag,
  Car,
  Gamepad2,
  HeartPulse,
  GraduationCap,
  Briefcase,
  Tv,
  Music,
  Film,
  Ticket,
  Home,
  Baby,
  Wrench,
  Zap,
  Bath,
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
  Bookmark,
  MoreHorizontal,
} from "lucide-react";

interface WalletOption {
  id: string;
  name: string;
  type?: string;
  balance: number;
  color?: string | null;
  icon?: string | null;
}

interface CategoryOption {
  id: string;
  name: string;
  type: string;
  icon?: string | null;
  color?: string | null;
}

const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  utensils: Utensils,
  receipt: Receipt,
  "shopping-bag": ShoppingBag,
  car: Car,
  gamepad2: Gamepad2,
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
  bookmark: Bookmark,
  "more-horizontal": MoreHorizontal,
};

function resolveCategoryIcon(iconName?: string | null) {
  if (!iconName) return Tag;
  return CATEGORY_ICON_MAP[iconName] || Tag;
}

function resolveWalletIcon(type?: string | null, name?: string) {
  const n = (name || "").toLowerCase();
  if (
    n.includes("bca") ||
    n.includes("mandiri") ||
    n.includes("bni") ||
    n.includes("bri") ||
    n.includes("cimb") ||
    n.includes("jago") ||
    n.includes("bank") ||
    type === "BANK"
  ) {
    return Building2;
  }
  if (
    n.includes("gopay") ||
    n.includes("ovo") ||
    n.includes("dana") ||
    n.includes("shopeepay") ||
    n.includes("linkaja") ||
    type === "EWALLET"
  ) {
    return Smartphone;
  }
  if (n.includes("tunai") || n.includes("cash") || type === "CASH") {
    return Banknote;
  }
  return Wallet;
}

const DAYS_HEADER = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const ID_MONTHS_FULL = [
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

function formatDateDisplay(dateStr: string) {
  if (!dateStr) return "Pilih tanggal";
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  const yestStr = `${yest.getFullYear()}-${pad(yest.getMonth() + 1)}-${pad(yest.getDate())}`;

  if (dateStr === todayStr) {
    return `Hari Ini (${d} ${ID_MONTHS_FULL[m - 1].slice(0, 3)})`;
  }
  if (dateStr === yestStr) {
    return `Kemarin (${d} ${ID_MONTHS_FULL[m - 1].slice(0, 3)})`;
  }
  return `${d} ${ID_MONTHS_FULL[m - 1]} ${y}`;
}

export function TransactionModal() {
  const router = useRouter();
  const { isTransactionModalOpen, defaultType, closeTransactionModal } = useModalStore();

  const [type, setType] = useState<ModalTransactionType>(defaultType);
  const [amountStr, setAmountStr] = useState("");
  const [walletId, setWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [wallets, setWallets] = useState<WalletOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Custom Dropdown Open States
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const [isToWalletDropdownOpen, setIsToWalletDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Dropdown Refs
  const walletDropdownRef = useRef<HTMLDivElement>(null);
  const toWalletDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Calendar View month & year navigation
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (date) {
      const [y, m] = date.split("-").map(Number);
      if (y && m) return new Date(y, m - 1, 1);
    }
    return new Date();
  });

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  // Sync viewDate when modal opens or date changes
  useEffect(() => {
    if (date) {
      const [y, m] = date.split("-").map(Number);
      if (y && m) setViewDate(new Date(y, m - 1, 1));
    }
  }, [date, isTransactionModalOpen]);

  // Close all popovers when transaction type switches
  useEffect(() => {
    setIsWalletDropdownOpen(false);
    setIsToWalletDropdownOpen(false);
    setIsCategoryDropdownOpen(false);
    setIsDatePickerOpen(false);
  }, [type]);

  // Click outside listener for all custom popovers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        walletDropdownRef.current &&
        !walletDropdownRef.current.contains(e.target as Node)
      ) {
        setIsWalletDropdownOpen(false);
      }
      if (
        toWalletDropdownRef.current &&
        !toWalletDropdownRef.current.contains(e.target as Node)
      ) {
        setIsToWalletDropdownOpen(false);
      }
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(e.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(e.target as Node)
      ) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch real wallets and categories from NeonDB
  useEffect(() => {
    let isMounted = true;
    async function loadFormData() {
      setIsLoadingData(true);
      try {
        const data = await getTransactionFormDataAction();
        if (!isMounted) return;
        setWallets(data.wallets);
        setCategories(data.categories);

        if (data.wallets.length > 0) {
          setWalletId((prev) =>
            prev && data.wallets.some((w) => w.id === prev) ? prev : data.wallets[0].id
          );
          if (data.wallets.length > 1) {
            setToWalletId((prev) =>
              prev && data.wallets.some((w) => w.id === prev) ? prev : data.wallets[1].id
            );
          }
        }
      } catch (err) {
        console.error("Gagal mengambil data opsi dompet & kategori:", err);
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    }

    if (isTransactionModalOpen) {
      loadFormData();
    }

    return () => {
      isMounted = false;
    };
  }, [isTransactionModalOpen]);

  useEffect(() => {
    setType(defaultType);
  }, [defaultType, isTransactionModalOpen]);

  // Update default selected category based on transaction type
  useEffect(() => {
    const available = categories.filter((c) => c.type === type);
    if (available.length > 0) {
      const match = available.find((c) =>
        type === "EXPENSE" ? c.name.includes("Makanan") : c.name.includes("Gaji")
      );
      setCategoryId(match ? match.id : available[0].id);
    }
  }, [type, categories]);

  // Keyboard shortcut listener: Ctrl+K or Cmd+K & Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        useModalStore.getState().openTransactionModal("EXPENSE");
      } else if (e.key === "Escape" && isTransactionModalOpen) {
        if (
          isWalletDropdownOpen ||
          isToWalletDropdownOpen ||
          isCategoryDropdownOpen ||
          isDatePickerOpen
        ) {
          setIsWalletDropdownOpen(false);
          setIsToWalletDropdownOpen(false);
          setIsCategoryDropdownOpen(false);
          setIsDatePickerOpen(false);
          return;
        }
        closeTransactionModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isTransactionModalOpen,
    closeTransactionModal,
    isWalletDropdownOpen,
    isToWalletDropdownOpen,
    isCategoryDropdownOpen,
    isDatePickerOpen,
  ]);

  // Calendar cells generation for custom date picker
  const calendarCells = useMemo(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    // Monday as index 0 (0: Sun -> 6, 1: Mon -> 0, ..., 6: Sat -> 5)
    const startOffset = (firstDayIndex + 6) % 7;

    const cells: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    // Previous month padding
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      cells.push({
        dateStr: `${prevY}-${pad(prevM + 1)}-${pad(d)}`,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Current month days
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(d)}`;
      cells.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
      });
    }

    // Next month padding to fill clean 35 or 42 grid
    const remaining = (cells.length > 35 ? 42 : 35) - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      cells.push({
        dateStr: `${nextY}-${pad(nextM + 1)}-${pad(d)}`,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const setToday = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    setDate(todayStr);
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setIsDatePickerOpen(false);
  };

  const setYesterday = () => {
    const now = new Date();
    now.setDate(now.getDate() - 1);
    const pad = (n: number) => String(n).padStart(2, "0");
    const yesterdayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    setDate(yesterdayStr);
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setIsDatePickerOpen(false);
  };

  if (!isTransactionModalOpen) return null;

  const rawAmount = parseInt(amountStr.replace(/\D/g, ""), 10) || 0;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = e.target.value.replace(/\D/g, "");
    setAmountStr(numeric ? parseInt(numeric, 10).toLocaleString("id-ID") : "");
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  const selectedWallet = wallets.find((w) => w.id === walletId) || wallets[0];
  const selectedToWallet =
    wallets.find((w) => w.id === toWalletId) ||
    wallets.find((w) => w.id !== walletId) ||
    wallets[0];
  const selectedCategory =
    filteredCategories.find((c) => c.id === categoryId) || filteredCategories[0];

  const toggleWalletDropdown = () => {
    setIsWalletDropdownOpen((prev) => !prev);
    setIsToWalletDropdownOpen(false);
    setIsCategoryDropdownOpen(false);
    setIsDatePickerOpen(false);
  };

  const toggleToWalletDropdown = () => {
    setIsToWalletDropdownOpen((prev) => !prev);
    setIsWalletDropdownOpen(false);
    setIsCategoryDropdownOpen(false);
    setIsDatePickerOpen(false);
  };

  const toggleCategoryDropdown = () => {
    setIsCategoryDropdownOpen((prev) => !prev);
    setIsWalletDropdownOpen(false);
    setIsToWalletDropdownOpen(false);
    setIsDatePickerOpen(false);
  };

  const toggleDatePicker = () => {
    setIsDatePickerOpen((prev) => !prev);
    setIsWalletDropdownOpen(false);
    setIsToWalletDropdownOpen(false);
    setIsCategoryDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rawAmount <= 0) {
      toast.error("Harap masukkan nominal transaksi yang valid (lebih dari 0)");
      return;
    }

    if (!walletId) {
      toast.error("Harap pilih dompet asal transaksi");
      return;
    }

    if (type === "TRANSFER" && walletId === toWalletId) {
      toast.error("Dompet tujuan tidak boleh sama dengan dompet asal");
      return;
    }

    setIsSubmitting(true);
    try {
      const typeLabel =
        type === "INCOME" ? "Pemasukan" : type === "EXPENSE" ? "Pengeluaran" : "Transfer";

      const res = await createTransactionAction({
        amount: rawAmount,
        type: type,
        walletId: walletId,
        toWalletId: type === "TRANSFER" ? toWalletId : undefined,
        categoryId: type !== "TRANSFER" && categoryId ? categoryId : undefined,
        description: description.trim() || undefined,
        date: date,
      });

      if (!res.success) {
        toast.error(res.error || "Gagal menyimpan transaksi ke database");
        return;
      }

      toast.success(`${typeLabel} senilai ${formatRupiah(rawAmount)} berhasil disimpan ke database!`);
      setAmountStr("");
      setDescription("");
      closeTransactionModal();
      router.refresh();
      // Dispatch custom event to notify client components
      window.dispatchEvent(new CustomEvent("fintrack:transaction-created"));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat memproses transaksi";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={closeTransactionModal}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 text-foreground animate-in zoom-in-95 duration-200 cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="text-base font-bold text-foreground">
              Catat Transaksi Finansial
            </span>
            <kbd className="hidden sm:inline-block rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
              Esc untuk tutup
            </kbd>
          </div>
          <button
            type="button"
            onClick={closeTransactionModal}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Transaction Type Segmented Switcher */}
        <div className="mt-4 grid grid-cols-3 gap-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/40 p-1.5">
          <button
            type="button"
            onClick={() => setType("EXPENSE")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer",
              type === "EXPENSE"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-slate-800/60"
            )}
          >
            <ArrowDownRight className="h-3.5 w-3.5" />
            Pengeluaran
          </button>

          <button
            type="button"
            onClick={() => setType("INCOME")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer",
              type === "INCOME"
                ? "bg-emerald-500 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-slate-800/60"
            )}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            Pemasukan
          </button>

          <button
            type="button"
            onClick={() => setType("TRANSFER")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer",
              type === "TRANSFER"
                ? "bg-sky-500 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-slate-800/60"
            )}
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            Transfer
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Nominal Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-muted-foreground">
              Nominal Transaksi (IDR)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                Rp
              </span>
              <Input
                type="text"
                autoFocus
                placeholder="0"
                value={amountStr}
                onChange={handleAmountChange}
                className="pl-11 h-11 text-lg font-bold tabular-nums rounded-xl bg-background border-slate-200 dark:border-slate-800 focus-visible:ring-teal-500"
              />
            </div>
            {rawAmount > 0 && (
              <span className="block text-right text-[11px] font-semibold text-muted-foreground">
                Terbaca: {formatRupiah(rawAmount)}
              </span>
            )}
          </div>

          {/* Wallets & Categories selection */}
          {isLoadingData ? (
            <div className="flex items-center justify-center py-4 text-xs text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
              <span>Memuat data dompet & kategori dari database...</span>
            </div>
          ) : type === "TRANSFER" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Dari Dompet */}
              <div className="space-y-1.5 relative" ref={walletDropdownRef}>
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5 text-sky-500" />
                  <span>Dari Dompet</span>
                </label>
                <button
                  type="button"
                  onClick={toggleWalletDropdown}
                  className={cn(
                    "w-full flex h-10 items-center justify-between px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-background hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs font-semibold text-foreground transition-all cursor-pointer",
                    isWalletDropdownOpen && "border-teal-500 ring-1 ring-teal-500 bg-muted/20"
                  )}
                >
                  {selectedWallet ? (
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-lg shrink-0"
                        style={{
                          backgroundColor: `${selectedWallet.color || "#0EA5E9"}20`,
                          color: selectedWallet.color || "#0EA5E9",
                        }}
                      >
                        {(() => {
                          const Icon = resolveWalletIcon(selectedWallet.type, selectedWallet.name);
                          return <Icon className="h-3.5 w-3.5" />;
                        })()}
                      </div>
                      <span className="truncate">{selectedWallet.name}</span>
                      <span className="text-[10px] text-muted-foreground font-normal truncate">
                        ({formatRupiah(selectedWallet.balance)})
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Pilih Dompet...</span>
                  )}
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ml-1.5",
                      isWalletDropdownOpen && "rotate-180 text-foreground"
                    )}
                  />
                </button>

                {/* Custom Dari Dompet Popover Menu */}
                {isWalletDropdownOpen && (
                  <div className="absolute top-full mt-1.5 left-0 z-50 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-1.5 space-y-0.5 max-h-56 overflow-y-auto [scrollbar-width:thin] animate-in fade-in zoom-in-95 duration-150">
                    {wallets.map((w) => {
                      const isSelected = w.id === walletId;
                      const Icon = resolveWalletIcon(w.type, w.name);
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => {
                            setWalletId(w.id);
                            setIsWalletDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left",
                            isSelected
                              ? "bg-sky-50 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300 font-semibold"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div
                              className="flex h-6 w-6 items-center justify-center rounded-lg shrink-0"
                              style={{
                                backgroundColor: `${w.color || "#0EA5E9"}20`,
                                color: w.color || "#0EA5E9",
                              }}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="truncate">
                              <span className="block truncate">{w.name}</span>
                              <span className="text-[10px] text-muted-foreground block font-normal">
                                {formatRupiah(w.balance)}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0 ml-1.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Ke Dompet Tujuan */}
              <div className="space-y-1.5 relative" ref={toWalletDropdownRef}>
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <ArrowRightLeft className="h-3.5 w-3.5 text-sky-500" />
                  <span>Ke Dompet Tujuan</span>
                </label>
                <button
                  type="button"
                  onClick={toggleToWalletDropdown}
                  className={cn(
                    "w-full flex h-10 items-center justify-between px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-background hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs font-semibold text-foreground transition-all cursor-pointer",
                    isToWalletDropdownOpen && "border-teal-500 ring-1 ring-teal-500 bg-muted/20"
                  )}
                >
                  {selectedToWallet ? (
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-lg shrink-0"
                        style={{
                          backgroundColor: `${selectedToWallet.color || "#0EA5E9"}20`,
                          color: selectedToWallet.color || "#0EA5E9",
                        }}
                      >
                        {(() => {
                          const Icon = resolveWalletIcon(selectedToWallet.type, selectedToWallet.name);
                          return <Icon className="h-3.5 w-3.5" />;
                        })()}
                      </div>
                      <span className="truncate">{selectedToWallet.name}</span>
                      <span className="text-[10px] text-muted-foreground font-normal truncate">
                        ({formatRupiah(selectedToWallet.balance)})
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Pilih Dompet Tujuan...</span>
                  )}
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ml-1.5",
                      isToWalletDropdownOpen && "rotate-180 text-foreground"
                    )}
                  />
                </button>

                {/* Custom Ke Dompet Tujuan Popover Menu */}
                {isToWalletDropdownOpen && (
                  <div className="absolute top-full mt-1.5 left-0 z-50 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-1.5 space-y-0.5 max-h-56 overflow-y-auto [scrollbar-width:thin] animate-in fade-in zoom-in-95 duration-150">
                    {wallets
                      .filter((w) => w.id !== walletId)
                      .map((w) => {
                        const isSelected = w.id === toWalletId;
                        const Icon = resolveWalletIcon(w.type, w.name);
                        return (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => {
                              setToWalletId(w.id);
                              setIsToWalletDropdownOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left",
                              isSelected
                                ? "bg-sky-50 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300 font-semibold"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                            )}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <div
                                className="flex h-6 w-6 items-center justify-center rounded-lg shrink-0"
                                style={{
                                  backgroundColor: `${w.color || "#0EA5E9"}20`,
                                  color: w.color || "#0EA5E9",
                                }}
                              >
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              <div className="truncate">
                                <span className="block truncate">{w.name}</span>
                                <span className="text-[10px] text-muted-foreground block font-normal">
                                  {formatRupiah(w.balance)}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0 ml-1.5" />
                            )}
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Sumber Dompet */}
              <div className="space-y-1.5 relative" ref={walletDropdownRef}>
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Sumber Dompet</span>
                </label>
                <button
                  type="button"
                  onClick={toggleWalletDropdown}
                  className={cn(
                    "w-full flex h-10 items-center justify-between px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-background hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs font-semibold text-foreground transition-all cursor-pointer",
                    isWalletDropdownOpen && "border-teal-500 ring-1 ring-teal-500 bg-muted/20"
                  )}
                >
                  {selectedWallet ? (
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-lg shrink-0"
                        style={{
                          backgroundColor: `${selectedWallet.color || "#10B981"}20`,
                          color: selectedWallet.color || "#10B981",
                        }}
                      >
                        {(() => {
                          const Icon = resolveWalletIcon(selectedWallet.type, selectedWallet.name);
                          return <Icon className="h-3.5 w-3.5" />;
                        })()}
                      </div>
                      <span className="truncate">{selectedWallet.name}</span>
                      <span className="text-[10px] text-muted-foreground font-normal truncate">
                        ({formatRupiah(selectedWallet.balance)})
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Pilih Dompet...</span>
                  )}
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ml-1.5",
                      isWalletDropdownOpen && "rotate-180 text-foreground"
                    )}
                  />
                </button>

                {/* Custom Sumber Dompet Popover Menu */}
                {isWalletDropdownOpen && (
                  <div className="absolute top-full mt-1.5 left-0 z-50 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-1.5 space-y-0.5 max-h-56 overflow-y-auto [scrollbar-width:thin] animate-in fade-in zoom-in-95 duration-150">
                    {wallets.map((w) => {
                      const isSelected = w.id === walletId;
                      const Icon = resolveWalletIcon(w.type, w.name);
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => {
                            setWalletId(w.id);
                            setIsWalletDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left",
                            isSelected
                              ? "bg-teal-50 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300 font-semibold"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div
                              className="flex h-6 w-6 items-center justify-center rounded-lg shrink-0"
                              style={{
                                backgroundColor: `${w.color || "#10B981"}20`,
                                color: w.color || "#10B981",
                              }}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="truncate">
                              <span className="block truncate">{w.name}</span>
                              <span className="text-[10px] text-muted-foreground block font-normal">
                                {formatRupiah(w.balance)}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 ml-1.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Kategori */}
              <div className="space-y-1.5 relative" ref={categoryDropdownRef}>
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-rose-500" />
                  <span>Kategori</span>
                </label>
                <button
                  type="button"
                  onClick={toggleCategoryDropdown}
                  className={cn(
                    "w-full flex h-10 items-center justify-between px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-background hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs font-semibold text-foreground transition-all cursor-pointer",
                    isCategoryDropdownOpen && "border-teal-500 ring-1 ring-teal-500 bg-muted/20"
                  )}
                >
                  {selectedCategory ? (
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-lg shrink-0"
                        style={{
                          backgroundColor: `${selectedCategory.color || "#10B981"}20`,
                          color: selectedCategory.color || "#10B981",
                        }}
                      >
                        {(() => {
                          const Icon = resolveCategoryIcon(selectedCategory.icon);
                          return <Icon className="h-3.5 w-3.5" />;
                        })()}
                      </div>
                      <span className="truncate">{selectedCategory.name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Pilih Kategori...</span>
                  )}
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ml-1.5",
                      isCategoryDropdownOpen && "rotate-180 text-foreground"
                    )}
                  />
                </button>

                {/* Custom Kategori Popover Menu */}
                {isCategoryDropdownOpen && (
                  <div className="absolute top-full mt-1.5 left-0 z-50 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-1.5 space-y-0.5 max-h-56 overflow-y-auto [scrollbar-width:thin] animate-in fade-in zoom-in-95 duration-150">
                    {filteredCategories.map((cat) => {
                      const isSelected = cat.id === categoryId;
                      const Icon = resolveCategoryIcon(cat.icon);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setCategoryId(cat.id);
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left",
                            isSelected
                              ? "bg-teal-50 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300 font-semibold"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div
                              className="flex h-6 w-6 items-center justify-center rounded-lg shrink-0"
                              style={{
                                backgroundColor: `${cat.color || "#10B981"}20`,
                                color: cat.color || "#10B981",
                              }}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <span className="truncate">{cat.name}</span>
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 ml-1.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Date & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Custom Date Picker */}
            <div className="space-y-1.5 relative" ref={datePickerRef}>
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-teal-500" />
                <span>Tanggal</span>
              </label>
              <button
                type="button"
                onClick={toggleDatePicker}
                className={cn(
                  "w-full flex h-10 items-center justify-between px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-background hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs font-semibold text-foreground transition-all cursor-pointer",
                  isDatePickerOpen && "border-teal-500 ring-1 ring-teal-500 bg-muted/20"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <Calendar className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span className="truncate">{formatDateDisplay(date)}</span>
                </div>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ml-1.5",
                    isDatePickerOpen && "rotate-180 text-foreground"
                  )}
                />
              </button>

              {/* Custom Date Picker Popover (Floats Above) */}
              {isDatePickerOpen && (
                <div className="absolute bottom-full mb-1.5 left-0 z-50 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-3.5 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                  {/* Month & Year Navigation */}
                  <div className="flex items-center justify-between px-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs font-bold text-foreground">
                      {ID_MONTHS_FULL[viewMonth]} {viewYear}
                    </span>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground transition-colors cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Day Names Header */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {DAYS_HEADER.map((day) => (
                      <span
                        key={day}
                        className="text-[10px] font-bold uppercase text-muted-foreground/70"
                      >
                        {day}
                      </span>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarCells.map((cell) => {
                      const isSelected = cell.dateStr === date;
                      return (
                        <button
                          key={cell.dateStr}
                          type="button"
                          onClick={() => {
                            setDate(cell.dateStr);
                            setIsDatePickerOpen(false);
                          }}
                          className={cn(
                            "h-7 w-7 text-xs rounded-lg flex items-center justify-center transition-all cursor-pointer",
                            isSelected
                              ? "bg-teal-600 dark:bg-teal-500 text-white dark:text-slate-950 font-bold shadow-xs scale-105"
                              : cell.isCurrentMonth
                              ? "text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                              : "text-muted-foreground/30 hover:bg-slate-50 dark:hover:bg-slate-800/40",
                            cell.isToday &&
                              !isSelected &&
                              "border border-teal-500/50 text-teal-600 dark:text-teal-400 font-semibold"
                          )}
                        >
                          {cell.dayNumber}
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Shortcuts */}
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2 text-[11px]">
                    <button
                      type="button"
                      onClick={setYesterday}
                      className="text-muted-foreground hover:text-foreground font-medium px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Kemarin
                    </button>
                    <button
                      type="button"
                      onClick={setToday}
                      className="text-teal-600 dark:text-teal-400 font-bold px-2 py-0.5 rounded-md hover:bg-teal-50 dark:hover:bg-teal-500/10 transition-colors cursor-pointer"
                    >
                      Hari Ini
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Catatan / Keterangan */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Catatan / Keterangan</span>
              </label>
              <Input
                type="text"
                placeholder="cth: Makan siang Padang, Sate Ayam"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-10 text-xs rounded-xl bg-background border-slate-200 dark:border-slate-800 focus-visible:ring-teal-500"
              />
            </div>
          </div>

          {/* Footer Action */}
          <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800/80 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={closeTransactionModal}
              disabled={isSubmitting}
              className="h-10 rounded-xl px-4 text-xs font-semibold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoadingData || rawAmount <= 0}
              className={cn(
                "h-10 rounded-xl px-5 text-xs font-bold gap-2 text-white shadow-xs transition-all cursor-pointer",
                type === "INCOME"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : type === "TRANSFER"
                  ? "bg-sky-600 hover:bg-sky-700"
                  : "bg-rose-600 hover:bg-rose-700"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan ke DB...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Simpan Transaksi</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
