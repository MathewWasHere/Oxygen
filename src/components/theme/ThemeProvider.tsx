"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "oxygen.theme.v1";

/**
 * Runs before paint (injected in <head>) so the correct theme is applied on the
 * very first frame and the user never sees a flash of the wrong palette.
 * Light is the product default; we only fall back to the OS preference when the
 * visitor has explicitly never chosen.
 */
export const THEME_INIT_SCRIPT = `(function(){try{
var k=${JSON.stringify(THEME_STORAGE_KEY)};
var s=localStorage.getItem(k);
var t=(s==="light"||s==="dark")?s:"light";
document.documentElement.setAttribute("data-theme",t);
document.documentElement.style.colorScheme=t;
}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

/* --------------------------------------------------------------------------
 * The document element IS the source of truth for the theme (the head script
 * sets it before hydration). Rather than mirroring that into React state via
 * an effect — which causes a cascading render — we subscribe to it directly
 * with useSyncExternalStore.
 * ------------------------------------------------------------------------ */

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function getSnapshot(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light"; // light is the default, so SSR and first paint agree
}

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", theme === "dark" ? "#000000" : "#ffffff");
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
    emit();
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(
      (document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark") as Theme,
    );
  }, [setTheme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/* Keep multiple tabs in sync — registered once at module scope, outside React. */
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== THEME_STORAGE_KEY) return;
    const v = e.newValue;
    if (v === "light" || v === "dark") {
      applyTheme(v);
      emit();
    }
  });
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return { theme: "light", setTheme: () => {}, toggleTheme: () => {} };
  }
  return ctx;
}
