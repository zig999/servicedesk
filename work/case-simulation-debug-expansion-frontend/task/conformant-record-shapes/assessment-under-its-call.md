---
title: A run's assessment is present only where a writing call produced one
summary: outcome, referral, determiningHypothesis, text and register move inside the
  discriminant that states a consolidation call happened, together with the one production
  builder, the two unconditional render sites and the nine fixture builders that construct
  them flat today.
objective: CaseResultRun carries the assessment only within the branch stating a consolidation
  call happened, so no run that resolved none is forced to carry an invented one, and
  every builder, render site and test of that type reads it that way.
criteria:
- CaseResultRun in src/routes/case-simulation-case-result-types.ts declares outcome,
  referral, determiningHypothesis, text and register only within the called true branch
  of its consolidation discriminant.
- No branch of CaseResultRun states any of those five fields where the discriminant states
  that no consolidation call happened.
- register sits in the same branch as text, usage, elapsedMs and prompt, so one shape
  carries everything the one writing call produced.
- A run for a narrowed simulate-hypothesis call, which resolves no outcome and no assessment,
  is expressible as a CaseResultRun without supplying any of those five fields.
- toNewCaseResultRun in src/routes/case-simulation-cockpit-adapters.ts builds the five
  assessment fields only inside the branch on which it sets called true.
- src/routes/case-simulation-case-result-panel.tsx reads shownRun's outcome, referral,
  determiningHypothesis, text and register only after the discriminant states a consolidation
  call happened.
- src/routes/case-simulation-case-result-compare.tsx reads those same five fields only
  after that same discriminant.
- A shown run that carries no assessment presents no outcome, referral, determining hypothesis,
  text or register drawn from any other run of the session.
- Each of the nine local makeRun and newRun fixture builders — in case-simulation-case-result-types.spec.ts,
  case-simulation-case-result-panel.spec.ts, case-simulation-case-result-panel-debug.spec.ts,
  case-simulation-case-result-panel-evidence.spec.ts, case-simulation-case-result-panel-json.spec.ts,
  case-simulation-case-result-panel-totals.spec.ts, case-simulation-case-result-panel-compare.spec.ts,
  case-simulation-case-result-compare.spec.ts and use-case-simulation-history.spec.ts
  — constructs its run with the five assessment fields inside the discriminated branch.
- src/routes/case-simulation-cockpit-adapters-run-record.spec.ts asserts toNewCaseResultRun's
  output with the assessment nested and asserts the flat pre-correction shape nowhere.
- The frontend type-checks with no error arising from CaseResultRun in any file that
  declares, builds or reads one.
rationale: 'The scope states finding 2 as one finding and leaves the nesting form open
  — the called true branch or an equivalent single discriminant — which is a choice it
  hands to planning and the criteria resolve as one discriminant over the whole assessment,
  so a reader of a run tests one condition rather than two. Folding the nine fixture
  builders, the two render sites and the run-record assertion into this same task is my
  cut: the inventory records the type as uncompilable at every one of those the moment
  the fields move, so any split would leave the tree unbuildable between the two halves,
  and the run-record spec would lock the pre-correction flat shape back in if it moved
  separately.'
sources:
- work/case-simulation-debug-expansion-frontend/intake/review-findings-1-to-4.md
implements:
- contracts/investigation/case-simulation
- domain/investigation/assessment
- rules/investigation/the-consolidation-answer-states-its-register
- rules/investigation/a-simulation-session-retains-its-runs-and-shows-one
- scenarios/investigation/a-single-hypothesis-is-simulated
---

## What it is
The one run type the case-result surface is built on, and everything that constructs or reads it.
Today the assessment's five fields sit beside the consolidation discriminant rather than inside it, so a narrowed run that never reached consolidation has no way to say so truthfully.
This task moves them inside, and moves the one production builder, the two render sites and the ten spec files that construct or assert them with it.

## Notes
The inventory records src/routes/case-simulation-case-result-debug-tab.tsx:15-33 as already reading register and the consolidation call's usage and elapsedMs only inside an if on the discriminant — the nesting pattern this correction adopts, already present one file over and not a file this task changes.
It records the same pattern at src/routes/case-simulation-detail-types.ts:40-49 for SimulationJudgmentCall, which is the shape to follow rather than to invent.
It records toNewCaseResultRun as the sole production builder of a run value, invoked only from the case-level effect in use-case-simulation-cockpit.ts and never from the hypothesis-level one.
It records that no shared run fixture exists, which is why nine builders are named one by one rather than as a single reuse point.
UNDERDETERMINED, from the specification — no criterion says what the result panel or the compare view presents in place of the assessment for a shown run whose discriminant states no consolidation call happened; the criterion forbidding borrowing from a sibling run does not forbid a placeholder rendering, which rules/investigation/a-simulation-session-retains-its-runs-and-shows-one refuses as attributing to a run something it never returned. Passes: src/routes/case-simulation-case-result-panel.tsx and src/routes/case-simulation-case-result-compare.tsx keep rendering the assessment block for a run whose consolidation discriminant states no call happened, showing empty strings or em-dash placeholders for outcome, referral, determining hypothesis, text and register — nothing is read from another run, the reads still sit behind the discriminant, the type-check passes, and the surface nonetheless presents that run an assessment it never returned.
REMAINDER, from the specification — rules/investigation/the-consolidation-answer-states-its-register's clause naming where the stated register comes from (the pinned case version's own declared register, or the consolidation adapter's default) reaches no criterion here; this task only places register in the same branch as the other consolidation fields on the frontend run type. Belongs: the backend consolidation act — the assessment-consolidator's own call.
REMAINDER, from the specification — rules/investigation/a-simulation-session-retains-its-runs-and-shows-one's clauses on retaining the session's runs, showing one at a time, selecting an earlier run, and presenting the shown run's evidence, evaluations, cost and durations from its own record reach no criterion of this task; only the assessment half of "presenting every part of the shown run from its own returned record" is answered here. Belongs: the other tasks of this epic and initiative covering the session history, the run's totals and the evidence display on the case-result surface.
REMAINDER, from the specification — rules/investigation/a-simulated-hypothesis-returns-the-runs-cost-and-durations' statement that a simulate-hypothesis call's record carries that run's own cost and stage durations reaches no criterion of this task, which touches only the five assessment fields and leaves CaseResultRun's cost and durations members where they are. Belongs: this epic's hypothesis-run-cost task.
REMAINDER, from the specification — rules/investigation/presentation-reads-the-evidence-snapshot's statement on showing a collected evidence item's snapshotted concept_description, field semantics and capability payload notes without a live registry read reaches no criterion of this task; no criterion here touches evidence presentation. Belongs: this epic's evidence-semantics-always-present task and the initiative's case-evidence-display task.
ADVISORY, from the specification — the criteria name files as src/routes/... while the files this task edits are under frontend/app/src/routes/; read as paths relative to the frontend target source root this is consistent with the criterion requiring the frontend to type-check, but the paths are ambiguous as written against the repository root, where src/ is the backend.
