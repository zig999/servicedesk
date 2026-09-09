---
type: policy
statement: An operation parameter or request-body field a connector configuration draft considers becomes a ${subject:<name>} placeholder in the draft's configuration only where at least one capability is currently registered naming the connector the draft is generated for and every capability currently registered naming that connector names that exact parameter or field name — matched case-sensitively and separator-sensitively, never normalized — among its own input schema properties, the draft reading every one of those capabilities together and never one of them chosen over the others; where no capability is currently registered for that connector, the parameter or field is instead named in the draft's unresolved list with reason no-capability-registered, and where at least one is registered and any one of them does not name that exact name among its properties, the parameter or field is instead named in that list with reason no-matching-input-schema-property.
expression: >-
  For a connector name c a draft is generated for, and a parameter or request-body field
  named n an operation of the fetched document declares: where the set of capabilities
  currently registered naming connector c is empty, the draft's unresolved list holds an
  item naming n with reason no-capability-registered. Where that set is non-empty and
  every capability in it has an input schema whose properties holds a key equal to n by
  byte-for-byte comparison, the draft's configuration embeds ${subject:n} at n's own
  position. Where that set is non-empty and any capability in it has an input schema
  whose properties holds no key equal to n, the draft's unresolved list holds an item
  naming n with reason no-matching-input-schema-property. No third outcome exists for n;
  no placeholder is ever generated from a name matched by anything short of byte-for-byte
  equality, and none from a name fewer than every capability in that set declares.
constrains:
  - domain/integration/connector-configuration-draft
  - domain/integration/capability
consistency: eventual
---

## Description

A capability may be registered before its connector is ever configured, and a connector may be configured before any capability names it (domain/integration/connector-configuration); this rule reads only what already stands on the capability side at the moment the draft is generated, the same restraint a-connector-placeholder-is-declared-by-its-capability already holds for the registration write it protects. A draft built this way can never itself introduce the orphaned placeholder that rule refuses, because it never emits ${subject:name} for a name every capability currently registered against that connector does not already declare in its own input schema.

The match is exact rather than normalized on purpose: a name that merely resembles a declared property — a different case, a different separator — is not evidence of the same fact, and silently equating the two would risk resolving a placeholder against an attribute it was never declared for. An operator who judges two differently-spelled names to mean the same thing corrects the draft by hand; the draft itself never guesses.

Several capabilities may name one connector — a connector holds one configuration, and each capability naming it answers its own concept through that same call descriptor — so the draft reads all of them and holds a name to all of them, rather than choosing one to read. That is the reading a-connector-placeholder-is-declared-by-its-capability already fixes for the registered state: it refuses a capability registration whose own input schema properties lack a subject placeholder the connector's standing configuration embeds, so a configuration's subject placeholders can only ever be names every capability naming that connector declares, in whichever order the two sides were written. A draft resolving a name only some of them declare would hand the operator a configuration the registry refuses to accept, which is the one thing a helper generating candidate configurations must not do.

Where no capability is registered at all, every candidate name is unresolved for that one reason, and the draft still generates — capability registration order is not a precondition this rule imposes, the same reading domain/integration/connector-configuration already gives a configuration authored before its capability exists.
