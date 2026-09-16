---
contract_version: siegard-reconcile/5
title: Capability Schema Helper frontend surface -- review
summary: 'All 6 tasks of the capability-schema-helper-frontend initiative delivered: draft-request-outcome,
  helper-offered-on-the-authoring-surface, answered-draft-stated-to-the-operator and refusal-stated-to-the-operator
  (epic schema-helper-request-and-statement), plus schema-fields-written-only-by-applying and stated-draft-marked-stale
  (epic schema-draft-applied-to-the-capability-edit).'
target: frontend
files:
- path: src/hooks/use-apply-to-json-schema-field.ts
  change: New hook (task schema-fields-written-only-by-applying). Holds one field's pending-apply text;
    onApply writes straight through field.onChange(text, true) when the field has no unsaved edit, or
    stages text and computes computeApplyConfirmationDiff(field.value, text) otherwise; onConfirmApply
    is the only other caller of field.onChange.
- path: src/hooks/use-capability-schema-helper-stale-draft-marking.spec.ts
  change: New proof file (task stated-draft-marked-stale) proving the stale-marking comparison at the
    hook level.
- path: src/hooks/use-capability-schema-helper.spec.ts
  change: New proof file (task helper-offered-on-the-authoring-surface) proving useCapabilitySchemaHelper's
    composition of the operations hook and the draft hook.
- path: src/hooks/use-capability-schema-helper.ts
  change: New hook (task helper-offered-on-the-authoring-surface, extended by stated-draft-marked-stale).
    Composes useOpenApiDocumentOperations(link) with useDraftCapabilitySchemaFromOpenApi(); exposes link/onLinkChange,
    operations + operationsOutcome + refetch, chosenOperation + onChooseOperation, outcome, onRequestDraft,
    and (added later) a pure draftIsStale comparison exposed as an optional stale field.
- path: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
  change: New proof file (task draft-request-outcome) proving the hook's request dispatch and outcome
    classification.
- path: src/hooks/use-draft-capability-schema-from-openapi.ts
  change: New hook (task draft-request-outcome). Wraps a useMutation posting {link, path, method} to POST
    /v1/draft-capability-schema-from-openapi; exposes a discriminated outcome union (idle/pending/drafted/three
    named refusals/unrecognized-failure); guards a second dispatch while one is in flight.
- path: src/routes/capability-form-fields-schema-apply.spec.ts
  change: New proof file (task schema-fields-written-only-by-applying) proving the two independent apply
    acts end to end on both the create and detail screens.
- path: src/routes/capability-form-fields-schema-draft-staleness.spec.ts
  change: New proof file (task stated-draft-marked-stale) proving the staleness marking end to end through
    the real hook and fields component.
- path: src/routes/capability-form-fields-schema-helper-detail-placement.spec.ts
  change: New proof file (task helper-offered-on-the-authoring-surface) proving the Schema Helper's placement
    on the capability detail screen.
- path: src/routes/capability-form-fields-schema-helper-offer.spec.ts
  change: New proof file (task helper-offered-on-the-authoring-surface) proving the Schema Helper's offer
    and request act on the capability create screen.
- path: src/routes/capability-form-fields.tsx
  change: Touched (task helper-offered-on-the-authoring-surface, extended by schema-fields-written-only-by-applying).
    Renders CapabilitySchemaHelperFields beneath the Input/Output schema grid; instantiates useApplyToJsonSchemaField
    once per field, wiring their onApply into the helper's two apply props and rendering two independent
    ConnectorConfigurationApplyConfirmationDialog instances.
- path: src/routes/capability-schema-helper-fields-stale-draft-marking.spec.ts
  change: New proof file (task stated-draft-marked-stale) proving the stale statement and continued apply
    offers at the fields-component level.
- path: src/routes/capability-schema-helper-fields.spec.ts
  change: New proof file (task helper-offered-on-the-authoring-surface, extended by answered-draft-stated-to-the-operator
    and refusal-stated-to-the-operator) proving the fields component's rendering of the operation picker,
    the drafted disclosure and the four refusal disclosures.
- path: src/routes/capability-schema-helper-fields.tsx
  change: New presentation component (task helper-offered-on-the-authoring-surface, extended by answered-draft-stated-to-the-operator,
    refusal-stated-to-the-operator, schema-fields-written-only-by-applying and stated-draft-marked-stale).
    Renders the link Input and operation Select, the request act gated on a chosen operation, the drafted-outcome
    statement (CapabilitySchemaDraftStatement) with its two Apply buttons and stale message, and the refusal
    disclosure.
- path: src/services/capability-schema-draft-disclosure.spec.ts
  change: New proof file (task answered-draft-stated-to-the-operator, extended by refusal-stated-to-the-operator)
    proving the two disclosure-mapping functions.
- path: src/services/capability-schema-draft-disclosure.ts
  change: New service (task answered-draft-stated-to-the-operator, extended by refusal-stated-to-the-operator).
    Exposes capabilitySchemaDraftDisclosureFrom(draft) and capabilitySchemaDraftRefusalDisclosureFrom(outcome).
- path: src/services/capability-schema-messages.spec.ts
  change: New proof file (task answered-draft-stated-to-the-operator, extended by refusal-stated-to-the-operator)
    proving the message/label constants and the reason-label lookup.
- path: src/services/capability-schema-messages.ts
  change: New messages module (task answered-draft-stated-to-the-operator, extended by refusal-stated-to-the-operator
    and stated-draft-marked-stale). Section labels, the unresolved-reason lookup, the four refusal message
    constants, and the stale-draft message.
- path: src/services/error-ui-state.spec.ts
  change: Extended (task refusal-stated-to-the-operator) with a test asserting the three OpenAPI refusal
    codes resolve to the shared generic-error kind rather than a code of their own.
nodes:
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-draft-capability-schema-from-openapi.ts,
    and src/hooks/use-capability-schema-helper.ts read `nowhere` — const { outcome: operationsOutcome,
    refetch } = useOpenApiDocumentOperations(link); — a binding asserts the file answers for the node,
    so the pair that stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/hooks/use-capability-schema-helper.ts
  - src/hooks/use-draft-capability-schema-from-openapi.ts
- node: contracts/integration/capability-schema-draft
  conforms: true
  how: 'src/hooks/use-capability-schema-helper.ts: held at the onRequestDraft callback, line 65 — requestDraft({
    link, path: chosenOperation.path, method: chosenOperation.method });

    src/hooks/use-draft-capability-schema-from-openapi.ts: held at the same mutationFn, whose path names
    the draft-capability-schema-from-openapi operation — apiFetch<CapabilitySchemaDraft>("/v1/draft-capability-schema-from-openapi",
    {'
  encoded_at:
  - src/hooks/use-capability-schema-helper.ts
  - src/hooks/use-draft-capability-schema-from-openapi.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'One input — a single operator-named link put to the helper, an operation chosen from
    the listing it answers, and a draft requested — against one expected result: the operations-read request
    and the draft request both carry that same link value (the read''s link asserted in its URL or body,
    not by route prefix alone), so that the document the draft is generated from is the same operator-named
    document the listing was read from.'
- node: domain/integration/capability
  conforms: true
  how: 'src/routes/capability-form-fields.tsx: held at the form''s field set for the aggregate''s own
    attributes — <FormField label="Name" errorId="name-error" error={errors.name?.message}>

    <FormField label="Version" errorId="version-error" error={errors.version?.message}>

    <FormField label="Nature" errorId="nature-error" error={errors.nature?.message}>

    <FormField label="Timeout (ms)" errorId="timeout-error" error={errors.timeout?.message}>

    <FormField label="Connector" errorId="connector-error" error={errors.connector?.message}>

    '
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: domain/integration/capability-nature
  conforms: true
  how: "src/routes/capability-form-fields.tsx: held at the Nature Select's options, built from an imported\
    \ enumeration rather than restated here — const NATURE_OPTIONS: SelectOption[] = CAPABILITY_NATURES.map((nature)\
    \ => ({\n  value: nature,\n  label: nature,\n}));\n"
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: domain/integration/capability-schema-draft
  conforms: true
  how: "src/hooks/use-draft-capability-schema-from-openapi.ts: held at the CapabilitySchemaDraft type\
    \ declaration — export type CapabilitySchemaDraft = {\n  readonly input_schema: string;\n  readonly\
    \ output_schema: string;\n  readonly unresolved: readonly CapabilitySchemaDraftUnresolvedItem[];\n\
    };\nsrc/services/capability-schema-draft-disclosure.ts: held at the object built and returned by capabilitySchemaDraftDisclosureFrom,\
    \ lines 28-36 — return {\n    inputSchema: draft.input_schema,\n    outputSchema: draft.output_schema,\n\
    \    unresolved: draft.unresolved.map((item) => ({\n      name: item.name,\n      reason: item.reason,\n\
    \      reasonLabel: capabilitySchemaDraftUnresolvedReasonMessage(item.reason),\n    })),\n  };\n"
  encoded_at:
  - src/hooks/use-draft-capability-schema-from-openapi.ts
  - src/services/capability-schema-draft-disclosure.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'Two assertions close it. For the shape: one input — a drafted answer whose input_schema
    and output_schema are read rather than compared as strings — against one expected result, that each
    parses to an object declaring a top-level properties object, and that where one of its own declared
    names is required the parsed object also declares a top-level required array listing it; with the
    companion input of a schema declaring no such properties object expected not to stand as a draft.
    For the disclosure of what could not be resolved: one input — a single OpenAPI operation declaring
    a set of names, some of which cannot honestly become a properties entry — against one expected result,
    that every properties entry of the two schemas plus every unresolved item''s name together account
    for exactly the names that operation declared, each unresolved item carrying that name and its reason.
    The second assertion is over the step that generates the draft from the operation, not over this hook,
    so it cannot be written against the files in the offered proof.'
- node: domain/integration/capability-schema-draft-unresolved-item
  conforms: true
  how: "src/hooks/use-draft-capability-schema-from-openapi.ts: held at the CapabilitySchemaDraftUnresolvedItem\
    \ type declaration — export type CapabilitySchemaDraftUnresolvedItem = {\n  readonly name: string;\n\
    \  readonly reason: string;\n};\nsrc/routes/capability-schema-helper-fields.tsx: held at the unresolved-item\
    \ list item in CapabilitySchemaDraftStatement — <span className=\"font-medium\">{item.name}</span>:\
    \ {item.reasonLabel}\nsrc/services/capability-schema-draft-disclosure.ts: held at the mapping inside\
    \ draft.unresolved.map, lines 31-35 — unresolved: draft.unresolved.map((item) => ({ name: item.name,\
    \ reason: item.reason, reasonLabel: capabilitySchemaDraftUnresolvedReasonMessage(item.reason), })),"
  encoded_at:
  - src/hooks/use-draft-capability-schema-from-openapi.ts
  - src/routes/capability-schema-helper-fields.tsx
  - src/services/capability-schema-draft-disclosure.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'Three inputs against three expected results, each stated in the node''s own terms. One:
    a draft answer whose unresolved entry carries a reason but no name -- expected result, no item lacking
    a name is exposed as an unresolved item, since the node declares name required. Two: a draft answer
    whose unresolved entry carries a name but no reason -- expected result, no item lacking a reason is
    exposed, since the node declares reason required and the item''s whole responsibility is a name paired
    with why. Three: a draft answer whose unresolved entry carries a reason that is not one the capability-schema-draft-unresolved-reason
    type holds -- expected result, it is not exposed as a reason of that type. The step that runs them
    is the existing test step; the assertions belong beside the two already in src/hooks/use-draft-capability-schema-from-openapi.spec.ts
    and src/services/capability-schema-draft-disclosure.spec.ts.'
- node: domain/integration/capability-schema-draft-unresolved-reason
  conforms: false
  how: "src/services/capability-schema-messages.ts, lines 8-13, the CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_REASON_MESSAGES\
    \ record: const CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_REASON_MESSAGES: Readonly<Record<string, string>>\
    \ = {\n  \"schema-not-reducible-to-a-type\":\n    \"O esquema declarado não se reduz a um único tipo\
    \ do JSON Schema.\",\n  \"name-claimed-by-another-parameter\":\n    \"O nome já é ocupado por outro\
    \ parâmetro ou campo desta operação.\",\n};\n — domain/integration/capability-schema-draft-unresolved-reason\
    \ declares the closed set of reasons once, as an enumeration; this record retypes that same closed\
    \ set as untyped string-literal keys (Record<string, string>, not a type tied to the specification's\
    \ enumeration), so the set of valid reasons now lives in two places that can drift apart silently\
    \ — if the specification's enumeration ever gains, renames or drops a reason, nothing here fails to\
    \ compile or warns; capabilitySchemaDraftUnresolvedReasonMessage simply falls through to the raw machine\
    \ code (`?? reason`) for the operator to read, and the next person maintaining this file has no link\
    \ back to the node that is supposed to own the set."
  observed_at:
  - src/services/capability-schema-messages.ts
- node: domain/investigation/field-semantics
  conforms: true
  how: 'src/routes/capability-form-fields.tsx: held at the paragraph beneath the Output schema field —
    Os nomes de campo lidos a partir dele são as chaves do próprio objeto properties de nível superior
    deste schema. O type e a description declarados por cada uma dessas chaves, onde o schema os declara,
    são lidos como a semântica declarada desse campo. Nenhum outro conteúdo deste schema é lido ou validado.'
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: rules/glossary/a-description-states-meaning-never-policy
  conforms: true
  how: 'src/routes/capability-form-fields.tsx: held at the closing sentence of the same paragraph — Uma
    description aqui declara o que seu valor significa e não nomeia nenhuma decisão.'
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/a-capability-authoring-surface-offers-a-schema-helper
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-capability-schema-helper.ts, src/routes/capability-form-fields.tsx,
    src/routes/capability-schema-helper-fields.tsx, and src/hooks/use-draft-capability-schema-from-openapi.ts
    read `nowhere` — readonly requestDraft: (request: DraftCapabilitySchemaFromOpenApiRequest) => void;
    — the hook takes an already-complete request and neither gates it on, nor states, whether an operation
    stands chosen; that surface-level offering is left to the caller of this hook. — a binding asserts
    the file answers for the node, so the pair that stopped holding it is released by `--bind ... --replace`,
    never restamped here'
  observed_at:
  - src/hooks/use-capability-schema-helper.ts
  - src/hooks/use-draft-capability-schema-from-openapi.ts
  - src/routes/capability-form-fields.tsx
  - src/routes/capability-schema-helper-fields.tsx
- node: rules/integration/a-capability-declares-well-formed-schemas
  conforms: false
  how: 'no named file holds this fact now: src/routes/capability-form-fields.tsx read `nowhere` — isSubmitting
    || !inputSchema.isValid || !outputSchema.isValid || isDirty === false'
  observed_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/a-capability-is-read-only
  conforms: false
  how: "no named file holds this fact now: src/routes/capability-form-fields.tsx read `nowhere` — const\
    \ NATURE_OPTIONS: SelectOption[] = CAPABILITY_NATURES.map((nature) => ({\n  value: nature,\n  label:\
    \ nature,\n}));\n"
  observed_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/a-pending-schema-draft-request-is-not-dispatched-again
  conforms: true
  how: "src/hooks/use-draft-capability-schema-from-openapi.ts: held at the isDispatchingRef guard inside\
    \ requestDraft — if (isDispatchingRef.current) {\n    return;\n  }\n  isDispatchingRef.current = true;"
  encoded_at:
  - src/hooks/use-draft-capability-schema-from-openapi.ts
- node: rules/integration/a-refused-schema-draft-states-its-refusal-to-the-operator
  conforms: false
  how: "src/routes/capability-form-fields-schema-apply.spec.ts, the comment above the second \"Solicitar\
    \ rascunho de schema\" dispatch in the first `it` block (lines 134-137): // requesting again from\
    \ the same chosen operation resolves this time to a refusal (one\n// representative of the four --\
    \ the mechanism does not vary by which of the four fires,\n// since none of them ever renders the\
    \ section that offers Apply)\nfireEvent.click(screen.getByRole(\"button\", { name: \"Solicitar rascunho\
    \ de schema\" }));\nawait screen.findByRole(\"alert\"); — The comment asserts, as an already-settled\
    \ fact, that no refusal ever renders the Apply section -- exactly what a-refused-schema-draft-states-its-refusal-to-the-operator\
    \ requires (\"no input_schema, no output_schema and no unresolved item stands beside that refusal\"\
    ) -- but the code that follows only awaits a generic `alert` role and checks the two field values;\
    \ it never queries for the \"Aplicar\" buttons to confirm none render. A regression that kept an Apply\
    \ button visible after a refusal would pass this test unnoticed, leaving the comment as the only place\
    \ this guarantee is recorded.\nsrc/services/error-ui-state.spec.ts, the test at lines 219-227, \"\
    resolves OpenApiDocumentNotFetchedError, OpenApiDocumentNotReadableError and OpenApiOperationNotFoundError\
    \ to the shared generic-error state rather than a code of their own (capability schema helper's refusal-stated-to-the-operator\
    \ criterion 8)\": const kinds = [\n  \"OpenApiDocumentNotFetchedError\",\n  \"OpenApiDocumentNotReadableError\"\
    ,\n  \"OpenApiOperationNotFoundError\",\n].map((code) => uiStateForApiError(new ApiError(code, \"\
    message\")).kind);\n\nexpect(kinds).toEqual([\"generic-error\", \"generic-error\", \"generic-error\"\
    ]); — A caller of uiStateForApiError — the classification this test fixes in place — cannot tell an\
    \ unfetchable link, an unreadable document and a missing operation apart: all three collapse into\
    \ the same \"generic-error\" kind the table also gives a code it does not recognise at all. A screen\
    \ built on this kind has nothing left to read which of the three conditions answered the refusal,\
    \ so it cannot state that distinction to the operator, and the test's own citation of the schema-helper\
    \ refusal rule as its reason makes this look like proof of compliance rather than the opposite of\
    \ it."
  observed_at:
  - src/hooks/use-draft-capability-schema-from-openapi.ts
  - src/routes/capability-schema-helper-fields.tsx
  - src/services/capability-schema-draft-disclosure.ts
  - src/services/capability-schema-messages.ts
- node: rules/integration/a-stated-capability-schema-draft-is-marked-stale-once-what-it-was-generated-for-changes
  conforms: true
  how: "src/hooks/use-capability-schema-helper.ts: held at the draftIsStale function, lines 31-43, and\
    \ the stale field, line 68 — return (\n    outcome.link !== current.link ||\n    outcome.path !==\
    \ current.chosenOperation?.path ||\n    outcome.method !== current.chosenOperation?.method\n  );\n\
    src/routes/capability-schema-helper-fields.tsx: held at the stale-message paragraph in CapabilitySchemaDraftStatement\
    \ — {stale && <p className=\"text-sm text-muted-foreground\">{CAPABILITY_SCHEMA_DRAFT_STALE_MESSAGE}</p>}\n\
    src/services/capability-schema-messages.ts: held at CAPABILITY_SCHEMA_DRAFT_STALE_MESSAGE, lines 4-6\
    \ — export const CAPABILITY_SCHEMA_DRAFT_STALE_MESSAGE =\n  \"Este rascunho está desatualizado: o\
    \ link ou a operação mudou desde que este rascunho foi \" +\n  \"solicitado.\";\n"
  encoded_at:
  - src/hooks/use-capability-schema-helper.ts
  - src/routes/capability-schema-helper-fields.tsx
  - src/services/capability-schema-messages.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'One input against one expected result, twice over the pairings the offered proof omits.
    With a draft stated for a link and POST /v2/translate, and the link left exactly as it was, choose
    a second operation the same document offers: the expected result is that staleness is stated and both
    apply acts stay offered, enabled, and still write the original drafted input_schema and output_schema.
    Paired with it, a link change against a document offering the same operation, so the chosen operation
    is demonstrably retained and the stated staleness can only come from the link differing. Clicking
    the output apply act in the stale state and asserting the Output schema field holds the drafted output_schema
    closes the last unexercised act.'
- node: rules/integration/an-answered-schema-draft-request-states-its-draft-to-the-operator
  conforms: true
  how: "src/hooks/use-draft-capability-schema-from-openapi.ts: held at the \"success\" branch of outcomeFromMutation\
    \ — return { kind: \"drafted\", ...mutation.variables, draft: pickCapabilitySchemaDraftFields(mutation.data)\
    \ };\nsrc/routes/capability-schema-helper-fields.tsx: held at the two schema sections and the unresolved\
    \ section of CapabilitySchemaDraftStatement, rendered only when state.outcome.kind === \"drafted\"\
    \ — {state.outcome.kind === \"drafted\" && (\n        <CapabilitySchemaDraftStatement\n          draft={state.outcome.draft}\n\
    src/services/capability-schema-draft-disclosure.ts: held at capabilitySchemaDraftDisclosureFrom, lines\
    \ 25-37, which states input_schema, output_schema and every unresolved item exactly as the draft carries\
    \ them — export function capabilitySchemaDraftDisclosureFrom(\n  draft: CapabilitySchemaDraft,\n):\
    \ CapabilitySchemaDraftDisclosure {\n  return {\n    inputSchema: draft.input_schema,\n    outputSchema:\
    \ draft.output_schema,\n    unresolved: draft.unresolved.map((item) => ({\n\nsrc/services/capability-schema-messages.ts:\
    \ held at the field labels (lines 1-3) and the reason-message map (lines 8-17) that let each unresolved\
    \ item's reason be stated apart from every other reason — export const CAPABILITY_SCHEMA_DRAFT_INPUT_SCHEMA_LABEL\
    \ = \"Esquema de entrada rascunhado\";\nexport const CAPABILITY_SCHEMA_DRAFT_OUTPUT_SCHEMA_LABEL =\
    \ \"Esquema de saída rascunhado\";\nexport const CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_LABEL = \"Não\
    \ resolvidos\";\n"
  encoded_at:
  - src/hooks/use-draft-capability-schema-from-openapi.ts
  - src/routes/capability-schema-helper-fields.tsx
  - src/services/capability-schema-draft-disclosure.ts
  - src/services/capability-schema-messages.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'One input -- a drafted answer whose unresolved list carries one item per reason the
    draft''s reason vocabulary holds, with input_schema and output_schema carrying distinct marker texts
    -- against one expected result: each item states its own name beside the reading the specification
    names for that item''s reason, each such reading distinct from every other reading in that vocabulary
    and asserted by its own text rather than by inequality with a sibling label; and the input_schema
    marker is found within the input schema field and the output_schema marker within the output schema
    field, each queried by that field rather than across the whole render.'
- node: rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it
  conforms: true
  how: 'src/routes/capability-form-fields.tsx: held at the paragraph beneath the Output schema field —
    O que é inserido aqui é JSON. Os nomes de campo lidos a partir dele são as chaves do próprio objeto
    properties de nível superior deste schema. O type e a description declarados por cada uma dessas chaves,
    onde o schema os declara, são lidos como a semântica declarada desse campo. Nenhum outro conteúdo
    deste schema é lido ou validado. Uma description aqui declara o que seu valor significa e não nomeia
    nenhuma decisão.'
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/applying-a-drafted-capability-schema-changes-only-the-local-edit
  conforms: true
  how: "src/hooks/use-apply-to-json-schema-field.ts: held at onApply and onConfirmApply, lines 29-48 —\
    \ a write reaches the field only through field.onChange, gated on hasUnsavedEdit and, when set, on\
    \ an explicit confirm — function onApply(text: string): void {\n  if (!hasUnsavedEdit) {\n    field.onChange(text,\
    \ true);\n    return;\n  }\n  setPendingApplyText(text);\n}\n...\nfunction onConfirmApply(): void\
    \ {\n  if (pendingApplyText !== null) {\n    field.onChange(pendingApplyText, true);\n  }\n  setPendingApplyText(null);\n\
    }\n\nsrc/routes/capability-form-fields.tsx: held at the two independently-instantiated apply hooks\
    \ and their own confirmation dialogs — const inputSchemaApply = useApplyToJsonSchemaField(\n  inputSchema,\n\
    \  isDirty ?? inputSchema.value !== \"\",\n);\nconst outputSchemaApply = useApplyToJsonSchemaField(\n\
    \  outputSchema,\n  isDirty ?? outputSchema.value !== \"\",\n);\n\nsrc/routes/capability-schema-helper-fields.tsx:\
    \ held at the two independent Apply buttons, each calling only its own handler — <Button type=\"button\"\
    \ onClick={() => onApplyInputSchema(disclosure.inputSchema)}>\n...\n<Button type=\"button\" onClick={()\
    \ => onApplyOutputSchema(disclosure.outputSchema)}>"
  encoded_at:
  - src/hooks/use-apply-to-json-schema-field.ts
  - src/routes/capability-form-fields.tsx
  - src/routes/capability-schema-helper-fields.tsx
  decided_by: reading
  remainder: testable
  remainder_why: 'One input — the Schema Helper''s Aplicar clicked over an Input schema field holding
    a specific unsubmitted operator edit — against one expected result: the confirmation the screen raises
    presents that current field content as what the write would replace, so that the operator confirms
    against what currently stands there rather than against a bare prompt. A second such assertion on
    the detail surface, plus a putCallCount assertion there, closes the surface half.'
- node: rules/integration/no-schema-draft-refusal-is-stated-before-the-operation-answers
  conforms: false
  how: "src/hooks/use-draft-capability-schema-from-openapi.spec.ts, UNRECOGNIZED_FAILURE_CASES (lines\
    \ 213-223) and the it.each block asserting on it (lines 225-231): {\n  label: \"the request failing\
    \ outright with no answer at all (criterion 8's fallback; a dependency failing edge case)\",\n  handler:\
    \ () => {\n    throw new TypeError(\"network failure reaching this project's own backend\");\n  },\n\
    },\n...\nit.each(UNRECOGNIZED_FAILURE_CASES)(\"resolves $label to unrecognized-failure, distinct from\
    \ drafted and the three named refusals\", async ({ handler }) => {\n  const { result } = await mountAndDispatch(handler,\
    \ \"unrecognized-failure\");\n  expect(result.current.outcome.kind).toBe(\"unrecognized-failure\"\
    );\n}); — The test fixes, as required hook behavior, that a request which never reached draft-capability-schema-from-openapi\
    \ at all (the fetch to this project's own backend throwing, by the test's own description \"no answer\
    \ at all\") is stated to the operator as the same refusal-shaped \"unrecognized-failure\" outcome\
    \ that the node reserves for a request the operation did answer but with a code it does not recognise.\
    \ A reader auditing this hook against the specification will find a passing test that requires exactly\
    \ the invented refusal the node forbids, and nothing in the file distinguishes \"the operation refused\
    \ for an unrecognised reason\" from \"the operation was never reached\" -- the two are folded into\
    \ one outcome kind with no node authorizing that fold."
  observed_at:
  - src/hooks/use-draft-capability-schema-from-openapi.ts
  - src/services/capability-schema-draft-disclosure.ts
- node: rules/integration/one-capability-answers-one-concept
  conforms: false
  how: "no named file holds this fact now: src/routes/capability-form-fields.tsx read `nowhere` — <Select\n\
    \  value={field.value}\n  onChange={field.onChange}\n  onBlur={field.onBlur}\n  options={conceptSelectOptions}\n"
  observed_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/the-input-schema-and-output-schema-fields-are-untouched-by-a-schema-drafts-arrival
  conforms: true
  how: "src/hooks/use-apply-to-json-schema-field.ts: held at absence of any effect reacting to a draft's\
    \ arrival — the only two calls to field.onChange sit inside onApply and onConfirmApply, both invoked\
    \ only by the caller's own operator-triggered handlers, never by a prop or state change signalling\
    \ an answer — export function useApplyToJsonSchemaField(\n  field: JsonSchemaFieldState,\n  hasUnsavedEdit:\
    \ boolean,\n): ApplyToJsonSchemaFieldState {\n  const [pendingApplyText, setPendingApplyText] = useState<string\
    \ | null>(null);\n\nsrc/routes/capability-form-fields.tsx: held at the wiring that routes the Schema\
    \ Helper only to the explicit apply callbacks, never to the fields' own onChange — <CapabilitySchemaHelperFields\n\
    \  state={schemaHelper}\n  onApplyInputSchema={inputSchemaApply.onApply}\n  onApplyOutputSchema={outputSchemaApply.onApply}\n\
    />\n\nsrc/routes/capability-schema-helper-fields.tsx: held at nowhere directly — this file holds no\
    \ reference to the capability's own Input/Output schema fields; it shows the draft's own schema in\
    \ read-only <pre> blocks and calls onApplyInputSchema/onApplyOutputSchema only from the two Apply\
    \ buttons' onClick, never from an effect keyed to the draft's arrival — <pre className=\"rounded-md\
    \ border border-border bg-muted p-3 text-sm font-mono whitespace-pre-wrap break-words\">\n       \
    \   {disclosure.inputSchema}\n        </pre>"
  encoded_at:
  - src/hooks/use-apply-to-json-schema-field.ts
  - src/routes/capability-form-fields.tsx
  - src/routes/capability-schema-helper-fields.tsx
  decided_by: test
  step: test
  proof:
  - src/routes/capability-form-fields-schema-apply.spec.ts
unstated:
- file: src/services/capability-schema-messages.spec.ts
  where: lines 8 and 13, the `outsideVocabulary` case
  evidence: 'const outsideVocabulary = capabilitySchemaDraftUnresolvedReasonMessage("some-future-reason");

    ...

    expect(outsideVocabulary).toBe("some-future-reason");'
  cost: 'The test fixes what an operator sees when draft-capability-schema-from-openapi names an unresolved-item
    reason outside the two-value closed enumeration schema-not-reducible-to-a-type / name-claimed-by-another-parameter:
    the raw enumeration string is echoed back verbatim, unlabeled. No node decides this. The specification
    does have a stated convention for a value outside a vocabulary the surface must present — "a refusal
    whose condition the surface does not recognise is stated as exactly that" (the pattern rules/integration/a-refused-schema-draft-states-its-refusal-to-the-operator
    also applies to refusal conditions) — but nothing extends or excludes that convention here, so whether
    echoing the raw value or stating it as unrecognised is correct for this vocabulary is a decision this
    test makes on its own, and the next person who extends the enumeration has nowhere in the specification
    to check it against.'
unbound:
- src/hooks/use-capability-schema-helper-stale-draft-marking.spec.ts
- src/hooks/use-capability-schema-helper.spec.ts
- src/hooks/use-draft-capability-schema-from-openapi.spec.ts
- src/routes/capability-form-fields-schema-apply.spec.ts
- src/routes/capability-form-fields-schema-draft-staleness.spec.ts
- src/routes/capability-form-fields-schema-helper-detail-placement.spec.ts
- src/routes/capability-form-fields-schema-helper-offer.spec.ts
- src/routes/capability-schema-helper-fields-stale-draft-marking.spec.ts
- src/routes/capability-schema-helper-fields.spec.ts
- src/services/capability-schema-draft-disclosure.spec.ts
- src/services/capability-schema-messages.spec.ts
- src/services/error-ui-state.spec.ts
notes: "Judged by 19 delegation(s), one per file; folded mechanically by trace.py --fold from the returns\
  \ under siegard-reconcile/capability-schema-helper-frontend.returns/.\nCertified rules/integration/the-input-schema-and-output-schema-fields-are-untouched-by-a-schema-drafts-arrival\
  \ as decided by step `test`: src/routes/capability-form-fields-schema-apply.spec.ts (keeps both fields\
  \ at whatever the operator had typed, both once a drafted outcome arrives and once a refusal statement\
  \ arrives); src/routes/capability-form-fields-schema-apply.spec.ts (gates each field's own apply behind\
  \ its own confirm, writes only the confirmed field, and leaves the other field and the registry untouched)\
  \ would fail if the fact stopped holding.\nCertification of rules/integration/applying-a-drafted-capability-schema-changes-only-the-local-edit\
  \ did not hold: the auditor answered `partial` — Most of the fact is exercised and would fail if it\
  \ stopped holding: applying input_schema writes DRAFTED_INPUT_SCHEMA_TEXT into the Input schema field\
  \ while the Output schema field keeps the operator's typed text, applying output_schema writes only\
  \ into the Output schema field while the just-applied Input schema field stands, the write over an unsubmittedly\
  \ edited field is refused until confirmed (opening the dialog leaves both fields at the typed text,\
  \ \"Continuar editando\" leaves the Input schema field exactly as it stood, \"Aplicar\" then writes),\
  \ and nothing registers (putCallCount of the stubbed fetch asserted at 0, an assertion that would fail\
  \ on any PUT the applying raised). What goes unexercised is the clause \"stated against what currently\
  \ stands there\": the proof reaches the confirmation only through screen.getByRole(\"dialog\") and its\
  \ two buttons by name, and asserts nothing about what the confirmation says. A dialog that asked for\
  \ confirmation generically, naming neither the field nor the content currently standing in it, would\
  \ pass every assertion in the set. Also unexercised, though the mechanism is exercised on the create\
  \ surface: on the capability detail surface only the no-unsaved-edit path is taken (the field sits at\
  \ its loaded baseline, no dialog opens), so the confirmation over an operator's unsubmitted edit is\
  \ never read on that surface, and no test there asserts that applying registers nothing.. The node is\
  \ decided by reading, and a certification standing on it from an earlier reconciliation is released\
  \ by the bind. The remainder is testable: One input — the Schema Helper's Aplicar clicked over an Input\
  \ schema field holding a specific unsubmitted operator edit — against one expected result: the confirmation\
  \ the screen raises presents that current field content as what the write would replace, so that the\
  \ operator confirms against what currently stands there rather than against a bare prompt. A second\
  \ such assertion on the detail surface, plus a putCallCount assertion there, closes the surface half..\n\
  Certification of rules/integration/a-stated-capability-schema-draft-is-marked-stale-once-what-it-was-generated-for-changes\
  \ did not hold: the auditor answered `partial` — The link half of the fact is exercised and would fail\
  \ if it stopped holding: the proof asserts no staleness is stated while the surface still matches what\
  \ the draft was generated for, asserts staleness appears once the link is moved to a different document,\
  \ and asserts both apply acts remain offered and enabled with the input act still writing exactly the\
  \ drafted input_schema. The operation half goes unexercised. The node states staleness from the moment\
  \ the surface's link *or* chosen operation differs from either of the two the draft was generated for,\
  \ and nothing in the offered proof leaves the link standing and moves the chosen operation to a different\
  \ one -- so whether a draft is stated stale on an operation change alone is never put to the test, and\
  \ the proof would still pass if the surface compared only the link. The same gap weakens the one link\
  \ case that is asserted: the handler for the new link answers an empty operations list, so the chosen\
  \ operation may be cleared by that change rather than left untouched as the file's comment claims, and\
  \ the staleness the proof observes cannot be attributed to the link comparison alone. Nothing in the\
  \ set asserts what the draft stands marked as generated for -- neither the link nor the operation is\
  \ read back off the stated draft -- so that marking is observed only through the one staleness transition\
  \ it produces. The output apply act is asserted as offered and enabled but never clicked, so that it\
  \ still writes exactly the drafted output_schema is unexercised.. The node is decided by reading, and\
  \ a certification standing on it from an earlier reconciliation is released by the bind. The remainder\
  \ is testable: One input against one expected result, twice over the pairings the offered proof omits.\
  \ With a draft stated for a link and POST /v2/translate, and the link left exactly as it was, choose\
  \ a second operation the same document offers: the expected result is that staleness is stated and both\
  \ apply acts stay offered, enabled, and still write the original drafted input_schema and output_schema.\
  \ Paired with it, a link change against a document offering the same operation, so the chosen operation\
  \ is demonstrably retained and the stated staleness can only come from the link differing. Clicking\
  \ the output apply act in the stale state and asserting the Output schema field holds the drafted output_schema\
  \ closes the last unexercised act..\nCertification of rules/integration/an-answered-schema-draft-request-states-its-draft-to-the-operator\
  \ did not hold: the auditor answered `partial` — The two schema texts are exercised: the drafted test\
  \ places a unique marker in input_schema and another in output_schema and fails if either stops being\
  \ stated. The unresolved list's names are exercised, and \"stating no name the answer did not carry\"\
  \ is exercised twice -- the drafted test asserts exactly three list items for a three-item answer, and\
  \ the empty-answer test asserts none for an empty one. Two parts of the fact go unexercised. First,\
  \ nothing ties a stated reason to the reason the answer named for that item: the drafted test reads\
  \ each item's label only as an opaque string, asserting it is non-empty, that the two items carrying\
  \ different reasons carry different labels, and that the two items carrying the same reason carry the\
  \ same one. A surface that rendered a placeholder for every reason, or that rendered each of the two\
  \ reasons under the other's reading, would satisfy every one of those assertions -- so \"by the reason\
  \ that answer named for it\", and \"stating no reason the answer did not carry\", are not exercised,\
  \ only the weaker fact that the two readings are held apart from each other. Second, nothing ties either\
  \ schema text to its own field: the drafted test asserts both markers are present somewhere in the render\
  \ and never that the input_schema text is stated as the input schema and the output_schema text as the\
  \ output schema, so a surface that stated each under the other's heading would still pass. Separately,\
  \ the drafted test exercises the reasons-held-apart clause over two reason values only; the pack does\
  \ not state how many readings the draft's own reason vocabulary holds, so whether those two are the\
  \ whole vocabulary is not established by the proof offered.. The node is decided by reading, and a certification\
  \ standing on it from an earlier reconciliation is released by the bind. The remainder is testable:\
  \ One input -- a drafted answer whose unresolved list carries one item per reason the draft's reason\
  \ vocabulary holds, with input_schema and output_schema carrying distinct marker texts -- against one\
  \ expected result: each item states its own name beside the reading the specification names for that\
  \ item's reason, each such reading distinct from every other reading in that vocabulary and asserted\
  \ by its own text rather than by inequality with a sibling label; and the input_schema marker is found\
  \ within the input schema field and the output_schema marker within the output schema field, each queried\
  \ by that field rather than across the whole render..\nCertification of domain/integration/capability-schema-draft\
  \ did not hold: the auditor answered `partial` — Three of the node's statements are exercised: the draft\
  \ carries exactly input_schema, output_schema and unresolved and no other top-level name; each unresolved\
  \ entry is carried by its own name and its own reason and nothing else, an empty list staying an empty\
  \ list; and the draft is obtained by a single call to the published draft operation and never to the\
  \ operator-named link or to any registration, so \"a read, never a registration\" would fail if a second\
  \ or different call appeared. Two statements go unexercised. First, that input_schema and output_schema\
  \ \"each declare a top-level properties object and, where any of their own names is declared required,\
  \ a top-level required array\": every assertion in the set treats both as opaque strings compared for\
  \ pass-through equality — `toBe(draft.input_schema)` in capability-schema-draft-disclosure.spec.ts and\
  \ `toEqual` against the fixture in use-draft-capability-schema-from-openapi.spec.ts — and one case (\"\
  exposes unresolved as an empty array when the answer carried none\") passes a draft whose input_schema\
  \ is `\"{}\"`, declaring no properties object at all, without any assertion objecting. The fixtures\
  \ happen to carry the shape; nothing would fail if they stopped. Second, that \"every name the chosen\
  \ operation declares that the draft could not honestly turn into a properties entry is named in unresolved\
  \ instead\": no test in the offered proof ever presents an OpenAPI operation, so the partition between\
  \ what became a properties entry and what was disclosed as unresolved is never checked against the names\
  \ the operation declared — the drafts are hand-written fixtures, and a draft that silently dropped a\
  \ name it could not resolve would pass every test here. Whatever proves that half lives outside the\
  \ offered proof, over the generating operation rather than over this frontend's carry-through.. The\
  \ node is decided by reading, and a certification standing on it from an earlier reconciliation is released\
  \ by the bind. The remainder is testable: Two assertions close it. For the shape: one input — a drafted\
  \ answer whose input_schema and output_schema are read rather than compared as strings — against one\
  \ expected result, that each parses to an object declaring a top-level properties object, and that where\
  \ one of its own declared names is required the parsed object also declares a top-level required array\
  \ listing it; with the companion input of a schema declaring no such properties object expected not\
  \ to stand as a draft. For the disclosure of what could not be resolved: one input — a single OpenAPI\
  \ operation declaring a set of names, some of which cannot honestly become a properties entry — against\
  \ one expected result, that every properties entry of the two schemas plus every unresolved item's name\
  \ together account for exactly the names that operation declared, each unresolved item carrying that\
  \ name and its reason. The second assertion is over the step that generates the draft from the operation,\
  \ not over this hook, so it cannot be written against the files in the offered proof..\nCertification\
  \ of domain/integration/capability-schema-draft-unresolved-item did not hold: the auditor answered `partial`\
  \ — The pairing half of the fact is exercised: the disclosure proof submits two unresolved entries and\
  \ asserts each one's own name and reason survive character for character and in their own positions,\
  \ so a crossed or rewritten name-to-reason pairing fails it; the hook proof submits an entry carrying\
  \ parameter_location beyond the two attributes and asserts the exposed item is exactly {name, reason},\
  \ so a third attribute leaking in fails it. What goes unexercised is that both attributes are required:\
  \ nothing in the set submits an unresolved entry with no name, or with no reason, so whether an item\
  \ can exist carrying only one of the two is never decided by the proof -- the item type would keep every\
  \ test in the set passing if either attribute became optional. Nothing in the set submits a reason that\
  \ is not a value of capability-schema-draft-unresolved-reason either, so that the reason attribute is\
  \ of that type -- rather than any string -- goes unexercised; the disclosure derives a reasonLabel from\
  \ the reason with nothing asserting what an undeclared reason yields. The description's claim that the\
  \ name is exactly as the OpenAPI document itself gives it is exercised only as far as this boundary\
  \ reaches: the proofs show the name the draft operation answered is carried through unaltered, and nothing\
  \ here reads the OpenAPI document, so the step from document to answer is outside what these tests can\
  \ decide.. The node is decided by reading, and a certification standing on it from an earlier reconciliation\
  \ is released by the bind. The remainder is testable: Three inputs against three expected results, each\
  \ stated in the node's own terms. One: a draft answer whose unresolved entry carries a reason but no\
  \ name -- expected result, no item lacking a name is exposed as an unresolved item, since the node declares\
  \ name required. Two: a draft answer whose unresolved entry carries a name but no reason -- expected\
  \ result, no item lacking a reason is exposed, since the node declares reason required and the item's\
  \ whole responsibility is a name paired with why. Three: a draft answer whose unresolved entry carries\
  \ a reason that is not one the capability-schema-draft-unresolved-reason type holds -- expected result,\
  \ it is not exposed as a reason of that type. The step that runs them is the existing test step; the\
  \ assertions belong beside the two already in src/hooks/use-draft-capability-schema-from-openapi.spec.ts\
  \ and src/services/capability-schema-draft-disclosure.spec.ts..\nCertification of domain/integration/capability-schema-draft-unresolved-reason\
  \ did not hold: the auditor answered `uncovered` — The one test in the offered proof cannot fail if\
  \ this fact stops holding. Its assertions on the two declared values are `length > 0` and mutual distinctness;\
  \ because the function under test falls back to returning its argument unchanged (the same fallback\
  \ the test's third assertion pins), both assertions still hold when a declared value is renamed, removed\
  \ from the label set, or never recognised at all — two unrecognised reasons still return themselves,\
  \ still non-empty, still distinct. So neither value's membership in the set is exercised. The set's\
  \ closedness is likewise unexercised: nothing asserts that these two are the only reasons a draft may\
  \ name, and the third assertion goes the other way, fixing a behaviour for \"some-future-reason\", a\
  \ value outside the vocabulary the node declares closed — an assertion wider than this fact establishes,\
  \ and a reader should route it rather than read it as coverage. The conditions the node states for each\
  \ reason are untouched: nothing constructs a draft whose schema is a oneOf or anyOf naming more than\
  \ one JSON Schema type, and nothing constructs an operation where a property name is already claimed\
  \ by another parameter or field, so neither reason is ever observed being named apart from what the\
  \ draft resolved.. The node is decided by reading, and a certification standing on it from an earlier\
  \ reconciliation is released by the bind. The remainder is testable: The set is declared and finite,\
  \ so a test over both values closes it. For each declared value, one input — that value — against one\
  \ expected result, its own label text pinned literally, so that renaming or dropping `schema-not-reducible-to-a-type`\
  \ or `name-claimed-by-another-parameter` fails the test rather than falling through to itself; and one\
  \ input outside the set asserted to yield neither of those two labels. For the conditions: one input\
  \ — a draft parameter, request-body field or response field whose schema is a oneOf or anyOf naming\
  \ more than one JSON Schema type — against the expected result that it is named unresolved with reason\
  \ `schema-not-reducible-to-a-type`; and one input — a draft parameter or field whose property name is\
  \ already claimed by another parameter or field of the same operation — against the expected result\
  \ that it is named unresolved with reason `name-claimed-by-another-parameter`, the claimant being the\
  \ one declared order favours..\nCertification of contracts/integration/capability-schema-draft did not\
  \ hold: the auditor answered `partial` — The generating half and the \"a read, never a registration\"\
  \ half are exercised whole: the draft request is dispatched with one operation's link, path and method;\
  \ the answer is exposed as a schema draft carrying input_schema and output_schema rather than a listing;\
  \ and the exactly-one-call assertion over the whole drafted flow (calls.map(url) equal to [DRAFT_ROUTE],\
  \ with the stub recording and then rejecting any other URL) would fail if a register-capability call\
  \ — or any second call — were issued, so \"issues no register-capability call\" is pinned, not merely\
  \ absent. What goes unexercised is that the document drafted from is the same operator-named document\
  \ contracts/integration/openapi-document-operations's own read operation would fetch. In the helper\
  \ proof the operator names one link, and the draft body is asserted to carry exactly that link, but\
  \ the operations read is asserted only by route prefix (requestedUrls.every(url => url.startsWith(OPERATIONS_READ_ROUTE_PREFIX)))\
  \ — nothing asserts that the read request carries the operator-named link at all. An implementation\
  \ that read the operations for one document and drafted from another would pass every test in the offered\
  \ set.. The node is decided by reading, and a certification standing on it from an earlier reconciliation\
  \ is released by the bind. The remainder is testable: One input — a single operator-named link put to\
  \ the helper, an operation chosen from the listing it answers, and a draft requested — against one expected\
  \ result: the operations-read request and the draft request both carry that same link value (the read's\
  \ link asserted in its URL or body, not by route prefix alone), so that the document the draft is generated\
  \ from is the same operator-named document the listing was read from..\nCertification of rules/integration/no-schema-draft-refusal-is-stated-before-the-operation-answers\
  \ did not hold: the auditor answered `partial` — The unanswered window of a first request is exercised\
  \ on both sides: the hook proof pins the outcome to exactly {kind:\"idle\"} before any dispatch and\
  \ to exactly {kind:\"pending\"} while the operation has not answered, so any refusal kind surfacing\
  \ early fails it; and the surface proof asserts no element with the alert role while idle and while\
  \ pending, which bites because the companion case establishes that each of the four refusal readings\
  \ is stated as an alert. What goes unexercised is a schema draft request that is unanswered because\
  \ it is the second one: nothing in the offered set dispatches again after a request has settled into\
  \ one of the four refusals, so whether the earlier refusal keeps standing while the new, unanswered\
  \ request is in flight is untested — and that standing refusal would be a refusal stated of a request\
  \ the operation has not answered. The double dispatch the hook proof does exercise happens with nothing\
  \ yet answered and settles to a draft, so it never places a refusal beside an unanswered request.. The\
  \ node is decided by reading, and a certification standing on it from an earlier reconciliation is released\
  \ by the bind. The remainder is testable: One input — a schema draft request answered with a named refusal,\
  \ followed by a second requestDraft that the operation leaves unanswered — against one expected result:\
  \ the hook's outcome is pending, carrying none of the four refusal kinds, and the surface renders no\
  \ alert while that second request stands unanswered..\nCertification of constraints/the-openapi-document-is-fetched-by-the-backend\
  \ did not hold: the auditor answered `partial` — The operations-listing half of the fact is exercised\
  \ for this one hook and would fail if it stopped holding: with fetch stubbed and the link named, the\
  \ dedicated test asserts no requested URL equals the operator-named link, and the criterion-3 test asserts\
  \ the stronger positive — every URL requested during the listing starts with the backend's own read\
  \ route — so a direct fetch of the document during listing fails both. Three stated parts go unexercised.\
  \ First, the capability-schema-draft half is only touched incidentally: the criterion-7 test's fetch\
  \ mock answers any non-listing URL with a draft body, and its `waitFor(() => expect(calls).toHaveLength(1))`\
  \ can be satisfied at the moment the first call lands, so a hook that also fetched the document's own\
  \ URL while drafting is caught only if the extra call happens to arrive first or before the poll settles;\
  \ that assertion exists to pin the request body for criterion 7 and will be changed the day the body\
  \ changes, so nothing marks the constraint as load-bearing there. Second, the connector configuration\
  \ draft the statement names alongside the capability schema draft is generated by a different frontend\
  \ module, and nothing in the offered file names a link on that path or observes what it requests. Third,\
  \ the statement closes on \"no frontend module issues that fetch directly\" — a claim over every frontend\
  \ module — while the proof observes one hook; a module that fetched the document's URL outside `useCapabilitySchemaHelper`\
  \ leaves every assertion in this file passing. The dedicated test also compares by exact string equality\
  \ against the named link, so a direct fetch of the same document under a URL that differs by a query\
  \ string or a normalized form passes it, though the criterion-3 test's route-prefix assertion catches\
  \ that case for the listing path specifically.. The node is decided by reading, and a certification\
  \ standing on it from an earlier reconciliation is released by the bind. The remainder is untestable:\
  \ No finite set of behavioural tests closes the remainder as the node states it. The connector- configuration-draft\
  \ half alone would be testable — one input, an operator-named OpenAPI link supplied to the connector\
  \ configuration helper, against one expected result, that every request the module issues goes to the\
  \ backend route and none to the link itself — and a draft-path test of this hook that fails on any request\
  \ outside the two backend routes would lift the incidental assertion to a load-bearing one. But the\
  \ statement's closing clause is a totality over every frontend module, and the node's own fitness names\
  \ how it is decided: \"a dependency and network-call audit over the frontend module finds no direct\
  \ request to an OpenAPI document's own URL\". That is a fact about where code sits, spanning files no\
  \ test enumerates; a module added tomorrow that issues the fetch is outside anything the offered proof,\
  \ or any extension of it over known entry points, observes..\nCertification of rules/integration/a-capability-authoring-surface-offers-a-schema-helper\
  \ did not hold: the auditor answered `partial` — Three parts of the fact hold under this test and would\
  \ fail if they stopped: the helper sitting beneath the Output schema field on the same surface rather\
  \ than in a dialog, the request act being absent until an operation stands chosen with the waiting statement\
  \ in its place, and the waiting statement giving way to the request act once one is chosen. Three stated\
  \ parts go unexercised. (a) The fact is stated over \"a surface authoring or editing a capability\"\
  ; the single test mounts only the create screen via mountCapabilityCreateScreen, so an edit surface\
  \ that stopped offering the helper entirely would leave this test passing. (b) The draft requested is\
  \ stated to be \"generated from the chosen operation\", and the test asserts only that some call reached\
  \ /v1/draft-capability-schema-from-openapi -- nothing reads the request, so a draft requested for a\
  \ different operation, for no operation, or without the named link would leave this test passing. (c)\
  \ \"never by typing a path or a method\" is asserted only in the opening state, before the link is even\
  \ named -- the queryByRole checks for path/method textboxes run before the operator names the document,\
  \ so a surface that offered free-hand path or method entry after the link was named, or alongside the\
  \ chosen operation, would leave this test passing.. The node is decided by reading, and a certification\
  \ standing on it from an earlier reconciliation is released by the bind. The remainder is testable:\
  \ Three assertions close it. First: mount the capability edit surface for an existing capability and\
  \ assert the same Schema Helper stands beneath its Output schema field, with the waiting statement in\
  \ place of the request act -- one input, an edit surface, against one expected result, the helper offered\
  \ there as it is on the create surface. Second: after choosing the listed /v2/translate POST operation\
  \ and clicking the request act, read the captured draft-route call and assert its request carries the\
  \ named link and that chosen path and method -- one input, a chosen operation, against one expected\
  \ result, a draft request naming that operation and no other. Third: repeat the path/method free-hand\
  \ checks in the states the current test skips -- after the link is named and after an operation stands\
  \ chosen -- asserting no path or method textbox is offered in either..\nCertification of rules/integration/a-refused-schema-draft-states-its-refusal-to-the-operator\
  \ did not hold: the auditor answered `partial` — The three named conditions are exercised whole: each\
  \ of the three refusals asserts the \"no draft was generated\" sentence plus a phrase proper to its\
  \ own condition (the unfetchable link, the document unreadable as OpenAPI 3.x, and the method and path\
  \ of the absent operation), and the pairwise-distinctness assertion holds them apart from one another.\
  \ That no input_schema, output_schema or unresolved item stands beside a refusal is exercised for all\
  \ four readings, by the absence of the three drafted sections. Two stated parts go unexercised. First,\
  \ the clause \"states that the request failed for a reason it does not recognise\": the unrecognised-failure\
  \ test asserts only the shared no-draft sentence and the absence of the three named phrases, so a surface\
  \ that rendered the bare no-draft sentence with nothing at all about an unrecognised reason would pass\
  \ it, and the pairwise-distinctness assertion would still pass too, since the other three texts carry\
  \ their own phrases and the fixture's link, path and method. The negative half (\"never as one of them\"\
  , \"never as a draft\") is exercised; the positive statement the operator is owed is not. Second, the\
  \ fact scopes the refusal to the Schema Helper \"of a surface authoring or editing a capability\"; every\
  \ test in the offered proof renders CapabilitySchemaHelperFields directly against a hand-built state,\
  \ so nothing exercises that either surface reaches this statement, and the fact could stop holding on\
  \ one of those surfaces with the whole proof still passing.. The node is decided by reading, and a certification\
  \ standing on it from an earlier reconciliation is released by the bind. The remainder is testable:\
  \ One input — an outcome of kind \"unrecognized-failure\" — against one expected result: the alert states,\
  \ in its own words, that the request failed for a reason the surface does not recognise, asserted positively\
  \ on that sentence rather than only by the absence of the three named phrases. The second gap is likewise\
  \ testable, as one input against one result per surface: rendering the capability-authoring surface\
  \ and the capability-editing surface with a refusing draft outcome, each expected to state that refusal\
  \ to the operator..\nStaged by a review over files a delivery wrote: no pair was omitted, so the delivery's\
  \ own claims and every other binding of these files were judged alike; the plan's node(s) rules/integration/a-capability-authoring-surface-offers-a-schema-helper,\
  \ rules/integration/an-answered-schema-draft-request-states-its-draft-to-the-operator, rules/integration/a-refused-schema-draft-states-its-refusal-to-the-operator,\
  \ rules/integration/no-schema-draft-refusal-is-stated-before-the-operation-answers, rules/integration/a-pending-schema-draft-request-is-not-dispatched-again,\
  \ contracts/integration/capability-schema-draft, constraints/the-openapi-document-is-fetched-by-the-backend,\
  \ domain/integration/capability-schema-draft, domain/integration/capability-schema-draft-unresolved-item,\
  \ domain/integration/capability-schema-draft-unresolved-reason, rules/integration/the-input-schema-and-output-schema-fields-are-untouched-by-a-schema-drafts-arrival,\
  \ rules/integration/applying-a-drafted-capability-schema-changes-only-the-local-edit, rules/integration/a-stated-capability-schema-draft-is-marked-stale-once-what-it-was-generated-for-changes,\
  \ scenarios/integration/a-cleared-operation-choice-leaves-a-stated-schema-draft-stale were read on every\
  \ file and answered for, and bound from nowhere here — a binding this record writes is one the trace\
  \ already held.\nA finding in src/hooks/use-capability-schema-helper.ts names scenarios/integration/a-cleared-operation-choice-leaves-a-stated-schema-draft-stale,\
  \ which no file of this set is bound to: `onLinkChange` (line 55, `onLinkChange: setLink,`) alongside\
  \ the `chosenOperation` state declared at line 49: const [chosenOperation, setChosenOperation] = useState<OpenApiOperation\
  \ | undefined>(undefined);\n\nconst { outcome: operationsOutcome, refetch } = useOpenApiDocumentOperations(link);\n\
  \nreturn {\n  link,\n  onLinkChange: setLink, — Changing the named link only updates `link`; nothing\
  \ clears `chosenOperation`, so the hook keeps exposing the operation chosen under the previous document\
  \ as `chosenOperation` even once the listing for the new link has replaced it. A caller reading `chosenOperation`\
  \ to decide whether the request-draft act is offered, or to render the operation beside the helper,\
  \ is shown a choice that names no entry of the current link's listing -- the exact state the specification\
  \ says must read as cleared -- and the operator who types the original link back is handed a stale selection\
  \ rather than the \"waits on one\" state the surface owes until a fresh choice is made.. It blocks nothing\
  \ here; it is owed a route of its own.\nA finding in src/routes/capability-form-fields-schema-draft-staleness.spec.ts\
  \ names scenarios/integration/a-cleared-operation-choice-leaves-a-stated-schema-draft-stale, which no\
  \ file of this set is bound to: comment above the link-change step, lines 61-62: // only the link moves\
  \ away from the one the draft was generated for; the chosen operation\n// is left untouched (criterion\
  \ 4) — A maintainer reading this comment to understand why the draft goes stale after a link change\
  \ learns that the chosen operation survives the change untouched. But scenarios/integration/a-cleared-operation-choice-leaves-a-stated-schema-draft-stale\
  \ states that naming a different link leaves the Schema Helper \"holds no chosen operation, the choice\
  \ standing cleared from the moment the link named ceased to be the one whose listing that operation\
  \ was chosen from\" — the opposite of what the comment claims. Nothing in this test queries the operation\
  \ select after the link changes, so this false claim is the only place in the file that speaks to that\
  \ behavior at all, and it records it backwards for the next reader.. It blocks nothing here; it is owed\
  \ a route of its own.\nCandidates: 2 opened across 2 of 19 delegation(s); each return lists its own\
  \ under `candidates_opened`.\nUnstated: 1 fact(s) the source states that no node holds, over 1 file(s),\
  \ listed under `unstated`. They block no binding here and no rebind closes them — the route is the analysis\
  \ that gives each fact a node."
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/capability-schema-helper-frontend.returns/`, which are the evidence behind every entry above.
