"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useModalStore, ModalTransactionType } from "@/stores/use-modal-store";
import { formatRupiah } from "@/lib/utils";
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
} from "lucide-react";

interface WalletOption {
  id: string;
  name: string;
  balance: number;
}

interface CategoryOption {
  id: string;
  name: string;
  type: string;
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
          setWalletId((prev) => (prev && data.wallets.some((w) => w.id === prev) ? prev : data.wallets[0].id));
          if (data.wallets.length > 1) {
            setToWalletId((prev) => (prev && data.wallets.some((w) => w.id === prev) ? prev : data.wallets[1].id));
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

  // Keyboard shortcut listener: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        useModalStore.getState().openTransactionModal("EXPENSE");
      } else if (e.key === "Escape" && isTransactionModalOpen) {
        closeTransactionModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTransactionModalOpen, closeTransactionModal]);

  if (!isTransactionModalOpen) return null;

  const rawAmount = parseInt(amountStr.replace(/\D/g, ""), 10) || 0;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = e.target.value.replace(/\D/g, "");
    setAmountStr(numeric ? parseInt(numeric, 10).toLocaleString("id-ID") : "");
  };

  const filteredCategories = categories.filter((c) => c.type === type);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-xl border border-border/80 bg-card p-6 shadow-xl animate-in zoom-in-95 duration-200 cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-foreground">
              Catat Transaksi Finansial
            </span>
            <kbd className="hidden sm:inline-block rounded border border-border/60 bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              Esc untuk tutup
            </kbd>
          </div>
          <button
            onClick={closeTransactionModal}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Transaction Type Segmented Switcher */}
        <div className="mt-4 grid grid-cols-3 gap-1 rounded-lg border border-border/60 bg-muted/30 p-1">
          <button
            type="button"
            onClick={() => setType("EXPENSE")}
            className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-all ${
              type === "EXPENSE"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowDownRight className="h-3.5 w-3.5" />
            Pengeluaran
          </button>

          <button
            type="button"
            onClick={() => setType("INCOME")}
            className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-all ${
              type === "INCOME"
                ? "bg-emerald-500 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            Pemasukan
          </button>

          <button
            type="button"
            onClick={() => setType("TRANSFER")}
            className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-all ${
              type === "TRANSFER"
                ? "bg-sky-500 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            Transfer
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Nominal Input */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Nominal Transaksi (IDR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                Rp
              </span>
              <Input
                type="text"
                autoFocus
                placeholder="0"
                value={amountStr}
                onChange={handleAmountChange}
                className="pl-10 text-lg font-bold tabular-nums"
              />
            </div>
            {rawAmount > 0 && (
              <span className="mt-1 block text-right text-[11px] font-medium text-muted-foreground">
                Terbaca: {formatRupiah(rawAmount)}
              </span>
            )}
          </div>

          {/* Wallets selection */}
          {isLoadingData ? (
            <div className="flex items-center justify-center py-4 text-xs text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
              <span>Memuat data dompet & kategori dari database...</span>
            </div>
          ) : type === "TRANSFER" ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Wallet className="h-3.5 w-3.5 text-sky-400" />
                  Dari Dompet
                </label>
                <select
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  className="w-full rounded-lg border border-border/70 bg-background/80 px-3 py-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatRupiah(w.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <ArrowRightLeft className="h-3.5 w-3.5 text-sky-400" />
                  Ke Dompet Tujuan
                </label>
                <select
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
                  className="w-full rounded-lg border border-border/70 bg-background/80 px-3 py-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {wallets
                    .filter((w) => w.id !== walletId)
                    .map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({formatRupiah(w.balance)})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Wallet className="h-3.5 w-3.5 text-emerald-500" />
                  Sumber Dompet
                </label>
                <select
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  className="w-full rounded-lg border border-border/70 bg-background/80 px-3 py-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatRupiah(w.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5 text-rose-500" />
                  Kategori
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-lg border border-border/70 bg-background/80 px-3 py-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Date & Note */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Tanggal
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                Catatan / Keterangan
              </label>
              <Input
                type="text"
                placeholder="cth: Makan siang Padang, Sate Ayam"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          {/* Footer Action */}
          <div className="mt-5 flex items-center justify-end gap-2 border-t border-border/40 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={closeTransactionModal}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || isLoadingData}
              className={
                type === "INCOME"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : type === "TRANSFER"
                  ? "bg-sky-600 hover:bg-sky-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }
            >
              {isSubmitting ? "Menyimpan ke DB..." : "Simpan Transaksi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
