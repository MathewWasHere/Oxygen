"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "oxygen.install.dismissed.v4";
export const INSTALL_REQUEST_EVENT = "oxygen:install-request";

/**
 * "Add to home screen" banner.
 *
 * Chrome/Edge on Android fire `beforeinstallprompt` when the PWA criteria are
 * met (HTTPS, manifest, active service worker). We capture the event and show
 * a branded banner instead of relying on the browser's subtle menu item.
 * iOS Safari never fires it, so we show manual instructions there instead.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [manualHint, setManualHint] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return; // already installed

    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      /* private mode */
    }

    const ua = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|Chrome/.test(ua);
    const isIOSSafari = isIOS && isSafari;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      deferredRef.current = promptEvent;
      setDeferred(promptEvent);
      setIosHint(false);
      setManualHint(false);
      if (!dismissed) setVisible(true);
    };

    // The explicit button in the hamburger drawer always works, even when the
    // automatic banner was dismissed earlier. If the browser has not exposed
    // a native install prompt, show the correct manual instruction instead.
    const onInstallRequest = () => {
      setIosHint(isIOSSafari);
      setManualHint(!isIOSSafari && !deferredRef.current);
      setVisible(true);
    };

    const onInstalled = () => setVisible(false);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener(INSTALL_REQUEST_EVENT, onInstallRequest);
    window.addEventListener("appinstalled", onInstalled);

    const iosTimer =
      isIOSSafari && !dismissed
        ? window.setTimeout(() => {
            setIosHint(true);
            setVisible(true);
          }, 2500)
        : undefined;

    return () => {
      if (iosTimer !== undefined) window.clearTimeout(iosTimer);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener(INSTALL_REQUEST_EVENT, onInstallRequest);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* private mode */
    }
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    deferredRef.current = null;
    setDeferred(null);
    setManualHint(false);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className={cn(
        "pb-safe fixed inset-x-3 bottom-20 z-90 animate-fade-up rounded-2xl border border-flame-600/35",
        "bg-ink-900 pad-card shadow-[0_14px_40px_-16px_rgba(0,0,0,0.35)]",
        "sm:right-auto sm:left-6 sm:bottom-6 sm:max-w-sm lg:bottom-6",
      )}
      role="dialog"
      aria-label="نصب اپلیکیشن اکسیژن"
    >
      <div className="flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/oxygen-pwa-192-v4.png"
          alt="لوگوی اپ فست فود اکسیژن"
          width={48}
          height={48}
          className="size-12 shrink-0 rounded-2xl border border-flame-600/30 bg-flame-600"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-extrabold text-mist-100">نصب فست فود اکسیژن</h3>
          <p className="mt-1 text-[13px] leading-6 text-mist-400">
            {iosHint
              ? "دکمه اشتراک‌گذاری مرورگر را بزن و «Add to Home Screen» را انتخاب کن."
              : manualHint
                ? "از منوی مرورگر گزینه «نصب برنامه» یا «افزودن به صفحه اصلی» را انتخاب کن."
                : "هر لقمه، یک نفس تازه — منوی اکسیژن همیشه روی صفحه اصلی گوشی تو."}
          </p>
        </div>
        <button
          onClick={dismiss}
          aria-label="بستن"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--white-a6)] text-mist-400 transition-colors hover:bg-[var(--white-a10)] hover:text-mist-100"
        >
          <Icon name="close" className="size-4" />
        </button>
      </div>

      {!iosHint && !manualHint && deferred && (
        <button
          onClick={install}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-flame-600 text-[13px] font-extrabold text-white transition-all hover:brightness-110 active:scale-[0.98]"
        >
          <Icon name="plus" className="size-4" />
          نصب اپ اکسیژن
        </button>
      )}
    </div>
  );
}
