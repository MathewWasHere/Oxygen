"use client";

import { useState } from "react";
import { Field, Input } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { useStore } from "@/lib/store";
import { toFa } from "@/lib/format";
import { useCurrentAdmin, useStaff } from "@/lib/use-roles";
import { ROLES, isValidPhone, normalizePhone, type Role } from "@/lib/roles";

/**
 * ROLES & PERMISSIONS
 *
 * Assigns a role to a user by phone number — the same identity the customer
 * app authenticates with, so a staff member signs in through the normal
 * phone+OTP flow and simply gains admin capabilities.
 *
 * Writes go through `useStaff()`, which persists to localStorage and notifies
 * every subscriber, so the sidebar and header update the moment a role changes.
 */
export function RolesPanel() {
  const { staff, upsert, remove, setRole } = useStaff();
  const me = useCurrentAdmin();
  const { pushToast } = useStore();

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [role, setNewRole] = useState<Role>("KITCHEN");
  const [touched, setTouched] = useState(false);

  const phoneOk = isValidPhone(phone);
  const normalized = normalizePhone(phone);
  const duplicate = staff.some((s) => s.phone === normalized);

  function addMember() {
    setTouched(true);
    if (!phoneOk) {
      pushToast({ title: "شماره موبایل معتبر نیست", tone: "error" });
      return;
    }
    if (duplicate) {
      pushToast({
        title: "این شماره قبلاً ثبت شده",
        description: "نقش کاربر را از فهرست تغییر دهید.",
        tone: "error",
      });
      return;
    }
    upsert({ phone: normalized, name: name.trim() || "کاربر بدون نام", role });
    pushToast({ title: "دسترسی ثبت شد", tone: "success" });
    setPhone("");
    setName("");
    setTouched(false);
  }

  return (
    <div className="rounded-xl border border-[var(--surface-border)] bg-ink-900 pad-panel">
      <h2 className="text-[13px] font-extrabold text-mist-100">نقش‌ها و دسترسی‌ها</h2>
      <p className="mt-0.5 text-[11.5px] leading-5 text-mist-500">
        با شماره موبایل به کارکنان دسترسی بده. کاربر با همان شماره وارد می‌شود و
        دسترسی نقشش را می‌گیرد.
      </p>

      {/* ---------- Add / assign ---------- */}
      <div className="mt-3 grid gap-2.5 rounded-lg border border-[var(--surface-border)] bg-ink-850 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Field
          label="شماره موبایل"
          error={touched && !phoneOk ? "قالب درست: ۰۹۱۲۳۴۵۶۷۸۹" : undefined}
        >
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            dir="ltr"
            inputMode="tel"
            placeholder="09121234567"
            aria-invalid={touched && !phoneOk}
            className={cn("h-10 text-left text-[13px]", touched && !phoneOk && "border-flame-600/60")}
          />
        </Field>

        <Field label="نام (اختیاری)">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="نام کارمند"
            className="h-10 text-[13px]"
          />
        </Field>

        <div className="flex gap-2 sm:pb-0">
          <select
            value={role}
            onChange={(e) => setNewRole(e.target.value as Role)}
            aria-label="نقش"
            className="h-10 min-w-0 flex-1 rounded-lg border border-[var(--surface-border-strong)] bg-ink-800 px-2.5 text-[12.5px] font-bold text-mist-100 outline-none transition-colors focus:border-flame-600/70 sm:flex-none"
          >
            {ROLES.map((r) => (
              <option key={r.role} value={r.role}>
                {r.label}
              </option>
            ))}
          </select>
          <button
            onClick={addMember}
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-flame-600 px-3 text-[12.5px] font-extrabold text-white transition-colors hover:bg-flame-500"
          >
            <Icon name="plus" className="size-3.5" />
            افزودن
          </button>
        </div>
      </div>

      {/* ---------- Current staff ---------- */}
      <div className="mt-3 space-y-1.5">
        {staff.map((member) => {
          const isMe = member.phone === me.phone;
          const def = ROLES.find((r) => r.role === member.role);
          return (
            <div
              key={member.phone}
              /*
               * ZONED LAYOUT (items 3 & 5)
               *
               * Previously every zone competed for one cramped flex row, so
               * names, phone numbers and the role <select> collided. Now the
               * card is an explicit grid:
               *
               *   mobile               >= sm
               *   [ identity      ]    [ identity | role | actions ]
               *   [ role | actions]    [ description             ]
               *   [ description   ]
               *
               * Nothing is hidden or shrunk — the rows simply stack while
               * space is tight, and the description always gets full width to
               * wrap naturally.
               */
              className="rounded-lg border border-[var(--surface-border)] bg-ink-850 p-3"
            >
              <div className="grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-3">
                {/* ZONE 1 — identity */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                    <span className="break-words text-[13px] font-bold text-mist-100">
                      {member.name}
                    </span>
                    {isMe && (
                      <span className="shrink-0 rounded bg-flame-600/12 px-1.5 py-0.5 text-[10.5px] font-extrabold text-flame-600">
                        شما
                      </span>
                    )}
                  </div>
                  <div className="num mt-0.5 text-[11.5px] text-mist-500" dir="ltr">
                    {toFa(member.phone)}
                  </div>
                </div>

                {/* ZONES 2 + 3 — role selector and actions, kept together so
                    they wrap as one unit instead of splitting awkwardly. */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={member.role}
                    onChange={(e) => {
                      setRole(member.phone, e.target.value as Role);
                      pushToast({ title: "نقش به‌روزرسانی شد", tone: "success" });
                    }}
                    aria-label={`نقش ${member.name}`}
                    className="h-10 min-w-0 flex-1 rounded-lg border border-[var(--surface-border-strong)] bg-ink-800 px-2 text-[12.5px] font-bold text-mist-100 outline-none transition-colors focus:border-flame-600/70 sm:w-36 sm:flex-none"
                  >
                    {ROLES.map((r) => (
                      <option key={r.role} value={r.role}>
                        {r.label}
                      </option>
                    ))}
                  </select>

                  {/* Switch identity — Stage 1 has no admin auth, so this
                      previews what each role actually sees. */}
                  <button
                    onClick={() => {
                      me.switchTo(member.phone);
                      pushToast({ title: `نمایش پنل به‌عنوان ${member.name}`, tone: "success" });
                    }}
                    disabled={isMe}
                    title="مشاهده پنل با این نقش"
                    aria-label={`مشاهده پنل به‌عنوان ${member.name}`}
                    className="grid size-10 shrink-0 place-items-center rounded-lg border border-[var(--surface-border-strong)] text-mist-300 transition-colors hover:border-flame-600/50 hover:text-flame-600 disabled:opacity-30"
                  >
                    <Icon name="user" className="size-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (isMe) {
                        pushToast({ title: "نمی‌توانید دسترسی خودتان را حذف کنید", tone: "error" });
                        return;
                      }
                      remove(member.phone);
                      pushToast({ title: "دسترسی حذف شد" });
                    }}
                    disabled={isMe}
                    title="حذف دسترسی"
                    aria-label={`حذف دسترسی ${member.name}`}
                    className="grid size-10 shrink-0 place-items-center rounded-lg border border-[var(--surface-border-strong)] text-mist-300 transition-colors hover:border-red-500/60 hover:text-red-500 disabled:opacity-30"
                  >
                    <Icon name="trash" className="size-4" />
                  </button>
                </div>
              </div>

              {/* ZONE 4 — secondary description, full width so it wraps. */}
              <p className="mt-2 border-t border-[var(--hairline)] pt-2 text-[11.5px] leading-5 text-mist-500">
                {def?.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* ---------- Permission matrix ---------- */}
      <details className="mt-3 rounded-lg border border-[var(--surface-border)] bg-ink-850">
        <summary className="cursor-pointer list-none px-3 py-2.5 text-[12px] font-bold text-mist-200 marker:hidden">
          <span className="flex items-center gap-1.5">
            <Icon name="shield" className="size-3.5 text-flame-600" />
            جدول دسترسی نقش‌ها
          </span>
        </summary>
        <div className="space-y-1.5 border-t border-[var(--hairline)] p-3">
          {ROLES.map((r) => (
            <div key={r.role} className="flex items-start gap-2">
              <span className="w-[92px] shrink-0 text-[11.5px] font-bold text-mist-100">
                {r.label}
              </span>
              <span className="num shrink-0 rounded bg-[var(--white-a6)] px-1.5 py-0.5 text-[10px] font-bold text-mist-400">
                {toFa(r.permissions.length)}
              </span>
              <span className="min-w-0 flex-1 text-[11px] leading-4 text-mist-500">
                {r.description}
              </span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
