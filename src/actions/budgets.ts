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
  customCategoryName: z.string().max(100).optional(),
  customCategoryIcon: z.string().optional(),
  customCategoryColor: z.string().optional(),
  amountLimit: z.number().int().positive("Nominal limit harus lebih besar dari 0").max(9999999999999),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2035),
});

const updateBudgetSchema = z.object({
  id: z.string().min(1, "ID anggaran wajib ada"),
  amountLimit: z.number().int().positive("Nominal limit harus lebih besar dari 0").max(9999999999999),
});

export async function getBudgetsAction(
  month?: number,
  year?: number
): Promise<BudgetsOverviewResponse> {
  try {
    const user = await getCurrentUser();
    const now = new Date();
    const m = month && Number.isInteger(month) && month >= 1 && month <= 12 ? month : now.getMonth() + 1;
    const y = year && Number.isInteger(year) && year >= 2020 && year <= 2035 ? year : now.getFullYear();

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
        activeMonth: month || new Date().getMonth() + 1,
        activeYear: year || new Date().getFullYear(),
    };
  }
}

export async function getBudgetCategoriesAction(): Promise<BudgetCategoryOption[]> {
  try {
    const user = await getCurrentUser();

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

    // Pindahkan kategori yang bernama "Pengeluaran Lainnya" / "Lainnya" ke urutan paling terakhir
    const otherIndex = categories.findIndex((c) =>
      c.name.toLowerCase().includes("lainnya")
    );
    if (otherIndex !== -1) {
      const [otherCat] = categories.splice(otherIndex, 1);
      categories.push(otherCat);
    }

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

    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: "Pengguna belum terautentikasi" };
    }

    const selectedCategory = await prisma.category.findFirst({
      where: {
        id: validated.categoryId,
        type: "EXPENSE",
        OR: [{ userId: null }, { userId: user.id }],
      },
    });
    if (!selectedCategory) {
      return { success: false, error: "Kategori pengeluaran tidak valid untuk akun Anda." };
    }

    let targetCategoryId = selectedCategory.id;

    // Jika user menginputkan nama kategori kustom (dari opsi "Pengeluaran Lainnya")
    if (validated.customCategoryName && validated.customCategoryName.trim()) {
      const trimmedName = validated.customCategoryName.trim();

      // Cek apakah user sudah punya kategori dengan nama tersebut
      const existingCustom = await prisma.category.findFirst({
        where: {
          userId: user.id,
          name: { equals: trimmedName, mode: "insensitive" },
          type: "EXPENSE",
        },
      });

      if (existingCustom) {
        targetCategoryId = existingCustom.id;
        if (validated.customCategoryIcon || validated.customCategoryColor) {
          await prisma.category.update({
            where: { id: existingCustom.id },
            data: {
              icon: validated.customCategoryIcon || existingCustom.icon,
              color: validated.customCategoryColor || existingCustom.color,
            },
          });
        }
      } else {
        const newCat = await prisma.category.create({
          data: {
            name: trimmedName,
            type: "EXPENSE",
            icon: validated.customCategoryIcon || "tag",
            color: validated.customCategoryColor || "#10B981",
            userId: user.id,
          },
        });
        targetCategoryId = newCat.id;
      }
    }

    // Upsert budget (buat baru atau perbarui jika sudah ada untuk kategori & bulan yang sama)
    const budget = await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId: user.id,
          categoryId: targetCategoryId,
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
        categoryId: targetCategoryId,
        userId: user.id,
      },
    });

    revalidatePath("/budgets");
    revalidatePath("/");

    return { success: true, data: { id: budget.id } };
  } catch (error) {
    console.error("Error createBudgetAction:", error);
    return {
      success: false,
      error: error instanceof z.ZodError ? error.issues[0]?.message : "Gagal menyimpan batas anggaran.",
    };
  }
}

export async function updateBudgetAction(
  data: z.infer<typeof updateBudgetSchema>
): Promise<ActionResponse<{ id: string }>> {
  try {
    const validated = updateBudgetSchema.parse(data);

    const user = await getCurrentUser();

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
    console.error("Error updateBudgetAction:", error);
    return {
      success: false,
      error: error instanceof z.ZodError ? error.issues[0]?.message : "Gagal memperbarui batas anggaran.",
    };
  }
}

export async function deleteBudgetAction(
  id: string
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();

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
    console.error("Error deleteBudgetAction:", error);
    return { success: false, error: "Gagal menghapus anggaran." };
  }
}
