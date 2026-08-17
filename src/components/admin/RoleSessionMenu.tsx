"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { toFa } from "@/lib/format";
import { useRoleSession, useStaff } from "@/lib/use-roles";
import { ROLE_MAP } from "@/lib/roles";

/**
 * ROLE SESSION CONTROL (item 2)
 *
 * ONE reusable component used by every role — senior manager, tech manager,
 * kitchen and driver all get the identical control, so there is no per-role
 * implementation to drift.
 *
 * It states the current role plainly in the header and exposes
 * «خروج از این سمت» plus a direct switch to any other role. The action is in
 * the header next to the user's own name — the first place anyone looks — not
 * buried in a settings page.
 */
export function RoleSessionMenu({
  name,
  roleLabel,
  phone,
}: {
  name: string;
  roleLabel: string;
  phone: string;
}) {
  const [open, setOpen] = useState(false);
  const { staff } = useStaff();
  const { signInAs, signOut } = useRoleSession();
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape — a menu that traps focus would be a
  // smaller version of the very problem this component fixes.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`${name} — ${roleLabel}. تغییر یا خروج از سمت`}
        className="flex min-w-0 max-w-[9.5rem] items-center gap-1.5 rounded-lg border border-[var(--surface-border)] bg-[var(--white-a4)] py-1 pl-1.5 pr-2.5 transition-colors hover:border-flame-600/40 sm:max-w-none"
      >
        <span className="min-w-0 text-right leading-tight">
          <span className="block truncate text-[12px] font-extrabold text-mist-100">{name}</span>
          <span className="block truncate text-[10.5px] text-flame-600">{roleLabel}</span>
        </span>
        <Icon
          name="chevron"
          className={cn("size-3.5 shrink-0 text-mist-400 transition-transform", open ? "-rotate-90" : "rotate-90")}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-[calc(100%+6px)] z-70 w-64 overflow-hidden rounded-xl border border-[var(--surface-border)] bg-ink-900 shadow-2xl"
        >
          <div className="border-b border-[var(--hairline)] px-3 py-2.5">
            <div className="text-[10.5px] font-bold text-mist-500">سمت فعلی</div>
            <div className="mt-0.5 truncate text-[13px] font-extrabold text-mist-100">
              {roleLabel}
            </div>
            <div className="num mt-0.5 truncate text-[11.5px] text-mist-500" dir="ltr">
              {toFa(phone)}
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto p-1.5">
            <div className="px-1.5 pb-1 pt-1.5 text-[10.5px] font-bold text-mist-500">
              تغییر سمت
            </div>
            {staff
              .filter((s) => s.phone !== phone)
              .map((s) => (
                <button
                  key={s.phone}
                  role="menuitem"
                  onClick={() => {
                    signInAs(s.phone);
                    setOpen(false);
                  }}
                  className="flex w-full min-h-11 items-center gap-2 rounded-lg px-2 text-right transition-colors hover:bg-[var(--white-a6)]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-bold text-mist-100">
                      {ROLE_MAP[s.role].label}
                    </span>
                    <span className="block truncate text-[11px] text-mist-500">{s.name}</span>
                  </span>
                </button>
              ))}
          </div>

          <div className="border-t border-[var(--hairline)] p-1.5">
            <button
              role="menuitem"
              onClick={() => {
                signOut();
                setOpen(false);
              }}
              className="flex w-full min-h-11 items-center gap-2 rounded-lg px-2 text-right text-[12.5px] font-extrabold text-red-600 transition-colors hover:bg-red-600/10"
            >
              <Icon name="logout" className="size-4 shrink-0" />
              خروج از این سمت
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
