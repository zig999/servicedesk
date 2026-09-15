---
target: backend
title: Output schema drafted from an operation's success responses
summary: Adds draftedOutputSchema, deriving a capability schema draft's output_schema and its unresolved items from the chosen operation's success-response fields, and extends the shared OpenAPI reader with the same type-reduction reading the input-schema draft already uses.
task: sha256:cb967c8478c6caef3196bbc30ba99c7655f5f0cc08c7b76480e68f873597fb77
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/capability-schema-draft-generation-output-schema-from-success-responses-build-4
files:
- path: src/connector-registry/openapi-operation-reader.ts
  effect: OpenApiSuccessResponseField now also carries an optional reducedType, computed alongside the pre-existing declaredType by threading the document through directSchemaReading, envelopedSchemaReading and responseField into the existing reducedTypeOf/agreeingBranchType functions (the same ones OpenApiOperationParameterDetail and OpenApiRequestBodyField already use), so a response field's reducibility now reads allOf/oneOf/anyOf agreement exactly as a parameter's or a request-body field's own schema does, rather than only a direct type keyword. declaredType, declaredRequired, envelope and every other field of the reading are unchanged.
- path: src/connector-registry/capability-schema-draft-output-schema.ts
  effect: 'New file exporting draftedOutputSchema(reading: OpenApiOperationReading), which selects reading.successResponseFields'' lowest-status entry per field name via the existing lowestStatusSuccessFieldsOf, builds output_schema''s properties object (and, only when at least one held name is required, its required array) from the entries whose lowest-status declaration reduced to one type, and returns the JSON-stringified output_schema together with a CapabilitySchemaDraftUnresolvedItem (reason schema-not-reducible-to-a-type) for every remaining name -- the same shape and helper-splitting convention capability-schema-draft-input-schema.ts already establishes for input_schema.'
- path: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  effect: Pre-existing test 'reads a success response and its schema reached through $refs into fields, the same as if declared inline' narrowed from an exact-shape toEqual over the whole successResponseFields array to individual field-property assertions (name, path, status, declaredType), since the prior full-object equality asserted a totality -- that no other key may ever appear on a yielded field -- that no criterion of the task owning that test, nor this task's own legitimate addition of reducedType, ever claimed. This edit was made under the proof-only re-delivery of task/connector-configuration-draft-maps/success-response-envelope-read-through, not under this task's own delivery.
criteria:
- criterion: output_schema is JSON text that parses to an object declaring a top-level properties object.
  met: true
  how: draftedOutputSchema returns JSON.stringify(outputSchemaObject(...)), and outputSchemaObject always includes a properties key, empty object or not.
- criterion: a response keyed by a numeric status from 200 through 299 declaring a schema under the media type application/json contributes its fields.
  met: true
  how: reading.successResponseFields (consumed as-is) is produced by openapi-operation-reader.ts's successResponseFieldsOf, filtered by isSuccessStatusKey (status kind and a leading '2'), which draftedOutputSchema does not re-filter or re-derive.
- criterion: a response keyed by a status outside 200 through 299 contributes no entry.
  met: true
  how: the same isSuccessStatusKey filter in openapi-operation-reader.ts excludes it before draftedOutputSchema ever sees it.
- criterion: a success response declaring no content under application/json contributes no entry.
  met: true
  how: successResponseFieldsAt returns no field when the response's content or its application/json media type or schema is absent, so no such response reaches draftedOutputSchema's input.
- criterion: properties holds one entry for each field the single-object-property envelope reading reads from a contributing success response schema whose lowest-status declaration reduces to one JSON Schema type.
  met: true
  how: draftedOutputSchema groups reading.successResponseFields (already envelope-read by schemaReadingAt/envelopedSchemaReading) by name via lowestStatusSuccessFieldsOf, then keeps only entries whose reducedType is defined (hasReducedType), producing one properties entry each via propertiesOf.
- criterion: an entry holds the type declared by the schema of the lowest success status that declares that name.
  met: true
  how: lowestStatusSuccessFieldsOf's lowestStatusEntry picks the numerically-lowest status per name, and propertiesOf reads that entry's own reducedType.
- criterion: another success response schema declaring the same name with a different type leaves that entry's type as the lowest status's own.
  met: true
  how: lowestStatusEntry always returns the single lowest-status field per name; the discarded higher-status fields' own reducedType never reaches propertiesOf.
- criterion: a field whose lowest-status declaration does not reduce to one JSON Schema type declares no properties entry and stands in the draft's unresolved list with reason schema-not-reducible-to-a-type.
  met: true
  how: hasReducedType filters the lowest-status field out of resolved (so propertiesOf never sees it) and into the unresolved branch, where unresolvedItemOf names it with NOT_REDUCIBLE_REASON ('schema-not-reducible-to-a-type').
- criterion: output_schema declares a top-level required array, present only where at least one name held in properties is declared required, listing every name declared required by the lowest-status schema that declares that name and holds a properties entry.
  met: true
  how: required is computed only from resolved (entries that already hold a properties entry), filtered by declaredRequired === true; outputSchemaObject adds the required key only when that list is non-empty.
- criterion: for a name read through a single-object-property envelope, required standing is read from the enveloping property's own inner object schema's own required array, never from the success response schema's own top-level required array.
  met: true
  how: unchanged pre-existing behavior in openapi-operation-reader.ts -- envelopedSchemaReading computes enveloped.requiredNames purely from the envelope schema's own parts (mergedSchemaProperties(schemaPropertySources(document, envelopeSchema))), never from the outer schema's own required array; draftedOutputSchema reads that already-correct declaredRequired as-is.
- criterion: a name whose lowest-status declaration does not reduce to one type is absent from required, however that schema declares it.
  met: true
  how: required is built only from resolved (hasReducedType-passing entries), so an unresolved name's own declaredRequired, whatever it is, never reaches the required array.
- criterion: output_schema declares no required key at all where no name held in properties is declared required.
  met: true
  how: outputSchemaObject returns { properties } alone when required.length === 0.
- criterion: another success response schema declaring that name's required standing differently leaves that listing as the lowest status's own.
  met: true
  how: required is read from the single lowest-status entry lowestStatusSuccessFieldsOf already selected per name, so a higher status's own declaredRequired is never consulted.
- criterion: a name declared only by a higher success status still holds an entry in properties.
  met: true
  how: lowestStatusSuccessFieldsOf groups purely by name across every contributing status; a name appearing under only one (even a higher) status still yields exactly one group, and if it reduces it becomes a properties entry.
- criterion: an operation from which no such field is read drafts an output_schema whose properties object is present and holds no entry.
  met: true
  how: 'with reading.successResponseFields empty, lowestStatusSuccessFieldsOf returns [], resolved and required are both empty, and outputSchemaObject still returns { properties: {} }.'
- criterion: an operation declaring a 200 and a 201 response, both under application/json and each declaring a top-level properties object naming id, the 200 typed string and the 201 typed integer, drafts an output_schema whose properties object holds exactly one entry named id, typed string.
  met: true
  how: 'both statuses'' schemas read as direct (non-enveloped) fields since id''s own schema declares no properties keyword; lowestStatusSuccessFieldsOf picks the 200 entry (reducedType ''string'') over the 201 entry, so properties holds exactly { id: { type: ''string'' } }.'
- criterion: no second implementation of success-response or envelope reading is added beside the one in src/src/connector-registry/openapi-operation-reader.ts.
  met: true
  how: capability-schema-draft-output-schema.ts only consumes reading.successResponseFields (already read and envelope-resolved by openapi-operation-reader.ts) and the pre-existing lowestStatusSuccessFieldsOf helper; the only change to reading logic is adding reducedType to responseField via the reader's own existing reducedTypeOf/agreeingBranchType functions, not a parallel implementation.
nodes:
- node: domain/integration/capability-schema-draft
  encoded_at:
  - src/connector-registry/capability-schema-draft-output-schema.ts
  how: draftedOutputSchema produces the outputSchema string half of the value this type declares, in the same JSON-text-with-properties/required shape capability-schema-draft-input-schema.ts already gives input_schema; composing both halves plus unresolved into one CapabilitySchemaDraft value is not reached by this task's criteria and is left to whichever task assembles the full draft.
- node: domain/integration/capability-schema-draft-unresolved-item
  encoded_at:
  - src/connector-registry/capability-schema-draft-output-schema.ts
  how: unresolvedItemOf builds a CapabilitySchemaDraftUnresolvedItem { name, reason } for every response field whose lowest-status declaration does not reduce to one type.
- node: domain/integration/capability-schema-draft-unresolved-reason
  encoded_at:
  - src/connector-registry/capability-schema-draft-output-schema.ts
  how: the NOT_REDUCIBLE_REASON constant is typed as CapabilitySchemaDraftUnresolvedReason and fixed to 'schema-not-reducible-to-a-type', the only reason this task's reading can produce.
- node: rules/integration/a-capability-schema-drafts-output-schema-is-read-from-the-chosen-operations-success-responses
  encoded_at:
  - src/connector-registry/capability-schema-draft-output-schema.ts
  - src/connector-registry/openapi-operation-reader.ts
  how: draftedOutputSchema reads every contributing success-response field (already envelope-read and success-status-filtered by openapi-operation-reader.ts), keeps the lowest status's own type and required standing per name via lowestStatusSuccessFieldsOf, drafts an empty-but-present properties object when no field is read, and discloses a field whose lowest-status declaration does not reduce to one type in unresolved instead of drafting it; the reducibility test itself (declared type directly, or an allOf/oneOf/anyOf agreeing on one type) is the reader's own reducedTypeOf/agreeingBranchType, now also computed for a response field's own property schema so the same reading a parameter or request-body field already gets is not re-derived for a response field.
- node: rules/integration/a-drafted-capability-schema-requiring-no-name-declares-no-required-array
  encoded_at:
  - src/connector-registry/capability-schema-draft-output-schema.ts
  how: outputSchemaObject omits the required key entirely when the drafted required list is empty, whether because no name is required or because every required name is unresolved, rather than emitting an empty array; this task's own criteria reach only the output_schema half of this rule's statement, the input_schema half being the sibling task's.
- node: scenarios/integration/a-capability-schema-drafts-output-schema-reads-the-lowest-success-status
  encoded_at:
  - src/connector-registry/capability-schema-draft-output-schema.ts
  how: the 200/201-declaring-id-differently scenario is exactly what lowestStatusSuccessFieldsOf's numeric lowest-status selection per name resolves, kept as the entry propertiesOf reads its type from.
inferences:
- inferred: reducedType is added as a new, separate field on OpenApiSuccessResponseField rather than folding the reduction into the existing declaredType field.
  from: the inventory's own risk entry ('extension changes behavior also relied on by connector-configuration-draft's response_fields and reading_notes output') and the instruction never to widen a task -- declaredType's existing consumers in connector-configuration-draft-generation.ts read it purely as an informational display value, and repurposing its meaning would silently change that unrelated capability's own output for any oneOf/anyOf/allOf-typed response field, which this task does not reach.
- inferred: an output_schema property read through an envelope is keyed by the field's own name alone, never by the envelope-qualified path.
  from: the governing rule's own statement text ('each entry keyed by that field's own name') and Description, read alongside the task's own UNDERDETERMINED note that no single criterion's wording alone would catch a path-keyed implementation.
- inferred: reuse of the existing lowestStatusSuccessFieldsOf helper (success-response-field-selection.ts) for the output-schema's own lowest-status-per-name selection, rather than writing a second reduction over reading.successResponseFields.
  from: the governing rule's own Description ('the same convention a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas already reads its own response fields by') and the standard's MNT-03.
preserved:
- connector-configuration-draft-generation.ts's response_fields and reading-notes output (declared_type, declared_required, envelope), which rebuilds its own object from only the pre-existing declaredType/declaredRequired/envelope fields and so is unaffected by the reader's new reducedType field.
- the existing envelope detection and lowest-success-status field selection in openapi-operation-reader.ts and success-response-field-selection.ts, unchanged for every current caller.
- capability-schema-draft-input-schema.ts's own draftedInputSchema and unresolved handling, untouched by this delivery.
deferred:
- what: openapi-operation-reader.spec.ts's test 'reads a success response and its schema reached through $refs into fields, the same as if declared inline' asserted reading.successResponseFields via toEqual against a single object literal without a reducedType key.
  why: 'resolved: the owning task (connector-configuration-draft-maps/success-response-envelope-read-through, initiative connector-configuration-draft-status-response-maps-backend) was re-delivered proof-only, narrowing that assertion to the fields its own criteria actually name, so this delivery''s addition no longer conflicts with it.'
---

## What it is

The reading that takes one OpenAPI operation's success responses (already envelope-read and success-status-filtered by openapi-operation-reader.ts) and produces a capability schema draft's output_schema, keeping the lowest success status's own type and required standing per field name, and the unresolved items for fields that do not reduce to a single JSON Schema type.

## Notes

reducedType reuses the existing reducedTypeOf/agreeingBranchType functions the sibling input_schema task already added, rather than a second implementation, so the criterion forbidding a second reduction reading is satisfied by construction.
Three inferences were drawn where the task's criteria and the bound specification nodes left a concrete choice open — keeping reducedType as a separate field rather than repurposing declaredType, keying an enveloped property by its own name rather than its envelope-qualified path, and reusing the existing lowest-status-selection helper — each with what it was drawn from; none changes behavior a caller depends on.
This delivery's own legitimate addition of reducedType broke a pre-existing, over-broad test assertion belonging to an already-delivered, still-open task in a different initiative (connector-configuration-draft-maps/success-response-envelope-read-through); that task was re-delivered proof-only (implementation unchanged, proof rewritten by a fresh test-author) before this build could pass, per the human's own choice.
