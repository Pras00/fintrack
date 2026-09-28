# FinTrack - Professional Personal Finance Dashboard Specification

- **Tanggal:** 27 September 2026
- **Status:** Approved Architecture Draft
- **Path Target:** `docs/superpowers/specs/2026-09-27-fintrack-dashboard-design.md`

---

## 1. Overview & Project Goals

**FinTrack** adalah aplikasi web dashboard pencatatan dan pengelolaan keuangan pribadi modern dengan estetika profesional, interaktif, dan mudah digunakan. Aplikasi ini dibangun untuk memberikan visibilitas penuh terhadap kondisi finansial pengguna melalui ringkasan metrik kunci, visualisasi grafik riwayat aliran kas (*cashflow*), alokasi pengeluaran per kategori, manajemen multi-dompet (*bank, e-wallet, tunai*), dan perencanaan anggaran (*budgeting*).

### Karakteristik Kunci
1. **Desain Visual:** Palet warna *fintech enterprise* yang elegan (Slate/Zinc neutral, Emerald untuk pemasukan, Rose untuk pengeluaran, Cyan untuk transfer).
2. **Interaktivitas:** Grafik interaktif dinamis dengan tooltip detail, filter rentang tanggal realtime, dan animasi transisi/counter angka (*Framer Motion*).
3. **Integritas Data:** Operasi mutasi saldo atomik (`prisma.$transaction`) menjamin saldo tidak akan pernah mengalami selisih/desinkronisasi.
4. **Skalabilitas:** Arsitektur modular yang siap dikembangkan ke arah multi-mata uang (*USD, EUR*) di masa mendatang.

---

## 2. Tech Stack

| Lapisan | Teknologi | Spesifikasi / Kegunaan |
| :--- | :--- | :--- |
| **Framework** | Next.js 15+ (App Router) | Server Components (RSC), Server Actions, Route Handlers |
| **Bahasa** | TypeScript | Strict type checking untuk seluruh entitas keuangan |
| **Styling & Theme** | Tailwind CSS v4 | Variabel CSS modern, responsive design, dark/light mode |
| **UI Library** | Shadcn UI (Radix Primitives) | Komponen aksesibel (Dialog, Sheet, Select, Dropdown, Table, Card) |
| **Visualisasi / Charts**| Recharts (via Shadcn Chart) | Area Chart (Cashflow Trend), Donut Chart (Category Breakdown) |
| **State Management** | Zustand | Filter global (rentang tanggal, filter akun), modal store |
| **Animasi & Motion** | Framer Motion | Animated Number Counter, transisi page, modal micro-interactions |
| **Database** | Neon Serverless PostgreSQL | Cloud PostgreSQL dengan pooling PgBouncer bawaan |
| **ORM** | Prisma ORM | Type-safe query builder, migration CLI |
| **Autentikasi** | Auth.js (NextAuth v5) + Prisma Adapter | Manajemen akun pengguna (Google OAuth & Credentials) |
| **Form & Validasi** | React Hook Form + Zod | Validasi ketat input angka, tanggal, dan kategori |
| **Icons & Format** | Lucide React + date-fns | Ikon UI konsisten, pemformatan tanggal & `Intl.NumberFormat` IDR |
| **Notifikasi** | Sonner | Toast alerts interaktif untuk aksi CRUD |

---

## 3. Skema Database (Prisma Schema)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

// --------------------------------------------------------
// NextAuth Models
// --------------------------------------------------------
model User {
  id            String          @id @default(cuid())
  name          String?
  email         String?         @unique
  emailVerified DateTime?
  image         String?
  password      String?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  accounts      Account[]
  sessions      Session[]
  wallets       Wallet[]
  categories    Category[]
  transactions  Transaction[]
  budgets       Budget[]
  goals         Goal[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// --------------------------------------------------------
// Financial Core Models
// --------------------------------------------------------

enum WalletType {
  BANK
  EWALLET
  CASH
  INVESTMENT
  OTHER
}

model Wallet {
  id        String     @id @default(cuid())
  name      String
  type      WalletType @default(BANK)
  balance   Decimal    @default(0) @db.Decimal(15, 2)
  currency  String     @default("IDR")
  color     String?    @default("#10B981")
  icon      String?    @default("wallet")
  userId    String
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  user               User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions       Transaction[] @relation("SourceWallet")
  targetTransactions Transaction[] @relation("TargetWallet")
}

enum CategoryType {
  INCOME
  EXPENSE
}

model Category {
  id        String       @id @default(cuid())
  name      String
  type      CategoryType
  icon      String       @default("tag")
  color     String       @default("#64748B")
  userId    String?      // Null = Kategori default sistem; Terisi = Kategori kustom user
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  user         User?         @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  budgets      Budget[]
}

enum TransactionType {
  INCOME
  EXPENSE
  TRANSFER
}

model Transaction {
  id          String          @id @default(cuid())
  amount      Decimal         @db.Decimal(15, 2)
  type        TransactionType
  date        DateTime        @default(now())
  description String?
  
  walletId    String
  wallet      Wallet          @relation("SourceWallet", fields: [walletId], references: [id], onDelete: Cascade)
  
  toWalletId  String?
  toWallet    Wallet?         @relation("TargetWallet", fields: [toWalletId], references: [id], onDelete: SetNull)

  categoryId  String?
  category    Category?       @relation(fields: [categoryId], references: [id], onDelete: SetNull)

  userId      String
  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@index([userId, date])
}

model Budget {
  id          String   @id @default(cuid())
  amountLimit Decimal  @db.Decimal(15, 2)
  month       Int
  year        Int
  categoryId  String
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  category Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, categoryId, month, year])
}

model Goal {
  id            String    @id @default(cuid())
  title         String
  targetAmount  Decimal   @db.Decimal(15, 2)
  currentAmount Decimal   @default(0) @db.Decimal(15, 2)
  currency      String    @default("IDR")
  deadline      DateTime?
  userId        String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 4. Arsitektur Antarmuka & Halaman (UI/UX)

### 4.1 Struktur Halaman & Routing
- `/` — Landing page / redirect ke dashboard jika sudah login.
- `/login` & `/register` — Halaman autentikasi Auth.js.
- `/dashboard` — Halaman utama ikhtisar keuangan (KPI, Grafik Cashflow, Donut Category, Recent Activity).
- `/transactions` — Daftar lengkap riwayat transaksi dengan search, multi-filter, pagination, dan export.
- `/wallets` — Manajemen daftar dompet/rekening, mutasi saldo, dan penyesuaian nominal.
- `/budgets` — Manajemen limit pengeluaran per kategori per bulan dengan visual progress bar.
- `/analytics` — Laporan mendalam perbandingan bulan ke bulan (*Month-over-Month*) & rincian pengeluaran.

### 4.2 Komponen Dashboard (`/dashboard`)
1. **Top Metric Cards (KPI):**
   - **Kekayaan Bersih (Net Worth):** Total akumulasi saldo semua dompet aktif.
   - **Pemasukan Bulan Ini:** Total transaksi tipe `INCOME` periode berjalan + persentase MoM.
   - **Pengeluaran Bulan Ini:** Total transaksi tipe `EXPENSE` periode berjalan + indikator status (hijau jika di bawah rata-rata).
   - **Tabungan Bersih (Net Savings):** Selisih `Income - Expense`.
2. **Chart Section:**
   - **Area Chart (Cashflow Trend):** Menampilkan kurva harian/mingguan pemasukan vs pengeluaran dengan fill gradient halus.
   - **Donut Chart (Expense by Category):** Proporsi pengeluaran per kategori dengan legend interaktif dan hover nilai nominal Rupiah.
3. **Operational Bottom Grid:**
   - **Tabel Transaksi Terbaru:** 5 transaksi terakhir dengan badge warna, nama dompet, dan tombol aksi detail.
   - **Kartu Ringkasan Dompet & Budget Alert:** Status saldo akun bank/e-wallet serta kategori yang hampir melewati batas anggaran (>80%).

### 4.3 Modal Input Cepat (`+ Transaksi` / `Ctrl+K`)
- Trigger melalui tombol di header atau shortcut keyboard.
- Tab: **Pengeluaran**, **Pemasukan**, **Transfer Antar Dompet**.
- Form otomatis mengonversi angka ke format Rupiah saat diketik.

### 4.4 Anti-AI-Slop Visual Manifesto & Craft Directives (`frontend-design` & `impeccable`)
Untuk memastikan tampilan dashboard memiliki karakter khas, berkelas profesional, dan **bebas dari ciri khas template generik AI (AI-Slop)**:

1. **Banned AI Tells (Hal-hal yang Diharamkan):**
   - ❌ *SaaS Cookie-Cutter Card Kit:* Menghindari kartu-kartu raksasa seragam dengan `p-8 rounded-2xl` kosong melompong dan bayangan abu-abu lembut mengambang tanpa hierarki.
   - ❌ *Purple/Violet Gradient Mesh Cliché:* Menghindari background blur gradien ungu jenuh (`from-purple-500 to-indigo-500`) yang lazim dipakai template AI murah.
   - ❌ *All-caps Eyebrow Headers:* Menghindari label huruf kapital berjarak renggang (`TRACKED-OUT UPPERCASE`) di atas setiap judul; gunakan sentence case yang berwibawa.
   - ❌ *Gimmicky Scattered Animations:* Menghindari elemen meluncur acak saat scroll; animasi harus fungsional dan responsif terhadap aksi pengguna.

2. **Pondasi Craft & Finishing Berstandar Tinggi:**
   - **Tipografi Finansial:** Menggunakan font modern clean (*Plus Jakarta Sans* / *Geist*) dengan fitur `tabular-nums` (`font-variant-numeric: tabular-nums`) sehingga angka saldo dan nominal tersusun rapi tegak lurus tanpa pergeseran lebar karakter.
   - **Palet Warna Disiplin & Bermakna:**
     - *Neutrals:* Deep Slate / Obsidian (`#090D16` / `#0F172A`) untuk dark mode berkedalaman, dan *Clean Crisp Off-white* (`#F8FAFC`) untuk light mode.
     - *Inflow (Pemasukan):* Emerald Halus (`#10B981`) dengan teks kontras tinggi.
     - *Outflow (Pengeluaran):* Rose/Coral Terukur (`#F43F5E`), tidak menusuk mata namun tegas.
     - *Borders & Dividers:* Hairline subtle borders (`border-border/60` atau `border-white/10`) untuk memisahkan hierarki tanpa membuat tampilan berat.

### 4.5 Keseimbangan Ruang & Kepadatan Informasi (High-Density Spatial Balance)
Dashboard dirancang **penuh dan berbobot tanpa terasa sesak**:
- **Zero Wasted Space:** Setiap kartu menyajikan konteks data ganda:
  - Kartu KPI tidak hanya menyajikan angka total, namun juga *sparkline kontekstual*, delta MoM, dan rata-rata harian.
  - Kartu Dompet menyajikan visual kartu ringkas (nomor rekening tersembunyi `•••• 4821`, tipe dompet, saldo, dan status aktif).
- **Segmented Inline Chart Controls:** Penggantian periode grafik (*7 Hari*, *30 Hari*, *Bulan Ini*, *1 Tahun*) diletakkan langsung di dalam kartu grafik menggunakan segmented pill selector yang ringkas.
- **Interaktivitas yang Memuaskan:**
  - Animated count-up pada angka metrik finansial saat halaman atau filter berubah.
  - Rich Custom Tooltip pada grafik: menampilkan tanggal, nominal akurat, dan rincian transaksi terkait.
  - Status hover mikro yang halus pada baris tabel transaksi dengan aksi cepat yang muncul saat di-hover.

---

## 5. Integrasi Data & NeonDB Configuration

### 5.1 Environment Variables
```env
# Neon Connection Pooling (PgBouncer)
DATABASE_URL="postgresql://[user]:[password]@[endpoint]-pooler.[region].neon.tech/neondb?sslmode=require"

# Neon Direct Connection (Untuk Migrasi Prisma)
DIRECT_URL="postgresql://[user]:[password]@[endpoint].[region].neon.tech/neondb?sslmode=require"

# Auth.js Configuration
AUTH_SECRET="[generated-secret-key]"
NEXTAUTH_URL="http://localhost:3000"
```

### 5.2 Atomic Operations pada Server Actions
Setiap transaksi keuangan dijalankan menggunakan `prisma.$transaction`:
- **Pengeluaran (`EXPENSE`):** Kurangi `balance` dompet asal + buat rekaman `Transaction`.
- **Pemasukan (`INCOME`):** Tambah `balance` dompet tujuan + buat rekaman `Transaction`.
- **Transfer (`TRANSFER`):** Kurangi `balance` dompet asal, tambah `balance` dompet tujuan + buat rekaman `Transaction` dengan `toWalletId`.

---

## 6. Tahapan Eksekusi (Implementation Phases)

1. **Fase 1: Scaffolding & Setup Project**
   - Inisialisasi Next.js (App Router, TypeScript, Tailwind CSS).
   - Instalasi Shadcn UI, Recharts, Lucide React, Framer Motion, Zustand, Zod.
   - Setup konfigurasi database NeonDB dan Prisma Client.
2. **Fase 2: Autentikasi & Seed Data**
   - Setup Auth.js (NextAuth v5) dengan Prisma Adapter.
   - Seed data kategori standar (Gaji, Makanan & Minuman, Transportasi, Tagihan, Belanja, Hiburan).
3. **Fase 3: Layout & Shell Dashboard**
   - Implementasi Sidebar responsif, Header, Theme Toggle (Dark/Light mode).
   - Zustand Store untuk filter tanggal global.
4. **Fase 4: Visualisasi Grafik & Metrik**
   - KPI Cards dengan animated number ticker.
   - Cashflow Trend Area Chart & Expense Donut Chart.
5. **Fase 5: Manajemen Transaksi & Form Input Cepat**
   - Dialog Sheet `+ Transaksi` dengan validasi Zod.
   - Server Actions dengan atomic balance update.
6. **Fase 6: Multi-Wallet & Budgeting**
   - Halaman daftar dompet & transfer antar dompet.
   - Progress bar anggaran bulanan.
7. **Fase 7: Testing, Polish & Micro-interactions**
   - Optimasi responsiveness (Desktop & Mobile).
   - Audit UX & visual finishing (`impeccable`).
