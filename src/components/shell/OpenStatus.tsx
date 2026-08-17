"use client";

import { RESTAURANT } from "@/lib/data/catalog";
import { toFa } from "@/lib/format";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/cn";

/**
 * Compact open/closed pill that lives in the header next to the cart.
 *
 * Designed to add signal without crowding: on phones it collapses to a dot +
 * one word, and only expands to include the hours once there is room.
 */

const OPEN_HOUR = RESTAURANT.openFrom;
const CLOSE_HOUR = RESTAURANT.openTo;

function computeOpen(d: Date): boolean {
  const h = d.getHours();
  return h >= OPEN_HOUR || h < CLOSE_HOUR;
}

export function useIsOpen(): boolean {
  // Re-evaluate every minute; never call Date.now() during render.
  const now = useNow(60_000);
  return computeOpen(new Date(now));
}

export function OpenStatus({ className }: { className?: string }) {
  const open = useIsOpen();

  return (
    <span
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[12.5px] font-bold whitespace-nowrap sm:h-10 sm:gap-2 sm:px-3 sm:text-[13px]",
        open
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
          : "border-[var(--surface-border-strong)] bg-[var(--white-a6)] text-mist-400",
        className,
      )}
      title={open ? `باز است — ${RESTAURANT.hours}` : `بسته است — ${RESTAURANT.hours}`}
    >
      <span
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          open ? "animate-pulse-dot bg-emerald-500 text-emerald-500/45" : "bg-mist-500",
        )}
      />
      <span suppressHydrationWarning>{open ? "باز است" : "بسته است"}</span>
      {/* Hours only appear where the header has room to breathe. */}
      <span className="num hidden text-mist-400 lg:inline" dir="ltr">
        {toFa("۱۱:۰۰–۰۱:۰۰")}
      </span>
    </span>
  );
}
