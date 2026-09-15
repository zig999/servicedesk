---
title: Draft the output_schema from the chosen operation's success responses
summary: Derive a capability schema draft's output_schema from every application/json success response schema of one read operation, the lowest success status declaring a name settling that name's type and required standing.
sources:
- intake/scope.md
objective: One read OpenAPI 3.x operation yields a capability schema draft whose output_schema declares a properties entry for each field read through the envelope reading from its application/json success response schemas, each entry and the required array taken from the lowest success status declaring that name, and an unresolved item with reason schema-not-reducible-to-a-type for a field whose lowest-status declaration does not reduce to one JSON Schema type.
depends_on:
- task/capability-schema-draft-generation/input-schema-from-parameters-and-request-body-fields
criteria:
- output_schema is JSON text that parses to an object declaring a top-level properties object.
- a response keyed by a numeric status from 200 through 299 declaring a schema under the media type application/json contributes its fields.
- a response keyed by a status outside 200 through 299 contributes no entry.
- a success response declaring no content under application/json contributes no entry.
- properties holds one entry for each field the single-object-property envelope reading reads from a contributing success response schema whose lowest-status declaration reduces to one JSON Schema type.
- an entry holds the type declared by the schema of the lowest success status that declares that name.
- another success response schema declaring the same name with a different type leaves that entry's type as the lowest status's own.
- a field whose lowest-status declaration does not reduce to one JSON Schema type declares no properties entry and stands in the draft's unresolved list with reason schema-not-reducible-to-a-type.
- output_schema declares a top-level required array, present only where at least one name held in properties is declared required, listing every name declared required by the lowest-status schema that declares that name and holds a properties entry.
- for a name read through a single-object-property envelope, required standing is read from the enveloping property's own inner object schema's own required array, never from the success response schema's own top-level required array.
- a name whose lowest-status declaration does not reduce to one type is absent from required, however that schema declares it.
- output_schema declares no required key at all where no name held in properties is declared required.
- another success response schema declaring that name's required standing differently leaves that listing as the lowest status's own.
- a name declared only by a higher success status still holds an entry in properties.
- an operation from which no such field is read drafts an output_schema whose properties object is present and holds no entry.
- an operation declaring a 200 and a 201 response, both under application/json and each declaring a top-level properties object naming id, the 200 typed string and the 201 typed integer, drafts an output_schema whose properties object holds exactly one entry named id, typed string.
- no second implementation of success-response or envelope reading is added beside the one in src/src/connector-registry/openapi-operation-reader.ts.
implements:
- domain/integration/capability-schema-draft
- domain/integration/capability-schema-draft-unresolved-item
- domain/integration/capability-schema-draft-unresolved-reason
- rules/integration/a-capability-schema-drafts-output-schema-is-read-from-the-chosen-operations-success-responses
- rules/integration/a-drafted-capability-schema-requiring-no-name-declares-no-required-array
- scenarios/integration/a-capability-schema-drafts-output-schema-reads-the-lowest-success-status
---

## What it is

The derivation of the draft's output_schema from the operation's application/json success response schemas.
It reads through a single enveloping object property rather than yielding one field named after the envelope, and it reads an enveloped field's required standing from the envelope's own inner schema.
It writes output_schema into the capability schema draft value the input derivation declares.

## Notes

The dependency is on the draft value the input derivation declares, not on any ordering between the two readings.
An empty properties object is drafted rather than omitted, so an operation answering no field reads as exactly that.
UNDERDETERMINED, from the specification -- The envelope reading's own precondition (a single top-level property's own schema explicitly declaring a properties keyword, empty or not, is what is descended into; an object declaring no properties keyword is read as one field at the top level) is stated by a-success-response-schemas-single-object-property-is-read-through-as-its-envelope, which is not a candidate of this task.
Decision, beyond the covers -- stand: that rule already stands delivered in src/src/connector-registry/openapi-operation-reader.ts as the reading the sibling connector configuration draft's own responseMap already exercises; this plan reuses that implementation rather than redelivering the rule, per the epic's own uncovered entry.
UNDERDETERMINED, from the specification -- No criterion fixes the property key an entry read through an envelope carries as anything other than "that field's own name"; an implementation keying such an entry by the envelope-qualified path instead is not caught by any criterion's own wording.
UNDERDETERMINED, from the specification -- The criteria settle which responses contribute only for keys that are numeric statuses inside and outside 200 through 299; a response keyed "default" or by a status range such as "2XX" is addressed by neither this task's criteria nor the governing rule's own statement.
REMAINDER, from the specification -- The input_schema half of a-drafted-capability-schema-requiring-no-name-declares-no-required-array's statement reaches no criterion of this task.
REMAINDER, from the specification -- a-capability-schema-drafts-input-schema-is-read-from-the-chosen-operations-parameters-and-fields is the node the decision log locates the two reduction cases (an agreeing oneOf/anyOf; a schema stating no type and no composition) in; this task's own governing rule restates both for a response field in its own Description, and reaches no criterion of this task directly.
REMAINDER, from the specification -- a-capability-schema-drafts-parameter-or-field-name-claimed-twice-favors-declared-order, a-name-whose-first-claimant-is-unreducible-drafts-no-input-schema-entry, a-part-both-unreducible-and-name-claimed-stands-in-unresolved-under-each-reason and their scenarios are stated over input_schema property names and reach no criterion of this task, whose output name collisions are settled by the lowest-success-status reading instead.
