"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, getCurrentUser } from "@/lib/auth";
import {
  loginSchema,
  registerSchema,
  nameSchema,
  LoginInput,
  RegisterInput,
} from "@/lib/validations/auth";
import { WalletType } from "@prisma/client";

export interface AuthActionResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export async function loginUser(data: LoginInput): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: "Data formulir tidak valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.password) {
      return {
        success: false,
        message: "Email atau kata sandi tidak cocok.",
      };
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return {
        success: false,
        message: "Email atau kata sandi tidak cocok.",
      };
    }

    await createSession(user.id);

    return {
      success: true,
      message: "Berhasil masuk ke akun FinTrack.",
    };
  } catch (error: unknown) {
    console.error("Error loginUser:", error);
    return {
      success: false,
      message: "Terjadi kendala pada server. Silakan coba lagi.",
    };
  }
}

export async function registerUser(
  data: RegisterInput
): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: "Mohon lengkapi seluruh kolom sesuai petunjuk.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = parsed.data;

  try {
    const normalizedEmail = email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return {
        success: false,
        message: "Alamat email sudah terdaftar. Silakan gunakan menu Masuk.",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Buat akun baru beserta dompet awal dalam satu transaksi atomik
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          password: hashedPassword,
        },
      });

      // Siapkan 2 dompet awal agar pengguna baru bisa langsung mencatat transaksi
      await tx.wallet.createMany({
        data: [
          {
            name: "Rekening Utama",
            type: WalletType.BANK,
            balance: 0,
            currency: "IDR",
            color: "#2563EB",
            icon: "credit-card",
            userId: user.id,
          },
          {
            name: "Dompet Tunai",
            type: WalletType.CASH,
            balance: 0,
            currency: "IDR",
            color: "#10B981",
            icon: "wallet",
            userId: user.id,
          },
        ],
      });

      return user;
    });

    await createSession(newUser.id);

    return {
      success: true,
      message: "Pendaftaran berhasil. Selamat datang di FinTrack!",
    };
  } catch (error: unknown) {
    console.error("Error registerUser:", error);
    return {
      success: false,
      message: "Gagal memproses pendaftaran. Silakan coba lagi.",
    };
  }
}

export async function logoutUser(): Promise<{ success: boolean }> {
  try {
    await destroySession();
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function getAccountProfile() {
  return getCurrentUser();
}

export async function updateAccountName(name: string): Promise<AuthActionResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Silakan masuk kembali ke akun Anda." };

  const parsed = nameSchema.safeParse(name);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Nama tidak valid." };
  }

  try {
    await prisma.user.update({ where: { id: user.id }, data: { name: parsed.data } });
    return { success: true, message: "Nama profil berhasil diperbarui." };
  } catch (error) {
    console.error("Error updateAccountName:", error);
    return { success: false, message: "Gagal memperbarui profil. Silakan coba lagi." };
  }
}
