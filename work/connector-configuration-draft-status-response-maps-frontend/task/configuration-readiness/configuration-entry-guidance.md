---
title: The Configuration entry states what the HTTP connector reads from it
summary: Beside the field, the entry says that what is entered is a JSON object, which keys the connector
  reads, and the three forms a placeholder is written in.
objective: The Configuration field's entry states the four things the specification bounds it to and states
  no further claim.
criteria:
- The entry states that what is entered is a JSON object.
- The entry states that the HTTP connector reads a configuration's method, address, statusMap and responseMap.
- The entry states that the HTTP connector reads a query, headers and a body where the configuration declares
  them.
- The entry states that a placeholder is written as ${subject:<attribute-name>}, ${requester} or ${credential:<name>}.
- The entry states no claim about a connector configuration beyond those four.
- The entry refuses nothing and withholds no act.
sources:
- intake/scope.md
implements:
- domain/integration/connector-configuration
- rules/integration/a-connector-configuration-entry-states-what-the-http-connector-reads-from-it
---

## What it is
The fixed guidance line beside the Configuration textarea.
Each of its claims is one three existing rules already hold, and it carries no worked example of its own.

## Notes
A configuration is opaque text the operator authors directly, and the keys it must carry are stated by rules the operator has not read.
UNDERDETERMINED, from the specification -- The governing rule's Description bounds the entry to the three rules' facts and states it carries no example of its own, for the reason it draws from rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it -- a screen carrying its own worked example would be a second home for the fact. No criterion of this task excludes an example, since an illustration of the same four claims is not a fifth claim about a connector configuration.
Decision, beyond the covers — stand: rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it is an unrelated, unchanged node this epic does not touch; growing the claim to cover it would be scope creep for a reference this task only reads, never redefines.
An entry that makes all four statements and, beside them, carries its own worked example configuration -- a sample JSON object showing method, address, statusMap, responseMap and a ${subject:<attribute-name>} placeholder -- as guidance satisfies every criterion as written, and the rule's Description refuses an entry carrying an example of its own.
UNDERDETERMINED, from the specification -- Criterion 6 ("refuses nothing and withholds no act") restates the entry rule's "refusing nothing", but nothing in the criteria scopes the withholding clause to the entry's own statement, so it can be read as a claim about the surface's acts. rules/integration/a-connector-configuration-surface-offers-no-submission-while-its-content-is-not-well-formed states that no act submitting a registration is offered while the surface's judgment finds the field's content not well-formed JSON object text, and rules/integration/a-connector-configuration-surfaces-readiness-statements-carry-no-claim-no-rule-decides holds that withholding as the one the surface makes.
A surface whose Configuration entry makes the four statements and which, honouring "withholds no act", offers the register-connector submission act unconditionally -- including over content its own judgment finds not to be well-formed JSON object text -- satisfies criterion 6 while the well-formedness rule refuses it.
REMAINDER, from the specification -- rules/integration/an-http-connector-configuration-declares-its-method-and-status-vocabulary's clauses beyond the declared keys -- that an observation reaching a configuration lacking any of the three issues no call and ends unavailable, with a result detail reporting a MalformedHttpConnectorConfigurationError stating the vocabulary beside it -- reach no criterion of this task. Belongs to the act delivering HTTP connector execution at observation.
REMAINDER, from the specification -- rules/integration/an-http-connector-configuration-declares-its-call's clauses beyond the declared keys -- that address is a non-empty string, query and headers objects of string values, body of any shape, and that a placeholder is substituted as plain text and never evaluated as code -- reach no criterion of this task. Belongs to the act delivering HTTP connector call assembly and placeholder resolution.
REMAINDER, from the specification -- rules/integration/a-connector-configuration-placeholder-is-written-in-one-of-three-forms' clause that a placeholder is written as the literal text form ${kind} or ${kind:argument} reaches no criterion of this task; the entry states only the three concrete forms. Belongs to the act delivering placeholder parsing and resolution in the HTTP connector.
ADVISORY, from the specification -- The remaining candidates govern other statements this surface makes, not the entry's four claims; those statements are judgments over the field's current content, while this task's entry is standing guidance that turns on no content. The seam is that both stand beside the same field, and the judgment statements must stay distinguishable from the entry's standing guidance.
