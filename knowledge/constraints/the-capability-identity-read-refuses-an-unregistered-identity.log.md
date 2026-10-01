---
entries:
- field: statement
  unstated: No node states what read-capability-by-identity answers when the name and version it is given is not currently registered at any capability — the specification's operations list (contracts/integration/capability-registry.md) names the read but not its miss behavior, and no rule or constraint anywhere in the specification pairs an HTTP status with a refusal condition except this route's own sibling rate-limit constraint.
  decided: An HTTP 404 response, naming CapabilityIdentityNotFoundError as the specific condition and message of the refusal.
  why: The route's own sibling constraint (the-capability-identity-read-is-rate-limited) already establishes this specification's idiom for stating this exact route's HTTP-level refusal shape as an Architecture Constraint rather than a domain Rule — every Rule and Scenario in the specification states a refusal in domain language alone and never cites a status code, while the one place a status code appears is that sibling constraint. The corrective scope's own text independently confirms CapabilityIdentityNotFoundError as the already-settled, unchanged condition and message for this miss (only its raising point is being relocated, not its identity), so the decision fixes the missing HTTP-response pairing for that already-given condition rather than inventing a new one.
---
