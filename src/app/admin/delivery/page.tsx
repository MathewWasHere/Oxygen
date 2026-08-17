"use client";

import { useState } from "react";
import { deliveryZones as seed, RESTAURANT } from "@/lib/data/catalog";
import type { DeliveryZone } from "@/lib/types";
import { faNumber, toEn, toFa } from "@/lib/format";
import { Input } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";

export default function AdminDeliveryPage() {
  const { pushToast } = useStore();
  const [zones, setZones] = useState<DeliveryZone[]>(seed);

  const patch = (id: string, changes: Partial<DeliveryZone>) =>
    setZones((prev) => prev.map((z) => (z.id === id ? { ...z, ...changes } : z)));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[17px] font-extrabold text-mist-100">مناطق ارسال</h1>
          <p className="mt-1 text-[12px] text-mist-500">
            هزینه، زمان و حداقل سفارش هر منطقه — همان مقادیری که در پرداخت مشتری اعمال می‌شود.
          </p>
        </div>
        <Button
          onClick={() => {
            setZones((prev) => [
              ...prev,
              {
                id: `z${Date.now()}`,
                name: "منطقه جدید",
                fee: 25000,
                etaMinutes: 35,
                minOrder: 150000,
                active: true,
              },
            ]);
            pushToast({ title: "منطقه جدید اضافه شد", tone: "success" });
          }}
        >
          + منطقه جدید
        </Button>
      </div>

      <div className="rounded-2xl border border-[var(--surface-border)] bg-ink-900 p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-flame-600/15 text-flame-500">
            <Icon name="pin" />
          </span>
          <div>
            <div className="text-[13px] font-extrabold text-mist-100">مبدأ ارسال</div>
            <div className="num text-[12px] text-mist-400">
              {RESTAURANT.address} — {toFa(RESTAURANT.lat.toFixed(4))}, {toFa(RESTAURANT.lng.toFixed(4))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {zones.map((z) => (
          <div
            key={z.id}
            className={cn(
              "rounded-2xl border bg-ink-900 p-5 transition-all",
              z.active ? "border-[var(--surface-border)]" : "border-[var(--surface-border)] opacity-60",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <Input
                value={z.name}
                onChange={(e) => patch(z.id, { name: e.target.value })}
                className="h-10 flex-1 text-[13px] font-bold"
              />
              <button
                onClick={() => patch(z.id, { active: !z.active })}
                className={cn(
                  "inline-flex min-h-9 shrink-0 items-center rounded-lg px-3 text-[11px] font-bold transition-colors",
                  z.active ? "bg-emerald-500/12 text-emerald-600" : "bg-[var(--white-a6)] text-mist-400",
                )}
              >
                {z.active ? "فعال" : "غیرفعال"}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <NumField
                label="هزینه ارسال"
                value={z.fee}
                onChange={(v) => patch(z.id, { fee: v })}
                suffix="تومان"
              />
              <NumField
                label="زمان تحویل"
                value={z.etaMinutes}
                onChange={(v) => patch(z.id, { etaMinutes: v })}
                suffix="دقیقه"
              />
              <NumField
                label="حداقل سفارش"
                value={z.minOrder}
                onChange={(v) => patch(z.id, { minOrder: v })}
                suffix="تومان"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] text-mist-500">{label}</span>
      <Input
        value={faNumber(value)}
        onChange={(e) => onChange(Number(toEn(e.target.value).replace(/\D/g, "")) || 0)}
        inputMode="numeric"
        className="h-10 text-[13px]"
      />
      <span className="mt-1 block text-[10px] text-mist-500">{suffix}</span>
    </label>
  );
}
