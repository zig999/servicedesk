---
target: backend
title: Envelope descent for a success response schema's single object property -- proof
summary: Two tests added to openapi-operation-reader.spec.ts prove every criterion of the envelope-descent
  task and demonstrate the envelope rule's own invariant whole; the domain field's cross-file 'read by
  no observation' clause and three behavior inferences the implementation left open are recorded as untested
  rather than pinned.
implementation: sha256:97e2a9056da9d64aefba46794f7ed24e904889f4dbdcff79f8e951b15dadd286
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-draft-maps-success-response-envelope-read-through-suite
tests:
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: reads through the single-object-property envelope invariant exactly as the rule states it, across
    every branch it distinguishes (criteria 1-3)
  proves: 'Criteria 1-3: a success schema whose single top-level property is an object explicitly declaring
    a properties keyword (empty, at status 204, or not, at status 200) yields that inner object''s own
    properties -- never the outer property itself -- each at outer.field and carrying the outer name as
    envelope.'
  fails_when: the '200' branch yields a field named 'data' instead of 'id', omits the 'data.' path prefix,
    omits or misnames the envelope, or the '204' branch (empty inner properties) yields any field at all.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: reads through the single-object-property envelope invariant exactly as the rule states it, across
    every branch it distinguishes (criterion 4)
  proves: 'Criterion 4: a success schema with two or more top-level properties (''201'', properties a
    and b) yields those properties at their own names and no envelope value.'
  fails_when: the '201' branch yields 'a' or 'b' at a path other than their own name, or either carries
    a non-undefined envelope value.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: reads through the single-object-property envelope invariant exactly as the rule states it, across
    every branch it distinguishes (criterion 5)
  proves: 'Criterion 5: a success schema whose single top-level property''s own schema is not an object
    explicitly declaring a properties keyword (''202'', property ''value'' typed string) yields that property
    as one field at its own name, with no envelope value.'
  fails_when: the '202' branch treats 'value' as an envelope, or yields it at a path other than 'value',
    or assigns it a non-undefined envelope value.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: reads through the single-object-property envelope invariant exactly as the rule states it, across
    every branch it distinguishes (criterion 6)
  proves: 'Criterion 6: an object property declared inside the envelope (''203'', the enveloped ''child''
    property, itself declaring its own nested ''deep'' property) is not descended into further, so ''deep''
    yields no field.'
  fails_when: the '203' branch yields any field for 'deep' or a path such as 'wrapper.child.deep', rather
    than stopping at 'wrapper.child'.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: reads through the single-object-property envelope invariant exactly as the rule states it, across
    every branch it distinguishes (criterion 7)
  proves: 'Criterion 7: a single top-level property that is an object declaring an empty properties keyword
    (''204'') is read through as an envelope and yields no field, and a success schema whose top-level
    properties keyword is absent (''205'') yields no field.'
  fails_when: the '204' or '205' branch contributes any entry to the combined field list.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: reads through the single-object-property envelope invariant exactly as the rule states it, across
    every branch it distinguishes (whole-rule)
  proves: The invariant's whole statement -- the envelope clause, the otherwise clause, the one-level-only
    descent limit, and the absent-or-empty-yields-no-field clause -- decided together against one document
    exercising every branch the rule names, in a single assertion over the full ordered field list.
  fails_when: any one of the six branches ('200' through '205') produces a name, path or envelope other
    than what the rule requires for that shape.
  demonstrates: rules/integration/a-success-response-schemas-single-object-property-is-read-through-as-its-envelope
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: omits the envelope attribute entirely from a field not read through an envelope, rather than carrying
    it as undefined
  proves: 'Criteria 4 and 5 together: a field not read through an envelope carries no envelope attribute
    at all -- the key itself is absent, not merely undefined-valued.'
  fails_when: a field produced for a non-enveloped property gains an own 'envelope' key (even one holding
    undefined).
not_applicable:
- edge_case: A dependency that fails, is unavailable, or answers slowly
  why: The reading is a pure synchronous computation over an already-parsed document object already held
    in memory; it performs no I/O and calls no external dependency.
- edge_case: Two operations against one subject at once
  why: readOpenApiOperation reads a document text parameter and returns a value with no shared mutable
    state; there is no subject a concurrent second call could contend over.
- edge_case: A duplicate where uniqueness is claimed
  why: No criterion or node claims any element here must be unique; property names are already unique
    by construction, being keys of a JS object.
- edge_case: An operation attempted against state that forbids it
  why: There is no state machine or forbidding precondition here; the function is a stateless read of
    one document's schema shape.
untested:
- 'domain/integration/connector-configuration-draft-response-field: no test in this proof decides the
  node''s fact whole. Its stated fact includes that the type, required listing and envelope are ''read
  by no observation'' -- a claim spanning how the rest of the system uses these fields, which no finite
  unit test over this reader alone can decide; and the node''s declared_type/declared_required attributes
  are outside this task''s own criteria per its ADVISORY note.'
- 'Inference (implementation record): envelope eligibility is checked on the single top-level property''s
  own schema after $ref resolution only, never after allOf/oneOf/anyOf combinator merging is applied to
  it. No criterion or node text states whether a combinator-only envelope candidate qualifies as an envelope.'
- 'Inference (implementation record): once a property qualifies as an envelope, its own inner properties
  are read through the same schemaPropertySources/mergedSchemaProperties helpers used at the outer level.
  No criterion states this.'
- 'Inference (implementation record and this task''s own ADVISORY note): declaredType and declaredRequired
  for a field yielded through an envelope are read from the enveloped schema''s own declarations, not
  the outer response schema''s. This task''s ADVISORY note explicitly leaves this to the caller (drafted-response-map)
  to confirm.'
---

## What it is
Two tests (six assertions across the envelope's distinguishing branches, plus one dedicated to the absent-envelope-key shape) proving the single-object-property envelope descent whole against the invariant it implements.

## Notes
None.
