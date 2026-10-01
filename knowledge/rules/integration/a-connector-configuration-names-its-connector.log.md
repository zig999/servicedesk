---
entries:
- field: statement
  unstated: What register-connector answers to a registration with no connector name, and whether an empty string is one.
  decided: Refused with HTTP 422 reporting IncompleteConnectorConfigurationError; an empty string is no name.
  why: The material is the reconciliation record siegard-reconcile/connector-capability-corrections-post-closure-drift.md, whose findings report the delivered backend stating this fact while no node held it. The domain node marks connector required and stops there; the delivered registry refuses this way, and 422 is the status the sibling incomplete-contract refusal answers — the delivered backend leaves this class unmapped and answers 500, which this decision does not follow, because an operator omitting a name has sent an incomplete registration, not met a fault.
---
