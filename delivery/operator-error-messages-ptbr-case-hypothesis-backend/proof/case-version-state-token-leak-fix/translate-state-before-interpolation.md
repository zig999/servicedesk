---
target: backend
title: Proof for translating the case-version lifecycle state before interpolation
summary: Tests proving CaseVersionNotDraftError, CaseVersionNotDraftAtReleaseError and CaseVersionNotReleasedError
  name the case-version state as "rascunho"/"liberada" and never the raw lifecycle token, for both declared
  states.
implementation: sha256:f92c9bff008a7fa0e9955b191cee42b4d3eda12ee775798fb5558322f675dcd1
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
tests:
- file: __tests__/unit/errors/case-version-not-draft.error.spec.ts
  name: names the case slug, the version number and the state the version is in instead of draft, in Brazilian
    Portuguese
  proves: CaseVersionNotDraftError's message names the released state as "liberada" when constructed with
    the released state, and the draft state as "rascunho" when constructed with the draft state — never
    the raw token 'draft' or 'released'. (released-state half)
  fails_when: CaseVersionNotDraftError constructed with the released state stops producing a message containing
    "liberada".
- file: __tests__/unit/errors/case-version-not-draft-at-release.error.spec.ts
  name: names the case slug, the version number and the state the version is in, and states, in Brazilian
    Portuguese, that release only ever moves a version out of draft
  proves: CaseVersionNotDraftAtReleaseError's message names the state the same way, for both states. (released-state
    half)
  fails_when: CaseVersionNotDraftAtReleaseError constructed with the released state stops producing a
    message containing "liberada".
- file: __tests__/unit/errors/case-version-not-released.error.spec.ts
  name: names the case slug, the version number and the state the version is in, and states, in Brazilian
    Portuguese, that diagnosis runs only against a released version
  proves: CaseVersionNotReleasedError's message names the state the same way, for both states. (draft-state
    half)
  fails_when: CaseVersionNotReleasedError constructed with the draft state stops producing a message containing
    "rascunho".
- file: __tests__/unit/errors/case-version-not-draft.error.spec.ts
  name: never leaks the raw lifecycle token into its message, for either state
  proves: The "never the raw token" half of CaseVersionNotDraftError's state-naming criterion, covering
    the draft-state boundary the Brazilian-Portuguese test does not exercise.
  fails_when: CaseVersionNotDraftError's message contains the literal substring "draft" when constructed
    with the draft state, or "released" when constructed with the released state.
- file: __tests__/unit/errors/case-version-not-draft-at-release.error.spec.ts
  name: never leaks the raw lifecycle token into its message, for either state
  proves: The "never the raw token" half of CaseVersionNotDraftAtReleaseError's state-naming criterion,
    covering the draft-state boundary the Brazilian-Portuguese test does not exercise.
  fails_when: CaseVersionNotDraftAtReleaseError's message contains the literal substring "draft" when
    constructed with the draft state, or "released" when constructed with the released state.
- file: __tests__/unit/errors/case-version-not-released.error.spec.ts
  name: never leaks the raw lifecycle token into its message for the released state
  proves: The "never the raw token" half of CaseVersionNotReleasedError's state-naming criterion, covering
    the released-state boundary.
  fails_when: CaseVersionNotReleasedError's message contains the literal substring "released" when constructed
    with the released state.
- file: __tests__/unit/errors/case-version-not-draft.error.spec.ts
  name: names the case and its version before it states the state that refuses the act
  proves: The pre-existing ordering fact (case named before the state) still holds once the state is translated;
    fixed as a necessary caller-made collateral change, since this test's fixture state value ('a-distinctive-state-value-this-test-recognizes')
    no longer appears verbatim in a message that now translates the state, and the suite failed without
    this fix.
  fails_when: The case slug stops appearing before the translated state word "rascunho" in the message.
- file: __tests__/unit/errors/case-version-not-draft-at-release.error.spec.ts
  name: names the case and its version before it states the state that refuses the act
  proves: The same ordering fact for CaseVersionNotDraftAtReleaseError, fixed the same necessary way.
  fails_when: The case slug stops appearing before the translated state word "rascunho" in the message.
- file: __tests__/unit/errors/case-version-not-released.error.spec.ts
  name: names the case and its version before it states the state that refuses the act
  proves: The same ordering fact for CaseVersionNotReleasedError, fixed the same necessary way.
  fails_when: The case slug stops appearing before the translated state word "rascunho" in the message.
not_applicable:
- edge_case: Two error instances constructed concurrently.
  why: Construction is a pure, synchronous operation with no shared state; no criterion states concurrent
    behavior.
- edge_case: An empty-string slug or a non-positive version number.
  why: No criterion of this task governs slug or version validation; those values are carried through
    unchanged per the implementation record's preserved list.
untested:
- constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word's fact spans all nine
  fixed words across every domain refusal; this task's own Notes state the other seven words and every
  other class reach no criterion here, so this proof exercises only the two state words in these three
  classes.
- constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese's fact is system-wide; the
  implementation record notes this node is honored, not newly encoded, by this fix, and this proof reaches
  only the three classes this task touches.
- rules/knowledge/a-case-version-moves-through-its-declared-lifecycle's transition-enforcement clauses
  reach no criterion of this task per its own Notes; this proof exercises only the refusal-message sub-clause.
- rules/investigation/only-a-released-case-version-is-diagnosed's pinning/reading clauses reach no criterion
  of this task per its own Notes; this proof exercises only the refusal-message clause.
- The implementation's recorded inference (any non-'draft' value is treated as released) is not pinned
  by any test, since CaseVersionState admits only 'draft' | 'released' and no test constructs a third
  value.
run: run/corrective-fixes-suite-6
---

## What it is

See tests above.

## Notes
