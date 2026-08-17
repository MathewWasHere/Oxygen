"use client";

import { useSyncExternalStore } from "react";

/**
 * Reads the wall clock as an external store instead of calling Date.now()
 * during render. The snapshot is bucketed to `intervalMs` so it stays stable
 * between notifications, and the server snapshot is 0 so SSR and the first
 * client render always agree (no hydration mismatch).
 */
export function useNow(intervalMs = 30_000): number {
  return useSyncExternalStore(
    (onChange) => {
      const timer = setInterval(onChange, intervalMs);
      return () => clearInterval(timer);
    },
    () => Math.floor(Date.now() / intervalMs) * intervalMs,
    () => 0,
  );
}
