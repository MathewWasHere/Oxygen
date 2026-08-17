"use client";

import Image from "next/image";
import { useState } from "react";
import { useStore } from "@/lib/store";
import type { Order, OrderStatus } from "@/lib/types";
import {
  ACTION_BUTTON_CLASS,
  CANCEL_BUTTON_CLASS,
  STATUS_ACTION_TONE,
  STATUS_BADGE,
  STATUS_LABEL,
  STATUS_SHORT,
  TRANSITIONS,
} from "@/lib/order-machine";
import { faNumber, faRelative, faTime, toFa } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { BottomSheet, Textarea } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { deliveryZones } from "@/lib/data/catalog";

const COLUMNS: Array<{ status: OrderStatus; accent: string }> = [
  { status: "PENDING", accent: "border-t-flame-500" },
  { status: "CONFIRMED", accent: "border-t-sky-400" },
  { status: "PREPARING", accent: "border-t-flame-400" },
  { status: "READY", accent: "border-t-violet-400" },
  { status: "OUT_FOR_DELIVERY", accent: "border-t-blue-400" },
  { status: "DELIVERED", accent: "border-t-emerald-400" },
];

export default function AdminOrdersPage() {
  const { state, setOrderStatus, setOrderNote, pushToast } = useStore();
  const [detail, setDetail] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const order = state.orders.find((o) => o.id === detail);

  const move = (o: Order, to: OrderStatus) => {
    setOrderStatus(o.id, to, undefined);
    pushToast({ title: `سفارش #${toFa(o.number)} → ${STATUS_LABEL[to]}`, tone: "success" });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-[17px] font-extrabold text-mist-100">
            <span className="size-2.5 animate-pulse-dot rounded-full bg-flame-500 text-flame-500/45" />
            سفارش‌های زنده
          </h1>
          <p className="mt-1 text-[12px] text-mist-500">
            سفارش‌ها را بین ستون‌ها جابه‌جا کن — وضعیت بلافاصله برای مشتری به‌روز می‌شود.
          </p>
        </div>
        <div className="flex gap-2">
          {COLUMNS.slice(0, 3).map((c) => {
            const count = state.orders.filter((o) => o.status === c.status).length;
            return (
              <span
                key={c.status}
                className={cn(
                  "rounded-xl border px-3 py-2 text-[11.5px] font-bold",
                  STATUS_BADGE[c.status],
                )}
              >
                {STATUS_SHORT[c.status]}: <span className="num">{toFa(count)}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Kanban board */}
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-4 lg:mx-0 lg:px-0">
        {COLUMNS.map((col) => {
          const items = state.orders.filter((o) => o.status === col.status);
          return (
            <section
              key={col.status}
              className={cn(
                "w-[290px] shrink-0 rounded-2xl border border-t-2 border-[var(--surface-border)] bg-ink-900/60 p-3",
                col.accent,
              )}
            >
              <header className="mb-3 flex items-center justify-between px-1">
                <h2 className="text-[13px] font-extrabold text-mist-100">{STATUS_SHORT[col.status]}</h2>
                <span className="num rounded-full bg-[var(--white-a6)] px-2 py-0.5 text-[11px] font-bold text-mist-300">
                  {toFa(items.length)}
                </span>
              </header>

              <div className="space-y-2.5">
                {items.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-[var(--surface-border)] py-8 text-center text-[11px] text-mist-500">
                    خالی
                  </div>
                )}
                {items.map((o) => (
                  <article
                    key={o.id}
                    className={cn(
                      "rounded-2xl border border-[var(--surface-border)] bg-ink-850 p-3.5 transition-all hover:border-flame-600/40",
                      col.status === "PENDING" && "ring-1 ring-flame-600/25",
                    )}
                  >
                    <button onClick={() => { setDetail(o.id); setNote(o.internalNote ?? ""); }} className="w-full text-right">
                      <div className="flex items-center justify-between">
                        <span className="num text-[14px] font-extrabold text-mist-100">#{toFa(o.number)}</span>
                        <span className="num text-[10px] text-mist-500">{faRelative(o.createdAt)}</span>
                      </div>

                      <div className="mt-2.5 space-y-1">
                        {o.items.slice(0, 3).map((i, idx) => (
                          <div key={idx} className="num flex gap-1.5 text-[11px] text-mist-300">
                            <span className="font-bold text-flame-600">{toFa(i.quantity)} ×</span>
                            <span className="truncate">{i.name}</span>
                          </div>
                        ))}
                        {o.items.length > 3 && (
                          <div className="num text-[10px] text-mist-500">
                            + {toFa(o.items.length - 3)} آیتم دیگر
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-[var(--surface-border)] pt-2.5">
                        <span className="num text-[13px] font-extrabold text-flame-600">
                          {faNumber(o.total)}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-mist-500">
                          <Icon name="clock" className="size-3" />
                          <span className="num">{faTime(o.createdAt)}</span>
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-mist-400">
                        <Icon name="user" className="size-3.5" />
                        <span className="truncate">{o.customer.name}</span>
                        <span className="num text-mist-500" dir="ltr">
                          {toFa(o.customer.phone.slice(-4))}
                        </span>
                      </div>
                    </button>

                    {TRANSITIONS[o.status].length > 0 && (
                      <div className="mt-3 flex flex-wrap items-stretch gap-1.5">
                        {TRANSITIONS[o.status]
                          .filter((s) => s !== "CANCELLED")
                          .map((next) => (
                            <button
                              key={next}
                              onClick={() => move(o, next)}
                              title={`تغییر وضعیت به ${STATUS_LABEL[next]}`}
                              aria-label={`تغییر وضعیت به ${STATUS_LABEL[next]}`}
                              className={cn(
                                "flex min-h-9 flex-1 items-center justify-center gap-1 rounded-lg px-2.5 text-[11.5px] font-extrabold transition-colors",
                                ACTION_BUTTON_CLASS[STATUS_ACTION_TONE[next]],
                              )}
                            >
                              {STATUS_SHORT[next]}
                            </button>
                          ))}
                        {TRANSITIONS[o.status].includes("CANCELLED") && (
                          <button
                            onClick={() => move(o, "CANCELLED")}
                            title="لغو سفارش"
                            aria-label="لغو سفارش"
                            className={cn(
                              "flex min-h-9 items-center justify-center rounded-lg px-2.5 text-[11.5px] font-extrabold transition-colors",
                              CANCEL_BUTTON_CLASS,
                            )}
                          >
                            لغو
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Detail sheet */}
      <BottomSheet
        open={!!order}
        onClose={() => setDetail(null)}
        title={order ? `سفارش #${toFa(order.number)}` : ""}
        maxWidth="max-w-2xl"
      >
        {order && (
          <div className="space-y-3 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("rounded-xl border px-3 py-1.5 text-[12px] font-bold", STATUS_BADGE[order.status])}>
                {STATUS_LABEL[order.status]}
              </span>
              <span className="num rounded-xl border border-[var(--surface-border)] px-3 py-1.5 text-[12px] text-mist-300">
                {faTime(order.createdAt)}
              </span>
              <span className="rounded-xl border border-[var(--surface-border)] px-3 py-1.5 text-[12px] text-mist-300">
                {order.payment.method === "ONLINE"
                  ? "پرداخت آنلاین"
                  : order.payment.method === "CASH"
                    ? "نقدی"
                    : "کارتخوان"}
                
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-[var(--surface-border)] bg-ink-850 p-3">
                <h3 className="text-[12px] font-extrabold text-mist-100">مشتری</h3>
                <p className="mt-2 text-[13px] text-mist-300">{order.customer.name}</p>
                <a
                  href={`tel:${order.customer.phone}`}
                  dir="ltr"
                  className="num mt-1 block text-[13px] font-bold text-flame-600"
                >
                  {toFa(order.customer.phone)}
                </a>
              </div>
              <div className="rounded-lg border border-[var(--surface-border)] bg-ink-850 p-3">
                <h3 className="text-[12px] font-extrabold text-mist-100">تحویل</h3>
                {order.address ? (
                  <>
                    <p className="mt-2 text-[12px] leading-6 text-mist-300">{order.address.line}</p>
                    <p className="num mt-1 text-[11px] text-mist-500">
                      {deliveryZones.find((z) => z.id === order.zoneId)?.name} — {toFa(order.etaMinutes)} دقیقه
                    </p>
                    {order.address.note && (
                      <p className="mt-1 text-[11px] text-flame-600">📝 {order.address.note}</p>
                    )}
                  </>
                ) : (
                  <p className="mt-2 text-[12px] text-mist-300">تحویل حضوری</p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-[var(--surface-border)] bg-ink-850 p-3">
              <h3 className="text-[12px] font-extrabold text-mist-100">اقلام</h3>
              <div className="mt-3 space-y-2.5">
                {order.items.map((i, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Image src={i.image} alt={i.name} width={40} height={40} className="size-10 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12px] font-bold text-mist-100">{i.name}</div>
                      {i.modifiers.length > 0 && (
                        <div className="truncate text-[10px] text-flame-600">
                          {i.modifiers.map((m) => m.name).join("، ")}
                        </div>
                      )}
                    </div>
                    <span className="num text-[12px] font-bold text-mist-300">×{toFa(i.quantity)}</span>
                    <span className="num w-20 text-left text-[12px] font-bold text-mist-100">
                      {faNumber(i.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-1.5 border-t border-[var(--surface-border)] pt-3 text-[12px]">
                <div className="flex justify-between text-mist-400">
                  <span>جمع</span>
                  <span className="num">{faNumber(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-mist-400">
                  <span>ارسال</span>
                  <span className="num">{faNumber(order.deliveryFee)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-flame-600">
                    <span>تخفیف {order.couponCode}</span>
                    <span className="num">−{faNumber(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 text-[14px] font-extrabold text-mist-100">
                  <span>مبلغ کل</span>
                  <span className="num">{faNumber(order.total)} تومان</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-[12px] font-extrabold text-mist-100">یادداشت داخلی</h3>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="یادداشت برای آشپزخانه یا پیک…"
                className="min-h-16"
              />
              <Button
                size="sm"
                variant="secondary"
                className="mt-2"
                onClick={() => {
                  setOrderNote(order.id, note);
                  pushToast({ title: "یادداشت ذخیره شد", tone: "success" });
                }}
              >
                ذخیره یادداشت
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-[var(--surface-border)] pt-4">
              {TRANSITIONS[order.status].map((next) => (
                <button
                  key={next}
                  onClick={() => {
                    move(order, next);
                    setDetail(null);
                  }}
                  className={cn(
                    "flex min-h-11 flex-1 items-center justify-center rounded-lg px-4 text-[13px] font-extrabold transition-colors",
                    next === "CANCELLED"
                      ? CANCEL_BUTTON_CLASS
                      : ACTION_BUTTON_CLASS[STATUS_ACTION_TONE[next]],
                  )}
                >
                  {next === "CANCELLED" ? "لغو سفارش" : `تغییر به ${STATUS_SHORT[next]}`}
                </button>
              ))}
              {TRANSITIONS[order.status].length === 0 && (
                <p className="text-[12px] text-mist-500">این سفارش در وضعیت نهایی است.</p>
              )}
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
