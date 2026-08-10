---
title: Resolve the outcome and narrow the writing input
summary: resolveAndNarrow derives Verdicts from the given evaluations, calls the case's own resolveOutcome exactly once and returns its answer verbatim, then assembles a structurally narrowed input, the determining hypothesis's own evidence, or every evaluation's verdict and reason with no case body, for the drafting step that follows.
task: sha256:4cd1de68b0e551f7d354d5afb9668921aee63ebb7e34aa891356d917de317ba6
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/assessment-drafting-resolve-and-narrow-input-build
files:
- path: src/investigation/resolve-and-narrow-input.ts
  effect: Declares ResolveAndNarrowOptions (case, evaluations, evidenceByHypothesis), the two-variant NarrowedInput (ConfirmedNarrowedInput carrying only evidence, FallbackNarrowedInput carrying only FallbackEvaluationSummary[] with hypothesis/verdict/optional reason), ResolveAndNarrowResult ({ resolved, narrowedInput }), and the exported resolveAndNarrow(options) plus its private helpers verdictsOf, confirmedNarrowedInput, evidenceFor and fallbackNarrowedInput/fallbackSummaryOf. Pure and synchronous, importing only case.ts, case-resolution.ts and this module's own sibling plain-data types.
criteria:
- criterion: The resolved outcome, referral and determining hypothesis equal exactly what the case's own resolve-outcome answers for the given evaluations, computed nowhere else.
  met: true
  how: resolveAndNarrow builds verdicts with verdictsOf(evaluations), one entry per evaluation, keyed by its own hypothesis name and mapped to its verdict, and calls resolveOutcome(theCase, verdicts) exactly once; resolved is that call's answer, returned unmodified. Nothing else in the module reads, computes or overrides outcome, referral or determining.
- criterion: When a hypothesis confirmed, the narrowed input carries that hypothesis's own evidence and no other hypothesis's evidence.
  met: true
  how: 'When resolved.determining is defined, confirmedNarrowedInput calls evidenceFor(determining, evidenceByHypothesis), which reads exactly that one hypothesis name''s entry of the caller-supplied map and returns { basis: ''confirmed'', evidence }. No other key of the map, and no other source of evidence, is ever read in this branch.'
- criterion: When no hypothesis confirmed, the narrowed input carries every evaluation's verdict and reason, and no case body.
  met: true
  how: When resolved.determining is undefined, fallbackNarrowedInput maps every entry of the given evaluations array through fallbackSummaryOf, answering { hypothesis, verdict } or, only where the verdict is inconclusive, { hypothesis, verdict, reason }, citations are always dropped, and theCase is never read anywhere in this branch.
- criterion: The narrowed input never contains the case's hypotheses' criteria or its when_to_use text.
  met: true
  how: 'NarrowedInput is the union of ConfirmedNarrowedInput ({ basis; evidence }) and FallbackNarrowedInput ({ basis; evaluations: FallbackEvaluationSummary[] }), and FallbackEvaluationSummary is { hypothesis; verdict; reason? }, none of these three declared shapes has a field capable of holding a hypothesis''s criterion string or the case''s when_to_use; the exclusion is structural, not a matter of the code choosing not to populate a field.'
nodes:
- node: domain/investigation/assessment
  encoded_at:
  - src/investigation/resolve-and-narrow-input.ts
  how: ResolveAndNarrowResult.resolved is exactly resolveOutcome's ResolvedOutcome, mapping 1:1 onto three of this node's four attributes, outcome, referral and determining (this node's determining_hypothesis, present only when a hypothesis confirmed). The node's fourth attribute, text, is deliberately not produced here, task/assessment-drafting/draft-assessment-text's own job.
- node: domain/investigation/investigation
  how: Honored, not encoded. This module consumes two of the aggregate's own attributes, evidence and evaluations, exactly as declared, but does not assemble the Investigation aggregate itself; that is task/investigation-lifecycle/investigation-factory's own job. No fact of this node is newly assigned here, so there is nothing to point encoded_at at.
- node: domain/investigation/evidence
  how: Honored, not encoded. Evidence's own attributes are declared and assembled entirely by evidence-collection-stage.ts; this module only ever reads a determining hypothesis's already-built Evidence[] out of the caller-supplied evidenceByHypothesis map and passes it through unmodified, never reshaping or touching a field of it.
- node: domain/investigation/evaluation
  encoded_at:
  - src/investigation/resolve-and-narrow-input.ts
  how: verdictsOf(evaluations) reads every evaluation's own hypothesis and verdict to build the Verdicts map resolveOutcome consumes, and fallbackSummaryOf reduces one evaluation to exactly the subset of this node's declared attributes criterion 3 admits, hypothesis, verdict and, only where inconclusive, reason, deliberately dropping citations.
- node: domain/knowledge/hypothesis
  encoded_at:
  - src/investigation/resolve-and-narrow-input.ts
  how: Honored via structural omission. NarrowedInput's two variants declare no field that could hold this node's own criterion attribute (or the sibling case's when_to_use). Only a hypothesis's evidence or its bare name plus verdict/reason ever crosses into the narrowed input; collects, criterion and resolution never do.
- node: rules/investigation/the-outcome-comes-from-the-case
  encoded_at:
  - src/investigation/resolve-and-narrow-input.ts
  how: resolveAndNarrow calls resolveOutcome(theCase, verdictsOf(evaluations)) exactly once and returns its answer as resolved, unmodified; nothing else in this module computes, checks or overrides the outcome, referral or determining hypothesis.
- node: rules/investigation/the-writing-input-is-narrowed
  encoded_at:
  - src/investigation/resolve-and-narrow-input.ts
  how: confirmedNarrowedInput and fallbackNarrowedInput are exactly this rule's own two branches, the determining hypothesis's own evidence and nothing else, or every evaluation's verdict and reason with no case body at all, and NarrowedInput's structural exclusion of a hypothesis's criterion and the case's when_to_use is this rule's own further guarantee.
- node: scenarios/knowledge/no-confirmation-falls-back
  encoded_at:
  - src/investigation/resolve-and-narrow-input.ts
  how: resolveOutcome (already delivered) answers the fallback's outcome/referral with no determining hypothesis named once every hypothesis is refuted or inconclusive; resolveAndNarrow's own contribution is branching on resolved.determining === undefined into fallbackNarrowedInput.
- node: scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  encoded_at:
  - src/investigation/resolve-and-narrow-input.ts
  how: resolveOutcome picks the first confirmed hypothesis in declared precedence order; resolveAndNarrow reads resolved.determining exactly as answered and never re-derives precedence itself, then narrows to that one hypothesis's own evidence. A second, non-determining confirmed hypothesis keeps whatever verdict it received without ever surfacing in the narrowed input.
- node: constraints/the-domain-depends-on-no-infrastructure
  encoded_at:
  - src/investigation/resolve-and-narrow-input.ts
  how: The module imports only the case, case-resolution, evaluation, evidence, evaluation-reason and verdict sibling modules' own plain-data types, nothing else; resolveAndNarrow and every helper are synchronous, pure functions with no I/O, no framework, driver or provider client.
inferences:
- inferred: resolveAndNarrow and every helper are pure and synchronous, importing nothing but the case, case-resolution, evaluation, evidence, evaluation-reason and verdict sibling modules' own plain-data types, never a port, an async signature or an infrastructure import.
  from: The task's own UNDERDETERMINED note, constraints/the-domain-depends-on-no-infrastructure governs this task and case-resolution.ts already established exactly this discipline for the same context.
- inferred: Evaluation (src/investigation/evaluation.ts) is reused unmodified as this module's own input shape, even though this task's own depends_on does not name task/hypothesis-judgment/judgment-stage.
  from: The task's own explicit direction to reuse the already-decided sibling shape the same way earlier tasks reused one without a formal dependency; Evaluation is already present in this tree, delivered by task/hypothesis-judgment/judgment-stage.
- inferred: 'NarrowedInput is declared as one discriminated union tagged by a new basis: ''confirmed'' | ''fallback'' field, rather than resolveAndNarrow returning two structurally distinct result types or one object with two optional fields.'
  from: A discriminated union matches this codebase's own established idiom for exactly this kind of either/or domain answer, Evaluation, EvaluationOutcome and ObservationOutcome are each already a discriminated union, and 'confirmed'/'fallback' echoes case-resolution.ts's own prose for the same distinction.
- inferred: The new module sits at src/investigation/resolve-and-narrow-input.ts, not under a new src/assessment/ directory.
  from: Every existing file that composes case-resolution.ts's behavior with evaluations and evidence already lives under src/investigation/, and the plan's own inventory names investigation as the one greenfield landing area for this epic's modules. No domain/investigation/assessment-named module exists yet, and this task does not build the Assessment value itself.
- inferred: FallbackEvaluationSummary carries the hypothesis name alongside its verdict and (where present) reason, even though criterion 3's own text names only verdict and reason.
  from: domain/investigation/evaluation's own identity is the hypothesis name it judges; the writing-input rule's own Description says the fallback's value is saying what was ruled out and why, which is unanswerable without naming which hypothesis each verdict/reason belongs to; criterion 4's own exclusion names only a hypothesis's criterion string and the case's when_to_use, never its bare name.
- inferred: ConfirmedNarrowedInput does not itself carry the determining hypothesis's name, only its evidence.
  from: ResolvedOutcome's own determining field already names it, and this module's own ResolveAndNarrowResult already pairs resolved with narrowedInput in one object, so a consumer never lacks the name; duplicating it inside narrowedInput would be a second place for the same fact to disagree.
- inferred: A determining hypothesis whose name has no entry in evidenceByHypothesis is a thrown caller-contract fault, never a manufactured empty evidence array.
  from: judgment-stage.ts's own already-delivered evidenceFor convention for exactly the same situation, extended here since nothing in this task's own criteria states what an incomplete composition should silently default to.
deferred:
- what: Enforcing rules/investigation/one-evaluation-per-required-hypothesis (refusing a build over a duplicate or missing evaluation) over the given evaluations.
  why: Belongs to task/investigation-lifecycle/investigation-factory, which builds and validates the Investigation aggregate itself; this task only derives Verdicts and narrows the writing input over whatever evaluations it is given.
- what: Assembling the full domain/investigation/assessment value, including its text field, from this module's own resolved and narrowedInput.
  why: Explicitly task/assessment-drafting/draft-assessment-text's own job, per this task's own instruction not to build the writing/drafting step here.
- what: Matching evidence-collection-stage.ts's own per-concept Evidence[] output into the per-hypothesis evidenceByHypothesis map this module (and judgment-stage.ts before it) expects.
  why: Out of this task's own scope, mirroring judgment-stage.md's own already-recorded deferral of the same composition; belongs to whichever later task wires the whole investigation-lifecycle pipeline together.
- what: Wiring resolveAndNarrow into any factory or production entry point.
  why: No consumer of this module exists anywhere in the tree yet; per the plan's own inventory, no investigation-lifecycle module exists yet either, that composition belongs to task/investigation-lifecycle/diagnose-entry-point.
---

## What it is

The step that decides what drafting is allowed to see. It reuses the case's own resolve-outcome rather than deciding the outcome itself.

## Notes

The UNDERDETERMINED note on import-freedom is resolved by construction: the module is pure and synchronous, importing only plain-data sibling types, matching case-resolution.ts's own established discipline.
