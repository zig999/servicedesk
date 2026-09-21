---
title: Test-connector request echo URL hotfix
summary: 'A corrective increment: the test-connector endpoint''s request-echo path
  throws an uncaught TypeError on a non-absolute address instead of reporting a comprehensible
  error.'
covers:
- constraints/no-route-enforces-authentication
- constraints/a-domain-error-unmapped-by-status-is-refused-generically
- contracts/integration/connector-diagnostics
- domain/integration/connector-configuration
- rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
- rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
- rules/integration/a-connector-placeholder-is-declared-by-its-capability
- rules/integration/a-diagnostic-response-masks-a-resolved-credential
- rules/integration/a-diagnostic-test-of-an-unreachable-connector-answers-as-a-completed-test
uncovered:
- node: constraints/no-route-enforces-authentication
  why: Cited by the task's binding only as why criterion 1's resolved-address disclosure is no
    leak -- nothing this constraint states is itself demonstrated by this correction.
- node: constraints/a-domain-error-unmapped-by-status-is-refused-generically
  why: The node stating the INTERNAL_ERROR envelope this correction replaces, but the two
    implemented rules remove their own conditions from that constraint's class rather than
    restating it -- this correction narrows what the constraint still governs, and does not
    implement the constraint's own generic-refusal behavior.
- node: domain/integration/connector-configuration
  why: The aggregate every implemented rule constrains, not a behavior of its own this correction
    changes.
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  why: Bound to test-connector.controller.ts by the trace because the file participates in
    connector-configuration reads generally; this correction touches only the test action's
    address-validity and unreachable-call answers, not the unregistered-name read this rule
    governs.
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  why: Bound to test-connector.controller.ts by the trace because the file assembles a subject
    from a registered configuration's placeholders; this correction touches only what the test
    answers once that assembly and the call it drives meet an invalid address or an unreachable
    far end, not the placeholder-declaration check itself.
sources:
- intake/scope.md
---

## What it is

A corrective increment: POST /v1/test-connector builds an echo of the resolved request for its
response by calling connectorRequestUrl() a second time, unprotected by any try/catch, so a
connector configuration whose address is not a valid absolute URL throws an uncaught TypeError
that escapes to Fastify's generic error handler as an opaque 500 INTERNAL_ERROR, instead of the
same comprehensible error the endpoint already returns when that same function fails building
the actual outbound call.

## Notes

covers is seeded mechanically from `trace.py --encodes src src/http/test-connector.controller.ts`,
per the corrective-increment route -- every node that command returned is listed here, before
reconciliation against what the binder returns. `constraints/a-domain-error-unmapped-by-status-is-refused-generically`
is added by hand: the first binder run returned it as an advisory note -- the "generic
INTERNAL_ERROR envelope" criterion 1 must avoid is exactly that constraint's own statement, and
`--encodes` did not surface it because no file binds to it directly. Every `constraints/` node
is a candidate regardless of what a grep or trace returns.

`rules/integration/a-diagnostic-test-of-an-unreachable-connector-answers-as-a-completed-test` is
added by hand too: the second binder run returned an `unstated` note over what test-connector
answers when its issued call fails before any HTTP response is received, and the
unstated-fact-decider spawned for that fact wrote a new node stating it -- the edit landed in a
node no skeleton's candidates held, so the covers grows to it rather than treating the decided
fact as a silence a second time.
