---
target: frontend
title: Review of case-deletion-frontend
summary: 'Coverage, conformance, standard and failures passes over the case-deletion-frontend delivery:
  a slug-confirmed delete control on the case detail surface for a case holding no version, landing on
  the cases listing once accepted, and presenting the CaseHoldsVersionsError, CaseNotFoundError and unrecognised
  refusals distinctly.'
reviewed:
- src/services/error-ui-state.ts
- src/services/error-ui-state.spec.ts
- src/hooks/use-delete-case.ts
- src/hooks/use-delete-case.spec.ts
- src/services/case-delete-confirmation.ts
- src/hooks/use-case-delete-control.ts
- src/routes/case-delete-dialog.tsx
- src/routes/case-detail-screen.tsx
- src/routes/case-detail-screen-delete-control.spec.ts
- src/routes/case-detail-screen-delete-outcome-listing.spec.ts
- src/routes/case-detail-screen-delete-refusal.spec.ts
tasks:
- task/case-deletion-surface/case-holds-versions-error-state
- task/case-deletion-surface/delete-case-mutation
- task/case-deletion-surface/case-detail-delete-control
- task/case-deletion-surface/case-delete-refusal-presentation
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run passed; nothing to diagnose
coverage:
- criterion: uiStateForApiError, given an ApiError whose code is CaseHoldsVersionsError, does not answer
    the generic error state.
  state: covered
  tests:
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseHoldsVersionsError to a kind no other named code resolves to, distinct from the
      generic fallback
- criterion: The kind uiStateForApiError answers for CaseHoldsVersionsError is distinct from the case-not-found
    kind.
  state: covered
  tests:
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseHoldsVersionsError to a kind no other named code resolves to, distinct from the
      generic fallback
- criterion: uiStateForApiError, given an ApiError whose code is CaseNotFoundError, answers the case-not-found
    kind.
  state: covered
  tests:
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseNotFoundError to the case-not-found state
  - file: src/services/error-ui-state.spec.ts
    name: leaves every error code named before CapabilityCitedByEvidenceError was added resolving to the
      exact kind it resolved to before
- criterion: uiStateForApiError, given an ApiError whose code no map entry names, answers the generic
    error state.
  state: covered
  tests:
  - file: src/services/error-ui-state.spec.ts
    name: resolves a code the table does not name to the generic-error state rather than throwing
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseNotValidError, the retired name the mapping no longer keys on, to the shared generic-error
      state rather than case-not-valid
  - file: src/services/error-ui-state.spec.ts
    name: resolves OpenApiDocumentNotFetchedError, OpenApiDocumentNotReadableError and OpenApiOperationNotFoundError
      to the shared generic-error state rather than a code of their own (capability schema helper's refusal-stated-to-the-operator
      criterion 8)
- criterion: Invoking the mutation for slug s sends exactly one HTTP DELETE request to /v1/cases/s.
  state: covered
  tests:
  - file: src/hooks/use-delete-case.spec.ts
    name: issues a single DELETE request to /v1/cases/:slug for the slug the mutation was invoked with
- criterion: An HTTP 204 answer with an empty body settles the mutation as succeeded.
  state: covered
  tests:
  - file: src/hooks/use-delete-case.spec.ts
    name: reports isSuccess, with no error and no data, once the DELETE answers 204 with no body
  - file: src/hooks/use-delete-case.spec.ts
    name: issues a single DELETE request to /v1/cases/:slug for the slug the mutation was invoked with
  - file: src/hooks/use-delete-case.spec.ts
    name: invalidates the ["cases-list"] query once the delete settles as succeeded
- criterion: A succeeded mutation invalidates the query backing the cases listing.
  state: uncovered
  why: 'The only test that bears on this is a spy on queryClient.invalidateQueries, called with exactly
    {queryKey: ["cases-list"]}. That checks an internal call, not the behavior; it would still pass if
    ["cases-list"] were not the key the cases listing actually uses, since the test hardcodes that key
    and never ties it to the listing. No test in the set holds a cases listing in the query cache before
    a succeeded delete and then observes that listing re-read.'
- criterion: An HTTP 409 answer settles the mutation as failed with an ApiError whose code is CaseHoldsVersionsError.
  state: covered
  tests:
  - file: src/hooks/use-delete-case.spec.ts
    name: reports isError with an ApiError coded CaseHoldsVersionsError when the DELETE answers 409
- criterion: An HTTP 404 answer settles the mutation as failed with an ApiError whose code is CaseNotFoundError.
  state: covered
  tests:
  - file: src/hooks/use-delete-case.spec.ts
    name: reports isError with an ApiError coded CaseNotFoundError when the DELETE answers 404
- criterion: The case detail surface, for a case whose versions read answers no version, offers a control
    to delete that case.
  state: covered
  tests:
  - file: src/routes/case-detail-screen-delete-control.spec.ts
    name: offers a Delete case control once the case's own versions read answers no version
- criterion: Completing the delete act from that control sends exactly one HTTP DELETE request to /v1/cases/<that
    case's slug>.
  state: covered
  tests:
  - file: src/routes/case-detail-screen-delete-control.spec.ts
    name: issues a DELETE to /v1/cases/:slug only once the curator both opens the control and reproduces
      the case's own slug exactly in a further confirm -- never on opening alone, never on a mismatched
      act, and never on declining
  - file: src/routes/case-detail-screen-delete-control.spec.ts
    name: issues exactly one DELETE even when the confirm control is clicked twice in quick succession
- criterion: After the delete is answered with HTTP 204, the cases listing carries no entry for the deleted
    slug.
  state: partial
  tests:
  - file: src/routes/case-detail-screen-delete-outcome-listing.spec.ts
    name: no longer lists the deleted case's own slug and still lists every other case once the curator
      lands on the cases listing
  why: The deleted slug never appears in the stubbed data at all -- the only GET /v1/cases the test serves
    answers with just the other case, and the listing is first read after the delete. The absence being
    asserted comes from the fixture, not from the surface actually dropping a held listing's entry. A
    listing held from before the delete, still carrying the slug, being shown unchanged after the 204
    is not exercised.
- criterion: After the delete is answered with HTTP 204, the cases listing still carries an entry for
    every other case it carried before the delete.
  state: partial
  tests:
  - file: src/routes/case-detail-screen-delete-outcome-listing.spec.ts
    name: no longer lists the deleted case's own slug and still lists every other case once the curator
      lands on the cases listing
  why: The listing is never read before the delete, so the cases "it carried before" are only what the
    post-delete stub is set to return -- one other case. Nothing observes a listing held before the delete
    and compares it with the listing after, and "every" is never exercised over more than one entry.
- criterion: A delete answered with HTTP 409 CaseHoldsVersionsError is presented to the curator as the
    case holding a version and not having been deleted.
  state: partial
  tests:
  - file: src/routes/case-detail-screen-delete-refusal.spec.ts
    name: presents a CaseHoldsVersionsError refusal as the case still holding a version and not having
      been deleted
  - file: src/routes/case-detail-screen-delete-refusal.spec.ts
    name: renders different text for a CaseHoldsVersionsError refusal than for a CaseNotFoundError refusal
  why: 'The "not having been deleted" half is asserted through /not deleted/i. The "holding a version"
    half is asserted only by the same element matching /version/i -- a message saying the opposite (e.g.
    "not deleted: it holds no version") would still pass.'
- criterion: A delete answered with HTTP 404 CaseNotFoundError is presented to the curator as no case
    answering that slug.
  state: covered
  tests:
  - file: src/routes/case-detail-screen-delete-refusal.spec.ts
    name: presents a CaseNotFoundError refusal as the case not having been deleted and no case answering
      the slug
  - file: src/routes/case-detail-screen-delete-refusal.spec.ts
    name: renders different text for a CaseHoldsVersionsError refusal than for a CaseNotFoundError refusal
- criterion: What the surface presents for a CaseHoldsVersionsError refusal differs from what it presents
    for a CaseNotFoundError refusal.
  state: covered
  tests:
  - file: src/routes/case-detail-screen-delete-refusal.spec.ts
    name: renders different text for a CaseHoldsVersionsError refusal than for a CaseNotFoundError refusal
- criterion: A delete refused with any error code other than CaseHoldsVersionsError or CaseNotFoundError
    is presented as a failure distinct from both of those refusals.
  state: partial
  tests:
  - file: src/routes/case-detail-screen-delete-refusal.spec.ts
    name: presents any other refusal as a failure distinct from both named refusals, disclosing neither
      its code, its message, nor any carried value
  why: Only one other code is ever submitted (INTERNAL_ERROR at HTTP 500); nothing sends an unnamed code
    at status 409 or 404, so a surface that picked its presentation by HTTP status instead of error code
    would pass. Distinctness from the holds-versions presentation is checked only against the substring
    "still holds", and no test establishes that the holds-versions message actually contains that wording.
- criterion: After a delete answered with HTTP 409 CaseHoldsVersionsError, the cases listing still carries
    an entry for that slug.
  state: partial
  tests:
  - file: src/routes/case-detail-screen-delete-refusal.spec.ts
    name: still lists the refused case's own slug on the cases listing once a CaseHoldsVersionsError refusal
      is met
  why: The listing is first read after the refusal, from a stubbed GET /v1/cases that always answers with
    the slug -- its presence is decided by the fixture. Nothing exercises the refused delete against a
    listing held from before it.
unpaired:
- test:
    file: src/hooks/use-delete-case.spec.ts
    name: reports the ApiError's own code, INTERNAL_ERROR, unchanged for an HTTP 500 answer -- never CaseNotFoundError
  asserts: For an HTTP 500 answer with code INTERNAL_ERROR, the mutation settles as failed with an ApiError
    whose code is INTERNAL_ERROR and not CaseNotFoundError.
- test:
    file: src/routes/case-detail-screen-delete-control.spec.ts
    name: navigates to the cases listing route once the delete is accepted, rather than staying on the
      deleted case's own detail route
  asserts: After the slug-reproducing confirm and a 204 answer, the router's pathname becomes "/cases".
- test:
    file: src/routes/case-detail-screen-delete-control.spec.ts
    name: renders no Delete case control when the case holds at least one version
  asserts: When the versions read answers one version, the versions table renders and no button named
    "Delete case" is present.
- test:
    file: src/services/error-ui-state.spec.ts
    name: gives each of the ten mapped classes a kind distinct from every other one
  asserts: Ten named codes, from CaseNotFoundError through ManifestWouldHoldNoHypothesisError, resolve
    to ten distinct kinds.
- test:
    file: src/services/error-ui-state.spec.ts
    name: gives each of these four newly mapped classes a kind distinct from the others and from the shared
      generic-error fallback
  asserts: ConceptAlreadyAnsweredError, IncompleteCapabilityContractError, CapabilityNotReadOnlyError
    and CapabilitySchemaNotWellFormedError resolve to four distinct kinds, none of them "generic-error".
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves CapabilityCitedByEvidenceError to a kind no other named code resolves to, distinct
      from the generic fallback
  asserts: The CapabilityCitedByEvidenceError kind is not "generic-error" and differs from the kinds of
    twenty-two listed codes.
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves CapabilityNotReadOnlyError to the capability-not-read-only state
  asserts: CapabilityNotReadOnlyError resolves to kind "capability-not-read-only".
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves CapabilitySchemaNotWellFormedError to the capability-schema-not-well-formed state
  asserts: CapabilitySchemaNotWellFormedError resolves to kind "capability-schema-not-well-formed".
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves CaseAlreadyHasDraftError to the case-already-has-draft state
  asserts: CaseAlreadyHasDraftError resolves to kind "case-already-has-draft".
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves CaseHoldsNoDraftError to the shared generic-error state
  asserts: CaseHoldsNoDraftError, which the map names explicitly, resolves to kind "generic-error".
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves CaseVersionNotDraftAtReleaseError to the case-version-not-draft-at-release state
  asserts: CaseVersionNotDraftAtReleaseError resolves to kind "case-version-not-draft-at-release".
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves CaseVersionNotDraftError to the case-version-not-draft state
  asserts: CaseVersionNotDraftError resolves to kind "case-version-not-draft".
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves CaseVersionNotReleasableError to the case-version-not-releasable state
  asserts: CaseVersionNotReleasableError resolves to kind "case-version-not-releasable".
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves CaseVersionNotValidError, the name the backend's refusal actually carries, to its own
      distinct case-not-valid state, not the shared generic-error fallback
  asserts: CaseVersionNotValidError resolves to kind "case-not-valid", not "generic-error".
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves ConceptAlreadyAnsweredError to the concept-already-answered state
  asserts: ConceptAlreadyAnsweredError resolves to kind "concept-already-answered".
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves ConceptDescriptionRequiredError to a state carrying only the kind, no wording of its
      own
  asserts: The state for ConceptDescriptionRequiredError has exactly one key, "kind".
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves ConceptDescriptionRequiredError to its own distinct concept-description-required state,
      not the shared generic-error fallback
  asserts: ConceptDescriptionRequiredError resolves to kind "concept-description-required", not "generic-error".
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves ConceptInUseError to a kind no other named code resolves to, distinct from the generic
      fallback
  asserts: The ConceptInUseError kind is not "generic-error" and differs from the kinds of twenty-one
    listed codes.
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves ConceptInUseError to a state kind other than the shared generic-error fallback
  asserts: ConceptInUseError does not resolve to kind "generic-error".
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves ConceptNotAnsweredError to the concept-not-answered state
  asserts: ConceptNotAnsweredError resolves to kind "concept-not-answered".
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves ConceptNotHeldError to the concept-not-held state
  asserts: ConceptNotHeldError resolves to kind "concept-not-held".
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves ConceptNotInGlossaryError to the shared generic-error state
  asserts: ConceptNotInGlossaryError, which the map names explicitly, resolves to kind "generic-error".
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves ConceptRefusesSubjectTypeError to the shared generic-error state
  asserts: ConceptRefusesSubjectTypeError, which the map names explicitly, resolves to kind "generic-error".
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves ConnectorConfigurationNotWellFormedError to its own distinct connector-configuration-not-well-formed
      state, not the shared generic-error fallback
  asserts: ConnectorConfigurationNotWellFormedError resolves to kind "connector-configuration-not-well-formed",
    not "generic-error".
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves HypothesisRevisionNotDraftAtReleaseError to a kind no other listed code resolves to,
      distinct from the generic fallback
  asserts: The HypothesisRevisionNotDraftAtReleaseError kind is not "generic-error" and differs from the
    kinds of twenty listed codes.
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves HypothesisRevisionNotDraftAtReleaseError to the hypothesis-revision-not-draft-at-release
      state
  asserts: HypothesisRevisionNotDraftAtReleaseError resolves to kind "hypothesis-revision-not-draft-at-release".
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves IncompleteCapabilityContractError to the incomplete-capability-contract state
  asserts: IncompleteCapabilityContractError resolves to kind "incomplete-capability-contract".
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves ManifestPositionOccupiedError to the manifest-position-occupied state
  asserts: ManifestPositionOccupiedError resolves to kind "manifest-position-occupied".
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves ManifestWouldHoldNoHypothesisError to the manifest-would-hold-no-hypothesis state
  asserts: ManifestWouldHoldNoHypothesisError resolves to kind "manifest-would-hold-no-hypothesis".
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves VocabularyTermNotHeldError to the vocabulary-term-not-held state
  asserts: VocabularyTermNotHeldError resolves to kind "vocabulary-term-not-held".
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves a code the table does not name to a fallback state carrying only the kind, not the
      refusal's own message
  asserts: The state for the unnamed code SomeFutureBackendError has exactly one key, "kind". The test
    does not assert which kind that is.
findings:
- pass: conformance
  file: src/routes/case-delete-dialog.tsx
  where: lines 17-18, the CASE_DELETE_DIALOG_DESCRIPTION constant rendered as DialogDescription
  evidence: '"This removes the case together with every hypothesis referencing it, every hypothesis-revision
    of those hypotheses and every collect those revisions hold. This cannot be undone."'
  cost: rules/knowledge/a-case-holding-no-version-may-be-deleted already states, as its own authority,
    exactly what an accepted delete removes ("the case itself, every hypothesis referencing it, every
    hypothesis-revision of those hypotheses, released ones included, and every collect those revisions
    hold") and that nothing restores it. The dialog hard-codes a near-restatement of that same list (already
    dropping "released ones included") as its own copy. Should the rule's scope of what delete removes
    ever change, this string has no dependency on the rule and would keep telling a curator confirming
    an irreversible act a consequence the specification no longer states.
  correction: Replace the hard-coded enumeration with wording derived from (or generated alongside) rules/knowledge/a-case-holding-no-version-may-be-deleted,
    so the list of what delete removes has one home.
- pass: conformance
  file: src/routes/case-detail-screen.tsx
  where: VersionsPanel — the hasDraft computation (line 93) and the conditional hiding of the New-draft
    control (lines 97-103)
  evidence: const hasDraft = data.data.some((version) => version.state === "draft"); ... {!hasDraft &&
    ( <Button ...>New draft</Button> )}
  cost: Whether a curator may even attempt to start a second draft is decided here, in the client, by
    withholding the control entirely once one draft already exists, rather than offering it and letting
    create-draft answer with the disclosed refusal rules/knowledge/a-case-has-at-most-one-draft states.
    That node says only what create-draft answers when asked; it says nothing about a versions listing
    pre-emptively withholding its own route to create-draft. A reader checking the specification for what
    capability this screen exposes around drafting will find the backend refusal and its disclosure, but
    not the fact that the control disappears before the curator ever reaches it.
  correction: State, alongside rules/knowledge/a-case-has-at-most-one-draft (or in a node of its own),
    whether and when a case-versions listing withholds its own create-draft route once the case already
    holds a draft.
- pass: standard
  file: src/routes/case-detail-screen.tsx
  where: VersionsPanel, the hasDraft derivation used to gate the New draft button
  cites: ARC-03
  evidence: const hasDraft = data.data.some((version) => version.state === "draft");
  cost: Whether a case currently holds a draft is a decision made straight from the fetched version list,
    computed in-line in the render function rather than delegated to a hook or service the way the same
    component already does for its row and action data (toRow, actionsForRow, useCaseCurrentVersionValidity).
    A second view needing the same fact has to copy this .some() check rather than call something shared,
    and a test of that fact can only reach it by rendering the whole panel.
  correction: Move the derivation into a hook (e.g. alongside useCaseVersions or as its own use-case-has-draft-version)
    or a named service function, and have VersionsPanel read the resulting flag rather than computing
    it inline.
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
reconciliation: siegard-reconcile/case-deletion-frontend.md
run: run/case-deletion-frontend
---

## What it is

Coverage, conformance, standard-conformance and failures passes over the case-deletion-frontend
delivery (tasks case-holds-versions-error-state, delete-case-mutation, case-detail-delete-control
and case-delete-refusal-presentation): a slug-confirmed delete control on the case detail surface
for a case holding no version, landing on the cases listing once accepted, and presenting the
CaseHoldsVersionsError, CaseNotFoundError and unrecognised refusals as three distinguishable
statements.

## Notes

Conformance: 2 findings. One against src/routes/case-delete-dialog.tsx (the delete-consequence
copy hard-codes a near-restatement of rules/knowledge/a-case-holding-no-version-may-be-deleted's
own enumeration of what delete removes, with no dependency tying the two together). One against
src/routes/case-detail-screen.tsx (an unstated fact: the New-draft control is pre-emptively
hidden once a draft already exists, a client-side gate rules/knowledge/a-case-has-at-most-one-draft
does not itself state).

Standard: 1 finding (ARC-03) against the same hasDraft derivation in case-detail-screen.tsx,
computed inline rather than delegated to a hook or service.

Coverage: 18 criteria across 4 tasks — 13 covered, 5 partial. Every partial state traces to the
same root cause: a test asserting a post-delete or post-refusal fact against a listing fixture
that was never read before the delete/refusal, so the fixture itself (not the surface's own
behavior) supplies the "before" state the criterion depends on. 31 tests in the reviewed file set
bear on no criterion any task under this review states (unpaired) — all but three are pre-existing
tests of sibling error codes in error-ui-state.spec.ts, caught only because that file was widened
for the new CaseHoldsVersionsError entry.

Failures: the whole-project suite (install, typecheck, lint, style, build, a11y, secret-scan,
test) was captured green at run/case-deletion-frontend; nothing to diagnose.

Contested (not settled here, per /review-change's own restraint): case-detail-delete-control's
own proof records a two-producer disagreement over rules/knowledge/a-case-deletion-surface-states-which-refusal-answered-its-delete's
accepted clause ("where the delete was accepted, the surface states that the case was deleted")
— that task's implementation chose silent navigation with no such statement, while its own
`implements` list carries the node whole with no `encoded_at`. This review's own certification of
that same node (over case-detail-delete-control.spec.ts's landing-destination test) independently
found it only `partial` for an unrelated reason (the test's own stub route never renders the real
listing), so the node's accepted clause remains open on two fronts: the disputed implementation
choice, and an untested landing-surface identity.

Trace: trace.py --fold and --bind-record ran over this record; 23 nodes cleared and bound, 6 the
judgment did not clear (left decided by reading or contested, unbound by this act) — including
rules/knowledge/a-case-holding-no-version-may-be-deleted, held back specifically by the
case-delete-dialog.tsx finding above. No orphaned or moved drift was found over the reviewed file
set itself.
