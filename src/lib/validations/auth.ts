import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Alamat email wajib diisi")
    .max(254, "Alamat email terlalu panjang")
    .email("Format alamat email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi").max(128, "Kata sandi terlalu panjang"),
});

export const nameSchema = z.string().trim().min(2, "Nama lengkap minimal 2 karakter").max(100, "Nama lengkap maksimal 100 karakter");

export const registerSchema = z
  .object({
    name: nameSchema,
    email: z
      .string()
      .trim()
      .min(1, "Alamat email wajib diisi")
      .max(254, "Alamat email terlalu panjang")
      .email("Format alamat email tidak valid"),
    password: z
      .string()
      .min(8, "Kata sandi minimal 8 karakter")
      .max(128, "Kata sandi maksimal 128 karakter")
      .regex(/[A-Za-z]/, "Kata sandi wajib mengandung huruf")
      .regex(/[0-9]/, "Kata sandi wajib mengandung angka"),
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
