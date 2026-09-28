import { DashboardShell } from "@/components/layout/dashboard-shell";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { CashflowChart } from "@/components/dashboard/cashflow-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { WalletSnapshot } from "@/components/dashboard/wallet-snapshot";

export default function Home() {
  return (
    <DashboardShell>
      {/* Welcome Banner & Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/50 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Ringkasan Finansial Anda
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Pantau arus kas, alokasi anggaran, dan saldo per 27 September 2026
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          <span>Status: Terkonsolidasi</span>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <KPICards />

      {/* Interactive Visual Charts Grid (Area & Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <CashflowChart />
        <CategoryChart />
      </div>

      {/* Operational Bottom Section (Transactions & Wallets) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <RecentTransactions />
        <WalletSnapshot />
      </div>
    </DashboardShell>
  );
}
