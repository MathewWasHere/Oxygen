"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { FoodImage, Input, Price, QuantitySelector } from "@/components/ui";
import { Button, ButtonLink } from "@/components/ui/Button";
import { faNumber, toFa } from "@/lib/format";
import { lineTotal } from "@/lib/pricing";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { popularProducts } from "@/lib/data/catalog";
import { ProductCard } from "@/components/product/ProductCard";

export default function CartPage() {
  const { state, setQty, removeItem, totals, setCoupon, cartCount, selectedAddress } = useStore();
  const [code, setCode] = useState(state.couponCode);

  if (state.hydrated && cartCount === 0) {
    return (
      <div className="shell flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
        {/* SVG from the app's own icon set — Snapp Web has no emoji glyphs,
            so a literal 🛒 rendered as a "no glyph" tofu box. */}
        <span className="grid size-24 place-items-center rounded-full bg-flame-600/10 text-flame-600">
          <Icon name="cart" className="size-10" />
        </span>
        <h1 className="mt-6 text-2xl font-extrabold text-mist-100">سبد خریدت خالیه</h1>
        <p className="mt-2 max-w-sm text-[14px] leading-7 text-mist-400">
          یه سر به منو بزن؛ برگر مخصوص اکسیژن همین الان روی گریله.
        </p>
        <ButtonLink href="/menu" size="lg" className="mt-7">
          مشاهده منو
        </ButtonLink>

        <section className="mt-16 w-full text-right">
          <h2 className="mb-4 text-lg font-extrabold text-mist-100">پیشنهاد اکسیژن</h2>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {popularProducts().slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="pb-nav-action shell py-5 sm:py-8 lg:pt-11 lg:pb-14">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-mist-100 sm:text-3xl">سبد خرید</h1>
          <p className="mt-1.5 text-[13px] text-mist-400">
            <span className="num">{toFa(cartCount)}</span> آیتم آماده سفارش
          </p>
        </div>
        <Link href="/menu" className="text-[13px] font-bold text-flame-600 hover:text-flame-500">
          + افزودن آیتم دیگر
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="space-y-3">
          {state.cart.map((item) => (
            <article key={item.key} className="surface flex gap-4 rounded-2xl p-3.5">
              <FoodImage src={item.image} alt={item.name} className="size-24 shrink-0 rounded-2xl" sizes="96px" />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-[15px] font-extrabold leading-6 text-mist-100">{item.name}</h3>
                    {item.modifiers.length > 0 && (
                      <p className="mt-1 text-[13px] text-flame-600">
                        {item.modifiers.map((m) => m.name).join("، ")}
                      </p>
                    )}
                    {item.note && (
                      <p className="mt-1 text-[13px] text-mist-500">یادداشت: {item.note}</p>
                    )}
                    <p className="num mt-1.5 text-[13px] text-mist-400">
                      واحد: {faNumber(item.unitPrice + item.modifiers.reduce((s, m) => s + m.price, 0))} تومان
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.key)}
                    aria-label={`حذف ${item.name}`}
                    className="-m-1 grid size-11 shrink-0 place-items-center rounded-lg text-mist-500 transition-colors hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Icon name="trash" className="size-4" />
                  </button>
                </div>

                <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-2 pt-3">
                  <QuantitySelector
                    value={item.quantity}
                    onChange={(v) => setQty(item.key, v)}
                    size="sm"
                  />
                  <Price value={lineTotal(item)} size="lg" />
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="surface rounded-2xl p-5">
            <h2 className="text-[15px] font-extrabold text-mist-100">خلاصه سفارش</h2>

            <div className="mt-4 space-y-3 border-b border-[var(--surface-border)] pb-4 text-[13.5px]">
              <Row label="جمع سفارش" value={`${faNumber(totals.subtotal)} تومان`} />
              <Row
                label="هزینه ارسال"
                value={
                  selectedAddress ? `${faNumber(totals.deliveryFee)} تومان` : "در مرحله آدرس محاسبه می‌شود"
                }
                muted={!selectedAddress}
              />
              <Row
                label="تخفیف"
                value={`${totals.discount > 0 ? "−" : ""}${faNumber(totals.discount)} تومان`}
                tone={totals.discount > 0 ? "flame" : undefined}
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-[13px] text-mist-300">مبلغ قابل پرداخت</span>
              <Price value={totals.total} size="xl" />
            </div>

            {/* Coupon */}
            <div className="mt-5">
              <div className="flex gap-2">
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="کد تخفیف"
                  aria-label="کد تخفیف"
                  className="h-11 flex-1 text-[13px]"
                />
                <Button variant="secondary" onClick={() => setCoupon(code)} className="shrink-0">
                  اعمال
                </Button>
              </div>
              {state.couponCode && totals.couponError && (
                <p className="mt-2 text-[13px] text-red-500">{totals.couponError}</p>
              )}
              {totals.appliedCoupon && (
                <p className="mt-2 flex items-center gap-1.5 text-[13px] text-emerald-500">
                  <Icon name="check" className="size-3.5" />
                  {totals.appliedCoupon.description}
                </p>
              )}
              {!state.couponCode && (
                <button
                  onClick={() => {
                    setCode("OXYGEN10");
                    setCoupon("OXYGEN10");
                  }}
                  className="mt-2 text-[13px] text-flame-600 hover:text-flame-500"
                >
                  کد OXYGEN10 را برای من اعمال کن
                </button>
              )}
            </div>

            <ButtonLink href="/checkout" size="lg" block className="mt-5">
              ادامه ثبت سفارش
            </ButtonLink>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-[13px] text-mist-500">
              <Icon name="shield" className="size-3.5" />
              پرداخت امن از طریق درگاه بانکی
            </p>
          </div>
        </aside>
      </div>

      {/* Mobile sticky checkout */}
      <div className="above-nav fixed inset-x-0 z-45 border-t border-[var(--surface-border)] bg-ink-950/97 p-3 pb-3 backdrop-blur-xl lg:hidden">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-[13px] text-mist-400">مبلغ قابل پرداخت</span>
          <span className="num text-[16px] font-extrabold text-mist-100">{faNumber(totals.total)} تومان</span>
        </div>
        <ButtonLink href="/checkout" size="lg" block>
          ادامه ثبت سفارش
        </ButtonLink>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
  muted,
}: {
  label: string;
  value: string;
  tone?: "flame";
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="min-w-0 truncate text-mist-400">{label}</span>
      <span
        className={cn(
          "num font-bold",
          tone === "flame" ? "text-flame-600" : muted ? "text-[13px] font-medium text-mist-500" : "text-mist-100",
        )}
      >
        {value}
      </span>
    </div>
  );
}
