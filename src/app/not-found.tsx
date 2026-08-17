import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo width={120} href={null} />
      <div className="num mt-8 text-6xl font-extrabold text-flame-500">۴۰۴</div>
      <h1 className="mt-4 text-xl font-extrabold text-mist-100">این صفحه از منو حذف شده!</h1>
      <p className="mt-2 max-w-sm text-[13px] leading-7 text-mist-400">
        آدرسی که دنبالش بودی پیدا نشد. بیا برگردیم سراغ غذاهای اکسیژن.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/menu"
          className="inline-flex h-12 items-center rounded-2xl bg-flame-600 px-6 text-[14px] font-extrabold text-white"
        >
          مشاهده منو
        </Link>
        <Link
          href="/"
          className="inline-flex h-12 items-center rounded-2xl border border-[var(--surface-border)] px-6 text-[14px] font-bold text-mist-200"
        >
          صفحه اصلی
        </Link>
      </div>
    </div>
  );
}
