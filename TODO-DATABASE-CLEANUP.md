# Database Cleanup To-Do List

This file tracks all identified database issues. Work through them by priority.

---

## Critical

- [ ] **Fix PrismaClient imports** in `auth.js`, `books.js`, `collections.js`, `orders.js`, `shipments.js` — use singleton from `db.js` instead of creating new `PrismaClient()` instances (causes connection exhaustion on Neon)

- [ ] **Fix schema drift** — baseline migration (`20260717000000_baseline`) is missing `status` (String?) and `activeOrders` (Int?) columns on the `User` table that exist in the current schema

---

## High

- [ ] **Fix duplicate route in `orders.js`** — `GET /driver/:driverId` is defined twice (lines 296-339 and 341-365). Remove the dead code duplicate.

- [ ] **Fix `books.js` passing `userId` to `BookItem.create()`** — the `BookItem` model has no `userId` field. Remove `userId` from the create call (line 21).

- [ ] **Fix inconsistent level calculation in `seed.js`** — three different formulas used:
  - Line 101: `Math.floor(points / 1000) + 1`
  - Line 512: `Math.floor(balance / 800) + 1`
  - Level table thresholds: `[0, 250, 750, 2000, 5000]`
  - Pick one formula and use it consistently.

---

## Medium (Future)

- [ ] **Add missing indexes** on frequently queried FK fields:
  - `DonationRequest.userId`, `DonationRequest.type`
  - `BookItem.isDonated`, `BookItem.isAvailable`, `BookItem.collectionId`
  - `Order.userId`, `Order.driverId`, `Order.status`
  - `OrderItem.orderId`
  - `PointTransaction.userId`, `PointTransaction.type`
  - `CraftListing.userId`, `CraftListing.status`
  - `Shipment.userId`, `Task.userId`
  - `Notification.userId`, `EventComment.userId`, `EventLike.userId`

- [ ] **Clean up verbose auto-generated relation names** — rename to readable names:
  - `AuditLog_AuditLog_actorUserIdToUser` → `actorUser`
  - `AuditLog_AuditLog_targetUserIdToUser` → `targetUser`
  - `Dispute_Dispute_againstUserIdToUser` → `againstUser`
  - `Dispute_Dispute_raisedByUserIdToUser` → `raisedByUser`
  - `Dispute_Dispute_resolvedByToUser` → `resolvedByUser`
  - `Order_Order_driverIdToUser` → `driver`
  - `PointTransaction_PointTransaction_staffIdToUser` → `staff`
  - `PointTransaction_PointTransaction_userIdToUser` → `user`

- [ ] **Fix inconsistent `updatedAt` behavior** — 4 models use `@default(now())` instead of `@updatedAt`:
  - `Cart.updatedAt`
  - `Dispute.updatedAt`
  - `Payment.updatedAt`
  - `SystemConfig.updatedAt`

- [ ] **Standardize ID generation strategy** — currently 3 different approaches:
  - `@default(uuid())` — most models
  - `@default(dbgenerated("gen_random_uuid()"))` — 8 models
  - Manual ID required — `Shipment`, `Task`
  - Pick one and migrate consistently.

- [ ] **Add missing FK constraints**:
  - `EventPost.createdBy` — plain String, no FK to User
  - `Shipment.driver` — plain String, no FK to User

---

## Low (Future)

- [ ] **Normalize `Task` model** — all fields (`donor`, `location`, `volume`, `date`, `status`) are plain strings with no relations. `date` should be DateTime.

- [ ] **Remove dead code**:
  - `collections.js` line 10: `userId` destructured but never used
  - `tasks.js` line 53: hardcoded fallback `userId: 'test-user-123'`

- [ ] **Add routes for models without CRUD**:
  - `Payment`
  - `Notification`
  - `EventPost`, `EventComment`, `EventLike`
  - `Dispute`
  - `Cart` / `CartItem`
  - `AuditLog` (read-only query)

- [ ] **Fix seed date inconsistency** — donation dates start at 2026-01-01 but order dates start at 2024-06-01 (orders before donations in seed data)

- [ ] **CORS allows all origins** in development mode (`index.js` line 20) — add environment check

---

*Last updated: 2026-07-21*
