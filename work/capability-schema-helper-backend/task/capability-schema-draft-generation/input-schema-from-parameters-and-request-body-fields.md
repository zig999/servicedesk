---
title: Draft the input_schema from the chosen operation's parameters and request-body fields
summary: Derive a capability schema draft's input_schema — its properties entries, its required array — from the parameters and the request-body fields of one read operation, disclosing every name whose schema does not reduce to one type, for names no other part of the operation also claims.
sources:
- intake/scope.md
objective: One read OpenAPI 3.x operation yields a capability schema draft whose input_schema declares a properties entry for each parameter and request-body field, not claimed by any other part of the operation, whose own schema reduces to one JSON Schema type, a required array of exactly such names the operation declares required, and an unresolved item with reason schema-not-reducible-to-a-type for each such name that does not reduce.
criteria:
- input_schema is JSON text that parses to an object declaring a top-level properties object.
- properties holds one entry keyed by the name of each parameter the operation declares, read through its path item and its $refs, whose name no other parameter or request-body field of the operation also claims, and whose own schema reduces to one JSON Schema type.
- properties holds one entry keyed by the name of each top-level property of the operation's application/json request-body schema whose name no other parameter or request-body field of the operation also claims, and whose own schema reduces to one JSON Schema type.
- each properties entry declares the type that name's own schema declares.
- a schema stating a type directly reduces to that type.
- a schema every branch of whose allOf states one and the same type reduces to that type.
- a schema every branch of whose oneOf or anyOf names one and the same type reduces to that type.
- a schema whose oneOf or anyOf names more than one type among its branches reduces to no type.
- a schema stating no type directly and declaring no allOf, oneOf or anyOf reduces to no type.
- input_schema declares a top-level required array, present only where at least one name held in properties is declared required, listing every non-colliding name the operation declares required that holds a properties entry.
- a name the operation leaves optional is absent from required.
- a name whose own schema does not reduce to one type is absent from required, however the operation declares it.
- input_schema declares no required key at all where no name held in properties is declared required.
- a parameter or request-body field not claimed by any other part of the operation, whose own schema reduces to no type, declares no properties entry.
- that name stands in the draft's unresolved list with reason schema-not-reducible-to-a-type.
- an unresolved item names the name exactly as the OpenAPI document itself gives it.
- an operation declaring a required path parameter cpf of type string and an optional query parameter includeHistory of type boolean drafts an input_schema whose properties hold cpf typed string and includeHistory typed boolean and whose required array holds exactly cpf.
- the drafted input_schema holds a properties object and, where present, a required array every entry of which is a key of properties, the shape a registered capability's own input schema must hold.
- no second implementation of parameter reading, $ref resolution or request-body reading is added beside the one in src/src/connector-registry/openapi-operation-reader.ts.
implements:
- domain/integration/capability-schema-draft
- domain/integration/capability-schema-draft-unresolved-item
- domain/integration/capability-schema-draft-unresolved-reason
- rules/integration/a-capability-schema-drafts-input-schema-is-read-from-the-chosen-operations-parameters-and-fields
- rules/integration/a-drafted-capability-schema-requiring-no-name-declares-no-required-array
- scenarios/integration/a-capability-schema-drafts-input-schema-reads-required-path-parameters
---

## What it is

The derivation of the draft's input_schema and of the unresolved items whose reason is schema-not-reducible-to-a-type, for a name no other part of the operation also claims.
It reads parameters through the path item and the $refs, and request-body fields from the top level of the application/json schema.
It declares the capability-schema-draft value the output schema derivation and the collision task later write into.

## Notes

Both reducibility branches -- a direct type and an allOf or an agreeing oneOf/anyOf whose branches share one type -- are one reading, so they belong to one task rather than several.
required is read from the operation's own declared requirement and never invented where the operation leaves a name optional.
UNDERDETERMINED, from the specification -- Criteria 2 and 3 rest on how the operation's parameters are read through its path item and its $refs, and on what counts as a request-body field, but the only candidate that fixes either is a-capability-schema-drafts-input-schema-is-read-from-the-chosen-operations-parameters-and-fields, whose statement delegates both readings by name to a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs and a-connector-configuration-drafts-request-body-fields-are-its-json-schemas-top-level-properties, neither of which is a candidate; their content is therefore not reachable from this task's implements as written.
Decision, beyond the covers -- stand: these two rules already stand delivered in src/src/connector-registry/openapi-operation-reader.ts as the machinery the sibling connector configuration draft and the operations-read already exercise; this plan reuses that implementation rather than redelivering the rules that already govern it, per the epic's own uncovered entry.
REMAINDER, from the specification -- Every clause of a-capability-schema-drafts-parameter-or-field-name-claimed-twice-favors-declared-order, of a-name-whose-first-claimant-is-unreducible-drafts-no-input-schema-entry and of a-part-both-unreducible-and-name-claimed-stands-in-unresolved-under-each-reason reaches no criterion of this task, since the criteria were narrowed to names no other part of the operation also claims.
REMAINDER, from the specification -- a-capability-schema-drafts-output-schema-is-read-from-the-chosen-operations-success-responses, its scenario, and the output_schema half of a-drafted-capability-schema-requiring-no-name-declares-no-required-array's statement reach no criterion of this task, which drafts input_schema only.
ADVISORY, from the specification -- Criterion 18 names src/src/connector-registry/openapi-operation-reader.ts as the one existing implementation of parameter reading, $ref resolution and request-body reading; no candidate node names a module, correctly, since the specification holds facts and not paths, but the criterion is only checkable against the delivered tree.
