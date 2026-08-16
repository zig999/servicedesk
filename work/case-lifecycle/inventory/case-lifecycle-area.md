---
title: Case module, its relational persistence and the diagnose gate point
summary: Where the draft/released split lands — the single Case/Hypothesis aggregate, its relational store, the two authoring/reading services built on it, and the diagnose entry point that will need the new released-only gate.
area:
- src/src/case
- src/src/persistence
- src/src/investigation
- src/src/http
- src/src/factories
- src/src/errors
- src/migrations
modules:
- name: case-domain
  path: src/src/case/case.ts
  role: touched
- name: case-store-port
  path: src/src/case/case-store.port.ts
  role: touched
- name: case-query
  path: src/src/case/case-query.service.ts
  role: touched
- name: author-case-version
  path: src/src/case/author-case-version.service.ts
  role: touched
- name: parse-case-document
  path: src/src/case/parse-case-document.ts
  role: touched
- name: validate-case-coherence
  path: src/src/case/validate-case-coherence.ts
  role: touched
- name: case-resolution
  path: src/src/case/case-resolution.ts
  role: touched
- name: relational-case-store
  path: src/src/persistence/relational-case-store.repository.ts
  role: touched
- name: database-access
  path: src/src/persistence/database-access.ts
  role: depends-on
- name: run-diagnosis
  path: src/src/investigation/run-diagnosis.ts
  role: touched
- name: diagnose-controller
  path: src/src/http/diagnose.controller.ts
  role: touched
- name: diagnose-factory
  path: src/src/factories/diagnose.factory.ts
  role: touched
- name: case-store-factory
  path: src/src/factories/case-store.factory.ts
  role: touched
- name: case-query-factory
  path: src/src/factories/case-query.factory.ts
  role: touched
- name: author-case-version-factory
  path: src/src/factories/author-case-version.factory.ts
  role: touched
- name: case-errors
  path: src/src/errors
  role: touched
- name: investigation-aggregate
  path: src/src/investigation/investigation.ts
  role: depends-on
- name: glossary-and-capability-queries
  path: src/src/glossary
  role: depends-on
conventions:
- statement: A relational store adapter never opens 'pg' itself — it reaches the pool only through DatabaseConnection and the runStatement/queryOneOrAbsent/runInTransaction helpers database-access.ts exports.
  seen_at: src/src/persistence/relational-case-store.repository.ts
- statement: Every statement is schema-qualified as public.<table>, because a transaction-pooling endpoint can hand back a connection carrying another session's search_path.
  seen_at: src/src/persistence/relational-case-store.repository.ts
- statement: Write-once is decided by a table's own primary key over (slug, version), never by a read-before-write check; a unique-violation (code 23505) is mapped to the module's own typed error rather than left generic.
  seen_at: src/src/persistence/relational-case-store.repository.ts
- statement: A typed business error carries a readonly `context` object naming the identifying values, a message built from them, and `this.name` set to the class name.
  seen_at: src/src/errors/case-not-found.error.ts
- statement: A migration never edits an already-applied script; a correction is always a new script numbered next in src/migrations/.
  seen_at: src/migrations/0006-case-version-immutability.sql
- statement: An invariant that a declarative constraint can express is written as a CHECK/UNIQUE/PRIMARY KEY or a rule attached to the table, not as application-level enforcement alone.
  seen_at: src/migrations/0006-case-version-immutability.sql
- statement: A store's own document-to-domain mapping trusts the row shape (documentAsCase/documentAsCase-style casts) rather than re-running parse-case-document.ts's structural guard, since validation runs at read time in the query service, not at the store.
  seen_at: src/src/persistence/relational-case-store.repository.ts
- statement: A composition root (a *.factory.ts file) constructs nothing on its own behalf beyond wiring already-built leaf factories from one shared DatabaseConnection; it never opens a data directory or a second connection.
  seen_at: src/src/factories/case-query.factory.ts
- statement: Hypotheses are read back in declared-position order directly from SQL (ORDER BY position), never re-sorted in application code after the fact.
  seen_at: src/src/persistence/relational-case-store.repository.ts
- statement: A pinned reference to another aggregate is materialized as a small nested object carrying exactly the identifying fields (e.g. PinnedCase { slug, version }), by the same field names the referenced aggregate itself declares them.
  seen_at: src/src/investigation/investigation.ts
- statement: validation-runs-at-every-read is enforced by having read-case (CaseQueryService) always re-run structural parsing and coherence checking, with a separate, explicitly-exempted replay-case path for pinned reproduction.
  seen_at: src/src/case/case-query.service.ts
must_not_duplicate:
- what: The runStatement/queryOneOrAbsent/runInTransaction helpers and the unique-violation-to-typed-error mapping convention (isUniqueViolation, UNIQUE_VIOLATION_CODE) for turning a duplicate-key insert into a typed refusal
  at: src/src/persistence/database-access.ts and src/src/persistence/relational-case-store.repository.ts
- what: The structural parse (parseCaseDocument) and coherence check (caseCoherenceViolations/validateCaseCoherence), both already generic over any assembled Case — new lifecycle operations that build/validate a Case from a manifest must call these, never re-implement totality or glossary/capability checks
  at: src/src/case/parse-case-document.ts and src/src/case/validate-case-coherence.ts
- what: collectionPlan/requiresEvaluationOf/resolveOutcome, the precedence-by-position domain logic the diagnosis engine already consumes unchanged
  at: src/src/case/case-resolution.ts
- what: The per-context factory composition convention (one createX(connection) function per port, composing already-built leaf factories) that case-store.factory.ts, case-query.factory.ts and author-case-version.factory.ts already establish
  at: src/src/factories
- what: The CaseNotFoundError/CaseNotValidError/CaseVersionAlreadyStoredError typed-error shape and construction convention (context object, message, this.name)
  at: src/src/errors/case-not-found.error.ts, src/src/errors/case-not-valid.error.ts, src/src/errors/case-version-already-stored.error.ts
- what: The migration numbering sequence already in place (0001 through 0008) — the new schema lands as the next-numbered script, never edits 0004 or 0006 in place
  at: src/migrations
risks:
- risk: Case and Hypothesis today are a single flat type (case.ts's Case/Hypothesis) that CaseQueryService, AuthorCaseVersionService, parseCaseDocument, validateCaseCoherence, case-resolution.ts and RelationalCaseStore all import and shape their own logic around; splitting Hypothesis into identity plus revision changes the shape every one of these consumes.
  consumers:
  - src/src/case/case-query.service.ts
  - src/src/case/author-case-version.service.ts
  - src/src/case/parse-case-document.ts
  - src/src/case/validate-case-coherence.ts
  - src/src/case/case-resolution.ts
  - src/src/persistence/relational-case-store.repository.ts
- risk: run-diagnosis.ts and diagnose.controller.ts consume the assembled Case exactly as case.ts declares it today (options.case, evidenceByHypothesisOf keyed by hypothesis.name/collects) with no concept of state/manifest; a new gate and a differently-assembled Case must still hand them this same public shape unchanged.
  consumers:
  - src/src/investigation/run-diagnosis.ts
  - src/src/http/diagnose.controller.ts
- risk: The one public command AuthorCaseVersionService/IAuthorCaseVersion is replaced by six new operations; author-case-version.factory.ts and any caller still wired to createAuthorCaseVersion breaks unless the plan retires or repoints that wiring.
  consumers:
  - src/src/factories/author-case-version.factory.ts
  - src/src/case/author-case-version.port.ts
- risk: RelationalCaseStore's writeVersion/readVersion assume the current hypotheses/hypothesis_collects tables (0004-case-and-hypothesis.sql) and computes a contentHash no longer meaningful once content moves to hypothesis_revisions plus a manifest; every caller of ICaseStore observes whatever shape this adapter is rebuilt to answer.
  consumers:
  - src/src/case/case-query.service.ts
  - src/src/case/author-case-version.service.ts
- risk: case_versions_no_update (0006-case-version-immutability.sql) blocks any UPDATE against case_versions rows, including the state/released_at transition release() and discard() need to perform — a plain UPDATE statement against case_versions will silently no-op under that rule.
  consumers:
  - src/src/persistence/relational-case-store.repository.ts
sources:
- work/case-lifecycle/intake/scope.md
---

## What it is

The area is the knowledge context's case module plus its relational adapter, the diagnose entry point, and the factories/errors wiring them together — exactly where the scope's draft/released split, the five-element schema, the six lifecycle operations and the new diagnosis gate all land.
Today's Case/Hypothesis is one flat aggregate stored through a single ICaseStore port with one relational adapter and one authoring command; the split touches every module built on that shape.

## Notes

The existing case_versions_no_update rule (migration 0006) refuses any UPDATE against case_versions — the scope's release()/discard() state transitions must account for this constraint, whether by a migration change or by writing state transitions a different way; this is not resolved by this survey.
The area holds no draft/released concept, no hypothesis-identity/revision split and no manifest anywhere yet — the split is genuinely new construction, not a refactor of an existing partial implementation.
None.
