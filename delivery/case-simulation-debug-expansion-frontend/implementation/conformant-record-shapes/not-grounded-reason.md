---
target: frontend
title: not-grounded joins every evaluation-reason union in the case-simulation cockpit
summary: Widens all four separately-declared evaluation-reason unions in the cockpit to admit not-grounded
  and adds the matching REASON_LABEL entry so a response carrying it gets a label.
task: sha256:79a438ecb10bfa024b554e9c1b90e4f6febdc822b32b1fde26adf360296c34f2
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/conformant-record-shapes-not-grounded-reason-build
files:
- path: src/hooks/use-simulate-case.ts
  effect: SimulateEvaluationReason widened from three literals to four, admitting "not-grounded"
- path: src/hooks/use-simulate-hypothesis.ts
  effect: EvaluationReason widened from three literals to four, admitting "not-grounded"
- path: src/routes/case-simulation-cockpit-adapters.ts
  effect: CockpitEvaluation's inline reason literal union widened to four values; fromCaseEvaluation/fromHypothesisEvaluation/toRowEvaluation
    pass the value through unchanged
- path: src/routes/case-simulation-hypotheses-table-row.ts
  effect: SimulationEvaluationReason widened to four values; REASON_LABEL (Record<SimulationEvaluationReason,string>)
    gains the entry "not-grounded" -> "not grounded"
criteria:
- criterion: SimulateEvaluationReason in src/hooks/use-simulate-case.ts admits not-grounded.
  met: true
  how: the union literal at that type's declaration now lists "not-grounded" as a fourth member
- criterion: EvaluationReason in src/hooks/use-simulate-hypothesis.ts admits not-grounded.
  met: true
  how: the union literal at that type's declaration now lists "not-grounded" as a fourth member
- criterion: CockpitEvaluation's reason in src/routes/case-simulation-cockpit-adapters.ts admits not-grounded.
  met: true
  how: the inline optional reason field's literal union now lists "not-grounded" as a fourth member
- criterion: SimulationEvaluationReason in src/routes/case-simulation-hypotheses-table-row.ts admits not-grounded.
  met: true
  how: the union literal at that type's declaration now lists "not-grounded" as a fourth member, read
    at this file per the task's own binder note
- criterion: REASON_LABEL in src/routes/case-simulation-hypotheses-table-row.ts holds an entry for not-grounded.
  met: true
  how: 'REASON_LABEL gained the entry "not-grounded": "not grounded"; the map is typed Record<SimulationEvaluationReason,string>,
    so the compiler already refuses the widened union without this entry'
- criterion: A simulate response whose evaluation carries reason not-grounded reaches verdictCell with
    a label rather than an absent lookup.
  met: true
  how: verdictCell reads REASON_LABEL[evaluation.reason]; with REASON_LABEL now total over the widened
    union, a not-grounded evaluation looks up "not grounded" instead of an absent record key
- criterion: No evaluation-reason union in the cockpit admits a value the specification's own enumeration
    does not declare.
  met: true
  how: each of the four unions gained exactly one literal, "not-grounded", the fourth and last value domain/investigation/evaluation-reason's
    own enumeration declares
- criterion: The frontend type-checks with no error arising from an evaluation reason in any file that
    declares or consumes one.
  met: true
  how: searched every file referencing the three prior reason literals or an EvaluationReason-named type;
    none holds an exhaustive switch/assertNever over the union, so widening adds a member without narrowing
    any consumer's accepted set; captured build's typecheck step passed
nodes:
- node: domain/investigation/evaluation-reason
  encoded_at:
  - src/hooks/use-simulate-case.ts
  - src/hooks/use-simulate-hypothesis.ts
  - src/routes/case-simulation-cockpit-adapters.ts
  - src/routes/case-simulation-hypotheses-table-row.ts
  how: the node's enumeration holds exactly four values (no-data, judgment-failure, deadline-exceeded,
    not-grounded); all four cockpit unions that model why an evaluation is inconclusive now admit precisely
    that set
inferences:
- inferred: REASON_LABEL's new entry reads "not grounded" -- a direct paraphrase of the enum literal's
    own name -- rather than reusing or paraphrasing one of the existing three entries.
  from: 'the task''s own UNDERDETERMINED note: no candidate states what a surface must call not-grounded,
    so any entry satisfies the stated criteria; absent that guidance, the reading closest to the enum''s
    own name and farthest from borrowing another cause''s wording was chosen, on the specification''s
    own stated principle that the four causes are distinct and none is the umbrella of the others -- this
    choice is not itself validated against any node and remains a curator''s decision to make'
preserved:
- every other field and branch of SimulateEvaluation, Evaluation, CockpitEvaluation and SimulationHypothesisEvaluation
  (verdict discriminants, citations, usage, elapsed_ms, prompt, stale) is untouched -- only the reason
  literal unions and the one label map changed
- toRowEvaluation, fromCaseEvaluation, fromHypothesisEvaluation, verdictCell and costCell keep their existing
  control flow; none needed a new branch since none enumerates the union's members by name
deferred:
- what: rules/investigation/a-simulation-session-retains-its-runs-and-shows-one's clauses on retaining
    runs, showing one at a time, and presenting every part of the shown run from its own returned record.
  why: per the task's own REMAINDER note, these clauses reach no criterion of this task; they belong to
    the case-simulation cockpit epic's task that builds the session's run history and one-run-at-a-time
    presentation
---

## What it is
Four separately declared evaluation-reason unions -- three named by the scope, one found by the survey -- widened to admit not-grounded, plus the one label map keyed on the table-row file's own union.

## Notes
The label text chosen for not-grounded ("not grounded") is UNDERDETERMINED from the specification: no node states what a surface must call it, and the task's own binder note flags this explicitly.
