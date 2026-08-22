---
title: Revise/New-hypothesis form, over the real POST body shape
summary: A shared form for both a blank "New hypothesis" route and a pre-loaded "Revise" route, filtering
  Collects client-side by the draft's own subject type, dispatching the real POST /v1/cases/{slug}/hypotheses,
  and showing one generic failure state for any of that endpoint's four unmapped domain errors.
task: sha256:1f7b5252475663349263b1c0090082e8b60d71994e1844f9e65dc0a8ac4259a3
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/manifest-hypothesis-authoring-onda-4-full-suite
files:
- path: src/services/hypothesis-revision-form-schema.ts
  effect: declares hypothesisRevisionFormSchema (Zod) and HypothesisRevisionFormValues for the form's
    own editable fields (hypothesis_name, criterion, collects, resolution), mirroring revise-hypothesis.dto.ts's
    own reviseHypothesisBodySchema field-for-field except that collects additionally requires at least
    one entry, enforcing rules/knowledge/a-hypothesis-collects-at-least-one-concept client-side before
    any request is sent
- path: src/hooks/use-concept-options.ts
  effect: reads every concept the glossary currently holds through GET /v1/glossary/concepts and returns
    each concept's own name and accepts list intact, a sibling of use-glossary-vocabulary.ts for the one
    vocabulary that needs more than a term's name
- path: src/hooks/use-hypothesis-revision-form.ts
  effect: the shared form's own state machine -- loads the addressed draft's declared subject type (GET
    /v1/cases/{slug}/versions/{version}) and, on the Revise route only, the addressed hypothesis's current
    revision (GET /v1/cases/{slug}/hypotheses/{name}/revisions); filters Collects to concepts accepting
    that subject type; and dispatches POST /v1/cases/{slug}/hypotheses on submit, exposing loading/load-error/ready/success
    phases
- path: src/routes/hypothesis-revision-form-fields.tsx
  effect: renders the shared form's own fields -- hypothesis name (editable only for New), fixed subject
    type, criterion, Collects checkboxes, and resolution outcome / referral action / referral recipient
    dropdowns
- path: src/routes/hypothesis-revision-screen.tsx
  effect: composes useHypothesisRevisionForm's loading/load-error/ready/success phases and HypothesisRevisionFormFields
    into the one screen both new routes render
- path: src/routes/new-hypothesis-screen.tsx
  effect: reads the New-hypothesis route's own slug/version params and renders HypothesisRevisionScreen
    with hypothesisName null
- path: src/routes/revise-hypothesis-screen.tsx
  effect: reads the Revise route's own slug/version/hypothesisName params and renders HypothesisRevisionScreen
    addressed at that hypothesis
- path: src/routes/route-tree.tsx
  effect: registers the new "/cases/$slug/versions/$version/manifest/hypotheses/new" route (NewHypothesisScreen),
    ranking over the existing "$hypothesisName" param route the same way "versions/new" already ranks
    over "versions/$version", and swaps that existing route's own component from ManifestHypothesisPlaceholder
    to ReviseHypothesisScreen
- path: src/shared/components/app-shell.tsx
  effect: adds a "New Hypothesis" breadcrumb label to ROUTE_LABELS for the new route
criteria:
- criterion: The "New hypothesis" entry point and the "Revise" entry point resolve to two distinct routes,
    so a hypothesis literally named "new" is addressed by the Revise route rather than being captured
    by the New-hypothesis route.
  met: true
  how: route-tree.tsx registers a static "/cases/$slug/versions/$version/manifest/hypotheses/new" route
    (NewHypothesisScreen) alongside the existing "/.../hypotheses/$hypothesisName" route (now ReviseHypothesisScreen);
    TanStack Router ranks the static segment over the param segment regardless of declaration order, the
    same convention already used for "versions/new" beside "versions/$version".
- criterion: Visiting the New-hypothesis route renders a blank form with the current draft's own subject
    type shown fixed and non-editable, and no hypothesis name pre-filled.
  met: true
  how: NewHypothesisScreen passes hypothesisName=null into useHypothesisRevisionForm; its defaultValues
    leave hypothesis_name "" and hypothesisNameEditable is true (the Input stays enabled but empty); subjectType
    is always read from the addressed draft version and rendered through a permanently disabled, read-only
    Input regardless of route.
- criterion: Visiting the Revise route for an existing hypothesis pre-populates the form's criterion,
    collects, resolution outcome, and referral action/recipient fields from that hypothesis's current
    revision, with the hypothesis name shown fixed and non-editable.
  met: true
  how: ReviseHypothesisScreen passes the route's own $hypothesisName; useHypothesisRevisionForm reads
    GET /v1/cases/{slug}/hypotheses/{name}/revisions, resets the form from the revision holding the highest
    revision number ("current"), and sets hypothesisNameEditable to false so the Input renders disabled.
- criterion: The Collects field offers only concepts whose own accepts list, read from GET /v1/glossary/concepts,
    includes the draft version's declared subject type.
  met: true
  how: useHypothesisRevisionForm filters useConceptOptions's own full concept list to those whose accepts
    array includes the loaded subjectType, and only that filtered list (collectsOptions) is rendered as
    checkboxes in hypothesis-revision-form-fields.tsx.
- criterion: The resolution outcome dropdown offers exactly the terms GET /v1/glossary/outcome currently
    returns, and the referral action and recipient dropdowns each offer exactly the terms GET /v1/glossary/action
    and GET /v1/glossary/recipient currently return.
  met: true
  how: useHypothesisRevisionForm calls the existing useGlossaryVocabularyOptions("outcome"|"action"|"recipient")
    hook unchanged, and hypothesis-revision-form-fields.tsx's three Select controls render exactly those
    options.
- criterion: Submitting the form with no concept checked in Collects is refused before any request is
    sent.
  met: true
  how: hypothesisRevisionFormSchema's collects field is z.array(z.string().min(1)).min(1); zodResolver
    refuses the submission and form.handleSubmit's onValid callback (and therefore reviseMutation) never
    runs.
- criterion: Submitting the form with an empty criterion is refused before any request is sent.
  met: true
  how: hypothesisRevisionFormSchema's criterion field is z.string().min(1), refused the same way before
    any request is dispatched.
- criterion: Submitting the form with no resolution outcome selected, or no referral action or recipient
    selected, is refused before any request is sent.
  met: true
  how: hypothesisRevisionFormSchema's resolution.outcome, resolution.referral.action and resolution.referral.recipient
    are each z.string().min(1); an unselected dropdown (default value "") fails validation before submit.
- criterion: Submitting a form that passes those checks issues POST /v1/cases/{slug}/hypotheses with a
    body of exactly { hypothesis_name, criterion, collects, resolution, subject } built from the form's
    own current content and the draft's own subject type.
  met: true
  how: reviseMutation's mutationFn builds body = { hypothesis_name, criterion, collects, resolution }
    from the form's own validated values plus subject read from versionQuery.data.subject (the draft's
    own declared subject type), and POSTs exactly those five keys.
- criterion: A 201 response renders the returned hypothesis_name and revision, and offers a control that
    navigates to the Manifest Builder for the current draft version.
  met: true
  how: on reviseMutation.isSuccess, useHypothesisRevisionForm returns phase "success" carrying the response's
    own hypothesis_name and revision; hypothesis-revision-screen.tsx renders both and an "Open Manifest
    Builder" button whose onClick navigates to "/cases/$slug/versions/$version/manifest" for the same
    draft version.
- criterion: A CaseHoldsNoDraftError, HypothesisRevisionCollectsNoConceptError, ConceptNotInGlossaryError,
    ConceptRefusesSubjectTypeError, or any other error response to that POST renders one shared generic
    failure message, never a per-concept highlight.
  met: true
  how: reviseMutation's onError always calls the same toast.error("Something went wrong while saving.
    Try again.") regardless of which error the server returned; error-ui-state.ts (unchanged, already
    delivered) already collapses all four onto its shared generic-error kind, and no code path here inspects
    error.details or highlights a concept.
nodes:
- node: contracts/glossary/glossary-query
  encoded_at:
  - src/hooks/use-concept-options.ts
  how: list-concepts is read through use-concept-options.ts's own GET /v1/glossary/concepts call; list-vocabulary-terms
    (outcome/action/recipient) is read by reusing the already-delivered use-glossary-vocabulary.ts unchanged.
- node: contracts/knowledge/case-lifecycle
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  how: revise-hypothesis is dispatched via POST /v1/cases/{slug}/hypotheses in use-hypothesis-revision-form.ts's
    own mutationFn, with the exact body shape { hypothesis_name, criterion, collects, resolution, subject
    }.
- node: contracts/knowledge/case-query
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  how: list-hypothesis-revisions is read to pre-populate the Revise route's form from the hypothesis's
    current revision; the case-version read (GET /v1/cases/{slug}/versions/{version}) supplies the draft's
    declared subject type both routes anchor against.
- node: domain/glossary/action
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
  how: the referral action Select's options are exactly the action terms the glossary currently holds,
    and the submitted body's resolution.referral.action is one of those terms.
- node: domain/glossary/concept
  encoded_at:
  - src/hooks/use-concept-options.ts
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
  how: a concept's own name and accepts list are read and used to build the Collects checkboxes, filtered
    to those accepting the draft's subject type.
- node: domain/glossary/outcome
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
  how: the resolution outcome Select's options are exactly the outcome terms the glossary currently holds,
    and the submitted body's resolution.outcome is one of those terms.
- node: domain/glossary/recipient
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
  how: the referral recipient Select's options are exactly the recipient terms the glossary currently
    holds, and the submitted body's resolution.referral.recipient is one of those terms.
- node: domain/glossary/subject-type
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
  how: the draft's own declared subject type is read once, held fixed for the whole form, shown in a disabled
    Input, and used both to filter Collects and to fill the submitted body's subject field.
- node: domain/knowledge/case-version
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  how: the addressed case version's own declared subject attribute is read (GET /v1/cases/{slug}/versions/{version})
    and is the one field of that aggregate this form reads.
- node: domain/knowledge/hypothesis
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
  - src/routes/new-hypothesis-screen.tsx
  - src/routes/revise-hypothesis-screen.tsx
  how: the hypothesis's own stable name is either typed fresh (New route, editable) or addressed by the
    route's own param and rendered fixed (Revise route, disabled) -- never itself revised, matching the
    node's own description that a name never changes across revisions.
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/services/hypothesis-revision-form-schema.ts
  - src/hooks/use-hypothesis-revision-form.ts
  how: the form's own criterion, collects and resolution fields are exactly this aggregate's own declared
    content attributes, and a valid submission always originates a new revision through POST, never edits
    one in place.
- node: domain/knowledge/referral
  encoded_at:
  - src/services/hypothesis-revision-form-schema.ts
  - src/routes/hypothesis-revision-form-fields.tsx
  how: action and recipient are modeled and rendered as one paired referral, both required before submit.
- node: domain/knowledge/resolution
  encoded_at:
  - src/services/hypothesis-revision-form-schema.ts
  - src/routes/hypothesis-revision-form-fields.tsx
  how: outcome and referral are modeled and rendered as one paired resolution, both required before submit.
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  how: Collects is filtered client-side to concepts whose accepts list includes the draft's subject type
    -- a pre-check only, per this task's own Notes; the server remains the final authority and any refusal
    it still raises collapses into the shared generic failure state (criterion 11).
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  encoded_at:
  - src/services/hypothesis-revision-form-schema.ts
  how: the client-side schema requires collects.min(1), refusing an empty submission before any request
    is sent (criterion 6); the server's own named refusal (HypothesisRevisionCollectsNoConceptError) remains
    the authority behind it.
- node: rules/knowledge/a-hypothesis-declares-a-criterion
  encoded_at:
  - src/services/hypothesis-revision-form-schema.ts
  how: the client-side schema requires criterion.min(1), refusing an empty submission before any request
    is sent (criterion 7).
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  how: the concept-acceptance pre-check and the submitted body's own subject both anchor to the one case
    version this form is addressed at (the route's own $version), never to a subject type read or chosen
    independently; whether that version is actually the case's current draft is left to the server, which
    answers CaseHoldsNoDraftError (collapsed into the shared generic failure state, criterion 11) when
    it is not.
- node: rules/knowledge/case-terms-exist-in-the-glossary
  encoded_at:
  - src/hooks/use-concept-options.ts
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
  how: every Collects checkbox and every resolution-outcome/referral-action/referral-recipient option
    is built directly from what the glossary currently returns, so no submission can name a term absent
    from those lists; the subject-type clause is not reached here per this task's own Notes (this form
    only ever reads the draft's already-declared subject type, never originates or re-validates one).
- node: rules/knowledge/every-position-declares-a-resolution
  encoded_at:
  - src/services/hypothesis-revision-form-schema.ts
  - src/routes/hypothesis-revision-form-fields.tsx
  how: the hypothesis-revision's own resolution (outcome plus referral) is required before submit; the
    fallback clause is not reached here per this task's own Notes (this form touches only a hypothesis-revision's
    own resolution).
inferences:
- inferred: collects requires at least one item at the client-side schema layer even though the real reviseHypothesisBodySchema
    validates only an array of strings with no minimum length.
  from: criterion 6's explicit request for a pre-request refusal, together with revise-hypothesis.dto.ts's
    own header comment stating that the backend deliberately leaves that minimum to HypothesisRevisionCollectsNoConceptError,
    its own named business refusal, rather than enforcing it at the DTO boundary.
- inferred: a hypothesis's own "current" revision, for pre-populating the Revise route, is the one GET
    /v1/cases/{slug}/hypotheses/{name}/revisions's own page names with the highest revision number.
  from: relational-case-store.repository.ts's own hypothesisRevisionsPageSelect, which orders rows ascending
    by revision; no node or DTO names "current" directly, and every hypothesis is guaranteed at least
    one revision by the domain.
- inferred: GET /v1/glossary/concepts's own default page is read once and assumed to hold every concept
    the glossary currently registers, without paginating through total/pageCount.
  from: use-glossary-vocabulary.ts's own established convention for the other three vocabularies, and
    this app's own inventory confirming the seed fixtures are small enough to fit inside the route's configured
    default page.
- inferred: the New-hypothesis and Revise routes both read the addressed case version's own subject under
    the same react-query key ['case-version', slug, version] use-edit-draft-version-form.ts already uses
    for the identical GET.
  from: the established React Query key convention recorded by the inventory ('arrays of a resource name
    followed by its scoping ids'), and this being literally the same backend resource read for two different
    reasons.
- inferred: a hypothesis-revision's own previously-collected concept that no longer accepts the draft's
    current subject type stays in the form's collects value on load, but is not offered an interactive
    checkbox to toggle (Collects only renders concepts currently accepting the draft's subject type).
  from: no criterion of this task addresses this edge case, and rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
    anchors the acceptance check to the draft's subject type at the moment of each revision, which can
    differ from whichever draft's subject type is current now.
divergences:
- from: the FormField label-wraps-control convention the inventory names at case-version-editor-form-fields.tsx
    ('must_not_duplicate')
  departure: the Collects field uses a native <fieldset>/<legend> pair for its own grouping caption instead
    of wrapping its content in FormField's own outer <label>, in hypothesis-revision-form-fields.tsx.
  why: TUI's own Checkbox component already renders its own <label htmlFor> around its own <input>; nesting
    that inside a second, shared outer <label> (as FormField would) associates several distinct controls
    with one label element, which is invalid HTML and leaves assistive technology unable to tell which
    control the outer label actually names. A fieldset/legend pair is the standard grouping semantics
    for a set of independently-labeled checkboxes.
preserved:
- Every other route already registered in route-tree.tsx (cases list, case detail, version editor, new
  draft, version manifest, version release, version discard, glossary, capabilities, case hypotheses)
  keeps its existing path and component unchanged.
- The "/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName" route's own path string stays
  exactly as route-tree.tsx and app-shell.tsx's ROUTE_LABELS already declared it -- only its component
  swaps from ManifestHypothesisPlaceholder to ReviseHypothesisScreen.
- app-shell.tsx's existing ROUTE_LABELS entries and the Sidebar/Topbar composition for every other route
  are unchanged.
- route-placeholders.tsx's own ManifestHypothesisPlaceholder component stays defined and untouched, left
  unused per that file's own already-established precedent (CaseVersionPlaceholder, CasesListPlaceholder,
  CaseDetailPlaceholder) for a placeholder whose route was replaced by a real screen.
deferred:
- what: wiring a trigger into the Manifest Builder's own "+ Add hypothesis" action, or into the Hypotheses
    tab's own "Revise" action, to navigate into these two new routes.
  why: both triggers belong to sibling tasks in this same epic (the Manifest Builder and the Hypotheses
    tab), neither of which this task's own `implements` list or criteria reach; only the routes and the
    form they open are this task's objective.
---

## What it is
The section 2.5 New hypothesis/Revise form the scope describes, over the real POST body shape the scope's own backend-reading confirms (which includes subject explicitly, unlike the original wireframe).
Reuses the existing glossary-term-vocabulary hook as-is for the outcome/action/recipient dropdowns; concepts need their own accepts-aware read, since that hook only carries a term's name today.

## Notes
The single generic-failure-message behavior for any of the four hypothesis-revision domain errors is stated directly by the scope as a fact about the backend's real current behavior -- all four currently collapse to an indistinguishable 500 -- and is not a decomposition choice this task makes.
The client-side subject-type pre-check is a pre-checkage only, never the final authority; the server remains the authority the scope's own material states it to be.
The fifth criterion (glossary-sourced resolution outcome/referral dropdowns) was added after this task's own binder first ran without it and returned an underdetermined note: as originally written, a free-text implementation of resolution outcome/referral would have satisfied every stated criterion while still letting a submission name an outcome, action or recipient the glossary does not hold, which rules/knowledge/case-terms-exist-in-the-glossary refuses. The binder was re-run against the corrected criteria and confirmed the gap closed.
rules/knowledge/case-terms-exist-in-the-glossary's subject-type clause is not reached here: this form only ever reads the draft's already-declared subject type as a fixed, non-editable value; it never originates or re-validates one. That clause belongs to the task that declares a case-version's own subject type (already delivered: new-draft-creation, Onda 3).
rules/knowledge/every-position-declares-a-resolution's fallback clause (a case version's own fallback resolution) is not reached here either: this form touches only a hypothesis-revision's own resolution. That clause belongs to the tasks that author a case-version's own fallback (already delivered: edit-draft-version and new-draft-creation, Onda 3).
This implementation depends on a vite.config.ts fix (see task/manifest-hypothesis-authoring/manifest-builder's own implementation record) landed after this task by the concurrently-delivered manifest-builder task, without which TUI's own hooks-using components would crash in this app's test/dev/build environments; this task itself uses no TUI component affected by that issue (no Tooltip or Dialog), so it neither caused nor needed that fix on its own.
