---
contract_version: siegard-reconcile/5
title: Review — recursive-output-schema-fields
summary: Four tasks that make field-semantics.ts read a capability's output schema recursively (properties/items
  → dotted/bracket paths, e.g. installations[].state) and verify that the judgment prompt, citation acceptance
  and the connector observation load either already carry or deliberately do not widen with the new path-shaped
  names.
target: backend
files:
- path: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  change: One new test pinning that a path-shaped field name renders verbatim in the judgment prompt,
    written by the delivery of task/recursive-output-schema-field-paths/judgment-prompt-carries-path-names.
- path: src/__tests__/unit/investigation/citation-validation.spec.ts
  change: Three new tests pinning acceptance/refusal of a path-shaped citation and the foreign-concept
    guard, written by the delivery of task/recursive-output-schema-field-paths/nested-citation-is-accepted.
- path: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  change: One new test tracing the nested-output-schema scenario end to end through collectEvidence, written
    by the delivery of task/recursive-output-schema-field-paths/field-semantics-reads-nested-paths.
- path: src/__tests__/unit/investigation/field-semantics.spec.ts
  change: New tests pinning the recursive walk's path grammar, its two unsupported shapes, its reuse of
    the shared JSON guards and its freedom from framework imports, written by the delivery of task/recursive-output-schema-field-paths/field-semantics-reads-nested-paths.
- path: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  change: Two new tests pinning the observation-load boundary against a nested output schema, written
    by the delivery of task/recursive-output-schema-field-paths/observation-load-stays-top-level.
- path: src/investigation/citation-validation.ts
  change: Not modified. declaredFieldsOf stays top-level-only; citesADeclaredField's membership check
    already treats field names as opaque strings, per the deliveries of nested-citation-is-accepted and
    observation-load-stays-top-level.
- path: src/investigation/field-semantics.ts
  change: fieldSemanticsOf now delegates to a recursive walk (fieldsFromProperties/fieldsFromNode/descendantFieldsOf/pathWith)
    that emits one FieldSemantics element per node the walk reaches, named by its full dotted/bracketed
    path, written by the delivery of task/recursive-output-schema-field-paths/field-semantics-reads-nested-paths.
- path: src/investigation/http-declarative-observation-source.adapter.ts
  change: Not modified. observationOf's filter against declaredFieldsOf stays top-level-only, per the
    delivery of task/recursive-output-schema-field-paths/observation-load-stays-top-level.
nodes:
- node: constraints/evidence-normalization-is-an-anticorruption-layer
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at observationOf (lines
    230-234), which keeps only the extracted values whose responseMap key also names a declared output-schema
    field, so no source-system-only name survives into the returned observation — const extracted = extractResponseFields(responseMap,
    body);

    const declaredFields = declaredFieldsOf(capability.output_schema);

    return Object.fromEntries(Object.entries(extracted).filter(([field]) => declaredFields.includes(field)));'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: 'src/investigation/field-semantics.ts: held at the file''s one and only import statement, line
    1 — everything else in the file is local computation with no framework, driver or client import anywhere
    — import { isPlainObject, parseJsonOrUndefined } from ''./citation-validation.js'';

    src/investigation/http-declarative-observation-source.adapter.ts: held at the class implementing the
    domain''s IObservationSource port, with the framework dependency (fetch) confined to this adapter
    rather than reaching into domain code — import type { IObservationSource, ObservationOutcome, ObserveConceptOptions,
    Subject } from ''./observation-source.port.js'';

    ...

    this.httpClient = options.httpClient ?? fetch;'
  encoded_at:
  - src/investigation/field-semantics.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/integration/concept-observation
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at the observeConcept method
    (lines 76-91) — public async observeConcept({ concept, subject, requester, remainingBudgetMs }: ObserveConceptOptions):
    Promise<ObservationOutcome> {'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/integration/corporate-records-source
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at resolveConnectorConfiguration,
    resolving whichever connector the capability names rather than a fixed system (lines 104, 139-147)
    — const configurationResolution = await this.resolveConnectorConfiguration(capability.connector);

    ...

    const resolution = await this.connectorConfigurations.readConnectorConfiguration(connector);'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/investigation/observation-source
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at the observeConcept method,
    one call per concept (lines 76-91) — public async observeConcept({ concept, subject, requester, remainingBudgetMs
    }: ObserveConceptOptions): Promise<ObservationOutcome> {'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/system/corporate-records
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at the same generic connector
    resolution as corporate-records-source — no vendor name is ever written into this file — const configurationResolution
    = await this.resolveConnectorConfiguration(capability.connector);'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/integration/capability
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at effectiveTimeoutMsFor
    and observationOf, reading capability.timeout, capability.connector and capability.output_schema (lines
    61-63, 82-83, 230-233) — return remainingBudgetMs === undefined ? capability.timeout : Math.min(capability.timeout,
    remainingBudgetMs);

    ...

    const declaredFields = declaredFieldsOf(capability.output_schema);'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/investigation/citation
  conforms: true
  how: 'src/investigation/citation-validation.ts: held at citesADeclaredField, line 31 — return citedEvidence.fields.some((field)
    => field.name === citation.field);'
  encoded_at:
  - src/investigation/citation-validation.ts
- node: domain/investigation/evaluation
  conforms: true
  how: 'src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts: held at the outcome-shape
    assertions across the confirmed/refuted/no-data cases, e.g. lines 747-749 and 809-821 — expect(outcome).toMatchObject({
    verdict: ''confirmed'', citations: [citation], usage: { input_tokens: 77, output_tokens: 88 } });

    expect(outcome.elapsed_ms).toEqual(expect.any(Number));

    expect(outcome.prompt).toBe(createMock.mock.calls[0]?.[0]?.messages[0]?.content);

    '
  encoded_at:
  - src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
- node: domain/investigation/evidence
  conforms: true
  how: 'src/investigation/citation-validation.ts: held at citesADeclaredField, lines 27 and 31 — const
    citedEvidence = context.evidence.find((item) => item.concept === citation.concept);

    ...

    return citedEvidence.fields.some((field) => field.name === citation.field);

    src/investigation/field-semantics.ts: held at the `fieldSemanticsOf` function, lines 9-18, which is
    what produces the array snapshotted onto evidence''s own `fields` attribute (the rest of the evidence
    value-object — concept, observed_at, ttl, result, etc. — is not defined in this file) — export function
    fieldSemanticsOf(outputSchema: string | undefined): readonly FieldSemantics[] {'
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/field-semantics.ts
- node: domain/investigation/evidence-result
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at DEFAULT_STATUS_ENDING\
    \ and isEvidenceResult (lines 32, 270-272) — const DEFAULT_STATUS_ENDING: EvidenceResult = 'unavailable';\n\
    ...\nfunction isEvidenceResult(value: unknown): value is EvidenceResult {\n  return typeof value ===\
    \ 'string' && (EVIDENCE_RESULTS as readonly string[]).includes(value);\n}"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/investigation/field-semantics
  conforms: true
  how: "src/investigation/field-semantics.ts: held at the `FieldSemantics` type, lines 3-7, and `fieldSemanticsFrom`,\
    \ lines 43-49 — export type FieldSemantics = {\n  readonly name: string;\n  readonly type?: string;\n\
    \  readonly description?: string;\n};"
  encoded_at:
  - src/investigation/field-semantics.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'One input against one expected result, in the shape the payload_notes re-registration
    test already takes: collect evidence for a concept whose capability declares an output schema with
    a known field, then re-register that same concept''s capability with a different output schema, and
    assert the already-produced evidence item''s fields still carry the originally declared name, type
    and description — unchanged by the later registration.'
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: 'src/investigation/citation-validation.ts: held at citesACollectedConcept, line 23 — return collects.includes(citation.concept);'
  encoded_at:
  - src/investigation/citation-validation.ts
- node: rules/integration/an-http-connector-configuration-declares-its-call
  conforms: false
  how: 'no named file holds this fact now: src/investigation/http-declarative-observation-source.adapter.ts
    read `nowhere` — "return { ok: true, value: resolveConnectorRequest({ configuration, subject, requester
    }) };" — the address/query/headers/body and placeholder mechanism this rule states is delegated whole
    to resolveConnectorRequest, never restated in this file'
  observed_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches
  conforms: true
  how: "src/investigation/citation-validation.ts: held at declaredFieldsOf, lines 34-43 — const parsed\
    \ = parseJsonOrUndefined(outputSchema);\nif (!isPlainObject(parsed) || !isPlainObject(parsed.properties))\
    \ {\n  return [];\n}\nreturn Object.keys(parsed.properties);\nsrc/investigation/http-declarative-observation-source.adapter.ts:\
    \ held at observationOf (lines 230-234) — const extracted = extractResponseFields(responseMap, body);\n\
    const declaredFields = declaredFieldsOf(capability.output_schema);\nreturn Object.fromEntries(Object.entries(extracted).filter(([field])\
    \ => declaredFields.includes(field)));"
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'Two inputs against two expected results. First: an ok call whose responseMap names a
    declared top-level output-schema property by a path resolving in the body to a falsy JSON value —
    false, 0, "" or null — expecting the observation to carry that field with that value rather than to
    omit it. Second: an ok call for a capability whose output schema declares no top-level properties
    object at all, with a responseMap whose paths all resolve, expecting an empty observation.'
- node: rules/integration/an-unclassified-status-ends-unavailable
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at endingForStatus (lines
    217-220) — const mapped = statusMap[String(status)];

    return isEvidenceResult(mapped) ? mapped : DEFAULT_STATUS_ENDING;'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/an-unreachable-connector-ends-unavailable
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at unavailableForUnreachableConnector\
    \ and issueRequestOrUnreachable (lines 56-59, 187-200) — const error = new ConnectorUnreachableError(connector,\
    \ { cause });\nreturn { result: 'unavailable', result_detail: `${error.name}: ${connector}` };\n...\n\
    } catch (error) {\n  return { ok: false, outcome: unavailableForUnreachableConnector(connector, error)\
    \ };\n}"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at resolveCapability, resolveConnectorConfiguration\
    \ and resolveAssembledRequest (lines 123-176) — if (!resolution.held) {\n  return { ok: false, outcome:\
    \ unavailableFor(new CapabilityNotResolvedForObservationError(concept)) };\n}\n...\nif (error instanceof\
    \ ConnectorPlaceholderNotResolvedError || error instanceof IncompleteConnectorCallDescriptorError)\
    \ {\n  return { ok: false, outcome: unavailableFor(error) };\n}"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/evidence-arrives-in-the-glossary-vocabulary
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at observationOf (lines
    230-234), the same mechanism as evidence-normalization-is-an-anticorruption-layer — const extracted
    = extractResponseFields(responseMap, body);

    const declaredFields = declaredFieldsOf(capability.output_schema);

    return Object.fromEntries(Object.entries(extracted).filter(([field]) => declaredFields.includes(field)));'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  conforms: true
  how: 'src/investigation/citation-validation.ts: held at citesACollectedConcept, line 23 — return collects.includes(citation.concept);'
  encoded_at:
  - src/investigation/citation-validation.ts
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  conforms: false
  how: "src/investigation/citation-validation.ts, citesADeclaredField, lines 26-32: function citesADeclaredField(context:\
    \ HypothesisCitationContext, citation: Citation): boolean {\n  const citedEvidence = context.evidence.find((item)\
    \ => item.concept === citation.concept);\n  if (citedEvidence === undefined) {\n    return false;\n\
    \  }\n  return citedEvidence.fields.some((field) => field.name === citation.field);\n} — The invariant\
    \ scopes the field check to citations that carry a field (\"where the citation carries one\") and\
    \ states explicitly that a no-data verdict's citation carries none, since the evidence it cites snapshotted\
    \ no fields at all. This function applies `fields.some((field) => field.name === citation.field)`\
    \ unconditionally: when `citation.field` is `undefined` (the no-data case) and `citedEvidence.fields`\
    \ is `[]` (the same case), `.some(...)` is false on both counts, so `isCitationValid` — and therefore\
    \ `acceptedCitations` — rejects a citation the specification says is legitimately fieldless. A caller\
    \ filtering a hypothesis's citations through this module would silently drop every no-data citation,\
    \ and the next reader chasing the loss would look at the containment rule rather than at this unconditional\
    \ equality check."
  observed_at:
  - src/investigation/citation-validation.ts
- node: rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema
  conforms: true
  how: "src/investigation/field-semantics.ts: held at the path-building recursion across `fieldsFromProperties`,\
    \ `pathWith`, `fieldsFromNode` and `descendantFieldsOf`, lines 20-41 — function pathWith(parentPath:\
    \ string | undefined, key: string): string {\n  return parentPath === undefined ? key : `${parentPath}.${key}`;\n\
    }\n...\nif (isPlainObject(declared.items)) {\n  return fieldsFromNode(`${path}[]`, declared.items);\n\
    }"
  encoded_at:
  - src/investigation/field-semantics.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'One input — an output schema declaring an array beneath a nested object and an array
    beneath another array''s own `items`, for instance `properties.profile.properties.installations` as
    an array whose `items` is one object schema declaring `state`, and `properties.matrix` as an array
    whose `items` is itself an array whose `items` declares `cell` — against one expected result: elements
    named `profile.installations`, `profile.installations[]`, `profile.installations[].state`, `matrix`,
    `matrix[]`, `matrix[][]` and `matrix[][].cell`, each carrying that node''s own stated `type` and `description`
    and nothing more, asserted as the whole answer so that a walk capped at any fixed depth fails.'
- node: rules/investigation/a-measured-duration-below-one-millisecond-is-zero
  conforms: true
  how: "src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts: held at \"measures\
    \ elapsed_ms as the real wall-clock time the provider call itself took, rather than a fixed value\"\
    , lines 784-792 — this exercises genuine measurement rather than an invented figure, though no case\
    \ here exercises a call settling in under one millisecond, so the zero-floor half of the rule is not\
    \ itself exercised in this file — createMock.mockImplementationOnce(\n  () => new Promise((resolve)\
    \ => setTimeout(() => resolve(messageWithText('{\"verdict\":\"inconclusive\"}')), 20)),\n);\nexpect(outcome.elapsed_ms).toBeGreaterThanOrEqual(20);\n"
  encoded_at:
  - src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
- node: rules/investigation/collection-has-its-own-budget-within-the-total
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at effectiveTimeoutMsFor
    (lines 61-63) — return remainingBudgetMs === undefined ? capability.timeout : Math.min(capability.timeout,
    remainingBudgetMs);'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/collection-runs-in-the-requester-scope
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at the requester parameter
    threaded from observeConcept through resolvePreparedCall into resolveConnectorRequest (lines 76-77,
    116, 163-169) — const prepared = await this.resolvePreparedCall(concept, subject, requester);

    ...

    return { ok: true, value: resolveConnectorRequest({ configuration, subject, requester }) };'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/judgment-reads-the-evidence-snapshot
  conforms: true
  how: 'src/investigation/citation-validation.ts: held at citesADeclaredField, line 31 — return citedEvidence.fields.some((field)
    => field.name === citation.field);'
  encoded_at:
  - src/investigation/citation-validation.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at the timed-out branch\
    \ of observeConcept, recording a result rather than throwing (lines 87-89) — if (call.value.kind ===\
    \ 'timed-out') {\n  return { result: 'timeout' };\n}"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: scenarios/integration/a-response-map-key-no-output-schema-field-names-observes-nothing
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at observationOf (lines
    230-234) — const extracted = extractResponseFields(responseMap, body);

    const declaredFields = declaredFieldsOf(capability.output_schema);

    return Object.fromEntries(Object.entries(extracted).filter(([field]) => declaredFields.includes(field)));'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'One input — an investigation collecting tech-profile''s concept with that capability
    registered, the fsm-http configuration declaring statusMap {"200":"ok"} and responseMap {"id":"data.id","installations":"data.installations"},
    and the call answering 200 with {"data":{"id":"u1","installations":["a","b"]}} — against one expected
    result: the evidence recorded for that collection has result ok and an observation carrying installations
    with the value ["a","b"], no field named id and no field named login.'
- node: scenarios/integration/an-optional-attribute-absent-degrades-its-observation
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at resolveAssembledRequest's\
    \ catch of ConnectorPlaceholderNotResolvedError (lines 168-176) — if (error instanceof ConnectorPlaceholderNotResolvedError\
    \ || error instanceof IncompleteConnectorCallDescriptorError) {\n  return { ok: false, outcome: unavailableFor(error)\
    \ };\n}"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: scenarios/investigation/a-citation-names-a-nested-output-schema-field
  conforms: true
  how: "src/investigation/citation-validation.ts: held at citesADeclaredField, line 31 — return citedEvidence.fields.some((field)\
    \ => field.name === citation.field);\nsrc/investigation/field-semantics.ts: held at the same items\
    \ recursion in `descendantFieldsOf`, lines 37-39, which is what makes `installations[].state` one\
    \ of the field-semantics elements a later citation can name — if (isPlainObject(declared.items)) {\n\
    \  return fieldsFromNode(`${path}[]`, declared.items);\n}"
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/field-semantics.ts
  decided_by: test
  step: test
  proof:
  - src/__tests__/unit/investigation/citation-validation.spec.ts
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at the same timed-out branch\
    \ as no-stage-aborts-on-its-deadline (lines 87-89) — if (call.value.kind === 'timed-out') {\n  return\
    \ { result: 'timeout' };\n}"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: scenarios/investigation/a-nested-output-schema-property-is-named-by-its-full-path
  conforms: true
  how: "src/investigation/field-semantics.ts: held at `fieldsFromProperties`/`pathWith` (lines 20-26)\
    \ for the root-level names, and `descendantFieldsOf`/`fieldsFromNode` (lines 28-41) for the nested\
    \ one — together they produce `login`, `installations` and `installations[].state`, and never emit\
    \ `state` alone — function fieldsFromProperties(properties: Record<string, unknown>, parentPath?:\
    \ string): readonly FieldSemantics[] {\n  return Object.entries(properties).flatMap(([key, value])\
    \ => fieldsFromNode(pathWith(parentPath, key), value));\n}"
  encoded_at:
  - src/investigation/field-semantics.ts
  decided_by: test
  step: test
  proof:
  - src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
- node: scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
  conforms: true
  how: 'src/investigation/citation-validation.ts: held at citesADeclaredField, lines 27 and 31 — const
    citedEvidence = context.evidence.find((item) => item.concept === citation.concept);

    ...

    return citedEvidence.fields.some((field) => field.name === citation.field);'
  encoded_at:
  - src/investigation/citation-validation.ts
- node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at effectiveTimeoutMsFor
    (lines 61-63) — return remainingBudgetMs === undefined ? capability.timeout : Math.min(capability.timeout,
    remainingBudgetMs);'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
unstated:
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  where: the assertions inside "states that multiple evidence items are evaluated in complete isolation,
    never attributing one item's field value to another even where both declare a field of the same name",
    lines 217-219
  evidence: 'expect(system).toContain(''evaluate each in complete isolation from every other'');

    expect(system).toContain(''is never attributed to another item, even where two items declare a field
    of the same name'');

    '
  cost: This guarantee — that the judgment must never let one evidence item's field value ground a verdict
    about another item, even where two items share a field name — is stated only in the adapter's own
    system prompt and pinned only by this test. Nothing in the specification records that a hypothesis's
    judgment treats each evidence item in isolation this way, unlike the neighboring prompt facts (observation
    is JSON text, the current instant is read fresh, the block is closed) which the decision log shows
    were each deliberately decided. A reader checking whether this cross-item guarantee still holds after
    a future prompt rewrite has no node to check it against, and the adapter's own prose is the only place
    the rule can be read back from.
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  where: '`expectedOkEvidence`/`expectedNonOkEvidence` (line 288 and line 311) and `expectedUnavailableEvidence`
    (line 330)'
  evidence: 'origin: context.capability.connector,'
  cost: 'The decision log for `domain/investigation/evidence`''s `origin` attribute fixed only its type
    ("decided: string ... It names where the observation came from for audit; an opaque name suffices"),
    leaving what actually populates it unstated. This file''s every ok, denied, timeout and unavailable-with-capability
    fixture asserts `origin` equals the producing capability''s own connector name, and the unresolved-capability
    fixture asserts it as `''''` — a specific mapping a reader auditing an evidence item''s origin has
    no node to confirm.'
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  where: the `expectedInputs` helper, lines 273-275
  evidence: "function expectedInputs(context: EvidenceContext): string {\n  return JSON.stringify({ concept:\
    \ context.concept, subject: context.subject, requester: context.requester });\n}"
  cost: 'Every ok/non-ok evidence fixture in the file asserts `inputs` against this exact JSON shape,
    so a reader checking what an evidence item''s audit-trail `inputs` actually records will find the
    answer only here. The specification''s own decision log fixes only the attribute''s type ("decided:
    string ... Inputs vary per capability and are pinned for replay as recorded bytes; a serialized form
    is the only shape common to all"), leaving its content undecided, and the cache-key text even lists
    "inputs" as something distinct from "concept" and "subject" rather than a re-encoding of them — so
    this fixture commits the whole file to a specific content the specification never settled.'
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  where: lines 150-173, the 'imports no HTTP client package' and 'defaults its own HTTP client to the
    platform global fetch' tests
  evidence: 'const forbidden = [''axios'', ''node-fetch'', ''got'', ''undici'', ''superagent'', ''request''];

    const offenders = forbidden.filter((name) => source.includes(`''${name}''`) || source.includes(`"${name}"`));


    expect(offenders).toEqual([]);'
  cost: The adapter's binding to the platform's own global fetch, and the specific ban on axios, node-fetch,
    got, undici, superagent and request, lives only in this test. A reader of the specification looking
    for what HTTP transport the observe-concept adapter may depend on finds nothing — none of `contracts/integration/concept-observation`,
    `rules/integration/an-http-connector-configuration-declares-its-call` or `constraints/the-domain-depends-on-no-infrastructure`
    (which binds the domain layer, not this infrastructure adapter) states it — so a future change introducing
    one of these packages would violate only this test file, never a documented rule.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  where: lines 828-852, the two request-body-serialization tests
  evidence: 'expect(httpClient.mock.calls[0]?.[1]?.body).toBe(JSON.stringify({ subjectId: ''a-subject-id''
    }));'
  cost: How the connector call's own resolved body reaches the wire — a non-string resolved body is JSON-encoded,
    an already-string one is sent verbatim without double-encoding — is asserted only here. `rules/integration/an-http-connector-configuration-declares-its-call`
    states the body may be "of any shape" with placeholders substituted as plain text, but is silent on
    the wire encoding once that substitution resolves; `rules/investigation/an-observation-is-recorded-as-json-object-text`
    states the symmetric rule for the read side (the evidence's own observation) but nothing states it
    for the outbound call, so this encoding rule lives only in code a test happens to pin down.
unbound:
- src/__tests__/unit/investigation/citation-validation.spec.ts
- src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
- src/__tests__/unit/investigation/field-semantics.spec.ts
- src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
notes: "Judged by 8 delegation(s), one per file; folded mechanically by trace.py --fold from the returns\
  \ under siegard-reconcile/recursive-output-schema-fields.returns/.\nCertification of rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema\
  \ did not hold: the auditor answered `partial` — The exhaustive `toEqual` over RULE_EXERCISE_SCHEMA\
  \ exercises most of the fact and would fail on either an omitted or an excess element: a root key named\
  \ by that key alone with no leading `.` (`profile`, `installations`), a key concatenated onto a parent's\
  \ own path with `.` (`profile.name`), an array's own single-schema `items` concatenated with `[]` before\
  \ any name beneath it (`installations[]`, `installations[].state`), every node and not only leaves (`profile`\
  \ and `installations` each carry an element of their own), the node's own `type` and `description` at\
  \ the node the path reaches (only `installations[]` carries the description its `items` states, and\
  \ it does not leak to `installations` or to `installations[].state`), a tuple-shaped `items` walked\
  \ no further (`coordinates` names itself and nothing beneath it), and `patternProperties`/`additionalProperties`\
  \ neither walked nor naming a field of their own whichever content they declare (`extras` and `metadata`\
  \ name themselves, and the `hidden` and `concealed` keys each declares beneath are absent). What goes\
  \ unexercised is the `[]` step over a parent path that is not a root key: every array in the set is\
  \ declared directly under the schema's own root, so nothing composes `[]` onto an already-composed path.\
  \ An implementation that appended `[]` only for root-level arrays — leaving `profile.installations[].state`\
  \ unnamed, or a nested array's items unwalked — would pass this set whole, yet the fact, which states\
  \ the `[]` concatenation over \"its parent's own path\" generally, would have stopped holding. The set's\
  \ `.` step is exercised over a derived parent (`installations[]` + `.state`); the `[]` step is not.\
  \ The file's remaining tests assert the module's import shape and the absence of local helper declarations\
  \ — they bind where the code's helpers come from, not what a field-semantics name is, and bear on the\
  \ fact not at all.. The node is decided by reading, and a certification standing on it from an earlier\
  \ reconciliation is released by the bind. The remainder is testable: One input — an output schema declaring\
  \ an array beneath a nested object and an array beneath another array's own `items`, for instance `properties.profile.properties.installations`\
  \ as an array whose `items` is one object schema declaring `state`, and `properties.matrix` as an array\
  \ whose `items` is itself an array whose `items` declares `cell` — against one expected result: elements\
  \ named `profile.installations`, `profile.installations[]`, `profile.installations[].state`, `matrix`,\
  \ `matrix[]`, `matrix[][]` and `matrix[][].cell`, each carrying that node's own stated `type` and `description`\
  \ and nothing more, asserted as the whole answer so that a walk capped at any fixed depth fails..\n\
  Certified scenarios/investigation/a-nested-output-schema-property-is-named-by-its-full-path as decided\
  \ by step `test`: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts (snapshots installations[].state,\
  \ installations and login among the collected evidence item's own fields, and no field named state alone,\
  \ for a capability whose output schema declares state beneath installations' own items (scenarios/investigation/a-nested-output-schema-property-is-named-by-its-full-path))\
  \ would fail if the fact stopped holding.\nCertification of domain/investigation/field-semantics did\
  \ not hold: the auditor answered `partial` — The value object's three attributes are exercised whole\
  \ and would fail if they stopped holding: the two-field output-schema test asserts name with type and\
  \ description where the schema states them and no description where it states none, by exact equality,\
  \ so an invented or dropped attribute fails; the nested-schema test asserts the field reached at installations[].state\
  \ equals exactly {name, type, description}, and since that schema node also declares minLength and enum,\
  \ the sentence \"No other content of that schema is read or validated\" is exercised rather than merely\
  \ stated; the denied-ending and never-resolved tests fix the field set onto the evidence item independently\
  \ of how the observation ended. What is unexercised is the Responsibility's word \"snapshotted\". Nothing\
  \ in the offered set re-registers the same concept's capability with a different output schema after\
  \ collection and reads the already-produced evidence item's fields back — so an implementation that\
  \ resolved fields lazily from the registry at read time, rather than copying them onto the item at collection,\
  \ would pass every named test. The sibling attribute carries exactly that proof (\"leaves an already-produced\
  \ evidence item's capability_payload_notes unaffected by a later re-registration of the same producing\
  \ capability\"), which shows the project treats snapshot-versus-re-read as a distinct assertion, and\
  \ no counterpart exists for fields.. The node is decided by reading, and a certification standing on\
  \ it from an earlier reconciliation is released by the bind. The remainder is testable: One input against\
  \ one expected result, in the shape the payload_notes re-registration test already takes: collect evidence\
  \ for a concept whose capability declares an output schema with a known field, then re-register that\
  \ same concept's capability with a different output schema, and assert the already-produced evidence\
  \ item's fields still carry the originally declared name, type and description — unchanged by the later\
  \ registration..\nCertified scenarios/investigation/a-citation-names-a-nested-output-schema-field as\
  \ decided by step `test`: src/__tests__/unit/investigation/citation-validation.spec.ts (accepts a citation\
  \ naming concept tech-profile and field installations[].state, where that item snapshot carries installations[].state,\
  \ exactly as the acceptance scenario states it); src/__tests__/unit/investigation/citation-validation.spec.ts\
  \ (refuses a citation naming a path-shaped field, installations[].partition, that its own cited evidence\
  \ item's snapshot did not carry — a citation is refused for an unmatched name whatever shape that name\
  \ has); src/__tests__/unit/investigation/citation-validation.spec.ts (refuses a citation naming a concept\
  \ outside the hypothesis's collects even where the field it names, installations[].state, is path-shaped\
  \ and matches that foreign evidence item's own snapshotted fields) would fail if the fact stopped holding.\n\
  Certification of rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches\
  \ did not hold: the auditor answered `partial` — Both exclusions the fact names are exercised, separately\
  \ and together: a responseMap key naming no top-level output-schema property contributes nothing, an\
  \ output-schema property no responseMap key names is absent, and the nested case pins \"own top-level\
  \ properties object\" by excluding installations[].state whose path does resolve. What goes unexercised\
  \ is inside the third conjunct, \"whose responseMap path resolves in the response body\". Every resolving\
  \ path in the set resolves to a non-empty string or a non-empty array, so a path that resolves to a\
  \ false, zero, empty-string or null value in the body is never submitted; an implementation that decided\
  \ resolution by truthiness would drop a field the fact says the observation carries and every named\
  \ test would still pass. Separately, every capability in the set declares an output schema that has\
  \ a top-level properties object, so the case where that object is absent — under which the intersection\
  \ is empty and the observation must carry nothing — is never submitted, and an implementation that fell\
  \ back to carrying every responseMap key when it found no properties object would also pass the whole\
  \ set.. The node is decided by reading, and a certification standing on it from an earlier reconciliation\
  \ is released by the bind. The remainder is testable: Two inputs against two expected results. First:\
  \ an ok call whose responseMap names a declared top-level output-schema property by a path resolving\
  \ in the body to a falsy JSON value — false, 0, \"\" or null — expecting the observation to carry that\
  \ field with that value rather than to omit it. Second: an ok call for a capability whose output schema\
  \ declares no top-level properties object at all, with a responseMap whose paths all resolve, expecting\
  \ an empty observation..\nCertification of scenarios/integration/a-response-map-key-no-output-schema-field-names-observes-nothing\
  \ did not hold: the auditor answered `partial` — The two observation clauses are bound exactly: the\
  \ test reproduces the node's given — tech-profile naming connector fsm-http with the output schema declaring\
  \ top-level login and installations, the fsm-http configuration declaring statusMap {\"200\":\"ok\"\
  } and responseMap {\"id\":\"data.id\",\"installations\":\"data.installations\"}, and a 200 answering\
  \ {\"data\":{\"id\":\"u1\",\"installations\":[\"a\",\"b\"]}} — and asserts the observation is exactly\
  \ JSON.stringify({ installations: ['a','b'] }), so carrying a field named id, carrying a field named\
  \ login, or losing installations' value each breaks the strict equality. What goes unexercised is the\
  \ collecting seam the scenario states: the test drives HttpDeclarativeObservationSource.observeConcept\
  \ directly, so \"an investigation collects tech-profile's concept\" never happens and \"the evidence\
  \ records result ok\" is asserted only as the adapter's own returned ending, one layer below the evidence\
  \ record the then names — nothing in the offered proof reads back an evidence record at all, so an investigation\
  \ that dropped, relabelled or overwrote this ok ending would leave the test passing. The remaining tests\
  \ in the file that exercise the same subject rule (excludes an output-schema property from the ok observation\
  \ when no responseMap key names it; ends ok with an empty observation, refusing nothing at read time,\
  \ when every responseMap key names no output-schema property at all; carries exactly the field whose\
  \ name is at once a responseMap key and a declared output-schema property with a resolving path) bear\
  \ on the rule under other inputs, not on this scenario's stated given, and none of them reaches the\
  \ evidence either.. The node is decided by reading, and a certification standing on it from an earlier\
  \ reconciliation is released by the bind. The remainder is testable: One input — an investigation collecting\
  \ tech-profile's concept with that capability registered, the fsm-http configuration declaring statusMap\
  \ {\"200\":\"ok\"} and responseMap {\"id\":\"data.id\",\"installations\":\"data.installations\"}, and\
  \ the call answering 200 with {\"data\":{\"id\":\"u1\",\"installations\":[\"a\",\"b\"]}} — against one\
  \ expected result: the evidence recorded for that collection has result ok and an observation carrying\
  \ installations with the value [\"a\",\"b\"], no field named id and no field named login..\nStaged by\
  \ a review over files a delivery wrote: no pair was omitted, so the delivery's own claims and every\
  \ other binding of these files were judged alike; the plan's node(s) domain/investigation/field-semantics,\
  \ domain/investigation/evidence, rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema,\
  \ scenarios/investigation/a-nested-output-schema-property-is-named-by-its-full-path, constraints/the-domain-depends-on-no-infrastructure,\
  \ constraints/the-judgment-prompt-is-closed, rules/investigation/judgment-reads-the-evidence-snapshot,\
  \ domain/investigation/citation, rules/investigation/a-cited-field-exists-in-the-capability-output-schema,\
  \ rules/investigation/a-citation-stays-within-the-hypothesis-collects, scenarios/investigation/a-citation-names-a-nested-output-schema-field,\
  \ rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches, scenarios/integration/a-response-map-key-no-output-schema-field-names-observes-nothing\
  \ were read on every file and answered for, and bound from nowhere here — a binding this record writes\
  \ is one the trace already held.\nA finding in src/investigation/http-declarative-observation-source.adapter.ts\
  \ names rules/integration/an-http-connector-configuration-declares-its-method-and-status-vocabulary,\
  \ which no file of this set is bound to: resolveHttpConnectorCallConfiguration's catch (lines 149-161),\
  \ which routes a MalformedHttpConnectorConfigurationError through the generic unavailableFor helper\
  \ (lines 52-54), discarding the vocabulary httpConfigurationProblems computed for it (lines 256-268):\
  \ function unavailableFor(error: Error): ObservationOutcome {\n  return { result: 'unavailable', result_detail:\
  \ error.name };\n}\n...\nif (error instanceof MalformedHttpConnectorConfigurationError) {\n  return\
  \ { ok: false, outcome: unavailableFor(error) };\n}\n...\nif (!isHttpMethod(configuration.method)) {\n\
  \  problems.push(`method is not one of ${HTTP_METHODS.join(', ')}`);\n}\n...\nif (!isStatusEndingMap(configuration.statusMap))\
  \ {\n  problems.push(`statusMap is not a plain object mapping a status to one of ${EVIDENCE_RESULTS.join(',\
  \ ')}`);\n} — An operator reading the evidence recorded for an observation refused over a malformed\
  \ connector configuration sees only the bare class name \"MalformedHttpConnectorConfigurationError\"\
  \ as result_detail. The vocabulary this same file computes — which methods the connector accepts, or\
  \ which evidence-result endings a statusMap may map a status to — is built into `problems` and handed\
  \ to the error, then dropped: `unavailableFor` reads only `error.name`. The file already knows how to\
  \ enrich a detail when one is owed (`unavailableForUnreachableConnector` appends the connector name\
  \ explicitly), so this is not a uniform convention but a gap in the one case the specification says\
  \ needs the extra text, and the operator has to go elsewhere to learn which key was wrong or what it\
  \ should have been.. It blocks nothing here; it is owed a route of its own.\nCandidates: 0 opened across\
  \ 0 of 8 delegation(s); each return lists its own under `candidates_opened`.\nUnstated: 5 fact(s) the\
  \ source states that no node holds, over 3 file(s), listed under `unstated`. They block no binding here\
  \ and no rebind closes them — the route is the analysis that gives each fact a node."
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/recursive-output-schema-fields.returns/`, which are the evidence behind every entry above.
