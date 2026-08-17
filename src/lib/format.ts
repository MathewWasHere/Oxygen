const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** Convert latin digits in a string to Persian digits. */
export function toFa(input: string | number): string {
  return String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

/** Convert Persian/Arabic digits back to latin (for form inputs). */
export function toEn(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/** 285000 → "۲۸۵,۰۰۰" */
export function faNumber(value: number): string {
  return toFa(Math.round(value).toLocaleString("en-US"));
}

/** 285000 → "۲۸۵,۰۰۰ تومان" */
export function toman(value: number): string {
  return `${faNumber(value)} تومان`;
}

const WEEKDAYS = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];

/** Gregorian → Jalali conversion (civil algorithm). */
export function toJalali(date: Date): { jy: number; jm: number; jd: number } {
  const gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  const gy2 = gy <= 1600 ? gy - 621 : gy - 1600;
  const gy3 = gm > 2 ? gy2 + 1 : gy2;
  let days =
    365 * gy2 +
    Math.floor((gy3 + 3) / 4) -
    Math.floor((gy3 + 99) / 100) +
    Math.floor((gy3 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { jy, jm, jd };
}

const J_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

/** 1723... → "۲۱ مرداد ۱۴۰۵" */
export function faDate(ts: number): string {
  const d = new Date(ts);
  const { jy, jm, jd } = toJalali(d);
  return `${toFa(jd)} ${J_MONTHS[jm - 1]} ${toFa(jy)}`;
}

/** → "۲۰:۳۰" */
export function faTime(ts: number): string {
  const d = new Date(ts);
  return toFa(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
}

export function faWeekday(ts: number): string {
  return WEEKDAYS[new Date(ts).getDay()];
}

/** "۳ دقیقه پیش" */
export function faRelative(ts: number, now = Date.now()): string {
  const diff = Math.max(0, Math.round((now - ts) / 60000));
  if (diff < 1) return "همین الان";
  if (diff < 60) return `${toFa(diff)} دقیقه پیش`;
  const hours = Math.round(diff / 60);
  if (hours < 24) return `${toFa(hours)} ساعت پیش`;
  return faDate(ts);
}

export function faPhone(phone: string): string {
  return toFa(phone);
}

export function normalizePhone(input: string): string {
  return toEn(input).replace(/\D/g, "").slice(0, 11);
}

export function isValidIranPhone(phone: string): boolean {
  return /^09\d{9}$/.test(normalizePhone(phone));
}
