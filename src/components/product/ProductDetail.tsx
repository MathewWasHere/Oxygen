"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CartModifier, Product } from "@/lib/types";
import { Badge, FoodImage, Price, QuantitySelector, Rating, SectionHead, Textarea } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/product/ProductCard";
import { useStore } from "@/lib/store";
import { productsByCategory, smallImage } from "@/lib/data/catalog";
import { cn } from "@/lib/cn";
import { faNumber, toFa } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";

export function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const { addItem, state, toggleFavorite } = useStore();
  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const fav = state.favorites.includes(product.id);

  const modifiers: CartModifier[] = useMemo(
    () =>
      product.modifiers
        .filter((m) => selected.includes(m.id))
        .map((m) => ({ id: m.id, name: m.name, price: m.price })),
    [product.modifiers, selected],
  );

  const unit = product.price + modifiers.reduce((s, m) => s + m.price, 0);
  const total = unit * qty;

  /*
   * DRINK UPSELL (item 7)
   * A drink belongs at the point of decision — right beside the add-ons —
   * not buried in "related products" below the fold. Suppressed on drink
   * pages themselves, where it would be nonsense.
   */
  const isDrink = product.categoryId === "c9";
  const drinks = useMemo(
    () => (isDrink ? [] : productsByCategory("c9").filter((d) => d.available && d.price > 0).slice(0, 4)),
    [isDrink],
  );

  return (
    <div className="pb-nav-action lg:pb-8">
      <div className="shell pt-5">
        <nav className="flex min-w-0 flex-wrap items-center gap-x-2 text-[13px] text-mist-500">
          <Link href="/" className="inline-flex min-h-11 shrink-0 items-center hover:text-flame-600">
            خانه
          </Link>
          <Icon name="chevron" className="size-3.5 rotate-180" />
          <Link href="/menu" className="inline-flex min-h-11 shrink-0 items-center hover:text-flame-600">
            منو
          </Link>
          <Icon name="chevron" className="size-3.5 rotate-180" />
          <span className="min-w-0 truncate text-mist-300">{product.name}</span>
        </nav>
      </div>

      <div className="shell grid gap-6 py-4 sm:py-6 lg:grid-cols-2 lg:gap-12 lg:py-10">
        {/* Gallery */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="relative overflow-hidden rounded-2xl border border-[var(--surface-border)]">
            <FoodImage
              src={product.image}
              alt={product.name}
              priority
              className="aspect-square w-full"
              sizes="(max-width:1024px) 100vw, 560px"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-black/35" />
            <div className="absolute inset-x-4 top-4 flex justify-between">
              <div className="flex gap-2">
                {product.badges?.map((b) => (
                  <Badge key={b} className="backdrop-blur-md">
                    <Icon name="flame" filled className="size-3" />
                    {b}
                  </Badge>
                ))}
              </div>
              <button
                onClick={() => toggleFavorite(product.id)}
                aria-label="افزودن به علاقه‌مندی‌ها"
                className={cn(
                  "grid size-11 place-items-center rounded-full border backdrop-blur-md transition-all",
                  fav
                    ? "border-flame-600 bg-flame-600 text-white"
                    : "border-[var(--surface-border)] bg-ink-950 text-white",
                )}
              >
                <Icon name="heart" filled={fav} className="size-5" />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { icon: "clock" as const, label: "آماده‌سازی", value: `${toFa(product.prepMinutes)} دقیقه` },
              { icon: "star" as const, label: "امتیاز", value: toFa(product.rating.toFixed(1)) },
              { icon: "flame" as const, label: "فروش", value: product.soldCount > 0 ? `${toFa(product.soldCount)}+` : "جدید" },
            ].map((s) => (
              <div key={s.label} className="surface rounded-2xl p-3 text-center">
                <Icon name={s.icon} className="mx-auto size-4.5 text-flame-500" />
                <div className="num mt-1.5 text-[13px] font-extrabold text-mist-100">{s.value}</div>
                <div className="text-[13px] text-mist-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between sm:gap-4">
            <div>
              <h1 className="text-[22px] font-extrabold leading-8 text-mist-100 sm:text-3xl">{product.name}</h1>
              <div className="mt-2 flex items-center gap-3">
                <Rating value={product.rating} count={product.soldCount > 0 ? product.soldCount : undefined} />
                {product.available ? (
                  <Badge tone="success">موجود</Badge>
                ) : (
                  <Badge tone="danger">ناموجود</Badge>
                )}
              </div>
            </div>
            <Price value={product.price} compareAt={product.compareAtPrice} size="xl" />
          </div>

          <p className="mt-4 text-[14.5px] leading-8 text-mist-300">{product.description}</p>

          <div className="mt-6">
            <h3 className="mb-3 text-[13px] font-extrabold text-mist-100">مواد تشکیل‌دهنده</h3>
            <div className="flex flex-wrap gap-2">
              {product.ingredients.map((ing) => (
                <span
                  key={ing}
                  className="rounded-full border border-[var(--surface-border)] bg-ink-850 px-3.5 py-2 text-[13px] text-mist-300"
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>

          {product.modifiers.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-3 flex items-center justify-between text-[13px] font-extrabold text-mist-100">
                افزودنی‌ها
                <span className="text-[13px] font-medium text-mist-500">اختیاری</span>
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {product.modifiers.map((m) => {
                  const on = selected.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() =>
                        setSelected((prev) => (on ? prev.filter((x) => x !== m.id) : [...prev, m.id]))
                      }
                      className={cn(
                        "flex min-h-14 items-center justify-between rounded-2xl border px-4 py-3.5 text-right transition-all",
                        on
                          ? "border-flame-600/60 bg-flame-600/10"
                          : "border-[var(--surface-border)] bg-ink-850 hover:border-[var(--surface-border-strong)]",
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={cn(
                            "grid size-5 place-items-center rounded-md border text-[13px] transition-colors",
                            on ? "border-flame-500 bg-flame-500 text-white" : "border-[var(--surface-border-strong)]",
                          )}
                        >
                          {on && <Icon name="check" className="size-3" />}
                        </span>
                        <span className="text-[14px] font-medium text-mist-100">{m.name}</span>
                      </span>
                      <span className="num text-[13px] font-bold text-flame-600">+{faNumber(m.price)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {drinks.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 flex items-center justify-between text-[13px] font-extrabold text-mist-100">
                نوشیدنی اضافه کن
                <span className="text-[13px] font-medium text-mist-500">اختیاری</span>
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {drinks.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => addItem(d, 1)}
                    aria-label={`افزودن ${d.name} به سبد خرید`}
                    className="flex min-h-14 items-center gap-2 rounded-2xl border border-[var(--surface-border)] bg-ink-850 p-2 text-right transition-colors hover:border-flame-600/50"
                  >
                    <FoodImage
                      src={smallImage(d.image)}
                      alt={d.name}
                      className="size-11 shrink-0 rounded-xl"
                      sizes="44px"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-bold text-mist-100">
                        {d.name}
                      </span>
                      <span className="num block text-[12.5px] font-bold text-flame-600">
                        +{faNumber(d.price)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="mb-3 text-[13px] font-extrabold text-mist-100">توضیحات برای آشپزخانه</h3>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="مثلاً: بدون پیاز، سس تند اضافه"
            />
          </div>

          {/* Desktop add-to-cart */}
          <div className="mt-8 hidden items-center gap-4 rounded-2xl border border-[var(--surface-border)] bg-ink-850 p-4 lg:flex">
            <QuantitySelector value={qty} onChange={(v) => setQty(Math.max(1, v))} />
            <div className="flex-1">
              <div className="text-[13px] text-mist-500">مبلغ قابل پرداخت</div>
              <div className="num text-xl font-extrabold text-mist-100">
                {product.price > 0 ? `${faNumber(total)} تومان` : "قیمت به‌زودی"}
              </div>
            </div>
            <Button
              size="lg"
              disabled={!product.available || product.price <= 0}
              onClick={() => addItem(product, qty, modifiers, note.trim() || undefined)}
            >
              {product.price > 0 ? "افزودن به سبد خرید" : "قیمت هنوز ثبت نشده"}
            </Button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="shell py-8">
          <SectionHead title="کنارش اینا هم عالیه" />
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile sticky bar */}
      <div className="above-nav fixed inset-x-0 z-45 border-t border-[var(--surface-border)] bg-ink-950/97 p-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <QuantitySelector value={qty} onChange={(v) => setQty(Math.max(1, v))} size="sm" />
          <Button
            block
            size="lg"
            disabled={!product.available || product.price <= 0}
            onClick={() => addItem(product, qty, modifiers, note.trim() || undefined)}
            className="flex-1"
          >
            {product.price > 0 ? (
              <>افزودن — <span className="num">{faNumber(total)}</span> تومان</>
            ) : (
              "قیمت هنوز ثبت نشده"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
