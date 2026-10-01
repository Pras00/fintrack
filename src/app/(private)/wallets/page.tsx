"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/lib/utils";
import { useModalStore } from "@/stores/use-modal-store";
import { createWalletAction, deleteWalletAction, getWalletsAction, updateWalletAction, type WalletSummary } from "@/actions/wallets";
import type { WalletType } from "@/types";
import { toast } from "sonner";
import {
  Plus,
  ArrowRightLeft,
  Building2,
  Smartphone,
  Coins,
  Loader2,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  Check,
  TrendingUp,
  Wallet,
} from "lucide-react";

interface DisplayWallet extends WalletSummary {
  typeLabel: string;
  iconComp: React.ComponentType<{ className?: string }>;
  color: string;
}

const walletTypes: { value: WalletType; label: string; description: string }[] = [
  { value: "BANK", label: "Rekening bank", description: "Tabungan dan rekening" },
  { value: "EWALLET", label: "Dompet digital", description: "Saldo aplikasi pembayaran" },
  { value: "CASH", label: "Tunai", description: "Uang tunai yang dicatat" },
  { value: "INVESTMENT", label: "Investasi", description: "Aset dan investasi" },
  { value: "OTHER", label: "Lainnya", description: "Jenis dompet lainnya" },
];

function walletTypeIcon(value: WalletType, className: string) {
  switch (value) {
    case "BANK": return <Building2 className={className} />;
    case "EWALLET": return <Smartphone className={className} />;
    case "CASH": return <Coins className={className} />;
    case "INVESTMENT": return <TrendingUp className={className} />;
    default: return <Wallet className={className} />;
  }
}

function mapWalletDisplay(rawWallets: WalletSummary[]): DisplayWallet[] {
  return rawWallets.map((w) => {
    const iconComp = w.type === "EWALLET" ? Smartphone : w.type === "CASH" ? Coins : Building2;
    const color = w.type === "EWALLET" ? "from-emerald-600 to-teal-800" : w.type === "CASH" ? "from-slate-700 to-slate-900" : "from-blue-600 to-indigo-800";

    return {
      ...w,
      typeLabel: walletTypes.find((item) => item.value === w.type)?.label || "Dompet",
      iconComp,
      color,
    };
  });
}

export default function WalletsPage() {
  const { openTransactionModal } = useModalStore();
  const [wallets, setWallets] = useState<DisplayWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editor, setEditor] = useState<{ mode: "create" | "edit"; walletId?: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DisplayWallet | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<WalletType>("BANK");
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const typeTriggerRef = useRef<HTMLButtonElement>(null);
  const typeOptionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const loadWallets = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getWalletsAction();
      if (!result.success) throw new Error(result.error);
      setWallets(mapWalletDisplay(result.data || []));
    } catch (err) {
      console.error("Gagal memuat daftar dompet:", err);
      toast.error("Gagal memuat daftar dompet.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(loadWallets);

    const handleCreated = () => {
      loadWallets();
    };

    window.addEventListener("fintrack:transaction-created", handleCreated);
    return () => {
      window.removeEventListener("fintrack:transaction-created", handleCreated);
    };
  }, [loadWallets]);

  useEffect(() => {
    if (!editor && !deleteTarget) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || isSubmitting) return;
      setEditor(null);
      setDeleteTarget(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [editor, deleteTarget, isSubmitting]);

  useEffect(() => {
    if (!isTypeOpen) return;
    typeOptionRefs.current[walletTypes.findIndex((option) => option.value === type)]?.focus();
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!typeDropdownRef.current?.contains(event.target as Node)) setIsTypeOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [isTypeOpen, type]);

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  function openCreate() {
    setName("");
    setType("BANK");
    setIsTypeOpen(false);
    setEditor({ mode: "create" });
  }

  function openEdit(wallet: DisplayWallet) {
    setName(wallet.name);
    setType(wallet.type);
    setIsTypeOpen(false);
    setEditor({ mode: "edit", walletId: wallet.id });
  }

  function selectType(value: WalletType) {
    setType(value);
    setIsTypeOpen(false);
    typeTriggerRef.current?.focus();
  }

  function handleTypeKeys(event: React.KeyboardEvent<HTMLDivElement>) {
    const focused = typeOptionRefs.current.findIndex((option) => option === document.activeElement);
    const current = focused >= 0 ? focused : walletTypes.findIndex((option) => option.value === type);
    if (event.key === "Escape") {
      event.stopPropagation();
      setIsTypeOpen(false);
      typeTriggerRef.current?.focus();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const next = (current + (event.key === "ArrowDown" ? 1 : -1) + walletTypes.length) % walletTypes.length;
      typeOptionRefs.current[next]?.focus();
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      typeOptionRefs.current[event.key === "Home" ? 0 : walletTypes.length - 1]?.focus();
    }
  }

  async function saveWallet(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = editor.mode === "create"
        ? await createWalletAction({ name, type })
        : await updateWalletAction({ id: editor.walletId || "", name, type });
      if (!result.success) {
        toast.error(result.error || "Gagal menyimpan dompet.");
        return;
      }
      toast.success(editor.mode === "create" ? "Dompet berhasil ditambahkan." : "Dompet berhasil diperbarui.");
      setEditor(null);
      await loadWallets();
      window.dispatchEvent(new CustomEvent("fintrack:wallet-updated"));
    } catch {
      toast.error("Gagal menyimpan dompet. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function removeWallet() {
    if (!deleteTarget || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await deleteWalletAction(deleteTarget.id);
      if (!result.success) {
        toast.error(result.error || "Gagal menghapus dompet.");
        return;
      }
      toast.success("Dompet berhasil dihapus.");
      setDeleteTarget(null);
      await loadWallets();
      window.dispatchEvent(new CustomEvent("fintrack:wallet-updated"));
    } catch {
      toast.error("Gagal menghapus dompet. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DashboardShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Manajemen Dompet & Rekening
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Kelola seluruh rekening bank, e-wallet, dan kas tunai Anda dalam satu sistem tersentralisasi
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadWallets}
            disabled={isLoading}
            className="h-10 rounded-xl px-3 text-xs font-medium gap-1.5 shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => openTransactionModal("TRANSFER")}
            className="h-10 rounded-xl px-4 text-xs font-semibold gap-2 shadow-xs"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Transfer Dana
          </Button>
          <Button
            onClick={openCreate}
            className="h-10 rounded-xl px-4.5 text-xs font-semibold gap-2 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Tambah Dompet Baru
          </Button>
        </div>
      </div>

      {/* Aggregate Banner */}
      <Card className="border-border/80 bg-gradient-to-r from-card via-card to-muted/30">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Saldo Tercatat
            </span>
            <div className="mt-1 text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
              {isLoading ? "Memuat..." : formatRupiah(totalBalance)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Tersebar di {wallets.length} instrumen keuangan aktif
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3.5 py-2 text-xs text-muted-foreground self-start sm:self-auto">
            <span>Saldo berdasarkan transaksi yang Anda catat</span>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Cards Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
          <span className="text-xs">Mengambil saldo dompet dari database...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wallets.length === 0 && (
            <Card className="md:col-span-2 border-dashed border-border/80 bg-card/60">
              <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                <p className="text-sm font-semibold">Belum ada dompet</p>
                <p className="text-xs text-muted-foreground">Tambahkan rekening atau dompet untuk mulai mencatat transaksi.</p>
                <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Tambah Dompet</Button>
              </CardContent>
            </Card>
          )}
          {wallets.map((wallet) => {
            const Icon = wallet.iconComp;
            return (
              <Card
                key={wallet.id}
                className="group relative overflow-hidden border-border/80 bg-card hover:border-teal-500/40 hover:shadow-md transition-all duration-200"
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${wallet.color} text-white shadow-xs`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">
                          {wallet.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          {wallet.typeLabel}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-border/40 pt-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <span className="text-[11px] text-muted-foreground block font-medium">
                        Saldo Tercatat
                      </span>
                      <span className="text-xl font-bold tracking-tight text-foreground tabular-nums">
                        {formatRupiah(wallet.balance)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 self-end">
                      <Button variant="outline" size="sm" onClick={() => openEdit(wallet)} className="h-8 gap-1.5" aria-label={`Ubah ${wallet.name}`}>
                        <Pencil className="h-3.5 w-3.5" /> Ubah
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setDeleteTarget(wallet)} className="h-8 gap-1.5 text-rose-600 hover:text-rose-700" aria-label={`Hapus ${wallet.name}`}>
                        <Trash2 className="h-3.5 w-3.5" /> Hapus
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {editor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/55" onClick={() => !isSubmitting && setEditor(null)} aria-label="Tutup formulir dompet" />
          <div role="dialog" aria-modal="true" aria-labelledby="wallet-editor-title" className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 id="wallet-editor-title" className="text-lg font-bold">{editor.mode === "create" ? "Tambah Dompet Baru" : "Ubah Dompet"}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{editor.mode === "create" ? "Dompet baru dimulai dengan saldo Rp0." : "Saldo dan riwayat transaksi tidak berubah."}</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setEditor(null)} disabled={isSubmitting} aria-label="Tutup">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={saveWallet} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="wallet-name" className="text-xs font-semibold">Nama Dompet</label>
                <Input id="wallet-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} placeholder="Contoh: Rekening Gaji" autoFocus required />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="wallet-type" className="text-xs font-semibold">Jenis Dompet</label>
                <div ref={typeDropdownRef} className="relative">
                  <button
                    ref={typeTriggerRef}
                    id="wallet-type"
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isTypeOpen}
                    aria-controls={isTypeOpen ? "wallet-type-options" : undefined}
                    onClick={() => setIsTypeOpen((open) => !open)}
                    className={`flex h-11 w-full items-center gap-3 rounded-xl border bg-background px-3 text-left text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${isTypeOpen ? "border-teal-500 ring-2 ring-teal-500/20" : "border-border/70 hover:border-teal-500/50"}`}
                  >
                    {walletTypeIcon(type, "h-4 w-4 text-teal-600 dark:text-teal-400")}
                    <span className="flex-1 font-medium">{walletTypes.find((option) => option.value === type)?.label}</span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isTypeOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isTypeOpen && (
                    <div id="wallet-type-options" role="listbox" aria-label="Jenis dompet" onKeyDown={handleTypeKeys} className="absolute z-20 mt-2 max-h-52 w-full overflow-y-auto overscroll-contain rounded-xl border border-border bg-popover p-1.5 shadow-xl [scrollbar-width:thin]">
                      {walletTypes.map((option, index) => {
                        const selected = type === option.value;
                        return (
                          <button
                            key={option.value}
                            ref={(element) => { typeOptionRefs.current[index] = element; }}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            onClick={() => selectType(option.value)}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${selected ? "bg-teal-500/10 text-foreground" : "text-foreground hover:bg-muted/70"}`}
                          >
                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-teal-500/15 text-teal-600 dark:text-teal-400" : "bg-muted text-muted-foreground"}`}>{walletTypeIcon(option.value, "h-4 w-4")}</span>
                            <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{option.label}</span><span className="block text-xs text-muted-foreground">{option.description}</span></span>
                            {selected && <Check className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditor(null)} disabled={isSubmitting}>Batal</Button>
                <Button type="submit" disabled={isSubmitting || !name.trim()} className="gap-2">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {editor.mode === "create" ? "Tambah Dompet" : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/55" onClick={() => !isSubmitting && setDeleteTarget(null)} aria-label="Batal hapus dompet" />
          <div role="alertdialog" aria-modal="true" aria-labelledby="wallet-delete-title" aria-describedby="wallet-delete-description" className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 id="wallet-delete-title" className="text-lg font-bold">Hapus {deleteTarget.name}?</h3>
            <p id="wallet-delete-description" className="mt-2 text-sm text-muted-foreground">
              {deleteTarget.balance !== 0
                ? "Saldo dompet masih belum nol. Pindahkan atau catat saldo terlebih dahulu sebelum menghapusnya."
                : "Dompet hanya dapat dihapus jika belum memiliki riwayat transaksi."}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isSubmitting}>Batal</Button>
              <Button variant="destructive" onClick={removeWallet} disabled={isSubmitting || deleteTarget.balance !== 0} className="gap-2">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Hapus Dompet
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
