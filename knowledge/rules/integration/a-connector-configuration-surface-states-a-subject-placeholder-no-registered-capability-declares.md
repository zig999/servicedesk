---
type: policy
statement: >-
  A surface presenting or editing a connector configuration under a connector name states, for
  each ${subject:<attribute-name>} placeholder the well-formed JSON object text of its
  Configuration field embeds, whether the attribute name is among the input schema properties of
  every capability currently registered naming that connector — naming the placeholder and the
  capability that does not declare it where one does not — and states, where no capability is
  currently registered naming that connector, that its subject placeholders cannot be checked.
constrains:
  - domain/integration/connector-configuration
  - domain/integration/capability
consistency: eventual
---

## Description

a-connector-placeholder-is-declared-by-its-capability refuses the write, and a-connector-placeholder-refusal-reports-every-orphaned-placeholder names what the refusal reports; the operator meets both a round trip after typing the placeholder.
Stating the same reading beside the field, from the capabilities the surface reads at that moment, hands the operator the correction before the write rather than after it.
The reading is the surface's own at the moment it is made and the registry's at the moment of the write, so the two can differ where a capability is registered between them, which is why the statement withholds nothing.
