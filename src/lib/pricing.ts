import { coupons, deliveryZones, products } from "@/lib/data/catalog";
import type { CartItem, Coupon } from "@/lib/types";

/**
 * Pricing engine — single source of truth.
 *
 * IMPORTANT (Stage 2): this module runs on the SERVER for order creation.
 * The client uses it only for optimistic display. The backend recomputes every
 * total from database prices; the frontend total is never trusted.
 */

export interface PriceBreakdown {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponError?: string;
  appliedCoupon?: Coupon;
}

export function lineTotal(item: CartItem): number {
  const mods = item.modifiers.reduce((s, m) => s + m.price, 0);
  return (item.unitPrice + mods) * item.quantity;
}

/** Re-price a cart against the authoritative catalog (mirrors the server step). */
export function repriceCart(items: CartItem[]): CartItem[] {
  return items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return product ? { ...item, unitPrice: product.price, name: product.name, image: product.image } : item;
  });
}

export function calculateTotals(opts: {
  items: CartItem[];
  zoneId?: string;
  couponCode?: string;
  isFirstOrder?: boolean;
  deliveryMethod?: "DELIVERY" | "PICKUP";
}): PriceBreakdown {
  const { items, zoneId, couponCode, isFirstOrder = true, deliveryMethod = "DELIVERY" } = opts;
  const priced = repriceCart(items);
  const subtotal = priced.reduce((s, i) => s + lineTotal(i), 0);

  const zone = deliveryZones.find((z) => z.id === zoneId);
  const deliveryFee = deliveryMethod === "PICKUP" || subtotal === 0 ? 0 : zone?.fee ?? 20000;

  let discount = 0;
  let couponError: string | undefined;
  let appliedCoupon: Coupon | undefined;

  if (couponCode) {
    const coupon = coupons.find((c) => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.active);
    if (!coupon) {
      couponError = "کد تخفیف معتبر نیست";
    } else if (subtotal < coupon.minOrder) {
      couponError = `حداقل مبلغ سفارش برای این کد ${coupon.minOrder.toLocaleString("en-US")} تومان است`;
    } else if (coupon.firstOrderOnly && !isFirstOrder) {
      couponError = "این کد فقط برای اولین سفارش قابل استفاده است";
    } else {
      appliedCoupon = coupon;
      discount =
        coupon.type === "PERCENT"
          ? Math.min(Math.round((subtotal * coupon.value) / 100), coupon.maxDiscount ?? Infinity)
          : coupon.value;
      discount = Math.min(discount, subtotal);
    }
  }

  return {
    subtotal,
    deliveryFee,
    discount,
    total: Math.max(0, subtotal + deliveryFee - discount),
    couponError,
    appliedCoupon,
  };
}

/** Loyalty: 1 point per 10,000 تومان spent. */
export function pointsFor(total: number): number {
  return Math.floor(total / 10000);
}

export function etaFor(zoneId?: string, items: CartItem[] = []): number {
  const zone = deliveryZones.find((z) => z.id === zoneId);
  const prep = items.reduce((max, i) => {
    const p = products.find((pr) => pr.id === i.productId);
    return Math.max(max, p?.prepMinutes ?? 10);
  }, 10);
  return (zone?.etaMinutes ?? 30) + Math.round(prep / 2);
}
