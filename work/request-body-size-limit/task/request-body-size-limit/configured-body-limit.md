---
title: HTTP server enforces a configured request-body size ceiling
summary: 'Closes EDG-06: env.ts gains a configured MAX_REQUEST_BODY_BYTES ceiling and build-app.ts passes
  it to Fastify''s own bodyLimit option.'
objective: A request whose body exceeds a configured ceiling is refused at the HTTP boundary before any
  route handler runs, and that ceiling is set from environment configuration rather than an unstated framework
  default.
criteria:
- envSchema declares MAX_REQUEST_BODY_BYTES as a positive integer, coerced from the environment, defaulting
  to 1048576 when unset.
- Fastify() in build-app.ts is constructed with its own bodyLimit option set to env.MAX_REQUEST_BODY_BYTES.
- A request whose body exceeds the configured MAX_REQUEST_BODY_BYTES is refused with an HTTP 413 response,
  and no route handler runs for it.
sources:
- intake/wrong-behavior.md
rationale: 'No specification node states a request-body size ceiling as a domain fact -- this closes the
  project''s own standard rule EDG-06 (decided_by: reading), a code-quality/hardening rule about how the
  HTTP boundary is built, not a fact the business decided about the domain. The default value (1048576
  bytes / 1MiB) is chosen to match Fastify''s own current, unconfigured default exactly, so no existing
  legitimate request that succeeds today starts being refused -- the fix makes the ceiling explicit, configurable
  and disclosed rather than changing what it actually is.'
---

## What it is

A corrective increment adding a configured request-body size ceiling (MAX_REQUEST_BODY_BYTES),
closing the project's own standard rule EDG-06, which nothing in env.ts or build-app.ts currently
answers.

## Notes

None.
