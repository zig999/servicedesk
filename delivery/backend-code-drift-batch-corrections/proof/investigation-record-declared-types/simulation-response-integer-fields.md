---
title: Integer-declared numeric fields of the simulation responses validate as integers
summary: Twenty tests over both simulate-case and simulate-hypothesis response schemas prove that usage
  tokens, evaluation elapsed_ms and durations fields refuse a fractional value, still accept zero and
  absence exactly as before, and every scope boundary the task declared stays untouched.
implementation: sha256:160dcbfceab9bfc5e26a312d075a7a609a7d4be5e5fcfb85f6b042f7219155b2
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:4050ccb93004dfd5a71749b73d5d0a5e09de427ccddf202095ecbd7e6db18898
run: run/investigation-record-declared-types-simulation-response-integer-fields-suite
tests:
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: rejects a response whose assessment usage carries a fractional input_tokens
  proves: A response whose usage.input_tokens is fractional fails validation in the simulate-case response
    schema and in the simulate-hypothesis response schema.
  fails_when: usageSchema.input_tokens stops being an integer-only check (e.g. reverts to bare z.number())
    and a fractional value is accepted
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: rejects a response whose assessment usage carries a fractional output_tokens
  proves: A response whose usage.output_tokens is fractional fails validation in both response schemas.
  fails_when: usageSchema.output_tokens stops being an integer-only check and a fractional value is accepted
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: rejects a response whose evaluation elapsed_ms is fractional, on the confirmed branch
  proves: A response whose evaluation elapsed_ms is fractional fails validation in both response schemas.
  fails_when: evaluationSchema's elapsed_ms (any verdict branch) stops being an integer-only check
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: rejects a response whose durations.collection is fractional
  proves: A response whose durations.collection is fractional fails validation in both response schemas.
  fails_when: durationsSchema.collection stops being an integer-only check
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: rejects a response whose durations.judgment is fractional
  proves: A response whose durations.judgment is fractional fails validation in both response schemas.
  fails_when: durationsSchema.judgment stops being an integer-only check
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: rejects a response whose durations.total is fractional
  proves: A response whose durations.total is fractional fails validation in both response schemas.
  fails_when: durationsSchema.total stops being an integer-only check
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: rejects a response whose durations.writing is present and fractional
  proves: A simulate-case response whose durations.writing is present and fractional fails validation.
  fails_when: durationsSchema.writing (simulate-case) stops being an integer-only check when present
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: validates a response whose evaluation carries usage and elapsed_ms and whose durations carries
    writing, all as integers, matching a completed simulation that made a model call and reached consolidation
  proves: A response carrying integers in all of those fields, otherwise shaped as the simulation pipeline
    produces it, passes validation unchanged (simulate-case half, including the two fields — evaluation.usage/elapsed_ms
    and durations.writing — no prior test ever populated).
  fails_when: any of these now-integer-typed fields refuses an all-integer, fully-shaped response, or
    a required/optional flag was tightened along with the type
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: validates a response whose durations.collection is zero, matching a stage measured below one millisecond
  proves: the inference that no minimum or positivity constraint is added to any of these fields, and
    falsifies the second UNDERDETERMINED note's named alternative
  fails_when: durationsSchema.collection carries a .positive() or .min(1) constraint (exactly the alternative
    the second UNDERDETERMINED note names), which would reject zero
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: validates a response whose evaluation carries neither usage nor elapsed_ms and whose durations
    carries no writing, matching a run that made no model call and reached no consolidation
  proves: the inference that no field's optionality or requiredness is changed, and falsifies the first
    UNDERDETERMINED note's named alternative
  fails_when: evaluation.usage, evaluation.elapsed_ms or durations.writing is made a required field (exactly
    the alternative the first UNDERDETERMINED note names), which would refuse this response
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: validates a response whose cost.calls is fractional, since domain/investigation/cost stays outside
    this task's scope
  proves: the inference that costSchema is left untouched because domain/investigation/cost sits outside
    this task's covers
  fails_when: costSchema.calls is tightened to an integer, reaching past this task's own declared scope
    boundary
- file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  name: rejects a response whose evaluation usage carries a fractional input_tokens
  proves: A response whose usage.input_tokens is fractional fails validation in the simulate-case response
    schema and in the simulate-hypothesis response schema (hypothesis half).
  fails_when: usageSchema.input_tokens stops being an integer-only check in simulate-hypothesis.dto.ts
- file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  name: rejects a response whose evaluation usage carries a fractional output_tokens
  proves: A response whose usage.output_tokens is fractional fails validation in both response schemas
    (hypothesis half).
  fails_when: usageSchema.output_tokens stops being an integer-only check in simulate-hypothesis.dto.ts
- file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  name: rejects a response whose evaluation elapsed_ms is fractional
  proves: A response whose evaluation elapsed_ms is fractional fails validation in both response schemas
    (hypothesis half).
  fails_when: evaluationSchema's elapsed_ms stops being an integer-only check in simulate-hypothesis.dto.ts
- file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  name: rejects a response whose durations.collection is fractional
  proves: A response whose durations.collection is fractional fails validation in both response schemas
    (hypothesis half).
  fails_when: durationsSchema.collection stops being an integer-only check in simulate-hypothesis.dto.ts
- file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  name: rejects a response whose durations.judgment is fractional
  proves: A response whose durations.judgment is fractional fails validation in both response schemas
    (hypothesis half).
  fails_when: durationsSchema.judgment stops being an integer-only check in simulate-hypothesis.dto.ts
- file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  name: rejects a response whose durations.total is fractional
  proves: A response whose durations.total is fractional fails validation in both response schemas (hypothesis
    half).
  fails_when: durationsSchema.total stops being an integer-only check in simulate-hypothesis.dto.ts
- file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  name: validates a response whose evaluation carries usage and elapsed_ms as integers, matching a completed
    simulation that made a model call
  proves: A response carrying integers in all of those fields, otherwise shaped as the simulation pipeline
    produces it, passes validation unchanged (hypothesis half, including evaluation.usage/elapsed_ms,
    no prior test ever populated).
  fails_when: either now-integer-typed field refuses an all-integer response, or its optionality was tightened
    along with its type
- file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  name: validates a response whose durations.collection is zero, matching a stage measured below one millisecond
  proves: the inference that no minimum or positivity constraint is added, and falsifies the second UNDERDETERMINED
    note's named alternative (hypothesis half)
  fails_when: durationsSchema.collection in simulate-hypothesis.dto.ts carries a .positive() or .min(1)
    constraint, which would reject zero
- file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  name: validates a response whose evaluation carries neither usage nor elapsed_ms, matching a run that
    made no model call
  proves: the inference that no field's optionality or requiredness is changed, and falsifies the first
    UNDERDETERMINED note's named alternative (hypothesis half)
  fails_when: evaluation.usage or evaluation.elapsed_ms is made a required field in simulate-hypothesis.dto.ts,
    which would refuse this response
not_applicable:
- edge_case: durations.writing fractional in the simulate-hypothesis response schema
  why: Criterion 7 is itself scoped to the simulate-case response only, and simulate-hypothesis.dto.ts's
    durationsSchema declares no writing field at all (unchanged) — there is no field there to falsify.
- edge_case: two validations of one response at once (concurrent parsing)
  why: Schema parsing here is synchronous and stateless per call; no criterion or bound node states a
    concurrency guarantee over it.
- edge_case: a negative value in any of these integer fields
  why: No criterion or domain node distinguishes sign; the zero-valued tests already establish that no
    floor was added, and a floor (.positive()/.min(1)) is exactly what would also reject a negative value,
    so a separate negative case would exercise the same absence a second time.
- edge_case: a dependency that is slow or unavailable
  why: Schema validation performs no I/O and calls no dependency; nothing in this task's surface can be
    slow or unavailable.
- edge_case: a duplicate value or uniqueness violation
  why: None of these numeric fields, or the objects they sit in, carries a uniqueness constraint in any
    bound node or criterion.
untested:
- 'Criterion 9 — each of the two files continues to declare its own usage and durations schemas, with
  no shared schema module introduced — is a fact about source organization, not an observable validation
  outcome: usageSchema and durationsSchema are non-exported consts local to each file, so no black-box
  test can distinguish ''declared twice'' from ''imported once from a shared module'' by parsing responses.
  Verified only by reading both files directly (confirmed: each still declares its own const, neither
  imports from the other or from a new shared module); the task''s own ADVISORY note already records that
  this criterion belongs to the project''s standard rather than to a spec-provable behavior.'
- The inference that the bare z.int() form (rather than z.number().int()) is the right one to write is
  a stylistic choice with no externally observable difference from z.number().int() for the inputs any
  criterion names — both reject a fractional value and accept an integer identically — so no test in this
  proof isolates that specific form; the fractional-rejection tests above exercise the behavior the choice
  produces, not the choice itself.
---
## What it is
Twenty tests, ten per file, cover every one of the task's nine stated criteria across both simulate-case and simulate-hypothesis response schemas, plus the two UNDERDETERMINED notes' own alternatives — a zero duration and an absent conditional field — each proven to still pass, and the cost schema's fractional field proven to still pass as out of this task's scope.

## Notes
None.
