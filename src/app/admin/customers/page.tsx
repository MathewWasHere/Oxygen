"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { faNumber, faRelative, toFa } from "@/lib/format";
import { Input } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/**
 * CUSTOMERS
 *
 * Redesigned from a sparse one-row-per-customer table into a dense card grid:
 * roughly six cards fit across a desktop width instead of three, so an owner
 * can survey the whole customer base without scrolling.
 *
 * Density comes from real proportion changes — tighter padding, a smaller
 * avatar, a compact two-column stat footer and a type ramp sized for glancing
 * — not from simply shrinking the font of an oversized card.
 */
export default function AdminCustomersPage() {
  const { state } = useStore();
  const [query, setQuery] = useState("");

  const customers = useMemo(() => {
    const map = new Map<
      string,
      { name: string; phone: string; orders: number; spent: number; last: number }
    >();
    state.orders.forEach((o) => {
      const cur = map.get(o.customer.phone) ?? {
        name: o.customer.name,
        phone: o.customer.phone,
        orders: 0,
        spent: 0,
        last: 0,
      };
      cur.orders += 1;
      cur.spent += o.status === "CANCELLED" ? 0 : o.total;
      cur.last = Math.max(cur.last, o.createdAt);
      map.set(o.customer.phone, cur);
    });
    return [...map.values()]
      .filter((c) => query === "" || c.name.includes(query) || c.phone.includes(query))
      .sort((a, b) => b.spent - a.spent);
  }, [state.orders, query]);

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-[17px] font-extrabold text-mist-100">مشتریان</h1>
        <p className="num mt-1 text-[12px] text-mist-500">
          {toFa(customers.length)} مشتری ثبت‌شده
        </p>
      </div>

      <div className="relative max-w-sm">
        <Icon
          name="search"
          className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-mist-500"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجو با نام یا شماره…"
          className="h-11 pr-11 text-[13px]"
        />
      </div>

      {customers.length === 0 && (
        <p className="rounded-2xl border border-[var(--surface-border)] bg-ink-900 p-8 text-center text-[13px] text-mist-500">
          مشتری‌ای با این مشخصات پیدا نشد.
        </p>
      )}

      {/* 2 across on phones -> 6 across on wide desktops. */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {customers.map((c, i) => {
          const loyal = i < 3;
          return (
            <article
              key={c.phone}
              className={cn(
                "group relative flex flex-col rounded-2xl border bg-ink-900 p-3 transition-colors",
                loyal
                  ? "border-flame-600/35 hover:border-flame-600/60"
                  : "border-[var(--surface-border)] hover:border-flame-600/40",
              )}
            >
              {/* Identity */}
              {/* No avatar tile — this app has no profile pictures. */}
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-bold text-mist-100">{c.name}</div>
                  <div className="num truncate text-[10.5px] text-mist-500" dir="ltr">
                    {toFa(c.phone)}
                  </div>
                </div>
              </div>

              {loyal && (
                <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-md bg-flame-600/12 px-1.5 py-0.5 text-[10.5px] font-extrabold text-flame-500">
                  <Icon name="star" filled className="size-2.5 text-gold-600" />
                  وفادار
                </span>
              )}

              {/* Stats */}
              <div className="mt-2.5 grid grid-cols-2 gap-1.5 border-t border-[var(--hairline)] pt-2.5">
                <div>
                  <div className="text-[10.5px] text-mist-500">سفارش</div>
                  <div className="num text-[13px] font-extrabold text-mist-100">
                    {toFa(c.orders)}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[10.5px] text-mist-500">مجموع</div>
                  <div className="num truncate text-[12px] font-extrabold text-flame-500">
                    {faNumber(c.spent)}
                  </div>
                </div>
              </div>

              <div className="num mt-2 text-[10px] text-mist-500">{faRelative(c.last)}</div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
