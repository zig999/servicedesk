---
target: backend
title: Capability schema draft input_schema derivation
summary: Holds the fixed spec suite, with the collision-asserting test removed, up against this task's own seventeen behavioral criteria and the three nodes it can decide finitely, over the tree as the sibling collision task now leaves it.
implementation: sha256:09db858727a5359f16e63e41704644fc6254963ff31c7bf518364b2173bf7f7a
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/capability-schema-draft-generation-input-schema-from-parameters-and-request-body-fields-suite-2
tests:
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: parses input_schema as a JSON object declaring a top-level properties object
  proves: input_schema is JSON text that parses to an object declaring a top-level properties object.
  fails_when: draftedInputSchema's inputSchema stops being valid JSON, parses to something other than a plain object, or the parsed object lacks a properties key of type object.
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: drafts a properties object holding cpf typed string and includeHistory typed boolean, and a required array holding exactly cpf, for a required path parameter alongside an optional query parameter
  proves: an operation declaring a required path parameter cpf of type string and an optional query parameter includeHistory of type boolean drafts an input_schema whose properties hold cpf typed string and includeHistory typed boolean and whose required array holds exactly cpf — the task's own worked example, which is at the same time the concrete instance of 'a schema stating a type directly reduces to that type', of 'each properties entry declares the type that name's own schema declares', and of 'a name the operation leaves optional is absent from required' for these two non-colliding names.
  fails_when: 'properties stops holding exactly {cpf: string, includeHistory: boolean}, or required stops holding exactly [''cpf''].'
  demonstrates: scenarios/integration/a-capability-schema-drafts-input-schema-reads-required-path-parameters
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: declares an empty properties object and no required key for an operation declaring neither a parameter nor a request-body field
  proves: input_schema declares no required key at all where no name held in properties is declared required — the boundary where properties itself holds no name at all.
  fails_when: properties stops being an empty object, or a required key appears despite no candidate existing.
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: declares no required key when properties holds entries but the operation declares none of them required
  proves: input_schema declares no required key at all where no name held in properties is declared required — the boundary where properties holds names but every one of the operation's own required flags is false.
  fails_when: a required key appears despite neither limit nor offset being declared required, or either name goes missing from properties.
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: excludes a name from properties, leaves it out of required even though the operation declares it required, and stands it in the unresolved list under schema-not-reducible-to-a-type, named exactly as the document gives it, for a schema stating no type and declaring no composition
  proves: a schema stating no type directly and declaring no allOf, oneOf or anyOf reduces to no type; a parameter or request-body field not claimed by any other part of the operation, whose own schema reduces to no type, declares no properties entry; that name stands in the draft's unresolved list with reason schema-not-reducible-to-a-type; an unresolved item names the name exactly as the OpenAPI document itself gives it; and a name whose own schema does not reduce to one type is absent from required, however the operation declares it — one non-colliding candidate (Loyalty-Tier, schema {}) exercising all five at once.
  fails_when: 'Loyalty-Tier appears in properties, required stops being exactly [''cpf''], draft.unresolved stops being exactly [{name: ''Loyalty-Tier'', reason: ''schema-not-reducible-to-a-type''}], or the unresolved item''s own keys stop being exactly name and reason.'
  demonstrates: domain/integration/capability-schema-draft-unresolved-item
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: reduces a schema whose allOf branches all state the same type to that type
  proves: a schema every branch of whose allOf states one and the same type reduces to that type.
  fails_when: quantity's properties entry stops declaring type integer, or the name goes missing from properties.
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: reduces a schema whose oneOf branches all name the same type to that type
  proves: a schema every branch of whose oneOf or anyOf names one and the same type reduces to that type (oneOf and anyOf share the same reduction; oneOf is the one representative, since which of the two combinators is used does not change what the obligation requires).
  fails_when: code's properties entry stops declaring type string, or the name goes missing from properties.
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: declares no properties entry for a name whose oneOf branches name more than one type
  proves: a schema whose oneOf or anyOf names more than one type among its branches reduces to no type.
  fails_when: identifier appears in properties despite its oneOf naming both string and integer.
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: includes a parameter declared only on the shared path item, and one reached only through a $ref, each correctly typed, in the drafted properties
  proves: properties holds one entry keyed by the name of each parameter the operation declares, read through its path item and its $refs, whose name no other parameter or request-body field of the operation also claims, and whose own schema reduces to one JSON Schema type.
  fails_when: order_id (declared on the shared path item) or X-Api-Version (reached only through a $ref) goes missing from properties, or either stops declaring type string.
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: includes a top-level request-body field, required per the request-body schema's own required array, in properties and in required
  proves: properties holds one entry keyed by the name of each top-level property of the operation's application/json request-body schema whose name no other parameter or request-body field of the operation also claims, and whose own schema reduces to one JSON Schema type, together with input_schema declares a top-level required array... listing every non-colliding name the operation declares required that holds a properties entry, for a request-body field.
  fails_when: billing_address goes missing from properties or from required, or its type stops being string.
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: produces an input_schema whose required array, wherever present, holds only keys properties itself declares -- the shape a registered capability's own input schema must hold
  proves: the drafted input_schema holds a properties object and, where present, a required array every entry of which is a key of properties, the shape a registered capability's own input schema must hold.
  fails_when: inputSchemaShapeProblems, run against the drafted cpf/includeHistory input_schema, stops returning an empty array — i.e. the drafted shape stops being one the registration path itself would accept.
not_applicable:
- edge_case: A name two or more parts of the operation claim (a duplicate claimant)
  why: This task's own criteria 2 and 3 are written narrowed to "whose name no other parameter or request-body field of the operation also claims"; the collision behavior — favoring declared order, disclosing the displaced claimant under name-claimed-by-another-parameter — is task/capability-schema-draft-generation/colliding-names-favor-declared-order's own claim, already proven by that task's own tests. A test of this task asserting anything about a colliding name would assert totality over ground this task's own criteria explicitly exclude, and was removed for exactly that reason (see untested).
- edge_case: A dependency that fails, answers slowly, or two calls against one subject at once
  why: draftedInputSchema is a pure, synchronous, in-process function over an already-read OpenApiOperationReading; it performs no I/O, holds no shared mutable state, and calls no dependency that could fail, answer slowly, or race.
- edge_case: An operation attempted against state that forbids it
  why: There is no stateful resource here to forbid an operation against; draftedInputSchema derives a value from an input value each time it is called.
- edge_case: A boundary at each end of a numeric range
  why: None of this task's criteria state a numeric range; the only boundaries its criteria state are the required/no-required boundary and the reduces/does-not-reduce boundary, both of which are covered above.
untested:
- 'The removed test (''excludes a name from properties and from required, even where declared required, when another part of the operation also claims the same name'') asserted, over a document whose query parameter and request-body field both named ''id'', that ''id'' was excluded from properties and from required entirely. That assertion is no longer true of the tree: the sibling collision task''s own legitimate extension now resolves such a collision by declared order rather than excluding it, so the query parameter ''id'' now wins a properties entry and the assertion is an assertion of totality over ground this task''s own criteria never claimed. The collision behavior itself is proven by the sibling task''s own tests; this proof does not reintroduce an assertion over it.'
- 'domain/integration/capability-schema-draft''s fact (input_schema, output_schema and unresolved together) is not decided whole by any test this task owns: this task populates only input_schema and its own schema-not-reducible-to-a-type unresolved items, leaving output_schema entirely to the sibling output-schema task. A test asserting the full value object would have to reach across both tasks'' own work, which is exactly the identity-spanning-files case a finite test here cannot decide as a whole.'
- domain/integration/capability-schema-draft-unresolved-reason's fact is the closed two-value set {schema-not-reducible-to-a-type, name-claimed-by-another-parameter}. This task's own code assigns only the first; the second is the sibling collision task's own claim. No test written for this task can decide the enumeration whole without asserting behavior outside this task's own scope, so deciding it whole is left to whichever proof owns both halves.
- rules/integration/a-capability-schema-drafts-input-schema-is-read-from-the-chosen-operations-parameters-and-fields states a compound invariant over an open set of schema shapes (arbitrary allOf/oneOf/anyOf branch schemas, arbitrary types) — a totality over a set nothing enumerates. Its individual clauses each have a representative test above (direct type, agreeing allOf, agreeing oneOf/anyOf, disagreeing oneOf/anyOf, no type and no composition, path-item/$ref reading, request-body field reading, required/unresolved derivation), but no single finite test decides the rule whole without approximating part of it as the whole, so it is not claimed as demonstrated by any one test.
- rules/integration/a-drafted-capability-schema-requiring-no-name-declares-no-required-array's fact spans both input_schema and output_schema, and even restricted to its input_schema half is a two-branch invariant (required present only when >=1 name is required; absent otherwise) whose two branches are each covered by a different test above (the worked example for presence; the empty-operation and none-required tests for absence) rather than by one test that decides both branches at once, so it is not claimed as demonstrated whole.
- 'criterion ''no second implementation of parameter reading, $ref resolution or request-body reading is added beside the one in src/src/connector-registry/openapi-operation-reader.ts'' names a structural fact about where code lives, not an observable input/output behavior; no test can assert it without pinning the shape of the implementation. Read directly: capability-schema-draft-input-schema.ts only consumes reading.parameterDetails and reading.requestBodyFields and calls no $ref-resolution, parameter-reading or request-body-reading function of its own.'
- The implementation record's inference that a parameter or request-body field whose schema is absent entirely is treated the same as an empty schema (does not reduce to a type) is a behavior no criterion or node states; no test pins it.
- The implementation record's inference that a branch of an allOf/oneOf/anyOf that is itself a further composition (no direct type of its own) is treated as not agreeing is a behavior no criterion or node states; no test pins it.
- The implementation record's inference that a schema stating a type directly and also declaring a composition alongside it reduces by the direct type without inspecting the composition is a behavior no criterion or node states; no test pins it.
- 'The implementation record''s inference that a resolved properties entry carries exactly {"type": "<T>"} and no other JSON Schema keyword (format, description, and so on) is a behavior no criterion or node states beyond the type itself; no test pins whether such a keyword would be carried or dropped.'
- The task's own UNDERDETERMINED note observes that criteria 2 and 3 rest on path-item/$ref parameter reading and on what counts as a request-body field, but that the only candidate node reaching this task delegates both readings by name to two rules that are not themselves candidates, so their content is not reachable from this task's implements as written. The note names no implementation the specification refuses; it observes an unreachable delegation, not a violation, so no test is owed to it.
---

## What it is

The tests proving task/capability-schema-draft-generation/input-schema-from-parameters-and-request-body-fields: draftedInputSchema's properties, required and unresolved-list behavior over non-colliding, reducible and unreducible parameters and request-body fields, and the closed unresolved-reason enumeration's own first value.

## Notes

Re-delivered proof-only: the implementation stands unchanged (pin above). A sibling delivery in this same initiative (task/capability-schema-draft-generation/colliding-names-favor-declared-order) legitimately extended draftedInputSchema to resolve a colliding name by declared order rather than excluding it entirely. The prior proof's own test asserting that a colliding name is excluded no longer holds — it asserted totality over ground this task's own criteria never claimed, since criteria 2 and 3 explicitly narrow to names no other part of the operation also claims. This re-delivery removes that one assertion; every other test stands unchanged, and the full suite (including npm test) is green.
