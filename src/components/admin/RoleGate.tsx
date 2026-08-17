"use client";

import { Icon, type IconName } from "@/components/ui/Icon";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { toFa } from "@/lib/format";
import { useRoleSession } from "@/lib/use-roles";
import { useStaff } from "@/lib/use-roles";
import { ROLE_MAP, type Role } from "@/lib/roles";

/**
 * ROLE SELECTION SCREEN (items 1 & 2)
 *
 * The entry point of the admin area. Nobody is dropped straight into a
 * role-specific panel any more: a role is chosen here, and "خروج از این سمت"
 * always brings the operator back to this screen.
 *
 * Stage 1 has no admin authentication (see README, Phase 7), so this is an
 * identity *switcher*, not a login. The layout is deliberately honest about
 * that rather than faking a password prompt.
 */

const ROLE_ICON: Record<Role, IconName> = {
  SENIOR_MANAGER: "shield",
  TECH_MANAGER: "box",
  KITCHEN: "receipt",
  DRIVER: "bike",
};

export function RoleGate() {
  const { staff } = useStaff();
  const { signInAs } = useRoleSession();

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="flex h-13 items-center justify-between border-b border-[var(--surface-border)] px-4 lg:h-14 lg:px-6">
        <div className="flex items-center gap-2.5">
          <Logo width={58} withSub={false} href="/" />
          <span className="rounded bg-flame-600/12 px-1.5 py-0.5 text-[10.5px] font-extrabold text-flame-600">
            ADMIN
          </span>
        </div>
        <ThemeToggle className="size-9" />
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 py-7 sm:py-10">
        <h1 className="text-[19px] font-extrabold leading-tight text-mist-100 sm:text-[22px]">
          ورود به پنل مدیریت
        </h1>
        <p className="mt-1.5 text-[13px] leading-6 text-mist-500">
          سمت خود را انتخاب کنید. هر سمت فقط به بخش‌های مجاز خودش دسترسی دارد و
          هر لحظه می‌توانید از آن خارج شوید.
        </p>

        <ul className="mt-5 space-y-2.5">
          {staff.map((member) => {
            const def = ROLE_MAP[member.role];
            return (
              <li key={member.phone}>
                <button
                  type="button"
                  onClick={() => signInAs(member.phone)}
                  className="flex w-full items-start gap-3 rounded-xl border border-[var(--surface-border)] bg-ink-900 p-3.5 text-right transition-colors hover:border-flame-600/45 sm:p-4"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-flame-600/12 text-flame-600">
                    <Icon name={ROLE_ICON[member.role] ?? "user"} className="size-[18px]" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-[14px] font-extrabold text-mist-100">{def.label}</span>
                      <span className="num text-[12.5px] text-mist-500" dir="ltr">
                        {toFa(member.phone)}
                      </span>
                    </span>
                    <span className="mt-1 block text-[13px] font-medium text-mist-200">
                      {member.name}
                    </span>
                    <span className="mt-1 block text-[12.5px] leading-5 text-mist-500">
                      {def.description}
                    </span>
                  </span>

                  <Icon name="chevron" className="mt-3 size-4 shrink-0 text-mist-500" />
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-5 rounded-xl border border-[var(--surface-border)] bg-ink-900 p-3.5 text-[12.5px] leading-6 text-mist-500">
          <Icon name="shield" className="ml-1.5 inline size-3.5 text-flame-600" />
          این نسخهٔ نمایشی است و احراز هویت واقعی ندارد؛ در مرحلهٔ بعد، ورود با
          شماره موبایل و کد تأیید انجام می‌شود و دسترسی‌ها روی سرور بررسی می‌شوند.
        </p>
      </main>
    </div>
  );
}
