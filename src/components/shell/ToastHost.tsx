"use client";

import Image from "next/image";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

export function ToastHost() {
  const { toasts, dismissToast } = useStore();

  return (
    /*
      Inset from every edge at all sizes. On phones the toast is centred with a
      real gutter; from sm it docks bottom-right with a 1.5rem inset. It never
      touches the viewport edge, and `max-w-sm` keeps it off the page content.
    */
    <div className="pointer-events-none fixed inset-x-0 top-3 z-200 flex flex-col items-center gap-2 px-3 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:top-auto sm:items-end sm:px-0">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismissToast(t.id)}
          className={cn(
            /* Neutral elevation only — the red ambient glow read as a neon
               effect and fought the brand's clean, solid surfaces. */
            "pointer-events-auto flex w-full max-w-sm animate-fade-up items-center gap-3 rounded-2xl border bg-ink-850 p-3 text-right shadow-[0_10px_34px_-12px_rgba(0,0,0,0.30)]",
            t.tone === "success"
              ? "border-flame-600/30"
              : t.tone === "error"
                ? "border-red-500/30"
                : "border-[var(--surface-border)]",
          )}
        >
          {t.image ? (
            <Image
              src={t.image}
              alt=""
              width={44}
              height={44}
              className="size-11 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <span
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-xl",
                t.tone === "error" ? "bg-red-500/12 text-red-600" : "bg-flame-600/12 text-flame-600",
              )}
            >
              <Icon name={t.tone === "error" ? "alert" : "check"} className="size-5" />
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-bold text-mist-100">{t.title}</span>
            {t.description && (
              <span className="block truncate text-[13px] text-mist-400">{t.description}</span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
