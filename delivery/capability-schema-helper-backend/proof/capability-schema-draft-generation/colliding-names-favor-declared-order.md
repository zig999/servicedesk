---
target: backend
title: Collision resolution by declared order — input_schema property-name precedence
summary: Proves that draftedInputSchema resolves a name two or more parts of the chosen operation claim by the fixed order path, query, header, cookie, request-body field (tie-broken by array position), disclosing every displaced claimant and handling an unreducible winner without promoting a later claimant.
implementation: sha256:6f55c98948dbc69e3c05c3dc3e08395a015cf2c0673483700bda302867f550b1
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/capability-schema-draft-generation-colliding-names-favor-declared-order-suite
tests:
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: ranks $title as the properties entry, disclosing the other (path>query, query>header, header>cookie, cookie>request-body field, and the array-position tie-break between two query parameters of the same name)
  proves: that entry holds the type of the first claimant in the order path parameter, query parameter, header parameter, cookie parameter, request-body field. / two parameters of the chosen operation equal in both name and location are ranked between themselves by the position the parameters array declaring them gives each, the earlier standing first as the properties entry and the later named in unresolved with reason name-claimed-by-another-parameter.
  fails_when: any adjacent pair in the declared order (path/query, query/header, header/cookie, cookie/request-body) picks the wrong winner, or two parameters equal in name and location are not ranked by their position in the declaring array.
  demonstrates: rules/integration/a-capability-schema-drafts-parameter-or-field-name-claimed-twice-favors-declared-order
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: discloses every displaced claimant, not only the first, when three parts of the operation share one name
  proves: input_schema's properties object holds exactly one entry for a name two or more parts of the operation claim... / every claimant other than the first declares no properties entry. / every claimant other than the first is named in the draft's unresolved list with reason name-claimed-by-another-parameter.
  fails_when: a name claimed by three or more parts of the operation yields more than one properties entry, or fewer than every non-winning claimant is disclosed in unresolved.
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: drafts a single status property from the query parameter, disclosing the colliding request-body field, when an operation declares a query parameter and a request-body field both named status
  proves: an operation declaring a query parameter named status and a request-body field also named status drafts an input_schema whose properties object holds exactly one entry named status holding the query parameter's own type, and an unresolved list naming status with reason name-claimed-by-another-parameter.
  fails_when: the drafted input_schema for this exact document does not hold exactly one status entry typed as the query parameter's own type, or does not name status once in unresolved with reason name-claimed-by-another-parameter.
  demonstrates: scenarios/integration/a-schema-drafts-colliding-parameter-names-favor-declared-order
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: stands the colliding name in required only where $title (the first claimant is itself declared required / only a displaced claimant is declared required)
  proves: that name stands in input_schema's required array where and only where that first claimant is itself declared required and holds a properties entry.
  fails_when: the required array includes the colliding name when the winning claimant is not itself required, or omits it when the winning claimant is itself required.
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: names a displaced claimant in unresolved exactly as the OpenAPI document itself gives its name
  proves: an unresolved item for a displaced claimant names the name exactly as the OpenAPI document itself gives it.
  fails_when: the produced unresolved item's name is not the exact string the document declares, or the item carries a field other than name and reason.
  demonstrates: domain/integration/capability-schema-draft-unresolved-item
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: stands no name in unresolved with reason name-claimed-by-another-parameter when every parameter and field name is claimed by only one part of the operation
  proves: a name only one part of the operation claims stands in no unresolved item with reason name-claimed-by-another-parameter.
  fails_when: a name claimed by exactly one part of the operation is disclosed in unresolved with reason name-claimed-by-another-parameter, or at all.
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: leaves no properties entry and promotes no later claimant when the first claimant in declared order does not itself reduce to one JSON Schema type
  proves: where the first claimant in declared order does not itself reduce to one JSON Schema type, the name carries no properties entry at all, the first claimant is named in unresolved with reason schema-not-reducible-to-a-type, and every other claimant is still named in unresolved with reason name-claimed-by-another-parameter.
  fails_when: a properties entry is written for the name despite the first claimant's schema not reducing to a type, or a later, reducible claimant is promoted into the properties entry instead, or the winner is not itself disclosed under schema-not-reducible-to-a-type.
  demonstrates: rules/integration/a-name-whose-first-claimant-is-unreducible-drafts-no-input-schema-entry
- file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  name: names a displaced claimant under both reasons, never one alone, when it both is displaced and does not itself reduce to one JSON Schema type
  proves: the draft's unresolved list carries two items naming a part both unreducible and name-claimed -- one with reason schema-not-reducible-to-a-type and one with reason name-claimed-by-another-parameter -- and never one item alone under either reason (rules/integration/a-part-both-unreducible-and-name-claimed-stands-in-unresolved-under-each-reason), an obligation of this task through its own implements list independent of which criterion happens to exercise it.
  fails_when: a displaced claimant whose own schema does not reduce to one type is named in unresolved under only one of the two reasons, or under neither.
  demonstrates: rules/integration/a-part-both-unreducible-and-name-claimed-stands-in-unresolved-under-each-reason
not_applicable:
- edge_case: an operation attempted against state that forbids it
  why: draftedInputSchema is a pure, synchronous transformation over an already-read OpenAPI operation; there is no stateful resource and no forbidden state to reject.
- edge_case: a dependency that fails or answers slowly
  why: the function performs no I/O and calls no collaborator that can fail or be slow; it only maps over the reading it is given.
- edge_case: two operations against one subject at once
  why: nothing here is shared, mutable, or concurrently accessed; each call receives its own reading and returns its own draft.
untested:
- domain/integration/capability-schema-draft's fact spans input_schema, output_schema and unresolved together; this task populates only input_schema and unresolved (output_schema is the sibling output-schema task's own ground), so no test written under this task can decide the value-object's fact whole without exceeding what this task's own files establish.
- domain/integration/capability-schema-draft-unresolved-reason's fact is that the set of reasons is closed to exactly schema-not-reducible-to-a-type and name-claimed-by-another-parameter. That closure is a type-level fact enforced by the CapabilitySchemaDraftUnresolvedReason union declared in capability-schema-draft.ts (unchanged by this task) and checked by the project's typecheck step, not something a runtime test can decide whole; a runtime test can only show that a given call emits one of the two literals, which the rule tests above already do for both, but proves nothing about a third value never being reachable.
- 'The task''s own Notes record an UNDERDETERMINED entry over rules/integration/a-part-both-unreducible-and-name-claimed-stands-in-unresolved-under-each-reason: no criterion of this task''s own acceptance list demands the joint two-item disclosure (criterion 5 is satisfied by the single name-claimed-by-another-parameter item alone). The entry names no implementation to test against -- it is an observation that the task''s criteria leave the node''s own second item unrequired -- so no test is owed to the entry itself; a test is nonetheless written for the node''s own fact as a separate, node-level obligation under this task''s implements list, and is recorded above under demonstrates. Nothing in the task''s stated criteria excludes an implementation that emitted only the single item; that gap is the binder''s own finding, not something this proof''s tests close from the criteria''s own text.'
---

## What it is

The tests proving task/capability-schema-draft-generation/colliding-names-favor-declared-order: draftedInputSchema's declared-order collision resolution across path/query/header/cookie parameters and request-body fields, its array-position tie-break between same-name/same-location parameters, its disclosure of every displaced claimant, its handling of a required-standing that travels only with the winning claimant, and its refusal to promote a later claimant when the winner itself does not reduce to one JSON Schema type.

## Notes

None.
