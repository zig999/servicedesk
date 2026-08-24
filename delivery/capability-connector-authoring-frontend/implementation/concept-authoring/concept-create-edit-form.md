---
title: Concept create and edit form on the Glossary screen's Concepts tab
summary: Adds a shared create/edit Dialog for a concept's name, accepts and ttl to the Glossary screen's
  Concepts tab, dispatching PUT /v1/glossary/concepts/{name} for both modes and invalidating the tab's
  own query on success.
task: sha256:8cec3b81b1015637d4471f5d9fc17513c94edcd2e0e3ba923e0a7dfb6125ab69
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/concept-authoring-concept-create-edit-form-suite-6
files:
- path: src/services/concept-form-schema.ts
  effect: New file. The zod schema for the form's three fields (name, accepts as a non-empty string array,
    ttl as a required positive integer), mirroring the backend's registerConceptBodySchema plus name from
    registerConceptParamsSchema.
- path: src/hooks/use-concept-form.ts
  effect: 'New file. useConceptForm(existing, onSaved) — the shared create(null)/edit(concept) hook: builds
    react-hook-form state from conceptFormSchema, reads the subject-type vocabulary for the accepts multi-select,
    disables the name field in edit mode, dispatches PUT /v1/glossary/concepts/{name} through apiFetch
    on submit, and on success invalidates both ["glossary","concepts-with-ttl"] (the Concepts tab''s own
    query) and ["glossary","concepts"] (use-concept-options.ts''s sibling cache entry over the same endpoint).
    A synchronous isDispatchingRef guards the exported onSubmit itself (set before react-hook-form''s
    async zod validation runs, cleared once that validation/mutation settles), refusing a second dispatch
    that arrives before mutation.isPending has had a chance to re-render the Save button disabled — fixed
    after a suite failure showed two rapid clicks issuing two PUTs instead of one.'
- path: src/routes/concept-form-fields.tsx
  effect: 'New file. ConceptFormFields: the name/accepts/ttl markup — name and ttl as labeled Input fields
    (name disabled in edit mode), accepts as a labeled fieldset of Checkboxes (one per subject-type option)
    wired through a react-hook-form Controller, with aria-invalid/aria-describedby linking each field''s
    (and the accepts group''s) error to its own error paragraph.'
- path: src/routes/concept-form-dialog.tsx
  effect: New file. ConceptFormDialog(target, onClose) — the Dialog composing useConceptForm and ConceptFormFields,
    controlled entirely by the caller's own ConceptFormTarget state rather than a DialogTrigger, with
    its own loading/load-error/ready branches.
- path: src/routes/glossary-browser-screen.tsx
  effect: Modified. ConceptsPanel gained an unconditional "New concept" Button (ahead of the loading/error/empty
    branches) that opens ConceptFormDialog in create mode, and each concept row gained an "Edit" action
    opening the same dialog pre-filled from that row's already-loaded data; the five read-only term-vocabulary
    tabs are untouched.
criteria:
- criterion: The Concepts tab offers a "New concept" action that opens a form for name, accepts and ttl.
  met: true
  how: 'ConceptsPanel renders an unconditional "New concept" Button that sets formTarget to { mode: "create"
    }, mounting ConceptFormDialog with useConceptForm(null, ...) — a blank form for name, accepts and
    ttl.'
- criterion: Each concept in the Concepts tab offers an edit action that opens the same form pre-filled
    with that concept's current name, accepts and ttl.
  met: true
  how: 'Each row''s "Edit" Button sets formTarget to { mode: "edit", concept }, mounting the identical
    ConceptFormDialog/ConceptFormFields pair with useConceptForm(concept, ...), whose defaultValues pre-fill
    name, a copy of accepts, and ttl from the row''s already-loaded GlossaryConcept.'
- criterion: The accepts field lets the operator select more than one subject type and persists exactly
    the selected set, no more and no fewer.
  met: true
  how: AcceptsField renders one Checkbox per subject-type option from useGlossaryVocabularyOptions("subject-type"),
    wired through a single react-hook-form Controller on the accepts array field; toggling adds or removes
    exactly the one toggled value from the current array, and the mutation submits values.accepts verbatim
    in the PUT body.
- criterion: Submitting the form with no subject type selected in accepts is blocked, accepts being a
    required field.
  met: true
  how: conceptFormSchema declares accepts as z.array(z.string().min(1)).min(1), wired via zodResolver;
    react-hook-form's handleSubmit never calls the mutation while validation fails, and errors.accepts.message
    renders through the accepts fieldset's own error paragraph, linked via aria-describedby.
- criterion: A successful create or edit registers the concept at the given name, and the Concepts tab
    reflects the change afterward.
  met: true
  how: The mutation issues PUT /v1/glossary/concepts/{name} (contracts/glossary/glossary-authoring's register-concept,
    both create and edit) with the same request shape in both modes; onSuccess invalidates ["glossary","concepts-with-ttl"],
    the exact query key the Concepts tab's own read uses, so it refetches and reflects the change, and
    closes the dialog.
nodes:
- node: domain/glossary/concept
  encoded_at:
  - src/services/concept-form-schema.ts
  - src/hooks/use-concept-form.ts
  - src/routes/concept-form-fields.tsx
  how: The form schema and its fields carry exactly the concept's three declared attributes (name, accepts
    many:true, ttl), all required — the form requires all three and the accepts multi-select draws from
    the closed subject-type vocabulary this attribute names.
- node: contracts/glossary/glossary-authoring
  encoded_at:
  - src/hooks/use-concept-form.ts
  how: Both create and edit dispatch the one published register-concept operation (PUT /v1/glossary/concepts/{name})
    with an identical request shape, matching the contract's own "creating it at a new name, or replacing
    whatever concept already stood at that name" — never a distinct create vs. edit endpoint.
inferences:
- inferred: Editing an existing concept disables the name field rather than merely pre-filling it.
  from: The confirmed product decision that editing is in-place mutation at the same name, plus the contract
    node's own text — register-concept never deletes, so allowing a name change during edit would register
    a second concept while leaving the original standing, contradicting in-place-mutation semantics.
- inferred: No new entry was added to error-ui-state.ts for register-concept.
  from: GlossaryService.registerConcept throws no domain error — confirmed against the backend source,
    it only overwrites the store — so the mutation's onError falls back to the generic-toast convention
    use-edit-draft-version-form.ts already uses for an unmapped failure.
- inferred: The accepts multi-select is composed as a labeled group of Checkboxes (a native fieldset/legend)
    rather than a dropdown.
  from: The inventory's own risk entry names this app as holding no multi-select precedent at all; this
    composition is the simplest one over primitives the UI kit already ships that lets an operator see
    and toggle more than one selection at once.
- inferred: ttl is required client-side with no default, even though the backend accepts an absent ttl
    and substitutes its own default.
  from: domain/glossary/concept declares ttl required:true; requiring it in the form keeps an operator
    from relying on a silent backend default for a fact the concept's own attribute declares mandatory.
---

## What it is

Create and edit for a concept — name, accepts (a multi-select of subject types) and ttl — added to the Glossary screen's existing, previously read-only Concepts tab, both submitting to the same register-concept operation.

## Notes

A suite run (run/concept-authoring-concept-create-edit-form-suite-5) failed one test — two rapid Save clicks issued two PUTs instead of one — diagnosed cause: code; fixed by guarding the dispatch itself (isDispatchingRef) rather than relying only on the rendered disabled attribute, which lagged behind react-hook-form's async validation. The suite passed in full afterward (run/concept-authoring-concept-create-edit-form-suite-6), which this record's run now points at.
