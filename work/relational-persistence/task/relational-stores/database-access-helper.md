---
title: The one way an adapter runs a statement
summary: The shared access helper that answers absence as data, raises the caller's typed error, and gives an adapter a transaction that commits or rolls back whole.
rationale: The inventory states a database adapter needs an equivalent of the file helper's absence-is-data and typed-error shape exactly once; cutting it as a task ahead of the four adapters is the planning's, so the four share one decision rather than each making it.
sources:
  - intake/scope.md
depends_on:
  - task/relational-substrate/database-connection
objective: An adapter runs statements, opens transactions and raises failures through one shared helper.
criteria:
  - A statement run through the helper that matches no row answers with absence as data rather than raising.
  - A driver failure reaching the helper arrives at its caller as that caller's own typed store error, carrying a message, a context object and the driver failure as its cause.
  - A unit of work run through the helper commits as a whole.
  - A unit of work in which one statement fails leaves none of its earlier statements applied.
implements:
  - constraints/a-case-is-read-whole
---

## What it is

The single seam between the four adapters and the driver.
It carries over the two decisions the file helper made — that an absent record is data and that only a real failure raises — and adds the transaction boundary a relation needs and a file did not.

## Notes

The inventory names src/src/persistence/json-file.ts as what this is the equivalent of, and reports it is Node-fs-specific throughout and has no role here.
The typed store errors this helper raises through already exist per module under src/src/errors.
UNDERDETERMINED, from the specification — constraints/a-case-is-read-whole demands a transaction over a case's root, hypotheses, resolutions and referrals, and no criterion above holds the helper's transaction to serving reads; a helper whose transaction facility accepts write statements only, with reads served on a separate non-transactional path, would pass criteria 3 and 4 as written while leaving the constraint's guarantee undeliverable.
UNDERDETERMINED, from the specification — the objective's "one shared helper" is not held by any criterion to being the adapters' only path to the store; a helper that satisfies every criterion while one adapter opens its own connection beside it would still pass, and constraints/the-system-persists-to-one-relational-database, which would refuse that, is outside this task's implements.
ADVISORY, from the specification — only constraints/a-case-is-read-whole governs; the eleven other candidates the epic once carried state case identity and versioning, investigation write-once semantics, capability registry semantics and published synchronous reads, each an adapter's or the domain's to demonstrate and none reached by a criterion here.
ADVISORY, from the specification — criteria 1 and 2 rest on no candidate stating any store-error taxonomy or absence semantics; read as source arrangement their authority is the project's own standard, and the task is governed by the specification only in its transaction half.
