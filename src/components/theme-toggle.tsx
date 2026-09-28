"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-background/60 hover:bg-muted/60 text-foreground transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-ring overflow-hidden group shadow-xs cursor-pointer active:scale-95"
      aria-label="Toggle theme"
      title={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
    >
      {/* Sun Icon */}
      <span
        className={`absolute inset-0 flex items-center justify-center text-amber-500 transition-all duration-300 ease-out transform ${
          isDark
            ? "rotate-90 scale-0 opacity-0 -translate-y-3"
            : "rotate-0 scale-100 opacity-100 translate-y-0"
        }`}
      >
        <Sun className="h-4 w-4" />
      </span>

      {/* Moon Icon */}
      <span
        className={`absolute inset-0 flex items-center justify-center text-sky-400 transition-all duration-300 ease-out transform ${
          isDark
            ? "rotate-0 scale-100 opacity-100 translate-y-0"
            : "-rotate-90 scale-0 opacity-0 translate-y-3"
        }`}
      >
        <Moon className="h-4 w-4" />
      </span>
    </button>
  );
}
