---
title: Routed capability create screen
summary: Adds a full-page capability create screen at "/capabilities/new", composing the existing capability
  form-fields and the shared create/edit hook's create mode, wired as a static sibling of the dynamic
  capability detail route.
task: sha256:213f8ac2e1dbacf61031b409208ca5499933f14f3d2ea9c35f42af27e77e5381
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/capability-create-route-capability-create-screen-build
files:
- path: src/routes/capability-create-screen.tsx
  effect: New route component (CapabilityCreateScreen). Composes useCapabilityForm(null, handleSaved)
    -- the shared create/edit hook opened in create mode -- and renders its three phases (loading, load-error,
    ready) exactly as capability-form-dialog.tsx already renders them. In "ready", composes CapabilityFormFields
    with isEditingIdentity=state.isEditingIdentity (false in create mode, so name and version render enabled),
    no trailingActions/isDirty. On a successful save, handleSaved reads the submitted name/version back
    off the form (through a formRef) and navigates to that capability's own detail route. Renders an unconditional
    "Back to capabilities" Link in every phase.
- path: src/routes/route-tree.tsx
  effect: Adds the "/capabilities/new" static route (capabilityCreateRoute), imports CapabilityCreateScreen,
    and registers the route in routeTree's children array beside capabilityDetailRoute -- mirroring exactly
    how connectorConfigurationCreateRoute was added alongside connectorConfigurationDetailRoute by the
    sibling task delivered just before this one.
criteria:
- criterion: Navigating to "/capabilities/new" renders the capability create screen inside the app shell.
  met: true
  how: capabilityCreateRoute is a child of rootRoute (whose own component is AppShell), with CapabilityCreateScreen
    as its component, at path "/capabilities/new".
- criterion: A capability named "new" is still reached at "/capabilities/new/<version>" by the capability
    detail screen.
  met: true
  how: '"/capabilities/new" is one path segment; capabilityDetailRoute''s own path, "/capabilities/$name/$version",
    is two segments and only ever matches a URL with exactly that shape, so "/capabilities/new/<version>"
    resolves to capabilityDetailRoute with name="new", never to the one-segment capabilityCreateRoute.'
- criterion: The create screen's name and version fields are both editable rather than disabled.
  met: true
  how: CapabilityCreateScreen passes isEditingIdentity={state.isEditingIdentity} from useCapabilityForm(null,
    ...), which reads existing !== null and is therefore false in create mode; CapabilityFormFields disables
    the name and version Inputs only when isEditingIdentity is true.
- criterion: The create screen composes the existing capability form-fields component rather than a second
    copy of that markup.
  met: true
  how: CapabilityCreateScreen imports and renders CapabilityFormFields from src/routes/capability-form-fields.tsx
    directly, in its "ready" phase branch; no field markup is duplicated.
- criterion: The create screen's form state comes from the existing capability create/edit hook opened
    in create mode rather than from a second hook re-deriving that state.
  met: true
  how: CapabilityCreateScreen's only state source is useCapabilityForm(null, handleSaved), called with
    existing=null (create mode); no second hook is introduced.
- criterion: While the concept vocabulary is still loading, the create screen renders a loading state
    rather than the form.
  met: true
  how: 'useCapabilityForm returns { phase: "loading" } while its internal useConceptOptions read is isLoading;
    CapabilityCreateScreen renders a "Loading…" paragraph for that phase and renders CapabilityFormFields
    only in the "ready" branch.'
- criterion: When the concept vocabulary fails to load, the create screen renders a failure state offering
    a retry rather than the form.
  met: true
  how: 'useCapabilityForm returns { phase: "load-error", retryLoad } when useConceptOptions reports isError;
    CapabilityCreateScreen renders that phase as an "Unable to load concepts." message plus a Button wired
    to state.retryLoad.'
- criterion: Saving from the create screen dispatches the registry's register-capability request at the
    name and version typed into the form.
  met: true
  how: onSubmit is state.onSubmit from useCapabilityForm, whose mutationFn issues PUT /v1/capabilities/{values.name}/{values.version}
    with the values typed into the (enabled) name and version fields.
- criterion: The create screen does not dispatch a registration while either declared schema is not valid
    JSON.
  met: true
  how: useCapabilityForm's own submit handler returns before calling mutation.mutate when either inputSchemaValid
    or outputSchemaValid is false -- unmodified hook behavior this screen consumes rather than reimplements.
- criterion: Registering a capability for a concept another capability already answers leaves the operator
    on the create screen with the registry's refusal reported to them.
  met: true
  how: useCapabilityForm's mutation onError calls toast.error(saveFailureMessage(error)); onSaved (and
    therefore this screen's navigation away) only runs from onSuccess, so a refused registration never
    navigates the operator off this screen.
- criterion: The create screen does not itself refuse a concept before dispatching the registration.
  met: true
  how: Neither CapabilityCreateScreen nor useCapabilityForm's own submit gate inspects concept before
    calling mutation.mutate -- the concept-uniqueness refusal is left entirely to the registry's own HTTP
    409 response.
- criterion: A save that succeeds leaves the operator on the created capability's own detail route rather
    than on the create route.
  met: true
  how: 'handleSaved (run only from mutation onSuccess) reads name/version off formRef.current.getValues()
    and calls navigate({ to: "/capabilities/$name/$version", params: { name, version } }).'
- criterion: The create screen renders a link back to the capabilities list.
  met: true
  how: A Link to="/capabilities" renders unconditionally at the top of the section, in every phase (loading,
    load-error, ready).
nodes:
- node: domain/integration/capability
  encoded_at:
  - src/routes/capability-create-screen.tsx
  how: The screen's form fields are exactly this aggregate's own attributes, unchanged from the existing
    CapabilityFormFields/useCapabilityForm this task composes rather than redefines.
- node: domain/integration/capability-registry
  encoded_at:
  - src/routes/capability-create-screen.tsx
  how: register-capability is dispatched, in create mode, by the composed useCapabilityForm's mutation,
    unchanged by this task; this screen is a new caller of that existing operation.
- node: contracts/integration/capability-registry
  encoded_at:
  - src/routes/capability-create-screen.tsx
  how: This screen is a new, routed caller of register-capability's own "creating it at a new name and
    version" half; the "or replacing" half is the routed edit screen's concern, per this task's own REMAINDER
    note.
- node: rules/integration/one-capability-answers-one-concept
  how: This screen answers only this rule's registration-refusal half (HTTP 409 ConceptAlreadyAnsweredError),
    by not swallowing it; the rule's second clause (HTTP 500 over a concept read) reaches no criterion
    here, per this task's own REMAINDER note.
- node: contracts/glossary/glossary-query
  how: The concept vocabulary this screen's Concept select offers is read through useConceptOptions (inside
    the composed useCapabilityForm); this screen's loading/load-error phases are its own rendition of
    that read's pending/failed states, per this task's own Advisory note.
- node: rules/integration/a-capability-declares-well-formed-schemas
  how: 'This screen answers only the register-capability half of the rule: the composed useCapabilityForm
    blocks dispatch while either schema is not valid JSON. The "or update" half belongs to the edit screen,
    per this task''s own REMAINDER note.'
inferences:
- inferred: The loading-state text ("Loading…") and the load-error text ("Unable to load concepts.") plus
    its Retry button, on this new screen.
  from: capability-form-dialog.tsx's own identical two branches for the identical useCapabilityForm phases
    -- reused verbatim rather than inventing new wording.
- inferred: handleSaved navigates to the created capability's own detail route by reading name/version
    back off the submitted form values through a ref, rather than from the mutation's own response body.
  from: connector-configuration-create-screen.tsx's own identical formRef pattern and its own stated reasoning
    (breaking the onSaved/form ordering cycle).
preserved:
- useCapabilityForm's own three-phase (loading/load-error/ready) shape, its JSON-schema validity gating,
  its save-failure message mapping and its create/edit dual-mode behavior -- none of these were touched;
  this task's file is a new consumer only.
- CapabilityFormFields' own markup, props and disabling logic -- untouched; composed exactly as capability-form-dialog.tsx
  and capability-detail-ready-view.tsx already compose it.
- route-tree.tsx's every other existing route, its declaration order and its existing specificity-ranking
  comments -- only the one new import and the one new route/child-array entry were added.
deferred:
- what: Pointing capabilities-browser-screen.tsx's own "New capability" button at this new route instead
    of the popup CapabilityFormDialog, and retiring that Dialog's create-mode branch.
  why: Outside this task's own criteria (which name only the screen and the route resolving to it) --
    left for whichever task in this epic actually states it.
---

## What it is
A new "/capabilities/new" route reuses the existing capability form fields and the create/edit hook's create mode to let an operator register a capability on a full page, landing on the created record's own detail route on success.

## Notes
None.
