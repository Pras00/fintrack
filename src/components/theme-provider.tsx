"use client";

import * as React from "react";

export type Theme = "system" | "dark" | "light";
export type ResolvedTheme = "dark" | "light";

export interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextType>({
  theme: "system",
  resolvedTheme: "dark",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = React.useState<ResolvedTheme>("dark");

  const applyTheme = React.useCallback((t: Theme) => {
    let resolved: ResolvedTheme = "dark";
    if (t === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      resolved = prefersDark ? "dark" : "light";
    } else {
      resolved = t;
    }

    setResolvedTheme(resolved);
    if (resolved === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("fintrack-theme") as Theme | null;
      const initialTheme: Theme = saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
      setThemeState(initialTheme);
      applyTheme(initialTheme);
    } catch {
      applyTheme("system");
    }

    // Listener for system OS theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const currentSaved = localStorage.getItem("fintrack-theme");
      if (!currentSaved || currentSaved === "system") {
        const newResolved = e.matches ? "dark" : "light";
        setResolvedTheme(newResolved);
        if (newResolved === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [applyTheme]);

  const setTheme = React.useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      try {
        if (newTheme === "system") {
          localStorage.removeItem("fintrack-theme");
        } else {
          localStorage.setItem("fintrack-theme", newTheme);
        }
      } catch {}
      applyTheme(newTheme);
    },
    [applyTheme]
  );

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return React.useContext(ThemeContext);
}
