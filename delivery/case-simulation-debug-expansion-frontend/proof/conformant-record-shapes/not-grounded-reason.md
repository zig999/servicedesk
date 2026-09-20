---
target: frontend
title: not-grounded joins every evaluation-reason union the case-simulation cockpit declares
summary: Proves each of the four separately-declared evaluation-reason unions admits not-grounded and
  no stray value, that REASON_LABEL is total over exactly the domain's four causes with a wording for
  not-grounded distinct from the other causes, and that verdictCell resolves that reason to a label rather
  than an absent lookup.
implementation: sha256:0ddd4f7672f37102cb95fadee80e6bb27063e0cb9a7c82e494f4ae97014dc18d
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/conformant-record-shapes-not-grounded-reason-suite
tests:
- file: src/hooks/use-simulate-case-not-grounded-reason.spec.ts
  name: SimulateEvaluationReason admits not-grounded, the fourth cause domain/investigation/evaluation-reason
    declares
  proves: criterion 1 -- SimulateEvaluationReason in src/hooks/use-simulate-case.ts admits not-grounded
  fails_when: the union at SimulateEvaluationReason's declaration no longer lists "not-grounded" as a
    member, so this test's direct literal assignment fails to compile under the project's typecheck step
- file: src/hooks/use-simulate-case-not-grounded-reason.spec.ts
  name: SimulateEvaluationReason admits no cause beyond the specification's four-value enumeration
  proves: criterion 7, SimulateEvaluationReason's slice -- no evaluation-reason union in the cockpit admits
    a value the specification's own enumeration does not declare
  fails_when: SimulateEvaluationReason widens to include a literal outside {no-data, judgment-failure,
    deadline-exceeded, not-grounded}, so returning it typed as the narrower KnownEvaluationReason fails
    to compile
- file: src/hooks/use-simulate-hypothesis-not-grounded-reason.spec.ts
  name: EvaluationReason admits not-grounded, the fourth cause domain/investigation/evaluation-reason
    declares
  proves: criterion 2 -- EvaluationReason in src/hooks/use-simulate-hypothesis.ts admits not-grounded
  fails_when: the union at EvaluationReason's declaration no longer lists "not-grounded" as a member,
    so this test's direct literal assignment fails to compile under the project's typecheck step
- file: src/hooks/use-simulate-hypothesis-not-grounded-reason.spec.ts
  name: EvaluationReason admits no cause beyond the specification's four-value enumeration
  proves: criterion 7, EvaluationReason's slice -- no evaluation-reason union in the cockpit admits a
    value the specification's own enumeration does not declare
  fails_when: EvaluationReason widens to include a literal outside {no-data, judgment-failure, deadline-exceeded,
    not-grounded}, so returning it typed as the narrower KnownEvaluationReason fails to compile
- file: src/routes/case-simulation-cockpit-adapters-not-grounded-reason.spec.ts
  name: CockpitEvaluation's reason admits not-grounded, the fourth cause domain/investigation/evaluation-reason
    declares
  proves: criterion 3 -- CockpitEvaluation's reason in src/routes/case-simulation-cockpit-adapters.ts
    admits not-grounded
  fails_when: CockpitEvaluation's inline reason literal union no longer lists "not-grounded" as a member,
    so this test's direct literal assignment fails to compile under the project's typecheck step
- file: src/routes/case-simulation-cockpit-adapters-not-grounded-reason.spec.ts
  name: CockpitEvaluation's reason admits no cause beyond the specification's four-value enumeration
  proves: criterion 7, CockpitEvaluation's reason slice -- no evaluation-reason union in the cockpit admits
    a value the specification's own enumeration does not declare
  fails_when: CockpitEvaluation's reason widens to include a literal outside {no-data, judgment-failure,
    deadline-exceeded, not-grounded}, so returning it typed as the narrower KnownEvaluationReason fails
    to compile
- file: src/routes/case-simulation-hypotheses-table-row-not-grounded-reason.spec.ts
  name: SimulationEvaluationReason admits not-grounded, the fourth cause domain/investigation/evaluation-reason
    declares
  proves: criterion 4 -- SimulationEvaluationReason in src/routes/case-simulation-hypotheses-table-row.ts
    admits not-grounded
  fails_when: the union at SimulationEvaluationReason's declaration no longer lists "not-grounded" as
    a member, so this test's direct literal assignment fails to compile under the project's typecheck
    step
- file: src/routes/case-simulation-hypotheses-table-row-not-grounded-reason.spec.ts
  name: SimulationEvaluationReason admits no cause beyond the specification's four-value enumeration
  proves: criterion 7, SimulationEvaluationReason's slice -- no evaluation-reason union in the cockpit
    admits a value the specification's own enumeration does not declare
  fails_when: SimulationEvaluationReason widens to include a literal outside {no-data, judgment-failure,
    deadline-exceeded, not-grounded}, so returning it typed as the narrower KnownEvaluationReason fails
    to compile
- file: src/routes/case-simulation-hypotheses-table-row-not-grounded-reason.spec.ts
  name: REASON_LABEL holds a non-empty label for not-grounded, rather than leaving the lookup absent
  proves: criterion 5 -- REASON_LABEL in src/routes/case-simulation-hypotheses-table-row.ts holds an entry
    for not-grounded
  fails_when: REASON_LABEL carries no entry for "not-grounded", or the entry's value is an empty string,
    so the runtime lookup on that key stays effectively absent
- file: src/routes/case-simulation-hypotheses-table-row-not-grounded-reason.spec.ts
  name: REASON_LABEL is keyed on exactly the four causes domain/investigation/evaluation-reason declares,
    no more and no fewer
  proves: domain/investigation/evaluation-reason's own enumeration -- REASON_LABEL is total over exactly
    the four declared causes and none beyond them
  fails_when: REASON_LABEL's key set gains, loses, or substitutes a cause relative to {no-data, judgment-failure,
    deadline-exceeded, not-grounded}
  demonstrates: domain/investigation/evaluation-reason
- file: src/routes/case-simulation-hypotheses-table-row-not-grounded-reason.spec.ts
  name: REASON_LABEL labels not-grounded with wording distinct from judgment-failure's and no-data's own
    entries, rather than repeating one of the other three distinct causes
  proves: UNDERDETERMINED, from the specification -- REASON_LABEL gains an entry keyed not-grounded whose
    label repeats or paraphrases the wording already used for judgment-failure or no-data, satisfying
    every criterion as written while showing the curator one of the three causes the enumeration holds
    distinct from it
  fails_when: REASON_LABEL["not-grounded"] is set to literally the same string already used for "no-data"
    or for "judgment-failure"
- file: src/routes/case-simulation-hypotheses-table-row-not-grounded-reason.spec.ts
  name: verdictCell resolves a label for an inconclusive evaluation whose reason is not-grounded, rather
    than an absent lookup
  proves: criterion 6 -- a simulate response whose evaluation carries reason not-grounded reaches verdictCell
    with a label rather than an absent lookup
  fails_when: verdictCell's lookup on REASON_LABEL fails to resolve a value for reason "not-grounded"
    (the key is missing or mismatched), so the combined label reads "Inconclusive · undefined" instead
    of the resolved wording
not_applicable:
- edge_case: absent or empty input to a widened union
  why: the criteria concern only whether a literal value is a member of a type or a key of a lookup table;
    there is no absent/empty variant of a reason literal for this task to account for
- edge_case: a duplicate value within an enumeration
  why: the specification's enumeration and each cockpit union model four distinct literals; no criterion
    concerns a caller supplying a repeated value
- edge_case: two operations against one subject at once
  why: every obligation here is a synchronous type fact or a pure lookup function; nothing shared or mutable
    is introduced for two operations to race over
- edge_case: a dependency that fails or answers slowly
  why: widening these four literal unions and adding one label-map entry touches no network call, timer
    or other asynchronous dependency
- edge_case: an operation against state that forbids it
  why: there is no state machine or forbidden-state transition in scope; the task only widens literal
    unions and a lookup table
untested:
- Criterion 8 (the frontend type-checks with no error arising from an evaluation reason in any file that
  declares or consumes one) is a claim over every file in the tree, decided by the project's own whole-tree
  typecheck run as a captured build step, not by a scoped spec file.
- 'The paraphrase half of the task''s UNDERDETERMINED entry is not decided by any test written here: whether
  a chosen label semantically paraphrases another cause''s wording is a judgment over an unbounded space
  of phrasings; the written test catches only the literal-repeat instance the entry names.'
- The implementation record's own inference that REASON_LABEL['not-grounded'] reads 'not grounded' as
  a direct paraphrase of the enum literal's own name is not pinned by any test; only its non-emptiness
  and its distinctness from the other two named causes' wording are tested.
---

## What it is
Twelve tests across four new spec files, each pinning one of the four widened unions, REASON_LABEL's totality and distinctness, and verdictCell's resolved label.

## Notes
None.
