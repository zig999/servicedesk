---
title: Integer-declared numeric fields of the simulation responses validate as integers
summary: usageSchema, evaluationSchema.elapsed_ms and durationsSchema in both simulate-case and simulate-hypothesis
  response DTOs now require z.int() instead of bare z.number(), matching the integer domain fields they
  carry.
task: sha256:b1b2a88d3e49d01ef3049b4ce14bb9291e7ccec9f72ff297f544aeb8b1ea00fd
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:4050ccb93004dfd5a71749b73d5d0a5e09de427ccddf202095ecbd7e6db18898
run: run/investigation-record-declared-types-simulation-response-integer-fields-build
files:
- path: src/http/dto/simulate-case.dto.ts
  effect: usageSchema.input_tokens and .output_tokens are z.int(); every evaluationSchema variant's elapsed_ms
    is z.int().optional() (unchanged optionality); durationsSchema.collection, .judgment and .total are
    z.int(), and .writing stays z.int().optional(). assessmentSchema (already z.int() for elapsed_ms)
    and costSchema (domain/investigation/cost, outside this task's covers) are untouched.
- path: src/http/dto/simulate-hypothesis.dto.ts
  effect: the same usageSchema, evaluationSchema.elapsed_ms and durationsSchema (collection, judgment,
    total — this file's durationsSchema carries no writing field, unchanged) tightened from z.number()
    to z.int() the same way, declared independently from simulate-case.dto.ts as before.
criteria:
- criterion: A response whose usage.input_tokens is fractional fails validation in the simulate-case response
    schema and in the simulate-hypothesis response schema.
  met: true
  how: usageSchema.input_tokens is z.int() in both files, so a fractional number fails z's integer check
    before the rest of the object is considered.
- criterion: A response whose usage.output_tokens is fractional fails validation in both response schemas.
  met: true
  how: usageSchema.output_tokens is z.int() in both files, same mechanism as input_tokens.
- criterion: A response whose evaluation elapsed_ms is fractional fails validation in both response schemas.
  met: true
  how: every verdict branch of evaluationSchema (confirmed, refuted, inconclusive) declares elapsed_ms
    as z.int().optional() in both files; a present-but-fractional value fails the integer check, and its
    optionality is unchanged so an absent value still passes as before.
- criterion: A response whose durations.collection is fractional fails validation in both response schemas.
  met: true
  how: durationsSchema.collection is z.int() (required) in both files.
- criterion: A response whose durations.judgment is fractional fails validation in both response schemas.
  met: true
  how: durationsSchema.judgment is z.int() (required) in both files.
- criterion: A response whose durations.total is fractional fails validation in both response schemas.
  met: true
  how: durationsSchema.total is z.int() (required) in both files.
- criterion: A simulate-case response whose durations.writing is present and fractional fails validation.
  met: true
  how: simulate-case.dto.ts's durationsSchema.writing is z.int().optional(); a present fractional value
    fails the integer check, and absence still passes, unchanged from before. simulate-hypothesis.dto.ts's
    durationsSchema carries no writing field at all (unchanged), so this criterion is answered by the
    one file that declares it.
- criterion: A response carrying integers in all of those fields, otherwise shaped as the simulation pipeline
    produces it, passes validation unchanged.
  met: true
  how: only the numeric type of these fields was tightened from z.number() to z.int(); every other field,
    every required/optional flag, and every literal or enum constraint is unchanged, so a response already
    carrying integers there validates exactly as it did before.
- criterion: Each of the two files continues to declare its own usage and durations schemas, with no shared
    schema module introduced.
  met: true
  how: usageSchema and durationsSchema remain declared once per file, edited in place; no new module or
    import was added, and the two files' own declarations still diverge where they already did (simulate-hypothesis.dto.ts's
    durationsSchema has no writing field, unchanged).
nodes:
- node: domain/investigation/usage
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  how: input_tokens and output_tokens are both required integer attributes of this value object; usageSchema
    in each file now validates both as z.int(), matching the domain node exactly.
- node: domain/investigation/evaluation
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  how: the node declares elapsed_ms as integer and not required, present only when a call happened; evaluationSchema's
    elapsed_ms is z.int().optional() in every verdict branch of both files, tightening the type while
    leaving the conditional presence exactly as it was.
- node: domain/investigation/durations
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  how: collection, judgment and total are required integer attributes and writing is an optional integer
    attribute (present only when consolidation ran); durationsSchema in simulate-case.dto.ts validates
    all four as z.int(), z.int(), z.int() and z.int().optional() respectively, and simulate-hypothesis.dto.ts's
    durationsSchema (which never declared writing) validates its three fields the same way.
inferences:
- inferred: the bare z.int() form (rather than z.number().int()) is the right one to write here, matching
    assessmentSchema.elapsed_ms and caseRefSchema.version already in the same two files.
  from: 'the inventory''s convention entry ("Integer-typed numeric fields in zod DTOs are declared with
    z.int() (bare) or z.number().int(), never bare z.number()... seen_at: simulate-case.dto.ts (version,
    elapsed_ms)") names both forms as evidenced convention and names this exact file''s own elapsed_ms/version
    fields as the working example to mirror.'
- inferred: no minimum or positivity constraint (e.g. .positive() or .min(1)) is added to any of these
    fields, even though the sibling caseRefSchema.version already carries .positive().
  from: the task's own UNDERDETERMINED note, which states that adding such a floor would wrongly reject
    a stage measured below one millisecond, which rules/investigation/a-measured-duration-below-one-millisecond-is-zero
    (outside this task's covers) reads as zero rather than as an invalid value.
- inferred: no field's optionality or requiredness is changed — usage and elapsed_ms stay optional wherever
    they already were, durations.writing stays optional, and the required fields stay required.
  from: the task's own UNDERDETERMINED note, which states that tightening these fields to integer while
    also making them required would wrongly refuse a response whose evaluation carries reason no-data
    or a run that never reached consolidation — a stricter change than any criterion asks for.
- inferred: assessmentSchema's usage and elapsed_ms and costSchema (both in simulate-case.dto.ts) are
    left untouched.
  from: assessmentSchema.elapsed_ms already reads z.int() and assessmentSchema.usage is already the (now-corrected)
    usageSchema, so both already satisfy the criteria without an edit; costSchema answers to domain/investigation/cost,
    which the task's own "Decision, beyond the covers" notes explicitly exclude from this task's scope.
deferred:
- what: costSchema in simulate-case.dto.ts (calls, input_tokens, output_tokens) is still z.number() and
    answers to domain/investigation/cost, which is not a node this task implements.
  why: the task's own notes record this citation as a scope alert only, not a fact this task proves, and
    growing the covers to it now would claim a behavior no criterion of this task states.
---
## What it is
domain/investigation/usage, domain/investigation/evaluation and domain/investigation/durations declare their numeric fields as integer; the two simulation response DTOs (simulate-case, simulate-hypothesis) previously validated the same fields as bare z.number(), admitting fractional values the domain nodes refuse. usageSchema.input_tokens/output_tokens, evaluationSchema.elapsed_ms (every verdict branch) and durationsSchema.collection/judgment/writing/total in both files now use z.int() in place of z.number(), leaving every field's required/optional status, and every other field of both schemas, unchanged.

## Notes
None.
