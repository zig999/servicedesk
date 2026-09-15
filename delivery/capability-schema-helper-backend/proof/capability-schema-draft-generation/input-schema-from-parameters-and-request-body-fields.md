---
target: backend
title: Capability schema draft input_schema derivation from parameters and request-body fields
summary: Verifies that draftedInputSchema builds input_schema's properties and required array from an operation's non-colliding, type-reducing parameters and request-body fields, excludes and discloses unreducible and colliding names, and that the reader's own unresolved-reason enumeration stays closed to its two values.
implementation: sha256:09db858727a5359f16e63e41704644fc6254963ff31c7bf518364b2173bf7f7a
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/capability-schema-draft-generation-input-schema-from-parameters-and-request-body-fields-suite
tests:
- file: src/__tests__/unit/connector-registry/capability-schema-draft.spec.ts
  name: declares the closed set of unresolved reasons as exactly schema-not-reducible-to-a-type and name-claimed-by-another-parameter
  proves: The domain/integration/capability-schema-draft-unresolved-reason fact that the reason enumeration is closed to exactly these two values.
  fails_when: CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_REASONS stops holding exactly ['schema-not-reducible-to-a-type', 'name-claimed-by-another-parameter'] in that order.
  demonstrates: domain/integration/capability-schema-draft-unresolved-reason
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: parses input_schema as a JSON object declaring a top-level properties object
  proves: 'Criterion: input_schema is JSON text that parses to an object declaring a top-level properties object.'
  fails_when: draftedInputSchema's inputSchema stops parsing to a plain, non-array object, or stops declaring a properties key typed as an object.
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: drafts a properties object holding cpf typed string and includeHistory typed boolean, and a required array holding exactly cpf, for a required path parameter alongside an optional query parameter
  proves: The worked-example criterion (an operation declaring a required path parameter cpf of type string and an optional query parameter includeHistory of type boolean), together with criteria 2, 4, 5, 10 and 11 as this case exercises them.
  fails_when: cpf or includeHistory is missing from properties, either's declared type is wrong, or required stops holding exactly ['cpf'].
  demonstrates: scenarios/integration/a-capability-schema-drafts-input-schema-reads-required-path-parameters
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: declares an empty properties object and no required key for an operation declaring neither a parameter nor a request-body field
  proves: 'Criterion: input_schema declares no required key at all where no name held in properties is declared required, at the boundary where properties itself is empty.'
  fails_when: properties stops being present as an empty object, or a required key appears despite no candidate existing at all.
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: declares no required key when properties holds entries but the operation declares none of them required
  proves: 'Criterion: input_schema declares no required key at all where no name held in properties is declared required, for a non-empty properties object.'
  fails_when: a required key appears even though limit and offset are both left optional by the operation.
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: excludes a name from properties and from required, even where declared required, when another part of the operation also claims the same name
  proves: Criteria 2 and 3's own restriction ('whose name no other parameter or request-body field of the operation also claims') and criterion 10's 'listing every non-colliding name.'
  fails_when: the colliding name id appears in properties or in required, or the non-colliding cpf stops appearing correctly in both.
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: excludes a name from properties, leaves it out of required even though the operation declares it required, and stands it in the unresolved list under schema-not-reducible-to-a-type, named exactly as the document gives it, for a schema stating no type and declaring no composition
  proves: Criteria 9, 12, 14, 15 and 16.
  fails_when: Loyalty-Tier appears in properties or in required, is missing from unresolved, carries the wrong reason, has its name altered, the unresolved item carries any key beyond name and reason, or cpf (the contrasting resolvable required name) stops appearing in required.
  demonstrates: domain/integration/capability-schema-draft-unresolved-item
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: reduces a schema whose allOf branches all state the same type to that type
  proves: 'Criterion: a schema every branch of whose allOf states one and the same type reduces to that type.'
  fails_when: quantity is missing from properties or its declared type is not integer.
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: reduces a schema whose oneOf branches all name the same type to that type
  proves: 'Criterion: a schema every branch of whose oneOf or anyOf names one and the same type reduces to that type.'
  fails_when: code is missing from properties or its declared type is not string.
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: declares no properties entry for a name whose oneOf branches name more than one type
  proves: 'Criterion: a schema whose oneOf or anyOf names more than one type among its branches reduces to no type.'
  fails_when: identifier appears in properties despite its oneOf branches naming two different types.
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: includes a parameter declared only on the shared path item, and one reached only through a $ref, each correctly typed, in the drafted properties
  proves: 'Criterion 2''s own wording: parameters read ''through its path item and its $refs.'''
  fails_when: order_id (path-item-only) or X-Api-Version (reached only through a $ref) is missing from properties, or either's declared type is wrong.
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: includes a top-level request-body field, required per the request-body schema's own required array, in properties and in required
  proves: Criterion 3, and criterion 10 for the request-body-sourced flavor of required derivation.
  fails_when: billing_address is missing from properties, its type is wrong, or it is missing from required despite the schema's own required array naming it.
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: produces an input_schema whose required array, wherever present, holds only keys properties itself declares -- the shape a registered capability's own input schema must hold
  proves: Criterion 18.
  fails_when: inputSchemaShapeProblems reports any problem against the drafted input_schema.
not_applicable:
- edge_case: An allOf whose branches disagree, or whose branches include one declaring no direct type
  why: No criterion and no bound node states an outcome for allOf disagreement; the disagreement clause (criterion 8) is stated only for oneOf/anyOf, so this task owes it no test.
- edge_case: A dependency that fails, is unavailable, or answers slowly
  why: draftedInputSchema performs no I/O; it operates purely on an already-produced OpenApiOperationReading. Document fetch and parse failures are readOpenApiOperation's own concern, already exercised in openapi-operation-reader.spec.ts, and no criterion of this task restates them.
- edge_case: Two operations against one subject at once (concurrency)
  why: draftedInputSchema is a pure, stateless function over its input reading; no criterion or bound node of this task addresses concurrent invocation.
- edge_case: A boundary at each end of a stated numeric range
  why: No criterion or bound node of this task states a numeric range (unlike the sibling connector-configuration-draft-generation's status ranges); nothing in this task's obligations has this shape.
untested:
- Criterion 19 ('no second implementation of parameter reading, $ref resolution or request-body reading is added beside the one in src/src/connector-registry/openapi-operation-reader.ts') claims a fact about the shape of the codebase -- that no second implementation exists anywhere -- which no input/output test can distinguish from correct reuse producing identical output; it is a structural claim decided by reading, not by a test this proof can write.
- domain/integration/capability-schema-draft's fact describes one value object holding both input_schema and output_schema as a candidate pair generated from one operation; this task populates only input_schema and its own unresolved entries, output_schema being the sibling output-schema task's own claim, so no test here decides the node's fact whole.
- rules/integration/a-capability-schema-drafts-input-schema-is-read-from-the-chosen-operations-parameters-and-fields states one compound fact spanning every reduction branch (direct type, agreeing allOf, agreeing oneOf/anyOf, disagreeing oneOf/anyOf, no type/no composition) together with parameter reading through the path item and its $refs and request-body field reading -- the latter two delegated by the rule's own wording to two nodes neither a candidate of this task, per the task's own UNDERDETERMINED note. This proof's tests cover each reduction branch and each reading separately, as the criteria's own partition requires, but no single test fails over this whole compound statement at once, so no test carries this node's demonstrates.
- rules/integration/a-drafted-capability-schema-requiring-no-name-declares-no-required-array states the required-array-omission behavior for both input_schema and output_schema; this task implements and this proof tests only the input_schema half (criteria 10 and 13), the output_schema half being the sibling output-schema task's own claim, so no test here decides the node's fact whole.
- UNDERDETERMINED, from the specification -- the task's own note observes that criteria 2 and 3's path-item/$ref-reading and request-body-field-reading content is not reachable from this task's implements, because the rule it names delegates that content to two nodes neither a candidate of this task. It names no implementation the specification refuses, so no test is owed for it.
- 'Inferred: a parameter or request-body field whose schema is absent entirely is treated the same as an empty schema and does not reduce to a type -- a behavior choice no node or criterion states; left unpinned by any test.'
- 'Inferred: a branch of an allOf, oneOf or anyOf that is itself a further composition without a direct type is treated as not agreeing, so the enclosing schema does not reduce -- a behavior choice no node or criterion states; left unpinned by any test.'
- 'Inferred: where a schema states a type directly and also declares an allOf, oneOf or anyOf alongside it, the direct type is read as the reduced type without inspecting the composition -- a behavior choice no node or criterion states; left unpinned by any test.'
- 'Inferred: a resolved properties entry carries exactly { "type": "<T>" } and no other JSON Schema keyword -- a behavior choice no node or criterion states. This proof''s property assertions check each entry''s own type and the full set of property keys, deliberately without asserting that no further keyword is present in an entry, so as not to pin this inference.'
---

## What it is

The tests proving task/capability-schema-draft-generation/input-schema-from-parameters-and-request-body-fields: draftedInputSchema's properties, required and unresolved-list behavior over non-colliding, colliding, reducible and unreducible parameters and request-body fields, and the closed unresolved-reason enumeration.

## Notes

None.
