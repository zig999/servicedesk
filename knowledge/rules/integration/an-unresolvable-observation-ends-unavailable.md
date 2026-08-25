---
type: policy
statement: An observation of a concept no registered capability currently answers, or that more than one currently answers, or whose capability names a connector no configuration is registered under, issues no call and ends unavailable, with a result detail reporting a CapabilityNotResolvedForObservationError, a DuplicateConceptAnswerError or a ConnectorConfigurationNotRegisteredError respectively.
constrains:
  - domain/integration/capability
  - domain/integration/connector-configuration
  - domain/investigation/evidence-result
consistency: eventual
---

## Description

A capability may be registered before its connector is ever configured (domain/integration/connector-configuration), so an investigation can reach a concept whose call cannot be assembled.
The absence of data is a recorded fact and never an exception (domain/investigation/evidence), so what the investigation records is an ending that names its cause, not a fault that aborts the stage.
