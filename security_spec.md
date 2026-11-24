# Security Specification: Portfolio Firestore Rules

## 1. Data Invariants
1. Only a verified administrator (`hamamalidrose@gmail.com` with `email_verified == true` or an entry in `/admins/{uid}`) may create, update, or delete projects or update `/siteSettings/profile`.
2. Public visitors may only read `/siteSettings/profile` and `/projects/{projectId}` (no PII is stored in these collections).
3. Every project must have `title` (1..120 chars), `description` (1..1000 chars), `category` (1..60 chars), `techStack` (1..200 chars), `sortOrder` (0..10000), valid `createdBy` matching `request.auth.uid` on create, and server-validated `createdAt`/`updatedAt` matching `request.time`.
4. `createdBy` and `createdAt` on `/projects/{projectId}` are immutable after creation.
5. Document IDs must match `^[a-zA-Z0-9_\-]+$` and be at most 128 characters.
6. `/admins/{userId}` cannot be written from any client SDK.

## 2. The "Dirty Dozen" Payloads (All Must Return PERMISSION_DENIED)
1. Unauthenticated create on `/projects/p1`
2. Authenticated non-admin user create on `/projects/p1`
3. Spoofed admin email with `email_verified: false` creating on `/projects/p1`
4. Admin create on `/projects/p1` with shadow field `isFeatured: true`
5. Admin create on `/projects/p1` with `createdBy` set to another UID
6. Admin create on `/projects/p1` with client-forged `createdAt` not equal to `request.time`
7. Admin update on `/projects/p1` mutating immutable `createdBy` or `createdAt`
8. Admin update on `/projects/p1` with oversized `title` (> 120 chars) or `description` (> 1000 chars)
9. Poisoned path ID `/projects/invalid$id..1500chars`
10. Non-admin delete on `/projects/p1`
11. Client write attempt on `/admins/attackerUid` to self-elevate to `role: "admin"`
12. Write attempt on `/siteSettings/otherDoc` or deleting `/siteSettings/profile`
