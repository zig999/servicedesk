---
title: A connector test reports an invalid address instead of an opaque internal error
summary: POST /v1/test-connector's request echo no longer lets an invalid-address
  exception escape as a generic 500.
objective: A connector test against a configuration whose resolved address is not
  a valid absolute URL reports the specification's own stated refusal for that condition,
  instead of ending with the opaque INTERNAL_ERROR envelope.
criteria:
- Testing a connector configuration whose resolved address is not a valid absolute
  URL issues no call and ends the request with an HTTP 422 response reporting a ConnectorCallAddressNotAbsoluteUrlError
  that discloses the resolved address, masked wherever a credential placeholder resolved
  into it, and no other part of the call.
- Testing a connector configuration whose resolved address is a valid absolute URL,
  whose issued call fails before any HTTP response is received, and whose failure
  is not the capability's own timeout aborting the call, ends the request with an
  HTTP 200 response reporting a ConnectorUnreachableError together with the name of
  the connector whose registered configuration issued the call and no response status,
  and carrying the same echoed request a response-answered test carries, with every
  value a credential placeholder resolved to masked.
- 'Testing a connector configuration whose resolved address is a valid absolute URL
  and whose issued call receives an HTTP response is unaffected by this correction:
  the request echo and the far end''s response reach the caller exactly as they did
  before this correction.'
sources:
- intake/scope.md
implements:
- contracts/integration/connector-diagnostics
- rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
- rules/integration/a-diagnostic-response-masks-a-resolved-credential
- rules/integration/a-diagnostic-test-of-an-unreachable-connector-answers-as-a-completed-test
---

## What it is

A corrective increment fixing the request-echo path of POST /v1/test-connector, which currently
lets an invalid-address TypeError escape uncaught to Fastify's generic error handler instead of
reporting the same kind of comprehensible error the endpoint already reports when that same
function fails while resolving the outbound call itself.

## Notes

REMAINDER, from the specification -- Five clauses of rules/integration/a-connector-configuration-is-tested-through-a-registered-capability's statement reach no criterion of this task: that a configuration is tested only through a specific, already-registered capability naming it; that the configuration exercised is the one currently registered under that connector name, read at the moment of the test, never unsaved authoring text; that the assembled subject carries exactly the Subject attributes named by the configuration's own placeholders; the HTTP 404 CapabilityNotRegisteredForTestError refusal; and the HTTP 409 CapabilityConnectorMismatchError refusal. Only the sixth clause, the invalid-absolute-URL refusal, is this task's criterion 1; the other five are already-delivered behavior, unchanged by this correction.
UNDERDETERMINED, from the specification -- No criterion says what the diagnostic answers when the capability's own timeout aborts the call. Criterion 2 excludes that case from the ConnectorUnreachableError answer but states no alternative; rules/integration/a-diagnostic-test-of-an-unreachable-connector-answers-as-a-completed-test excepts that abort from its condition and records under "Not decided here" that what a capability timeout's own deliberate abort answers is undecided. An implementation that folds the timeout abort into the same unreachable branch would satisfy every criterion here while answering an undecided condition; the implementer and reviewer leave the existing delivered behavior for a capability timeout untouched, since deciding it is outside this correction's two reported behaviors.
ADVISORY, from the specification -- No candidate states what the echoed request and the far end's response carry on a test answered by an HTTP response; criterion 2's "same echoed request a response-answered test carries" and criterion 3's non-regression wording are anchored in delivered behavior rather than in a node, which is deliberate for a non-regression guard but leaves the echo's content itself unheld by the specification.
ADVISORY, from the specification -- constraints/a-domain-error-unmapped-by-status-is-refused-generically is the node stating the INTERNAL_ERROR envelope this correction replaces, but it is not implemented here: this task's two implemented rules remove their own conditions from that constraint's class rather than restating it. constraints/no-route-enforces-authentication is cited only as why criterion 1's address disclosure is no leak; neither constraint has anything of its own to demonstrate here.
