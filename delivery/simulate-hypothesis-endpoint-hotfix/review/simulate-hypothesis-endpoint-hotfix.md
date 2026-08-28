---
title: 'Review: simulate-hypothesis-endpoint-hotfix'
summary: What four passes found over the corrective fix wiring use-simulate-hypothesis.ts to the delivered
  POST /v1/simulate/hypothesis route.
reviewed:
- src/hooks/use-simulate-hypothesis.ts
- src/hooks/use-case-simulation-cockpit.ts
- src/hooks/use-case-simulation-cockpit.test-support.ts
- src/hooks/use-simulate-hypothesis.test-support.ts
- src/hooks/use-simulate-hypothesis-dispatch-safety.spec.ts
- src/hooks/use-simulate-hypothesis-request.spec.ts
- src/hooks/use-case-simulation-cockpit-hypothesis-requester.spec.ts
- src/routes/case-simulation-cockpit-adapters.spec.ts
- src/routes/case-simulation-ready-view.test-support.ts
tasks:
- task/simulate-hypothesis-endpoint-hotfix/fix-use-simulate-hypothesis-dispatch
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/simulate-hypothesis-endpoint-hotfix) passed clean on every step -- nothing
    failed to diagnose
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
coverage:
- criterion: The hook's mutation dispatches POST to /v1/simulate/hypothesis, never to /v1/cases/{slug}/versions/{version}/simulate-hypothesis.
  state: covered
  tests:
  - file: src/hooks/use-simulate-hypothesis-request.spec.ts
    name: issues its POST to exactly /v1/simulate/hypothesis, never a nested /v1/cases/{slug}/versions/{version}/simulate-hypothesis
      path
- criterion: 'The dispatched request body is exactly { case: { slug, version }, subject, requester, hypothesis
    }, matching simulateHypothesisRequestSchema''s required fields -- never the case-and-requester-less
    body the hook sent before.'
  state: covered
  tests:
  - file: src/hooks/use-simulate-hypothesis-request.spec.ts
    name: 'sends exactly {case: {slug, version}, subject, requester, hypothesis} in the POST body, naming
      the one hypothesis passed to onSimulate'
- criterion: The hook's typed success response models the route's own response shape -- evidence, evaluation,
    durations -- while still exposing no outcome and no assessment field.
  state: covered
  tests:
  - file: src/hooks/use-simulate-hypothesis-request.spec.ts
    name: returns exactly the evidence/evaluation/durations envelope the mocked response carried, with
      no other key present at runtime
  - file: src/hooks/use-simulate-hypothesis-request.spec.ts
    name: carries exactly evidence, evaluation and durations at runtime, never an outcome or an assessment
      key
  - file: src/hooks/use-simulate-hypothesis-request.spec.ts
    name: type-checks that SimulateHypothesisResult can never carry an outcome or assessment field, and
      that only `reason` stays exclusive to Evaluation's inconclusive branch (checked by this project's
      own typecheck step, TYP-04)
- criterion: onSimulate accepts a requester argument and forwards it unchanged into the dispatched body,
    the same way useSimulateCase's onSimulate already receives one from its caller.
  state: covered
  tests:
  - file: src/hooks/use-simulate-hypothesis-request.spec.ts
    name: carries the exact requester value onSimulate received, with no default and no transformation
  - file: src/hooks/use-simulate-hypothesis-request.spec.ts
    name: type-checks that SimulateHypothesisResult can never carry an outcome or assessment field, and
      that only `reason` stays exclusive to Evaluation's inconclusive branch (checked by this project's
      own typecheck step, TYP-04)
- criterion: use-case-simulation-cockpit.ts's onSimulateHypothesis call site passes subjectState.requester
    through to hypSim.onSimulate, the same value it already passes to caseSim.onSimulate.
  state: covered
  tests:
  - file: src/hooks/use-case-simulation-cockpit-hypothesis-requester.spec.ts
    name: dispatches the hypothesis-level request carrying the identical requester value the case-level
      dispatch already carried
- criterion: A dispatch against the live backend route for a case version whose manifest holds the named
    hypothesis returns exactly one evaluation for that hypothesis.
  state: partial
  tests:
  - file: src/hooks/use-simulate-hypothesis-request.spec.ts
    name: resolves a single evaluation object -- never an array -- carrying the hypothesis name onSimulate
      was called with
  why: Every request in the test set is answered by stubFetch, a mocked fetch handler, not a call against
    a running backend -- the shared use-simulate-hypothesis.test-support.ts states this directly ('still
    a mocked fetch response rather than a call against a running backend'). The 'exactly one evaluation
    for the named hypothesis' shape is exercised, but only against a hand-authored fixture; the criterion's
    own qualifier, 'against the live backend route,' is never exercised by anything in this set.
findings:
- pass: standard
  file: src/hooks/use-case-simulation-cockpit.ts
  where: lines 154 and 179 (the lastCaseResult state and the effect that fills it), read together with
    lines 246-247 where it is consumed
  cites: STA-01
  evidence: "const [lastCaseResult, setLastCaseResult] = useState<SimulateCaseResult | null>(null); [...]\
    \ setLastCaseResult(result); [...] const hypothesesSummary = lastCaseResult ? toRunSummary(lastCaseResult)\
    \ : undefined;\n  const lastRunDurations = lastCaseResult ? toDurations(lastCaseResult) : undefined;"
  cost: 'caseSim.result (useMutation''s own data) already holds the last completed case-level result for
    the life of the hook -- a hypothesis-level dispatch is a separate mutation instance and never touches
    it. lastCaseResult is a second useState mirroring that same object on every change, so the case result
    now has two variables that hold it: caseSim.result from the mutation, and lastCaseResult copied from
    it. A future change to how or when the mutation''s own data is reset (a caseSim.reset() call, a retry
    policy, an unrelated fix to the case-dispatch hook) can leave the two disagreeing with nothing here
    to catch it, and a reader has to check both to know which one the summary and duration panels actually
    read.'
  correction: read hypothesesSummary and lastRunDurations directly from caseSim.result instead of from
    a mirrored lastCaseResult state, dropping the second useState entirely.
- pass: conformance
  file: src/hooks/use-simulate-hypothesis.ts
  where: lines 235-241, GENERIC_SIMULATE_HYPOTHESIS_DISPATCH_FAILURE_MESSAGE and its own doc comment
  evidence: "const GENERIC_SIMULATE_HYPOTHESIS_DISPATCH_FAILURE_MESSAGE =\n  \"The simulation could not\
    \ be sent. Check the selected hypothesis and subject, then try again.\";\n\n/** No criterion of this\
    \ task states a distinct wording for a dispatch failure (this file's own header comment, mirroring\
    \ use-test-connector-panel.ts's own empty table); every mapped kind falls back to the one generic\
    \ message above, through error-ui-state.ts's own central registry rather than a hand-checked error.code\
    \ here. */"
  cost: The exact sentence a curator reads when a simulate-hypothesis dispatch fails is authored here,
    in source, and the comment beside it confirms no criterion or node states this wording; a reader who
    wants to know what the curator is told at this outcome has to open this file rather than any node,
    and the specification stays silent on a fact the code has already decided for every failure kind.
  correction: If this wording is meant to hold across a refusal, it belongs in a node the frontend reads
    it from (or is confirmed to match); otherwise this stays an inference disclosed in the delivery record
    rather than the sentence's only home.
---

## What it is

The review of task/simulate-hypothesis-endpoint-hotfix/fix-use-simulate-hypothesis-dispatch: four
passes over the nine files this corrective delivery created or modified, plus the captured suite
run (run/simulate-hypothesis-endpoint-hotfix) and the trace's own drift reading over the frontend
target.

## Notes

Coverage: 5 of 6 criteria covered; criterion 6 ("a dispatch against the live backend route ...
returns exactly one evaluation") is partial -- every test in this delivery mocks apiFetch, the
same convention every sibling hook in this codebase already follows (recorded in the proof's own
`untested` entry), so the "live backend" half of that criterion is never exercised by anything
delivered here.
Conformance: the specification-conformance-reviewer also noticed, without reporting as a finding,
that use-simulate-hypothesis.ts's header comment misattributes one quoted sentence to
domain/knowledge/case-version.md when it in fact sits in domain/investigation/investigation.md
(the fact itself holds either way) -- a citation-accuracy slip, not a wrong domain fact -- and that
use-case-simulation-cockpit.ts's Detail panel still reads evidence only from lastCaseResult,
never surfacing a single-hypothesis run's own evidence array now that SimulateHypothesisResult
carries one -- a UI-completeness question against no node in the reviewed set, already named as a
deferral in this task's own implementation record.
Standard: the one finding cited (STA-01) sits in code this task did not write -- the lastCaseResult
state predates this delivery (task/simulation-cockpit/screen-assembly) -- but the file is in this
review's own set because this task modified it, and the rule's scope reaches the whole file.
Failures: the captured run (run/simulate-hypothesis-endpoint-hotfix -- install, typecheck, lint,
style, build, a11y, secret-scan, test) passed clean on every step, so this pass did not run --
there was nothing to diagnose.
Trace: `trace.py --check` over the frontend target reports 168 drift finding(s) over 150
binding(s) across the whole tree (0 orphaned, 7 moved, 161 code over 28 files) -- almost entirely
pre-existing drift unrelated to this change (other initiatives' files, and a concurrent session's
own in-flight work elsewhere in the main worktree). Of those, exactly two files this delivery
touched carry stale bindings, and both were already disclosed as the bind's own receipt when this
delivery bound its trace entries: use-simulate-hypothesis.ts (rules/investigation/a-simulation-writes-no-investigation,
restamped under a different node by this task's own bind) and use-case-simulation-cockpit.ts
(domain/investigation/assessment and scenarios/investigation/a-draft-case-version-is-simulated,
likewise restamped). This is not a finding and settles nothing about the change; the route for the
`code` class is `/reconcile`, and for `moved` a rebind when each node's own task is next delivered.
No suppression receipt applies -- this project's siegard.json declares no `edits_freely` targets.
