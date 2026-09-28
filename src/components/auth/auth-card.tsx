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
} from "lucide-react";
import { toast } from "sonner";
import { loginUser, registerUser } from "@/actions/auth";
import { LoginInput, RegisterInput } from "@/lib/validations/auth";
import { Logo } from "@/components/brand/logo";

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

  const fillDemoAccount = () => {
    setLoginEmail("user@fintrack.id");
    setLoginPassword("password123");
    setErrorMessage(null);
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Mobile Brand Header */}
      <div className="flex lg:hidden items-center justify-center pb-2">
        <Logo size="md" showTagline />
      </div>

      {/* Auth Card Box */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm">
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 rounded-xl border border-border/60 bg-muted/30 p-1 text-xs font-semibold mb-6">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setErrorMessage(null);
            }}
            className={`rounded-lg py-2 transition-all cursor-pointer ${
              tab === "login"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("register");
              setErrorMessage(null);
            }}
            className={`rounded-lg py-2 transition-all cursor-pointer ${
              tab === "register"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Daftar Akun
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-500 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* LOGIN FORM */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground/90 block">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border/70 bg-background/50 pl-9.5 pr-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 dark:focus:ring-teal-400 dark:focus:border-teal-400 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground/90 block">
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showLoginPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border/70 bg-background/50 pl-9.5 pr-10 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 dark:focus:ring-teal-400 dark:focus:border-teal-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
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
              className="w-full h-10 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50 mt-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Akun</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>

            {/* Quick Demo Pre-fill for Testing */}
            <div className="pt-3 border-t border-border/40 text-center">
              <button
                type="button"
                onClick={fillDemoAccount}
                className="text-[11px] text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
              >
                Gunakan Akun Contoh (<span className="font-mono text-teal-600 dark:text-teal-400">user@fintrack.id</span>)
              </button>
            </div>
          </form>
        )}

        {/* REGISTER FORM */}
        {tab === "register" && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground/90 block">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="Nama Anda"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border/70 bg-background/50 pl-9.5 pr-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 dark:focus:ring-teal-400 dark:focus:border-teal-400 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground/90 block">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border/70 bg-background/50 pl-9.5 pr-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 dark:focus:ring-teal-400 dark:focus:border-teal-400 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground/90 block">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showRegPassword ? "text" : "password"}
                  required
                  placeholder="Minimal 8 karakter"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border/70 bg-background/50 pl-9.5 pr-10 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 dark:focus:ring-teal-400 dark:focus:border-teal-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
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

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground/90 block">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showRegPassword ? "text" : "password"}
                  required
                  placeholder="Ulangi kata sandi"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border/70 bg-background/50 pl-9.5 pr-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 dark:focus:ring-teal-400 dark:focus:border-teal-400 transition-colors"
                />
              </div>
            </div>

            {/* Password Criteria Checklist */}
            <div className="space-y-1 py-1 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span
                  className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] ${
                    hasMinLength
                      ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Check className="h-2.5 w-2.5" />
                </span>
                <span>Minimal 8 karakter</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] ${
                    hasLetter && hasNumber
                      ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Check className="h-2.5 w-2.5" />
                </span>
                <span>Kombinasi huruf dan angka</span>
              </div>
              {regConfirmPassword.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] ${
                      passwordsMatch
                        ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold"
                    }`}
                  >
                    <Check className="h-2.5 w-2.5" />
                  </span>
                  <span className={passwordsMatch ? "text-teal-600 dark:text-teal-400 font-medium" : "text-rose-600 dark:text-rose-400 font-medium"}>
                    {passwordsMatch ? "Konfirmasi cocok" : "Konfirmasi tidak cocok"}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending || !hasMinLength || !hasLetter || !hasNumber || !passwordsMatch}
              className="w-full h-10 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50 mt-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Membuat Akun...</span>
                </>
              ) : (
                <>
                  <span>Daftar Akun Baru</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Subtle Privacy Notice */}
      <p className="text-center text-[11px] text-muted-foreground leading-relaxed px-4">
        Dengan melanjutkan, Anda menyetujui Ketentuan Layanan serta Kebijakan Privasi pengelolaan data FinTrack.
      </p>
    </div>
  );
}
