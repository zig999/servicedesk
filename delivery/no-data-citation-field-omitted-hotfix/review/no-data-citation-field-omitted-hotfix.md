---
title: no-data-citation-field-omitted-hotfix, review
summary: What four passes found over the source and tests omitting field from a no-data citation and restructuring
  investigation_evaluation_citations' primary key so it persists.
reviewed:
- src/investigation/citation.ts
- src/investigation/judgment-stage.ts
- src/investigation/anthropic-hypothesis-evaluator.adapter.ts
- src/http/dto/simulate-case.dto.ts
- src/http/dto/simulate-hypothesis.dto.ts
- migrations/0016-citation-field-optional.sql
- src/persistence/relational-investigation-store.repository.ts
- src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
- src/__tests__/integration/persistence/schema-migrations.spec.ts
- src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
- src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
- src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
- src/__tests__/unit/investigation/judgment-stage.spec.ts
tasks:
- task/no-data-citation-field-omitted-hotfix/no-data-citation-field-omitted
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
coverage:
- criterion: judgment-stage.ts's noDataEvaluation constructs each citation for the non-ok evidence it
    cites with concept present and field absent — the citation object carries no field key at all, never
    an empty string.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: 'omits the field key entirely from each citation a no-data evaluation constructs for its non-ok
      evidence — never field: '''' — so ''field'' in citation is false for every one of them'
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: records inconclusive no-data citing every non-ok evidence item, and never enters the pool for
      that hypothesis
  why: The dedicated test asserts key absence with 'field' in citation over every citation. Both tests
    exercise the non-ok results denied and timeout only; unavailable, which the evidence-result vocabulary
    also admits, is never submitted as non-ok evidence in this set.
- criterion: 'anthropic-hypothesis-evaluator.adapter.ts''s noDataOutcome constructs each citation the
    same way: concept present, field absent.'
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: 'omits the field key entirely from each citation a no-data outcome constructs for its non-ok
      evidence — never field: '''' — so ''field'' in citation is false for every one of them'
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: answers inconclusive with reason no-data, citing exactly the evidence items whose result is
      not ok
  why: The dedicated test asserts key absence directly. The dedicated omission test drives one non-ok
    item (timeout); the second drives timeout and denied. No test in the set submits an unavailable result
    to the adapter.
- criterion: A confirmed or refuted evaluation's citations are unaffected by this fix and continue to
    carry both concept and field exactly as before.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: leaves a confirmed evaluation's citation carrying both concept and field exactly as the evaluator
      answered it — 'field' in citation stays true, unaffected by the no-data citation shape now omitting
      it
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: leaves a refuted evaluation's citation carrying both concept and field exactly as the evaluator
      answered it — 'field' in citation stays true, unaffected by the no-data citation shape now omitting
      it
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: leaves a confirmed answer's citation carrying both concept and field exactly as the model answered
      it — 'field' in citation stays true, unaffected by the no-data outcome shape now omitting it
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: leaves a refuted answer's citation carrying both concept and field exactly as the model answered
      it — 'field' in citation stays true, unaffected by the no-data outcome shape now omitting it
  why: 'Both verdicts are exercised in both modules with an explicit ''field'' in citation assertion.
    Two facts to route rather than gaps: the DTO specs for both endpoints assert that a confirmed citation
    with no field key validates, a loosening no criterion of this task states and the opposite direction
    from this criterion''s own claim -- see this review''s own standard-conformance finding (STK-08) on
    the runtime consequence.'
- criterion: A no-data citation with no field persists successfully, and reads back with no field.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
    name: writes a no-data evaluation's citation with no field at all — the exact shape judgment-stage.ts's
      noDataEvaluation and the adapter's noDataOutcome now construct — now that investigation_evaluation_citations'
      field column is nullable and no longer part of its primary key, and reads it back with concept present
      and no field key at all
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: holds every domain column NOT NULL except exactly the eight columns the model declares optional
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: accepts two citation rows sharing one investigation, hypothesis and concept when both carry
      no field, since the unique index treats each stored NULL as distinct from every other NULL
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: declares investigation_evaluation_citations' own primary key column, id, as a GENERATED ALWAYS
      AS IDENTITY surrogate rather than the natural key the migration retired
  why: 'The repository test writes and reads through the store and asserts absence with not.toHaveProperty(''field'').
    Two over-assertions to route: the nullable-columns and migration-table-list tests pin totalities across
    the whole schema, each breaking the day a sibling task legitimately adds an optional column or a table.'
findings:
- pass: standard
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  where: lines 208-214, isCitation and isCitationArray, the guards parseJudgment applies to the provider's
    JSON answer at lines 126-130
  cites: STK-08
  evidence: 'function isCitation(value: unknown): value is Citation { return isPlainObject(value) && typeof
    value.concept === ''string'' && typeof value.field === ''string''; }'
  cost: 'The provider''s answer crosses into this process through hand-written guards rather than a schema,
    and this change has already pulled the two declarations apart. Citation now declares field?: string,
    and both simulate DTOs now accept a confirmed citation carrying no field -- while this guard still
    requires one, so a confirmed answer citing a concept without a field is discarded and re-answered
    as judgment-failure.'
  correction: parse the provider's answer with a Zod schema over the same citation shape the DTOs declare,
    so whether field is required is decided in one place and the compiler carries that answer to both
    the response contract and the provider parse.
- pass: standard
  file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  where: lines 24-30, function requireDatabaseUrl
  cites: MNT-03
  evidence: 'function requireDatabaseUrl(): string { const url = process.env.DATABASE_URL; if (!url) {
    throw new Error(''DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.'');
    } return url; }'
  cost: The same seven lines stand character for character in schema-migrations.spec.ts and roughly thirty
    further spec files in this tree. The ones missed when this is changed go on refusing on the old terms.
  correction: declare it once in a helper module under src/__tests__/ and import it into both specs.
- pass: standard
  file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  where: line 260 inside beforeAll, and line 300 inside the first test
  cites: STK-06
  evidence: await client.query(`CREATE SCHEMA "${schemaName}"`); ... await client.query(`DROP SCHEMA IF
    EXISTS "${schemaName}" CASCADE`); ... await client.query(`CREATE SCHEMA "${freshSchema}"`);
  cost: The schemas every assertion in this file runs inside are created and dropped by a code path rather
    than by a versioned file, so nothing outside this module records that they exist or how they are named.
  correction: either move the harness's schema creation into the migration step the rule names, or narrow
    STK-06's applies_to so it does not reach the test subtree, the way STK-10 and the TST rules already
    do.
- pass: standard
  file: src/http/dto/simulate-hypothesis.dto.ts
  where: lines 29-32, citationSchema -- and with it subjectAttributeValueSchema, subjectSchema, caseRefSchema,
    usageSchema, evaluationSchema and evidenceSchema
  cites: MNT-03
  evidence: 'const citationSchema = z.object({ concept: z.string().min(1), field: z.string().min(1).optional()
    });'
  cost: The identical declaration stands in simulate-case.dto.ts, and the six schemas around it are identical
    too. Making field optional had to be typed into two files in this one change; the specs for both already
    call it 'the shared citation schema', which it is not.
  correction: declare the citation, usage, evaluation and evidence schemas once and import them into both
    simulate DTOs.
- pass: standard
  file: src/persistence/relational-investigation-store.repository.ts
  where: lines 164-170, ticketRefForWrite and holdsNoTicketReference, called from identityParams at line
    154
  cites: ARC-04
  evidence: 'function ticketRefForWrite(ticketRef: string | undefined): string | undefined { return holdsNoTicketReference(ticketRef)
    ? undefined : ticketRef; } function holdsNoTicketReference(value: string | undefined): boolean { return
    value === undefined || value === ''''; }'
  cost: Collapsing the empty string to an absent ticket reference is a decision about what a ticket reference
    is, made inside the store. Any other path that builds or answers with an Investigation keeps '' as
    a real reference.
  correction: normalize the empty ticket reference where the Investigation is assembled, and let the repository
    write whatever value it is handed.
- pass: failures
  file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  where: persists real, non-zero cost and durations for the judgment and consolidation calls, now that
    the Anthropic adapters themselves report real usage and elapsed_ms, with durations_total exceeding
    the sum of the three stage figures since it measures the whole pipeline's own real elapsed time
  evidence: 'AssertionError: expected 148 to be greater than 148 -- expect(written?.durations_total).toBeGreaterThan((written?.durations_collection
    ?? 0) + (written?.durations_judgment ?? 0) + (written?.durations_writing ?? 0))'
  cost: a real-wall-clock timing assertion asserts strict inequality nothing in the specification commits
    to; under fast execution the pipeline's own overhead can resolve to 0ms and tie the sum. This is the
    same real-wall-clock timing tie found in several other reviews of this batch; readings of its cause
    disagree across reviews and are recorded as returned, not reconciled. The failure sits in a file outside
    this task's own file set.
  correction: loosen the assertion to the guarantee the base actually states -- durations_total is at
    least the sum of the three stage figures (toBeGreaterThanOrEqual), not necessarily strictly more.
  cause: test
failures_counted: 1
run: run/no-data-citation-field-omitted-hotfix
---

## What it is

The first review of no-data-citation-field-omitted-hotfix: coverage over its four criteria,
specification conformance over the two nodes it implements, standard conformance over the
project's own registry, and diagnosis of the one failure the captured suite run reported.

## Notes

The most significant finding is a real behavioral inconsistency the standard-conformance pass
surfaced (STK-08): this task widened Citation.field to optional and the response DTOs to match,
but anthropic-hypothesis-evaluator.adapter.ts's own runtime guard (isCitation) still requires
field as a string for every verdict, so a genuine confirmed or refuted answer from the provider
that cites a concept without a field is silently discarded and re-answered as judgment-failure --
the exact class of citation this task's own DTO change now says the wire contract accepts. The
one captured failure is the same real-wall-clock durations timing tie found in several other
reviews of this batch, in a file outside this task's own scope.
