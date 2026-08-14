---
title: Generic HTTP adapter for IObservationSource
summary: HttpDeclarativeObservationSource, a data-driven adapter behind the unchanged IObservationSource port that resolves a concept's capability and its connector's own opaque HTTP configuration, issues exactly one fetch call bounded by the capability's own declared timeout, and classifies the result into one of the four evidence-result endings with the ok observation keyed by the capability's own output_schema.
task: sha256:9df3c330e8f45aae88d68c95c47085b5d73759841cc3cb0768a0a56fee263ee1
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/http-observation-runtime-http-declarative-observation-source-build
files:
- path: src/http-connector/http-connector-call-configuration.ts
  effect: declares the pure vocabulary a connector's own opaque configuration must additionally carry to drive an HTTP call beyond connector-call-descriptor.ts's own address/query/headers/body template — HTTP_METHODS/HttpMethod (a closed set of verbs), StatusEndingMap (an HTTP-status-string to evidence-result mapping) and HttpConnectorCallConfiguration (method + responseMap + statusMap), with no behavior of its own
- path: src/investigation/http-declarative-observation-source.adapter.ts
  effect: implements HttpDeclarativeObservationSource, the production IObservationSource adapter — resolves the concept's capability via ICapabilityQuery, resolves its connector's configuration via a locally declared IConnectorConfigurationQuery, narrows the HTTP-specific fields (method/responseMap/statusMap) with its own refusal, assembles the request through connector-request-resolver.ts's resolveConnectorRequest, issues exactly one call through an injectable httpClient (Node's global fetch by default) under an AbortController bounded by the capability's own declared timeout, classifies the response status into one of the four evidence-result endings (defaulting an unmapped or unrecognized status to 'unavailable'), and on a status mapped to 'ok' extracts the response through response-path-extractor.ts's extractResponseFields and filters the result to exactly the capability's own output_schema property names before JSON-stringifying it into ObservationOutcome.observation
- path: src/errors/capability-not-resolved-for-observation.error.ts
  effect: a typed error the adapter throws when observe-concept is called for a concept no capability currently answers — a genuine unexpected fault, never one of the four endings, propagated as a rejection
- path: src/errors/connector-configuration-not-registered.error.ts
  effect: a typed error the adapter throws when a capability's own connector names no configuration currently held by the connector-configuration registry — a registration bug, never one of the four endings, propagated as a rejection
- path: src/errors/malformed-http-connector-configuration.error.ts
  effect: a typed error the adapter throws when a connector's own configuration does not declare a recognized method, a well-formed responseMap or a well-formed statusMap — refused before any request is assembled, never one of the four endings
criteria:
- criterion: The adapter implements observeConcept(concept, subject, requester) at the existing IObservationSource port, requiring no change to the port's signature or to evidence-collection-stage.ts's call site.
  met: true
  how: 'HttpDeclarativeObservationSource implements IObservationSource with the exact signature observeConcept(concept: string, subject: Subject, requester: string): Promise<ObservationOutcome>; observation-source.port.ts and evidence-collection-stage.ts were read but not modified.'
- criterion: Each observeConcept invocation issues exactly one outbound call to the external system, never more than one per concept per collection attempt.
  met: true
  how: issueRequest calls this.httpClient(...) exactly once per observeConcept invocation, with no retry loop or repeated call anywhere in the method.
- criterion: Which external system a call reaches is resolved entirely from the calling capability's own connector value at call time; no external system's name, host or shape is hard-coded in the adapter's source, so a newly registered connector is reachable without a new deploy.
  met: true
  how: resolveConnectorConfiguration(capability.connector) reads the connector's own opaque payload from the registry at call time, and every request field (address, method, query, headers, body, response and status maps) is drawn from that payload; the file names no external host, vendor or shape literal.
- criterion: A call that completes resolves to exactly one of the four evidence-result endings (ok, unavailable, denied, timeout); ok is the only one of the four that carries an observation.
  met: true
  how: 'outcomeFromResponse always returns either {result: ending} for a non-ok ending or {result:''ok'', observation}; ObservationOutcome''s own type (Exclude<EvidenceResult,''ok''> for the non-ok branch) makes it a compile error for any other branch to carry an observation field.'
- criterion: Every HTTP response status the external system can return resolves to exactly one of the four evidence-result endings the adapter can produce; no status value falls through unclassified or causes a thrown exception in place of one of the four.
  met: true
  how: endingForStatus looks up String(response.status) in the connector's own statusMap and falls back to DEFAULT_STATUS_ENDING ('unavailable') for any status absent from the map or mapped to a value isEvidenceResult rejects, so every possible numeric status resolves to one of the four with no branch that throws.
- criterion: A call that has not completed by its own bound elapsing resolves to the timeout ending, recorded as evidence, rather than raising an exception that would abort the collection stage.
  met: true
  how: issueRequest races the fetch call against its own AbortController/setTimeout; when the abort fires first, the catch block detects controller.signal.aborted and returns {kind:'timed-out'} rather than rethrowing, and observeConcept turns that into {result:'timeout'} — never a thrown exception for this case.
- criterion: The client-side timeout the adapter applies to its own call is never greater than the calling capability's own declared timeout, so a capability's own timeout can never hold the collection stage's seven-second budget hostage past what that budget still allows.
  met: true
  how: issueRequest's timeoutMs parameter is called with capability.timeout verbatim (observeConcept's own `this.issueRequest(httpFields.method, request, capability.timeout)`) — no separate, smaller or larger connector-declared timeout exists to diverge from it, so the applied bound always equals, and therefore never exceeds, the capability's own declared value.
- criterion: The requester passed into observeConcept is available to the call the adapter constructs, never substituted by a service-level identity, for a connector whose call needs it for scoping.
  met: true
  how: observeConcept passes its own `requester` parameter straight into resolveConnectorRequest({configuration, subject, requester}) unchanged, which threads it through connector-request-resolver.ts's own ${requester} placeholder mechanism into the assembled request.
- criterion: The observation returned on the ok ending is keyed by the calling capability's own output_schema property names, never by a field name taken verbatim from the external response's own structure.
  met: true
  how: observationOf extracts fields through extractResponseFields (keyed by the connector's own responseMap field names) and then filters that object to exactly declaredFieldsOf(capability.output_schema) — citation-validation.ts's own reused helper — so only keys the capability's own output_schema declares ever survive into the returned observation, and no raw external response key can appear.
- criterion: The adapter and any HTTP client package it uses live outside the domain layer, and no domain module imports either directly.
  met: true
  how: The adapter sits under src/investigation/ as a *.adapter.ts file, the same non-domain-adapter placement fake-observation-source.adapter.ts and anthropic-hypothesis-evaluator.adapter.ts already establish; it calls Node's global fetch (no HTTP client package added to package.json); and no domain module (case behavior, investigation factory, evaluation, vocabulary) imports this file — nothing currently imports it at all, since wiring it in is a separate, dependent task.
- criterion: The translation from the external response's own structure into the returned observation happens entirely inside the adapter, never inside evidence-collection-stage.ts or any other domain module, so no source-system field name crosses past the adapter.
  met: true
  how: extraction (via response-path-extractor.ts, composed here) and the output_schema filtering both happen inside outcomeFromResponse/observationOf in this file before ObservationOutcome is ever returned; evidence-collection-stage.ts only ever receives the already-normalized, JSON-stringified opaque observation string, never a source-system field name.
nodes:
- node: contracts/investigation/observation-source
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
  how: HttpDeclarativeObservationSource is the second concrete implementation of this contract's observe-concept operation, called one call per concept, in parallel, by the same collection stage that already consumes FakeObservationSource.
- node: contracts/integration/concept-observation
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
  how: 'observeConcept realizes "observe one concept for one subject, read-only, within the requester''s scope, answering in the glossary''s vocabulary within the capability''s timeout": the requester travels unchanged (rules/investigation/collection-runs-in-the-requester-scope), the applied timeout tracks capability.timeout, and the ok observation is keyed by the glossary-vocabulary output_schema. "Read-only" is honored as the domain-level guarantee rules/integration/a-capability-is-read-only already enforces at capability registration, not as a restriction on which HTTP verb a connector''s own read endpoint happens to require (see inferences).'
- node: contracts/system/corporate-records
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
  how: One generic adapter class serves any connector's registered configuration, so which external systems currently answer observations is never fixed or enumerated in this file — a newly registered connector is reachable without a code change, and every observeConcept call issues a fresh call rather than caching, honoring "read on demand".
- node: contracts/integration/corporate-records-source
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
  how: One generic read per registered capability, resolved entirely by the capability's own connector value at call time (criterion 3); the response-normalization step this file performs keeps source-system vocabulary confined to this adapter, never crossing further into the investigation stage (criterion 11).
- node: domain/investigation/evidence-result
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
  how: Every code path (status classification, timeout branch) resolves to one of the four EVIDENCE_RESULTS values via EvidenceResult/isEvidenceResult, reusing the domain's own closed enumeration rather than a parallel one; only the ok branch carries an observation, matching "only ok carries a usable observation". The cache-admission clause ("only ok may ever enter a cache") is outside this adapter's reach — this file never caches anything.
- node: domain/integration/capability
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
  how: 'resolveCapability reads the capability''s own connector, timeout and output_schema attributes and uses each for exactly the role the node declares: connector to resolve the adapter/configuration, timeout as the single call''s own budget, output_schema to bound the returned observation''s keys. The capability''s own "resolves internally ... which attributes it needs" is honored by delegating that resolution entirely to the connector''s own opaque configuration via the already-delivered placeholder resolver, never by this adapter deciding which subject attributes matter.'
- node: rules/investigation/no-stage-aborts-on-its-deadline
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
  how: Only the "collection records a timeout result" clause reaches this task, per its own Notes; issueRequest's timed-out branch answers {result:'timeout'} rather than throwing, satisfying exactly that clause. The judgment-stage "records deadline-exceeded" clause and the persistence-as-single-exception clause belong to other, already-built or out-of-plan stages and are not reached here.
- node: rules/investigation/collection-has-its-own-budget-within-the-total
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
  how: Only "a capability's own declared timeout governs a single call" reaches this task, per its own Notes; issueRequest applies capability.timeout as the exact client-side bound for the one HTTP call it issues. The seven-second collection-wide budget and the remaining-time clamp are evidence-collection-stage.ts's own existing, unchanged orchestration and are not reached here.
- node: rules/investigation/collection-runs-in-the-requester-scope
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
  how: The requester argument is passed straight into resolveConnectorRequest unchanged and never replaced by a service-level identity anywhere in this file (criterion 8).
- node: rules/integration/evidence-arrives-in-the-glossary-vocabulary
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
  how: observationOf keys and filters the ok observation to exactly the capability's own output_schema property names before it ever becomes ObservationOutcome.observation, so what reaches the domain is glossary vocabulary, never the source system's own field names.
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
  how: Only the "the evidence for equipment-state records result timeout" clause reaches this task's criterion 6, per its own Notes; this adapter's timed-out branch demonstrates that clause generically for any concept. The evaluation's own inconclusive/no-data outcome and the investigation's overall deadline are outside this task, in the judgment and orchestration stages.
- node: constraints/the-domain-depends-on-no-infrastructure
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
  how: The adapter sits outside the four domain modules the constraint names (case behavior, investigation factory, evaluation, vocabulary), is reached only through the unchanged IObservationSource port, and names no framework, driver or HTTP client package import — it calls Node's own global fetch, adding nothing to package.json.
- node: constraints/evidence-normalization-is-an-anticorruption-layer
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
  how: 'observationOf is exactly this anticorruption boundary for the HTTP path: it never lets a key extractResponseFields produced but output_schema does not declare survive into the returned observation, so no corporate-system field name can cross into a domain element.'
inferences:
- inferred: The connector's own additional HTTP-specific configuration fields are named method, responseMap and statusMap (camelCase), reusing connector-call-descriptor.ts's own address/query/headers/body template as-is rather than introducing a competing base_url/path_template split, and StatusEndingMap keys an EvidenceResult by String(response.status).
  from: the task's own free-technical-choice grant plus connector-request-resolver.ts's own ConnectorCallDescriptor/camelCase field-naming convention and response-path-extractor.ts's own ResponseFieldPaths shape; the scope's own snake_case, base_url/path_template illustration is explicitly non-binding.
- inferred: The adapter's own applied client-side timeout for the outbound HTTP call is exactly capability.timeout, with no separate, smaller or larger connector-declared timeout field of its own.
  from: criterion 7's 'never greater than' wording together with the task's own Notes carrying forward the binder's concern that an arbitrary, capability-unrelated constant would satisfy the criterion's literal wording while no longer letting the capability's own declared timeout actually govern the call — using the capability's own value directly, rather than a min() against a second connector-declared figure, ties the applied bound to it unconditionally.
- inferred: An HTTP status absent from a connector's own statusMap, or mapped to a value that is not one of the four evidence-result endings, resolves to 'unavailable'.
  from: the task's own Notes stating this classification is the implementer's free technical choice; 'unavailable' was chosen as the closest of the four to 'the call reached the system but nothing usable came back', the same reading evidence-collection-stage.ts's own unavailableEvidence already gives an unresolved capability, and matching the scope's own (non-binding) illustration's own '?? unavailable' default.
- inferred: The ok observation is filtered to exactly the calling capability's own output_schema declared properties (via citation-validation.ts's own declaredFieldsOf), dropping any field the connector's own responseMap names but the capability's own output_schema does not declare.
  from: criterion 9's literal wording ('keyed by the calling capability's own output_schema property names') and the inventory's own must_not_duplicate entry calling out declaredFieldsOf's reuse for exactly a response_map-to-output_schema validation.
- inferred: A capability or connector-configuration lookup that resolves as absent inside this adapter's own observeConcept (a race with whatever already checked either before calling it) is a genuine unexpected fault raised as a typed error, never degraded to one of the four evidence-result endings; the same for a malformed connector configuration.
  from: evidence-collection-stage.ts's own documented convention that a genuine rejection propagates uncaught, and the scope's own (non-binding) algorithm explicitly distinguishing 'descriptor absent → configuration error, not one of the four finals' from an HTTP status classification, corroborated by the inventory's own risk note describing exactly this branch.
- inferred: A connector's own declared HTTP method is not restricted to GET; POST, PUT, PATCH and DELETE are also accepted, since the specification's 'read-only' assertion (contracts/integration/concept-observation, contracts/system/corporate-records, contracts/integration/corporate-records-source) is a domain-level guarantee already enforced at capability registration (rules/integration/a-capability-is-read-only), not a constraint on which HTTP verb a connector's own existing read/query endpoint happens to require.
  from: intake/scope.md's own second illustrated connector (a read-only 'network-outage-connector' issuing POST) and task/http-observation-runtime/descriptor-placeholder-resolver.md's own Notes, which explicitly deferred 'the read-only assertion ... to whichever task fixes or dispatches a connector's HTTP method' — this task.
- inferred: The adapter's constructor takes the capability and connector-configuration reads through interfaces (ICapabilityQuery and a locally declared IConnectorConfigurationQuery, satisfied structurally by ConnectorConfigurationRegistryService without modifying it) rather than the concrete registry classes, and takes an optional httpClient defaulting to the global fetch.
  from: this codebase's own established interface-injection convention (ICapabilityQuery's own precedent) and the task's own Notes stating testability with a fake HTTP client and fixture descriptors as the scope's own stated expectation, so no unit test needs a real network call or a real store.
- inferred: A request body is sent as JSON.stringify(body) unless it is already a plain string, and no header (e.g. content-type) is injected automatically by the adapter.
  from: 'connector-call-descriptor.ts''s own AssembledConnectorRequest.body: unknown leaving the shape open, and the scope''s own illustration explicitly declaring content-type itself inside headers_template rather than relying on adapter-side injection — keeping the adapter fully data-driven rather than assuming a content type no connector configuration stated.'
- inferred: A response body that cannot be parsed as JSON on the ok path is treated as undefined rather than causing a thrown fault, so extraction simply finds nothing at every path rather than aborting the call.
  from: response-path-extractor.ts's own established posture that an unresolved path is reported as nothing found rather than thrown, extended by symmetry to a body that cannot even be parsed.
preserved:
- 'IObservationSource''s own signature (observeConcept(concept, subject, requester): Promise<ObservationOutcome>) and evidence-collection-stage.ts''s own call site against it, both left untouched per criterion 1.'
- FakeObservationSource and observation-source.port.ts, unmodified, per the task's own instruction.
- 'evidence-collection-stage.ts''s own timeout race (raceObservation/effectiveBoundMsFor): it must keep resolving to ''timeout'' once its own bound elapses and keep discarding whatever observeConcept eventually settles with afterward; this adapter''s own applied timeout never exceeds that outer bound''s own governing value (capability.timeout), so the underlying HTTP call is always itself eventually aborted rather than left running past what the collection stage already used to answer.'
- citation-validation.ts's own field-existence check against a capability's output_schema (a-cited-field-exists-in-the-capability-output-schema), which now receives real HTTP-sourced observations for the first time — this adapter's own output_schema filtering is what keeps that check's field names exactly matching.
- connector-configuration-registry.service.ts's and connector-configuration.ts's own opaque, uninterpreted persistence of ConnectorConfiguration.configuration — both continue accepting and returning any payload shape verbatim, including this task's own method/responseMap/statusMap additions, with no change to either file.
deferred:
- what: Wiring HttpDeclarativeObservationSource into diagnose-server.factory.ts / production-diagnose.factory.ts in place of FakeObservationSource, retiring observations.json's production role, reconciling OBSERVATIONS_FIXTURE_FILE in env.ts, and adding a src/factories/*.factory.ts wiring point for this new adapter.
  why: task/http-observation-runtime/production-wiring-swap is the separate, already-planned dependent task that owns exactly this change and its own e2e/integration-spec consumers; this task's own criteria never touch evidence-collection-stage.ts's callers or any factory.
- what: Registration-time validation that a connector configuration's method/responseMap/statusMap are well-formed, and that responseMap covers every property the corresponding capability's own output_schema declares.
  why: connector-configuration-registry.service.ts's own registerConnector deliberately treats the configuration payload as opaque and validates none of its keys ('nothing here reads or constrains a key inside it'); this task only refuses a malformed configuration at call time (MalformedHttpConnectorConfigurationError), and retrofitting the registration path is outside this task's own file set and belongs to task/connector-registration/connector-configuration-persistence.
- what: An allowlist of hosts/domains a connector's own address template may resolve to (SSRF hardening).
  why: intake/scope.md itself records this as an open, undecided operational question, not a criterion this task states.
---

## What it is

The generic, data-driven adapter behind the unchanged IObservationSource port — the scope's own HttpDeclarativeObservationSource — composing the two already-delivered translation modules (request assembly, response extraction) and the already-delivered connector-configuration registry into one HTTP call per observeConcept invocation.
Its answer is always exactly one of the four evidence-result endings, never an exception, for whatever HTTP status the external system returns, with the client-side timeout tracking the calling capability's own declared value.

## Notes

The connector's own HTTP-specific configuration shape (method, responseMap, statusMap) and the unmapped-status default (unavailable) are this task's own free technical design, per its own Notes; only the totality of the classification and the never-throw contract are held as criteria.
No HTTP client package was added — Node's global fetch is used directly, since none of the standard's authorized dependencies includes one.
A connector's HTTP method is not restricted to GET: the specification's read-only guarantee is enforced at capability registration, not by this adapter refusing a verb.
Nothing wires this adapter into production yet — that lands in task/http-observation-runtime/production-wiring-swap, which depends on this task.
