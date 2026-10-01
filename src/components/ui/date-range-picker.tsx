"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  RotateCcw,
  Clock,
} from "lucide-react";
import {
  useFilterStore,
  DatePreset,
  ID_MONTHS_FULL,
  ID_MONTHS_SHORT,
  getPresetDates,
} from "@/stores/use-filter-store";
import { cn } from "@/lib/utils";

const DAYS_HEADER = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export function DateRangePicker() {
  const {
    datePreset,
    startDate,
    endDate,
    dateLabel,
    setDatePreset,
    setCustomDateRange,
    setSingleDate,
    resetFilters,
  } = useFilterStore();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Atomic state for temporary date selection
  const [selectedRange, setSelectedRange] = useState<{
    start: string | null;
    end: string | null;
  }>({
    start: startDate,
    end: endDate,
  });

  const [tempPreset, setTempPreset] = useState<DatePreset>(datePreset);

  // Calendar View month & year navigation
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (startDate) {
      const [y, m] = startDate.split("-").map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date();
  });

  // Sync state whenever popover opens
  const handleToggleOpen = () => {
    if (!isOpen) {
      setSelectedRange({ start: startDate, end: endDate });
      setTempPreset(datePreset);
      if (startDate) {
        const [y, m] = startDate.split("-").map(Number);
        setViewDate(new Date(y, m - 1, 1));
      }
    }
    setIsOpen((prev) => !prev);
  };

  // Click outside and Escape key handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  // Generate calendar cells for the active month view
  const calendarCells = useMemo(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    // Monday as index 0 (0: Sun -> 6, 1: Mon -> 0, ..., 6: Sat -> 5)
    const startOffset = (firstDayIndex + 6) % 7;

    const cells: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    // Previous month padding
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      cells.push({
        dateStr: `${prevY}-${pad(prevM + 1)}-${pad(d)}`,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Current month days
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(d)}`;
      cells.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
      });
    }

    // Next month padding to fill a clean 35 or 42 grid
    const remaining = (cells.length > 35 ? 42 : 35) - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      cells.push({
        dateStr: `${nextY}-${pad(nextM + 1)}-${pad(d)}`,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return cells;
  }, [viewYear, viewMonth]);

  // Atomic date click handler: allows Single Date or Date Range
  const handleDateClick = (dateStr: string) => {
    setTempPreset("custom");

    setSelectedRange((prev) => {
      // If no start, or if a range (start !== end) is already selected:
      // Start fresh selection with dateStr (Single Date mode)
      if (!prev.start || (prev.start && prev.end && prev.start !== prev.end)) {
        return { start: dateStr, end: dateStr };
      }

      // If single date was selected (prev.start === prev.end):
      if (dateStr === prev.start) {
        return prev;
      }

      if (dateStr < prev.start) {
        return { start: dateStr, end: prev.start };
      } else {
        return { start: prev.start, end: dateStr };
      }
    });
  };

  // Apply the selected filter
  const handleApply = () => {
    if (tempPreset !== "custom") {
      setDatePreset(tempPreset);
    } else if (selectedRange.start && selectedRange.end) {
      if (selectedRange.start === selectedRange.end) {
        setSingleDate(selectedRange.start);
      } else {
        setCustomDateRange(selectedRange.start, selectedRange.end);
      }
    }
    setIsOpen(false);
  };

  // Preset selector
  const handlePresetSelect = (preset: DatePreset) => {
    setTempPreset(preset);
    const range = getPresetDates(preset);
    setSelectedRange({ start: range.startDate, end: range.endDate });

    if (range.startDate) {
      const [y, m] = range.startDate.split("-").map(Number);
      setViewDate(new Date(y, m - 1, 1));
    }
  };

  // Summary Text
  const summaryText = useMemo(() => {
    if (tempPreset !== "custom") {
      return getPresetDates(tempPreset).label;
    }
    const { start, end } = selectedRange;
    if (start && end) {
      if (start === end) {
        const [y, m, d] = start.split("-");
        const mIdx = parseInt(m, 10) - 1;
        return `Tanggal Tunggal: ${parseInt(d, 10)} ${ID_MONTHS_SHORT[mIdx]} ${y}`;
      }
      const [, m1, d1] = start.split("-");
      const [y2, m2, d2] = end.split("-");
      const mIdx1 = parseInt(m1, 10) - 1;
      const mIdx2 = parseInt(m2, 10) - 1;
      const dayDiff =
        Math.round(
          (new Date(end).getTime() - new Date(start).getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1;
      return `Rentang: ${parseInt(d1, 10)} ${ID_MONTHS_SHORT[mIdx1]} – ${parseInt(d2, 10)} ${ID_MONTHS_SHORT[mIdx2]} ${y2} (${dayDiff} hari)`;
    }
    return "Pilih tanggal atau rentang waktu";
  }, [tempPreset, selectedRange]);

  const presetOptions = useMemo(() => {
    const now = new Date();
    const currM = now.getMonth();
    const currY = now.getFullYear();
    const prevDate = new Date(currY, currM - 1, 1);
    const prevM = prevDate.getMonth();
    const prevY = prevDate.getFullYear();

    return [
      { key: "today" as DatePreset, label: "Hari Ini" },
      { key: "yesterday" as DatePreset, label: "Kemarin" },
      { key: "7d" as DatePreset, label: "7 Hari Terakhir" },
      { key: "30d" as DatePreset, label: "30 Hari Terakhir" },
      {
        key: "this_month" as DatePreset,
        label: `Bulan Ini (${ID_MONTHS_SHORT[currM]} ${currY})`,
      },
      {
        key: "last_month" as DatePreset,
        label: `Bulan Lalu (${ID_MONTHS_SHORT[prevM]} ${prevY})`,
      },
      { key: "this_year" as DatePreset, label: `Tahun ${currY}` },
      { key: "all" as DatePreset, label: "Semua Waktu" },
    ];
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        onClick={handleToggleOpen}
        className={cn(
          "flex h-10 items-center gap-2 rounded-xl border border-border/80 bg-background/80 hover:bg-muted/50 px-3.5 text-xs font-semibold text-foreground/90 shadow-xs transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-500",
          isOpen && "border-teal-500 ring-1 ring-teal-500 bg-muted/40"
        )}
      >
        <CalendarIcon className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
        <span className="truncate max-w-[150px] sm:max-w-[200px]">
          {dateLabel}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0",
            isOpen && "rotate-180 text-foreground"
          )}
        />
      </button>

      {/* POPOVER PANEL */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2.5 z-50 w-[calc(100vw-2rem)] sm:w-[640px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-4 sm:p-5 text-foreground animate-in fade-in zoom-in-95 duration-150">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            {/* LEFT COLUMN: QUICK PRESETS */}
            <div className="w-full sm:w-[220px] shrink-0 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 pb-3 sm:pb-0 sm:pr-4 space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 px-3 pb-1 block">
                Pilihan Cepat
              </span>
              <div className="space-y-1">
                {presetOptions.map((item) => {
                  const isSelected = tempPreset === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handlePresetSelect(item.key)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-all text-left cursor-pointer",
                        isSelected
                          ? "bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300 font-semibold shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                      )}
                    >
                      <span className="whitespace-nowrap tracking-normal">{item.label}</span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: CALENDAR */}
            <div className="flex-1 space-y-3.5 min-w-0">
              {/* Header Nav */}
              <div className="flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
                  title="Bulan sebelumnya"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="text-sm font-bold text-foreground tracking-tight">
                  {ID_MONTHS_FULL[viewMonth]} {viewYear}
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
                  title="Bulan berikutnya"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Day Header Row */}
              <div className="grid grid-cols-7 text-center">
                {DAYS_HEADER.map((day) => (
                  <span
                    key={day}
                    className="text-[11px] font-semibold text-muted-foreground py-1 tracking-wide"
                  >
                    {day}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-y-1.5 text-xs">
                {calendarCells.map((cell, idx) => {
                  const isStart = selectedRange.start === cell.dateStr;
                  const isEnd = selectedRange.end === cell.dateStr;
                  const isSingle = isStart && isEnd;
                  const inRange =
                    selectedRange.start &&
                    selectedRange.end &&
                    cell.dateStr >= selectedRange.start &&
                    cell.dateStr <= selectedRange.end;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleDateClick(cell.dateStr)}
                      className={cn(
                        "h-8.5 sm:h-9 flex items-center justify-center transition-all cursor-pointer relative text-xs font-medium select-none",
                        !cell.isCurrentMonth && "text-slate-300 dark:text-slate-700",
                        cell.isCurrentMonth &&
                          !inRange &&
                          "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:rounded-xl",
                        cell.isToday &&
                          !inRange &&
                          "font-bold text-teal-600 dark:text-teal-400",
                        inRange && "bg-teal-500/15 text-foreground font-semibold",
                        isStart &&
                          "rounded-l-xl bg-teal-600 text-white dark:bg-teal-500 dark:text-slate-950 font-bold shadow-xs",
                        isEnd &&
                          "rounded-r-xl bg-teal-600 text-white dark:bg-teal-500 dark:text-slate-950 font-bold shadow-xs",
                        isSingle &&
                          "rounded-xl bg-teal-600 text-white dark:bg-teal-500 dark:text-slate-950 font-bold shadow-xs"
                      )}
                    >
                      <span>{cell.dayNumber}</span>
                      {cell.isToday && !inRange && (
                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-teal-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* BOTTOM ACTION BAR */}
          <div className="mt-5 pt-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
              <Clock className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="font-medium text-foreground text-xs truncate">
                {summaryText}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  resetFilters();
                  setIsOpen(false);
                }}
                className="flex items-center gap-1.5 h-8.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="flex items-center gap-1.5 h-8.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Terapkan Filter</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
