---
title: 'Review: judgment-failure evaluations carry their own call record'
summary: Coverage, specification conformance, standard conformance and failure diagnosis over carry-the-call-record-through's
  delivered change against the current main tree.
reviewed:
- src/investigation/judgment-stage.ts
- src/persistence/relational-investigation-store.repository.ts
- migrations/0017-evaluation-call-record.sql
- src/__tests__/unit/investigation/judgment-stage.spec.ts
- src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
- src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
- src/__tests__/integration/persistence/schema-migrations.spec.ts
tasks:
- task/evaluation-call-record-lost-on-judgment-failure/carry-the-call-record-through
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/evaluation-call-record-lost-on-judgment-failure-review-suite) passed
    every step (install, typecheck, lint, secret-scan, test); there was no failure to diagnose
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
coverage:
- criterion: judgmentFailureEvaluation folds the last judgment call actually made for that hypothesis
    into the returned Evaluation's usage, elapsed_ms and prompt -- the retryOrFail retry outcome where
    a retry ran, the runIsolatedCall first outcome where the remaining deadline admitted no retry -- the
    same way asEvaluation already does for confirmed, refuted and evaluator-returned inconclusive outcomes.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: attaches the retry's own usage, elapsed_ms and prompt — never the discarded first call's, and
      never a usage summed across both attempts — onto a judgment-failure evaluation when the retry also
      fails citation validation
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: attaches the usage, elapsed_ms and prompt a first call's own decided, structurally valid answer
      returned, onto the resulting Evaluation
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: attaches the usage, elapsed_ms and prompt a first call's own inconclusive answer returned, passed
      through unchanged
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: attaches the retry's own usage, elapsed_ms and prompt — never the discarded first call's — onto
      the decided answer the retry accepted
  why: 'The criterion names two folding branches. Only the retryOrFail branch is exercised: every judgment-failure
    test in the set runs with a deadline that admits the retry, so the retry''s own record is what gets
    folded. Nothing in the set drives a first call that returns a structurally invalid answer under a
    remaining deadline too short to admit a retry, so the runIsolatedCall first-outcome branch is never
    entered. The proof record''s own `untested` section names this same gap and explains why it could
    not be constructed through the public API.'
- criterion: Where a retry ran and also failed, the returned Evaluation carries the retry's own usage,
    elapsed_ms and prompt, never the superseded first call's, and never a usage summed across both attempts.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: attaches the retry's own usage, elapsed_ms and prompt — never the discarded first call's, and
      never a usage summed across both attempts — onto a judgment-failure evaluation when the retry also
      fails citation validation
- criterion: A no-data evaluation (no evaluator call ever made) still carries no usage, elapsed_ms or
    prompt, unchanged by this fix.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: a no-data evaluation carries no usage, elapsed_ms or prompt key at all — judgment was never
      called for it
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: records inconclusive no-data citing every non-ok evidence item, and never enters the pool for
      that hypothesis
- criterion: The investigation_evaluations table carries nullable columns for usage (input_tokens and
    output_tokens), elapsed_ms and prompt.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: holds every domain column NOT NULL except exactly the twelve columns the model declares optional
- criterion: evaluationStatement's INSERT populates those columns from the Evaluation being written, present
    exactly when the Evaluation itself carries them and absent otherwise.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: sends a judgment-failure evaluation's own usage, elapsed_ms and prompt as the evaluation insert's
      own additional params, present exactly when the evaluation carries them
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: sends null for usage's two columns, elapsed_ms and prompt on the evaluation insert when the
      evaluation given carries none of them
- criterion: evaluationOf reconstructs usage, elapsed_ms and prompt onto the read-back Evaluation exactly
    as they were written, for every reason including judgment-failure.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: reconstructs usage, elapsed_ms and prompt onto a read-back inconclusive evaluation exactly as
      the row's own four columns hold them, for the judgment-failure reason
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: reconstructs usage, elapsed_ms and prompt onto a read-back confirmed evaluation too, not only
      onto an inconclusive one
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: omits usage entirely when only one of input_tokens or output_tokens is present on the row, never
      constructing a usage object with a missing token count
  - file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
    name: reads back a judgment-failure evaluation's own usage, elapsed_ms and prompt exactly as written,
      alongside its reason and empty citations
- criterion: A stored investigation whose evaluation carries no call record (a no-data reason) still reads
    back with none of the three fields, unchanged by this fix.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: leaves usage, elapsed_ms and prompt off a read-back no-data evaluation, unchanged by this fix,
      when the row's own four call-record columns are all null
  - file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
    name: reads back one evidence item for each concept and one evaluation for each hypothesis the investigation
      was written with
findings:
- pass: conformance
  file: src/persistence/relational-investigation-store.repository.ts
  where: raiseRootInsertFailure, and its use inside writeWholeInvestigation
  evidence: 'return (cause) => (isUniqueViolation(cause) ? new InvestigationAlreadyStoredError(id) : raiseWriteFailure(cause));'
  cost: write() rejects with InvestigationAlreadyStoredError whenever the id already has a record, rather
    than resolving the way a write that settled would; a caller that reads only this store's own write()
    outcome sees the duplicate as something to recover from, not as the already-answered request the rule
    describes, and nothing in this file makes the second attempt behave as a write that settled.
  correction: on a unique-violation of the root insert, write() should resolve without raising, the same
    as a fresh insert — the attempt found exactly the record it was sent to write.
- pass: conformance
  file: src/persistence/relational-investigation-store.repository.ts
  where: reasonOf
  evidence: if (row.reason === null) { throw raiseReadFailure(new Error(`investigation_evaluations holds
    an inconclusive verdict with no reason for hypothesis "${row.hypothesis}"`)); }
  cost: the rule that every inconclusive evaluation declares a reason is re-asserted here as an independent,
    hard-coded null check carrying its own business-worded message, rather than by reference to the node
    that states it; a later change to that rule has to be found and re-derived here separately, and until
    then the two can silently disagree about which stored rows are valid.
- pass: conformance
  file: src/persistence/relational-investigation-store.repository.ts
  where: nonEmptyCitations
  evidence: if (citations.length === 0) { throw raiseReadFailure(new Error(`investigation_evaluations
    holds a decided verdict for hypothesis "${hypothesis}" with no citations`)); }
  cost: the rule that a confirmed or refuted evaluation carries at least one citation is re-asserted here
    as an independent, hard-coded length check carrying its own business-worded message, rather than by
    reference to the node that states it; a later change to that rule has to be carried into this file
    separately, and disagreement between the two is invisible until a stored evaluation is actually read
    back.
- pass: standard
  file: src/persistence/relational-investigation-store.repository.ts
  where: ticketRefForWrite / holdsNoTicketReference
  cites: ARC-04
  evidence: "function ticketRefForWrite(ticketRef: string | undefined): string | undefined {\n  return\
    \ holdsNoTicketReference(ticketRef) ? undefined : ticketRef;\n}\n\nfunction holdsNoTicketReference(value:\
    \ string | undefined): boolean {\n  return value === undefined || value === '';\n}"
  cost: The decision that an empty ticket_ref means "no ticket reference at all" is made inside the persistence
    layer rather than by a service. Anyone else writing an investigation through a different path gets
    a different answer unless they remember to re-implement this exact check; the rule lives only where
    this one repository method happens to run it.
  correction: Have the caller (a service) normalize ticket_ref to undefined before calling write(), and
    let the repository pass through whatever the domain object already carries without re-deciding the
    empty-string case.
- pass: standard
  file: src/persistence/relational-investigation-store.repository.ts
  where: 'callRecordOf(row: IEvaluationRow)'
  cites: MNT-03
  evidence: "function callRecordOf(row: IEvaluationRow): { readonly usage?: Usage; readonly elapsed_ms?:\
    \ number; readonly prompt?: string } {\n  const record: { usage?: Usage; elapsed_ms?: number; prompt?:\
    \ string } = {};\n  if (row.input_tokens !== null && row.output_tokens !== null) {\n    record.usage\
    \ = { input_tokens: row.input_tokens, output_tokens: row.output_tokens };\n  }\n  ..."
  cost: The same three-field optional-record construction already exists as callRecordOf in src/investigation/judgment-stage.ts,
    written against EvaluationOutcome instead of IEvaluationRow. A future change to what counts as a 'call
    record' has to be made twice and kept in sync by hand, with nothing forcing the second edit.
  correction: Extract one shared helper that builds the optional { usage?, elapsed_ms?, prompt? } record
    from three already-unwrapped values, and have both judgment-stage.ts and this file adapt their own
    input shape into those three values before calling it.
- pass: standard
  file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  where: beforeAll / the 'applies every migration script' test
  cites: STK-05
  evidence: 'await client.query(`CREATE SCHEMA "${schemaName}"`);

    await client.query(`SET search_path TO "${schemaName}"`);'
  cost: schemaName and freshSchema are built with template-literal interpolation straight into the SQL
    text rather than passed as query parameters, the one place in this file set where a value is concatenated
    into SQL text rather than bound through pg's parameter list.
  correction: Where the identifier truly cannot be parameterized (CREATE SCHEMA / SET search_path take
    identifiers, not values), route it through a single validated identifier-quoting helper shared by
    the suite rather than inline template interpolation at each call site.
reconciliation: siegard-reconcile/evaluation-call-record-lost-on-judgment-failure.md
---

## What it is

Reviews carry-the-call-record-through's delivered change: judgment-stage.ts, relational-investigation-store.repository.ts and migrations/0017-evaluation-call-record.sql, plus the four test files that prove it.
Coverage, specification conformance (via trace.py --stage --review, folded into siegard-reconcile/evaluation-call-record-lost-on-judgment-failure.md), standard conformance and failure diagnosis all ran; the failures pass found nothing to diagnose since every captured step passed.

## Notes

Only the rules a reading decides were in scope: STK-02 through STK-12, ARC-01, ARC-04, COR-02, COR-03, EDG-03, EDG-05, EDG-08, SEC-04, MNT-03, TST-01 through TST-03 — 23 rules, of which 3 produced findings (ARC-04, MNT-03, STK-05).
The rules a tool decides (20 lint rules, 2 secret-scan rules, 2 typecheck rules) ran as steps of the captured run (run/evaluation-call-record-lost-on-judgment-failure-review-suite) and all exited 0.
The conformance pass's own return for the migration file, the two spec.ts unit files' most direct assertions, and the two integration test files found no domain fact stated outside the two nodes this task implements; the full per-file returns are saved verbatim under siegard-reconcile/evaluation-call-record-lost-on-judgment-failure.returns/.
Coverage found one criterion partial: the runIsolatedCall first-outcome branch of criterion 1 (no-retry-admitted deadline) could not be independently exercised, matching what the proof record's own `untested` section already disclosed.
The conformance fold cleared 35 node-file bindings and left 5 uncleared (contracts/integration/capability-registry, rules/investigation/a-decided-evaluation-cites-evidence, rules/investigation/an-inconclusive-evaluation-declares-its-reason, rules/investigation/an-investigation-is-written-once, rules/knowledge/requires-evaluation-of-names-exactly-the-manifested-hypotheses) — see siegard-reconcile/evaluation-call-record-lost-on-judgment-failure.md for the per-node judgment.
This review does not re-examine the other five live corrective initiatives' own files, or the seven files whose drift predates this batch and were already read by the prior `review-change: all 9 corrective batch tasks` review (4f885cf) — those stand on their own record.
