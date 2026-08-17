"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, OTPInput } from "@/components/ui";
import { useStore } from "@/lib/store";
import { isValidIranPhone, normalizePhone, toFa } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";

/**
 * Phone + OTP authentication UI.
 *
 * Stage 1: any 5-digit code is accepted and the demo code is shown on screen.
 * Stage 2: POST /api/auth/otp/request → rate-limited send, POST /api/auth/otp/verify
 * → httpOnly session cookie. The component's props/behaviour do not change.
 */
export function AuthPanel({ onDone, compact }: { onDone?: () => void; compact?: boolean }) {
  const { login, pushToast } = useStore();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const demoCode = "12345";

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const requestOtp = () => {
    if (!isValidIranPhone(phone)) {
      setError("شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      setSeconds(90);
      pushToast({ title: "کد تأیید ارسال شد", description: `کد نمایشی: ${toFa(demoCode)}`, tone: "success" });
    }, 700);
  };

  const verify = (value: string) => {
    if (value.length < 5) {
      setError("کد تأیید را کامل وارد کنید");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login(normalizePhone(phone), name.trim() || undefined);
      pushToast({ title: "خوش آمدی به اکسیژن", tone: "success" });
      onDone?.();
    }, 600);
  };

  return (
    <div className={compact ? "" : "surface rounded-2xl p-6"}>
      {step === "phone" ? (
        <>
          <h2 className="text-lg font-extrabold text-mist-100">ورود / ثبت‌نام</h2>
          <p className="mt-1.5 text-[13px] leading-6 text-mist-400">
            شماره موبایلت را وارد کن؛ کد تأیید پیامک می‌شود.
          </p>

          <div className="mt-5 space-y-4">
            <Field label="شماره موبایل" required error={error}>
              <Input
                value={phone}
                onChange={(e) => setPhone(normalizePhone(e.target.value))}
                onKeyDown={(e) => e.key === "Enter" && requestOtp()}
                placeholder="09121234567"
                inputMode="tel"
                dir="ltr"
                autoFocus
                className="text-center text-lg tracking-widest"
              />
            </Field>
            <Field label="نام شما" hint="برای اینکه پیک راحت‌تر صدایت کند">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلاً رضا" />
            </Field>
            <Button block size="lg" loading={loading} onClick={requestOtp}>
              دریافت کد تأیید
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-center text-[13px] text-mist-500">
              <Icon name="shield" className="size-3.5" />
              با ورود، قوانین اکسیژن را می‌پذیری.
            </p>
          </div>
        </>
      ) : (
        <>
          <button
            onClick={() => setStep("phone")}
            className="mb-4 flex items-center gap-1.5 text-[13px] text-mist-400 hover:text-mist-100"
          >
            <Icon name="chevron" className="size-4 rotate-180" />
            تغییر شماره
          </button>
          <h2 className="text-lg font-extrabold text-mist-100">کد تأیید را وارد کن</h2>
          <p className="num mt-1.5 text-[13px] text-mist-400" dir="rtl">
            کد پنج‌رقمی به شماره <span className="font-bold text-mist-100">{toFa(phone)}</span> ارسال شد.
          </p>

          <div className="mt-6">
            <OTPInput value={code} onChange={setCode} onComplete={verify} />
            {error && <p className="mt-3 text-center text-[13px] text-red-500">{error}</p>}
          </div>

          <div className="mt-4 rounded-2xl border border-flame-600/25 bg-flame-600/8 p-3 text-center">
            <p className="text-[13px] text-mist-300">
              نسخه نمایشی — کد تأیید: <span className="num font-extrabold text-flame-600">{toFa(demoCode)}</span>
            </p>
          </div>

          <Button block size="lg" loading={loading} onClick={() => verify(code)} className="mt-5">
            تأیید و ادامه
          </Button>

          <div className="mt-4 text-center text-[13px] text-mist-500">
            {seconds > 0 ? (
              <span className="num">ارسال مجدد کد تا {toFa(seconds)} ثانیه دیگر</span>
            ) : (
              <button onClick={requestOtp} className="font-bold text-flame-600 hover:text-flame-500">
                ارسال مجدد کد
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
