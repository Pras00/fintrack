"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export interface CashflowPoint {
  date: string;
  fullDate: string;
  income: number;
  expense: number;
}

export interface CashflowChartResponse {
  points: CashflowPoint[];
  totalIncome: number;
  totalExpense: number;
  netSavingsRate: number;
}

export interface CategoryDistributionItem {
  name: string;
  value: number;
  color: string;
  percent: number;
}

export interface CategoryDistributionResponse {
  data: CategoryDistributionItem[];
  totalExpense: number;
}

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

const DEFAULT_CATEGORY_COLORS = [
  "#E11D48", // Rose
  "#0D9488", // Teal
  "#2563EB", // Blue
  "#F59E0B", // Amber
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#10B981", // Emerald
  "#EC4899", // Pink
];

export async function getDashboardData() {
  try {
    const currentUser = await getCurrentUser();
    const user = currentUser
      ? await prisma.user.findUnique({ where: { id: currentUser.id } })
      : await prisma.user.findFirst();

    if (!user) return null;

    // 1. Wallets & Total Net Worth
    const wallets = await prisma.wallet.findMany({
      where: { userId: user.id },
      orderBy: { balance: "desc" },
    });

    const netWorth = wallets.reduce(
      (sum, w) => sum + parseFloat(w.balance.toString()),
      0
    );

    // 2. Monthly Income & Expense
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthTxs = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: { gte: startOfMonth },
      },
      select: { amount: true, type: true },
    });

    let incomeMonth = 0;
    let expenseMonth = 0;
    for (const t of monthTxs) {
      const amt = parseFloat(t.amount.toString());
      if (t.type === "INCOME") incomeMonth += amt;
      else if (t.type === "EXPENSE") expenseMonth += amt;
    }

    return {
      user: { id: user.id, name: user.name, email: user.email },
      netWorth,
      incomeMonth,
      expenseMonth,
      activeWalletsCount: wallets.length,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching dashboard data:", message);
    return null;
  }
}

export async function getCashflowChartAction(
  range: "7d" | "30d" | "filter" = "filter",
  startDateStr?: string | null,
  endDateStr?: string | null
): Promise<CashflowChartResponse> {
  try {
    const currentUser = await getCurrentUser();
    const user = currentUser
      ? await prisma.user.findUnique({ where: { id: currentUser.id } })
      : await prisma.user.findFirst();

    const emptyResult: CashflowChartResponse = {
      points: [],
      totalIncome: 0,
      totalExpense: 0,
      netSavingsRate: 0,
    };

    if (!user) return emptyResult;

    let startDate: Date;
    let endDate: Date;
    const now = new Date();

    const dayMap = new Map<string, CashflowPoint>();

    if (range === "filter" && startDateStr && endDateStr) {
      const [sy, sm, sd] = startDateStr.split("-").map(Number);
      const [ey, em, ed] = endDateStr.split("-").map(Number);
      startDate = new Date(sy, sm - 1, sd, 0, 0, 0, 0);
      endDate = new Date(ey, em - 1, ed, 23, 59, 59, 999);

      const sMid = new Date(sy, sm - 1, sd);
      const eMid = new Date(ey, em - 1, ed);
      const diffDays = Math.max(1, Math.round((eMid.getTime() - sMid.getTime()) / (1000 * 60 * 60 * 24)) + 1);

      if (diffDays <= 62) {
        // Daily slots for single month or up to 2 months
        for (let i = 0; i < diffDays; i++) {
          const d = new Date(sy, sm - 1, sd + i);
          const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          const label = `${String(d.getDate()).padStart(2, "0")} ${SHORT_MONTHS[d.getMonth()]}`;
          dayMap.set(ymd, {
            date: label,
            fullDate: ymd,
            income: 0,
            expense: 0,
          });
        }
      } else {
        // Monthly slots for larger ranges (e.g. this_year)
        const curr = new Date(sy, sm - 1, 1);
        while (curr <= endDate) {
          const ym = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, "0")}`;
          const label = `${SHORT_MONTHS[curr.getMonth()]} ${String(curr.getFullYear()).slice(-2)}`;
          dayMap.set(ym, {
            date: label,
            fullDate: ym,
            income: 0,
            expense: 0,
          });
          curr.setMonth(curr.getMonth() + 1);
        }
      }
    } else {
      const numDays = range === "7d" ? 7 : 30;
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (numDays - 1), 0, 0, 0, 0);

      for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const label = `${String(d.getDate()).padStart(2, "0")} ${SHORT_MONTHS[d.getMonth()]}`;
        dayMap.set(ymd, {
          date: label,
          fullDate: ymd,
          income: 0,
          expense: 0,
        });
      }
    }

    // Query real transactions from NeonDB
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
        type: { in: ["INCOME", "EXPENSE"] },
      },
      select: {
        amount: true,
        type: true,
        date: true,
      },
      orderBy: { date: "asc" },
    });

    const isMonthlyGrouping = dayMap.size > 0 && Array.from(dayMap.keys())[0].length === 7;

    for (const tx of transactions) {
      const d = new Date(tx.date);
      const key = isMonthlyGrouping
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
        : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      const point = dayMap.get(key);
      if (point) {
        const amt = parseFloat(tx.amount.toString());
        if (tx.type === "INCOME") {
          point.income += amt;
        } else if (tx.type === "EXPENSE") {
          point.expense += amt;
        }
      }
    }

    const points = Array.from(dayMap.values());
    const totalIncome = points.reduce((acc, curr) => acc + curr.income, 0);
    const totalExpense = points.reduce((acc, curr) => acc + curr.expense, 0);
    const netSavingsRate =
      totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

    return {
      points,
      totalIncome,
      totalExpense,
      netSavingsRate,
    };
  } catch (error) {
    console.error("Error fetching cashflow chart data:", error);
    return {
      points: [],
      totalIncome: 0,
      totalExpense: 0,
      netSavingsRate: 0,
    };
  }
}

export async function getCategoryDistributionAction(
  startDateStr?: string | null,
  endDateStr?: string | null
): Promise<CategoryDistributionResponse> {
  try {
    const currentUser = await getCurrentUser();
    const user = currentUser
      ? await prisma.user.findUnique({ where: { id: currentUser.id } })
      : await prisma.user.findFirst();

    if (!user) return { data: [], totalExpense: 0 };

    let dateFilter: { gte?: Date; lte?: Date } | undefined = undefined;

    if (startDateStr && endDateStr) {
      const [sy, sm, sd] = startDateStr.split("-").map(Number);
      const [ey, em, ed] = endDateStr.split("-").map(Number);
      dateFilter = {
        gte: new Date(sy, sm - 1, sd, 0, 0, 0, 0),
        lte: new Date(ey, em - 1, ed, 23, 59, 59, 999),
      };
    } else {
      // Default: Last 30 days
      const now = new Date();
      const past30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30, 0, 0, 0, 0);
      dateFilter = {
        gte: past30,
        lte: now,
      };
    }

    const expenseTxs = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        type: "EXPENSE",
        ...(dateFilter ? { date: dateFilter } : {}),
      },
      include: { category: true },
    });

    const catMap = new Map<string, { name: string; value: number; color: string }>();
    let totalExpense = 0;

    for (const tx of expenseTxs) {
      const amt = parseFloat(tx.amount.toString());
      totalExpense += amt;
      const catName = tx.category?.name || "Pengeluaran Lainnya";
      const catColor =
        tx.category?.color ||
        DEFAULT_CATEGORY_COLORS[catMap.size % DEFAULT_CATEGORY_COLORS.length];

      if (!catMap.has(catName)) {
        catMap.set(catName, { name: catName, value: 0, color: catColor });
      }
      catMap.get(catName)!.value += amt;
    }

    const sortedCategories = Array.from(catMap.values()).sort((a, b) => b.value - a.value);

    let finalData: CategoryDistributionItem[] = [];

    if (sortedCategories.length <= 5) {
      finalData = sortedCategories.map((c) => ({
        ...c,
        percent: totalExpense > 0 ? Math.round((c.value / totalExpense) * 100) : 0,
      }));
    } else {
      const top5 = sortedCategories.slice(0, 5);
      const others = sortedCategories.slice(5);
      const othersValue = others.reduce((sum, c) => sum + c.value, 0);

      finalData = top5.map((c) => ({
        ...c,
        percent: totalExpense > 0 ? Math.round((c.value / totalExpense) * 100) : 0,
      }));

      if (othersValue > 0) {
        finalData.push({
          name: "Lainnya",
          value: othersValue,
          color: "#64748B",
          percent: totalExpense > 0 ? Math.round((othersValue / totalExpense) * 100) : 0,
        });
      }
    }

    return {
      data: finalData,
      totalExpense,
    };
  } catch (error) {
    console.error("Error fetching category distribution:", error);
    return { data: [], totalExpense: 0 };
  }
}
