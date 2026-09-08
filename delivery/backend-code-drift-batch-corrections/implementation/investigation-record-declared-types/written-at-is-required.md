---
title: Investigation.written_at declared required
summary: The Investigation type's written_at attribute loses its optional marker to match domain/investigation/investigation,
  with the one pre-settle producer carrying it through a non-null assertion rather than a second domain
  element.
task: sha256:6573f9cd763131cff195b5f4393374e950bb51e116998c2d881814d03d5a9732
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:4050ccb93004dfd5a71749b73d5d0a5e09de427ccddf202095ecbd7e6db18898
run: run/investigation-record-declared-types-written-at-is-required-build
files:
- path: src/investigation/investigation.ts
  effect: 'Investigation.written_at is now declared `readonly written_at: string;` (no optional marker),
    matching the required attribute domain/investigation/investigation declares. Every other field is
    unchanged.'
- path: src/investigation/investigation-factory.ts
  effect: 'buildInvestigation''s returned object literal now assigns `written_at: options.written_at!`
    instead of `written_at: options.written_at`, satisfying Investigation''s now-required `string` field
    through a non-null assertion while BuildInvestigationOptions.written_at stays optional and the value
    passed through is exactly what the caller supplied, unchanged. No new value is ever computed or defaulted
    here.'
criteria:
- criterion: The Investigation type declares written_at without an optional marker.
  met: true
  how: 'src/investigation/investigation.ts line 29 reads `readonly written_at: string;` — the `?` present
    before this change is removed, matching domain/investigation/investigation''s `required: true` declaration
    for written_at.'
- criterion: An object lacking written_at is rejected by the compiler where an Investigation is expected.
  met: true
  how: Because written_at now has no optional marker and no default, any object literal assigned to a
    location typed Investigation (a variable annotation, a function parameter, a function return position)
    that omits written_at fails to compile with TypeScript's TS2741 ("Property 'written_at' is missing
    in type ... but required in type 'Investigation'"). This is a direct, mechanical consequence of the
    type declaration in src/investigation/investigation.ts; a compile-time example demonstrating the rejection
    is the accompanying proof's concern.
- criterion: No producer of an Investigation acquires a written_at assignment it did not already make.
  met: true
  how: 'buildInvestigation in src/investigation/investigation-factory.ts still assigns written_at from
    `options.written_at` verbatim — only a non-null assertion (`!`) was added to satisfy the stricter
    static type, which is erased at runtime and computes nothing new; run-diagnosis.ts''s buildInvestigationOptions
    still never supplies written_at at all, so the pre-settle Investigation it dispatches to the store
    still carries no written_at value of its own at runtime. The store''s own read-side producer, investigationOf
    in src/persistence/relational-investigation-store.repository.ts, already assigned `written_at: row.written_at.toISOString()`
    unconditionally before this task and is untouched by it.'
- criterion: The declared type of written_at remains the datetime representation it already carries.
  met: true
  how: written_at's value type is still `string` (the ISO datetime representation already in use throughout
    the codebase, e.g. row.written_at.toISOString() in the store) — only the optional marker was removed;
    no representation changed.
nodes:
- node: domain/investigation/investigation
  encoded_at:
  - src/investigation/investigation.ts
  how: 'The node declares written_at with `required: true` alongside id, requester, narrative, subject,
    prompt_version, model, evidence, evaluations, assessment, cost and durations. src/investigation/investigation.ts
    now encodes that same required-ness for written_at (no optional marker), closing the drift the task
    names — previously the type declared it optional, admitting a value lacking written_at as a complete
    Investigation.'
- node: rules/investigation/written-at-records-when-the-write-settled
  how: 'This task honors, without newly encoding, the rule''s statement that ''the domain model declares
    no second element for an investigation assembled but not yet settled'': rather than adding a second
    hand-typed interface repeating every Investigation attribute except written_at (one of the routes
    this task''s own Notes named as available), src/investigation/investigation-factory.ts keeps BuildInvestigationOptions.written_at
    optional and passes it through a non-null assertion, so Investigation remains the domain model''s
    one element for both the pre-settle and settled forms of the record. The rule''s own statement that
    ''what persistence hands the store is the investigation''s own content less written_at'' is already
    honored by src/persistence/relational-investigation-store.repository.ts''s INVESTIGATION_INSERT_TEXT,
    which excludes written_at from the insert column list — untouched by this task. This task''s criteria
    do not reach, and this delivery does not implement, the rule''s clauses about which instant written_at
    holds (the store''s settle instant, never the request-arrival or write-issue instant), the two-attempt
    tie-break leaving exactly one write''s settle instant persisted, or the store answering the persisted
    investigation with written_at already fixed — the task''s own REMAINDER note names these as belonging
    to a sibling task over the persistence stage itself, which this initiative does not contain.'
inferences:
- inferred: buildInvestigation's return-position written_at is asserted with a non-null assertion (`options.written_at!`)
    rather than a cast on the whole returned object or a hand-declared second interface for the pre-settle
    shape.
  from: 'The task''s own ## Notes, which name exactly these three routes (cast, non-null assertion, or
    a second hand-declared interface) as ways the criteria could be satisfied without excluding any of
    them, and rules/investigation/written-at-records-when-the-write-settled, which states the domain model
    declares no second element for an assembled-but-not-yet-settled investigation — favoring the two routes
    that add no second type over the one that does.'
divergences:
- departure: A non-null assertion (`options.written_at!`) is introduced in src/investigation/investigation-factory.ts
    with no accompanying narrowing guard.
  cites: TYP-02
  file: src/investigation/investigation-factory.ts
  why: written_at is genuinely absent at this stage by design — rules/investigation/written-at-records-when-the-write-settled
    states the store alone fills it at settle — so no guard could narrow `string | undefined` to `string`
    here without either fabricating a value nothing decided or reintroducing the second domain element
    the same rule refuses. The task's own Notes name the non-null assertion as one of the routes that
    satisfies this task's criteria; eslint.config.js does not currently encode TYP-02, so this departure
    is disclosed rather than caught by the tool that would ordinarily decide it.
preserved:
- The persistence insert (INVESTIGATION_INSERT_TEXT in src/persistence/relational-investigation-store.repository.ts)
  still excludes written_at from its column list — the store, not the caller, fills written_at at settle.
- run-diagnosis.ts still never supplies written_at when building the pre-settle Investigation it dispatches
  to store.write, so the write-once/two-attempt settle semantics already implemented there are unchanged.
- Every existing test fixture across the investigation and persistence suites (relational-investigation-store.repository.spec.ts,
  store-wiring.spec.ts, investigation-factory.spec.ts, both unit and integration) already supplies a literal
  written_at value in its Investigation-typed helpers, so none needed to change to keep compiling under
  the now-required field.
deferred:
- what: Encoding the rule's remaining clauses — which instant written_at holds, the two-attempt tie-break,
    and the store answering with written_at already fixed — as an explicit, separately-identified domain
    concept or contract for the persistence stage.
  why: The task's own REMAINDER note assigns this to a sibling task over the persistence stage itself,
    which this initiative's plan does not contain; widening this task to cover it would exceed what was
    cut.
---
## What it is
Investigation.written_at loses its optional marker in src/investigation/investigation.ts, matching domain/investigation/investigation's required declaration; buildInvestigation in src/investigation/investigation-factory.ts carries its one pre-settle producer through a non-null assertion rather than a second domain element, honoring rules/investigation/written-at-records-when-the-write-settled's statement that no second element exists for an assembled-but-not-yet-settled investigation.

## Notes
None.
