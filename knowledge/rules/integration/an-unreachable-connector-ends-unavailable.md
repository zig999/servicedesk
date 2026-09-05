---
type: policy
statement: An HTTP connector call an observation has issued that fails before any HTTP response is received — a refused connection, a DNS resolution failure, a socket error, or any other rejection short of a response, the capability timeout's own deliberate abort excepted — ends the observation as unavailable and never propagates out of observe-concept as a fault, with a result detail reporting a ConnectorUnreachableError together with the name of the connector whose registered configuration issued the call, and carrying no part of that call's own assembled address, query, headers or body.
constrains:
  - domain/integration/connector-configuration
  - domain/investigation/evidence-result
consistency: eventual
---

## Description

Every collection ends in exactly one of the four evidence results, and a call nothing at the far end ever answered still has to land in one.
Unavailable is the ending that claims the least — it asserts no denial and no timeout, and it never enters the evidence cache — the same reading an-unclassified-status-ends-unavailable already gave a status nobody classified and an-unresolvable-observation-ends-unavailable already gave a call that was never issued at all.
Timeout is not it: a timeout is the capability's own declared deadline abandoning a call still in flight (no-stage-aborts-on-its-deadline), while a connection refused, unresolved or broken never reached a deadline to exceed, and recording one as the other would tell an operator a far end is slow when it is down.
The absence of data is a recorded fact and never an exception (domain/investigation/evidence), and the collection stage records endings rather than raising (no-stage-aborts-on-its-deadline), so a rejection at issue is an ending like every other collection failure rather than a fault — a fault here would abort the whole call it arrived in, taking with it every hypothesis that never collected the concept whose connector was down.
The detail names the connector because this cause is outside the system: which far end did not answer is the whole of what anyone can act on, and the registered connector name is the only identifier of it that is not the call's own text — the address, query, headers and body may each hold what a credential placeholder resolved to, which a-diagnostic-response-masks-a-resolved-credential keeps out of what a reader is shown.
The name says unreachable rather than unavailable because unavailable is already the shared ending of every collection failure: a detail repeating it would restate the result the same evidence item already carries instead of distinguishing this cause from the others, which is the whole job the sibling details do.
