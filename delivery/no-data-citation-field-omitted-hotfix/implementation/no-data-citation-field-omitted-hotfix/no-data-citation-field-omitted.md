---
title: A no-data citation omits field entirely, and now persists and reads back without one
summary: judgment-stage.ts's noDataEvaluation and anthropic-hypothesis-evaluator.adapter.ts's noDataOutcome
  construct each no-data citation with concept alone and no field key, the two response DTOs that shared
  Citation's type were adjusted to keep the strict compiler satisfied, and investigation_evaluation_citations
  was restructured with a surrogate primary key so that a citation with no field is a legal row instead
  of a not-null/primary-key violation RelationalInvestigationStore.write would otherwise raise the moment
  a no-data evaluation was persisted.
task: sha256:83154a73bd30eea6ece18d6df51e9157b5b18f227a7320eaa61196da8f5948c6
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/no-data-citation-field-omitted-hotfix-no-data-citation-field-omitted-build-2
files:
- path: src/investigation/citation.ts
  effect: 'Citation''s field attribute is optional (field?: string) instead of a required string, matching
    the domain node''s own attribute list -- concept required, field not -- so a citation naming only
    a concept is a value of this type rather than a value that has to fake a field to compile.'
- path: src/investigation/judgment-stage.ts
  effect: 'noDataEvaluation maps each non-ok evidence item to { concept: item.concept }, with no field
    key at all, instead of { concept: item.concept, field: '''' }.'
- path: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  effect: 'noDataOutcome maps each non-ok evidence item to { concept: item.concept }, with no field key
    at all, instead of { concept: item.concept, field: '''' }.'
- path: src/http/dto/simulate-case.dto.ts
  effect: the shared citationSchema's field is z.string().min(1).optional() instead of required, so SimulateCaseResponseDto's
    evaluations -- built directly from the domain Evaluation/Citation shape -- type-check for every verdict,
    including a no-data citation that carries no field key.
- path: src/http/dto/simulate-hypothesis.dto.ts
  effect: the same relaxation as simulate-case.dto.ts's citationSchema, for SimulateHypothesisResponseDto's
    evaluation.
- path: migrations/0016-citation-field-optional.sql
  effect: a new versioned migration that restructures investigation_evaluation_citations so a NULL field
    is a legal row -- drops the old composite PRIMARY KEY (investigation_id, hypothesis, concept, field),
    drops field's NOT NULL, adds a surrogate id BIGINT GENERATED ALWAYS AS IDENTITY column as the table's
    new PRIMARY KEY, and adds a UNIQUE index investigation_evaluation_citations_natural_key over (investigation_id,
    hypothesis, concept, field) preserving the old PK's uniqueness guarantee for a citation that does
    carry a field, while PostgreSQL's own NULLS-DISTINCT behavior in a unique index lets a no-field citation
    never collide with another no-field citation on identity alone.
- path: src/persistence/relational-investigation-store.repository.ts
  effect: 'ICitationRow.field is now string | null, matching the column''s new nullable type. citationStatement
    now passes citation.field ?? null explicitly as the fourth parameter, rather than relying on the driver''s
    own null/undefined equivalence. citationsByHypothesis builds each Citation through a new citationOf
    helper that includes field only when the row''s own value is not null, instead of writing field: row.field
    unconditionally -- so a no-data citation stored with a NULL field reads back with no field key at
    all, the same shape noDataEvaluation and noDataOutcome construct it in.'
criteria:
- criterion: judgment-stage.ts's noDataEvaluation constructs each citation for the non-ok evidence it
    cites with concept present and field absent — the citation object carries no field key at all, never
    an empty string.
  met: true
  how: 'the object literal noDataEvaluation builds is { concept: item.concept } -- no field key is written
    into it at all, so ''field'' in citation is false, rather than field: ''''.'
- criterion: 'anthropic-hypothesis-evaluator.adapter.ts''s noDataOutcome constructs each citation the
    same way: concept present, field absent.'
  met: true
  how: 'noDataOutcome''s mapping is { concept: item.concept }, identical in shape to judgment-stage.ts''s
    noDataEvaluation.'
- criterion: A confirmed or refuted evaluation's citations are unaffected by this fix and continue to
    carry both concept and field exactly as before.
  met: true
  how: 'every construction site for a confirmed or refuted citation is untouched: anthropic-hypothesis-evaluator.adapter.ts''s
    isCitation guard still requires typeof value.field === ''string'' before a parsed citation is accepted,
    outcomeFromModelText/parseJudgment still only accept citations that guard passed, and judgment-stage.ts''s
    asEvaluation still forwards outcome.citations unchanged for the confirmed and refuted branches. citation-validation.ts,
    evaluation.ts and hypothesis-evaluator.port.ts were not modified. On the persistence side, citationStatement''s
    citation.field ?? null passes a confirmed/refuted citation''s populated field through unchanged (??
    only substitutes for null or undefined), citationOf still writes field: row.field whenever the stored
    value is not null, and the new unique index over (investigation_id, hypothesis, concept, field) still
    holds every stored citation''s own uniqueness exactly where the dropped composite PRIMARY KEY held
    it.'
- criterion: A no-data citation with no field persists successfully, and reads back with no field.
  met: true
  how: 'migrations/0016-citation-field-optional.sql drops investigation_evaluation_citations'' old composite
    PRIMARY KEY (which forced field to be NOT NULL as a PK member) and its NOT NULL constraint, and replaces
    the PRIMARY KEY with a surrogate identity column, so RelationalInvestigationStore.write''s citationStatement
    can insert a no-data citation''s undefined field (passed as citation.field ?? null) as a genuine SQL
    NULL instead of hitting a 23502 not-null/primary-key violation. On read, citationsByHypothesis'' citationOf
    helper reconstructs { concept: row.concept } with no field key whenever the stored field is NULL,
    so the round trip reproduces exactly the shape noDataEvaluation and noDataOutcome constructed it in.'
nodes:
- node: domain/investigation/citation
  encoded_at:
  - src/investigation/citation.ts
  - src/investigation/judgment-stage.ts
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - migrations/0016-citation-field-optional.sql
  - src/persistence/relational-investigation-store.repository.ts
  how: 'citation.ts''s Citation type declares field as field?: string, matching the node''s own attribute
    list where concept is required and field is not. judgment-stage.ts and anthropic-hypothesis-evaluator.adapter.ts
    produce a value of that type whose field key is absent for a no-data verdict, matching the node''s
    description: field is present when grounding a confirmed or refuted verdict and absent for a no-data
    verdict, since that evidence snapshotted no fields. The migration and the repository extend that same
    fact to storage: the node''s own optional field is now a fact the schema itself can hold (a nullable
    column, no longer a NOT NULL primary-key member), and the repository''s read path reconstructs a stored
    no-field citation as a value with no field key, rather than one holding a null or an empty-string
    stand-in.'
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  encoded_at:
  - src/investigation/judgment-stage.ts
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  how: 'the rule''s own clause -- ''a citation grounding a no-data verdict carries no field, since the
    evidence it cites snapshotted none'' -- is encoded by the citation object''s own shape (no field key)
    rather than by a placeholder empty string that happened to read as absent. The rule''s first clause,
    that a present field must exist among its own cited evidence item''s snapshotted field names, is unaffected:
    citation-validation.ts''s citesADeclaredField, which checks that clause, was not touched, and criterion
    3 above is how this task answers for it -- a decided evaluation''s citation still carries a field
    for that clause to check. The persistence fix changes no vocabulary this rule constrains; it only
    makes the shape the rule already requires storable without a driver-level crash.'
inferences:
- inferred: the response DTOs' shared citationSchema in simulate-case.dto.ts and simulate-hypothesis.dto.ts
    needed field to become optional for every verdict branch, rather than splitting a separate schema
    for the inconclusive branch, so that SimulateCaseResponseDto/SimulateHypothesisResponseDto -- inferred
    by z.infer directly over a schema shaped like the domain Evaluation/Citation types -- stay assignable
    from the controllers' return { ..., evaluations, ... }, without narrowing evaluation.ts's or hypothesis-evaluator.port.ts's
    confirmed/refuted branches to a stricter citation type that would have had to ripple into relational-investigation-store.repository.ts's
    own citation typing to keep compiling.
  from: STK-01/TYP-01 (the strict compiler is a tool-decided rule that binds regardless) and DTO-02 (a
    DTO schema is a Zod object plus the type inferred from it), together with the fact that neither response
    schema is ever run against an outgoing response at runtime -- only used for the controller's return
    type and exercised by simulate-case.dto.spec.ts against a fixture that carries no citations at all
    -- so relaxing field to optional there changes no wire behavior for any caller.
- inferred: the removed composite PRIMARY KEY's uniqueness guarantee should be preserved for a citation
    that does carry a field, via a UNIQUE index over (investigation_id, hypothesis, concept, field) rather
    than dropped outright, and that letting two no-field citations for the same investigation, hypothesis
    and concept coexist under that index (PostgreSQL treats each NULL as distinct from every other NULL,
    including itself) is the correct reading rather than a gap to close.
  from: neither domain/investigation/citation nor the field-existence rule states a uniqueness requirement
    explicitly, but the schema this task inherited already enforced one structurally via the composite
    PRIMARY KEY, and evidence's own PRIMARY KEY (investigation_id, concept) already guarantees noDataEvaluation/noDataOutcome
    never construct two citations sharing one concept for one evaluation, so the coexistence the NULLS-DISTINCT
    unique index permits is never actually reachable through the existing production write path -- it
    only widens what the schema alone would refuse, not what the application ever sends it.
- inferred: the new surrogate primary key column is a BIGINT GENERATED ALWAYS AS IDENTITY column rather
    than a SERIAL/BIGSERIAL one.
  from: no existing table in this schema's migrations declares a surrogate key at all for this task to
    follow as a convention, and IDENTITY is the SQL-standard, currently-recommended PostgreSQL mechanism
    for exactly this shape -- a plain auto-incrementing key with no meaning of its own.
- inferred: migrations/0016-citation-field-optional.sql is the correct next filename, and PRH-04 (a migration
    that destroys or alters data ships with a reverse migration beside it) does not reach it, so none
    was written.
  from: '0015-durations-writing-nullable.sql is the highest existing sequential number in migrations/,
    making 0016 the mechanical continuation; and PRH-04''s own applies_to names suffix .ts under src/migrations,
    while every migration in this project, including this one, is .sql -- no migration file in this tree
    is ever within that rule''s stated scope, and this migration alters no stored value in any case: every
    existing row''s investigation_id, hypothesis, concept and field are left exactly as they were.'
preserved:
- 'A confirmed or refuted citation still carries both concept and field: anthropic-hypothesis-evaluator.adapter.ts''s
  isCitation guard, parseJudgment and outcomeFromModelText are unchanged.'
- citation-validation.ts's citesADeclaredField, which checks a present field against its cited evidence
  item's own snapshotted field names, is unchanged.
- 'The persistence round trip for a confirmed or refuted citation still writes and reads a populated field:
  citationStatement''s citation.field ?? null passes a defined field through unchanged, and citationOf
  writes field whenever the stored value is not null.'
- Every other table's schema, and every other read or write path in relational-investigation-store.repository.ts,
  is untouched -- only investigation_evaluation_citations' own primary key shape, and the two functions
  that write and read that one table, changed.
- The foreign key investigation_evaluation_citations_evaluation_fkey, over (investigation_id, hypothesis)
  referencing investigation_evaluations, is independent of the column set the old composite primary key
  spanned and is left exactly as migrations/0005-investigation.sql declared it.
---

## What it is

The corrective fix omitting field entirely on a no-data citation, in judgment-stage.ts's
noDataEvaluation and anthropic-hypothesis-evaluator.adapter.ts's noDataOutcome, matching the
specification's own decision that field is absent for this case -- scope widened, by explicit human
authorization, to also restructure investigation_evaluation_citations' own primary key so a no-field
citation persists and reads back correctly instead of crashing the write.

## Notes

Scope widened by explicit human authorization during delivery: the first implementation pass
disclosed, under `deferred`, that investigation_evaluation_citations.field is NOT NULL and part of
that table's composite primary key, so a citation with no field crashed
RelationalInvestigationStore.write with a real not-null/primary-key violation, reachable through the
ordinary diagnose flow whenever collection degrades to no-data. The fourth criterion, and the
migration and repository fix that answer it, were added to this same task rather than deferred to a
separate corrective task, per the human's own choice among the options presented.
