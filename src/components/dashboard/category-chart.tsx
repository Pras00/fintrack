"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCompactRupiah, formatRupiah } from "@/lib/utils";
import { PieChart as PieIcon } from "lucide-react";

const CATEGORY_DATA = [
  { name: "Makanan & Minuman", value: 3450000, color: "#E11D48", percent: 36 },
  { name: "Tagihan & Utilitas", value: 2100000, color: "#0D9488", percent: 22 },
  { name: "Transportasi", value: 1450000, color: "#2563EB", percent: 15 },
  { name: "Belanja & Kebutuhan", value: 1350000, color: "#F59E0B", percent: 14 },
  { name: "Hiburan & Rekreasi", value: 1200000, color: "#8B5CF6", percent: 13 },
];

export function CategoryChart() {
  const [isMounted, setIsMounted] = useState(false);
  const totalExpense = CATEGORY_DATA.reduce((acc, curr) => acc + curr.value, 0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Card className="col-span-1 lg:col-span-4 flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <PieIcon className="h-4 w-4 text-rose-500" />
            Distribusi Pengeluaran
          </CardTitle>
          <span className="text-[11px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
            Bulan Ini
          </span>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Alokasi 5 kategori pengeluaran terbesar
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Donut Chart with Centered Total */}
        <div className="relative h-[190px] w-full min-w-0">
          {isMounted ? (
            <ResponsiveContainer width="100%" height={190}>
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={CATEGORY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {CATEGORY_DATA.map((entry, index) => (
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
          ) : (
            <div className="h-[190px] w-full animate-pulse bg-muted/20 rounded-full flex items-center justify-center text-xs text-muted-foreground">
              Memuat diagram...
            </div>
          )}

          {/* Center Callout Metric */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Total Keluar
            </span>
            <span className="text-base font-bold tabular-nums text-foreground">
              {formatCompactRupiah(totalExpense)}
            </span>
          </div>
        </div>

        {/* High Density Category Breakdown Legend */}
        <div className="mt-2 space-y-2 border-t border-border/40 pt-3">
          {CATEGORY_DATA.map((cat) => (
            <div key={cat.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="truncate text-muted-foreground font-medium">{cat.name}</span>
              </div>
              <div className="flex items-center gap-2 tabular-nums">
                <span className="font-semibold text-foreground">{formatCompactRupiah(cat.value)}</span>
                <span className="text-[11px] text-muted-foreground w-7 text-right">
                  {cat.percent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
