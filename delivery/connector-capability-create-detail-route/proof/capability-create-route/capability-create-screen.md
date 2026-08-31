---
title: Proof for the routed capability create screen
summary: Vitest coverage for capability-create-screen.tsx's own thirteen criteria, its create-mode reuse
  of useCapabilityForm/CapabilityFormFields, and the task's own UNDERDETERMINED note over the dispatched
  registration's completeness, through a self-contained test router and a stubbed fetch/sonner boundary.
implementation: sha256:3091f51437a475819ca5d26e2b85b5955ce3a4d9a2805a7a9e9ba91b0bc15252
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/capability-create-route-capability-create-screen-suite-2
tests:
- file: src/routes/capability-create-screen.spec.ts
  name: CapabilityCreateScreen -- routing (criteria 1 and 2) > renders the create screen's own content
    when navigating to /capabilities/new
  proves: Criterion 1 -- navigating to "/capabilities/new" renders the capability create screen.
  fails_when: The route no longer resolves "/capabilities/new" to CapabilityCreateScreen.
- file: src/routes/capability-create-screen.spec.ts
  name: CapabilityCreateScreen -- routing (criteria 1 and 2) > reaches the capability detail screen, not
    this create screen, at /capabilities/new/<version>
  proves: Criterion 2 -- a capability named "new" is still reached at "/capabilities/new/<version>" by
    the detail screen, never by the create screen.
  fails_when: '"/capabilities/new/v7" resolves to the create screen (or to neither), rather than to the
    three-segment detail route with name="new", version="v7".'
- file: src/routes/capability-create-screen.spec.ts
  name: CapabilityCreateScreen -- name and version are both editable (criterion 3) > renders the Name
    and Version inputs without the disabled attribute
  proves: Criterion 3 -- the create screen's name and version fields are both editable rather than disabled.
  fails_when: Either input carries the disabled attribute in create mode.
- file: src/routes/capability-create-screen.spec.ts
  name: CapabilityCreateScreen -- composes the shared form-fields component (criterion 4) > renders every
    field CapabilityFormFields itself composes, plus the Save button
  proves: Criterion 4 -- the create screen composes the existing capability form-fields component rather
    than a second copy of that markup.
  fails_when: Any of Concept/Name/Version/Nature/Timeout/Input schema/Output schema/Save is missing, renamed,
    or rendered through separately hand-written markup.
- file: src/routes/capability-create-screen.spec.ts
  name: CapabilityCreateScreen -- composes the shared form-fields component (criterion 4) > links a validation
    error to its own field through aria-describedby, exactly as CapabilityFormFields' own FormField renders
    it
  proves: Criterion 4 -- the reused form-fields component's own per-field error wiring survives composition
    on this screen.
  fails_when: A duplicated or divergent markup copy drops the error message, aria-invalid, or the aria-describedby
    link on the Name field.
- file: src/routes/capability-create-screen.spec.ts
  name: CapabilityCreateScreen -- form state reflects the shared create/edit hook's own create-mode default
    (criterion 5) > defaults Nature to read-only, the hook's own create-mode default
  proves: Criterion 5 -- the create screen's form state comes from the existing capability create/edit
    hook opened in create mode.
  fails_when: Nature renders unselected, blank, or defaulted to any value other than "read-only" on first
    mount.
- file: src/routes/capability-create-screen.spec.ts
  name: CapabilityCreateScreen -- form state reflects the shared create/edit hook's own create-mode default
    (criterion 5) > disables Save immediately on mount, since a blank schema is not valid JSON either
  proves: Criterion 5, second fingerprint -- the same shared hook's own create-mode schema-validity default.
  fails_when: Save renders enabled on first mount, before any schema text has been typed.
- file: src/routes/capability-create-screen.spec.ts
  name: CapabilityCreateScreen -- a loading state while the concept vocabulary is pending (criterion 6)
    > renders a loading indicator instead of the form
  proves: Criterion 6 -- while the concept vocabulary is still loading, the create screen renders a loading
    state rather than the form.
  fails_when: The Concept field (or the rest of the form) renders before the concept-vocabulary read resolves,
    or no loading text appears.
- file: src/routes/capability-create-screen.spec.ts
  name: CapabilityCreateScreen -- a failure state offering a retry when the concept vocabulary fails to
    load (criterion 7) > renders a failure message and a Retry control instead of the form
  proves: Criterion 7 -- when the concept vocabulary fails to load, the create screen renders a failure
    state offering a retry.
  fails_when: The screen renders the form anyway, hangs in an indefinite loading state, or offers no Retry
    control.
- file: src/routes/capability-create-screen.spec.ts
  name: CapabilityCreateScreen -- a failure state offering a retry when the concept vocabulary fails to
    load (criterion 7) > re-issues the concept vocabulary read when Retry is clicked, reaching the ready
    form once it answers
  proves: Criterion 7's own retry mechanism actually re-issues the read and reaches the form once the
    vocabulary loads.
  fails_when: Clicking Retry does not re-issue the GET, or the screen never reaches the ready phase once
    that retry succeeds.
- file: src/routes/capability-create-screen.spec.ts
  name: 'CapabilityCreateScreen -- a failure state offering a retry when the concept vocabulary fails
    to load (criterion 7) > keeps the Back link available while the load has failed (edge case: a dependency
    that fails)'
  proves: Criteria 7 and 13 together over the edge case of a failing dependency.
  fails_when: The Back link is absent or unreachable while the concept-vocabulary read has failed.
- file: src/routes/capability-create-screen.spec.ts
  name: CapabilityCreateScreen -- a link back to the capabilities list (criterion 13) > renders a 'Back
    to capabilities' link to /capabilities
  proves: Criterion 13 -- the create screen renders a link back to the capabilities list.
  fails_when: No such link renders, or it points anywhere other than "/capabilities".
- file: src/routes/capability-create-screen.spec.ts
  name: CapabilityCreateScreen -- a link back to the capabilities list (criterion 13) > renders the same
    Back link while the concept vocabulary is still loading
  proves: The delivery record's own disclosed rendering (the Back link renders unconditionally across
    every phase).
  fails_when: The Back link is absent during the loading phase.
- file: src/routes/capability-create-screen-save.spec.ts
  name: CapabilityCreateScreen -- dispatches at the name and version typed into the form (criterion 8)
    > issues PUT /v1/capabilities/{name}/{version} at the name and version just typed
  proves: Criterion 8 -- saving from the create screen dispatches the registry's register-capability request
    at the name and version typed into the form.
  fails_when: No PUT is dispatched, or it targets a URL other than /v1/capabilities/{typed name}/{typed
    version}.
- file: src/routes/capability-create-screen-save.spec.ts
  name: CapabilityCreateScreen -- dispatches at the name and version typed into the form (criterion 8)
    > issues the PUT at a different URL when a different name and version are typed, rather than a fixed
    destination
  proves: Criterion 8 is not vacuously satisfied by a hardcoded URL.
  fails_when: The PUT URL stays fixed regardless of what was typed into Name/Version.
- file: src/routes/capability-create-screen-save.spec.ts
  name: CapabilityCreateScreen -- blocks dispatch while a declared schema is not valid JSON (criterion
    9) > keeps Save disabled and dispatches no PUT while the input schema is not valid JSON
  proves: Criterion 9, input_schema half.
  fails_when: Save is enabled, or a PUT is dispatched, while input_schema is not valid JSON.
- file: src/routes/capability-create-screen-save.spec.ts
  name: CapabilityCreateScreen -- blocks dispatch while a declared schema is not valid JSON (criterion
    9) > keeps Save disabled and dispatches no PUT while the output schema is not valid JSON
  proves: Criterion 9, output_schema half.
  fails_when: Save is enabled, or a PUT is dispatched, while output_schema is not valid JSON.
- file: src/routes/capability-create-screen-save.spec.ts
  name: CapabilityCreateScreen -- a concept-already-answered refusal is reported without leaving the screen
    (criterion 10) > shows the registry's own distinguishable message and keeps the operator on the create
    screen
  proves: Criterion 10 -- registering a capability for a concept another capability already answers leaves
    the operator on the create screen with the registry's refusal reported to them.
  fails_when: The refusal is swallowed, or the operator is navigated away from the create route despite
    the 409 ConceptAlreadyAnsweredError.
- file: src/routes/capability-create-screen-save.spec.ts
  name: CapabilityCreateScreen -- never refuses a concept itself before dispatching (criterion 11) > dispatches
    the registration for whatever concept is selected, without any message shown before the registry itself
    answers
  proves: Criterion 11 -- the create screen does not itself refuse a concept before dispatching the registration.
  fails_when: The screen blocks the dispatch or shows an error itself, ahead of any answer from the registry.
- file: src/routes/capability-create-screen-save.spec.ts
  name: CapabilityCreateScreen -- a successful save navigates to the created capability's own detail route
    (criterion 12) > navigates to /capabilities/<name>/<version> once the registration succeeds, rather
    than staying on the create route
  proves: Criterion 12 -- a save that succeeds leaves the operator on the created capability's own detail
    route rather than on the create route.
  fails_when: The operator remains on "/capabilities/new" after a successful save, or is navigated to
    a route other than that capability's own detail route.
- file: src/routes/capability-create-screen-save.spec.ts
  name: CapabilityCreateScreen -- the dispatched registration carries every field the form composes, not
    only name/version/schemas/concept (task's own UNDERDETERMINED note) > submits nature, timeout and
    connector in the PUT body alongside input_schema, output_schema and concept
  proves: 'The task''s own UNDERDETERMINED note: excludes an implementation dispatching only name/version/schemas/concept
    while omitting nature, timeout and connector.'
  fails_when: The PUT body omits or misreports nature, timeout, or connector.
not_applicable:
- edge_case: An empty concept-options list (zero registered concepts)
  why: 'not a criterion this task states: the Select still renders (with zero options), and useConceptOptions/CapabilityFormFields
    are unchanged, unowned by this task.'
- edge_case: A duplicate/second concurrent save ("two operations against one subject at once")
  why: the double-submit guard (isDispatchingRef) lives entirely inside the unchanged, shared useCapabilityForm
    hook and is already proven against that exact hook in capabilities-browser-screen-capability-form-save.spec.ts.
- edge_case: A numeric boundary on timeout (e.g. zero, negative)
  why: the positive-int constraint lives in the unchanged, shared capabilityFormSchema, not in anything
    this screen adds.
untested:
- route-tree.spec.ts's own totality assertion is extended to include "/capabilities/new" separately by
  the caller (a cross-task bookkeeping fix), rather than by this task's own tests, to avoid asserting
  a fact belonging to the sibling connector-configuration-create-route task.
- Criterion 5's own "rather than a second hook re-deriving that state" clause is proven only behaviorally,
  through two fingerprints of useCapabilityForm's own create-mode defaults. A hypothetical second hook
  that happened to replicate both defaults exactly would not be caught by black-box tests.
---

## What it is
Proves CapabilityCreateScreen's routing, its reuse of the shared form fields and hook, its loading/failure phases, its dispatch/refusal guards including the full registration payload, and its Back link; the full suite passes.

## Notes
None.
