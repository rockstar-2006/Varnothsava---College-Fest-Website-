# Improvements Tracker

Last updated: 2026-03-08
Owner: Engineering

## Purpose

This file is the living backlog for optimization, bug fixes, reliability hardening, and upgrades.

Status legend:
- [ ] todo
- [~] in progress
- [x] done
- [!] blocked / needs decision

---

## Project Snapshot

- Stack: Next.js 16.1.1 (App Router, Turbopack), React 19, TypeScript, Tailwind v4.
- Backend integrations: Firebase (client + admin), Firestore, Razorpay, Gemini API.
- App shape: large client-heavy marketing/event pages + admin dashboard + payment workflow + chat endpoint.

---

## Current Baseline (validated on 2026-03-08)

### Build
- `npm run build` fails.
- Blocking error: missing `xlsx` at `src/lib/exportUtils.ts` import.
- Additional note: Next.js warns that `middleware.ts` convention is deprecated in favor of `proxy.ts`.

### Lint
- `npm run lint` result: **770 problems** (476 errors, 294 warnings).
- Dominant categories:
  - `@typescript-eslint/no-explicit-any`
  - `react-hooks/purity` (notably `Math.random`/impure render logic)
  - `react-hooks/set-state-in-effect`
  - unused imports/vars
  - JSX entity/comment formatting errors

### Dependencies
- `npm ls --depth=0` indicates install drift:
  - UNMET: `xlsx`, `dotenv`
  - INVALID: `firebase-admin` (installed 13.6.1, package expects ^13.7.0)
  - multiple extraneous packages

---

## Priority Backlog

## P0 — Reliability / Correctness / Security

- [ ] **P0-01: Fix dependency install drift and lock reproducibility**
  - Do a clean dependency reset (`node_modules` + lockfile validation) and ensure `npm ci` passes.
  - Confirm `xlsx` and `dotenv` resolve correctly in build/runtime.

- [ ] **P0-02: Harden payment state machine (critical)**
  - Align payment status semantics across:
    - `src/app/api/payment/verify/route.ts`
    - `src/app/api/payment/callback/route.ts`
    - `src/app/api/payment/webhook/route.ts`
    - `src/app/api/payment/verify-utr/route.ts`
    - `src/lib/paymentService.ts`
  - Current risk: UTR flow stores status as `captured` even when notes say `pending_admin_verification`.
  - Current risk: `checkUserPaymentStatus` treats `authorized` as paid; may unlock flows too early.

- [ ] **P0-03: Remove sensitive/high-volume logging in production paths**
  - Gate logs behind environment checks or centralized logger.
  - Priority files: payment APIs, `/api/me`, registration APIs, client payment hook.

- [ ] **P0-04: Replace in-memory rate limiting with production-safe distributed limiter**
  - `src/lib/ratelimit.ts` currently uses process memory, which is not reliable across instances/restarts.
  - Implement Upstash-based limiter in production with safe fallback strategy.

- [ ] **P0-05: Audit Firestore rules for least privilege**
  - Revisit broad allowances (`payments` create/read paths, generic signed-in creates).
  - Ensure rules match intended server-only write model.

## P1 — Performance / Efficiency

- [ ] **P1-01: Break up very large client pages and isolate heavy effects**
  - Candidate hotspots:
    - `src/app/page.tsx` (~2k+ lines)
    - `src/app/contact/page.tsx` (large animated component)
    - `src/components/layout/LoadingScreen.tsx` (large + animation-heavy)
  - Apply dynamic imports and section-level splitting where possible.

- [ ] **P1-02: Eliminate impure render-time randomness in React components**
  - Multiple components use `Math.random()` in render/memo paths causing lint and unpredictability.
  - Move to seeded/precomputed refs or effect-time generation.

- [~] **P1-03: Optimize admin APIs to avoid full scans and in-memory fallback dependence**
  - Hot files:
    - `src/app/api/admin/registrations/route.ts`
    - `src/app/api/admin/payments/route.ts`
    - `src/app/api/admin/stats/route.ts`
  - Introduce tighter query/index strategy + cache keys + server-side pagination consistency.
  - 2026-03-08 (Task 1) implemented:
    - Added TTL cache short-circuit to `src/app/api/admin/stats/route.ts` for non-coordinator access.
    - Prevented coordinator-scoped stats requests from overwriting global `system/stats`.
    - Added lightweight pagination mode (`skipCounts=1`) to users/payments/registrations admin APIs.
    - Reduced repeated frontend hits by removing auto-refresh `/api/admin/stats` calls from users/payments/registrations pages.
    - Switched `src/app/api/admin/events/route.ts` to cached metrics by default (optional live mode via `fresh=1`).
    - Enforced cache lifetime for event metrics in `src/app/api/admin/events/route.ts` using TTL (`ADMIN_EVENT_METRICS_CACHE_TTL_MS`, fallback `ADMIN_STATS_CACHE_TTL_MS`) with live fallback when stale.
    - Added cached totals short-circuit to `src/app/api/admin/payments/total/route.ts`.

- [ ] **P1-04: Review smooth-scroll lifecycle cost**
  - `src/components/ui/SmoothScroll.tsx` reinitializes Lenis on pathname changes.
  - Consider singleton lifecycle with controlled resets for route changes.

## P2 — Maintainability / Upgrades

- [ ] **P2-01: Centralize API auth + error handling wrappers**
  - Repeated token parsing/401 handling across many route handlers.
  - Expand use of shared helpers/middleware wrappers to reduce divergence.

- [ ] **P2-02: Reduce `any` usage in core server libs first**
  - Priority: `src/lib/paymentService.ts`, `src/lib/razorpay.ts`, API handlers with payment/admin logic.

- [ ] **P2-03: Rename non-UI library modules from `.tsx` to `.ts` where JSX is not used**
  - Examples: `src/lib/firebaseAdmin.tsx`, `src/lib/firebaseClient.tsx`.

- [ ] **P2-04: Replace `alert()` UX with non-blocking toast/notification system**
  - Current usage is widespread in app and admin pages.

- [ ] **P2-05: Migrate `middleware.ts` to `proxy.ts`**
  - Required for forward compatibility with Next.js 16+ conventions.

---

## Quick Wins (next session)

- [ ] Clean install + lockfile sync and verify `npm run build` unblocks.
- [ ] Patch P0 payment semantics (`captured` vs `pending/manual`) and add idempotency guards.
- [ ] Remove production audit logs containing payment/order payloads.
- [ ] Fix highest-noise lint class: `set-state-in-effect` in frequently used UI components.

---

## Decision Log / Notes

- 2026-03-08: Initial architecture scan completed.
- 2026-03-08: Build and lint baselines captured from current workspace state.
- 2026-03-08: Existing `build_error.txt` appears stale (current build fails on `xlsx` missing, not `SmoothScroll` import).

---

## Change Log

- 2026-03-08: Created initial `improvements.md` with prioritized backlog and validated baseline.
- 2026-03-08: Task 1 started and partially completed for admin Firebase read optimization (API caching + frontend request reduction + paginated count skipping).
- 2026-03-08: Added TTL-based lifetime enforcement for admin event metrics cache to prevent stale indefinite reuse.