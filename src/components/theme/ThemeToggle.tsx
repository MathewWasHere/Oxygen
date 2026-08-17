"use client";

import { useTheme } from "./ThemeProvider";

function SunIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.6v2.2M12 19.2v2.2M21.4 12h-2.2M4.8 12H2.6M18.6 5.4l-1.6 1.6M7 17l-1.6 1.6M18.6 18.6 17 17M7 7 5.4 5.4" />
    </svg>
  );
}

function MoonIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.5 14.3A8.6 8.6 0 1 1 9.7 3.5a6.9 6.9 0 0 0 10.8 10.8Z" />
    </svg>
  );
}

/**
 * Compact icon button — used in the header where space is tight.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "روشن کردن حالت روز" : "روشن کردن حالت شب"}
      title={isDark ? "حالت روز" : "حالت شب"}
      className={`tap-44 grid size-10 shrink-0 place-items-center rounded-lg border border-[var(--surface-border)] bg-[var(--white-a4)] text-mist-200 transition hover:border-flame-600/50 hover:text-flame-600 active:scale-95 ${className}`}
    >
      <span className="relative block size-[18px]">
        <SunIcon
          className={`absolute inset-0 size-[18px] transition-all duration-300 ${
            isDark ? "scale-50 opacity-0 rotate-90" : "scale-100 opacity-100 rotate-0"
          }`}
        />
        <MoonIcon
          className={`absolute inset-0 size-[18px] transition-all duration-300 ${
            isDark ? "scale-100 opacity-100 rotate-0" : "scale-50 opacity-0 -rotate-90"
          }`}
        />
      </span>
    </button>
  );
}

/**
 * Full segmented control — used inside the mobile menu / drawer where the
 * current choice should be explicit rather than implied by an icon.
 */
export function ThemeSwitch({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: "light" as const, label: "روشن", Icon: SunIcon },
    { value: "dark" as const, label: "شب", Icon: MoonIcon },
  ];

  return (
    <div
      className={`flex items-center gap-1 rounded-full border border-[var(--surface-border)] bg-[var(--white-a4)] p-1 ${className}`}
      role="group"
      aria-label="انتخاب حالت نمایش"
    >
      {options.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={active}
            className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-full px-3 text-[13px] font-bold transition ${
              active
                ? "bg-flame-600 text-white"
                : "text-mist-400 hover:text-mist-100"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
