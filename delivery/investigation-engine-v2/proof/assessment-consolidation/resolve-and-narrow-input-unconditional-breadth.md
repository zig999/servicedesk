---
title: resolve-and-narrow-input's unconditional breadth
summary: Rewrites resolve-and-narrow-input.spec.ts whole to prove the confirmed/fallback branch is gone — every required hypothesis's evaluation and cited evidence surface the same way regardless of outcome — while holding resolveOutcome's own precedence-following, verbatim-answer behavior and the module's import purity.
implementation: sha256:3a0bf7d34e2671169550ef1d3dd935c551f0640059aca77b2d0154957cc99ef2
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/assessment-consolidation-resolve-and-narrow-input-unconditional-breadth-suite-2
tests:
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: "carries every required hypothesis's own evaluation, not only the one that confirmed, when one hypothesis confirms"
    proves: "Given a confirmed outcome, the narrowed input still carries every required hypothesis's evaluation, not only the one that confirmed."
    fails_when: "narrowedInput.evaluations omits h2's or h3's evaluation once h1 confirms, or the old confirmed-branch shape (only the determining hypothesis's evidence) reappears"
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: "carries every required hypothesis's own evaluation when none confirms"
    proves: "Given no confirmation, the narrowed input still carries every required hypothesis's evaluation."
    fails_when: "narrowedInput.evaluations drops an evaluation, or mislabels a verdict or its reason, when nothing confirmed"
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: "gives the narrowed input the same shape whether or not a hypothesis confirmed, carrying no discriminant field that differs between the two"
    proves: "the objective that breadth is unconditional — the confirmed and fallback narrowed inputs carry identically-named fields, with no revived basis/branch discriminant"
    fails_when: "a discriminant field (e.g. basis) or any other asymmetry between the confirmed and fallback shapes is reintroduced"
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: "never carries a hypothesis's own criterion or the case's when_to_use text"
    proves: "The narrowed input never carries a hypothesis's criterion, the case's when_to_use..."
    fails_when: "either marker string leaks into the serialized narrowedInput"
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: "excludes an evaluation for a hypothesis the case does not require evaluation of"
    proves: "...or a hypothesis outside those the case requires evaluation of."
    fails_when: "the evaluation for the undeclared hypothesis is carried into narrowedInput.evaluations"
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: "excludes evidence from evidenceByHypothesis that no included citation names"
    proves: "The narrowed input carries exactly the evidence its included citations name, no more."
    fails_when: "the uncited evidence entry is included alongside the cited one"
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: "carries a concept once, in first-cited order, when more than one required evaluation cites it"
    proves: "the same criterion's no-more half against duplication — one concept cited twice yields one evidence entry, the first-cited one"
    fails_when: "the shared concept appears twice, or the second hypothesis's evidence is kept instead of the first's"
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: "resolves the outcome, referral and determining hypothesis exactly as the case's own resolve-outcome answers, following the case's declared precedence rather than the evaluations' own order"
    proves: "resolveOutcome's own precedence-following behavior is preserved unchanged by this rewrite"
    fails_when: "resolved.determining follows the evaluations' own array order (picking h-third) instead of the case's declared precedence (h-second)"
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: "answers resolved with exactly what the case's own resolveOutcome returns for these verdicts, computed nowhere else"
    proves: "resolved is returned verbatim from case-resolution's own resolveOutcome, observably equivalent to an independent call over the same case and verdicts"
    fails_when: "result.resolved diverges from an independent resolveOutcome(theCase, verdicts) call over the same inputs"
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: "keeps the required evaluations in the given evaluations' own order, never reordered to the case's declared precedence"
    proves: "the design choice documented in the module's own doc comment on requiredEvaluationsOf — narrowedInput.evaluations follows the given array's order, unlike resolved which follows the case's declared precedence"
    fails_when: "narrowedInput.evaluations is reordered to the case's declared hypothesis order instead of the input array's own order"
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: "answers empty evaluations and empty evidence, rather than throwing or defaulting to something else, when given no evaluations at all"
    proves: "the empty-collection edge case — no evaluations in, no evaluations or evidence out, no exception"
    fails_when: "an empty evaluations array throws, or narrowedInput comes back non-empty or malformed"
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: "requires no evidenceByHypothesis entry for a required hypothesis whose own evaluation cites nothing"
    proves: "an evaluation with no citations never triggers an evidence lookup, so an absent map entry is not an error in that case"
    fails_when: "the call throws despite the required hypothesis citing nothing, or evidence is fabricated where none was cited"
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: "throws naming the hypothesis when evidenceByHypothesis carries no entry for a required hypothesis that cites"
    proves: "the caller-contract-fault error path when a required, citing hypothesis has no evidence entry at all"
    fails_when: "the call does not throw, or throws a message that does not name h1"
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: "throws naming the concept when a required hypothesis's own evidence entry does not carry the cited concept"
    proves: "the caller-contract-fault error path when the hypothesis's own evidence entry exists but omits the cited concept"
    fails_when: "the call does not throw, or throws a message that does not name missing-concept"
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: "imports no framework, driver or provider client, so infrastructure cannot be reached from it directly"
    proves: "the module's purity against infrastructure packages (constraints/the-domain-depends-on-no-infrastructure)"
    fails_when: "the file's source gains an import of any listed framework, driver or provider client"
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: "imports nothing from the standard library either, keeping it pure and synchronous"
    proves: "no node:-prefixed or builtin standard-library import reaches this module"
    fails_when: "the file's source gains a standard-library import (e.g. node:fs, node:crypto)"
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: "imports no port file, since a port models an infrastructure boundary this module never reaches"
    proves: "the module imports no *.port.* specifier, consistent with the doc comment's own claim to import only case, case-resolution, evaluation, citation and evidence"
    fails_when: "the file's source gains an import whose specifier contains .port."
not_applicable:
  - edge_case: a Case with zero hypotheses
    why: "rules/knowledge/a-case-has-at-least-one-hypothesis makes this state unconstructible for a valid Case; a test over it would assert against a value the domain forbids rather than a behavior of this module"
  - edge_case: a numeric boundary at either end of a range
    why: "this module's contract states no numeric range — no count, size or threshold criterion exists to have an edge"
  - edge_case: two operations against one subject at once
    why: "resolveAndNarrow is a pure, synchronous function over the arguments given it; it holds no shared mutable state across calls, so there is no concurrency behavior to observe"
  - edge_case: a dependency that fails, is unavailable, or answers slowly
    why: "the module takes no I/O dependency — evidenceByHypothesis is a plain map supplied by the caller, and the only failure path is the caller-contract fault already tested (a missing entry or concept), not a slow or unavailable collaborator"
untested:
  - "That resolveOutcome is called exactly once (as opposed to zero, or more than once with the results reconciled) is not verified by a call-count/spy assertion — this suite, like the rest of this codebase, tests only observable behavior, never which internal call happened. Verbatim and preserved precedence are proven observably, but a hypothetical implementation that called resolveOutcome twice and discarded one answer without changing the visible result would not be caught by any test here."
---

## What it is

Tests proving resolveAndNarrow()/narrowInput() against resolve-and-narrow-input-unconditional-breadth's own four criteria, plus resolveOutcome's own preserved precedence-following and verbatim-answer behavior, plus the module's import purity.

## Notes

Three tests initially failed on their first suite run — not a disagreement with the implementation, but an incomplete fixture: confirmed()/refuted() helpers always cite (per rules/investigation/a-decided-evaluation-cites-evidence), and three tests omitted the matching evidenceByHypothesis entry for a hypothesis whose citation was never resolved by an earlier evaluation's own dedup. Fixed by supplying the missing evidence entries; each test's own point (shape symmetry, outcome precedence, evaluation ordering) is unchanged.
draft-assessment-text.ts and draft-assessment-text.spec.ts — the two files the implementation record's own divergences disclose as human-authorized compile-compatibility patches — were deliberately left untouched by this proof; they are read-only context, not this task's tests to rewrite.
