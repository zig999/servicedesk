---
contract_version: siegard-reconcile/5
title: 'capability-payload-notes-frontend: an operator-authored payload_notes field on the capability
  registration and detail surfaces'
summary: A capability may declare an optional, free-text payload_notes attribute (already specified and
  already flowing end-to-end on the backend); this initiative adds the frontend surface -- the field on
  the shared capability form/read type and Zod schema, seeded into both form hooks from the identity read,
  forwarded in both hooks own submitted PUT bodies, and rendered as a Textarea on the shared capability-form-fields
  component reaching both the registration screen and the detail surface. Delivered as 4 tasks through
  /plan-work -> /implement-task, two of which required corrective rounds after suite runs caught regressions
  the rendering task exposed in two sibling tasks own already-delivered submission code.
target: frontend
files:
- path: src/hooks/use-capabilities.spec.ts
  change: The Capability read type declares payload_notes, and a read answer carrying a payload_notes
    string typechecks against it. A read answer carrying no payload_notes typechecks against the Capability
    read type.
- path: src/hooks/use-capabilities.ts
  change: 'The Capability read type now declares readonly payload_notes?: string, alongside its other
    read-only fields.'
- path: src/hooks/use-capability-detail-payload-notes-submission.spec.ts
  change: The registration body use-capability-detail submits carries payload_notes as the form value
    holds it. Where the operator declared no payload notes, the submitted body states payload_notes as
    absent or as an empty string and as no other content; and where every required attribute is declared
    and payload notes is left undeclared, the contract rule does not refuse the submission and the register-capability
    call is issued. Where the operator typed and then cleared payload_notes, the submitted body carries
    it as exactly an empty string and no other content.
- path: src/hooks/use-capability-detail-view.spec.ts
  change: The act that returns the surface's fields to the registration the surface last read returns
    payload_notes to the content that read answered.
- path: src/hooks/use-capability-detail.spec.ts
  change: Where the identity read answers a capability whose payload_notes carries content, the form values
    use-capability-detail presents carry that same content for payload_notes. Where the identity read
    answers a capability carrying no payload_notes, the form values use-capability-detail presents state
    no payload_notes content. payload_notes holds the answered content from the first moment the form
    values stand, and not from a later moment inside the presentation. No payload_notes content is presented
    that the identity read's own answer did not carry, specifically against a sibling list-capabilities
    cache entry as the source the presentation must not draw from.
- path: src/hooks/use-capability-detail.ts
  change: 'The PUT body the edit-path mutation submits now includes `payload_notes: values.payload_notes`,
    forwarding the form value unchanged. Added `payload_notes: query.data.payload_notes` to the form.reset({...})
    call made inside the render-time sync block that fires the first time (and every time) query.data
    changes, before the "ready" phase is returned. The same dirtyFields-gated spread replaces the unconditional
    payload_notes forwarding in the edit-path mutation''s PUT body. Unchanged by this second correction
    -- its own pre-existing, unconditional isDirty computation already subscribes to the formState proxy
    on every render.'
- path: src/hooks/use-capability-form-payload-notes-submission.spec.ts
  change: The registration body use-capability-form submits carries payload_notes as the form value holds
    it.
- path: src/hooks/use-capability-form.spec.ts
  change: Where an existing capability is loaded into use-capability-form, the payload_notes that answer
    carried is the payload_notes that hook's form values hold -- the content-present class. Where an existing
    capability is loaded into use-capability-form, the payload_notes that answer carried is the payload_notes
    that hook's form values hold -- the content-absent class, guarding against a silent default.
- path: src/hooks/use-capability-form.ts
  change: 'The PUT body the create-path mutation submits now includes `payload_notes: values.payload_notes`,
    forwarding the form value unchanged. Added `payload_notes: existing?.payload_notes` to the useForm
    defaultValues object, on the same line pattern already used for every other optional/scalar attribute
    (timeout, connector, concept) sourced from the existing Capability passed in. The PUT body the create-path
    mutation submits still spreads payload_notes only when form.formState.dirtyFields.payload_notes is
    true. Added `void form.formState.isDirty;` as an unconditional read of the formState proxy in the
    hook''s "ready" render path, positioned after the conceptOptions.isError/conceptOptions.isLoading
    early returns and immediately before submit is defined, mirroring where use-capability-detail.ts''s
    own const isDirty = form.formState.isDirty || ... sits relative to its own early returns. That read
    is what keeps react-hook-form''s formState snapshot refreshed so the mutationFn''s later dirtyFields.payload_notes
    read reflects current state instead of a stale initial one.'
- path: src/routes/capability-form-fields-payload-notes.spec.ts
  change: Criteria 1 (a control bound to the form's payload_notes field), 2 (the control sits inside the
    same FormField label/error wrapper the other capability attribute fields use, with no second wrapper
    introduced beside it), and 6 (the control is rendered on the capability registration screen's reading
    of this component). The control accepts free text an operator types, and what is typed becomes the
    form's payload_notes value. The control accepts text spanning more than one line. Half of criterion
    5 (the control presents the payload_notes value the form holds) together with criterion 7 (the control
    is rendered on the capability detail surface's reading of this component). The other half of criterion
    5 (the control presents nothing where the form holds none), together with criterion 7.
- path: src/routes/capability-form-fields.tsx
  change: Imports Textarea from @tui/ui/textarea and renders a new FormField block, placed after the Connector
    field and before the input/output schema grid, binding a Textarea to the form's payload_notes field
    through register("payload_notes", { setValueAs }). Unchanged by this second correction.
- path: src/services/capability-form-schema.spec.ts
  change: capabilityFormSchema parses a form value object carrying a payload_notes string and yields that
    same string on the parsed result. capabilityFormSchema parses a form value object carrying no payload_notes
    and reports no validation issue for that field. capabilityFormSchema reports no validation issue for
    a payload_notes value that is an empty string.
- path: src/services/capability-form-schema.ts
  change: 'capabilityFormSchema now declares payload_notes as z.string().optional(), so CapabilityFormValues
    carries payload_notes?: string alongside the existing fields.'
nodes:
- node: contracts/integration/capability-registry
  conforms: true
  how: "src/hooks/use-capabilities.ts: held at the queryFn passed to useQuery, which issues the list-capabilities\
    \ read against the registry's published surface — queryFn: () => apiFetch<CapabilitiesPage>(\"/v1/capabilities\"\
    ),\nsrc/hooks/use-capability-detail.ts: held at the identity-keyed read and the create-or-replace\
    \ write, lines 62-68 and 98-117 — apiFetch<Capability>(\n        `/v1/capabilities/${encodeURIComponent(name)}/${encodeURIComponent(version)}`,\n\
    \      )\n...\napiFetch<Capability>(\n        `/v1/capabilities/${encodeURIComponent(values.name)}/${encodeURIComponent(values.version)}`,\n\
    \        { method: \"PUT\", ... }\n      )\nsrc/hooks/use-capability-form.ts: held at the mutation's\
    \ PUT call, lines 100-118 — apiFetch<Capability>(\n  `/v1/capabilities/${encodeURIComponent(values.name)}/${encodeURIComponent(values.version)}`,\n\
    \  { method: \"PUT\", headers: { \"Content-Type\": \"application/json\" }, body: JSON.stringify({\
    \ ... }) },\n)"
  encoded_at:
  - src/hooks/use-capabilities.ts
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-capability-form.ts
- node: domain/integration/capability
  conforms: true
  how: "src/hooks/use-capabilities.ts: held at the Capability type declaration, lines 6-16 — export type\
    \ Capability = {\n  readonly name: string;\n  readonly version: string;\n  readonly nature: CapabilityNature;\n\
    \  readonly input_schema: string;\n  readonly output_schema: string;\n  readonly timeout: number;\n\
    \  readonly connector: string;\n  readonly concept: string;\n  readonly payload_notes?: string;\n\
    };\nsrc/hooks/use-capability-detail.ts: held at the load-time sync of the read answer onto the form,\
    \ lines 80-88 — form.reset({\n        name: query.data.name,\n        version: query.data.version,\n\
    \        nature: query.data.nature,\n        timeout: query.data.timeout,\n        connector: query.data.connector,\n\
    \        concept: query.data.concept,\n        payload_notes: query.data.payload_notes,\n      });\n\
    src/hooks/use-capability-form.ts: held at the useForm defaultValues, lines 88-96, mirrored in the\
    \ PUT body, lines 106-116 — defaultValues: {\n  name: existing?.name ?? \"\",\n  version: existing?.version\
    \ ?? \"\",\n  nature: existing?.nature ?? \"read-only\",\n  timeout: existing?.timeout,\n  connector:\
    \ existing?.connector ?? \"\",\n  concept: existing?.concept ?? \"\",\n  payload_notes: existing?.payload_notes,\n\
    }\nsrc/routes/capability-form-fields.tsx: held at the form fields for the aggregate's own declared\
    \ attributes — Concept, Name, Version, Nature, Timeout, Connector, Payload notes, Input schema and\
    \ Output schema — <FormField label=\"Connector\" errorId=\"connector-error\" error={errors.connector?.message}>\n\
    \  <Input\n    {...register(\"connector\")}\n...\n<FormField\n  label=\"Payload notes\"\n  errorId=\"\
    payload_notes-error\"\n  error={errors.payload_notes?.message}\n>\n  <Textarea\n    {...register(\"\
    payload_notes\", {\n      setValueAs: (value: string) => (value === \"\" ? undefined : value),\n \
    \   })}\nsrc/services/capability-form-schema.ts: held at the capabilityFormSchema object, lines 5-13,\
    \ for the attributes it validates — export const capabilityFormSchema = z.object({\n  name: z.string().min(1),\n\
    \  version: z.string().min(1),\n  nature: z.enum(CAPABILITY_NATURES),\n  timeout: z.number().int().positive().optional(),\n\
    \  connector: z.string().min(1),\n  concept: z.string().min(1),\n  payload_notes: z.string().optional(),\n\
    });"
  encoded_at:
  - src/hooks/use-capabilities.ts
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-capability-form.ts
  - src/routes/capability-form-fields.tsx
  - src/services/capability-form-schema.ts
- node: domain/integration/capability-nature
  conforms: false
  how: 'src/services/capability-form-schema.ts, line 3, the CAPABILITY_NATURES constant: export const
    CAPABILITY_NATURES = ["read-only", "mutating"] as const; — The enumeration''s two values now live
    in two places — the specification''s node and this frontend constant used to build the form''s zod
    enum. A future change to domain/integration/capability-nature (a renamed value, a third nature added)
    has no reason to touch this file, so the form''s accepted values can silently drift from what the
    specification declares, and whoever edits the node will not know a second copy needs the same edit.'
  observed_at:
  - src/hooks/use-capabilities.ts
  - src/routes/capability-form-fields.tsx
  - src/services/capability-form-schema.ts
- node: domain/integration/capability-registry
  conforms: true
  how: 'src/hooks/use-capability-form.ts: held at the mutation calling register-capability, lines 99-118
    — mutationFn: (values: CapabilityFormValues) => apiFetch<Capability>(...,{ method: "PUT", ... })'
  encoded_at:
  - src/hooks/use-capability-form.ts
- node: domain/investigation/field-semantics
  conforms: true
  how: 'src/routes/capability-form-fields.tsx: held at the help paragraph beneath the Output schema field
    — O que é inserido aqui é <code>JSON</code>. Os nomes de campo lidos a partir

    dele são as chaves do próprio objeto <code>properties</code> de nível

    superior deste schema. O <code>type</code> e a <code>description</code>{" "}

    declarados por cada uma dessas chaves, onde o schema os declara, são lidos

    como a semântica declarada desse campo. Nenhum outro conteúdo deste schema é

    lido ou validado.'
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: rules/glossary/a-description-states-meaning-never-policy
  conforms: true
  how: 'src/routes/capability-form-fields.tsx: held at the last sentence of that same help paragraph —
    Uma <code>description</code> aqui declara o que seu valor

    significa e não nomeia nenhuma decisão.'
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/a-capability-authoring-surface-offers-a-schema-helper
  conforms: true
  how: "src/routes/capability-form-fields.tsx: held at the placement of CapabilitySchemaHelperFields directly\
    \ beneath the grid holding both the Input schema and Output schema fields — <CapabilitySchemaHelperFields\n\
    \  state={schemaHelper}\n  onApplyInputSchema={inputSchemaApply.onApply}\n  onApplyOutputSchema={outputSchemaApply.onApply}\n\
    />"
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/a-capability-declares-its-contract
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-capability-form.ts, src/services/capability-form-schema.ts,
    and src/hooks/use-capability-detail.ts read `nowhere` — timeout: values.timeout, connector: values.connector,
    concept: values.concept, — the submitted body forwards these by name with no required-ness or default-timeout
    check of its own; the 422/IncompleteCapabilityContractError refusal this invariant states is the registry''s
    own and is never restated here. — a binding asserts the file answers for the node, so the pair that
    stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-capability-form.ts
  - src/services/capability-form-schema.ts
- node: rules/integration/a-capability-declares-well-formed-schemas
  conforms: false
  how: "the fact left part of its ground: still held in src/hooks/use-capability-detail.ts, src/hooks/use-capability-form.ts,\
    \ and src/routes/capability-form-fields.tsx read `nowhere` — const isSaveDisabled =\n  isSubmitting\
    \ || !inputSchema.isValid || !outputSchema.isValid || isDirty === false;\nThis file only consumes\
    \ a precomputed isValid flag to gate the Save button; it\nneither states nor enforces the well-formed-JSON\
    \ refusal itself. — a binding asserts the file answers for the node, so the pair that stopped holding\
    \ it is released by `--bind ... --replace`, never restamped here"
  observed_at:
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-capability-form.ts
  - src/routes/capability-form-fields.tsx
- node: rules/integration/a-capability-is-read-only
  conforms: false
  how: "the fact left part of its ground: still held in src/hooks/use-capability-form.ts, and src/routes/capability-form-fields.tsx\
    \ read `nowhere` — const NATURE_OPTIONS: SelectOption[] = CAPABILITY_NATURES.map((nature) => ({\n\
    \  value: nature,\n  label: nature,\n}));\nBoth natures are offered as selectable options; the file\
    \ states or enforces\nnothing about the registry's read-only refusal. — a binding asserts the file\
    \ answers for the node, so the pair that stopped holding it is released by `--bind ... --replace`,\
    \ never restamped here"
  observed_at:
  - src/hooks/use-capability-form.ts
  - src/routes/capability-form-fields.tsx
- node: rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed
  conforms: true
  how: "src/hooks/use-capability-detail.ts: held at the query.isError / isLoading branches, lines 143-168\
    \ — if (query.error instanceof ApiError && query.error.code === \"CapabilityIdentityNotFoundError\"\
    ) {\n      return { phase: \"not-registered\", onCancel };\n    }\n    return {\n      phase: \"load-error\"\
    ,\n      retryLoad: () => {\n        void query.refetch();\n        conceptOptions.refetch();\n  \
    \    },\n      onCancel,\n    };"
  encoded_at:
  - src/hooks/use-capability-detail.ts
- node: rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
  conforms: false
  how: "src/hooks/use-capability-detail.ts, the \"ready\" phase's returned state, lines 193-212: return\
    \ {\n    phase: \"ready\",\n    form,\n    conceptOptions: conceptOptions.concepts,\n    inputSchema:\
    \ { value: inputSchemaValue, isValid: inputSchemaValid, onChange: handleInputSchemaChange },\n   \
    \ outputSchema: { value: outputSchemaValue, isValid: outputSchemaValid, onChange: handleOutputSchemaChange\
    \ },\n    isDirty,\n    isSubmitting: mutation.isPending,\n    isSubmitSuccessful: mutation.isSuccess,\n\
    \    onSubmit,\n    onCancel,\n  }; — No act in the returned state sets every field back to the content\
    \ the read last answered while staying on the surface — onCancel only ever leaves the surface (back,\
    \ or to the capabilities listing). The data such an act would need (query.data and the schema baselines\
    \ inputSchemaBaseline/outputSchemaBaseline) is tracked internally but never exposed, so no consuming\
    \ component could implement the act even by calling into `form` directly. An operator who wants to\
    \ put an edit down and keep working from the loaded content has only the full leave-and-return-through-the-listing\
    \ route, paying navigation for something the specification says should cost the registry, and the\
    \ operator, nothing."
  observed_at:
  - src/hooks/use-capability-detail.ts
- node: rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
  conforms: false
  how: "src/hooks/use-capability-detail.ts, the mutation's onSuccess callback, lines 118-121: onSuccess:\
    \ (_data, values) => {\n    form.reset(values);\n    setInputSchemaBaseline(inputSchemaValue);\n \
    \   setOutputSchemaBaseline(outputSchemaValue); — The registry's own response to the PUT call is received\
    \ as `_data` and discarded unused; the fields presented right after a successful save are reset to\
    \ `values` — the content the register-capability submission carried — and the schema baselines are\
    \ taken from the in-memory textarea values rather than from any answer the registry gave back. Until\
    \ the invalidated [\"capability\", name, version] query refetches and overwrites this, the surface\
    \ is showing exactly the source of content the rule names and forbids by name (\"not... the content\
    \ a register-capability submission carried\"), so an operator inspecting the surface immediately after\
    \ saving is shown the submission, not a confirmed read."
  observed_at:
  - src/hooks/use-capability-detail.ts
  - src/routes/capability-form-fields.tsx
- node: rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading
  conforms: true
  how: "src/hooks/use-capability-detail.ts: held at onCancel, lines 46-52 — const onCancel = (): void\
    \ => {\n    if (router.history.canGoBack()) {\n      router.history.back();\n      return;\n    }\n\
    \    void navigate({ to: \"/capabilities\" });\n  };"
  encoded_at:
  - src/hooks/use-capability-detail.ts
- node: rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
  conforms: false
  how: "src/hooks/use-capability-form.ts, SAVE_FAILURE_MESSAGE_BY_KIND, lines 43-52: const SAVE_FAILURE_MESSAGE_BY_KIND:\
    \ Partial<Record<UiErrorStateKind, string>> = {\n  \"capability-not-read-only\":\n    \"This capability's\
    \ declared nature is not read-only; the registry only accepts read-only capabilities.\",\n  \"incomplete-capability-contract\"\
    :\n    \"This capability does not declare its contract completely; every field of its contract is\
    \ required.\",\n  \"capability-schema-not-well-formed\":\n    \"The input schema or the output schema\
    \ is not syntactically valid JSON.\",\n  \"concept-already-answered\":\n    \"Another capability already\
    \ answers this concept; each concept resolves to exactly one capability.\",\n}; — domain/integration/capability-registry's\
    \ own Responsibility names six distinct grounds on which the registry refuses a capability registration\
    \ — not read-only, an incomplete contract, a schema that is not valid JSON, an input schema that does\
    \ not hold a well-formed shape, a connector whose registered configuration already embeds an undeclared\
    \ placeholder, and a concept another capability already answers — but this table gives a distinguishing\
    \ message to only four of the six. A registration refused on either of the other two grounds falls\
    \ through `?? GENERIC_SAVE_FAILURE_MESSAGE` via saveFailureMessage, the same text an operator sees\
    \ for a refusal whose condition the surface does not recognise at all, so an operator told a named\
    \ refusal answered their submission cannot tell it apart from one the surface never named."
  observed_at:
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-capability-form.ts
- node: rules/integration/an-abandoned-capability-registration-entry-registers-nothing
  conforms: true
  how: "src/hooks/use-capability-detail.ts: held at onCancel, lines 46-52 (never calls mutation.mutate)\
    \ — const onCancel = (): void => {\n    if (router.history.canGoBack()) {\n      router.history.back();\n\
    \      return;\n    }\n    void navigate({ to: \"/capabilities\" });\n  };\nsrc/hooks/use-capability-form.ts:\
    \ held at onCancel, lines 73-79 — if (router.history.canGoBack()) {\n  router.history.back();\n  return;\n\
    }"
  encoded_at:
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-capability-form.ts
- node: rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
  conforms: true
  how: 'src/hooks/use-capability-detail.ts: held at onCancel''s else-branch, line 51 — void navigate({
    to: "/capabilities" });

    src/hooks/use-capability-form.ts: held at onCancel''s fallback, line 78 — void navigate({ to: "/capabilities"
    });'
  encoded_at:
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-capability-form.ts
- node: rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it
  conforms: true
  how: 'src/routes/capability-form-fields.tsx: held at the help paragraph beneath the Output schema field
    — O que é inserido aqui é <code>JSON</code>. Os nomes de campo lidos a partir

    dele são as chaves do próprio objeto <code>properties</code> de nível

    superior deste schema. O <code>type</code> e a <code>description</code>{" "}

    declarados por cada uma dessas chaves, onde o schema os declara, são lidos

    como a semântica declarada desse campo. Nenhum outro conteúdo deste schema é

    lido ou validado. Uma <code>description</code> aqui declara o que seu valor

    significa e não nomeia nenhuma decisão.'
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/applying-a-drafted-capability-schema-changes-only-the-local-edit
  conforms: true
  how: "src/routes/capability-form-fields.tsx: held at the two independently constructed apply hooks and\
    \ the two separate confirmation dialogs, one per schema field — const inputSchemaApply = useApplyToJsonSchemaField(\n\
    \  inputSchema,\n  isDirty ?? inputSchema.value !== \"\",\n);\nconst outputSchemaApply = useApplyToJsonSchemaField(\n\
    \  outputSchema,\n  isDirty ?? outputSchema.value !== \"\",\n);\n...\n<ConnectorConfigurationApplyConfirmationDialog\n\
    \  diff={inputSchemaApply.applyConfirmationDiff}\n  onOpenChange={inputSchemaApply.onApplyConfirmationOpenChange}\n\
    \  onConfirm={inputSchemaApply.onConfirmApply}\n/>\n<ConnectorConfigurationApplyConfirmationDialog\n\
    \  diff={outputSchemaApply.applyConfirmationDiff}\n  onOpenChange={outputSchemaApply.onApplyConfirmationOpenChange}\n\
    \  onConfirm={outputSchemaApply.onConfirmApply}\n/>"
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/one-capability-answers-one-concept
  conforms: false
  how: "the fact left part of its ground: still held in src/hooks/use-capability-form.ts, and src/routes/capability-form-fields.tsx\
    \ read `nowhere` — <Select\n  value={field.value}\n  onChange={field.onChange}\n  onBlur={field.onBlur}\n\
    \  options={conceptSelectOptions}\nThis renders a single-value concept picker; it neither states nor\
    \ enforces the\none-capability-per-concept refusal. — a binding asserts the file answers for the node,\
    \ so the pair that stopped holding it is released by `--bind ... --replace`, never restamped here"
  observed_at:
  - src/hooks/use-capability-form.ts
  - src/routes/capability-form-fields.tsx
- node: rules/integration/the-input-schema-and-output-schema-fields-are-untouched-by-a-schema-drafts-arrival
  conforms: false
  how: 'no named file holds this fact now: src/routes/capability-form-fields.tsx read `nowhere` — const
    schemaHelper = useCapabilitySchemaHelper();

    This file only holds the hook''s returned state; whether a draft''s arrival leaves

    the two schema fields untouched is implemented inside that hook, not here.'
  observed_at:
  - src/routes/capability-form-fields.tsx
unstated:
- file: src/hooks/use-capability-detail-view.spec.ts
  where: the describe block at lines 75-109, "onDiscard resets to what was just saved rather than the
    original pre-save values (an inference the implementation recorded)", and its assertions at lines
    106-107
  evidence: "describe(\"useCapabilityDetailView -- onDiscard resets to what was just saved rather than\
    \ the original pre-save values (an inference the implementation recorded)\", () => {\n  it(\"discards\
    \ back to the just-saved schema values after a successful save, not the values loaded before it\"\
    , async () => {\n...\n    expect(readyState(result.current).inputSchema.value).toBe(UPDATED_INPUT_SCHEMA);\n\
    \    expect(readyState(result.current).outputSchema.value).toBe(UPDATED_OUTPUT_SCHEMA);"
  cost: rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface ties
    discard strictly to "the content of the registration that read answered ... and to the content of
    no other answer," and its own description states that what a surface's read does after a successful
    submission is untouched by that rule; the sibling rules (a-successful-capability-registration-lands-on-the-capabilitys-own-surface,
    a-submitted-registration-states-its-outcome-to-the-operator) each explicitly disclaim deciding what
    follows a successful save. Whether a save's own response — rather than a subsequent read-capability-by-identity
    — becomes the new baseline onDiscard reverts to is a business decision about which answer the surface
    may treat as "that read answered," and it exists only in this hook and this test, flagged by its own
    title as "an inference the implementation recorded" rather than something the specification decided.
    A future change to either the discard rule or to what a save's response is allowed to stand in for
    could silently disagree with this baseline, and nobody reading the specification would find it.
- file: src/hooks/use-capability-detail.ts
  where: the mutationFn PUT body, lines 112-114
  evidence: "...(form.formState.dirtyFields.payload_notes\n          ? { payload_notes: values.payload_notes\
    \ }\n          : {}),"
  cost: Every other declared attribute (nature, timeout, connector, concept, both schemas) is forwarded
    unconditionally on every submission, but payload_notes alone is included only when react-hook-form
    marks it dirty in this session. An operator who loads a capability that already carries payload notes,
    edits some other field (e.g. connector) without touching the notes textarea, and submits, sends a
    PUT body with no payload_notes key at all; since register-capability replaces whatever stood at the
    identity with the whole declared contract submitted, and an absent declaration is read as "a capability
    that simply has none," the existing payload notes are silently wiped even though the operator never
    declared or cleared them. No node decided that an untouched optional field should be dropped from
    a total-replace submission rather than resubmitted with its current value.
- file: src/hooks/use-capability-form.ts
  where: the mutationFn request body, lines 106-116
  evidence: "body: JSON.stringify({\n  nature: values.nature,\n  input_schema: getJsonTextareaMinifiedValue(inputSchemaValue),\n\
    \  output_schema: getJsonTextareaMinifiedValue(outputSchemaValue),\n  timeout: values.timeout,\n \
    \ connector: values.connector,\n  concept: values.concept,\n  ...(form.formState.dirtyFields.payload_notes\n\
    \    ? { payload_notes: values.payload_notes }\n    : {}),\n}),"
  cost: 'Every other attribute is sent from the form''s current value regardless of whether the operator
    touched it, so an untouched field still carries forward what was loaded. payload_notes alone is singled
    out: it is included only when `dirtyFields.payload_notes` is true, even though `values.payload_notes`
    already holds the correct, previously-declared text when untouched. Since register-capability "replac[es]
    whatever already stood at that identity" (contracts/integration/capability-registry), an operator
    who edits an existing capability''s timeout or connector without retyping its payload notes submits
    a write that omits payload_notes entirely, and the registered capability''s previously-declared notes
    is silently gone — a rule about which loaded, unedited attribute may drop out of a resubmission that
    no node states, and that applies to this one attribute alone.'
- file: src/routes/capability-form-fields.tsx
  where: the Name and Version Input fields, lines 124-140
  evidence: "<Input\n  {...register(\"name\")}\n  disabled={isEditingIdentity || isSubmitting}\n...\n\
    <Input\n  {...register(\"version\")}\n  disabled={isEditingIdentity || isSubmitting}"
  cost: An operator opening an existing capability's edit surface cannot change Name or Version at all,
    while Nature, Timeout and Connector on that same surface stay editable — a distinction drawn only
    for the two attributes that form the capability's identity. Nothing in domain/integration/capability
    or in the rules governing register-capability's create-or-replace states that an identity, once registered,
    may not be re-typed on the surface that loaded it; the specification only ever distinguishes "creating
    a capability at a new name and version" from "replacing whatever already stood at that identity" as
    two branches of one write. The rule that forecloses one of those branches from this screen lives only
    in this disabled prop, so a reader checking what governs a capability's identity will not find this
    restriction in the specification, and a later change to it would not be recognized as touching anything
    the business decided.
unbound:
- src/hooks/use-capabilities.spec.ts
- src/hooks/use-capability-detail-payload-notes-submission.spec.ts
- src/hooks/use-capability-detail-view.spec.ts
- src/hooks/use-capability-detail.spec.ts
- src/hooks/use-capability-form-payload-notes-submission.spec.ts
- src/hooks/use-capability-form.spec.ts
- src/routes/capability-form-fields-payload-notes.spec.ts
- src/services/capability-form-schema.spec.ts
notes: 'Judged by 13 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/capability-payload-notes-frontend.returns/.

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) domain/integration/capability,
  rules/integration/a-capability-declares-its-contract, rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them,
  rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface were read
  on every file and answered for, and bound from nowhere here — a binding this record writes is one the
  trace already held.

  Candidates: 3 opened across 2 of 13 delegation(s); each return lists its own under `candidates_opened`.

  Unstated: 4 fact(s) the source states that no node holds, over 4 file(s), listed under `unstated`. They
  block no binding here and no rebind closes them — the route is the analysis that gives each fact a node.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/capability-payload-notes-frontend.returns/`, which are the evidence behind every entry above.
