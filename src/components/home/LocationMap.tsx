"use client";

import { RESTAURANT } from "@/lib/data/catalog";
import { toFa } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/cn";

/**
 * LOCATION / MAP
 *
 * The real, interactive Google Maps embed for the restaurant, visible
 * immediately — no placeholder, no tap-to-reveal, no custom map replacement.
 */

const EMBED_SRC = `https://maps.google.com/maps?q=${RESTAURANT.lat},${RESTAURANT.lng}&z=16&hl=fa&output=embed`;
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${RESTAURANT.lat},${RESTAURANT.lng}`;

export function LocationMap({ className }: { className?: string }) {
  const { pushToast } = useStore();

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(RESTAURANT.address);
      pushToast({ title: "آدرس کپی شد", tone: "success" });
    } catch {
      pushToast({ title: "کپی نشد", description: "آدرس را دستی انتخاب کنید.", tone: "error" });
    }
  }

  return (
    <div
      className={cn(
        "surface overflow-hidden rounded-2xl",
        className,
      )}
    >
      {/* ---------------- Map ----------------
          The real Google Maps embed, live on first paint — no click-to-load
          gate. `loading="lazy"` still defers the network fetch until the map
          scrolls near the viewport, so this costs nothing above the fold. */}
      <div className="relative aspect-[16/10] w-full sm:aspect-[16/9]">
        <iframe
          title={`نقشه موقعیت ${RESTAURANT.name}`}
          src={EMBED_SRC}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      </div>

      {/* ---------------- Details ---------------- */}
      <div className="border-t border-[var(--hairline)] p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-flame-600/12 text-flame-500">
            <Icon name="pin" className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-extrabold text-mist-100">{RESTAURANT.name}</div>
            <p className="mt-1 text-[13px] leading-6 text-mist-400">{RESTAURANT.address}</p>
            <p className="num mt-1 text-[13px] text-mist-500">{toFa(RESTAURANT.hours)}</p>
          </div>
        </div>

        {/* Actions — large, thumb-friendly targets */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href={DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-flame-600 px-3 text-[13px] font-bold text-white transition hover:bg-flame-500"
          >
            <Icon name="bike" className="size-4 shrink-0" />
            مسیریابی
          </a>
          <a
            href={RESTAURANT.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--surface-border-strong)] bg-[var(--white-a4)] px-3 text-[13px] font-bold text-mist-100 transition hover:border-flame-600/45"
          >
            <Icon name="pin" className="size-4 shrink-0" />
            گوگل مپ
          </a>
          <a
            href={`tel:${RESTAURANT.phone}`}
            className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--surface-border-strong)] bg-[var(--white-a4)] px-3 text-[13px] font-bold text-mist-100 transition hover:border-flame-600/45"
          >
            <Icon name="phone" className="size-4 shrink-0" />
            تماس
          </a>
          <button
            type="button"
            onClick={copyAddress}
            className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--surface-border-strong)] bg-[var(--white-a4)] px-3 text-[13px] font-bold text-mist-100 transition hover:border-flame-600/45"
          >
            <Icon name="edit" className="size-4 shrink-0" />
            کپی آدرس
          </button>
        </div>
      </div>
    </div>
  );
}
