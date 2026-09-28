"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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
