"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResponse, WalletType } from "@/types";

const walletFields = z.object({
  name: z.string().trim().min(1, "Nama dompet wajib diisi.").max(80, "Nama dompet terlalu panjang."),
  type: z.enum(["BANK", "EWALLET", "CASH", "INVESTMENT", "OTHER"]),
});

const updateWalletFields = walletFields.extend({ id: z.string().min(1) });

export interface WalletSummary {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
}

function refreshWalletViews() {
  try {
    revalidatePath("/");
    revalidatePath("/wallets");
    revalidatePath("/transactions");
    revalidatePath("/analytics");
    revalidatePath("/budgets");
  } catch (error) {
    console.error("Error refreshWalletViews:", error);
  }
}

export async function getWalletsAction(): Promise<ActionResponse<WalletSummary[]>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Silakan masuk kembali ke akun Anda." };

  try {
    const wallets = await prisma.wallet.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, type: true, balance: true },
      orderBy: { createdAt: "asc" },
    });
    return {
      success: true,
      data: wallets.map((wallet) => ({
        ...wallet,
        balance: Number(wallet.balance),
      })),
    };
  } catch (error) {
    console.error("Error getWalletsAction:", error);
    return { success: false, error: "Gagal memuat daftar dompet." };
  }
}

export async function createWalletAction(input: z.infer<typeof walletFields>): Promise<ActionResponse> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Silakan masuk kembali ke akun Anda." };

  const parsed = walletFields.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  try {
    await prisma.wallet.create({
      data: {
        name: parsed.data.name,
        type: parsed.data.type,
        balance: 0,
        currency: "IDR",
        userId: user.id,
      },
    });
    refreshWalletViews();
    return { success: true };
  } catch (error) {
    console.error("Error createWalletAction:", error);
    return { success: false, error: "Gagal menambah dompet. Silakan coba lagi." };
  }
}

export async function updateWalletAction(input: z.infer<typeof updateWalletFields>): Promise<ActionResponse> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Silakan masuk kembali ke akun Anda." };

  const parsed = updateWalletFields.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  try {
    const result = await prisma.wallet.updateMany({
      where: { id: parsed.data.id, userId: user.id },
      data: { name: parsed.data.name, type: parsed.data.type },
    });
    if (result.count !== 1) return { success: false, error: "Dompet tidak ditemukan di akun Anda." };
    refreshWalletViews();
    return { success: true };
  } catch (error) {
    console.error("Error updateWalletAction:", error);
    return { success: false, error: "Gagal mengubah dompet. Silakan coba lagi." };
  }
}

export async function deleteWalletAction(id: string): Promise<ActionResponse> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Silakan masuk kembali ke akun Anda." };
  if (!z.string().min(1).safeParse(id).success) {
    return { success: false, error: "Dompet tidak valid." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Kunci baris agar transaksi baru tidak dapat memakai dompet saat penghapusan diperiksa.
      const wallets = await tx.$queryRaw<{ id: string; balance: { isZero(): boolean } }[]>`
        SELECT id, balance FROM "Wallet" WHERE id = ${id} AND "userId" = ${user.id} FOR UPDATE
      `;
      const wallet = wallets[0];
      if (!wallet) return { success: false, error: "Dompet tidak ditemukan di akun Anda." };
      if (!wallet.balance.isZero()) {
        return { success: false, error: "Dompet dengan saldo tidak nol tidak dapat dihapus." };
      }

      const transactionCount = await tx.transaction.count({
        where: { OR: [{ walletId: id }, { toWalletId: id }] },
      });
      if (transactionCount > 0) {
        return { success: false, error: "Dompet memiliki riwayat transaksi dan tidak dapat dihapus." };
      }

      await tx.wallet.delete({ where: { id } });
      return { success: true };
    });
    if (result.success) refreshWalletViews();
    return result;
  } catch (error) {
    console.error("Error deleteWalletAction:", error);
    return { success: false, error: "Gagal menghapus dompet. Silakan coba lagi." };
  }
}
