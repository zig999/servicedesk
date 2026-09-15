---
target: backend
title: Capability schema draft input_schema collision resolution by declared order
summary: Extends draftedInputSchema to resolve a parameter or request-body-field name two or more parts of the chosen operation claim by declared order (path, query, header, cookie, then request body), giving the properties/required entry to the first claimant and disclosing every other one in the draft's unresolved list.
task: sha256:2431899cc68af268c5e66cf28f025b1a377e6fd307c4579b3a6e83c9cc9d2608
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/capability-schema-draft-generation-colliding-names-favor-declared-order-build-2
files:
- path: src/connector-registry/capability-schema-draft-input-schema.ts
  effect: Replaces the previous nonCollidingCandidates/countsByName exclusion with a full declared-order collision resolution built on the same reading.parameterDetails/reading.requestBodyFields inputs — every candidate now carries a precedenceRank (path 0, query 1, header 2, cookie 3, request-body field 4) and a precedenceIndex (its position within the array that declared it); candidates are grouped by name and each group ordered by that precedence, the first (winner) supplying the sole properties/required entry when its own schema reduces to one type, and every other member of the group (plus an unreducible winner itself) being named in the returned unresolved list, with a displaced-and-unreducible claimant carrying both a schema-not-reducible-to-a-type item and a name-claimed-by-another-parameter item. The non-colliding case (a group of one) is now simply the degenerate case of the same algorithm rather than a separately filtered path, so no second implementation of the reading exists
    beside this one.
criteria:
- criterion: input_schema's properties object holds exactly one entry for a name two or more parts of the operation claim, where the first claimant in declared order reduces to one JSON Schema type.
  met: true
  how: candidateGroupsByName groups every parameter/request-body-field candidate by name; propertiesOf is built only from resolved winners (groups.map(firstInDeclaredOrder).filter(hasReducedType)), so a colliding name yields at most the one entry contributed by its first-ranked, reducible member.
- criterion: that entry holds the type of the first claimant in the order path parameter, query parameter, header parameter, cookie parameter, request-body field.
  met: true
  how: PARAMETER_LOCATION_PRECEDENCE (path 0, query 1, header 2, cookie 3) and REQUEST_BODY_FIELD_PRECEDENCE (4) rank every candidate; orderedByDeclaredPrecedence sorts each name's group by that rank first, so firstInDeclaredOrder picks exactly the part the rule orders first, and propertiesOf writes that candidate's own reducedType.
- criterion: that name stands in input_schema's required array where and only where that first claimant is itself declared required and holds a properties entry.
  met: true
  how: required is derived exclusively from resolved (properties-holding) winners filtered by candidate.required === true, so a name reaches required only through the same winner that reached properties, and only when that winner's own required flag is true.
- criterion: every claimant other than the first declares no properties entry.
  met: true
  how: propertiesOf iterates only winners (groups.map(firstInDeclaredOrder)); a displaced candidate is never a group's first element and so never reaches propertiesOf regardless of its own reducibility.
- criterion: every claimant other than the first is named in the draft's unresolved list with reason name-claimed-by-another-parameter.
  met: true
  how: 'unresolvedItemsOf destructures each group into [winner, ...displaced] and maps every displaced candidate through unresolvedItemsForDisplacedClaimant, which always includes a { name, reason: ''name-claimed-by-another-parameter'' } item for it.'
- criterion: an unresolved item for a displaced claimant names the name exactly as the OpenAPI document itself gives it.
  met: true
  how: unresolvedItemOf writes candidate.name verbatim, and candidate.name is copied unchanged from reading.parameterDetails'/reading.requestBodyFields' own name fields, which the reader already reads off the document without transformation.
- criterion: a name only one part of the operation claims stands in no unresolved item with reason name-claimed-by-another-parameter.
  met: true
  how: a group of size one has an empty displaced array, so unresolvedItemsForDisplacedClaimant is never invoked for it and no name-claimed-by-another-parameter item is produced for that name.
- criterion: where the first claimant in declared order does not itself reduce to one JSON Schema type, the name carries no properties entry at all, the first claimant is named in unresolved with reason schema-not-reducible-to-a-type, and every other claimant is still named in unresolved with reason name-claimed-by-another-parameter.
  met: true
  how: 'unresolvedItemsOf checks hasReducedType(winner) and, when false, emits { name, reason: ''schema-not-reducible-to-a-type'' } for the winner while properties (built only from resolved winners) carries no entry for that name; displaced candidates still each receive their name-claimed-by-another-parameter item independent of the winner''s own reducibility, since unresolvedItemsForDisplacedClaimant is applied to them unconditionally.'
- criterion: an operation declaring a query parameter named status and a request-body field also named status drafts an input_schema whose properties object holds exactly one entry named status holding the query parameter's own type, and an unresolved list naming status with reason name-claimed-by-another-parameter.
  met: true
  how: the query parameter's precedenceRank (1) is lower than the request-body field's (4), so the query parameter is firstInDeclaredOrder and supplies the sole properties entry with its own reducedType; the request-body field becomes the sole displaced member and (when its own schema reduces) receives exactly one unresolved item under name-claimed-by-another-parameter.
- criterion: two parameters of the chosen operation equal in both name and location are ranked between themselves by the position the parameters array declaring them gives each, the earlier standing first as the properties entry and the later named in unresolved with reason name-claimed-by-another-parameter.
  met: true
  how: two candidates sharing both name and location share the same precedenceRank, so orderedByDeclaredPrecedence's tie-break sorts them by precedenceIndex — each candidate's own position within reading.parameterDetails, which openapi-operation-reader.ts's parameterDetailsOf already preserves in the declaring array's own order (operation's own parameters array order first, then the path item's); the earlier one becomes the winner and the later is displaced into unresolved with name-claimed-by-another-parameter.
nodes:
- node: domain/integration/capability-schema-draft
  how: This task writes only into the input_schema and unresolved fields CapabilitySchemaDraftInputSchemaReading already exposed; the value object's own declaration in capability-schema-draft.ts is unchanged, since this task populates it further rather than reshaping it.
- node: domain/integration/capability-schema-draft-unresolved-item
  encoded_at:
  - src/connector-registry/capability-schema-draft-input-schema.ts
  how: unresolvedItemOf constructs exactly { name, reason } for every winner and displaced candidate this task resolves, including the two-items-for-one-name case a-part-both-unreducible-and-name-claimed-stands-in-unresolved-under-each-reason requires.
- node: domain/integration/capability-schema-draft-unresolved-reason
  how: Both closed-set values (schema-not-reducible-to-a-type, name-claimed-by-another-parameter) are now assigned by this same module's own logic; the enumeration itself, declared in capability-schema-draft.ts, is unchanged.
- node: rules/integration/a-capability-schema-drafts-parameter-or-field-name-claimed-twice-favors-declared-order
  encoded_at:
  - src/connector-registry/capability-schema-draft-input-schema.ts
  how: candidateGroupsByName/orderedByDeclaredPrecedence implement the fixed order (path, query, header, cookie, request-body field, with array-position as the tie-break for equal name-and-location) exactly as the invariant states, and firstInDeclaredOrder/unresolvedItemsOf give the first-ranked claimant the properties/required entry while disclosing every other one.
- node: rules/integration/a-name-whose-first-claimant-is-unreducible-drafts-no-input-schema-entry
  encoded_at:
  - src/connector-registry/capability-schema-draft-input-schema.ts
  how: when hasReducedType(winner) is false, propertiesOf (built only from resolved winners) carries no entry for that name at all, precedence passes to no later claimant (displaced candidates are still resolved purely by their own group position, never promoted), and the winner alone is named with schema-not-reducible-to-a-type while every other claimant keeps name-claimed-by-another-parameter.
- node: rules/integration/a-part-both-unreducible-and-name-claimed-stands-in-unresolved-under-each-reason
  encoded_at:
  - src/connector-registry/capability-schema-draft-input-schema.ts
  how: unresolvedItemsForDisplacedClaimant returns two items — schema-not-reducible-to-a-type then name-claimed-by-another-parameter — for a displaced candidate whose own reducedType is undefined, rather than either alone, matching the invariant's own unconditional statement.
- node: scenarios/integration/a-schema-drafts-colliding-parameter-names-favor-declared-order
  encoded_at:
  - src/connector-registry/capability-schema-draft-input-schema.ts
  how: the given/when/then (query parameter status colliding with a request-body field status) is exactly criterion 9's worked case, satisfied by the query parameter's lower precedenceRank winning the properties entry and the request-body field being named in unresolved, as traced under that criterion above.
inferences:
- inferred: This task implements rules/integration/a-part-both-unreducible-and-name-claimed-stands-in-unresolved-under-each-reason in full (emitting both unresolved items for a displaced-and-unreducible claimant) even though the task's own Notes mark this UNDERDETERMINED because no criterion of this task's own list demands the second item.
  from: The node itself is unconditional and is listed in this task's own implements, so its text was taken as binding on the source even where no acceptance criterion happens to exercise the second item; the task's Notes only observe that criterion 5 alone is satisfiable without it, not that the node should be left unimplemented.
- inferred: Where a displaced-and-unreducible claimant carries two unresolved items, they are ordered schema-not-reducible-to-a-type before name-claimed-by-another-parameter.
  from: No node or criterion states an order between the two items for one name; the order chosen matches the sequence the governing node itself states them in ('one with reason schema-not-reducible-to-a-type and one with reason name-claimed-by-another-parameter').
- inferred: A request-body field's own tie-break key (its position among reading.requestBodyFields) is carried for structural symmetry with a parameter's precedenceIndex, though it is inert in practice since two request-body fields can never share one name (they come from one JSON object's own unique keys).
  from: No node addresses a same-name collision among request-body fields themselves, since OpenAPI's own object-property-key uniqueness makes it impossible; the field was kept only so every candidate shares one shape rather than requestBodyFields' entries lacking a tie-break the rest of the type expects.
preserved:
- openapi-operation-reader.ts's parameterDetailsOf/resolvedParameterDetailsList (the operation's own parameter taking precedence over a path item's at one name and location, and the $ref-resolving merge) are reused unchanged as the grounding for criterion 10's own presumption that two equal-name-and-location parameters stand inside one parameters array, per the task's own ADVISORY note and the epic's stand decision; no second reading of parameters, $refs or request-body fields was added.
- capability-schema-draft.ts's CapabilitySchemaDraft/CapabilitySchemaDraftUnresolvedItem/CapabilitySchemaDraftUnresolvedReason declarations are untouched.
- capability-schema-draft-output-schema.ts and its own draftedOutputSchema reading are untouched; this task reaches input_schema only.
- The drafted input_schema's outer shape (a properties object, and a required array present only when non-empty) is unchanged from the sibling task's own inputSchemaObject, still satisfying capability-input-schema-shape.ts's shape check.
- The non-colliding case (a name exactly one part of the operation claims) now runs through the same declared-order algorithm as a degenerate one-member group, reproducing the sibling task's own already-delivered behavior for properties, required and the schema-not-reducible-to-a-type unresolved item, rather than being handled by a second, parallel implementation.
deferred:
- what: Updating the assertion in src/src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts ('excludes a name from properties and from required, even where declared required, when another part of the operation also claims the same name') to this task's own resolution behavior.
  why: 'Resolved: the owning task (input-schema-from-parameters-and-request-body-fields, this same initiative) was re-delivered proof-only, removing that assertion since it fell outside that task''s own narrowed (non-colliding-only) criteria, so this delivery''s collision resolution no longer conflicts with it.'
- what: Assembling the full CapabilitySchemaDraft (the union of input_schema's and output_schema's own unresolved items) and the HTTP endpoint that fetches the document, reads the operation and answers the draft.
  why: Already recorded as deferred by the sibling input-schema task to task/capability-schema-draft-operation/draft-capability-schema-from-openapi-endpoint and its siblings; not named in this task's own criteria.
---

## What it is

The precedence among parts of one operation that would occupy one properties key, and the disclosure of every displaced one, including where the winning part is itself unreadable as a single type.

## Notes

The non-colliding case now runs through the same declared-order algorithm as a degenerate one-member group, so the sibling input-schema task's own non-colliding behavior is reproduced rather than duplicated by a second path.
Three inferences were drawn where the task's criteria and the bound specification nodes left a concrete choice open — implementing the unconditional joint-disclosure node in full despite no criterion exercising it directly, the order of the two unresolved items for a displaced-and-unreducible claimant, and an inert tie-break field kept for structural symmetry — each with what it was drawn from; none changes behavior a caller depends on.
This delivery's own legitimate collision resolution broke a pre-existing, over-broad test assertion belonging to the sibling input-schema task in this same initiative; that task was re-delivered proof-only (implementation unchanged, proof rewritten) before this build could pass.
