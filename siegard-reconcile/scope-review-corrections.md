---
contract_version: siegard-reconcile/3
title: The six corrections the full-scope review raised, over the two integration registries' four registration
  surfaces and two misstated facts in source
summary: 'Six tasks of the button-footer-standardization plan wrote these files: the four surface tasks
  of the abandonment-and-listing-route epic split each registration surface''s single Cancel control into
  a return-to-origin act and an unconditional route to its registry''s listing, and the two tasks of the
  misstated-facts-in-source epic corrected a stand-in refusal''s HTTP status and rewrote the output-schema
  entry''s guidance copy. Every implementation and proof record naming these paths sits under delivery/button-footer-standardization.'
target: frontend/app
files:
- path: src/hooks/use-capability-detail-load-error.spec.ts
  change: written by the delivery of task/abandonment-and-listing-route/capability-detail-abandon-and-listing-route
- path: src/hooks/use-capability-detail-view.ts
  change: Widens the pass-through half of the view state's union to carry the new reading, so it forwards
    through this hook untouched exactly as the two existing pre-ready readings already do.
- path: src/hooks/use-capability-detail.ts
  change: 'Adds a router-based abandonment act exposed on every reading — go back where the router can,
    otherwise navigate to the capabilities listing — with no dependency on the form''s dirty state or
    on which surface the screen was reached from. Splits the former single error branch: a capability
    read refused because nothing is registered at that identity now returns a reading of its own, carrying
    the abandonment and no reattempt, while every other read failure keeps the load-error reading with
    both.'
- path: src/hooks/use-capability-form.ts
  change: Adds a router and a navigate to useCapabilityForm and computes one onCancel closure — go back
    through the router's own history where it can, otherwise navigate to the capabilities listing — exposed
    on all three branches of the form state, so the abandonment act is available and identically wired
    on every reading of the surface.
- path: src/hooks/use-connector-configuration-detail.ts
  change: Adds a router-history-based return-to-origin act to the detail state, exposed on all three phases
    — go back where the router can, otherwise navigate to the connector-configurations listing — never
    reading the form's dirty state, so the act behaves identically whether or not the operator has edited.
- path: src/hooks/use-connector-configuration-form.ts
  change: Adds a router and a navigate to the form hook and computes one onCancel closure — go back through
    the router's own history where it can, otherwise navigate to the connector-configurations listing
    — exposed on the returned form state so the abandonment act is available wherever the hook is consumed.
- path: src/routes/capability-create-screen-actions.spec.ts
  change: written by the delivery of task/abandonment-and-listing-route/capability-create-abandon-and-listing-route
- path: src/routes/capability-create-screen-cancel.spec.ts
  change: written by the delivery of task/abandonment-and-listing-route/capability-create-abandon-and-listing-route
- path: src/routes/capability-create-screen-listing-route.spec.ts
  change: written by the delivery of task/abandonment-and-listing-route/capability-create-abandon-and-listing-route
- path: src/routes/capability-create-screen.spec.ts
  change: written by the delivery of task/abandonment-and-listing-route/capability-create-abandon-and-listing-route
- path: src/routes/capability-create-screen.tsx
  change: 'Replaces the single secondary button wrapping a link to the listing, repeated once per phase,
    with two controls rendered in every phase: a plain button carrying the abandonment, and a secondary
    button wrapping a link to the capabilities listing. Both stand in the loading footer, in the load-error
    footer beside Retry, and in the ready phase''s trailing actions.'
- path: src/routes/capability-detail-ready-view.tsx
  change: Adds the abandonment control beside the existing field-restoring dialog inside the trailing
    actions, and relabels the existing listing link so the two acts read as two distinct controls.
- path: src/routes/capability-detail-screen-cancel.spec.ts
  change: written by the delivery of task/abandonment-and-listing-route/capability-detail-abandon-and-listing-route
- path: src/routes/capability-detail-screen-listing-control.spec.ts
  change: written by the delivery of task/abandonment-and-listing-route/capability-detail-abandon-and-listing-route
- path: src/routes/capability-detail-screen-not-registered-reading.spec.ts
  change: written by the delivery of task/abandonment-and-listing-route/capability-detail-abandon-and-listing-route
- path: src/routes/capability-detail-screen-origin-independence.spec.ts
  change: written by the delivery of task/abandonment-and-listing-route/capability-detail-abandon-and-listing-route
- path: src/routes/capability-detail-screen-outcome.spec.ts
  change: The fixture at the PUT handler for CAPABILITY_PATH now calls errorResponse("CapabilityNotReadOnlyError",
    422) instead of 409, so the stand-in refusal the test drives the screen through carries the status
    the registry actually answers that refusal with.
- path: src/routes/capability-detail-screen-preready-fields-withheld.spec.ts
  change: written by the delivery of task/abandonment-and-listing-route/capability-detail-abandon-and-listing-route
- path: src/routes/capability-detail-screen-reading-distinctness.spec.ts
  change: written by the delivery of task/abandonment-and-listing-route/capability-detail-abandon-and-listing-route
- path: src/routes/capability-detail-screen-reattempt-exclusivity.spec.ts
  change: written by the delivery of task/abandonment-and-listing-route/capability-detail-abandon-and-listing-route
- path: src/routes/capability-detail-screen-return-to-origin.spec.ts
  change: written by the delivery of task/abandonment-and-listing-route/capability-detail-abandon-and-listing-route
- path: src/routes/capability-detail-screen-route.spec.ts
  change: written by the delivery of task/abandonment-and-listing-route/capability-detail-abandon-and-listing-route
- path: src/routes/capability-detail-screen.spec.ts
  change: written by the delivery of task/abandonment-and-listing-route/capability-detail-abandon-and-listing-route
- path: src/routes/capability-detail-screen.tsx
  change: Renders the abandonment control and a link to the capabilities listing in the loading and load-error
    readings, replacing the single Cancel-as-listing-link, and adds a branch for the new reading that
    renders the same paragraph as load-error, the same two controls, and no reattempt.
- path: src/routes/capability-form-fields-action-footer.spec.ts
  change: written by the delivery of task/abandonment-and-listing-route/capability-create-abandon-and-listing-route
- path: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  change: written by the delivery of task/misstated-facts-in-source/output-schema-help-copy
- path: src/routes/capability-form-fields.tsx
  change: The paragraph beside the output-schema JsonTextareaField now states, in five sentences and no
    worked example, that the entered content is JSON, that the read field names are the keys of the schema's
    own top-level properties object, that each such key's own type and description where the schema states
    them are read as that field's declared semantics, that nothing else in the schema is read or validated,
    and that a description entered there states meaning and names no decision. Every other part of the
    file — the form's other fields, the action footer, isSaveDisabled, the JsonTextareaField wiring —
    is unchanged.
- path: src/routes/capability-not-read-only-refusal-status.spec.ts
  change: written by the delivery of task/misstated-facts-in-source/nature-refusal-fixture-status
- path: src/routes/connector-configuration-create-screen-cancel.spec.ts
  change: written by the delivery of task/abandonment-and-listing-route/connector-create-abandon-and-listing-route
- path: src/routes/connector-configuration-create-screen.spec.ts
  change: written by the delivery of task/abandonment-and-listing-route/connector-create-abandon-and-listing-route
- path: src/routes/connector-configuration-create-screen.tsx
  change: 'Replaces the single secondary button wrapping a link to the listing with two controls in the
    trailing-actions slot: a plain button carrying the abandonment, and a secondary button wrapping a
    link to the connector-configurations listing.'
- path: src/routes/connector-configuration-detail-ready-view-cancel.spec.ts
  change: written by the delivery of task/abandonment-and-listing-route/connector-detail-abandon-and-listing-route
- path: src/routes/connector-configuration-detail-ready-view.tsx
  change: Adds the abandonment control beside the existing link to the listing in the ready phase's trailing
    actions, so the ready phase now renders both controls rather than the listing link alone.
- path: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
  change: written by the delivery of task/abandonment-and-listing-route/connector-detail-abandon-and-listing-route
- path: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
  change: written by the delivery of task/abandonment-and-listing-route/connector-detail-abandon-and-listing-route
- path: src/routes/connector-configuration-detail-screen.spec.ts
  change: written by the delivery of task/abandonment-and-listing-route/connector-detail-abandon-and-listing-route
- path: src/routes/connector-configuration-detail-screen.tsx
  change: Renders both the abandonment control and a link to the connector-configurations listing in the
    loading and load-error phases' footer, replacing the single Cancel-as-listing-link that stood there
    before.
- path: src/routes/connector-configuration-form-fields-action-footer.spec.ts
  change: written by the delivery of task/abandonment-and-listing-route/connector-create-abandon-and-listing-route
nodes:
- node: contracts/integration/capability-registry
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-capability-detail.ts, src/hooks/use-capability-form.ts,
    and src/routes/capability-create-screen.tsx read `nowhere` — const state = useCapabilityForm(null,
    handleSaved); — a binding asserts the file answers for the node, so the pair that stopped holding
    it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-capability-form.ts
  - src/routes/capability-create-screen.tsx
- node: contracts/integration/connector-configuration-registry
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-connector-configuration-detail.ts,
    src/hooks/use-connector-configuration-form.ts, src/routes/connector-configuration-detail-ready-view.tsx,
    and src/routes/connector-configuration-create-screen.tsx read `nowhere` — const state = useConnectorConfigurationForm(null,
    handleSaved); — the screen calls no registry operation itself. — a binding asserts the file answers
    for the node, so the pair that stopped holding it is released by `--bind ... --replace`, never restamped
    here'
  observed_at:
  - src/hooks/use-connector-configuration-detail.ts
  - src/hooks/use-connector-configuration-form.ts
  - src/routes/connector-configuration-create-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: domain/integration/capability
  conforms: false
  how: "the fact left part of its ground: still held in src/hooks/use-capability-detail.ts, src/hooks/use-capability-form.ts,\
    \ src/routes/capability-detail-screen.tsx, src/routes/capability-form-fields.tsx, and src/routes/capability-create-screen.tsx\
    \ read `nowhere` — const name = values?.name ?? \"\";\n    const version = values?.version ?? \"\"\
    ; — a binding asserts the file answers for the node, so the pair that stopped holding it is released\
    \ by `--bind ... --replace`, never restamped here"
  observed_at:
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-capability-form.ts
  - src/routes/capability-create-screen.tsx
  - src/routes/capability-detail-screen.tsx
  - src/routes/capability-form-fields.tsx
- node: domain/integration/capability-nature
  conforms: true
  how: 'src/routes/capability-form-fields.tsx: held at NATURE_OPTIONS, built from the imported vocabulary
    and rendered as the Nature select''s options — const NATURE_OPTIONS: SelectOption[] = CAPABILITY_NATURES.map((nature)
    => ({ value: nature, label: nature, }));'
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: domain/integration/capability-registry
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-capability-form.ts, and src/routes/capability-create-screen.tsx
    read `nowhere` — const state = useCapabilityForm(null, handleSaved); — a binding asserts the file
    answers for the node, so the pair that stopped holding it is released by `--bind ... --replace`, never
    restamped here'
  observed_at:
  - src/hooks/use-capability-form.ts
  - src/routes/capability-create-screen.tsx
- node: domain/integration/connector-configuration
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-connector-configuration-detail.ts,
    src/hooks/use-connector-configuration-form.ts, src/routes/connector-configuration-detail-ready-view.tsx,
    src/routes/connector-configuration-detail-screen.tsx, and src/routes/connector-configuration-create-screen.tsx
    read `nowhere` — <ConnectorConfigurationFormFields form={state.form} configuration={state.configuration}
    .../> — the value object''s attributes are passed through, never declared or handled by this file.
    — a binding asserts the file answers for the node, so the pair that stopped holding it is released
    by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/hooks/use-connector-configuration-detail.ts
  - src/hooks/use-connector-configuration-form.ts
  - src/routes/connector-configuration-create-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
  - src/routes/connector-configuration-detail-screen.tsx
- node: domain/integration/connector-configuration-registry
  conforms: false
  how: 'no named file holds this fact now: src/hooks/use-connector-configuration-form.ts read `nowhere`
    — the refusal and replace-whole-on-edit behaviour this node states belongs to the registry the file
    calls; this file only issues the PUT and reads back its answer — `apiFetch<ConnectorConfiguration>(...)`;
    src/routes/connector-configuration-create-screen.tsx read `nowhere` — onSubmit={state.onSubmit} —
    the write is delegated to the hook; this file performs no registration itself.'
  observed_at:
  - src/hooks/use-connector-configuration-form.ts
  - src/routes/connector-configuration-create-screen.tsx
- node: domain/investigation/field-semantics
  conforms: false
  how: 'no named file holds this fact now: src/routes/capability-form-fields.tsx read `nowhere` — the
    file carries no code that reads a `type` or `description` off any schema''s `properties` object —
    the only place this fact appears is the help paragraph''s own sentence, "Os nomes de campo lidos a
    partir dele são as chaves do próprio objeto properties de nível superior deste schema.", which states
    the reading rather than performing it'
  observed_at:
  - src/routes/capability-form-fields.tsx
- node: rules/glossary/a-description-states-meaning-never-policy
  conforms: false
  how: 'no named file holds this fact now: src/routes/capability-form-fields.tsx read `nowhere` — "Uma
    description aqui declara o que seu valor significa e não nomeia nenhuma decisão." states the policy
    as guidance beside the entry; no code in this file checks or enforces it'
  observed_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/a-capability-declares-its-contract
  conforms: false
  how: 'src/hooks/use-capability-form.ts, SAVE_FAILURE_MESSAGE_BY_KIND[''incomplete-capability-contract''],
    lines 46-47: "This capability does not declare its contract completely; every field of its contract
    is required." — An operator who omitted only the timeout is told by this message that every field
    of the contract is required, but rules/integration/a-capability-declares-its-contract has a registration
    that states no timeout take the default of sixty seconds rather than being refused as incomplete —
    the message asserts a stricter rule than the registry enforces, and the next reader who wants the
    timeout''s real default behavior finds it contradicted here instead of confirmed.'
  observed_at:
  - src/hooks/use-capability-form.ts
- node: rules/integration/a-capability-declares-well-formed-schemas
  conforms: true
  how: "src/hooks/use-capability-detail.ts: held at the client-side well-formedness gate before submit\
    \ — setInputSchemaValid(getJsonTextareaMinifiedValue(query.data.input_schema) !== null); ... if (!inputSchemaValid\
    \ || !outputSchemaValid) { return; }\nsrc/hooks/use-capability-form.ts: held at the client-side submit\
    \ gate and the matching outcome message — if (!inputSchemaValid || !outputSchemaValid) { return; }\
    \ ... \"capability-schema-not-well-formed\": \"The input schema or the output schema is not syntactically\
    \ valid JSON.\"\nsrc/routes/capability-detail-ready-view.tsx: held at the conditional warning banners\
    \ driven by state.inputSchema.isValid / state.outputSchema.isValid — const INVALID_INPUT_SCHEMA_WARNING\
    \ =\n  \"This capability's stored input schema is not valid JSON. Correct it before Save can succeed.\"\
    ;\n...\n{!state.inputSchema.isValid && (\n  <p role=\"alert\" className=\"text-sm text-destructive\"\
    >\n    {INVALID_INPUT_SCHEMA_WARNING}\n  </p>\n)}\nsrc/routes/capability-form-fields.tsx: held at\
    \ the Save-button gate, which withholds submission while either schema is invalid — const isSaveDisabled\
    \ =\n    isSubmitting || !inputSchema.isValid || !outputSchema.isValid || isDirty === false;"
  encoded_at:
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-capability-form.ts
  - src/routes/capability-detail-ready-view.tsx
  - src/routes/capability-form-fields.tsx
- node: rules/integration/a-capability-is-read-only
  conforms: false
  how: "src/routes/capability-not-read-only-refusal-status.spec.ts, the `toEqual([422])` assertion at\
    \ line 31 and the `status === 422` comparison at line 42: expect(capabilityNotReadOnlyStatuses(outcomeProofContent)).toEqual([422]);\n\
    ...\nexpect(statuses.every((status) => status === 422)).toBe(true);\n — The HTTP status the registry\
    \ pairs with CapabilityNotReadOnlyError (a-capability-is-read-only states it as 422) is written here\
    \ a second time, as a bare literal the guard compares against, rather than being read from the one\
    \ place the specification states it. If that status ever changed in the node, nothing ties this file's\
    \ `422` to it — the guard would keep enforcing the old number as its own authority, exactly the shape\
    \ of a stand-in pairing this error with a status the node no longer names, which is the defect this\
    \ file exists to catch in every other file but repeats in itself."
  observed_at:
  - src/hooks/use-capability-form.ts
  - src/routes/capability-detail-screen-outcome.spec.ts
  - src/routes/capability-form-fields.tsx
- node: rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed
  conforms: false
  how: 'src/hooks/use-capability-detail.ts, lines 62-68, the useQuery call reading the capability by identity:
    const query = useQuery({ queryKey: ["capability", name, version], queryFn: () => apiFetch<Capability>(`/v1/capabilities/${encodeURIComponent(name)}/${encodeURIComponent(version)}`),
    }); — This call sets no retry option, so it inherits the shared QueryClient''s retry: 1 default (src/services/query-client.ts,
    retry: 1), and TanStack Query silently reissues this identity read once on its own before the failed
    window — or the not-registered window — is ever shown to the operator. The node states the read is
    issued again only on the operator''s own act, and that a surface re-issuing the read on its own is
    that loop the rate limit is written against; every load of this surface now contains exactly that
    automatic reissue, invisible to the operator and independent of anything they did. The hook''s own
    test harness (use-capability-detail.test-support.ts) disables retry explicitly to avoid this, which
    is itself evidence that production is left with it active.'
  observed_at:
  - src/hooks/use-capability-detail.ts
  - src/routes/capability-detail-screen.tsx
- node: rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering
  conforms: true
  how: "src/hooks/use-connector-configuration-detail.ts: held at `onCancel`, lines 53-59 — if (router.history.canGoBack())\
    \ {\n  router.history.back();\n  return;\n}\nvoid navigate({ to: \"/connectors\" });\n\nsrc/hooks/use-connector-configuration-form.ts:\
    \ held at onCancel, lines 67-73 — const onCancel = (): void => {\n  if (router.history.canGoBack())\
    \ {\n    router.history.back();\n    return;\n  }\n  void navigate({ to: \"/connectors\" });\n};\n\
    \nsrc/routes/connector-configuration-create-screen.tsx: held at the Cancel button, lines 33-35 — <Button\
    \ type=\"button\" variant=\"secondary\" onClick={state.onCancel}>Cancel</Button>\nsrc/routes/connector-configuration-detail-ready-view.tsx:\
    \ held at the Cancel button's onClick — <Button type=\"button\" variant=\"secondary\" onClick={state.onCancel}>"
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  - src/hooks/use-connector-configuration-form.ts
  - src/routes/connector-configuration-create-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: true
  how: 'src/hooks/use-connector-configuration-detail.ts: held at `isValidConfigurationObject`, lines 16-23,
    gating submission at line 135-137 — return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);


    src/hooks/use-connector-configuration-form.ts: held at isValidConfigurationObject, lines 16-23, and
    the well-formed message entry, lines 44-47 — return typeof parsed === "object" && parsed !== null
    && !Array.isArray(parsed); ... "connector-configuration-not-well-formed": "This configuration is not
    syntactically valid JSON."

    src/routes/connector-configuration-detail-ready-view.tsx: held at the INVALID_CONFIGURATION_WARNING
    alert gated on `!state.configuration.isValid` — see the finding above, which is about this same construct
    — {!state.configuration.isValid && ('
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  - src/hooks/use-connector-configuration-form.ts
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  conforms: true
  how: 'src/routes/connector-configuration-detail-ready-view.tsx: held at the configurationText prop passed
    to ConnectorTestPanel, sourced from state.registeredConfigurationText rather than any locally edited
    form text — configurationText={state.registeredConfigurationText}'
  encoded_at:
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing
  conforms: false
  how: "src/routes/connector-configuration-form-fields-action-footer.spec.ts, lines 38 and 63 — `within(footer).getByRole(\"\
    link\", { name: \"Connectors\" })`, in both the create-surface composition test and the footer-link-uniqueness\
    \ test: expect(within(footer).getByRole(\"link\", { name: \"Connectors\" })).toBeTruthy();\n...\n\
    expect(within(footer).getByRole(\"link\", { name: \"Connectors\" })).toBe(links[0]);\n — The test\
    \ fails the instant the Connectors control is rendered as anything other than an anchor element carrying\
    \ ARIA role `link` — a button that programmatically navigates to the listing, for instance. The rule\
    \ governing this exact control states that which control carries the route is the interface's own\
    \ choice, not the specification's; the test freezes that choice into a passing/failing condition,\
    \ so a future, fully conformant change to the control's implementation reads here as a regression,\
    \ and whoever meets that failure will look in the specification for a link-role requirement and find\
    \ none."
  observed_at:
  - src/routes/connector-configuration-create-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
  - src/routes/connector-configuration-detail-screen.tsx
- node: rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
  conforms: false
  how: "src/hooks/use-capability-detail.ts, the ready-phase return object (lines 188-207), against the\
    \ private baseline state set at lines 59-60 and 89/92: const [inputSchemaBaseline, setInputSchemaBaseline]\
    \ = useState(\"\"); const [outputSchemaBaseline, setOutputSchemaBaseline] = useState(\"\"); ... setInputSchemaBaseline(query.data.input_schema);\
    \ ... setOutputSchemaBaseline(query.data.output_schema); ... return { phase: \"ready\", form, conceptOptions:\
    \ conceptOptions.concepts, inputSchema: { value: inputSchemaValue, isValid: inputSchemaValid, onChange:\
    \ handleInputSchemaChange }, outputSchema: { value: outputSchemaValue, isValid: outputSchemaValid,\
    \ onChange: handleOutputSchemaChange }, isDirty, isSubmitting: mutation.isPending, isSubmitSuccessful:\
    \ mutation.isSuccess, onSubmit, onCancel }; — The node requires an act, on a surface that has read\
    \ a registration, whose whole effect is to return every field to the content that read answered. This\
    \ hook computes inputSchemaBaseline and outputSchemaBaseline from that same read but never returns\
    \ them, and returns no discard callback either — only form (recoverable via form.reset()) is exposed.\
    \ Whatever renders this ready phase has the means to discard an edited nature, timeout, connector\
    \ or concept, but no means at all to discard an edited input or output schema back to what the registry\
    \ answered; the two attributes whose recovery the node's own description calls out by name are exactly\
    \ the ones this hook leaves unrecoverable.\nsrc/hooks/use-connector-configuration-detail.ts, the `ready`-phase\
    \ return and the `configuration` field it constructs, lines 152-166: configuration: {\n  value: configurationValue,\n\
    \  isValid: configurationValid,\n\n  onChange: handleConfigurationChange,\n},\n — The hook itself\
    \ computes `isDirty` by comparing the live text against `configurationBaseline` (line 130-132), so\
    \ it knows an edit is in place, but it exposes no way to put that edit down without leaving: `configurationBaseline`\
    \ is set only by `setConfigurationBaseline` and never returned, and the only way to change `configurationValue`\
    \ from outside is `handleConfigurationChange`, which re-validates whatever text it is given rather\
    \ than restoring the last read. No view built against this hook's own return type can offer the discard\
    \ the specification calls for, no matter how it is written — the capability the rule requires does\
    \ not exist anywhere reachable from this surface.\nsrc/routes/capability-form-fields-action-footer.spec.ts,\
    \ line 50, within the detail-surface test: expect(within(footer).getByRole(\"button\", { name: \"\
    Discard changes\" })).toBeTruthy(); — The two neighbouring Cancel assertions (lines 37-40 and 51-54)\
    \ were loosened this same delivery to accept either a button or a link, so that whichever affordance\
    \ the interface renders satisfies the test; the Discard changes assertion was left requiring exactly\
    \ the button role. An interface free, per the node, to render the discard control as any affordance\
    \ would fail this test though it violates nothing the specification states, so the test becomes a\
    \ second, stricter authority over a form decision the specification places with the interface."
  observed_at:
  - src/routes/capability-detail-screen.tsx
  - src/routes/connector-configuration-create-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
  - src/routes/connector-configuration-detail-screen.tsx
- node: rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read
  conforms: false
  how: 'src/routes/connector-configuration-detail-screen.tsx, the `loading` branch, line 15: <p>Loading
    connector configuration {connector}…</p> — while the read of this connector''s configuration is still
    outstanding, the screen already shows the connector''s own name inline in the loading text — a value
    indistinguishable, to the operator, from a connector value the read has confirmed, which is exactly
    the confusion the rule exists to keep apart from an unanswered read.'
  observed_at:
  - src/routes/connector-configuration-detail-screen.tsx
- node: rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing
  conforms: true
  how: "src/routes/capability-create-screen.tsx: held at the Link to the listing rendered in the loading,\
    \ load-error and ready (trailingActions) branches alike — <Button variant=\"secondary\" asChild>\n\
    \  <Link to=\"/capabilities\">Capabilities</Link>\n</Button>\nsrc/routes/capability-detail-ready-view.tsx:\
    \ held at the unconditional listing link inside trailingActions — <Button variant=\"secondary\" asChild>\n\
    \  <Link to=\"/capabilities\">Capabilities</Link>\n</Button>\nsrc/routes/capability-detail-screen.tsx:\
    \ held at the Capabilities link present in every early-return branch, lines 22-24, 41-43, 57-59 —\
    \ <Link to=\"/capabilities\">Capabilities</Link>"
  encoded_at:
  - src/routes/capability-create-screen.tsx
  - src/routes/capability-detail-ready-view.tsx
  - src/routes/capability-detail-screen.tsx
- node: rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading
  conforms: true
  how: "src/hooks/use-capability-detail.ts: held at onCancel, present in every returned phase (loading,\
    \ load-error, not-registered, ready) — const onCancel = (): void => { if (router.history.canGoBack())\
    \ { router.history.back(); return; } void navigate({ to: \"/capabilities\" }); };\nsrc/hooks/use-connector-configuration-detail.ts:\
    \ held at `onCancel`, returned unconditionally in the `loading` (line 127), `load-error` (lines 118-124)\
    \ and `ready` (line 165) phases — return { phase: \"loading\", onCancel };\n\nsrc/routes/capability-detail-ready-view.tsx:\
    \ held at the unconditional Cancel button inside trailingActions — <Button type=\"button\" variant=\"\
    secondary\" onClick={state.onCancel}>\n  Cancel\n</Button>\nsrc/routes/capability-detail-screen.tsx:\
    \ held at the Cancel button present in every early-return branch, lines 19-21, 38-40, 54-56 — <Button\
    \ type=\"button\" variant=\"secondary\" onClick={state.onCancel}>Cancel</Button>\nsrc/routes/connector-configuration-detail-ready-view.tsx:\
    \ held at the Cancel button, offered regardless of isDirty and distinct from both the Discard dialog\
    \ and the Connectors link — <Button type=\"button\" variant=\"secondary\" onClick={state.onCancel}>\n\
    \              Cancel\n            </Button>\nsrc/routes/connector-configuration-detail-screen.tsx:\
    \ held at the `Cancel` button present in both the `loading` and `load-error` branches, wired to `state.onCancel`\
    \ — <Button type=\"button\" variant=\"secondary\" onClick={state.onCancel}>Cancel</Button>"
  encoded_at:
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-connector-configuration-detail.ts
  - src/routes/capability-detail-ready-view.tsx
  - src/routes/capability-detail-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
  - src/routes/connector-configuration-detail-screen.tsx
- node: rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
  conforms: false
  how: "src/hooks/use-connector-configuration-form.ts, SAVE_FAILURE_MESSAGE_BY_KIND (lines 44-47) and\
    \ the `??` fallback inside saveFailureMessage (line 52): const SAVE_FAILURE_MESSAGE_BY_KIND: Partial<Record<UiErrorStateKind,\
    \ string>> = {\n  \"connector-configuration-not-well-formed\":\n    \"This configuration is not syntactically\
    \ valid JSON.\",\n};\n...\nreturn SAVE_FAILURE_MESSAGE_BY_KIND[state.kind] ?? GENERIC_SAVE_FAILURE_MESSAGE;\n\
    \ — rules/integration/a-connector-configuration-holds-a-well-formed-object names two distinct refusal\
    \ conditions for register-connector — ConnectorConfigurationNotWellFormedError and IncompleteConnectorConfigurationError.\
    \ This file distinguishes only the first; any other named condition, the incomplete one included,\
    \ falls through to the same GENERIC_SAVE_FAILURE_MESSAGE (\"Something went wrong while saving this\
    \ connector configuration. Try again.\") that a wholly unrecognised failure produces. An operator\
    \ refused for a specific, nameable reason therefore reads exactly the same toast as one refused for\
    \ a reason the surface does not recognise, which is precisely the pair a-submitted-registration-states-its-outcome-to-the-operator\
    \ requires be told apart."
  observed_at:
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-capability-form.ts
  - src/hooks/use-connector-configuration-detail.ts
  - src/hooks/use-connector-configuration-form.ts
  - src/routes/capability-detail-screen-outcome.spec.ts
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: rules/integration/a-successful-connector-registration-lands-on-the-configurations-own-surface
  conforms: true
  how: "src/hooks/use-connector-configuration-detail.ts: held at `mutation.onSuccess`, lines 99-106, which\
    \ performs no navigation and leaves the operator on the surface already addressed by `connector` —\
    \ onSuccess: () => {\n  form.reset({ connector });\n  setConfigurationBaseline(configurationValue);\n\
    \  void queryClient.invalidateQueries({ queryKey: [\"connector-configurations\"] });\n  void queryClient.invalidateQueries({\
    \ queryKey: [\"connector-configuration\", connector] });\n},\n\nsrc/routes/connector-configuration-create-screen.tsx:\
    \ held at handleSaved, lines 14-17 — void navigate({ to: \"/connectors/$connector\", params: { connector\
    \ } });"
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  - src/routes/connector-configuration-create-screen.tsx
- node: rules/integration/an-abandoned-capability-registration-entry-registers-nothing
  conforms: true
  how: "src/hooks/use-capability-detail.ts: held at onCancel — no register-capability call, navigates\
    \ away only — const onCancel = (): void => { if (router.history.canGoBack()) { router.history.back();\
    \ return; } void navigate({ to: \"/capabilities\" }); };\nsrc/hooks/use-capability-form.ts: held at\
    \ onCancel, which never calls the mutation and returns the operator to the surface it was reached\
    \ from — const onCancel = (): void => { if (router.history.canGoBack()) { router.history.back(); return;\
    \ } void navigate({ to: \"/capabilities\" }); };\nsrc/routes/capability-create-screen.tsx: held at\
    \ the Cancel control wired in every phase to state.onCancel — <Button type=\"button\" variant=\"secondary\"\
    \ onClick={state.onCancel}>\n  Cancel\n</Button>\nsrc/routes/capability-detail-ready-view.tsx: held\
    \ at the same unconditional Cancel button, which discards an unsubmitted edit and leaves the ready\
    \ surface — <Button type=\"button\" variant=\"secondary\" onClick={state.onCancel}>\n  Cancel\n</Button>"
  encoded_at:
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-capability-form.ts
  - src/routes/capability-create-screen.tsx
  - src/routes/capability-detail-ready-view.tsx
- node: rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
  conforms: true
  how: 'src/hooks/use-capability-detail.ts: held at onCancel''s fallback branch — void navigate({ to:
    "/capabilities" });

    src/hooks/use-capability-form.ts: held at the same onCancel''s fallback branch — void navigate({ to:
    "/capabilities" });

    src/hooks/use-connector-configuration-detail.ts: held at `onCancel`''s fallback branch, line 58 —
    void navigate({ to: "/connectors" });


    src/hooks/use-connector-configuration-form.ts: held at onCancel''s no-history branch, line 72 — void
    navigate({ to: "/connectors" });'
  encoded_at:
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-capability-form.ts
  - src/hooks/use-connector-configuration-detail.ts
  - src/hooks/use-connector-configuration-form.ts
- node: rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it
  conforms: false
  how: "src/routes/capability-form-fields-output-schema-guidance.spec.ts, `findGuidanceParagraph` (lines\
    \ 15-21) and the criterion 2-6 assertions locating and checking the guidance paragraph (lines 41-100):\
    \ /o que é inserido aqui é json/i.test(p.textContent ?? \"\")\n...\nexpect(guidance?.textContent).toMatch(\n\
    \  /os nomes de campo lidos a partir dele são as chaves do próprio objeto properties de nível superior\
    \ deste schema/i,\n);\n — The five claims rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it\
    \ requires are locked to their current Portuguese sentences character-for-character, and the very\
    \ function used to find the paragraph (`findGuidanceParagraph`) depends on one of those exact sentences\
    \ too. A legitimate rewording of the guidance copy that still states every one of the five claims\
    \ and adds no sixth — exactly what the node requires — would fail every one of these assertions and\
    \ the locator itself, so whoever edits the screen's copy must edit this file in lockstep. The node\
    \ itself states wording is form the interface owns (\"which control carries the statement, its wording...\
    \ are form and belong to the interface, not here\"), so this file has no standing to require one specific\
    \ rendering of it; the day the copy is reworded for clarity, nobody reading a failing assertion here\
    \ can tell whether substance regressed or only phrasing changed.\nsrc/routes/capability-form-fields-output-schema-guidance.spec.ts,\
    \ the criterion 8 assertion (lines 122-134): const sentences = (guidance?.textContent ?? \"\")\n \
    \ .split(\".\")\n  .map((sentence) => sentence.trim())\n  .filter((sentence) => sentence.length >\
    \ 0);\nexpect(sentences).toHaveLength(5);\n — rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it\
    \ requires that the surface state exactly five claims and no sixth — a claim count, not a sentence\
    \ count. Counting period-delimited fragments instead means a paragraph that states the same five claims\
    \ and nothing else, but renders them across a different number of sentences (a semicolon joining two,\
    \ or an added clarifying clause with its own period that introduces no new claim), fails this test\
    \ even though the domain requirement it stands in for is still met — pinning a textual shape the node\
    \ leaves to the interface as though it were the claim count itself."
  observed_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/one-capability-answers-one-concept
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-capability-form.ts, and src/routes/capability-form-fields.tsx
    read `nowhere` — conceptSelectOptions offers every concept unfiltered; the 409/500 uniqueness refusal
    this rule states is the registry''s own, not checked here — a binding asserts the file answers for
    the node, so the pair that stopped holding it is released by `--bind ... --replace`, never restamped
    here'
  observed_at:
  - src/hooks/use-capability-form.ts
  - src/routes/capability-form-fields.tsx
unstated:
- file: src/hooks/use-capability-detail-load-error.spec.ts
  where: the describe block "useCapabilityDetail -- bundling the concept vocabulary into the ready phase
    (an inference the implementation recorded)", lines 78-122
  evidence: it("reports the load-error phase when the concept vocabulary read fails, even though the capability
    identity GET itself succeeds", async () => { ... await waitFor(() => expect(result.current.phase).toBe("load-error"));
    }); ... it("reissues the concept vocabulary read when retryLoad is called after only that read failed,
    resolving to ready once it succeeds", async () => { ... loadErrorState(result.current).retryLoad();
    ... await waitFor(() => expect(result.current.phase).toBe("ready")); });
  cost: the file pins, as a passing test, that this surface's "ready" versus "load-error" state and what
    a single retry control replays both turn on a second resource — the glossary's concept vocabulary
    — succeeding alongside the capability read, and that one retry reissues both reads together. None
    of this file's fourteen nodes, nor a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed
    (which states the in-flight/failed/read windows only for the capability identity read itself), say
    that a second, unrelated read gates the same state or that retrying replays it too; a reader checking
    what blocks an operator from reaching "ready", or what a retry control actually re-issues, finds only
    the capability-identity rule and nothing about the concept vocabulary it is silently bundled with.
- file: src/hooks/use-capability-detail-load-error.spec.ts
  where: the describe block "useCapabilityDetail -- exposing no isEditingIdentity flag (an inference the
    implementation recorded)", lines 124-134
  evidence: expect("isEditingIdentity" in readyState(result.current)).toBe(false);
  cost: pinning the absence of a property on the hook's own return shape states a fact about this surface's
    internal composition rather than about what an operator can learn or do, and no node of this file's
    set constrains that shape either way — so nothing here is weighed against the specification; noted
    for completeness rather than pressed as a finding.
- file: src/routes/capability-create-screen-cancel.spec.ts
  where: same describe block, line 126
  evidence: '"CapabilityCreateScreen -- the abandonment control renders on every reading of the surface
    (disclosed inference)"'
  cost: 'The self-applied label "disclosed inference" reads like a decision-log citation but points nowhere:
    decision-log.md records no entry for this fact, so the phrase claims a provenance the file does not
    carry, and a reader who trusts the label stops looking for the rule the specification never states.'
- file: src/routes/capability-create-screen-cancel.spec.ts
  where: the describe block "the abandonment control renders on every reading of the surface (disclosed
    inference)", lines 126-154
  evidence: "it(\"renders Cancel while the concept vocabulary is still loading\", async () => {\n  ...\n\
    \  await screen.findByText(\"Loading…\");\n  expect(screen.getByRole(\"button\", CANCEL_BUTTON)).toBeTruthy();\n\
    });\n\nit(\"renders Cancel once the concept vocabulary has failed to load\", async () => {\n  ...\n\
    \  await screen.findByRole(\"button\", { name: \"Retry\" });\n  expect(screen.getByRole(\"button\"\
    , CANCEL_BUTTON)).toBeTruthy();\n});"
  cost: 'The test locks in, as a required behavior, that the abandonment control must survive the concept-vocabulary
    loading and failed-load windows of the capability authoring surface — a distinction the specification
    draws explicitly for the sibling listing route ("The route''s presence turns on nothing further —
    not on whether the read backing the surface has completed, failed") and for the origin-return act
    on a detail surface ("present at every reading... conditioned on nothing else"), but never draws for
    the abandonment act on an authoring surface. The test''s own label, "disclosed inference", names the
    gap: a future reviewer holding the create screen to the specification finds no node stating this and
    has only this test''s word for it, so the rule the business actually wants here lives in a test file
    rather than in the specification.'
- file: src/routes/capability-create-screen-listing-route.spec.ts
  where: the fifth describe block, lines 80-108 ("the route to the capabilities listing is not dropped
    while a save is pending (UNDERDETERMINED, from the specification)")
  evidence: "it(\"keeps the Capabilities link rendered while a save is pending -- an implementation offering\
    \ the route on only the three readings the criteria name, and dropping it on every other reading,\
    \ would fail this\", async () => {\n...\nexpect(screen.getByRole(\"link\", { name: \"Capabilities\"\
    \ }).getAttribute(\"href\")).toBe(\n  \"/capabilities\",\n);\n"
  cost: The task's own criteria for this node enumerate three readings only — the concept read outstanding,
    the concept read failed, and the surface ready to author — and a submission in flight is not one of
    them, in the task or in any of the fourteen nodes' own enumerated readings. This test nonetheless
    requires the link to survive a pending PUT, binding a future implementation to a guarantee the specification's
    own criteria never named; a reader who finds this test failing will look to the node's stated readings
    for why and find only three, not four, and the requirement that the route also survive a pending submission
    lives only in this test.
- file: src/routes/capability-create-screen.spec.ts
  where: the describe blocks for criteria 6 and 7, lines 103–156 ("a loading state while the concept vocabulary
    is pending" and "a failure state offering a retry when the concept vocabulary fails to load")
  evidence: 'expect(await screen.findByText("Loading…")).toBeTruthy();

    expect(screen.queryByLabelText("Concept")).toBeNull();

    ...

    expect(await screen.findByText("Unable to load concepts.")).toBeTruthy();

    expect(screen.queryByLabelText("Concept")).toBeNull();

    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();

    '
  cost: The three-window shape this specification states elsewhere for a registration read (still-being-read
    / could-not-be-read-with-a-retry / answered, told apart and never presented as one another) is asserted
    here for a different read — the concept vocabulary listing this create screen depends on — with no
    node stating that this read gets the same treatment, that the operator is told anything at all while
    it is outstanding or has failed, or that a retry is owed. A later reader who wants to know what the
    create screen owes the operator when the concept vocabulary fails to load will search the specification
    for it and find nothing; the fact lives only in this test and the component it exercises.
- file: src/routes/capability-detail-screen-not-registered-reading.spec.ts
  where: line 21, `await screen.findByText("Unable to load this capability right now.");`
  evidence: await screen.findByText("Unable to load this capability right now.");
  cost: The decision log records, three times over, that no node states what the capability detail surface
    presents to the operator on the reading where the identity-keyed read answered that nothing is registered
    at that name and version (rule a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed
    explicitly excepts this refusal from its own failed window, calling it "its own answer and not this
    window," and its neighbouring log entries call the surface's actual statement in this reading "noticed
    and not decided" — twice for the capability side specifically). This assertion fixes that undecided
    fact to one literal string, and the source (capability-detail-screen.tsx) reuses the exact same text
    for the genuinely-failed window, so a reader who wants to know what this reading states finds the
    answer only in this test and in the component's own duplicated string, never in a node; a future change
    that gave the not-registered reading its own wording (the way the connector-configuration sibling
    already got one) would break silently against a test the specification gives it no standing to hold.
- file: src/routes/capability-detail-screen-reattempt-exclusivity.spec.ts
  where: the describe block's title, line 14
  evidence: describe("CapabilityDetailScreen -- the reattempt control is withheld from every reading but
    the failed-read one (criterion 15)", () => {
  cost: The node this suite is named for (rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed)
    enumerates exactly three presentations -- read-and-shown, outstanding, failed -- and its expression
    withholds the reattempt control from only 'the other two' of those three; the registry's refusal of
    an unregistered name and version is expressly excepted from being 'this window' at all, so no node
    says whether the control is withheld there. The two tests in this file exercise only the outstanding
    and shown presentations, yet the suite's own title generalizes to 'every reading but the failed-read
    one' -- a total exclusivity that includes the not-registered presentation. A reader who takes this
    title as the specification's own claim will believe the not-registered reading's control-withholding
    is settled by the specification, when in fact that reading is carried in capability-detail-screen.tsx's
    own 'not-registered' branch with no node backing it, and this suite offers no test of it either. The
    gap between what the title claims and what is tested is the gap between the node's loose statement
    ('in the failed window alone') and its bounded expression ('the other two' of three named presentations).
- file: src/routes/capability-detail-screen-return-to-origin.spec.ts
  where: line 141, it("renders where the read answered that no capability is registered at that name and
    version", ...)
  evidence: await screen.findByText("Unable to load this capability right now.");
  cost: Same as the finding above — a second occurrence of the same unheld fact, asserted independently
    in a different test, so the specification's silence is doubled in the source rather than closed.
- file: src/routes/capability-detail-screen-return-to-origin.spec.ts
  where: line 72, it("lands on the capabilities listing from the nothing-registered reading", ...)
  evidence: await screen.findByText("Unable to load this capability right now.");
  cost: The specification's own decision log records this reading's presented content as noticed and not
    decided — no node says what the surface states when the identity read answers that nothing is registered.
    Pinning this exact sentence in the test makes the wording a fact the test enforces rather than one
    the specification holds, so a later analysis that decides this fact (as it already did for the sibling
    connector-configuration surface) can contradict a test nobody wrote it against, and a reader who wants
    to know what this reading presents will not find it in the specification.
- file: src/routes/capability-detail-screen.spec.ts
  where: lines 73-88, describe block over an identity nothing is registered at rendering its own reading,
    distinct from the failed-read reading
  evidence: 'await screen.findByText("Unable to load this capability right now."); expect(screen.queryByRole("button",
    { name: "Retry" })).toBeNull();'
  cost: 'No node states what a capability-keyed surface presents to the operator where the read answered
    that the capability''s identity itself is unregistered. The governing rule expressly excepts that
    refusal from its own failed-read window, and the decision log records that this exact silence was
    noticed and not decided. The sibling fact on the connector-configuration side was decided with its
    own distinct wording, never could-not-be-read; no equivalent decision exists for capabilities. This
    test pins the wording shown, identical to the wording the same component states for every other failed
    read, and pins that Retry is withheld here, as though both facts were already settled. They are not:
    they are the delivery''s own composition, reusing the neighbouring failure reading''s wording, encoded
    into a passing test as if it were specification-derived behaviour.'
- file: src/routes/capability-detail-screen.tsx
  where: the "not-registered" phase branch, lines 49-63
  evidence: <p>Unable to load this capability right now.</p>
  cost: an operator who reaches this identity because nothing was ever registered there (a stale link,
    a typo'd name or version) is told the identical sentence a genuinely failed read shows at line 33
    ("Unable to load this capability right now."), the one visible difference being the absence of the
    Retry control; the specification's own rule treats the registry's refusal of an unregistered identity
    as "its own answer and not this window" — a different situation from a read that merely failed to
    answer — so the source has settled, on its own, that this fourth reading tells the operator the same
    thing a failed read does, and no node records that as the decided content of this reading. A future
    reader who wants to know what a capability-keyed surface states when nothing is registered at the
    named identity will look for that fact in the specification and find only the read-in-flight/read-failed
    rule, which explicitly disclaims covering this case.
- file: src/routes/connector-configuration-detail-ready-view.tsx
  where: the INVALID_CONFIGURATION_WARNING constant (lines 18-19) and the alert gated on `!state.configuration.isValid`
    (lines 35-39)
  evidence: '"This connector configuration''s stored value must be a JSON object. Correct it before Save
    can succeed."'
  cost: This file is the only place in the tree that decides a registered connector configuration's stored
    value can be not-a-JSON-object and gates Save on the operator correcting it. Every check the specification
    holds a connector configuration to is a registration-time gate — register-connector refuses a not-well-formed
    or incomplete configuration at the write (rules/integration/a-connector-configuration-holds-a-well-formed-object),
    and domain/integration/connector-configuration states its configuration "is held and answered as JSON
    object text, whatever form a registration supplied it in" — so no node anywhere states that a read
    of an already-registered configuration can answer something that isn't a JSON object, or what a surface
    should tell the operator when it does. A reader who meets this warning and looks in the specification
    for when a stored configuration is invalid, and what corrects it, will not find the rule there; it
    exists only in this component's own text.
- file: src/routes/connector-configuration-form-fields-action-footer.spec.ts
  where: lines 60 and 62 — `const links = screen.getAllByRole("link"); ... expect(links).toHaveLength(1);`
  evidence: 'const links = screen.getAllByRole("link");


    expect(links).toHaveLength(1);

    '
  cost: This states, as a fact about the whole screen and not just the footer, that no link-role element
    exists anywhere on it besides the Connectors control. No node in the set bounds or even mentions a
    total count of links a connector-configuration surface may carry — the route rule states only that
    a route is offered, never that it is the surface's sole link-type element. A later, unrelated addition
    of any other link anywhere on the page (a help link, a breadcrumb) would fail this test though nothing
    in the specification forbids it, and the failure would send a reader looking in the specification
    for a one-link rule that isn't there.
unbound:
- src/hooks/use-capability-detail-load-error.spec.ts
- src/hooks/use-capability-detail-view.ts
- src/routes/capability-create-screen-actions.spec.ts
- src/routes/capability-create-screen-cancel.spec.ts
- src/routes/capability-create-screen-listing-route.spec.ts
- src/routes/capability-create-screen.spec.ts
- src/routes/capability-detail-screen-cancel.spec.ts
- src/routes/capability-detail-screen-listing-control.spec.ts
- src/routes/capability-detail-screen-not-registered-reading.spec.ts
- src/routes/capability-detail-screen-origin-independence.spec.ts
- src/routes/capability-detail-screen-preready-fields-withheld.spec.ts
- src/routes/capability-detail-screen-reading-distinctness.spec.ts
- src/routes/capability-detail-screen-reattempt-exclusivity.spec.ts
- src/routes/capability-detail-screen-return-to-origin.spec.ts
- src/routes/capability-detail-screen-route.spec.ts
- src/routes/capability-detail-screen.spec.ts
- src/routes/capability-form-fields-action-footer.spec.ts
- src/routes/capability-form-fields-output-schema-guidance.spec.ts
- src/routes/capability-not-read-only-refusal-status.spec.ts
- src/routes/connector-configuration-create-screen-cancel.spec.ts
- src/routes/connector-configuration-create-screen.spec.ts
- src/routes/connector-configuration-detail-ready-view-cancel.spec.ts
- src/routes/connector-configuration-detail-screen-listing-route.spec.ts
- src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
- src/routes/connector-configuration-detail-screen.spec.ts
- src/routes/connector-configuration-form-fields-action-footer.spec.ts
notes: "Judged by 38 delegation(s), one per file; folded mechanically by trace.py --fold from the returns\
  \ under siegard-reconcile/scope-review-corrections.returns/.\nStaged by a review over files a delivery\
  \ wrote: no pair was omitted, so the delivery's own claims and every other binding of these files were\
  \ judged alike; the plan's node(s) rules/integration/an-abandoned-capability-registration-entry-registers-nothing,\
  \ rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing, rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing,\
  \ rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface, rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading,\
  \ rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed, rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing,\
  \ rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read, rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering,\
  \ rules/integration/a-capability-is-read-only, rules/integration/a-submitted-registration-states-its-outcome-to-the-operator,\
  \ rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it, domain/investigation/field-semantics,\
  \ rules/glossary/a-description-states-meaning-never-policy were read on every file and answered for,\
  \ and bound from nowhere here — a binding this record writes is one the trace already held.\nA finding\
  \ in src/hooks/use-connector-configuration-detail.ts names rules/integration/a-presented-connector-configuration-states-a-connector-name-nothing-is-registered-under,\
  \ which no file of this set is bound to: the `query.isError` branch, lines 117-125: if (query.isError)\
  \ {\n  return {\n    phase: \"load-error\",\n    retryLoad: () => {\n      void query.refetch();\n \
  \   },\n    onCancel,\n  };\n}\n — An operator who names a connector nothing has ever been registered\
  \ under gets the identical \"could not be read\" experience as one whose read merely glitched, reattempt\
  \ control included — the specification's own distinct, reattempt-free \"nothing is registered under\
  \ this connector name\" presentation is never reached by any code path, so a later reader auditing how\
  \ an unregistered connector name reads finds only the generic failure branch and has no reason to suspect\
  \ a fourth presentation was ever specified, let alone that it forbids exactly the reattempt this branch\
  \ offers.. It blocks nothing here; it is owed a route of its own.\nA finding in src/routes/connector-configuration-detail-screen.tsx\
  \ names rules/integration/a-presented-connector-configuration-states-a-connector-name-nothing-is-registered-under,\
  \ which no file of this set is bound to: the `load-error` branch, lines 28-45: <p>Unable to load this\
  \ connector configuration right now.</p> <Button type=\"button\" onClick={state.retryLoad}>Retry</Button>\
  \ — an operator who reached this screen by a connector name nothing is registered under is told the\
  \ configuration \"could not be read right now\" and is handed a Retry that can never succeed, rather\
  \ than being told explicitly that nothing is registered under that name with no dead-end reattempt offered\
  \ — a definite, permanent refusal is presented exactly like a transient one worth trying again, so the\
  \ operator cannot tell the two apart or learn that retrying is pointless.. It blocks nothing here; it\
  \ is owed a route of its own.\nCandidates: 14 opened across 10 of 38 delegation(s); each return lists\
  \ its own under `candidates_opened`.\nUnstated: 14 fact(s) the source states that no node holds, over\
  \ 11 file(s), listed under `unstated`. They block no binding here and no rebind closes them — the route\
  \ is the analysis that gives each fact a node."
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/scope-review-corrections.returns/`, which are the evidence behind every entry above.
