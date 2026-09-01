---
title: Run-diagnosis persistence deadline hotfix, first review
summary: What four passes found over the persistence-deadline-uses-remaining-time-and-retries delivery
  — run-diagnosis.ts's stage-bound/retry/id-settlement fix, status-map.ts's new HTTP 500 mapping, and
  the four test files proving them.
reviewed:
- src/investigation/run-diagnosis.ts
- src/errors/status-map.ts
- src/__tests__/unit/investigation/run-diagnosis.spec.ts
- src/__tests__/unit/errors/status-map.spec.ts
- src/__tests__/unit/http/error-handler.middleware.spec.ts
- src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
tasks:
- task/run-diagnosis-persistence-deadline-hotfix/persistence-deadline-uses-remaining-time-and-retries
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run passed in full, so there was no failure to diagnose
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
coverage:
- criterion: A write whose first attempt is issued after collection, judgment and writing have together
    consumed enough of the declared total that less than the full persistence nominal budget remains before
    the deadline is bounded by that smaller remaining figure — never by the persistence nominal budget
    computed against the request's original entry instant.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: bounds persistence by the time actually remaining once collection has already consumed part
      of the declared deadline, never by the deadline computed against the request's original entry instant
  - file: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
    name: answers a named 500 reporting InvestigationWriteDeadlineExceededError, never the assessment,
      and leaves no investigation readable by its id immediately afterward, when the investigation write
      is slowed past the persistence deadline
  why: Only collection's consumption is exercised — judgment's and writing's own elapsed time are zero
    in every fixture, so a bound computed from collection's elapsed time alone would still pass every
    test here. The e2e test cannot discriminate the fix from the old computation either, since both answer
    a remaining figure between 0 and 2000ms under its own fixture.
- criterion: The persistence stage's own nominal budget stays PERSISTENCE_STAGE_BUDGET_MS = 2000 milliseconds,
    unchanged by this fix.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: bounds persistence at the nominal two-second budget, never waiting the whole of an ample remaining
      deadline
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: holds the first write attempt to the whole of the persistence stage bound — its own unchanged
      2000ms nominal budget — rather than capping it below to reserve time for a retry
- criterion: Where the persistence stage's own bound — the minimum of its nominal budget and the time
    remaining before the deadline when persistence begins — is zero or less, no write attempt is issued
    at all and InvestigationWriteDeadlineExceededError is raised immediately, without the store ever being
    called.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: issues no write attempt at all when persistence's own bound is zero or less, raising immediately
      instead
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: clamps persistence's own bound to zero rather than negative, once the given deadline has already
      elapsed relative to now
- criterion: A write's first attempt is held to the whole of the persistence stage bound and never capped
    below it to reserve time for a retry — it runs until it settles or the stage bound elapses, whichever
    comes first.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: holds the first write attempt to the whole of the persistence stage bound — its own unchanged
      2000ms nominal budget — rather than capping it below to reserve time for a retry
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: does not retry when the first attempt runs until the stage bound itself elapses without settling
- criterion: 'A write whose first attempt fails at some point before its own bound (the full persistence
    stage bound: the minimum of its nominal budget and the time remaining before the deadline when persistence
    began) elapses, leaving more than zero milliseconds of that bound unspent, is retried exactly once,
    bounded by whatever of that same stage bound remains unspent after the first attempt''s own elapsed
    time.'
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: retries exactly once after a first attempt fails outright, succeeding on that retry when it
      still fits within what remains of the stage bound
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: bounds the retry by whatever of the stage bound the first attempt's own elapsed time left unspent,
      rather than granting it a fresh budget of its own
- criterion: A write whose first attempt fails with zero or fewer milliseconds of the stage bound left
    unspent, or whose first attempt runs until the stage bound itself elapses without settling, is not
    retried, and InvestigationWriteDeadlineExceededError is raised immediately.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: does not retry when the first attempt runs until the stage bound itself elapses without settling
  why: Only the bound-elapsed half is exercised. Nothing has a first attempt reject with zero or fewer
    milliseconds of the bound left unspent and then assert that no second write call was issued — an implementation
    that retried in that case would still pass here, since the same error is eventually raised regardless.
- criterion: 'Any write attempt — the first attempt or the retry — that finds a record already persisted
    under the investigation''s own id counts as a write that settled successfully: it persists no second
    record, and does not raise InvestigationWriteDeadlineExceededError.'
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: resolves normally, with no retry issued, when the first write attempt finds the investigation
      already stored under its own id
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: settles successfully without raising the deadline error when the retry — not the first attempt
      — finds the investigation already stored
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: settles both of two concurrent runs for the same investigation id successfully, neither raising
      the deadline error, while the store still ends up holding exactly one record
- criterion: InvestigationWriteDeadlineExceededError is raised whenever neither the first attempt nor
    the retry (where one is issued) settles successfully — whether because the persistence stage's own
    bound elapsed first, an attempt failed outright, or no time remained for a retry — and is never raised
    once a write has settled successfully, including an attempt that found the record already there.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: raises InvestigationWriteDeadlineExceededError instead of resolving, when persistence does not
      conclude within what remains of the declared deadline
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: raises InvestigationWriteDeadlineExceededError, not the raw failure, once both a genuine first-attempt
      write failure and its retry reject outright
  why: Two of the three enumerated reasons are exercised (bound elapsing first, an attempt failing outright);
    the third — 'no time remained for a retry', i.e. a first attempt failing with the bound already spent
    — is never taken by any test in this set.
- criterion: Every path that raises InvestigationWriteDeadlineExceededError is answered to the requester
    as an HTTP 500 response naming InvestigationWriteDeadlineExceededError as the reported condition.
  state: covered
  tests:
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves InvestigationWriteDeadlineExceededError to 500
  - file: src/__tests__/unit/http/error-handler.middleware.spec.ts
    name: answers InvestigationWriteDeadlineExceededError with a named 500 envelope, naming the error
      rather than falling back to the generic, unnamed one
  - file: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
    name: answers a named 500 reporting InvestigationWriteDeadlineExceededError, never the assessment,
      and leaves no investigation readable by its id immediately afterward, when the investigation write
      is slowed past the persistence deadline
- criterion: A write whose first attempt settles successfully before its own bound elapses answers normally,
    with no retry attempted and no change to the written investigation.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: does not resolve until persistence has actually written the investigation, then resolves with
      the written investigation's own assessment
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: holds the first write attempt to the whole of the persistence stage bound — its own unchanged
      2000ms nominal budget — rather than capping it below to reserve time for a retry
  why: The 'answers normally' half is exercised; the 'no retry attempted' half is not — the stores used
    on this path do not count write attempts, so a spurious second attempt after a successful first would
    go unnoticed and the tests would still pass.
findings:
- pass: conformance
  file: src/investigation/run-diagnosis.ts
  where: lines 257-260, persistenceStageBoundMs
  evidence: 'const elapsedBeforePersistenceMs = durations.collection + durations.judgment + durations.writing;

    return Math.min(PERSISTENCE_STAGE_BUDGET_MS, Math.max(0, deadline - now - elapsedBeforePersistenceMs));'
  cost: The node's "remaining time" is the distance from the present instant to the absolute deadline;
    what is subtracted here is the sum of three measured stage durations, which is exactly the quantity
    the node's own Description sets aside — "Summing stage budgets and calling the sum a deadline leaves
    nothing for the overhead between stages." Everything between and around those three stages (buildSubject,
    resolve-and-narrow, buildInvestigation, and scheduling gaps) is uncounted, so persistence can be granted
    more than actually remains and the response can land after the absolute deadline — the one outcome
    the node's own fitness ("no stage granted more than the remaining time") exists to catch. The code
    reads as if it honours the constraint, and only a load test at saturation would show otherwise.
  correction: Compute the bound against the actual instant persistence begins rather than against a sum
    of stage durations — take that instant as a parameter of writeWithinDeadline if the module is to keep
    taking no clock of its own — so "remaining" is the remaining time the node names.
- pass: conformance
  file: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  where: line 86, the TOTAL_DEADLINE_BUDGET_MS constant, and line 373 where it forms the diagnose call's
    deadline
  evidence: 'const TOTAL_DEADLINE_BUDGET_MS = 30_000;

    … (line 373, not contiguous) …

    return runner({ ...call, now, deadline: now + TOTAL_DEADLINE_BUDGET_MS });'
  cost: The declared total this end-to-end proof runs the real pipeline under is thirty seconds, where
    the node fixes it at twenty; the persistence behaviour is proven under a total the business never
    declared, and a reader who opens the two proofs of this same behaviour finds 20_000 in the unit fixture
    and 30_000 here with nothing saying which is the decided total.
  correction: Compose the call under the twenty-second total the node declares (and shorten WRITE_DELAY_MS
    accordingly, since a delay only has to exceed persistence's own two-second bound), so no fixture in
    the suite states a total deadline the specification does not hold.
- pass: conformance
  file: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  where: lines 457-466, the body assertions inside assertDeadlineExceeded
  evidence: "const remainingMs = (body.error.details as { id: string; remainingMs: number }).remainingMs;\n\
    expect(body.error.details).toEqual({ id, remainingMs });\nexpect(remainingMs).toBeGreaterThan(0);\n\
    expect(remainingMs).toBeLessThanOrEqual(2_000);\nexpect(body.error.message).toBe(\n  `the investigation\
    \ with id \"${id}\" could not be written within the ${remainingMs}ms remaining of the declared deadline,\
    \ so no assessment is returned without a corresponding record`,\n);"
  cost: The node fixes the status and the condition's name and stops there; what the requester actually
    reads — the sentence, and the disclosure of the investigation id and of how many milliseconds remained
    — is decided by this assertion and by the error class it pins. The next reader asking what a diagnose
    tells a requester whose write did not settle looks in the specification, finds only "HTTP 500 reporting
    an InvestigationWriteDeadlineExceededError", and has to read a test to learn the rest; changing the
    wording or withholding the remaining-time figure is then a test edit rather than an amendment to the
    rule.
  correction: Either the message and the details the response discloses belong in the specification alongside
    the status the rule already fixes, and the test reads them from there, or the test asserts only what
    the node holds — the 500 and the reported condition's name.
- pass: conformance
  file: src/__tests__/unit/http/error-handler.middleware.spec.ts
  where: lines 82-89, the expected envelope in the test named "answers InvestigationWriteDeadlineExceededError
    with a named 500 envelope…"
  evidence: "expect(response.json()).toEqual({\n  error: {\n    code: 'InvestigationWriteDeadlineExceededError',\n\
    \    message:\n      'the investigation with id \"investigation-1\" could not be written within the\
    \ 300ms remaining of the declared deadline, so no assessment is returned without a corresponding record',\n\
    \    details: { id: 'investigation-1', remainingMs: 300 },\n  },\n});"
  cost: This is the second place the requester-facing sentence is pinned, and the only two places it is
    written down are both tests. What the system tells a requester whose investigation was not recorded
    is decided in the suite rather than by the business, and a person asked to reword it has no node to
    change.
  correction: State what the requester is told in rules/investigation/no-stage-aborts-on-its-deadline
    alongside the status it already fixes, and let this test assert against that; or assert only the status
    and the reported condition's name here.
- pass: conformance
  file: src/errors/status-map.ts
  where: lines 61-65 of the header comment, the InvestigationWriteDeadlineExceededError paragraph
  evidence: '// InvestigationWriteDeadlineExceededError''s HTTP 500

    // (rules/investigation/no-stage-aborts-on-its-deadline, whose own statement

    // closes with "a persistence that settles no write, in either case, is

    // answered with an HTTP 500 response reporting an

    // InvestigationWriteDeadlineExceededError")'
  cost: The rule's closing clause is copied into this file as prose. The map entry below it — [InvestigationWriteDeadlineExceededError,
    500] — is the code that answers to the node; the paragraph duplicates the node's text where nothing
    reads it, so an amendment to the rule leaves this file asserting the superseded wording with no mechanism
    that would notice.
  correction: Remove the quoted clause; the entry in STATUS_BY_ERROR_CLASS is what encodes the node, and
    the file-to-node link belongs in the trace.
- pass: conformance
  file: src/investigation/run-diagnosis.ts
  where: lines 34-48 of the module header, and the docblock over writeWithinDeadline at lines 225-236
  evidence: '// Persistence is the one stage rules/investigation/no-stage-aborts-on-its-deadline

    // exempts from degrading: its own stage bound is the minimum of its nominal

    // budget and whatever of the propagated deadline still remains once

    // collection, judgment and writing have already run

    … (line 229, not contiguous) …

    // of zero or less issues no write at all, raising at once; otherwise a first

    // attempt is held to the whole of that bound and, only where it fails before

    // the bound elapses, one retry runs in whatever of it is left'
  cost: The rule's whole conditional structure — the bound, the zero-or-less branch, the un-truncated
    first attempt, the single retry in what is left — is re-derived here in prose, sentence for sentence,
    with no test and no validator holding this prose to the node. When the rule is amended this module
    reads as though it still governs, and a reader deciding which of the two was actually decided has
    only wording to go on.
  correction: Remove the restatement; the branches in writeWithinDeadline, persistenceStageBoundMs and
    persistWithinBound are what answer to the node, and the node is where its own statement belongs.
- pass: conformance
  file: src/__tests__/unit/errors/status-map.spec.ts
  where: line 342, and lines 418-427, the test named "the header names InvestigationWriteDeadlineExceededError's
    HTTP 500 as a fact rules/investigation/no-stage-aborts-on-its-deadline decides, quoting its own closing
    clause"
  evidence: "expect(header).toContain('thirteen specification nodes now fix a status as a decided fact');\n\
    … (line 424, not contiguous) …\nexpect(header).toContain(\n  'a persistence that settles no write,\
    \ in either case, is answered with an HTTP 500 response reporting an InvestigationWriteDeadlineExceededError',\n\
    );"
  cost: 'The rule''s own sentence is now required, verbatim, to appear in a source comment: the suite
    goes red if the comment stops quoting it, and stays green if the node itself is amended and the comment
    is not. That makes status-map.ts''s prose a second, test-enforced home for the rule''s wording, and
    the day the two disagree the failing test points at the comment as the thing to correct — which never
    corrects the node.'
  correction: Drop the assertions over the header's prose; prove the fact the node holds by exercising
    statusForError (the test at line 263 already does), and let the rule's wording live only in the rule.
- pass: standard
  file: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  where: requireDatabaseUrl(), lines 73-79, reached from beforeAll's createDatabaseConnection and from
    placeholderEnv()'s DATABASE_URL field at line 332
  cites: STK-08
  evidence: "function requireDatabaseUrl(): string {\n  const url = process.env.DATABASE_URL;\n  if (!url)\
    \ {\n    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to\
    \ run.');\n  }\n  return url;\n}\n[... lines 80-331 omitted ...]\n    DATABASE_URL: requireDatabaseUrl(),"
  cost: The one environment value this proof runs the real database against is admitted by a truthiness
    check instead of the schema config/env.ts holds, so this file accepts a DATABASE_URL the schema would
    refuse and the two acceptances diverge the moment the schema gains a constraint — a malformed value
    then fails inside the pg driver, in a stack that never names the variable, and the same hand-check
    is copied into every sibling integration proof that reads the environment.
  correction: Parse the variable through a Zod schema rather than a guard — either loadEnv itself, or
    a DATABASE_URL-only schema exported from config/env.ts that loadEnv also composes — so the acceptance
    this file performs is the same acceptance production performs.
- pass: standard
  file: src/__tests__/unit/errors/status-map.spec.ts
  where: line 334, the test's name, against its own assertion at line 342
  cites: TST-02
  evidence: "it(\"the header comment names eleven specification nodes that now fix a status as a decided\
    \ fact, and states ConnectorConfigurationNotWellFormedError's 422 [...] as facts their own rules decide\
    \ rather than as this project's own engineering decision\", async () => {\n[... lines 335-341 omitted,\
    \ including the comment \"the count in prose changed again from twelve to thirteen\" ...]\n  expect(header).toContain('thirteen\
    \ specification nodes now fix a status as a decided fact');"
  cost: The run prints this test as expecting eleven specification-fixed statuses while it in fact demands
    thirteen, so whoever reads the failure line opens the file looking for a count the test never asserted;
    the name has already gone stale across two increments (eleven to twelve to thirteen) without ever
    failing, which is exactly how a name stops being usable as the record of what broke.
  correction: Name the test for the behavior rather than for a running total — that the header states,
    for each specification-fixed status, the node that fixes it and the clause it fixes it in — so the
    name does not need re-editing every time the table grows, and move the count itself into the assertion
    where a change already forces an edit.
- pass: standard
  file: src/investigation/run-diagnosis.ts
  where: stageTimeout and raceWriteAttempt, lines 295-333
  cites: MNT-03
  evidence: "function stageTimeout(boundMs: number): StageTimeout {\n  let timerId: ReturnType<typeof\
    \ setTimeout> | undefined;\n  const promise = new Promise<typeof WRITE_TIMED_OUT>((resolve) => {\n\
    \    timerId = setTimeout(() => resolve(WRITE_TIMED_OUT), boundMs);\n  });\n  return { promise, cancel:\
    \ () => clearTimeout(timerId) };\n}"
  cost: This is the third construction of "one shared timer, resolved to a marker once the bound elapses,
    raced by every attempt" in the investigation tree — judgment-stage.ts's createDeadlineGuard and evidence-collection-stage.ts's
    raceObservation are the other two, and this file's own comments name both as the shape it follows.
    The three already disagree on what happens to the timer (this one cancels it, createDeadlineGuard
    never does, raceObservation clears it per call) with nothing recording whether the disagreement is
    deliberate, so the next correction to a leaked timer or an off-by-one bound lands in one of them and
    the readers of the other two have no way to learn it was made.
  correction: Extract the shared, cancellable deadline signal and the race over it into one helper the
    three stages call, with the differences that are genuine — a synchronous elapsed() read, a per-call
    versus per-stage lifetime — expressed as parameters of that one helper rather than as three independent
    bodies.
---

## What it is

Four passes over the persistence-deadline-uses-remaining-time-and-retries delivery: coverage
(one entry per criterion), specification conformance (against the four nodes this task
implements), the project's own standard (the 35 rules a reading decides), and failures (did not
run — the captured run passed in full).

## Notes

The conformance pass's most consequential finding is that persistenceStageBoundMs computes
"remaining time" as the propagated deadline minus the sum of three measured stage durations
(collection, judgment, writing) rather than minus the actual elapsed wall-clock time since entry
— the exact pattern constraints/the-deadline-is-an-absolute-propagated-instant's own Description
warns against, since everything between and around those three stages (subject assembly,
resolve-and-narrow, investigation assembly, scheduling gaps) goes uncounted. This means the fix
may still grant persistence more time than genuinely remains under real scheduling load; nothing
in the captured suite would show this, since every test drives the pipeline with synthetic,
near-zero gaps between stages.
Both source files carry large explanatory comment headers restating specification nodes'
statements verbatim in prose; this review's conformance pass reports only the paragraphs that
restate a fact belonging to one of the four nodes this task implements (the docblocks in
run-diagnosis.ts and the header paragraph in status-map.ts) — whether source may carry comments
at all is a different question this pass does not decide.
The standard pass applied only the 35 rules the registry marks as decided by a reading; the 24 a
tool decides (20 lint, 2 secret-scan, 2 typecheck) already ran clean as steps of the captured
suite this review's own run repeated, and are not re-decided here.
This review captured its own run over the whole change at run/run-diagnosis-persistence-deadline-hotfix
(install, typecheck, lint, secret-scan, test, all passed) before spawning the passes; it carries
no `run` field on this record because the failures pass — the only pass that field belongs to —
did not run, there being no failure in that capture to diagnose.
