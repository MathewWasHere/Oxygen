import type { Metadata } from "next";
import { MenuBrowser } from "@/components/menu/MenuBrowser";

export const metadata: Metadata = {
  title: "منوی فست فود اکسیژن",
  description:
    "منوی کامل اکسیژن: پیتزا، برگر، ساندویچ، سوخاری، سیب زمینی و نوشیدنی — با قیمت روز و سفارش آنلاین در فسا.",
  openGraph: { title: "منوی فست فود اکسیژن", images: ["/food/pizza-oxygen-23.webp"] },
};

export default function MenuPage() {
  return <MenuBrowser />;
}
