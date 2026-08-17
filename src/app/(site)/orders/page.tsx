"use client";

import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/lib/store";
import { ButtonLink, Button } from "@/components/ui/Button";
import { Price } from "@/components/ui";
import { faDate, faTime, toFa } from "@/lib/format";
import { STATUS_SHORT, STATUS_TONE } from "@/lib/order-machine";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

export default function OrdersPage() {
  const { state, reorder } = useStore();
  const orders = state.orders;
  const active = orders.filter(
    (o) => !["DELIVERED", "CANCELLED", "PAYMENT_FAILED"].includes(o.status),
  );
  const past = orders.filter((o) => ["DELIVERED", "CANCELLED", "PAYMENT_FAILED"].includes(o.status));

  return (
    <div className="shell py-5 sm:py-8 lg:pt-11 lg:pb-14">
      <h1 className="text-xl font-extrabold text-mist-100 sm:text-3xl">سفارش‌های من</h1>
      <p className="mt-1.5 text-[13px] text-mist-400">پیگیری لحظه‌ای و سفارش مجدد با یک لمس.</p>

      {orders.length === 0 && state.hydrated && (
        <div className="surface mt-8 flex flex-col items-center rounded-2xl px-6 py-20 text-center">
          <span className="grid size-20 place-items-center rounded-full bg-flame-600/10 text-4xl">🧾</span>
          <h2 className="mt-5 text-lg font-extrabold text-mist-100">هنوز سفارشی ثبت نکرده‌ای</h2>
          <p className="mt-2 text-[13px] text-mist-400">اولین سفارشت ۱۰٪ تخفیف دارد.</p>
          <ButtonLink href="/menu" size="lg" className="mt-6">
            شروع سفارش
          </ButtonLink>
        </div>
      )}

      {active.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-mist-100">
            <span className="size-2 animate-pulse-dot rounded-full bg-flame-500 text-flame-500/45" />
            سفارش‌های در جریان
          </h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {active.map((o) => (
              <OrderCard key={o.id} order={o} onReorder={() => reorder(o.id)} highlight />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="mt-7">
          <h2 className="mb-4 text-[15px] font-extrabold text-mist-100">تاریخچه سفارش‌ها</h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {past.map((o) => (
              <OrderCard key={o.id} order={o} onReorder={() => reorder(o.id)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function OrderCard({
  order,
  onReorder,
  highlight,
}: {
  order: import("@/lib/types").Order;
  onReorder: () => void;
  highlight?: boolean;
}) {
  return (
    <article
      className={cn(
        "surface surface-hover rounded-2xl pad-panel",
        highlight && "border-flame-600/30 bg-flame-600/5",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href={`/order?id=${order.id}`} className="num -my-2 inline-flex min-h-9 items-center text-[15px] font-extrabold text-mist-100 hover:text-flame-600">
            سفارش #{toFa(order.number)}
          </Link>
          <div className="num mt-1 text-[13px] text-mist-500">
            {faDate(order.createdAt)} — {faTime(order.createdAt)}
          </div>
        </div>
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 text-[13px] font-bold",
            STATUS_TONE[order.status],
          )}
        >
          {STATUS_SHORT[order.status]}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="flex -space-x-3 space-x-reverse">
          {order.items.slice(0, 4).map((i, idx) => (
            <Image
              key={idx}
              src={i.image}
              alt={i.name}
              width={40}
              height={40}
              className="size-10 rounded-xl border-2 border-ink-900 object-cover"
            />
          ))}
        </div>
        <span className="num text-[13px] text-mist-400">
          {toFa(order.items.reduce((s, i) => s + i.quantity, 0))} آیتم
        </span>
      </div>

      <p className="mt-2 line-clamp-1 text-[13px] text-mist-400">
        {order.items.map((i) => `${toFa(i.quantity)} × ${i.name}`).join("، ")}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--surface-border)] pt-3.5">
        <Price value={order.total} size="lg" />
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={onReorder}>
            <Icon name="plus" className="size-3.5" />
            سفارش مجدد
          </Button>
          <ButtonLink href={`/order?id=${order.id}`} size="sm" variant={highlight ? "primary" : "outline"}>
            {highlight ? "پیگیری" : "جزئیات"}
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
