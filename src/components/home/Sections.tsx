import Image from "next/image";
import Link from "next/link";
import { categories, popularProducts } from "@/lib/data/catalog";
import { SectionHead } from "@/components/ui";
import { ProductCard } from "@/components/product/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { toFa } from "@/lib/format";
import { LocationMap } from "@/components/home/LocationMap";
import { StepCircle } from "@/components/order/OrderTimeline";

/* ----------------------------- Categories ------------------------------ */

export function CategoryStrip() {
  return (
    <section className="shell py-6 sm:py-9 lg:py-12">
      <SectionHead
        title="دنبال چی می‌گردی؟"
        action={
          <Link href="/menu" className="-m-2 inline-flex min-h-11 items-center p-2 text-[13px] font-bold text-flame-600 hover:text-flame-500">
            همه دسته‌ها ←
          </Link>
        }
      />
      {/* Phones: a free-scrolling belt — no snapping, hidden scrollbar, never
          wraps. Tablet and up: a normal grid. */}
      <div className="belt-mask -mx-3.5 sm:mx-0">
        <div className="belt gap-2.5 px-3.5 pb-1 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 lg:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/menu?c=${c.slug}`}
              prefetch={false}
              className="group relative w-[88px] overflow-hidden rounded-2xl border border-[var(--surface-border)] bg-ink-850 transition-all hover:border-flame-600/45 sm:w-auto sm:rounded-2xl"
            >
              <div className="relative aspect-square sm:aspect-square">
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="(max-width: 640px) 88px, 220px"
                  className="object-cover transition-all duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/45" />
              </div>
              <span className="absolute inset-x-0 bottom-0 p-2 text-center text-[12.5px] font-extrabold text-white sm:p-2.5 sm:text-[13.5px]">
                {c.name}
              </span>
            </Link>
          ))}
          {/* Trailing spacer so the last chip clears the edge fade. */}
          <span aria-hidden="true" className="w-1 sm:hidden" />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Popular -------------------------------- */

export function PopularProducts() {
  const items = popularProducts();
  return (
    <section className="shell py-5 sm:py-7">
      <SectionHead
        title="انتخاب مشتری‌های اکسیژن"
        action={
          <Link href="/menu" className="-m-2 hidden min-h-11 items-center p-2 text-[13px] font-bold text-flame-600 hover:text-flame-500 sm:inline-flex">
            مشاهده منو ←
          </Link>
        }
      />
      {/* Exactly three hero products — a curated shortlist, not a dump.
          The 3-up grid keeps each card generous instead of leaving a gap. */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-4">
        {/* This grid sits below the fold on every viewport, so nothing here is
            eager/priority — the hero owns the critical path. */}
        {items.slice(0, 3).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

/* ----------------------------- Promo banner ---------------------------- */

export function PromoBanner() {
  return (
    <section className="shell py-6 sm:py-10">
      {/* Compact by design: a single horizontal band on desktop, a tight card on
          phones. One action only — the «درباره اکسیژن» button was removed and the
          remaining space reclaimed rather than left empty. */}
      <div className="relative overflow-hidden rounded-2xl border border-flame-600/25 bg-ink-900 p-3.5 sm:p-4">        <div className="absolute inset-y-0 left-0 hidden w-1/3 lg:block">
          <Image
            src="/food/pizza-oxygen-23.webp"
            alt=""
            aria-hidden="true"
            fill
            sizes="33vw"
            className="object-cover opacity-30"
          />
        </div>

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-2.5 py-1 text-[12.5px] font-bold text-black">
              <Icon name="gift" className="size-3.5" />
              کد تخفیف: OXYGEN10
            </span>
            <h2 className="mt-2.5 text-[22px] font-extrabold leading-tight text-mist-100 sm:text-[26px]">
              اولین سفارش مستقیم
              <span className="mr-2 text-flame-500">۱۰٪ تخفیف</span>
            </h2>
            <p className="mt-1.5 max-w-md text-[13px] leading-6 text-mist-400">
              مستقیم از اکسیژن سفارش بده — بدون واسطه، ارزان‌تر و گرم‌تر.
            </p>
          </div>

          <ButtonLink href="/menu" size="lg" className="h-13 shrink-0 sm:min-w-40">
            سفارش آنلاین
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Tracking preview -------------------------- */

const TRACK_STEPS: Array<{ label: string; state: "done" | "active" | "todo" }> = [
  { label: "سفارش ثبت شد", state: "done" },
  { label: "سفارش تأیید شد", state: "done" },
  { label: "در حال آماده‌سازی", state: "active" },
  { label: "آماده تحویل", state: "todo" },
  { label: "در مسیر", state: "todo" },
  { label: "تحویل شد", state: "todo" },
];

export function TrackingPreview() {
  return (
    <section className="shell py-6 sm:py-9 lg:py-12">
      <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
        <div>
          <SectionHead title="سفارشت را زنده دنبال کن" />
          <p className="-mt-2 max-w-md text-[13.5px] leading-7 text-mist-400">
            از لحظه ثبت سفارش تا رسیدن پیک، هر مرحله را روی گوشی‌ات می‌بینی. وقتی آشپزخانه وضعیت را
            عوض می‌کند، صفحه‌ات بدون رفرش به‌روز می‌شود.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/orders" variant="secondary">
              پیگیری سفارش من
            </ButtonLink>
            <ButtonLink href="/menu">شروع سفارش</ButtonLink>
          </div>
        </div>

        {/* Static illustration of the live tracker */}
        <div className="surface rounded-2xl pad-panel">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[12.5px] text-mist-500">شماره سفارش</div>
              <div className="num text-xl font-extrabold text-mist-100">#{toFa(1248)}</div>
            </div>
            <div className="text-left">
              <div className="num text-xl font-extrabold leading-none text-flame-500">
                {toFa(30)}
              </div>
              <div className="mt-1 text-[12.5px] text-mist-500">دقیقه تا تحویل</div>
            </div>
          </div>

          <ol className="mt-5">
            {TRACK_STEPS.map((st, i) => (
              <li key={st.label} className="relative flex gap-3.5 pb-5 last:pb-0">
                {i < TRACK_STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={`absolute right-[11px] top-7 h-[calc(100%-1.75rem)] w-0.5 rounded-full ${
                      st.state === "done" ? "bg-emerald-500/45" : "bg-[var(--white-a10)]"
                    }`}
                  />
                )}
                <StepCircle state={st.state} />
                <span
                  className={`pt-[5px] text-[13.5px] font-bold ${
                    st.state === "todo"
                      ? "text-mist-500"
                      : st.state === "active"
                        ? "text-flame-500"
                        : "text-mist-100"
                  }`}
                >
                  {st.label}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function VisitUs() {
  return (
    <section className="shell py-6 sm:py-9 lg:py-12">
      <SectionHead title="حضوری هم بیا اکسیژن" />
      <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
        <div className="relative min-h-56 overflow-hidden rounded-2xl border border-[var(--surface-border)]">
          <Image
            src="/hero/hero-desktop.webp"
            alt="منتخبی از غذاهای فست فود اکسیژن"
            fill
            sizes="(max-width:1024px) 100vw, 700px"
            className="object-cover"
          />
          {/* Flat scrim confined to the caption band — the photo stays bright
              and legible, the text gets the contrast it needs. No gradient. */}
          <div className="absolute inset-x-0 bottom-0 bg-black/65 p-3.5 sm:p-4">
            <p className="max-w-sm text-[13px] font-medium leading-6 text-white">
              منتخبی از غذاهای محبوب اکسیژن؛ آنلاین سفارش بده یا برای تحویل حضوری به شعبه فسا بیا.
            </p>
          </div>
        </div>

        {/* Real, interactive Google Map + directions — never a raw URL. */}
        <LocationMap />
      </div>
    </section>
  );
}
