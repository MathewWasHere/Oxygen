import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

/** Official Oxygen wordmark, extracted from the supplied Oxygen logo pack. */
const RATIO = 990 / 1958;

export function Logo({
  className,
  width = 116,
  withSub = true,
  href = "/",
  priority = true,
}: {
  className?: string;
  width?: number;
  withSub?: boolean;
  href?: string | null;
  priority?: boolean;
}) {
  const height = Math.round(width * RATIO);
  const content = (
    <span className={cn("inline-flex flex-col items-center leading-none", className)}>
      {withSub && (
        <span className="mb-1 text-[9px] font-bold tracking-[0.3em] text-flame-500">
          فست فود
        </span>
      )}
      <span className="relative block" style={{ width, height }}>
        <Image
          src="/brand/oxygen-logo-crimson.webp"
          alt="اکسیژن"
          width={width}
          height={height}
          priority={priority}
          className="logo-on-light absolute inset-0"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
        <Image
          src="/brand/oxygen-logo-white.webp"
          alt=""
          aria-hidden="true"
          width={width}
          height={height}
          loading="lazy"
          className="logo-on-dark absolute inset-0"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </span>
    </span>
  );

  if (href === null) return content;
  return (
    <Link href={href} aria-label="اکسیژن — صفحه اصلی" className="inline-flex min-h-11 shrink-0 items-center">
      {content}
    </Link>
  );
}

/** Compact app-icon lockup used in admin, install and avatar contexts. */
export function LogoMark({
  size = 40,
  className,
  rounded = "rounded-xl",
}: {
  size?: number;
  className?: string;
  rounded?: string;
}) {
  return (
    <span
      className={cn("relative block shrink-0 overflow-hidden", rounded, className)}
      style={{ width: size, height: size }}
    >
      <Image
        src="/brand/oxygen-icon-crimson.webp"
        alt="اکسیژن"
        width={size}
        height={size}
        className="absolute inset-0 size-full object-contain"
      />
    </span>
  );
}
