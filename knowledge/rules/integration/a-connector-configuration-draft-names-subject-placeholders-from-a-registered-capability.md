---
type: policy
statement: An operation parameter or request-body field a connector configuration draft considers becomes a ${subject:<name>} placeholder in the draft's configuration only where a capability is currently registered naming the connector the draft is generated for, and that capability's own input schema names that exact parameter or field name — matched case-sensitively and separator-sensitively, never normalized — among its properties; where no capability is currently registered for that connector, or where the one registered does not name that exact name among its properties, the parameter or field is named in the draft's unresolved list instead, with reason no-capability-registered or no-matching-input-schema-property respectively, and never becomes a placeholder.
expression: >-
  For a connector name c a draft is generated for, and a parameter or request-body field
  named n an operation of the fetched document declares: where no capability is currently
  registered naming connector c, the draft's unresolved list holds an item naming n with
  reason no-capability-registered. Where a capability is currently registered naming
  connector c, and that capability's own input schema properties holds a key equal to n by
  byte-for-byte comparison, the draft's configuration embeds ${subject:n} at n's own
  position. Where such a capability is registered and its input schema properties holds no
  key equal to n, the draft's unresolved list holds an item naming n with reason
  no-matching-input-schema-property. No third outcome exists for n, and no placeholder is
  ever generated from a name matched by anything short of byte-for-byte equality.
constrains:
  - domain/integration/connector-configuration-draft
  - domain/integration/capability
consistency: eventual
---

## Description

A capability may be registered before its connector is ever configured, and a connector may be configured before any capability names it (domain/integration/connector-configuration); this rule reads only what already stands on the capability side at the moment the draft is generated, the same restraint a-connector-placeholder-is-declared-by-its-capability already holds for the registration write it protects. A draft built this way can never itself introduce the orphaned placeholder that rule refuses, because it never emits ${subject:name} for a name the registered capability's own input schema does not already declare.

The match is exact rather than normalized on purpose: a name that merely resembles a declared property — a different case, a different separator — is not evidence of the same fact, and silently equating the two would risk resolving a placeholder against an attribute it was never declared for. An operator who judges two differently-spelled names to mean the same thing corrects the draft by hand; the draft itself never guesses.

Where no capability is registered at all, every candidate name is unresolved for that one reason, and the draft still generates — capability registration order is not a precondition this rule imposes, the same reading domain/integration/connector-configuration already gives a configuration authored before its capability exists.
