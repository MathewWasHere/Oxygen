"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/Icon";
import { CountBadge } from "@/components/ui";

/**
 * `short` is a genuine shorter WORD for the narrowest phones — not an
 * ellipsis. Truncating to "سبد خ…" hides meaning; «سبد» and «سفارش» are
 * complete, readable Persian words that still name the destination.
 */
const TABS: Array<{
  href: string;
  label: string;
  short?: string;
  icon: IconName;
  match: (p: string) => boolean;
}> = [
  { href: "/", label: "خانه", icon: "home", match: (p) => p === "/" },
  { href: "/menu", label: "منو", icon: "menu", match: (p) => p.startsWith("/menu") || p.startsWith("/product") },
  { href: "/cart", label: "سبد خرید", short: "سبد", icon: "cart", match: (p) => p.startsWith("/cart") || p.startsWith("/checkout") },
  { href: "/orders", label: "سفارش‌ها", short: "سفارش", icon: "receipt", match: (p) => p.startsWith("/orders") },
  { href: "/account", label: "حساب", icon: "user", match: (p) => p.startsWith("/account") || p.startsWith("/auth") },
];

/**
 * FLOATING ISLAND BOTTOM NAV (items 13-18)
 *
 * A detached island rather than a full-bleed bar: inset from both side edges
 * and lifted off the bottom, so the page visibly continues underneath it and
 * the app reads as deliberately designed for a phone.
 *
 * - Solid background, no gradient anywhere (item 14). Depth comes from the
 *   radius, the shadow and the border.
 * - `rounded-[22px]`, not `rounded-full` — five items need a wide container,
 *   and a full pill would over-round the ends (item 15).
 * - The outer wrapper owns the safe-area inset, so on an iPhone the island
 *   lifts above the home indicator instead of sitting under it (item 16).
 * - Equal `flex-1` cells, one shared gap: no per-icon positioning (item 17).
 *
 * The wrapper is `pointer-events-none` so the transparent gutters around the
 * island never swallow taps meant for the page behind them.
 */
export function BottomNav() {
  const pathname = usePathname();
  const { cartCount, cartPulse } = useStore();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] lg:hidden"
      aria-hidden={false}
    >
      <nav
        aria-label="ناوبری اصلی"
        className="pointer-events-auto w-full max-w-md rounded-[22px] border border-[var(--surface-border)] bg-ink-900 px-1.5 py-1.5 shadow-[0_8px_28px_-6px_rgba(0,0,0,0.28)]"
      >
        <ul className="flex items-stretch gap-0.5">
          {TABS.map((tab) => {
            const active = tab.match(pathname);
            return (
              <li key={tab.href} className="min-w-0 flex-1">
                <Link
                  prefetch={false}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl px-0.5 py-1.5 text-[12.5px] font-bold transition-colors",
                    active ? "bg-flame-600/12 text-flame-600" : "text-mist-400",
                  )}
                >
                  <span className="relative flex items-center justify-center">
                    <Icon
                      name={tab.icon}
                      filled={active && tab.icon !== "cart"}
                      className="size-[21px]"
                    />
                    {tab.icon === "cart" && cartCount > 0 && (
                      <CountBadge value={cartCount} pulseKey={cartPulse} className="-top-2 -left-2.5" />
                    )}
                  </span>
                  {/* Short word under 360px, full label above it. Both are
                      real words, so nothing is ever cut mid-string. */}
                  <span className="leading-none max-[359px]:hidden">{tab.label}</span>
                  {tab.short ? (
                    <span className="hidden leading-none max-[359px]:inline">{tab.short}</span>
                  ) : (
                    <span className="hidden leading-none max-[359px]:inline">{tab.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
