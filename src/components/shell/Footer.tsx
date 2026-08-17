import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { RESTAURANT } from "@/lib/data/catalog";
import { toFa } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";

/**
 * FOOTER
 *
 * The «اکسیژن» / «دسته‌بندی‌ها» / «حساب کاربری» link columns were removed: on
 * phones they tripled the footer height while duplicating the bottom nav, and
 * on desktop the same destinations already live in the header. What remains is
 * what a footer is actually for — who we are, where we are, how to reach us.
 *
 * Mobile gets a genuinely short footer (brand row, contact rows, legal line),
 * not the desktop footer with parts hidden.
 */
/**
 * Small beating heart used in the footer credit.
 * The pulse is subtle (scale 1 -> 1.18) and fully disabled under
 * `prefers-reduced-motion`, which is handled in globals.css.
 */
function Heartbeat() {
  return (
    <span className="inline-flex" aria-label="love" role="img">
      <svg
        viewBox="0 0 24 24"
        className="animate-heartbeat size-3.5 text-[#e01100]"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 20.7s-7.6-4.9-9.5-9.2C1.1 8.2 3 4.9 6.2 4.3c2-.4 3.9.5 4.9 2.2l.9 1.5.9-1.5c1-1.7 2.9-2.6 4.9-2.2 3.2.6 5.1 3.9 3.7 7.2-1.9 4.3-9.5 9.2-9.5 9.2Z" />
      </svg>
    </span>
  );
}

export function Footer() {
  return (
    <footer className="pb-nav mt-8 border-t border-[var(--surface-border)] bg-ink-900 sm:mt-16 lg:pb-10">
      <div className="shell py-5 sm:py-8 lg:py-11">
        {/* ---------- Brand + socials ---------- */}
        <div className="flex items-center justify-between gap-4">
          <Logo width={78} href={null} withSub={false} priority={false} />

          <div className="flex items-center gap-1.5">
            {[
              { href: RESTAURANT.instagram, icon: "instagram" as const, label: "اینستاگرام اکسیژن" },
              { href: RESTAURANT.telegram, icon: "telegram" as const, label: "تلگرام اکسیژن" },
              { href: `tel:${RESTAURANT.phone}`, icon: "phone" as const, label: "تماس با اکسیژن" },
            ].map((s) => (
              <a
                key={s.icon}
                href={s.href}
                aria-label={s.label}
                className="tap-44 group relative grid size-10 place-items-center rounded-xl border border-[var(--surface-border)] bg-[var(--white-a4)] text-mist-400 transition-all duration-200 hover:-translate-y-0.5 hover:border-flame-600/45 hover:bg-flame-600/8 hover:text-flame-600 active:translate-y-0"
              >
                <Icon name={s.icon} className="size-[18px]" />
              </a>
            ))}
          </div>
        </div>

        {/* Longer blurb only where there is vertical room to spare. */}
        <p className="mt-4 hidden max-w-md text-[13px] leading-7 text-mist-400 sm:block">
          فست فود اکسیژن در فسا؛ برگر دست‌ساز، پیتزای خمیر تازه و سوخاری کریسپی. سفارش مستقیم بده،
          ارزان‌تر بخر و امتیاز جمع کن.
        </p>

        {/* ---------- Contact essentials ---------- */}
        <div className="mt-5 grid gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4">
          <div className="flex items-start gap-2.5">
            <Icon name="pin" className="mt-0.5 size-4 shrink-0 text-flame-500" />
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-mist-100">آدرس</div>
              <div className="mt-0.5 text-[13px] leading-6 text-mist-400">
                {RESTAURANT.address}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Icon name="clock" className="mt-0.5 size-4 shrink-0 text-flame-500" />
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-mist-100">ساعات کاری</div>
              <div className="num mt-0.5 text-[13px] leading-6 text-mist-400">
                {toFa(RESTAURANT.hours)}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Icon name="phone" className="mt-0.5 size-4 shrink-0 text-flame-500" />
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-mist-100">تماس</div>
              <a
                href={`tel:${RESTAURANT.phone}`}
                dir="ltr"
                className="num -my-1.5 inline-flex min-h-11 items-center text-[13px] font-bold text-flame-500"
              >
                {toFa(RESTAURANT.phoneDisplay)}
              </a>
            </div>
          </div>
        </div>

        {/* ---------- Legal ---------- */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-[var(--hairline)] pt-4 text-[12.5px] text-mist-500 sm:mt-7 sm:pt-5">
          {/* LEFT — credit. dir=ltr so the English reads correctly inside RTL. */}
          <span dir="ltr" className="order-2 flex items-center gap-1.5 sm:order-1">
            Made with
            <Heartbeat />
            by
            <a
              href="https://t.me/mathewrepresents"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center font-bold text-mist-200 underline-offset-4 transition-colors hover:text-flame-600 hover:underline"
            >
              Mathew
            </a>
          </span>

          <Link
            href="/admin"
            className="order-3 -my-2 inline-flex min-h-11 items-center transition-colors hover:text-flame-600"
          >
            ورود مدیریت
          </Link>

          {/* RIGHT — copyright */}
          <span className="num order-1 sm:order-2">{toFa(2026)} فست فود اکسیژن</span>
        </div>
      </div>
    </footer>
  );
}
