"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/components/theme-provider";
import {
  Settings as SettingsIcon,
  Database,
  User,
  Shield,
  Coins,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function SettingsPage() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <DashboardShell>
      {/* Header */}
      <div className="border-b border-border/50 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Pengaturan Aplikasi
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Konfigurasi preferensi profil, konektivitas database NeonDB, dan keamanan akun
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Profil Pengguna */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-500" />
              Profil Pengguna
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Informasi identitas akun FinTrack
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Nama Lengkap
              </label>
              <Input defaultValue="Prasz" className="text-xs" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Email Terdaftar
              </label>
              <Input defaultValue="user@fintrack.id" disabled className="text-xs opacity-75" />
            </div>
            <Button size="sm" className="h-8 text-xs font-semibold">
              Simpan Perubahan
            </Button>
          </CardContent>
        </Card>

        {/* 2. Preferensi Mata Uang & Tampilan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-500" />
              Preferensi Regional & Tampilan
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Mata uang default dan tema antarmuka
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Mata Uang Utama
              </label>
              <select className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="IDR">IDR (Rupiah Indonesia) - Standar</option>
                <option value="USD" disabled>USD (US Dollar) - Mendatang</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div>
                <span className="text-xs font-semibold text-foreground block">
                  Tema Antarmuka
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Pilih mode tampilan atau ikuti default sistem
                </span>
              </div>
              <div className="flex items-center rounded-lg border border-border/70 bg-muted/40 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                    theme === "system"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sistem ({resolvedTheme === "dark" ? "Gelap" : "Terang"})
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                    theme === "light"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Terang
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                    theme === "dark"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Gelap
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Konektivitas NeonDB Serverless */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-500" />
              Status Koneksi Database Cloud (Neon PostgreSQL)
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Detail integrasi database serverless yang aktif saat ini
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <span className="text-[10px] text-muted-foreground block font-medium uppercase">
                  Status Jaringan
                </span>
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Terhubung & Terenkripsi SSL
                </span>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <span className="text-[10px] text-muted-foreground block font-medium uppercase">
                  Region Server
                </span>
                <span className="text-xs font-bold text-foreground mt-0.5 block">
                  AWS Asia Pacific (ap-southeast-1)
                </span>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <span className="text-[10px] text-muted-foreground block font-medium uppercase">
                  Mode Koneksi
                </span>
                <span className="text-xs font-bold text-sky-400 mt-0.5 block">
                  PgBouncer Serverless Pooling
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
