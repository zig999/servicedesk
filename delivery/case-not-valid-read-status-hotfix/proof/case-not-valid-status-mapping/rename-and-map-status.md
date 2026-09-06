---
title: CaseVersionNotValidError renamed and mapped to 409, six stale test files corrected, status-map
  coverage added, and the specification gap documented without asserting it
summary: Proves the renamed CaseVersionNotValidError maps to HTTP 409 with the right error code across
  every non-replay read while CaseNotFoundError's 404 and replay's unrevalidated read stay untouched,
  corrects six test files still naming the retired identifier CaseNotValidError, adds the missing status-map
  unit test, and converts the one test that would have asserted the task's own UNDERDETERMINED note into
  a non-asserting it.todo so the suite stays green while the gap stays visible.
implementation: sha256:c3fc821e530805cde0b7639f856e0b0c10b1db5baf0de016d93fc701e372ffa3
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/case-not-valid-status-mapping-rename-and-map-status-suite-4
tests:
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves CaseVersionNotValidError to 409, never the generic unmapped-error fallback
  proves: Criterion 1 and 3's core mapping in isolation — status-map.ts's STATUS_BY_ERROR_CLASS answers
    409 for the renamed class before any route or middleware is involved.
  fails_when: statusForError stops returning 409 for a CaseVersionNotValidError instance, or the class
    is removed from STATUS_BY_ERROR_CLASS.
- file: src/__tests__/unit/http/read-case.routes.spec.ts
  name: refuses with 409 reporting CaseVersionNotValidError, never the generic 500 envelope, when the
    named version cannot be assembled whole
  proves: Criteria 1, 2 and 3 through the /v1/cases/:slug/versions/:version route — a rejection with CaseVersionNotValidError
    answers 409 with that exact code, not the generic 500/INTERNAL_ERROR envelope this test asserted before
    the correction.
  fails_when: the route answers anything but 409, or the body's error.code is not the literal string "CaseVersionNotValidError".
- file: src/__tests__/unit/http/case-input-requirements.routes.spec.ts
  name: refuses with 409 reporting CaseVersionNotValidError, never the generic 500 envelope, when the
    named version fails a structural rule
  proves: Criteria 1, 2 and 3 through the /v1/cases/:slug/versions/:version/input-requirements route —
    the same refusal reaches 409 on a second, independent route, regardless of which route reached the
    read.
  fails_when: this route answers anything but 409, or the body's error.code is not the literal string
    "CaseVersionNotValidError".
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: refuses a case failing one structural rule, naming the violation in a CaseVersionNotValidError
  proves: Criterion 1's structural-failure branch at the service layer — a document that fails to parse
    raises CaseVersionNotValidError with the violating structural rule named in its context.
  fails_when: structuralCase stops raising CaseVersionNotValidError for a document with no hypothesis,
    or the violations array no longer names "the case declares no hypothesis".
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: refuses a structurally valid case failing one coherence rule, as the composed CaseVersionNotValidError
    rather than the coherence module's own IncoherentCaseError
  proves: Criterion 1's coherence-failure branch at the service layer — refuseIncoherence raises the same
    CaseVersionNotValidError class (never the coherence module's own IncoherentCaseError) for a structurally
    sound case that fails coherence, establishing that both validator families converge on one class and
    therefore one status.
  fails_when: refuseIncoherence stops raising CaseVersionNotValidError for a case whose concept the glossary
    no longer holds, or it raises IncoherentCaseError instead.
- file: src/__tests__/unit/http/simulate-case.controller.spec.ts
  name: reuses case-query's own CaseVersionNotValidError unchanged for an incoherent case version, before
    runSimulate is ever called
  proves: Corrected reference to the renamed identifier — the controller still passes a case-query rejection
    through unchanged rather than swallowing or re-wrapping it, now asserted against the class that actually
    exists.
  fails_when: the controller stops rethrowing the exact rejected error instance, or the import of CaseVersionNotValidError
    fails to resolve.
- file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  name: reads the shared canonical fixture case whole with no CaseVersionNotValidError, and with every
    hypothesis still collecting at least one concept, once this file's own collects-survive-DELETE test
    has already run
  proves: Corrected test title reference — no production or test file under the target root names the
    retired identifier CaseNotValidError (criterion 5), including this title string.
  fails_when: this title or any other file under the target root reintroduces the literal string CaseNotValidError.
- file: src/__tests__/integration/factories/case-query.factory.spec.ts
  name: refuses through the real wiring a case document declaring no hypothesis, naming the structural
    violation
  proves: Corrected reference to the renamed identifier through the real store wiring — a structural violation
    raises CaseVersionNotValidError with the violation named, over the real database rather than a fake
    store.
  fails_when: the real wiring stops raising CaseVersionNotValidError for a manifest-less case, or the
    violations array no longer names "the case declares no hypothesis".
- file: src/__tests__/integration/factories/case-query.factory.spec.ts
  name: refuses at a later read, through the real wiring, a case that validated earlier once the glossary
    no longer accepts the subject type it depends on for a collected concept, edited directly against
    the table
  proves: Corrected reference to the renamed identifier for a later-onset coherence failure through the
    real store — validation-runs-at-every-read still re-checks a previously valid version and refuses
    it as CaseVersionNotValidError.
  fails_when: a later read of the same version no longer refuses once the subject type it depends on is
    removed from the glossary directly against the table.
- file: src/__tests__/integration/factories/case-query.factory.spec.ts
  name: replays the pinned version through the real store, answering it unchanged even after the real
    capability registration the case depends on is deleted directly against the table
  proves: Corrected reference to the renamed identifier alongside criterion 7 — read-case refuses (CaseVersionNotValidError)
    once a dependency is deleted, while replay of the same pinned version is unaffected and answers unchanged,
    over the real store.
  fails_when: read-case stops refusing after the capability is deleted, or replay's answer for the same
    version changes, or replay itself starts raising CaseVersionNotValidError.
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: joins several structural violations into the one CaseVersionNotValidError
  proves: Corrected reference — several structural violations are still joined into one instance of the
    renamed class.
  fails_when: the joined violations no longer arrive on one CaseVersionNotValidError instance, or the
    import fails to resolve.
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: joins several coherence violations into the one CaseVersionNotValidError
  proves: Corrected reference — several coherence violations are still joined into one instance of the
    renamed class.
  fails_when: the joined violations no longer arrive on one CaseVersionNotValidError instance.
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: names only the structural violations, never a coherence one, when a document fails both a structural
    rule and what would otherwise be a coherence rule — a document that fails to parse never reaches the
    coherence checks
  proves: Corrected reference — a document failing structurally still short-circuits before the coherence
    module runs, reported as CaseVersionNotValidError.
  fails_when: a structurally-failing document's refusal starts naming a coherence violation too, or stops
    being a CaseVersionNotValidError.
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: refuses at a later read a case that validated earlier, once the glossary no longer holds a concept
    it depends on
  proves: Corrected reference — validation-runs-at-every-read still re-checks and refuses (CaseVersionNotValidError)
    once a dependency the case relies on is later withdrawn from the glossary.
  fails_when: a later read of the same version no longer refuses once the glossary forgets the concept.
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: refuses at a later read a case that validated earlier, once the capability registry no longer
    answers a concept it depends on
  proves: Corrected reference — the same later-onset re-check for a capability-registry dependency, still
    refusing as CaseVersionNotValidError.
  fails_when: a later read of the same version no longer refuses once the capability registry forgets
    the concept.
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: replays a pinned version without running the coherence checks at all, answering the case even
    though the same content would refuse at read-case
  proves: Corrected reference alongside criterion 7 — replay answers a version that read-case would refuse
    (CaseVersionNotValidError), because replay never runs the coherence check at all.
  fails_when: replay starts refusing, or read-case stops refusing, for the same coherence-failing content.
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: answers a document that would fail read-case structurally, rather than refusing it, because replay
    skips the structural refusal too
  proves: Corrected reference alongside criterion 7 — replay answers a version that read-case would refuse
    (CaseVersionNotValidError) for a structural violation, unaffected by this correction.
  fails_when: replay starts refusing, or read-case stops refusing (CaseVersionNotValidError), for the
    same structurally-invalid content.
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: refuses with CaseNotFoundError, naming the slug and version, when no version is stored at all
  proves: Criterion 6 (read-case branch) — an unknown slug/version still refuses through CaseNotFoundError,
    entirely unaffected by the rename.
  fails_when: an unknown slug or version stops raising CaseNotFoundError from readCase.
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: refuses with CaseNotFoundError, naming the slug and version, when no version is stored at all
    (readCaseInputRequirements)
  proves: Criterion 6 (input-requirements branch) — an unknown slug/version still refuses through CaseNotFoundError
    from readCaseInputRequirements too, unaffected by the rename.
  fails_when: an unknown slug or version stops raising CaseNotFoundError from readCaseInputRequirements.
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: refuses a structurally invalid case version the same way read-case does, naming the violation
    in a CaseVersionNotValidError
  proves: Corrected reference — readCaseInputRequirements's own structural refusal still names the renamed
    class and violation, unaffected in behavior by this correction (only the identifier changed).
  fails_when: readCaseInputRequirements stops raising CaseVersionNotValidError for a manifest-less case,
    or the violations array no longer names "the case declares no hypothesis".
- file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  name: refuses through the real wiring a case document declaring no hypothesis, naming the structural
    violation
  proves: Corrected reference through this integration file's own real-wiring path — unaffected in behavior,
    only the identifier changed.
  fails_when: the real wiring stops raising CaseVersionNotValidError for a manifest-less case, or the
    violations array no longer names "the case declares no hypothesis".
- file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  name: refuses through the real wiring, before the coherence module or CaseVersionNotValidError ever
    runs, a hypothesis-revision whose collected concept the glossary does not hold — the real store's
    own foreign key from hypothesis_revision_collects into concepts, never reachable through the fake
    store the unit-level proof stands in with
  proves: Corrected reference — a real foreign-key failure at write time still surfaces at the following
    read as CaseVersionNotValidError, unaffected in behavior by this correction.
  fails_when: this real foreign-key path stops surfacing as CaseVersionNotValidError at the subsequent
    read.
not_applicable:
- edge_case: Concurrent revalidating reads against the same stored version, one arriving mid-write of
    a later version
  why: No criterion of this task states a concurrency guarantee, and validation-runs-at-every-read is
    a per-request re-check with no ordering claim between requests; a test asserting one would bind an
    interleaving nothing here decided.
- edge_case: A dependency (the database, the glossary, the capability registry) that is slow or unavailable
    during a revalidating read
  why: This task changes only which status and identifier a validation failure answers with; how an unrelated
    dependency failure is handled is unchanged by this correction and carries its own tests elsewhere,
    untouched by this delivery.
untested:
- Criterion 5 ("No file under the backend target source root names the identifier CaseNotValidError")
  is verified here by an exhaustive grep across src/src for the literal string, which came back empty
  after this correction — but no test in the suite performs that scan itself. No existing convention in
  this codebase runs a repository-wide naming check as a vitest test (the __tests__ tree holds no such
  scanning spec), so this criterion is proven by this proof's own manual check rather than by an automated,
  re-runnable test; a later file reintroducing the identifier would not be caught by the suite.
- That the HTTP envelope's `details` field (not just `code`) reports the violations array for a 409 CaseVersionNotValidError
  response — criterion 2 only requires the code field, which is directly tested, but no HTTP-level test
  in the corrected files asserts the `details` shape for this specific error the way error-handler.middleware.spec.ts
  does for CaseNotFoundError and InvestigationWriteDeadlineExceededError. domainEnvelope()'s unedited
  behavior (reporting error.context as details for any error carrying one) is exercised generically for
  other error classes but not pinned specifically for CaseVersionNotValidError at the HTTP layer.
- 'Whether readCaseInputRequirements revalidates a stored version against the coherence validator family
  (caseCoherenceViolations/refuseIncoherence), as opposed to only the structural one (structuralCase).
  This task''s own `## Notes` names this explicitly as UNDERDETERMINED, from the specification: ''nothing
  in this task''s own criteria requires every non-replay read to revalidate against *both* validator families
  (coherence and structural) rather than one alone; an implementation that leaves a route revalidating
  structurally but never calling the coherence check (e.g. a route that parses the document but never
  runs refuseIncoherence) would satisfy every criterion here while still answering 200 for a stored version
  that fails only a coherence rule on that route. Passes: an implementation renaming the class and mapping
  it to 409 while leaving case-query.service.ts''s readCaseInputRequirements (which calls structuralCase
  but never refuseIncoherence) exactly as it stands today.'' src/__tests__/unit/case/case-query.service.spec.ts
  carries an it.todo with that exact title immediately after the existing test that already locks in the
  opposite (''answers a draft version''s input requirements even though the same content currently fails
  read-case''s own coherence check''), so a reader sees the gap named at the point it applies without
  a live assertion turning an already-adjudicated non-criterion into a suite failure.'
divergences:
- from: the task's implementation record, whose `files` list names only production source
  departure: 'This proof edits eight test files the implementation record does not list: the six the task
    explicitly named as broken by the rename (simulate-case.controller.spec.ts, case-fixture-reads-clean.spec.ts,
    case-input-requirements.routes.spec.ts, case-query.factory.spec.ts, case-query.service.spec.ts, read-case.routes.spec.ts),
    plus src/__tests__/unit/errors/status-map.spec.ts, which needed a new test rather than a rename (it held no reference
    to the old identifier at all, but exhaustively tested every other STATUS_BY_ERROR_CLASS entry except
    this task''s new one), and the same case-query.service.spec.ts file a second time for the it.todo
    described below.'
  why: Explicitly authorized by this delegation's caller for the six files, since the rename otherwise
    left them referencing a deleted export; status-map.spec.ts's addition follows the same exhaustive
    pattern the file already uses for every sibling entry and is required to prove criterion 1's core
    mapping in isolation from any route.
- from: this proof's own first draft, which wrote the UNDERDETERMINED counter-example as a live, asserting
    `it()` block in src/__tests__/unit/case/case-query.service.spec.ts
  departure: That test is now `it.todo(...)`, carrying the identical descriptive name but no callback
    and no assertion, so it is reported as pending rather than run — it cannot fail the suite. The corresponding
    entry moved out of `tests` (a todo proves nothing, by the contract's own sense of the word) and into
    `untested`, quoted against the task's own UNDERDETERMINED note.
  why: The suite must pass as a whole for this record to be written. A live assertion over the exact implementation
    the task's own Notes already adjudicated as satisfying every criterion turns a documented, already-settled
    gap into a hard failure of a green requirement, which is not what recording an UNDERDETERMINED counter-example
    is for. it.todo preserves the documentation value — a reader still sees the gap and why it isn't asserted
    — without blocking delivery.
---

## What it is
Proves rename-and-map-status: every criterion the task states is exercised across the two HTTP routes that reach a revalidating read (read-case, input-requirements), the service layer beneath them, and the real store wiring for the failures the fake store cannot reach (a foreign-key violation, a dependency withdrawn after an earlier valid read). Six pre-existing test files broken by the rename were corrected to the renamed identifier and, where they asserted the pre-correction 500/INTERNAL_ERROR behavior, to the corrected 409/CaseVersionNotValidError shape; a seventh file (status-map.spec.ts) gained the one test its own exhaustive per-entry convention was missing for this task's new map entry.

## Notes
Two suite attempts before this one failed for reasons this proof answers, both left standing on disk under their own run names (case-not-valid-status-mapping-rename-and-map-status-suite and -suite-2): the lab Postgres instance the global setup hook depends on was unreachable, diagnosed twice as `cause: setup` — no test ran, and nothing about this change was implicated.
A third attempt (…-suite-3), once the database was reachable again, ran every test and failed exactly one: a first draft of this proof's own it()-style test for the task's UNDERDETERMINED note ("revalidates a coherence violation before answering readCaseInputRequirements..."). Diagnosed by a failure-diagnostician as `cause: code` reading the specification node in isolation — but the task's own `## Notes` had already adjudicated, before this delivery began, that an implementation leaving readCaseInputRequirements exactly as it stands satisfies every one of this task's own criteria. Asserting the gap as a required-passing test would have turned an already-settled non-criterion into a blocking suite failure; the test was rewritten as `it.todo(...)`, preserving the documentation without asserting behavior this task never owed. The suite then passed clean on the fourth attempt (…-suite-4), which this record's `run` field points to.
