"use client";

import { useMemo, useState } from "react";
import type { CartModifier, Product } from "@/lib/types";
import { BottomSheet, FoodImage, Price, QuantitySelector, Textarea } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { faNumber } from "@/lib/format";

/** Quick-customise bottom sheet — used on cards so users never leave the grid. */
export function ProductSheet({
  product,
  open,
  onClose,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  const { addItem } = useStore();
  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const modifiers: CartModifier[] = useMemo(
    () => product.modifiers.filter((m) => selected.includes(m.id)).map((m) => ({ id: m.id, name: m.name, price: m.price })),
    [product.modifiers, selected],
  );

  const unit = product.price + modifiers.reduce((s, m) => s + m.price, 0);

  const submit = () => {
    addItem(product, qty, modifiers, note.trim() || undefined);
    onClose();
    setQty(1);
    setSelected([]);
    setNote("");
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={product.name}>
      <div className="p-5">
        <div className="flex gap-4">
          <FoodImage src={product.image} alt={product.name} className="size-24 shrink-0 rounded-2xl" sizes="96px" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] leading-6 text-mist-400">{product.shortDescription}</p>
            <div className="mt-2">
              <Price value={product.price} compareAt={product.compareAtPrice} size="lg" />
            </div>
          </div>
        </div>

        {product.modifiers.length > 0 && (
          <div className="mt-6">
            <h4 className="mb-3 text-[13px] font-bold text-mist-100">افزودنی‌ها</h4>
            <div className="grid gap-2">
              {product.modifiers.map((m) => {
                const on = selected.includes(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() =>
                      setSelected((prev) => (on ? prev.filter((x) => x !== m.id) : [...prev, m.id]))
                    }
                    className={cn(
                      "flex min-h-14 items-center justify-between rounded-2xl border px-4 py-3 text-right transition-all",
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

        <div className="mt-5">
          <h4 className="mb-2 text-[13px] font-bold text-mist-100">توضیحات سفارش</h4>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="مثلاً: بدون خیارشور، سس جدا"
            className="min-h-20"
          />
        </div>
      </div>

      {/* `block` (width:100%) fought `flex-1` and pushed the CTA past the
          sheet's edge. The row is a flex container, so the button just needs
          `flex-1` + `min-w-0`; the label truncates rather than overflowing. */}
      <div className="sticky bottom-0 flex items-center gap-2.5 border-t border-[var(--surface-border)] bg-ink-900/95 pad-card backdrop-blur">
        {/* Compact selector on phones: the md size is ~152px wide and starved
            the CTA, forcing its label to ellipsis. Full size returns from sm. */}
        <span className="shrink-0">
          <QuantitySelector value={qty} onChange={(v) => setQty(Math.max(1, v))} size="sm" />
        </span>
        {/*
          Two stacked lines instead of one long string. "افزودن — ۳۹۵,۰۰۰ تومان"
          cannot fit beside the quantity selector on a 320px phone, and
          truncating it hid the price — the one number the user is deciding on.
          Splitting the action from the amount keeps BOTH fully readable.
        */}
        <Button size="lg" onClick={submit} className="min-w-0 flex-1 flex-col gap-0 px-3 leading-none sm:px-5">
          <span className="text-[13.5px] font-extrabold">افزودن به سبد</span>
          <span className="num mt-1 text-[12.5px] font-bold opacity-90">
            {faNumber(unit * qty)} تومان
          </span>
        </Button>
      </div>
    </BottomSheet>
  );
}
