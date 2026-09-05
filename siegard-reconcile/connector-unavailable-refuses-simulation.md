---
contract_version: siegard-reconcile/3
title: Review of connector-unavailable-refuses-simulation's delivered change
summary: 'Written by the delivery of task/connector-observation-failure-classification/classify-connector-network-failure-as-unavailable
  under the connector-unavailable-refuses-simulation initiative, as its implementation record states:
  HttpDeclarativeObservationSource now catches a transport-layer connector rejection and resolves it to
  an unavailable observation naming ConnectorUnreachableError and the connector, instead of letting it
  propagate uncaught out of observeConcept.'
target: backend
files:
- path: src/__tests__/unit/errors/connector-unreachable.error.spec.ts
  change: written by the delivery of task/connector-observation-failure-classification/classify-connector-network-failure-as-unavailable
- path: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  change: written by the delivery of task/connector-observation-failure-classification/classify-connector-network-failure-as-unavailable
- path: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  change: written by the delivery of task/connector-observation-failure-classification/classify-connector-network-failure-as-unavailable
- path: src/__tests__/unit/investigation/judgment-stage.spec.ts
  change: written by the delivery of task/connector-observation-failure-classification/classify-connector-network-failure-as-unavailable
- path: src/errors/connector-unreachable.error.ts
  change: New typed error class ConnectorUnreachableError, following the project's existing error-class
    shape (name, message, readonly context). Its context carries only the connector's registered name;
    its constructor accepts an optional ErrorOptions so the underlying transport rejection can be attached
    as .cause without that cause ever reaching a caller-visible field.
- path: src/investigation/http-declarative-observation-source.adapter.ts
  change: 'observeConcept''s issuing step now goes through a new private issueRequestOrUnreachable, which
    wraps the existing issueRequest call in a try/catch. Any rejection it catches is guaranteed non-timeout
    (issueConnectorHttpCall already returns { kind:''timed-out'' } rather than throwing on its own deliberate
    abort), so the catch resolves to { result: ''unavailable'', result_detail: ''<ConnectorUnreachableError>:
    <connector>'' } via a new unavailableForUnreachableConnector helper, instead of letting the rejection
    propagate. Every other resolution step (capability, connector configuration, HTTP configuration validation,
    request assembly) and all post-response processing are untouched.'
nodes:
- node: constraints/evidence-normalization-is-an-anticorruption-layer
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at observationOf(), lines\
    \ 230-234 — function observationOf(capability: Capability, responseMap: ResponseFieldPaths, body:\
    \ unknown): Record<string, unknown> {\n  const extracted = extractResponseFields(responseMap, body);\n\
    \  const declaredFields = declaredFieldsOf(capability.output_schema);\n  return Object.fromEntries(Object.entries(extracted).filter(([field])\
    \ => declaredFields.includes(field)));\n}"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at the adapter''s own boundary
    — it alone imports the fetch driver and implements IObservationSource, lines 37 and 65 — readonly
    httpClient?: typeof fetch;

    ...

    export class HttpDeclarativeObservationSource implements IObservationSource {'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/integration/concept-observation
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at observeConcept(), lines
    76-91 — public async observeConcept({ concept, subject, requester, remainingBudgetMs }: ObserveConceptOptions):
    Promise<ObservationOutcome> {'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/integration/corporate-records-source
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at resolveConnectorConfiguration(),
    lines 104 and 139-147, resolved generically by capability.connector — const configurationResolution
    = await this.resolveConnectorConfiguration(capability.connector);'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/investigation/observation-source
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at observeConcept(), line
    76 — one call per concept — public async observeConcept({ concept, subject, requester, remainingBudgetMs
    }: ObserveConceptOptions): Promise<ObservationOutcome> {'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/system/corporate-records
  conforms: false
  how: 'no named file holds this fact now: src/investigation/http-declarative-observation-source.adapter.ts
    read `nowhere` — const configurationResolution = await this.resolveConnectorConfiguration(capability.connector);
    — no source system is ever named, only the capability''s own connector'
  observed_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/integration/capability
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at effectiveTimeoutMsFor(),\
    \ lines 61-63, and capability.connector/output_schema uses at lines 83, 104, 232 — function effectiveTimeoutMsFor(capability:\
    \ Capability, remainingBudgetMs: number | undefined): number {\n  return remainingBudgetMs === undefined\
    \ ? capability.timeout : Math.min(capability.timeout, remainingBudgetMs);\n}"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/investigation/evidence-result
  conforms: false
  how: 'src/investigation/http-declarative-observation-source.adapter.ts, httpConfigurationProblems(),
    line 265: problems.push(''statusMap is not a plain object mapping a status to one of ok, unavailable,
    denied, timeout''); — The four evidence-result endings are hand-copied here rather than read from
    EVIDENCE_RESULTS, the array isEvidenceResult (and therefore isStatusEndingMap) actually validates
    statusMap''s values against; a fifth ending added to the enumeration would be accepted by the real
    validation while this message kept naming only the original four, so the message stops describing
    what the code accepts.'
  observed_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/an-http-connector-configuration-declares-its-call
  conforms: false
  how: 'src/investigation/http-declarative-observation-source.adapter.ts, httpConfigurationProblems(),
    line 259: problems.push(''method is not one of GET, POST, PUT, PATCH, DELETE''); — The five accepted
    methods are hand-copied into this diagnostic string rather than read from HTTP_METHODS, the same list
    isHttpMethod actually validates configuration.method against; if the rule ever admits a sixth method,
    isHttpMethod (reading the canonical list) would accept it while this message kept telling an operator
    only these five are valid — the message and the acceptance rule can silently drift apart because nobody
    has to touch this line to make the rule change take effect elsewhere.'
  observed_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/an-unclassified-status-ends-unavailable
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at endingForStatus()/DEFAULT_STATUS_ENDING,\
    \ lines 32 and 217-220 — function endingForStatus(statusMap: StatusEndingMap, status: number): EvidenceResult\
    \ {\n  const mapped = statusMap[String(status)];\n  return isEvidenceResult(mapped) ? mapped : DEFAULT_STATUS_ENDING;\n\
    }"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/an-unreachable-connector-ends-unavailable
  conforms: true
  how: "src/errors/connector-unreachable.error.ts: held at the constructor of ConnectorUnreachableError,\
    \ lines 4-7 — super(`connector \"${connector}\"'s own call could not be issued: no HTTP response was\
    \ ever received`, options);\nthis.name = 'ConnectorUnreachableError';\nthis.context = { connector\
    \ };\nsrc/investigation/http-declarative-observation-source.adapter.ts: held at unavailableForUnreachableConnector()/issueRequestOrUnreachable(),\
    \ lines 56-59 and 187-200 — function unavailableForUnreachableConnector(connector: string, cause:\
    \ unknown): ObservationOutcome {\n  const error = new ConnectorUnreachableError(connector, { cause\
    \ });\n  return { result: 'unavailable', result_detail: `${error.name}: ${connector}` };\n}"
  encoded_at:
  - src/errors/connector-unreachable.error.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at resolveCapability()/resolveConnectorConfiguration()/resolveAssembledRequest(),\
    \ lines 123-176 — if (!resolution.held) {\n      return { ok: false, outcome: unavailableFor(new CapabilityNotResolvedForObservationError(concept))\
    \ };\n    }"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/evidence-arrives-in-the-glossary-vocabulary
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at outcomeFromResponse()/observationOf(),\
    \ lines 203-215 and 230-234 — const observation = observationOf(capability, configuration.responseMap,\
    \ body);\n  return { result: 'ok', observation: JSON.stringify(observation) };"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/collection-has-its-own-budget-within-the-total
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at effectiveTimeoutMsFor(),
    lines 61-63 — return remainingBudgetMs === undefined ? capability.timeout : Math.min(capability.timeout,
    remainingBudgetMs);'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/collection-runs-in-the-requester-scope
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at resolveAssembledRequest(),
    lines 163-176, requester threaded through — return { ok: true, value: resolveConnectorRequest({ configuration,
    subject, requester }) };'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at observeConcept(), lines\
    \ 87-89 — if (call.value.kind === 'timed-out') {\n      return { result: 'timeout' };\n    }"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: scenarios/integration/an-optional-attribute-absent-degrades-its-observation
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at resolveAssembledRequest(),\
    \ lines 163-176 — if (error instanceof ConnectorPlaceholderNotResolvedError || error instanceof IncompleteConnectorCallDescriptorError)\
    \ {\n        return { ok: false, outcome: unavailableFor(error) };\n      }"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at observeConcept(), lines\
    \ 87-89 — if (call.value.kind === 'timed-out') {\n      return { result: 'timeout' };\n    }"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at effectiveTimeoutMsFor(),
    lines 61-63 — return remainingBudgetMs === undefined ? capability.timeout : Math.min(capability.timeout,
    remainingBudgetMs);'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
unstated:
- file: src/investigation/http-declarative-observation-source.adapter.ts
  where: parsedBodyOrUndefined() and outcomeFromResponse(), lines 203-215 and 222-228
  evidence: "async function parsedBodyOrUndefined(response: Response): Promise<unknown> {\n  try {\n \
    \   return await response.json();\n  } catch {\n    return undefined;\n  }\n}\n... const body = await\
    \ parsedBodyOrUndefined(response);\n  const observation = observationOf(capability, configuration.responseMap,\
    \ body);\n  return { result: 'ok', observation: JSON.stringify(observation) };"
  cost: When the connector's statusMap classifies the HTTP status as ok but the response body does not
    parse as JSON, the collection still records result 'ok' — the one ending domain/investigation/evidence-result's
    own description reserves for a usable observation — built from a body the adapter itself just failed
    to parse. No node says what should happen to a source system's unparseable response on an otherwise-ok
    status; a reader checking the specification for that case finds nothing, because the choice to still
    call it ok, silently, from an empty/undefined body, was made only here.
unbound:
- src/__tests__/unit/errors/connector-unreachable.error.spec.ts
- src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
- src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
- src/__tests__/unit/investigation/judgment-stage.spec.ts
notes: 'Judged by 2 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/connector-unavailable-refuses-simulation.returns/.

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) rules/integration/an-unreachable-connector-ends-unavailable,
  domain/investigation/evidence-result, rules/investigation/an-inconclusive-evaluation-declares-its-reason,
  rules/investigation/one-evaluation-per-required-hypothesis were read on every file and answered for,
  and bound from nowhere here — a binding this record writes is one the trace already held.

  Candidates: 0 opened across 0 of 2 delegation(s); each return lists its own under `candidates_opened`.

  Unstated: 1 fact(s) the source states that no node holds, over 1 file(s), listed under `unstated`. They
  block no binding here and no rebind closes them — the route is the analysis that gives each fact a node.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/connector-unavailable-refuses-simulation.returns/`, which are the evidence behind every entry above.
