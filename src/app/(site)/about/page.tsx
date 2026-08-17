import type { Metadata } from "next";
import Image from "next/image";
import { RESTAURANT } from "@/lib/data/catalog";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHead } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { toFa } from "@/lib/format";

export const metadata: Metadata = {
  title: "درباره اکسیژن",
  description:
    "فست فود اکسیژن در فسا؛ داستان ما، ساعات کاری، آدرس و شماره تماس. سفارش مستقیم بدون واسطه.",
};

export default function AboutPage() {
  return (
    <div className="lg:pb-10">
      <section className="relative">
        <div className="absolute inset-0">
          <Image
            src="/brand/oxygen-social-crimson.png"
            alt="لوگوی رسمی فست فود اکسیژن"
            fill
            sizes="100vw"
            className="object-cover object-center opacity-35"
          />
          <div className="absolute inset-0 bg-ink-950/75" />
        </div>
        <div className="shell relative py-20 text-center">
          <span className="text-[13px] font-bold tracking-[0.3em] text-flame-500">OXYGEN — FASA</span>
          <h1 className="mt-4 text-4xl font-extrabold text-mist-100 sm:text-5xl">داستان اکسیژن</h1>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-9 text-mist-300">
            اکسیژن از یک ایده ساده شروع شد: فست فودی در فسا که غذایش واقعاً تازه باشد و مشتری برای
            سفارش دادن مجبور نباشد از چند واسطه رد شود. هویت قرمز و طلایی برندمان را با همان انرژی و حال‌وهوای منوی اکسیژن به این وب‌اپلیکیشن آورده‌ایم.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <ButtonLink href="/menu" size="lg">
              مشاهده منو
            </ButtonLink>
            <ButtonLink href={`tel:${RESTAURANT.phone}`} size="lg" variant="outline">
              تماس با ما
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="shell py-14">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: "flame" as const, title: "گریل ذغالی", text: "برگرهای اکسیژن روی شعله مستقیم پخته می‌شوند، نه روی تابه." },
            { icon: "spark" as const, title: "خمیر روزانه", text: "خمیر پیتزا هر روز صبح تازه ورز داده و استراحت داده می‌شود." },
            { icon: "bike" as const, title: "پیک خودمان", text: "غذا را خودمان می‌رسانیم تا گرم و سالم به دستت برسد." },
          ].map((c) => (
            <div key={c.title} className="surface rounded-2xl p-6">
              <span className="grid size-12 place-items-center rounded-2xl bg-flame-600/12 text-flame-500">
                <Icon name={c.icon} className="size-6" />
              </span>
              <h3 className="mt-4 text-[16px] font-extrabold text-mist-100">{c.title}</h3>
              <p className="mt-2 text-[13px] leading-7 text-mist-400">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="shell py-8">
        <SectionHead title="کجا پیدامان کنی" />
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="surface space-y-6 rounded-2xl p-7">
            <Info icon="pin" title="آدرس" value={RESTAURANT.address} />
            <Info icon="clock" title="ساعات کاری" value={toFa(RESTAURANT.hours)} />
            <Info icon="phone" title="شماره تماس" value={toFa(RESTAURANT.phoneDisplay)} ltr />
            <ButtonLink
              href={`https://www.google.com/maps/search/?api=1&query=${RESTAURANT.lat},${RESTAURANT.lng}`}
              target="_blank"
              variant="secondary"
              block
            >
              مسیریابی در گوگل مپ
            </ButtonLink>
          </div>

          <div className="relative min-h-72 overflow-hidden rounded-2xl border border-[var(--surface-border)]">
            <Image
              src="/hero/hero-desktop.webp"
              alt="منتخبی از غذاهای فست فود اکسیژن"
              fill
              sizes="(max-width:1024px) 100vw, 600px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <div className="num text-[13px] text-mist-300">
                {toFa(RESTAURANT.lat.toFixed(4))}, {toFa(RESTAURANT.lng.toFixed(4))}
              </div>
              <div className="mt-1 text-[15px] font-extrabold text-mist-100">فست فود اکسیژن، فسا</div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell py-14">
        <div className="rounded-2xl border border-flame-600/25 bg-ink-900 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-extrabold text-mist-100 sm:text-3xl">
            سفارش بعدی‌ات را مستقیم از اکسیژن ثبت کن
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[14px] leading-7 text-mist-300">
            بدون واسطه، بدون کارمزد اضافی — با امتیاز باشگاه مشتریان و تخفیف اختصاصی.
          </p>
          <ButtonLink href="/menu" size="lg" className="mt-7">
            شروع سفارش
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}

function Info({
  icon,
  title,
  value,
  ltr,
}: {
  icon: "pin" | "clock" | "phone";
  title: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-flame-600/12 text-flame-500">
        <Icon name={icon} className="size-5" />
      </span>
      <div>
        <div className="text-[13px] font-extrabold text-mist-100">{title}</div>
        <div dir={ltr ? "ltr" : "rtl"} className="num mt-1 text-[13px] leading-7 text-mist-300">
          {value}
        </div>
      </div>
    </div>
  );
}
