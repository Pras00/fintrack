"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCompactRupiah, formatRupiah } from "@/lib/utils";
import { PieChart as PieIcon, Loader2, Inbox } from "lucide-react";
import { getCategoryDistributionAction, CategoryDistributionItem } from "@/actions/dashboard";
import { useFilterStore } from "@/stores/use-filter-store";

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function CategoryChart() {
  const isMounted = useIsMounted();
  const [categories, setCategories] = useState<CategoryDistributionItem[]>([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { startDate, endDate, dateLabel } = useFilterStore();

  useEffect(() => {
    let ignore = false;

    async function loadCategories() {
      try {
        const res = await getCategoryDistributionAction(startDate, endDate);
        if (!ignore) {
          setCategories(res.data);
          setTotalExpense(res.totalExpense);
          setIsLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Gagal memuat distribusi kategori riil:", err);
          setIsLoading(false);
        }
      }
    }

    loadCategories();

    const handleTransactionChange = () => {
      loadCategories();
    };

    window.addEventListener("fintrack:transaction-created", handleTransactionChange);
    window.addEventListener("fintrack:transaction-updated", handleTransactionChange);
    window.addEventListener("fintrack:transaction-deleted", handleTransactionChange);

    return () => {
      ignore = true;
      window.removeEventListener("fintrack:transaction-created", handleTransactionChange);
      window.removeEventListener("fintrack:transaction-updated", handleTransactionChange);
      window.removeEventListener("fintrack:transaction-deleted", handleTransactionChange);
    };
  }, [startDate, endDate]);

  return (
    <Card className="col-span-1 lg:col-span-4 flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <PieIcon className="h-4 w-4 text-rose-500" />
            Distribusi Pengeluaran
          </CardTitle>
          <span className="text-[11px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md truncate max-w-[120px]">
            {dateLabel || "Bulan Ini"}
          </span>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Alokasi kategori pengeluaran riil dari database
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Donut Chart with Centered Total */}
        <div className="relative h-[190px] w-full min-w-0">
          {isLoading ? (
            <div className="h-[190px] w-full flex items-center justify-center text-xs text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
              <span>Memuat kategori...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="h-[190px] w-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
              <Inbox className="h-8 w-8 text-muted-foreground/40 mb-1.5" />
              <p className="text-xs font-semibold text-foreground">Belum Ada Pengeluaran</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Pengeluaran pada periode ini akan dikelompokkan di sini.
              </p>
            </div>
          ) : isMounted ? (
            <>
              <ResponsiveContainer width="100%" height={190}>
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-border/80 bg-popover/95 p-2.5 shadow-xl text-xs backdrop-blur-md text-popover-foreground">
                            <div className="flex items-center gap-2 font-medium">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: data.color }}
                              />
                              <span className="text-foreground">{data.name}</span>
                            </div>
                            <div className="mt-1 font-semibold tabular-nums text-foreground">
                              {formatRupiah(data.value)} ({data.percent}%)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Callout Metric */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Total Keluar
                </span>
                <span className="text-base font-bold tabular-nums text-foreground">
                  {formatCompactRupiah(totalExpense)}
                </span>
              </div>
            </>
          ) : null}
        </div>

        {/* High Density Category Breakdown Legend */}
        {categories.length > 0 && (
          <div className="mt-2 space-y-2 border-t border-border/40 pt-3">
            {categories.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate text-muted-foreground font-medium">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2 tabular-nums">
                  <span className="font-semibold text-foreground">
                    {formatCompactRupiah(cat.value)}
                  </span>
                  <span className="text-[11px] text-muted-foreground w-7 text-right">
                    {cat.percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
