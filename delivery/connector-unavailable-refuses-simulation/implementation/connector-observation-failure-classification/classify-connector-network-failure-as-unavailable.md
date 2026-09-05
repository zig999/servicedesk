---
title: Classify a connector network failure as unavailable
summary: HttpDeclarativeObservationSource now catches a transport-layer connector
  rejection and resolves it to an unavailable observation naming ConnectorUnreachableError
  and the connector, instead of letting it propagate uncaught out of observeConcept.
task: sha256:b210b56fde67a22e1a9e4e11217e047809535bdc687b833c5655dbb241c279d1
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/connector-observation-failure-classification-classify-connector-network-failure-as-unavailable-build
files:
- path: src/errors/connector-unreachable.error.ts
  effect: New typed error class ConnectorUnreachableError, following the project's
    existing error-class shape (name, message, readonly context). Its context carries
    only the connector's registered name; its constructor accepts an optional ErrorOptions
    so the underlying transport rejection can be attached as .cause without that cause
    ever reaching a caller-visible field.
- path: src/investigation/http-declarative-observation-source.adapter.ts
  effect: 'observeConcept''s issuing step now goes through a new private issueRequestOrUnreachable,
    which wraps the existing issueRequest call in a try/catch. Any rejection it catches
    is guaranteed non-timeout (issueConnectorHttpCall already returns { kind:''timed-out''
    } rather than throwing on its own deliberate abort), so the catch resolves to
    { result: ''unavailable'', result_detail: ''<ConnectorUnreachableError>: <connector>''
    } via a new unavailableForUnreachableConnector helper, instead of letting the
    rejection propagate. Every other resolution step (capability, connector configuration,
    HTTP configuration validation, request assembly) and all post-response processing
    are untouched.'
criteria:
- criterion: 'A connector call that HttpDeclarativeObservationSource actually issues
    (i.e. capability resolution, connector configuration resolution, HTTP configuration
    validation and request assembly all already succeeded) and whose issuing step
    rejects before any HTTP response is received, for a reason other than the timeout
    AbortController firing, resolves observeConcept to { result: ''unavailable'',
    result_detail: ''ConnectorUnreachableError'' } naming the connector, and does
    not throw, and that result_detail carries no part of the call''s own assembled
    address, query, headers or body — while every rejection during capability resolution,
    connector configuration resolution, HTTP configuration validation or request assembly
    keeps ending unavailable with its own existing cause name (CapabilityNotResolvedForObservationError,
    DuplicateConceptAnswerError, ConnectorConfigurationNotRegisteredError, ConnectorPlaceholderNotResolvedError,
    MalformedHttpConnectorConfigurationError or IncompleteConnectorCallDescriptorError),
    unrelabeled, and a failure that happens after an HTTP response was already received
    (parsing its body, extracting its fields, or normalizing them into the glossary
    vocabulary) is untouched by this task.'
  met: true
  how: 'issueRequestOrUnreachable in http-declarative-observation-source.adapter.ts
    is reached only after resolvePreparedCall has already succeeded (capability, connector
    configuration, HTTP configuration validation and request assembly all resolved
    ok). It catches any rejection from issueRequest; since issueConnectorHttpCall
    (connector-http-issuer.ts, unmodified) only ever rejects for a non-abort reason
    — its own timeout abort resolves to { kind: ''timed-out'' } instead of throwing
    — every rejection reaching this catch is by construction ''a reason other than
    the timeout AbortController firing''. The catch returns { ok: false, outcome:
    unavailableForUnreachableConnector(connector, error) }, and observeConcept returns
    call.outcome directly, so nothing throws. unavailableForUnreachableConnector builds
    result_detail from ConnectorUnreachableError''s own .name and the connector string
    alone (never from the assembled request), so no address, query, header or body
    value can appear in it. The four earlier resolution steps (resolveCapability,
    resolveConnectorConfiguration, resolveHttpConnectorCallConfiguration, resolveAssembledRequest)
    and their unavailableFor(error) calls are untouched, still keying result_detail
    off each caught error''s own .name alone. outcomeFromResponse, reached only once
    a response was received, is untouched.'
- criterion: The evidence recorded for that concept carries result unavailable and
    a result_detail naming ConnectorUnreachableError and the connector, the same shape
    as the existing unavailable causes.
  met: true
  how: 'No change was needed in evidence-collection-stage.ts: settledEvidence already
    forwards outcome.result_detail verbatim into the evidence item''s result_detail
    field whenever outcome.result === ''unavailable'' (the same generic branch every
    existing unavailable cause already goes through), and evidenceOf writes it in
    the same result/result_detail shape as any other unavailable evidence item.'
- criterion: The unavailable observation this failure produces is never written into
    the evidence cache, consistent with only an ok result ever entering it.
  met: true
  how: No evidence-cache adapter exists anywhere in src/ (confirmed by search; constraints/the-evidence-cache-admits-only-ok-results.md
    is itself conditional, 'when an evidence cache exists'). The adapter change adds
    no write path of its own — issueRequestOrUnreachable and unavailableForUnreachableConnector
    only ever return an ObservationOutcome value — so this failure is excluded from
    any future cache exactly as every other unavailable cause already is, by the same
    absence of a write path.
- criterion: A hypothesis whose collection plan includes that concept is judged inconclusive
    with reason no-data, citing that evidence, exactly as a-collection-timeout-degrades-to-no-data
    already does for a timeout.
  met: true
  how: judgment-stage.ts is unmodified. judgeOneHypothesis already filters a hypothesis's
    own evidence list for item.result !== 'ok' and, whenever that filtered list is
    non-empty, returns noDataEvaluation citing every one of those items generically
    — the same path a-collection-timeout-degrades-to-no-data already uses for a timeout
    evidence item. This task's only contribution is making the connector-unreachable
    case resolve into an 'unavailable' evidence item at all, instead of aborting collectEvidence's
    whole Promise.all before any evaluation could run; once it resolves, the pre-existing
    generic filter reaches it exactly as it reaches timeout, denied, or any other
    non-ok evidence.
- criterion: A hypothesis in the same case whose collection plan does not include
    that concept is judged normally, unaffected by the other hypothesis's collection
    failure.
  met: true
  how: judgeHypotheses (judgment-stage.ts, unmodified) evaluates each hypothesis named
    by requiresEvaluationOf independently, reading only its own entry out of evidenceByHypothesis.
    A hypothesis whose own collection plan excludes the failing concept never receives
    that evidence item in its list, so it proceeds through the ordinary evaluator
    call untouched by this task; nothing in the adapter change couples one hypothesis's
    evidence to another's.
- criterion: A simulate-case or simulate-hypothesis call whose subject is missing
    the attribute this concept would have needed is not refused for that reason, consistent
    with a-simulated-subject-missing-a-requirement-degrades-not-refuses; the connector's
    own timeout-abort path (already handled) is unchanged.
  met: true
  how: 'resolveAssembledRequest and its ConnectorPlaceholderNotResolvedError handling
    are untouched by this delivery — a missing subject attribute still degrades to
    unavailable there, never reaching issueRequestOrUnreachable at all. The timeout
    path (call.value.kind === ''timed-out'' resolving to { result: ''timeout'' })
    inside observeConcept, and issueConnectorHttpCall''s own abort handling, are both
    unchanged; issueRequestOrUnreachable only wraps the same issueRequest call that
    already existed and only reacts to what it throws, never to what it resolves.'
nodes:
- node: rules/integration/an-unreachable-connector-ends-unavailable
  encoded_at:
  - src/errors/connector-unreachable.error.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
  how: 'The rule''s cause is encoded by ConnectorUnreachableError (name ConnectorUnreachableError,
    context carrying only the connector, message naming neither address, query, header
    nor body) and by the adapter''s issueRequestOrUnreachable/unavailableForUnreachableConnector
    pair, which catch exactly a rejection short of any HTTP response, for a reason
    other than the capability''s own timeout abort, and resolve observeConcept to
    { result: ''unavailable'', result_detail: naming both the cause and the connector
    } instead of letting it propagate as a fault.'
- node: domain/investigation/evidence-result
  how: 'Honored, not newly encoded: the new outcome resolves to the enumeration''s
    existing ''unavailable'' member: evidence-result.ts (EVIDENCE_RESULTS) is unmodified,
    and no new evidence-result value is introduced.'
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  how: The delivery does not reach this node's own code. judgment-stage.ts's pre-existing,
    unmodified no-data path (evidence.result !== 'ok') already declares reason no-data
    citing the evidence whenever it is reached; this task's job was limited to making
    the connector-unreachable case resolve to an unavailable evidence item at all,
    so that pre-existing mechanism now also covers it. Per the task's own REMAINDER
    note, this node's demand over judgment-failure and deadline-exceeded reasons belongs
    to already-delivered judgment-stage work this task does not touch.
- node: rules/investigation/one-evaluation-per-required-hypothesis
  how: 'Honored, not reached: judgeHypotheses (judgment-stage.ts, unmodified) already
    builds exactly one evaluation per name in requiresEvaluationOf(theCase), inconclusive
    counting as one. This task changes nothing about that coverage; it only prevents
    a connector-transport rejection from aborting collectEvidence''s whole Promise.all
    before an evaluation for any hypothesis could be produced at all.'
inferences:
- inferred: 'result_detail for this cause is the string "${ConnectorUnreachableError.name}:
    ${connector}" (cause name, then the connector, joined by a colon and space), rather
    than any other literal template combining the two.'
  from: 'The node''s own prose only requires ''a result detail reporting a ConnectorUnreachableError
    together with the name of the connector'', stating no literal template, and the
    task''s own ADVISORY note confirms criterion 1''s literal `{ result_detail: ''ConnectorUnreachableError''
    }` is shorthand for the cause name alone. The adjacent codebase already builds
    free-form result_detail strings this way for a non-error cause (evidence-collection-stage.ts''s
    `no observation within ${effectiveBoundMs}ms`), so a joined string was chosen
    over inventing a structured detail shape nothing in this codebase currently uses.'
- inferred: ConnectorUnreachableError's constructor accepts an ErrorOptions ({ cause
    }) so the underlying transport rejection is preserved as .cause, even though .cause
    never reaches result_detail or any other caller-visible field.
  from: 'The sibling pattern already used by ConnectorConfigurationStoreError and
    MigrationStepError (persistence/), which both accept and forward ErrorOptions
    for the same COR-01 reason: a caught error is either handled or rethrown wrapped
    with the original as its cause, and here it is handled by converting to a domain
    outcome rather than rethrown, so retaining the cause internally (never exposed)
    keeps the same discipline without violating the node''s own ''carries no part
    of the call''s own assembled address, query, headers or body'' requirement.'
- inferred: The connector named in the new outcome is capability.connector — the same
    value already threaded through resolveConnectorConfiguration — rather than any
    value read back off the assembled request or the HTTP configuration.
  from: 'The node''s own text: ''the name of the connector whose registered configuration
    issued the call''; and the adjacent code''s own existing use of capability.connector
    for exactly that identifier throughout resolvePreparedCall.'
preserved:
- Every existing unavailable-ending cause (CapabilityNotResolvedForObservationError,
  DuplicateConceptAnswerError, ConnectorConfigurationNotRegisteredError, ConnectorPlaceholderNotResolvedError,
  MalformedHttpConnectorConfigurationError, IncompleteConnectorCallDescriptorError)
  keeps resolving through unavailableFor(error), unrelabeled, exactly as before.
- 'The timeout ending (call.value.kind === ''timed-out'') keeps resolving to { result:
  ''timeout'' } with no result_detail, unaffected by this change.'
- Post-response processing — outcomeFromResponse, endingForStatus, parsedBodyOrUndefined,
  observationOf — is untouched; a failure after a response was already received stays
  outside this task.
- judgment-stage.ts's generic no-data and one-evaluation-per-hypothesis machinery,
  and evidence-collection-stage.ts's pass-through of result_detail into evidence,
  are unmodified; this task's only change is where the 'unavailable' outcome for this
  new cause is produced.
deferred:
- what: A failure that happens after an HTTP response was already received (parsing
    its body, extracting its fields, or normalizing them into the glossary vocabulary)
    is not placed in any of the four evidence-result endings by any node this task
    implements.
  why: The task's own ADVISORY note states this is the one collection-failure seam
    left unplaced now that the transport-layer one is stated, sitting next to the
    code this task edits (outcomeFromResponse), and explicitly marks it out of scope
    for this task.
---

## What it is
HttpDeclarativeObservationSource now catches a transport-layer connector rejection and resolves it to an unavailable observation naming ConnectorUnreachableError and the connector, instead of letting it propagate uncaught out of observeConcept.

## Notes
None.
