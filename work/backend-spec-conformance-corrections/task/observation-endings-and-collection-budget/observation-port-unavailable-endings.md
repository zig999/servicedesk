---
title: Observation port and adapter return unavailable endings instead of throwing
summary: The four presently-unresolvable observation conditions end unavailable with a named result detail instead of raising.
objective: The observation port can express, and the production HTTP adapter returns rather than throws, an unavailable ending naming its cause for each of the four cases a concept cannot currently be observed.
criteria:
  - Observing a concept no registered capability currently answers returns an unavailable ending with result_detail CapabilityNotResolvedForObservationError, without raising an exception.
  - Observing a concept more than one registered capability currently answers returns an unavailable ending with result_detail DuplicateConceptAnswerError, without raising an exception.
  - Observing a concept whose capability names a connector no configuration is registered under returns an unavailable ending with result_detail ConnectorConfigurationNotRegisteredError, without raising an exception.
  - Observing a concept whose connector configuration does not declare method, responseMap or statusMap returns an unavailable ending with result_detail MalformedHttpConnectorConfigurationError, without raising an exception.
  - None of the four cases issues an HTTP call.
rationale: I isolated the port-and-adapter change from the collection stage's own recording of that detail, since the stage is a caller of the widened outcome rather than part of delivering it, and the two are independently demonstrable — this task's criteria can be shown met by invoking the port directly.
implements:
  - rules/integration/an-unresolvable-observation-ends-unavailable
  - rules/integration/an-http-connector-configuration-declares-its-call
  - contracts/investigation/observation-source
  - contracts/integration/concept-observation
  - domain/investigation/evidence
sources:
  - intake/scope.md
---

## What it is

The observation port's outcome type can carry a result detail naming why an observation could not proceed.
The production HTTP adapter's four raise sites become returned unavailable endings instead of thrown exceptions.

## Notes

None.
