---
type: policy
statement: An observation of a concept no registered capability currently answers, that more than one currently answers, whose capability names a connector no configuration is registered under, or whose call cannot be assembled because a placeholder naming a Subject attribute or a credential resolves to nothing, issues no call and ends unavailable, with a result detail reporting a CapabilityNotResolvedForObservationError, a DuplicateConceptAnswerError, a ConnectorConfigurationNotRegisteredError or a ConnectorPlaceholderNotResolvedError respectively.
constrains:
  - domain/integration/capability
  - domain/integration/connector-configuration
  - domain/investigation/evidence-result
consistency: eventual
---

## Description

A capability may be registered before its connector is ever configured (domain/integration/connector-configuration), so an investigation can reach a concept whose call cannot be assembled.
The absence of data is a recorded fact and never an exception (domain/investigation/evidence), so what the investigation records is an ending that names its cause, not a fault that aborts the stage.
A placeholder resolving to nothing joins these three for the same reason each already degrades rather than faults: with a-diagnosed-subject-covers-its-cases-required-attributes refusing at the door whatever a case's own derived requirements demand, what still reaches a call unresolved here is always something optional — an attribute the capability's own input schema does not require, a required one its registration under-declared (a-connector-placeholder-is-declared-by-its-capability catches that at the write it escaped), or a credential's environment variable absent from configuration — a fact of data or configuration, exactly the class this rule already resolves as a recorded ending rather than a fault that aborts the stage.
