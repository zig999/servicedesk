---
target: backend
title: Review of the test-connector request echo URL hotfix
summary: What the four passes found over the corrective increment fixing POST /v1/test-connector's invalid-address
  and unreachable-connector answers.
reviewed:
- src/errors/connector-call-address-not-absolute-url.error.ts
- src/errors/status-map.ts
- src/http/dto/test-connector.dto.ts
- src/http/test-connector.controller.ts
- src/__tests__/unit/http/test-connector.routes.spec.ts
tasks:
- task/test-connector-request-echo-url-hotfix/echo-address-error-is-reported
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run over this change passed; there was no failure to diagnose
coverage:
- criterion: Testing a connector configuration whose resolved address is not a valid absolute URL issues
    no call and ends the request with an HTTP 422 response reporting a ConnectorCallAddressNotAbsoluteUrlError
    that discloses the resolved address, masked wherever a credential placeholder resolved into it, and
    no other part of the call.
  state: covered
  tests:
  - file: src/__tests__/unit/http/test-connector.routes.spec.ts
    name: refuses a test-connector request whose resolved address is not a valid absolute URL with an
      HTTP 422 ConnectorCallAddressNotAbsoluteUrlError disclosing only the masked resolved address, issuing
      no call
- criterion: Testing a connector configuration whose resolved address is a valid absolute URL, whose issued
    call fails before any HTTP response is received, and whose failure is not the capability's own timeout
    aborting the call, ends the request with an HTTP 200 response reporting a ConnectorUnreachableError
    together with the name of the connector whose registered configuration issued the call and no response
    status, and carrying the same echoed request a response-answered test carries, with every value a
    credential placeholder resolved to masked.
  state: partial
  tests:
  - file: src/__tests__/unit/http/test-connector.routes.spec.ts
    name: ends a test whose issued call fails before any HTTP response, and whose failure is not the capability's
      own timeout, with an HTTP 200 response naming ConnectorUnreachableError and the connector, carrying
      no response status, and echoing the request with its credential placeholder masked
  - file: src/__tests__/unit/http/test-connector.routes.spec.ts
    name: still answers a 'timed-out' outcome, not 'unreachable', when the capability's own timeout aborts
      the call before any HTTP response
  - file: src/__tests__/unit/http/test-connector.routes.spec.ts
    name: still names the orphaned placeholder in its own response, without itself refusing the test,
      when the underlying HTTP call fails
  why: 'The 200 status, the ConnectorUnreachableError code, the connector name, the absence of a response
    status and the exclusion of the timeout failure are each exercised. Unexercised: nothing compares
    the unreachable echo against a response-answered test''s echo, and nothing asserts the echoed method,
    the x-requester header, or any echoed body on this path; a credential placeholder resolving into the
    address, into a second header, or into the body is never masked-checked on this path either -- the
    masked-address assertion lives only in the 422 test, which issues no call.'
- criterion: 'Testing a connector configuration whose resolved address is a valid absolute URL and whose
    issued call receives an HTTP response is unaffected by this correction: the request echo and the far
    end''s response reach the caller exactly as they did before this correction.'
  state: partial
  tests:
  - file: src/__tests__/unit/http/test-connector.routes.spec.ts
    name: returns the raw HTTP status, headers, body and elapsed time of the call actually made, distinct
      from the route's own 200 wrapper
  - file: src/__tests__/unit/http/test-connector.routes.spec.ts
    name: issues the exact request resolveConnectorRequest assembles from the given subject and the connector
      configuration — the subject-attribute and requester placeholders resolved, not left as literal template
      text
  - file: src/__tests__/unit/http/test-connector.routes.spec.ts
    name: is not refused, and still issues the call and returns the outcome, for a test whose own response
      reports an orphaned placeholder
  - file: src/__tests__/unit/http/test-connector.routes.spec.ts
    name: assembles the subject examined from each request's own subject type and attribute-values alone
      — two requests at the same capability and connector each address the outbound call with their own
      request's own subject, never a shared or cached one
  why: 'The far end''s response half is exercised whole. The request-echo half is not: the caller-visible
    echo is asserted only for request.address and request.headers[''x-requester'']; the method the caller
    reads back is asserted only on the outbound call itself, never in the echo, and nothing asserts the
    echo''s remaining parts, so a correction that altered what the echo carries beyond those two values
    on the response-answered path would leave every test in this set passing.'
findings:
- pass: standard
  file: src/http/test-connector.controller.ts
  where: handleTestConnectorRequest and its helpers resolveTestedCapability, resolveTestRequests, requireResolvedAddressIsAbsoluteUrl,
    issueOutcome (lines 30-171)
  evidence: 'if (resolution.capability.connector !== body.connector) { throw new CapabilityConnectorMismatchError(resolution.capability.connector,
    body.connector); } and function requireResolvedAddressIsAbsoluteUrl(request: AssembledConnectorRequest):
    void { try { connectorRequestUrl(request); } catch (error) { throw new ConnectorCallAddressNotAbsoluteUrlError(request.address,
    { cause: error }); } }'
  cost: The capability-connector match invariant and the resolved-address-must-be-an-absolute-URL invariant
    are decided inside test-connector.controller.ts itself -- the module also resolves the connector's
    configuration, builds the subject, issues the HTTP call, interprets timed-out/unreachable/response
    outcomes and computes orphaned placeholders -- rather than being reached by calling a single injected
    service operation the way every other controller in src/http does. A caller that needs the same checks
    from anywhere other than this one HTTP route has no function to call and has to re-implement them,
    and the two copies then diverge the day only one of them is fixed.
  correction: Move the capability resolution, the connector-match and absolute-URL checks, and the HTTP-issuing/outcome
    logic into a service the controller calls with the typed DTO, leaving the controller to map the HTTP
    request to that call and its result back to the response DTO.
  cites: ARC-04
- pass: conformance
  file: src/http/dto/test-connector.dto.ts
  where: the subjectAttributeValueSchema definition (lines 3-6), embedded in subjectSchema (lines 8-11)
    and required as testConnectorRequestSchema's subject field (line 21)
  evidence: 'const subjectAttributeValueSchema = z.object({ attribute: z.string().min(1), value: z.string().min(1),
    });'
  cost: An integrator reading this request schema learns that the test request must carry an attribute
    name the caller supplies for each value, validated as required content in its own right; a request
    omitting one fails validation before the server ever reaches the placeholder-matching the specification
    reserves to it. The next reader has no reason to suspect the attribute name is meant to come from
    the registered configuration's own placeholders rather than from the caller, because this schema treats
    it exactly like any other operator-authored field.
  correction: the subject attribute entries this schema accepts from the operator would carry only a value,
    with the attribute name read server-side from the registered configuration's ${subject:<attribute-name>}
    placeholders rather than validated here as caller-supplied content.
- pass: conformance
  file: src/http/dto/test-connector.dto.ts
  where: the 'timed-out' branch of testConnectorOutcomeSchema (lines 49-52)
  evidence: 'z.object({ kind: z.literal(''timed-out''), elapsedMs: z.number().nonnegative(), }),'
  cost: An integrator reading this schema learns that the diagnostic can answer with a distinct "timed-out"
    outcome carrying nothing but an elapsed duration -- no status, no error code, no connector name --
    as though that shape were settled. The one node in this file's set that describes what a completed
    diagnostic test answers says explicitly that a capability timeout's own abort is "Not decided here",
    so this shape is a decision the specification never made.
- pass: conformance
  file: src/http/test-connector.controller.ts
  where: line 22, the REDACTED_CREDENTIAL_MARKER constant, and its use inside redactingEnv() (lines 108-110)
    to mask every credential placeholder in the diagnostic's echoed request
  evidence: const REDACTED_CREDENTIAL_MARKER = '***REDACTED***';
  cost: This file is the sole place that fixes what an operator actually sees in place of a masked credential
    on the diagnostic read. The specification's own decision log records, for a sibling masking rule,
    that it only reused this same text as precedent and explicitly "claims nothing about" whether the
    diagnostic's own response carries it, and that no node in the specification states any masking rendering
    at all for this read. A reviewer who wants to know what an operator actually reads in place of a secret
    on this route has nowhere to look but this constant.
  correction: State the fixed rendering text a diagnostic response uses for a masked credential value
    in rules/integration/a-diagnostic-response-masks-a-resolved-credential (or a node it points to), then
    have REDACTED_CREDENTIAL_MARKER read that decided value rather than being its only source.
- pass: conformance
  file: src/__tests__/unit/http/test-connector.routes.spec.ts
  where: line 370, inside 'refuses a test-connector request whose resolved address is not a valid absolute
    URL...'; and line 398, inside 'ends a test whose issued call fails before any HTTP response...'
  evidence: 'expect(body.error.details).toEqual({ address: ''***REDACTED***/subjects/subject-value-1''
    }); ... expect(body.request.headers.authorization).toBe(''Bearer ***REDACTED***'');'
  cost: The literal marker a masked credential renders as -- the exact string ***REDACTED*** in place
    of the resolved value -- is asserted here as a fixed fact of the connector-diagnostics response, but
    rules/integration/a-diagnostic-response-masks-a-resolved-credential only says that masking happens,
    never what the masked value displays as. A reader who wants to know what an operator actually sees
    in place of a secret on this route has to read this test or the controller, not the specification.
  correction: State, in rules/integration/a-diagnostic-response-masks-a-resolved-credential (or a node
    it points to), the fixed text a masked credential value is replaced with for this diagnostic's echoed
    request and disclosed address.
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
reconciliation: siegard-reconcile/test-connector-request-echo-url-hotfix.md
---

## What it is

Coverage, conformance, standard and failures passes over the five files this corrective increment
touched. Coverage found criterion 1 covered and criteria 2 and 3 partial, both missing a full
echo comparison and full masking exercise on the unreachable path. Conformance found two
pre-existing facts this file set exposes with no specification node stating them (the masked
credential's literal rendering text, and the timed-out outcome's shape) and one pre-existing
contradiction (the request schema validating a caller-supplied attribute name the specification
reserves to the registered configuration's own placeholders). Standard found one departure from
ARC-04 in the pre-existing controller. Failures found nothing: the captured run passed.

## Notes

The two conformance findings naming pre-existing code (the DTO's attribute-name field, the
REDACTED_CREDENTIAL_MARKER constant, the timed-out outcome shape) were not introduced by this
delivery; this review reports them because they sit in files this delivery touched and the
conformance pass reads every node the trace binds to a reviewed file, not only what a task
claims to have written.
