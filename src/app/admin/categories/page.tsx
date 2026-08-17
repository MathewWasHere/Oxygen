"use client";

import Image from "next/image";
import { useState } from "react";
import { categories as seed, products } from "@/lib/data/catalog";
import type { Category } from "@/lib/types";
import { toFa } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { useStore } from "@/lib/store";

export default function AdminCategoriesPage() {
  const { pushToast } = useStore();
  const [items, setItems] = useState<Category[]>(seed);

  const move = (index: number, dir: -1 | 1) => {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next.map((c, i) => ({ ...c, sortOrder: i + 1 })));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[17px] font-extrabold text-mist-100">دسته‌بندی‌ها</h1>
          <p className="mt-1 text-[12px] text-mist-500">ترتیب نمایش در منو را اینجا تنظیم کن.</p>
        </div>
        <Button
          onClick={() =>
            setItems((prev) => [
              ...prev,
              {
                id: `c${Date.now()}`,
                slug: `new-${prev.length + 1}`,
                name: "دسته جدید",
                image: "/food/fries-cheese-mushroom-sm.webp",
                sortOrder: prev.length + 1,
                active: true,
              },
            ])
          }
        >
          + دسته جدید
        </Button>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((c, i) => {
          const count = products.filter((p) => p.categoryId === c.id).length;
          return (
            <div
              key={c.id}
              className={cn(
                "overflow-hidden rounded-2xl border bg-ink-900 transition-all",
                c.active ? "border-[var(--surface-border)]" : "border-[var(--surface-border)] opacity-55",
              )}
            >
              <div className="relative h-28">
                <Image src={c.image} alt={c.name} fill sizes="360px" className="object-cover opacity-70" />
                <div className="absolute inset-0 bg-black/40" />
                <span className="num absolute right-3 top-3 grid size-7 place-items-center rounded-lg bg-black/60 text-[11px] font-extrabold text-white backdrop-blur">
                  {toFa(c.sortOrder)}
                </span>
                <div className="absolute left-3 top-3 flex gap-1">
                  <button
                    onClick={() => move(i, -1)}
                    className="tap-44 grid size-7 place-items-center rounded-lg bg-black/60 text-white backdrop-blur transition-colors hover:text-flame-600"
                    aria-label="بالا"
                  >
                    <Icon name="chevron" className="size-3.5 rotate-90" />
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    className="tap-44 grid size-7 place-items-center rounded-lg bg-black/60 text-white backdrop-blur transition-colors hover:text-flame-600"
                    aria-label="پایین"
                  >
                    <Icon name="chevron" className="size-3.5 -rotate-90" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <Input
                  value={c.name}
                  onChange={(e) =>
                    setItems((prev) => prev.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x)))
                  }
                  className="h-10 text-[13px] font-bold"
                />
                <div className="mt-3 flex items-center justify-between">
                  <span className="num text-[11px] text-mist-500">{toFa(count)} محصول</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setItems((prev) =>
                          prev.map((x) => (x.id === c.id ? { ...x, active: !x.active } : x)),
                        )
                      }
                      className={cn(
                        "inline-flex min-h-9 items-center rounded-lg px-2.5 text-[11px] font-bold transition-colors",
                        c.active
                          ? "bg-emerald-500/12 text-emerald-600"
                          : "bg-[var(--white-a6)] text-mist-400",
                      )}
                    >
                      {c.active ? "فعال" : "غیرفعال"}
                    </button>
                    <button
                      onClick={() => {
                        setItems((prev) => prev.filter((x) => x.id !== c.id));
                        pushToast({ title: "دسته حذف شد", tone: "error" });
                      }}
                      className="inline-flex min-h-9 items-center rounded-lg px-2 text-[11px] font-bold text-mist-500 transition-colors hover:text-red-500"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
