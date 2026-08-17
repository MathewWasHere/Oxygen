"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import type {
  Address,
  CartItem,
  CartModifier,
  Order,
  OrderStatus,
  Product,
  User,
} from "@/lib/types";
import { calculateTotals, etaFor, lineTotal, pointsFor } from "@/lib/pricing";
import { canTransition } from "@/lib/order-machine";
import { deliveryZones, products as catalog } from "@/lib/data/catalog";

/**
 * Client store.
 *
 * Stage 1: state lives in localStorage behind a small "api" surface.
 * Stage 2: each action becomes a typed fetch to /api/* — components and
 * selectors below stay untouched because they only read from this context.
 */

const STORAGE_KEY = "oxygen.state.v1";

interface State {
  cart: CartItem[];
  user: User | null;
  addresses: Address[];
  selectedAddressId: string | null;
  orders: Order[];
  favorites: string[];
  couponCode: string;
  deliveryMethod: "DELIVERY" | "PICKUP";
  hydrated: boolean;
}

const initialState: State = {
  cart: [],
  user: null,
  addresses: [],
  selectedAddressId: null,
  orders: [],
  favorites: [],
  couponCode: "",
  deliveryMethod: "DELIVERY",
  hydrated: false,
};

type Action =
  | { type: "HYDRATE"; payload: Partial<State> }
  | { type: "ADD_ITEM"; product: Product; quantity: number; modifiers: CartModifier[]; note?: string }
  | { type: "SET_QTY"; key: string; quantity: number }
  | { type: "REMOVE_ITEM"; key: string }
  | { type: "CLEAR_CART" }
  | { type: "SET_COUPON"; code: string }
  | { type: "SET_DELIVERY_METHOD"; method: "DELIVERY" | "PICKUP" }
  | { type: "LOGIN"; user: User }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; patch: Partial<User> }
  | { type: "SAVE_ADDRESS"; address: Address }
  | { type: "DELETE_ADDRESS"; id: string }
  | { type: "SELECT_ADDRESS"; id: string }
  | { type: "TOGGLE_FAVORITE"; productId: string }
  | { type: "PLACE_ORDER"; order: Order }
  | { type: "SET_ORDER_STATUS"; orderId: string; status: OrderStatus; note?: string }
  | { type: "SET_ORDER_NOTE"; orderId: string; note: string };

function keyFor(productId: string, modifiers: CartModifier[], note?: string) {
  return [productId, ...modifiers.map((m) => m.id).sort(), note ?? ""].join("|");
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.payload, hydrated: true };

    case "ADD_ITEM": {
      const key = keyFor(action.product.id, action.modifiers, action.note);
      const existing = state.cart.find((i) => i.key === key);
      const cart = existing
        ? state.cart.map((i) => (i.key === key ? { ...i, quantity: i.quantity + action.quantity } : i))
        : [
            ...state.cart,
            {
              key,
              productId: action.product.id,
              name: action.product.name,
              image: action.product.image,
              unitPrice: action.product.price,
              quantity: action.quantity,
              modifiers: action.modifiers,
              note: action.note,
            },
          ];
      return { ...state, cart };
    }

    case "SET_QTY":
      return {
        ...state,
        cart:
          action.quantity <= 0
            ? state.cart.filter((i) => i.key !== action.key)
            : state.cart.map((i) => (i.key === action.key ? { ...i, quantity: action.quantity } : i)),
      };

    case "REMOVE_ITEM":
      return { ...state, cart: state.cart.filter((i) => i.key !== action.key) };

    case "CLEAR_CART":
      return { ...state, cart: [], couponCode: "" };

    case "SET_COUPON":
      return { ...state, couponCode: action.code };

    case "SET_DELIVERY_METHOD":
      return { ...state, deliveryMethod: action.method };

    case "LOGIN":
      return { ...state, user: action.user };

    case "LOGOUT":
      return { ...state, user: null, selectedAddressId: null };

    case "UPDATE_USER":
      return { ...state, user: state.user ? { ...state.user, ...action.patch } : state.user };

    case "SAVE_ADDRESS": {
      const exists = state.addresses.some((a) => a.id === action.address.id);
      const addresses = exists
        ? state.addresses.map((a) => (a.id === action.address.id ? action.address : a))
        : [...state.addresses, action.address];
      return { ...state, addresses, selectedAddressId: action.address.id };
    }

    case "DELETE_ADDRESS": {
      const addresses = state.addresses.filter((a) => a.id !== action.id);
      return {
        ...state,
        addresses,
        selectedAddressId: state.selectedAddressId === action.id ? addresses[0]?.id ?? null : state.selectedAddressId,
      };
    }

    case "SELECT_ADDRESS":
      return { ...state, selectedAddressId: action.id };

    case "TOGGLE_FAVORITE":
      return {
        ...state,
        favorites: state.favorites.includes(action.productId)
          ? state.favorites.filter((f) => f !== action.productId)
          : [...state.favorites, action.productId],
      };

    case "PLACE_ORDER":
      return {
        ...state,
        orders: [action.order, ...state.orders],
        cart: [],
        couponCode: "",
        user: state.user
          ? { ...state.user, points: state.user.points + action.order.pointsEarned }
          : state.user,
      };

    case "SET_ORDER_STATUS":
      return {
        ...state,
        orders: state.orders.map((o) => {
          if (o.id !== action.orderId) return o;
          if (!canTransition(o.status, action.status)) return o;
          return {
            ...o,
            status: action.status,
            events: [...o.events, { status: action.status, at: Date.now(), by: "admin", note: action.note }],
          };
        }),
      };

    case "SET_ORDER_NOTE":
      return {
        ...state,
        orders: state.orders.map((o) => (o.id === action.orderId ? { ...o, internalNote: action.note } : o)),
      };

    default:
      return state;
  }
}

export interface Toast {
  id: number;
  title: string;
  description?: string;
  tone?: "default" | "success" | "error";
  image?: string;
}

interface StoreValue {
  state: State;
  cartCount: number;
  cartTotal: number;
  totals: ReturnType<typeof calculateTotals>;
  selectedAddress?: Address;
  addItem: (product: Product, quantity?: number, modifiers?: CartModifier[], note?: string) => void;
  setQty: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  setCoupon: (code: string) => void;
  setDeliveryMethod: (method: "DELIVERY" | "PICKUP") => void;
  login: (phone: string, name?: string) => void;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
  saveAddress: (address: Address) => void;
  deleteAddress: (id: string) => void;
  selectAddress: (id: string) => void;
  toggleFavorite: (productId: string) => void;
  placeOrder: (opts: { paymentMethod: "ONLINE" | "CASH" | "POS" }) => Order;
  reorder: (orderId: string) => void;
  setOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  setOrderNote: (orderId: string, note: string) => void;
  toasts: Toast[];
  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;
  cartPulse: number;
}

const StoreContext = createContext<StoreValue | null>(null);

/** Demo orders so the admin board and history are never empty. */
function seedOrders(): Order[] {
  const now = Date.now();
  const mk = (
    n: number,
    status: OrderStatus,
    minsAgo: number,
    items: Array<[string, number]>,
    customer: { name: string; phone: string },
    zoneId: string,
  ): Order => {
    const orderItems = items.map(([id, qty]) => {
      const p = catalog.find((c) => c.id === id)!;
      return {
        productId: p.id,
        name: p.name,
        image: p.image,
        unitPrice: p.price,
        quantity: qty,
        modifiers: [],
        lineTotal: p.price * qty,
      };
    });
    const subtotal = orderItems.reduce((s, i) => s + i.lineTotal, 0);
    const zone = deliveryZones.find((z) => z.id === zoneId)!;
    const total = subtotal + zone.fee;
    const createdAt = now - minsAgo * 60000;
    const flow: OrderStatus[] = ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED"];
    const upto = flow.indexOf(status);
    return {
      id: `seed-${n}`,
      number: n,
      createdAt,
      status,
      items: orderItems,
      subtotal,
      deliveryFee: zone.fee,
      discount: 0,
      total,
      deliveryMethod: "DELIVERY",
      zoneId,
      etaMinutes: zone.etaMinutes,
      payment: { method: "ONLINE", status: "PAID", refId: `RF${100000 + n}` },
      customer,
      events: flow.slice(0, upto + 1).map((s, i) => ({ status: s, at: createdAt + i * 6 * 60000 })),
      pointsEarned: pointsFor(total),
      address: {
        id: `seed-addr-${n}`,
        title: "خانه",
        province: "فارس",
        city: "فسا",
        line: zone.name + "، کوچه ۱۲، پلاک ۸",
        recipientName: customer.name,
        recipientPhone: customer.phone,
        zoneId,
      },
    };
  };

  return [
    mk(1252, "PENDING", 3, [["p1", 2], ["p7", 1]], { name: "مهدی رضایی", phone: "09171234567" }, "z1"),
    mk(1251, "PENDING", 7, [["p4", 1], ["p11", 2]], { name: "سارا احمدی", phone: "09361112233" }, "z2"),
    mk(1250, "CONFIRMED", 12, [["p2", 1]], { name: "علی کریمی", phone: "09901234567" }, "z1"),
    mk(1249, "PREPARING", 18, [["p3", 1], ["p8", 1], ["p10", 2]], { name: "زهرا موسوی", phone: "09177654321" }, "z3"),
    mk(1248, "PREPARING", 24, [["p1", 1], ["p7", 1]], { name: "رضا دلاور", phone: "09309318326" }, "z1"),
    mk(1247, "READY", 31, [["p6", 1], ["p10", 1]], { name: "حسین نیکو", phone: "09353334455" }, "z2"),
    mk(1246, "OUT_FOR_DELIVERY", 44, [["p4", 2]], { name: "فاطمه شریفی", phone: "09171119988" }, "z4"),
    mk(1245, "DELIVERED", 78, [["p5", 2], ["p7", 2]], { name: "امیر قاسمی", phone: "09122223344" }, "z1"),
    mk(1244, "DELIVERED", 96, [["p2", 1], ["p11", 1]], { name: "نگین سالاری", phone: "09178887766" }, "z2"),
  ];
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [cartPulse, setCartPulse] = useState(0);
  const toastId = useRef(0);

  // hydrate
  useEffect(() => {
    let payload: Partial<State> = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) payload = JSON.parse(raw) as Partial<State>;
    } catch {
      /* ignore corrupt storage */
    }
    if (!payload.orders || payload.orders.length === 0) payload.orders = seedOrders();
    dispatch({ type: "HYDRATE", payload });
  }, []);

  // persist
  useEffect(() => {
    if (!state.hydrated) return;
    const { hydrated: _h, ...persist } = state;
    void _h;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
    } catch {
      /* quota */
    }
  }, [state]);

  const pushToast = useCallback((t: Omit<Toast, "id">) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev.slice(-2), { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3200);
  }, []);

  const dismissToast = useCallback((id: number) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  const selectedAddress = state.addresses.find((a) => a.id === state.selectedAddressId);

  const totals = useMemo(
    () =>
      calculateTotals({
        items: state.cart,
        zoneId: selectedAddress?.zoneId,
        couponCode: state.couponCode,
        isFirstOrder: state.orders.filter((o) => !o.id.startsWith("seed")).length === 0,
        deliveryMethod: state.deliveryMethod,
      }),
    [state.cart, state.couponCode, state.orders, state.deliveryMethod, selectedAddress?.zoneId],
  );

  const value: StoreValue = {
    state,
    cartCount: state.cart.reduce((s, i) => s + i.quantity, 0),
    cartTotal: state.cart.reduce((s, i) => s + lineTotal(i), 0),
    totals,
    selectedAddress,
    cartPulse,
    toasts,
    pushToast,
    dismissToast,
    addItem: (product, quantity = 1, modifiers = [], note) => {
      dispatch({ type: "ADD_ITEM", product, quantity, modifiers, note });
      setCartPulse((n) => n + 1);
      pushToast({
        title: "به سبد خرید اضافه شد",
        description: product.name,
        tone: "success",
        image: product.image,
      });
    },
    setQty: (key, quantity) => dispatch({ type: "SET_QTY", key, quantity }),
    removeItem: (key) => dispatch({ type: "REMOVE_ITEM", key }),
    clearCart: () => dispatch({ type: "CLEAR_CART" }),
    setCoupon: (code) => dispatch({ type: "SET_COUPON", code }),
    setDeliveryMethod: (method) => dispatch({ type: "SET_DELIVERY_METHOD", method }),
    login: (phone, name) =>
      dispatch({
        type: "LOGIN",
        user: {
          id: "u-" + phone,
          phone,
          name: name ?? state.user?.name ?? "مهمان اکسیژن",
          points: state.user?.points ?? 150,
          createdAt: Date.now(),
        },
      }),
    logout: () => dispatch({ type: "LOGOUT" }),
    updateUser: (patch) => dispatch({ type: "UPDATE_USER", patch }),
    saveAddress: (address) => dispatch({ type: "SAVE_ADDRESS", address }),
    deleteAddress: (id) => dispatch({ type: "DELETE_ADDRESS", id }),
    selectAddress: (id) => dispatch({ type: "SELECT_ADDRESS", id }),
    toggleFavorite: (productId) => dispatch({ type: "TOGGLE_FAVORITE", productId }),
    setOrderStatus: (orderId, status, note) => dispatch({ type: "SET_ORDER_STATUS", orderId, status, note }),
    setOrderNote: (orderId, note) => dispatch({ type: "SET_ORDER_NOTE", orderId, note }),
    placeOrder: ({ paymentMethod }) => {
      const number = 1253 + state.orders.filter((o) => !o.id.startsWith("seed")).length;
      const items = state.cart.map((i) => ({
        productId: i.productId,
        name: i.name,
        image: i.image,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        modifiers: i.modifiers,
        lineTotal: lineTotal(i),
      }));
      const order: Order = {
        id: `o-${Date.now()}`,
        number,
        createdAt: Date.now(),
        status: "CONFIRMED",
        items,
        subtotal: totals.subtotal,
        deliveryFee: totals.deliveryFee,
        discount: totals.discount,
        total: totals.total,
        couponCode: totals.appliedCoupon?.code,
        deliveryMethod: state.deliveryMethod,
        address: state.deliveryMethod === "DELIVERY" ? selectedAddress : undefined,
        zoneId: selectedAddress?.zoneId,
        etaMinutes: etaFor(selectedAddress?.zoneId, state.cart),
        payment: {
          method: paymentMethod,
          status: paymentMethod === "ONLINE" ? "PAID" : "PENDING",
          refId: paymentMethod === "ONLINE" ? `RF${Math.floor(Math.random() * 900000 + 100000)}` : undefined,
        },
        customer: { name: state.user?.name ?? "مشتری اکسیژن", phone: state.user?.phone ?? "" },
        events: [
          { status: "PENDING", at: Date.now() },
          { status: "CONFIRMED", at: Date.now() + 1000 },
        ],
        pointsEarned: pointsFor(totals.total),
      };
      dispatch({ type: "PLACE_ORDER", order });
      return order;
    },
    reorder: (orderId) => {
      const order = state.orders.find((o) => o.id === orderId);
      if (!order) return;
      order.items.forEach((item) => {
        const product = catalog.find((p) => p.id === item.productId);
        if (product)
          dispatch({ type: "ADD_ITEM", product, quantity: item.quantity, modifiers: item.modifiers });
      });
      setCartPulse((n) => n + 1);
      pushToast({ title: "سفارش قبلی به سبد اضافه شد", description: `سفارش #${order.number}`, tone: "success" });
    },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
