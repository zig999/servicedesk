---
contract_version: siegard-reconcile/3
title: Portal ButtonFooter beside the app's own footer, confining scroll to main
summary: 'AppShell now renders a footer-slot <div> as main''s sibling (inside the same content column,
  beside Sidebar, above the app''s own <footer>), shared through a new FooterSlotContext. ButtonFooter
  portals its group into that slot when the context provides one, and falls back to rendering inline where
  it doesn''t (every standalone render in tests). main''s className was reverted to a plain "relative
  flex-1 overflow-y-auto p-4" (no longer a flex column). Every route/form wrapper that had gained a temporary
  "flex-1" to stretch its content into position was reverted back to its original className, since positioning
  ButtonFooter is now structural (portal target), not CSS-stretched. Net effect on every file in this
  set versus the state two commits ago: only className strings changed (added then reverted), or a new
  sibling file/context/portal call was introduced -- no behavior, text or control changed anywhere in
  this batch.

  '
target: frontend
files:
- path: src/routes/capability-create-screen.tsx
  change: 'The two top-level section wrappers'' className reverted from "flex flex-1 flex-col gap-4" back
    to "flex flex-col gap-4".

    '
- path: src/routes/capability-detail-ready-view.tsx
  change: The wrapping div's className reverted from flex-1 back to plain.
- path: src/routes/capability-detail-screen.tsx
  change: All four top-level section wrappers' className reverted from flex-1 back to plain.
- path: src/routes/capability-form-fields.tsx
  change: The <form>'s className reverted from flex-1 back to plain.
- path: src/routes/case-version-editor-screen.tsx
  change: The top-level section wrapper's className reverted from flex-1 back to plain.
- path: src/routes/connector-configuration-create-screen.tsx
  change: The top-level section wrapper's className reverted from flex-1 back to plain.
- path: src/routes/connector-configuration-detail-ready-view.tsx
  change: The wrapping div's className reverted from flex-1 back to plain.
- path: src/routes/connector-configuration-detail-screen.tsx
  change: All three top-level section wrappers' className reverted from flex-1 back to plain.
- path: src/routes/connector-configuration-form-fields.tsx
  change: The <form>'s className reverted from flex-1 back to plain.
- path: src/routes/hypothesis-revision-form-fields.tsx
  change: The <form>'s className reverted from flex-1 back to plain.
- path: src/routes/hypothesis-revision-screen.tsx
  change: The top-level section wrapper's className reverted from flex-1 back to plain.
- path: src/shared/components/app-shell.tsx
  change: '<main> reverted to "relative flex-1 overflow-y-auto p-4"; a new footer-slot <div> and FooterSlotContext.Provider
    were introduced as main''s sibling, wrapping the content column beside Sidebar.

    '
- path: src/shared/components/button-footer.spec.ts
  change: 'Removed the assertion that the group carries sticky/bottom-0 classes and the assertion that
    it renders inside AppShell''s own main region; added assertions that it renders outside main and sits
    directly above the app''s own footer element.

    '
- path: src/shared/components/button-footer.tsx
  change: 'Now reads FooterSlotContext and portals its group into the slot node when present, falling
    back to an inline render otherwise; dropped the sticky/mt-auto/-mx-4 classes since positioning is
    now structural.

    '
- path: src/shared/components/footer-slot-context.ts
  change: New file — exports the FooterSlotContext used by app-shell.tsx and button-footer.tsx.
nodes:
- node: constraints/no-route-enforces-authentication
  conforms: true
  how: 'src/shared/components/app-shell.tsx: held at Topbar''s `<StatusBar ... right={<span>No auth in
    this build</span>} />` — right={<span>No auth in this build</span>}'
  encoded_at:
  - src/shared/components/app-shell.tsx
- node: contracts/integration/capability-registry
  conforms: true
  how: "src/routes/capability-create-screen.tsx: held at handleSaved, lines 15-20 — function handleSaved():\
    \ void {\n  const values = formRef.current?.getValues();\n  const name = values?.name ?? \"\";\n \
    \ const version = values?.version ?? \"\";\n  void navigate({ to: \"/capabilities/$name/$version\"\
    , params: { name, version } });\n}\n"
  encoded_at:
  - src/routes/capability-create-screen.tsx
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: "src/routes/connector-configuration-create-screen.tsx: held at the create-mode hook invocation\
    \ and the post-success navigation — const state = useConnectorConfigurationForm(null, handleSaved);\n\
    src/routes/connector-configuration-detail-ready-view.tsx: held at the `onSubmit` wiring into `ConnectorConfigurationFormFields`\
    \ (register-connector) and the `Link` to `/connectors` (toward list-connector-configurations, resolved\
    \ elsewhere), lines 44-49 and 91-93 — onSubmit={state.onSubmit}\n...\n<Button variant=\"secondary\"\
    \ asChild>\n  <Link to=\"/connectors\">Connectors</Link>\n</Button>\n"
  encoded_at:
  - src/routes/connector-configuration-create-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: contracts/investigation/case-simulation
  conforms: true
  how: 'src/routes/case-version-editor-screen.tsx: held at the <Link> element offering the entry to the
    simulate route, lines 33-35 — <Link to="/cases/$slug/versions/$version/simulate" params={{ slug, version
    }}>\n        Simulate\n      </Link>'
  encoded_at:
  - src/routes/case-version-editor-screen.tsx
- node: domain/glossary/action
  conforms: true
  how: 'src/routes/hypothesis-revision-form-fields.tsx: held at the "Referral action" Select''s options,
    line 200 — options={actionOptions.options}'
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/glossary/concept
  conforms: true
  how: 'src/routes/hypothesis-revision-form-fields.tsx: held at the Collects checkbox list, lines 130-147
    — {collectsOptions.map((concept) => {" and "{concept.name}'
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/glossary/outcome
  conforms: true
  how: 'src/routes/hypothesis-revision-form-fields.tsx: held at the "Resolution outcome" Select''s options,
    line 175 — options={outcomeOptions.options}'
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/glossary/recipient
  conforms: true
  how: 'src/routes/hypothesis-revision-form-fields.tsx: held at the "Referral recipient" Select''s options,
    line 227 — options={recipientOptions.options}'
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/glossary/subject-type
  conforms: true
  how: 'src/routes/hypothesis-revision-form-fields.tsx: held at the read-only subject type Input, line
    89 — <Input value={subjectType} disabled readOnly />'
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/integration/capability
  conforms: true
  how: 'src/routes/capability-create-screen.tsx: held at handleSaved, lines 17-18 — const name = values?.name
    ?? "";

    const version = values?.version ?? "";


    src/routes/capability-detail-screen.tsx: held at the heading and phase texts that key the surface
    by the capability''s identity — Capability {name} {version}

    src/routes/capability-form-fields.tsx: held at the field set of CapabilityFormFields — one FormField
    per required attribute (concept, name, version, nature, timeout, connector) plus the JsonTextareaField
    pair for input_schema and output_schema — <FormField label="Concept" ...><Controller control={control}
    name="concept" .../></FormField>

    <FormField label="Name" ...><Input {...register("name")} .../></FormField>

    <FormField label="Version" ...><Input {...register("version")} .../></FormField>

    <FormField label="Nature" ...><Controller control={control} name="nature" .../></FormField>

    <FormField label="Timeout (ms)" ...><Input type="number" {...register("timeout", ...)} /></FormField>

    <FormField label="Connector" ...><Input {...register("connector")} .../></FormField>

    <JsonTextareaField id="input_schema" .../>

    <JsonTextareaField id="output_schema" .../>

    '
  encoded_at:
  - src/routes/capability-create-screen.tsx
  - src/routes/capability-detail-screen.tsx
  - src/routes/capability-form-fields.tsx
- node: domain/integration/capability-nature
  conforms: true
  how: "src/routes/capability-form-fields.tsx: held at NATURE_OPTIONS, derived from the imported enumeration\
    \ rather than restated — const NATURE_OPTIONS: SelectOption[] = CAPABILITY_NATURES.map((nature) =>\
    \ ({\n  value: nature,\n  label: nature,\n}));"
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: domain/integration/capability-registry
  conforms: true
  how: 'src/routes/capability-create-screen.tsx: held at nowhere in this file — const state = useCapabilityForm(null,
    handleSaved); — resolve-concept and register-capability are delegated to the hook, not implemented
    here'
  encoded_at:
  - src/routes/capability-create-screen.tsx
- node: domain/integration/connector-configuration
  conforms: true
  how: "src/routes/connector-configuration-create-screen.tsx: held at handleSaved's read of the connector\
    \ attribute — const connector = formRef.current?.getValues(\"connector\") ?? \"\";\nsrc/routes/connector-configuration-detail-ready-view.tsx:\
    \ held at the `connector` and `configuration`/`registeredConfigurationText` props threaded to child\
    \ components, lines 40-46 — <ConnectorTestPanel\n  connector={connector}\n  configurationText={state.registeredConfigurationText}\n\
    />\n<ConnectorConfigurationFormFields\n  form={state.form}\n  configuration={state.configuration}\n\
    \nsrc/routes/connector-configuration-detail-screen.tsx: held at line 50, where the connector identity\
    \ is handed to the child view: `<ConnectorConfigurationDetailReadyView state={state} connector={connector}\
    \ />` — const { connector } = useParams({ from: \"/connectors/$connector\" });\n  const state = useConnectorConfigurationDetailView(connector);\n"
  encoded_at:
  - src/routes/connector-configuration-create-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
  - src/routes/connector-configuration-detail-screen.tsx
- node: domain/integration/connector-configuration-registry
  conforms: true
  how: 'src/routes/connector-configuration-create-screen.tsx: held at the create-mode hook invocation
    (register-connector''s create branch) — const state = useConnectorConfigurationForm(null, handleSaved);'
  encoded_at:
  - src/routes/connector-configuration-create-screen.tsx
- node: domain/investigation/field-semantics
  conforms: true
  how: 'src/routes/capability-form-fields.tsx: held at the paragraph beside the output-schema entry —
    Os nomes de campo lidos a partir dele são as chaves do próprio objeto <code>properties</code> de nível
    superior deste schema. O <code>type</code> e a <code>description</code>{" "} declarados por cada uma
    dessas chaves, onde o schema os declara, são lidos como a semântica declarada desse campo.'
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: domain/knowledge/case-version
  conforms: true
  how: "src/routes/hypothesis-revision-form-fields.tsx: held at the subject type field's label, describing\
    \ the value as inherited from the draft case version rather than owned by this form — label=\"Subject\
    \ type (from draft, fixed)\"\nsrc/routes/hypothesis-revision-screen.tsx: held at nowhere — the file\
    \ states no attribute of case-version as its own content; it only exposes navigation into the version's\
    \ manifest — <Button type=\"button\" onClick={state.onOpenManifest}>\n        View Manifest\n    \
    \  </Button>\n"
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
  - src/routes/hypothesis-revision-screen.tsx
- node: domain/knowledge/hypothesis
  conforms: true
  how: 'src/routes/hypothesis-revision-form-fields.tsx: held at the hypothesis name Input''s disabled
    condition, line 82 — disabled={!hypothesisNameEditable || isSubmitting}'
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: 'src/routes/hypothesis-revision-form-fields.tsx: held at the criterion Textarea and the collects
    Controller, lines 94-95 and 125-152 — {...register("criterion")} and name="collects"'
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/knowledge/referral
  conforms: true
  how: 'src/routes/hypothesis-revision-form-fields.tsx: held at the two separate "Referral action" and
    "Referral recipient" fields, lines 194 and 221 — name="resolution.referral.action" and name="resolution.referral.recipient"'
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/knowledge/resolution
  conforms: true
  how: 'src/routes/hypothesis-revision-form-fields.tsx: held at the "Resolution outcome" field grouped
    alongside the two referral fields, lines 166-239 — name="resolution.outcome" rendered in the same
    fieldset row as the referral action and recipient fields'
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: rules/glossary/a-description-states-meaning-never-policy
  conforms: true
  how: 'src/routes/capability-form-fields.tsx: held at the same paragraph''s closing sentence — Uma <code>description</code>
    aqui declara o que seu valor significa e não nomeia nenhuma decisão.'
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/a-capability-declares-well-formed-schemas
  conforms: false
  how: 'the fact left part of its ground: still held in src/routes/capability-detail-ready-view.tsx, and
    src/routes/capability-form-fields.tsx read `nowhere` — const isSaveDisabled = isSubmitting || !inputSchema.isValid
    || !outputSchema.isValid || isDirty === false; — the file consumes an externally computed `isValid`
    to gate the Save button; it states no refusal, no HTTP 422 and no CapabilitySchemaNotWellFormedError
    itself — a binding asserts the file answers for the node, so the pair that stopped holding it is released
    by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/routes/capability-detail-ready-view.tsx
  - src/routes/capability-form-fields.tsx
- node: rules/integration/a-capability-is-read-only
  conforms: false
  how: 'no named file holds this fact now: src/routes/capability-form-fields.tsx read `nowhere` — the
    Nature Select is built from the full NATURE_OPTIONS (both enumeration values) with no refusal path
    in this file; the invariant''s HTTP 422/CapabilityNotReadOnlyError refusal is not stated here'
  observed_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed
  conforms: true
  how: 'src/routes/capability-detail-screen.tsx: held at the loading and load-error branches — Loading
    capability {name} {version}… and Unable to load this capability right now. with <Button type="button"
    onClick={state.retryLoad}>Retry</Button> present only in the load-error branch'
  encoded_at:
  - src/routes/capability-detail-screen.tsx
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: true
  how: "src/routes/connector-configuration-detail-ready-view.tsx: held at the invalid-configuration alert,\
    \ lines 35-39 — {!state.configuration.isValid && (\n  <p role=\"alert\" className=\"text-sm text-destructive\"\
    >\n    {INVALID_CONFIGURATION_WARNING}\n  </p>\n)}\n\nsrc/routes/connector-configuration-form-fields.tsx:\
    \ held at the Save button's disabled condition, `isSaveDisabled` — const isSaveDisabled = isSubmitting\
    \ || !configuration.isValid || isDirty === false;"
  encoded_at:
  - src/routes/connector-configuration-detail-ready-view.tsx
  - src/routes/connector-configuration-form-fields.tsx
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  conforms: true
  how: "src/routes/connector-configuration-detail-ready-view.tsx: held at the `ConnectorTestPanel` invocation,\
    \ lines 40-43 — <ConnectorTestPanel\n  connector={connector}\n  configurationText={state.registeredConfigurationText}\n\
    />\n"
  encoded_at:
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing
  conforms: true
  how: "src/routes/connector-configuration-create-screen.tsx: held at the unconditional Connectors link\
    \ in trailingActions — <Button variant=\"secondary\" asChild>\n              <Link to=\"/connectors\"\
    >Connectors</Link>\n            </Button>\n\nsrc/routes/connector-configuration-detail-ready-view.tsx:\
    \ held at the Connectors link in `trailingActions`, lines 91-93 — <Button variant=\"secondary\" asChild>\n\
    \  <Link to=\"/connectors\">Connectors</Link>\n</Button>\n\nsrc/routes/connector-configuration-detail-screen.tsx:\
    \ held at the Connectors link inside ButtonFooter on both the loading branch (lines 20-22) and the\
    \ load-error branch (lines 39-41) — <Button variant=\"secondary\" asChild>\n          <Link to=\"\
    /connectors\">Connectors</Link>\n        </Button>\n"
  encoded_at:
  - src/routes/connector-configuration-create-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
  - src/routes/connector-configuration-detail-screen.tsx
- node: rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
  conforms: false
  how: 'the fact left part of its ground: still held in src/routes/capability-detail-screen.tsx, src/routes/connector-configuration-detail-ready-view.tsx,
    and src/routes/connector-configuration-create-screen.tsx read `nowhere` — trailingActions offers only
    a Cancel button and the Connectors link — no act that restores fields to a prior read registration,
    correct for an authoring surface where nothing is registered yet; src/routes/connector-configuration-detail-screen.tsx
    read `nowhere` — neither the loading branch (lines 12-26) nor the load-error branch (lines 28-45)
    presents an editable field to discard; editing and its discard act are delegated to <ConnectorConfigurationDetailReadyView
    state={state} connector={connector} /> (line 50), which the candidate index binds separately for this
    rule — a binding asserts the file answers for the node, so the pair that stopped holding it is released
    by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/routes/capability-detail-screen.tsx
  - src/routes/connector-configuration-create-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
  - src/routes/connector-configuration-detail-screen.tsx
- node: rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read
  conforms: true
  how: "src/routes/connector-configuration-detail-screen.tsx: held at the loading branch's text (line\
    \ 15) and the load-error branch's text and retry control (lines 31-35) — <p>Loading connector configuration\
    \ {connector}…</p>\n ... <p>Unable to load this connector configuration right now.</p>\n        <ButtonFooter>\n\
    \          <Button type=\"button\" onClick={state.retryLoad}>\n            Retry\n          </Button>\n"
  encoded_at:
  - src/routes/connector-configuration-detail-screen.tsx
- node: rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing
  conforms: true
  how: "src/routes/capability-create-screen.tsx: held at the Capabilities link, present in all three phase\
    \ branches (loading, load-error, ready) — <Button variant=\"secondary\" asChild>\n  <Link to=\"/capabilities\"\
    >Capabilities</Link>\n</Button>\n\nsrc/routes/capability-detail-ready-view.tsx: held at the unconditional\
    \ Capabilities link among the surface's trailing actions — <Button variant=\"secondary\" asChild><Link\
    \ to=\"/capabilities\">Capabilities</Link></Button>\nsrc/routes/capability-detail-screen.tsx: held\
    \ at the Capabilities link inside each of the three early-return ButtonFooters — <Link to=\"/capabilities\"\
    >Capabilities</Link>"
  encoded_at:
  - src/routes/capability-create-screen.tsx
  - src/routes/capability-detail-ready-view.tsx
  - src/routes/capability-detail-screen.tsx
- node: rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading
  conforms: true
  how: "src/routes/capability-detail-ready-view.tsx: held at the unconditional Cancel button among the\
    \ surface's trailing actions — <Button type=\"button\" variant=\"secondary\" onClick={state.onCancel}>Cancel</Button>\n\
    src/routes/capability-detail-screen.tsx: held at the Cancel button inside each of the three early-return\
    \ ButtonFooters — <Button type=\"button\" variant=\"secondary\" onClick={state.onCancel}>Cancel</Button>\n\
    src/routes/connector-configuration-detail-ready-view.tsx: held at the Cancel button, line 88-90 —\
    \ <Button type=\"button\" variant=\"secondary\" onClick={state.onCancel}>\n  Cancel\n</Button>\n\n\
    src/routes/connector-configuration-detail-screen.tsx: held at the Cancel button on the loading branch\
    \ (line 17) and on the load-error branch (line 36) — <Button type=\"button\" variant=\"secondary\"\
    \ onClick={state.onCancel}>\n          Cancel\n        </Button>\n"
  encoded_at:
  - src/routes/capability-detail-ready-view.tsx
  - src/routes/capability-detail-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
  - src/routes/connector-configuration-detail-screen.tsx
- node: rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
  conforms: false
  how: "src/routes/connector-configuration-detail-ready-view.tsx, the `state.justSaved` status paragraph\
    \ in `trailingActions`, lines 82-87: {state.justSaved && (\n\n              <p role=\"status\" className=\"\
    text-sm text-foreground\">\n                Saved.\n              </p>\n            )}\n — The surface's\
    \ only statement of a submission's outcome is a bare \"Saved.\" shown when `justSaved` is true; there\
    \ is no construct anywhere in this file rendering a refused outcome (that nothing registered and which\
    \ refusal answered it), and even the success message never names what was registered — the connector\
    \ name submitted. An operator who submits an edit that the registry refuses (for example a malformed\
    \ configuration) sees no status at all here, so they cannot tell a refusal from a request never sent,\
    \ and even on success they are not told which connector configuration was saved."
  observed_at:
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: rules/integration/a-successful-connector-registration-lands-on-the-configurations-own-surface
  conforms: true
  how: "src/routes/connector-configuration-create-screen.tsx: held at handleSaved — function handleSaved():\
    \ void {\n  const connector = formRef.current?.getValues(\"connector\") ?? \"\";\n  void navigate({\
    \ to: \"/connectors/$connector\", params: { connector } });\n}\n"
  encoded_at:
  - src/routes/connector-configuration-create-screen.tsx
- node: rules/integration/an-abandoned-capability-registration-entry-registers-nothing
  conforms: true
  how: 'src/routes/capability-create-screen.tsx: held at the Cancel control, wired to state.onCancel in
    all three phase branches — <Button type="button" variant="secondary" onClick={state.onCancel}>Cancel</Button>

    src/routes/capability-detail-ready-view.tsx: held at the same Cancel button — it issues no submit/register
    call and only invokes state.onCancel — <Button type="button" variant="secondary" onClick={state.onCancel}>Cancel</Button>'
  encoded_at:
  - src/routes/capability-create-screen.tsx
  - src/routes/capability-detail-ready-view.tsx
- node: rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it
  conforms: true
  how: 'src/routes/capability-form-fields.tsx: held at the paragraph beside the output-schema JsonTextareaField,
    stating exactly the five claims the rule allows and no more — O que é inserido aqui é <code>JSON</code>.
    ... Nenhum outro conteúdo deste schema é lido ou validado. Uma <code>description</code> aqui declara
    o que seu valor significa e não nomeia nenhuma decisão.'
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/one-capability-answers-one-concept
  conforms: false
  how: 'no named file holds this fact now: src/routes/capability-form-fields.tsx read `nowhere` — the
    Concept field is a plain Select bound to conceptOptions with no duplicate-answer check or refusal
    in this file — the ConceptAlreadyAnsweredError/DuplicateConceptAnswerError handling is not stated
    here'
  observed_at:
  - src/routes/capability-form-fields.tsx
- node: rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record
  conforms: true
  how: "src/routes/hypothesis-revision-screen.tsx: held at the phase-gated returns before any form content\
    \ renders — if (state.phase === \"loading\") {\n    return <p>Loading…</p>;\n  }\n"
  encoded_at:
  - src/routes/hypothesis-revision-screen.tsx
- node: rules/knowledge/a-revise-answers-the-revision-number-it-saved
  conforms: true
  how: 'src/routes/hypothesis-revision-screen.tsx: held at the success-phase message — Hypothesis &quot;{state.hypothesisName}&quot;
    saved as revision {state.revision}.'
  encoded_at:
  - src/routes/hypothesis-revision-screen.tsx
- node: rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move
  conforms: true
  how: "src/routes/hypothesis-revision-screen.tsx: held at the conditional manifest-builder button in\
    \ the success phase — {state.offerManifestBuilder && (\n          <Button type=\"button\" onClick={state.onOpenManifestBuilder}>\n\
    \            Open Manifest Builder\n          </Button>\n        )}\n"
  encoded_at:
  - src/routes/hypothesis-revision-screen.tsx
- node: rules/knowledge/an-abandoned-revision-composition-writes-nothing
  conforms: true
  how: "src/routes/hypothesis-revision-form-fields.tsx: held at the trailingActions slot rendered beside\
    \ the submit button inside ButtonFooter, line 246 — {trailingActions}\nsrc/routes/hypothesis-revision-screen.tsx:\
    \ held at the Cancel control wired to state.onCancel — <Button type=\"button\" variant=\"secondary\"\
    \ onClick={state.onCancel}>\n          Cancel\n        </Button>\n"
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
  - src/routes/hypothesis-revision-screen.tsx
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: 'src/routes/hypothesis-revision-form-fields.tsx: held at every glossary-governed control sources
    its options exclusively from the glossary-derived option lists (collectsOptions, outcomeOptions, actionOptions,
    recipientOptions) — {collectsOptions.map((concept) => {" and "options={outcomeOptions.options}'
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: rules/knowledge/every-position-declares-a-resolution
  conforms: true
  how: 'src/routes/hypothesis-revision-form-fields.tsx: held at the three resolution fields (outcome,
    referral.action, referral.recipient) rendered together, lines 160-240 — FormField label="Resolution
    outcome" together with label="Referral action" and label="Referral recipient"'
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
unbound:
- src/shared/components/button-footer.spec.ts
- src/shared/components/button-footer.tsx
- src/shared/components/footer-slot-context.ts
pairs_omitted:
- node: rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering
  file: src/routes/connector-configuration-create-screen.tsx
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering
  file: src/routes/connector-configuration-detail-ready-view.tsx
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
notes: 'Judged by 12 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/button-footer-portal-restructure.returns/.

  Candidates: 0 opened across 0 of 12 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/button-footer-portal-restructure.returns/`, which are the evidence behind every entry above.
