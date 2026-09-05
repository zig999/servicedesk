---
title: Classify a connector network failure as unavailable
summary: HttpDeclarativeObservationSource classifies a network-unreachable connector
  call as unavailable instead of letting the failure propagate uncaught.
objective: When the HTTP call HttpDeclarativeObservationSource issues to a connector
  fails at the transport layer, before any HTTP response is received (a refused connection,
  a DNS resolution failure, a socket error, or any rejection other than the connector's
  own deliberate timeout abort), the observation resolves to an ObservationOutcome
  of unavailable naming a ConnectorUnreachableError and the connector, instead of
  the rejection propagating uncaught out of observeConcept.
criteria:
- 'A connector call that HttpDeclarativeObservationSource actually issues (i.e. capability
  resolution, connector configuration resolution, HTTP configuration validation and
  request assembly all already succeeded) and whose issuing step rejects before any
  HTTP response is received, for a reason other than the timeout AbortController firing,
  resolves observeConcept to { result: ''unavailable'', result_detail: ''ConnectorUnreachableError''
  } naming the connector, and does not throw, and that result_detail carries no part
  of the call''s own assembled address, query, headers or body — while every rejection
  during capability resolution, connector configuration resolution, HTTP configuration
  validation or request assembly keeps ending unavailable with its own existing cause
  name (CapabilityNotResolvedForObservationError, DuplicateConceptAnswerError, ConnectorConfigurationNotRegisteredError,
  ConnectorPlaceholderNotResolvedError, MalformedHttpConnectorConfigurationError or
  IncompleteConnectorCallDescriptorError), unrelabeled, and a failure that happens
  after an HTTP response was already received (parsing its body, extracting its fields,
  or normalizing them into the glossary vocabulary) is untouched by this task.'
- The evidence recorded for that concept carries result unavailable and a result_detail
  naming ConnectorUnreachableError and the connector, the same shape as the existing
  unavailable causes.
- The unavailable observation this failure produces is never written into the evidence
  cache, consistent with only an ok result ever entering it.
- A hypothesis whose collection plan includes that concept is judged inconclusive
  with reason no-data, citing that evidence, exactly as a-collection-timeout-degrades-to-no-data
  already does for a timeout.
- A hypothesis in the same case whose collection plan does not include that concept
  is judged normally, unaffected by the other hypothesis's collection failure.
- A simulate-case or simulate-hypothesis call whose subject is missing the attribute
  this concept would have needed is not refused for that reason, consistent with a-simulated-subject-missing-a-requirement-degrades-not-refuses;
  the connector's own timeout-abort path (already handled) is unchanged.
implements:
- rules/integration/an-unreachable-connector-ends-unavailable
- domain/investigation/evidence-result
- rules/investigation/an-inconclusive-evaluation-declares-its-reason
- rules/investigation/one-evaluation-per-required-hypothesis
sources:
- intake/scope.md
---

## What it is
Classifies a connector call's transport-layer failure (distinct from its already-handled timeout, and distinct from a failure processing a response that did arrive) as an unavailable observation, joining the causes rules/integration/an-unresolvable-observation-ends-unavailable already resolves — now beside the new rules/integration/an-unreachable-connector-ends-unavailable that states this cause — rather than letting it propagate as an uncaught exception that turns the whole simulate request into a generic 500.

## Notes
ADVISORY, from the specification — criterion 1's literal `{ result: 'unavailable', result_detail: 'ConnectorUnreachableError' }` is shorthand for the cause name only; rules/integration/an-unreachable-connector-ends-unavailable also requires the connector's name in that detail, which criterion 1's following clause and criterion 2 both already require in prose. Read whole the criteria agree with the node; an implementer reading only the literal object would ship a detail the node refuses.
ADVISORY, from the specification — criterion 1 deliberately excludes a failure that happens after an HTTP response was already received (parsing its body, extracting its fields, or normalizing them into the glossary vocabulary). No node among this task's candidates places that failure in one of the four evidence-result endings; it is the one collection-failure seam left unplaced now that the transport-layer one is stated, and it sits next to the code this task edits. Out of scope for this task.
REMAINDER, from the specification — rules/investigation/an-inconclusive-evaluation-declares-its-reason's demand over evaluations inconclusive for reason judgment-failure or deadline-exceeded reaches no criterion of this task; criterion 4 answers only for reason no-data. Belongs to the judgment-stage work already covering an evaluation that degrades from a failed or queued judgment call, not this epic's connector-failure claim.
Decision, beyond the covers — stand: the remainder above names judgment-stage behavior for reasons judgment-failure and deadline-exceeded, already implemented elsewhere and untouched by this correction; growing this epic to cover it would misattribute unrelated, already-delivered work to a connector-transport-failure claim.
