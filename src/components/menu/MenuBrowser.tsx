"use client";

import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { categories, products } from "@/lib/data/catalog";
import { ProductCard } from "@/components/product/ProductCard";
import { Input } from "@/components/ui";
import { cn } from "@/lib/cn";
import { toFa } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { faNumber } from "@/lib/format";

type SortKey = "popular" | "cheap" | "expensive" | "fast";

const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: "popular", label: "محبوب‌ترین" },
  { key: "cheap", label: "ارزان‌ترین" },
  { key: "expensive", label: "گران‌ترین" },
  { key: "fast", label: "سریع‌ترین" },
];

function MenuInner() {
  const params = useSearchParams();
  const urlCategory = params.get("c") ?? "all";
  /** Local override wins until the URL changes again (keyed by urlCategory). */
  const [override, setOverride] = useState<{ key: string; value: string } | null>(null);
  const active = override?.key === urlCategory ? override.value : urlCategory;
  const setActive = (value: string) => setOverride({ key: urlCategory, value });
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("popular");
  const { cartCount, totals } = useStore();
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const filtered = useMemo(() => {
    let list = products;
    if (query.trim()) {
      const q = query.trim();
      list = list.filter(
        (p) => p.name.includes(q) || p.shortDescription.includes(q) || p.ingredients.some((i) => i.includes(q)),
      );
    }
    const sorted = [...list].sort((a, b) => {
      if (sort === "cheap") return a.price - b.price;
      if (sort === "expensive") return b.price - a.price;
      if (sort === "fast") return a.prepMinutes - b.prepMinutes;
      return b.soldCount - a.soldCount;
    });
    return sorted;
  }, [query, sort]);

  const visibleCategories = categories.filter((c) => (active === "all" ? true : c.slug === active));

  const scrollTo = (slug: string) => {
    setActive(slug);
    if (slug === "all") window.scrollTo({ top: 0, behavior: "smooth" });
    else sectionRefs.current[slug]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resultCount = visibleCategories.reduce(
    (sum, c) => sum + filtered.filter((p) => p.categoryId === c.id).length,
    0,
  );

  return (
    <div className="lg:pb-10">
      {/* Header — compact on mobile so food is visible immediately */}
      <div className="relative border-b border-[var(--surface-border)] bg-ink-900">        <div className="shell relative py-4 sm:py-10">
          <div className="hidden sm:block">
            <span className="flex items-center gap-2 text-[13px] font-bold text-flame-500">
              <span className="h-px w-6 bg-flame-600" />
              منوی اکسیژن
            </span>
            <h1 className="mt-2 text-3xl font-extrabold text-mist-100 sm:text-4xl">امشب چی بخوریم؟</h1>
            <p className="mt-2 text-[13px] text-mist-400">
              <span className="num">{toFa(products.length)}</span> آیتم آماده سفارش — قیمت‌ها به‌روز است.
            </p>
          </div>

          <h1 className="mb-3 text-xl font-extrabold text-mist-100 sm:hidden">منوی اکسیژن</h1>

          <div className="flex flex-col gap-2.5 sm:mt-6 sm:flex-row sm:gap-3">
            <div className="relative flex-1">
              <Icon name="search" className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-mist-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جستجو در منو…"
                className="h-12 pr-12"
                aria-label="جستجو در منو"
              />
            </div>
            <div className="snap-rail -mx-3.5 flex gap-2 overflow-x-auto px-3.5 no-scrollbar sm:mx-0 sm:px-0">
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSort(s.key)}
                  className={cn(
                    "h-11 shrink-0 rounded-2xl border px-4 text-[13px] font-bold transition-all sm:h-12",
                    sort === s.key
                      ? "border-flame-600/60 bg-flame-600/12 text-flame-600"
                      : "border-[var(--surface-border)] bg-ink-850 text-mist-400 hover:text-mist-100",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky category nav (mobile) */}
      <div className="sticky top-14 z-40 border-b border-[var(--surface-border)] bg-ink-950/95 backdrop-blur-xl lg:hidden">
        <div className="snap-rail flex gap-2 overflow-x-auto px-3.5 py-2.5 no-scrollbar">
          {[{ id: "all", slug: "all", name: "همه" }, ...categories].map((c) => (
            <button
              key={c.slug}
              onClick={() => scrollTo(c.slug)}
              className={cn(
                "h-11 shrink-0 rounded-full border px-4 text-[13.5px] font-bold leading-none transition-all",
                active === c.slug
                  ? "border-flame-500 bg-flame-600 text-white"
                  : "border-[var(--surface-border)] bg-ink-850 text-mist-300",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="shell grid gap-8 py-4 sm:py-8 lg:grid-cols-[220px_1fr]">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-1.5">
            <button
              onClick={() => scrollTo("all")}
              className={cn(
                "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-[13px] font-bold transition-all",
                active === "all" ? "bg-flame-600/12 text-flame-600" : "text-mist-400 hover:bg-[var(--white-a4)] hover:text-white",
              )}
            >
              همه دسته‌ها
              <span className="num text-[13px] text-mist-500">{toFa(products.length)}</span>
            </button>
            {categories.map((c) => {
              const count = products.filter((p) => p.categoryId === c.id).length;
              return (
                <button
                  key={c.id}
                  onClick={() => scrollTo(c.slug)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-[13px] font-bold transition-all",
                    active === c.slug
                      ? "bg-flame-600/12 text-flame-600"
                      : "text-mist-400 hover:bg-[var(--white-a4)] hover:text-mist-100",
                  )}
                >
                  {c.name}
                  <span className="num text-[13px] text-mist-500">{toFa(count)}</span>
                </button>
              );
            })}

            <div className="mt-6 rounded-2xl border border-flame-600/25 bg-flame-600/8 p-5">
              <Icon name="gift" className="size-6 text-gold-600" />
              <div className="mt-3 text-[13px] font-extrabold text-mist-100">۱۰٪ تخفیف اولین سفارش</div>
              <p className="mt-1.5 text-[13px] leading-6 text-mist-400">
                کد <span className="font-bold text-flame-600">OXYGEN10</span> را هنگام پرداخت وارد کن.
              </p>
            </div>
          </div>
        </aside>

        {/* Product sections */}
        <div>
          {resultCount === 0 ? (
            <div className="surface flex flex-col items-center rounded-2xl px-6 py-20 text-center">
              <span className="grid size-16 place-items-center rounded-full bg-flame-600/10 text-3xl">🔍</span>
              <h3 className="mt-5 text-lg font-extrabold text-mist-100">چیزی پیدا نشد</h3>
              <p className="mt-2 text-[13px] text-mist-400">عبارت دیگری را امتحان کن یا فیلتر را بردار.</p>
              <button
                onClick={() => {
                  setQuery("");
                  setActive("all");
                }}
                className="mt-5 rounded-xl border border-flame-600/40 px-4 py-2 text-[13px] font-bold text-flame-600"
              >
                پاک کردن فیلترها
              </button>
            </div>
          ) : (
            visibleCategories.map((c, sectionIndex) => {
              const items = filtered.filter((p) => p.categoryId === c.id);
              if (items.length === 0) return null;
              return (
                <section
                  key={c.id}
                  id={c.slug}
                  ref={(el) => {
                    sectionRefs.current[c.slug] = el;
                  }}
                  className="mb-7 scroll-mt-32 sm:mb-7"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <h2 className="text-xl font-extrabold text-mist-100">{c.name}</h2>
                    <span className="h-px flex-1 bg-[var(--white-a8)]" />
                    <span className="num text-[13px] text-mist-500">{toFa(items.length)} آیتم</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
                    {items.map((p, i) => (
                      <ProductCard key={p.id} product={p} priority={sectionIndex === 0 && i < 3} />
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </div>

      {/* Floating cart bar (mobile) */}
      {cartCount > 0 && (
        <Link
          href="/cart"
          className="above-nav fixed inset-x-3 z-45 mb-2 flex animate-fade-up items-center justify-between gap-3 rounded-2xl bg-flame-600 px-5 py-4 text-white shadow-[0_12px_34px_-14px_rgba(0,0,0,0.45)] lg:hidden"
        >
          <span className="flex items-center gap-2 text-[13px] font-extrabold">
            <span className="num grid size-6 place-items-center rounded-full bg-black/20">{toFa(cartCount)}</span>
            مشاهده سبد خرید
          </span>
          <span className="num text-[14px] font-extrabold">{faNumber(totals.subtotal)} تومان</span>
        </Link>
      )}
    </div>
  );
}

export function MenuBrowser() {
  return (
    <Suspense fallback={<div className="shell py-20 text-center text-mist-400">در حال بارگذاری منو…</div>}>
      <MenuInner />
    </Suspense>
  );
}
