---
title: Observation port and HTTP adapter answer unavailable endings instead of throwing
summary: Widens ObservationOutcome with an optional result_detail and rewrites the four raise sites of
  HttpDeclarativeObservationSource observe-concept to answer unavailable data instead of throwing, issuing
  no HTTP call in any of the four cases, for task/observation-endings-and-collection-budget/observation-port-unavailable-endings.
task: sha256:f2c2ee7d199a99ed450a7891ec1b5009336a4424208eef061f7f2e79623b4445
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/observation-endings-and-collection-budget-observation-port-unavailable-endings-build
files:
- path: src/investigation/observation-source.port.ts
  effect: ObservationOutcome's non-ok branch now optionally carries result_detail, so an implementer can
    name why a non-ok ending was reached — unchanged for 'ok', and backward-compatible for every existing
    implementer and caller since the field is optional.
- path: src/investigation/http-declarative-observation-source.adapter.ts
  effect: observe-concept no longer throws for any of the four presently-unresolvable conditions; resolveCapability,
    resolveConnectorConfiguration and the new resolveHttpConnectorCallConfiguration each resolve to a
    Resolution<T> (a value to proceed with, or an unavailable ObservationOutcome), and observeConcept
    short-circuits to that unavailable outcome the moment any of the three resolutions fails, before resolveConnectorRequest
    or issueRequest is ever reached — so none of the four issues an HTTP call. A new unavailableFor(error)
    helper builds the ending from the raised error's own .name, so result_detail can never drift from
    the class it names. asHttpConnectorCallConfiguration itself is untouched and still throws, since test-connector.controller.ts
    calls it directly and still needs the refusal to propagate for its own diagnostic route; only a new
    private wrapper this adapter's own observe-concept calls catches that throw.
- path: src/errors/capability-not-resolved-for-observation.error.ts
  effect: doc comment updated — the class is now instantiated to read its own .name and returned as data
    by HttpDeclarativeObservationSource's own observe-concept rather than thrown and propagated from there;
    unchanged, and still an ordinary thrown Error everywhere else nothing else raises it today.
- path: src/errors/connector-configuration-not-registered.error.ts
  effect: doc comment updated the same way, for the same reason.
- path: src/errors/malformed-http-connector-configuration.error.ts
  effect: doc comment updated to state both of this error's own two live paths — still thrown and propagated
    from asHttpConnectorCallConfiguration for test-connector.controller.ts's own direct call, and caught
    and degraded to an unavailable ending where HttpDeclarativeObservationSource's own observe-concept
    meets it.
- path: src/errors/duplicate-concept-answer.error.ts
  effect: doc comment updated to name the one new consumer that catches this error locally (HttpDeclarativeObservationSource's
    own resolveCapability) beside the two that still let it propagate unmodified (judgment-stage.ts, validate-case-coherence.ts).
criteria:
- criterion: Observing a concept no registered capability currently answers returns an unavailable ending
    with result_detail CapabilityNotResolvedForObservationError, without raising an exception.
  met: true
  how: 'resolveCapability reads capabilities.readCapability(concept); where the resolution answers held:
    false, it returns { ok: false, outcome: unavailableFor(new CapabilityNotResolvedForObservationError(concept))
    } rather than throwing, and observeConcept returns that outcome (result ''unavailable'', result_detail
    ''CapabilityNotResolvedForObservationError'') straight back to its own caller.'
- criterion: Observing a concept more than one registered capability currently answers returns an unavailable
    ending with result_detail DuplicateConceptAnswerError, without raising an exception.
  met: true
  how: capabilities.readCapability(concept) still throws DuplicateConceptAnswerError for this condition
    (CapabilityRegistryService is unchanged, since judgment-stage.ts and validate-case-coherence.ts also
    call it directly and must keep receiving the throw); resolveCapability is the one call site that wraps
    that call in try/catch, and where the caught error is instanceof DuplicateConceptAnswerError it returns
    the unavailable outcome naming it instead of letting the rejection propagate.
- criterion: Observing a concept whose capability names a connector no configuration is registered under
    returns an unavailable ending with result_detail ConnectorConfigurationNotRegisteredError, without
    raising an exception.
  met: true
  how: 'resolveConnectorConfiguration reads connectorConfigurations.readConnectorConfiguration(connector);
    where the resolution answers held: false, it returns the unavailable outcome naming ConnectorConfigurationNotRegisteredError
    rather than throwing.'
- criterion: Observing a concept whose connector configuration does not declare method, responseMap or
    statusMap returns an unavailable ending with result_detail MalformedHttpConnectorConfigurationError,
    without raising an exception.
  met: true
  how: the new private resolveHttpConnectorCallConfiguration calls the module-level asHttpConnectorCallConfiguration
    (unchanged, still throwing) inside a try/catch; where the caught error is instanceof MalformedHttpConnectorConfigurationError
    it returns the unavailable outcome naming it instead of letting the throw reach observe-concept's
    own caller.
- criterion: None of the four cases issues an HTTP call.
  met: true
  how: 'observeConcept checks each of the three Resolution values in sequence — capability, then connector
    configuration, then the narrowed HTTP fields — and returns the unavailable outcome the moment any
    one of them is ok: false, before resolveConnectorRequest or this.issueRequest (the only two steps
    that reach the network) are ever called.'
nodes:
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  encoded_at:
  - src/investigation/observation-source.port.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
  how: the rule's three named conditions (unresolved capability, duplicate-answered concept, unregistered
    connector configuration) each resolve, in the one production adapter behind the rule's own upstream
    contract, to an unavailable ending naming the cause via result_detail — issuing no call — rather than
    to a thrown fault; the port's own ObservationOutcome type is what makes that detail expressible at
    all.
- node: rules/integration/an-http-connector-configuration-declares-its-call
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
  how: the rule's own well-formedness check (httpConfigurationProblems, unchanged) still refuses a configuration
    missing method, responseMap or statusMap; what changed is only how that refusal reaches observe-concept's
    own caller — an unavailable ending naming MalformedHttpConnectorConfigurationError rather than a thrown
    fault, issuing no call.
- node: contracts/investigation/observation-source
  how: this task widens the one type the contract's own operation answers (ObservationOutcome) without
    changing observe-concept's own signature or its one-call-per-concept shape; the contract is honored,
    not encoded by this task's own change, since it is the upstream the adapter implements rather than
    a fact the adapter states.
- node: contracts/integration/concept-observation
  how: the production adapter remains the one concrete host service behind this contract; its own observe-concept
    still answers within the requester's own scope in the glossary's vocabulary — this task changes only
    how it answers a presently-unresolvable condition, not the contract's own shape, so the delivery honors
    it without a fact of its own to encode.
- node: domain/investigation/evidence
  encoded_at:
  - src/investigation/observation-source.port.ts
  how: 'the value object''s own posture — an absence of data is a recorded fact: a timeout, a denial or
    an unavailability arrives as a result, never as an exception — is what this task''s whole change exists
    to extend to the port and the adapter: ObservationOutcome''s new optional result_detail is exactly
    domain/investigation/evidence''s own field of the same name, reused rather than reinvented, so a cause
    the port now knows does not have to be rediscovered where Evidence is later assembled.'
inferences:
- inferred: result_detail is set to the raised error's own .name (e.g. CapabilityNotResolvedForObservationError)
    rather than its full message or a hand-written string.
  from: the criteria name each detail by exactly its class identifier, and every one of the four error
    classes already sets this.name to that identifier in its own constructor; reading .name from the error
    rather than restating a second literal keeps result_detail unable to drift from the class actually
    raised.
- inferred: the fix for the duplicate-concept-answer condition catches the throw locally inside HttpDeclarativeObservationSource's
    own resolveCapability, rather than changing CapabilityRegistryService's own readCapability to stop
    throwing.
  from: the task's own rationale (isolating the port-and-adapter change from the collection stage's own
    recording of that detail) and the inventory's own risk entry naming judgment-stage.ts and validate-case-coherence.ts
    as readCapability's other two direct callers, which this task does not reach.
- inferred: the exported asHttpConnectorCallConfiguration keeps throwing MalformedHttpConnectorConfigurationError
    rather than becoming a non-throwing function itself; only a new private wrapper inside HttpDeclarativeObservationSource
    catches that throw.
  from: test-connector.controller.ts calls asHttpConnectorCallConfiguration directly and unwrapped, relying
    on the throw to propagate to its own route; changing the exported function's own behavior would have
    reached that consumer, which the inventory names as depending on it but which this task's own scope
    does not cover.
preserved:
- test-connector.controller.ts's own direct call to asHttpConnectorCallConfiguration still throws MalformedHttpConnectorConfigurationError
  unmodified for its own diagnostic route.
- 'judgment-stage.ts''s and validate-case-coherence.ts''s own direct calls to ICapabilityQuery.readCapability
  still receive held: false as ordinary data and still see DuplicateConceptAnswerError thrown for the
  duplicate-answer condition, exactly as before.'
- evidence-collection-stage.ts's own existing behavior for a concept nothing currently answers and its
  own race/timeout handling are unchanged; it does not yet read the new result_detail off a non-timeout
  ObservationOutcome — recorded as deferred below.
- 'FakeObservationSource''s own fixture-driven behavior is unaffected: ObservationOutcome''s widening
  is a backward-compatible optional field, so every existing seeded fixture still type-checks and answers
  exactly as before.'
deferred:
- what: Wiring ObservationOutcome's own new result_detail into the Evidence record evidence-collection-stage.ts
    assembles.
  why: task/observation-endings-and-collection-budget/collection-stage-records-result-detail's own objective,
    named by this task's own rationale as deliberately isolated from this one.
- what: Threading a remaining-budget bound through observeConcept's own signature so this adapter can
    clamp capability.timeout to the stage's own remaining ceiling rather than the capability's declared
    value alone.
  why: task/observation-endings-and-collection-budget/observation-port-budget-clamp's and task/observation-endings-and-collection-budget/collection-stage-propagates-remaining-budget's
    own objectives, outside this task's own four-endings-only scope.
---

## What it is

The observation port and its production HTTP adapter answer unavailable, not throw, for a concept no capability answers, a concept more than one capability answers, a connector no configuration is registered under, and a connector configuration missing method, responseMap or statusMap — none of the four issuing an HTTP call.

## Notes

None.
