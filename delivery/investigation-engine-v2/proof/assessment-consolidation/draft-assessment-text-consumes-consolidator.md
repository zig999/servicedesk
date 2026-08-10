---
title: draft-assessment-text proves its consolidator-consuming rework
summary: Rewrites draft-assessment-text.spec.ts whole against the new async, single-options-object, consolidator-calling draftAssessment, proving the task's five criteria without duplicating draft-assessment-text-modules.spec.ts's own import-fitness job.
implementation: sha256:8620994e9cd541b205e5f78af4398a0c46edcc418c423a4826182b67a20f9834
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/assessment-consolidation-draft-assessment-text-consumes-consolidator-suite
tests:
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: "answers text equal to what the consolidator returns for narrowedInput's own evaluations and evidence together with the given register"
    proves: "Criterion 1 — the produced text equals the consolidator's returned text for the same narrowed input and register."
    fails_when: "draftAssessment computes text itself, forwards a narrowedInput.evaluations/evidence or register that differs from what it was given, or otherwise answers a text other than the exact one seeded for that triple"
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: "answers the register-specific text seeded for the register actually given, not the text seeded for the other register"
    proves: "Criterion 1, reinforced against a vacuous pass — the same narrowedInput drives two distinct texts purely by which register was given"
    fails_when: "draftAssessment ignores which register it was given, or answers the same text regardless of which register was passed"
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: "lets the consolidation register given in options alone decide which seeded text answers, proving it reaches this call as an explicit input rather than a value fixed in advance"
    proves: "Criterion 3 — consolidationRegister reaches draftAssessment as an explicit parameter of options and actually drives the consolidator call"
    fails_when: "draftAssessment reads a register from anywhere other than options.consolidationRegister, so passing plain would not select the plain-seeded fixture"
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: "carries resolved's own outcome, referral and determining hypothesis through unchanged, regardless of what the consolidator answers"
    proves: "Criterion 4 — outcome, referral and determining_hypothesis are exactly what resolved carries, unaffected by the consolidator call, for the confirmed path"
    fails_when: "draftAssessment recomputes, drops or alters outcome/referral/determining_hypothesis, or lets the consolidator's answer influence any of the three"
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: "carries no determining_hypothesis field at all — not even present with an undefined value — when resolved carries none"
    proves: "Criterion 4's fallback half — determining_hypothesis is structurally absent, not merely undefined"
    fails_when: "draftAssessment sets determining_hypothesis: undefined instead of omitting the key, or invents a value where resolved carried none"
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: "exposes only outcome, referral, determining_hypothesis and text — never a verdict or evidence field — on a confirmed-path answer"
    proves: "Criterion 5 — the returned Assessment's own key set is exactly outcome, referral, determining_hypothesis, text, with no verdict or evidence field ever appearing"
    fails_when: "draftAssessment adds a verdict or evidence field to the returned object, or any key beyond the four named"
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: "exposes only outcome, referral and text — no determining_hypothesis, verdict or evidence field — on a fallback-path answer"
    proves: "Criterion 5's fallback half, confirming the key-set guarantee holds identically when determining_hypothesis itself is absent"
    fails_when: "draftAssessment adds a verdict or evidence field, or an unwanted determining_hypothesis key, on the fallback path"
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: "forwards empty evaluations and empty evidence to the consolidator rather than special-casing either one"
    proves: "the empty-collection edge case — draftAssessment does not throw, substitute a default text or otherwise special-case an empty narrowedInput"
    fails_when: "draftAssessment throws on empty evaluations/evidence, or answers something other than the exact text the consolidator seeded for that empty call"
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: "propagates the consolidator's rejection rather than swallowing it into a default or empty text"
    proves: "the dependency-failure edge case — a rejecting consolidator call surfaces as a rejection from draftAssessment itself"
    fails_when: "draftAssessment catches the consolidator's rejection and resolves anyway"
not_applicable:
  - edge_case: absent or missing fields on DraftAssessmentOptions
    why: "every field is required by the DraftAssessmentOptions type; an absence is a compile-time fault the type-checker refuses before any test could run"
  - edge_case: a boundary value at each end of a stated numeric range
    why: "draftAssessment takes no numeric parameter and applies no range"
  - edge_case: a duplicate hypothesis or duplicate evidence concept in narrowedInput
    why: "deduplication and required-hypothesis filtering are resolve-and-narrow-input's own job, already proven in resolve-and-narrow-input.spec.ts; draftAssessment only forwards narrowedInput.evaluations/evidence exactly as given"
  - edge_case: two operations against one subject running at once
    why: "draftAssessment is a pure async function with no module-level or instance-level mutable state"
---

## What it is

Rewrites draft-assessment-text.spec.ts whole to prove all five criteria of the consolidator-consuming rework: text equals the consolidator's answer, register reaches as an explicit input, outcome/referral/determining_hypothesis unaffected, and only text/outcome/referral/determining_hypothesis ever appear on the returned Assessment.

## Notes

None.
