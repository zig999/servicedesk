---
implementation: sha256:68e018436f36697d07f91f4ffe284b26d4f210b5f3b534913b52b1cc8a09f527
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/no-data-citation-field-omitted-hotfix-no-data-citation-field-omitted-suite-2
title: A no-data citation omits field, and now persists and reads back without one
summary: Proves all four criteria of no-data-citation-field-omitted -- the two construction sites omit
  field entirely for a no-data citation, a confirmed/refuted citation keeps carrying both concept and
  field unaffected, and a no-data citation now writes and reads back through the real store and the restructured
  investigation_evaluation_citations schema without the not-null/primary-key crash that used to be the
  terminal behavior -- correcting the test that had pinned that crash to the fix that replaced it.
tests:
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: 'omits the field key entirely from each citation a no-data evaluation constructs for its non-ok
    evidence — never field: '''' — so ''field'' in citation is false for every one of them'
  proves: judgment-stage.ts's noDataEvaluation constructs each citation for the non-ok evidence it cites
    with concept present and field absent — the citation object carries no field key at all, never an
    empty string.
  fails_when: noDataEvaluation writes a field key at all onto a no-data citation, whether as '' or any
    other value, instead of omitting the key
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: 'omits the field key entirely from each citation a no-data outcome constructs for its non-ok evidence
    — never field: '''' — so ''field'' in citation is false for every one of them'
  proves: 'anthropic-hypothesis-evaluator.adapter.ts''s noDataOutcome constructs each citation the same
    way: concept present, field absent.'
  fails_when: noDataOutcome writes a field key at all onto a no-data citation instead of omitting it
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: leaves a confirmed evaluation's citation carrying both concept and field exactly as the evaluator
    answered it — 'field' in citation stays true, unaffected by the no-data citation shape now omitting
    it
  proves: A confirmed or refuted evaluation's citations are unaffected by this fix and continue to carry
    both concept and field exactly as before.
  fails_when: a confirmed evaluation's citation loses its field key, or its value changes, once noDataEvaluation's
    own shape changed
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: leaves a refuted evaluation's citation carrying both concept and field exactly as the evaluator
    answered it — 'field' in citation stays true, unaffected by the no-data citation shape now omitting
    it
  proves: A refuted evaluation's citation stays unaffected, the other half of criterion 3's own wording.
  fails_when: a refuted evaluation's citation loses its field key or its value changes
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: leaves a confirmed answer's citation carrying both concept and field exactly as the model answered
    it — 'field' in citation stays true, unaffected by the no-data outcome shape now omitting it
  proves: the adapter's confirmed-citation shape is unaffected by noDataOutcome's change, the adapter
    half of criterion 3
  fails_when: a confirmed outcome's citation loses its field key or its value changes
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: leaves a refuted answer's citation carrying both concept and field exactly as the model answered
    it — 'field' in citation stays true, unaffected by the no-data outcome shape now omitting it
  proves: the adapter's refuted-citation shape is unaffected, the adapter's other half of criterion 3
  fails_when: a refuted outcome's citation loses its field key or its value changes
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: validates a confirmed evaluation's citation that carries no field key at all, since the shared
    citation schema now leaves field optional for every verdict branch, not narrowed to the inconclusive
    branch alone
  proves: the inference that citationSchema's field had to become optional for every verdict branch rather
    than a schema split narrowed to the no-data branch, so SimulateCaseResponseDto keeps type-checking
    for a no-data citation
  fails_when: simulateCaseResponseSchema rejects a confirmed citation that carries no field, meaning the
    relaxation was narrowed to the wrong branch or reverted
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: refuses a citation whose field is the empty string, on every verdict branch, even though field
    is now optional
  proves: the DTO relaxation only dropped the required-ness of field, not the field-min-length-1 rule
    that keeps an empty string out -- an empty-string sentinel is still refused after the fix, on every
    verdict
  fails_when: the schema starts accepting field '' now that field is optional
- file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  name: validates a confirmed evaluation's citation that carries no field key at all, since the shared
    citation schema now leaves field optional for every verdict branch, not narrowed to the inconclusive
    branch alone
  proves: the same DTO inference holds for SimulateHypothesisResponseDto's own evaluation
  fails_when: simulateHypothesisResponseSchema rejects a confirmed citation that carries no field
- file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  name: refuses a citation whose field is the empty string, even though field is now optional
  proves: the empty-string sentinel stays refused for SimulateHypothesisResponseDto too
  fails_when: the schema starts accepting field '' now that field is optional
- file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  name: reads back a whole investigation exactly as written — root, subject attribute-values, evidence
    with its capability pin, evaluations with their citations, assessment, cost and durations — through
    one transaction
  proves: A confirmed or refuted evaluation's citations are unaffected by this fix and continue to carry
    both concept and field exactly as before, at the persistence layer and against the restructured schema
    -- its fixture's own evaluation is 'confirmed' with a citation carrying both concept and field, written
    and read back through RelationalInvestigationStore against the real database with migration 0016 already
    applied.
  fails_when: citationStatement or citationOf stop passing a populated field through unchanged, or the
    migration's surrogate primary key or unique index break an ordinary confirmed citation's round trip
- file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  name: writes a no-data evaluation's citation with no field at all — the exact shape judgment-stage.ts's
    noDataEvaluation and the adapter's noDataOutcome now construct — now that investigation_evaluation_citations'
    field column is nullable and no longer part of its primary key, and reads it back with concept present
    and no field key at all
  proves: A no-data citation with no field persists successfully, and reads back with no field.
  fails_when: the write rejects again (a not-null or primary-key violation resurfacing), or the write
    succeeds but the read-back citation carries a field key at all -- a real null, an empty string, or
    any other stand-in -- instead of omitting the key entirely
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: applies every migration script, in the order their file names number them, to a fresh empty database
    and produces every relation the model needs and none it does not
  proves: migration 0016 applies cleanly, in file-name order, alongside every other migration, and investigation_evaluation_citations
    remains exactly the one relation the model needs at that name
  fails_when: 0016 fails to apply, is skipped by the file-name ordering, or leaves a table this list does
    not name
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: holds every domain column NOT NULL except exactly the eight columns the model declares optional
  proves: investigation_evaluation_citations.field is now nullable, and it is the only column 0016 changed
    the nullability of -- the corrected form of the test that, before 0016, asserted exactly seven optional
    columns; corrected to eight rather than weakened, since the eighth (citations.field) is an addition
    to what may be absent, not a relaxation of an existing one
  fails_when: citations.field is not nullable, or any other column's nullability shifted as a side effect
    of 0016
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: refuses a second citation row sharing one investigation, hypothesis, concept and field already
    stored, through the unique index investigation_evaluation_citations_natural_key that stands in for
    the composite primary key the surrogate identity column replaced
  proves: the inference that the removed composite PRIMARY KEY's uniqueness guarantee is preserved via
    a UNIQUE index rather than dropped outright
  fails_when: the migration's unique index is missing, misdeclared, or does not actually enforce uniqueness
    over (investigation_id, hypothesis, concept, field), letting an exact duplicate citation row through
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: accepts two citation rows sharing one investigation, hypothesis and concept when both carry no
    field, since the unique index treats each stored NULL as distinct from every other NULL
  proves: the inference that two no-field citations for the same investigation, hypothesis and concept
    are meant to coexist under the NULLS-DISTINCT unique index rather than being a gap to close
  fails_when: the second no-field citation is refused as a duplicate, meaning the index was declared NULLS
    NOT DISTINCT or otherwise treats two NULLs as colliding
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: declares investigation_evaluation_citations' own primary key column, id, as a GENERATED ALWAYS
    AS IDENTITY surrogate rather than the natural key the migration retired
  proves: the inference that the new surrogate primary key column is a BIGINT GENERATED ALWAYS AS IDENTITY
    column rather than a SERIAL/BIGSERIAL one
  fails_when: id is declared some other way -- a plain SERIAL/BIGSERIAL default, a GENERATED BY DEFAULT
    identity, or a non-identity column -- so information_schema no longer reports is_identity 'YES' and
    identity_generation 'ALWAYS'
not_applicable:
- edge_case: two concurrent writes each inserting a no-data citation for the same investigation, hypothesis
    and concept
  why: evidence's own PRIMARY KEY (investigation_id, concept) already guarantees noDataEvaluation/noDataOutcome
    never construct two citations sharing one concept for one evaluation, so this coexistence is only
    reachable by inserting directly against the table -- which the NULLS-DISTINCT test above already does,
    without needing two concurrent application writers to reach it
- edge_case: a no-data citation's field key set to an explicit SQL NULL by some path other than noDataEvaluation/noDataOutcome
    (e.g. a hand-written INSERT)
  why: citationStatement's citation.field ?? null is the only write path from the domain into the column,
    and it is already exercised by the corrected round-trip test; a second test writing NULL by a different
    route would prove the column's own nullability again, which the updated schema-migrations.spec.ts
    test already covers
untested:
- the exact SQL constraint identity of investigation_evaluation_citations' new primary key -- that the
  id column's PRIMARY KEY constraint is specifically named investigation_evaluation_citations_pkey, as
  the migration's own DROP/ADD CONSTRAINT names it -- is not directly queried through information_schema.table_constraints
  or pg_constraint; the tests here confirm the column's identity-generation strategy and that the natural-key
  uniqueness still holds, but not the constraint's own name or that it is literally declared PRIMARY KEY
  rather than an equivalent NOT NULL UNIQUE pairing
- the actual INSERT-time refusal a GENERATED ALWAYS AS IDENTITY column produces when a caller supplies
  an explicit id without OVERRIDING SYSTEM VALUE is not independently exercised -- the identity_generation
  metadata test establishes ALWAYS rather than BY DEFAULT, and that refusal follows from documented PostgreSQL
  semantics, but no test here triggers it directly
- the inference that migrations/0016-citation-field-optional.sql is the correct next filename and that
  PRH-04 (a reverse migration requirement) does not reach it is a naming/scope judgment about the project's
  own standard, not a runtime behavior; no test could fail over a filename choice or over which rule's
  applies_to a file falls under, so this is left unproven by design rather than by oversight
---

## What it is

The proof for the no-data citation field-omission hotfix, extended to its full scope: a no-data
citation omits field entirely, a confirmed/refuted citation is unaffected, and the restructured
investigation_evaluation_citations schema lets a no-data citation persist and read back correctly
instead of crashing the write.

## Notes

The pre-existing integration test that had asserted the write rejects with a not-null/primary-key
violation (correctly documenting the crash before the migration fix landed) was corrected to assert
the write now succeeds and the citation reads back with no field key -- the same discipline already
used elsewhere in this corrective batch for a test that pinned old-and-now-wrong behavior. The
schema-migrations.spec.ts nullable-columns totality test was corrected from seven to eight columns,
and three new tests cover the migration's unique index, its NULLS-DISTINCT behavior, and the
surrogate identity column.

One suite run found one failure, in diagnose-server.factory.spec.ts (a real-clock timing assertion
from the earlier durations-total-real-elapsed-hotfix task, unrelated to citations) -- "expected 130
to be greater than 130", a real-wall-clock tie between durations_total and the sum of the three
stage durations. Diagnosed and confirmed as a timing coincidence in a real-clock (not fake-timer)
integration test, not a defect this task's own change introduced. A second suite run passed clean.
