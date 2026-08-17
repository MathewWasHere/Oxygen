"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  ACTIVE_ADMIN_KEY,
  DEFAULT_STAFF,
  STAFF_STORAGE_KEY,
  can,
  clearActiveAdmin,
  readActiveAdminOrNull,
  readStaff,
  roleLabel,
  writeStaff,
  type Permission,
  type Role,
  type StaffMember,
} from "@/lib/roles";

/* --------------------------------------------------------------------------
 * The staff table lives in localStorage, which is an external store — so we
 * subscribe to it with useSyncExternalStore rather than mirroring it into
 * component state via an effect (the React Compiler rejects setState-in-effect,
 * and mirroring would desync the sidebar from the settings page).
 * ------------------------------------------------------------------------ */

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/* Snapshots must be referentially stable or useSyncExternalStore loops. */
let staffCache: StaffMember[] | null = null;
let staffCacheRaw: string | null = null;

function staffSnapshot(): StaffMember[] {
  const raw = (() => {
    try {
      return localStorage.getItem(STAFF_STORAGE_KEY);
    } catch {
      return null;
    }
  })();
  if (raw !== staffCacheRaw || staffCache === null) {
    staffCacheRaw = raw;
    staffCache = readStaff();
  }
  return staffCache;
}

function staffServerSnapshot(): StaffMember[] {
  return DEFAULT_STAFF;
}

let adminCache: StaffMember | null = null;
let adminCacheKey = "\u0000";

function adminSnapshot(): StaffMember | null {
  const key = (() => {
    try {
      return (
        (localStorage.getItem(ACTIVE_ADMIN_KEY) ?? "") +
        "|" +
        (localStorage.getItem(STAFF_STORAGE_KEY) ?? "")
      );
    } catch {
      return "";
    }
  })();
  if (key !== adminCacheKey) {
    adminCacheKey = key;
    adminCache = readActiveAdminOrNull();
  }
  return adminCache;
}

function adminServerSnapshot(): StaffMember | null {
  return null;
}

/** The staff directory plus mutators. */
export function useStaff() {
  const staff = useSyncExternalStore(subscribe, staffSnapshot, staffServerSnapshot);

  const upsert = useCallback((member: StaffMember) => {
    const next = readStaff().slice();
    const i = next.findIndex((s) => s.phone === member.phone);
    if (i >= 0) next[i] = member;
    else next.push(member);
    writeStaff(next);
    emit();
  }, []);

  const remove = useCallback((phone: string) => {
    writeStaff(readStaff().filter((s) => s.phone !== phone));
    emit();
  }, []);

  const setRole = useCallback((phone: string, role: Role) => {
    const next = readStaff().map((s) => (s.phone === phone ? { ...s, role } : s));
    writeStaff(next);
    emit();
  }, []);

  return { staff, upsert, remove, setRole };
}

/**
 * The active role session, or `null` when nobody has picked a role yet.
 *
 * This is the single source of truth every admin surface reads — one reusable
 * session hook rather than a bespoke implementation per role.
 */
export function useRoleSession() {
  const member = useSyncExternalStore(subscribe, adminSnapshot, adminServerSnapshot);

  const signInAs = useCallback((phone: string) => {
    try {
      localStorage.setItem(ACTIVE_ADMIN_KEY, phone);
    } catch {
      /* ignore */
    }
    emit();
  }, []);

  const signOut = useCallback(() => {
    clearActiveAdmin();
    emit();
  }, []);

  return { member, signInAs, signOut };
}

/**
 * Who is currently operating the admin panel.
 *
 * Falls back to the first staff member so existing callers keep a non-null
 * object; screens that must distinguish "no role chosen" use `useRoleSession`.
 */
export function useCurrentAdmin() {
  const { member, signInAs, signOut } = useRoleSession();
  const resolved = member ?? DEFAULT_STAFF[0];

  return {
    ...resolved,
    roleLabel: roleLabel(resolved.role),
    switchTo: signInAs,
    signOut,
  };
}

/** Permission check bound to the current admin. */
export function usePermission(): (p: Permission) => boolean {
  const me = useCurrentAdmin();
  return useCallback((p: Permission) => can(me.role, p), [me.role]);
}
