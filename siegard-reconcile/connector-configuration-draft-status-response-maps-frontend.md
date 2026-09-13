---
contract_version: siegard-reconcile/5
title: 'Review: connector configuration draft, status readings and response-map capability coverage disclosure
  (frontend)'
summary: Reviews the frontend delivery of 16 tasks across two epics -- drafted-answer-disclosure (OpenAPI-drafted
  connector configuration, its status readings, response fields and reading notes reaching the surface,
  request gating, staleness marking, apply-confirmation diffing, pt-BR message centralization) and configuration-readiness
  (entry guidance, HTTP-connector departure statements, subject-placeholder and credential-placeholder
  statements, responseMap capability coverage, and well-formedness-only submission gating) -- over the
  75 files these 16 tasks touched.
target: frontend
files:
- path: src/hooks/use-connector-configuration-helper-stale-draft-marking.spec.ts
  change: written by the delivery of drafted-answer-disclosure/stale-draft-marking
- path: src/hooks/use-connector-configuration-helper.ts
  change: Adds an optional `connector` field to ConnectorConfigurationHelperState and returns the hook's
    own `connector` parameter under it, so the connector name the Helper was given reaches the presentation
    layer the same way path/method already do.
- path: src/hooks/use-draft-connector-configuration-from-openapi-reading-parts.spec.ts
  change: written by the delivery of drafted-answer-disclosure/draft-answer-parts-reach-the-surface
- path: src/hooks/use-draft-connector-configuration-from-openapi-stale-draft-marking.spec.ts
  change: written by the delivery of drafted-answer-disclosure/stale-draft-marking
- path: src/hooks/use-draft-connector-configuration-from-openapi.spec.ts
  change: 'Widened two pre-existing draft fixtures (FULL_DRAFT, DRAFT_WITHOUT_METHOD_MISMATCH) to also
    declare status_readings: [], response_fields: [] and reading_notes: [], since ConnectorConfigurationDraft
    now requires them; no assertion changed.'
- path: src/hooks/use-draft-connector-configuration-from-openapi.ts
  change: Declares ConnectorConfigurationDraftStatusReading, ConnectorConfigurationDraftResponseField,
    ConnectorConfigurationDraftReadingNoteKind and ConnectorConfigurationDraftReadingNote; grows ConnectorConfigurationDraft
    with status_readings, response_fields and reading_notes; and grows pickConnectorConfigurationDraftFields
    to destructure and re-emit all three new arrays in both of its branches, so a drafted answer's status
    readings, response fields and reading notes survive the frontend's reading of it instead of being
    stripped by the allow-list.
- path: src/hooks/use-response-map-capability-coverage.ts
  change: New hook. Fetches capabilities via the existing useCapabilities() query cache, filters them
    by connector name, and memoizes a call into the new service against a given configuration text.
- path: src/hooks/use-subject-placeholder-statements.ts
  change: New hook. Calls useCapabilities() once, filters by connector name, and memoizes the call into
    computeSubjectPlaceholderStatements over the connector name and configuration text -- the single point
    where the capability registry is read for this statement.
- path: src/routes/connector-configuration-create-screen-apply-draft.spec.ts
  change: written by the delivery of drafted-answer-disclosure/pt-br-message-module
- path: src/routes/connector-configuration-create-screen-cancel.spec.ts
  change: written by the delivery of drafted-answer-disclosure/pt-br-message-module
- path: src/routes/connector-configuration-create-screen-outcome.spec.ts
  change: written by the delivery of drafted-answer-disclosure/pt-br-message-module
- path: src/routes/connector-configuration-create-screen-save.spec.ts
  change: written by the delivery of drafted-answer-disclosure/pt-br-message-module
- path: src/routes/connector-configuration-create-screen.spec.ts
  change: written by the delivery of configuration-readiness/configuration-entry-guidance
- path: src/routes/connector-configuration-credential-placeholder-statements-view.tsx
  change: New sibling view component CredentialPlaceholderStatements({ credentialNames }) -- returns null
    when credentialNames is empty, otherwise a heading plus one <li> per name.
- path: src/routes/connector-configuration-detail-ready-view-cancel.spec.ts
  change: written by the delivery of drafted-answer-disclosure/pt-br-message-module
- path: src/routes/connector-configuration-detail-ready-view-forwards-configuration-text.spec.ts
  change: written by the delivery of drafted-answer-disclosure/pt-br-message-module
- path: src/routes/connector-configuration-detail-ready-view-order.spec.ts
  change: written by the delivery of drafted-answer-disclosure/pt-br-message-module
- path: src/routes/connector-configuration-detail-screen-cached-load.spec.ts
  change: written by the delivery of drafted-answer-disclosure/pt-br-message-module
- path: src/routes/connector-configuration-detail-screen-discard.spec.ts
  change: written by the delivery of drafted-answer-disclosure/pt-br-message-module
- path: src/routes/connector-configuration-detail-screen-footer-portal.spec.ts
  change: written by the delivery of drafted-answer-disclosure/pt-br-message-module
- path: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
  change: written by the delivery of drafted-answer-disclosure/pt-br-message-module
- path: src/routes/connector-configuration-detail-screen-outcome.spec.ts
  change: written by the delivery of drafted-answer-disclosure/pt-br-message-module
- path: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
  change: written by the delivery of drafted-answer-disclosure/pt-br-message-module
- path: src/routes/connector-configuration-detail-screen-save.spec.ts
  change: written by the delivery of drafted-answer-disclosure/pt-br-message-module
- path: src/routes/connector-configuration-detail-screen.spec.ts
  change: written by the delivery of drafted-answer-disclosure/pt-br-message-module
- path: src/routes/connector-configuration-form-fields-action-footer.spec.ts
  change: written by the delivery of drafted-answer-disclosure/pt-br-message-module
- path: src/routes/connector-configuration-form-fields-apply-confirmation-diff.spec.ts
  change: written by the delivery of drafted-answer-disclosure/apply-confirmation-diff
- path: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
  change: written by the delivery of drafted-answer-disclosure/apply-confirmation-diff
- path: src/routes/connector-configuration-form-fields-configuration-entry-guidance.spec.ts
  change: written by the delivery of configuration-readiness/configuration-entry-guidance
- path: src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
  change: written by the delivery of configuration-readiness/configuration-entry-guidance
- path: src/routes/connector-configuration-form-fields-credential-placeholder-statement.spec.ts
  change: written by the delivery of configuration-readiness/credential-placeholder-statement
- path: src/routes/connector-configuration-form-fields-http-departure-statements.spec.ts
  change: written by the delivery of configuration-readiness/http-departure-statements
- path: src/routes/connector-configuration-form-fields-response-map-capability-coverage.spec.ts
  change: written by the delivery of configuration-readiness/response-map-capability-coverage
- path: src/routes/connector-configuration-form-fields-subject-placeholder-statements.spec.ts
  change: written by the delivery of configuration-readiness/subject-placeholder-statements
- path: src/routes/connector-configuration-form-fields-submission-withheld-only-on-well-formedness.spec.ts
  change: written by the delivery of configuration-readiness/submission-withheld-only-on-well-formedness
- path: src/routes/connector-configuration-form-fields.tsx
  change: Imports the four new message constants, adds a local CONFIGURATION_ENTRY_GUIDANCE_MESSAGES array
    composing them in order, adds a small ConfigurationEntryGuidance() component rendering them as a <ul>
    of <li> items styled text-sm text-muted-foreground, and renders <ConfigurationEntryGuidance /> immediately
    below the existing <JsonTextareaField id="configuration" /> call, unconditionally.
- path: src/routes/connector-configuration-helper-fields-apply.spec.ts
  change: Widened the pre-existing BASE_DRAFT fixture the same way; no assertion changed.
- path: src/routes/connector-configuration-helper-fields-draft-request-gate.spec.ts
  change: written by the delivery of drafted-answer-disclosure/draft-request-gate
- path: src/routes/connector-configuration-helper-fields-independent-content-and-staleness.spec.ts
  change: written by the delivery of configuration-readiness/response-map-capability-coverage
- path: src/routes/connector-configuration-helper-fields-operation-select.spec.ts
  change: written by the delivery of drafted-answer-disclosure/draft-request-gate
- path: src/routes/connector-configuration-helper-fields-operations-read-disclosure.spec.ts
  change: written by the delivery of drafted-answer-disclosure/operations-read-states
- path: src/routes/connector-configuration-helper-fields-reading-notes.spec.ts
  change: written by the delivery of drafted-answer-disclosure/pt-br-message-module
- path: src/routes/connector-configuration-helper-fields-response-fields.spec.ts
  change: written by the delivery of drafted-answer-disclosure/pt-br-message-module
- path: src/routes/connector-configuration-helper-fields-response-map-capability-coverage.spec.ts
  change: written by the delivery of configuration-readiness/response-map-capability-coverage
- path: src/routes/connector-configuration-helper-fields-stale-draft-marking.spec.ts
  change: written by the delivery of drafted-answer-disclosure/pt-br-message-module
- path: src/routes/connector-configuration-helper-fields-submission-withheld-only-on-well-formedness.spec.ts
  change: written by the delivery of configuration-readiness/submission-withheld-only-on-well-formedness
- path: src/routes/connector-configuration-helper-fields.spec.ts
  change: Widened the pre-existing BASE_DRAFT fixture the same way; no assertion changed.
- path: src/routes/connector-configuration-helper-fields.tsx
  change: Passes connector into ConnectorConfigurationDraftDisclosure, which now computes and renders
    the same statement beside the drafted configuration's <pre> block.
- path: src/routes/connector-configuration-helper.tsx
  change: The "Configuration Helper" heading now reads CONFIGURATION_HELPER_HEADING from the message module.
- path: src/routes/connector-configuration-http-connector-departures-view.tsx
  change: New sibling file (split out to keep connector-configuration-form-fields.tsx under the project's
    300-line limit). Exports HttpConnectorDeparturesStatement, which returns null for an empty departures
    array and otherwise renders a heading plus one <li> per departure, each keyed by a stable identifier
    derived from the departure's own content (not array index).
- path: src/routes/connector-configuration-response-map-capability-coverage-view.tsx
  change: New rendering component. Renders nothing when the coverage is null. Renders the cannot-be-read
    message alone when no capability is registered. Otherwise renders two separate labelled lists -- key
    coverage (read / read-by-none) and expected-but-unnamed fields -- omitting whichever list is empty.
- path: src/routes/connector-configuration-subject-placeholder-statements-view.tsx
  change: New sibling view component SubjectPlaceholderStatements, following the same structural pattern
    as HttpConnectorDeparturesStatement -- renders nothing when the statement list is empty, otherwise
    a heading and a list of pt-BR statement lines.
- path: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
  change: written by the delivery of drafted-answer-disclosure/pt-br-message-module
- path: src/routes/connector-test-panel-capability-picker.spec.ts
  change: written by the delivery of drafted-answer-disclosure/pt-br-message-module
- path: src/routes/connector-test-panel-fields.spec.ts
  change: written by the delivery of drafted-answer-disclosure/pt-br-message-module
- path: src/routes/connector-test-panel-subject-and-attributes.spec.ts
  change: written by the delivery of drafted-answer-disclosure/pt-br-message-module
- path: src/services/connector-configuration-apply-diff.spec.ts
  change: written by the delivery of drafted-answer-disclosure/apply-confirmation-diff
- path: src/services/connector-configuration-apply-diff.ts
  change: New pure module. computeApplyConfirmationDiff(fieldText, draftText) parses both texts as JSON;
    returns { kind = "not-itemisable" } when the field's text does not parse to a JSON object (empty string,
    invalid JSON, array, string, number, boolean, null); otherwise returns { kind = "itemisable", topLevel,
    nested }. topLevel is a KeyChangeSet (added/removed/changed string arrays) computed over the two parsed
    top-level objects. nested is an array of { key, diff } entries, one per member of NESTED_OBJECT_KEYS
    (statusMap, responseMap, query, headers) for which BOTH sides hold a JSON object at that key. deepEqual
    is a small recursive structural-equality check. applyConfirmationDiffIsEmpty reports whether an itemisable
    diff has zero adds/removes/changes at every level. Reuses isPlainRecord from shared/services/plain-record.ts.
- path: src/services/connector-configuration-credential-placeholder-statements.spec.ts
  change: written by the delivery of configuration-readiness/credential-placeholder-statement
- path: src/services/connector-configuration-credential-placeholder-statements.ts
  change: New pure service exporting computeCredentialPlaceholderStatements(configurationText) -> readonly
    string[]. Parses the text as a JSON object (returning [] when it is not well-formed object text),
    recursively walks every string value the object reaches, and returns the distinct ${credential:<name>}
    names found, in first-occurrence order.
- path: src/services/connector-configuration-draft-disclosure-reading-notes.spec.ts
  change: written by the delivery of drafted-answer-disclosure/reading-notes-stated
- path: src/services/connector-configuration-draft-disclosure-response-fields.spec.ts
  change: written by the delivery of drafted-answer-disclosure/response-fields-stated
- path: src/services/connector-configuration-draft-disclosure.spec.ts
  change: Widened the pre-existing BASE_DRAFT fixture the same way; no assertion changed.
- path: src/services/connector-configuration-draft-disclosure.ts
  change: Removed its own UNRESOLVED_REASON_LABEL and READING_NOTE_KIND_LABEL dictionaries and its own
    fetchFailureLabel; unresolvedReasonLabel/readingNoteKindLabel now delegate to the module's unresolvedReasonMessage/readingNoteKindMessage
    (same call signatures, callers unchanged), and the four refused-outcome branches build their message
    from the module's functions/constants.
- path: src/services/connector-configuration-http-departures.spec.ts
  change: written by the delivery of configuration-readiness/http-departure-statements
- path: src/services/connector-configuration-http-departures.ts
  change: New pure module. Exports HTTP_CONNECTOR_METHODS (GET/POST/PUT/PATCH/DELETE) and HTTP_CONNECTOR_STATUS_MAP_ENDINGS
    (ok/denied/timeout/unavailable) vocabularies, the HttpConnectorDeparture discriminated union, and
    computeHttpConnectorDepartures(configurationText). Parses the text with JSON.parse and isPlainRecord
    (reused from shared/services/plain-record.ts); returns [] defensively when it does not parse to a
    plain object. Computes a method-present-but-outside-vocabulary departure; one statusMap-ending-outside-vocabulary
    departure per offending entry (statusMap absent/not-object short-circuits to a single status-map-not-an-object
    departure); a single response-map-departure when responseMap is absent, not an object, or holds any
    non-string value; an address-absent-or-empty departure; a query-or-headers-not-object-of-texts departure
    only when that key is declared and is not a plain object of string values; and a placeholder-outside-forms
    departure (deduplicated) for every ${...}-shaped substring reachable anywhere in the parsed configuration
    that does not match one of the three admitted forms.
- path: src/services/connector-configuration-messages-consumption.spec.ts
  change: written by the delivery of drafted-answer-disclosure/pt-br-message-module
- path: src/services/connector-configuration-messages.spec.ts
  change: written by the delivery of drafted-answer-disclosure/pt-br-message-module
- path: src/services/connector-configuration-messages.ts
  change: Adds four new pt-BR message constants -- CONFIGURATION_ENTRY_GUIDANCE_IS_JSON_OBJECT_MESSAGE,
    CONFIGURATION_ENTRY_GUIDANCE_READS_KEYS_MESSAGE, CONFIGURATION_ENTRY_GUIDANCE_READS_CALL_PARTS_MESSAGE,
    CONFIGURATION_ENTRY_GUIDANCE_PLACEHOLDER_FORMS_MESSAGE -- following the file's existing convention
    of exported UPPER_SNAKE_CASE string constants holding pt-BR literal text.
- path: src/services/connector-configuration-operations-read-disclosure.spec.ts
  change: written by the delivery of drafted-answer-disclosure/operations-read-states
- path: src/services/connector-configuration-operations-read-disclosure.ts
  change: Adds two variants to OperationsReadDisclosureState -- "pending" (read outstanding) and "empty"
    (read answered with zero operations). operationsReadDisclosureStateForOutcome now maps the "pending"
    outcome to the new "pending" state, and the "operations" outcome to "empty" when its operations array
    is empty and "none" otherwise (unchanged for a non-empty array and for "idle"). The three refusal
    branches and their messages are untouched.
- path: src/services/connector-configuration-response-map-capability-coverage.spec.ts
  change: written by the delivery of configuration-readiness/response-map-capability-coverage
- path: src/services/connector-configuration-response-map-capability-coverage.ts
  change: New pure service. Parses the configuration text; returns null when it is not well-formed JSON
    object text or declares no responseMap object. Where the connector-filtered capability list is empty,
    returns a single cannot-be-read outcome. Otherwise reads each capability's output_schema top-level
    properties, and returns a coverage outcome carrying two separate lists -- keyStatements and expectedFieldStatements.
- path: src/services/connector-configuration-subject-placeholder-statements.spec.ts
  change: written by the delivery of configuration-readiness/subject-placeholder-statements
- path: src/services/connector-configuration-subject-placeholder-statements.ts
  change: New pure service. Parses the Configuration field's text as a JSON object (returns [] if not
    well-formed), walks it recursively for every string value to extract every distinct ${subject:<attribute-name>}
    placeholder. Returns [] when no subject placeholder is found. Where the given connector-filtered capability
    list is empty, returns a single { kind = "cannot-be-checked" } entry. Otherwise, for each distinct
    attribute name, parses every capability's input_schema as JSON and reads its top-level properties
    object's keys (defensively treating a parse failure or a missing/non-object properties as "declares
    nothing"), and returns { kind = "declared" } when every capability declares the attribute or { kind
    = "undeclared", nonDeclaringCapabilityLabels } naming every capability that does not.
nodes:
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  conforms: true
  how: "src/hooks/use-connector-configuration-helper.ts: held at the delegation to the two data hooks\
    \ rather than any direct request — line 54 and line 60 — const { requestDraft, outcome, statedFor\
    \ } = useDraftConnectorConfigurationFromOpenApi(connector); ... const { outcome: operationsOutcome\
    \ } = useOpenApiDocumentOperations(link);\nsrc/hooks/use-draft-connector-configuration-from-openapi.ts:\
    \ held at the mutationFn, which calls the backend's own draft endpoint and never the OpenAPI document's\
    \ own URL — mutationFn: (body: DraftConnectorConfigurationFromOpenApiRequestBody) =>\n      apiFetch<ConnectorConfigurationDraft>(\"\
    /v1/draft-connector-configuration-from-openapi\", {\n        method: \"POST\","
  encoded_at:
  - src/hooks/use-connector-configuration-helper.ts
  - src/hooks/use-draft-connector-configuration-from-openapi.ts
- node: contracts/integration/connector-configuration-draft
  conforms: true
  how: "src/hooks/use-connector-configuration-helper.ts: held at the requestDraft call inside onRequestDraft,\
    \ lines 76-78 — onRequestDraft: () => { requestDraft({ link, path, method }); },\nsrc/hooks/use-draft-connector-configuration-from-openapi.ts:\
    \ held at the same mutationFn, naming the published operation's own route — apiFetch<ConnectorConfigurationDraft>(\"\
    /v1/draft-connector-configuration-from-openapi\", {\n        method: \"POST\",\n        headers: {\
    \ \"Content-Type\": \"application/json\" },\n        body: JSON.stringify(body),\n      }),\nsrc/routes/connector-configuration-helper-fields.tsx:\
    \ held at nowhere — this file never calls draft-connector-configuration-from-openapi itself; it only\
    \ consumes the already-resolved outcome through props — const disclosure = disclosureStateForOutcome(state.outcome);"
  encoded_at:
  - src/hooks/use-connector-configuration-helper.ts
  - src/hooks/use-draft-connector-configuration-from-openapi.ts
  - src/routes/connector-configuration-helper-fields.tsx
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: 'src/routes/connector-configuration-form-fields.tsx: held at nowhere — this file wires the form''s
    submit to an injected handler but does not itself declare or call read-connector-configuration, list-connector-configurations
    or register-connector — <form id={CONNECTOR_CONFIGURATION_FORM_ID} onSubmit={onSubmit} noValidate
    className="flex flex-col gap-4">'
  encoded_at:
  - src/routes/connector-configuration-form-fields.tsx
- node: contracts/integration/openapi-document-operations
  conforms: true
  how: 'src/hooks/use-connector-configuration-helper.ts: held at the call to useOpenApiDocumentOperations(link),
    line 60 — const { outcome: operationsOutcome } = useOpenApiDocumentOperations(link);'
  encoded_at:
  - src/hooks/use-connector-configuration-helper.ts
- node: domain/integration/connector-configuration
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-response-map-capability-coverage.ts,
    src/routes/connector-configuration-form-fields.tsx, src/routes/connector-configuration-helper-fields.tsx,
    src/services/connector-configuration-messages.ts, src/services/connector-configuration-response-map-capability-coverage.ts,
    src/services/connector-configuration-subject-placeholder-statements.ts, and src/services/connector-configuration-http-departures.ts
    read `nowhere` — export function computeHttpConnectorDepartures(configurationText: string): readonly
    HttpConnectorDeparture[] { — a binding asserts the file answers for the node, so the pair that stopped
    holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/hooks/use-response-map-capability-coverage.ts
  - src/routes/connector-configuration-form-fields.tsx
  - src/routes/connector-configuration-helper-fields.tsx
  - src/services/connector-configuration-http-departures.ts
  - src/services/connector-configuration-messages.ts
  - src/services/connector-configuration-response-map-capability-coverage.ts
  - src/services/connector-configuration-subject-placeholder-statements.ts
- node: domain/integration/connector-configuration-draft
  conforms: false
  how: 'src/services/connector-configuration-messages-consumption.spec.ts, the DRAFT_ROUTE fetch stub''s
    mocked draft answer: jsonResponse({ connector: "deepl-connector", configuration: ''{"distinctive":true}'',
    unresolved: [], generated_credentials: [] }), — This is the file''s one stand-in for what draft-connector-configuration-from-openapi
    answers, and it models a complete, successful draft with only four of the seven attributes domain/integration/connector-configuration-draft
    declares required (status_readings, response_fields and reading_notes are absent, not even as empty
    arrays).'
  observed_at:
  - src/hooks/use-draft-connector-configuration-from-openapi.ts
  - src/routes/connector-configuration-helper-fields.tsx
  - src/services/connector-configuration-draft-disclosure.ts
- node: domain/integration/connector-configuration-draft-generated-credential
  conforms: true
  how: "src/hooks/use-draft-connector-configuration-from-openapi.ts: held at the ConnectorConfigurationDraftGeneratedCredential\
    \ type — export type ConnectorConfigurationDraftGeneratedCredential = {\n  readonly name: string;\n\
    \  readonly security_scheme: string;\n};\nsrc/routes/connector-configuration-helper-fields.tsx: held\
    \ at the generated-credentials list inside the draft disclosure — {draft.generatedCredentials.map((credential)\
    \ => (<li key={`${credential.name}:${credential.securityScheme}`}>{credential.name}: {credential.securityScheme}</li>))}\n\
    src/services/connector-configuration-draft-disclosure.ts: held at the generatedCredentials mapping\
    \ inside draftDisclosureFrom — generatedCredentials: draft.generated_credentials.map((credential)\
    \ => ({ name: credential.name, securityScheme: credential.security_scheme })),"
  encoded_at:
  - src/hooks/use-draft-connector-configuration-from-openapi.ts
  - src/routes/connector-configuration-helper-fields.tsx
  - src/services/connector-configuration-draft-disclosure.ts
- node: domain/integration/connector-configuration-draft-method-mismatch
  conforms: true
  how: "src/hooks/use-draft-connector-configuration-from-openapi.ts: held at the ConnectorConfigurationDraftMethodMismatch\
    \ type — export type ConnectorConfigurationDraftMethodMismatch = {\n  readonly registered: string;\n\
    \  readonly operation: string;\n};\nsrc/routes/connector-configuration-helper-fields.tsx: held at\
    \ the method-mismatch section, rendered only when the draft carries one — {draft.methodMismatch !==\
    \ undefined && (<section><p>{DRAFT_DISCLOSURE_METHOD_MISMATCH_LABEL}</p><p>{methodMismatchText(draft.methodMismatch.registered,\
    \ draft.methodMismatch.operation)}</p></section>)}"
  encoded_at:
  - src/hooks/use-draft-connector-configuration-from-openapi.ts
  - src/routes/connector-configuration-helper-fields.tsx
- node: domain/integration/connector-configuration-draft-reading-note
  conforms: true
  how: "src/hooks/use-draft-connector-configuration-from-openapi.ts: held at the ConnectorConfigurationDraftReadingNote\
    \ type — export type ConnectorConfigurationDraftReadingNote = {\n  readonly kind: ConnectorConfigurationDraftReadingNoteKind;\n\
    \  readonly subject: string;\n  readonly detail?: string;\n};\nsrc/routes/connector-configuration-helper-fields.tsx:\
    \ held at the reading-notes list inside the draft disclosure — {draft.readingNotes.map((note) => (<li\
    \ key={`${note.kind}:${note.subject}`}>{note.subject}{note.kindLabel}{note.detail !== undefined &&\
    \ <>{readingNoteDetailText(note.detail)}</>}</li>))}\nsrc/services/connector-configuration-draft-disclosure.ts:\
    \ held at the readingNotes mapping inside draftDisclosureFrom — readingNotes: (draft.reading_notes\
    \ ?? []).map((note) => ({ kind: note.kind, kindLabel: readingNoteKindLabel(note.kind), subject: note.subject,\
    \ detail: note.detail })),"
  encoded_at:
  - src/hooks/use-draft-connector-configuration-from-openapi.ts
  - src/routes/connector-configuration-helper-fields.tsx
  - src/services/connector-configuration-draft-disclosure.ts
  decided_by: reading
  remainder: testable
  remainder_why: Assertions over drafted notes at each of the node's subject-determining conditions (operation-as-a-whole
    vs. response key/property/field), and over the repeated-field-name detail naming the actual path not
    taken.
- node: domain/integration/connector-configuration-draft-reading-note-kind
  conforms: false
  how: 'src/services/connector-configuration-messages.spec.ts, NINE_READING_NOTE_KINDS: const NINE_READING_NOTE_KINDS
    = ["default-response-not-drafted", "status-range-not-drafted", "non-json-success-content-not-read",
    "envelope-read-through", "variants-united", "repeated-field-name-path-not-taken", "no-responses-declared",
    "no-success-response-schema", "success-schema-declares-no-properties"] as const; — The closed set
    of reading-note kinds is retyped here as a bare string-literal array with no link back to the module''s
    own type, so a specification change would not be caught by this test.'
  observed_at:
  - src/hooks/use-draft-connector-configuration-from-openapi.ts
  - src/services/connector-configuration-draft-disclosure.ts
- node: domain/integration/connector-configuration-draft-response-field
  conforms: true
  how: "src/hooks/use-draft-connector-configuration-from-openapi.ts: held at the ConnectorConfigurationDraftResponseField\
    \ type — export type ConnectorConfigurationDraftResponseField = {\n  readonly name: string;\n  readonly\
    \ path: string;\n  readonly status: string;\n  readonly declared_type?: string;\n  readonly declared_required?:\
    \ boolean;\n  readonly envelope?: string;\n};\nsrc/routes/connector-configuration-helper-fields.tsx:\
    \ held at the response-fields list inside the draft disclosure — {draft.responseFields.map((field)\
    \ => (<li key={`${field.status}:${field.path}:${field.name}`}>{field.name} {responseFieldPathStatusText(field.path,\
    \ field.status)}...</li>))}\nsrc/services/connector-configuration-draft-disclosure.ts: held at the\
    \ responseFields mapping inside draftDisclosureFrom — responseFields: (draft.response_fields ?? []).map((field)\
    \ => ({ name: field.name, path: field.path, status: field.status, declaredType: field.declared_type,\
    \ declaredRequired: field.declared_required, envelope: field.envelope })),"
  encoded_at:
  - src/hooks/use-draft-connector-configuration-from-openapi.ts
  - src/routes/connector-configuration-helper-fields.tsx
  - src/services/connector-configuration-draft-disclosure.ts
  decided_by: reading
  remainder: untestable
  remainder_why: The responseMap correspondence is testable with one assertion; "read by no observation"
    is a totality over every observation in the system and cannot be closed by a finite test.
- node: domain/integration/connector-configuration-draft-status-reading
  conforms: false
  how: 'src/services/connector-configuration-draft-disclosure.spec.ts, each status reading is projected
    into its own status, ending and declared_as, one-to-one and unmodified: status_readings: [{ status:
    "200", ending: "record-stub-response", declared_as: "Successful profile retrieval" }, { status: "403",
    ending: "skip-endpoint" }], — The fixture presents "record-stub-response" and "skip-endpoint" as ordinary
    drafted statusMap endings, but connector-configuration-draft-status-reading types its "ending" attribute
    as a closed enumeration of exactly ok, unavailable, denied and timeout. A reader or later test-writer
    has no way to tell these two strings are not real evidence-result endings a draft could ever carry.'
  observed_at:
  - src/hooks/use-draft-connector-configuration-from-openapi.ts
  - src/routes/connector-configuration-helper-fields.tsx
  - src/services/connector-configuration-draft-disclosure.ts
- node: domain/integration/connector-configuration-draft-unresolved-item
  conforms: true
  how: "src/hooks/use-draft-connector-configuration-from-openapi.ts: held at the ConnectorConfigurationDraftUnresolvedItem\
    \ type — export type ConnectorConfigurationDraftUnresolvedItem = {\n  readonly name: string;\n  readonly\
    \ reason: string;\n};\nsrc/routes/connector-configuration-helper-fields.tsx: held at the unresolved-items\
    \ list inside the draft disclosure — {draft.unresolved.map((item) => (<li key={`${item.name}:${item.reason}`}>{item.name}:\
    \ {item.reasonLabel}</li>))}\nsrc/services/connector-configuration-draft-disclosure.ts: held at the\
    \ unresolved mapping inside draftDisclosureFrom — unresolved: draft.unresolved.map((item) => ({ name:\
    \ item.name, reason: item.reason, reasonLabel: unresolvedReasonLabel(item.reason) })),"
  encoded_at:
  - src/hooks/use-draft-connector-configuration-from-openapi.ts
  - src/routes/connector-configuration-helper-fields.tsx
  - src/services/connector-configuration-draft-disclosure.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'Three assertions close it: an item whose name is the document''s own parameter/scheme
    name character for character; an item with an out-of-vocabulary reason expected to be refused rather
    than disclosed; and items missing name or missing reason, each expected refused.'
- node: domain/integration/connector-configuration-draft-unresolved-reason
  conforms: false
  how: "src/hooks/use-draft-connector-configuration-from-openapi.spec.ts, the describe/it text and literal\
    \ fixture value at lines 255-262: describe(\"ConnectorConfigurationDraftUnresolvedItem -- reason is\
    \ a plain string, not narrowed to the closed set of four reason literals (inference)\", () => {\n\
    \  it(\"type-checks a reason value outside the closed reason set\", () => {\n    const buildItem =\
    \ (): ConnectorConfigurationDraftUnresolvedItem => ({\n      name: \"api-key\",\n      reason: \"\
    a-reason-the-closed-four-value-set-does-not-name\",\n    }); — A reader trusting this test's own description\
    \ learns the unresolved reason vocabulary has four members; the specification's own enumeration has\
    \ three (no-capability-registered, security-scheme-not-reducible-to-a-credential, drafted-key-occupied-by-another-security-scheme),\
    \ so the next person who adds or checks a fourth reason against this test's account is working from\
    \ a count the specification never gave.\nsrc/services/connector-configuration-messages.spec.ts, THREE_UNRESOLVED_REASONS:\
    \ const THREE_UNRESOLVED_REASONS = [\"no-capability-registered\", \"security-scheme-not-reducible-to-a-credential\"\
    , \"drafted-key-occupied-by-another-security-scheme\"] as const; — The closed set of unresolved reasons\
    \ is retyped here rather than read from the module's own type, so a reason added, renamed or removed\
    \ would not be caught by comparing against it."
  observed_at:
  - src/services/connector-configuration-draft-disclosure.ts
- node: domain/integration/openapi-document-operations
  conforms: true
  how: 'src/hooks/use-connector-configuration-helper.ts: held at operationsOfferedFor, lines 29-33 — return
    operationsOutcome.kind === "operations" ? operationsOutcome.operations : [];

    src/routes/connector-configuration-helper-fields.tsx: held at the operation-options list built from
    state.operations, and the operations-read disclosure branches — const operationOptions: SelectOption[]
    = state.operations.map((operation) => ({ ... }));

    {operationsReadDisclosure.kind === "empty" && (<p>{OPERATIONS_READ_EMPTY_MESSAGE}</p>)}'
  encoded_at:
  - src/hooks/use-connector-configuration-helper.ts
  - src/routes/connector-configuration-helper-fields.tsx
- node: domain/integration/openapi-operation
  conforms: true
  how: 'src/hooks/use-connector-configuration-helper.ts: held at onChooseOperation, lines 68-71 — onChooseOperation:
    (operation) => { setPath(operation.path); setMethod(operation.method); },

    src/routes/connector-configuration-helper-fields.tsx: held at operationSelectValue and the option
    label built from an operation''s path and method — function operationSelectValue(entry: Pick<OpenApiOperation,
    "path" | "method">): string { return `${entry.method.toUpperCase()} ${entry.path}`; }'
  encoded_at:
  - src/hooks/use-connector-configuration-helper.ts
  - src/routes/connector-configuration-helper-fields.tsx
- node: rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing
  conforms: false
  how: 'src/hooks/use-connector-configuration-helper.ts, the ConnectorConfigurationHelperState type (lines
    21 and 23) and its implementation in the hook''s return (lines 73 and 75): readonly onPathChange:
    (value: string) => void;

    readonly onMethodChange: (value: string) => void;

    ...

    onPathChange: setPath,

    ...

    onMethodChange: setMethod, — a consumer of this hook can set path or method to any typed string through
    onPathChange/onMethodChange, independently of onChooseOperation; the request onRequestDraft then issues
    — requestDraft({ link, path, method }) — would name a path or a method the operator typed rather than
    one chosen from the fetched document''s own listing, which the rule states never happens, and nothing
    else in this file withholds that capability.'
  observed_at:
  - src/hooks/use-connector-configuration-helper.ts
  - src/routes/connector-configuration-create-screen-apply-draft.spec.ts
  - src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
  - src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
  - src/routes/connector-configuration-helper-fields.tsx
- node: rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper
  conforms: false
  how: 'the fact left part of its ground: still held in src/routes/connector-configuration-form-fields.tsx,
    src/routes/connector-configuration-helper-fields.tsx, src/routes/connector-configuration-helper.tsx,
    and src/hooks/use-connector-configuration-helper.ts read `nowhere` — export function useConnectorConfigurationHelper(connector:
    string): ConnectorConfigurationHelperState { — a state hook, with no surface placement of any kind;
    src/hooks/use-draft-connector-configuration-from-openapi.ts read `nowhere` — the file exports only
    a data hook, with no rendering of a Configuration Helper or any other control — a binding asserts
    the file answers for the node, so the pair that stopped holding it is released by `--bind ... --replace`,
    never restamped here'
  observed_at:
  - src/hooks/use-connector-configuration-helper.ts
  - src/hooks/use-draft-connector-configuration-from-openapi.ts
  - src/routes/connector-configuration-form-fields.tsx
  - src/routes/connector-configuration-helper-fields.tsx
  - src/routes/connector-configuration-helper.tsx
- node: rules/integration/a-connector-configuration-drafts-configuration-is-well-formed-object-text
  conforms: true
  how: "src/services/connector-configuration-apply-diff.ts: held at the parseJsonObject helper, applied\
    \ to both the field's text and the draft's text — function parseJsonObject(text: string): Record<string,\
    \ unknown> | null {\n  let parsed: unknown;\n  try { parsed = JSON.parse(text); } catch { return null;\
    \ }\n  return isPlainRecord(parsed) ? parsed : null;\n}"
  encoded_at:
  - src/services/connector-configuration-apply-diff.ts
- node: rules/integration/a-connector-configuration-entry-states-what-the-http-connector-reads-from-it
  conforms: true
  how: "src/routes/connector-configuration-form-fields.tsx: held at the CONFIGURATION_ENTRY_GUIDANCE_MESSAGES\
    \ list and ConfigurationEntryGuidance — const CONFIGURATION_ENTRY_GUIDANCE_MESSAGES: readonly string[]\
    \ = [\n  CONFIGURATION_ENTRY_GUIDANCE_IS_JSON_OBJECT_MESSAGE,\n  CONFIGURATION_ENTRY_GUIDANCE_READS_KEYS_MESSAGE,\n\
    \  CONFIGURATION_ENTRY_GUIDANCE_READS_CALL_PARTS_MESSAGE,\n  CONFIGURATION_ENTRY_GUIDANCE_PLACEHOLDER_FORMS_MESSAGE,\n\
    ];\nsrc/services/connector-configuration-messages.ts: held at CONFIGURATION_ENTRY_GUIDANCE_IS_JSON_OBJECT_MESSAGE,\
    \ CONFIGURATION_ENTRY_GUIDANCE_READS_KEYS_MESSAGE, CONFIGURATION_ENTRY_GUIDANCE_READS_CALL_PARTS_MESSAGE\
    \ and CONFIGURATION_ENTRY_GUIDANCE_PLACEHOLDER_FORMS_MESSAGE — export const CONFIGURATION_ENTRY_GUIDANCE_IS_JSON_OBJECT_MESSAGE\
    \ = \"O que é digitado aqui é um objeto JSON.\";\nexport const CONFIGURATION_ENTRY_GUIDANCE_READS_KEYS_MESSAGE\
    \ = \"O conector HTTP lê o method, address, statusMap e responseMap da configuração.\";"
  encoded_at:
  - src/routes/connector-configuration-form-fields.tsx
  - src/services/connector-configuration-messages.ts
  decided_by: reading
  remainder: testable
  remainder_why: Four literal-text assertions, one per guidance item, over what each item actually says
    rather than over the constants that produce it.
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: true
  how: "src/routes/connector-configuration-form-fields.tsx: held at configurationTextParsesToNonObject\
    \ and ConfigurationNotAnObjectStatement — function configurationTextParsesToNonObject(text: string):\
    \ boolean {\n  let parsed: unknown;\n  try { parsed = JSON.parse(text); } catch { return false; }\n\
    \  return !isPlainRecord(parsed);\n}"
  encoded_at:
  - src/routes/connector-configuration-form-fields.tsx
- node: rules/integration/a-connector-configuration-placeholder-is-written-in-one-of-three-forms
  conforms: true
  how: 'src/services/connector-configuration-http-departures.ts: held at ADMITTED_PLACEHOLDER_PATTERN
    and placeholderDepartures — const ADMITTED_PLACEHOLDER_PATTERN = /^\$\{(subject:[^}]+|requester|credential:[^}]+)\}$/;

    src/services/connector-configuration-subject-placeholder-statements.ts: held at the SUBJECT_PLACEHOLDER_PATTERN
    constant, recognizing only the Subject-attribute form — const SUBJECT_PLACEHOLDER_PATTERN = /\$\{subject:([^}]+)\}/g;'
  encoded_at:
  - src/services/connector-configuration-http-departures.ts
  - src/services/connector-configuration-subject-placeholder-statements.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'The remainder is the table over the malformed-argument pairings the offered tests leave
    out: ${requester:anything}, a bare ${subject}, and a bare ${credential}, each against a placeholder-outside-forms
    departure naming that exact placeholder text. Three inputs close the fact whole.'
- node: rules/integration/a-connector-configuration-surface-offers-no-submission-while-its-content-is-not-well-formed
  conforms: true
  how: 'src/routes/connector-configuration-form-fields.tsx: held at isSaveDisabled and the Save Button''s
    disabled prop, beside the not-an-object statement — const isSaveDisabled = isSubmitting || !configuration.isValid
    || isDirty === false;'
  encoded_at:
  - src/routes/connector-configuration-form-fields.tsx
- node: rules/integration/a-connector-configuration-surface-promises-no-check-of-a-credential-placeholders-resolution
  conforms: true
  how: "src/routes/connector-configuration-credential-placeholder-statements-view.tsx: held at the <li>\
    \ element inside the returned list, rendered once per credential name, guarded so the whole block\
    \ renders nothing when there are no credential placeholders — if (credentialNames.length === 0) {\n\
    \  return null;\n}\n...\n{credentialNames.map((name) => (\n  <li key={name}>{credentialPlaceholderStatementText(name)}</li>\n\
    ))}\nsrc/services/connector-configuration-credential-placeholder-statements.ts: held at the enumeration\
    \ this file computes for that statement — the distinct set of ${credential:<name>} names a well-formed\
    \ configuration embeds — export function computeCredentialPlaceholderStatements(configurationText:\
    \ string): readonly string[] {\n  const configuration = parseConfigurationObject(configurationText);\n\
    \  if (configuration === null) { return []; }\n  return extractCredentialNames(configuration);\n}\n\
    src/services/connector-configuration-messages.ts: held at credentialPlaceholderStatementText — export\
    \ function credentialPlaceholderStatementText(name: string): string {\n  return `A credencial \\${credential:${name}}\
    \ é resolvida a partir da configuração do próprio servidor no momento de um teste ou de uma observação;\
    \ nada nesta superfície a verifica.`;\n}"
  encoded_at:
  - src/routes/connector-configuration-credential-placeholder-statements-view.tsx
  - src/services/connector-configuration-credential-placeholder-statements.ts
  - src/services/connector-configuration-messages.ts
  decided_by: reading
  remainder: testable
  remainder_why: Assert the literal expected text (not via the generator) for two distinct embedded credential
    names, each naming its own credential, each stating server-side resolution and each stating it is
    checked by nothing on the surface.
- node: rules/integration/a-connector-configuration-surface-states-a-subject-placeholder-no-registered-capability-declares
  conforms: true
  how: "src/hooks/use-subject-placeholder-statements.ts: held at the capability selection and the delegated\
    \ computation, lines 14-22 — const connectorCapabilities = useMemo(\n    () => capabilities.filter((capability)\
    \ => capability.connector === connector),\n    [capabilities, connector],\n  );\n\n  return useMemo(\n\
    \    () => computeSubjectPlaceholderStatements(configurationValue, connectorCapabilities),\n    [configurationValue,\
    \ connectorCapabilities],\n  );\nsrc/routes/connector-configuration-subject-placeholder-statements-view.tsx:\
    \ held at the SubjectPlaceholderStatements component's per-kind switch, rendering SUBJECT_PLACEHOLDER_CANNOT_BE_CHECKED_MESSAGE\
    \ for \"cannot-be-checked\" and naming the attribute and the non-declaring capabilities for \"undeclared\"\
    \ — case \"cannot-be-checked\":\n      return SUBJECT_PLACEHOLDER_CANNOT_BE_CHECKED_MESSAGE;\n   \
    \ case \"declared\":\n      return subjectPlaceholderDeclaredText(statement.attributeName);\n    case\
    \ \"undeclared\":\n      return subjectPlaceholderUndeclaredText(statement.attributeName, statement.nonDeclaringCapabilityLabels);\n\
    src/services/connector-configuration-messages.ts: held at SUBJECT_PLACEHOLDER_CANNOT_BE_CHECKED_MESSAGE,\
    \ subjectPlaceholderDeclaredText and subjectPlaceholderUndeclaredText — export const SUBJECT_PLACEHOLDER_CANNOT_BE_CHECKED_MESSAGE\
    \ = \"Nenhuma capacidade está registrada para este conector: os placeholders de assunto desta configuração\
    \ não podem ser verificados.\";\nsrc/services/connector-configuration-subject-placeholder-statements.ts:\
    \ held at computeSubjectPlaceholderStatements — if (connectorCapabilities.length === 0) { return [{\
    \ kind: \"cannot-be-checked\" }]; }\nreturn attributeNames.map((attributeName) => {\n  const nonDeclaringCapabilityLabels\
    \ = capabilityPropertyNames.filter((entry) => !entry.propertyNames.has(attributeName)).map((entry)\
    \ => entry.label);\n  if (nonDeclaringCapabilityLabels.length === 0) { return { kind: \"declared\"\
    , attributeName }; }\n  return { kind: \"undeclared\", attributeName, nonDeclaringCapabilityLabels\
    \ };\n});"
  encoded_at:
  - src/hooks/use-subject-placeholder-statements.ts
  - src/routes/connector-configuration-subject-placeholder-statements-view.tsx
  - src/services/connector-configuration-messages.ts
  - src/services/connector-configuration-subject-placeholder-statements.ts
- node: rules/integration/a-connector-configuration-surface-states-what-the-http-connector-would-refuse-in-its-configuration-fields-content
  conforms: true
  how: "src/routes/connector-configuration-form-fields.tsx: held at the httpConnectorDepartures computation\
    \ and HttpConnectorDeparturesStatement render — const httpConnectorDepartures = useMemo(() => computeHttpConnectorDepartures(configuration.value),\
    \ [configuration.value]);\n<HttpConnectorDeparturesStatement departures={httpConnectorDepartures}\
    \ />\nsrc/services/connector-configuration-http-departures.ts: held at the HttpConnectorDeparture\
    \ union and computeHttpConnectorDepartures — const method = methodDeparture(configuration);\nif (method\
    \ !== null) { departures.push(method); }\ndepartures.push(...statusMapDepartures(configuration));\n\
    src/services/connector-configuration-messages.ts: held at HTTP_CONNECTOR_DEPARTURES_HEADING and the\
    \ httpConnector*DepartureText functions — export function httpConnectorMethodDepartureText(value:\
    \ unknown, admittedMethods: readonly string[]): string {\n  return `O method declarado (${formatHttpConnectorDepartureValueText(value)})\
    \ está fora do vocabulário admitido: ${admittedMethods.join(\", \")}.`;\n}"
  encoded_at:
  - src/routes/connector-configuration-form-fields.tsx
  - src/services/connector-configuration-http-departures.ts
  - src/services/connector-configuration-messages.ts
- node: rules/integration/a-connector-configuration-surface-states-which-response-map-keys-a-registered-capability-reads
  conforms: true
  how: "src/hooks/use-response-map-capability-coverage.ts: held at the hook body, lines 14-22 — it derives\
    \ the capabilities currently registered naming the connector and hands them, with the configuration\
    \ text, to the coverage computation the rule's statement is built from — const connectorCapabilities\
    \ = useMemo(\n  () => capabilities.filter((capability) => capability.connector === connector),\n \
    \ [capabilities, connector],\n);\n\nreturn useMemo(\n  () => computeResponseMapCapabilityCoverage(configurationText,\
    \ connectorCapabilities),\n  [configurationText, connectorCapabilities],\n);\nsrc/routes/connector-configuration-form-fields.tsx:\
    \ held at the responseMapCapabilityCoverage hook call and ResponseMapCapabilityCoverageStatement render\
    \ — const responseMapCapabilityCoverage = useResponseMapCapabilityCoverage(connector, configuration.value);\n\
    <ResponseMapCapabilityCoverageStatement coverage={responseMapCapabilityCoverage} />\nsrc/routes/connector-configuration-helper-fields.tsx:\
    \ held at the coverage hook wired against the draft's configuration and rendered beside it — const\
    \ responseMapCapabilityCoverage = useResponseMapCapabilityCoverage(connector, draft.configuration);\n\
    <ResponseMapCapabilityCoverageStatement coverage={responseMapCapabilityCoverage} />\nsrc/routes/connector-configuration-response-map-capability-coverage-view.tsx:\
    \ held at the branches rendering coverage.keyStatements (kind \"read\"/\"read-by-none\") and coverage.expectedFieldStatements,\
    \ together with the coverage.kind === \"cannot-be-read\" branch — {coverage.keyStatements.map((statement)\
    \ =>\n        statement.kind === \"read\" ? (\n          <li key={`read:${statement.key}`}>{responseMapKeyReadText(statement.key,\
    \ statement.capabilityLabels)}</li>\n        ) : (\n          <li key={`read-by-none:${statement.key}`}>{responseMapKeyReadByNoneText(statement.key)}</li>\n\
    \        ),\n      )}\n{coverage.expectedFieldStatements.map((statement) => (\n        <li key={`${statement.capabilityLabel}:${statement.fieldName}`}>{responseMapExpectedFieldText(statement.capabilityLabel,\
    \ statement.fieldName)}</li>\n      ))}\nif (coverage.kind === \"cannot-be-read\") {\n  return (\n\
    \    <div><p>{RESPONSE_MAP_COVERAGE_HEADING}</p><p>{RESPONSE_MAP_COVERAGE_CANNOT_BE_READ_MESSAGE}</p></div>\n\
    \  );\n}\n\nsrc/services/connector-configuration-response-map-capability-coverage.ts: held at computeResponseMapCapabilityCoverage\
    \ — if (connectorCapabilities.length === 0) { return { kind: \"cannot-be-read\" }; }\nif (readingCapabilityLabels.length\
    \ === 0) { return { kind: \"read-by-none\", key }; }\nreturn { kind: \"read\", key, capabilityLabels:\
    \ readingCapabilityLabels };\nif (!responseMapKeySet.has(fieldName)) { expectedFieldStatements.push({\
    \ capabilityLabel: entry.label, fieldName }); }"
  encoded_at:
  - src/hooks/use-response-map-capability-coverage.ts
  - src/routes/connector-configuration-form-fields.tsx
  - src/routes/connector-configuration-helper-fields.tsx
  - src/routes/connector-configuration-response-map-capability-coverage-view.tsx
  - src/services/connector-configuration-response-map-capability-coverage.ts
- node: rules/integration/a-connector-configuration-surfaces-readiness-statements-carry-no-claim-no-rule-decides
  conforms: false
  how: 'the fact left part of its ground: still held in src/routes/connector-configuration-form-fields.tsx,
    src/routes/connector-configuration-helper-fields.tsx, and src/routes/connector-configuration-response-map-capability-coverage-view.tsx
    read `nowhere` — The component returns only p, ul and li elements built from imported text functions
    — no button, no onClick, no call gating a submission — so it neither withholds an act nor states any
    claim beyond the four listed statements. — a binding asserts the file answers for the node, so the
    pair that stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/routes/connector-configuration-form-fields.tsx
  - src/routes/connector-configuration-helper-fields.tsx
  - src/routes/connector-configuration-response-map-capability-coverage-view.tsx
- node: rules/integration/a-draft-request-is-offered-only-over-a-named-connector-and-a-chosen-operation
  conforms: false
  how: 'the fact left part of its ground: still held in src/routes/connector-configuration-helper-fields.tsx,
    and src/hooks/use-connector-configuration-helper.ts read `nowhere` — onRequestDraft: () => { requestDraft({
    link, path, method }); }, — invoked unconditionally, with no check of connector, path or method and
    no "waiting on" state exposed — a binding asserts the file answers for the node, so the pair that
    stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/hooks/use-connector-configuration-helper.ts
  - src/routes/connector-configuration-helper-fields.tsx
- node: rules/integration/a-refused-draft-request-states-its-refusal-to-the-operator
  conforms: true
  how: "src/hooks/use-draft-connector-configuration-from-openapi.ts: held at outcomeForRefusal and its\
    \ helpers, which turn each of the three named error codes, and any other code, into the outcome kind\
    \ a consuming surface reads — switch (error.code) {\n    case \"OpenApiDocumentNotFetchedError\":\n\
    \      return outcomeForNotFetchedError(error.details);\n    case \"OpenApiDocumentNotReadableError\"\
    :\n      return { kind: \"openapi-document-not-readable\" };\n    case \"OpenApiOperationNotFoundError\"\
    :\n      return outcomeForOperationNotFoundError(error.details);\n    default:\n      return { kind:\
    \ \"unrecognized-failure\" };\n  }\nsrc/routes/connector-configuration-helper-fields.tsx: held at\
    \ the disclosure.kind === \"refused\" branch — {disclosure.kind === \"refused\" && (<p role=\"alert\"\
    >{disclosure.message}</p>)}\nsrc/services/connector-configuration-draft-disclosure.ts: held at the\
    \ \"refused\" branch of ConnectorConfigurationHelperDisclosureState and the four refusal cases of\
    \ disclosureStateForOutcome — | { readonly kind: \"refused\"; readonly message: string };\ncase \"\
    openapi-document-not-fetched\": return { kind: \"refused\", message: draftNotGeneratedFetchFailureMessage(openApiFetchFailureText(outcome.failure))\
    \ };\ncase \"openapi-document-not-readable\": return { kind: \"refused\", message: DRAFT_NOT_GENERATED_NOT_READABLE_MESSAGE\
    \ };\ncase \"openapi-operation-not-found\": return { kind: \"refused\", message: draftNotGeneratedOperationNotFoundMessage(outcome.method,\
    \ outcome.path) };\ncase \"unrecognized-failure\": return { kind: \"refused\", message: DRAFT_NOT_GENERATED_UNRECOGNIZED_FAILURE_MESSAGE\
    \ };"
  encoded_at:
  - src/hooks/use-draft-connector-configuration-from-openapi.ts
  - src/routes/connector-configuration-helper-fields.tsx
  - src/services/connector-configuration-draft-disclosure.ts
- node: rules/integration/a-refused-operations-read-states-its-refusal-to-the-operator
  conforms: true
  how: 'src/routes/connector-configuration-helper-fields.tsx: held at the operationsReadDisclosure.kind
    === "refused" branch — {operationsReadDisclosure.kind === "refused" && (<p role="alert">{operationsReadDisclosure.message}</p>)}

    src/services/connector-configuration-operations-read-disclosure.ts: held at the three "refused" branches
    of the switch, each returning a distinct message for a distinct named condition — case "openapi-document-not-fetched":
    return { kind: "refused", message: operationsNotListedFetchFailureMessage(openApiFetchFailureText(outcome.failure))
    };

    case "openapi-document-not-readable": case "openapi-document-declares-no-version": return { kind:
    "refused", message: OPERATIONS_NOT_LISTED_NOT_READABLE_MESSAGE };

    case "unrecognized-failure": return { kind: "refused", message: OPERATIONS_NOT_LISTED_UNRECOGNIZED_FAILURE_MESSAGE
    };'
  encoded_at:
  - src/routes/connector-configuration-helper-fields.tsx
  - src/services/connector-configuration-operations-read-disclosure.ts
- node: rules/integration/a-stated-draft-is-marked-stale-once-what-it-was-generated-for-changes
  conforms: true
  how: 'src/hooks/use-connector-configuration-helper.ts: held at draftIsStale, lines 35-49, applied at
    line 80 — statedFor.link !== current.link || statedFor.path !== current.path || statedFor.method !==
    current.method || statedFor.connector !== current.connector

    src/hooks/use-draft-connector-configuration-from-openapi.ts: held at the statedFor field of the hook''s
    return value — statedFor: mutation.variables,

    src/routes/connector-configuration-helper-fields.tsx: held at the stale prop passed through and the
    stale message — stale={state.stale ?? false}

    {stale && <p>{DRAFT_DISCLOSURE_STALE_MESSAGE}</p>}'
  encoded_at:
  - src/hooks/use-connector-configuration-helper.ts
  - src/hooks/use-draft-connector-configuration-from-openapi.ts
  - src/routes/connector-configuration-helper-fields.tsx
- node: rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
  conforms: true
  how: 'src/routes/connector-configuration-form-fields.tsx: held at nowhere — this file states no outcome
    of a submission; it only wires onSubmit — <Button type="submit" form={CONNECTOR_CONFIGURATION_FORM_ID}
    loading={isSubmitting} disabled={isSaveDisabled}>{FORM_SAVE_BUTTON}</Button>'
  encoded_at:
  - src/routes/connector-configuration-form-fields.tsx
- node: rules/integration/an-answered-draft-request-states-its-draft-to-the-operator
  conforms: true
  how: 'src/routes/connector-configuration-helper-fields.tsx: held at the disclosure.kind === "drafted"
    branch and the whole ConnectorConfigurationDraftDisclosure body — {disclosure.kind === "drafted" &&
    (<ConnectorConfigurationDraftDisclosure connector={state.connector ?? ""} draft={disclosure.draft}
    stale={state.stale ?? false} onApply={onApply} />)}

    src/services/connector-configuration-draft-disclosure.ts: held at the "drafted" case of disclosureStateForOutcome,
    delegating to draftDisclosureFrom — case "drafted": return { kind: "drafted", draft: draftDisclosureFrom(outcome.draft)
    };'
  encoded_at:
  - src/routes/connector-configuration-helper-fields.tsx
  - src/services/connector-configuration-draft-disclosure.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'One render per finite vocabulary: an unresolved list carrying all three reasons, asserting
    each states its own name and a pairwise-distinct reason statement; and a reading-notes list carrying
    all nine kinds, asserting each states a non-empty, pairwise-distinct kind statement never equal to
    the raw token.'
- node: rules/integration/an-apply-confirmation-states-what-the-draft-would-change
  conforms: false
  how: 'src/services/connector-configuration-apply-diff.spec.ts, const NESTED_KEYS = ["statusMap", "responseMap",
    "query", "headers"] as const;: const NESTED_KEYS = ["statusMap", "responseMap", "query", "headers"]
    as const; — The four-key vocabulary this node names is already exported from the implementation as
    NESTED_OBJECT_KEYS, but this test re-declares the same four literals independently rather than importing
    that export. If the node''s set of itemised keys ever changes, the implementation''s own constant
    and this spec''s local list are two places that both have to be edited in step.'
  observed_at:
  - src/routes/connector-configuration-form-fields.tsx
  - src/services/connector-configuration-apply-diff.ts
- node: rules/integration/an-http-connector-configuration-declares-its-call
  conforms: true
  how: 'src/services/connector-configuration-http-departures.ts: held at addressDeparture, objectOfTextsDeparture
    and placeholderDepartures — if (typeof address === "string" && address.length > 0) { return null;
    }

    return { kind: "address-absent-or-empty", key: "address" };'
  encoded_at:
  - src/services/connector-configuration-http-departures.ts
- node: rules/integration/an-http-connector-configuration-declares-its-method-and-status-vocabulary
  conforms: false
  how: "src/services/connector-configuration-http-departures.spec.ts, the describe/it block \"an absent\
    \ method key states no method departure (the task's own resolved reading of criterion 1)\": describe(\"\
    computeHttpConnectorDepartures -- an absent method key states no method departure (the task's own\
    \ resolved reading of criterion 1)\", () => {\n  it(\"returns no departures for an otherwise well-formed\
    \ configuration declaring no method key at all\", () => { const departures = departuresFor(withoutKey(baseConfig(),\
    \ \"method\")); expect(departures).toEqual([]); });\n}); — The node states an observation reaching\
    \ a configuration lacking any of the three (method, responseMap, statusMap) issues no call and ends\
    \ unavailable — treating an absent method exactly as it treats an absent responseMap or statusMap,\
    \ both of which this same file DOES assert as departures. By instead asserting zero departures for\
    \ an absent method, an operator who leaves out statusMap/responseMap/address is warned but one who\
    \ leaves out method is not.\nsrc/services/connector-configuration-http-departures.ts, methodDeparture:\
    \ function methodDeparture(configuration: Record<string, unknown>): HttpConnectorDeparture | null\
    \ {\n  if (!(\"method\" in configuration)) { return null; } — an-http-connector-configuration-declares-its-method-and-status-vocabulary\
    \ requires method, responseMap and statusMap alike, stating that an observation reaching a configuration\
    \ lacking any of the three issues no call and ends unavailable with a MalformedHttpConnectorConfigurationError.\
    \ statusMapDepartures and responseMapDeparture both report a departure when their own key is absent,\
    \ but methodDeparture returns null — no departure — when the method key is missing entirely."
  observed_at:
  - src/services/connector-configuration-http-departures.ts
- node: rules/integration/an-openapi-operations-method-is-upper-cased
  conforms: false
  how: "src/routes/connector-configuration-helper-fields-operation-select.spec.ts, the describe block\
    \ \"a listed operation's method is not upper-cased when the state's own entry names it lower-case\
    \ (UNDERDETERMINED, from rules/integration/an-openapi-operations-method-is-upper-cased)\": describe(\"\
    ...UNDERDETERMINED, from rules/integration/an-openapi-operations-method-is-upper-cased)\", () => {\n\
    \  it(\"states the method upper-cased on the option regardless of the case the entry itself holds\"\
    , () => {\n    renderFields(stateWith({ operations: [operation(\"/items\", \"get\")] }));\n    expect(label).toContain(\"\
    GET\");\n  });\n}); — The candidate node an-openapi-operations-method-is-upper-cased already settles\
    \ this as an invariant, and this file's own assertion enforces exactly that. The describe title nonetheless\
    \ calls the behavior \"UNDERDETERMINED\" and says the method \"is not upper-cased\" — a reader who\
    \ trusts the label is told the specification leaves this open and that the code does the opposite\
    \ of what it actually does."
  observed_at:
  - src/routes/connector-configuration-helper-fields.tsx
- node: rules/integration/an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  conforms: true
  how: 'src/services/connector-configuration-operations-read-disclosure.ts: held at the separation between
    the "openapi-document-not-fetched" case and the combined "openapi-document-not-readable"/"openapi-document-declares-no-version"
    case — case "openapi-document-not-fetched": return { kind: "refused", message: operationsNotListedFetchFailureMessage(openApiFetchFailureText(outcome.failure))
    };

    case "openapi-document-not-readable": case "openapi-document-declares-no-version": return { kind:
    "refused", message: OPERATIONS_NOT_LISTED_NOT_READABLE_MESSAGE };'
  encoded_at:
  - src/services/connector-configuration-operations-read-disclosure.ts
- node: rules/integration/an-unsaved-edit-is-not-overwritten-by-applying-a-draft-without-confirmation
  conforms: true
  how: "src/routes/connector-configuration-form-fields.tsx: held at handleApply, the confirmation Dialog\
    \ and handleConfirmApply — function handleApply(configurationText: string): void {\n  if (!hasUnsavedEdit)\
    \ { configuration.onChange(configurationText, true); return; }\n  setPendingApplyText(configurationText);\n\
    }"
  encoded_at:
  - src/routes/connector-configuration-form-fields.tsx
- node: rules/integration/applying-a-drafted-configuration-changes-only-the-local-edit
  conforms: true
  how: "src/routes/connector-configuration-form-fields.tsx: held at handleApply and handleConfirmApply,\
    \ both calling only configuration.onChange — function handleConfirmApply(): void {\n  if (pendingApplyText\
    \ !== null) { configuration.onChange(pendingApplyText, true); }\n  setPendingApplyText(null);\n}\n\
    src/routes/connector-configuration-helper-fields.tsx: held at the Apply button, which forwards the\
    \ draft's configuration text through the onApply callback — <Button type=\"button\" onClick={() =>\
    \ onApply(draft.configuration)}>{DRAFT_DISCLOSURE_APPLY_BUTTON}</Button>\nsrc/routes/connector-configuration-helper.tsx:\
    \ held at the onApply prop's type, which admits only a configuration text string — readonly onApply:\
    \ (configurationText: string) => void;\n"
  encoded_at:
  - src/routes/connector-configuration-form-fields.tsx
  - src/routes/connector-configuration-helper-fields.tsx
  - src/routes/connector-configuration-helper.tsx
- node: rules/integration/no-operations-read-refusal-is-stated-before-the-operation-answers
  conforms: true
  how: 'src/services/connector-configuration-operations-read-disclosure.ts: held at the "idle" and "pending"
    cases, which return before any refusal case is reached — case "idle": return { kind: "none" };

    case "pending": return { kind: "pending" };'
  encoded_at:
  - src/services/connector-configuration-operations-read-disclosure.ts
- node: rules/integration/the-configuration-helper-states-an-operations-read-outstanding-and-a-document-declaring-no-operation
  conforms: true
  how: 'src/routes/connector-configuration-helper-fields.tsx: held at the operationsReadDisclosure "pending"
    and "empty" branches — {operationsReadDisclosure.kind === "pending" && (<p>{OPERATIONS_READ_PENDING_MESSAGE}</p>)}

    {operationsReadDisclosure.kind === "empty" && (<p>{OPERATIONS_READ_EMPTY_MESSAGE}</p>)}

    src/services/connector-configuration-operations-read-disclosure.ts: held at the "pending" case and
    the "operations" case''s length check — case "pending": return { kind: "pending" };

    case "operations": return outcome.operations.length === 0 ? { kind: "empty" } : { kind: "none" };'
  encoded_at:
  - src/routes/connector-configuration-helper-fields.tsx
  - src/services/connector-configuration-operations-read-disclosure.ts
  decided_by: reading
  remainder: testable
  remainder_why: One input per remaining failure-kind variant of the not-fetched refusal, asserted distinct
    from both statements and from every other refusal variant, disclosed as an alert.
- node: scenarios/integration/a-response-map-key-the-capability-does-not-read-is-stated-beside-the-field-it-expects
  conforms: true
  how: 'src/routes/connector-configuration-response-map-capability-coverage-view.tsx: held at the same
    keyStatements/expectedFieldStatements rendering as above — statement.kind === "read" ? (<li>{responseMapKeyReadText(...)}</li>)
    : (<li>{responseMapKeyReadByNoneText(...)}</li>)

    <li>{responseMapExpectedFieldText(statement.capabilityLabel, statement.fieldName)}</li>

    src/services/connector-configuration-response-map-capability-coverage.ts: held at the same key/expected-field
    computation — const readingCapabilityLabels = capabilityPropertyNames.filter((entry) => entry.propertyNames.has(key)).map((entry)
    => entry.label);

    if (readingCapabilityLabels.length === 0) { return { kind: "read-by-none", key }; }'
  encoded_at:
  - src/routes/connector-configuration-response-map-capability-coverage-view.tsx
  - src/services/connector-configuration-response-map-capability-coverage.ts
  decided_by: reading
  remainder: testable
  remainder_why: Render the authoring surface with a capability registered under the right connector alongside
    one registered under a different connector, and assert the three statements render, positioned beside
    the Configuration field, with the unrelated capability contributing nothing.
- node: scenarios/integration/a-status-map-ending-outside-the-vocabulary-is-stated-before-the-write
  conforms: true
  how: 'src/routes/connector-configuration-form-fields.tsx: held at the same httpConnectorDepartures wiring
    as its subject rule — <HttpConnectorDeparturesStatement departures={httpConnectorDepartures} />

    src/services/connector-configuration-http-departures.ts: held at statusMapDepartures — departures.push({
    kind: "status-map-ending-outside-vocabulary", key: "statusMap", statusMapKey, value, admittedEndings:
    HTTP_CONNECTOR_STATUS_MAP_ENDINGS });'
  encoded_at:
  - src/routes/connector-configuration-form-fields.tsx
  - src/services/connector-configuration-http-departures.ts
  decided_by: reading
  remainder: testable
  remainder_why: The same input, asserted against literal text spelled in the test itself (200, "lies
    outside the vocabulary", and the four ending names ok/denied/timeout/unavailable) rather than read
    from the production formatter/constant.
- node: scenarios/integration/an-answered-draft-is-stated-with-its-readings-and-its-notes
  conforms: true
  how: 'src/routes/connector-configuration-helper-fields.tsx: held at the same status-readings, response-fields
    and reading-notes sections — {draft.statusReadings.length > 0 && (<section>{DRAFT_DISCLOSURE_STATUS_READINGS_LABEL}</section>)}

    {draft.responseFields.length > 0 && (<section>{DRAFT_DISCLOSURE_RESPONSE_FIELDS_LABEL}</section>)}

    src/services/connector-configuration-draft-disclosure.ts: held at the statusReadings, responseFields
    and readingNotes mappings, and the direct pass-through of methodMismatch — methodMismatch: draft.method_mismatch,

    statusReadings: (draft.status_readings ?? []).map((reading) => ({ status: reading.status, ending:
    reading.ending, declaredAs: reading.declared_as })),'
  encoded_at:
  - src/routes/connector-configuration-helper-fields.tsx
  - src/services/connector-configuration-draft-disclosure.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'One assertion per remaining clause: an answer with seven response fields each stated
    with name/path/status/envelope; an answer with a reading note stated by kind and subject, distinguishable
    from a different note''s kind; and a render of the field-owning component showing the field''s content
    is unchanged across the answer''s arrival.'
- node: scenarios/integration/an-operation-is-chosen-from-the-fetched-documents-listing
  conforms: true
  how: 'src/hooks/use-connector-configuration-helper.ts: held at onChooseOperation, lines 68-71 — onChooseOperation:
    (operation) => { setPath(operation.path); setMethod(operation.method); },'
  encoded_at:
  - src/hooks/use-connector-configuration-helper.ts
- node: scenarios/integration/applying-a-draft-over-an-unsaved-edit-asks-for-confirmation
  conforms: true
  how: 'src/routes/connector-configuration-form-fields.tsx: held at the same handleApply/Dialog flow as
    its subject rule — <Dialog open={pendingApplyText !== null} onOpenChange={(open) => { if (!open) {
    setPendingApplyText(null); } }}>'
  encoded_at:
  - src/routes/connector-configuration-form-fields.tsx
unstated:
- file: src/hooks/use-draft-connector-configuration-from-openapi.ts
  where: the isDispatchingRef guard inside requestDraft, lines 211-218
  evidence: "const requestDraft = (request: DraftConnectorConfigurationFromOpenApiRequest): void => {\n\
    \    if (isDispatchingRef.current) {\n      return;\n    }\n    isDispatchingRef.current = true;\n\
    \n    mutation.reset();"
  cost: 'An operator who invokes requestDraft again while an earlier draft request for this same helper
    is still outstanding has the second request silently dropped: no call reaches the backend, isDispatchingRef.current
    stays true until the first call''s onSettled fires, and nothing in the returned outcome or statedFor
    changes to tell the operator their second click did nothing. The node this file otherwise implements
    says only that what a surface states while a draft request is outstanding "is not decided here" —
    so the choice to drop rather than queue, replace or refuse a repeated request was made here, in code,
    and the specification is silent on it.'
- file: src/routes/connector-configuration-form-fields-subject-placeholder-statements.spec.ts
  where: the third describe block ("the subject-placeholder statement is read from the capability list
    this area already holds, adding no second registry read (criterion 5)") and its single test
  evidence: "it(\"issues a single request to the capability registry despite repeated edits to the Configuration\
    \ field\", async () => {\n  const fetchMock = await mountWithCapabilities([capability()]);\n  await\
    \ typeConnector(CONNECTOR);\n  await typeConfiguration(JSON.stringify({ address: \"${subject:account-id}\"\
    \ }));\n  await screen.findByText(subjectPlaceholderDeclaredText(\"account-id\"));\n  await typeConfiguration(JSON.stringify({\
    \ address: \"${subject:account-id}\", extra: \"x\" }));\n  await screen.findByText(subjectPlaceholderDeclaredText(\"\
    account-id\"));\n  const capabilitiesCalls = fetchMock.mock.calls.filter(\n    ([input]) => (typeof\
    \ input === \"string\" ? input : input.toString()) === CAPABILITIES_PATH,\n  );\n  expect(capabilitiesCalls).toHaveLength(1);\n\
    });"
  cost: This pins a specific caching/consistency guarantee — that the capability registry is read once
    and reused across every edit to the Configuration field — as a binding behavioral contract. Neither
    this node pack nor a specification-wide search surfaces any node that requires this. A future implementer
    who re-reads the registry on each edit would be breaking a guarantee that exists only in this test
    file, with no specification account of why it holds or how far it may be relaxed.
- file: src/routes/connector-configuration-helper-fields-independent-content-and-staleness.spec.ts
  where: describe block "a stale drafted disclosure clears the moment a new request begins (UNDERDETERMINED
    note 3)"
  evidence: 'expect(screen.getByText(DISTINCTIVE_CONFIGURATION_TEXT)).toBeTruthy();

    expect(screen.queryByText(DISTINCTIVE_CONFIGURATION_TEXT)).toBeNull();

    expect(screen.getByText("Rascunhando a configuração do conector…")).toBeTruthy();

    expect(screen.queryByRole("alert")).toBeNull();'
  cost: The test fixes, as a passing assertion, exactly what the surface presents once a new draft request
    begins over an earlier answered draft. Two nodes touching this file both say this is not decided ("What
    that surface states while a draft request is outstanding is not decided here"). A future node deciding
    this differently would leave this test the one place disagreeing with the specification.
- file: src/routes/connector-configuration-helper-fields-independent-content-and-staleness.spec.ts
  where: describe block "a stale refusal clears the moment a new request begins (UNDERDETERMINED note
    3)"
  evidence: 'expect(screen.getByRole("alert")).toBeTruthy();

    expect(screen.queryByRole("alert")).toBeNull();

    expect(screen.getByText("Rascunhando a configuração do conector…")).toBeTruthy();'
  cost: Same gap as the sibling block above, over a refused rather than an answered draft request.
- file: src/routes/connector-test-panel-subject-and-attributes.spec.ts
  where: describe block "requester is collected as a plain free-text field (disclosed inference)", its
    one test
  evidence: 'const requesterInput = within(dialog).getByLabelText<HTMLInputElement>("Requester");

    expect(requesterInput.tagName).toBe("INPUT");

    expect(requesterInput.getAttribute("role")).not.toBe("combobox");

    fireEvent.change(requesterInput, { target: { value: "operator@example.com" } });

    expect(requesterInput.value).toBe("operator@example.com");'
  cost: The file fixes, as a fact about the connector-test operation, that a test's requester is collected
    from the operator as an unverified, freely-typed string. The specification closes this exact question
    by name for a diagnose and for a simulation, but rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
    — the one rule that states everything the test-connector action assembles — names only Subject attributes
    and never mentions a requester at all, though an-http-connector-configuration-declares-its-call admits
    a ${requester} placeholder in the same call.
- file: src/services/connector-configuration-apply-diff.ts
  where: the draftObject === null branch inside computeApplyConfirmationDiff
  evidence: 'const draftObject = parseJsonObject(draftText);

    if (draftObject === null) { return { kind: "not-itemisable" }; }'
  cost: an-apply-confirmation-states-what-the-draft-would-change conditions "cannot be itemized" solely
    on the field's own content failing to be well-formed, and a-connector-configuration-drafts-configuration-is-well-formed-object-text
    declares a draft's configuration is always well-formed — so no node describes what should happen if
    the draft's own text ever failed to parse. This branch folds that unaddressed case into the same "not-itemisable"
    outcome as an ordinary malformed edit.
- file: src/services/connector-configuration-http-departures.spec.ts
  where: the describe/it block "a statusMap key that is not a valid HTTP-status-shaped string draws no
    departure of its own"
  evidence: "describe(\"computeHttpConnectorDepartures -- a statusMap key that is not a valid HTTP-status-shaped\
    \ string draws no departure of its own, only its ending value is judged (the task's own resolved reading)\"\
    , () => {\n  it(\"returns no departures for a statusMap entry keyed 'notAStatus' whose value is an\
    \ admitted ending\", () => { const departures = departuresFor(baseConfig({ statusMap: { notAStatus:\
    \ \"ok\" } })); expect(departures).toEqual([]); });\n});"
  cost: The vocabulary node says nothing about what to do when a statusMap key is not itself shaped like
    an HTTP status; this test asserts a specific resolution and its own title concedes it is "the task's
    own resolved reading" rather than something any node states.
- file: src/services/connector-configuration-messages.spec.ts
  where: the comment claiming criterion-3 coverage and the describe/it block asserting every INVENTORY
    entry
  evidence: '// proving criterion 3 ("every message the module holds is written in pt-BR") over the module''s
    whole, finite inventory, not a sample of it.

    it.each(INVENTORY)("%s is non-empty and carries its expected pt-BR wording", (_label, value, expectedFragment)
    => { expect(value.length).toBeGreaterThan(0); expect(value).toContain(expectedFragment); });'
  cost: Every INVENTORY entry is asserted against a Portuguese fragment, making "the operator-facing vocabulary
    is authored in Brazilian Portuguese" a hard requirement — yet no node in the specification states
    any language or locale requirement for these surfaces.
unbound:
- src/hooks/use-connector-configuration-helper-stale-draft-marking.spec.ts
- src/hooks/use-draft-connector-configuration-from-openapi-reading-parts.spec.ts
- src/hooks/use-draft-connector-configuration-from-openapi-stale-draft-marking.spec.ts
- src/hooks/use-draft-connector-configuration-from-openapi.spec.ts
- src/routes/connector-configuration-create-screen-cancel.spec.ts
- src/routes/connector-configuration-create-screen-outcome.spec.ts
- src/routes/connector-configuration-create-screen-save.spec.ts
- src/routes/connector-configuration-create-screen.spec.ts
- src/routes/connector-configuration-detail-ready-view-cancel.spec.ts
- src/routes/connector-configuration-detail-ready-view-forwards-configuration-text.spec.ts
- src/routes/connector-configuration-detail-ready-view-order.spec.ts
- src/routes/connector-configuration-detail-screen-cached-load.spec.ts
- src/routes/connector-configuration-detail-screen-discard.spec.ts
- src/routes/connector-configuration-detail-screen-footer-portal.spec.ts
- src/routes/connector-configuration-detail-screen-listing-route.spec.ts
- src/routes/connector-configuration-detail-screen-outcome.spec.ts
- src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
- src/routes/connector-configuration-detail-screen-save.spec.ts
- src/routes/connector-configuration-detail-screen.spec.ts
- src/routes/connector-configuration-form-fields-action-footer.spec.ts
- src/routes/connector-configuration-form-fields-apply-confirmation-diff.spec.ts
- src/routes/connector-configuration-form-fields-configuration-entry-guidance.spec.ts
- src/routes/connector-configuration-form-fields-credential-placeholder-statement.spec.ts
- src/routes/connector-configuration-form-fields-http-departure-statements.spec.ts
- src/routes/connector-configuration-form-fields-response-map-capability-coverage.spec.ts
- src/routes/connector-configuration-form-fields-subject-placeholder-statements.spec.ts
- src/routes/connector-configuration-form-fields-submission-withheld-only-on-well-formedness.spec.ts
- src/routes/connector-configuration-helper-fields-apply.spec.ts
- src/routes/connector-configuration-helper-fields-draft-request-gate.spec.ts
- src/routes/connector-configuration-helper-fields-independent-content-and-staleness.spec.ts
- src/routes/connector-configuration-helper-fields-operation-select.spec.ts
- src/routes/connector-configuration-helper-fields-operations-read-disclosure.spec.ts
- src/routes/connector-configuration-helper-fields-reading-notes.spec.ts
- src/routes/connector-configuration-helper-fields-response-fields.spec.ts
- src/routes/connector-configuration-helper-fields-response-map-capability-coverage.spec.ts
- src/routes/connector-configuration-helper-fields-stale-draft-marking.spec.ts
- src/routes/connector-configuration-helper-fields-submission-withheld-only-on-well-formedness.spec.ts
- src/routes/connector-configuration-helper-fields.spec.ts
- src/routes/connector-configuration-http-connector-departures-view.tsx
- src/routes/connector-test-panel-attribute-reconciliation.spec.ts
- src/routes/connector-test-panel-capability-picker.spec.ts
- src/routes/connector-test-panel-fields.spec.ts
- src/routes/connector-test-panel-subject-and-attributes.spec.ts
- src/services/connector-configuration-apply-diff.spec.ts
- src/services/connector-configuration-credential-placeholder-statements.spec.ts
- src/services/connector-configuration-draft-disclosure-reading-notes.spec.ts
- src/services/connector-configuration-draft-disclosure-response-fields.spec.ts
- src/services/connector-configuration-draft-disclosure.spec.ts
- src/services/connector-configuration-http-departures.spec.ts
- src/services/connector-configuration-messages-consumption.spec.ts
- src/services/connector-configuration-messages.spec.ts
- src/services/connector-configuration-operations-read-disclosure.spec.ts
- src/services/connector-configuration-response-map-capability-coverage.spec.ts
- src/services/connector-configuration-subject-placeholder-statements.spec.ts
notes: "Judged by 75 delegation(s), one per file; folded mechanically by trace.py --fold from the returns\
  \ under siegard-reconcile/connector-configuration-draft-status-response-maps-frontend.returns/.\nCertification\
  \ of domain/integration/connector-configuration-draft-reading-note did not hold: the auditor answered\
  \ `partial` — The attribute half (kind, subject, detail presence) is exercised. What each subject names,\
  \ and what each detail carries, is unexercised -- both files pass subject/detail through from their\
  \ own fixtures, including fixtures that contradict the node's own subject/detail rules without failing\
  \ any assertion.. The node is decided by reading, and a certification standing on it from an earlier\
  \ reconciliation is released by the bind. The remainder is testable: Assertions over drafted notes at\
  \ each of the node's subject-determining conditions (operation-as-a-whole vs. response key/property/field),\
  \ and over the repeated-field-name detail naming the actual path not taken..\nCertification of domain/integration/connector-configuration-draft-reading-note-kind\
  \ did not hold: the auditor answered `partial` — Admission of the nine values, and their distinct downstream\
  \ recognition, is proven. Closure (\"no kind outside them\") is not exercised at runtime -- the \"refuses\
  \ a tenth kind\" assertion is a tautology on a literal (typeof check), and closure would only bind if\
  \ the suite's own test step also typechecks, which the offered proof does not establish. What each of\
  \ the nine values actually means (which drafting condition earns which kind) is also unexercised; both\
  \ proof files inject already-formed notes rather than driving the drafting decision.. The node is decided\
  \ by reading, and a certification standing on it from an earlier reconciliation is released by the bind.\
  \ The remainder is testable: A runtime set-equality assertion over the implementation's own kind-to-label\
  \ projection keys against the nine, so a tenth added upstream fails without editing the test; plus one\
  \ drafted operation per kind asserting the note emitted names the subject the node describes..\nCertification\
  \ of domain/integration/connector-configuration-draft-response-field did not hold: the auditor answered\
  \ `partial` — The six attributes are exercised whole in both directions. Two parts go unexercised: that\
  \ the field is drafted as one responseMap entry (name as key, path as value) -- no fixture holds a responseMap\
  \ at all; and that type/required/envelope are read by no observation, a negative not covered by the\
  \ disclosure-boundary tests offered.. The node is decided by reading, and a certification standing on\
  \ it from an earlier reconciliation is released by the bind. The remainder is untestable: The responseMap\
  \ correspondence is testable with one assertion; \"read by no observation\" is a totality over every\
  \ observation in the system and cannot be closed by a finite test..\nCertification of domain/integration/connector-configuration-draft-status-reading\
  \ did not hold: the auditor answered `partial` — Presence and carriage of status/ending/declared_as\
  \ is exercised. That ending is typed as an evidence-result is not -- the two files together use four\
  \ mutually distinct ending strings with no assertion constraining the vocabulary. The pairing (ending\
  \ mapped from the draft's own statusMap for that status) is also unexercised -- both proofs fabricate\
  \ readings beside a configuration with no statusMap at all.. The node is decided by reading, and a certification\
  \ standing on it from an earlier reconciliation is released by the bind. The remainder is testable:\
  \ A type-level refusal assertion for an ending outside the evidence-result vocabulary (mirroring the\
  \ reading-note-kind proof's own pattern), plus one drafted case pairing a statusMap-declared ending\
  \ with its status and asserting the disclosed reading matches it..\nCertification of domain/integration/connector-configuration-draft-unresolved-item\
  \ did not hold: the auditor answered `partial` — The pairing the node states -- one name carried beside\
  \ one reason -- is exercised. Three stated parts go unexercised: the name is not proven to come exactly\
  \ from the OpenAPI document itself (every draft is a literal fixture); neither attribute's required-ness\
  \ is exercised (no test omits name or reason); and the fallback test establishes tolerance of an out-of-vocabulary\
  \ reason rather than exercising the typing itself.. The node is decided by reading, and a certification\
  \ standing on it from an earlier reconciliation is released by the bind. The remainder is testable:\
  \ Three assertions close it: an item whose name is the document's own parameter/scheme name character\
  \ for character; an item with an out-of-vocabulary reason expected to be refused rather than disclosed;\
  \ and items missing name or missing reason, each expected refused..\nCertification of domain/integration/connector-configuration-draft-unresolved-reason\
  \ did not hold: the auditor answered `partial` — Only the closure (a value outside the three falls back)\
  \ is bound. Membership of the three named values is not: dropping one of the three still yields distinct\
  \ labels, so the distinctness test would still pass. What each of the three values means (which condition\
  \ yields which value) is wholly unexercised.. The node is decided by reading, and a certification standing\
  \ on it from an earlier reconciliation is released by the bind. The remainder is testable: A set-equality\
  \ assertion over the three values against their own raw strings, plus one drafted case per condition\
  \ (no capability registered, security scheme not reducible, key already occupied) each expecting its\
  \ corresponding named value..\nCertification of rules/integration/a-connector-configuration-entry-states-what-the-http-connector-reads-from-it\
  \ did not hold: the auditor answered `partial` — The shape is exercised (four items, in order, unconditional).\
  \ The content is not: both assertions compare against the application's own message constants, so expected\
  \ and actual move together -- if a message stopped stating its claim, the list would still equal the\
  \ constants and pass.. The node is decided by reading, and a certification standing on it from an earlier\
  \ reconciliation is released by the bind. The remainder is testable: Four literal-text assertions, one\
  \ per guidance item, over what each item actually says rather than over the constants that produce it..\n\
  Certification of rules/integration/a-connector-configuration-placeholder-is-written-in-one-of-three-forms\
  \ did not hold: the auditor answered `partial` — The admitting half of the fact is exercised whole:\
  \ both tests submit ${subject:accountId}, ${requester} and ${credential:api-key} and assert no departure\
  \ is stated over any of them. The excluding half is exercised only for a kind outside the three -- ${not-a-form}\
  \ -- and the node states more than the kind: it states the argument each kind carries. Nothing in the\
  \ offered proof submits ${requester:anything}, a bare ${subject}/${subject:}, or a bare ${credential}/${credential:},\
  \ so those parts of the fact go unexercised. A surface that read only the kind token and ignored the\
  \ argument entirely would pass every assertion in this file.. The node is decided by reading, and a\
  \ certification standing on it from an earlier reconciliation is released by the bind. The remainder\
  \ is testable: The remainder is the table over the malformed-argument pairings the offered tests leave\
  \ out: ${requester:anything}, a bare ${subject}, and a bare ${credential}, each against a placeholder-outside-forms\
  \ departure naming that exact placeholder text. Three inputs close the fact whole..\nCertification of\
  \ rules/integration/a-connector-configuration-surface-promises-no-check-of-a-credential-placeholders-resolution\
  \ did not hold: the auditor answered `partial` — Presence-per-placeholder and the withholding behavior\
  \ are exercised. The statement's actual wording is not: every content assertion compares against the\
  \ production message generator itself, so expected and actual move together -- the message could drop\
  \ any of its three claims and every test would still pass.. The node is decided by reading, and a certification\
  \ standing on it from an earlier reconciliation is released by the bind. The remainder is testable:\
  \ Assert the literal expected text (not via the generator) for two distinct embedded credential names,\
  \ each naming its own credential, each stating server-side resolution and each stating it is checked\
  \ by nothing on the surface..\nCertification of rules/integration/a-draft-request-is-offered-only-over-a-named-connector-and-a-chosen-operation\
  \ did not hold: the auditor answered `partial` — The connector half is exercised whole (empty, whitespace,\
  \ and named). The operation half is exercised only at its two extremes (both empty, both held) -- a\
  \ half-given pairing (path held, method empty, or vice versa) is unexercised, and the pairing is never\
  \ bound to the fetched document's listing (the enabled case carries an empty operations array).. The\
  \ node is decided by reading, and a certification standing on it from an earlier reconciliation is released\
  \ by the bind. The remainder is testable: A half-given path/method pairing expecting the operation-waiting\
  \ statement; and a chosen pairing absent from the fetched listing expecting the act withheld, against\
  \ the same pairing present in the listing expecting it enabled..\nCertification of rules/integration/an-answered-draft-request-states-its-draft-to-the-operator\
  \ did not hold: the auditor answered `partial` — Configuration text, status readings, response fields,\
  \ generated credentials, and both halves of method mismatch are exercised with failing assertions on\
  \ omission. Unexercised: the three unresolved reasons distinguished pairwise (only one reason value\
  \ is ever rendered); reading notes' kind stated at all and distinguished pairwise (only subject/detail\
  \ absence is asserted, not the kind label itself); and the Configuration field's content being unchanged\
  \ across the answer's arrival (deferred to a sibling node, not tested here).. The node is decided by\
  \ reading, and a certification standing on it from an earlier reconciliation is released by the bind.\
  \ The remainder is testable: One render per finite vocabulary: an unresolved list carrying all three\
  \ reasons, asserting each states its own name and a pairwise-distinct reason statement; and a reading-notes\
  \ list carrying all nine kinds, asserting each states a non-empty, pairwise-distinct kind statement\
  \ never equal to the raw token..\nCertification of rules/integration/the-configuration-helper-states-an-operations-read-outstanding-and-a-document-declaring-no-operation\
  \ did not hold: the auditor answered `partial` — Both halves the node states are exercised by exact\
  \ text, each apart from the other and apart from three named refusal variants. Unexercised: the not-fetched\
  \ refusal's other failure-kind variants are never instantiated, so a collision between one of them and\
  \ either statement would not be caught; and the five-outcome enumeration is drawn from the state type\
  \ rather than from the refusal node itself.. The node is decided by reading, and a certification standing\
  \ on it from an earlier reconciliation is released by the bind. The remainder is testable: One input\
  \ per remaining failure-kind variant of the not-fetched refusal, asserted distinct from both statements\
  \ and from every other refusal variant, disclosed as an alert..\nCertification of scenarios/integration/a-response-map-key-the-capability-does-not-read-is-stated-beside-the-field-it-expects\
  \ did not hold: the auditor answered `partial` — The three then-clauses are exercised as pure data.\
  \ Two parts are unexercised: the \"when\" -- capabilities registered naming the connector -- is never\
  \ actually filtered by connector in any test; and the \"surface states... beside the field\" half is\
  \ never rendered -- no test mounts the authoring surface, so whether the statement reaches the operator,\
  \ and where, is unproven.. The node is decided by reading, and a certification standing on it from an\
  \ earlier reconciliation is released by the bind. The remainder is testable: Render the authoring surface\
  \ with a capability registered under the right connector alongside one registered under a different\
  \ connector, and assert the three statements render, positioned beside the Configuration field, with\
  \ the unrelated capability contributing nothing..\nCertification of scenarios/integration/a-status-map-ending-outside-the-vocabulary-is-stated-before-the-write\
  \ did not hold: the auditor answered `partial` — The \"act stays offered\" then-clause is exercised\
  \ whole. The \"names the ending outside the vocabulary and the four admitted endings\" then-clause is\
  \ only exercised as to presence: the expected text is computed via the same production formatter and\
  \ constant the surface itself uses, so a change to the formatter's wording or to the vocabulary constant\
  \ leaves expected and actual moving together and the test still green.. The node is decided by reading,\
  \ and a certification standing on it from an earlier reconciliation is released by the bind. The remainder\
  \ is testable: The same input, asserted against literal text spelled in the test itself (200, \"lies\
  \ outside the vocabulary\", and the four ending names ok/denied/timeout/unavailable) rather than read\
  \ from the production formatter/constant..\nCertification of scenarios/integration/an-answered-draft-is-stated-with-its-readings-and-its-notes\
  \ did not hold: the auditor answered `partial` — Three of six then-clauses are exercised (configuration\
  \ text, three status readings, no-method-mismatch). Unexercised: response fields (every fixture leaves\
  \ them empty); the reading note (likewise empty in every fixture, and its distinguishing \"apart from\
  \ every other kind\" clause untested); and the Configuration field's content before/after the answer\
  \ arrives (this file never renders that field at all). One gap inside an exercised clause: declared_as\
  \ is supplied only for the 200 reading, not for 403/503.. The node is decided by reading, and a certification\
  \ standing on it from an earlier reconciliation is released by the bind. The remainder is testable:\
  \ One assertion per remaining clause: an answer with seven response fields each stated with name/path/status/envelope;\
  \ an answer with a reading note stated by kind and subject, distinguishable from a different note's\
  \ kind; and a render of the field-owning component showing the field's content is unchanged across the\
  \ answer's arrival..\nStaged by a review over files a delivery wrote: no pair was omitted, so the delivery's\
  \ own claims and every other binding of these files were judged alike; the plan's node(s) constraints/the-openapi-document-is-fetched-by-the-backend,\
  \ contracts/integration/connector-configuration-draft, domain/integration/connector-configuration, domain/integration/connector-configuration-draft,\
  \ domain/integration/connector-configuration-draft-reading-note, domain/integration/connector-configuration-draft-reading-note-kind,\
  \ domain/integration/connector-configuration-draft-response-field, domain/integration/connector-configuration-draft-status-reading,\
  \ domain/integration/connector-configuration-draft-unresolved-item, domain/integration/connector-configuration-draft-unresolved-reason,\
  \ domain/integration/openapi-document-operations, rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing,\
  \ rules/integration/a-connector-configuration-draft-response-carries-no-capability, rules/integration/a-connector-configuration-drafts-configuration-is-well-formed-object-text,\
  \ rules/integration/a-connector-configuration-entry-states-what-the-http-connector-reads-from-it, rules/integration/a-connector-configuration-placeholder-is-written-in-one-of-three-forms,\
  \ rules/integration/a-connector-configuration-surface-offers-no-submission-while-its-content-is-not-well-formed,\
  \ rules/integration/a-connector-configuration-surface-promises-no-check-of-a-credential-placeholders-resolution,\
  \ rules/integration/a-connector-configuration-surface-states-a-subject-placeholder-no-registered-capability-declares,\
  \ rules/integration/a-connector-configuration-surface-states-what-the-http-connector-would-refuse-in-its-configuration-fields-content,\
  \ rules/integration/a-connector-configuration-surface-states-which-response-map-keys-a-registered-capability-reads,\
  \ rules/integration/a-connector-configuration-surfaces-readiness-statements-carry-no-claim-no-rule-decides,\
  \ rules/integration/a-draft-request-is-offered-only-over-a-named-connector-and-a-chosen-operation, rules/integration/a-stated-draft-is-marked-stale-once-what-it-was-generated-for-changes,\
  \ rules/integration/an-answered-draft-request-states-its-draft-to-the-operator, rules/integration/an-apply-confirmation-states-what-the-draft-would-change,\
  \ rules/integration/an-http-connector-configuration-declares-its-call, rules/integration/an-http-connector-configuration-declares-its-method-and-status-vocabulary,\
  \ rules/integration/an-unsaved-edit-is-not-overwritten-by-applying-a-draft-without-confirmation, rules/integration/the-configuration-helper-states-an-operations-read-outstanding-and-a-document-declaring-no-operation,\
  \ scenarios/integration/a-response-map-key-the-capability-does-not-read-is-stated-beside-the-field-it-expects,\
  \ scenarios/integration/a-status-map-ending-outside-the-vocabulary-is-stated-before-the-write, scenarios/integration/an-answered-draft-is-stated-with-its-readings-and-its-notes\
  \ were read on every file and answered for, and bound from nowhere here — a binding this record writes\
  \ is one the trace already held.\nA finding in src/routes/connector-configuration-create-screen.spec.ts\
  \ names rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing, which no\
  \ file of this set is bound to: the describe block title, line 91: describe(\"ConnectorConfigurationCreateScreen\
  \ -- the footer Connectors link registers nothing before it navigates (UNDERDETERMINED note: a-connector-configuration-surface-offers-a-route-to-the-listing\
  \ leaves open whether the route submits before landing on the listing)\", () => { — A reader of this\
  \ suite who trusts the parenthetical will believe the specification leaves open whether the Connectors-link\
  \ route may still issue a register-connector call once it has landed on the listing — but the node the\
  \ comment names, read directly, forecloses any register-connector call from this route at all, before\
  \ or after: \"taking that route registers nothing and alters no registered configuration\" and \"Following\
  \ that route from s issues no register-connector call and leaves every registered connector configuration\
  \ exactly as it stood.\" Nothing is left open for a later request to settle differently.. It blocks\
  \ nothing here; it is owed a route of its own.\nA finding in src/routes/connector-test-panel-fields.spec.ts\
  \ names rules/integration/a-connector-configuration-is-tested-through-a-registered-capability, which\
  \ no file of this set is bound to: the fourth describe/it block's own titles: describe(\"ConnectorTestPanelFields\
  \ — a subject attribute-value naming an attribute the glossary does not hold still reaches the outbound\
  \ Test call (UNDERDETERMINED, from rules/investigation/a-subject-attribute-is-drawn-from-the-glossary)\"\
  , () => {\n  it(\"dispatches POST /v1/test-connector carrying a subject attribute-value whose name is\
  \ not a glossary-held subject attribute, rather than refusing it\", async () => { — A reader who trusts\
  \ this title over the specification learns that whether a Test-panel subject attribute must be glossary-held\
  \ is unsettled, and goes looking for a decision that was in fact already made in a node this title does\
  \ not cite for this surface.. It blocks nothing here; it is owed a route of its own.\nCandidates: 55\
  \ opened across 21 of 75 delegation(s); each return lists its own under `candidates_opened`.\nUnstated:\
  \ 8 fact(s) the source states that no node holds, over 7 file(s), listed under `unstated`. They block\
  \ no binding here and no rebind closes them — the route is the analysis that gives each fact a node."
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/connector-configuration-draft-status-response-maps-frontend.returns/`, which are the evidence behind every entry above.
