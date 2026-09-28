import { PrismaClient, CategoryType, WalletType, TransactionType } from "@prisma/client";

const prisma = new PrismaClient();

const defaultCategories = [
  // Income
  { name: "Gaji & Upah", type: CategoryType.INCOME, icon: "briefcase", color: "#10B981" },
  { name: "Investasi & Dividen", type: CategoryType.INCOME, icon: "trending-up", color: "#0EA5E9" },
  { name: "Freelance & Bisnis", type: CategoryType.INCOME, icon: "laptop", color: "#8B5CF6" },
  { name: "Bonus & Hadiah", type: CategoryType.INCOME, icon: "gift", color: "#F59E0B" },
  { name: "Pemasukan Lainnya", type: CategoryType.INCOME, icon: "plus-circle", color: "#64748B" },

  // Expense
  { name: "Makanan & Minuman", type: CategoryType.EXPENSE, icon: "utensils", color: "#EF4444" },
  { name: "Transportasi", type: CategoryType.EXPENSE, icon: "car", color: "#F97316" },
  { name: "Tagihan & Utilitas", type: CategoryType.EXPENSE, icon: "receipt", color: "#EAB308" },
  { name: "Belanja & Kebutuhan", type: CategoryType.EXPENSE, icon: "shopping-bag", color: "#EC4899" },
  { name: "Hiburan & Hobi", type: CategoryType.EXPENSE, icon: "gamepad-2", color: "#8B5CF6" },
  { name: "Kesehatan & Medis", type: CategoryType.EXPENSE, icon: "heart-pulse", color: "#06B6D4" },
  { name: "Pendidikan & Kursus", type: CategoryType.EXPENSE, icon: "graduation-cap", color: "#3B82F6" },
  { name: "Pengeluaran Lainnya", type: CategoryType.EXPENSE, icon: "more-horizontal", color: "#64748B" },
];

async function main() {
  console.log("🌱 Mulai seeding database NeonDB...");

  // 1. Seed Categories
  for (const cat of defaultCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, type: cat.type, userId: null },
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          name: cat.name,
          type: cat.type,
          icon: cat.icon,
          color: cat.color,
          userId: null,
        },
      });
      console.log(`+ Kategori '${cat.name}' dibuat.`);
    }
  }

  // 2. Seed Default User (Prasz)
  const defaultUser = await prisma.user.upsert({
    where: { email: "user@fintrack.id" },
    update: {},
    create: {
      email: "user@fintrack.id",
      name: "Prasz",
    },
  });
  console.log(`+ User default: ${defaultUser.name} (${defaultUser.email})`);

  // 3. Seed Default Wallets
  const walletsData = [
    { name: "BCA Prioritas", type: WalletType.BANK, balance: 54800000, color: "#2563EB", icon: "credit-card" },
    { name: "Mandiri Payroll", type: WalletType.BANK, balance: 21450000, color: "#0284C7", icon: "landmark" },
    { name: "GoPay & QRIS", type: WalletType.EWALLET, balance: 5750000, color: "#059669", icon: "smartphone" },
    { name: "Kas Tunai Fisik", type: WalletType.CASH, balance: 2500000, color: "#475569", icon: "wallet" },
  ];

  for (const w of walletsData) {
    const existing = await prisma.wallet.findFirst({
      where: { name: w.name, userId: defaultUser.id },
    });
    if (!existing) {
      await prisma.wallet.create({
        data: {
          name: w.name,
          type: w.type,
          balance: w.balance,
          currency: "IDR",
          color: w.color,
          icon: w.icon,
          userId: defaultUser.id,
        },
      });
      console.log(`+ Dompet '${w.name}' dibuat.`);
    }
  }

  // 4. Seed Budgets
  const foodCategory = await prisma.category.findFirst({ where: { name: "Makanan & Minuman" } });
  const billsCategory = await prisma.category.findFirst({ where: { name: "Tagihan & Utilitas" } });
  const shoppingCategory = await prisma.category.findFirst({ where: { name: "Belanja & Kebutuhan" } });

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  if (foodCategory) {
    await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId: defaultUser.id,
          categoryId: foodCategory.id,
          month: currentMonth,
          year: currentYear,
        },
      },
      update: {},
      create: {
        amountLimit: 4000000,
        month: currentMonth,
        year: currentYear,
        categoryId: foodCategory.id,
        userId: defaultUser.id,
      },
    });
  }

  if (billsCategory) {
    await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId: defaultUser.id,
          categoryId: billsCategory.id,
          month: currentMonth,
          year: currentYear,
        },
      },
      update: {},
      create: {
        amountLimit: 2500000,
        month: currentMonth,
        year: currentYear,
        categoryId: billsCategory.id,
        userId: defaultUser.id,
      },
    });
  }

  if (shoppingCategory) {
    await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId: defaultUser.id,
          categoryId: shoppingCategory.id,
          month: currentMonth,
          year: currentYear,
        },
      },
      update: {},
      create: {
        amountLimit: 2000000,
        month: currentMonth,
        year: currentYear,
        categoryId: shoppingCategory.id,
        userId: defaultUser.id,
      },
    });
  }

  // 5. Seed Real Initial Transactions
  const bcaWallet = await prisma.wallet.findFirst({ where: { name: "BCA Prioritas", userId: defaultUser.id } });
  const mandiriWallet = await prisma.wallet.findFirst({ where: { name: "Mandiri Payroll", userId: defaultUser.id } });
  const gopayWallet = await prisma.wallet.findFirst({ where: { name: "GoPay & QRIS", userId: defaultUser.id } });
  const freelanceCategory = await prisma.category.findFirst({ where: { name: "Freelance & Bisnis" } });
  const salaryCategory = await prisma.category.findFirst({ where: { name: "Gaji & Upah" } });
  const transportCategory = await prisma.category.findFirst({ where: { name: "Transportasi" } });

  const existingTxCount = await prisma.transaction.count({ where: { userId: defaultUser.id } });
  if (existingTxCount === 0 && bcaWallet && mandiriWallet && gopayWallet) {
    const initialTxs = [
      {
        description: "Gaji Bulanan PT Teknologi Maju",
        amount: 25000000,
        type: TransactionType.INCOME,
        walletId: bcaWallet.id,
        categoryId: salaryCategory?.id,
        date: new Date("2026-09-27T14:30:00Z"),
      },
      {
        description: "Dinner & Kopi Sore Senopati",
        amount: 320000,
        type: TransactionType.EXPENSE,
        walletId: gopayWallet.id,
        categoryId: foodCategory?.id,
        date: new Date("2026-09-27T19:15:00Z"),
      },
      {
        description: "Isi Saldo GoPay dari BCA",
        amount: 1000000,
        type: TransactionType.TRANSFER,
        walletId: bcaWallet.id,
        toWalletId: gopayWallet.id,
        date: new Date("2026-09-26T09:20:00Z"),
      },
      {
        description: "Tagihan Listrik PLN & Wi-Fi Biznet",
        amount: 1450000,
        type: TransactionType.EXPENSE,
        walletId: mandiriWallet.id,
        categoryId: billsCategory?.id,
        date: new Date("2026-09-25T11:00:00Z"),
      },
      {
        description: "Proyek UI/UX Design Dashboard",
        amount: 8500000,
        type: TransactionType.INCOME,
        walletId: bcaWallet.id,
        categoryId: freelanceCategory?.id,
        date: new Date("2026-09-24T16:45:00Z"),
      },
      {
        description: "Bensin Pertamax Turbo & Tol Jagorawi",
        amount: 450000,
        type: TransactionType.EXPENSE,
        walletId: mandiriWallet.id,
        categoryId: transportCategory?.id,
        date: new Date("2026-09-23T08:10:00Z"),
      },
      {
        description: "Belanja Bulanan Supermarket GrandLucky",
        amount: 1350000,
        type: TransactionType.EXPENSE,
        walletId: bcaWallet.id,
        categoryId: shoppingCategory?.id,
        date: new Date("2026-09-22T15:30:00Z"),
      },
    ];

    for (const txData of initialTxs) {
      await prisma.transaction.create({
        data: {
          ...txData,
          userId: defaultUser.id,
        },
      });
    }
    console.log(`+ ${initialTxs.length} transaksi awal berhasil di-seed ke NeonDB.`);
  }

  console.log("✅ Seeding lengkap di NeonDB selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
