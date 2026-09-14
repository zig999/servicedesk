---
target: backend
title: Pool settings declared in the environment schema
summary: Adds three defaulted, positive-integer-validated environment variables for the connection pool's
  max connections, idle timeout and statement timeout to the existing envSchema, and repairs five integration/e2e
  test fixtures whose hand-typed Env literals became incomplete under the new required output fields.
task: sha256:72d8f99451d2f6830d8a0e397b6e201b61ee9c2f9f0b39ce027f525968d7efe4
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/database-pool-configuration-pool-settings-in-env-schema-build-2
files:
- path: src/config/env.ts
  effect: envSchema gains DATABASE_POOL_MAX_CONNECTIONS, DATABASE_POOL_IDLE_TIMEOUT_MS and DATABASE_POOL_STATEMENT_TIMEOUT_MS,
    each z.coerce.number().int().positive() with its own .default(...), following the same chain and inline-default
    placement PORT already uses; loadEnv's parsing and error-raising logic is unchanged.
- path: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  effect: baseEnv()'s Env literal now also sets the three new fields (10, 10_000, 30_000), matching the
    file's existing style of spelling every Env field explicitly; no other line changed.
- path: src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
  effect: baseEnv()'s Env literal now also sets the three new fields (10, 10_000, 30_000); no other line
    changed.
- path: src/__tests__/integration/factories/simulate-hypothesis-server.factory.spec.ts
  effect: baseEnv()'s Env literal now also sets the three new fields (10, 10_000, 30_000); no other line
    changed.
- path: src/__tests__/integration/http/diagnose-e2e.spec.ts
  effect: placeholderEnv()'s Env literal now also sets the three new fields (10, 10_000, 30_000); no other
    line changed.
- path: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  effect: placeholderEnv()'s Env literal now also sets the three new fields (10, 10_000, 30_000); no other
    line changed.
criteria:
- criterion: Loading the environment with none of the three variables set succeeds and yields a value
    for each from the schema's own default.
  met: true
  how: Each of the three fields carries .default(10), .default(10_000) and .default(30_000) respectively,
    so safeParse succeeds and populates each field when the source environment names none of them.
- criterion: Loading the environment with each of the three variables set yields those values as numbers.
  met: true
  how: z.coerce.number() coerces the string environment value to a number before the .int().positive()
    checks run.
- criterion: A non-numeric value for any of the three is refused with the invalid-environment error the
    schema already raises.
  met: true
  how: z.coerce.number() on a non-numeric string yields NaN, which fails Zod's number check before .int()/.positive()
    run; safeParse then reports failure and loadEnv throws the existing InvalidEnvironmentError unchanged.
- criterion: A zero or negative value for any of the three is refused with the invalid-environment error.
  met: true
  how: .positive() on each of the three fields rejects zero and negative values through the same safeParse-failure
    -> InvalidEnvironmentError path already used for every other positive-constrained field.
- criterion: Every default is stated in the schema declaration itself rather than at a reading site.
  met: true
  how: The three .default(...) calls sit inline in the envSchema object literal; no reading site needs
    to supply a fallback.
- criterion: The existing environment fixture that enumerates required variables still loads without naming
    any of the three.
  met: true
  how: The three new fields are all .default(...)-carrying, so env.spec.ts's validEnvSource(), which sets
    none of them, still produces a successful parse.
nodes:
- node: constraints/the-pool-bounds-are-positive-integers
  encoded_at:
  - src/config/env.ts
  how: All three new fields chain .int().positive(), so a non-integer, zero or negative value for any
    of them fails validation at the same startup-time safeParse this schema already performs for every
    other bound-shaped field, refusing with InvalidEnvironmentError rather than admitting the value.
- node: constraints/the-connection-pool-is-bounded-by-configuration
  encoded_at:
  - src/config/env.ts
  how: The schema now names the three bounds explicitly with declared defaults, giving a deployment that
    states none of them a value the sibling task can read instead of the pg driver's implicit default;
    this task stops at declaring the configuration surface — no code here constructs or configures a Pool,
    which the sibling task answers.
inferences:
- inferred: The three env var names — DATABASE_POOL_MAX_CONNECTIONS, DATABASE_POOL_IDLE_TIMEOUT_MS, DATABASE_POOL_STATEMENT_TIMEOUT_MS
    — rather than names mirroring pg's own option keys verbatim.
  from: CON-01 requires SCREAMING_SNAKE_CASE; DATABASE_ prefixing distinguishes these from the existing
    POOL_SIZE, which the inventory documents as sizing an unrelated in-process worker pool rather than
    pg's connection pool.
- inferred: The three default figures — 10 max connections, 10_000 ms idle timeout, 30_000 ms statement
    timeout.
  from: The task's own Notes (ADVISORY) state that no candidate names a figure for any of the three and
    that the defaults are an implementation choice the executor makes unguided, the same way listings-are-paged
    leaves its own default and maximum unnamed; commonly-used pg-ecosystem figures were chosen since no
    criterion constrains the figures themselves.
- inferred: Positive-integer validation (.int().positive()) rather than the numeric-and-positive-only
    validation the task's criteria describe verbatim.
  from: The task's own Notes (UNDERDETERMINED) flag that its criteria alone would admit a fractional value
    like 2.5 while constraints/the-pool-bounds-are-positive-integers refuses exactly that; the node's
    fuller requirement was encoded rather than only the narrower criteria text.
- inferred: Each of the five integration/e2e spec fixtures (baseEnv()/placeholderEnv()) gets the same
    three literal values (10, 10_000, 30_000) added directly, rather than being refactored to import a
    shared helper.
  from: Each of the five files already independently spells out every Env field as a hand-typed literal;
    minimally repairing the same pattern each already follows avoids widening this task into a fixture
    consolidation nobody asked for.
preserved:
- PORT, DATABASE_URL, EVALUATOR_MODEL, EVALUATOR_MAX_TOKENS, CONSOLIDATOR_MODEL, CONSOLIDATOR_MAX_TOKENS,
  POOL_SIZE, DEFAULT_CONSOLIDATION_REGISTER, PROMPT_VERSION, PAGINATION_DEFAULT_LIMIT and PAGINATION_MAX_LIMIT
  keep their existing validation, coercion and default behavior unchanged.
- loadEnv's safeParse-then-InvalidEnvironmentError control flow is untouched.
- env.spec.ts's validEnvSource() fixture and every existing test in that file keep passing without modification,
  since none of the three new fields is required.
- Every other field and assertion in the five repaired integration/e2e spec files is unchanged; only the
  two Env-literal-building functions gained the three new keys.
deferred:
- what: Actually constructing the pg Pool in src/persistence/database-connection.ts with these three bounds,
    and updating its and deployment-provisions-no-database-service.spec.ts's tests to match.
  why: The task's own Notes (REMAINDER) assign this to the sibling task under this epic.
- what: Consolidating the now six near-identical hand-typed Env-literal fixtures into one shared test
    helper.
  why: That duplication predates this task and this task's change did not introduce it; fixing it now
    would widen this task into a test-fixture refactor beyond what fixing the typecheck break requires.
---
## What it is
Three new numeric variables on the one environment schema, each with a default the schema declares; no pool is configured by this task.

## Notes
None.
