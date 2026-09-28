"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResponse, BudgetItem } from "@/types";

export interface BudgetsOverviewResponse {
  budgets: BudgetItem[];
  totalLimit: number;
  totalSpent: number;
  remainingBudget: number;
  overallPercent: number;
  activeMonth: number;
  activeYear: number;
}

export interface BudgetCategoryOption {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const budgetSchema = z.object({
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  amountLimit: z.number().positive("Nominal limit harus lebih besar dari 0"),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2035),
});

const updateBudgetSchema = z.object({
  id: z.string().min(1, "ID anggaran wajib ada"),
  amountLimit: z.number().positive("Nominal limit harus lebih besar dari 0"),
});

export async function getBudgetsAction(
  month?: number,
  year?: number
): Promise<BudgetsOverviewResponse> {
  try {
    const currentUser = await getCurrentUser();
    const user = currentUser
      ? await prisma.user.findUnique({ where: { id: currentUser.id } })
      : await prisma.user.findFirst();

    const m = month && month >= 1 && month <= 12 ? month : 9; // Default September
    const y = year && year >= 2020 && year <= 2035 ? year : 2026; // Default 2026

    if (!user) {
      return {
        budgets: [],
        totalLimit: 0,
        totalSpent: 0,
        remainingBudget: 0,
        overallPercent: 0,
        activeMonth: m,
        activeYear: y,
      };
    }

    // 1. Ambil daftar batas anggaran untuk bulan & tahun terpilih
    const rawBudgets = await prisma.budget.findMany({
      where: {
        userId: user.id,
        month: m,
        year: y,
      },
      include: {
        category: true,
      },
      orderBy: {
        amountLimit: "desc",
      },
    });

    // 2. Ambil akumulasi pengeluaran nyata per kategori pada bulan & tahun tersebut
    const startPeriod = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
    const endPeriod = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: {
          gte: startPeriod,
          lte: endPeriod,
        },
      },
      select: {
        categoryId: true,
        amount: true,
      },
    });

    // Petakan total pengeluaran per kategori
    const spentByCategory: Record<string, number> = {};
    for (const tx of transactions) {
      if (!tx.categoryId) continue;
      const amt = parseFloat(tx.amount.toString());
      spentByCategory[tx.categoryId] = (spentByCategory[tx.categoryId] || 0) + amt;
    }

    const budgets: BudgetItem[] = rawBudgets.map((b) => {
      const limit = parseFloat(b.amountLimit.toString());
      const spent = spentByCategory[b.categoryId] || 0;
      const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;

      return {
        id: b.id,
        name: b.category.name,
        categoryId: b.categoryId,
        spent,
        limit,
        percent,
        month: b.month,
        year: b.year,
        categoryIcon: b.category.icon,
        categoryColor: b.category.color,
      };
    });

    const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const remainingBudget = totalLimit - totalSpent;
    const overallPercent =
      totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

    return {
      budgets,
      totalLimit,
      totalSpent,
      remainingBudget,
      overallPercent,
      activeMonth: m,
      activeYear: y,
    };
  } catch (error) {
    console.error("Error getBudgetsAction:", error);
    return {
      budgets: [],
      totalLimit: 0,
      totalSpent: 0,
      remainingBudget: 0,
      overallPercent: 0,
      activeMonth: month || 9,
      activeYear: year || 2026,
    };
  }
}

export async function getBudgetCategoriesAction(): Promise<BudgetCategoryOption[]> {
  try {
    const currentUser = await getCurrentUser();
    const user = currentUser
      ? await prisma.user.findUnique({ where: { id: currentUser.id } })
      : await prisma.user.findFirst();

    if (!user) return [];

    const categories = await prisma.category.findMany({
      where: {
        type: "EXPENSE",
        OR: [{ userId: null }, { userId: user.id }],
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
      },
    });

    return categories;
  } catch (error) {
    console.error("Error getBudgetCategoriesAction:", error);
    return [];
  }
}

export async function createBudgetAction(
  data: z.infer<typeof budgetSchema>
): Promise<ActionResponse<{ id: string }>> {
  try {
    const validated = budgetSchema.parse(data);

    const currentUser = await getCurrentUser();
    const user = currentUser
      ? await prisma.user.findUnique({ where: { id: currentUser.id } })
      : await prisma.user.findFirst();

    if (!user) {
      return { success: false, error: "Pengguna belum terautentikasi" };
    }

    // Upsert budget (buat baru atau perbarui jika sudah ada untuk kategori & bulan yang sama)
    const budget = await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId: user.id,
          categoryId: validated.categoryId,
          month: validated.month,
          year: validated.year,
        },
      },
      update: {
        amountLimit: validated.amountLimit,
      },
      create: {
        amountLimit: validated.amountLimit,
        month: validated.month,
        year: validated.year,
        categoryId: validated.categoryId,
        userId: user.id,
      },
    });

    revalidatePath("/budgets");
    revalidatePath("/");

    return { success: true, data: { id: budget.id } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Gagal menyimpan batas anggaran";
    console.error("Error createBudgetAction:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function updateBudgetAction(
  data: z.infer<typeof updateBudgetSchema>
): Promise<ActionResponse<{ id: string }>> {
  try {
    const validated = updateBudgetSchema.parse(data);

    const currentUser = await getCurrentUser();
    const user = currentUser
      ? await prisma.user.findUnique({ where: { id: currentUser.id } })
      : await prisma.user.findFirst();

    if (!user) {
      return { success: false, error: "Pengguna belum terautentikasi" };
    }

    const existing = await prisma.budget.findFirst({
      where: {
        id: validated.id,
        userId: user.id,
      },
    });

    if (!existing) {
      return { success: false, error: "Data anggaran tidak ditemukan" };
    }

    const updated = await prisma.budget.update({
      where: { id: validated.id },
      data: {
        amountLimit: validated.amountLimit,
      },
    });

    revalidatePath("/budgets");
    revalidatePath("/");

    return { success: true, data: { id: updated.id } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Gagal memperbarui batas anggaran";
    console.error("Error updateBudgetAction:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function deleteBudgetAction(
  id: string
): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser();
    const user = currentUser
      ? await prisma.user.findUnique({ where: { id: currentUser.id } })
      : await prisma.user.findFirst();

    if (!user) {
      return { success: false, error: "Pengguna belum terautentikasi" };
    }

    const existing = await prisma.budget.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existing) {
      return { success: false, error: "Data anggaran tidak ditemukan" };
    }

    await prisma.budget.delete({
      where: { id },
    });

    revalidatePath("/budgets");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Gagal menghapus anggaran";
    console.error("Error deleteBudgetAction:", errorMessage);
    return { success: false, error: errorMessage };
  }
}
