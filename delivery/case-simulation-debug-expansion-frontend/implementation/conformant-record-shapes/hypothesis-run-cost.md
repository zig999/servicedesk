---
target: frontend
title: SimulateHypothesisResult carries the narrowed run's own cost
summary: SimulateHypothesisResult now declares a required cost (reusing SimulateCost) beside its durations,
  with writing typed as conditionally absent, and every fixture builder that constructs the type across
  the hooks and routes trees was extended to supply it so the frontend still type-checks.
task: sha256:58cd4b48770cc3559f8f619ef91dccf1c9788be1b558149a3fc8460b3b17b161
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/conformant-record-shapes-hypothesis-run-cost-build
files:
- path: src/hooks/use-simulate-hypothesis.ts
  effect: imports SimulateCost (type-only) from ./use-simulate-case; adds readonly writing? number to
    Durations; adds readonly cost SimulateCost to SimulateHypothesisResult, declared beside durations
- path: src/hooks/use-case-simulation-cockpit.test-support.ts
  effect: imports SimulateCost; adds a local hypothesisCost() fixture helper and extends simulateHypothesisResult
    to return a cost alongside evidence, evaluation and durations
- path: src/hooks/use-simulate-hypothesis.test-support.ts
  effect: imports SimulateCost; adds an exported hypothesisCost() fixture helper and extends simulateHypothesisResult
    to return a cost
- path: src/routes/case-simulation-ready-view.test-support.ts
  effect: imports SimulateCost; adds a local hypothesisCost() fixture helper and extends simulateHypothesisResult
    to return a cost
- path: src/hooks/use-simulate-hypothesis-evidence-wire-fields.spec.ts
  effect: imports the newly exported hypothesisCost and extends its own local resultWithEvidence helper
    to supply cost
criteria:
- criterion: SimulateHypothesisResult in src/hooks/use-simulate-hypothesis.ts declares cost as a required
    field carrying calls, input_tokens and output_tokens.
  met: true
  how: 'cost is declared as readonly cost: SimulateCost (non-optional); SimulateCost declares calls, input_tokens
    and output_tokens, all required'
- criterion: That cost field reuses the SimulateCost already declared in src/hooks/use-simulate-case.ts
    rather than a second declaration of the same three members.
  met: true
  how: use-simulate-hypothesis.ts imports type SimulateCost from ./use-simulate-case and uses it directly;
    no second three-member cost shape is declared
- criterion: SimulateHypothesisResult declares durations beside cost, so the narrowed run's record carries
    both totals the rule names.
  met: true
  how: the durations field sits beside the new cost field in the same type literal, mirroring SimulateCaseResult's
    own pairing
- criterion: The durations a hypothesis run carries express writing as absent rather than as a figure,
    since that run reaches no consolidation call.
  met: true
  how: 'Durations now declares writing as readonly writing?: number, matching domain/investigation/durations''
    own conditional-presence attribute'
- criterion: useSimulateHypothesis's onSimulate result carries the cost the response returned, unaltered.
  met: true
  how: onSimulate's result is exactly mutation.data ?? null, with no transformation, so cost reaches the
    caller exactly as fetched
- criterion: A simulate-hypothesis response whose cost totals one judgment call and no consolidation call
    reaches the caller with those totals intact.
  met: true
  how: the same unaltered pass-through applies regardless of what the response's cost totals are
- criterion: simulateHypothesisResult in src/hooks/use-case-simulation-cockpit.test-support.ts returns
    a SimulateHypothesisResult carrying a cost.
  met: true
  how: 'simulateHypothesisResult now returns cost: hypothesisCost() alongside evidence, evaluation and
    durations'
- criterion: No call site in src/hooks/use-case-simulation-cockpit.ts or in any spec reading hypSim's
    result declares a hypothesis-result literal of its own to supply the new field.
  met: true
  how: use-case-simulation-cockpit.ts was not modified and constructs no such literal; every spec reached
    by a full-repository search obtains its fixture from one of the three shared builders, and the one
    spec-local literal builder found (resultWithEvidence) was extended to source cost from the same shared
    hypothesisCost() helper
- criterion: The frontend type-checks with no error arising from SimulateHypothesisResult in any file
    that declares, builds or consumes one.
  met: true
  how: every file importing, annotating with or constructing a SimulateHypothesisResult literal was checked
    and, where it built one, extended to supply cost; captured build's typecheck step passed
nodes:
- node: rules/investigation/a-simulated-hypothesis-returns-the-runs-cost-and-durations
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
  how: SimulateHypothesisResult now types both cost and durations as members of the narrowed run's own
    record, matching the rule's statement; this task's own scope stops at typing, threading and fixturing
    the field the response is assumed to already return (recorded in the task's own REMAINDER note as
    the backend's to emit)
- node: domain/investigation/cost
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
  how: cost's type is exactly SimulateCost, reused from use-simulate-case.ts, whose three required members
    already match this value-object's attribute list one-for-one
- node: domain/investigation/durations
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
  how: Durations' four members now match this value-object's attribute list exactly, with writing typed
    optional to express the same conditional presence the node states
inferences:
- inferred: hypothesisCost()'s literal placeholder values and the ordering of cost before durations in
    the type literal.
  from: no node or task criterion states what a fixture's placeholder cost figures should be; the values
    are arbitrary but structurally valid, following the same convention already used for hypothesisDurations()'s
    and hypothesisEvidence()'s own placeholder figures; the ordering mirrors SimulateCaseResult's own
    member order
- inferred: use-simulate-hypothesis-evidence-wire-fields.spec.ts's resultWithEvidence helper and use-simulate-hypothesis.test-support.ts's
    own separate builder pair (and case-simulation-ready-view.test-support.ts's own copy) needed the same
    cost addition, even though only one builder is named in the task and inventory.
  from: criterion 10's own text ("in any file that declares, builds or consumes one") together with a
    full-repository search that surfaced three independent shared-fixture builders and one spec-local
    literal builder rather than the single one the task names
preserved:
- every other member of SimulateHypothesisResult (evidence, evaluation) and of Durations (collection,
  judgment, total) is unchanged in name, type and requiredness
- use-case-simulation-cockpit.ts's threading of hypSim.result through previousHypothesisResultRef and
  into fromHypothesisEvaluation is untouched
- the three shared fixture builders' existing evidence/evaluation/durations construction and every caller's
  use of their default evaluation argument are unchanged
deferred:
- what: use-simulate-hypothesis-request.spec.ts's own assertion that Object.keys(returned).sort() equals
    exactly ["durations", "evaluation", "evidence"].
  why: that assertion was written against SimulateHypothesisResult's pre-this-task shape and now fails
    at runtime once every fixture (necessarily, per this task's own required cost field) returns a fourth
    key, cost; it does not fail the frontend's type-check, which is all this task's own criterion 10 requires
    -- it is a runtime test failure this task's mandated change produces, and correcting the assertion
    is left to the suite step's own diagnosis, since the implementation record is not the place a test's
    own totality assertion is edited
---

## What it is
SimulateHypothesisResult gains a required cost field (reusing SimulateCost) beside its durations, threaded unaltered through useSimulateHypothesis, and every one of the four fixture builders/literals across the tree that construct the type now supply it.

## Notes
use-simulate-hypothesis-request.spec.ts's totality assertion over SimulateHypothesisResult's key set is stale after this widening -- a pre-existing test asserting the exact key set now excludes the required cost this task adds. Left for the suite step's own diagnosis and the proof step to correct in place, following this initiative's established precedent for sibling-task totality breakage, rather than corrected here.
