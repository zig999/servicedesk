---
title: draft-assessment-text consumes the assessment-consolidator port
summary: draftAssessment now assembles its Assessment by awaiting the assessment-consolidator port's consolidate() call for its text, keeping outcome/referral/determining_hypothesis a verbatim copy of resolved and receiving the consolidation register as an explicit input rather than through any case import.
task: sha256:d520172ff0b0ff05fd14050c0517ee29695ff6e9d505a370aba6710e53c0c734
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/assessment-consolidation-draft-assessment-text-consumes-consolidator-build-2
files:
  - path: src/investigation/draft-assessment-text.ts
    effect: "replaces the whole template-based drafText()/summarizeEvaluations()/summarizeEvidence() approach. draftAssessment is now async, takes one options object (DraftAssessmentOptions: resolved, narrowedInput, consolidationRegister, consolidator), and produces text by awaiting consolidator.consolidate(narrowedInput.evaluations, narrowedInput.evidence, consolidationRegister); outcome, referral and determining_hypothesis are still copied unchanged from resolved. Removes the file's prior disclosed-divergence compile-compatibility header entirely, since this task is that patch's declared real owner. Still imports nothing from ../case/case.js — only type-only imports of ResolvedOutcome (case-resolution.js), Assessment, IAssessmentConsolidator, ConsolidationRegister and NarrowedInput."
criteria:
  - criterion: "The text draft-assessment-text produces equals the consolidator's returned text for the same narrowed input and register."
    met: true
    how: "draftAssessment awaits consolidator.consolidate(narrowedInput.evaluations, narrowedInput.evidence, consolidationRegister) and assigns the resolved promise value directly to text with no further transformation, so the returned Assessment's text is exactly what that call answered."
  - criterion: "draft-assessment-text imports nothing from the case module, preserving its existing zero-import fitness guarantee."
    met: true
    how: "the file's only imports are type-only imports of ResolvedOutcome (from ../case/case-resolution.js, not case.js), Assessment, IAssessmentConsolidator, ConsolidationRegister and NarrowedInput — none from ../case/case.js — so draft-assessment-text-modules.spec.ts's existing case.js-suffix import check still finds nothing to flag."
  - criterion: "draft-assessment-text receives the consolidation register as an explicit input parameter, never reading it from a case import."
    met: true
    how: "DraftAssessmentOptions.consolidationRegister is a required field of type ConsolidationRegister, read straight out of the options object draftAssessment is called with — never derived from a Case value, which this module never imports at all."
  - criterion: "The assessment's outcome, referral and determining hypothesis remain exactly what the case's resolve-outcome returned, unaffected by the consolidator call."
    met: true
    how: "base copies resolved.outcome and resolved.referral verbatim, and determining_hypothesis is set to resolved.determining exactly where it is defined and omitted otherwise. This computation does not read the awaited consolidate() result at all, so the consolidator's answer can only ever affect text."
  - criterion: "The assessment exposes only its text to the customer; outcome, referral, verdicts and evidence stay operational-only."
    met: true
    how: "draftAssessment's return value is shaped exactly by the Assessment type (outcome, referral, determining_hypothesis?, text) — no verdict or evidence field is ever added to it. narrowedInput's own evaluations/evidence are read only to be forwarded as arguments into consolidate(), never copied onto the returned Assessment itself."
nodes:
  - node: domain/investigation/assessment-consolidator
    encoded_at:
      - src/investigation/draft-assessment-text.ts
    how: "draftAssessment calls consolidator.consolidate(narrowedInput.evaluations, narrowedInput.evidence, consolidationRegister) — the port's own responsibility — and leaves outcome, referral and the determining hypothesis to resolved, never decided here."
  - node: domain/knowledge/consolidation-register
    encoded_at:
      - src/investigation/draft-assessment-text.ts
    how: "consolidationRegister is typed ConsolidationRegister and forwarded unchanged into consolidate() as the third argument — never inspected, branched on or defaulted by this module."
  - node: constraints/consolidation-runs-behind-a-port
    encoded_at:
      - src/investigation/draft-assessment-text.ts
    how: "the only consolidation dependency this module holds is the published IAssessmentConsolidator interface; no LLM or provider client is imported or referenced here, and which adapter answers consolidate() is decided entirely by whoever builds the options this function is called with."
  - node: rules/investigation/the-writing-input-is-narrowed
    encoded_at:
      - src/investigation/draft-assessment-text.ts
    how: "draft-assessment-text passes narrowedInput.evaluations and narrowedInput.evidence into consolidate() unconditionally — the same two fields, in the same shape, regardless of resolved's own outcome — never branching on whether a hypothesis confirmed, and structurally unable to reach a hypothesis's own criterion or the case's when_to_use, since NarrowedInput carries neither."
  - node: rules/investigation/the-outcome-comes-from-the-case
    encoded_at:
      - src/investigation/draft-assessment-text.ts
    how: "outcome, referral and determining_hypothesis are copied from resolved — itself already the pinned case's own resolveOutcome answer, computed upstream — unchanged and independent of the consolidator call; draftAssessment decides none of the three itself."
  - node: domain/investigation/assessment
    encoded_at:
      - src/investigation/draft-assessment-text.ts
    how: "draftAssessment is the one place the whole Assessment value is assembled — outcome/referral/determining_hypothesis unchanged from resolved and text as the consolidator answered — matching Assessment's own declared shape, untouched by this task."
  - node: domain/knowledge/case
    how: "consolidationRegister corresponds to the pinned case's own optional consolidation_register attribute, but this module never reads Case directly — it receives the value only as an already-resolved, explicit parameter of its options, honoring the node without encoding any of its facts in this file."
inferences:
  - inferred: "draftAssessment takes one bundled options object (DraftAssessmentOptions: resolved, narrowedInput, consolidationRegister, consolidator) rather than four positional parameters."
    from: "the standard's MNT-01 (tool-decided via eslint's max-params: 3) forbids a fourth positional parameter, and this codebase's own resolveAndNarrow and judgeHypotheses already establish the same options-bag convention for a stage-level function whose inputs outgrew three positional arguments."
  - inferred: "the IAssessmentConsolidator instance itself reaches draftAssessment as an explicit field of its options, rather than this module constructing or importing a concrete adapter."
    from: "judgment-stage.ts's own judgeHypotheses already keeps this exact convention for its own port dependency, and constraints/consolidation-runs-behind-a-port requires a consumer to depend on the interface, never on a concrete adapter."
  - inferred: "consolidationRegister is a required (non-optional) ConsolidationRegister field, and this module never itself defaults it when a pinned case leaves consolidation_register undeclared."
    from: "the already-delivered IAssessmentConsolidator.consolidate() signature declares consolidationRegister as a required, non-optional parameter; domain/knowledge/case's own text says an adapter, not this writing step, keeps whatever register it defaults to when the case declares none."
preserved:
  - "draft-assessment-text-modules.spec.ts's zero-import-of-case.js guarantee: no import of ../case/case.js was reintroduced."
  - "observation-source-modules.spec.ts's directory-wide sweep of every src/investigation/*.ts file for forbidden-package and standard-library imports: no new import of either kind was added."
  - "assessment.ts's own Assessment shape (outcome, referral, determining_hypothesis?, text): untouched, and draftAssessment's return value still matches it exactly."
  - "the exact copy-through of resolved.outcome, resolved.referral and resolved.determining into the returned Assessment, unaffected by the rework of how text is produced."
---

## What it is

draft-assessment-text.ts's template-based text assembly replaced by an async call to the assessment-consolidator port, with outcome/referral/determining_hypothesis unaffected. Replaces the disclosed compile-compatibility patch resolve-and-narrow-input-unconditional-breadth left behind, this task being that patch's declared real owner.

## Notes

None.
