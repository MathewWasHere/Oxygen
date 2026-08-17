# OXYGEN — Architecture & Roadmap

The Stage 1 deliverable in this repo is a **high-fidelity, fully interactive prototype**
that is deliberately built on the production architecture. Nothing here is meant to be
thrown away when the backend arrives.

---

## 1. What exists today (Stage 1 — shipped)

| Area | Status |
| --- | --- |
| Design system (tokens, primitives, RTL, Vazirmatn) | ✅ |
| Homepage, menu, product detail, cart | ✅ |
| Checkout: OTP UI → address → delivery → payment simulation | ✅ |
| Order confirmation, live tracking timeline, order history, reorder | ✅ |
| Customer account: profile, addresses, favorites, loyalty | ✅ |
| Admin: dashboard, live-orders kanban, products, categories, customers, discounts, delivery zones, settings | ✅ |
| Order state machine with invalid-transition guard | ✅ |
| Server-style pricing engine (single source of truth) | ✅ |
| PWA manifest, icons, service worker, offline page | ✅ |
| SEO metadata + Restaurant/Product JSON-LD | ✅ |
| Prisma schema for the real database | ✅ (schema only) |

Mock persistence lives in `localStorage` behind `src/lib/store.tsx`. Every read path
in the UI goes through that context, so swapping in real API calls touches **one file**.

---

## 2. Brand system

The visual identity uses the official Oxygen logo pack supplied with the project:

- Wordmark and app-icon variants live in `public/brand/` as PNG and WebP.
- Hero and about imagery are assembled from the restaurant's supplied menu photos;
  no imagery from the source restaurant remains.
- Product photography is stored in `public/food/` at 800×800 and 400×400.
- SnappWeb 2.0 is self-hosted in WOFF/WOFF2 with Vazirmatn as a fallback.

Palette hierarchy: **Crimson `#E0163D` → Red `#DA291C` → Gold `#FFC72C` → neutral
black/white surfaces**. The `flame-*` token names remain for compatibility, but their
values are the official Oxygen colours.

---

## 3. Directory map

```
src/
  app/
    (site)/            customer experience (navbar + bottom nav + footer shell)
      page.tsx         homepage
      menu/            category browsing, search, sort
      product/[slug]/  product detail (SSG + JSON-LD)
      cart/            cart & coupon
      checkout/        4-step flow: auth → address → method → payment
      orders/          list + [id] live tracking
      account/         profile, orders, addresses, favorites, rewards
      about/ auth/ offline/
    admin/             operational dashboard (separate shell, separate visual language)
  components/
    ui/                design-system primitives (Button, Icon, Price, OTPInput, …)
    shell/             Navbar, BottomNav, Footer, ToastHost, PWARegister
    product/ menu/ home/ checkout/ order/ brand/
  lib/
    types.ts           domain types (mirror of prisma/schema.prisma)
    store.tsx          client state + action surface (→ becomes API client)
    pricing.ts         totals engine (runs server-side in Stage 2)
    order-machine.ts   explicit status transitions
    format.ts          Persian digits, Toman, Jalali dates
    data/catalog.ts    mock catalog (→ becomes DB queries)
prisma/schema.prisma   production database schema
```

---

## 4. Order lifecycle

```
PENDING ─▶ CONFIRMED ─▶ PREPARING ─▶ READY ─▶ OUT_FOR_DELIVERY ─▶ DELIVERED
   │            │            │          │             │
   └─▶ CANCELLED / PAYMENT_FAILED  (guarded by TRANSITIONS table)
```

`canTransition(from, to)` is enforced in the store today and must be enforced again in
the API layer before any status write. Admin actions in the kanban only offer legal
transitions — the UI cannot construct an invalid state.

---

## 5. Money rules (non-negotiable)

1. The client sends **product ids, quantities, modifier ids, address id, coupon code** — never prices.
2. The server loads current prices from PostgreSQL and recomputes subtotal, modifiers,
   delivery fee (from the address's zone), and discount.
3. The coupon is re-validated server-side (active, min order, first-order-only, usage limit).
4. Order + Payment rows are created inside one transaction.
5. Redirect to Zarinpal, then **verify** on callback before marking `PAID` and `CONFIRMED`.
6. Frontend "payment success" is display only; the callback verification is the truth.

`src/lib/pricing.ts` is written so it can be imported unchanged by the API route.

---

## 6. Remaining phases

**Phase 6 — Backend & database**
`prisma migrate dev`, seed from `src/lib/data/catalog.ts`, then implement:
`GET /api/catalog`, `GET /api/products/:slug`, `POST /api/orders`, `GET /api/orders/:id`.
Replace the catalog imports and the store's mock actions with typed fetches.

**Phase 7 — Auth & OTP**
`POST /api/auth/otp/request` (hash code, 2-min TTL, 5/hour per phone + per IP),
`POST /api/auth/otp/verify` (attempt counter, constant-time compare, httpOnly `SameSite=Lax`
session cookie). Admin login is a separate route with its own rate limit and role check.

**Phase 8 — Payment**
Zarinpal request/verify service behind `src/server/services/payment.ts`; the interface
is provider-agnostic so the gateway can change without touching checkout.

**Phase 9 — Realtime**
Replace the 15s poll in `orders/[id]` with a WebSocket subscription to `order:{id}`.
Admin kanban subscribes to `orders:live`. Polling stays as the automatic fallback.

**Phase 10 — Notifications**
`sendSms(event, payload)` / `sendPush(...)` abstractions; events: order created,
payment ok, accepted, ready, driver assigned, delivered.

**Phase 11 — Hardening**
Zod validation on every route, CSRF for cookie-auth mutations, rate limiting,
audit logging (`AuditLog`), Lighthouse + a11y pass, e2e tests of the order flow.

**Phase 12 — Deployment**
Managed PostgreSQL, env vars from the platform secret store, image CDN,
`next build` with output tracing, uptime + error monitoring.

---

## 7. Driver app (future)

`Driver` and `Delivery` tables already exist. The flow is
`Customer → Order → Restaurant → Driver → Customer`; the driver client only needs
assigned orders, address, call button, "picked up", "delivered".

---

## 8. Business objective

The product is optimised to move customers **off third-party aggregators**:
saved addresses, one-tap reorder, order history, first-order discount, loyalty points,
QR codes on packaging, and a phone-number-only login. Every one of those is present in
Stage 1 so the incentive to order directly exists from day one.
