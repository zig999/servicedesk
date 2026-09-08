---
title: Malformed-configuration vocabulary derivation, proven against the canonical
  lists
summary: Proves the six criteria of malformed-configuration-vocabularies against http-declarative-observation-source.adapter.ts's
  httpConfigurationProblems, using the existing test suite in http-declarative-observation-source.adapter.spec.ts,
  plus two new tests closing the responseMap gap the task's second UNDERDETERMINED
  note names.
implementation: sha256:384181531112ad6e5179d32450278876ed032fb88d570e84e0051bb325f58435
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:4050ccb93004dfd5a71749b73d5d0a5e09de427ccddf202095ecbd7e6db18898
run: run/connector-and-registry-fidelity-malformed-configuration-vocabularies-suite
tests:
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: names the accepted methods, derived from HTTP_METHODS, in the refusal thrown
    for a method outside the accepted set
  proves: 'Criterion 1: The problem message for a method outside the accepted set
    names those methods by deriving them from HTTP_METHODS.'
  fails_when: httpConfigurationProblems's method-outside-the-set message stops containing
    HTTP_METHODS.join(', ') -- e.g. reverts to the literal text 'GET, POST, PUT, PATCH,
    DELETE', or derives from a different or reordered list.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: names the accepted evidence-result endings, derived from EVIDENCE_RESULTS,
    in the refusal thrown for a statusMap not mapping to an accepted ending
  proves: 'Criterion 2: The problem message for a malformed statusMap names the accepted
    endings by deriving them from EVIDENCE_RESULTS.'
  fails_when: httpConfigurationProblems's statusMap message stops containing EVIDENCE_RESULTS.join(',
    ') -- e.g. reverts to the literal text 'ok, unavailable, denied, timeout'.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: states neither the HTTP methods nor the evidence-result endings as literal
    enumerated text, naming each vocabulary only through the HTTP_METHODS and EVIDENCE_RESULTS
    it imports
  proves: 'Criterion 3: No string literal in the adapter file enumerates the HTTP
    methods or the evidence-result endings.'
  fails_when: the raw source text of http-declarative-observation-source.adapter.ts
    once again contains 'GET, POST, PUT, PATCH, DELETE' or 'ok, unavailable, denied,
    timeout' spelled out as literal text rather than derived through the two imported
    arrays.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: answers unavailable naming MalformedHttpConnectorConfigurationError, issuing
    no call, when the connector's own configuration does not declare a recognized
    method
  proves: 'Criterion 4 (pre-existing, unchanged by this task): a configuration declaring
    a method HTTP_METHODS does not hold issues no call and ends unavailable with a
    result detail reporting a MalformedHttpConnectorConfigurationError.'
  fails_when: a configuration with method 'TRACE' stops ending unavailable with result_detail
    'MalformedHttpConnectorConfigurationError', or the HTTP client is invoked anyway.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: answers unavailable naming MalformedHttpConnectorConfigurationError, issuing
    no call, when the connector's own configuration does not declare a statusMap
  proves: 'Criterion 5 (pre-existing, unchanged by this task): a configuration whose
    statusMap is not an object mapping an HTTP status to one evidence-result ending
    issues no call and ends unavailable with a result detail reporting a MalformedHttpConnectorConfigurationError.'
  fails_when: a configuration with statusMap undefined stops ending unavailable with
    result_detail 'MalformedHttpConnectorConfigurationError', or the HTTP client is
    invoked anyway.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: carries an observation on the ok ending
  proves: 'Criterion 6 (pre-existing, unchanged by this task): a configuration declaring
    an accepted method, a responseMap of string paths and a statusMap of evidence-result
    endings is not refused by this well-formedness check.'
  fails_when: a well-formed configuration (valid method, responseMap, statusMap) is
    refused as malformed instead of proceeding to an ok-ending observation.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: answers unavailable naming MalformedHttpConnectorConfigurationError, issuing
    no call, when the connector's own configuration does not declare a responseMap
  proves: the second UNDERDETERMINED note's named hypothetical implementation (a check
    that validates method and statusMap but never inspects responseMap) is excluded
    for the absent shape of responseMap.
  fails_when: 'a well-formedness check that validates only method and statusMap and
    never inspects responseMap: such a check would let a configuration with responseMap
    undefined issue the call rather than end unavailable naming MalformedHttpConnectorConfigurationError.'
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: answers unavailable naming MalformedHttpConnectorConfigurationError, issuing
    no call, when the connector's own configuration declares a responseMap holding
    a non-string value
  proves: the same second UNDERDETERMINED note's named hypothetical implementation,
    for the malformed (rather than absent) shape of responseMap.
  fails_when: 'the same hypothetical implementation that never inspects responseMap:
    a responseMap of { status: 7 } would issue the call rather than end unavailable
    naming MalformedHttpConnectorConfigurationError.'
not_applicable:
- edge_case: 'Duplicate input: this task changes only the derivation of two message
    strings'
  why: it introduces no uniqueness check for a test to violate
- edge_case: Concurrent operations
  why: the edited function is a pure, synchronous string-building step reached before
    any call is issued; nothing here is shared, ordered or racing across invocations
- edge_case: A slow or failing dependency
  why: this task's edit sits entirely before any HTTP call is issued (the malformed-configuration
    refusal short-circuits the call); the network's own failure and timeout paths
    are unchanged and untouched by this task
- edge_case: A boundary at each end of a numeric range
  why: 'HTTP_METHODS and EVIDENCE_RESULTS are enumerations of membership, not an ordered
    range: criteria 1, 2, 4 and 5''s tests already exercise a value outside each set,
    which is the only boundary an enumeration has'
- edge_case: An operation against state that forbids it
  why: this task's refusal is a pure configuration-shape check with no prior state
    to violate
untested:
- 'UNDERDETERMINED, from the specification -- rules/integration/an-http-connector-configuration-declares-its-call
  now states that the malformed-configuration refusal''s result detail names the accepted
  vocabulary beside the error, not only the error''s own name. No criterion of this
  task asserts that link: criteria 1 and 2 hold only that the thrown error''s own
  message derives the vocabulary, and criteria 4 and 5 hold only that the observation''s
  result_detail reports the error''s name. The delivered implementation leaves unavailableFor(error)''s
  result_detail as error.name alone, which is exactly the implementation the note
  names as satisfying every criterion of this task while the rule''s current statement
  would refuse it. No test asserts this fact, and none may be written to fail against
  the current, correct-per-this-task delivery without producing a red suite; whether
  the observation''s result_detail must additionally carry the vocabulary is left
  for a task that decides it.'
- 'the exact combined wording when a configuration is malformed in more than one way
  at once (e.g. an unaccepted method together with a malformed statusMap): no test
  asserts the '';''-joined ordering of two simultaneously-derived problem messages,
  and no criterion of this task states one.'
---
## What it is
http-declarative-observation-source.adapter.spec.ts already proved criteria 4, 5 and 6 (the refusal
and unavailable ending for a malformed method, a malformed statusMap, and the acceptance of a
well-formed configuration) before this delivery, since none of that behavior changed.
This proof adds three tests asserting the message text derivation for criteria 1, 2 and 3, plus two
tests closing the responseMap gap the task's second UNDERDETERMINED note names -- an absent and a
malformed responseMap, over the hypothetical implementation that note describes, both of which the
delivered code already refuses correctly.
A prior attempt at this proof had also added a test asserting that the observation's own
result_detail names the accepted vocabulary beside the error; that test failed against the
delivered implementation, contradicting the task's own first UNDERDETERMINED note, which states in
its "Passaria" sentence that an implementation naming only the error in result_detail (no
vocabulary) satisfies every criterion this task states. That test was removed, and the fact it
wrongly asserted is disclosed under `untested` instead.

## Notes
None.
