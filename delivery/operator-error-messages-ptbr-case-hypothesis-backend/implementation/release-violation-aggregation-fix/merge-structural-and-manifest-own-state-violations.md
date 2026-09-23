---
target: backend
title: Merge structural and manifest-own-state violations on release
summary: releaseViolations now computes manifest-own-state violations on the structurally-invalid branch
  too, so a release attempt failing both kinds of rule is refused once, naming both together.
task: sha256:8976f8bcc42d7f0e81d2d87e482691457bdf4a6b30fe26a58696f653c8b28567
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/corrective-fixes-suite-6
files:
- path: src/case/release.operation.ts
  effect: releaseViolations's invalid-structural branch now also computes manifestOwnStateViolations(assembled,
    sources.hypothesisRevisions) and returns it merged with structural.problems, instead of returning
    structural.problems alone; the parsed (structurally-valid) branch is unchanged.
criteria:
- criterion: Where structuralOutcome(assembled) reports kind === 'invalid', releaseViolations also computes
    manifestOwnStateViolations(assembled, sources.hypothesisRevisions) and returns the structural problems
    merged with those violations, in place of returning the structural problems alone.
  met: true
  how: The invalid branch now returns [...structural.problems, ...(await manifestOwnStateViolations(...))].
- criterion: A release attempt against a draft that fails a structural rule and separately manifests an
    entry referencing a still-draft hypothesis-revision is refused once, through one CaseVersionNotReleasableError
    naming both the structural violation and the manifest-own-state violation together.
  met: true
  how: release() still throws once with whatever the merged array holds.
- criterion: 'Where structuralOutcome(assembled) reports kind === ''valid'', release behaves exactly as
    before this task: coherence violations and manifest-own-state violations are computed and merged as
    they already were.'
  met: true
  how: The file's 'parsed' branch return statement was not touched by the edit.
- criterion: No other behavior of release() or releaseViolations() changes.
  met: true
  how: The edit is confined to the one return statement of the invalid branch.
- criterion: The suite under src/src/__tests__ passes, with a new test proving the merged-violations behavior
    added, and — since one pre-existing integration test's fixture incidentally used still-draft hypothesis-revisions
    while asserting only structural violations, and this fix now correctly also names the manifest-own-state
    violation those draft revisions trigger — that fixture updated to use already-released hypothesis-revisions
    instead, isolating the test to its original structural-only intent, and no other change to any test
    file.
  met: true
  how: Confirmed by the captured run at run/corrective-fixes-suite-6; the proof step's new unit test plus
    the necessary fixture fix in the pre-existing integration test are the only test-file changes.
nodes:
- node: contracts/knowledge/case-lifecycle
  encoded_at:
  - src/case/release.operation.ts
  how: The contract requires every violated rule refused together, never partially; the merged return
    on the invalid branch honors that.
- node: rules/knowledge/a-release-refusal-with-no-named-violation-says-so
  encoded_at:
  - src/case/release.operation.ts
  how: The aggregation mechanism the rule presupposes now stops silently dropping one of two possible
    violation kinds.
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  encoded_at:
  - src/case/release.operation.ts
  how: The release-path clause is what manifestOwnStateViolations computes, and the fix makes it run on
    the invalid branch instead of being skipped.
preserved:
- 'The ''parsed'' (structurally-valid) branch''s return statement: coherence violations merged with manifest-own-state
  violations, exactly as before.'
- ReleaseOperation.release()'s single call to releaseViolations and single throw of CaseVersionNotReleasableError.
- heldAssembledVersion, refuseNonDraft, structuralOutcome, assembledAsDocument and manifestOwnStateViolations,
  none of which this edit touched.
- Every import and the RELEASED_STATE constant, unchanged.
---

## What it is

See files and criteria above.

## Notes
