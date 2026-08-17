"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { categories, products as seed } from "@/lib/data/catalog";
import type { Product } from "@/lib/types";
import { faNumber, toEn, toFa } from "@/lib/format";
import { cn } from "@/lib/cn";
import { BottomSheet, Field, Input, Textarea } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useStore } from "@/lib/store";

export default function AdminProductsPage() {
  const { pushToast } = useStore();
  const [items, setItems] = useState<Product[]>(seed);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [editing, setEditing] = useState<Product | null>(null);

  const filtered = useMemo(
    () =>
      items.filter(
        (p) =>
          (cat === "all" || p.categoryId === cat) &&
          (query === "" || p.name.includes(query) || p.shortDescription.includes(query)),
      ),
    [items, cat, query],
  );

  const patch = (id: string, changes: Partial<Product>) =>
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...changes } : p)));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[17px] font-extrabold text-mist-100">محصولات</h1>
          <p className="num mt-1 text-[12px] text-mist-500">
            {toFa(items.length)} محصول — {toFa(items.filter((p) => !p.available).length)} ناموجود
          </p>
        </div>
        <Button onClick={() => setEditing(items[0])}>+ افزودن محصول</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-52 flex-1">
          <Icon name="search" className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-mist-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجوی محصول…"
            className="h-11 pr-11 text-[13px]"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <FilterChip active={cat === "all"} onClick={() => setCat("all")}>
            همه
          </FilterChip>
          {categories.map((c) => (
            <FilterChip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
              {c.name}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--surface-border)] bg-ink-900">
        <div className="hidden grid-cols-[1fr_110px_92px_74px_74px_104px] gap-2.5 border-b border-[var(--surface-border)] px-3 py-2 text-[10.5px] font-bold text-mist-500 lg:grid">
          <span>محصول</span>
          <span>دسته</span>
          <span>قیمت</span>
          <span>موجود</span>
          <span>محبوب</span>
          <span className="text-left">عملیات</span>
        </div>

        <div className="divide-y divide-[var(--hairline)]">
          {filtered.map((p) => (
            <div
              key={p.id}
              /*
               * MOBILE (item 17): `grid-cols-1` gave each of the six desktop
               * cells its own full-width row, so a product was ~390px tall and
               * five of those rows were mostly empty space. Mobile now uses a
               * real two-row card — identity on top, metadata + controls in a
               * single wrapped row beneath — while `lg` keeps the exact table
               * geometry it already had.
               */
              className="px-3 py-2.5 transition-colors hover:bg-[var(--white-a4)] lg:grid lg:grid-cols-[1fr_110px_92px_74px_74px_104px] lg:items-center lg:gap-2.5 lg:py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <Image src={p.image} alt="" aria-hidden="true" width={36} height={36} className="size-9 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-bold leading-tight text-mist-100">{p.name}</div>
                  <div className="truncate text-[10.5px] leading-tight text-mist-500">{p.shortDescription}</div>
                </div>
                {/* Price rides with the title on phones; its own column on lg. */}
                <span className="num shrink-0 text-[12px] font-bold text-mist-100 lg:hidden">
                  {faNumber(p.price)}
                </span>
              </div>

              {/* Second mobile row: category + both toggles + actions, wrapped
                  into the width that is actually available. */}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 lg:contents lg:mt-0">
                <span className="truncate text-[11.5px] text-mist-400 lg:min-w-0">
                  {categories.find((c) => c.id === p.categoryId)?.name}
                </span>

                <span className="num hidden text-[12px] font-bold text-mist-100 lg:block">
                  {faNumber(p.price)}
                </span>

                <span className="flex items-center gap-1.5">
                  <span className="text-[10.5px] text-mist-500 lg:hidden">موجود</span>
                  <Toggle
                    on={p.available}
                    onClick={() => {
                      patch(p.id, { available: !p.available });
                      pushToast({ title: !p.available ? "محصول موجود شد" : "محصول ناموجود شد" });
                    }}
                  />
                </span>

                <span className="flex items-center gap-1.5">
                  <span className="text-[10.5px] text-mist-500 lg:hidden">ویژه</span>
                  <Toggle on={p.popular} onClick={() => patch(p.id, { popular: !p.popular })} tone="flame" />
                </span>

                <div className="mr-auto flex gap-1.5 lg:mr-0 lg:justify-end">
                  <button
                    onClick={() => setEditing(p)}
                    className="inline-flex min-h-9 items-center rounded-md border border-[var(--surface-border)] px-2 text-[10.5px] font-bold text-mist-300 transition-colors hover:border-flame-600/40 hover:text-flame-600"
                  >
                    ویرایش
                  </button>
                  <button
                    onClick={() => {
                      setItems((prev) => prev.filter((x) => x.id !== p.id));
                      pushToast({ title: "محصول حذف شد", tone: "error" });
                    }}
                    className="inline-flex min-h-9 items-center rounded-md border border-[var(--surface-border)] px-2 text-[10.5px] font-bold text-mist-500 transition-colors hover:border-red-500/40 hover:text-red-500"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ProductEditor
        product={editing}
        onClose={() => setEditing(null)}
        onSave={(next) => {
          patch(next.id, next);
          setEditing(null);
          pushToast({ title: "تغییرات ذخیره شد", tone: "success" });
        }}
      />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-11 shrink-0 rounded-xl border px-4 text-[12px] font-bold transition-all",
        active ? "border-flame-600/60 bg-flame-600/12 text-flame-600" : "border-[var(--surface-border)] bg-ink-850 text-mist-400",
      )}
    >
      {children}
    </button>
  );
}

function Toggle({ on, onClick, tone }: { on: boolean; onClick: () => void; tone?: "flame" }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      className={cn(
        "tap-44 relative h-6 w-11 shrink-0 rounded-full transition-colors",
        on ? (tone === "flame" ? "bg-flame-600" : "bg-emerald-500/80") : "bg-[var(--white-a10)]",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-5 rounded-full bg-white transition-all",
          on ? "right-0.5" : "right-5.5",
        )}
      />
    </button>
  );
}

function ProductEditor({
  product,
  onClose,
  onSave,
}: {
  product: Product | null;
  onClose: () => void;
  onSave: (p: Product) => void;
}) {
  const [draft, setDraft] = useState<Product | null>(product);

  if (product && draft?.id !== product.id) setDraft(product);
  if (!draft) return null;

  return (
    <BottomSheet open={!!product} onClose={onClose} title="ویرایش محصول" maxWidth="max-w-xl">
      <div className="space-y-3 p-4">
        <div className="flex gap-3">
          <Image src={draft.image} alt="" width={80} height={80} className="size-20 rounded-2xl object-cover" />
          <div className="flex-1">
            <Field label="نام محصول" required>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </Field>
          </div>
        </div>

        <Field label="توضیح کوتاه">
          <Input
            value={draft.shortDescription}
            onChange={(e) => setDraft({ ...draft, shortDescription: e.target.value })}
          />
        </Field>

        <Field label="توضیح کامل">
          <Textarea
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="قیمت (تومان)" required>
            <Input
              value={faNumber(draft.price)}
              onChange={(e) => setDraft({ ...draft, price: Number(toEn(e.target.value).replace(/\D/g, "")) || 0 })}
              inputMode="numeric"
            />
          </Field>
          <Field label="قیمت قبل تخفیف">
            <Input
              value={draft.compareAtPrice ? faNumber(draft.compareAtPrice) : ""}
              onChange={(e) => {
                const v = Number(toEn(e.target.value).replace(/\D/g, ""));
                setDraft({ ...draft, compareAtPrice: v || undefined });
              }}
              inputMode="numeric"
            />
          </Field>
          <Field label="زمان آماده‌سازی (دقیقه)">
            <Input
              value={toFa(draft.prepMinutes)}
              onChange={(e) =>
                setDraft({ ...draft, prepMinutes: Number(toEn(e.target.value).replace(/\D/g, "")) || 0 })
              }
              inputMode="numeric"
            />
          </Field>
        </div>

        <Field label="دسته‌بندی">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setDraft({ ...draft, categoryId: c.id })}
                className={cn(
                  "rounded-xl border px-3.5 py-2 text-[12px] font-bold transition-all",
                  draft.categoryId === c.id
                    ? "border-flame-600 bg-flame-600/12 text-flame-600"
                    : "border-[var(--surface-border)] bg-ink-850 text-mist-400",
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </Field>

        <Field label="مواد تشکیل‌دهنده" hint="با کاما جدا کنید">
          <Input
            value={draft.ingredients.join("، ")}
            onChange={(e) =>
              setDraft({ ...draft, ingredients: e.target.value.split(/[،,]/).map((s) => s.trim()).filter(Boolean) })
            }
          />
        </Field>

        <div className="flex gap-6 pt-2">
          <label className="flex items-center gap-2.5 text-[13px] text-mist-200">
            <Toggle on={draft.available} onClick={() => setDraft({ ...draft, available: !draft.available })} />
            موجود
          </label>
          <label className="flex items-center gap-2.5 text-[13px] text-mist-200">
            <Toggle
              on={draft.popular}
              tone="flame"
              onClick={() => setDraft({ ...draft, popular: !draft.popular })}
            />
            نمایش در پرفروش‌ها
          </label>
        </div>
      </div>

      <div className="sticky bottom-0 flex gap-2 border-t border-[var(--surface-border)] bg-ink-900/95 p-3 backdrop-blur">
        <Button variant="secondary" onClick={onClose}>
          انصراف
        </Button>
        <Button className="min-w-0 flex-1" onClick={() => onSave(draft)}>
          ذخیره تغییرات
        </Button>
      </div>
    </BottomSheet>
  );
}
