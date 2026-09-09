---
target: backend
title: Malformed-configuration problem messages derive their vocabularies from the
  canonical lists
summary: httpConfigurationProblems in the HTTP declarative observation source adapter
  now names the accepted HTTP methods and evidence-result endings by deriving them
  from HTTP_METHODS and EVIDENCE_RESULTS instead of restating each vocabulary as literal
  text.
task: sha256:b76ae1a1a4669cfb5abf49de22a7107a94a55458693ebfd5da6230942557e095
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:4050ccb93004dfd5a71749b73d5d0a5e09de427ccddf202095ecbd7e6db18898
run: run/connector-and-registry-fidelity-malformed-configuration-vocabularies-build
files:
- path: src/investigation/http-declarative-observation-source.adapter.ts
  effect: httpConfigurationProblems's two malformed-vocabulary problem messages (method
    outside the accepted set, statusMap not mapping to an accepted ending) now interpolate
    HTTP_METHODS.join(', ') and EVIDENCE_RESULTS.join(', ') respectively, rather than
    spelling GET/POST/PUT/PATCH/DELETE or ok/unavailable/denied/timeout as literal
    text; both names were already imported at the top of the file for the file's own
    isHttpMethod/isEvidenceResult guards, so no import changed. Nothing else in resolveHttpConnectorCallConfiguration,
    refuseHttpConfigurationDepartures or the surrounding unavailable-outcome plumbing
    was touched.
criteria:
- criterion: The problem message for a method outside the accepted set names those
    methods by deriving them from HTTP_METHODS.
  met: true
  how: the `method is not one of ...` push now reads `` `method is not one of ${HTTP_METHODS.join(',
    ')}` `` in httpConfigurationProblems, so the named methods come from the array
    rather than from hand-typed text.
- criterion: The problem message for a malformed statusMap names the accepted endings
    by deriving them from EVIDENCE_RESULTS.
  met: true
  how: the `statusMap is not a plain object mapping...` push now reads `` `statusMap
    is not a plain object mapping a status to one of ${EVIDENCE_RESULTS.join(', ')}`
    `` in the same function, so the named endings come from the array.
- criterion: No string literal in src/src/investigation/http-declarative-observation-source.adapter.ts
    enumerates the HTTP methods or the evidence-result endings.
  met: true
  how: a search over the file for GET/PATCH/DELETE and for "unavailable, denied, timeout"
    after the edit finds no match; the only occurrences of every method name and every
    evidence-result value are the array literals in HTTP_METHODS and EVIDENCE_RESULTS
    themselves, imported from their own modules and read through .join(', ') here.
- criterion: A configuration declaring a method HTTP_METHODS does not hold issues
    no call and ends unavailable with a result detail reporting a MalformedHttpConnectorConfigurationError.
  met: true
  how: unchanged by this edit -- isHttpMethod still gates the push, httpConfigurationProblems
    still returns a non-empty array, refuseHttpConfigurationDepartures still throws
    MalformedHttpConnectorConfigurationError, resolveHttpConnectorCallConfiguration
    still catches it and returns unavailableFor(error), whose result_detail is error.name,
    i.e. 'MalformedHttpConnectorConfigurationError'; observeConcept returns that outcome
    before any call is issued.
- criterion: A configuration whose statusMap is not an object mapping an HTTP status
    to one evidence-result ending issues no call and ends unavailable with a result
    detail reporting a MalformedHttpConnectorConfigurationError.
  met: true
  how: unchanged by this edit -- isStatusEndingMap still gates the push and the same
    refusal/unavailable path as above applies; only the pushed message's text changed,
    not the condition or the resulting outcome.
- criterion: A configuration declaring a method HTTP_METHODS holds, a responseMap
    of string paths, and a statusMap of evidence-result endings is not refused by
    this well-formedness check.
  met: true
  how: unchanged by this edit -- isHttpMethod, isStringRecord and isStatusEndingMap
    still all pass for such a configuration, httpConfigurationProblems still returns
    an empty array, and refuseHttpConfigurationDepartures still throws nothing.
nodes:
- node: rules/integration/an-http-connector-configuration-declares-its-call
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
  how: the rule's own accepted-methods and statusMap-ending vocabularies are what
    the two edited problem messages now name, derived from HTTP_METHODS and EVIDENCE_RESULTS
    rather than restated as text disconnected from those lists -- the rule's requirement
    that the detail states beside that error the vocabulary the malformed key is held
    to is answered for the message text a MalformedHttpConnectorConfigurationError
    carries. The clause the task's own Notes flags UNDERDETERMINED -- that the observation's
    own result_detail (not just the thrown error's message) states that vocabulary
    -- is not reached by any criterion this task states, and this delivery left unavailableFor(error)'s
    result_detail as error.name, unchanged, exactly as the task's Notes describes
    as passing. The responseMap-well-formedness and address/query/headers/body/placeholder
    clauses of the same node are outside this task's objective per its own Notes (REMAINDER)
    and are not reached here either.
- node: domain/investigation/evidence-result
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
  how: the EVIDENCE_RESULTS array this node's four values are exported as (ok, unavailable,
    denied, timeout) is what the statusMap problem message now derives its named endings
    from, instead of restating those four values as literal text.
preserved:
- the well-formedness gate's three conditions (isHttpMethod, isStringRecord for responseMap,
  isStatusEndingMap for statusMap) and their pass/fail outcomes, unchanged by this
  edit
- the unavailable ending and MalformedHttpConnectorConfigurationError result_detail
  for any malformed configuration, produced through the same resolveHttpConnectorCallConfiguration
  / unavailableFor path as before
- the five other specification-node bindings this file (and the neighboring judgment-stage.ts,
  untouched here) already carries in the trace, none of which this edit's two-line
  change reaches
inferences:
- inferred: the derived vocabulary in each message is joined with ', ' (comma-space),
    the same separator the original literal text used for both lists.
  from: the literal text this edit replaced ("GET, POST, PUT, PATCH, DELETE" and "ok,
    unavailable, denied, timeout") already used that separator, and MalformedHttpConnectorConfigurationError's
    own problems.join('; ') shows this file's convention of joining a list for display
    text rather than inventing a new format.
deferred:
- what: the rule now also requires the observation's own result_detail (not just the
    thrown error's message) to state the accepted vocabulary beside the error name
    for a malformed method or statusMap; unavailableFor(error) still reports only
    error.name.
  why: no criterion of this task asserts that link, and the task's own Notes name
    this UNDERDETERMINED -- a decision for the plan or the specification, not one
    this delivery may supply on its own by widening the task.
- what: the same node also subjects responseMap to the well-formedness refusal (an
    object of string paths); no criterion here refuses an absent or malformed responseMap,
    only criterion 6 confirming a valid one is not refused.
  why: the task's own Notes name this UNDERDETERMINED for the same reason -- deciding
    it is outside what this task's criteria authorize.
- what: the node's remaining clauses (address, query/headers/body, the placeholder
    mechanism, and the IncompleteConnectorCallDescriptorError / ConnectorPlaceholderNotResolvedError
    outcomes) belong to call assembly (connector-call-descriptor.ts, connector-request-resolver.ts).
  why: the task's own Notes mark this REMAINDER -- outside this plan's coverage.
---
## What it is
httpConfigurationProblems in src/investigation/http-declarative-observation-source.adapter.ts pushed two literal-text problem messages naming the accepted HTTP methods (GET, POST, PUT, PATCH, DELETE) and the accepted evidence-result endings (ok, unavailable, denied, timeout) instead of deriving them from HTTP_METHODS and EVIDENCE_RESULTS, both already imported and used in the file's own well-formedness guards.
This delivery replaces those two literal strings with HTTP_METHODS.join(', ') and EVIDENCE_RESULTS.join(', ') so each message states the same vocabulary the file's own guard already checks against, rather than a second hand-typed copy of it that can drift.
The well-formedness gate's conditions, the refusal, and the unavailable ending with its MalformedHttpConnectorConfigurationError result_detail are unchanged: only the two message strings changed.

## Notes
None.
