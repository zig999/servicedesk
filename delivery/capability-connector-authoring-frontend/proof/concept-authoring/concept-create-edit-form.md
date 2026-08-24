---
title: Proof for the concept create/edit form on the Glossary screen's Concepts tab
summary: Three spec files mounting GlossaryBrowserScreen end to end prove the "New concept"/"Edit" actions,
  the required accepts multi-select, ttl's own client-side requirement, the register-concept PUT for both
  create and edit, and the disclosed inferences (name disabled while editing, no new error-ui-state entry,
  accepts as a Checkbox group, ttl required with no default).
implementation: sha256:433341f2c2220ab749a2fa59c2e32ba15e18334c27b5c049bb447de2bf45c20a
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/concept-authoring-concept-create-edit-form-suite-6
tests:
- file: src/routes/glossary-browser-screen-concept-form.spec.ts
  name: opens a Dialog with an empty, enabled name field, an unchecked accepts checkbox per subject type,
    and an empty ttl field
  proves: The Concepts tab offers a "New concept" action that opens a form for name, accepts and ttl.
  fails_when: '"New concept" fails to open a Dialog, or any of name/accepts/ttl is missing, pre-filled
    with a stale value, or the name field is disabled in create mode'
- file: src/routes/glossary-browser-screen-concept-form.spec.ts
  name: opens a Dialog whose name, accepts and ttl fields already hold that row's own current values
  proves: Each concept in the Concepts tab offers an edit action that opens the same form pre-filled with
    that concept's current name, accepts and ttl.
  fails_when: the Edit action opens a blank form, or any field (name, an accepts checkbox, ttl) does not
    reflect that row's own already-loaded data
- file: src/routes/glossary-browser-screen-concept-form.spec.ts
  name: renders the Name field disabled while editing, so the concept's own name cannot be changed
  proves: the disclosed inference that editing an existing concept disables the name field rather than
    merely pre-filling it
  fails_when: the Name field is left enabled (no disabled attribute) while editing an existing concept
- file: src/routes/glossary-browser-screen-concept-form.spec.ts
  name: shows a loading placeholder inside the Dialog before the subject-type vocabulary arrives
  proves: 'edge case: a dependency that answers slowly — the accepts multi-select''s own subject-type
    read gates the form behind an explicit loading phase rather than rendering blank or broken fields'
  fails_when: the Dialog renders the name/accepts/ttl fields (or nothing at all) before the subject-type
    request resolves, instead of the loading placeholder
- file: src/routes/glossary-browser-screen-concept-form.spec.ts
  name: shows a load-failure message with a Retry action inside the Dialog when the subject-type vocabulary
    fails to load, and Retry re-issues that same request
  proves: 'edge case: a dependency that fails — the same accepts vocabulary read degrades to an explicit,
    retryable error state rather than an indefinite loading state or a blank Dialog'
  fails_when: no failure message/Retry control appears on a failed subject-type request, or clicking Retry
    issues no new request to that same path
- file: src/routes/glossary-browser-screen-concept-form-accepts.spec.ts
  name: submits every checked subject type, in the order each was checked, when more than one is selected
  proves: The accepts field lets the operator select more than one subject type and persists exactly the
    selected set, no more and no fewer; also demonstrates the disclosed inference that accepts is composed
    as a labeled group of Checkboxes rather than a dropdown
  fails_when: the submitted PUT body's accepts array omits a checked subject type, includes one that was
    never checked, or does not match the checked order
- file: src/routes/glossary-browser-screen-concept-form-accepts.spec.ts
  name: drops exactly the subject type that is unchecked, keeping the rest of an existing concept's own
    selection intact
  proves: The accepts field lets the operator select more than one subject type and persists exactly the
    selected set, no more and no fewer.
  fails_when: unchecking one previously-selected subject type also drops or duplicates another, or the
    unchecked one still appears in the submitted set
- file: src/routes/glossary-browser-screen-concept-form-accepts.spec.ts
  name: blocks submission and issues no PUT when no subject type is selected, showing the accepts group's
    own error
  proves: Submitting the form with no subject type selected in accepts is blocked, accepts being a required
    field.
  fails_when: a PUT is issued despite no subject type being checked, or the accepts group shows no error
- file: src/routes/glossary-browser-screen-concept-form-accepts.spec.ts
  name: blocks submission and issues no PUT when ttl is left empty, even though a subject type is selected
  proves: the disclosed inference that ttl is required client-side with no default, even though the backend
    accepts an absent ttl and substitutes its own default
  fails_when: a PUT is issued while ttl was never filled in, or the ttl field shows no invalid/error state
- file: src/routes/glossary-browser-screen-concept-form-save.spec.ts
  name: issues PUT /v1/glossary/concepts/{name} at the typed name, closes the Dialog, and the Concepts
    tab shows the new concept afterward
  proves: A successful create or edit registers the concept at the given name, and the Concepts tab reflects
    the change afterward.
  fails_when: the PUT targets the wrong path or body, the Dialog stays open after success, or the Concepts
    tab does not show the newly created concept afterward
- file: src/routes/glossary-browser-screen-concept-form-save.spec.ts
  name: issues PUT /v1/glossary/concepts/{name} at the existing name with the edited accepts and ttl,
    and the Concepts tab shows the change afterward
  proves: A successful create or edit registers the concept at the given name, and the Concepts tab reflects
    the change afterward.
  fails_when: the edit PUT targets a different name than the one being edited, carries a stale accepts/ttl,
    or the Concepts tab keeps showing the pre-edit values afterward
- file: src/routes/glossary-browser-screen-concept-form-save.spec.ts
  name: shows the shared generic save-failure toast and keeps the Dialog open, since register-concept
    throws no domain error
  proves: the disclosed inference that no entry was added to error-ui-state.ts for register-concept, falling
    back to the same generic toast use-edit-draft-version-form.ts already uses
  fails_when: no toast is shown on a failed save, a different message is shown, the toast fires more than
    once, or the Dialog closes despite the failure
- file: src/routes/glossary-browser-screen-concept-form-save.spec.ts
  name: issues exactly one PUT when Save is clicked twice before the first request resolves
  proves: 'edge case: two operations against one subject at once — a double-click on Save must not register
    the same concept twice'
  fails_when: two PUT requests are issued for two rapid clicks on Save
not_applicable:
- edge_case: two operations racing against the same concept from two different callers (an optimistic-concurrency
    conflict on register-concept)
  why: GlossaryService.registerConcept has no precondition check of its own — it only overwrites whatever
    concept currently stands at that name — so there is no conflict response for a test to trigger or
    assert against
- edge_case: the subject-type vocabulary returning zero terms, leaving the accepts group empty
  why: no criterion of this task states a distinct behavior for an empty subject-type vocabulary, and
    the underlying vocabulary hook's own empty-response handling is already proven at its own level
untested:
- the exact validation-message text rendered for a missing ttl — the tests assert only that the ttl field
  is marked aria-invalid and carries a non-empty message, since the concrete wording zod's resolver produces
  is a library-version detail no criterion of this task states
- whether a failed save also disturbs the ["glossary","concepts"] cache entry use-concept-options.ts reads
  — this proof only mounts GlossaryBrowserScreen, which never reads that key itself
- whether an empty (or whitespace-only) concept name is refused before a PUT is issued — no criterion
  of this task names this behavior explicitly
- whether closing the Dialog while it holds unsaved edits warns the operator or discards silently — no
  criterion of this task addresses this
---

## What it is

Thirteen tests mounting GlossaryBrowserScreen end to end, proving the concept create/edit form's five stated criteria plus the implementation's own disclosed inferences.

## Notes

run/concept-authoring-concept-create-edit-form-suite failed at typecheck (a tuple-typing mismatch in a test-support helper, fixed as test infrastructure).
run/concept-authoring-concept-create-edit-form-suite-2 and -3 failed at typecheck/lint fixing that same helper and a testing-library/no-node-access violation (fixed as test infrastructure).
run/concept-authoring-concept-create-edit-form-suite-4 failed at test: 11 failures, diagnosed cause: test — a race between synchronous getBy queries and the form's own async loading phase, fixed by awaiting findBy in each of the 11 tests.
run/concept-authoring-concept-create-edit-form-suite-5 failed at test: 1 failure (double-click Save issuing two PUTs), diagnosed cause: code — fixed in the implementation (isDispatchingRef guard), not in this proof.
run/concept-authoring-concept-create-edit-form-suite-6 passed in full.
