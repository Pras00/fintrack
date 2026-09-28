"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResponse, TransactionItem } from "@/types";

const transactionSchema = z.object({
  amount: z.number().positive("Nominal harus lebih besar dari 0"),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  walletId: z.string().min(1, "Dompet asal wajib dipilih"),
  toWalletId: z.string().optional(),
  categoryId: z.string().optional(),
  categoryName: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
});

export type CreateTransactionInput = z.infer<typeof transactionSchema>;

export async function createTransactionAction(
  data: CreateTransactionInput
): Promise<ActionResponse<{ id: string }>> {
  try {
    const validated = transactionSchema.parse(data);
    const txDate = validated.date ? new Date(validated.date) : new Date();

    // 1. Tentukan pengguna yang aktif
    const currentUser = await getCurrentUser();
    const user = currentUser
      ? await prisma.user.findUnique({ where: { id: currentUser.id } })
      : await prisma.user.findFirst();

    if (!user) {
      return { success: false, error: "Pengguna belum terdaftar di database" };
    }

    // 2. Validasi dompet sumber
    let sourceWallet = await prisma.wallet.findFirst({
      where: { id: validated.walletId, userId: user.id },
    });

    // Jika walletId yang dikirim tidak ditemukan (misal ID legacy w-1), cari dompet pertama user
    if (!sourceWallet) {
      sourceWallet = await prisma.wallet.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
      });
    }

    if (!sourceWallet) {
      return { success: false, error: "Dompet sumber tidak ditemukan di akun Anda." };
    }

    // 3. Validasi dompet tujuan jika TRANSFER
    let targetWalletId: string | null = null;
    if (validated.type === "TRANSFER") {
      let targetWallet = validated.toWalletId
        ? await prisma.wallet.findFirst({
            where: { id: validated.toWalletId, userId: user.id },
          })
        : null;

      // Jika tidak ditemukan atau sama dengan dompet asal, cari dompet lain milik user
      if (!targetWallet || targetWallet.id === sourceWallet.id) {
        targetWallet = await prisma.wallet.findFirst({
          where: {
            userId: user.id,
            id: { not: sourceWallet.id },
          },
        });
      }

      if (targetWallet) {
        targetWalletId = targetWallet.id;
      }
    }

    // 4. Resolve Kategori
    let finalCategoryId: string | null = null;
    if (validated.categoryId) {
      const cat = await prisma.category.findUnique({
        where: { id: validated.categoryId },
      });
      if (cat) finalCategoryId = cat.id;
    }

    if (!finalCategoryId && validated.categoryName) {
      const cat = await prisma.category.findFirst({
        where: {
          name: validated.categoryName,
          OR: [{ userId: null }, { userId: user.id }],
        },
      });
      if (cat) finalCategoryId = cat.id;
    }

    // 5. Eksekusi transaksi atomik di database
    const createdTx = await prisma.$transaction(async (tx) => {
      const newRecord = await tx.transaction.create({
        data: {
          amount: validated.amount,
          type: validated.type,
          date: txDate,
          description: validated.description?.trim() || (validated.type === "TRANSFER" ? "Transfer Saldo" : "Transaksi"),
          walletId: sourceWallet.id,
          toWalletId: targetWalletId,
          categoryId: finalCategoryId,
          userId: user.id,
        },
      });

      // Mutasi saldo atomik
      if (validated.type === "EXPENSE") {
        await tx.wallet.update({
          where: { id: sourceWallet.id },
          data: { balance: { decrement: validated.amount } },
        });
      } else if (validated.type === "INCOME") {
        await tx.wallet.update({
          where: { id: sourceWallet.id },
          data: { balance: { increment: validated.amount } },
        });
      } else if (validated.type === "TRANSFER" && targetWalletId) {
        await tx.wallet.update({
          where: { id: sourceWallet.id },
          data: { balance: { decrement: validated.amount } },
        });
        await tx.wallet.update({
          where: { id: targetWalletId },
          data: { balance: { increment: validated.amount } },
        });
      }

      return newRecord;
    });

    try {
      revalidatePath("/");
      revalidatePath("/transactions");
      revalidatePath("/wallets");
      revalidatePath("/budgets");
      revalidatePath("/analytics");
    } catch {
      // Ignored if called outside Next.js request context
    }

    return { success: true, data: { id: createdTx.id } };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Gagal menyimpan transaksi";
    console.error("Error createTransactionAction:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function getTransactionFormDataAction() {
  try {
    const currentUser = await getCurrentUser();
    const user = currentUser
      ? await prisma.user.findUnique({ where: { id: currentUser.id } })
      : await prisma.user.findFirst();

    if (!user) return { wallets: [], categories: [] };

    const [wallets, categories] = await Promise.all([
      prisma.wallet.findMany({
        where: { userId: user.id },
        orderBy: { balance: "desc" },
        select: { id: true, name: true, type: true, balance: true, color: true, icon: true },
      }),
      prisma.category.findMany({
        where: {
          OR: [{ userId: null }, { userId: user.id }],
        },
        orderBy: { name: "asc" },
        select: { id: true, name: true, type: true, icon: true, color: true },
      }),
    ]);

    return {
      wallets: wallets.map((w) => ({
        ...w,
        balance: parseFloat(w.balance.toString()),
      })),
      categories,
    };
  } catch (error) {
    console.error("Error getTransactionFormDataAction:", error);
    return { wallets: [], categories: [] };
  }
}

export async function getTransactionsAction(): Promise<TransactionItem[]> {
  try {
    const currentUser = await getCurrentUser();
    const user = currentUser
      ? await prisma.user.findUnique({ where: { id: currentUser.id } })
      : await prisma.user.findFirst();

    if (!user) return [];

    const raw = await prisma.transaction.findMany({
      where: { userId: user.id },
      include: {
        wallet: true,
        toWallet: true,
        category: true,
      },
      orderBy: { date: "desc" },
    });

    return raw.map((tx) => {
      const d = new Date(tx.date);
      const dateFormatted = d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const walletLabel =
        tx.type === "TRANSFER" && tx.toWallet
          ? `${tx.wallet.name} → ${tx.toWallet.name}`
          : tx.wallet.name;

      return {
        id: tx.id,
        description: tx.description || "Tanpa Keterangan",
        category: tx.category?.name || (tx.type === "TRANSFER" ? "Transfer Internal" : "Umum"),
        wallet: walletLabel,
        type: tx.type,
        amount: parseFloat(tx.amount.toString()),
        date: dateFormatted,
        rawDate: d.toISOString(),
        iconName: tx.category?.icon || (tx.type === "TRANSFER" ? "arrow-right-left" : "tag"),
      };
    });
  } catch (error) {
    console.error("Error getTransactionsAction:", error);
    return [];
  }
}
