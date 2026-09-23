---
contract_version: siegard-reconcile/5
title: Certify env.ts's pool-bound validation test against constraints/the-pool-bounds-are-positive-integers
summary: This file is asserted correct as it stands on disk; this reconciliation re-reads it against the
  one node under certification and offers env.spec.ts's expanded pool-bound cross-product test as the
  proof a coverage auditor should judge.
target: backend
files:
- path: src/config/env.ts
  change: Unchanged since the last reconciliation; re-read here as part of a certification pass — no further
    description beyond what the judge's own reading reports.
nodes:
- node: constraints/the-pool-bounds-are-positive-integers
  conforms: true
  how: "src/config/env.ts: held at the `DATABASE_POOL_MAX_CONNECTIONS`, `DATABASE_POOL_IDLE_TIMEOUT_MS`\
    \ and `DATABASE_POOL_STATEMENT_TIMEOUT_MS` fields of `envSchema`, and the `safeParse`/throw in `loadEnv`\
    \ — DATABASE_POOL_MAX_CONNECTIONS: z.coerce.number().int().positive().default(10), DATABASE_POOL_IDLE_TIMEOUT_MS:\
    \ z.coerce.number().int().positive().default(10_000), DATABASE_POOL_STATEMENT_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),\
    \ ... const parsed = envSchema.safeParse(source); if (!parsed.success) {\n  const issues = parsed.error.issues.map((issue)\
    \ => `${issue.path.join('.')}: ${issue.message}`);\n  throw new InvalidEnvironmentError(issues);\n\
    }"
  encoded_at:
  - src/config/env.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'Input: start the deployment through its real startup path with a configuration that
    sets one pool bound to a zero, a negative or a non-integer value, for example DATABASE_POOL_STATEMENT_TIMEOUT_MS=0.
    Expected result: startup fails with the configuration error naming that bound, and no request is served.
    Repeating this for each of the three bounds closes the startup half, which the loader-level cross
    product does not reach.'
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
  under siegard-reconcile/env-pool-bounds-certify.returns/.

  Certification of constraints/the-pool-bounds-are-positive-integers did not hold: the auditor answered
  `partial` — The configuration loader''s half of the fact is covered for every pairing. The parameterised
  "$description for $field" test runs each of the three bounds (maximum connections, idle timeout, statement
  timeout) against a non-integer (''2.5''), a zero (''0''), a negative (''-5'') and a positive integer
  (''7''). For each refused value it asserts that loadEnv throws InvalidEnvironmentError and that the
  error names the field. For the admitted value it asserts that the value held is a positive integer.
  The defaults test asserts the same shape on the three values used when the environment names none. So
  if the loader stopped refusing any of the three bounds, these tests would fail. What goes unexercised
  is the part of the fact about the deployment: that a bad bound is "refused at startup instead of starting"
  and that the deployment "serves no request". Every test in the proof calls loadEnv directly with an
  environment it builds itself. None of them starts a deployment. If startup stopped calling the loader,
  or caught its error and carried on to serve requests, the fact would stop holding and every one of these
  tests would still pass. A smaller gap: the only non-numeric text tried is ''ten'', and only on the maximum-connections
  bound. For the two timeouts, non-integers are exercised only as ''2.5''.. The node is decided by reading,
  and a certification standing on it from an earlier reconciliation is released by the bind. The remainder
  is testable: Input: start the deployment through its real startup path with a configuration that sets
  one pool bound to a zero, a negative or a non-integer value, for example DATABASE_POOL_STATEMENT_TIMEOUT_MS=0.
  Expected result: startup fails with the configuration error naming that bound, and no request is served.
  Repeating this for each of the three bounds closes the startup half, which the loader-level cross product
  does not reach..

  Candidates: 0 opened across 0 of 1 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/env-pool-bounds-certify.returns/`, which are the evidence behind every entry above.
