---
contract_version: siegard-reconcile/5
title: Reconcile env.ts against the connection-pool configuration constraints it binds
summary: This file is asserted correct as it stands on disk; the trace's bindings for it are stale because
  the file changed without a rebind. This reconciliation reads it fresh against every node the trace currently
  binds to it, over one file.
target: backend
files:
- path: src/config/env.ts
  change: The file as committed declares the environment schema, including the relational store's connection-pool
    bounds as positive-integer, defaulted fields validated by loadEnv — no further description beyond
    what the judge's own reading reports.
nodes:
- node: constraints/the-connection-pool-is-bounded-by-configuration
  conforms: true
  how: 'src/config/env.ts: held at envSchema fields DATABASE_POOL_MAX_CONNECTIONS, DATABASE_POOL_IDLE_TIMEOUT_MS
    and DATABASE_POOL_STATEMENT_TIMEOUT_MS in src/config/env.ts — DATABASE_POOL_MAX_CONNECTIONS: z.coerce.number().int().positive().default(10),
    DATABASE_POOL_IDLE_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000), DATABASE_POOL_STATEMENT_TIMEOUT_MS:
    z.coerce.number().int().positive().default(30_000),'
  encoded_at:
  - src/config/env.ts
- node: constraints/the-pool-bounds-are-positive-integers
  conforms: true
  how: "src/config/env.ts: held at the same three envSchema fields' .int().positive() validators, enforced\
    \ by envSchema.safeParse in loadEnv — DATABASE_POOL_MAX_CONNECTIONS: z.coerce.number().int().positive().default(10),\
    \ DATABASE_POOL_IDLE_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000), DATABASE_POOL_STATEMENT_TIMEOUT_MS:\
    \ z.coerce.number().int().positive().default(30_000), --- const parsed = envSchema.safeParse(source);\
    \ if (!parsed.success) {\n  const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}:\
    \ ${issue.message}`);\n  throw new InvalidEnvironmentError(issues);\n}"
  encoded_at:
  - src/config/env.ts
- node: constraints/the-database-is-externally-provisioned
  conforms: true
  how: 'a registry step decides this constraint, and every step the registry named for it passed over
    the tree as these files stand — run/env-drift: `test-unit` passed (exit 0) over node --env-file=.env.test
    node_modules/.bin/vitest run src/__tests__/unit. No judge read this pair, and the run is the whole
    of what answered it'
  encoded_at:
  - src/config/env.ts
- node: constraints/the-system-persists-to-one-relational-database
  conforms: true
  how: 'a registry step decides this constraint, and every step the registry named for it passed over
    the tree as these files stand — run/env-drift: `test` passed (exit 0) over npm test. No judge read
    this pair, and the run is the whole of what answered it'
  encoded_at:
  - src/config/env.ts
notes: 'Judged by 1 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/env-drift.returns/.

  2 pair(s) over 2 node(s) were decided by run/env-drift rather than by a judge — a registry step decides
  the constraint, or a certified test decides the node — with step(s) test, test-unit. No delegation read
  them; the run''s own log is the evidence, and it sits beside these returns.

  Candidates: 0 opened across 0 of 1 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/env-drift.returns/`, which are the evidence behind every entry above.
