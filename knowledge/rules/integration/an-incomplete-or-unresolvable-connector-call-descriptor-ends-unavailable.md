---
type: invariant
statement: >-
  A configuration missing its address, declaring query or headers as anything but an object of
  string values, naming a placeholder kind this connector does not recognize, or naming a
  placeholder with no argument where one is required, issues no call and ends unavailable, with
  a result detail reporting an IncompleteConnectorCallDescriptorError; a configuration naming a
  Subject attribute or a credential that resolves to nothing issues no call and ends unavailable
  the same way, with the result detail an-unresolvable-observation-ends-unavailable itself names
  for that condition.
constrains:
  - domain/integration/connector-configuration
---

## Description

A configuration missing its address or naming an unrecognized or malformed placeholder never reaches a call at all — the same evidence-result ending `an-http-connector-configuration-declares-its-method-and-status-vocabulary`'s own malformed-key case already declares, distinguished only by its own named cause. A configuration whose placeholder is well-formed but resolves to nothing is a different fact, about the data or the environment rather than about the configuration's own shape, and ends unavailable through an-unresolvable-observation-ends-unavailable's own condition for it instead.
