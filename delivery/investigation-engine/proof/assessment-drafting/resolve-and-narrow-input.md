---
title: Proof for resolve-and-narrow-input's outcome resolution and writing-input narrowing
summary: Pins that resolveAndNarrow forwards the case's own resolve-outcome verbatim by declared precedence, narrows to the determining hypothesis's own evidence or to every evaluation's verdict and reason with no case body, never leaks a hypothesis's criterion or the case's when_to_use, and faults rather than fabricates on a missing evidence entry.
implementation: sha256:a4457f3dccae71cdae13be8320189413e962f71953e4989b4c924bd8619c35e5
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/assessment-drafting-resolve-and-narrow-input-suite
tests:
- file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
  name: resolves the outcome, referral and determining hypothesis exactly as the case's own resolve-outcome answers, following the case's declared precedence rather than the evaluations' own order
  proves: The resolved outcome, referral and determining hypothesis equal exactly what the case's own resolve-outcome answers for the given evaluations, computed nowhere else.
  fails_when: resolveAndNarrow picks the hypothesis the evaluations array happens to list first among the confirmed ones instead of the one the case's own declared precedence would pick, or computes the outcome/referral from anything but resolveOutcome's own answer.
- file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
  name: carries only the determining hypothesis's own evidence when one is confirmed, never a second confirmed hypothesis's evidence (scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome)
  proves: When a hypothesis confirmed, the narrowed input carries that hypothesis's own evidence and no other hypothesis's evidence, and the scenario's own second confirmed hypothesis stays unmarked and never leaks into the narrowed input.
  fails_when: the narrowed input includes the second hypothesis's evidence instead of, or alongside, the determining hypothesis's own evidence.
- file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
  name: carries every evaluation's own verdict and reason, and no case body, when no hypothesis confirmed
  proves: When no hypothesis confirmed, the narrowed input carries every evaluation's verdict and reason, and no case body.
  fails_when: a verdict, a reason, or the set of evaluations is wrong, an evaluation's citations leak into the fallback summary, or anything the case itself declares appears in the fallback narrowed input.
- file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
  name: never carries a hypothesis's own criterion or the case's when_to_use text in the confirmed narrowed input
  proves: The narrowed input never contains the case's hypotheses' criteria or its when_to_use text.
  fails_when: the confirmed narrowed input gains a field beyond basis/evidence, or either marker string appears anywhere in its serialized content.
- file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
  name: answers an empty fallback evaluations list, rather than throwing or defaulting to something else, when given no evaluations at all
  proves: the fallback path handles the empty-collection edge of criterion 3 rather than throwing or fabricating a default entry.
  fails_when: resolveAndNarrow throws, or answers a non-empty or otherwise different fallback evaluations list, when given zero evaluations.
- file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
  name: carries an empty evidence array, rather than throwing, when the determining hypothesis's own map entry is present but empty
  proves: the confirmed path handles the empty-collection edge of criterion 2, a present-but-empty evidence entry is passed through, not mistaken for an absent one.
  fails_when: resolveAndNarrow throws over a present empty array, or substitutes a non-empty or otherwise different evidence value.
- file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
  name: throws naming the determining hypothesis when evidenceByHypothesis carries no entry for it
  proves: the implementation's own inference that a determining hypothesis absent from evidenceByHypothesis is a thrown caller-contract fault, never a manufactured empty evidence array
  fails_when: resolveAndNarrow answers with an empty or otherwise fabricated evidence array instead of throwing, or throws without naming the missing hypothesis.
- file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
  name: never surfaces a hypothesis's own criterion or the case's when_to_use in the fallback narrowed input, which never reads theCase itself
  proves: the fallback branch's own contribution to criterion 4, and the task's own named edge case that the fallback path never reads theCase at all.
  fails_when: the fallback narrowed input gains a field beyond basis/evaluations, or either marker string appears anywhere in its serialized content.
- file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
  name: omits the reason field from a fallback evaluation whose own verdict is confirmed or refuted, never just from an inconclusive one
  proves: the task's own named edge case that a fallback evaluation which is confirmed or refuted carries no reason field.
  fails_when: a refuted or confirmed fallback evaluation carries a reason field, copied wholesale from the evaluation or defaulted to some value.
- file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
  name: carries no hypothesis name of its own in the confirmed narrowed input, since the resolved outcome's own determining field already names it
  proves: the implementation's own recorded inference that ConfirmedNarrowedInput does not itself carry the determining hypothesis's name, only its evidence
  fails_when: the confirmed narrowed input gains a hypothesis (or similarly named) field duplicating what resolved.determining already names.
- file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
  name: answers synchronously with the result itself, never a Promise, so nothing here could be awaiting a database driver or an HTTP client
  proves: the task's own UNDERDETERMINED note, an implementation whose resolving/narrowing module reaches a database driver or an HTTP client directly is excluded by this observable behavior even though it could still satisfy criteria 1-4 as written
  fails_when: resolveAndNarrow's own return value is a Promise (or otherwise thenable), as it would necessarily be if it awaited a network or database call internally.
not_applicable:
- edge_case: passing undefined or an absent value for case, evaluations or evidenceByHypothesis
  why: ResolveAndNarrowOptions declares each field's type explicitly, and the compiler refuses a call site omitting one before any test could run, the same convention every sibling proof in this tree already follows by never testing this.
- edge_case: two operations against one subject, or against the same case, at once
  why: resolveAndNarrow is a pure, synchronous function with no shared mutable state; two calls cannot interact, and a test could not distinguish concurrent calls from two independent sequential ones.
- edge_case: a dependency that is unavailable, slow, or answers in an unexpected shape
  why: constraints/the-domain-depends-on-no-infrastructure, this module reaches no dependency at all; every input arrives as an already-loaded plain domain value.
- edge_case: a duplicate evaluation for the same hypothesis, or an evaluations set that is not total over the case's declared hypotheses
  why: enforcing rules/investigation/one-evaluation-per-required-hypothesis is explicitly deferred to task/investigation-lifecycle/investigation-factory per the implementation record's own deferred list; a test pinning particular behavior over a duplicate or incomplete set here would assert a guarantee nobody made.
- edge_case: a boundary at each end of a stated numeric range
  why: this module declares no numeric range or threshold anywhere in its behavior.
untested:
- The module's own import discipline, that it reaches no port, no infrastructure module and nothing beyond the case, case-resolution, evaluation, evidence, evaluation-reason and verdict sibling modules' own plain-data types, is a fact about the file's imports, verifiable by reading or by the standard's own typecheck/lint steps, and no runtime test in this suite observes it directly beyond the one synchronicity test that covers its observable half.
- The choice of module location (src/investigation/ rather than a new src/assessment/ directory) is a file-organization inference with no runtime behavior to assert against.
- The choice to reuse Evaluation unmodified as this module's own input shape, rather than declaring a narrower local type, is exercised incidentally by every test's use of the real Evaluation type, but no test isolates that choice on its own.
---

## What it is

Unit tests proving resolve-and-narrow-input's four criteria across the confirmed and fallback paths, the structural exclusion of case prose, and the missing-evidence caller-contract fault.

## Notes

None.
