---
title: Degrade every unassemblable connector-request call to unavailable inside observe-concept
summary: The one uncaught call to resolveConnectorRequest inside HttpDeclarativeObservationSource's
  own observeConcept now catches both typed assembly failures it can throw and answers an unavailable
  evidence outcome naming the failing class, while test-connector's own direct call is left untouched.
task: sha256:17dd1842ebe0c6674e1c578e7f7efb193e4b67f875017ce3121dd83e0cdf2d2d
files:
- path: src/investigation/http-declarative-observation-source.adapter.ts
  effect: observeConcept now wraps its own call to connector-request-resolver.ts's own resolveConnectorRequest
    through a new private resolveAssembledRequest step, catching ConnectorPlaceholderNotResolvedError
    and IncompleteConnectorCallDescriptorError and answering an unavailable outcome carrying a result_detail
    naming the failing class, rather than letting either propagate. The four resolution steps observeConcept
    already ran, plus this new one, are consolidated into a new private resolvePreparedCall method so
    observeConcept itself and this new step both stay within this project's own function-length bound
    (MNT-01). No other method's behavior changed.
criteria:
- criterion: A concept observation whose call embeds a Subject-attribute or credential placeholder that
    resolves to nothing records evidence result unavailable with result_detail naming ConnectorPlaceholderNotResolvedError.
  met: true
  how: resolveAssembledRequest catches ConnectorPlaceholderNotResolvedError thrown by connector-request-resolver.ts's
    own resolveSubjectPlaceholder or resolveCredentialPlaceholder (through resolveConnectorRequest) and
    answers unavailableFor(error), which reads the thrown error's own name into result_detail.
- criterion: A concept observation whose connector configuration is missing its address records evidence
    result unavailable with result_detail naming IncompleteConnectorCallDescriptorError.
  met: true
  how: the same catch answers the IncompleteConnectorCallDescriptorError asConnectorCallDescriptor throws,
    through refuseDescriptorDepartures, when descriptorProblems finds the address is not a non-empty
    string.
- criterion: A concept observation whose connector configuration declares query or headers as anything
    other than an object of string values records evidence result unavailable with result_detail naming
    IncompleteConnectorCallDescriptorError.
  met: true
  how: the same catch answers the IncompleteConnectorCallDescriptorError descriptorProblems raises when
    a declared query or headers value is not a plain object whose own values are all strings.
- criterion: A concept observation whose connector configuration names a placeholder kind the HTTP connector
    does not recognize, or a placeholder missing an argument it requires, records evidence result unavailable
    with result_detail naming IncompleteConnectorCallDescriptorError.
  met: true
  how: the same catch answers the IncompleteConnectorCallDescriptorError resolvePlaceholderToken throws
    for a kind that is none of subject, requester or credential, and the one requireArgument throws for
    a subject or credential placeholder naming no argument at all.
- criterion: The collection of every other concept in the same investigation proceeds unaffected when
    one concept's observation degrades this way.
  met: true
  how: verified rather than changed. evidence-collection-stage.ts's own collectEvidence calls collectOneEvidence
    once per concept inside one Promise.all, and each call's own observeConcept promise settles independently;
    since observeConcept no longer rejects for either of these two conditions, the concept it degrades
    never causes any other concept's own promise to be affected. This already held structurally before
    this task and needed no change of its own.
- criterion: test-connector's own call to the resolver continues to propagate an unresolved condition
    uncaught, unaltered by this fix.
  met: true
  how: src/http/test-connector.controller.ts is untouched by this task. Its own handleTestConnectorRequest
    still calls resolveConnectorRequest directly, twice, with no surrounding try/catch, so either typed
    assembly failure still propagates uncaught exactly as it did before this task.
nodes:
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  how: this rule's own fourth degrading condition, a placeholder naming a Subject attribute or a credential
    resolving to nothing, is now what resolveAssembledRequest's own catch answers, reporting a result_detail
    naming ConnectorPlaceholderNotResolvedError exactly as the rule states.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/an-http-connector-configuration-declares-its-call
  how: this rule's own IncompleteConnectorCallDescriptorError condition (a missing address, a malformed
    query or headers, an unrecognized placeholder kind, or a placeholder missing an argument it requires)
    is now caught at the one call site that previously let it propagate, and degraded to the same unavailable
    ending the rule states.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/integration/concept-observation
  how: this contract's own observe-concept operation is what observeConcept implements; the fix keeps
    that operation answering evidence as data for every condition this task names rather than raising
    a fault across its own boundary. The contract's own text names only the operation, not this failure
    handling, so no new fact of the contract's own reaches the code — the work only honors what it already
    published.
- node: contracts/integration/connector-diagnostics
  how: this contract's own test-connector operation is stated as diagnostic only, never feeding an investigation's
    evidence; honored here by leaving test-connector.controller.ts entirely untouched, so its own direct
    resolveConnectorRequest call keeps propagating either typed failure uncaught, exactly as the diagnostic
    operation's own separation from observe-concept already implied before this task.
- node: contracts/investigation/observation-source
  how: this port's own observe-concept, implemented here as HttpDeclarativeObservationSource.observeConcept,
    answers one of the four evidence-result endings as data and never throws for a non-ok ending; this
    task closes the one remaining gap where it still could, for the two typed assembly failures resolveConnectorRequest
    can raise.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: scenarios/integration/an-optional-attribute-absent-degrades-its-observation
  how: this scenario's own then clause, evidence unavailable with result_detail naming ConnectorPlaceholderNotResolvedError
    while every other concept's collection proceeds unaffected, is exactly what resolveAssembledRequest's
    own catch together with evidence-collection-stage.ts's own per-concept Promise.all already deliver.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
preserved:
- test-connector.controller.ts's own handleTestConnectorRequest, and its own two direct calls to resolveConnectorRequest,
  are unchanged and keep propagating either typed assembly failure uncaught.
- observeConcept's own three pre-existing resolution steps (capability, connector configuration, HTTP-specific
  fields) and their own catch-and-degrade behavior for CapabilityNotResolvedForObservationError, DuplicateConceptAnswerError,
  ConnectorConfigurationNotRegisteredError and MalformedHttpConnectorConfigurationError are unchanged.
- evidence-collection-stage.ts's own per-concept Promise.all, and every other concept's own independent
  settling, are untouched.
- every existing call of observeConcept across the codebase's own test suite keeps compiling and behaving
  identically, since its own public signature and the four evidence-result endings it can answer are
  unchanged.
deferred:
- what: observation-source.port.ts's own doc comment still reads "the four presently-unresolvable conditions",
    where this file's own top comment and observeConcept's own doc comment now name six.
  why: a comment-only inconsistency in a file this task does not otherwise touch; correcting it reaches
    outside this task's own file, and no criterion or node this task answers depends on that comment's
    own wording.
---

## What it is
The one uncaught call to resolveConnectorRequest inside observeConcept is wrapped so every typed assembly failure it throws ends the concept's evidence unavailable instead of propagating.

## Notes
None.
