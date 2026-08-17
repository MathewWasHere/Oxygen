"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthPanel } from "@/components/checkout/AuthPanel";
import { useStore } from "@/lib/store";
import { Logo } from "@/components/brand/Logo";

export default function AuthPage() {
  const router = useRouter();
  const { state } = useStore();

  useEffect(() => {
    if (state.hydrated && state.user) router.replace("/account");
  }, [state.hydrated, state.user, router]);

  return (
    <div className="shell flex min-h-[80vh] items-center justify-center py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo width={140} href={null} />
          <p className="mt-4 text-[13px] text-mist-400">
            وارد شو تا آدرس‌ها و سفارش‌هایت ذخیره بمانند و سریع‌تر سفارش بدهی.
          </p>
        </div>
        <AuthPanel onDone={() => router.push("/account")} />
      </div>
    </div>
  );
}
