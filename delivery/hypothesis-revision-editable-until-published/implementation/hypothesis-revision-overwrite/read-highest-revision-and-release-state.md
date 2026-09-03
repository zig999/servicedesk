---
title: Read a hypothesis's highest revision and whether a released version references
  it
summary: A new case-store-side port and its relational answer report a hypothesis's
  highest existing revision number and whether any case version in released state
  pins it in its manifest.
task: sha256:18f08e94b364854cbc308d76327ef9a3b1aadc43f6f8172c9c676ecc15e3c3a6
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/hypothesis-revision-overwrite-read-highest-revision-and-release-state-build-2
files:
- path: src/case/hypothesis-revision-release-state.port.ts
  effect: 'declares HighestRevisionReleaseState, a discriminated union answering either
    "no revision exists" ({ revision: undefined }, carrying no released_referenced
    field) or "here is the highest revision and whether a released case version references
    it" ({ revision: number; released_referenced: boolean }), and IHighestRevisionReleaseStateQuery,
    a port separate from ICaseStore exposing readHighestRevisionReleaseState(slug,
    hypothesisName); the file imports nothing, so a caller depending on this port
    alone imports no driver, framework or provider client'
- path: src/persistence/relational-case-store.repository.ts
  effect: 'RelationalCaseStore now also implements IHighestRevisionReleaseStateQuery;
    readHighestRevisionReleaseState runs a single read-only statement (highestRevisionReleaseStateSelect)
    that computes MAX(revision) over hypothesis_revisions for the (case_slug, hypothesis_name)
    pair in a CTE, then EXISTS-checks case_version_hypotheses joined to case_versions
    on that exact highest revision with state = RELEASED_STATE, and highestRevisionReleaseStateOf
    maps a null highest revision to { revision: undefined } and a present one to {
    revision, released_referenced }'
criteria:
- criterion: For a hypothesis holding at least one revision, the answer carries the
    highest revision number that hypothesis currently holds.
  met: true
  how: 'highestRevisionReleaseStateSelect''s CTE computes MAX(revision) over hypothesis_revisions
    scoped to the hypothesis key; highestRevisionReleaseStateOf returns { revision:
    row.revision, released_referenced } whenever that MAX is non-null'
- criterion: For a hypothesis holding no revision at all, the answer says it holds
    none.
  met: true
  how: 'MAX(revision) over zero matching rows is SQL NULL (the CTE still returns exactly
    one row); highestRevisionReleaseStateOf checks row.revision === null and returns
    { revision: undefined }, a shape that carries no released_referenced field at
    all'
- criterion: The answer says the highest revision is referenced by a released case
    version when a case version in released state pins that revision in its manifest.
  met: true
  how: the EXISTS subquery joins case_version_hypotheses to case_versions on (case_slug,
    case_version)/(slug, version) and requires cvh.revision = highest.revision AND
    cv.state = RELEASED_STATE; a released version pinning exactly the highest revision
    satisfies it and released_referenced comes back true
- criterion: The answer says the highest revision is referenced by no released case
    version when only case versions in draft state pin it.
  met: true
  how: the same EXISTS subquery's cv.state = RELEASED_STATE condition excludes every
    draft-state case_version_hypotheses row, so a hypothesis whose highest revision
    is pinned only by draft versions yields released_referenced = false
- criterion: The answer says the highest revision is referenced by no released case
    version when a released case version pins a lower revision of that same hypothesis
    and not the highest.
  met: true
  how: the EXISTS subquery filters on cvh.revision = highest.revision specifically;
    a released version pinning a lower revision has cvh.revision != highest.revision
    and does not satisfy the EXISTS, so released_referenced is false even though a
    released reference to the hypothesis exists at a different revision
- criterion: The fact reaches its caller through the case-store port, and the module
    that consumes it imports no driver, framework or provider client.
  met: true
  how: the fact is exposed exclusively through IHighestRevisionReleaseStateQuery.readHighestRevisionReleaseState,
    a port interface with zero imports; a caller reaches the fact by depending on
    this interface alone, never on RelationalCaseStore or the pg-backed DatabaseConnection
    it wraps
nodes:
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: this rule's own condition — whether the hypothesis's highest revision is referenced
    by any case version in released state — is exactly the fact highestRevisionReleaseStateSelect
    answers, paired with the highest revision number the rule's overwrite-vs-create
    choice needs; the rule's write clauses are not reached here, per the task's own
    REMAINDER note
- node: domain/knowledge/hypothesis
  how: the query is scoped by the hypothesis identity (case_slug, hypothesis_name),
    reading a fact about that aggregate without altering it or performing the revise
    operation; no new fact of this node reaches the code beyond identity handling
    already present
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/case/hypothesis-revision-release-state.port.ts
  - src/persistence/relational-case-store.repository.ts
  how: the answer names the hypothesis-revision by its revision number (the highest
    one currently held) and reports the released-reference fact that determines whether
    it is frozen
- node: domain/knowledge/case-version
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: the EXISTS subquery reads case_versions.state to decide whether a case version
    referencing the revision is in released state, reusing the existing RELEASED_STATE
    constant
- node: domain/knowledge/manifest-entry
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: the EXISTS subquery reads case_version_hypotheses rows — this value object's
    own persisted shape — to determine which revision each case version's manifest
    currently references
- node: constraints/the-domain-depends-on-no-infrastructure
  encoded_at:
  - src/case/hypothesis-revision-release-state.port.ts
  how: the port module declaring the fact and its consumer-facing interface imports
    nothing; every driver-facing detail (the pg-backed DatabaseConnection, the parameterized
    SQL) stays inside relational-case-store.repository.ts, reached only through the
    port
inferences:
- inferred: the new read is declared on a separate port, IHighestRevisionReleaseStateQuery,
    rather than added as a method on ICaseStore
  from: the existing ICaseQuery/ICaseStore split already present in this codebase
    (case-query.port.ts beside case-store.port.ts, both implemented by RelationalCaseStore),
    and the fact that adding the method directly to ICaseStore breaks every existing
    ICaseStore implementer (FakeCaseStore, inline test doubles in case-query.service.spec.ts,
    build-app.spec.ts, update-draft.routes.spec.ts)
- inferred: when no highest revision exists, the answer type omits a released_referenced
    field entirely rather than defaulting it to any boolean value
  from: the task's own Notes, which flag that defaulting a released-reference flag
    to true whenever no highest revision was found would satisfy every stated criterion
    while routing a caller onto the branch rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
    forbids for a hypothesis holding no revision; the discriminated union makes that
    wrong default inexpressible rather than merely avoided by convention
- inferred: the release-reference field is named released_referenced (snake_case)
    rather than releasedReferenced
  from: every other domain-facing field already declared in case-store.port.ts (hypothesis_name,
    when_to_use, authored_at, resolution_outcome, consolidation_register) is snake_case,
    reserving camelCase for function parameters and locally computed maps/sets
- inferred: 'readHighestRevisionReleaseState performs no existence check for a hypothesis
    that does not yet exist, returning { revision: undefined } instead of raising
    an error'
  from: criterion two ('a hypothesis holding no revision at all... says it holds none')
    together with rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased's
    statement that a hypothesis holding no revision yet always creates revision 1
    — the very call site this read feeds requires this branch to answer for a not-yet-existing
    hypothesis rather than refuse
preserved:
- ICaseStore's existing shape and every method on it, so FakeCaseStore and the inline
  ICaseStore mocks in case-query.service.spec.ts, build-app.spec.ts and update-draft.routes.spec.ts
  keep compiling unchanged
- every existing RelationalCaseStore method and its SQL, none of which this task touched
deferred:
- what: no module yet calls readHighestRevisionReleaseState — the revise-hypothesis
    write path still unconditionally inserts a new revision, and createCaseStore keeps
    returning RelationalCaseStore typed as ICaseStore alone
  why: the task's own Notes assign choosing between overwrite and create, and the
    wiring that choice requires, to the write-side task of revise-hypothesis
- what: hypothesis_revisions_no_update's unconditional DO INSTEAD NOTHING rule (migration
    0009) would silently no-op an overwrite once the write side starts issuing one
  why: this task performs no write and no schema change; the inventory already identifies
    this as a concern for the write-side task, not this reading task
---

## What it is
One case-store read answering, for a hypothesis, its highest existing revision number and whether a released case version pins that revision.
It is exposed on a new port, IHighestRevisionReleaseStateQuery, separate from ICaseStore, so no existing ICaseStore implementer or test double needed to change.

## Notes
The port split was a correction over the prior attempt in this worktree, which had put the method on ICaseStore directly and broke every existing implementer at typecheck; the field released_referenced was also renamed from an earlier camelCase spelling to match this file's existing snake_case convention for domain-facing fields.
