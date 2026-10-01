"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResponse, TransactionItem } from "@/types";

const transactionSchema = z.object({
  amount: z.number().int("Nominal harus berupa rupiah bulat").positive("Nominal harus lebih besar dari 0").max(9999999999999),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  walletId: z.string().min(1, "Dompet asal wajib dipilih"),
  toWalletId: z.string().optional(),
  categoryId: z.string().optional(),
  categoryName: z.string().optional(),
  description: z.string().max(500).optional(),
  date: z.iso.date().optional(),
});

export type CreateTransactionInput = z.infer<typeof transactionSchema>;

export async function createTransactionAction(
  data: CreateTransactionInput
): Promise<ActionResponse<{ id: string }>> {
  try {
    const validated = transactionSchema.parse(data);
    const txDate = validated.date ? new Date(validated.date) : new Date();

    // 1. Tentukan pengguna yang aktif
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Silakan masuk kembali ke akun Anda." };

    // 2. Validasi dompet sumber
    const sourceWallet = await prisma.wallet.findFirst({
      where: { id: validated.walletId, userId: user.id },
    });

    if (!sourceWallet) {
      return { success: false, error: "Dompet sumber tidak ditemukan di akun Anda." };
    }

    // 3. Validasi dompet tujuan jika TRANSFER
    let targetWalletId: string | null = null;
    if (validated.type === "TRANSFER") {
      if (!validated.toWalletId || validated.toWalletId === sourceWallet.id) {
        return { success: false, error: "Pilih dompet tujuan yang berbeda dari dompet asal." };
      }
      const targetWallet = await prisma.wallet.findFirst({
        where: { id: validated.toWalletId, userId: user.id },
      });
      if (!targetWallet) return { success: false, error: "Dompet tujuan tidak ditemukan di akun Anda." };
      if (targetWallet.currency !== sourceWallet.currency) {
        return { success: false, error: "Transfer antar mata uang belum didukung." };
      }
      targetWalletId = targetWallet.id;
    }

    // 4. Resolve Kategori
    let finalCategoryId: string | null = null;
    if (validated.type !== "TRANSFER" && (validated.categoryId || validated.categoryName)) {
      const cat = await prisma.category.findFirst({
        where: {
          ...(validated.categoryId
            ? { id: validated.categoryId }
            : { name: validated.categoryName }),
          type: validated.type,
          OR: [{ userId: null }, { userId: user.id }],
        },
      });
      if (!cat) return { success: false, error: "Kategori tidak valid untuk akun atau jenis transaksi ini." };
      finalCategoryId = cat.id;
    }

    // 5. Eksekusi transaksi atomik di database
    const createdTx = await prisma.$transaction(async (tx) => {
      if (validated.type !== "INCOME") {
        const debit = await tx.wallet.updateMany({
          where: {
            id: sourceWallet.id,
            userId: user.id,
            balance: { gte: validated.amount },
          },
          data: { balance: { decrement: validated.amount } },
        });
        if (debit.count !== 1) throw new Error("Saldo dompet asal tidak mencukupi.");
      }

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
      if (validated.type === "INCOME") {
        await tx.wallet.update({
          where: { id: sourceWallet.id },
          data: { balance: { increment: validated.amount } },
        });
      } else if (validated.type === "TRANSFER" && targetWalletId) {
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
    console.error("Error createTransactionAction:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Data transaksi tidak valid." };
    }
    if (error instanceof Error && error.message === "Saldo dompet asal tidak mencukupi.") {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Gagal menyimpan transaksi. Silakan coba lagi." };
  }
}

export async function getTransactionFormDataAction() {
  try {
    const user = await getCurrentUser();

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
    const user = await getCurrentUser();

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
