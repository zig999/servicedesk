---
target: backend
title: Proof for merging structural and manifest-own-state violations on release
summary: One new unit test proves that a release attempt failing both a structural rule and the manifest-own-state
  rule is refused once, through one CaseVersionNotReleasableError naming both violations together, rather
  than the structural one alone.
implementation: sha256:66167b98e1d779875ec024de90a2a21af5242f6d27f3d8fb58f7bf5a7d25335b
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
tests:
- file: __tests__/unit/case/release.operation.spec.ts
  name: names the structural violation and the manifest-own-state violation together, refusing once, when
    a release attempt fails a structural rule and separately manifests a still-draft hypothesis-revision
  proves: A release attempt against a draft that fails a structural rule and separately manifests an entry
    referencing a still-draft hypothesis-revision is refused once, through one CaseVersionNotReleasableError
    naming both the structural violation and the manifest-own-state violation together.
  fails_when: releaseViolations goes back to returning structural.problems alone on the invalid branch
    (or otherwise drops either kind), so context.violations stops holding both violations together.
- file: __tests__/integration/case/release.operation.spec.ts
  name: refuses releasing a draft whose manifest holds two hypothesis-revisions collecting no concept
    at all, naming both structural violations together, leaving the version in draft state with no release
    recorded
  proves: The pre-existing structural-only aggregation fact this test names still holds in isolation once
    this fix also computes manifest-own-state violations; fixed as a necessary caller-made collateral
    change — this fixture incidentally left its two hypothesis-revisions in draft state, which this fix
    now correctly also names as violations, so the fixture was changed to use already-released hypothesis-revisions
    (placeReleasedHypothesis instead of placeNewHypothesis) to isolate the test to its original structural-only
    intent.
  fails_when: Either structural violation stops appearing, or a manifest-own-state violation appears alongside
    them now that the fixture's hypothesis-revisions are released.
not_applicable:
- edge_case: the structurally-invalid branch when every manifest entry already references a released hypothesis-revision
  why: with zero manifest-own-state violations the merged array equals structural.problems alone, so this
    case cannot distinguish the fix from the pre-fix behavior; no criterion asks for evidence over an
    empty merge specifically.
- edge_case: non-draft version, case-not-found, and any other release() path outside releaseViolations's
    invalid branch
  why: criterion 4 states these are unchanged, and the fix touches only the invalid branch's return statement.
- edge_case: two concurrent release attempts against the same case version
  why: no node this task implements and no criterion states concurrent behavior.
untested:
- contracts/knowledge/case-lifecycle's fact spans the whole published case-lifecycle API; no finite test
  decides it whole, and this proof exercises only the one sentence the implementation record ties to this
  node.
- rules/knowledge/a-release-refusal-with-no-named-violation-says-so's message-content clauses reach no
  criterion of this task per its own Notes; only the aggregation mechanism is exercised.
- rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions' place-hypothesis
  clause reaches no criterion of this task per its own Notes; only the release-path clause is exercised.
- Criterion 5's suite-passes half was not verified by the test-author (no shell available to it); the
  caller runs the full suite separately and this record's `run` field carries that evidence.
run: run/corrective-fixes-suite-6
---

## What it is

See tests above.

## Notes
