---
title: Proof for the New Draft origination flow
summary: Twenty-one tests, across five files, proving Case Detail's "New draft" visibility rule, the blank form's subject pre-set, the POST /v1/cases request it issues, its switch into edit-draft-version's own PATCH flow addressed at the returned version with no follow-up GET, and the 409 CaseAlreadyHasDraftError toast-plus-redirect.
implementation: sha256:37d869998af527675ca363de3be1d783fd227c7f32120c52411b5fd7a2843bdd
run: run/version-editor-onda-3-full-suite
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
tests:
  - file: src/routes/case-detail-screen.spec.ts
    name: "renders New draft as a link to the case's own new-draft route when none of the case's versions is a draft"
    proves: "\"New draft\" is rendered in Case Detail only when none of that case's existing versions is currently in draft state."
    fails_when: the Link stops rendering when every version is released, or its href stops pointing at "/cases/$slug/versions/new"
  - file: src/routes/case-detail-screen.spec.ts
    name: does not render New draft when one of the case's versions is already a draft
    proves: "\"New draft\" is rendered in Case Detail only when none of that case's existing versions is currently in draft state."
    fails_when: the Link renders even though one of the fetched versions has state "draft"
  - file: src/routes/case-detail-screen.spec.ts
    name: renders New draft when the case currently holds no versions at all
    proves: "\"New draft\" is rendered in Case Detail only when none of that case's existing versions is currently in draft state. -- the empty-collection edge of the same rule (.some() over an empty list is vacuously false)"
    fails_when: the Link fails to render, or throws, when the version list comes back empty
  - file: src/routes/case-detail-screen.spec.ts
    name: shows a loading placeholder before the version list arrives
    proves: the added assertion (New draft absent) proves nothing decides visibility before the version list this decision depends on has arrived
    fails_when: New draft renders while the screen is still in its loading phase, before any version data exists to compute hasDraft from
  - file: src/routes/case-detail-screen.spec.ts
    name: shows a failure placeholder when the version list request fails
    proves: the added assertion (New draft absent) proves the failure path never renders New draft over data it never received
    fails_when: New draft renders on the error path despite the version list never having loaded
  - file: src/routes/new-case-draft-screen.spec.ts
    name: renders a blank form with no version's content pre-loaded, other than the subject field pre-set from the glossary
    proves: Clicking "New draft" opens the Version Editor with no version's content pre-loaded, and the subject field pre-set to the one subject-type value GET /v1/glossary/subject-type currently returns.
    fails_when: Title or When to use render with any non-blank value, or the subject field is not disabled
  - file: src/routes/new-case-draft-screen.spec.ts
    name: pre-sets the subject field to the one subject-type value GET /v1/glossary/subject-type currently returns
    proves: "Clicking \"New draft\" opens the Version Editor ... the subject field pre-set to the one subject-type value GET /v1/glossary/subject-type currently returns. -- specifically that the value is read from the API rather than a hardcoded default"
    fails_when: the subject field shows a fixed value regardless of what GET /v1/glossary/subject-type returns
  - file: src/routes/new-case-draft-screen.spec.ts
    name: does not pre-set the subject field when the subject-type vocabulary currently returns no terms
    proves: the pre-set effect's own guard (subjectValue !== undefined) against the empty-collection edge case of criterion 2
    fails_when: the subject field throws, or is set to some invented value, when the vocabulary currently holds no terms
  - file: src/routes/new-case-draft-screen.spec.ts
    name: shows a loading placeholder before the glossary vocabularies arrive
    proves: the loading phase this screen owns while criterion 2's own pre-set dependency (the glossary reads) is still in flight
    fails_when: the form (or anything from the "ready" phase) renders before the glossary vocabularies have loaded
  - file: src/routes/new-case-draft-screen.spec.ts
    name: shows a failure placeholder with a retry action when a glossary vocabulary fails to load
    proves: the load-error phase this screen owns when a dependency (the glossary read criterion 2 relies on) fails
    fails_when: the screen renders the form (or crashes) instead of the retry placeholder when a glossary read fails
  - file: src/routes/new-case-draft-screen.spec.ts
    name: does not issue POST /v1/cases when Save is clicked before any required field is filled in
    proves: the absent-input edge case of criterion 3 -- Save on a wholly blank form never reaches the network
    fails_when: a POST is issued for a submission that fails caseVersionFormSchema's own required fields
  - file: src/routes/new-case-draft-screen-save.spec.ts
    name: issues POST /v1/cases with slug, the curator's entered content and a client-side authored_at timestamp when Save is clicked
    proves: "Clicking Save on that blank form issues POST /v1/cases with { slug, title, when_to_use, authored_at, subject, fallback } built from the curator's entered content, the case's own slug from the route, and a client-side authored_at timestamp captured at the moment of that save."
    fails_when: the POST body carries a different field set (e.g. an included consolidation_register or source_version), a wrong slug, content that does not match what was entered, or an authored_at outside the window the test itself observed around the click
  - file: src/routes/new-case-draft-screen-save.spec.ts
    name: issues exactly one POST when Save is clicked twice in quick succession
    proves: the concurrency edge case (two operations against one subject at once) of criterion 3's own Save dispatch, mirroring edit-draft-version's own isSubmittingRef guard
    fails_when: two POST requests are issued for two Save clicks that raced before the first one's mutation started
  - file: src/routes/new-case-draft-screen-save.spec.ts
    name: leaves the curator on the blank form, re-enabled and still switched into create mode, when Save fails for a reason other than a 409
    proves: the dependency-failure edge case of criterion 3/4 -- a non-409 POST failure neither silently switches into edit mode nor leaves Save permanently blocked
    fails_when: Save stays disabled after the failed POST resolves, or a second click issues a PATCH instead of a second POST (which would mean the hook wrongly switched into edit mode on a non-201 response)
  - file: src/routes/new-case-draft-screen-save.spec.ts
    name: does not issue POST /v1/cases when a field is blurred, unlike edit-draft-version's own blur-triggered auto-save
    proves: the implementation's own disclosed no-op onFieldBlur for the blank form (this task's own inference, distinguishing it from edit-draft-version's blur-triggered save)
    fails_when: blurring a field on the blank form issues a POST
  - file: src/routes/new-case-draft-screen-save.spec.ts
    name: seeds the switched-in form from the content just submitted and the returned version, issuing no follow-up GET, and leaves Save disabled (nothing new to save yet)
    proves: That switch to edit mode seeds the form from the content just submitted and the returned version number, without issuing a follow-up GET /v1/cases/{slug}/versions/{version}.
    fails_when: the switched-in form shows anything other than the just-submitted title, or a GET to /v1/cases/{slug}/versions/{version} is ever issued, or Save is left enabled with nothing new to save
  - file: src/routes/new-case-draft-screen-save.spec.ts
    name: stays addressable at the New Draft route after a successful create, rather than navigating to the created version's own URL
    proves: the implementation's own disclosed inference -- criterion 4's "addressed by the version number" is read as which resource Save now updates, not as the browser's own location
    fails_when: the router navigates to "/cases/$slug/versions/{version}" after a successful create
  - file: src/routes/new-case-draft-screen-save.spec.ts
    name: issues a PATCH to the created version's own URL, not another POST, when Save is clicked again after switching into edit mode
    proves: A 201 response to that POST switches the form into the same edit-mode flow edit-draft-version delivers for an existing draft, addressed by the version number the response returns.
    fails_when: a subsequent Save issues another POST, or a PATCH to any URL other than "/v1/cases/{slug}/versions/{the returned version}"
  - file: src/routes/new-case-draft-screen-conflict.spec.ts
    name: shows a toast that a draft already exists for the case, and navigates to that case's existing draft version
    proves: "A 409 CaseAlreadyHasDraftError response to that POST shows a toast stating a draft already exists for the case and navigates to that case's existing draft version, resolved by reading GET /v1/cases/{slug}/versions."
    fails_when: the toast is not shown with that exact wording, or the router does not land on the version the version list names as the draft
  - file: src/routes/new-case-draft-screen-conflict.spec.ts
    name: stays on the New Draft screen without navigating when the version list read for the redirect names no draft
    proves: the redirect's own guard (if (existingDraft)) against a version list that, at the moment of the redirect read, names no draft
    fails_when: the screen navigates anywhere despite the version list holding no draft entry
  - file: src/routes/new-case-draft-screen-conflict.spec.ts
    name: stays on the New Draft screen without throwing when reading the version list for the redirect itself fails
    proves: the redirect's own try/catch -- a failed GET during the 409 redirect degrades silently rather than crashing the screen
    fails_when: the failed GET throws uncaught, or the screen navigates somewhere despite never learning where the draft is
not_applicable:
  - edge_case: GET /v1/glossary/subject-type returning more than one term
    why: domain/glossary/subject-type is documented (and this task's own hook comments confirm it against the seed fixtures) as holding exactly one value; a test asserting behavior for more than one would assert a guarantee nothing in this task's scope makes
  - edge_case: more than one version simultaneously in draft state, in either Case Detail's own list or the version list the 409 redirect reads
    why: rules/knowledge/a-case-has-at-most-one-draft guarantees the backend never returns more than one draft entry, and both call sites use .some()/.find(), which behave identically whether one or many matching entries are present -- a second test would exercise the same code path already covered
  - edge_case: a boundary at each end of a numeric range
    why: no criterion of this task involves a numeric range; every check here is a state (draft/released), a presence/absence, or a string comparison
  - edge_case: a duplicate slug or case identity
    why: no criterion of this task states or depends on slug uniqueness; the slug is read from the route, not chosen by the curator, and origination never creates a second case for one slug
untested:
  - the "New Draft" breadcrumb label app-shell.tsx's ROUTE_LABELS now carries for this route is never asserted -- no criterion of this task states a breadcrumb requirement, and the existing app-shell.spec.ts precedent does not test every route's own label either, only two of the original ten
  - the exact wording of the generic "Something went wrong while saving. Try again." toast shown on a non-409 POST failure is not asserted at the content level -- only that the curator is left on a still-usable, create-mode form is proven, mirroring edit-draft-version's own proof, which likewise never asserted that fallback message's content
  - a partially-filled submission (e.g. title filled but When to use still blank) blocking Save is not separately exercised -- only the wholly-blank case is tested; the validation mechanism itself (react-hook-form's zodResolver) is shared, already-established machinery this task did not write
  - the two-Save-clicks concurrency guard and the blur-vs-click race on the switched-in edit form both depend on Promise microtask ordering between two independently-triggered handleSubmit calls; this proof exercises them the same way edit-draft-version's own analogous guard was already exercised, but that ordering is not something a test can pin down as a stronger guarantee than the implementation's own ref-based check already provides
---

## What it is
Proves new-draft-creation's six criteria: five tests extend the existing case-detail-screen.spec.ts (the "New draft" visibility rule), and sixteen more are split across new-case-draft-screen.spec.ts (loading/pre-set/blank-submission), new-case-draft-screen-save.spec.ts (the POST, its concurrency guard, the switch into edit mode) and new-case-draft-screen-conflict.spec.ts (the 409 toast-plus-redirect), sharing fixtures through new-case-draft-screen.test-support.ts.

## Notes
case-detail-screen.spec.ts was extended rather than duplicated, per the task's own dependency on case-detail-timeline; it stayed under this project's own ESLint max-lines rule without needing a split.
edit-draft-version's own proof (case-version-editor-screen.spec.ts / -save.spec.ts) was re-run after this task's own widening of use-glossary-vocabulary.ts and use-edit-draft-version-form.ts; all seventeen of its tests still pass, confirming this task's own claim (in its implementation record's `preserved` list) that edit-draft-version's call site is unaffected.
