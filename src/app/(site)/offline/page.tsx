import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";
import { RESTAURANT } from "@/lib/data/catalog";
import { toFa } from "@/lib/format";

export const metadata = { title: "اتصال اینترنت قطع است" };

export default function OfflinePage() {
  return (
    <div className="shell flex min-h-[80vh] flex-col items-center justify-center text-center">
      <Logo width={130} href={null} />
      <h1 className="mt-8 text-2xl font-extrabold text-mist-100">اتصال اینترنت برقرار نیست</h1>
      <p className="mt-3 max-w-sm text-[14px] leading-7 text-mist-400">
        وقتی دوباره آنلاین شدی، منو و سبد خریدت همان‌جا که بودند برمی‌گردند.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/menu" size="lg">
          تلاش دوباره
        </ButtonLink>
        <ButtonLink href={`tel:${RESTAURANT.phone}`} size="lg" variant="outline">
          سفارش تلفنی {toFa(RESTAURANT.phoneDisplay)}
        </ButtonLink>
      </div>
    </div>
  );
}
