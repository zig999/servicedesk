---
title: Release a hypothesis-revision directly against its own state
summary: A new domain operation moves a hypothesis-revision from draft to released by its own identity
  alone, refusing with HypothesisRevisionNotDraftAtReleaseError — an error carrying no context at all —
  when the revision is not currently draft.
task: sha256:1df5b0afaa8f9e956715be01c9572f24a91c9a9cc61eb9378f213f23f5f6c964
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/hypothesis-revision-own-release-release-a-revision-directly-build
files:
- path: src/case/hypothesis-revision-own-state.port.ts
  effect: New narrow, single-method read port. IHypothesisRevisionOwnStateQuery.readHypothesisRevisionOwnState(slug,
    hypothesisName, revision) answers the named hypothesis-revision's own state, or undefined when no
    such row exists. Imports only the HypothesisRevisionState type from case-store.port.js — no database
    driver, HTTP framework or LLM client.
- path: src/case/hypothesis-revision-release.port.ts
  effect: New narrow, single-method write port. IHypothesisRevisionRelease.releaseHypothesisRevision(slug,
    hypothesisName, revision) writes the transition; declares no import at all.
- path: src/case/release-hypothesis-revision.operation.ts
  effect: New operation. ReleaseHypothesisRevisionOperation.releaseHypothesisRevision reads the revision's
    own state through IHypothesisRevisionOwnStateQuery, refuses with HypothesisRevisionNotDraftAtReleaseError
    unless that state is exactly 'draft', and otherwise calls IHypothesisRevisionRelease.releaseHypothesisRevision
    to write the transition. Depends on the store only through the ReleaseHypothesisRevisionStore intersection
    of the two new ports, never on the whole ICaseStore.
- path: src/errors/hypothesis-revision-not-draft-at-release.error.ts
  effect: New domain error class. Takes no constructor argument, sets only name and message, and declares
    no context field at all — deliberately unlike every other error class in this directory.
- path: src/errors/status-map.ts
  effect: Registers HypothesisRevisionNotDraftAtReleaseError at HTTP 409 in STATUS_BY_ERROR_CLASS, beside
    CaseVersionNotDraftAtReleaseError and ReleasedHypothesisRevisionNotAlterableError, the two existing
    409 entries for the same shape of refusal.
- path: src/persistence/relational-case-store.repository.ts
  effect: RelationalCaseStore now also implements IHypothesisRevisionOwnStateQuery and IHypothesisRevisionRelease.
    Adds the HYPOTHESIS_REVISION_RELEASED_STATE constant; readHypothesisRevisionOwnState/resolveHypothesisRevisionOwnState
    runs a plain SELECT state FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2
    AND revision = $3 (reusing the existing hypothesisRevisionStateOf validator); releaseHypothesisRevision/releaseHypothesisRevisionRow
    runs a plain UPDATE hypothesis_revisions SET state = $4 WHERE case_slug = $1 AND hypothesis_name =
    $2 AND revision = $3, with no state condition in the WHERE clause and no join to case_versions or
    case_version_hypotheses anywhere in either statement.
criteria:
- criterion: Releasing a hypothesis-revision whose own state is draft leaves that revision's own state
    released.
  met: true
  how: readHypothesisRevisionOwnState answers 'draft'; refuseNonDraft does not throw; releaseHypothesisRevision
    issues UPDATE hypothesis_revisions SET state = 'released' WHERE case_slug/hypothesis_name/revision
    match, so the row reads back released.
- criterion: Releasing a hypothesis-revision whose own state is already released is refused with a HypothesisRevisionNotDraftAtReleaseError.
  met: true
  how: readHypothesisRevisionOwnState answers 'released'; refuseNonDraft's state !== 'draft' check is
    true, so it throws HypothesisRevisionNotDraftAtReleaseError before releaseHypothesisRevision (the
    store's write method) is ever called.
- criterion: The refusal reports its own condition and its own message as the whole of what it reports,
    carrying no further value.
  met: true
  how: 'HypothesisRevisionNotDraftAtReleaseError''s constructor takes no argument and sets only name and
    message, declaring no context property. error-handler.middleware.ts''s hasContext/domainEnvelope already
    omits details whenever an error carries no context, so this refusal''s envelope holds only its code
    and its fixed message — no slug, hypothesis name, revision number or state.'
- criterion: Releasing a hypothesis-revision that no case version's manifest holds an entry for is not
    refused for that absence.
  met: true
  how: Both new store methods address hypothesis_revisions alone by (case_slug, hypothesis_name, revision);
    neither reads nor requires a row in case_version_hypotheses, so a revision no manifest ever referenced
    releases exactly the same way as one that is referenced.
- criterion: No case version's own state and no manifest entry changes when a hypothesis-revision is
    released.
  met: true
  how: releaseHypothesisRevisionRow issues exactly one statement, the UPDATE against hypothesis_revisions;
    no statement either new store method issues names case_versions or case_version_hypotheses, so neither
    table can change as a result.
- criterion: The operation reads no case version relation and no manifest relation to decide whether
    the release may proceed.
  met: true
  how: ReleaseHypothesisRevisionOperation's only read is caseStore.readHypothesisRevisionOwnState, backed
    by a plain SELECT state FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2 AND
    revision = $3 — no join, no second query, and no reference to case_versions or case_version_hypotheses
    anywhere in the operation or the two ports it depends on.
- criterion: No operation the system offers moves a hypothesis-revision's own state out of released.
  met: true
  how: The only operation this task adds is releaseHypothesisRevision, the one forward transition draft
    → released; no method on IHypothesisRevisionRelease, on ICaseStore, or anywhere else in this delivery
    writes state = 'draft' against an existing row, so released stays terminal as the state-machine node
    declares.
nodes:
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  encoded_at:
  - src/case/release-hypothesis-revision.operation.ts
  - src/case/hypothesis-revision-own-state.port.ts
  - src/case/hypothesis-revision-release.port.ts
  - src/errors/hypothesis-revision-not-draft-at-release.error.ts
  - src/errors/status-map.ts
  - src/persistence/relational-case-store.repository.ts
  how: The one declared transition (draft, trigger release, to released) and its refusal are exactly
    what the operation, the two new ports, the repository's two new methods and the new error class together
    encode; the rule's own HTTP-409 clause is answered by status-map.ts's new entry, though no criterion
    of this task exercises it through a route, since this task builds no route.
- node: scenarios/knowledge/a-hypothesis-revision-is-released-independently-of-any-manifest
  encoded_at:
  - src/case/release-hypothesis-revision.operation.ts
  - src/case/hypothesis-revision-own-state.port.ts
  - src/case/hypothesis-revision-release.port.ts
  - src/persistence/relational-case-store.repository.ts
  how: The scenario's given (no case version's manifest holds an entry for the revision) and then (revision
    released, no case version affected) is exactly criteria 4 and 5's proof — the read and the write both
    address hypothesis_revisions alone by identity, never case_version_hypotheses or case_versions.
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/case/release-hypothesis-revision.operation.ts
  - src/case/hypothesis-revision-own-state.port.ts
  - src/case/hypothesis-revision-release.port.ts
  - src/persistence/relational-case-store.repository.ts
  how: '"Carries its own state, draft or released, moved once by its own release — a curator''s action
    taken directly against this revision, answering to no case version and no manifest" is what the operation''s
    signature (slug, hypothesis_name, revision — no case version, no manifest position) and its read-then-write
    over hypothesis_revisions alone realize.'
- node: contracts/knowledge/case-lifecycle
  encoded_at:
  - src/case/release-hypothesis-revision.operation.ts
  - src/errors/hypothesis-revision-not-draft-at-release.error.ts
  - src/errors/status-map.ts
  how: Honored partially. This task delivers the domain transition the contract's release-hypothesis
    operation names — "a curator's action taken directly against a hypothesis-revision... answering to
    no manifest at all" — and the refusal rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
    names, together with its HTTP-409 registration. The published HTTP surface itself (the route named
    release-hypothesis) is not built here; it is the sibling task expose-the-release-hypothesis-endpoint's
    own delivery, which depends on this one.
- node: contracts/system/case-authoring
  encoded_at:
  - src/case/release-hypothesis-revision.operation.ts
  how: Honored partially, for the same reason. "A hypothesis's own release is the curator's, too — a
    revision may be released independently, on the hypothesis's own terms, whether or not any case has
    ever pointed at it" is exactly what ReleaseHypothesisRevisionOperation does; the capability's request
    entrance is the sibling task's.
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  how: Not reached by this task. This constraint governs a route's own request-shape refusal, and this
    task builds no route at all — only the domain operation a route will later call. Governs the sibling
    task expose-the-release-hypothesis-endpoint's own release-hypothesis route, matching this task's own
    UNDERDETERMINED note.
- node: constraints/no-route-enforces-authentication
  how: Not reached by this task, for the same reason — there is no route here to guard or leave unguarded.
    Governs the sibling task's own route, matching this task's own UNDERDETERMINED note.
inferences:
- inferred: HypothesisRevisionNotDraftAtReleaseError carries no context field at all, departing from
    the inventory's own observed convention that every domain error class carries a readonly context
    object built from its constructor arguments.
  from: The rule statement itself — "reporting a HypothesisRevisionNotDraftAtReleaseError as the whole
    of what that refusal reports — its own condition and its own message — carrying no further value,
    and in particular not the state the revision stood in" — and criterion 3's identical wording. error-handler.middleware.ts's
    existing hasContext/domainEnvelope mechanism already treats an error with no context property as
    carrying no details, so a context-free class is the direct, no-further-code way to satisfy this exact
    requirement rather than an addition to the envelope logic.
- inferred: A hypothesis-revision naming a (slug, hypothesis_name, revision) that does not exist at all
    is refused with the same HypothesisRevisionNotDraftAtReleaseError as one that exists but is not draft,
    rather than a distinct not-found identity.
  from: readHypothesisRevisionOwnState answering undefined and refuseNonDraft's state !== 'draft' check
    already covering undefined without a third branch; no criterion of this task, and no node it implements,
    names a distinct refusal for a hypothesis-revision that is not stored at all, so introducing one would
    be deciding a fact neither states.
- inferred: Two single-method ports (IHypothesisRevisionOwnStateQuery, IHypothesisRevisionRelease) rather
    than one two-method port or new methods added directly to ICaseStore.
  from: The inventory's own convention — "A store operation crossing more than the write path exposes
    a narrow, single-method port... that an operation class depends on via an intersection type, rather
    than depending on the whole ICaseStore" — already exercised by IHighestRevisionReleaseStateQuery (read)
    and IHypothesisRevisionOverwrite (write) as two separate single-method ports composed into ReviseHypothesisStore.
- inferred: releaseHypothesisRevisionStatement's UPDATE carries no WHERE state = 'draft' guard of its
    own, relying entirely on the operation's prior read-then-refuse to decide eligibility.
  from: release.operation.ts's own sibling releaseStatement (case-version release) is equally unconditional
    in its WHERE clause, and criterion 6 attributes the eligibility decision to "the operation" specifically;
    migration 0021's existing hypothesis_revisions_refuse_when_released trigger remains the persistence-layer
    safety net against a write reaching an already-released row from any path, exactly as it already does
    for every other write to this table.
deferred:
- what: Wiring ReleaseHypothesisRevisionOperation into createCaseLifecycle (src/factories/case-lifecycle.factory.ts)
    and widening CaseStore's intersection type (src/factories/case-store.factory.ts) so a controller can
    reach it through CaseLifecycleOperations.
  why: No criterion of this task asks for reachability from outside the operation itself; the sibling
    task expose-the-release-hypothesis-endpoint, which depends on this one, states its own criterion that
    the route is "reachable with no further wiring," so the whole reachability path — factory wiring included
    — is that task's delivery, not this one's.
- what: The release-hypothesis HTTP surface itself — its DTO, controller, routes and build-app.ts registration,
    and the HTTP 400/409 status behavior constraints/a-malformed-request-is-refused-with-a-validation-error
    and constraints/no-route-enforces-authentication govern.
  why: This task's own UNDERDETERMINED notes state plainly that no criterion here addresses a malformed
    request or authentication; the route belongs to the sibling task named above.
- what: Translating the rare race where a concurrent write releases a row between this operation's read
    and its own UPDATE, which would surface migration 0021's trigger's raw 'ReleasedHypothesisRevisionNotAlterableError'
    text as an untranslated CaseStoreError rather than a typed refusal.
  why: No criterion of this task, and no node it implements, names this race or a required outcome for
    it; inventing a translation would mean choosing between two already-registered error identities for
    a condition nothing here states.
preserved:
- Every existing method of ICaseStore, IHighestRevisionReleaseStateQuery and IHypothesisRevisionOverwrite,
  and every function implementing them in relational-case-store.repository.ts — untouched.
- Migration 0020's hypothesis_revisions.state column and migration 0021's hypothesis_revisions_refuse_when_released
  trigger and hypothesis_revision_collects_no_delete_when_released rule — untouched, and still the persistence-layer
  safety net this task's own write relies on for the write it does not itself guard.
- Every existing entry of STATUS_BY_ERROR_CLASS in status-map.ts — untouched; only one new entry was
  added.
- src/factories/case-lifecycle.factory.ts and src/factories/case-store.factory.ts — untouched, left for
  the sibling task's own wiring.
---

## What it is

A new domain operation, `ReleaseHypothesisRevisionOperation`, taking a hypothesis-revision from draft to
released by its own identity alone — slug, hypothesis name, revision number — with no case version and
no manifest named anywhere in its path. It reads the revision's own state through a new narrow port,
refuses with a context-free `HypothesisRevisionNotDraftAtReleaseError` when that state is not draft, and
otherwise writes the transition through a second new narrow port, backed by two new methods on
`RelationalCaseStore` that touch `hypothesis_revisions` alone.

## Notes

Deferred to the sibling task `expose-the-release-hypothesis-endpoint` (which depends on this one): the
HTTP surface (DTO, controller, routes, build-app wiring), the factory wiring that would make this
operation reachable through `CaseLifecycleOperations`, and the request-shape and authentication
constraints that govern a route this task does not build. Also deferred: translating the rare
concurrent-write race against migration 0021's own trigger, which no criterion or node names.
