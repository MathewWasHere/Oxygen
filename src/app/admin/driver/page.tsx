"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { useCurrentAdmin, usePermission } from "@/lib/use-roles";
import { faNumber, faTime, toFa } from "@/lib/format";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { RESTAURANT } from "@/lib/data/catalog";
import type { Order, OrderStatus } from "@/lib/types";

/**
 * DRIVER WORKSPACE — «پیک من»
 *
 * A showcase surface for the DRIVER role. It reuses the real order store and
 * the real state machine, so statuses advance exactly as they do elsewhere; the
 * only mocked part is the courier↔order assignment (Stage 2 adds an
 * `Order.driverId` relation and this page reads that instead).
 *
 * Privacy: a courier sees the delivery address, the customer's first name and a
 * call button — never the full customer record, order history or payment data.
 */

type Lane = "queue" | "active" | "done";

function laneOf(status: OrderStatus): Lane | null {
  if (status === "READY") return "queue";
  if (status === "OUT_FOR_DELIVERY") return "active";
  if (status === "DELIVERED") return "done";
  return null;
}

const LANES: Array<{ key: Lane; label: string; icon: IconName; tone: string }> = [
  { key: "queue", label: "در انتظار تحویل", icon: "box", tone: "text-amber-600" },
  { key: "active", label: "در حال ارسال", icon: "bike", tone: "text-sky-600" },
  { key: "done", label: "تحویل شده", icon: "check", tone: "text-emerald-600" },
];

export default function DriverPage() {
  const { state, setOrderStatus, pushToast } = useStore();
  const allow = usePermission();
  const canSeeDashboard = allow("dashboard.view");
  const me = useCurrentAdmin();
  const [lane, setLane] = useState<Lane>("queue");

  const buckets = useMemo(() => {
    const b: Record<Lane, Order[]> = { queue: [], active: [], done: [] };
    state.orders
      .filter((o) => o.deliveryMethod !== "PICKUP")
      .forEach((o) => {
        const l = laneOf(o.status);
        if (l) b[l].push(o);
      });
    (Object.keys(b) as Lane[]).forEach((k) => b[k].sort((x, y) => y.createdAt - x.createdAt));
    return b;
  }, [state.orders]);

  const current = buckets.active[0] ?? null;

  const todayCount = buckets.done.length;
  const todayValue = buckets.done.reduce((s, o) => s + o.total, 0);

  function pickUp(o: Order) {
    setOrderStatus(o.id, "OUT_FOR_DELIVERY");
    pushToast({ title: `سفارش #${toFa(o.number)} تحویل پیک شد`, tone: "success" });
  }

  function deliver(o: Order) {
    setOrderStatus(o.id, "DELIVERED");
    pushToast({ title: `سفارش #${toFa(o.number)} تحویل داده شد`, tone: "success" });
  }

  return (
    <div className="space-y-3">
      {/* ---------- Header ---------- */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-[17px] font-extrabold leading-tight text-mist-100">پیک من</h1>
          <p className="mt-0.5 text-[11.5px] text-mist-500">
            {me.name} — مسیرهای امروز شما
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/*
            EXIT ROUTE (item 17).
            A DRIVER's sidebar contains exactly one entry, so without this the
            page is a cul-de-sac for any manager who opens it. Shown only to
            roles that can actually open the dashboard, so a real courier is
            never offered a link that would 'permission-deny' on arrival.
          */}
          {canSeeDashboard && (
            <Link
              href="/admin"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[var(--surface-border)] bg-[var(--white-a4)] px-2.5 text-[11.5px] font-bold text-mist-300 transition-colors hover:text-mist-100"
            >
              <Icon name="chart" className="size-3.5 shrink-0" />
              بازگشت به پنل
            </Link>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11.5px] font-bold text-emerald-600">
            <span className="size-1.5 animate-pulse-dot rounded-full bg-emerald-500 text-emerald-500/45" />
            آنلاین
          </span>
        </div>
      </div>

      {/* ---------- Daily summary ---------- */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "تحویل امروز", value: toFa(todayCount), icon: "check" as IconName },
          { label: "در صف", value: toFa(buckets.queue.length), icon: "box" as IconName },
          { label: "ارزش تحویل‌ها", value: faNumber(todayValue), icon: "chart" as IconName },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-[var(--surface-border)] bg-ink-900 px-2.5 py-2"
          >
            <div className="flex items-center gap-1.5 text-[10.5px] text-mist-500">
              <Icon name={s.icon} className="size-3.5 shrink-0 text-flame-600" />
              <span className="truncate">{s.label}</span>
            </div>
            <div className="num mt-1 truncate text-[15px] font-extrabold text-mist-100">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ---------- Current delivery (hero card) ---------- */}
      {current && (
        <section className="overflow-hidden rounded-xl border border-flame-600/35 bg-ink-900">
          <div className="flex items-center gap-2.5 border-b border-[var(--hairline)] px-3 py-2">
            <span className="relative grid size-8 shrink-0 place-items-center rounded-full bg-flame-600/15 text-flame-600">
              <Icon name="bike" className="size-4" />
              <span className="absolute inset-0 animate-ping-slow rounded-full ring-2 ring-flame-600/30" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[10.5px] font-extrabold tracking-wide text-flame-600">
                در حال ارسال
              </div>
              <div className="num truncate text-[13px] font-extrabold text-mist-100">
                #{toFa(current.number)}
              </div>
            </div>
            <a
              href={`tel:${current.customer.phone}`}
              className="grid size-9 place-items-center rounded-lg border border-[var(--surface-border-strong)] text-mist-200 transition-colors hover:border-flame-600/50 hover:text-flame-600"
              aria-label="تماس با مشتری"
            >
              <Icon name="phone" className="size-4" />
            </a>
          </div>

          <div className="space-y-2 px-3 py-2.5">
            <DeliveryRow
              icon="pin"
              label="آدرس تحویل"
              value={current.address?.line ?? RESTAURANT.address}
            />
            <DeliveryRow icon="user" label="تحویل‌گیرنده" value={current.address?.recipientName ?? current.customer.name} />
            <DeliveryRow
              icon="receipt"
              label="مبلغ"
              value={`${faNumber(current.total)} تومان`}
            />
          </div>

          <ProgressRail status={current.status} />

          <div className="border-t border-[var(--hairline)] p-2.5">
            <button
              onClick={() => deliver(current)}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-[13px] font-extrabold text-white transition-colors hover:bg-emerald-500"
            >
              <Icon name="check" className="size-4" />
              تحویل شد
            </button>
          </div>
        </section>
      )}

      {/* ---------- Lane tabs ---------- */}
      <div className="flex gap-1.5 rounded-lg border border-[var(--surface-border)] bg-ink-900 p-1">
        {LANES.map((l) => {
          const activeTab = lane === l.key;
          return (
            <button
              key={l.key}
              onClick={() => setLane(l.key)}
              className={cn(
                "flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-md px-2 text-[12px] font-bold transition-colors",
                activeTab
                  ? "bg-flame-600 text-white"
                  : "text-mist-400 hover:bg-[var(--white-a6)] hover:text-mist-100",
              )}
            >
              <Icon name={l.icon} className="size-3.5 shrink-0" />
              <span className="truncate">{l.label}</span>
              <span className="num text-[11px] opacity-80">{toFa(buckets[l.key].length)}</span>
            </button>
          );
        })}
      </div>

      {/* ---------- Lane list ---------- */}
      <div className="space-y-2">
        {buckets[lane].length === 0 && (
          <p className="rounded-lg border border-dashed border-[var(--surface-border)] py-7 text-center text-[12.5px] text-mist-500">
            موردی در این بخش نیست.
          </p>
        )}

        {buckets[lane].map((o) => (
          <article
            key={o.id}
            className="rounded-lg border border-[var(--surface-border)] bg-ink-900 px-3 py-2.5"
          >
            <div className="flex items-center gap-2">
              <span className="num text-[13px] font-extrabold text-mist-100">
                #{toFa(o.number)}
              </span>
              <span className="num text-[11px] text-mist-500">{faTime(o.createdAt)}</span>
              <span className="num mr-auto text-[12.5px] font-extrabold text-flame-600">
                {faNumber(o.total)}
              </span>
            </div>

            <p className="mt-1.5 flex items-start gap-1.5 text-[12px] leading-5 text-mist-400">
              <Icon name="pin" className="mt-0.5 size-3.5 shrink-0 text-mist-500" />
              <span className="line-clamp-2">{o.address?.line ?? "تحویل حضوری"}</span>
            </p>

            {lane !== "done" && (
              <div className="mt-2 flex gap-1.5">
                {lane === "queue" && (
                  <button
                    onClick={() => pickUp(o)}
                    className="flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-flame-600 text-[12px] font-extrabold text-white transition-colors hover:bg-flame-500"
                  >
                    <Icon name="bike" className="size-3.5" />
                    تحویل گرفتم
                  </button>
                )}
                {lane === "active" && (
                  <button
                    onClick={() => deliver(o)}
                    className="flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-emerald-600 text-[12px] font-extrabold text-white transition-colors hover:bg-emerald-500"
                  >
                    <Icon name="check" className="size-3.5" />
                    تحویل شد
                  </button>
                )}
                <a
                  href={`tel:${o.customer.phone}`}
                  className="grid size-9 place-items-center rounded-md border border-[var(--surface-border-strong)] text-mist-300 transition-colors hover:border-flame-600/50 hover:text-flame-600"
                  aria-label="تماس"
                >
                  <Icon name="phone" className="size-3.5" />
                </a>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

function DeliveryRow({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon name={icon} className="mt-0.5 size-3.5 shrink-0 text-mist-500" />
      <div className="min-w-0 flex-1">
        <div className="text-[10.5px] text-mist-500">{label}</div>
        <div className="truncate text-[12.5px] font-bold text-mist-100">{value}</div>
      </div>
    </div>
  );
}

/** Compact three-step rail: picked up -> on the way -> delivered. */
function ProgressRail({ status }: { status: OrderStatus }) {
  const steps = [
    { label: "تحویل گرفته", done: true },
    { label: "در مسیر", done: status === "OUT_FOR_DELIVERY" || status === "DELIVERED" },
    { label: "تحویل شد", done: status === "DELIVERED" },
  ];
  return (
    <div className="flex items-center gap-1 px-3 pb-2.5">
      {steps.map((s, i) => (
        <div key={s.label} className="flex flex-1 items-center gap-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <span
              className={cn(
                "grid size-5 place-items-center rounded-full transition-colors",
                s.done ? "bg-emerald-500 text-white" : "border border-[var(--surface-border-strong)] bg-ink-850",
              )}
            >
              {s.done && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-3"
                  aria-hidden="true"
                >
                  <path d="M7.4 12.3 10.6 15.4 16.6 9" />
                </svg>
              )}
            </span>
            <span
              className={cn(
                "whitespace-nowrap text-[10.5px] font-bold",
                s.done ? "text-mist-200" : "text-mist-500",
              )}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <span
              aria-hidden="true"
              className={cn(
                "mb-4 h-0.5 flex-1 rounded-full",
                steps[i + 1].done ? "bg-emerald-500/50" : "bg-[var(--white-a10)]",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
