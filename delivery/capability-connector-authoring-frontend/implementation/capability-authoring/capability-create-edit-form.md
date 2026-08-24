---
title: Capability create/edit form on the Capabilities Browser screen
summary: Adds a New capability action, a per-row Edit action, and a shared create/edit form (name, version,
  nature, both JSON schemas, timeout, connector, concept) over PUT /v1/capabilities/{name}/{version},
  replacing the screen's prior read-only detail panel.
task: sha256:0415908f3094e8f871b55ddc5e73ca63c76bcb8dbfb95a7c3a4584112e063043
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/capability-authoring-capability-create-edit-form-build
files:
- path: src/services/capability-form-schema.ts
  effect: New file. Declares the zod schema (name, version, nature, timeout optional, connector, concept)
    and the CAPABILITY_NATURES vocabulary the form and the Nature Select both read; input_schema/output_schema
    are deliberately absent, validated instead through the shared JSON control.
- path: src/hooks/use-capability-form.ts
  effect: New file. useCapabilityForm(existing, onSaved) — a create(null)/edit(existing) hook that builds
    the react-hook-form instance, tracks input_schema/output_schema as separate value+isValid state, dispatches
    PUT /v1/capabilities/{name}/{version} with the minified schemas on submit, invalidates the ["capabilities"]
    query on success, and resolves a save failure to one of four distinguishable toast messages (or the
    generic fallback) via error-ui-state.ts.
- path: src/routes/capability-form-fields.tsx
  effect: New file. Field markup for name, version (disabled while editing), nature (Select), input_schema/output_schema
    (JsonTextareaField), timeout, connector and concept (single Select over useConceptOptions), with the
    Save button disabled while either JSON schema is invalid.
- path: src/routes/capability-form-dialog.tsx
  effect: New file. CapabilityFormDialog wrapping useCapabilityForm + CapabilityFormFields, opened from
    either the "New capability" action or a row's "Edit" action, mirroring concept-form-dialog.tsx.
- path: src/routes/capabilities-browser-screen.tsx
  effect: Modified. Replaces the read-only row-selection detail panel (CapabilityDetailPanel, selectedKey)
    with a "New capability" button and a per-row "Edit" action button (new actions column, plus a version
    column), both opening CapabilityFormDialog; the list read, its loading/error/empty states and its
    identity/timeout formatting are otherwise unchanged.
- path: src/services/error-ui-state.ts
  effect: Modified. Adds four UiErrorStateKind values and table entries — concept-already-answered (409,
    ConceptAlreadyAnsweredError), incomplete-capability-contract, capability-not-read-only and capability-schema-not-well-formed
    (422, IncompleteCapabilityContractError/CapabilityNotReadOnlyError/CapabilitySchemaNotWellFormedError)
    — and updates the header/table-size comments to describe the resulting eighteen-entry table honestly,
    including which further status-map.ts classes remain unmapped here and why.
criteria:
- criterion: The capabilities browser screen offers a "New capability" action that opens a form for name,
    version, nature, input_schema, output_schema, timeout, connector and concept.
  met: true
  how: capabilities-browser-screen.tsx renders an unconditional "New capability" Button that sets formTarget
    to {mode:"create"}, mounting CapabilityFormDialog -> CapabilityFormFields, which renders all eight
    named fields.
- criterion: Each row in the capabilities browser screen offers an "Edit" action that opens the same form
    pre-filled with that row's current values, replacing the existing read-only detail panel.
  met: true
  how: toRow's own actions cell renders a per-row "Edit" Button that sets formTarget to {mode:"edit",
    capability}; useCapabilityForm(existing, ...) pre-fills every defaultValue and both JSON-schema state
    values from that row's already-loaded Capability. CapabilityDetailPanel and the prior row-selection
    state (selectedKey) are removed from the screen entirely.
- criterion: input_schema and output_schema are edited through the shared JSON beautify/minify textarea,
    and the value persisted on save is the minified JSON.
  met: true
  how: capability-form-fields.tsx renders two JsonTextareaField controls wired to the hook's own inputSchema/outputSchema
    value+onChange pairs; use-capability-form.ts's mutationFn calls getJsonTextareaMinifiedValue on each
    field's current text to build the request body.
- criterion: The concept field selects exactly one existing concept; the form provides no way to associate
    a capability with more than one concept at once.
  met: true
  how: concept is a single Controller-wrapped Select (never a Checkbox group) over useConceptOptions()'s
    list, bound to a single string form field that can hold exactly one selected name.
- criterion: 'Submitting the form with a non-read-only nature does not fail silently: the registry''s
    refusal reaches the operator as a visible, specific message rather than a generic or absent one.'
  met: true
  how: CapabilityNotReadOnlyError is given its own error-ui-state.ts kind ("capability-not-read-only");
    use-capability-form.ts's mutation onError resolves that kind to a specific sentence and shows it via
    sonner's toast.error, rather than falling through to the generic save-failure message.
- criterion: A successful create or edit persists the capability's declared contract and the browser screen
    reflects the change afterward.
  met: true
  how: the mutation's onSuccess calls queryClient.invalidateQueries({queryKey:["capabilities"]}) — the
    exact key useCapabilities reads through — and then onSaved() (closing the dialog), so the screen's
    own list refetches and shows the persisted contract.
nodes:
- node: domain/integration/capability
  encoded_at:
  - src/services/capability-form-schema.ts
  - src/routes/capability-form-fields.tsx
  - src/hooks/use-capability-form.ts
  how: every one of the aggregate's eight attributes is a field the form edits and the mutation persists
    — name/version/nature/connector/concept validated by capabilityFormSchema, input_schema/output_schema
    tracked as JsonTextareaField state, timeout optional so the registry's own default can still apply.
- node: domain/integration/capability-nature
  encoded_at:
  - src/services/capability-form-schema.ts
  - src/routes/capability-form-fields.tsx
  how: CAPABILITY_NATURES states the closed two-value vocabulary once, backing both the zod enum and the
    Nature Select's own option list, so the operator can only choose between the two named values.
- node: domain/integration/capability-registry
  encoded_at:
  - src/hooks/use-capability-form.ts
  how: useCapabilityForm's mutation dispatches PUT /v1/capabilities/{name}/{version} (register-capability)
    for both create and edit, and its onSuccess invalidates the query the registry's own list-capabilities
    read (useCapabilities) is served through.
- node: rules/integration/a-capability-declares-its-contract
  encoded_at:
  - src/services/capability-form-schema.ts
  - src/hooks/use-capability-form.ts
  how: name, version, nature, connector and concept are all zod-required; input_schema/output_schema submission
    is blocked while either is not syntactically valid JSON; timeout is the schema's one optional field,
    and the request simply omits it when left blank rather than inventing the registry's own sixty-second
    default client-side.
- node: rules/integration/a-capability-is-read-only
  encoded_at:
  - src/routes/capability-form-fields.tsx
  - src/hooks/use-capability-form.ts
  - src/services/error-ui-state.ts
  how: the Nature field lets the operator choose either value (the registry decides, not the client) and
    defaults to "read-only"; a CapabilityNotReadOnlyError refusal resolves to its own distinct UI-state
    kind and a specific message rather than a generic one (criterion 5).
- node: rules/integration/one-capability-answers-one-concept
  encoded_at:
  - src/routes/capability-form-fields.tsx
  - src/hooks/use-capability-form.ts
  - src/services/error-ui-state.ts
  how: concept is a single Select over useConceptOptions()'s list, never a multi-select, so the form itself
    offers no way to associate more than one concept (criterion 4); a ConceptAlreadyAnsweredError refusal
    resolves to its own distinct UI-state kind and message.
- node: rules/integration/a-capability-declares-well-formed-schemas
  encoded_at:
  - src/routes/capability-form-fields.tsx
  - src/hooks/use-capability-form.ts
  - src/services/error-ui-state.ts
  how: input_schema/output_schema are edited through the shared JsonTextareaField, whose onChange reports
    JSON-syntax validity; the hook's own submit callback blocks the mutation while either is invalid,
    and the value dispatched is always getJsonTextareaMinifiedValue(currentText). A defensive CapabilitySchemaNotWellFormedError
    entry also resolves to its own distinct kind and message.
- node: contracts/integration/capability-registry
  encoded_at:
  - src/hooks/use-capability-form.ts
  how: the register-capability operation this contract names is what the mutation calls; list-capabilities
    and read-capability are unchanged, still served by the existing useCapabilities hook this task did
    not modify.
inferences:
- inferred: nature defaults to "read-only" in create mode rather than starting unselected.
  from: domain/integration/capability-nature's own description ("mutating exists as a value so the registry
    has something to refuse") and rules/integration/a-capability-is-read-only, which together state read-only
    is the only nature the registry ever accepts; no criterion states the field's initial selection, and
    the operator can still pick "mutating" and see it refused exactly as before.
- inferred: input_schema and output_schema are tracked as plain component state (value + isValid, reported
    together by JsonTextareaField's onChange) rather than as zod-validated react-hook-form fields.
  from: json-textarea-field.tsx's own header comment on why its onChange reports value and validity together,
    and the absence of any existing precedent composing react-hook-form with a JSON-syntax-validated field;
    a second zod string check could not express JSON syntax anyway.
- inferred: name and version are disabled (not merely pre-filled) in edit mode.
  from: use-concept-form.ts's own precedent and this task's own confirmed product decision that editing
    is in-place mutation at the same (name, version) — editing either during edit would register a second
    capability at a new identity rather than mutating the original in place.
- inferred: the exact wording of the four new save-failure messages (capability-not-read-only, incomplete-capability-contract,
    capability-schema-not-well-formed, concept-already-answered).
  from: no criterion states exact wording; each message states the corresponding rule's own refusal in
    plain, technically accurate terms.
- inferred: the capabilities table gains a "Version" column and per-row "Edit" action column; the prior
    row-click-to-detail-panel interaction is removed entirely (rows are now inert except for the Edit
    button).
  from: domain/integration/capability's own identity being name+version together (no criterion states
    what a row must show now that the detail panel it used to reveal version through is gone), and criterion
    2's own "Edit action" wording, which glossary-browser-screen.tsx's own per-row Edit-button convention
    already establishes as this app's pattern for this exact interaction.
- inferred: error-ui-state.ts's header comments were updated to describe the table's new eighteen-entry
    size honestly, including naming the four further status-map.ts-mapped classes that remain unmapped
    here.
  from: touching the file's own "fourteen keys" claim was unavoidable once four more were added; naming
    the still-unmapped four rather than silently leaving the comment stale keeps the file's own claim
    honest without adding kinds this task was not asked to add.
preserved:
- GET /v1/capabilities's list read through useCapabilities (query key ["capabilities"]) and its loading/error/empty-state
  rendering.
- The capability row's name+version composite identity (capabilityKey) used as StatusTable's row key.
- The listing's own name/nature/connector/concept/timeout columns and formatTimeout's own display format.
- The fourteen pre-existing entries of error-ui-state.ts's UI_STATE_BY_ERROR_CODE table, untouched.
deferred:
- what: Four further error classes status-map.ts maps to a transport status (ConnectorConfigurationNotFoundError,
    CapabilityNotRegisteredForTestError, CapabilityConnectorMismatchError, ConnectorConfigurationNotWellFormedError)
    are still not given a distinct error-ui-state.ts kind.
  why: none belongs to this task's own surface (register-capability); each answers to a different task's
    own route, and giving one a kind here would widen this task past the four criterion 5 names.
---

## What it is

Create and edit for a capability's full declared contract — name, version, nature, both JSON schemas, timeout, connector and concept — replacing the capabilities browser screen's read-only detail panel.

## Notes

None.
