---
target: backend
title: Investigation.written_at required — compile-time proof
summary: New and added type-level tests prove Investigation.written_at is a required string rejected by
  the compiler when absent or mis-typed, while pre-existing runtime tests already prove no producer computes
  or invents a written_at value.
implementation: sha256:4814e4cab0770ccbdc891f86f8e04cc9623726d754c4cdcb693ea4e247778a2a
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:4050ccb93004dfd5a71749b73d5d0a5e09de427ccddf202095ecbd7e6db18898
run: run/investigation-record-declared-types-written-at-is-required-suite-2
tests:
- file: src/__tests__/unit/investigation/investigation.spec.ts
  name: declares written_at as a required string, matching domain/investigation/investigation's own required
    attribute
  proves: 'Criterion: The Investigation type declares written_at without an optional marker.'
  fails_when: Investigation.written_at regains an optional marker (or otherwise becomes `string | undefined`),
    making the indexed-access type differ from `string`.
- file: src/__tests__/unit/investigation/investigation.spec.ts
  name: refuses an object literal omitting written_at as an Investigation, even though every other declared
    attribute is present
  proves: 'Criterion: An object lacking written_at is rejected by the compiler where an Investigation
    is expected.'
  fails_when: written_at stops being required on Investigation (or is given a default), so the `@ts-expect-error`
    directive above the assignment is itself flagged by the compiler as unnecessary (a suppressed error
    that never occurs), failing the surrounding tsc run.
- file: src/__tests__/unit/investigation/investigation.spec.ts
  name: assigns to Investigation once written_at is supplied alongside every other declared attribute,
    proving the refusal above is written_at and nothing else
  proves: That the previous test's rejection is caused by the missing written_at specifically, not by
    some other malformed field in the shared fixture.
  fails_when: The identical attribute set, with written_at added, fails to type-check as an Investigation
    — meaning some other field of the fixture (not written_at) is the actual source of a type error, which
    would make the omission test above pass for the wrong reason.
- file: src/__tests__/unit/investigation/investigation.spec.ts
  name: refuses a written_at value that is not the string datetime representation the domain model already
    declares
  proves: 'Criterion: The declared type of written_at remains the datetime representation it already carries.'
  fails_when: written_at's declared type widens or changes to admit a non-string value (e.g. a number
    timestamp or a Date instance), so the numeric literal assigned on that property line stops being a
    compile error and the `@ts-expect-error` directive is flagged as unnecessary.
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: resolves to an Investigation itself, never to a second hand-declared type standing in for every
    attribute but written_at
  proves: The task's own Notes UNDERDETERMINED entry — that no criterion excludes satisfying the task
    by giving the pre-settle content a second, hand-declared domain type (repeating every Investigation
    attribute except written_at), which rules/investigation/written-at-records-when-the-write-settled's
    statement that the domain model declares no second element for an assembled-but-not-settled investigation
    in fact refuses.
  fails_when: buildInvestigation's declared or inferred return type stops being exactly `Promise<Investigation>`
    — e.g. if it were changed to return a separately-declared type standing in for the pre-settle shape.
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: still declares written_at optional on BuildInvestigationOptions, so a caller before settle supplies
    none rather than inventing one
  proves: Supports criterion 3 (no producer acquires a written_at assignment it did not already make)
    by guarding the one type-level route through which a caller could otherwise be forced to invent a
    value — BuildInvestigationOptions.written_at staying optional.
  fails_when: BuildInvestigationOptions.written_at becomes required (its indexed-access type becomes exactly
    `string` rather than `string | undefined`), which would force every pre-settle caller to supply a
    written_at value nothing decided.
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: carries written_at from the given options, unchanged
  proves: 'Criterion: No producer of an Investigation acquires a written_at assignment it did not already
    make — buildInvestigation passes through the caller''s own written_at verbatim (pre-existing test,
    unaffected by this task''s change since the non-null assertion is erased at runtime).'
  fails_when: buildInvestigation stops assigning investigation.written_at from options.written_at verbatim
    (e.g. starts computing or defaulting it).
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: builds an Investigation carrying no written_at, rather than refusing, when written_at is missing
    entirely from the given options — the store decides that value later, at settle
  proves: Criterion 3, continued — buildInvestigation invents nothing when written_at is absent from the
    options (pre-existing test, unaffected by this task's change).
  fails_when: buildInvestigation starts refusing, or starts synthesizing a written_at value, when the
    given options carry none.
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: sends every declared attribute of the root row — identity, subject type, prompt version, model,
    pinned case, assessment, cost and durations — as the root insert's own params, in order, with written_at
    never among them
  proves: Criterion 3, for the store's write side — the caller-side producer never sends written_at at
    all, leaving the store as the sole assigner (pre-existing test, unaffected by this task's change).
  fails_when: The insert begins sending written_at among its params, meaning a caller-side value would
    reach the store instead of the store assigning it at settle.
- file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  name: reads back a whole investigation exactly as written — root, subject attribute-values, evidence
    with its capability pin, evaluations with their citations, assessment, cost and durations — through
    one transaction, with written_at assigned by the store itself at settle rather than the literal the
    fixture supplied
  proves: Criterion 3, for the store's read side — investigationOf (the other production-code producer
    of an Investigation value) assigns written_at from the store's own settle instant, never a value a
    caller supplied (pre-existing test, unaffected by this task's change).
  fails_when: The read-back written_at stops being the store's own settle-time value, e.g. by echoing
    back the caller-supplied fixture literal instead.
not_applicable:
- edge_case: A boundary at either end of a numeric or length range
  why: written_at is a datetime string with no stated numeric or length bound; this task changes only
    its required-ness, not any range.
- edge_case: A duplicate where uniqueness is claimed
  why: Neither the task's criteria nor the domain model states a uniqueness constraint over written_at.
- edge_case: An operation attempted against state that forbids it
  why: A type declaration governs no lifecycle or state machine; there is no forbidden state to attempt
    an operation against.
- edge_case: A dependency that fails or answers slowly
  why: No dependency call is involved in a type-declaration change; buildInvestigation's and investigationOf's
    dependency-facing behavior is untouched and already covered by existing tests.
- edge_case: Two operations against one subject at once
  why: Investigation is an immutable value type with no shared mutable state; this task introduces no
    new concurrent access path.
untested:
- Whether every producer of an Investigation-typed value anywhere in src/ (beyond buildInvestigation and
  investigationOf, which a repository-wide search for typed Investigation return positions found to be
  the only two in production code) leaves written_at unchanged is not exhaustively proven by a single
  test — it rests on that search plus the two producers' own existing and new tests, rather than on one
  totality-asserting test.
- Whether the whole target source tree still type-checks under this required written_at (i.e. that no
  file outside the investigation and persistence suites constructs an Investigation literal lacking it)
  is not verified by any test here; that is the concern of the delivery's own recorded build run, not
  of a test file.
---
## What it is
Nine tests across two existing files plus one new file prove Investigation.written_at is now a required string the compiler rejects when absent or wrongly typed, and that the two production-code producers of an Investigation (buildInvestigation and investigationOf) still never compute or invent a written_at value of their own.

## Notes
The first suite attempt (run/investigation-record-declared-types-written-at-is-required-suite) failed at typecheck: a `@ts-expect-error` directive in the new test file was anchored one line above the object-literal's opening brace, but tsc reported the actual diagnostic on the `written_at:` property line inside the literal, leaving the directive unused and the real type error uncaught. The test was fixed to anchor the directive to the line the diagnostic is reported on, without changing what the test asserts or proves. The suite passed on the second attempt (run/investigation-record-declared-types-written-at-is-required-suite-2).
