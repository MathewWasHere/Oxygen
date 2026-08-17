"use client";

import { useState } from "react";
import { coupons as seed } from "@/lib/data/catalog";
import type { Coupon } from "@/lib/types";
import { faNumber, toFa } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useStore } from "@/lib/store";

export default function AdminDiscountsPage() {
  const { pushToast } = useStore();
  const [items, setItems] = useState<Coupon[]>(seed);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[17px] font-extrabold text-mist-100">کدهای تخفیف</h1>
          <p className="mt-1 text-[12px] text-mist-500">تخفیف‌های فعال برای سفارش مستقیم.</p>
        </div>
        <Button
          onClick={() => {
            setItems((prev) => [
              ...prev,
              {
                code: `OXYGEN${prev.length + 1}0`,
                type: "PERCENT",
                value: 10,
                minOrder: 150000,
                description: "کد تخفیف جدید",
                active: false,
              },
            ]);
            pushToast({ title: "کد تخفیف ایجاد شد", tone: "success" });
          }}
        >
          + کد جدید
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {items.map((c) => (
          <div
            key={c.code}
            className={cn(
              "relative overflow-hidden rounded-2xl border p-5",
              c.active
                ? "border-flame-600/30 bg-flame-600/6"
                : "border-[var(--surface-border)] bg-ink-900 opacity-70",
            )}
          >
            <div className="absolute -left-10 -top-10 size-32 rounded-full bg-flame-600/15 blur-3xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Icon name="tag" className="size-4 text-flame-500" />
                  <span className="text-[16px] font-extrabold tracking-wider text-mist-100" dir="ltr">
                    {c.code}
                  </span>
                </div>
                <p className="mt-2 text-[12px] leading-6 text-mist-400">{c.description}</p>
              </div>
              <span className="num rounded-2xl bg-flame-600/15 px-3 py-2 text-[15px] font-extrabold text-flame-600">
                {c.type === "PERCENT" ? `${toFa(c.value)}٪` : `${faNumber(c.value)}`}
              </span>
            </div>

            <div className="relative mt-4 grid grid-cols-2 gap-3 border-t border-[var(--surface-border)] pt-4 text-[11px] sm:grid-cols-3">
              <Meta label="حداقل سفارش" value={`${faNumber(c.minOrder)} ت`} />
              {c.maxDiscount && <Meta label="سقف تخفیف" value={`${faNumber(c.maxDiscount)} ت`} />}
              <Meta label="محدودیت" value={c.firstOrderOnly ? "اولین سفارش" : "بدون محدودیت"} />
            </div>

            <div className="relative mt-4 flex gap-2">
              <button
                onClick={() =>
                  setItems((prev) =>
                    prev.map((x) => (x.code === c.code ? { ...x, active: !x.active } : x)),
                  )
                }
                className={cn(
                  "rounded-xl px-3.5 py-2 text-[11px] font-bold transition-colors",
                  c.active ? "bg-emerald-500/12 text-emerald-600" : "bg-[var(--white-a6)] text-mist-400",
                )}
              >
                {c.active ? "فعال" : "غیرفعال"}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(c.code);
                  pushToast({ title: "کد کپی شد", description: c.code, tone: "success" });
                }}
                className="rounded-xl border border-[var(--surface-border)] px-3.5 py-2 text-[11px] font-bold text-mist-300 hover:text-mist-100"
              >
                کپی کد
              </button>
              <button
                onClick={() => setItems((prev) => prev.filter((x) => x.code !== c.code))}
                className="mr-auto rounded-xl px-3 py-2 text-[11px] font-bold text-mist-500 hover:text-red-500"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-mist-500">{label}</div>
      <div className="num mt-0.5 font-bold text-mist-100">{value}</div>
    </div>
  );
}
