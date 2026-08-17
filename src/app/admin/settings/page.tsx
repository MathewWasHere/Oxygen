"use client";

import { useState } from "react";
import { RESTAURANT } from "@/lib/data/catalog";
import { Field, Input, Textarea } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useStore } from "@/lib/store";
import { RolesPanel } from "@/components/admin/RolesPanel";

export default function AdminSettingsPage() {
  const { pushToast } = useStore();
  const [phone, setPhone] = useState<string>(RESTAURANT.phoneDisplay);
  const [address, setAddress] = useState<string>(RESTAURANT.address);
  const [mapUrl, setMapUrl] = useState<string>(RESTAURANT.mapUrl);
  const [open, setOpen] = useState(true);

  // Accepts the short share links and the full maps URLs Google hands out.
  const mapUrlValid =
    mapUrl.trim() === "" ||
    /^https:\/\/(maps\.app\.goo\.gl\/[\w-]+|(www\.)?google\.[a-z.]+\/maps\/?.*|goo\.gl\/maps\/[\w-]+)$/i.test(
      mapUrl.trim(),
    );

  function save() {
    if (!mapUrlValid) {
      pushToast({
        title: "لینک نقشه معتبر نیست",
        description: "یک لینک گوگل مپ معتبر وارد کنید.",
        tone: "error",
      });
      return;
    }
    pushToast({ title: "تنظیمات ذخیره شد", tone: "success" });
  }

  return (
    <div className="max-w-3xl space-y-3">
      <div>
        <h1 className="text-[17px] font-extrabold leading-tight text-mist-100">تنظیمات</h1>
        <p className="mt-0.5 text-[11.5px] text-mist-500">اطلاعات رستوران و مدیریت دسترسی‌ها.</p>
      </div>

      <div className="rounded-xl border border-[var(--surface-border)] bg-ink-900 pad-panel">
        <h2 className="text-[13px] font-extrabold text-mist-100">اطلاعات رستوران</h2>
        {/* The restaurant name is part of the brand identity and is not
            editable here — the field was removed rather than disabled. */}
        <div className="mt-3 grid gap-3">
          <Field label="شماره تماس">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" className="text-left" />
          </Field>

          <Field label="آدرس">
            <Textarea value={address} onChange={(e) => setAddress(e.target.value)} className="min-h-16" />
          </Field>

          {/* Google Maps link — drives the location card on the site. */}
          <Field
            label="لینک گوگل مپ"
            hint={
              mapUrlValid
                ? "لینک اشتراک‌گذاری موقعیت رستوران در گوگل مپ (برای دکمه مسیریابی)."
                : undefined
            }
            error={mapUrlValid ? undefined : "لینک باید با https://maps.app.goo.gl/ یا google.com/maps شروع شود."}
          >
            <Input
              value={mapUrl}
              onChange={(e) => setMapUrl(e.target.value)}
              dir="ltr"
              inputMode="url"
              placeholder="https://maps.app.goo.gl/…"
              aria-invalid={!mapUrlValid}
              className={cn("text-left", !mapUrlValid && "border-red-500/60 focus:border-red-500")}
            />
          </Field>
        </div>

        <div className="mt-3.5 flex items-center justify-between rounded-lg border border-[var(--surface-border)] bg-ink-850 p-3">
          <div>
            <div className="text-[13px] font-bold text-mist-100">وضعیت رستوران</div>
            <div className="text-[11px] text-mist-500">
              با بستن رستوران، ثبت سفارش جدید غیرفعال می‌شود.
            </div>
          </div>
          <button
            onClick={() => setOpen(!open)}
            className={cn(
              "inline-flex min-h-9 shrink-0 items-center rounded-lg px-3 text-[12px] font-extrabold transition-colors",
              open ? "bg-emerald-500/15 text-emerald-600" : "bg-flame-600/15 text-flame-600",
            )}
          >
            {open ? "باز است" : "بسته است"}
          </button>
        </div>

        <Button size="sm" className="mt-3" onClick={save}>
          ذخیره تنظیمات
        </Button>
      </div>

      {/* Roles & permissions — real assignment by phone number (item 17/18).
          «سرویس‌های متصل» and «کد QR بسته‌بندی» were removed entirely. */}
      <RolesPanel />
    </div>
  );
}
