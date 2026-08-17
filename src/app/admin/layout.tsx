"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useCurrentAdmin, usePermission, useRoleSession } from "@/lib/use-roles";
import { RoleGate } from "@/components/admin/RoleGate";
import { RoleSessionMenu } from "@/components/admin/RoleSessionMenu";
import type { Permission } from "@/lib/roles";
import { Logo } from "@/components/brand/Logo";
import { useStore } from "@/lib/store";
import { toFa } from "@/lib/format";

/** Each entry declares the permission required to see it (item 18/22). */
const NAV: Array<{
  href: string;
  label: string;
  icon: IconName;
  badge?: boolean;
  permission: Permission;
}> = [
  { href: "/admin", label: "داشبورد", icon: "chart", permission: "dashboard.view" },
  { href: "/admin/orders", label: "سفارش‌های زنده", icon: "receipt", badge: true, permission: "orders.view" },
  { href: "/admin/driver", label: "پیک من", icon: "bike", permission: "driver.view" },
  { href: "/admin/products", label: "محصولات", icon: "box", permission: "products.view" },
  { href: "/admin/categories", label: "دسته‌بندی‌ها", icon: "grid", permission: "categories.edit" },
  { href: "/admin/customers", label: "مشتریان", icon: "user", permission: "customers.view" },
  { href: "/admin/discounts", label: "تخفیف‌ها", icon: "tag", permission: "discounts.edit" },
  { href: "/admin/delivery", label: "مناطق ارسال", icon: "bike", permission: "delivery.edit" },
  { href: "/admin/settings", label: "تنظیمات", icon: "settings", permission: "settings.view" },
];

/**
 * Outer shell: decides between the role-selection gate and the panel.
 *
 * Kept separate so `AdminPanel` can call hooks unconditionally — returning
 * <RoleGate /> early from inside the panel would put a `useEffect` behind a
 * conditional return and break the rules of hooks.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { member } = useRoleSession();
  if (!member) return <RoleGate />;
  return <AdminPanel>{children}</AdminPanel>;
}

function AdminPanel({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const newOrders = state.orders.filter((o) => o.status === "PENDING").length;
  const currentUser = useCurrentAdmin();
  const { signOut } = useRoleSession();
  const allow = usePermission();
  // Never render a link the current role cannot open (no dead nav items).
  const nav = NAV.filter((item) => allow(item.permission));

  /*
   * ROUTE-LEVEL PERMISSION GUARD.
   *
   * Filtering the sidebar was not enough: a KITCHEN user landing on /admin
   * still rendered the full revenue dashboard, because the page itself was
   * never gated. Now the route's own permission is checked, and a role that
   * cannot view it is offered its real home instead of a dead end.
   */
  const current = NAV.find((item) =>
    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href),
  );
  const home = nav[0]?.href ?? "/";

  /*
   * /admin is the shared entry URL, but KITCHEN and DRIVER cannot view the
   * dashboard. Rather than greeting them with a permission error on login,
   * send them straight to their own landing page; the error screen is then
   * reserved for genuine attempts to reach a forbidden section.
   */
  const redirectHome = pathname === "/admin" && !allow("dashboard.view") && home !== "/admin";
  const denied = !redirectHome && current ? !allow(current.permission) : false;

  // Navigate rather than render a forbidden page (effect: navigation is a
  // side effect, and this keeps render pure for the React Compiler).
  useEffect(() => {
    if (redirectHome) router.replace(home);
  }, [redirectHome, home, router]);

  return (
    <div className="min-h-screen bg-ink-950 lg:grid lg:grid-cols-[248px_1fr]">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-60 w-64 border-l border-[var(--surface-border)] bg-ink-900 transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-13 items-center gap-2.5 border-b border-[var(--surface-border)] px-4 lg:h-14">
          <Logo width={58} withSub={false} href={nav[0]?.href ?? "/admin"} />
          <span className="rounded bg-flame-600/12 px-1.5 py-0.5 text-[10.5px] font-extrabold text-flame-600">
            ADMIN
          </span>
        </div>

        <nav className="space-y-0.5 p-2.5">
          {nav.map((item) => {
            const active =
              item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] font-bold transition-colors",
                  active
                    ? "bg-flame-600/10 text-flame-600"
                    : "text-mist-400 hover:bg-[var(--white-a4)] hover:text-mist-100",
                )}
              >
                <Icon name={item.icon} className="size-4" />
                <span className="flex-1">{item.label}</span>
                {item.badge && newOrders > 0 && (
                  <span className="num grid size-[18px] place-items-center rounded-full bg-flame-600 text-[10.5px] font-extrabold leading-none tabular-nums text-white">
                    <span className="block translate-y-[0.5px] leading-none">{toFa(newOrders)}</span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Two distinct exits: leave the ROLE (back to selection) or leave the
            admin area entirely. Previously only the latter existed, which is
            why a kitchen user could never reach another role. */}
        <div className="absolute inset-x-3 bottom-3 space-y-1.5">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="flex w-full items-center gap-2.5 rounded-xl border border-red-600/25 bg-red-600/10 px-3.5 py-2.5 text-[12px] font-extrabold text-red-600 transition-colors hover:bg-red-600/15"
          >
            <Icon name="logout" className="size-4 shrink-0" />
            خروج از این سمت
          </button>
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-xl border border-[var(--surface-border)] px-3.5 py-2.5 text-[12px] font-bold text-mist-400 transition-colors hover:text-mist-100"
          >
            <Icon name="home" className="size-4 shrink-0" />
            بازگشت به سایت
          </Link>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-55 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-50 flex h-13 items-center gap-2.5 border-b border-[var(--surface-border)] bg-[var(--scrim)] px-3 backdrop-blur-xl lg:h-14 lg:px-6">
          <button
            onClick={() => setOpen(true)}
            aria-label="منو"
            className="grid size-9 place-items-center rounded-lg border border-[var(--surface-border)] text-mist-300 lg:hidden"
          >
            <Icon name="menu" className="size-[18px]" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-extrabold leading-tight text-mist-100">
              پنل مدیریت اکسیژن
            </div>
            <div className="truncate text-[11px] leading-tight text-mist-500">
              فست فود اکسیژن — فسا
            </div>
          </div>

          <span className="hidden items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/8 px-2.5 py-1.5 text-[11px] font-bold text-emerald-600 md:flex">
            <span className="size-1.5 animate-pulse-dot rounded-full bg-emerald-500 text-emerald-500/45" />
            باز است
          </span>

          {/* Same theme system as the customer app. */}
          <ThemeToggle className="size-9" />

          {/* Current role + exit/switch — one shared control for every role. */}
          <RoleSessionMenu
            name={currentUser.name}
            roleLabel={currentUser.roleLabel}
            phone={currentUser.phone}
          />
        </header>

        {denied ? (
          <main className="mx-auto w-full max-w-lg px-4 py-10 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-flame-600/12 text-flame-600">
              <Icon name="shield" className="size-5" />
            </span>
            <h1 className="mt-3 text-[17px] font-extrabold text-mist-100">
              دسترسی به این بخش ندارید
            </h1>
            <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-6 text-mist-500">
              سمت «{currentUser.roleLabel}» به این صفحه دسترسی ندارد. می‌توانید به
              بخش خودتان بروید یا از این سمت خارج شوید.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Link
                href={home}
                className="inline-flex min-h-11 items-center rounded-xl bg-flame-600 px-4 text-[13px] font-extrabold text-white transition-colors hover:bg-flame-700"
              >
                رفتن به بخش من
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-red-600/25 bg-red-600/10 px-4 text-[13px] font-extrabold text-red-600 transition-colors hover:bg-red-600/15"
              >
                <Icon name="logout" className="size-4 shrink-0" />
                خروج از این سمت
              </button>
            </div>
          </main>
        ) : (
        <main className="p-3 sm:p-4 lg:p-6">{children}</main>
        )}
      </div>
    </div>
  );
}
