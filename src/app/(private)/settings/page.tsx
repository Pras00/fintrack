"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/theme-provider";
import { getAccountProfile, updateAccountName } from "@/actions/auth";
import { User, Coins } from "lucide-react";

export default function SettingsPage() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getAccountProfile()
      .then((profile) => {
        if (!active || !profile) return;
        setName(profile.name || "");
        setEmail(profile.email || "");
      })
      .catch(() => {
        if (active) toast.error("Gagal memuat profil. Silakan muat ulang halaman.");
      });
    return () => { active = false; };
  }, []);

  async function saveProfile() {
    setIsSaving(true);
    try {
      const result = await updateAccountName(name);
      if (result.success) {
        toast.success(result.message);
        window.dispatchEvent(new CustomEvent("fintrack:profile-updated"));
      }
      else toast.error(result.message);
    } catch {
      toast.error("Gagal memperbarui profil. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <DashboardShell>
      <div className="border-b border-border/50 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Pengaturan Aplikasi</h2>
        <p className="text-xs text-muted-foreground mt-1">Kelola profil dan tampilan akun FinTrack Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-500" /> Profil Pengguna
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Informasi akun yang sedang masuk</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="profile-name" className="block text-xs font-medium text-muted-foreground mb-1">Nama Lengkap</label>
              <Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} className="text-xs" />
            </div>
            <div>
              <label htmlFor="profile-email" className="block text-xs font-medium text-muted-foreground mb-1">Email Terdaftar</label>
              <Input id="profile-email" value={email} readOnly className="text-xs opacity-75" />
            </div>
            <Button size="sm" onClick={saveProfile} disabled={isSaving || !name.trim()} className="h-8 text-xs font-semibold">
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-500" /> Preferensi Regional & Tampilan
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Mata uang dan tema antarmuka</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="block text-xs font-medium text-muted-foreground mb-1">Mata Uang Utama</span>
              <p className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-xs">IDR (Rupiah Indonesia)</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div>
                <span className="text-xs font-semibold text-foreground block">Tema Antarmuka</span>
                <span className="text-[11px] text-muted-foreground">Pilih tampilan atau ikuti sistem</span>
              </div>
              <div className="flex items-center rounded-lg border border-border/70 bg-muted/40 p-1 text-xs">
                {(["system", "light", "dark"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setTheme(option)}
                    className={`rounded-md px-2.5 py-1 font-medium transition-all ${theme === option ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {option === "system" ? `Sistem (${resolvedTheme === "dark" ? "Gelap" : "Terang"})` : option === "light" ? "Terang" : "Gelap"}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
