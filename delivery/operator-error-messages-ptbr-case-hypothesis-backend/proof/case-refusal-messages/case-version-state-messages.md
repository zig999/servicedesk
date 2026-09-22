---
target: backend
title: PT-br message proof for the five case-version-state refusals
summary: New unit tests over the five case-version-state error classes pin each class's PT-br message
  content, fact-before-state ordering, cross-class distinguishability, unchanged name and unchanged context.
implementation: sha256:a5419e3b4c07590751ad0f6d860b8033f6e537635b44c8656ac1c35d96fca880
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/case-refusal-messages-case-version-state-messages-suite
tests:
- file: src/__tests__/unit/errors/case-already-has-draft.error.spec.ts
  name: names the case before it states the state that refuses the act
  proves: Every one of the five messages names the case ... before it states the state that refuses the
    act (CaseAlreadyHasDraftError).
  fails_when: the message names or interpolates "rascunho" at or before the position of the case slug.
- file: src/__tests__/unit/errors/case-already-has-draft.error.spec.ts
  name: names the case slug and states, in Brazilian Portuguese, that the case already holds a version
    in draft and holds at most one at a time
  proves: CaseAlreadyHasDraftError's message is in PT-br, names the case slug, and states that the case
    already holds a version in draft and holds at most one at a time.
  fails_when: the message drops the slug, drops either fact, or reintroduces an English domain noun.
- file: src/__tests__/unit/errors/case-already-has-draft.error.spec.ts
  name: keeps its class-name string unchanged
  proves: Each of the five classes' name property still holds its unchanged class-name string (CaseAlreadyHasDraftError).
  fails_when: .name is anything other than 'CaseAlreadyHasDraftError'.
- file: src/__tests__/unit/errors/case-already-has-draft.error.spec.ts
  name: holds exactly the slug it was constructed with, in its context
  proves: Each of the five classes' context property holds exactly the properties and values it held before
    (CaseAlreadyHasDraftError).
  fails_when: .context is anything other than exactly { slug }.
- file: src/__tests__/unit/errors/case-holds-no-draft.error.spec.ts
  name: names the case before it states the state that refuses the act
  proves: Every one of the five messages names the case ... before it states the state that refuses the
    act (CaseHoldsNoDraftError).
  fails_when: the message names or interpolates "rascunho" at or before the position of the case slug.
- file: src/__tests__/unit/errors/case-holds-no-draft.error.spec.ts
  name: names the case slug and states, in Brazilian Portuguese, that the case holds no version in draft
    and that a hypothesis is revised only against its case's draft
  proves: CaseHoldsNoDraftError's message is in PT-br, names the case slug, and states the no-draft and
    hypothesis-revised-only-against-draft facts.
  fails_when: the message drops the slug, drops either fact, or reintroduces an English domain noun.
- file: src/__tests__/unit/errors/case-holds-no-draft.error.spec.ts
  name: keeps its class-name string unchanged
  proves: Each of the five classes' name property still holds its unchanged class-name string (CaseHoldsNoDraftError).
  fails_when: .name is anything other than 'CaseHoldsNoDraftError'.
- file: src/__tests__/unit/errors/case-holds-no-draft.error.spec.ts
  name: holds exactly the slug it was constructed with, in its context
  proves: Each of the five classes' context property holds exactly the properties and values it held before
    (CaseHoldsNoDraftError).
  fails_when: .context is anything other than exactly { slug }.
- file: src/__tests__/unit/errors/case-version-not-draft.error.spec.ts
  name: names the case and its version before it states the state that refuses the act
  proves: Every one of the five messages names the case, and where the class receives a version number
    the version, before it states the state (CaseVersionNotDraftError).
  fails_when: the interpolated state value appears at or before the position of the case slug.
- file: src/__tests__/unit/errors/case-version-not-draft.error.spec.ts
  name: names the case slug, the version number and the state the version is in instead of draft, in Brazilian
    Portuguese
  proves: CaseVersionNotDraftError's message is in PT-br and names the case slug, the version number and
    the state that version is in instead of draft.
  fails_when: the message drops the slug, the version, the state value, or the not-in-draft fact, or reintroduces
    an English domain noun.
- file: src/__tests__/unit/errors/case-version-not-draft.error.spec.ts
  name: keeps its class-name string unchanged
  proves: Each of the five classes' name property still holds its unchanged class-name string (CaseVersionNotDraftError).
  fails_when: .name is anything other than 'CaseVersionNotDraftError'.
- file: src/__tests__/unit/errors/case-version-not-draft.error.spec.ts
  name: holds exactly the slug, version and state it was constructed with, in its context
  proves: Each of the five classes' context property holds exactly the properties and values it held before
    (CaseVersionNotDraftError).
  fails_when: .context is anything other than exactly { slug, version, state }.
- file: src/__tests__/unit/errors/case-version-not-draft.error.spec.ts
  name: is distinguishable from CaseVersionNotReleasedError by its text alone, given the same slug, version
    and state
  proves: CaseVersionNotDraftError, CaseVersionNotReleasedError and CaseVersionNotDraftAtReleaseError
    are distinguishable from one another by their text alone -- the NotDraft/NotReleased pair.
  fails_when: the two messages are textually identical given identical slug, version and state.
- file: src/__tests__/unit/errors/case-version-not-draft.error.spec.ts
  name: is distinguishable from CaseVersionNotDraftAtReleaseError by its text alone, given the same slug,
    version and state
  proves: CaseVersionNotDraftError, CaseVersionNotReleasedError and CaseVersionNotDraftAtReleaseError
    are distinguishable from one another by their text alone -- the NotDraft/NotDraftAtRelease pair.
  fails_when: the two messages are textually identical given identical slug, version and state.
- file: src/__tests__/unit/errors/case-version-not-draft.error.spec.ts
  name: is distinguishable from CaseVersionNotDraftAtReleaseError and CaseVersionNotReleasedError from
    each other, by text alone, given the same slug, version and state
  proves: CaseVersionNotDraftError, CaseVersionNotReleasedError and CaseVersionNotDraftAtReleaseError
    are distinguishable from one another by their text alone -- the NotReleased/NotDraftAtRelease pair.
  fails_when: the two messages are textually identical given identical slug, version and state.
- file: src/__tests__/unit/errors/case-version-not-released.error.spec.ts
  name: names the case and its version before it states the state that refuses the act
  proves: Every one of the five messages names the case, and where the class receives a version number
    the version, before it states the state (CaseVersionNotReleasedError).
  fails_when: the interpolated state value appears at or before the position of the case slug.
- file: src/__tests__/unit/errors/case-version-not-released.error.spec.ts
  name: names the case slug, the version number and the state the version is in, and states, in Brazilian
    Portuguese, that diagnosis runs only against a released version
  proves: CaseVersionNotReleasedError's message is in PT-br, names the case slug, the version number and
    the state, and states diagnosis runs only against a released version.
  fails_when: the message drops the slug, the version, the state value, or the diagnosis-only-against-released
    fact, or reintroduces an English domain noun.
- file: src/__tests__/unit/errors/case-version-not-released.error.spec.ts
  name: keeps its class-name string unchanged
  proves: Each of the five classes' name property still holds its unchanged class-name string (CaseVersionNotReleasedError).
  fails_when: .name is anything other than 'CaseVersionNotReleasedError'.
- file: src/__tests__/unit/errors/case-version-not-released.error.spec.ts
  name: holds exactly the slug, version and state it was constructed with, in its context
  proves: Each of the five classes' context property holds exactly the properties and values it held before
    (CaseVersionNotReleasedError).
  fails_when: .context is anything other than exactly { slug, version, state }.
- file: src/__tests__/unit/errors/case-version-not-draft-at-release.error.spec.ts
  name: names the case and its version before it states the state that refuses the act
  proves: Every one of the five messages names the case, and where the class receives a version number
    the version, before it states the state (CaseVersionNotDraftAtReleaseError).
  fails_when: the interpolated state value appears at or before the position of the case slug.
- file: src/__tests__/unit/errors/case-version-not-draft-at-release.error.spec.ts
  name: names the case slug, the version number and the state the version is in, and states, in Brazilian
    Portuguese, that release only ever moves a version out of draft
  proves: CaseVersionNotDraftAtReleaseError's message is in PT-br, names the case slug, the version number
    and the state, and states release only ever moves a version out of draft.
  fails_when: the message drops the slug, the version, the state value, or the release-trigger fact, or
    reintroduces an English domain noun.
- file: src/__tests__/unit/errors/case-version-not-draft-at-release.error.spec.ts
  name: keeps its class-name string unchanged
  proves: Each of the five classes' name property still holds its unchanged class-name string (CaseVersionNotDraftAtReleaseError).
  fails_when: .name is anything other than 'CaseVersionNotDraftAtReleaseError'.
- file: src/__tests__/unit/errors/case-version-not-draft-at-release.error.spec.ts
  name: holds exactly the slug, version and state it was constructed with, in its context
  proves: Each of the five classes' context property holds exactly the properties and values it held before
    (CaseVersionNotDraftAtReleaseError).
  fails_when: .context is anything other than exactly { slug, version, state }.
not_applicable:
- edge_case: an empty, blank or otherwise unusual case slug passed to any of the five constructors
  why: no criterion or node distinguishes behavior by the slug's value; every constructor interpolates
    whatever string it receives verbatim.
- edge_case: a version number at a numeric boundary -- zero, negative, or very large
  why: no criterion or node places a range constraint on version within these five message classes.
- edge_case: an unrecognized or arbitrary state token
  why: the task's Notes record that the state words these messages interpolate come from the stored value
    and are not translated by this task.
- edge_case: concurrent or repeated construction of the same error instance
  why: construction of these five classes is a pure, synchronous, side-effect-free operation with no shared
    state.
untested:
- 'The clause of ''No message states a fact its English original did not state'' (the static-prose half)
  is not decided by any finite test: the English original text no longer exists in the tree to diff against.'
- '''The suite under src/src/__tests__ passes with no test file changed'' is an operational, delivery-level
  fact decided by executing the suite, not by a test.'
- domain/knowledge/case -- these tests exercise only message text; the node's own fact is the whole aggregate
  identity.
- domain/knowledge/case-version -- likewise, the node's fact is the whole aggregate, far broader than
  message text.
- rules/knowledge/a-case-has-at-most-one-draft -- the node's fact is that create-draft is actually refused
  under that condition; that enforcement lives outside the files this task touched.
- rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft -- same reasoning; enforcement
  lives in the hypothesis-revision service, outside this task's files.
- rules/knowledge/a-case-version-moves-through-its-declared-lifecycle -- the task's Notes state this lifecycle-enforcement
  clause belongs to the acts enforcing it.
- rules/investigation/only-a-released-case-version-is-diagnosed -- likewise left by the task's Notes to
  the acts enforcing it.
- constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese -- system-wide scope; this
  task's tests check only five of the mapped classes.
- constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word -- system-wide scope;
  this task's tests check the nine nouns only for the five classes this task rewrote.
---
## What it is
Unit tests proving the five case-version-state refusals' PT-br message content, the fact-before-state
ordering, cross-class distinguishability among the three state-bearing classes, and preserved
name/context.

## Notes
status-map.ts's mapping for all five classes is already evidenced by the pre-existing, unmodified
status-map.spec.ts; no duplicate test was added for it.
Several implemented nodes and one criterion clause are recorded under `untested` because they are
system-wide facts this one task only partially advances, or because they compare against a prior
English source no longer in the working tree, or because they are operational claims about a whole
suite run rather than about behavior.
