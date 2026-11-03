// Unit tests for Firestore Security Rules (TDD Spec)
// Demonstrates that the Dirty Dozen fail with PERMISSION_DENIED

export const DIRTY_DOZEN_PAYLOADS = [
  { desc: "Shadow arbitrary root path", path: "/system_secrets/attack", data: { hacked: true } },
  { desc: "Product with invalid category", path: "/products/p-bad", data: { id: "p-bad", name: "Bad", category: 9999, currentStock: 10, minStock: 2, unit: "ud" } },
  { desc: "Product with 10k character name", path: "/products/p-big", data: { id: "p-big", name: "A".repeat(10000), category: "bebidas", currentStock: 10, minStock: 2, unit: "ud" } },
  { desc: "Product with shadow field", path: "/products/p-shadow", data: { id: "p-shadow", name: "P", category: "bebidas", currentStock: 10, minStock: 2, unit: "ud", backdoorAdmin: true } },
  { desc: "Event with invalid type", path: "/events/e-bad", data: { id: "e-bad", title: "Match", date: "2026-10-10", time: "12:00", location: "Home", type: "hack_event", teamCategory: "Senior" } },
  { desc: "Event with 50k character notes", path: "/events/e-big", data: { id: "e-big", title: "Match", date: "2026-10-10", time: "12:00", location: "Home", type: "partido_local", teamCategory: "Senior", notes: "N".repeat(50000) } },
  { desc: "Closure with negative revenue", path: "/closures/c-neg", data: { id: "c-neg", date: "2026-10-10", time: "21:00", timestamp: "2026-10-10T21:00:00Z", revenue: -500, cleaningCompleted: true, keysReturned: true, responsibleName: "Txema" } },
  { desc: "Closure missing responsibleName", path: "/closures/c-no-resp", data: { id: "c-no-resp", date: "2026-10-10", time: "21:00", timestamp: "2026-10-10T21:00:00Z", revenue: 500, cleaningCompleted: true, keysReturned: true } },
  { desc: "Closure missing cleaning boolean", path: "/closures/c-no-clean", data: { id: "c-no-clean", date: "2026-10-10", time: "21:00", timestamp: "2026-10-10T21:00:00Z", revenue: 500, keysReturned: true, responsibleName: "Txema" } },
  { desc: "StockLog with non-numeric change", path: "/logs/l-bad", data: { id: "l-bad", productId: "p1", productName: "Beer", change: "lots", newStock: 10, reason: "Restock", timestamp: "2026-10-10" } },
  { desc: "Supplier missing name", path: "/suppliers/s-bad", data: { id: "s-bad", contactPerson: "Mikel" } },
  { desc: "User with invalid role", path: "/users/u-bad", data: { id: "u-bad", username: "bad", name: "Bad", role: "super_root_god", roleLabel: "God" } }
];
