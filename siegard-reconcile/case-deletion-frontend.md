---
contract_version: siegard-reconcile/5
title: Review of case-deletion-frontend
summary: 'Delivers the frontend half of case deletion: a slug-confirmed delete control on the case detail
  surface for a case holding no version, wired to a mutation issuing DELETE /v1/cases/:slug, landing on
  the cases listing once accepted, and presenting the CaseHoldsVersionsError, CaseNotFoundError and unrecognised
  refusals as three distinguishable statements.'
target: frontend
files:
- path: src/hooks/use-case-delete-control.ts
  change: New hook. Wires useDeleteCase() and useNavigate() into buildCaseDeleteControlState's onConfirm
    — mutate(slug) fires the DELETE, onSuccess navigates to /cases, onError sets the dialog's error message
    via caseDeleteFailureMessage.
- path: src/hooks/use-delete-case.spec.ts
  change: 'New tests over useDeleteCase: the wire request, 204 success and cache invalidation, 409/404
    error-code pass-through, and the unmapped-code pass-through for any other answer.'
- path: src/hooks/use-delete-case.ts
  change: New file. useDeleteCase(), a useMutation issuing DELETE /v1/cases/:slug via apiFetch<void>,
    invalidating the ["cases-list"] query on success.
- path: src/routes/case-delete-dialog.tsx
  change: New presentational component. A typed-slug-confirmation Dialog ("Delete case"), rendering control.errorMessage
    inline as a role="alert" paragraph when a refusal is met.
- path: src/routes/case-detail-screen-delete-control.spec.ts
  change: New tests over the delete control's visibility, its slug-confirmation gating, exactly-one DELETE
    under a double click, and post-accept navigation to the cases listing.
- path: src/routes/case-detail-screen-delete-outcome-listing.spec.ts
  change: 'New test over the cases listing''s own state once an accepted delete is followed to its landing
    surface: the deleted slug gone, every other case still present.'
- path: src/routes/case-detail-screen-delete-refusal.spec.ts
  change: New tests over the rendered refusal notice for CaseHoldsVersionsError, CaseNotFoundError, and
    any other error code, and over the cases listing's own state once a refusal is met.
- path: src/routes/case-detail-screen.tsx
  change: VersionsPanel now calls useCaseDeleteControl(slug) and renders CaseDeleteDialog next to the
    "This case currently holds no version." paragraph, only in the zero-version branch.
- path: src/services/case-delete-confirmation.ts
  change: New service module. buildCaseDeleteControlState derives the slug-confirmation gate (reusing
    discard-confirmation.ts's isSlugConfirmed) and, in a later addition, caseDeleteFailureMessage(error,
    slug) mapping a caught delete error to one of three distinguishable messages.
- path: src/services/error-ui-state.spec.ts
  change: New test proving CaseHoldsVersionsError resolves to a kind distinct from every other named code
    and from the generic fallback; existing regression tests (CaseNotFoundError, unnamed codes) left unchanged.
- path: src/services/error-ui-state.ts
  change: Adds a case-holds-versions member to UiErrorStateKind and a CaseHoldsVersionsError entry to
    UI_STATE_BY_ERROR_CODE, following ConceptInUseError's own shape.
nodes:
- node: constraints/a-successful-case-deletion-answers-with-no-content
  conforms: true
  how: "src/hooks/use-case-delete-control.ts: held at nowhere in this file — the hook never inspects a\
    \ response body or status; it only reacts to success/error callbacks — onSuccess: () => {\n      \
    \  void navigate({ to: \"/cases\" });\n      },\nsrc/hooks/use-delete-case.ts: held at the mutationFn's\
    \ declared success type and its DELETE call — apiFetch<void>(`/v1/cases/${encodeURIComponent(slug)}`,\
    \ { method: \"DELETE\" })"
  encoded_at:
  - src/hooks/use-case-delete-control.ts
  - src/hooks/use-delete-case.ts
- node: contracts/investigation/case-simulation
  conforms: true
  how: "src/routes/case-detail-screen.tsx: held at actionsForRow — the Simulate link rendered for every\
    \ row regardless of version state — <Button type=\"button\" variant=\"secondary\" asChild>\n  <Link\
    \ to=\"/cases/$slug/versions/$version/simulate\" params={params}>\n    Simulate\n  </Link>\n</Button>"
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: 'src/hooks/use-case-delete-control.ts: held at the invocation of the delete operation inside onConfirm
    — const deleteCase = useDeleteCase(); ... deleteCase.mutate(slug, {

    src/hooks/use-delete-case.ts: held at the mutationFn issuing the delete against the case''s own path
    — apiFetch<void>(`/v1/cases/${encodeURIComponent(slug)}`, { method: "DELETE" })'
  encoded_at:
  - src/hooks/use-case-delete-control.ts
  - src/hooks/use-delete-case.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: 'src/routes/case-detail-screen.tsx: held at VersionsPanel — the list-case-versions read backing
    the table — const { data, isLoading, isError, refetch } = useCaseVersions(slug);

    ...

    const rows = data.data.map((version) => toRow(slug, version));'
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: domain/knowledge/case
  conforms: true
  how: 'src/hooks/use-case-delete-control.ts: held at the function''s own slug parameter, threaded through
    the whole hook — export function useCaseDeleteControl(slug: string): CaseDeleteControlState {

    src/hooks/use-delete-case.ts: held at the mutation''s variable type, carrying the case''s slug — mutationFn:
    (slug: string) =>

    src/routes/case-delete-dialog.tsx: held at the slug-confirmation label, which reads the case''s own
    slug attribute — <span>Type {control.slug} to confirm</span>

    src/routes/case-detail-screen.tsx: held at CaseDetailScreen — the heading naming the case by its slug
    — <h1>Case {slug}</h1>

    src/services/case-delete-confirmation.ts: held at the slug field of CaseDeleteControlState and its
    use in isConfirmEnabled: isSlugConfirmed(slugConfirmation, slug) and in caseNotFoundMessage(slug)
    — readonly slug: string; ... isConfirmEnabled: isSlugConfirmed(slugConfirmation, slug),'
  encoded_at:
  - src/hooks/use-case-delete-control.ts
  - src/hooks/use-delete-case.ts
  - src/routes/case-delete-dialog.tsx
  - src/routes/case-detail-screen.tsx
  - src/services/case-delete-confirmation.ts
- node: domain/knowledge/case-version
  conforms: true
  how: "src/routes/case-detail-screen.tsx: held at toRow — each row's own version number and state — return\
    \ {\n  id: version.version,\n  version: version.version,\n  state: STATE_CELL[version.state],\n  actions:\
    \ actionsForRow(slug, version),\n};"
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: domain/knowledge/case-version-state
  conforms: true
  how: "src/routes/case-detail-screen.tsx: held at STATE_CELL — mapping exactly the two enumerated states\
    \ — const STATE_CELL: Record<CaseVersionState, { color: string; label: string }> = {\n  draft: { color:\
    \ \"bg-warning\", label: \"Draft\" },\n  released: { color: \"bg-success\", label: \"Released\" },\n\
    };"
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: rules/glossary/a-concept-declares-its-description
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the entry mapping ConceptDescriptionRequiredError to its
    own dedicated kind, line 60 — ConceptDescriptionRequiredError: { kind: "concept-description-required"
    },'
  encoded_at:
  - src/services/error-ui-state.ts
- node: rules/integration/a-capability-declares-well-formed-schemas
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the entry mapping CapabilitySchemaNotWellFormedError to
    its own dedicated kind, line 55 — CapabilitySchemaNotWellFormedError: { kind: "capability-schema-not-well-formed"
    },'
  encoded_at:
  - src/services/error-ui-state.ts
- node: rules/integration/a-capability-is-read-only
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the entry mapping CapabilityNotReadOnlyError to its own
    dedicated kind, line 54 — CapabilityNotReadOnlyError: { kind: "capability-not-read-only" },'
  encoded_at:
  - src/services/error-ui-state.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the entry mapping ConnectorConfigurationNotWellFormedError
    to its own dedicated kind, line 58 — ConnectorConfigurationNotWellFormedError: { kind: "connector-configuration-not-well-formed"
    },'
  encoded_at:
  - src/services/error-ui-state.ts
- node: rules/integration/one-capability-answers-one-concept
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the entry mapping ConceptAlreadyAnsweredError to its own
    dedicated kind, line 47 — ConceptAlreadyAnsweredError: { kind: "concept-already-answered" },'
  encoded_at:
  - src/services/error-ui-state.ts
- node: rules/knowledge/a-case-deletion-refusal-the-surface-cannot-name-is-told-as-an-unrecognised-failure
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-case-delete-control.ts, src/services/case-delete-confirmation.ts,
    src/services/error-ui-state.ts, and src/routes/case-delete-dialog.tsx read `nowhere` — the error paragraph
    renders whatever string the control supplies without itself distinguishing a recognised refusal from
    an unrecognised one — the discrimination this rule requires is not performed in this file — a binding
    asserts the file answers for the node, so the pair that stopped holding it is released by `--bind
    ... --replace`, never restamped here'
  observed_at:
  - src/hooks/use-case-delete-control.ts
  - src/routes/case-delete-dialog.tsx
  - src/services/case-delete-confirmation.ts
  - src/services/error-ui-state.ts
- node: rules/knowledge/a-case-deletion-surface-states-which-refusal-answered-its-delete
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-case-delete-control.ts, src/services/case-delete-confirmation.ts,
    src/services/error-ui-state.ts, and src/routes/case-delete-dialog.tsx read `nowhere` — the generic
    error rendering, {control.errorMessage}, carries whichever message the control already resolved; this
    file does not itself compute or select the per-refusal wording the rule requires — a binding asserts
    the file answers for the node, so the pair that stopped holding it is released by `--bind ... --replace`,
    never restamped here'
  observed_at:
  - src/hooks/use-case-delete-control.ts
  - src/routes/case-delete-dialog.tsx
  - src/services/case-delete-confirmation.ts
  - src/services/error-ui-state.ts
- node: rules/knowledge/a-case-deletion-takes-a-further-explicit-act-reproducing-the-cases-own-slug
  conforms: true
  how: 'src/routes/case-delete-dialog.tsx: held at the slug-confirmation input paired with the confirm
    button''s disabled condition — <span>Type {control.slug} to confirm</span> together with the Input
    bound to control.slugConfirmation and disabled={!control.isConfirmEnabled || control.isDeleting} on
    the confirm button

    src/services/case-delete-confirmation.ts: held at the slugConfirmation state and isConfirmEnabled
    computation in buildCaseDeleteControlState — const [slugConfirmation, setSlugConfirmation] = params.slugConfirmation;
    ... isConfirmEnabled: isSlugConfirmed(slugConfirmation, slug),'
  encoded_at:
  - src/routes/case-delete-dialog.tsx
  - src/services/case-delete-confirmation.ts
- node: rules/knowledge/a-case-has-at-most-one-draft
  conforms: true
  how: 'src/routes/case-detail-screen.tsx: held at VersionsPanel — the hasDraft gate that keeps the create-draft
    control from ever being taken a second time — const hasDraft = data.data.some((version) => version.state
    === "draft");

    {!hasDraft && ( ... New draft ... )}'
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: rules/knowledge/a-case-holding-no-version-may-be-deleted
  conforms: false
  how: 'src/routes/case-delete-dialog.tsx, lines 17-18, the CASE_DELETE_DIALOG_DESCRIPTION constant rendered
    as DialogDescription: "This removes the case together with every hypothesis referencing it, every
    hypothesis-revision of those hypotheses and every collect those revisions hold. This cannot be undone."
    — rules/knowledge/a-case-holding-no-version-may-be-deleted already states, as its own authority, exactly
    what an accepted delete removes ("the case itself, every hypothesis referencing it, every hypothesis-revision
    of those hypotheses, released ones included, and every collect those revisions hold") and that nothing
    restores it. The dialog hard-codes a near-restatement of that same list (already dropping "released
    ones included") as its own copy. Should the rule''s scope of what delete removes ever change, this
    string has no dependency on the rule and would keep telling a curator confirming an irreversible act
    a consequence the specification no longer states, with nothing forcing the two into agreement.'
  observed_at:
  - src/hooks/use-delete-case.ts
  - src/routes/case-detail-screen.tsx
  - src/services/case-delete-confirmation.ts
- node: rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
  conforms: true
  how: "src/routes/case-detail-screen.tsx: held at VersionsPanel — the not-valid Alert, held apart from\
    \ the read-failed and no-version branches — {currentVersion.phase === \"not-valid\" && (\n  <Alert\
    \ variant=\"destructive\" title=\"Error\">\n    This case's current version does not read back as\
    \ a case.\n  </Alert>\n)}"
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
  conforms: false
  how: "no named file holds this fact now: src/hooks/use-delete-case.ts read `nowhere` — return useMutation({\n\
    \  mutationFn: (slug: string) =>\n    apiFetch<void>(`/v1/cases/${encodeURIComponent(slug)}`, { method:\
    \ \"DELETE\" }),\n  onSuccess: () => {\n    void queryClient.invalidateQueries({ queryKey: [\"cases-list\"\
    ] });\n  },\n});; src/services/case-delete-confirmation.ts read `nowhere` — function caseNotFoundMessage(slug:\
    \ string): string {\n  return `This case was not deleted: no case answers ${slug}.`;\n}\nthis only\
    \ renders text for an already-classified \"case-not-found\" kind; it\nstates nothing about the HTTP\
    \ 404 response or the refusal's details"
  observed_at:
  - src/hooks/use-delete-case.ts
  - src/services/case-delete-confirmation.ts
- node: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the entry mapping CaseVersionNotValidError to its own
    dedicated kind, line 66 — CaseVersionNotValidError: { kind: "case-not-valid" },'
  encoded_at:
  - src/services/error-ui-state.ts
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the entry mapping HypothesisRevisionNotDraftAtReleaseError
    to its own dedicated kind, line 45 — HypothesisRevisionNotDraftAtReleaseError: { kind: "hypothesis-revision-not-draft-at-release"
    },'
  encoded_at:
  - src/services/error-ui-state.ts
- node: rules/knowledge/a-listed-case-version-offers-a-route-to-its-own-manifest
  conforms: true
  how: "src/routes/case-detail-screen.tsx: held at actionsForRow — the Manifest link rendered for every\
    \ row regardless of version state — <Link to=\"/cases/$slug/versions/$version/manifest\" params={params}>\n\
    \  Manifest\n</Link>"
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
  conforms: true
  how: "src/routes/case-detail-screen.tsx: held at VersionsPanel — the isError branch and the read-failed\
    \ phase branch, both stating the same generic text and nothing about the refusal itself — <p>Unable\
    \ to load this case's version timeline.</p>\n...\n{currentVersion.phase === \"read-failed\" && (\n\
    \  <p>Unable to load this case's version timeline.</p>\n)}\nsrc/services/error-ui-state.ts: held at\
    \ the generic fallback of uiStateForApiError, lines 69-71, which returns GENERIC_ERROR_STATE for any\
    \ code the table does not name — const state = UI_STATE_BY_ERROR_CODE[error.code]; return state ??\
    \ GENERIC_ERROR_STATE;"
  encoded_at:
  - src/routes/case-detail-screen.tsx
  - src/services/error-ui-state.ts
- node: rules/knowledge/a-successful-case-deletion-lands-on-the-listing-of-every-case
  conforms: true
  how: "src/hooks/use-case-delete-control.ts: held at the onSuccess callback passed to deleteCase.mutate\
    \ — onSuccess: () => {\n        void navigate({ to: \"/cases\" });\n      },"
  encoded_at:
  - src/hooks/use-case-delete-control.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'Mount the case detail screen under the application''s own route tree, not a stub tree.
    Use a case holding no version, perform the delete, and answer it as accepted. Then assert that the
    curator lands on the rendered listing of every case: the list-cases request (GET /v1/cases) is issued
    and its answer is presented. Also assert that no surface keyed on the deleted slug is rendered.'
- node: rules/knowledge/every-case-version-remains-readable
  conforms: false
  how: 'no named file holds this fact now: src/routes/case-detail-screen.tsx read `nowhere` — const rows
    = data.data.map((version) => toRow(slug, version)); — the file presents whatever the listing read
    answers; it holds no logic of its own for retaining or discarding a version, that being the store''s
    own guarantee'
  observed_at:
  - src/routes/case-detail-screen.tsx
- node: scenarios/glossary/a-concept-with-no-description-is-refused
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the same entry as a-concept-declares-its-description,
    line 60 — ConceptDescriptionRequiredError: { kind: "concept-description-required" },'
  encoded_at:
  - src/services/error-ui-state.ts
- node: scenarios/knowledge/a-case-holding-no-version-is-deleted
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-case-delete-control.ts, src/hooks/use-delete-case.ts,
    and src/routes/case-detail-screen.tsx read `nowhere` — const caseDelete = useCaseDeleteControl(slug);
    ... <CaseDeleteDialog control={caseDelete} /> — the accept/removal outcome is delegated to a hook
    and a dialog not in this file — a binding asserts the file answers for the node, so the pair that
    stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/hooks/use-case-delete-control.ts
  - src/hooks/use-delete-case.ts
  - src/routes/case-detail-screen.tsx
- node: scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly
  conforms: true
  how: 'src/routes/case-detail-screen.tsx: held at VersionsPanel — the explicit empty-state paragraph
    — <p>This case currently holds no version.</p>'
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: scenarios/knowledge/releasing-an-already-released-revision-tells-the-curator-so
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the same entry as a-hypothesis-revision-moves-through-its-declared-lifecycle,
    line 45 — HypothesisRevisionNotDraftAtReleaseError: { kind: "hypothesis-revision-not-draft-at-release"
    },'
  encoded_at:
  - src/services/error-ui-state.ts
unstated:
- file: src/routes/case-detail-screen.tsx
  where: VersionsPanel — the hasDraft computation (line 93) and the conditional hiding of the New-draft
    control (lines 97-103)
  evidence: "const hasDraft = data.data.some((version) => version.state === \"draft\");\n...\n{!hasDraft\
    \ && (\n  <Button type=\"button\" variant=\"secondary\" asChild>\n    <Link to=\"/cases/$slug/versions/new\"\
    \ params={{ slug }}>\n      New draft\n    </Link>\n  </Button>\n)}"
  cost: Whether a curator may even attempt to start a second draft is decided here, in the client, by
    withholding the control entirely once one draft already exists, rather than offering it and letting
    create-draft answer with the disclosed refusal rules/knowledge/a-case-has-at-most-one-draft states.
    That node says only what create-draft answers when asked; it says nothing about a versions listing
    pre-emptively withholding its own route to create-draft. A reader checking the specification for what
    capability this screen exposes around drafting will find the backend refusal and its disclosure, but
    not the fact that the control disappears before the curator ever reaches it — that fact exists only
    in this component.
unbound:
- src/hooks/use-delete-case.spec.ts
- src/routes/case-detail-screen-delete-control.spec.ts
- src/routes/case-detail-screen-delete-outcome-listing.spec.ts
- src/routes/case-detail-screen-delete-refusal.spec.ts
- src/services/error-ui-state.spec.ts
notes: 'Judged by 11 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/case-deletion-frontend.returns/.

  Certification of rules/knowledge/a-case-deletion-refusal-the-surface-cannot-name-is-told-as-an-unrecognised-failure
  did not hold: the auditor answered `partial` — The unrecognised-failure notice is tested with one refusal
  only: code INTERNAL_ERROR at HTTP status 500. The fact depends on the error code, not the status, but
  nothing in the set sends an unnamed code at a status the two named refusals use. For example, no test
  sends an unknown code at 409 or at 404. A surface that chose its notice by status would pass the file
  while showing the case-holds-versions or case-not-found statement for an unnamed code. The fact rules
  that out. The "states nothing else" half has the same kind of gap. The not-toContain checks for the
  code, the refusal''s own message and the carried traceId run only against the textContent of the one
  element matched by /recognis|recogniz/. That element is found by its own text nodes. If the code, message
  or value appeared anywhere else on the surface, such as a sibling element, a detail line or an attribute,
  the test would still pass. Distinguishability from the CaseNotFoundError statement is bound: the unrecognised
  text must not contain "no case answers", and the CaseNotFoundError test requires exactly that wording.
  Distinguishability from the CaseHoldsVersionsError statement is bound only by the check that the text
  does not contain "still holds". Nothing establishes that the CaseHoldsVersionsError statement contains
  those words; its own test requires only "not deleted" and "version". So that part holds only by accident
  of the current wording. No test compares the two rendered texts directly, as the criterion-3 test does
  for the two named refusals.. The node is decided by reading, and a certification standing on it from
  an earlier reconciliation is released by the bind. The remainder is testable: Issue a delete that is
  refused with a code other than CaseHoldsVersionsError and CaseNotFoundError, once at status 409 and
  once at status 404. Each time, expect the unrecognised-failure notice. Expect its rendered text to differ
  from the text rendered for a CaseHoldsVersionsError refusal and for a CaseNotFoundError refusal of the
  same delete, compared directly across mounts. Expect the refusal''s code, its message and each value
  in its details to appear nowhere in the rendered document, not only outside the notice''s own element..

  Certification of rules/knowledge/a-successful-case-deletion-lands-on-the-listing-of-every-case did not
  hold: the auditor answered `partial` — The part of the fact about the slug is covered. After an accepted
  delete of case-alpha (DELETE /v1/cases/case-alpha answered 204), the test checks that the router''s
  pathname is exactly "/cases". That rules out every surface keyed on the deleted slug: the detail route
  /cases/case-alpha, the version route /cases/case-alpha/versions/$version, and the new-draft route. If
  the landing moved to any of those, or stayed where it was, the test would fail.

  The part saying the destination is the surface that presents the listing of every case, which list-cases
  answers, is not exercised. The test builds its own router. In that router "/cases" is a stub placeholder
  component that makes no list-cases request. So the test only binds the navigation target to the literal
  path "/cases". It never shows that this path is the listing surface. It also never checks that the placeholder
  text renders or that GET /v1/cases is issued. If the application''s "/cases" route stopped presenting
  the listing of every case, the fact would stop holding and this test would still pass.. The node is
  decided by reading, and a certification standing on it from an earlier reconciliation is released by
  the bind. The remainder is testable: Mount the case detail screen under the application''s own route
  tree, not a stub tree. Use a case holding no version, perform the delete, and answer it as accepted.
  Then assert that the curator lands on the rendered listing of every case: the list-cases request (GET
  /v1/cases) is issued and its answer is presented. Also assert that no surface keyed on the deleted slug
  is rendered..

  Staged by a review over files a delivery wrote: every pair a delivery or a hand stamped was judged,
  and a pair was omitted only where a reconciliation''s judgment had cleared it at these very bytes; the
  plan''s node(s) rules/knowledge/a-case-holding-no-version-may-be-deleted, constraints/a-successful-case-deletion-answers-with-no-content,
  scenarios/knowledge/a-case-holding-no-version-is-deleted, rules/knowledge/a-case-deletion-takes-a-further-explicit-act-reproducing-the-cases-own-slug,
  rules/knowledge/a-successful-case-deletion-lands-on-the-listing-of-every-case, rules/knowledge/a-case-deletion-surface-states-which-refusal-answered-its-delete,
  rules/knowledge/a-case-deletion-refusal-the-surface-cannot-name-is-told-as-an-unrecognised-failure were
  read on every file and answered for, and bound from nowhere here — a binding this record writes is one
  the trace already held.

  Candidates: 0 opened across 0 of 11 delegation(s); each return lists its own under `candidates_opened`.

  Unstated: 1 fact(s) the source states that no node holds, over 1 file(s), listed under `unstated`. They
  block no binding here and no rebind closes them — the route is the analysis that gives each fact a node.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/case-deletion-frontend.returns/`, which are the evidence behind every entry above.
