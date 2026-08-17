"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { AuthPanel } from "@/components/checkout/AuthPanel";
import { AddressForm } from "@/components/checkout/AddressForm";
import { Button, ButtonLink } from "@/components/ui/Button";
import { FoodImage, Input, Price } from "@/components/ui";
import { faNumber, toFa } from "@/lib/format";
import { deliveryZones, RESTAURANT } from "@/lib/data/catalog";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { etaFor } from "@/lib/pricing";

type Step = 1 | 2 | 3 | 4;

const STEP_LABELS = ["ورود", "آدرس", "روش ارسال", "پرداخت"];

export default function CheckoutPage() {
  const router = useRouter();
  const {
    state,
    totals,
    cartCount,
    selectedAddress,
    selectAddress,
    deleteAddress,
    setDeliveryMethod,
    setCoupon,
    placeOrder,
  } = useStore();

  /** Step 1 is skipped entirely once a session exists. */
  const [requestedStep, setRequestedStep] = useState<Step | null>(null);
  const [addressSheet, setAddressSheet] = useState(false);
  const [editing, setEditing] = useState<string | undefined>();
  const [paying, setPaying] = useState<"idle" | "redirect" | "success">("idle");
  const [code, setCode] = useState(state.couponCode);

  const minStep: Step = state.user ? 2 : 1;
  const step: Step = (requestedStep && requestedStep >= minStep ? requestedStep : minStep) as Step;
  const setStep = (next: Step) => setRequestedStep(next);

  useEffect(() => {
    if (state.hydrated && cartCount === 0 && paying === "idle") router.replace("/cart");
  }, [state.hydrated, cartCount, paying, router]);

  const zone = deliveryZones.find((z) => z.id === selectedAddress?.zoneId);
  const eta = etaFor(selectedAddress?.zoneId, state.cart);
  const needsAddress = state.deliveryMethod === "DELIVERY" && !selectedAddress;
  const belowMin = zone ? totals.subtotal < zone.minOrder : false;

  const pay = () => {
    setPaying("redirect");
    setTimeout(() => {
      setPaying("success");
      setTimeout(() => {
        const order = placeOrder({ paymentMethod: "ONLINE" });
        router.push(`/order?id=${order.id}&new=1`);
      }, 1100);
    }, 1600);
  };

  if (paying !== "idle") {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        {paying === "redirect" ? (
          <>
            <span className="size-14 animate-spin rounded-full border-4 border-flame-600/30 border-t-flame-500" />
            <h1 className="mt-7 text-xl font-extrabold text-mist-100">در حال انتقال به درگاه پرداخت…</h1>
            <p className="num mt-2 text-[13px] text-mist-400">
              مبلغ {faNumber(totals.total)} تومان — درگاه بانکی امن
            </p>
          </>
        ) : (
          <>
            <span className="grid size-20 animate-pop place-items-center rounded-full bg-emerald-500/15 text-emerald-500">
              <Icon name="check" className="size-10" />
            </span>
            <h1 className="mt-6 text-2xl font-extrabold text-mist-100">پرداخت موفق</h1>
            <p className="mt-2 text-[13px] text-mist-400">در حال ثبت سفارش در آشپزخانه اکسیژن…</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="shell py-5 sm:py-8 lg:pt-11 lg:pb-14">
      <h1 className="text-xl font-extrabold text-mist-100 sm:text-3xl">ثبت سفارش</h1>

      {/* Stepper */}
      <ol className="snap-rail mt-5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {STEP_LABELS.map((label, i) => {
          const index = (i + 1) as Step;
          const done = step > index;
          const active = step === index;
          return (
            <li key={label} className="flex flex-1 items-center gap-1.5">
              <button
                onClick={() => (done || active ? setStep(index) : null)}
                className={cn(
                  "flex min-h-10 min-w-max items-center gap-2 rounded-2xl border px-3 py-2 text-[13px] font-bold transition-all",
                  active
                    ? "border-flame-600 bg-flame-600/12 text-flame-600"
                    : done
                      ? "border-emerald-500/30 bg-emerald-500/8 text-emerald-600"
                      : "border-[var(--surface-border)] bg-ink-850 text-mist-500",
                )}
              >
                <span
                  className={cn(
                    "num grid size-5 place-items-center rounded-full text-[12px] leading-none tabular-nums",
                    active ? "bg-flame-600 text-white" : done ? "bg-emerald-500/25" : "bg-[var(--white-a8)]",
                  )}
                >
                  {done ? <Icon name="check" className="size-3" /> : toFa(index)}
                </span>
                {label}
              </button>
              {i < STEP_LABELS.length - 1 && <span className="h-px flex-1 bg-[var(--white-a8)]" />}
            </li>
          );
        })}
      </ol>

      <div className="mt-6 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-4">
          {/* STEP 1 — auth */}
          {step === 1 && (
            <div className="animate-fade-up">
              <AuthPanel onDone={() => setStep(2)} />
            </div>
          )}

          {/* STEP 2 — address */}
          {step === 2 && (
            <div className="surface animate-fade-up rounded-2xl pad-panel">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-mist-100">آدرس تحویل</h2>
                <button
                  onClick={() => {
                    setEditing(undefined);
                    setAddressSheet(true);
                  }}
                  className="text-[13px] font-bold text-flame-600 hover:text-flame-500"
                >
                  + آدرس جدید
                </button>
              </div>

              {state.addresses.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-[var(--surface-border-strong)] p-8 text-center">
                  <Icon name="pin" className="mx-auto size-8 text-flame-600" />
                  <p className="mt-3 text-[13px] text-mist-400">هنوز آدرسی ثبت نکرده‌ای.</p>
                  <Button
                    className="mt-4"
                    onClick={() => {
                      setEditing(undefined);
                      setAddressSheet(true);
                    }}
                  >
                    افزودن آدرس
                  </Button>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {state.addresses.map((a) => {
                    const z = deliveryZones.find((x) => x.id === a.zoneId);
                    const active = a.id === state.selectedAddressId;
                    return (
                      <div
                        key={a.id}
                        className={cn(
                          "rounded-2xl border p-4 transition-all",
                          active ? "border-flame-600/60 bg-flame-600/6" : "border-[var(--surface-border)] bg-ink-850",
                        )}
                      >
                        <button onClick={() => selectAddress(a.id)} className="w-full text-right">
                          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                            <span className="flex min-w-0 items-center gap-2">
                              <span
                                className={cn(
                                  "grid size-5 place-items-center rounded-full border text-[12px] leading-none tabular-nums",
                                  active ? "border-flame-500 bg-flame-500 text-white" : "border-[var(--surface-border-strong)]",
                                )}
                              >
                                {active && <Icon name="check" className="size-3" />}
                              </span>
                              <span className="text-[14px] font-extrabold text-mist-100">{a.title}</span>
                            </span>
                            <span className="num max-w-full break-words text-left text-[13px] text-mist-400">
                              {z?.name} — ارسال {faNumber(z?.fee ?? 0)} تومان
                            </span>
                          </div>
                          <p className="mt-2 pr-7 text-[13px] leading-6 text-mist-300">
                            {a.province}، {a.city}، {a.line}
                            {a.plaque && `، پلاک ${toFa(a.plaque)}`}
                            {a.unit && `، واحد ${toFa(a.unit)}`}
                          </p>
                          <p className="num mt-1 pr-7 text-[13px] text-mist-500">
                            {a.recipientName} — {toFa(a.recipientPhone)}
                          </p>
                          {a.note && <p className="mt-1 pr-7 text-[13px] text-mist-500">توضیحات: {a.note}</p>}
                        </button>
                        <div className="mt-3 flex gap-2 border-t border-[var(--surface-border)] pt-3">
                          <button
                            onClick={() => {
                              setEditing(a.id);
                              setAddressSheet(true);
                            }}
                            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] text-mist-400 hover:text-mist-100"
                          >
                            <Icon name="edit" className="size-3.5" /> ویرایش
                          </button>
                          <button
                            onClick={() => deleteAddress(a.id)}
                            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] text-mist-400 hover:text-red-500"
                          >
                            <Icon name="trash" className="size-3.5" /> حذف
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <Button
                block
                size="lg"
                className="mt-5"
                disabled={!selectedAddress}
                onClick={() => setStep(3)}
              >
                ادامه
              </Button>
            </div>
          )}

          {/* STEP 3 — delivery method */}
          {step === 3 && (
            <div className="surface animate-fade-up rounded-2xl pad-panel">
              <h2 className="text-lg font-extrabold text-mist-100">روش دریافت</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {(
                  [
                    {
                      key: "DELIVERY" as const,
                      icon: "bike" as const,
                      title: "ارسال با پیک اکسیژن",
                      desc: zone ? `${zone.name} — حدود ${toFa(eta)} دقیقه` : "بر اساس منطقه محاسبه می‌شود",
                      price: `${faNumber(zone?.fee ?? 20000)} تومان`,
                    },
                    {
                      key: "PICKUP" as const,
                      icon: "pin" as const,
                      title: "تحویل حضوری",
                      desc: `${RESTAURANT.address}`,
                      price: "رایگان",
                    },
                  ]
                ).map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setDeliveryMethod(opt.key)}
                    className={cn(
                      "rounded-2xl border p-4 text-right transition-all",
                      state.deliveryMethod === opt.key
                        ? "border-flame-600/60 bg-flame-600/8"
                        : "border-[var(--surface-border)] bg-ink-850 hover:border-[var(--surface-border-strong)]",
                    )}
                  >
                    <span className="flex items-center justify-between">
                      <Icon name={opt.icon} className="size-6 text-flame-500" />
                      {state.deliveryMethod === opt.key && (
                        <Icon name="check" className="size-4 text-flame-500" />
                      )}
                    </span>
                    <span className="mt-3 block text-[14px] font-extrabold text-mist-100">{opt.title}</span>
                    <span className="mt-1 block text-[13px] leading-6 text-mist-400">{opt.desc}</span>
                    <span className="num mt-2 block text-[13px] font-bold text-flame-600">{opt.price}</span>
                  </button>
                ))}
              </div>

              {belowMin && state.deliveryMethod === "DELIVERY" && (
                <div className="mt-4 flex items-start gap-2 rounded-2xl border border-flame-600/30 bg-flame-600/8 p-3.5">
                  <Icon name="spark" className="mt-0.5 size-4 shrink-0 text-flame-500" />
                  <p className="num text-[13px] leading-6 text-mist-300">
                    حداقل سفارش برای این منطقه {faNumber(zone!.minOrder)} تومان است. مبلغ فعلی سبد شما{" "}
                    {faNumber(totals.subtotal)} تومان است.
                  </p>
                </div>
              )}

              <div className="mt-5 flex gap-3">
                <Button variant="secondary" onClick={() => setStep(2)}>
                  بازگشت
                </Button>
                <Button size="lg" className="min-w-0 flex-1" onClick={() => setStep(4)}>
                  ادامه به پرداخت
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4 — review + payment */}
          {step === 4 && (
            <div className="animate-fade-up space-y-4">
              <div className="surface rounded-2xl pad-panel">
                <h2 className="text-lg font-extrabold text-mist-100">خلاصه سفارش</h2>
                <div className="mt-4 space-y-3">
                  {state.cart.map((i) => (
                    <div key={i.key} className="flex items-center gap-3">
                      <FoodImage src={i.image} alt={i.name} className="size-14 shrink-0 rounded-xl" sizes="56px" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-bold text-mist-100">{i.name}</div>
                        {i.modifiers.length > 0 && (
                          <div className="truncate text-[13px] text-flame-600">
                            {i.modifiers.map((m) => m.name).join("، ")}
                          </div>
                        )}
                        <div className="num text-[13px] text-mist-500">تعداد: {toFa(i.quantity)}</div>
                      </div>
                      <Price
                        value={(i.unitPrice + i.modifiers.reduce((s, m) => s + m.price, 0)) * i.quantity}
                        size="sm"
                      />
                    </div>
                  ))}
                </div>

                {state.deliveryMethod === "DELIVERY" && selectedAddress && (
                  <div className="mt-5 rounded-2xl border border-[var(--surface-border)] bg-ink-850 pad-panel">
                    <div className="flex items-center gap-2 text-[13px] font-bold text-mist-100">
                      <Icon name="pin" className="size-4 text-flame-500" />
                      {selectedAddress.title}
                    </div>
                    <p className="mt-1.5 text-[13px] leading-6 text-mist-400">
                      {selectedAddress.city}، {selectedAddress.line}
                    </p>
                    <p className="num mt-1 text-[13px] text-mist-500">
                      تحویل حدود {toFa(eta)} دقیقه پس از تأیید
                    </p>
                  </div>
                )}
              </div>

              <div className="surface rounded-2xl pad-panel">
                <h2 className="text-lg font-extrabold text-mist-100">روش پرداخت</h2>
                <div className="mt-4 flex min-h-16 w-full items-center gap-3 rounded-2xl border border-flame-600/60 bg-flame-600/8 p-4 text-right">
                  <span className="grid size-5 place-items-center rounded-full bg-flame-500 text-white">
                    <Icon name="check" className="size-3" />
                  </span>
                  <Icon name="shield" className="size-5 text-flame-500" />
                  <span className="flex-1">
                    <span className="block text-[13px] font-extrabold text-mist-100">درگاه پرداخت آنلاین</span>
                    <span className="block text-[13px] text-mist-400">پرداخت امن از طریق درگاه بانکی</span>
                  </span>
                </div>

                <div className="mt-5 flex gap-3">
                  <Button variant="secondary" onClick={() => setStep(3)}>
                    بازگشت
                  </Button>
                  <Button size="lg" className="min-w-0 flex-1" onClick={pay} disabled={needsAddress}>
                    پرداخت و ثبت سفارش
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary rail */}
        <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <div className="surface min-w-0 max-w-full rounded-2xl p-4 sm:p-5">
            <h2 className="text-[15px] font-extrabold text-mist-100">صورتحساب</h2>
            <div className="mt-4 space-y-3 border-b border-[var(--surface-border)] pb-4 text-[13px]">
              <div className="flex justify-between">
                <span className="text-mist-400">جمع سفارش</span>
                <span className="num font-bold text-mist-100">{faNumber(totals.subtotal)} تومان</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mist-400">هزینه ارسال</span>
                <span className="num font-bold text-mist-100">{faNumber(totals.deliveryFee)} تومان</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mist-400">تخفیف</span>
                <span className={cn("num font-bold", totals.discount > 0 ? "text-flame-600" : "text-mist-100")}>
                  {totals.discount > 0 ? "−" : ""}
                  {faNumber(totals.discount)} تومان
                </span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[13px] text-mist-300">مبلغ قابل پرداخت</span>
              <Price value={totals.total} size="xl" />
            </div>

            <div className="mt-5 flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="کد تخفیف"
                className="h-11 flex-1 text-[13px]"
              />
              <Button variant="secondary" onClick={() => setCoupon(code)}>
                اعمال
              </Button>
            </div>
            {totals.appliedCoupon && (
              <p className="mt-2 flex items-center gap-1.5 text-[13px] text-emerald-500">
                  <Icon name="check" className="size-3.5 shrink-0" />
                  {totals.appliedCoupon.description}
                </p>
            )}
            {state.couponCode && totals.couponError && (
              <p className="mt-2 text-[13px] text-red-500">{totals.couponError}</p>
            )}

            <ButtonLink href="/cart" variant="ghost" block className="mt-4">
              ویرایش سبد خرید
            </ButtonLink>
          </div>
        </aside>
      </div>

      <AddressForm
        open={addressSheet}
        onClose={() => setAddressSheet(false)}
        initial={state.addresses.find((a) => a.id === editing)}
      />
    </div>
  );
}
