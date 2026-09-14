---
target: backend
title: Pool settings declared in the environment schema — proof
summary: Four tests added to the existing env.spec.ts prove the six stated criteria and decide constraints/the-pool-bounds-are-positive-integers
  whole; the pooling clause and the specific default figures are left unproven and named as such.
implementation: sha256:48c5eb0d7e5b90ca4c446995167248a4306d9bbcaa5685a7d0723e7267417f92
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/database-pool-configuration-pool-settings-in-env-schema-suite
tests:
- file: src/__tests__/unit/config/env.spec.ts
  name: yields a defaulted value for each of the three pool variables when the existing required-variable
    fixture names none of them
  proves: Criterion 'Loading the environment with none of the three variables set succeeds and yields
    a value for each from the schema's own default', and criterion 'The existing environment fixture that
    enumerates required variables still loads without naming any of the three' — both are the same observable
    fact, proved by the same call, since the fixture reused here is the literal, unmodified validEnvSource()
    already in this file, which sets none of the three.
  fails_when: loadEnv throws when called with the existing fixture (the three made required rather than
    defaulted), or any of the three fields comes back undefined or NaN instead of a finite defaulted number.
- file: src/__tests__/unit/config/env.spec.ts
  name: parses a configured value for each of the three pool variables as a number, distinct from their
    defaults
  proves: Criterion 'Loading the environment with each of the three variables set yields those values
    as numbers.'
  fails_when: any of the three configured values (25, 5000, 45000 — each chosen distinct from its own
    default so the assertion cannot pass by falling back to it) is not returned as the equal number, e.g.
    it stays a string, is dropped in favor of the default, or is coerced to a different value.
- file: src/__tests__/unit/config/env.spec.ts
  name: throws InvalidEnvironmentError naming the field when a pool variable is set to a non-numeric value
  proves: Criterion 'A non-numeric value for any of the three is refused with the invalid-environment
    error the schema already raises.'
  fails_when: loadEnv does not throw for a non-numeric value on one of the three, throws something other
    than InvalidEnvironmentError, or the thrown error's issues do not name the offending field.
- file: src/__tests__/unit/config/env.spec.ts
  name: '$description for $field (table-driven over: refuses a non-integer value / refuses a zero value
    / refuses a negative value / admits a positive integer value)'
  proves: Criterion 'A zero or negative value for any of the three is refused with the invalid-environment
    error' (the zero and negative rows), and the task's UNDERDETERMINED entry — that an implementation
    coercing to a number with only a positive-value check, and no integer check, would admit a fractional
    value like 2.5 while the specification refuses it — is refused directly by the non-integer row (value
    '2.5').
  fails_when: any row's outcome reverses — a non-integer, zero, or negative configured value is admitted
    instead of raising InvalidEnvironmentError naming the field, or the positive-integer row's valid value
    is rejected, or is accepted but held as something other than a positive integer.
  demonstrates: constraints/the-pool-bounds-are-positive-integers
not_applicable:
- edge_case: An empty-string or whitespace-only value for a pool variable
  why: Number('') and Number(' ') both evaluate to 0 in JavaScript, so this input coerces into exactly
    the zero value the zero-refusal row already exercises; it raises no behavior a black-box test could
    distinguish from that row.
- edge_case: A value at or beyond an upper bound for any of the three pool variables
  why: Neither the task's criteria nor either node it implements names an upper bound for any of the three;
    only the lower boundary (positive) is stated, and that boundary is tested.
- edge_case: A dependency (the database, the pool driver) failing, being unavailable, or answering slowly
    while the three variables are read
  why: loadEnv performs no I/O — it validates process.env synchronously and constructs no Pool — so no
    dependency is reached by anything this task's criteria or nodes cover.
- edge_case: Concurrent or repeated calls loading the environment
  why: loadEnv is a pure, synchronous parse with no shared mutable state; no criterion or node states
    behavior that varies with concurrency or repetition.
untested:
- 'Criterion ''Every default is stated in the schema declaration itself rather than at a reading site''
  names where in source a default lives, not an observable behavior: an implementation that instead supplied
  the same fallback at a reading site would pass every test above identically, so no black-box test distinguishes
  the two arrangements. This is decided by reading the schema declaration, not by a test.'
- The implementation's own inference of the three default figures — 10 max connections, 10_000 ms idle
  timeout, 30_000 ms statement timeout — is a behavior no criterion or node names; the task's own ADVISORY
  note states the figures are an unguided implementation choice. The defaults test above checks only that
  a finite defaulted number is present, deliberately not which one.
- constraints/the-connection-pool-is-bounded-by-configuration — its statement and its fitness both require
  a connection pool actually opened under the three bounds, with none left to the driver's own implicit
  value. This task only declares the configuration surface in the env schema and constructs no Pool; the
  implementation record's own REMAINDER note assigns the pooling clause to the sibling task under this
  epic.
---
## What it is
Four tests over the environment schema's three new pool variables.

## Notes
None.
