import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

const THEME_KEY = "reastock_theme";
const ALLOWED = new Set(["warm", "light", "dark"]);

export function ThemeProvider({ children }) {
  // Inisialisasi state langsung dari localStorage untuk menghindari flicker
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = (localStorage.getItem(THEME_KEY) || "").toLowerCase();
      return ALLOWED.has(saved) ? saved : "warm";
    } catch (e) {
      return "warm";
    }
  });

  // Sinkronisasi atribut data-theme ke <html> dan simpan ke localStorage
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      // ignore
    }
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: (next) => {
        const n = (next || "").toLowerCase();
        if (ALLOWED.has(n)) setThemeState(n);
      },
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
