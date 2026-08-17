"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-flame-600 text-white font-bold hover:brightness-110 active:brightness-95",
  secondary: "bg-ink-600 text-mist-100 hover:bg-ink-500 border border-[var(--surface-border)]",
  ghost: "text-mist-200 hover:text-mist-100 hover:bg-[var(--white-a6)]",
  outline: "border border-flame-600/50 text-flame-600 hover:bg-flame-600/10",
  danger: "bg-red-500/15 text-red-600 border border-red-500/30 hover:bg-red-500/25",
};

const SIZES: Record<Size, string> = {
  sm: "h-11 px-3.5 text-[13px] rounded-xl gap-1.5",
  md: "h-12 px-5 text-[14px] rounded-2xl gap-2",
  lg: "h-14 px-5 text-[15px] rounded-2xl gap-2.5 sm:px-7",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/*
 * `min-w-0` lets a button shrink when it is a flex child — without it,
 * `whitespace-nowrap` made the intrinsic width a hard floor and long Persian
 * labels pushed the button out of its container (the add-to-cart sheet CTA
 * overflowed the viewport). The label itself truncates instead.
 */
const base =
  "inline-flex min-w-0 items-center justify-center font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-45 disabled:pointer-events-none select-none";

export const Button = forwardRef<
  HTMLButtonElement,
  BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>(function Button({ variant = "primary", size = "md", block, loading, className, children, ...rest }, ref) {
  return (
    <button
      ref={ref}
      className={cn(base, VARIANTS[variant], SIZES[size], block && "w-full", className)}
      {...rest}
    >
      {loading && (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
});

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  block,
  className,
  children,
  ...rest
}: BaseProps & { href: string } & Omit<React.ComponentProps<typeof Link>, "href">) {
  return (
    <Link
      href={href}
      className={cn(base, VARIANTS[variant], SIZES[size], block && "w-full", className)}
      {...rest}
    >
      {children}
    </Link>
  );
}
