---
title: Revise-hypothesis chooses overwrite or next revision by reading released reference state
summary: ReviseHypothesisOperation now reads a hypothesis's highest revision and its released-reference
  state before writing, overwriting that revision in place while unreleased and creating the next revision
  once released, with the store's own trigger-raised refusal for the stale-read race now mapped to HTTP
  409.
task: sha256:a33aad8f7ff9328295a60a109ca0e53a6b47762ae6c9a8786c1dba542b02c5d8
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/hypothesis-revision-overwrite-revise-chooses-overwrite-or-next-revision-build
files:
- path: src/case/revise-hypothesis.operation.ts
  effect: declares ReviseHypothesisStore (ICaseStore & IHighestRevisionReleaseStateQuery & IHypothesisRevisionOverwrite)
    as the constructor's dependency type, replacing the bare ICaseStore; reviseHypothesis now calls a
    new private writeRevision(input), which reads readHighestRevisionReleaseState(input.slug, input.hypothesis_name)
    and, when the highest revision exists and released_referenced is false, calls overwriteHypothesisRevision
    with that same revision number (via the new module-level overwriteInputOf helper, which builds an
    OverwriteHypothesisRevisionInput explicitly from the fields HypothesisRevisionInput declares, deliberately
    not spreading ReviseHypothesisInput's extra subject field into it); otherwise (no existing revision,
    or the highest is released-referenced) it falls through to the unchanged insertHypothesisRevision(input)
    call, which already numbers 1 for a hypothesis holding none and one past the highest otherwise
- path: src/factories/case-store.factory.ts
  effect: exports a new CaseStore type (ICaseStore & IHighestRevisionReleaseStateQuery & IHypothesisRevisionOverwrite)
    and widens createCaseStore's return type to it; RelationalCaseStore already implements all three interfaces,
    so this is a type-level widening only, and every existing caller that only used ICaseStore's members
    keeps typechecking against the wider return type unchanged
- path: src/errors/status-map.ts
  effect: imports ReleasedHypothesisRevisionNotAlterableError and adds [ReleasedHypothesisRevisionNotAlterableError,
    409] to STATUS_BY_ERROR_CLASS, alphabetically placed among the existing imports and beside the other
    409 entries; no controller or route file needed a change, since handleUnexpectedError already consults
    statusForError generically for any Error reaching Fastify's error handler
criteria:
- criterion: Revising a hypothesis whose highest existing revision is referenced by no case version in
    released state leaves that hypothesis's highest revision number unchanged.
  met: true
  how: writeRevision takes the overwrite branch whenever state.revision !== undefined && !state.released_referenced,
    calling overwriteHypothesisRevision with that same state.revision number rather than inserting a new
    row
- criterion: After such a revise, that revision's content reads as the content the revise carried.
  met: true
  how: overwriteInputOf carries criterion, collects and resolution straight from the revise input into
    the OverwriteHypothesisRevisionInput the store's own (previously delivered) overwriteHypothesisRevision
    writes
- criterion: Three successive revises of a hypothesis whose highest existing revision is referenced by
    no case version in released state leave that hypothesis holding exactly the revisions it held before
    the first of them.
  met: true
  how: each of the three revises independently re-reads the release state and, finding the same highest
    revision still unreleased, takes the overwrite branch again; no revise in that sequence reaches insertHypothesisRevision,
    so no new row is ever created
- criterion: After those three revises, the hypothesis's highest revision reads the content of the most
    recent of them.
  met: true
  how: each successive overwrite replaces the same revision row's content in place, so the third revise's
    content is what the row reads afterward
- criterion: Revising a hypothesis whose highest existing revision is referenced by a case version in
    released state creates a revision numbered exactly one past that highest revision.
  met: true
  how: when state.released_referenced is true, writeRevision falls through to insertHypothesisRevision(input),
    whose own COALESCE(MAX(revision), 0) + 1 numbering (unchanged, in the store layer) numbers the new
    row one past the highest
- criterion: After such a revise, the revision that released case version references reads exactly the
    content it read before the revise.
  met: true
  how: the insert path never touches the earlier revision's row; only a new row is inserted, so the released-referenced
    revision's stored content is untouched by this operation
- criterion: After such a revise, that released case version's manifest still references the revision
    number it referenced before.
  met: true
  how: this operation writes no manifest entry in either branch; the manifest is written only by placeHypothesis/removeHypothesis,
    neither of which reviseHypothesis calls, so the released version's manifest entry is left exactly
    as it was
- criterion: Revising a hypothesis that holds no revision creates that hypothesis's revision 1.
  met: true
  how: 'when readHighestRevisionReleaseState answers { revision: undefined }, the state.revision !== undefined
    guard is false, so writeRevision falls through to insertHypothesisRevision(input), whose numbering
    yields 1 for a hypothesis holding no revision'
- criterion: A revise requested while the case holds no draft version is refused with an HTTP 409 response
    reporting a CaseHoldsNoDraftError.
  met: true
  how: refuseWithoutDraft, unchanged, still runs first in reviseHypothesis and throws CaseHoldsNoDraftError;
    status-map.ts's pre-existing [CaseHoldsNoDraftError, 409] entry, untouched by this task, still maps
    it to HTTP 409 through the generic error handler
- criterion: A revise refused because the case holds no draft version leaves every existing revision of
    that hypothesis reading exactly as it did, and creates none.
  met: true
  how: refuseWithoutDraft is awaited before writeRevision is ever called, so the no-draft refusal throws
    before either the release-state read or any write is reached
- criterion: After a revise that replaced the highest revision's content in place, the case's draft manifest
    entry for that hypothesis references the same revision number it referenced before the revise.
  met: true
  how: the overwrite branch preserves state.revision as the written revision's number and writes no manifest
    entry, so a draft manifest entry already pinning that revision number continues to reference it, unchanged,
    after the overwrite
nodes:
- node: contracts/knowledge/case-lifecycle
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  how: revise-hypothesis is one of the contract's declared operations; ReviseHypothesisOperation is its
    implementation, and this task is exactly the contract's own stated behavior — revising a hypothesis
    writes into that hypothesis's own highest existing revision, in place, for as long as no released
    case version has adopted it; once one has, revising instead creates the next revision
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  how: writeRevision's branch on state.revision !== undefined && !state.released_referenced is exactly
    this policy's decision, read from the one fact (readHighestRevisionReleaseState) the rule's own description
    says it turns on
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  - src/errors/status-map.ts
  how: 'honored two ways: ordinarily, writeRevision never aims a write at a released-referenced revision,
    because released_referenced === true routes to insertHypothesisRevision instead of overwriteHypothesisRevision;
    for the stale-read race the rule''s own eventual-consistency description names explicitly (a read
    that goes stale between the read and the write), the store''s trigger-raised, already-typed ReleasedHypothesisRevisionNotAlterableError
    now maps to HTTP 409 through STATUS_BY_ERROR_CLASS, so an attempt that does reach an already-released
    revision is refused at the point of the attempt with an HTTP 409 response as the rule states, rather
    than silently doing nothing'
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  how: the overwrite branch never assigns a new number — it writes into state.revision unchanged — and
    the insert branch only ever runs through the pre-existing COALESCE(MAX(revision), 0) + 1 numbering,
    which by construction never repeats a number already given to a row that still exists; this task's
    routing is what keeps this rule and a-hypothesis-revision-is-overwritten-while-unreleased's one fact
    answered consistently
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  how: only the first clause (a revision is refused with CaseHoldsNoDraftError/HTTP 409 while the case
    holds no draft) is reached by this task's criteria and code — refuseWithoutDraft, unchanged by this
    task, still runs first; the second clause (the concept-acceptance check using the draft version's
    declared subject type) is the task's own REMAINDER note and is left to the task implementing that
    check
- node: domain/knowledge/hypothesis
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  how: writeRevision is exactly the aggregate's stated responsibility — either replace its own highest
    revision's content in place or originate the next revision, whichever its frozen state calls for —
    read from readHighestRevisionReleaseState rather than from any field the hypothesis identity itself
    carries, matching that revising a hypothesis never changes its name
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  how: the overwrite branch is exactly a further edit replacing its content in place while its number
    stays exactly what it already was; the insert branch is exactly that once any case version in released
    state manifests it, this content never changes again — a further edit always creates the next revision
    instead
- node: domain/knowledge/case-version
  how: this task reads, but does not write, the fact of whether a case version in released state references
    the hypothesis's highest revision — consumed as-is from readHighestRevisionReleaseState (delivered
    by the depended-on task) to decide the routing; no case-version behavior is added or changed here
- node: domain/knowledge/manifest-entry
  how: 'honored by non-interference: reviseHypothesis writes no manifest entry in either branch, which
    is what lets criteria seven and eleven hold — a manifest entry''s pinned revision number is untouched
    by a revise, whether it overwrote or inserted'
- node: scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  how: 'its given/when/then is exactly criteria one through four''s given/when/then: three successive
    revises of an unreleased highest revision leave the revision count and pinned number unchanged and
    the content as the most recent revise left it; the scenario''s fourth then-clause (the entry does
    not disclose a higher revision) is out of this task''s criteria per its own ADVISORY note and is not
    addressed here'
- node: scenarios/knowledge/revising-a-released-revision-creates-the-next
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  how: 'its given/when/then is exactly criteria five through seven: a released reference routes the revise
    to insertHypothesisRevision, creating revision one past the highest while leaving the released revision''s
    content and the released version''s manifest reference unchanged'
- node: constraints/the-domain-depends-on-no-infrastructure
  how: revise-hypothesis.operation.ts imports only ports (ICaseStore, IHighestRevisionReleaseStateQuery,
    IHypothesisRevisionOverwrite, IGlossaryQuery) and domain error classes, never pg, Fastify or any driver;
    the widening added here is itself only new port interfaces, so the constraint is unaffected
inferences:
- inferred: the OverwriteHypothesisRevisionInput for the overwrite call is built by explicitly listing
    slug, hypothesis_name, criterion, collects, resolution and revision in a new overwriteInputOf helper,
    rather than spreading ...input
  from: 'ReviseHypothesisInput (HypothesisRevisionInput & { subject: string }) carries a subject field
    that OverwriteHypothesisRevisionInput (HypothesisRevisionInput & { revision: number }, in case-store.port.ts)
    does not declare; an explicit object keeps the store''s input shape exactly what its own port declares
    rather than relying on a spread silently carrying an unrelated field through'
- inferred: the operation's widened dependency type is declared as a new exported ReviseHypothesisStore
    = ICaseStore & IHighestRevisionReleaseStateQuery & IHypothesisRevisionOverwrite inside revise-hypothesis.operation.ts,
    rather than widening ICaseStore itself
  from: the task's own instruction to widen without breaking any other ICaseStore consumer or test double,
    together with the standard's ARC-01 (a constructor receives interfaces, never concrete implementations)
    — a new named interface intersection at the one constructor that needs it, rather than a change to
    the shared ICaseStore every other consumer depends on
- inferred: src/factories/case-lifecycle.factory.ts was left unedited
  from: createCaseStore's widened return type (CaseStore, an intersection including all three interfaces
    ReviseHypothesisStore requires) is already structurally assignable to ReviseHypothesisStore, so the
    existing new ReviseHypothesisOperation(caseStore, glossary) call in that factory typechecks unchanged
- inferred: ReleasedHypothesisRevisionNotAlterableError is mapped to HTTP 409 in status-map.ts even though
    no criterion of this task states that refusal as literal text
  from: 'the task''s own UNDERDETERMINED note: rules/knowledge/a-released-hypothesis-revision-is-never-altered
    states the attempt is refused at the point of the attempt with an HTTP 409 response reporting ReleasedHypothesisRevisionNotAlterableError,
    and the sibling store-layer task already re-raises that typed error for exactly the stale-read race
    this note names; status-map.ts is the codebase''s existing convention for mapping a typed domain error
    to an HTTP status, so extending it closes the gap the note identifies rather than leaving the race
    fall through to a generic 500'
preserved:
- 'every other consumer of ICaseStore through createCaseStore — CreateDraftOperation, ReleaseOperation,
  placeHypothesis/removeHypothesis, discardCaseVersion, CaseQueryService (via case-query.factory.ts and
  case-input-requirements.factory.ts), and build-app.factory.ts''s ComposedResources.caseStore: ICaseStore
  — keeps typechecking and running unchanged, because CaseStore widens createCaseStore''s return type
  rather than narrowing or altering ICaseStore itself'
- insertHypothesisRevision's own numbering (COALESCE(MAX(revision), 0) + 1) and its always-insert write
  path, in RelationalCaseStore, are unchanged; this task only decides when that path is reached versus
  the overwrite path
- every other entry already in STATUS_BY_ERROR_CLASS is unchanged; the new entry is additive
- handleUnexpectedError and the rest of the HTTP layer (routes, controller, DTO) for revise-hypothesis
  are unchanged — the generic statusForError lookup already surfaces any newly mapped status without a
  route/controller edit
deferred:
- what: the concept-acceptance check a new revision undergoes using the draft version's declared subject
    type (a-hypothesis-is-revised-only-against-its-cases-draft's second clause)
  why: the task's own REMAINDER note names this as reaching no criterion here; it belongs to the task
    implementing the concept-acceptance check performed on a revise-hypothesis, and touching it now would
    widen this task beyond what it was cut to decide
- what: rewriting src/__tests__/integration/case/revise-hypothesis.operation.spec.ts, whose existing 'numbers
    a new revision one past the highest existing revision, and leaves the earlier revision's row unaltered'
    assertions invert under the new rule whenever the prior highest revision is unreleased
  why: 'the task''s own instruction and the framework''s own division of judgment: writing tests is the
    test-author''s task, in a separate delegation and context, never this one''s'
---

## What it is
The operation reading, before it writes, whether its hypothesis's highest existing revision has been adopted by a released case version, and writing into that revision or past it accordingly.
A hypothesis holding no revision yet takes the same path to revision 1.
`ReleasedHypothesisRevisionNotAlterableError`, already raised by the store's own trigger-protected write for the stale-read race, is now mapped to HTTP 409 through the codebase's existing error-to-status convention.

## Notes
The task's own UNDERDETERMINED note names a gap no criterion states as literal text: the stale-read race where a released-reference read goes stale between the read and the write. The sibling store-layer task already raises a distinguishable `ReleasedHypothesisRevisionNotAlterableError` for exactly that race; this task closes the gap by adding that error class to `status-map.ts`'s existing convention, so the race is answered with HTTP 409 rather than falling through to a generic 500.
