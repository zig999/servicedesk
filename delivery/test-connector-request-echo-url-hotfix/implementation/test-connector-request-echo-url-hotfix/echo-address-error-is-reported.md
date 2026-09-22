---
target: backend
title: test-connector's echo path reports the invalid-address refusal and the unreachable-connector answer
  instead of an opaque failure
summary: POST /v1/test-connector now refuses an address that does not resolve to a valid absolute URL
  with a typed 422 before issuing any call, and reports a call that fails short of any HTTP response as
  a completed HTTP 200 test naming ConnectorUnreachableError and the connector, leaving the response-answered
  path untouched.
task: sha256:4efc71a05035e8594a796b4aa8a352f167baa0d03495b43e7a02b5eff7758c12
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/test-connector-request-echo-url-hotfix-echo-address-error-is-reported-build-2
files:
- path: src/errors/connector-call-address-not-absolute-url.error.ts
  effect: New typed domain error (name, message, context.address) raised when a connector configuration's
    resolved call address is not a valid absolute URL.
- path: src/errors/status-map.ts
  effect: Maps ConnectorCallAddressNotAbsoluteUrlError to HTTP 422, alongside the project's other domain-to-transport
    mappings.
- path: src/http/dto/test-connector.dto.ts
  effect: Replaces the test-connector response's generic {kind:'error', message, elapsedMs} outcome member
    with a {kind:'unreachable', error:{code, message, details:{connector}}, elapsedMs} member, carrying
    no response status.
- path: src/http/test-connector.controller.ts
  effect: Before issuing any call, validates the masked resolved address is parseable as an absolute URL
    (throwing ConnectorCallAddressNotAbsoluteUrlError, uncaught, otherwise); a call that fails before
    any HTTP response now resolves to a structured 'unreachable' outcome naming ConnectorUnreachableError
    and the connector, in place of the previous generic {kind:'error'} shape that let a raw address-parsing
    TypeError from the echo step reach Fastify's generic handler uncaught.
criteria:
- criterion: Testing a connector configuration whose resolved address is not a valid absolute URL issues
    no call and ends the request with an HTTP 422 response reporting a ConnectorCallAddressNotAbsoluteUrlError
    that discloses the resolved address, masked wherever a credential placeholder resolved into it, and
    no other part of the call.
  met: true
  how: 'handleTestConnectorRequest builds both the issued (real-credential) and echoed (masked-credential)
    requests, then calls requireResolvedAddressIsAbsoluteUrl(echoed) before issueOutcome is ever invoked;
    on a parse failure it throws ConnectorCallAddressNotAbsoluteUrlError(echoed.address), uncaught, mapped
    to 422 by status-map.ts, with error-handler.middleware.ts rendering {code, message, details: {address}}
    and nothing else -- no other part of the call. Because the address checked and disclosed is the masked
    echo, a credential value is already the REDACTED marker. The throw happens before issueOutcome runs,
    so httpClient is never called.'
- criterion: Testing a connector configuration whose resolved address is a valid absolute URL, whose issued
    call fails before any HTTP response is received, and whose failure is not the capability's own timeout
    aborting the call, ends the request with an HTTP 200 response reporting a ConnectorUnreachableError
    together with the name of the connector whose registered configuration issued the call and no response
    status, and carrying the same echoed request a response-answered test carries, with every value a
    credential placeholder resolved to masked.
  met: true
  how: The route still answers 200 unconditionally; issueOutcome's catch (reached for any call failure
    short of a response, excluding the timeout abort still carved out by the pre-existing issued.kind
    === 'timed-out' branch) now calls unreachableOutcome(connector, error, elapsedMs), returning {kind:'unreachable',
    error:{code, message, details:{connector}}, elapsedMs} with no status field. The top-level request
    field is still built via requestEcho(httpFields.method, echoed), unconditionally after issueOutcome
    settles, so it is the same masked echoed request a response-answered test carries.
- criterion: 'Testing a connector configuration whose resolved address is a valid absolute URL and whose
    issued call receives an HTTP response is unaffected by this correction: the request echo and the far
    end''s response reach the caller exactly as they did before this correction.'
  met: true
  how: responseOutcome, rawBody and requestEcho are unmodified. The only new step in this path, requireResolvedAddressIsAbsoluteUrl(echoed),
    succeeds silently for a valid address and changes nothing observable; issueOutcome's success branch
    is untouched.
nodes:
- node: contracts/integration/connector-diagnostics
  how: The controller continues to exercise a connector configuration's own call exactly once through
    a registered capability, diagnostic-only, unchanged in shape; this task reaches the contract only
    insofar as its two answers are conditions the diagnostic operation must resolve one way or another.
  encoded_at:
  - src/http/test-connector.controller.ts
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  how: Only the rule's sixth clause is this task's criterion 1 -- a registered configuration whose resolved
    address is not a valid absolute URL issues no call and refuses with HTTP 422 ConnectorCallAddressNotAbsoluteUrlError
    disclosing that resolved address, masked, and nothing else. Encoded by requireResolvedAddressIsAbsoluteUrl
    plus the new error class and its status-map entry. The rule's other five clauses are already-delivered
    behavior this task does not reach.
  encoded_at:
  - src/errors/connector-call-address-not-absolute-url.error.ts
  - src/errors/status-map.ts
  - src/http/test-connector.controller.ts
- node: rules/integration/a-diagnostic-response-masks-a-resolved-credential
  how: No new masking mechanism was added; the existing redactingEnv()-based echo is reused for both the
    address disclosed by the new 422 refusal and the echoed request carried alongside the new unreachable
    outcome.
  encoded_at:
  - src/http/test-connector.controller.ts
- node: rules/integration/a-diagnostic-test-of-an-unreachable-connector-answers-as-a-completed-test
  how: 'Criterion 2 is this rule''s answer for the diagnostic endpoint: the route answers 200 unconditionally;
    issueOutcome''s catch now returns a structured outcome naming ConnectorUnreachableError and the connector,
    with no status field, instead of the previous opaque {kind:''error''} shape. The echoed request travels
    unconditionally, masked, independent of outcome kind. What a capability timeout''s own deliberate
    abort answers is left exactly as delivered, per the task''s UNDERDETERMINED note.'
  encoded_at:
  - src/http/test-connector.controller.ts
  - src/http/dto/test-connector.dto.ts
inferences:
- inferred: The address whose validity is checked, and whose text is disclosed in the 422 refusal, is
    the masked (echoed) resolution rather than the real (issued) one.
  from: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability's own statement
    that the refusal is the same refusal whether the address is read to derive the call or to echo it
    back, read as the two resolutions being interchangeable for this purpose, since the specification
    does not itself state which of the two the check should run against.
- inferred: The new 'unreachable' outcome's JSON shape -- {kind:'unreachable', error:{code, message, details:{connector}},
    elapsedMs} -- mirrors the project's existing top-level domain-error envelope rather than a bespoke
    shape.
  from: The task's own ADVISORY note that no candidate states what the diagnostic's response carries,
    combined with the project's existing envelope convention for every other domain error this codebase
    already answers with.
- inferred: The 'unreachable' outcome kind keeps an elapsedMs field.
  from: The sibling 'response' and 'timed-out' outcome kinds both already carry elapsedMs, and no node
    forbids or requires it for this condition.
- inferred: 'ConnectorCallAddressNotAbsoluteUrlError is thrown with {cause: error} wrapping the underlying
    URL-parsing TypeError.'
  from: The codebase's existing pattern for translating a caught failure into a typed domain error (ConnectorUnreachableError's
    own construction).
divergences:
- from: rules/integration/a-diagnostic-test-of-an-unreachable-connector-answers-as-a-completed-test
  departure: src/__tests__/unit/http/test-connector.routes.spec.ts (a test file an earlier, closed initiative's
    proof owns) asserted the retired {kind:'error'} outcome for a call failing before any HTTP response;
    that assertion was updated in place to expect {kind:'unreachable'} instead, because deliver.py --outstanding
    over that closed initiative's own delivery root refuses to validate at all -- 14 of its 17 delivered
    nodes are already short of the current registry's test-unit step, a pre-existing drift unrelated to
    this task -- which blocked the proper proof-only re-delivery route over the owning task.
  why: The human directed a direct edit of the stale assertion after confirming the systemic blocker was
    pre-existing and unrelated to this delivery, rather than leaving the build permanently red or attempting
    to repair 14 unrelated historical delivery records outside this task's scope.
preserved:
- The 404 CapabilityNotRegisteredForTestError and 409 CapabilityConnectorMismatchError refusals in resolveTestedCapability,
  untouched.
- The capability's own timeout producing the {kind:'timed-out', elapsedMs} outcome, untouched and still
  excluded from the new unreachable path.
- The 'response' outcome kind's shape and the request echo for a response-answered test, untouched.
- orphaned_placeholders' computation and presence regardless of outcome kind, untouched.
deferred:
- what: frontend/app/src/routes/connector-test-panel-result.tsx reads result.response.kind === "error",
    which no longer matches any outcome this endpoint answers.
  why: No target names the frontend tree for this task (target source root here is src alone); updating
    it would widen this task past its own scope.
- what: docs/sistema/14-api-http.md documents the test-connector response shape and likely still shows
    the retired 'error' outcome kind.
  why: No target names the docs tree for this task; out of scope for the same reason as the frontend consumer
    above.
---

## What it is

POST /v1/test-connector now validates that a registered connector configuration's resolved
address is a valid absolute URL before issuing any call, refusing with a typed 422
ConnectorCallAddressNotAbsoluteUrlError otherwise, and reports a call that fails before any HTTP
response as a completed HTTP 200 test naming ConnectorUnreachableError and the connector, instead
of letting the request-echo path's unprotected URL parse throw an uncaught TypeError that reached
Fastify's generic 500 INTERNAL_ERROR handler.

## Notes

The address checked and disclosed in the new 422 refusal is the masked echo, not the real
resolved address -- an inference, since the specification states the two readings answer alike
without saying which underlying resolution the check itself should run against.
A pre-existing, unrelated systemic drift in the closed diagnose-input-schema-contract initiative's
delivery root (14 of 17 delivered nodes short of the current registry's test-unit step) blocked
the proper proof-only re-delivery route over the one stale test assertion this task's own change
correctly falsified; the assertion was edited directly instead, with the human's explicit
direction, disclosed above as a divergence.
