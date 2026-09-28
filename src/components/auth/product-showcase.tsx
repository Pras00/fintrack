import {
  WalletCards,
  ArrowRightLeft,
  PieChart,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Lock,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group rounded-2xl border border-border/70 bg-card/60 dark:bg-slate-900/60 backdrop-blur-sm p-4 transition-all duration-200 hover:border-teal-500/40 hover:bg-card/90 dark:hover:bg-slate-900/90 hover:shadow-xs">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 mb-2.5 transition-transform duration-200 group-hover:scale-105">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-foreground tracking-tight">
        {title}
      </h3>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export function ProductShowcase() {
  return (
    <div className="flex flex-col justify-center space-y-4 sm:space-y-5 py-2">
      {/* Top Header & Brand */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <Logo size="lg" showTagline />
        </div>

        {/* Badge Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
          <span>Sovereign Ledger Platform • v2.0</span>
        </div>

        {/* Hero Title & Value Proposition */}
        <div className="space-y-2 max-w-xl">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-[1.18]">
            FinTrack{" "}
            <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 dark:from-teal-400 dark:via-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
              Financial Portal
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Solusi konsolidasi multi-rekening, pelacakan mutasi instan, dan kepatuhan anggaran real-time. Kelola dompet fisik, bank, dan e-wallet dalam satu sistem ledger terpadu.
          </p>
        </div>
      </div>

      {/* 2x2 Bento Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
        <FeatureCard
          icon={<WalletCards className="h-4.5 w-4.5" />}
          title="Konsolidasi Multi-Dompet"
          description="Pantau saldo rekening bank, e-wallet, dan kas tunai dalam satu ringkasan kekayaan terpusat."
        />
        <FeatureCard
          icon={<ArrowRightLeft className="h-4.5 w-4.5" />}
          title="Mutasi Kas Real-Time"
          description="Pencatatan pengeluaran, pemasukan, dan transfer saldo antar dompet secara presisi dan seketika."
        />
        <FeatureCard
          icon={<PieChart className="h-4.5 w-4.5" />}
          title="Disiplin Batas Anggaran"
          description="Monitoring ketat limit belanja bulanan dengan peringatan dini indikator batas kritis 80%."
        />
        <FeatureCard
          icon={<TrendingUp className="h-4.5 w-4.5" />}
          title="Analitik Laju Arus Kas"
          description="Visualisasi tren pengeluaran harian dan rasio tabungan bersih bulanan secara transparan."
        />
      </div>

      {/* Institutional Footer Credentials */}
      <div className="pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground max-w-xl">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
          <span>FinTrack Sovereign Ledger System</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <Lock className="h-3 w-3 text-muted-foreground" />
          <span>Enkripsi SSL & Serverless NeonDB</span>
        </div>
      </div>
    </div>
  );
}
