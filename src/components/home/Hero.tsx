import { ButtonLink } from "@/components/ui/Button";
import { RESTAURANT } from "@/lib/data/catalog";
import { Icon, type IconName } from "@/components/ui/Icon";

const STATS: Array<{ value: string; label: string; icon: IconName }> = [
  { value: "۱۲ دقیقه", label: "آماده‌سازی", icon: "clock" },
  { value: "۴.۸", label: "رضایت مشتری", icon: "star" },
  { value: "۳۰ دقیقه", label: "ارسال در فسا", icon: "bike" },
];

/**
 * HERO
 *
 * One Oxygen food collage at three resolutions — a phone sees the same
 * composition as desktop, just fewer pixels. The collage is assembled only
 * from the supplied restaurant menu photography.
 *
 * NO GRADIENTS anywhere. Readability over the photograph comes from a flat
 * translucent scrim and solid-filled buttons with their own contrast.
 */
export function Hero() {
  return (
    <section className="bg-ink-950 lg:px-6 lg:pt-5">
      {/* ---------- Image + overlaid CTAs ----------
          Full-bleed on phones. From `lg` the frame is width-capped and
          centred: at 1440px a full-bleed 1.82 image would stand ~790px tall
          and push the CTAs below the fold. Capping the WIDTH (rather than
          cropping the height) keeps the entire food composition intact
          while bringing the height back to a sane ~560px. */}
      <div className="relative mx-auto w-full lg:max-w-5xl lg:overflow-hidden lg:rounded-2xl">
        <picture>
          <source media="(max-width: 480px)" srcSet="/hero/hero-mobile-sm.webp" type="image/webp" />
          <source media="(max-width: 1024px)" srcSet="/hero/hero-mobile.webp" type="image/webp" />
          <source srcSet="/hero/hero-desktop.webp" type="image/webp" />
          <img
            src="/hero/hero-desktop.webp"
            alt="منتخبی از غذاهای فست فود اکسیژن در فسا"
            width={1600}
            height={878}
            fetchPriority="high"
            decoding="async"
            className="block aspect-[1399/768] w-full object-cover object-center"
          />
        </picture>

        {/* CTAs sit ON the image (mobile + desktop). Anchored to the lower edge,
            which is the darkest, least detailed part of the photograph, so the
            food remains visible. */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center px-3 pb-3 sm:pb-5">
          <div className="flex w-full max-w-sm gap-2 rounded-xl bg-black/55 p-1.5 backdrop-blur-sm sm:max-w-md sm:gap-2.5 sm:p-2">
            <ButtonLink href="/menu" size="sm" className="h-10 flex-1 text-[13px] sm:h-11">
              سفارش آنلاین
            </ButtonLink>
            <ButtonLink
              href="/menu"
              size="sm"
              variant="secondary"
              className="h-10 flex-1 border-white/25 bg-white/10 text-[13px] text-white hover:bg-white/20 sm:h-11"
            >
              مشاهده منو
            </ButtonLink>
          </div>
        </div>
      </div>

      {/* ---------- Tagline: centred, tight to the image ---------- */}
      <div className="shell pt-3 text-center sm:pt-4">
        <p className="text-[17px] font-bold text-mist-100 sm:text-xl">{RESTAURANT.tagline}</p>
      </div>

      {/* ---------- Stats: ONE compact strip, three equal cells ---------- */}
      <div className="shell pb-4 pt-3 sm:pb-5">
        <dl className="mx-auto flex max-w-md items-stretch overflow-hidden rounded-xl border border-[var(--surface-border)] bg-ink-900">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={[
                "flex flex-1 flex-col items-center justify-center gap-1 px-1 py-2",
                i > 0 ? "border-r border-[var(--hairline)]" : "",
              ].join(" ")}
            >
              <dt className="num flex items-center gap-1 whitespace-nowrap text-[13.5px] font-bold leading-none text-mist-100 sm:text-[15px]">
                <Icon
                  name={s.icon}
                  filled={s.icon === "star"}
                  className={`size-3.5 shrink-0 ${s.icon === "star" ? "text-gold-500" : "text-flame-500"}`}
                />
                {s.value}
              </dt>
              <dd className="text-[12.5px] font-light leading-none text-mist-400">
                {s.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ---------- Marquee ---------- */}
      <div className="border-y border-[var(--surface-border)] bg-ink-900 py-2">
        <div className="flex overflow-hidden">
          <div className="animate-marquee flex shrink-0 gap-8 whitespace-nowrap pr-8">
            {Array.from({ length: 2 }).flatMap((_, r) =>
              [
                "خمیر تازه روزانه",
                "گوشت گریل ذغالی",
                "ارسال ۳۰ دقیقه‌ای",
                "پرداخت امن آنلاین",
                "۱۰٪ تخفیف اولین سفارش",
                "امتیاز باشگاه مشتریان",
              ].map((t) => (
                <span
                  key={`${r}-${t}`}
                  className="flex items-center gap-2 text-[12.5px] font-medium tracking-wide text-mist-400"
                >
                  <Icon name="spark" filled className="size-3 text-flame-500" />
                  {t}
                </span>
              )),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
