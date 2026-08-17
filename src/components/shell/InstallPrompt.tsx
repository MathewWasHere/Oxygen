"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "oxygen.install.dismissed.v4";

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
  const [iosHint, setIosHint] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return; // already installed
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const ua = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|Chrome/.test(ua);
    if (isIOS && isSafari) {
      const t = setTimeout(() => {
        setIosHint(true);
        setVisible(true);
      }, 2500);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", onPrompt);
      };
    }

    const onInstalled = () => setVisible(false);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
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
    setDeferred(null);
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

      {!iosHint && (
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
