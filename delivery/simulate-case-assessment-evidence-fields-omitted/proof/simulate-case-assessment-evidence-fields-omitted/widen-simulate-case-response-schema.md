---
title: Widened simulate-case response schema — assessment call-record and evidence snapshot
summary: Proves assessmentSchema now requires register, usage, elapsed_ms and prompt and evidenceSchema
  now requires fields and concept_description, each typed as stated, while both admit the honest-empty
  evidence readings the specification's Description states, and that a production-shaped value validates
  intact.
implementation: sha256:4f0cdfec0926a87f9a5e9c4b48cd95a84c6088d4c493f6f24dda2d6c3a13b476
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/simulate-case-assessment-evidence-fields-omitted-widen-simulate-case-response-schema-suite
tests:
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: validates a response whose durations carries no writing field at all, matching a run whose own
    consolidation has not yet happened
  proves: The widened assessmentSchema (now requiring register, usage, elapsed_ms, prompt) still accepts
    the pre-existing durations-optional-writing behavior once the shared aValidAssessment() fixture supplies
    the four new fields -- a pre-existing test preserved, its fixture updated so the widening does not
    regress it.
  fails_when: The widened schema rejects a fully-populated, otherwise-valid response, or the durations.writing-optional
    behavior stops holding.
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: validates a confirmed evaluation's citation that carries no field key at all, since the shared
    citation schema now leaves field optional for every verdict branch, not narrowed to the inconclusive
    branch alone
  proves: Pre-existing citation-optionality behavior is unaffected by the widening, now that the shared
    fixture satisfies assessmentSchema's four new required fields.
  fails_when: A confirmed-verdict evaluation whose citation omits field is rejected.
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: refuses a citation whose field is the empty string, on every verdict branch, even though field
    is now optional
  proves: Pre-existing empty-string-citation-field refusal is unaffected by the widening.
  fails_when: An inconclusive-verdict evaluation whose citation.field is '' is accepted.
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: rejects an assessment missing register, now that assessmentSchema requires it
  proves: 'Criterion 1 (register required): an assessment without a register field is refused.'
  fails_when: register is left .optional() (or otherwise not required) on assessmentSchema.
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: rejects an assessment whose register is not one of the consolidation-register enum values
  proves: 'Criterion 1 (register typed as the consolidation-register enum): a register value outside {formal,
    plain} is refused.'
  fails_when: register is typed as a bare z.string() (or any type admitting arbitrary strings) instead
    of the enum.
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: rejects an assessment missing usage, now that assessmentSchema requires it
  proves: 'Criterion 2 (usage required): an assessment without a usage field is refused.'
  fails_when: usage is left .optional() on assessmentSchema.
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: rejects an assessment whose usage carries no output_tokens, since usage keeps the shared usage
    shape
  proves: 'Criterion 2 (usage typed as the usage shape): a usage object missing output_tokens is refused.'
  fails_when: usage is typed loosely (e.g. z.record or a partial shape) rather than requiring both input_tokens
    and output_tokens.
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: rejects an assessment whose usage is not an object, since usage keeps the shared usage shape
  proves: 'Criterion 2 (usage typed as an object): a non-object usage value is refused.'
  fails_when: usage accepts a non-object value.
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: rejects an assessment missing elapsed_ms, now that assessmentSchema requires it
  proves: 'Criterion 3 (elapsed_ms required): an assessment without elapsed_ms is refused.'
  fails_when: elapsed_ms is left .optional() on assessmentSchema.
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: rejects an assessment whose elapsed_ms is not an integer
  proves: 'Criterion 3 (elapsed_ms typed as an integer): a non-integer numeric value (12.5) is refused.'
  fails_when: elapsed_ms is typed z.number() rather than z.int() (or any type admitting fractional values).
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: rejects an assessment missing prompt, now that assessmentSchema requires it
  proves: 'Criterion 4 (prompt required): an assessment without prompt is refused.'
  fails_when: prompt is left .optional() on assessmentSchema.
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: rejects an assessment whose prompt is not a string
  proves: 'Criterion 4 (prompt typed as a string): a non-string prompt (42) is refused.'
  fails_when: prompt is typed to admit non-string values.
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: validates an assessment whose prompt is the empty string, since prompt carries no minimum length
  proves: The implementation record's inference that prompt carries no .min(1) -- an assessment whose
    prompt is '' still validates, matching the record's stated reasoning that no node states prompt is
    ever non-empty.
  fails_when: prompt is given a .min(1) (or similar non-empty) constraint.
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: rejects an evidence item missing fields, now that evidenceSchema requires it
  proves: 'Criterion 5 (fields required): an evidence item without a fields array is refused.'
  fails_when: fields is left .optional() on evidenceSchema.
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: validates an evidence item whose fields is an empty array, matching a concept whose capability
    never resolved
  proves: The task's UNDERDETERMINED note -- excludes a schema that requires fields to be non-empty (e.g.
    via .min(1)), which would satisfy every stated criterion including criterion 7 while contradicting
    domain/investigation/evidence's own honest-empty reading ("a concept whose capability never resolved
    snapshots no fields at all").
  fails_when: fields carries a .min(1) or other non-empty-array constraint.
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: rejects an evidence item whose fields is not an array
  proves: 'Criterion 5 (fields typed as an array): a non-array fields value is refused.'
  fails_when: fields accepts a non-array value.
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: rejects an evidence item whose fields entry is missing its name
  proves: 'Criterion 5 (fields typed as an array of the field-semantics shape): an entry without name
    -- the one required attribute of the field-semantics shape -- is refused.'
  fails_when: the local fieldSemanticsSchema does not require name, or fields is typed as an array of
    an unconstrained shape.
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: validates an evidence item whose fields entry supplies only a name, leaving type and description
    absent
  proves: The implementation record's inference that the local fieldSemanticsSchema mirrors FieldSemantics
    (name required, type and description optional) -- an entry carrying only name still validates.
  fails_when: fieldSemanticsSchema requires type or description.
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: rejects an evidence item missing concept_description, now that evidenceSchema requires it
  proves: 'Criterion 6 (concept_description required): an evidence item without concept_description is
    refused.'
  fails_when: concept_description is left .optional() on evidenceSchema.
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: rejects an evidence item whose concept_description is not a string
  proves: 'Criterion 6 (concept_description typed as a string): a non-string value (42) is refused.'
  fails_when: concept_description is typed to admit non-string values.
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: validates an evidence item whose concept_description is the empty string, matching a concept collected
    before it declared one
  proves: The task's UNDERDETERMINED note -- excludes a schema that requires concept_description to be
    non-empty, which would satisfy every stated criterion including criterion 7 while contradicting domain/investigation/evidence's
    own honest-empty reading ("a concept collected before it declared a description snapshots an empty
    one").
  fails_when: concept_description carries a .min(1) or other non-empty-string constraint.
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: validates a production-shaped response with no field stripped from its assessment or its evidence
  proves: 'Criterion 7: a fully-populated assessment (outcome, referral, text, register, usage, elapsed_ms,
    prompt) and a fully-populated evidence item (all pre-existing attributes plus fields and concept_description)
    both validate, and the parsed output carries every one of those fields back -- no field is stripped
    by z.object()''s default strip behavior and none is rejected.'
  fails_when: the schema rejects a value shaped exactly like what simulate-case.controller.ts passes through
    from a real InvestigationPipelineResult, or the parsed output drops any of assessment's or the evidence
    item's declared fields.
not_applicable:
- edge_case: A boundary at the low or high end of elapsed_ms's range (e.g. negative or zero)
  why: Neither the criteria nor domain/investigation/assessment or domain/investigation/evidence state
    a range for elapsed_ms beyond "integer" -- the implementation uses z.int() with no .positive() or
    .nonnegative(), and no node statement gives a boundary to test against.
- edge_case: A duplicate value where uniqueness is claimed
  why: Neither assessmentSchema nor evidenceSchema states or implies a uniqueness constraint over any
    of the widened fields.
- edge_case: An operation attempted against state that forbids it
  why: This task widens a Zod object schema; safeParse is a pure, stateless function with no notion of
    prior state to forbid an operation against.
- edge_case: A dependency that fails, is slow, or answers in an unexpected shape
  why: Schema validation has no I/O and no dependency to fail or answer slowly; the object under test
    is a synchronous, in-process Zod parse.
- edge_case: Two operations against one subject at once
  why: safeParse is a pure function with no shared mutable state across calls, so concurrent invocations
    cannot interfere with one another.
untested:
- evidenceSchema's own pre-existing elapsed_ms stays typed z.number() rather than z.int(), per the implementation
  record's own deferred item. No criterion of this task names it, so no test is written against it here;
  it remains open ground domain/investigation/evidence's integer typing for that field is not yet held
  to.
- assessment's outcome/referral/text and evidence's other already-required attributes (concept, inputs,
  observation, observed_at, ttl, origin, result, capability_name, capability_version, elapsed_ms) are
  exercised only by the broad criterion-7 production-shaped test and by the pre-existing tests' shared
  fixtures, never by a test that isolates each one's own required-ness or typing -- matching the binder's
  own ADVISORY that the objective claims every field both nodes require while the criteria enumerate only
  the omitted ones. Nothing in this task's criteria names those attributes individually, so no per-field
  test is written for them here.
---

## What it is

Proves simulate-case.dto.ts's widened response schema requires and correctly types the assessment
call-record fields and the evidence item's own snapshotted semantics, while admitting the
specification's own honest-empty readings and accepting a production-shaped value intact.

## Notes

None.
