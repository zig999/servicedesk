---
type: invariant
statement: >-
  A connector configuration's diagnostic test whose issued call fails before any HTTP
  response is received — a refused connection, a DNS resolution failure, a socket error or
  any other rejection short of a response — answers HTTP 200 as a test that ran and never a
  refusal status, reports a ConnectorUnreachableError together with the name of the
  connector whose registered configuration issued the call and no response status, and
  carries back the same echoed request a test answered by a response carries, with every
  value a credential placeholder resolved to masked.
constrains:
  - domain/integration/connector-configuration
---

## Description

A test whose call was rejected at the socket did the whole of what `contracts/integration/connector-diagnostics` asks of it: the configuration resolved, the call assembled, the far end was reached for, and nothing there answered. That is a finding, so the answer that carries it is an answer and not a refusal. A 4xx would state that the operator's request was wrong, which it was not — the two refusals `a-connector-configuration-is-tested-through-a-registered-capability` already fixes, HTTP 404 for no capability registered at the named identity and HTTP 409 for a connector the found capability does not name, are what a wrong request meets, and this request named both correctly. A 5xx would state that this system failed, the one reading `constraints/a-domain-error-unmapped-by-status-is-refused-generically` reserves for what nothing anticipated, and it would reach the operator as `INTERNAL_ERROR` with the fixed text and no context at all — telling them nothing about the far end, which is the only thing they called this operation to learn.

`ConnectorUnreachableError` rather than a name minted for the diagnostic, because this is the same condition `an-unreachable-connector-ends-unavailable` already names, arising from the same registered configuration issuing the same assembled call: the value names the cause, not the operation that met it, and an operator who meets one name here and another in an investigation's result detail is left deciding whether the two found the same thing. The connector's name travels with it for the reason it travels there — which far end did not answer is the whole of what anyone can act on.

No response status accompanies it because none was received. `an-http-connector-configuration-declares-its-method-and-status-vocabulary` holds a `statusMap` mapping an HTTP status to an evidence-result ending, and a call rejected short of a response reached no status to map; a status field filled anyway would be read as the far end's own answer, which is precisely the reading this case must not produce.

The echoed request stays in the answer here, where `an-unreachable-connector-ends-unavailable` keeps the call's own assembled address, query, headers and body out of the result detail it writes. That withholding is a credential measure — a resolved call's text may hold what a credential placeholder resolved to, and an evidence result detail carries no masking of its own — and this read does carry one: `a-diagnostic-response-masks-a-resolved-credential` already puts the diagnostic's echo in front of an operator with every resolved credential value masked, so the exposure that justifies withholding there is already answered here. Withholding it a second time would take from the operator the one artifact that makes an unreachable far end diagnosable — the address, query, headers and body actually assembled — on the one run where nothing else came back to read, leaving a connector that is genuinely down indistinguishable from a configuration pointing somewhere its author never meant.

Not decided here: what the test answers when the configuration's own call descriptor cannot be assembled at all, which is `an-incomplete-or-unresolvable-connector-call-descriptor-ends-unavailable`'s question and not this one; what a capability timeout's own deliberate abort answers, excepted from this condition exactly as its sibling excepts it; the rest of what the diagnostic's answer carries, which stays `contracts/integration/connector-diagnostics`' own and `a-diagnostic-response-masks-a-resolved-credential`'s own; and how an operator-facing screen presents any of it, which every surface rule of this specification leaves to the interface.

An invariant over `domain/integration/connector-configuration`, immediate and inside that one aggregate — the home `a-diagnostic-response-masks-a-resolved-credential` already takes for the other fact about what this same diagnostic hands back. A new rule rather than the api contract, which cannot declare a refusal or an answer shape of its own, and rather than `a-connector-configuration-is-tested-through-a-registered-capability`, which fixes what a test exercises and which requests it refuses before any call is issued, not what a call that was issued and never answered reports.

Disclosed as this route requires: the scope material under `work/test-connector-request-echo-url-hotfix/intake/` reports a different failure of the same endpoint — an exception raised while building the response's echoed request escaping as a generic 500 — and notes in passing that the outbound call's own failure already returns a structured error outcome, without stating the status that outcome is answered with, the error value it names, or whether the assembled call reaches the caller with it. The reasoning here rests on this specification's own standing rules, and a reviewer who rejects it rejects that reasoning.
