"use client";

import type { Order, OrderStatus } from "@/lib/types";
import { STATUS_FLOW, STATUS_LABEL, statusIndex } from "@/lib/order-machine";
import { faTime } from "@/lib/format";
import { cn } from "@/lib/cn";

const DESCRIPTIONS: Record<string, string> = {
  PENDING: "سفارش شما در سیستم اکسیژن ثبت شد.",
  CONFIRMED: "رستوران سفارش را پذیرفت.",
  PREPARING: "آشپزخانه در حال آماده‌سازی غذای شماست.",
  READY: "غذا آماده است و منتظر پیک.",
  OUT_FOR_DELIVERY: "پیک اکسیژن سفارش را برداشت و در راه است.",
  DELIVERED: "سفارش تحویل داده شد. نوش جان!",
};

/* --------------------------------------------------------------------------
 * STEP ICONS
 * Every glyph is drawn on the same 24x24 grid and centred on (12,12), then
 * rendered as an absolutely-positioned, fully-stretched SVG inside the circle.
 * That guarantees true optical centring in every state — the previous version
 * used text characters ("✓", "●"), which sit on a font baseline and can never
 * be centred reliably.
 * ------------------------------------------------------------------------ */

function StepGlyph({ state }: { state: "done" | "active" | "todo" }) {
  if (state === "done") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="absolute inset-0 size-full"
      >
        {/* Checkmark balanced around the circle centre (12,12). */}
        <path d="M7.4 12.3 10.6 15.4 16.6 9" />
      </svg>
    );
  }
  if (state === "active") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="absolute inset-0 size-full">
        <circle cx="12" cy="12" r="4.2" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="absolute inset-0 size-full">
      <circle cx="12" cy="12" r="3.4" fill="none" stroke="currentColor" strokeWidth={2} />
    </svg>
  );
}

/** Shared circle: fixed size, icon inset keeps a consistent icon-to-circle ratio. */
export function StepCircle({
  state,
  className,
}: {
  state: "done" | "active" | "todo";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative z-10 grid size-8 shrink-0 place-items-center rounded-full transition-all",
        state === "done" && "bg-emerald-500 text-white ring-1 ring-emerald-500/40",
        // `live-ring` paints on ::after, so the circle's box and its
        // grid-centred glyph are untouched — the pulse cannot shift the icon.
        state === "active" && "live-ring bg-flame-600 text-white ring-4 ring-flame-500/20",
        state === "todo" && "border border-[var(--surface-border-strong)] bg-ink-850 text-mist-500",
        className,
      )}
    >
      {/* 60% inset -> uniform icon-to-circle ratio across all three states. */}
      <span className="relative block size-[62%]">
        <StepGlyph state={state} />
      </span>
    </span>
  );
}

export function OrderTimeline({ order }: { order: Order }) {
  const current = statusIndex(order.status);
  const cancelled = order.status === "CANCELLED" || order.status === "PAYMENT_FAILED";
  const steps: OrderStatus[] =
    order.deliveryMethod === "PICKUP"
      ? STATUS_FLOW.filter((s) => s !== "OUT_FOR_DELIVERY")
      : STATUS_FLOW;

  if (cancelled) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/8 p-5 text-center">
        <span className="mx-auto grid size-11 place-items-center rounded-full bg-red-500/15 text-red-500">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            aria-hidden="true"
            className="size-6"
          >
            <path d="M12 7.5v5.5" />
            <circle cx="12" cy="16.6" r="0.9" fill="currentColor" stroke="none" />
            <circle cx="12" cy="12" r="9" strokeWidth={1.6} />
          </svg>
        </span>
        <h3 className="mt-2.5 text-[15px] font-extrabold text-red-500">
          {STATUS_LABEL[order.status]}
        </h3>
        <p className="mt-1.5 text-[13px] text-mist-400">
          برای پیگیری با شماره رستوران تماس بگیرید.
        </p>
      </div>
    );
  }

  return (
    <ol className="relative">
      {steps.map((status, i) => {
        const index = STATUS_FLOW.indexOf(status);
        const done = index < current;
        const active = index === current;
        const state = done ? "done" : active ? "active" : "todo";
        const event = order.events.find((e) => e.status === status);
        const last = i === steps.length - 1;

        return (
          <li key={status} className="relative flex gap-3.5 pb-6 last:pb-0">
            {/* Connector: starts exactly at the circle's bottom edge and is
                centred on the circle's axis (circle is 32px -> centre 16px). */}
            {!last && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-9 h-[calc(100%-2.25rem)] w-0.5 rounded-full",
                  "right-[15px]",
                  done ? "bg-emerald-500/45" : "bg-[var(--white-a10)]",
                )}
              />
            )}

            <StepCircle state={state} />

            <div className="min-w-0 flex-1 pt-[5px]">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "text-[13.5px] font-extrabold",
                    done ? "text-mist-100" : active ? "text-flame-500" : "text-mist-500",
                  )}
                >
                  {STATUS_LABEL[status]}
                </span>
                {event && <span className="num text-[12.5px] text-mist-500">{faTime(event.at)}</span>}
              </div>
              {(done || active) && (
                <p className="mt-1 text-[13px] leading-6 text-mist-400">{DESCRIPTIONS[status]}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
