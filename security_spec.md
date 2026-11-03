# Security Specification: Rugby Bar Inventory & Events

## 1. Data Invariants
1. Default Deny: All paths not explicitly matched are denied.
2. Authenticated Access: Operations require a valid session or authorized club user.
3. Products: Must validate required keys (`id`, `name`, `category`, `currentStock`, `minStock`, `unit`), non-negative minStock, valid category enum.
4. Events: Must validate `id`, `title`, `date`, `time`, `location`, `type`. The `notes` field is bounded to 1000 characters.
5. Closures: Must validate `id`, `date`, `time`, `timestamp`, `revenue` (number >= 0), booleans for cleaning and keys, and non-empty `responsibleName`.
6. Suppliers: Must validate `id`, `name`, and string constraints.
7. Logs: Must validate `id`, `productId`, `productName`, `change`, `newStock`, `reason`, `timestamp`.
8. Users: Cannot escalate roles arbitrarily or assign arbitrary admin status.
9. Admin Bootstrapping: Admin access granted to primary administrator (`borja.lara.lopez@gmail.com`) and club admins.

## 2. The Dirty Dozen Payloads (Designed to Fail)
1. Injected arbitrary collection write to `/_secret_admin_creds/123`.
2. Product with negative stock limit or invalid category type `category: 9999`.
3. Product with oversized name (>10,000 characters).
4. Product with shadow injected field `isBackdoorAdmin: true`.
5. Event with invalid event type `type: "hack_event"`.
6. Event with oversized notes (>50,000 characters).
7. Closure with negative revenue `revenue: -500.0`.
8. Closure with missing `responsibleName`.
9. Closure with missing `cleaningCompleted` confirmation boolean.
10. StockLog with non-numeric change `change: "lots"`.
11. Supplier with missing name field.
12. User profile modification injecting invalid role `role: "super_root_god"`.

## 3. Test Runner Specification
`firestore.rules.test.ts` executes each of the Dirty Dozen against local Firestore emulator or unit rules testing, asserting `assertFails()` / `PERMISSION_DENIED`.
