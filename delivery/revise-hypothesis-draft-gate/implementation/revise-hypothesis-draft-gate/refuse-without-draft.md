---
title: revise-hypothesis refuses a case slug with no open draft version
summary: Closes revise-hypothesis.operation.ts's own disclosed UNDERDETERMINED gap by reading the case's
  current draft version before doing anything else and refusing through a new typed error when none exists.
task: sha256:93ed0e76c3204956fe11e34fcc107e4558fcd15327f5b5ca4c6b6dba1f513a83
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/revise-hypothesis-draft-gate-refuse-without-draft-suite-2
files:
- path: src/case/case-store.port.ts
  effect: 'Declares a new ICaseStore read primitive, findDraftVersion(slug: string): Promise<number |
    undefined>, answering the version number of the one version a case currently holds in draft state,
    or undefined where it holds none — never drafted, or its only draft already released or discarded.'
- path: src/persistence/relational-case-store.repository.ts
  effect: 'Implements findDraftVersion: RelationalCaseStore.findDraftVersion(slug) runs one parameterized
    SELECT version FROM public.case_versions WHERE slug = $1 AND state = $2 directly against the pool,
    via a new draftVersionSelect() statement builder placed beside caseVersionSelect().'
- path: src/errors/case-holds-no-draft.error.ts
  effect: 'New file. Declares CaseHoldsNoDraftError, the typed error revise-hypothesis now raises when
    the named case holds no version in draft state — carrying a name, a message naming the slug, and a
    context: { slug } field.'
- path: src/case/revise-hypothesis.operation.ts
  effect: 'reviseHypothesis() now calls a new private refuseWithoutDraft(input.slug) before refuseInvalidCollects
    and before the store is ever reached: it reads caseStore.findDraftVersion(slug) and throws CaseHoldsNoDraftError
    where that answers undefined. The file''s own header comment''s UNDERDETERMINED paragraph is rewritten
    to say the gate is now closed.'
criteria:
- criterion: Calling reviseHypothesis for a case slug that holds no version in draft state (never drafted,
    or its only draft already released or discarded) is refused with a typed error, before any hypothesis
    identity or revision row is written.
  met: true
  how: refuseWithoutDraft() runs first in reviseHypothesis(), ahead of refuseInvalidCollects() and ahead
    of caseStore.insertHypothesisRevision(). It calls the new ICaseStore.findDraftVersion(slug); a case
    that was never drafted, or whose only draft is now released or discarded, holds no case_versions row
    with state = 'draft', so findDraftVersion answers undefined and CaseHoldsNoDraftError is thrown before
    any store write.
- criterion: Calling reviseHypothesis for a case slug that does hold an open draft version succeeds exactly
    as it already does today, unchanged.
  met: true
  how: Where findDraftVersion answers a version number, refuseWithoutDraft returns normally and reviseHypothesis
    proceeds into the same refuseInvalidCollects → insertHypothesisRevision sequence as before, unmodified.
- criterion: src/src/__tests__/integration/case/revise-hypothesis.operation.spec.ts's own existing test
    "excludes an implementation that originates a hypothesis identity and revision for a case holding
    no draft version at all, without refusing" passes.
  met: true
  how: That test's fixture calls persistCase() and never inserts any public.case_versions row for the
    slug. findDraftVersion's query therefore matches no row, refuseWithoutDraft throws CaseHoldsNoDraftError
    before any store write, so the test's rejection assertion holds and its follow-up SELECT still answers
    no rows.
nodes:
- node: domain/knowledge/case
  how: 'Honored rather than newly encoded: every lookup this gate performs is keyed by the case''s own
    stable slug identity (ICaseStore.findDraftVersion(slug)), read from case_versions rather than from
    any fact of Case itself.'
- node: domain/knowledge/case-version
  how: 'The gate reads exactly the case-version aggregate''s own declared state attribute (draft/released):
    draftVersionSelect() selects case_versions.version WHERE slug = $1 AND state = ''draft'', and findDraftVersion
    answers that version or undefined where none is in draft.'
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis
  how: 'Honored: hypothesis identity is still originated only by insertHypothesisRevision, unchanged in
    how it claims a name or numbers a revision — it is now simply reached only once the gate above has
    confirmed the case''s own draft exists.'
- node: domain/knowledge/hypothesis-revision
  how: 'Honored, and its own ordering now enforced earlier: no hypothesis-revision row is ever written
    for a case holding no draft, because refuseWithoutDraft runs and can throw before insertHypothesisRevision
    is ever called.'
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  how: 'This task''s primary node. Its first half — a hypothesis is revised only while its case holds
    a draft version — is now enforced: reviseHypothesis() calls refuseWithoutDraft(input.slug) before
    anything else, which reads ICaseStore.findDraftVersion(slug) and refuses through CaseHoldsNoDraftError
    where it answers undefined. Its second half — the concept-acceptance check reads that draft version''s
    own declared subject type — is left exactly as before: this operation still takes subject as part
    of its own input, trusted from the caller.'
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
  - src/errors/case-holds-no-draft.error.ts
inferences:
- inferred: 'The new port method''s exact name and signature, findDraftVersion(slug: string): Promise<number
    | undefined>.'
  from: ICaseStore's own existing naming convention (assembleVersion, createDraft, insertHypothesisRevision,
    placeHypothesis, removeManifestEntry) and the task's own investigated context describing the need
    as "which version, if any, of this case is currently in draft" — no node names a shape for any port
    method here.
- inferred: The refusal is a new, distinct typed error class, CaseHoldsNoDraftError, rather than a reuse
    of CaseVersionNotDraftError or CaseAlreadyHasDraftError.
  from: CaseVersionNotDraftError's own doc comment ties its context ({ slug, version, state }) to callers
    that already know a specific version number and its current state; here no version number exists at
    all when the case holds no draft, so that shape cannot be filled. Modeled instead on the sibling-error
    convention CaseAlreadyHasDraftError and HypothesisRevisionCollectsNoConceptError already establish.
- inferred: refuseWithoutDraft runs first in reviseHypothesis, ahead of refuseInvalidCollects and every
    other check.
  from: The task's own investigated context together with the standard's own EDG-04 reading ("An operation
    attempted against state that forbids it is refused through a typed error raised before any write").
divergences:
- cites: COR-04
  file: src/errors/case-holds-no-draft.error.ts
  departure: CaseHoldsNoDraftError is not added to status-map.ts's STATUS_BY_ERROR_CLASS table, so it
    falls back to the default unmapped answer.
  why: This same operation's three pre-existing refusals (ConceptNotInGlossaryError, HypothesisRevisionCollectsNoConceptError,
    ConceptRefusesSubjectTypeError) are left unmapped there too, per that file's own header note that
    no domain error in this codebase is mapped to a transport status yet. Choosing a status for this one
    new refusal alone is a transport decision no criterion of this corrective task asks for.
preserved:
- reviseHypothesis's three existing concept checks (empty collects, an unknown glossary concept, a concept
  refusing the declared subject type) still run, in the same order, still before the store is ever reached,
  for any case that does hold an open draft.
- reviseHypothesis's success path for a case slug holding a draft — hypothesis identity claimed only once
  per name, the new revision numbered one past the hypothesis's own highest existing revision, and the
  RevisedHypothesis { hypothesis_name, revision } answer shape — is unchanged.
- Every other ICaseStore primitive (assembleVersion, createDraft, insertHypothesisRevision, placeHypothesis,
  removeManifestEntry, release, discard) and RelationalCaseStore's own implementation of each is untouched
  by this delivery.
- seed.ts and case-lifecycle.factory.ts's own production call order — createDraft before reviseHypothesis,
  for every fixture entry — already satisfies the new gate without any change to either file.
deferred:
- what: src/src/__tests__/integration/case/revise-hypothesis.operation.spec.ts's own criterion 1 through
    criterion 5 tests originally called reviseHypothesis without first seeding any public.case_versions
    row for the fixture's slug; test-author's own delivery pass fixed those fixtures to seed a draft,
    since that is test-authorship rather than this record's own writ.
  why: This task's own criteria name only that file's UNDERDETERMINED-note test as what must pass; fixing
    sibling tests' fixtures to keep proving what they always proved is the test-author's judgment, disclosed
    in the proof record.
---

## What it is

Closes a disclosed UNDERDETERMINED gap from revise-hypothesis.operation.ts's own original delivery: the operation never checked whether the named case holds an open draft before originating a hypothesis revision for it.

## Notes

None.
