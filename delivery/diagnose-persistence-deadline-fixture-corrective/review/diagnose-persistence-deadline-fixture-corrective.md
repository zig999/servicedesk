---
title: Review of diagnose-persistence-deadline-fixture-corrective
summary: 'Four passes over the one file task/diagnose-persistence-deadline-fixture-corrective/route-through-the-declared-lifecycle-operation delivered: coverage of its two criteria, per-file specification conformance folded into siegard-reconcile/diagnose-persistence-deadline-fixture-corrective.md, the backend standard''s reading rules, and the whole-suite run, which passed clean.'
reviewed:
- src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
tasks:
- task/diagnose-persistence-deadline-fixture-corrective/route-through-the-declared-lifecycle-operation
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
  - file: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
    name: refuses releaseRevisionDirectly's own second call against a hypothesis-revision it already released, with HypothesisRevisionNotDraftAtReleaseError, rather than silently rewriting its already-released state
  why: 'The test binds the criterion through behavior rather than through an assertion on the call: it releases a revision through releaseRevisionDirectly, calls it a second time on the same identity, and requires the rejection to be a HypothesisRevisionNotDraftAtReleaseError. A raw UPDATE against hypothesis_revisions, or the persistence layer''s unguarded write, would write the already-released row a second time and return nothing to catch, so `refusal` would be undefined and the assertion would fail — the regression the criterion names is caught. Two residues a reader may want to route, neither of which leaves the criterion unproven. First, nothing reads the revision''s stored state back after the refusal, so the apposition''s "before writing" half — that the refused release leaves the row as it was — is unexercised; only the throwing is. Second, the file asserts an observable refusal and not which function produced it, so a hand-written UPDATE that itself read state and threw the same
    error would pass; that is the correct trade, since an assertion naming the call would bind the shape of the helper instead of its behavior.'
- criterion: Running this file's own full test suite continues to pass with every existing assertion unchanged.
  state: uncovered
  why: The criterion names a property of executing this file — that the assertions that were already there still hold, and still read as they did — and no test in the set asserts it, nor can a test in a file assert the outcome of running that file. The assertion set the criterion protects is the pre-existing deadline test, "answers a named 500 reporting InvestigationWriteDeadlineExceededError, never the assessment, and leaves no investigation readable by its id immediately afterward, when the investigation write is slowed past the persistence deadline"; that test exercises the deadline behavior, not this criterion, and its presence in the file is not evidence that it passed or that it went unedited. The "unchanged" half is a fact about the diff over this file and the "continues to pass" half a fact about a recorded run; both live outside the test set and neither is established by anything in it. Note also that the second test releases each guard fixture through the same lifecycle path the
    first test's fixture uses, so a regression in that shared seeding would surface as a failure in both — which is a coupling in the file, not coverage of this criterion.
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
reconciliation: siegard-reconcile/diagnose-persistence-deadline-fixture-corrective.md
findings:
- pass: standard
  file: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  where: createDraftAndRevision (lines 413-437), duplicating seedFixture's draft-creation-and-revision block (lines 160-177)
  evidence: "seedFixture:\n  const draft = await lifecycle.createDraft({\n    slug: fixture.slug,\n    title: 'A case for the persistence-deadline proof',\n    when_to_use: 'when proving criterion 5 of task/service-on-the-database/diagnose-end-to-end at the integration level',\n    authored_at: '2024-01-01T00:00:00.000Z',\n    subject: fixture.subjectType,\n    fallback: { outcome: fixture.outcome, referral: { action: fixture.action, recipient: fixture.recipient } },\n  });\n  const revised = await lifecycle.reviseHypothesis({\n    slug: fixture.slug,\n    hypothesis_name: 'h1',\n    criterion: fixture.hypothesisCriterion,\n    collects: [fixture.concept],\n    resolution: { outcome: fixture.outcome, referral: { action: fixture.action, recipient: fixture.recipient } },\n    subject: fixture.subjectType,\n  });\n\ncreateDraftAndRevision:\n  const draft = await lifecycle.createDraft({\n    slug: guardFixture.slug,\n    title: 'A case for the release-guard proof',\n    when_to_use: 'when proving\
    \ releaseRevisionDirectly still routes through the guarded lifecycle operation',\n    authored_at: '2024-01-01T00:00:00.000Z',\n    subject: guardFixture.subjectType,\n    fallback: { outcome: guardFixture.outcome, referral: { action: guardFixture.action, recipient: guardFixture.recipient } },\n  });\n  const revised = await lifecycle.reviseHypothesis({\n    slug: guardFixture.slug,\n    hypothesis_name: 'h1',\n    criterion: guardFixture.hypothesisCriterion,\n    collects: [guardFixture.concept],\n    resolution: { outcome: guardFixture.outcome, referral: { action: guardFixture.action, recipient: guardFixture.recipient } },\n    subject: guardFixture.subjectType,\n  });\n"
  cost: 'The same draft-creation-and-revision wiring is written twice in this one file instead of the second call site calling the first. If CaseLifecycleOperations.createDraft or reviseHypothesis changes shape, or the fixed field mapping (hypothesis_name: ''h1'', the fallback/resolution shape) needs to change, a fix applied to seedFixture has no reason to also reach createDraftAndRevision, so the release-guard test can keep compiling and passing against a wiring that has quietly drifted from the one the persistence-deadline test exercises.'
  correction: Factor the shared block into one helper (e.g. parameterized by fixture, title and when_to_use) and have both seedFixture and createDraftAndRevision call it.
  cites: MNT-03
---

## What it is
The review record of the one task the diagnose-persistence-deadline-fixture-corrective initiative delivered, computed over its one file.

## Notes
The captured run (run/diagnose-persistence-deadline-fixture-corrective-2) passed whole — 152 files, 1883 tests — so the failures pass did not run; there was no failure to diagnose. This capture used --pool=forks --poolOptions.forks.singleFork=true, a deliberate memory-reduction departure from the registry's own npm test command, to avoid the harness's repeated memory-guard kills under the default pool.
The one finding (MNT-03, duplicated fixture-wiring block) sits in code this task did not introduce beyond adding one more call site of the same pre-existing pattern.
