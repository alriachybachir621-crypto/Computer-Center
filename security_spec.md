# Security Specification — Computer Center Firestore Rules

## 1. Data Invariants
1. **Admin-Only Mutations**: Only verified administrators (`isAdmin()`, requiring `request.auth != null && request.auth.token.email_verified == true` and matching bootstrapped admin email or `/admins/{uid}`) may create, update, or delete `products`, `printing_services`, `gallery_photos`, `shop_info/main`, and `admin_settings/pin`.
2. **Public Catalog Visibility**: Public `get` and `list` access on `products`, `printing_services`, and `gallery_photos` is strictly gated by `resource.data.isVisible == true` (unless `isAdmin()`).
3. **PII & Secret Isolation**: `admin_settings/pin` (the 4-digit shop code) is strictly unreadable and unwritable by non-admins. No customer PII is stored in Firestore.
4. **Strict Schema & Bounds**: Every write validates exact required and allowed field sets (`keys().hasAll` + `keys().hasOnly`), strict types, string length caps, numeric ranges, enum allowlists, regex-hardened document IDs (`^[a-zA-Z0-9_-]+$`), immutable `createdAt`, and server-enforced timestamps (`request.time`).

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unauthenticated Product Create**: Anonymous client attempts to `create` `/products/hacked-laptop` -> `PERMISSION_DENIED`.
2. **Unverified Admin Email Spoof**: Signed-in user with `email_verified: false` attempts to `update` `/shop_info/main` -> `PERMISSION_DENIED`.
3. **Self-Assigned Admin Escalation**: Authenticated non-admin user attempts to `create` `/admins/{uid}` with `{ role: "admin" }` -> `PERMISSION_DENIED`.
4. **Shadow Field Injection**: Admin attempts `create` on `/products/p1` with an extra undeclared field `discountHack: 99` -> `PERMISSION_DENIED` (`keys().hasOnly` guard).
5. **Immutable `createdAt` Tampering**: Admin attempts `update` on `/products/p1` changing `createdAt` -> `PERMISSION_DENIED`.
6. **Future/Fake Timestamp Injection**: Admin attempts `create` on `/products/p1` with a client-supplied `updatedAt` != `request.time` -> `PERMISSION_DENIED`.
7. **ID Poisoning**: Admin attempts `create` on `/products/invalid$id#with!spaces` -> `PERMISSION_DENIED` (`isValidId` regex guard).
8. **Negative / Exhaustive Price**: Admin attempts `create` on `/products/p2` with `priceUsd: -50` or `priceUsd: 9999999` -> `PERMISSION_DENIED`.
9. **Resource Exhaustion (1MB String)**: Admin attempts `create` on `/products/p3` with `nameEn` of length 2,000 characters -> `PERMISSION_DENIED`.
10. **Invalid Category Enum**: Admin attempts `create` on `/products/p4` with `category: "Crypto"` -> `PERMISSION_DENIED`.
11. **Non-Admin PIN Read**: Unauthenticated or non-admin user attempts `get` on `/admin_settings/pin` -> `PERMISSION_DENIED`.
12. **Hidden Product Leak**: Unauthenticated user attempts `get` on `/products/draft1` where `isVisible == false` -> `PERMISSION_DENIED`.
