---
type: policy
statement: >-
  Neither outcome a-submitted-registration-states-its-outcome-to-the-operator states is stated of
  a submission the registry has not answered, and the two never read alike.
constrains:
  - domain/integration/capability
  - domain/integration/connector-configuration
consistency: eventual
---

## Description

A write repeated is a second write and never a recovery of the first, so a submission is not re-issued by anything stated here, and nothing about an outstanding submission is stated before the registry answers it — the same bound `a-refused-draft-request-states-its-refusal-to-the-operator` puts on its own two outcomes.
