---
target: backend
title: Capability schema draft input_schema derivation
summary: Derives a capability schema draft's input_schema and its schema-not-reducible-to-a-type unresolved items from an OpenAPI operation's parameters and request-body fields, by extending the existing openapi-operation-reader.ts reader with type-reduction rather than duplicating its parameter, $ref or request-body reading.
task: sha256:b2ec5928e7d1814e92e4a436e4e6a594a2c605dde9e5a3d28ca5b234668f94e9
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/capability-schema-draft-generation-input-schema-from-parameters-and-request-body-fields-build
files:
- path: src/connector-registry/openapi-operation-reader.ts
  effect: Extended with OpenApiOperationParameterDetail and OpenApiRequestBodyField, each carrying a candidate's own name, required flag and reducedType (the candidate's own schema reduced to one JSON Schema type, or absent if it does not reduce), computed by the new reducedTypeOf/agreeingBranchType functions which resolve $refs through the existing resolveRef and read a direct type, an agreeing allOf, or an agreeing oneOf/anyOf. OpenApiOperationReading now also exposes parameterDetails and requestBodyFields alongside the existing parameters and requestBodyFieldNames, which are unchanged and now derived from the same underlying parameter-detail and request-body-schema readings rather than a second implementation of either.
- path: src/connector-registry/capability-schema-draft.ts
  effect: Declares the CapabilitySchemaDraft value object (input_schema, output_schema, unresolved) and CapabilitySchemaDraftUnresolvedItem/CapabilitySchemaDraftUnresolvedReason (schema-not-reducible-to-a-type, name-claimed-by-another-parameter), the shared types this task and its sibling tasks populate.
- path: src/connector-registry/capability-schema-draft-input-schema.ts
  effect: 'Derives draftedInputSchema(reading): the input_schema JSON text (a properties object and, only where non-empty, a required array) and the unresolved items for every parameter or request-body field name no other part of the operation also claims, built from OpenApiOperationReading''s parameterDetails and requestBodyFields.'
criteria:
- criterion: input_schema is JSON text that parses to an object declaring a top-level properties object.
  met: true
  how: draftedInputSchema returns inputSchema as JSON.stringify(inputSchemaObject(...)), and inputSchemaObject always includes a properties key, empty or not.
- criterion: properties holds one entry keyed by the name of each parameter the operation declares, read through its path item and its $refs, whose name no other parameter or request-body field of the operation also claims, and whose own schema reduces to one JSON Schema type.
  met: true
  how: allCandidates reads reading.parameterDetails, which openapi-operation-reader.ts's parameterDetailsOf/resolvedParameterDetailsList already merge through the path item and resolve through $refs (reusing resolveRef); nonCollidingCandidates keeps only names with a count of exactly one across parameters and request-body fields, and propertiesOf adds an entry only for those whose reducedType is defined.
- criterion: properties holds one entry keyed by the name of each top-level property of the operation's application/json request-body schema whose name no other parameter or request-body field of the operation also claims, and whose own schema reduces to one JSON Schema type.
  met: true
  how: allCandidates spreads reading.requestBodyFields, built by requestBodyFieldsOf from the top-level keys of the resolved application/json schema's own properties object; the same non-collision and reducibility filters apply as for parameters.
- criterion: each properties entry declares the type that name's own schema declares.
  met: true
  how: 'propertiesOf writes { type: candidate.reducedType } for every resolved candidate, and reducedType is exactly the type reducedTypeOf read from that name''s own schema.'
- criterion: a schema stating a type directly reduces to that type.
  met: true
  how: reducedTypeOf returns declaredTypeOf(schema) (schema.type read as a string) before looking at any composition, whenever the schema states a type directly.
- criterion: a schema every branch of whose allOf states one and the same type reduces to that type.
  met: true
  how: combinatorKindOf detects allOf when no direct type is stated, and agreeingBranchType reads each branch's own direct type (through resolveRef) and returns it only when every branch's type is the same.
- criterion: a schema every branch of whose oneOf or anyOf names one and the same type reduces to that type.
  met: true
  how: 'The same combinatorKindOf/agreeingBranchType path handles oneOf and anyOf identically to allOf: it returns the shared type only when every branch names the same one.'
- criterion: a schema whose oneOf or anyOf names more than one type among its branches reduces to no type.
  met: true
  how: agreeingBranchType returns undefined as soon as any branch's type differs from the first branch's, for oneOf and anyOf the same as for allOf.
- criterion: a schema stating no type directly and declaring no allOf, oneOf or anyOf reduces to no type.
  met: true
  how: reducedTypeOf returns undefined when declaredTypeOf(schema) is undefined and combinatorKindOf(schema) is also undefined, covering an empty schema, a free-form one, and one carrying only other constraints.
- criterion: input_schema declares a top-level required array, present only where at least one name held in properties is declared required, listing every non-colliding name the operation declares required that holds a properties entry.
  met: true
  how: required is built only from resolved (properties-holding, non-colliding) candidates whose own required flag is true; inputSchemaObject adds the required key only when that array is non-empty.
- criterion: a name the operation leaves optional is absent from required.
  met: true
  how: required is filtered by candidate.required === true, so a candidate whose own required flag is false is never included.
- criterion: a name whose own schema does not reduce to one type is absent from required, however the operation declares it.
  met: true
  how: required is derived only from resolved (candidates with a defined reducedType); an unresolved candidate never reaches that filter regardless of its own required flag.
- criterion: input_schema declares no required key at all where no name held in properties is declared required.
  met: true
  how: inputSchemaObject returns { properties } alone, with no required key, when required.length is 0.
- criterion: a parameter or request-body field not claimed by any other part of the operation, whose own schema reduces to no type, declares no properties entry.
  met: true
  how: propertiesOf only iterates resolved (candidates that passed hasReducedType); a non-colliding candidate whose reducedType is undefined is excluded from properties by that same filter.
- criterion: that name stands in the draft's unresolved list with reason schema-not-reducible-to-a-type.
  met: true
  how: 'unresolvedItemOf is applied to every candidate that failed hasReducedType, each producing { name, reason: ''schema-not-reducible-to-a-type'' }.'
- criterion: an unresolved item names the name exactly as the OpenAPI document itself gives it.
  met: true
  how: 'Every candidate''s name comes verbatim from the reader: entry.name for a parameter (openapi-operation-reader.ts''s parameterDetailOf) and the request-body schema''s own property key (Object.keys(properties) in requestBodyFieldsOf); neither is transformed.'
- criterion: an operation declaring a required path parameter cpf of type string and an optional query parameter includeHistory of type boolean drafts an input_schema whose properties hold cpf typed string and includeHistory typed boolean and whose required array holds exactly cpf.
  met: true
  how: 'Traced through draftedInputSchema: two non-colliding, both-reducible candidates yield properties {cpf:{type:''string''}, includeHistory:{type:''boolean''}} and required [''cpf''], matching the worked example and the scenario node.'
- criterion: the drafted input_schema holds a properties object and, where present, a required array every entry of which is a key of properties, the shape a registered capability's own input schema must hold.
  met: true
  how: required is built exclusively from candidates already placed in properties (the resolved array), so every required entry is necessarily a properties key, the same shape capability-input-schema-shape.ts's inputSchemaShapeProblems checks at registration time.
- criterion: no second implementation of parameter reading, $ref resolution or request-body reading is added beside the one in src/src/connector-registry/openapi-operation-reader.ts.
  met: true
  how: capability-schema-draft-input-schema.ts only consumes OpenApiOperationReading's parameterDetails and requestBodyFields; all merging, $ref resolution (resolveRef, reused by reducedTypeOf) and request-body schema reading (requestBodySchemaOf, shared by requestBodyFieldNamesOf and requestBodyFieldsOf) live solely in openapi-operation-reader.ts.
nodes:
- node: domain/integration/capability-schema-draft
  encoded_at:
  - src/connector-registry/capability-schema-draft.ts
  how: CapabilitySchemaDraft declares exactly the node's three attributes (input_schema, output_schema, unresolved); this task populates only input_schema and its own unresolved entries, leaving output_schema for the sibling output-schema task to write into the same value.
- node: domain/integration/capability-schema-draft-unresolved-item
  encoded_at:
  - src/connector-registry/capability-schema-draft.ts
  - src/connector-registry/capability-schema-draft-input-schema.ts
  how: CapabilitySchemaDraftUnresolvedItem declares name and reason; unresolvedItemOf constructs exactly that shape for every name this task could not honestly turn into a properties entry.
- node: domain/integration/capability-schema-draft-unresolved-reason
  encoded_at:
  - src/connector-registry/capability-schema-draft.ts
  how: CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_REASONS enumerates exactly the closed set (schema-not-reducible-to-a-type, name-claimed-by-another-parameter); this task's own code assigns only the first, leaving the second to the sibling collision task.
- node: rules/integration/a-capability-schema-drafts-input-schema-is-read-from-the-chosen-operations-parameters-and-fields
  encoded_at:
  - src/connector-registry/capability-schema-draft-input-schema.ts
  - src/connector-registry/openapi-operation-reader.ts
  how: draftedInputSchema reads parameters through parameterDetails (already merged through the path item and its $refs by the reader) and request-body fields through requestBodyFields (the schema's own top-level properties), reduces each candidate's own schema with reducedTypeOf/agreeingBranchType exactly for the three reducing shapes and the two non-reducing ones the rule names, and builds properties, required and unresolved from that, restricted to names no other part of the operation also claims as this task's own criteria narrow it.
- node: rules/integration/a-drafted-capability-schema-requiring-no-name-declares-no-required-array
  encoded_at:
  - src/connector-registry/capability-schema-draft-input-schema.ts
  how: inputSchemaObject omits the required key entirely whenever the required array built for input_schema would be empty; this task answers only the input_schema half of the rule, its output_schema half being the sibling task's own claim.
- node: scenarios/integration/a-capability-schema-drafts-input-schema-reads-required-path-parameters
  encoded_at:
  - src/connector-registry/capability-schema-draft-input-schema.ts
  how: The given/when/then (a required path parameter cpf typed string and an optional query parameter includeHistory typed boolean) is criterion 17's own worked case, satisfied by draftedInputSchema's ordinary, non-colliding, both-reducible path as traced under that criterion above.
inferences:
- inferred: A parameter or request-body field whose schema is absent entirely (no schema keyword declared at all) is treated the same as an empty schema and does not reduce to a type.
  from: domain/integration/capability-schema-draft-unresolved-item's governing rule reasons that an empty, free-form or otherwise typeless schema permits any JSON value and so cannot honestly be drafted as one type; an absent schema is the same case under OpenAPI's own semantics, and no node distinguishes it.
- inferred: A branch of an allOf, oneOf or anyOf is read for its own direct type only (after resolving its $ref); a branch that is itself a further composition without a direct type is treated as not agreeing, so the enclosing schema does not reduce.
  from: The rule's own wording ("states"/"names" a type) for each branch, read literally rather than as a recursive reduction, and the absence of any candidate node addressing nested composition.
- inferred: Where a schema states a type directly and also declares an allOf, oneOf or anyOf alongside it, the direct type is read as the reduced type without inspecting the composition.
  from: Criterion 5 ("a schema stating a type directly reduces to that type") is stated unconditionally, with no exception for a schema that also declares a composition.
- inferred: 'A resolved properties entry carries exactly { "type": "<T>" } and no other JSON Schema keyword (format, description, and so on).'
  from: Criterion 4 ("each properties entry declares the type that name's own schema declares") states only the type; no criterion or node asks for any other constraint to be carried.
- inferred: A candidate's reduced type and a properties entry's type are represented as a bare string rather than a domain enumeration.
  from: The existing precedent in openapi-operation-reader.ts's own OpenApiSuccessResponseField.declaredType and connector-configuration-draft.ts's declared_type, both plain strings for the identical concept of a JSON Schema type read off a schema.
- inferred: The internal reading returned by draftedInputSchema uses camelCase field names (inputSchema, not input_schema) rather than the CapabilitySchemaDraft value's own snake_case.
  from: The existing convention in connector-configuration-draft-generation.ts, where an internal camelCase reading (OpenApiSuccessResponseField) is mapped to the snake_case draft shape (ConnectorConfigurationDraftResponseField) only at assembly time; the assembly into the full CapabilitySchemaDraft is a sibling task's own work.
preserved:
- OpenApiOperationParameter keeps its exact two-key { name, location } shape, unchanged for connector-configuration-draft-generation.ts, subject-placeholder-resolution.ts and generated-credential-placeholders.ts, and for the existing tests asserting that exact shape (openapi-operation-reader.spec.ts's 'exposes a parameter as exactly its name and declared location' and the $ref/merge/dedup tests using toEqual on that shape).
- requestBodyFieldNames keeps its existing behavior (top-level application/json property keys only, in document order, empty when the content type or schema shape does not match), now derived through the shared requestBodySchemaOf rather than reimplemented.
- successResponseFields, successResponseReadings, responses and requiredSecuritySchemes readings, and declaredTypeOf's own shallow (schema.type only) reading for response fields, are untouched by the new reducedTypeOf/agreeingBranchType functions, which are a separate reading path.
- resolveRef's $ref-cycle and external-ref refusals (OpenApiDocumentNotReadableError) are reused as-is by every new reading path, not reimplemented.
deferred:
- what: Resolving a name two or more parts of the operation claim (favoring declared order, disclosing every displaced claimant with reason name-claimed-by-another-parameter, and the interaction with an unreducible first claimant).
  why: Out of this task's own scope by its criteria's own narrowing to non-colliding names; it is the sibling task task/capability-schema-draft-generation/colliding-names-favor-declared-order's own claim, which this task's nonCollidingCandidates simply excludes such names from rather than resolving.
- what: Deriving output_schema from the operation's success responses, including the single-object-property envelope reading and the lowest-success-status precedence rule.
  why: This task drafts input_schema only, per its own objective; capability-schema-draft.ts already declares the output_schema field for the sibling task task/capability-schema-draft-generation/output-schema-from-success-responses to populate.
- what: Assembling the full CapabilitySchemaDraft (input_schema, output_schema and the union of every task's unresolved items) and the HTTP endpoint that fetches the document, reads the operation and answers the draft.
  why: That assembly and its wiring are the sibling generation/HTTP tasks' own work (task/capability-schema-draft-operation/draft-capability-schema-from-openapi-endpoint and its siblings), not named in this task's own criteria.
---

## What it is

The reading that takes one OpenAPI operation's parameters and request-body fields and produces a capability schema draft's input_schema, restricted to names no other part of the operation also claims, and the unresolved items for the ones that do not reduce to a single JSON Schema type.

## Notes

The internal reading and the reduction logic (reducedTypeOf, agreeingBranchType) live inside openapi-operation-reader.ts beside the existing parameter and request-body readers they extend, rather than in a second module, so the criterion forbidding a second implementation of parameter reading, $ref resolution or request-body reading is satisfied by construction.
Six inferences were drawn where the task's criteria and the bound specification nodes left a concrete choice open — an absent schema, a nested composition inside a branch, a schema stating both a direct type and a composition, what a properties entry carries besides its type, the string representation of a type, and the internal camelCase naming — each with what it was drawn from; none changes behavior a caller depends on.
Three pieces of work are deliberately deferred to sibling tasks already planned for them: the collision resolution, the output_schema derivation, and the assembly/HTTP wiring.
