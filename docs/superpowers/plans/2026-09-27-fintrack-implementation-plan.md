# FinTrack - Implementation Plan

- **Tanggal:** 27 September 2026
- **Spesifikasi Referensi:** `docs/superpowers/specs/2026-09-27-fintrack-dashboard-design.md`
- **Tujuan:** Membangun aplikasi FinTrack Dashboard tahap demi tahap dengan presisi, type-safety, anti-AI-slop craft, dan koneksi NeonDB + Prisma.

---

## Tahap 1: Scaffolding & Setup Project
- [ ] Inisialisasi Next.js 15+ (App Router, TypeScript, Tailwind CSS v4, ESLint) pada direktori aktif.
- [ ] Konfigurasi Tailwind CSS v4 & theme variables (Slate/Zinc neutral, Emerald, Rose, Cyan).
- [ ] Setup font *Plus Jakarta Sans* / *Geist* dengan `tabular-nums` untuk tampilan angka finansial presisi.
- [ ] Instalasi dependensi UI & Logic:
  - `clsx`, `tailwind-merge`, `lucide-react`, `class-variance-authority`
  - `zustand` (State management)
  - `framer-motion` (Interaktivitas & animas counter angka)
  - `recharts` (Visualisasi data)
  - `zod`, `react-hook-form`, `@hookform/resolvers` (Validasi form)
  - `sonner` (Toast notifikasi)
  - `date-fns` (Manipulasi tanggal)

## Tahap 2: Setup Database (Prisma + NeonDB) & Panduan Kredensial
- [ ] Instalasi Prisma CLI & Prisma Client (`prisma`, `@prisma/client`).
- [ ] Tulis skema Prisma (`prisma/schema.prisma`) mencakup model NextAuth (`User`, `Account`, `Session`, `VerificationToken`) dan entitas finansial (`Wallet`, `Category`, `Transaction`, `Budget`, `Goal`).
- [ ] Siapkan file `.env.example` dan `.env.local` untuk `DATABASE_URL` (Pooled) dan `DIRECT_URL` (Direct).
- [ ] Buat singleton client `lib/prisma.ts` yang kompatibel dengan Next.js Serverless runtime.
- [ ] Buat script seeder (`prisma/seed.ts`) untuk kategori default (Gaji, Makanan & Minuman, Transportasi, Tagihan, Belanja, Hiburan, dll.).
- [ ] Pandu pengguna memasukkan string koneksi NeonDB lalu jalankan `npx prisma db push` & seeder.

## Tahap 3: Autentikasi (Auth.js v5 / NextAuth)
- [ ] Setup Auth.js v5 (`next-auth@beta`, `@auth/prisma-adapter`).
- [ ] Konfigurasi `auth.ts` dengan Prisma Adapter, Credentials & Google Provider support.
- [ ] Buat middleware proteksi route `/dashboard` dan halaman auth `/login`.

## Tahap 4: Dashboard Shell & Anti-AI-Slop Layout
- [ ] Buat layout dashboard responsif (`components/layout/sidebar.tsx`, `header.tsx`, `theme-toggle.tsx`).
- [ ] Desain arsitektur high-density tanpa ruang melompong:
  - Sidebar ramping dengan navigasi intuitif.
  - Header dengan shortcut `Ctrl+K`, quick action `+ Transaksi`, breadcrumb, dan date range filter.
- [ ] Setup Zustand stores (`stores/use-filter-store.ts`, `stores/use-modal-store.ts`).

## Tahap 5: Data Visualization & KPI Metrics
- [ ] Komponen **KPI Metric Cards** (`components/dashboard/kpi-cards.tsx`):
  - Total Saldo / Net Worth, Pemasukan Bulan Ini, Pengeluaran Bulan Ini, Net Savings.
  - Animated number counter (*Framer Motion*), badge persentase MoM, dan konteks rata-rata harian.
- [ ] Komponen **Cashflow Trend Chart** (`components/dashboard/cashflow-chart.tsx`):
  - Area chart interaktif (Emerald gradient untuk income, Rose gradient untuk expense).
  - Segmented pill controls (7H, 30H, Bulan Ini, 1T).
- [ ] Komponen **Category Breakdown Chart** (`components/dashboard/category-chart.tsx`):
  - Donut chart dengan legend interaktif dan hover nilai Rupiah.

## Tahap 6: Ledger Transaksi & Modal Input Cepat
- [ ] Komponen **Recent Transactions Table** (`components/dashboard/recent-transactions.tsx`):
  - 5-10 transaksi terakhir, badge kategori warna-warni, format Rupiah presisi.
- [ ] Komponen **Wallet Balances & Budget Alert** (`components/dashboard/wallet-snapshot.tsx`):
  - Kartu debit/e-wallet compact dan visual progress bar anggaran mendekati limit.
- [ ] Modal/Sheet Cepat `+ Transaksi` (`components/modals/transaction-modal.tsx`):
  - Tab Pengeluaran, Pemasukan, dan Transfer.
  - Form validasi Zod dengan auto-formatting Rupiah.
- [ ] Server Actions (`actions/transactions.ts`):
  - Mutasi data atomik (`prisma.$transaction`) untuk keamanan saldo.
  - Revalidasi path realtime.

## Tahap 7: Testing, Polish & Impeccable Audit
- [ ] Audit kontras warna WCAG AAA pada dark & light mode.
- [ ] Verifikasi ketepatan alignment angka `tabular-nums`.
- [ ] Pengujian fungsionalitas end-to-end (tambah pemasukan, pengeluaran, mutasi transfer dompet).
