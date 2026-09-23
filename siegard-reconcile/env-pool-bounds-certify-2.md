---
contract_version: siegard-reconcile/5
title: Certify env.ts's pool-bound validation tests against constraints/the-pool-bounds-are-positive-integers
summary: This file is asserted correct as it stands on disk; this reconciliation re-reads it against the
  one node under certification and offers both env.spec.ts's loadEnv-level cross-product test and index.spec.ts's
  real-startup-path test together as the proof a coverage auditor should judge.
target: backend
files:
- path: src/config/env.ts
  change: Unchanged since the last reconciliation; re-read here as part of a certification pass — no further
    description beyond what the judge's own reading reports.
nodes:
- node: constraints/the-pool-bounds-are-positive-integers
  conforms: true
  how: "src/config/env.ts: held at the envSchema fields for the three pool bounds, each constrained with\
    \ `.int().positive()`, combined with loadEnv's safeParse-and-throw on failure — DATABASE_POOL_MAX_CONNECTIONS:\
    \ z.coerce.number().int().positive().default(10),\nDATABASE_POOL_IDLE_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),\n\
    DATABASE_POOL_STATEMENT_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),\n...\nconst\
    \ parsed = envSchema.safeParse(source);\nif (!parsed.success) {\n  const issues = parsed.error.issues.map((issue)\
    \ => `${issue.path.join('.')}: ${issue.message}`);\n  throw new InvalidEnvironmentError(issues);\n\
    }"
  encoded_at:
  - src/config/env.ts
  decided_by: test
  step: test-unit
  proof:
  - src/__tests__/unit/config/env.spec.ts
  - src/__tests__/unit/index.spec.ts
pairs_omitted:
- node: constraints/the-connection-pool-is-bounded-by-configuration
  file: src/config/env.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: constraints/the-database-is-externally-provisioned
  file: src/config/env.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: constraints/the-system-persists-to-one-relational-database
  file: src/config/env.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
notes: 'Judged by 1 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/env-pool-bounds-certify-2.returns/.

  Certified constraints/the-pool-bounds-are-positive-integers as decided by step `test-unit`: src/__tests__/unit/config/env.spec.ts
  ($description for $field); src/__tests__/unit/config/env.spec.ts (throws InvalidEnvironmentError naming
  the field when a pool variable is set to a non-numeric value); src/__tests__/unit/config/env.spec.ts
  (defaults each of the three pool variables to a positive integer when the existing required-variable
  fixture names none of them); src/__tests__/unit/config/env.spec.ts (parses a configured value for each
  of the three pool variables as a number, distinct from their defaults); src/__tests__/unit/index.spec.ts
  (fails startup and binds no listener when $field names $description); src/__tests__/unit/index.spec.ts
  (creates the server and binds a listener at the configured PORT when every pool bound is valid) would
  fail if the fact stopped holding.

  Candidates: 0 opened across 0 of 1 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/env-pool-bounds-certify-2.returns/`, which are the evidence behind every entry above.
