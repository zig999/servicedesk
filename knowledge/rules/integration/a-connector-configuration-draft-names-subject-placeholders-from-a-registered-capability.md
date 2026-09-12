---
type: policy
statement: An operation parameter or request-body field a connector configuration draft considers becomes a ${subject:<name>} placeholder in the draft's configuration wherever at least one capability is currently registered naming the connector the draft is generated for, whatever any of those capabilities' own input schemas do or do not declare among their properties; where no capability is currently registered for that connector, the parameter or field is instead named in the draft's unresolved list with reason no-capability-registered.
expression: >-
  For a connector name c a draft is generated for, and a parameter or request-body field
  named n an operation of the fetched document declares: where the set of capabilities
  currently registered naming connector c is empty, the draft's unresolved list holds an
  item naming n with reason no-capability-registered. Where that set is non-empty, the
  draft's configuration embeds ${subject:n} at n's own position, whichever capability in
  that set does or does not declare a property named n among its input schema's own. No
  third outcome exists for n.
constrains:
  - domain/integration/connector-configuration-draft
  - domain/integration/capability
consistency: eventual
---

## Description

A capability may be registered before its connector is ever configured, and a connector may be configured before any capability names it (domain/integration/connector-configuration); this rule reads only what already stands on the capability side at the moment the draft is generated — whether that set is empty — and reads no further into what any of those capabilities declare.

Whether a candidate name matches any registered capability's own input schema properties plays no part in whether the draft resolves it: registration existence is the only condition this rule tests, never what a registered capability's own schema names. A parameter or request-body field name absent from every registered capability's input schema still becomes ${subject:name} in the draft, on the same terms as one every registered capability declares.

This reopens exactly what an exact-match condition once existed to prevent: a-connector-placeholder-is-declared-by-its-capability refuses a connector configuration registration or edit whose own text embeds a subject placeholder absent from a currently registered capability's input schema properties — that refusal is unchanged by this rule, and it is now where a name the draft resolved too eagerly is caught, if it is caught at all: at the moment an operator applies the draft and submits it as the connector's own configuration, never at the moment the draft itself was generated. An operator who never applies the draft, or who applies it to a connector no capability yet names, never meets that refusal, and a draft's unresolved list no longer names this class of mismatch at all.

Where no capability is registered at all, every candidate name is unresolved for that one reason, and the draft still generates — capability registration order is not a precondition this rule imposes, the same reading domain/integration/connector-configuration already gives a configuration authored before its capability exists.
