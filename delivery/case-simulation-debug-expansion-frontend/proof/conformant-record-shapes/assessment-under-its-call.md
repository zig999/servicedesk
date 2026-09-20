---
target: frontend
title: A run's assessment is present only where a writing call produced one -- proof
summary: New tests establish that a shown run whose consolidation discriminant states no call happened
  presents a static, non-borrowed message wherever the assessment would render (panel and compare), that
  the false branch is expressible without any of the five fields, and every pre-existing citation confirms
  the nine fixture builders, the production builder and the run-record spec already carry the nested shape
  across the type-checked tree.
implementation: sha256:d4d9d659b5e9b0b34345b0339ca38d10c61b0b146c45e5e171c1409e95225ba6
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/conformant-record-shapes-assessment-under-its-call-suite
tests:
- file: src/routes/case-simulation-case-result-panel.spec.ts
  name: shows an explicit no-call message in place of the outcome line, the customer-facing text box and
    the Debug > Prompt tab, rather than an empty or dashed placeholder
  proves: 'criteria 2, 4 and 6, and the task''s UNDERDETERMINED entry (the disclosed static message is
    what actually renders); constructing consolidationCall: { called: false } directly stands as the expressibility
    criterion 4 requires'
  fails_when: 'for a run whose consolidationCall states { called: false }, any of the three assessment-bearing
    regions renders anything other than exactly three occurrences of the static message, or the { called:
    false } literal stops type-checking because the false branch has grown a required field'
- file: src/routes/case-simulation-case-result-panel.spec.ts
  name: shows "no consolidation call" in that run's own list caption instead of an outcome
  proves: criterion 6's gating of the per-run list caption's own read of run.consolidationCall, and the
    disclosed no-call caption text
  fails_when: 'a run whose consolidationCall states { called: false } shows anything other than the literal
    "no consolidation call" in its own row of the session''s run list'
- file: src/routes/case-simulation-case-result-panel.spec.ts
  name: keeps every assessment region on the no-call message for the shown run, even though an earlier
    run in the same session carries its own consolidation answer
  proves: criterion 8 -- a shown run that carries no assessment presents nothing drawn from another run
    of the session
  fails_when: with an earlier run in the session carrying its own outcome and text, the shown run (itself
    made no consolidation call) shows fewer than three occurrences of the static no-call message
- file: src/routes/case-simulation-case-result-compare.spec.ts
  name: renders both runs' own hypothesis verdicts side by side when one of the two runs made no consolidation
    call at all
  proves: criterion 7 -- compare.tsx needs none of the five assessment fields, demonstrated concretely
    with a run whose discriminant states no call happened
  fails_when: 'rendering the Compare view with one run whose consolidationCall states { called: false
    } throws, renders nothing, or fails to show that run''s own hypothesis verdict beside the other run''s'
- file: src/routes/case-simulation-cockpit-adapters-run-record.spec.ts
  name: carries the run's own outcome, referral, determining hypothesis, text, register and per-hypothesis
    verdicts, plus its own durations, cost, consolidation call and whole raw payload, all read from the
    response it is given
  proves: criteria 5 and 10 -- toNewCaseResultRun builds the five assessment fields only inside the consolidationCall
    literal on which it sets called true, and this spec's own assertion checks exactly that nested shape
  fails_when: toNewCaseResultRun places any of the five fields at the top level of the returned run instead
    of nested inside the called:true consolidationCall, or this test's expected value is loosened to also
    accept the flat shape
- file: src/routes/case-simulation-case-result-types.spec.ts
  name: resolves the two selected runs in this history's own chronological (array) order, never the order
    the two were selected
  proves: criterion 3 (register sits in the same object as text, usage, elapsedMs and prompt) and this
    file's own share of criterion 9
  fails_when: makeRun's default consolidationCall stops carrying register alongside text/usage/elapsedMs/prompt
    in one object, or places any of the five fields at the top level of the run
- file: src/routes/case-simulation-case-result-panel.spec.ts
  name: shows the outcome, the referral and the determining hypothesis of the last run once one has completed
  proves: this file's own share of criterion 9
  fails_when: this file's calledAssessment/makeRun default places any of the five fields at the top level
    of the run instead of nested inside consolidationCall
- file: src/routes/case-simulation-case-result-panel-debug.spec.ts
  name: presents a Debug block with a Prompt tab once a case simulation run has completed
  proves: this file's own share of criterion 9
  fails_when: this file's calledAssessment/makeRun default places any of the five fields at the top level
    of the run instead of nested inside consolidationCall
- file: src/routes/case-simulation-case-result-panel-evidence.spec.ts
  name: presents one entry for each evidence item the shown run's own record collected, and shows an earlier
    run's own evidence in place of it once that run is shown
  proves: this file's own share of criterion 9
  fails_when: this file's makeRun default places any of the five fields at the top level of the run instead
    of nested inside consolidationCall
- file: src/routes/case-simulation-case-result-panel-json.spec.ts
  name: presents the earlier run's own raw payload once that run is shown, in place of the last run's
  proves: this file's own share of criterion 9
  fails_when: this file's makeRun default places any of the five fields at the top level of the run instead
    of nested inside consolidationCall
- file: src/routes/case-simulation-case-result-panel-totals.spec.ts
  name: presents the earlier run's own cost and durations once that run is shown, in place of the last
    run's
  proves: this file's own share of criterion 9
  fails_when: this file's makeRun default places any of the five fields at the top level of the run instead
    of nested inside consolidationCall
- file: src/routes/case-simulation-case-result-panel-compare.spec.ts
  name: keeps the Compare button disabled until exactly two runs are checked
  proves: this file's own share of criterion 9
  fails_when: this file's makeRun default places any of the five fields at the top level of the run instead
    of nested inside consolidationCall
- file: src/routes/case-simulation-case-result-compare.spec.ts
  name: shows both runs' own verdict for a hypothesis both of them judged
  proves: this file's own share of criterion 9
  fails_when: this file's makeRun default places any of the five fields at the top level of the run instead
    of nested inside consolidationCall
- file: src/hooks/use-case-simulation-history.spec.ts
  name: appends a newly-completed run to the end of the history, in the order runs complete
  proves: this file's own share of criterion 9
  fails_when: this file's calledAssessment/newRun default places any of the five fields at the top level
    of the run instead of nested inside consolidationCall
- file: src/hooks/use-case-simulation-cockpit-evaluations.spec.ts
  name: appends exactly one run to the Case result region's own run history for a completed full-case
    run
  proves: part of criterion 11 -- a genuine, non-fixture reader of a real CaseResultRun (outside the task's
    named ten files) narrows on consolidationCall.called before reading .outcome and type-checks against
    the corrected type
  fails_when: this test's narrowing check stops compiling against CaseResultRun, or the hook's real produced
    run again exposes .outcome at the top level, letting this test read it without narrowing
not_applicable:
- edge_case: A duplicate run, or uniqueness of any kind among a session's runs
  why: none of this task's eleven criteria state a uniqueness constraint
- edge_case: Two operations against one subject at once (a race between two simulate calls)
  why: this task introduces no new concurrency and none of its criteria mention timing between calls
- edge_case: A dependency that fails or answers slowly
  why: toNewCaseResultRun and the render sites are pure transforms and reads over a value already in hand
- edge_case: 'An empty runs collection (runs: [])'
  why: pre-existing, unmodified behavior, unaffected by this task
- edge_case: determiningHypothesis absent (the confirmed-nothing/fallback boundary)
  why: already covered by a pre-existing test, unaffected by the field's move inside the discriminant
untested:
- Criterion 11 (the whole frontend type-checks with no error arising from CaseResultRun in any file) is
  a totality decided by the project's typecheck step, not by any finite vitest assertion; the citations
  above are a sample, not a decision, of that totality -- the captured build's typecheck step is what
  settles it.
- Criteria 1 and 2 (the five fields sit only in the true branch, none in the false branch) are demonstrated
  by every existing fixture and this proof's own false-branch construction, but neither closes the gap
  of an *optional* field being added to the false branch or to CaseResultRun itself -- that would compile
  and pass every existing test unchanged, since an unset optional field is indistinguishable at runtime
  from one never declared. Deciding that requires reading the type declaration, not a test.
- domain/investigation/assessment's fact whole includes semantic constraints (text cannot contradict outcome,
  register is whichever the call actually used, determining_hypothesis is absent exactly when nothing
  confirmed) this frontend task does not implement and no frontend test can decide; this task's tests
  establish only the structural shape.
- rules/investigation/the-consolidation-answer-states-its-register's fact whole is a statement about what
  a consolidation call's own answer states (call-level sourcing semantics); this task's criterion 3 tests
  only the frontend-observable slice, per its own REMAINDER note.
- rules/investigation/a-simulation-session-retains-its-runs-and-shows-one's fact whole spans retention,
  selection and presenting evidence/evaluations/cost/durations from a run's own record; this task's own
  REMAINDER note states only the assessment half is answered here.
- scenarios/investigation/a-single-hypothesis-is-simulated's fact whole is a given/when/then over the
  simulate-hypothesis operation; this task's type change makes only the 'resolves no outcome' clause expressible,
  not the operation's dispatch behavior.
- contracts/investigation/case-simulation's fact whole is the api contract for both operations; this task's
  type only makes one half of simulate-hypothesis's own guarantee expressible on one client-side type.
---

## What it is
Fourteen citations and three new tests, together proving the assessment's move inside CaseResultRun's consolidation discriminant, the disclosed no-call rendering, and the non-borrowing guarantee across the panel and compare surfaces.

## Notes
None.
