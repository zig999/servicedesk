---
target: backend
title: Proof for test-connector's invalid-address refusal and unreachable-connector answer
summary: Three new tests in test-connector.routes.spec.ts prove the 422 invalid-absolute-URL refusal (criterion
  1, masked and undiluted), the 200 unreachable-connector answer (criterion 2, named and masked), and
  that a capability timeout's own abort still answers 'timed-out' rather than being folded into 'unreachable'
  (the task's underdetermined entry); criterion 3's non-regression is left to the two pre-existing response-answered
  tests that already protect it.
implementation: sha256:a112d0645c9af33795ed0bc41645269096ed5361d9cf9bd8e0b32d473a83b889
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/test-connector-request-echo-url-hotfix-echo-address-error-is-reported-suite
tests:
- file: src/__tests__/unit/http/test-connector.routes.spec.ts
  name: refuses a test-connector request whose resolved address is not a valid absolute URL with an HTTP
    422 ConnectorCallAddressNotAbsoluteUrlError disclosing only the masked resolved address, issuing no
    call
  proves: Testing a connector configuration whose resolved address is not a valid absolute URL issues
    no call and ends the request with an HTTP 422 response reporting a ConnectorCallAddressNotAbsoluteUrlError
    that discloses the resolved address, masked wherever a credential placeholder resolved into it, and
    no other part of the call.
  fails_when: the endpoint answers any status other than 422, names any error other than ConnectorCallAddressNotAbsoluteUrlError,
    discloses the real (unmasked) credential value or any part of the call beyond the resolved address
    in the error's details object, or issues an HTTP call despite the resolved address being invalid.
  demonstrates: rules/integration/a-diagnostic-response-masks-a-resolved-credential
- file: src/__tests__/unit/http/test-connector.routes.spec.ts
  name: ends a test whose issued call fails before any HTTP response, and whose failure is not the capability's
    own timeout, with an HTTP 200 response naming ConnectorUnreachableError and the connector, carrying
    no response status, and echoing the request with its credential placeholder masked
  proves: Testing a connector configuration whose resolved address is a valid absolute URL, whose issued
    call fails before any HTTP response is received, and whose failure is not the capability's own timeout
    aborting the call, ends the request with an HTTP 200 response reporting a ConnectorUnreachableError
    together with the name of the connector whose registered configuration issued the call and no response
    status, and carrying the same echoed request a response-answered test carries, with every value a
    credential placeholder resolved to masked.
  fails_when: the endpoint answers any status other than 200 for this failure, the response's kind is
    not 'unreachable', the error is not named ConnectorUnreachableError or does not name the tested connector,
    a 'status' field is present on the outcome, the echoed request is missing or diverges from the assembled
    call, or the credential resolved into the echoed request's headers appears unmasked.
  demonstrates: rules/integration/a-diagnostic-test-of-an-unreachable-connector-answers-as-a-completed-test
- file: src/__tests__/unit/http/test-connector.routes.spec.ts
  name: still answers a 'timed-out' outcome, not 'unreachable', when the capability's own timeout aborts
    the call before any HTTP response
  proves: UNDERDETERMINED, from the specification -- No criterion says what the diagnostic answers when
    the capability's own timeout aborts the call ... An implementation that folds the timeout abort into
    the same unreachable branch would satisfy every criterion here while answering an undecided condition;
    the implementer and reviewer leave the existing delivered behavior for a capability timeout untouched,
    since deciding it is outside this correction's two reported behaviors.
  fails_when: an implementation folds a capability timeout's own deliberate abort into the same 'unreachable'
    branch criterion 2 defines -- answering {kind:'unreachable', error:{...}} instead of the existing
    {kind:'timed-out', elapsedMs} -- for a call that never received a response because the capability's
    own timeout aborted it.
- file: src/__tests__/unit/http/test-connector.routes.spec.ts
  name: returns the raw HTTP status, headers, body and elapsed time of the call actually made, distinct
    from the route's own 200 wrapper
  proves: 'Testing a connector configuration whose resolved address is a valid absolute URL and whose
    issued call receives an HTTP response is unaffected by this correction: the request echo and the far
    end''s response reach the caller exactly as they did before this correction.'
  fails_when: a valid-address, response-answered test stops returning the far end's actual status, headers,
    body and elapsed time exactly as issued -- the one observable surface this correction's new address
    check could regress by rejecting a previously-accepted valid address.
- file: src/__tests__/unit/http/test-connector.routes.spec.ts
  name: issues the exact request resolveConnectorRequest assembles from the given subject and the connector
    configuration — the subject-attribute and requester placeholders resolved, not left as literal template
    text
  proves: 'Testing a connector configuration whose resolved address is a valid absolute URL and whose
    issued call receives an HTTP response is unaffected by this correction: the request echo and the far
    end''s response reach the caller exactly as they did before this correction.'
  fails_when: the outbound call or the echoed request stop carrying the exact resolved address and headers
    a valid configuration produces -- the other observable surface this correction's new address check
    could regress for a previously-accepted valid address.
untested:
- contracts/integration/connector-diagnostics's fact spans far more than this correction touches (single-call
  exercise through a registered capability, subject assembly never reading a stored subject, diagnostic-only
  semantics that write no evidence). This proof's tests only exercise the two conditions this correction
  answers; nothing here decides the contract's fact whole.
- rules/integration/a-connector-configuration-is-tested-through-a-registered-capability states six clauses;
  this proof's criterion-1 test decides only the sixth (the invalid-absolute-URL refusal). The other five
  -- that the test exercises only an already-registered capability naming the connector, that the configuration
  read is the one currently registered rather than unsaved authoring text, that the assembled subject
  carries exactly the placeholders the configuration names, the 404 CapabilityNotRegisteredForTestError
  refusal, and the 409 CapabilityConnectorMismatchError refusal -- are pre-existing, unchanged behavior
  this correction does not touch, so no test in this proof decides the rule's statement whole.
- What a capability timeout's own deliberate abort ultimately should answer remains undecided by the specification
  (rules/integration/a-diagnostic-test-of-an-unreachable-connector-answers-as-a-completed-test's own "Not
  decided here"). This proof's timeout test only confirms the existing 'timed-out' outcome is preserved
  unchanged by this correction, not that it is the specification's eventual chosen answer for that condition.
not_applicable:
- edge_case: An address that is entirely absent from the configuration, or an empty string.
  why: That failure is IncompleteConnectorCallDescriptorError, a different, pre-existing refusal this
    correction does not touch; none of this task's three criteria name it.
- edge_case: Two operations against the same connector configuration at once.
  why: The diagnostic call is stateless per request -- nothing this correction adds is shared mutable
    state -- and no criterion states a concurrency requirement.
- edge_case: A dependency (the outbound HTTP call) that is slow but still answers before any timeout.
  why: Unaffected by this correction; the elapsedMs and response-outcome paths this covers are the pre-existing,
    unchanged behavior criterion 3 already protects through the two pre-existing tests cited above.
- edge_case: A resolved address that is technically valid under an unusual scheme (e.g. mailto:, ftp:)
    rather than http(s).
  why: Criterion 1's boundary is exactly what the WHATWG URL parser accepts as absolute, a binary property
    already exercised on its invalid side by the new test and on its valid side by the pre-existing valid-https-address
    tests; a differently-schemed but still-parseable address is the same "valid" class, not a further
    boundary.
---

## What it is

Five tests in test-connector.routes.spec.ts prove the two behaviors this correction changes --
the 422 invalid-absolute-URL refusal and the 200 unreachable-connector answer, both masked and
scoped exactly as their criteria state -- plus that a capability timeout's own abort is left
untouched, and protect the two response-answered, non-regression surfaces criterion 3 names.

## Notes

None.
