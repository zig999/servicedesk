---
contract_version: siegard-reconcile/5
title: Reconcile http-declarative-observation-source.adapter.ts against the integration/investigation
  nodes it binds
summary: This adapter file is asserted correct as it stands on disk; the trace's bindings for it are stale
  because the file changed without a rebind. This reconciliation reads it fresh against every node the
  trace currently binds to it, over one file.
target: backend
files:
- path: src/investigation/http-declarative-observation-source.adapter.ts
  change: The file as committed implements the HTTP-declarative observation source that collects evidence
    for a concept through a capability's registered connector — no further description beyond what the
    judge's own reading reports.
nodes:
- node: constraints/evidence-normalization-is-an-anticorruption-layer
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at observationOf, which
    keeps only fields whose name is the capability''s own declared (glossary) field name — return Object.fromEntries(Object.entries(extracted).filter(([field])
    => declaredFields.includes(field)));'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/integration/concept-observation
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at the public observeConcept
    method — public async observeConcept({ concept, subject, requester, remainingBudgetMs }: ObserveConceptOptions):
    Promise<ObservationOutcome> {'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/integration/corporate-records-source
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at resolveCapability/resolveConnectorConfiguration,
    which reach a system only through the capability''s own registered connector, never a named system
    — const configurationResolution = await this.resolveConnectorConfiguration(capability.connector);'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/investigation/observation-source
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at observeConcept, one
    call per concept passed in — public async observeConcept({ concept, subject, requester, remainingBudgetMs
    }: ObserveConceptOptions): Promise<ObservationOutcome> {'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/system/corporate-records
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at issueRequestOrUnreachable,
    which issues the call only by the capability''s registered connector name, never a hardcoded system
    — const call = await this.issueRequestOrUnreachable({ connector: capability.connector, method: httpFields.method,
    request, timeoutMs });'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/integration/capability
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at effectiveTimeoutMsFor\
    \ and outcomeFromResponse, reading the capability's own timeout, connector and output_schema — function\
    \ effectiveTimeoutMsFor(capability: Capability, remainingBudgetMs: number | undefined): number {\n\
    \  return remainingBudgetMs === undefined ? capability.timeout : Math.min(capability.timeout, remainingBudgetMs);\n\
    }"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/investigation/evidence-result
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at isEvidenceResult/DEFAULT_STATUS_ENDING/endingForStatus,\
    \ using the imported EVIDENCE_RESULTS vocabulary — function isEvidenceResult(value: unknown): value\
    \ is EvidenceResult {\n  return typeof value === 'string' && (EVIDENCE_RESULTS as readonly string[]).includes(value);\n\
    }"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/an-http-connector-configuration-declares-its-call
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at resolveAssembledRequest,
    which delegates assembly to resolveConnectorRequest and only maps its placeholder/descriptor failures
    — return { ok: true, value: resolveConnectorRequest({ configuration, subject, requester }) };'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at observationOf — function\
    \ observationOf(capability: Capability, responseMap: ResponseFieldPaths, body: unknown): Record<string,\
    \ unknown> {\n  const extracted = extractResponseFields(responseMap, body);\n  const declaredFields\
    \ = declaredFieldsOf(capability.output_schema);\n  return Object.fromEntries(Object.entries(extracted).filter(([field])\
    \ => declaredFields.includes(field)));\n}"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/an-unclassified-status-ends-unavailable
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at endingForStatus / DEFAULT_STATUS_ENDING\
    \ — function endingForStatus(statusMap: StatusEndingMap, status: number): EvidenceResult {\n  const\
    \ mapped = statusMap[String(status)];\n  return isEvidenceResult(mapped) ? mapped : DEFAULT_STATUS_ENDING;\n\
    }"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/an-unreachable-connector-ends-unavailable
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at unavailableForUnreachableConnector\
    \ and its use in issueRequestOrUnreachable's catch — function unavailableForUnreachableConnector(connector:\
    \ string, cause: unknown): ObservationOutcome {\n  const error = new ConnectorUnreachableError(connector,\
    \ { cause });\n  return { result: 'unavailable', result_detail: `${error.name}: ${connector}` };\n\
    }"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at resolveCapability, resolveConnectorConfiguration\
    \ and resolveAssembledRequest — if (!resolution.held) {\n  return { ok: false, outcome: unavailableFor(new\
    \ CapabilityNotResolvedForObservationError(concept)) };\n}"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/evidence-arrives-in-the-glossary-vocabulary
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at observationOf, the same
    field filter that keeps only capability (glossary) field names — return Object.fromEntries(Object.entries(extracted).filter(([field])
    => declaredFields.includes(field)));'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/collection-has-its-own-budget-within-the-total
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at effectiveTimeoutMsFor
    — return remainingBudgetMs === undefined ? capability.timeout : Math.min(capability.timeout, remainingBudgetMs);'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/collection-runs-in-the-requester-scope
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at observeConcept threading
    requester through to resolveAssembledRequest; the file only forwards it, it does not itself enforce
    the scope — return { ok: true, value: resolveConnectorRequest({ configuration, subject, requester
    }) };'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at observeConcept, recording\
    \ a timeout result instead of throwing when the call times out — if (call.value.kind === 'timed-out')\
    \ {\n  return { result: 'timeout' };\n}"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: scenarios/integration/a-response-map-key-no-output-schema-field-names-observes-nothing
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at observationOf — const
    extracted = extractResponseFields(responseMap, body);

    const declaredFields = declaredFieldsOf(capability.output_schema);

    return Object.fromEntries(Object.entries(extracted).filter(([field]) => declaredFields.includes(field)));'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: scenarios/integration/an-optional-attribute-absent-degrades-its-observation
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at resolveAssembledRequest's\
    \ catch for ConnectorPlaceholderNotResolvedError — if (error instanceof ConnectorPlaceholderNotResolvedError\
    \ || error instanceof IncompleteConnectorCallDescriptorError) {\n  return { ok: false, outcome: unavailableFor(error)\
    \ };\n}"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at observeConcept's timeout\
    \ branch — if (call.value.kind === 'timed-out') {\n  return { result: 'timeout' };\n}"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at effectiveTimeoutMsFor
    — return remainingBudgetMs === undefined ? capability.timeout : Math.min(capability.timeout, remainingBudgetMs);'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: 'a registry step decides this constraint, and every step the registry named for it passed over
    the tree as these files stand — run/http-declarative-observation-source-drift: `lint` passed (exit
    0) over npm run lint, `test-unit` passed (exit 0) over node --env-file=.env.test node_modules/.bin/vitest
    run src/__tests__/unit. No judge read this pair, and the run is the whole of what answered it'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
unstated:
- file: src/investigation/http-declarative-observation-source.adapter.ts
  where: parsedBodyOrUndefined, and its use inside outcomeFromResponse
  evidence: "async function parsedBodyOrUndefined(response: Response): Promise<unknown> {\n  try {\n \
    \   return await response.json();\n  } catch {\n    return undefined;\n  }\n}\n...\nconst body = await\
    \ parsedBodyOrUndefined(response);\nconst observation = observationOf(capability, configuration.responseMap,\
    \ body);\nreturn { result: 'ok', observation: JSON.stringify(observation) };"
  cost: 'An HTTP response whose status the statusMap classifies as ok, but whose body is not valid JSON
    (or is empty), is not ended unavailable or otherwise flagged — it is silently recorded as a successful
    observation carrying an empty object (`observation: ''{}''`). domain/investigation/evidence-result
    states that only an ok result "may enter a cache", so a call that returned no usable data at all is
    eligible to be cached as if it had answered. No node states what ending an ok-classified response
    with an unparseable body should produce; the next reader who wants to know how the system treats a
    malformed response body will not find that answer in the specification, only in this catch block.'
pairs_omitted:
- node: rules/integration/an-http-connector-configuration-declares-its-method-and-status-vocabulary
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
notes: 'Judged by 1 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/http-declarative-observation-source-drift.returns/.

  1 pair(s) over 1 node(s) were decided by run/http-declarative-observation-source-drift rather than by
  a judge — a registry step decides the constraint, or a certified test decides the node — with step(s)
  lint, test-unit. No delegation read them; the run''s own log is the evidence, and it sits beside these
  returns.

  Candidates: 0 opened across 0 of 1 delegation(s); each return lists its own under `candidates_opened`.

  Unstated: 1 fact(s) the source states that no node holds, over 1 file(s), listed under `unstated`. They
  block no binding here and no rebind closes them — the route is the analysis that gives each fact a node.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/http-declarative-observation-source-drift.returns/`, which are the evidence behind every entry above.
