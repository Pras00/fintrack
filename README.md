# FinTrack

**FinTrack** adalah aplikasi web manajemen keuangan pribadi (*personal finance tracker*) untuk mencatat transaksi, memantau arus kas (*cashflow*), mengelola rekening dan dompet, serta mengontrol batas anggaran bulanan secara terpusat.

---

## Fitur Utama

- **Dashboard Finansial Terkonsolidasi**: Ringkasan saldo aktif dari seluruh akun (bank, e-wallet, kas tunai), total pemasukan, total pengeluaran, serta rasio tabungan (*savings rate*).
- **Visualisasi Arus Kas & Analisis**:
  - Grafik tren arus kas harian (*Cashflow Velocity*) yang tersinkronisasi dengan filter rentang tanggal.
  - Diagram lingkaran (*donut chart*) distribusi pengeluaran berdasarkan kategori.
- **Pencatatan Transaksi Lengkap**: Mendukung transaksi **Pemasukan**, **Pengeluaran**, dan **Transfer** antar dompet dengan pembaruan saldo otomatis.
- **Filter Tanggal Fleksibel**: Pilihan cepat (*Hari Ini, 7 Hari Terakhir, 30 Hari Terakhir, Bulan Ini, Bulan Lalu*) serta pemilihan rentang tanggal kustom (*date range picker*).
- **Manajemen Rekening & Dompet**: Kelola rekening tabungan, dompet digital, dan kas fisik dengan nomor akun serta saldo terpisah.
- **Kontrol Anggaran Bulanan**: Menetapkan batas anggaran per kategori dan memantau persentase penggunaannya secara berkala.
- **Autentikasi Pengguna**: Sistem autentikasi berbasis sesi cookie dengan enkripsi kata sandi (*bcryptjs*).

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Actions)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/)
- **Visualisasi Data**: [Recharts](https://recharts.org/)
- **Database & ORM**: PostgreSQL ([Neon Serverless](https://neon.tech/)) & [Prisma ORM](https://www.prisma.io/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Form & Validasi**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

---

## Struktur Folder

```text
fintrack/
├── prisma/
│   ├── schema.prisma       # Skema database (User, Wallet, Category, Transaction, Budget)
│   └── seed.ts             # Data inisialisasi awal
├── src/
│   ├── actions/            # Server Actions (dashboard, transactions, budgets, auth)
│   ├── app/                # Route App Router (dashboard, transactions, wallets, budgets, auth)
│   ├── components/         # Komponen UI (dashboard charts, layout navbar, modals, cards)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Konfigurasi Prisma, auth helper, dan format rupiah
│   ├── stores/             # Global client store (useFilterStore, useModalStore)
│   └── types/              # Deklarasi tipe TypeScript
└── ...
```

---

## Panduan Memulai

### 1. Prasyarat
- [Node.js](https://nodejs.org/) versi 20 atau yang lebih baru
- Akun dan project database PostgreSQL (misal: [Neon](https://neon.tech/))

### 2. Kloning Repositori & Instalasi Dependensi
```bash
git clone https://github.com/Pras00/fintrack.git
cd fintrack
npm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Sesuaikan konfigurasi koneksi database dan auth secret di dalam file `.env`:
```env
DATABASE_URL="postgresql://[user]:[password]@[endpoint]-pooler.[region].neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://[user]:[password]@[endpoint].[region].neon.tech/neondb?sslmode=require"
AUTH_SECRET="your-secret-key-32-chars-or-more"
```

### 4. Sinkronisasi Database & Seeding Data
Terapkan skema database dan masukkan data awal:
```bash
npx prisma db push
npx prisma db seed
```

### 5. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---

## Perintah yang Tersedia (Scripts)

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan server pengembangan lokal |
| `npm run build` | Membuat build produksi aplikasi |
| `npm run start` | Menjalankan server produksi |
| `npm run lint` | Menjalankan pemeriksaan kode dengan ESLint |

---

## Lisensi
Proyek ini dibuat untuk keperluan pribadi dan pembelajaran.
