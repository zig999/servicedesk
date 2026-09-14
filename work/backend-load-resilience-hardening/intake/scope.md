# Scope — backend load resilience hardening

Handed to `/plan-work` as material — the decomposition, not this document, decides the actual
epics and tasks.

## 1. Rate limiting on diagnose, simulate-case and simulate-hypothesis

Implement what the specification already decided and committed at
`knowledge/constraints/the-diagnosis-and-simulation-routes-are-rate-limited.md`: 10 requests per
minute from one caller, counted independently per route, where one caller is one source IP
address; a request beyond that limit is refused with an HTTP 429 response carrying a Retry-After
value naming when the caller may retry.

Reuse as an implementation reference the middleware already delivered for the same idiom at
`src/src/http/read-capability-by-identity-rate-limit.middleware.ts` (sliding window per source
IP, `Retry-After` header) — the same shape, applied to the diagnose, simulate-case and
simulate-hypothesis routes registered in `src/src/http/build-app.ts`, with the new threshold.

## 2. Postgres pool tuning

Configure explicitly the parameters of the `Pool` created at
`src/src/persistence/database-connection.ts` — max connections, `idleTimeoutMillis`,
`statement_timeout` — left today at the `pg` driver's implicit default.

This is a technical/infrastructure hardening, with no new business fact — it needs no
specification node. The values' source of truth should be environment variables, the same
pattern `src/src/config/env.ts` already uses (e.g. `POOL_SIZE`), with sensible defaults
documented in the `Env` schema itself.
