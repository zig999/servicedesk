---
title: resolve-and-narrow-input drops confirmed/fallback branching for unconditional breadth
summary: resolve-and-narrow-input.ts now always narrows every required hypothesis's evaluation and the evidence its citations name, in one shape, regardless of the resolved outcome; draft-assessment-text.ts received one disclosed, out-of-scope compile-compatibility patch so the tree keeps building.
task: sha256:e5227a5191009472f4a1da00eaedb469fce4928609c682c37c06946da7b4db0f
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/assessment-consolidation-resolve-and-narrow-input-unconditional-breadth-build-4
files:
  - path: src/investigation/resolve-and-narrow-input.ts
    effect: "still resolves theCase's outcome via resolveOutcome exactly once and returns it verbatim as `resolved`, but narrowInput() no longer branches on resolved.determining. NarrowedInput is now one shape (evaluations, evidence), replacing the removed ConfirmedNarrowedInput/FallbackNarrowedInput/FallbackEvaluationSummary types. requiredEvaluationsOf() filters the given evaluations to exactly the hypotheses requiresEvaluationOf(theCase) names; narrowedEvidenceOf()/evidenceForCitation() then resolve each of those (filtered) evaluations' own citations to the one Evidence item its concept names, per hypothesis, deduplicated by concept, throwing a caller-contract Error when evidenceByHypothesis lacks an entry for a required, cited hypothesis or that entry lacks the cited concept."
  - path: src/investigation/draft-assessment-text.ts
    effect: "disclosed, out-of-scope compile-compatibility patch (see divergences), not this task's own objective. Its import of the removed ConfirmedNarrowedInput/FallbackNarrowedInput/FallbackEvaluationSummary types is replaced with the new unconditional NarrowedInput, and draftText() no longer branches on narrowedInput.basis: it now builds one unconditional body from narrowedInput.evaluations and narrowedInput.evidence together, noting resolved.determining (already received unchanged) only to say whether a hypothesis confirmed. draftAssessment's own outward behavior is untouched; only draftText()'s internal body construction changed."
  - path: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    effect: "disclosed, out-of-scope compile-compatibility patch. Fixture helpers built from the removed ConfirmedNarrowedInput/FallbackNarrowedInput/FallbackEvaluationSummary types replaced with fixtures over the new unconditional NarrowedInput; every existing assertion's own intent preserved unchanged against draftText()'s patched (disposable) output."
  - path: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    effect: "this task's own pre-existing proof, rewritten whole to prove the new unconditional-breadth shape in place of the removed confirmed/fallback branching it previously proved."
criteria:
  - criterion: "Given a confirmed outcome, the narrowed input still carries every required hypothesis's evaluation, not only the one that confirmed."
    met: true
    how: "narrowInput() never reads resolved.determining; requiredEvaluationsOf(theCase, evaluations) always returns every evaluation whose hypothesis is in requiresEvaluationOf(theCase), so a confirmed outcome narrows exactly the same set as any other outcome, never only the determining hypothesis's own evaluation."
  - criterion: "Given no confirmation, the narrowed input still carries every required hypothesis's evaluation."
    met: true
    how: "the same unconditional path runs whether or not resolveOutcome found a confirming hypothesis — nothing in narrowInput()/requiredEvaluationsOf() consults resolved at all, so a fallback outcome produces the identical evaluations set as a confirmed one."
  - criterion: "The narrowed input never carries a hypothesis's criterion, the case's when_to_use, or a hypothesis outside those the case requires evaluation of."
    met: true
    how: "NarrowedInput's own type declares only evaluations (the domain Evaluation type — hypothesis, verdict, reason, citations; no criterion field exists on it) and evidence (the domain Evidence type — no when_to_use field either); theCase itself is used only to compute requiresEvaluationOf(theCase) and is never stored in or reachable from the output. requiredEvaluationsOf() filters out any evaluation whose hypothesis name is not in that required set."
  - criterion: "The narrowed input carries exactly the evidence its included citations name, no more."
    met: true
    how: "narrowedEvidenceOf() iterates only the already-filtered (required) evaluations' own citations and resolves each, via evidenceForCitation(), to the one Evidence item its own hypothesis's supplied evidence names by concept; a seenConcepts set ensures a concept named by more than one citation is included once, never duplicated, and no evidence outside what an included citation names is ever added."
nodes:
  - node: domain/investigation/assessment-consolidator
    how: "this task does not build the consolidate operation or its port (that is task/assessment-consolidation/assessment-consolidator-port-and-fake's own scope); it shapes two of the three inputs that node's Responsibility names the operation as taking — every required hypothesis's evaluation and the evidence its citations name — as the NarrowedInput the port will eventually receive. No operation or port itself lives in this file, so there is nothing here to point encoded_at at."
  - node: domain/investigation/evaluation
    encoded_at:
      - src/investigation/resolve-and-narrow-input.ts
    how: "NarrowedInput.evaluations reuses the domain Evaluation type verbatim — hypothesis, verdict, reason and citations — rather than a bespoke summary that drops a field, so the evaluation's whole shape survives into the narrowed input unchanged."
  - node: domain/investigation/citation
    encoded_at:
      - src/investigation/resolve-and-narrow-input.ts
    how: "evidenceForCitation() resolves each citation to exactly one Evidence item by matching citation.concept against its own hypothesis's supplied evidence."
  - node: domain/investigation/evidence
    encoded_at:
      - src/investigation/resolve-and-narrow-input.ts
    how: "narrowedEvidenceOf() selects Evidence items by concept, deduplicated via seenConcepts, so the narrowed input's evidence set holds one record per collected concept even where two citations name the same one."
  - node: domain/knowledge/case
    encoded_at:
      - src/investigation/resolve-and-narrow-input.ts
    how: "requiredEvaluationsOf() decides inclusion solely through Case's own requires-evaluation-of operation, and resolveOutcome(theCase, verdicts) still answers the outcome/referral/determining hypothesis unchanged; nothing here reads a hypothesis's own criterion or the case's when_to_use."
  - node: rules/investigation/the-writing-input-is-narrowed
    encoded_at:
      - src/investigation/resolve-and-narrow-input.ts
    how: "resolveAndNarrow()/narrowInput() unconditionally produce the same NarrowedInput shape regardless of resolved.determining — every required hypothesis's own evaluation plus the evidence any of those citations name — and the case's hypotheses, their criteria and its when_to_use never enter narrowedInput, which is exactly the rule's statement."
inferences:
  - inferred: "NarrowedInput.evaluations reuses the domain Evaluation type verbatim (hypothesis, verdict, reason, citations) rather than a bespoke narrowed-summary type."
    from: "the rule's own list — verdict, reason when present and citations — is exactly domain/investigation/evaluation's attribute set, word for word, and that domain node already forbids a criterion or when_to_use field, so reusing it verbatim adds no new type while still satisfying the rule structurally."
  - inferred: "a citation's concept is resolved against its own evaluation's hypothesis entry in evidenceByHypothesis, rather than against a flattened pool of evidence across every required hypothesis."
    from: "the pre-existing evidenceByHypothesis convention shared with judgment-stage.ts and the domain rule a-citation-stays-within-the-hypothesis-collects, which together imply a citation's concept is always among its own hypothesis's own supplied evidence."
  - inferred: "evidence is deduplicated by concept — a concept named by two different required hypotheses' citations appears once in narrowedInput.evidence, not twice."
    from: "domain/investigation/evidence's own Responsibility (one collected concept, identified by its concept), so two citations naming the same concept name the same one piece of evidence, and criterion 4's no more reads as no more than the distinct set of named concepts."
  - inferred: "narrowedInput.evaluations preserves the given evaluations array's own order (filtered), rather than being re-sorted to the case's declared hypothesis precedence."
    from: "none of the task's four criteria state an order requirement, and the module's own prior behavior (mapping the given evaluations array in its own order, never reordering) is the closest existing precedent."
  - inferred: "a required hypothesis whose evaluation is entirely absent from the given evaluations array is simply absent from narrowedInput.evaluations too — no throw, no synthesized placeholder entry."
    from: "totality over one evaluation per required hypothesis belongs to rules/investigation/one-evaluation-per-required-hypothesis, established upstream by judgment-stage.ts's own construction; none of this task's four criteria ask this module to re-enforce that totality itself."
divergences:
  - from: "this task's own declared scope: its criteria, rationale and implements name only resolve-and-narrow-input.ts's confirmed/fallback removal, and no file or node about draft-assessment-text.ts."
    departure: "src/investigation/draft-assessment-text.ts — a file this task does not implement or list — was patched: its import of the removed types is replaced with the new unconditional NarrowedInput, and draftText()'s narrowedInput.basis branch is replaced with one unconditional body reading narrowedInput.evaluations and narrowedInput.evidence together, so the file keeps compiling. draftAssessment's own outward behavior is untouched; only draftText()'s internal body changed."
    why: "a mutual build deadlock — this task cannot be recorded without a green build, and task/assessment-consolidation/draft-assessment-text-consumes-consolidator (which depends_on this task) cannot touch this same file until this task is recorded. The human reviewed this and explicitly authorized one narrow, disclosed, mechanical patch to break it. Nothing here decides a domain fact — the exact wording remains this module's own free choice, as its header comment already stated before this task — and the patch is explicitly disposable scaffolding: task/assessment-consolidation/draft-assessment-text-consumes-consolidator replaces this whole template-based approach with a call to the assessment-consolidator port and will rewrite this file's logic again from a clean context regardless."
  - from: "the same human authorization above, extended to the pre-existing spec file this task's own Subject-unrelated but structurally identical break reached."
    departure: "src/__tests__/unit/investigation/draft-assessment-text.spec.ts's fixture helpers (aConfirmedNarrowedInput, aFallbackNarrowedInput, aFallbackEvaluationSummary) were replaced with fixtures over the new unconditional NarrowedInput shape, and the two empty-collection edge-case tests were adjusted so each isolates exactly the one collection it means to exercise. No assertion's own intent changed; only the fixture construction around it did."
    why: "owned by task/assessment-consolidation/draft-assessment-text-consumes-consolidator, not this task; the same deadlock applies one level further out, since this port's own spec fails to compile the moment draft-assessment-text.ts's disclosed patch above lands. The human authorized this same narrow, disclosed exception rather than leaving the whole task un-recordable."
preserved:
  - "resolveOutcome(theCase, verdictsOf(evaluations)) is still called exactly once and its answer returned verbatim as resolved, unaffected by this rework (rules/investigation/the-outcome-comes-from-the-case)."
  - "ResolveAndNarrowOptions's and ResolveAndNarrowResult's own top-level field names and the resolveAndNarrow() function's own signature are unchanged; only NarrowedInput's internal shape changed."
  - "the per-hypothesis-name evidenceByHypothesis convention shared with judgment-stage.ts is kept as this module's own evidence input, rather than replaced by a differently-shaped parameter."
  - "the module's own purity — no port, client or standard-library import, and a synchronous, non-Promise return — is unchanged."
  - "draftAssessment's own outward behavior — outcome and referral copied from resolved unchanged, and determining_hypothesis present exactly where resolved.determining is defined and absent otherwise — is preserved unchanged by the disclosed compile-compat patch to draftText()'s internal body."
deferred:
  - what: "draft-assessment-text.ts's actual rework — replacing template-based drafting with a call to the assessment-consolidator port, and receiving the case's consolidation register as an explicit input — is not implemented here. This delivery only patched the file mechanically to keep it compiling against the new NarrowedInput shape."
    why: "that rework is task/assessment-consolidation/draft-assessment-text-consumes-consolidator's own objective, which explicitly depends_on this task and on task/assessment-consolidation/assessment-consolidator-port-and-fake (not yet delivered); deciding how draftAssessment calls the not-yet-built consolidator port belongs to that task's own clean context."
  - what: "draft-assessment-text.spec.ts's own real proof — proving the consolidator-consuming behavior — is not written here; only its pre-existing assertions were kept alive against the disposable scaffolding patch."
    why: "that proof belongs to task/assessment-consolidation/draft-assessment-text-consumes-consolidator's own test-authoring pass, once the file's real rework lands."
---

## What it is

resolve-and-narrow-input.ts's confirmed/fallback branch removed in favor of always narrowing every required hypothesis's evaluation and its cited evidence.
Two coordinator-authorized, disclosed, out-of-scope compile-compatibility patches — to draft-assessment-text.ts and its own spec file — written to break a mutual build deadlock between this task and task/assessment-consolidation/draft-assessment-text-consumes-consolidator, none of which claim that task's own objective or criteria as satisfied.
This task's own pre-existing proof (resolve-and-narrow-input.spec.ts) rewritten whole to prove the new shape.

## Notes

None.
The build deadlock and its resolution: this task's own build could not go green without draft-assessment-text.ts and its spec already compiling against the new NarrowedInput shape, but the task that owns that file's real rework cannot start until this task already has a delivery record. The human reviewed this circularity directly (a second instance of the same pattern task/subject-identity-rework/subject-value-object hit) and authorized one narrow exception per file — recorded above in `divergences` and `deferred`. Both sites are still owned, in full, by task/assessment-consolidation/draft-assessment-text-consumes-consolidator; this record claims none of its criteria.
