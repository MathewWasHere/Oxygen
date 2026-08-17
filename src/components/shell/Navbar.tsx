"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Logo } from "@/components/brand/Logo";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import { toFa } from "@/lib/format";
import { RESTAURANT, categories } from "@/lib/data/catalog";
import { Icon, type IconName } from "@/components/ui/Icon";
import { CountBadge } from "@/components/ui";
import { ThemeToggle, ThemeSwitch } from "@/components/theme/ThemeToggle";
import { OpenStatus, useIsOpen } from "@/components/shell/OpenStatus";
import { INSTALL_REQUEST_EVENT } from "@/components/shell/InstallPrompt";

const LINKS = [
  { href: "/", label: "خانه" },
  { href: "/menu", label: "منو" },
  { href: "/orders", label: "سفارش‌ها" },
  { href: "/about", label: "درباره اکسیژن" },
];

/** Icon per primary destination — a bare text list reads as a dead end. */
const LINK_ICON: Record<string, IconName> = {
  "/": "home",
  "/menu": "menu",
  "/orders": "receipt",
  "/about": "flame",
};

export function Navbar() {
  const pathname = usePathname();
  const { cartCount, cartPulse, state } = useStore();
  const isOpen = useIsOpen();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The drawer is closed by the links themselves (onClick below) rather than by
  // an effect watching the pathname, which would cause a cascading render.

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 backdrop-blur-xl transition-all duration-300",
        // The bar always carries its own themed surface. It previously forced a
        // dark palette while unscrolled, which broke contrast in light mode
        // whenever the first section below it was light (e.g. the live-order
        // banner). A translucent themed scrim is correct over both.
        scrolled
          ? "border-b border-[var(--surface-border)] bg-[var(--scrim)] shadow-[0_2px_16px_-8px_rgba(0,0,0,0.25)]"
          : "border-b border-transparent bg-[var(--scrim)]/85",
      )}
    >
      {/*
        HEADER COMPOSITION — physically fixed, not RTL-flipped.

        [ logo ] ————— [ status ] ————— [ theme | cart | menu ]
          LEFT           CENTRE                  RIGHT EDGE

        `dir="ltr"` on the bar pins the three zones to those physical sides;
        each cell restores `dir="rtl"` so Persian text inside lays out correctly.

        Equal `1fr` outer tracks keep the status optically centred, and each
        cluster is pinned to its own physical edge by `justify-start` /
        `justify-end` — so the actions sit flush right rather than floating.
        The tracks also RESERVE space, which absolute centring does not: on a
        320px phone the status would otherwise sit underneath the buttons.
      */}
      <div
        dir="ltr"
        className="shell grid h-13 grid-cols-[1fr_auto_1fr] items-center gap-1.5 sm:h-16 sm:gap-2"
      >
        {/* LEFT — brand */}
        <div className="flex min-w-0 items-center justify-start">
          <Logo width={58} withSub={false} />
        </div>

        {/* CENTRE — store status */}
        <div dir="rtl" className="flex min-w-0 items-center justify-center">
          <OpenStatus />
        </div>

        {/* RIGHT — action cluster, flush to the right edge.
            Physical order left->right: nav, theme, cart, hamburger.
            One consistent gap binds them into a single control group. */}
        <div dir="ltr" className="flex min-w-0 items-center justify-end gap-1.5 sm:gap-2">

          <nav dir="rtl" className="hidden items-center gap-0.5 lg:flex">
            {LINKS.map((l) => {
              const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  prefetch={false}
                  className={cn(
                    "relative flex min-h-11 items-center rounded-lg px-3 text-[13.5px] font-medium transition-colors",
                    active ? "text-mist-100" : "text-mist-400 hover:text-mist-100",
                  )}
                >
                  {l.label}
                  {active && (
                    <span className="absolute inset-x-3 bottom-0.5 h-0.5 rounded-full bg-flame-600" />
                  )}
                </Link>
              );
            })}
          </nav>

          <ThemeToggle />

          <Link
            href="/cart"
            prefetch={false}
            aria-label={`سبد خرید، ${cartCount} کالا`}
            className="tap-44 relative grid size-10 place-items-center rounded-lg border border-[var(--surface-border)] bg-[var(--white-a4)] text-mist-200 transition-colors hover:border-flame-600/40 hover:text-mist-100"
          >
            <Icon name="cart" className="size-[18px]" />
            {cartCount > 0 && <CountBadge value={cartCount} pulseKey={cartPulse} />}
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="منوی اصلی"
            aria-expanded={menuOpen}
            className="tap-44 grid size-10 place-items-center rounded-lg border border-[var(--surface-border)] bg-[var(--white-a4)] text-mist-200 transition-colors hover:border-flame-600/40 hover:text-mist-100"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              className="size-[18px]"
              aria-hidden="true"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* ---------------- Mobile drawer ----------------
          Rendered through a portal onto <body>. The header sets
          `backdrop-blur`, and a backdrop-filter establishes a containing block
          for fixed-position descendants — so a drawer nested inside the header
          would be clipped to the 56px bar instead of filling the viewport. */}
      {menuOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label="بستن منو"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
          />
          <div className="absolute inset-y-0 right-0 flex w-[86%] max-w-[340px] flex-col bg-ink-900 shadow-2xl animate-slide-in-right">
            <div className="flex h-14 items-center justify-between border-b border-[var(--hairline)] px-4">
              <Logo width={86} withSub={false} priority={false} />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="بستن منو"
                className="grid size-11 place-items-center rounded-xl text-mist-400 hover:text-mist-100"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  className="size-5"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-1">
                {LINKS.map((l) => {
                  const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-[15px] font-bold transition-colors",
                        active
                          ? "bg-flame-600/12 text-flame-500"
                          : "text-mist-200 hover:bg-[var(--white-a6)]",
                      )}
                    >
                      <Icon name={LINK_ICON[l.href] ?? "chevron"} className="size-[18px] shrink-0" />
                      {l.label}
                      {active && <span className="mr-auto size-1.5 rounded-full bg-flame-500" />}
                    </Link>
                  );
                })}
                <Link
                  href="/cart"
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-[15px] font-bold text-mist-200 transition-colors hover:bg-[var(--white-a6)]"
                >
                  <Icon name="cart" className="size-[18px] shrink-0" />
                  سبد خرید
                  {cartCount > 0 && (
                    <span className="mr-auto">
                      <CountBadge value={cartCount} />
                    </span>
                  )}
                </Link>
                <Link
                  href={state.user ? "/account" : "/auth"}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-[15px] font-bold text-mist-200 transition-colors hover:bg-[var(--white-a6)]"
                >
                  <Icon name="user" className="size-[18px] shrink-0" />
                  {state.user ? "حساب کاربری" : "ورود / ثبت‌نام"}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    window.setTimeout(
                      () => window.dispatchEvent(new Event(INSTALL_REQUEST_EVENT)),
                      0,
                    );
                  }}
                  className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-flame-600/30 bg-flame-600/8 px-3.5 text-right text-[15px] font-bold text-flame-500 transition-colors hover:bg-flame-600/12"
                >
                  <Icon name="download" className="size-[18px] shrink-0" />
                  نصب برنامه اکسیژن
                </button>
              </div>

              {/* Category shortcuts — the drawer should be a real way INTO the
                  menu, not just a list of pages. Two columns keeps all five
                  visible without scrolling. */}
              <div className="mt-5 border-t border-[var(--hairline)] pt-5">
                <div className="mb-2.5 text-[12px] font-bold text-mist-500">دسته‌بندی‌ها</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/menu?c=${c.slug}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex min-h-11 items-center gap-2 rounded-xl border border-[var(--surface-border)] bg-[var(--white-a4)] px-2.5 text-[13px] font-bold text-mist-200 transition-colors hover:border-flame-600/40 hover:text-mist-100"
                    >
                      <Image
                        src={c.image}
                        alt=""
                        width={24}
                        height={24}
                        className="size-6 shrink-0 rounded-md object-cover"
                      />
                      <span className="truncate">{c.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t border-[var(--hairline)] pt-5">
                <div className="mb-2.5 text-[12px] font-bold text-mist-500">حالت نمایش</div>
                <ThemeSwitch />
              </div>

              <div className="mt-5 space-y-2 border-t border-[var(--hairline)] pt-5">
                {/* Live open/closed + today's hours — the two questions a hungry
                    customer actually has before they tap "call". */}
                <div className="flex items-center justify-between gap-2 rounded-xl border border-[var(--surface-border)] bg-[var(--white-a4)] px-3 py-2.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-[13px] font-bold",
                      isOpen ? "text-emerald-600" : "text-mist-400",
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        isOpen
                          ? "animate-pulse-dot bg-emerald-500 text-emerald-500/45"
                          : "bg-mist-500",
                      )}
                    />
                    {isOpen ? "باز است" : "بسته است"}
                  </span>
                  <span className="num text-[12.5px] text-mist-500">
                    {RESTAURANT.hours}
                  </span>
                </div>

                <a
                  href={`tel:${RESTAURANT.phone}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-12 items-center gap-2.5 rounded-xl border border-flame-600/25 bg-flame-600/8 px-3.5 text-[14px] font-bold text-flame-500"
                >
                  <Icon name="phone" className="size-4 shrink-0" />
                  <span className="num" dir="ltr">
                    {toFa(RESTAURANT.phoneDisplay)}
                  </span>
                </a>

                <p className="flex items-start gap-2 px-1 text-[12.5px] leading-6 text-mist-500">
                  <Icon name="pin" className="mt-1 size-3.5 shrink-0 text-flame-600" />
                  {RESTAURANT.address}
                </p>
              </div>
            </nav>

            <div className="border-t border-[var(--hairline)] p-4">
              <Link
                href="/menu"
                onClick={() => setMenuOpen(false)}
                className="flex h-13 items-center justify-center rounded-xl bg-flame-600 text-[15px] font-bold text-white"
              >
                سفارش آنلاین
              </Link>
            </div>
          </div>
          </div>,
          document.body,
        )}
    </header>
  );
}
