/**
 * ROLE-BASED ACCESS CONTROL
 *
 * Roles are keyed by phone number, matching the app's existing identity model
 * (customers authenticate with phone + OTP — there are no separate admin
 * accounts). Assignments persist in the same localStorage store as the rest of
 * the Stage 1 state; in Stage 2 this table moves to the `StaffRole` table and
 * the same `can()` helper runs server-side before any mutation.
 */

export type Role = "SENIOR_MANAGER" | "TECH_MANAGER" | "KITCHEN" | "DRIVER";

/** Every capability the admin surface can gate on. */
export type Permission =
  | "dashboard.view"
  | "orders.view"
  | "orders.advance"
  | "orders.cancel"
  | "products.view"
  | "products.edit"
  | "categories.edit"
  | "customers.view"
  | "discounts.edit"
  | "delivery.edit"
  | "settings.view"
  | "settings.edit"
  | "roles.manage"
  | "brand.pack.view"
  | "driver.view";

export const ROLES: Array<{
  role: Role;
  label: string;
  english: string;
  description: string;
  permissions: Permission[];
}> = [
  {
    role: "SENIOR_MANAGER",
    label: "مدیر ارشد",
    english: "Senior Manager",
    description: "دسترسی کامل به همه بخش‌ها، شامل مدیریت نقش‌ها.",
    permissions: [
      "dashboard.view",
      "orders.view",
      "orders.advance",
      "orders.cancel",
      "products.view",
      "products.edit",
      "categories.edit",
      "customers.view",
      "discounts.edit",
      "delivery.edit",
      "settings.view",
      "settings.edit",
      "roles.manage",
      "brand.pack.view",
    ],
  },
  {
    role: "TECH_MANAGER",
    label: "مدیر فناوری",
    english: "Technology Manager",
    description: "محصولات، دسته‌بندی‌ها، تخفیف‌ها، مناطق ارسال و تنظیمات فنی.",
    permissions: [
      "dashboard.view",
      "orders.view",
      "products.view",
      "products.edit",
      "categories.edit",
      "discounts.edit",
      "delivery.edit",
      "settings.view",
      "settings.edit",
    ],
  },
  {
    role: "KITCHEN",
    label: "کارمند آشپزخانه",
    english: "Kitchen Staff",
    description: "فقط سفارش‌های زنده: مشاهده و پیش‌بردن وضعیت آماده‌سازی.",
    permissions: ["orders.view", "orders.advance", "products.view"],
  },
  {
    role: "DRIVER",
    label: "پیک",
    english: "Delivery Driver",
    description: "فقط سفارش‌های تخصیص‌یافته برای تحویل.",
    permissions: ["driver.view"],
  },
];

export const ROLE_MAP: Record<Role, (typeof ROLES)[number]> = ROLES.reduce(
  (acc, r) => {
    acc[r.role] = r;
    return acc;
  },
  {} as Record<Role, (typeof ROLES)[number]>,
);

export function roleLabel(role: Role): string {
  return ROLE_MAP[role]?.label ?? role;
}

/** Central permission check — used by the UI and, in Stage 2, by the server. */
export function can(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_MAP[role]?.permissions.includes(permission) ?? false;
}

/* -------------------------------------------------------------------------
 * Staff directory
 * ---------------------------------------------------------------------- */

export interface StaffMember {
  phone: string;
  name: string;
  role: Role;
}

export const STAFF_STORAGE_KEY = "oxygen.staff.v1";

/** Seeded so the panel is never empty on a fresh device. */
export const DEFAULT_STAFF: StaffMember[] = [
  { phone: "09309318326", name: "متین دلاور", role: "SENIOR_MANAGER" },
  { phone: "09171234567", name: "سعید مهندس", role: "TECH_MANAGER" },
  { phone: "09361112233", name: "رضا آشپز", role: "KITCHEN" },
  { phone: "09901234567", name: "علی کریمی", role: "DRIVER" },
];

/** Iranian mobile format: 09xxxxxxxxx (11 digits). */
export function normalizePhone(input: string): string {
  const digits = input
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/\D/g, "");
  if (digits.startsWith("98")) return "0" + digits.slice(2);
  if (digits.startsWith("0")) return digits;
  if (digits.length === 10) return "0" + digits;
  return digits;
}

export function isValidPhone(input: string): boolean {
  return /^09\d{9}$/.test(normalizePhone(input));
}

/* -------------------------------------------------------------------------
 * Current admin identity (Stage 1 demo switcher)
 * ---------------------------------------------------------------------- */

export const ACTIVE_ADMIN_KEY = "oxygen.activeAdmin.v1";

/**
 * Which staff member is "signed in" to the admin panel.
 *
 * Stage 1 has no admin auth (see README, Phase 7), so this reads a locally
 * chosen identity. It is deliberately the ONLY place that decides the current
 * role, so wiring real auth in Stage 2 is a one-function change.
 */
export function readActiveAdmin(): StaffMember {
  return readActiveAdminOrNull() ?? DEFAULT_STAFF[0];
}

/**
 * The signed-in staff member, or `null` when no role has been chosen yet.
 *
 * The null state is what makes "خروج از این سمت" possible: exiting clears the
 * key, the layout falls back to the role-selection screen, and the operator
 * picks a different role. Without it, `readActiveAdmin()` would silently
 * default to the first staff member and the user could never actually leave
 * a role — which is the trap this fixes.
 */
export function readActiveAdminOrNull(): StaffMember | null {
  if (typeof window === "undefined") return null;
  try {
    const phone = localStorage.getItem(ACTIVE_ADMIN_KEY);
    if (!phone) return null;
    return readStaff().find((s) => s.phone === phone) ?? null;
  } catch {
    return null;
  }
}

/** Leave the current role and return to the role-selection screen. */
export function clearActiveAdmin(): void {
  try {
    localStorage.removeItem(ACTIVE_ADMIN_KEY);
  } catch {
    /* ignore */
  }
}

export function readStaff(): StaffMember[] {
  if (typeof window === "undefined") return DEFAULT_STAFF;
  try {
    const raw = localStorage.getItem(STAFF_STORAGE_KEY);
    if (!raw) return DEFAULT_STAFF;
    const parsed = JSON.parse(raw) as StaffMember[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_STAFF;
  } catch {
    return DEFAULT_STAFF;
  }
}

export function writeStaff(staff: StaffMember[]): void {
  try {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staff));
  } catch {
    /* quota — non-fatal in the prototype */
  }
}
