---
target: backend
title: Nested-citation acceptance is pinned by a path-shaped-field test
summary: Adds the missing path-shaped-field representatives to citation-validation.spec.ts, proving criteria
  1-3 hold for a nested field name and demonstrating the nested-citation scenario, while leaving the no-data-citation
  and cross-file snapshot facts recorded as unproven.
implementation: sha256:4eabbd49e86a07081716f52f4a1b549eb95fbd94cfb16c2d6849125d43ba0d80
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/recursive-output-schema-field-paths-nested-citation-is-accepted-suite
tests:
- file: src/__tests__/unit/investigation/citation-validation.spec.ts
  name: accepts a citation naming concept tech-profile and field installations[].state, where that item
    snapshot carries installations[].state, exactly as the acceptance scenario states it
  proves: Criterion 1 -- a citation naming concept tech-profile and field installations[].state, where
    that item snapshot carries installations[].state, is accepted.
  fails_when: citesADeclaredField ever refuses this citation -- e.g. if the membership check stopped comparing
    field.name to citation.field by exact string equality and instead parsed or truncated a path-shaped
    name before comparing it.
  demonstrates: scenarios/investigation/a-citation-names-a-nested-output-schema-field
- file: src/__tests__/unit/investigation/citation-validation.spec.ts
  name: refuses a citation naming a path-shaped field, installations[].partition, that its own cited evidence
    item's snapshot did not carry
  proves: Criterion 2 -- a citation naming a field no cited evidence item snapshotted is refused, whatever
    shape that field name has (path-shaped representative).
  fails_when: citesADeclaredField accepts a path-shaped field name absent from the cited item's own fields.
- file: src/__tests__/unit/investigation/citation-validation.spec.ts
  name: refuses a citation naming a concept outside the hypothesis's collects even where the field it
    names, installations[].state, is path-shaped and matches that foreign evidence item's own snapshotted
    fields
  proves: Criterion 3 -- a citation naming a concept outside its hypothesis's collects is refused even
    where the field it names is path-shaped.
  fails_when: isCitationValid accepts this citation -- e.g. if citesACollectedConcept were skipped whenever
    citesADeclaredField already found a matching field on some other item snapshot.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: accepts a citation naming a field the evidence item's own snapshot declared at collection, even
    though a capability now re-registered at that same name and version would declare a different set
    of fields entirely
  proves: Criterion 4 -- acceptance is decided against the cited item's own snapshotted field names, with
    no read of the capability registry at judgment time.
  fails_when: judgeHypotheses ever refuses this citation because a live-resolved schema for the re-registered
    capability no longer lists field-collected, instead of relying solely on the evidence item's own collection-time
    snapshot.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: refuses a citation naming a field only a capability re-registered after collection would declare
  proves: Criterion 5 -- a capability re-registered with a different output schema between collection
    and judgment does not change which field names a citation of the already-collected item may carry.
  fails_when: judgeHypotheses accepts this citation because it re-resolved the capability's current (re-registered)
    output schema instead of the evidence item's own collection-time snapshot.
not_applicable:
- edge_case: Evidence array carrying more than one item for the same cited concept (a duplicate collection
    for one concept)
  why: One-evidence-per-collected-concept is a separate rule this task does not implement; this task takes
    at-most-one-item-per-concept as given.
- edge_case: Concurrent or parallel citation-validation calls
  why: isCitationValid, citesACollectedConcept and citesADeclaredField are pure, synchronous functions
    over only their own arguments, with no shared mutable state.
- edge_case: A path-shaped field name of greater nesting depth or different bracket/dot composition than
    the one criterion 1 names
  why: citesADeclaredField's exact-string membership check reads a name as one opaque string regardless
    of how many segments or what characters it carries; depth is a dimension the check never inspects.
untested:
- domain/investigation/citation -- its Description states field is present for a confirmed/refuted verdict
  and absent for a no-data one; the tests above decide only the field-present, path-shaped branch. The
  field-absent/no-data branch is not decided by any test here.
- domain/investigation/evidence -- a value-object whose attributes are snapshotted and read across multiple
  files; this task's tests exercise only fields, so no test here decides the node's fact whole -- the
  remaining attributes are decided, if at all, by tests belonging to other tasks.
- 'rules/investigation/a-cited-field-exists-in-the-capability-output-schema -- only its first clause is
  decided here. Its second clause (a citation grounding a no-data verdict carries no field) is the task''s
  own first UNDERDETERMINED note: a no-data evaluation''s citations are synthesized directly and never
  pass through isCitationValid/citesADeclaredField in the current call graph, so the clause is upheld
  by routing rather than by this check, and pinning citesADeclaredField itself to a fieldless case would
  bind one specific way of upholding it among others equally valid.'
- rules/investigation/a-citation-stays-within-the-hypothesis-collects -- only its first clause is decided
  here, via criterion 3's test and the pre-existing foreign-concept test. Its remaining clauses (no-data
  citation sourcing, refusal-and-retry scoped to an evaluator-returned outcome) reach no criterion of
  this task and are decided by no test here; this is the task's own second UNDERDETERMINED note.
- rules/investigation/judgment-reads-the-evidence-snapshot -- its fact spans concept, field semantics,
  capability payload notes, observed_at and ttl together with the negative claim that judgment never re-reads
  the glossary or the capability registry; each attribute is evidenced by a separate pre-existing test,
  but no single test decides the whole fact at once.
---

## What it is

Tests proving citation acceptance already holds for a path-shaped field name -- three new representatives in citation-validation.spec.ts, plus two pre-existing judgment-stage.spec.ts tests already covering the snapshot-over-live-registry guarantee.

## Notes

No production file was modified for this task; only citation-validation.spec.ts gained new tests. The two re-registration tests cited for criteria 4-5 already existed in judgment-stage.spec.ts before this task and were not changed.
