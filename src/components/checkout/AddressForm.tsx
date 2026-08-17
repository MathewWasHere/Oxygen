"use client";

import { useState } from "react";
import type { Address } from "@/lib/types";
import { BottomSheet, Field, Input, Textarea } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { deliveryZones, RESTAURANT } from "@/lib/data/catalog";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import { faNumber, isValidIranPhone, normalizePhone, toFa } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";

const TITLES = ["خانه", "محل کار", "خانه دوستان", "سایر"];

export function AddressForm({
  open,
  onClose,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Address;
}) {
  const { saveAddress, state, pushToast } = useStore();
  const [title, setTitle] = useState(initial?.title ?? "خانه");
  const [zoneId, setZoneId] = useState(initial?.zoneId ?? deliveryZones[0].id);
  const [line, setLine] = useState(initial?.line ?? "");
  const [plaque, setPlaque] = useState(initial?.plaque ?? "");
  const [unit, setUnit] = useState(initial?.unit ?? "");
  const [name, setName] = useState(initial?.recipientName ?? state.user?.name ?? "");
  const [phone, setPhone] = useState(initial?.recipientPhone ?? state.user?.phone ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const next: Record<string, string> = {};
    if (line.trim().length < 8) next.line = "آدرس دقیق را کامل وارد کنید";
    if (name.trim().length < 3) next.name = "نام گیرنده را وارد کنید";
    if (!isValidIranPhone(phone)) next.phone = "شماره موبایل معتبر نیست";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    saveAddress({
      id: initial?.id ?? `addr-${Date.now()}`,
      title,
      province: RESTAURANT.province,
      city: RESTAURANT.city,
      line: line.trim(),
      plaque: plaque.trim() || undefined,
      unit: unit.trim() || undefined,
      recipientName: name.trim(),
      recipientPhone: normalizePhone(phone),
      note: note.trim() || undefined,
      zoneId,
    });
    pushToast({ title: "آدرس ذخیره شد", tone: "success" });
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={initial ? "ویرایش آدرس" : "افزودن آدرس جدید"}>
      <div className="space-y-5 p-5">
        <div>
          <span className="mb-2 block text-[13px] font-medium text-mist-200">عنوان آدرس</span>
          <div className="flex flex-wrap gap-2">
            {TITLES.map((t) => (
              <button
                key={t}
                onClick={() => setTitle(t)}
                className={cn(
                  "rounded-xl border px-4 py-2 text-[13px] font-bold transition-all",
                  title === t
                    ? "border-flame-600 bg-flame-600/12 text-flame-600"
                    : "border-[var(--surface-border)] bg-ink-850 text-mist-400",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-2 block text-[13px] font-medium text-mist-200">منطقه ارسال</span>
          <div className="grid gap-2 sm:grid-cols-2">
            {deliveryZones.map((z) => (
              <button
                key={z.id}
                onClick={() => setZoneId(z.id)}
                className={cn(
                  "rounded-2xl border p-3.5 text-right transition-all",
                  zoneId === z.id ? "border-flame-600/60 bg-flame-600/8" : "border-[var(--surface-border)] bg-ink-850",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-mist-100">{z.name}</span>
                  {zoneId === z.id && <Icon name="check" className="size-4 text-flame-500" />}
                </div>
                <div className="num mt-1.5 flex gap-3 text-[13px] text-mist-400">
                  <span>ارسال {faNumber(z.fee)} تومان</span>
                  <span>~{toFa(z.etaMinutes)} دقیقه</span>
                </div>
              </button>
            ))}
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[13px] text-mist-500">
            <Icon name="pin" className="size-3.5 text-flame-600" />
            ارسال اکسیژن فقط در محدوده {RESTAURANT.city} انجام می‌شود.
          </p>
        </div>

        <Field label="آدرس دقیق" required error={errors.line}>
          <Textarea
            value={line}
            onChange={(e) => setLine(e.target.value)}
            placeholder="خیابان، کوچه، نشانی کامل"
            className="min-h-20"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="پلاک">
            <Input value={plaque} onChange={(e) => setPlaque(e.target.value)} placeholder="۱۲" inputMode="numeric" />
          </Field>
          <Field label="واحد">
            <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="۳" inputMode="numeric" />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="نام گیرنده" required error={errors.name}>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="نام و نام خانوادگی" />
          </Field>
          <Field label="شماره تماس گیرنده" required error={errors.phone}>
            <Input
              value={phone}
              onChange={(e) => setPhone(normalizePhone(e.target.value))}
              placeholder="09121234567"
              inputMode="tel"
              dir="ltr"
              className="text-left"
            />
          </Field>
        </div>

        <Field label="توضیحات تحویل" hint="مثلاً: لطفاً زنگ را بزنید">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="راهنمای پیک برای پیدا کردن آدرس"
            className="min-h-16"
          />
        </Field>
      </div>

      <div className="sticky bottom-0 border-t border-[var(--surface-border)] bg-ink-900/95 p-4 backdrop-blur">
        <Button block size="lg" onClick={submit}>
          ذخیره آدرس
        </Button>
      </div>
    </BottomSheet>
  );
}
