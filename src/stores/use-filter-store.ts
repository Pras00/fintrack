import { create } from "zustand";

export type DatePreset =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "this_month"
  | "last_month"
  | "this_year"
  | "custom"
  | "all";

export const ID_MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

export const ID_MONTHS_FULL = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export const ID_DAYS_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function formatDateLabel(
  start: string | null,
  end: string | null,
  preset: DatePreset
): string {
  if (preset === "all") return "Semua Waktu";
  if (preset === "this_month") return "Bulan Ini";
  if (preset === "last_month") return "Bulan Lalu";
  if (preset === "7d") return "7 Hari Terakhir";
  if (preset === "30d") return "30 Hari Terakhir";
  if (preset === "this_year") return `Tahun ${start?.slice(0, 4) || new Date().getFullYear()}`;
  if (preset === "today") return "Hari Ini";
  if (preset === "yesterday") return "Kemarin";

  if (!start && !end) return "Pilih Tanggal";
  if (start && (!end || start === end)) {
    const [y, m, d] = start.split("-");
    const mIdx = parseInt(m, 10) - 1;
    return `${parseInt(d, 10)} ${ID_MONTHS_SHORT[mIdx]} ${y}`;
  }
  if (start && end) {
    const [y1, m1, d1] = start.split("-");
    const [y2, m2, d2] = end.split("-");
    const mIdx1 = parseInt(m1, 10) - 1;
    const mIdx2 = parseInt(m2, 10) - 1;
    if (y1 === y2 && m1 === m2) {
      return `${parseInt(d1, 10)} – ${parseInt(d2, 10)} ${ID_MONTHS_SHORT[mIdx1]} ${y1}`;
    }
    if (y1 === y2) {
      return `${parseInt(d1, 10)} ${ID_MONTHS_SHORT[mIdx1]} – ${parseInt(d2, 10)} ${ID_MONTHS_SHORT[mIdx2]} ${y1}`;
    }
    return `${parseInt(d1, 10)} ${ID_MONTHS_SHORT[mIdx1]} ${y1} – ${parseInt(d2, 10)} ${ID_MONTHS_SHORT[mIdx2]} ${y2}`;
  }
  return "Kustom";
}

export function getPresetDates(
  preset: DatePreset,
  baseDate: Date = new Date()
): { startDate: string | null; endDate: string | null; label: string } {
  const pad = (n: number) => String(n).padStart(2, "0");
  const toYMD = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const todayStr = toYMD(baseDate);

  switch (preset) {
    case "today": {
      return {
        startDate: todayStr,
        endDate: todayStr,
        label: `Hari Ini (${baseDate.getDate()} ${ID_MONTHS_SHORT[baseDate.getMonth()]})`,
      };
    }
    case "yesterday": {
      const y = new Date(baseDate);
      y.setDate(y.getDate() - 1);
      const yStr = toYMD(y);
      return {
        startDate: yStr,
        endDate: yStr,
        label: `Kemarin (${y.getDate()} ${ID_MONTHS_SHORT[y.getMonth()]})`,
      };
    }
    case "7d": {
      const past = new Date(baseDate);
      past.setDate(past.getDate() - 6);
      return {
        startDate: toYMD(past),
        endDate: todayStr,
        label: "7 Hari Terakhir",
      };
    }
    case "30d": {
      const past = new Date(baseDate);
      past.setDate(past.getDate() - 29);
      return {
        startDate: toYMD(past),
        endDate: todayStr,
        label: "30 Hari Terakhir",
      };
    }
    case "this_month": {
      const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
      const end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
      return {
        startDate: toYMD(start),
        endDate: toYMD(end),
        label: `Bulan Ini (${ID_MONTHS_SHORT[baseDate.getMonth()]} ${baseDate.getFullYear()})`,
      };
    }
    case "last_month": {
      const start = new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, 1);
      const end = new Date(baseDate.getFullYear(), baseDate.getMonth(), 0);
      return {
        startDate: toYMD(start),
        endDate: toYMD(end),
        label: `Bulan Lalu (${ID_MONTHS_SHORT[start.getMonth()]} ${start.getFullYear()})`,
      };
    }
    case "this_year": {
      const start = new Date(baseDate.getFullYear(), 0, 1);
      const end = new Date(baseDate.getFullYear(), 11, 31);
      return {
        startDate: toYMD(start),
        endDate: toYMD(end),
        label: `Tahun ${baseDate.getFullYear()}`,
      };
    }
    case "all": {
      return {
        startDate: null,
        endDate: null,
        label: "Semua Waktu",
      };
    }
    default:
      return {
        startDate: null,
        endDate: null,
        label: "Kustom",
      };
  }
}

interface FilterState {
  datePreset: DatePreset;
  startDate: string | null;
  endDate: string | null;
  dateLabel: string;
  selectedWalletId: string;
  selectedCategoryId: string;
  setDatePreset: (preset: DatePreset) => void;
  setCustomDateRange: (startStr: string, endStr: string) => void;
  setSingleDate: (dateStr: string) => void;
  setSelectedWalletId: (walletId: string) => void;
  setSelectedCategoryId: (categoryId: string) => void;
  resetFilters: () => void;
}

const defaultRange = getPresetDates("this_month");

export const useFilterStore = create<FilterState>((set) => ({
  datePreset: "this_month",
  startDate: defaultRange.startDate,
  endDate: defaultRange.endDate,
  dateLabel: defaultRange.label,
  selectedWalletId: "all",
  selectedCategoryId: "all",

  setDatePreset: (preset) => {
    const range = getPresetDates(preset);
    set({
      datePreset: preset,
      startDate: range.startDate,
      endDate: range.endDate,
      dateLabel: range.label,
    });
  },

  setCustomDateRange: (startStr: string, endStr: string) => {
    let s = startStr;
    let e = endStr;
    if (s > e) {
      const temp = s;
      s = e;
      e = temp;
    }
    const label = formatDateLabel(s, e, "custom");
    set({
      datePreset: "custom",
      startDate: s,
      endDate: e,
      dateLabel: label,
    });
  },

  setSingleDate: (dateStr: string) => {
    const label = formatDateLabel(dateStr, dateStr, "custom");
    set({
      datePreset: "custom",
      startDate: dateStr,
      endDate: dateStr,
      dateLabel: label,
    });
  },

  setSelectedWalletId: (walletId) => set({ selectedWalletId: walletId }),
  setSelectedCategoryId: (categoryId) => set({ selectedCategoryId: categoryId }),
  resetFilters: () => {
    const d = getPresetDates("this_month");
    set({
      datePreset: "this_month",
      startDate: d.startDate,
      endDate: d.endDate,
      dateLabel: d.label,
      selectedWalletId: "all",
      selectedCategoryId: "all",
    });
  },
}));
