---
target: backend
title: Capability schema draft output_schema derivation from success responses
summary: Verifies that draftedOutputSchema builds output_schema's properties and required array from an operation's application/json success-response fields by the lowest declaring status, keys an enveloped field by its own name, excludes and discloses fields that do not reduce to one type, and drafts a present-but-empty properties object when no field is read.
implementation: sha256:0ac6774659aced81a31adf6831081395cc1d0e0700d6f5d89c013a703a3f72dc
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/capability-schema-draft-generation-output-schema-from-success-responses-suite-2
tests:
- file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
  name: parses output_schema as a JSON object declaring a top-level properties object
  proves: 'Criterion: output_schema is JSON text that parses to an object declaring a top-level properties object.'
  fails_when: draftedOutputSchema's outputSchema stops parsing to a plain, non-array object, or stops declaring a properties key typed as an object.
- file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
  name: includes a field from a 2xx response under application/json, excludes a field from a response keyed just outside 200-299, and excludes a success response declaring no content at all
  proves: 'Criteria: a response keyed 200-299 under application/json contributes its fields; a response keyed outside 200-299 contributes no entry; a success response declaring no content under application/json contributes no entry.'
  fails_when: the drafted properties object stops holding exactly ['id'] -- either id (from the 200) goes missing, ghost (from the 300, just outside the range) appears, or the 202's presence with no content is read as contributing an entry.
- file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
  name: drafts an output_schema whose properties object holds exactly one entry named id, typed string, from a 200 and 201 both declaring id differently
  proves: The worked-example criterion (a 200 and a 201, both under application/json, each naming id, the 200 typed string and the 201 typed integer), together with the criteria that an entry holds the lowest declaring status's own type and that another status declaring the same name differently leaves that type as the lowest status's own.
  fails_when: properties stops holding exactly one entry named id, or that entry's type stops being string.
  demonstrates: scenarios/integration/a-capability-schema-drafts-output-schema-reads-the-lowest-success-status
- file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
  name: holds an entry for a field the 201 response declares that the 200 response does not
  proves: 'Criterion: a name declared only by a higher success status still holds an entry in properties.'
  fails_when: createdAt (declared only by the 201) is missing from properties, or its type is not string.
- file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
  name: excludes a field from properties and from required, and stands it in the unresolved list under schema-not-reducible-to-a-type, when its lowest-status declaration does not reduce to one type, even though the response declares it required
  proves: 'Criteria: a field whose lowest-status declaration does not reduce to one JSON Schema type declares no properties entry and stands in unresolved with reason schema-not-reducible-to-a-type; a name whose lowest-status declaration does not reduce to one type is absent from required, however that schema declares it.'
  fails_when: 'status appears in properties or in required despite its empty schema, or unresolved stops holding exactly [{ name: ''status'', reason: ''schema-not-reducible-to-a-type'' }].'
  demonstrates: domain/integration/capability-schema-draft-unresolved-item
- file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
  name: reads an enveloped field's required standing from the envelope's own inner schema, keeping the lowest status's own declaration however differently the outer schema or a higher status declares it
  proves: 'Criteria: output_schema declares a top-level required array... listing every name declared required by the lowest-status schema that declares that name; for a name read through a single-object-property envelope, required standing is read from the enveloping property''s own inner object schema''s own required array, never from the success response schema''s own top-level required array; another success response schema declaring that name''s required standing differently leaves that listing as the lowest status''s own.'
  fails_when: required stops holding exactly ['id'] -- e.g. it picks up 'data' from the outer 200 required array, picks up 'name' from the 201's own inner required array instead of the 200's, or drops 'id'.
- file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
  name: declares no required key when properties holds entries but no response declares any of them required
  proves: 'Criterion: output_schema declares no required key at all where no name held in properties is declared required.'
  fails_when: a required key appears despite limit and offset both being left optional by the operation.
- file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
  name: declares an empty properties object and no required key for an operation from which no field is read
  proves: 'Criterion: an operation from which no such field is read drafts an output_schema whose properties object is present and holds no entry.'
  fails_when: properties stops being present as an empty object, or a required key appears despite no candidate field existing at all.
- file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
  name: keys an enveloped field's properties entry by the field's own name, never by its envelope-qualified path
  proves: 'Criterion: properties holds one entry for each field the single-object-property envelope reading reads, keyed correctly; and the task''s own UNDERDETERMINED entry noting no criterion''s wording alone would catch an envelope-qualified-path-keyed implementation.'
  fails_when: the drafted properties object keys the field by anything other than id -- e.g. by an envelope-qualified path such as 'data.id' or 'data' itself -- or id's type stops being string.
not_applicable:
- edge_case: A dependency that fails, is unavailable, or answers slowly
  why: draftedOutputSchema performs no I/O; it operates purely on an already-produced OpenApiOperationReading.
- edge_case: Two operations against one subject at once (concurrency)
  why: draftedOutputSchema is a pure, stateless function over its input reading; no criterion or bound node of this task addresses concurrent invocation.
- edge_case: A malformed or unparsable OpenAPI document, or a request for an operation the document does not declare
  why: readOpenApiOperation's own parsing and operation-lookup concern, already exercised in openapi-operation-reader.spec.ts; no criterion of this task restates it.
untested:
- Criterion 'no second implementation of success-response or envelope reading is added beside the one in src/src/connector-registry/openapi-operation-reader.ts' claims a fact about the shape of the codebase -- that no second implementation exists anywhere -- which no input/output test can distinguish from correct reuse producing identical output; it is a structural claim decided by reading, not by a test this proof can write.
- domain/integration/capability-schema-draft's fact describes one value object holding both input_schema and output_schema as a candidate pair generated from one operation; this task populates only output_schema and its own unresolved entries, input_schema being the sibling input-schema task's own claim, so no test here decides the node's fact whole.
- rules/integration/a-capability-schema-drafts-output-schema-is-read-from-the-chosen-operations-success-responses states one compound fact spanning status filtering, envelope reading, per-name lowest-status selection of both type and required standing, unresolved disclosure, and the empty-properties case. This proof's tests cover each branch separately, as the criteria's own partition requires, but no single test fails over this whole compound statement at once, so no test carries this node's demonstrates.
- rules/integration/a-drafted-capability-schema-requiring-no-name-declares-no-required-array states the required-array-omission behavior for both input_schema and output_schema; this task implements and this proof tests only the output_schema half, the input_schema half being the sibling input-schema task's own claim, so no test here decides the node's fact whole.
- domain/integration/capability-schema-draft-unresolved-reason's closed two-value enumeration is already demonstrated by a pre-existing test ('declares the closed set of unresolved reasons as exactly schema-not-reducible-to-a-type and name-claimed-by-another-parameter') in src/__tests__/unit/connector-registry/capability-schema-draft.spec.ts, written under the sibling input-schema task's own delivery and untouched by this one; a second assertion of that same closure here would be redundant, so this proof adds none.
- UNDERDETERMINED, from the specification -- the envelope reading's own precondition is stated by a-success-response-schemas-single-object-property-is-read-through-as-its-envelope, which is not a candidate of this task. It names no implementation the specification refuses -- it locates the precondition's governing fact in a node this task does not implement -- so no test is owed for it.
- UNDERDETERMINED, from the specification -- a response keyed "default" or by a status range such as "2XX" is addressed by neither this task's criteria nor the governing rule's own statement. It names no implementation, only an uncovered clause outside this task's criteria, so no test is owed for it.
- 'Inferred: reducedType is added as a new, separate field on OpenApiSuccessResponseField rather than folding the reduction into the existing declaredType field -- an arrangement decision about where the reduced type lives internally, not itself an observable behavior of draftedOutputSchema''s own output; left unpinned by any test.'
- 'Inferred: reuse of the existing lowestStatusSuccessFieldsOf helper for the output-schema''s own lowest-status-per-name selection, rather than a second reduction over reading.successResponseFields -- an implementation-reuse decision that satisfies criterion 17''s own reuse requirement (itself untested above as a structural claim) rather than a separate observable behavior; left unpinned by any test.'
---

## What it is

The tests proving task/capability-schema-draft-generation/output-schema-from-success-responses: draftedOutputSchema's properties, required and unresolved-list behavior over 2xx/non-2xx and content-bearing/content-absent success responses, lowest-success-status selection across differently-typed and differently-required declarations, envelope-keyed field naming, and the always-present-but-possibly-empty properties object.

## Notes

The test file src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts was refactored after an initial lint failure (max-lines-per-function, 48 lines on the enveloped-required-standing test) by extracting the repeated inner-schema object literal into a helper, enveloppedDataSchema(required); no assertion was added, removed, or changed by that refactor.
