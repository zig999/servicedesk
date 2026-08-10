---
title: Citation structural validation, tested
summary: Proves isCitationValid's two AND-combined rules (concept-in-collects, field-declared-in-the-cited-evidence's-own-capability-schema) each refuse and jointly accept as the task's three criteria state, that every defensive path the implementation's inferences name answers false rather than throwing, and that acceptedCitations filters a mixed set while preserving proposed order.
implementation: sha256:b1e3c62535998f7caf6ce16e9529b2da2307ca928b885a5aa42b2b7c34fcab3f
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/hypothesis-judgment-citation-validation-suite
tests:
- file: src/__tests__/unit/investigation/citation-validation.spec.ts
  name: refuses a citation naming a concept outside the judged hypothesis's collects, even though its field matches that concept's own capability schema
  proves: A citation naming a concept outside the judged hypothesis's collects is refused.
  fails_when: citesACollectedConcept's membership check is removed or bypassed, so a citation whose concept is absent from collects is wrongly accepted because its field happens to be declared under its own (foreign) capability's schema.
- file: src/__tests__/unit/investigation/citation-validation.spec.ts
  name: refuses a citation naming a field absent from the output schema of the capability that produced the cited evidence, even though its concept is collected
  proves: A citation naming a field absent from the output schema of the capability that produced the cited evidence is refused.
  fails_when: the field-existence check against the producing capability's declared fields is removed or bypassed, so a field that is not among that capability's declared fields is wrongly accepted despite its concept being collected.
- file: src/__tests__/unit/investigation/citation-validation.spec.ts
  name: accepts a citation naming a concept in the hypothesis's collects and a field present in that capability's own output schema
  proves: A citation naming a concept in the hypothesis's collects and a field present in that capability's output schema is accepted.
  fails_when: either rule wrongly refuses a citation whose concept is collected and whose field is declared under the correct capability identity, e.g. isCitationValid answers false for it.
- file: src/__tests__/unit/investigation/citation-validation.spec.ts
  name: refuses a citation against an output_schema that is not valid JSON, answering false rather than throwing
  proves: the implementation's own inference that an output_schema unparseable as JSON declares no fields at all, so declaredFieldsOf never throws and the citation is refused
  fails_when: isCitationValid throws when given an unparseable output_schema, or answers true for a citation checked against one.
- file: src/__tests__/unit/investigation/citation-validation.spec.ts
  name: refuses a citation against an output_schema that parses as JSON but declares no top-level properties object
  proves: the implementation's own inference that a schema parsing to JSON with no top-level properties object declares no fields at all
  fails_when: isCitationValid throws over a properties-less parsed schema, or answers true for a citation checked against one.
- file: src/__tests__/unit/investigation/citation-validation.spec.ts
  name: refuses a citation whose concept has no matching entry in the supplied evidence at all, answering false rather than throwing
  proves: the implementation's own inference that a citation whose concept has no matching Evidence entry is refused (rule 2's defensive branch) rather than passed through or thrown
  fails_when: isCitationValid throws when no Evidence entry matches the citation's concept, or answers true for such a citation.
- file: src/__tests__/unit/investigation/citation-validation.spec.ts
  name: refuses a citation whose field is declared only under a different capability_name/capability_version than the cited evidence's own
  proves: the implementation's own inference that outputSchemas is keyed by the cited evidence's own capability_name/capability_version composite identity, never by concept or by any capability that happens to declare the field
  fails_when: citesADeclaredField (or its key derivation) reads a schema entry keyed under a capability identity other than the cited evidence's own, so a field declared for a different version of the same capability is wrongly accepted.
- file: src/__tests__/unit/investigation/citation-validation.spec.ts
  name: filters a proposed set of citations to only those accepted, keeping the accepted ones in the order they were proposed
  proves: acceptedCitations filters a mixed set of citations, some refused for concept, some for field, some accepted, keeping only the accepted ones, in the order they were proposed
  fails_when: acceptedCitations includes a refused citation, drops an accepted one, or reorders the accepted citations relative to their proposed order.
not_applicable:
- edge_case: two evidence entries sharing one concept
  why: citesADeclaredField's find takes the first match, but no criterion, node or inference states evidence carries at most one entry per concept, that guarantee (deduplication of a case's collection plan) belongs to evidence-collection-stage, already proven by evidence-collection-stage.spec.ts; asserting a specific tie-break here would pin an implementation detail no stated behavior claims.
- edge_case: a dependency that is unavailable, slow, or answers out of order
  why: this module is pure and synchronous, imports no port and makes no call of any kind, so there is no dependency to fail or delay.
- edge_case: two operations against one subject at once
  why: isCitationValid and acceptedCitations hold no state between calls and mutate nothing they are given; concurrent calls cannot interfere with each other by construction.
- edge_case: an operation against state that forbids it
  why: there is no persisted state this check reads or writes; every input is supplied fresh by the caller on each call.
- edge_case: an empty collects array, or a hypothesis's evidence array being empty
  why: both are already exercised structurally by the no-matching-evidence-entry test and by criterion 1's foreign-concept test (collects containing only the one concept that is not cited); a bare empty-collects variant would restate the same AND-logic path without adding a distinct failure mode.
untested:
- capabilityOutputSchemaKey's own join format (the literal '::'-joined string it returns) is exercised only indirectly, through fixtures that call it to build outputSchemas keys the same way production code would, no test asserts its return value directly, since no criterion names the key's own literal shape.
---

## What it is

Unit tests proving the citation-validation module's three criteria plus its defensive, never-throwing paths and batch filtering behavior.

## Notes

None.
