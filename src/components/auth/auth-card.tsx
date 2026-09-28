"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  Check,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { loginUser, registerUser } from "@/actions/auth";
import { LoginInput, RegisterInput } from "@/lib/validations/auth";
import { LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  initialTab?: "login" | "register";
}

export function AuthCard({ initialTab = "login" }: AuthCardProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">(initialTab);
  const [isPending, startTransition] = useTransition();

  // Form states - Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Form states - Register
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  // General error state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password validation checks for Register
  const hasMinLength = regPassword.length >= 8;
  const hasLetter = /[A-Za-z]/.test(regPassword);
  const hasNumber = /[0-9]/.test(regPassword);
  const passwordsMatch = regPassword.length > 0 && regPassword === regConfirmPassword;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const payload: LoginInput = {
      email: loginEmail,
      password: loginPassword,
    };

    startTransition(async () => {
      const res = await loginUser(payload);
      if (!res.success) {
        setErrorMessage(res.message || "Gagal masuk ke akun.");
        toast.error(res.message || "Gagal masuk.");
      } else {
        toast.success(res.message || "Berhasil masuk!");
        router.push("/");
        router.refresh();
      }
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const payload: RegisterInput = {
      name: regName,
      email: regEmail,
      password: regPassword,
      confirmPassword: regConfirmPassword,
    };

    startTransition(async () => {
      const res = await registerUser(payload);
      if (!res.success) {
        setErrorMessage(res.message || "Gagal mendaftar.");
        toast.error(res.message || "Pendaftaran gagal.");
      } else {
        toast.success(res.message || "Akun berhasil dibuat!");
        router.push("/");
        router.refresh();
      }
    });
  };

  const handleSelectDemo = (email: string, pass: string = "password123", name: string = "Demo") => {
    setTab("login");
    setLoginEmail(email);
    setLoginPassword(pass);
    setErrorMessage(null);
    toast.info(`Akun demo ${name} dipilih.`);
  };

  return (
    <div className="relative w-full max-w-md rounded-3xl border border-border/80 bg-card/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 sm:p-7 shadow-xl shadow-slate-900/5 dark:shadow-teal-950/20 overflow-hidden">
      {/* Top Accent Gradient Line */}
      <div className="absolute top-0 inset-x-8 h-1 bg-gradient-to-r from-teal-500 via-sky-500 to-emerald-400 rounded-t-full" />

      {/* Center Top Emblem & Title Header */}
      <div className="flex flex-col items-center text-center">
        {/* Logo Emblem with Glow */}
        <div className="relative mb-2.5 flex items-center justify-center">
          <div className="absolute -inset-1 rounded-2xl bg-teal-500/20 blur-md pointer-events-none" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F172A] border border-slate-700/60 shadow-md">
            <LogoMark size={32} />
          </div>
        </div>

        {/* Security / Portal Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
          <ShieldCheck className="h-3 w-3 text-teal-600 dark:text-teal-400" />
          <span>FinTrack Core • Keamanan Akun</span>
        </div>

        {/* Header Heading */}
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-2.5">
          {tab === "login" ? "Selamat Datang" : "Daftar Akun Baru"}
        </h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
          {tab === "login"
            ? "Masuk untuk memantau performa mutasi dan arus kas Anda"
            : "Mulai perjalanan finansial mandiri dan terencana hari ini"}
        </p>
      </div>

      {/* Segmented Tab Switcher */}
      <div className="grid grid-cols-2 rounded-xl border border-border/70 bg-muted/40 p-1 text-xs font-semibold my-4">
        <button
          type="button"
          onClick={() => {
            setTab("login");
            setErrorMessage(null);
          }}
          className={cn(
            "rounded-lg py-1.5 transition-all cursor-pointer text-center",
            tab === "login"
              ? "bg-background text-foreground shadow-xs font-bold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Masuk
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("register");
            setErrorMessage(null);
          }}
          className={cn(
            "rounded-lg py-1.5 transition-all cursor-pointer text-center",
            tab === "register"
              ? "bg-background text-foreground shadow-xs font-bold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Daftar Akun
        </button>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-3.5 flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-2.5 text-xs text-rose-500 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* LOGIN FORM */}
      {tab === "login" && (
        <form onSubmit={handleLogin} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground block">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                placeholder="Contoh: user@fintrack.id"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full h-10.5 rounded-xl border border-border/80 bg-background/60 pl-10 pr-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground block">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type={showLoginPassword ? "text" : "password"}
                required
                placeholder="Masukkan kata sandi"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full h-10.5 rounded-xl border border-border/80 bg-background/60 pl-10 pr-10 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none cursor-pointer"
                tabIndex={-1}
              >
                {showLoginPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-10.5 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 hover:shadow-teal-600/30 transition-all cursor-pointer disabled:opacity-50 mt-1"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* REGISTER FORM */}
      {tab === "register" && (
        <form onSubmit={handleRegister} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground block">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                required
                placeholder="Contoh: Pratama Surya"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full h-10 rounded-xl border border-border/80 bg-background/60 pl-10 pr-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground block">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full h-10 rounded-xl border border-border/80 bg-background/60 pl-10 pr-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground block">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type={showRegPassword ? "text" : "password"}
                required
                placeholder="Minimal 8 karakter"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full h-10 rounded-xl border border-border/80 bg-background/60 pl-10 pr-10 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowRegPassword(!showRegPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none cursor-pointer"
                tabIndex={-1}
              >
                {showRegPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground block">
              Konfirmasi Kata Sandi
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type={showRegPassword ? "text" : "password"}
                required
                placeholder="Ulangi kata sandi"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                className="w-full h-10 rounded-xl border border-border/80 bg-background/60 pl-10 pr-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
            </div>
          </div>

          {/* Password Validation Checklist */}
          <div className="space-y-1 py-0.5 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px]",
                  hasMinLength
                    ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Check className="h-2.5 w-2.5" />
              </span>
              <span>Minimal 8 karakter</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px]",
                  hasLetter && hasNumber
                    ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Check className="h-2.5 w-2.5" />
              </span>
              <span>Kombinasi huruf dan angka</span>
            </div>
            {regConfirmPassword.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px]",
                    passwordsMatch
                      ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold"
                  )}
                >
                  <Check className="h-2.5 w-2.5" />
                </span>
                <span
                  className={
                    passwordsMatch
                      ? "text-teal-600 dark:text-teal-400 font-medium"
                      : "text-rose-600 dark:text-rose-400 font-medium"
                  }
                >
                  {passwordsMatch ? "Konfirmasi cocok" : "Konfirmasi tidak cocok"}
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending || !hasMinLength || !hasLetter || !hasNumber || !passwordsMatch}
            className="w-full h-10.5 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 hover:shadow-teal-600/30 transition-all cursor-pointer disabled:opacity-50 mt-1"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Membuat Akun...</span>
              </>
            ) : (
              <>
                <span>Daftar Akun Baru</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* QUICK DEMO ACCOUNT SELECTOR (Like Reference) */}
      <div className="mt-4 pt-3 border-t border-border/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <div className="flex items-center gap-1.5 font-medium text-foreground/80">
            <UserCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>Pilih Akun Demo</span>
          </div>
          <span className="text-[11px] text-muted-foreground">Klik untuk isi otomatis</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Demo User 1: Prasz (UTAMA) */}
          <button
            type="button"
            onClick={() => handleSelectDemo("user@fintrack.id", "password123", "Prasz")}
            className="flex flex-col text-left p-2 rounded-xl border border-border/70 hover:border-teal-500/50 bg-background/50 hover:bg-teal-500/5 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400">
                Prasz
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                UTAMA
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate w-full">
              user@fintrack.id
            </span>
          </button>

          {/* Demo User 2: Akun Tamu */}
          <button
            type="button"
            onClick={() => handleSelectDemo("demo@fintrack.id", "password123", "Akun Tamu")}
            className="flex flex-col text-left p-2 rounded-xl border border-border/70 hover:border-teal-500/50 bg-background/50 hover:bg-teal-500/5 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400">
                Akun Tamu
              </span>
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                AUDIT
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate w-full">
              demo@fintrack.id
            </span>
          </button>
        </div>
      </div>

      {/* Switch Tab Link & Terms */}
      <div className="mt-3.5 pt-2.5 border-t border-border/40 text-center space-y-1.5">
        <p className="text-xs text-muted-foreground">
          {tab === "login" ? (
            <>
              Belum punya akun?{" "}
              <button
                type="button"
                onClick={() => {
                  setTab("register");
                  setErrorMessage(null);
                }}
                className="font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
              >
                Daftar sekarang
              </button>
            </>
          ) : (
            <>
              Sudah memiliki akun?{" "}
              <button
                type="button"
                onClick={() => {
                  setTab("login");
                  setErrorMessage(null);
                }}
                className="font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
              >
                Masuk di sini
              </button>
            </>
          )}
        </p>

        <p className="text-[10px] text-muted-foreground/80 leading-relaxed px-2">
          FinTrack Ledger Security • Data terlindungi enkripsi standar industri.
        </p>
      </div>
    </div>
  );
}
