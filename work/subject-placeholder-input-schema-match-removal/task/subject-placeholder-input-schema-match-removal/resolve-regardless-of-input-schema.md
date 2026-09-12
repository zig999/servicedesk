---
title: Subject placeholder resolution stops requiring an input_schema name match
summary: 'Bring subject-placeholder-resolution.ts back into conformance with the revised specification:
  a request field resolves as ${subject:<name>} wherever a capability is registered for the connector,
  regardless of input_schema match.'
objective: A connector configuration draft resolves a request field to a ${subject:<name>} placeholder
  whenever at least one capability is currently registered for the connector, never withholding it for
  want of a matching input_schema property.
criteria:
- A parameter or request-body field name absent from every input schema of every capability currently
  registered against the connector still resolves as ${subject:<name>} in the draft's configuration, where
  at least one capability is registered for that connector.
- No draft names a field in its unresolved list with reason no-matching-input-schema-property.
- A connector configuration draft still refuses to resolve any candidate name, with reason no-capability-registered,
  where no capability is currently registered for that connector.
sources:
- intake/scope.md
implements:
- domain/integration/connector-configuration-draft-unresolved-item
- domain/integration/connector-configuration-draft-unresolved-reason
- rules/integration/a-connector-configuration-draft-names-subject-placeholders-from-a-registered-capability
- scenarios/integration/an-unconfigured-connector-leaves-every-parameter-unresolved
- scenarios/integration/a-mismatched-parameter-name-resolves-regardless
---

## What it is

Corrects `outcomeFor()` in `src/src/connector-registry/subject-placeholder-resolution.ts`, which
still enforces an input_schema name match the specification no longer requires.

## Notes

REMAINDER, from the specification — rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it is a candidate, but no clause of its statement reaches any criterion of this task: the drafted address and the servers-array precedence, and the positions of a path, query, header and cookie parameter and of a request-body field, are all about where a part sits once its value is known, not whether a name resolves. Belongs to the already-closed connector-configuration-helper draft-generation tasks; declared in this epic's `uncovered`.
ADVISORY, from the specification — criterion 3 refers to "any candidate name" refusing with no-capability-registered; read narrowly as a parameter or request-body field name (this task's own scope), the criterion is fully backed by the subject-placeholder rule. Whether a security scheme is separately left unresolved with the same reason when no capability is registered is governed by rules/integration/a-connector-configuration-draft-names-a-generated-credential-for-a-reducible-security-scheme, outside this task's candidates, and is not extended here.
Decision, beyond the covers — stand: rules/integration/a-connector-configuration-draft-names-a-generated-credential-for-a-reducible-security-scheme is named only to bound this task's own criterion to parameters and request-body fields; nothing here implements or touches that rule, so the epic's claim is not grown for it.
ADVISORY, from the specification — decision-log.md still carries two entries (rules/integration/a-connector-configuration-draft-names-subject-placeholders-from-a-registered-capability.md field statement, and domain/integration/connector-configuration-draft-unresolved-reason.md field values) whose recorded text is the exact condition this task's implements now reverses (the every-capability exact-match requirement and the no-matching-input-schema-property value). No later entry records the reversal; the node text itself is unambiguous and is what this task implements, but a reader of the log alone would see the opposite of what the nodes now state.
Decision, beyond the covers — stand: decision-log.md is named only to disclose a provenance gap in the log itself, an append-only record this task neither implements nor amends; the epic's claim is not grown for it.
