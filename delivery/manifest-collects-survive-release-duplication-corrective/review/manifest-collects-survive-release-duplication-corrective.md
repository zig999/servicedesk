---
title: Review of manifest-collects-survive-release-duplication-corrective
summary: 'Four passes over the one file task/manifest-collects-survive-release-duplication-corrective/route-through-the-declared-lifecycle-operation delivered: coverage of its two criteria, per-file specification conformance folded into siegard-reconcile/manifest-collects-survive-release-duplication-corrective.md, the backend standard''s reading rules, and the whole-suite run, which passed clean.'
reviewed:
- src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
tasks:
- task/manifest-collects-survive-release-duplication-corrective/route-through-the-declared-lifecycle-operation
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run passed whole (152 files, 1883 tests); there was no failure to diagnose
coverage:
- criterion: releaseRevisionDirectly's own implementation calls the case lifecycle's releaseHypothesisRevision(slug, hypothesisName, revision) — the operation that reads the revision's own state and refuses a non-draft release with HypothesisRevisionNotDraftAtReleaseError before writing — never a hand-written UPDATE statement against hypothesis_revisions, and never the persistence layer's own unguarded write method called directly.
  state: covered
  tests:
  - file: src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
    name: refuses releaseRevisionDirectly's own second call against a hypothesis-revision it already released, with HypothesisRevisionNotDraftAtReleaseError, rather than silently rewriting its already-released state
  - file: src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
    name: reads back each of two released hypothesis-revisions' own collects exactly as given, never empty, even after an ordinary DELETE against those exact rows is attempted
  - file: src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
    name: releases a new draft that inherits an earlier released version's own manifest without refusing through the structural "collects no concept" problem, even though an ordinary DELETE against the inherited revision's own collects row was already attempted
  why: 'The second-call test binds the criterion behaviorally rather than by asserting an internal call: it releases a revision, calls the helper again against the same revision, and asserts the rejection is an instance of HypothesisRevisionNotDraftAtReleaseError. Both routes the criterion forbids would fail it — a hand-written UPDATE against hypothesis_revisions and the persistence layer''s unguarded write method each rewrite the row without reading its state, so the second call would resolve and `refusal` would be undefined at the toBeInstanceOf assertion. The first two tests exercise the helper''s success path, on which the release the criterion''s operation must leave acceptable depends. Two parts of the criterion''s wording remain unexercised: nothing reads the revision back after the refusal, so the guard refusing *before writing* is not distinguished from one that writes and then throws; and nothing pins the callee to that named operation and signature, so any differently-named guarded
    write raising the same error would satisfy the set.'
- criterion: Running this file's own full test suite continues to pass with every existing assertion unchanged.
  state: unauditable
  why: This criterion states a fact about a run and about a diff, neither of which any test can assert. No test in the set — and none a test could be written to be — establishes that its own suite passed; that is what a recorded run of the suite shows. Likewise 'every existing assertion unchanged' is a property of the file's history against its prior revision, decidable only by comparing the two texts, not by executing either. The set is therefore the wrong instrument for this criterion, which is a fact about the criterion rather than a gap in the tests; whether the suite passed must be read from the task's run record.
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
reconciliation: siegard-reconcile/manifest-collects-survive-release-duplication-corrective.md
findings:
- pass: standard
  file: src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
  where: lines 32, 43-53 — `FOREIGN_KEY_VIOLATION`, `isForeignKeyViolation`, `deleteTolerantly`
  evidence: "const FOREIGN_KEY_VIOLATION = '23503';\n...\nfunction isForeignKeyViolation(error: unknown): boolean {\n  return error instanceof Error && 'code' in error && error.code === FOREIGN_KEY_VIOLATION;\n}\n\nasync function deleteTolerantly(text: string, params: readonly unknown[]): Promise<void> {\n  try {\n    await pool.query(text, params);\n  } catch (error) {\n    if (!isForeignKeyViolation(error)) throw error;\n  }\n}\n"
  cost: The identical constant and two functions are already defined, byte-for-byte, in at least src/__tests__/integration/case/release.operation.spec.ts (and recur across roughly 23 spec files this project holds). A change to the Postgres foreign-key SQLSTATE this suite tolerates, or to what "tolerantly" means, has to be hand-applied to every copy; a reader auditing this file has no way to tell whether it is still in step with the others, and one left behind fails silently on the next FK code change.
  correction: Extract FOREIGN_KEY_VIOLATION, isForeignKeyViolation and deleteTolerantly into one shared test-support module under src/__tests__ and import it here instead of redefining it.
  cites: MNT-03
- pass: standard
  file: src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
  where: lines 115-156 — createDraftVersion, placeNewHypothesis, wireRelease, wireLifecycle
  evidence: "async function createDraftVersion(store: RelationalCaseStore, description: IDraftDescription): Promise<number> {\n  return store.createDraft({\n    slug: description.slug,\n    title: 'A case',\n    when_to_use: 'when a curator asks whether a collects row survives an attempted deletion',\n    authored_at: '2024-01-01T00:00:00.000Z',\n    subject: description.subjectType,\n    fallback: description.resolution,\n  });\n}\n...\nfunction wireRelease(store: RelationalCaseStore): ReleaseOperation {\n  return new ReleaseOperation(store, createGlossaryQuery(pool), createCapabilityQuery(pool));\n}\n\nfunction wireLifecycle(): CaseLifecycleOperations {\n  return createCaseLifecycle(pool);\n}\n"
  cost: The same wiring already exists — createDraftVersion, placeNewHypothesis and wireRelease in release.operation.spec.ts, wireLifecycle in revise-hypothesis.operation.spec.ts — reproduced here with only cosmetic differences (a fixed title, a hardcoded criterion string) rather than called. If ReleaseOperation's or RelationalCaseStore's construction gains a new required collaborator, every copy across these case-suite files has to be edited by hand, and a copy missed compiles against a stale shape until someone notices it drifted.
  correction: Factor these constructors into one shared case-suite test-fixture module the "case" spec files import, rather than redeclaring them per file.
  cites: MNT-03
---

## What it is
The review record of the one task the manifest-collects-survive-release-duplication-corrective initiative delivered, computed over its one file.

## Notes
The captured run (run/manifest-collects-survive-release-duplication-corrective-2) passed whole — 152 files, 1883 tests — so the failures pass did not run; there was no failure to diagnose. This capture used --pool=forks --poolOptions.forks.singleFork=true, a deliberate memory-reduction departure from the registry's own npm test command, to avoid the harness's repeated memory-guard kills under the default pool.
All three findings sit in code this task did not introduce — the duplicated FK-tolerance helper and case-fixture wiring, and the shared wiring functions, already existed in this shape across sibling case-suite spec files before this task's own change (rewriting releaseRevisionDirectly to call the guarded lifecycle operation).
