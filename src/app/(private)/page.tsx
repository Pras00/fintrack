import { DashboardShell } from "@/components/layout/dashboard-shell";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { CashflowChart } from "@/components/dashboard/cashflow-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { WalletSnapshot } from "@/components/dashboard/wallet-snapshot";
import { getDashboardData } from "@/actions/dashboard";

export default async function Home() {
  const dashboardData = await getDashboardData();

  return (
    <DashboardShell>
      {/* Welcome Banner & Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/50 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Ringkasan Finansial Anda
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Pantau arus kas riil, alokasi anggaran, dan saldo akun keuangan Anda
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          <span>Status: Terkonsolidasi</span>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <KPICards
        initialNetWorth={dashboardData?.netWorth}
        initialIncomeMonth={dashboardData?.incomeMonth}
        initialExpenseMonth={dashboardData?.expenseMonth}
        initialActiveWallets={dashboardData?.activeWalletsCount}
      />

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
