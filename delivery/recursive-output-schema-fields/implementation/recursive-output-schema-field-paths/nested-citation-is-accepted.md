---
target: backend
title: Nested-citation acceptance already holds against the evidence snapshot
summary: Investigation confirms citation-validation.ts's existing string-equality membership check accepts
  and refuses path-shaped field names correctly with no source change.
task: sha256:38d9e0368cb817232bf85a2be051f23c4755f52c65504a34f3c1af2e729d097d
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/recursive-output-schema-field-paths-nested-citation-is-accepted-build
files:
- path: src/investigation/citation-validation.ts
  effect: Not modified. citesADeclaredField's membership check (citedEvidence.fields.some(field => field.name
    === citation.field)) treats field.name as an opaque string with no path-shape-specific parsing, so
    it already accepts a citation naming a path-shaped field (e.g. installations[].state) when that exact
    string is among the cited evidence item's own snapshotted FieldSemantics.name values, and refuses
    it otherwise. citesACollectedConcept gates on hypothesis.collects independently of field shape. declaredFieldsOf
    remains untouched, used only by the HTTP observation adapter.
- path: src/investigation/judgment-stage.ts
  effect: Not modified. citationsAreAcceptable/isStructurallyValid route every non-no-data outcome's citations
    through acceptedCitations against the Evidence array already held in memory, never re-invoking fieldSemanticsOf
    or reading the capability registry at judgment time; a no-data evaluation's citations are synthesized
    directly and never pass through isCitationValid.
criteria:
- criterion: A citation naming concept tech-profile and field installations[].state, where that item snapshot
    carries installations[].state, is accepted.
  met: true
  how: citesADeclaredField compares citation.field to each FieldSemantics.name via strict string equality;
    since field-semantics.ts already emits installations[].state verbatim at collection time, and citesACollectedConcept
    passes once tech-profile is in the collects, isCitationValid returns true with no change to this file.
- criterion: A citation naming a field no cited evidence item snapshotted is refused, whatever shape that
    field name has.
  met: true
  how: The membership test returns false whenever no snapshotted name matches the cited string exactly;
    it performs no splitting or path-aware comparison, so an unmatched dotted/bracketed name is refused
    by the same mechanism that already refused an unmatched flat name.
- criterion: A citation naming a concept outside its hypothesis's collects is refused even where the field
    it names is path-shaped.
  met: true
  how: isCitationValid ANDs citesACollectedConcept with citesADeclaredField; citesACollectedConcept never
    inspects citation.field, so it refuses a foreign concept regardless of the field string shape.
- criterion: Acceptance is decided against the cited item own snapshotted field names, with no read of
    the capability registry at judgment time.
  met: true
  how: citesADeclaredField reads only context.evidence, the Evidence[] passed into isCitationValid/acceptedCitations;
    it never calls declaredFieldsOf or touches capability-registry state.
- criterion: A capability re-registered with a different output schema between collection and judgment
    does not change which field names a citation of the already-collected item may carry.
  met: true
  how: The Evidence instances judgment-stage.ts passes to isCitationValid already carry a snapshotted
    fields array produced once at collection time; judgment never re-invokes fieldSemanticsOf or re-reads
    the capability registry for an already-collected item.
nodes:
- node: domain/investigation/citation
  encoded_at:
  - src/investigation/citation.ts
  - src/investigation/citation-validation.ts
  how: Citation's concept/field shape is unchanged; citesADeclaredField is exactly the machine-checkable
    membership test the node's description names, and it already operates correctly whatever shape field
    carries.
- node: domain/investigation/evidence
  encoded_at:
  - src/investigation/evidence.ts
  - src/investigation/field-semantics.ts
  - src/investigation/citation-validation.ts
  how: Evidence.fields is the snapshot citesADeclaredField reads; field-semantics.ts already populates
    it with path-shaped names at collection time, and this task's code reads that snapshot as-is, unmodified.
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  encoded_at:
  - src/investigation/citation-validation.ts
  how: citesADeclaredField is this invariant's machine check; it already holds a citation to its own cited
    evidence item's own snapshotted names via string equality, with no dependence on whether that name
    is flat or path-shaped.
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  encoded_at:
  - src/investigation/citation-validation.ts
  how: Only the first clause is in scope here; citesACollectedConcept enforces exactly that clause, unconditionally
    on field shape. The clauses on no-data citation sourcing and refusal/retry scoping are unreached and
    left untouched.
- node: rules/investigation/judgment-reads-the-evidence-snapshot
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/judgment-stage.ts
  how: citesADeclaredField reads only the Evidence array already in memory, itself the snapshot captured
    at collection; judgment-stage.ts never re-reads the capability registry or the glossary when validating
    a citation.
- node: scenarios/investigation/a-citation-names-a-nested-output-schema-field
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/field-semantics.ts
  how: The scenario's given/when/then is exactly criterion 1; the existing string-equality check in citesADeclaredField
    accepts the cited installations[].state field once field-semantics.ts snapshots that path into the
    item's fields.
inferences:
- inferred: No modification to citation-validation.ts or judgment-stage.ts is needed to satisfy this task
    criteria.
  from: Reading citesADeclaredField's field.name === citation.field membership check, which treats both
    sides as opaque strings with no path-aware splitting or reconstruction, combined with field-semantics.ts
    already emitting path-shaped strings directly into FieldSemantics.name.
deferred:
- what: Whether citesADeclaredField membership check correctly handles a citation with field absent (the
    no-data-verdict case).
  why: The task's own Notes mark this UNDERDETERMINED and state no criterion here reaches it; a no-data
    evaluation's citations are synthesized directly and never pass through isCitationValid/acceptedCitations
    in the current call graph.
---

## What it is

Verification that citation acceptance already holds correctly for a path-shaped field name -- the membership check compares opaque strings and never needed to change.

## Notes

No file was modified for this task; the build run below is captured to confirm the unchanged tree still builds and passes.
