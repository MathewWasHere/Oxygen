"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { OrderTimeline } from "@/components/order/OrderTimeline";
import { Button, ButtonLink } from "@/components/ui/Button";
import { FoodImage, Price } from "@/components/ui";
import { faDate, faNumber, faTime, toFa } from "@/lib/format";
import { STATUS_SENTENCE, STATUS_SHORT, STATUS_TONE, statusIndex } from "@/lib/order-machine";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { RESTAURANT } from "@/lib/data/catalog";
import { useNow } from "@/lib/use-now";

function OrderDetailInner() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const isNew = params.get("new") === "1";
  const { state, reorder } = useStore();
  const [celebrate, setCelebrate] = useState(isNew);

  const order = state.orders.find((o) => o.id === id);

  useEffect(() => {
    if (!celebrate) return;
    const t = setTimeout(() => setCelebrate(false), 4000);
    return () => clearTimeout(t);
  }, [celebrate]);

  /**
   * Ticks every 30s so the remaining-time countdown stays fresh.
   * Stage 2 adds a WebSocket subscription to `order:{id}` for push updates —
   * the component re-renders from the same store either way.
   */
  const now = useNow(30_000);

  if (!state.hydrated) {
    return <div className="shell py-20 text-center text-mist-400">در حال بارگذاری…</div>;
  }

  if (!order) {
    return (
      <div className="shell flex min-h-[60vh] flex-col items-center justify-center text-center">
        <span className="text-5xl">🔍</span>
        <h1 className="mt-5 text-xl font-extrabold text-mist-100">سفارش پیدا نشد</h1>
        <ButtonLink href="/orders" className="mt-6">
          بازگشت به سفارش‌ها
        </ButtonLink>
      </div>
    );
  }

  const elapsedMinutes = now === 0 ? 0 : Math.round((now - order.createdAt) / 60000);
  const remaining = Math.max(0, order.etaMinutes - elapsedMinutes);
  const done = order.status === "DELIVERED";
  const progress = Math.min(100, Math.round(((statusIndex(order.status) + 1) / 6) * 100));

  return (
    <div className="shell py-5 sm:py-8 lg:pt-11 lg:pb-14">
      <Link href="/orders" className="mb-5 -my-2 inline-flex min-h-11 items-center gap-1.5 text-[13px] text-mist-400 hover:text-mist-100">
        <Icon name="chevron" className="size-4 rotate-180" />
        سفارش‌های من
      </Link>

      {celebrate && (
        <div className="mb-5 animate-fade-up rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-600">
            <Icon name="check" className="size-7" />
          </div>
          <h1 className="mt-3 text-xl font-extrabold text-mist-100">سفارش شما با موفقیت ثبت شد</h1>
          <p className="num mt-2 text-[13px] text-mist-300">
            شماره سفارش: <span className="font-extrabold text-emerald-600">#{toFa(order.number)}</span>
          </p>
          {order.pointsEarned > 0 && (
            <p className="num mt-1 text-[13px] text-flame-600">
              🎁 {toFa(order.pointsEarned)} امتیاز به باشگاه مشتریان شما اضافه شد
            </p>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {/* Status header */}
          <div className="surface overflow-hidden rounded-2xl">
            <div className="border-b border-[var(--surface-border)] bg-flame-600/8 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="num text-[13px] text-mist-400">شماره سفارش</div>
                  <div className="num text-2xl font-extrabold text-mist-100">#{toFa(order.number)}</div>
                  <div className="num mt-1 text-[13px] text-mist-500">
                    {faDate(order.createdAt)} — {faTime(order.createdAt)}
                  </div>
                </div>
                <span className={cn("rounded-full border px-3 py-1.5 text-[13px] font-bold", STATUS_TONE[order.status])}>
                  {STATUS_SHORT[order.status]}
                </span>
              </div>

              <p className="mt-4 text-[14px] font-bold text-mist-100">
                {STATUS_SENTENCE[order.status]}
              </p>

              {!done && (
                <>
                  <div className="num mt-1 text-[13px] text-flame-600">
                    حدود {toFa(remaining)} دقیقه تا تحویل
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--white-a8)]">
                    <div
                      className="h-full rounded-full bg-flame-600 transition-all duration-700"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="p-6">
              <OrderTimeline order={order} />
            </div>

            {order.status === "OUT_FOR_DELIVERY" && (
              <div className="flex items-center gap-3 border-t border-[var(--surface-border)] bg-ink-850 pad-panel">
                <span className="grid size-11 place-items-center rounded-full bg-flame-600/15 text-flame-500">
                  <Icon name="bike" />
                </span>
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-mist-100">پیک اکسیژن در راه است</div>
                  <div className="text-[13px] text-mist-400">{order.driverName ?? "پیک اختصاصی اکسیژن"}</div>
                </div>
                <a
                  href={`tel:${RESTAURANT.phone}`}
                  className="rounded-xl border border-flame-600/40 px-3 py-2 text-[13px] font-bold text-flame-600"
                >
                  تماس
                </a>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="surface rounded-2xl pad-panel">
            <h2 className="text-[15px] font-extrabold text-mist-100">اقلام سفارش</h2>
            <div className="mt-4 space-y-3">
              {order.items.map((i, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <FoodImage src={i.image} alt={i.name} className="size-14 shrink-0 rounded-xl" sizes="56px" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-bold text-mist-100">{i.name}</div>
                    {i.modifiers.length > 0 && (
                      <div className="truncate text-[13px] text-flame-600">
                        {i.modifiers.map((m) => m.name).join("، ")}
                      </div>
                    )}
                    <div className="num text-[13px] text-mist-500">
                      {toFa(i.quantity)} × {faNumber(i.unitPrice)} تومان
                    </div>
                  </div>
                  <Price value={i.lineTotal} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div className="surface rounded-2xl p-4 sm:p-5">
            <h2 className="text-[15px] font-extrabold text-mist-100">صورتحساب</h2>
            <div className="mt-4 space-y-3 border-b border-[var(--surface-border)] pb-4 text-[13px]">
              <Row label="جمع سفارش" value={`${faNumber(order.subtotal)} تومان`} />
              <Row label="هزینه ارسال" value={`${faNumber(order.deliveryFee)} تومان`} />
              {order.discount > 0 && (
                <Row label={`تخفیف ${order.couponCode ?? ""}`} value={`−${faNumber(order.discount)} تومان`} flame />
              )}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[13px] text-mist-300">مبلغ کل</span>
              <Price value={order.total} size="xl" />
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[var(--surface-border)] bg-ink-850 p-3">
              <Icon name="shield" className="size-4 text-emerald-500" />
              <span className="text-[13px] text-mist-300">
                پرداخت آنلاین — {order.payment.status === "PAID" ? "موفق" : "در انتظار"}
              </span>
            </div>
            {order.payment.refId && (
              <p className="num mt-2 text-[13px] text-mist-500" dir="ltr">
                کد پیگیری: {toFa(order.payment.refId)}
              </p>
            )}

            <Button block variant="secondary" className="mt-4" onClick={() => reorder(order.id)}>
              سفارش مجدد
            </Button>
          </div>

          {order.address && (
            <div className="surface rounded-2xl p-4 sm:p-5">
              <h2 className="flex items-center gap-2 text-[15px] font-extrabold text-mist-100">
                <Icon name="pin" className="size-4 text-flame-500" />
                آدرس تحویل
              </h2>
              <p className="mt-3 text-[13px] leading-7 text-mist-300">
                {order.address.province}، {order.address.city}، {order.address.line}
              </p>
              <p className="num mt-2 text-[13px] text-mist-500">
                {order.address.recipientName} — {toFa(order.address.recipientPhone)}
              </p>
              {order.address.note && (
                <p className="mt-2 text-[13px] text-mist-500">توضیحات: {order.address.note}</p>
              )}
            </div>
          )}

          <a
            href={`tel:${RESTAURANT.phone}`}
            className="surface flex items-center justify-between rounded-2xl p-5 transition-colors hover:border-flame-600/40"
          >
            <span>
              <span className="block text-[13px] font-extrabold text-mist-100">مشکلی در سفارش هست؟</span>
              <span className="block text-[13px] text-mist-400">مستقیم با اکسیژن تماس بگیر</span>
            </span>
            <Icon name="phone" className="size-5 text-flame-500" />
          </a>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, flame }: { label: string; value: string; flame?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-mist-400">{label}</span>
      <span className={cn("num font-bold", flame ? "text-flame-600" : "text-mist-100")}>{value}</span>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<div className="shell py-20 text-center text-mist-400">در حال بارگذاری…</div>}>
      <OrderDetailInner />
    </Suspense>
  );
}
