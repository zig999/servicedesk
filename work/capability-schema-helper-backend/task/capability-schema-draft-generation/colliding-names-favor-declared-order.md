---
title: Settle an input_schema property name two parts of the operation claim
summary: Where two parameters, or a parameter and a request-body field, would occupy one input_schema property name, give that property to the first in the order path, query, header, cookie, request-body field and disclose every other by name.
sources:
- intake/scope.md
objective: Where two parts of the chosen operation would occupy one and the same input_schema property name, the first of them in the order path parameter, query parameter, header parameter, cookie parameter, request-body field holds that property and every other one is named in the draft's unresolved list with reason name-claimed-by-another-parameter, unless the first claimant's own schema does not reduce to one JSON Schema type, in which case the name carries no properties entry at all and the first claimant is itself named in unresolved with reason schema-not-reducible-to-a-type.
depends_on:
- task/capability-schema-draft-generation/input-schema-from-parameters-and-request-body-fields
criteria:
- input_schema's properties object holds exactly one entry for a name two or more parts of the operation claim, where the first claimant in declared order reduces to one JSON Schema type.
- that entry holds the type of the first claimant in the order path parameter, query parameter, header parameter, cookie parameter, request-body field.
- that name stands in input_schema's required array where and only where that first claimant is itself declared required and holds a properties entry.
- every claimant other than the first declares no properties entry.
- every claimant other than the first is named in the draft's unresolved list with reason name-claimed-by-another-parameter.
- an unresolved item for a displaced claimant names the name exactly as the OpenAPI document itself gives it.
- a name only one part of the operation claims stands in no unresolved item with reason name-claimed-by-another-parameter.
- where the first claimant in declared order does not itself reduce to one JSON Schema type, the name carries no properties entry at all, the first claimant is named in unresolved with reason schema-not-reducible-to-a-type, and every other claimant is still named in unresolved with reason name-claimed-by-another-parameter.
- an operation declaring a query parameter named status and a request-body field also named status drafts an input_schema whose properties object holds exactly one entry named status holding the query parameter's own type, and an unresolved list naming status with reason name-claimed-by-another-parameter.
- two parameters of the chosen operation equal in both name and location are ranked between themselves by the position the parameters array declaring them gives each, the earlier standing first as the properties entry and the later named in unresolved with reason name-claimed-by-another-parameter.
implements:
- domain/integration/capability-schema-draft
- domain/integration/capability-schema-draft-unresolved-item
- domain/integration/capability-schema-draft-unresolved-reason
- rules/integration/a-capability-schema-drafts-parameter-or-field-name-claimed-twice-favors-declared-order
- rules/integration/a-name-whose-first-claimant-is-unreducible-drafts-no-input-schema-entry
- rules/integration/a-part-both-unreducible-and-name-claimed-stands-in-unresolved-under-each-reason
- scenarios/integration/a-schema-drafts-colliding-parameter-names-favor-declared-order
---

## What it is

The precedence among parts of one operation that would occupy one properties key, and the disclosure of every displaced one, including where the winning part is itself unreadable as a single type.
It settles the collision by a fixed order rather than by merging the two or refusing the draft.

## Notes

The order read is the order OpenAPI 3.x itself gives a parameter's location before it reaches a request body.
A displaced claimant is disclosed rather than dropped, so the operator learns a second part of the operation answers to that name.
UNDERDETERMINED, from the specification -- No criterion of this task demands the second unresolved item a-part-both-unreducible-and-name-claimed-stands-in-unresolved-under-each-reason requires for a displaced claimant that is itself unreducible: criterion 5 is satisfied by the single name-claimed-by-another-parameter item alone.
REMAINDER, from the specification -- a-capability-schema-drafts-input-schema-is-read-from-the-chosen-operations-parameters-and-fields's opening clause (the ordinary, non-colliding reading of parameters and request-body fields into properties and required) and its closing clause (an unreducible, uncontested name's own disclosure) reach no criterion of this task.
REMAINDER, from the specification -- a-capability-schema-drafts-output-schema-is-read-from-the-chosen-operations-success-responses and its scenario reach no criterion of this task, which drafts input_schema only.
ADVISORY, from the specification -- The criterion ranking two parameters equal in both name and location by parameters-array position presumes both stand inside one parameters array, a presumption a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs grounds (the operation's own parameter taking precedence over a path item's at one name and location) and which is not a candidate of this task.
Decision, beyond the covers -- stand: that rule already stands delivered in src/src/connector-registry/openapi-operation-reader.ts as the reading the sibling connector configuration draft already exercises; this plan reuses that implementation rather than redelivering the rule, per the epic's own uncovered entry.
