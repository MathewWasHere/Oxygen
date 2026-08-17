"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { STATUS_FLOW, STATUS_SHORT, STATUS_SENTENCE } from "@/lib/order-machine";
import { toFa } from "@/lib/format";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import type { Order } from "@/lib/types";

/**
 * LIVE ORDER BANNER — sits above the hero while an order is in flight.
 *
 * Modelled on the "active delivery" cards in mature food-delivery apps: a
 * single high-signal strip that answers "where is my food?" at a glance, with
 * a compact step rail and an ETA. Prominent, but it never becomes a wall — it
 * collapses to one row of essentials on small phones.
 */

const ACTIVE: ReadonlyArray<Order["status"]> = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
];

function pickActiveOrder(orders: Order[]): Order | null {
  const live = orders.filter((o) => ACTIVE.includes(o.status));
  if (live.length === 0) return null;
  return live.reduce((a, b) => (b.createdAt > a.createdAt ? b : a));
}

export function LiveOrderBanner() {
  const { state } = useStore();
  const now = useNow(30_000);
  const order = pickActiveOrder(state.orders);

  if (!order) return null;

  const steps = order.deliveryMethod === "PICKUP"
    ? STATUS_FLOW.filter((s) => s !== "OUT_FOR_DELIVERY")
    : STATUS_FLOW;

  const stepNo = steps.findIndex((s) => s === order.status) + 1;
  const progress = Math.max(6, Math.round((stepNo / steps.length) * 100));

  // ETA — guarded so it never renders a negative number.
  const elapsedMin = now > 0 ? Math.floor((now - order.createdAt) / 60_000) : 0;
  const remaining = Math.max(0, order.etaMinutes - elapsedMin);

  const outForDelivery = order.status === "OUT_FOR_DELIVERY";
  const ready = order.status === "READY";

  return (
    <section className="border-b border-[var(--surface-border)] bg-ink-900">
      <div className="shell py-2.5 sm:py-4">
        <Link
          href={`/order?id=${order.id}`}
          prefetch={false}
          /*
           * LIVE ORDER BANNER (items 6-12)
           *
           * Restructured as a compact status banner with a real hierarchy
           * instead of one dense block:
           *
           *   row 1  order number + live badge          (identity)
           *   row 2  status sentence, max 2 lines       (main message)
           *   row 3  ETA + stage                        (metadata)
           *   row 4  progress bar                       (progress)
           *   row 5  CTA                                (action)
           *
           * The CARD gained padding and the type got smaller/calmer — the
           * opposite of shrinking text to force a fit (item 8).
           */
          className="group block rounded-2xl border border-flame-600/30 bg-ink-850 p-3 transition-colors hover:border-flame-600/55 sm:p-4"
        >
          {/* ---- Row 1: identity + live badge ---- */}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "relative grid size-7 shrink-0 place-items-center rounded-full sm:size-8",
                outForDelivery || ready
                  ? "bg-emerald-500/15 text-emerald-500"
                  : "bg-flame-600/15 text-flame-600",
              )}
            >
              <Icon
                name={outForDelivery ? "bike" : ready ? "check" : "clock"}
                className="size-3.5"
              />
            </span>

            <span className="num text-[13px] font-extrabold text-mist-100">
              سفارش #{toFa(order.number)}
            </span>

            {/*
              Small pulsing dot instead of a large animated ring (item 12).
              `animate-pulse-dot` inherits currentColor and is disabled under
              prefers-reduced-motion by the global accessibility block.
            */}
            <span
              className={cn(
                "mr-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11.5px] font-bold",
                outForDelivery || ready
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                  : "border-flame-600/30 bg-flame-600/10 text-flame-600",
              )}
            >
              <span
                className={cn(
                  "size-1.5 shrink-0 animate-pulse-dot rounded-full",
                  outForDelivery || ready
                    ? "bg-emerald-500 text-emerald-500/45"
                    : "bg-flame-600 text-flame-600/45",
                )}
              />
              فعال
            </span>
          </div>

          {/* ---- Row 2: status message, capped at 2 lines, wraps naturally ---- */}
          <p className="mt-2 line-clamp-2 text-[13px] font-bold leading-6 text-mist-100 sm:text-[14px]">
            {STATUS_SENTENCE[order.status]}
          </p>

          {/* ---- Row 3: ETA + stage. Number and unit are one inline group so
                  they can never look detached (item 10). ---- */}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-mist-500">
            {remaining > 0 ? (
              <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                <Icon name="clock" className="size-3.5 shrink-0 translate-y-0.5 text-flame-600" />
                <span className="num font-extrabold text-flame-600">{toFa(remaining)}</span>
                <span className="text-mist-400">دقیقه تا تحویل</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                <Icon name="check" className="size-3.5 shrink-0" />
                {STATUS_SHORT[order.status]}
              </span>
            )}
            <span className="whitespace-nowrap">
              مرحله <span className="num">{toFa(stepNo)}</span> از{" "}
              <span className="num">{toFa(steps.length)}</span>
            </span>
          </div>

          {/* ---- Row 4: progress. Sits inside the card's padding box, so it
                  keeps equal side spacing and never touches the corners
                  (item 11). ---- */}
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[var(--white-a10)]">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                outForDelivery || ready ? "bg-emerald-500" : "bg-flame-600",
              )}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* ---- Row 5: CTA ---- */}
          <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-[var(--hairline)] pt-2.5">
            <span className="hidden text-[12.5px] text-mist-500 sm:inline">
              جزئیات کامل سفارش را ببینید
            </span>
            <span className="inline-flex items-center gap-1 text-[12.5px] font-extrabold text-flame-600 sm:mr-auto">
              پیگیری سفارش
              <Icon name="chevron" className="size-3.5 shrink-0" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
