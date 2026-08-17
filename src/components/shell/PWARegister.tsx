"use client";

import { useEffect } from "react";

/**
 * Registers the service worker in production builds.
 *
 * Note: this effect frequently runs *after* window "load" has already fired,
 * so we must handle the already-loaded case instead of only subscribing to the
 * event — otherwise registration silently never happens.
 */
export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    // Service workers require a secure context (HTTPS or localhost).
    if (!window.isSecureContext) return;

    // Defer past the load event AND past the browser's idle point, so SW
    // installation never competes for bandwidth with the first paint.
    const register = () => {
      const go = () => navigator.serviceWorker.register("/sw.js").catch(() => undefined);
      if ("requestIdleCallback" in window) {
        (window as Window & {
          requestIdleCallback: (cb: () => void, o?: { timeout: number }) => number;
        }).requestIdleCallback(go, { timeout: 4000 });
      } else {
        setTimeout(go, 2000);
      }
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
