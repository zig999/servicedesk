---
type: invariant
statement: A simulate-case and a simulate-hypothesis call each carry, in the call's own payload, the requester whose authorization scope that call's collection runs in; a call whose payload carries no requester, or an empty one, is refused before any collection, with the refusal every route gives a body that fails its declared shape.
constrains:
  - domain/investigation/evidence
---

## Description

rules/investigation/collection-runs-in-the-requester-scope holds every collection to the requester's own authorization scope and never the service's, and a simulation runs that same collection through the same connectors — so a simulation arriving with no requester has no scope to run in, and the only scope left to run it in is the service's own, which that rule forbids outright. Requiring the requester on both operations is what keeps the two from meeting in that gap.
Nothing else could carry it: rules/investigation/a-simulation-writes-no-investigation keeps a simulation out of the record, so domain/investigation/investigation's own requester attribute — which arrives in the diagnose call alone — says nothing about a simulation, and neither operation resolves an identity of its own. The value is the caller's claim, unverified, exactly as constraints/no-route-enforces-authentication states for every requester this build accepts.
The refusal is the standing one rather than a new one: a required field absent from a body is a failure of the route's declared shape, which constraints/a-malformed-request-is-refused-with-a-validation-error already answers for every route, so no status or error name of its own is stated here.
rules/investigation/a-simulated-subject-missing-a-requirement-degrades-not-refuses is untouched by this door — that rule is about an attribute-value of the subject, whose absence one concept's own observation records as unavailable, while a missing requester has no degraded form: there is no scope in which anything could be collected at all.
