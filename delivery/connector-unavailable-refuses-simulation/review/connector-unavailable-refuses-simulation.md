---
title: Review of connector-unavailable-refuses-simulation
summary: 'Four passes over the six files task/connector-observation-failure-classification/classify-connector-network-failure-as-unavailable delivered: coverage of its six criteria, per-file specification conformance folded into siegard-reconcile/connector-unavailable-refuses-simulation.md, the backend standard''s reading rules, and the diagnosis of the one failure the captured run reported.'
reviewed:
- src/errors/connector-unreachable.error.ts
- src/investigation/http-declarative-observation-source.adapter.ts
- src/__tests__/unit/errors/connector-unreachable.error.spec.ts
- src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
- src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
- src/__tests__/unit/investigation/judgment-stage.spec.ts
tasks:
- task/connector-observation-failure-classification/classify-connector-network-failure-as-unavailable
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
coverage:
- criterion: 'A connector call that HttpDeclarativeObservationSource actually issues (i.e. capability resolution, connector configuration resolution, HTTP configuration validation and request assembly all already succeeded) and whose issuing step rejects before any HTTP response is received, for a reason other than the timeout AbortController firing, resolves observeConcept to { result: ''unavailable'', result_detail: ''ConnectorUnreachableError'' } naming the connector, and does not throw, and that result_detail carries no part of the call''s own assembled address, query, headers or body — while every rejection during capability resolution, connector configuration resolution, HTTP configuration validation or request assembly keeps ending unavailable with its own existing cause name (CapabilityNotResolvedForObservationError, DuplicateConceptAnswerError, ConnectorConfigurationNotRegisteredError, ConnectorPlaceholderNotResolvedError, MalformedHttpConnectorConfigurationError or IncompleteConnectorCallDescriptorError),
    unrelabeled, and a failure that happens after an HTTP response was already received (parsing its body, extracting its fields, or normalizing them into the glossary vocabulary) is untouched by this task.'
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: resolves to unavailable naming ConnectorUnreachableError and the connector, rather than throwing, when the issuing call rejects before any HTTP response is received
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: classifies a DNS-resolution-style TypeError the same way as any other transport rejection, resolving to unavailable rather than throwing
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: classifies a rejection that is not an Error instance at all as unavailable too, rather than crashing while building the cause
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: classifies an abort-shaped rejection as unavailable rather than timeout when the capability's own timeout controller never actually fired
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: keeps result_detail free of the call's own assembled address, query, headers and body, naming only the cause and the connector
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: answers unavailable naming CapabilityNotResolvedForObservationError, issuing no call, when no capability currently answers the concept
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: answers unavailable naming DuplicateConceptAnswerError, issuing no call, when more than one registered capability currently answers the concept
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: answers unavailable naming ConnectorConfigurationNotRegisteredError, issuing no call, when the capability's own connector names no configuration currently registered
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: answers unavailable naming MalformedHttpConnectorConfigurationError, issuing no call, when the connector's own configuration does not declare a recognized method
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: answers unavailable naming MalformedHttpConnectorConfigurationError, issuing no call, when the connector's own configuration does not declare a responseMap
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: answers unavailable naming MalformedHttpConnectorConfigurationError, issuing no call, when the connector's own configuration does not declare a statusMap
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: answers unavailable naming ConnectorPlaceholderNotResolvedError, issuing no call, when the connector call embeds a Subject-attribute placeholder the given Subject does not carry
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: answers unavailable naming ConnectorPlaceholderNotResolvedError, issuing no call, when the connector call embeds a credential placeholder naming an environment variable that is not set
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: answers unavailable naming IncompleteConnectorCallDescriptorError, issuing no call, when the connector configuration is missing its address
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: answers unavailable naming IncompleteConnectorCallDescriptorError, issuing no call, when the connector configuration declares headers as an object whose own value is not a string
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: answers unavailable naming IncompleteConnectorCallDescriptorError, issuing no call, when the connector configuration declares query as something other than an object of string values
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: answers unavailable naming IncompleteConnectorCallDescriptorError, issuing no call, when the connector configuration embeds a placeholder naming a kind this connector does not recognize
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: answers unavailable naming IncompleteConnectorCallDescriptorError, issuing no call, when the connector configuration embeds a subject placeholder naming no attribute at all
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: treats a response body that is not valid JSON as nothing extracted, rather than throwing, on the ok path
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: resolves to the timeout ending, rather than throwing, once its own bound elapses before the call completes
  - file: src/__tests__/unit/errors/connector-unreachable.error.spec.ts
    name: names itself ConnectorUnreachableError and carries only the connector in its context
  - file: src/__tests__/unit/errors/connector-unreachable.error.spec.ts
    name: names only the connector in its own message, never an address, query, header or body value
  - file: src/__tests__/unit/errors/connector-unreachable.error.spec.ts
    name: preserves the underlying transport rejection as its own cause, even though nothing reads it back out through a caller-visible field
  why: The criterion's closing clause names three post-response stages that must stay untouched, and only one of them is driven to failure. 'Treats a response body that is not valid JSON as nothing extracted, rather than throwing, on the ok path' exercises a body-parsing failure after a response was received and pins the ending to ok, so parsing is guarded. Nothing in the set drives a failure while extracting the response's fields, nor while normalizing them into the glossary vocabulary — the one test reaching those stages, 'keys the ok observation by the capability's own output_schema property names…', drives them on a wholly successful path, so a change that began relabeling an extraction or normalization failure as ConnectorUnreachableError would not fail any test here. The 'does not throw' half is exercised throughout, since each rejection test awaits observeConcept and asserts a resolved value; the no-leak half is exercised exactly, because the marker-value test asserts the whole outcome
    by equality against a result_detail naming only the cause and the connector while the configuration carries distinct address, query, header and body markers.
- criterion: The evidence recorded for that concept carries result unavailable and a result_detail naming ConnectorUnreachableError and the connector, the same shape as the existing unavailable causes.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: records evidence naming ConnectorUnreachableError and the connector, the same shape as an existing unavailable cause, when the real adapter's own connector call rejects before any response
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: carries %s as the evidence result_detail for a held capability whose observation ends unavailable for that cause (rules/integration/an-unresolvable-observation-ends-unavailable, rules/integration/an-http-connector-configuration-declares-its-call)
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: records a concept nothing currently answers as unavailable, carrying result_detail exactly equal to "CapabilityNotResolvedForObservationError", and never attempts to call observe-concept for it (rules/integration/an-unresolvable-observation-ends-unavailable)
- criterion: The unavailable observation this failure produces is never written into the evidence cache, consistent with only an ok result ever entering it.
  state: uncovered
  why: 'No test in the set reaches the evidence cache at all. collectEvidence is called throughout with capabilities, glossary and an observation source and no cache collaborator, and no double in any of the four files records or refuses a write, so nothing observes whether this unavailable observation entered the cache. The set therefore never exercises either half of the criterion: not that this unavailable result stays out, and not the ''only an ok result ever enters it'' rule it is said to be consistent with.'
- criterion: A hypothesis whose collection plan includes that concept is judged inconclusive with reason no-data, citing that evidence, exactly as a-collection-timeout-degrades-to-no-data already does for a timeout.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: judges a hypothesis inconclusive no-data, citing the evidence, when its own evidence carries the connector-unreachable cause — while a sibling hypothesis whose own evidence is ok is judged normally, unaffected — mirroring the mechanism a-collection-timeout-degrades-to-no-data already exercises for a timeout
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: records inconclusive no-data citing every non-ok evidence item, and never enters the pool for that hypothesis
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: 'omits the field key entirely from each citation a no-data evaluation constructs for its non-ok evidence — never field: '''' — so ''field'' in citation is false for every one of them'
- criterion: A hypothesis in the same case whose collection plan does not include that concept is judged normally, unaffected by the other hypothesis's collection failure.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: judges a hypothesis inconclusive no-data, citing the evidence, when its own evidence carries the connector-unreachable cause — while a sibling hypothesis whose own evidence is ok is judged normally, unaffected — mirroring the mechanism a-collection-timeout-degrades-to-no-data already exercises for a timeout
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: answers exactly one evaluation per required hypothesis, in the case's declared order, none omitted or duplicated
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: proceeds with every other concept unaffected — settling to its own ok ending — when one concept collected in the same Promise.all batch degrades to unavailable through this catch
- criterion: A simulate-case or simulate-hypothesis call whose subject is missing the attribute this concept would have needed is not refused for that reason, consistent with a-simulated-subject-missing-a-requirement-degrades-not-refuses; the connector's own timeout-abort path (already handled) is unchanged.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: resolves to the timeout ending, rather than throwing, once its own bound elapses before the call completes
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: resolves to timeout immediately when the capability declares a zero-length timeout, the lower boundary
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: classifies an abort-shaped rejection as unavailable rather than timeout when the capability's own timeout controller never actually fired
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: bounds its call by the caller's own smaller remaining-budget bound, settling to timeout before the capability's own longer declared timeout would have elapsed
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: resolves to timeout immediately when the remaining-budget bound is zero, the lower boundary, even though the capability declares a much longer timeout of its own
  why: 'The timeout-abort half is exercised: the timeout tests drive the AbortController to fire and pin the ending to timeout, and the abort-shaped-rejection test pins the boundary the other way, so a change collapsing the two paths would fail. The simulate half is not exercised at all — no test in the set invokes simulate-case or simulate-hypothesis, and none constructs a subject missing the attribute this concept would have needed and observes that the call is answered rather than refused. The nearest test, ''answers unavailable naming ConnectorPlaceholderNotResolvedError, issuing no call, when the connector call embeds a Subject-attribute placeholder the given Subject does not carry'', drives observeConcept directly rather than a simulate call, and establishes the observation''s own unavailable ending, not that a simulate call declines to refuse for that reason.'
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
failures_counted: 1
run: run/connector-unavailable-refuses-simulation
reconciliation: siegard-reconcile/connector-unavailable-refuses-simulation.md
findings:
- pass: conformance
  file: src/investigation/http-declarative-observation-source.adapter.ts
  where: httpConfigurationProblems(), line 259
  evidence: problems.push('method is not one of GET, POST, PUT, PATCH, DELETE');
  cost: '[contradicts rules/integration/an-http-connector-configuration-declares-its-call] The five accepted methods are hand-copied into this diagnostic string rather than read from HTTP_METHODS, the same list isHttpMethod actually validates configuration.method against; if the rule ever admits a sixth method, isHttpMethod (reading the canonical list) would accept it while this message kept telling an operator only these five are valid — the message and the acceptance rule can silently drift apart because nobody has to touch this line to make the rule change take effect elsewhere.'
  correction: Build the message from HTTP_METHODS (e.g. a joined list) instead of a literal enumeration.
- pass: conformance
  file: src/investigation/http-declarative-observation-source.adapter.ts
  where: httpConfigurationProblems(), line 265
  evidence: problems.push('statusMap is not a plain object mapping a status to one of ok, unavailable, denied, timeout');
  cost: '[contradicts domain/investigation/evidence-result] The four evidence-result endings are hand-copied here rather than read from EVIDENCE_RESULTS, the array isEvidenceResult (and therefore isStatusEndingMap) actually validates statusMap''s values against; a fifth ending added to the enumeration would be accepted by the real validation while this message kept naming only the original four, so the message stops describing what the code accepts.'
  correction: Build the message from EVIDENCE_RESULTS instead of a literal enumeration.
- pass: conformance
  file: src/investigation/http-declarative-observation-source.adapter.ts
  where: parsedBodyOrUndefined() and outcomeFromResponse(), lines 203-215 and 222-228
  evidence: "async function parsedBodyOrUndefined(response: Response): Promise<unknown> {\n  try {\n    return await response.json();\n  } catch {\n    return undefined;\n  }\n}\n... const body = await parsedBodyOrUndefined(response);\n  const observation = observationOf(capability, configuration.responseMap, body);\n  return { result: 'ok', observation: JSON.stringify(observation) };"
  cost: '[a fact the source states and no node holds] When the connector''s statusMap classifies the HTTP status as ok but the response body does not parse as JSON, the collection still records result ''ok'' — the one ending domain/investigation/evidence-result''s own description reserves for a usable observation — built from a body the adapter itself just failed to parse. No node says what should happen to a source system''s unparseable response on an otherwise-ok status; a reader checking the specification for that case finds nothing, because the choice to still call it ok, silently, from an empty/undefined body, was made only here.'
  correction: The specification would need to state the ending an unparseable body produces on an ok-classified status (e.g. the same unavailable ending an unclassified status gets); the adapter would then check the parse outcome instead of defaulting silently to undefined.
- pass: conformance
  file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  where: expectedOkEvidence and expectedNonOkEvidence (lines 277-319), and expectedUnavailableEvidence (lines 321-337), used by every it(...) in the file
  evidence: 'capability_name: context.capability.name,

    capability_version: context.capability.version,

    (expectedNonOkEvidence, lines 313-314; the same pair appears in expectedOkEvidence, lines 290-291)

    and, for a concept whose capability never resolved:

    origin: '''',

    ...

    capability_name: '''',

    capability_version: '''',

    (expectedUnavailableEvidence, lines 328, 331-332)

    '
  cost: '[a fact the source states and no node holds] domain/investigation/evidence.md declares only a `reference` relationship to domain/integration/capability (cardinality "1") and no capability_name or capability_version attribute at all; a reader who opens that node to learn what an evidence item discloses about the capability that produced it — and what it discloses when none resolved — finds no such fields and no honest-empty rule for them, while every test in this file, and by implication the source it exercises, already treats capability_name, capability_version and origin''s empty-string default as settled facts. The next person to touch Evidence''s shape has no specification record of two of its fields or of what they read when a capability never resolved.'
  correction: domain/investigation/evidence.md would need capability_name and capability_version declared as attributes (or the capability reference's own materialization stated), with the honest-empty degradation for an unresolved capability recorded the same way elapsed_ms, fields and concept_description already are.
- pass: conformance
  file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  where: the it() block at lines 136–146, 'imports no HTTP client package, reaching the network only through the platform global fetch'
  evidence: const forbidden = ['axios', 'node-fetch', 'got', 'undici', 'superagent', 'request'];
  cost: '[a fact the source states and no node holds] the rule that this adapter must reach the network only through the platform''s global fetch, and never through any of a named list of HTTP client packages, lives only in this test; a reader looking for the specification''s own statement of which transport the HTTP connector kind is bound to finds nothing under the specification root, and a future connector or a swapped HTTP library could depart from a rule nobody wrote down'
  correction: state, as an architecture constraint or as part of the HTTP connector's own rule, that the connector reaches the network only through the platform's global fetch
- pass: conformance
  file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  where: the it() title at line 424, the timeout/remaining-budget boundary-equality test
  evidence: '"remains bounded by the capability''s own declared timeout when the caller''s given remaining-budget bound equals it exactly, the shared boundary ''at or above'' names"'
  cost: '[a fact the source states and no node holds] the title asserts that the specification names a boundary ''at or above'' for which bound governs when the capability''s own timeout and the caller''s remaining-budget bound are exactly equal; no node under the specification root uses that phrase or names such a boundary at all, so a reader chasing this citation into the specification finds nothing, and the tie-break rule at exact equality lives only in this test and in whichever comparison operator the adapter happens to use'
  correction: state, in the budget rule that governs a capability's timeout against the collection stage's remaining time, which bound governs at exact equality
- pass: conformance
  file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  where: the it() block at lines 802–813, 'treats a response body that is not valid JSON as nothing extracted, rather than throwing, on the ok path'
  evidence: 'expect(outcome).toEqual({ result: ''ok'', observation: JSON.stringify({}) });'
  cost: '[a fact the source states and no node holds] domain/investigation/evidence-result holds that only ok carries a usable observation and only ok may enter the evidence cache; whether a response body that fails to parse at all should still register as ok (with an empty extracted observation cached as if it were a successful read) or should instead be recorded as unavailable is a business choice the specification never states, and it currently lives only in this test and the adapter it proves'
  correction: state, alongside the responseMap/statusMap rule or the evidence-result enumeration, whether an unparseable response body ends ok-with-nothing-extracted or unavailable
- pass: standard
  file: src/investigation/http-declarative-observation-source.adapter.ts
  where: lines 238–288, `asHttpConnectorCallConfiguration` / `refuseHttpConfigurationDepartures` / `httpConfigurationProblems` / `isHttpMethod` / `isStringRecord` / `isStatusEndingMap` / `isPlainObject`
  evidence: "function refuseHttpConfigurationDepartures(\n  connector: string,\n  configuration: Readonly<Record<string, unknown>>,\n): asserts configuration is DeclaredHttpConnectorCallConfiguration {\n  const problems = httpConfigurationProblems(configuration);\n  if (problems.length > 0) {\n    throw new MalformedHttpConnectorConfigurationError(connector, problems);\n  }\n}\n\nfunction httpConfigurationProblems(configuration: Readonly<Record<string, unknown>>): string[] {\n  const problems: string[] = [];\n  if (!isHttpMethod(configuration.method)) {\n    problems.push('method is not one of GET, POST, PUT, PATCH, DELETE');\n  }\n  if (!isStringRecord(configuration.responseMap)) {\n    problems.push('responseMap is not a plain object of string values');\n  }\n  if (!isStatusEndingMap(configuration.statusMap)) {\n    problems.push('statusMap is not a plain object mapping a status to one of ok, unavailable, denied, timeout');\n  }\n  return problems;\n}\n\nfunction isHttpMethod(value: unknown):\
    \ value is HttpMethod {\n  return typeof value === 'string' && (HTTP_METHODS as readonly string[]).includes(value);\n}\n"
  cost: The connector's declared HTTP call configuration — method, responseMap, statusMap — is boundary data read back out of the connector registry, and it is narrowed by four hand-written type guards (`isHttpMethod`, `isStringRecord`, `isStatusEndingMap`, `isPlainObject`) feeding a custom assertion function, rather than by a Zod schema. When a field is added or a shape rule changes on the Zod side that governs every other boundary in this service, this one guard has no schema to consult and nothing forces it to move in step, so it is exactly the guard the rule anticipates as the one nobody keeps in sync.
  correction: Replace `isHttpMethod`, `isStringRecord`, `isStatusEndingMap`, `isPlainObject` and `httpConfigurationProblems` with a Zod schema (method as a `z.enum` of `HTTP_METHODS`, `responseMap` as `z.record(z.string())`, `statusMap` as a record of the evidence-result enum), and have `asHttpConnectorCallConfiguration` call that schema's `parse`/`safeParse` instead of `refuseHttpConfigurationDepartures`.
  cites: STK-08
- pass: failures
  file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
  where: answers an elapsed_ms reflecting the real wall-clock time the provider call itself took, rather than a fixed value (line 193)
  evidence: "AssertionError: expected 19 to be greater than or equal to 20\n ❯ src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts:193:30\n    193|   expect(outcome.elapsed_ms).toBeGreaterThanOrEqual(20);"
  cost: 'A run over the connector-unavailable-refuses-simulation change reports a suite failure that says nothing about that change: the failing assertion times a real setTimeout(20) mock (line 187) against a hard `>= 20` floor, and the measured elapsed_ms of 19 is the scheduler firing the timer a millisecond early under load — a jitter the same suite did not hit minutes earlier on the same tree (152 files, 1883 tests, all green). Left uninvestigated, this reads as evidence against the change under review when it is evidence against nothing the change touched.'
  correction: The assertion's floor should tolerate real-clock scheduling jitter (e.g. assert elapsed_ms is close to, rather than never under, the mocked delay, or widen the floor below 20), since a real wall-clock measurement around a setTimeout mock is inherently subject to the scheduler firing a beat early; this is unrelated to any node the change under review implements.
  cause: setup
---

## What it is
The review record of the one task the connector-unavailable-refuses-simulation initiative delivered, computed over its six files.

## Notes
The captured run's single failure is in src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts, a file outside the reviewed set; the failures pass diagnosed it as cause setup — a real-clock setTimeout(20) mock measured at 19 ms under scheduler jitter — and the same suite over the same tree passed whole in run/connector-observation-failure-classification-classify-connector-network-failure-as-unavailable-suite-6 minutes earlier.
The conformance pass judged all six files, one delegation each; the reconciliation record folds the two source files' returns, and the four test files stand under its `unbound` because the trace binds nothing to them — their four returns are kept verbatim beside the folded ones at siegard-reconcile/connector-unavailable-refuses-simulation.test-file-returns/, and every finding they carry is recorded here under conformance.
Staging the fold needed one correction outside the framework's own path: trace.py --stage --review with --node placed the four unbound test files under files rather than unbound, which --fold then refused; the workspace manifest was corrected to the true classification and the fold applied every rule itself, unedited.
The standard pass read 17 rules over this file set; the 24 rules the registry leaves to a tool ran as the typecheck, lint and secret-scan steps of the captured run, all of which exited 0 — which settles that each command exited 0 and nothing about whether it was configured to decide the rules resting on it.
Two of the three conformance findings on the adapter (hand-copied enumerations in diagnostic strings) and the standard finding (hand-written type guards in place of a Zod schema) sit in code this delivery did not write; they are recorded because the file was under review, not because the change introduced them.
This framework reviews nothing about performance, security beyond the standard's SEC rules, accessibility, or the frontend target; the coverage pass reads the four test files named by the proof and no other.
