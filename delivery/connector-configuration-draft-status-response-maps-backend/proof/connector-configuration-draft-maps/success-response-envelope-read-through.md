---
target: backend
title: Envelope descent for a success response schema's single object property
summary: One table-driven test exercises every branch the envelope invariant distinguishes and a second confirms a non-enveloped field omits the envelope key outright, together with a narrowing edit to a pre-existing, now over-strict $ref-reading assertion in the same file that this task's criteria never claimed as totality.
implementation: sha256:97e2a9056da9d64aefba46794f7ed24e904889f4dbdcff79f8e951b15dadd286
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-draft-maps-success-response-envelope-read-through-suite-2
tests:
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: reads through the single-object-property envelope invariant exactly as the rule states it, across every branch it distinguishes
  proves: Criteria 1 through 7 of this task, together — a single top-level property whose own schema declares a properties keyword is read one level down and not as itself (status 200); each field yielded through an envelope holds the path outer.field and carries the outer name as its envelope (200, 203); a schema with two or more top-level properties keeps them at their own names with no envelope (201); a single top-level property whose own schema does not itself declare a properties keyword yields itself as one field at its own name with no envelope (202); an object property declared inside the envelope is read as one field and is not itself descended into even though it declares its own properties keyword, so no field named after its own subproperty is yielded (203); and a single property declaring an empty properties keyword (204), as well as a schema whose own properties keyword is absent (205), both yield no field. Also rules/integration/a-success-response-schemas-single-object-property-is-read-through-as-its-envelope's
    invariant, entire, since these six response statuses enumerate every branch its statement distinguishes.
  fails_when: any one of the six branches — envelope descent (200), two-or-more-property passthrough (201), a non-qualifying single property read at its own name (202), non-descent past the envelope's own one level into a nested property's own properties (203), an empty-properties envelope yielding no field (204), or a top level whose own properties keyword is absent yielding no field (205) — stops producing exactly the ordered {name, path, envelope} triples the test asserts.
  demonstrates: rules/integration/a-success-response-schemas-single-object-property-is-read-through-as-its-envelope
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: omits the envelope attribute entirely from a field not read through an envelope, rather than carrying it as undefined
  proves: '"A success schema with two or more top-level properties yields those top-level properties at their own names and carries no envelope" (criterion 4), read as the field''s envelope key being genuinely absent rather than present with the value undefined — a distinction the table test''s array equality cannot itself decide, since toEqual treats a missing key and a key set to undefined alike.'
  fails_when: a field yielded from a schema with two or more top-level properties carries an envelope key at all, even set to undefined, instead of the key being absent from the returned object.
not_applicable:
- edge_case: A dependency that fails or answers slowly
  why: schemaReadingAt and its helpers are a synchronous, in-memory transformation of an already-parsed document; this task's criteria name no external call or dependency the envelope descent could observe failing or answering slowly.
- edge_case: Two operations against one subject at once
  why: the reading is a pure function of its own arguments with no shared or mutable state across calls; there is no subject here that two concurrent operations could race over.
- edge_case: A duplicate where uniqueness is claimed
  why: the fields this rule reads come from a schema's own properties object, whose keys are already unique by the JavaScript object model the reader walks; no criterion of this task claims a uniqueness this task itself would need to enforce or refuse.
- edge_case: An operation attempted against state that forbids it
  why: there is no lifecycle or stored state this reading writes to, or could be refused against; it only reads an already-parsed document and returns a value.
untested:
- 'domain/integration/connector-configuration-draft-response-field: this task contributes only the value object''s envelope attribute and the path derivation it feeds; the node''s fact is the whole six-attribute value object (name, path, status, declared_type, declared_required, envelope), and name, status, declared_type and declared_required are established and already proven by the predecessor task success-response-schema-fields, outside this delivery''s own criteria. No test here asserts the object''s whole shape, so the node''s fact, entire, is not decided by a test this task owns — deciding it whole would assert ground (the other four attributes'' behavior) this task''s own criteria never claim, an identity spanning two tasks'' deliveries rather than one this proof could close.'
- 'Inference (implementation record): whether the single top-level property ''is an object explicitly declaring a properties keyword'' is checked on that property''s own schema after resolving its $ref only, never after merging an allOf/oneOf/anyOf combinator into it — so a candidate property that is itself such a combinator, one of whose parts declares a properties keyword, is never read as an envelope. No criterion or node text of this task states this either way; recorded as unproven and left unpinned by any test here.'
- 'Inference (implementation record): once a property qualifies as an envelope, its own inner properties are merged through the same schemaPropertySources/mergedSchemaProperties helpers used at the outer level, so an enveloped schema may itself carry an allOf/oneOf/anyOf combinator at its own inner level. No criterion or node text confirms this; recorded as unproven and left unpinned by any test here.'
- 'Inference (implementation record, flagged by the task''s own ADVISORY note): declaredType and declaredRequired for a field yielded through an envelope are read from the enveloped schema''s own type/required declarations rather than the outer response schema''s. No criterion of this task states what a yielded field carries for those two attributes — the task''s own ADVISORY note leaves this seam to the caller (drafted-response-map) to confirm — so it remains unproven and unpinned by any test here.'
---

## What it is

Two tests (a table over every branch the envelope invariant distinguishes, plus one dedicated to the absent-envelope-key shape) proving the single-object-property envelope descent whole against the invariant it implements.

## Notes

Re-delivered proof-only: the implementation stands unchanged (pin above). A sibling delivery (task/capability-schema-draft-generation/output-schema-from-success-responses, initiative capability-schema-helper-backend) legitimately added a reducedType field to OpenApiSuccessResponseField, extending the same type-reduction reading a-capability-schema-drafts-input-schema-is-read-from-the-chosen-operations-parameters-and-fields already requires for a parameter or request-body field's own schema. The prior proof's suite run (run/connector-configuration-draft-maps-success-response-envelope-read-through-suite) failed at that point because its own test asserted successResponseFields' exact shape via toEqual, without the new field — totality over ground this task's own seven criteria never claimed. This re-delivery narrows that one assertion to the fields this task's criteria actually name, and every other test stands as before.
