---
target: backend
title: isCaseVersionState's canonical-array rewrite proven through the guard's boundary and the two refusals
  it feeds
summary: Proves the case-version-state guard still accepts exactly draft and released and rejects everything
  else, that all six named paths still resolve the same state, and that the two lifecycle refusals still
  carry the correct status, name and -- closing the one ground the task's own Notes flagged as reachable
  and unguarded -- the correct stored state in their payload, adding one new unit test for updateDraftVersion's
  refusal path where that ground previously had no unit-level test at all.
implementation: sha256:8eb7d4098af05dd8dc687f91637aa61948577059940b4ee227e0a77107543e15
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:4050ccb93004dfd5a71749b73d5d0a5e09de427ccddf202095ecbd7e6db18898
run: run/case-version-read-and-lifecycle-fidelity-case-version-state-from-canonical-list-suite
tests:
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: refuses updateDraft with CaseVersionNotDraftError, naming the slug, version and state, and writes
    no attribute, when the version is not in draft state
  proves: 'The UNDERDETERMINED entry in this task''s Notes -- a rewrite that keeps the canonical array,
    keeps both refusals'' status and name correct, and keeps the six paths resolving the same state, but
    whose non-draft-path refusal body no longer carries the state the version stood in (or carries it
    under a different spelling than the enumeration) -- over exactly the updateDraftVersion path this
    task''s Notes name as one of the two paths whose state-resolution this task reaches. This closes a
    real gap: no unit-level test existed for updateDraftVersion''s refusal path before this test (only
    an integration test at src/__tests__/integration/.../relational-case-store.repository.spec.ts covered
    it). It also stands as this task''s own criterion 7 (the refusal keeps its stated status and name)
    and criterion 5 (the updateDraftVersion path resolves the same state) for this path.'
  fails_when: 'store.updateDraft, called against a stored row whose state is ''released'', throws anything
    other than CaseVersionNotDraftError, or throws it with a context whose slug, version or state does
    not equal exactly { slug: ''a-slug'', version: 1, state: ''released'' } -- including a context missing
    the state field entirely or carrying it under any spelling other than the enumeration''s own ''released''
    -- or issues an UPDATE against case_versions before or despite that refusal.'
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: leaves released_at out of the assembled version entirely when the stored row is a draft with no
    released_at
  proves: Criterion 2 (the guard accepts 'draft', spelled as the enumeration spells it) and criterion
    5's assembleVersion path, pre-existing and unaffected by this rewrite.
  fails_when: assembleVersion, reading a row whose state column holds 'draft', answers a state other than
    'draft', or throws.
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: raises this store's own typed error rather than answering a row whose state is outside the declared
    enumeration
  proves: Criterion 4 (a stored state value the enumeration does not hold is still rejected) via the assembleVersion
    path, pre-existing and unaffected by this rewrite.
  fails_when: assembleVersion, reading a row whose state column holds 'archived', resolves to any value
    instead of rejecting with CaseStoreError.
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: refuses place-hypothesis with CaseVersionNotDraftError, naming the slug, version and state, and
    inserts no manifest entry, when the version is not in draft state
  proves: Criterion 7 (CaseVersionNotDraftError keeps its stated status, name and context) for the insertManifestEntry
    path, pre-existing and unaffected by this rewrite.
  fails_when: placeHypothesis against a released version throws anything other than CaseVersionNotDraftError,
    or with a context not matching { slug, version, state 'released' }, or still inserts a manifest entry.
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: refuses removeManifestEntry with CaseVersionNotDraftError, naming the slug, version and state,
    and deletes no manifest entry, when the version is not in draft state
  proves: Criterion 7 for the deleteManifestEntry path, pre-existing and unaffected by this rewrite.
  fails_when: removeManifestEntry against a released version throws anything other than CaseVersionNotDraftError,
    or with a mismatched context, or still deletes the manifest entry.
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: transitions the version to released, recording the instant of release, after reading the version
    state as draft
  proves: Criterion 5's releaseVersion path (still resolves 'draft' the same way), pre-existing and unaffected
    by this rewrite.
  fails_when: release against a draft version fails to issue the state-transition statement with the released
    literal, or throws.
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: refuses release with CaseVersionNotDraftAtReleaseError, naming the slug, version and state, changing
    neither its state nor its released_at, when the version is not in draft state
  proves: Criterion 7 for CaseVersionNotDraftAtReleaseError, and the same UNDERDETERMINED ground as the
    updateDraft test above, applied to the other path this task's Notes name (releaseVersion) -- already
    covered here at the unit level before this delivery.
  fails_when: release against a released version throws anything other than CaseVersionNotDraftAtReleaseError,
    or with a context not matching { slug, version, state 'released' }, or still issues the release statement.
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: removes a draft version's own manifest entries before its own row, after reading the version state
    as draft, never touching any hypothesis-revision
  proves: Criterion 5's discardDraft path, pre-existing and unaffected by this rewrite.
  fails_when: discard against a draft version fails to delete the manifest entries and the version row
    in that order, or throws.
- file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  name: refuses discard with CaseVersionNotDraftError, naming the slug, version and state, deleting neither
    the manifest entries nor the version row, when the version is not in draft state
  proves: Criterion 7 for the discardDraft path, pre-existing and unaffected by this rewrite.
  fails_when: discard against a released version throws anything other than CaseVersionNotDraftError,
    or with a mismatched context, or still deletes anything.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: returns every version the named case currently holds, by its own number and lifecycle state, ordered
    by version regardless of how many of them have since been released
  proves: Criterion 2 (both 'draft' and 'released' accepted, spelled per the enumeration) and criterion
    5's listCaseVersions path, against a real PostgreSQL instance, pre-existing and unaffected by this
    rewrite.
  fails_when: listCaseVersions answers a state other than 'released' for the released version or other
    than 'draft' for the draft version.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: reads an entry's current_state and last_updated off the case's highest-numbered version whatever
    its own state, even though that same case's released fields still come from the earlier released version
  proves: Criterion 5's listCases path resolving 'draft' correctly, against a real database, pre-existing
    and unaffected by this rewrite.
  fails_when: listCases answers a current_state other than 'draft' for the case's highest-numbered draft
    version.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: assigns the next version off the durable counter, never reusing a version number even after the
    draft that held it is discarded
  proves: Criterion 5's createDraftVersion path (the DRAFT_STATE write it issues is unaffected), pre-existing
    and unaffected by this rewrite.
  fails_when: the version numbering sequence across create/release/discard/create stops matching [1, 2,
    3].
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: copies the case's own latest released version's manifest when naming no source version at all
  proves: Criterion 5's createDraftVersion path (the RELEASED_STATE filter it reads by is unaffected),
    pre-existing and unaffected by this rewrite.
  fails_when: createDraft, given no source_version, fails to copy the manifest of the case's latest released
    version.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: persists the corrected title, when_to_use, subject, fallback and consolidation_register attributes
    against a version in draft state
  proves: Criterion 5's updateDraftVersion path resolving 'draft' correctly, against a real database,
    pre-existing and unaffected by this rewrite.
  fails_when: updateDraft against a draft version fails to persist the given attributes, or throws.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: refuses a version already released, through CaseVersionNotDraftError, and leaves its five attributes
    exactly as they were -- the guard runs before any write is attempted
  proves: The same UNDERDETERMINED ground the new unit test proves, at the integration level against a
    real PostgreSQL instance -- updateDraftVersion's refusal carries the correct state ('released', spelled
    per the enumeration) and touches no data before refusing. Pre-existing and unaffected by this rewrite.
  fails_when: updateDraft against a released version throws anything other than CaseVersionNotDraftError,
    with a context not matching { slug, version, state 'released' }, or the five attributes read back
    afterward differ from what they were before the call.
not_applicable:
- edge_case: Absent or empty input at a validation boundary
  why: isCaseVersionState guards a string already read off a stored database row, not a boundary input
    a caller supplies; no boundary of this task accepts a value from outside.
- edge_case: An empty collection where one comes back
  why: The guard tests membership of one scalar value; nothing in this task's criteria involves a collection
    response.
- edge_case: A duplicate where uniqueness is claimed
  why: None of this task's criteria claim uniqueness over a value the guard decides; the one uniqueness
    claim in the file (one-draft-per-case, manifest position) is untouched by this rewrite and pre-existing.
- edge_case: A dependency that fails or answers slowly
  why: The driver-failure wrapping (raiseReadFailure/raiseWriteFailure) that every path in this file goes
    through is untouched by this rewrite and already proven by pre-existing tests naming the driver failure
    as the thrown error's cause; this task changes no error-handling path.
- edge_case: Two operations against one subject at once
  why: Concurrency is decided by the one-draft-per-case constraint and the transaction boundary, both
    untouched by this rewrite; the existing concurrent-draft-creation test covers that ground and is unrelated
    to isCaseVersionState's own condition.
untested:
- 'Criteria 1, 3 and 6 (that the guard''s own condition is written as a canonical-array membership check
  in the same declaration-and-check shape isHypothesisRevisionState uses, carries no literal ''draft''/''released''
  string, and that the canonical array is declared in exactly one place) describe the shape of the source
  rather than any runtime behavior a black-box test can distinguish: a hand-written literal comparison
  and a Set-membership check against an exported array answer identically for every input this guard is
  ever asked about. No test in this file or any other can fail over one of these three criteria without
  also failing over criterion 4 (rejecting an out-of-enumeration value), which already has its own test;
  nothing separately proves the shape itself, and only reading the source settles it.'
- The exact literal 'released' for current_state is never asserted at the listCases path specifically
  -- the shape test at src/__tests__/integration/.../relational-case-store.repository.spec.ts:1349 checks
  only which keys the entry carries, not their values, for a case whose highest version is released. 'released'
  acceptance is proven at the listCaseVersions, release-refusal, discard-refusal and updateDraft-refusal
  paths instead, so the guard's acceptance of 'released' is proven overall, but not through this specific
  path; nothing in this task's rewrite touches listCases differently from the other paths, so this is
  a pre-existing gap this task neither introduces nor is asked to close.
---
## What it is
The pre-existing unit and integration suites for relational-case-store.repository.ts already
exercised isCaseVersionState's boundary (draft, released, and an out-of-enumeration value) and
every one of the six named paths, and none of them changed behavior under this rewrite. One new
unit test was added -- updateDraftVersion's refusal path -- which previously had only integration
coverage, closing the ground the task's own Notes flagged as reachable by this task and left
unguarded: that the non-draft refusal still carries the version's actual stored state, correctly
spelled, in its CaseVersionNotDraftError context.

## Notes
None.
