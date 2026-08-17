/**
 * OXYGEN — Domain types.
 * These mirror the Stage-2 relational schema (see prisma/schema.prisma) so the
 * mock data layer can be swapped for real API responses without UI changes.
 */

export type ID = string;

export interface Category {
  id: ID;
  slug: string;
  name: string;
  image: string;
  sortOrder: number;
  active: boolean;
}

export interface ProductModifier {
  id: ID;
  name: string;
  price: number;
  group: "extra" | "sauce" | "size";
  default?: boolean;
}

export interface Product {
  id: ID;
  slug: string;
  categoryId: ID;
  name: string;
  shortDescription: string;
  description: string;
  ingredients: string[];
  price: number;
  /** Original price when a discount is active. */
  compareAtPrice?: number;
  image: string;
  gallery?: string[];
  popular: boolean;
  available: boolean;
  prepMinutes: number;
  rating: number;
  soldCount: number;
  modifiers: ProductModifier[];
  badges?: string[];
}

export interface CartModifier {
  id: ID;
  name: string;
  price: number;
}

export interface CartItem {
  /** Stable key = productId + sorted modifier ids. */
  key: string;
  productId: ID;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  modifiers: CartModifier[];
  note?: string;
}

export interface Address {
  id: ID;
  title: string;
  province: string;
  city: string;
  line: string;
  plaque?: string;
  unit?: string;
  postalCode?: string;
  recipientName: string;
  recipientPhone: string;
  note?: string;
  zoneId: ID;
  isDefault?: boolean;
}

export interface DeliveryZone {
  id: ID;
  name: string;
  fee: number;
  etaMinutes: number;
  minOrder: number;
  active: boolean;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "PAYMENT_FAILED";

export type DeliveryMethod = "DELIVERY" | "PICKUP";

export type PaymentMethod = "ONLINE" | "CASH" | "POS";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface OrderItem {
  productId: ID;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  modifiers: CartModifier[];
  lineTotal: number;
}

export interface OrderEvent {
  status: OrderStatus;
  at: number;
  by?: string;
  note?: string;
}

export interface Order {
  id: ID;
  /** Human facing number, e.g. 1248 */
  number: number;
  createdAt: number;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode?: string;
  deliveryMethod: DeliveryMethod;
  address?: Address;
  zoneId?: ID;
  etaMinutes: number;
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
    refId?: string;
  };
  customer: {
    name: string;
    phone: string;
  };
  events: OrderEvent[];
  internalNote?: string;
  driverName?: string;
  pointsEarned: number;
}

export interface Coupon {
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  maxDiscount?: number;
  minOrder: number;
  firstOrderOnly?: boolean;
  description: string;
  active: boolean;
}

export interface User {
  id: ID;
  phone: string;
  name: string;
  points: number;
  createdAt: number;
}
