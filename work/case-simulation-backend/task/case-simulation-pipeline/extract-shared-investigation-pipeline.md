---
title: Extract the shared investigation pipeline
summary: buildSubject through draftAssessment become one function returning the complete record, called by diagnose (which adds buildInvestigation and writeWithinDeadline) and, later, by simulate.
sources:
  - work/case-simulation-backend/intake/scope.md
objective: run-diagnosis.ts's own stages 1–4 (buildSubject, collectEvidence, judgeHypotheses, resolveAndNarrow, draftAssessment) are extracted into one shared function that returns the complete record — evidence, evaluations, resolved, assessment, cost, durations and prompts — and diagnose's own composition calls it, adding only buildInvestigation and writeWithinDeadline, with diagnose's own behavior unchanged.
criteria:
  - A shared function exists that runs buildSubject → collectEvidence → judgeHypotheses → resolveAndNarrow → draftAssessment and returns evidence, evaluations, resolved, assessment, cost, durations and prompts as one record.
  - diagnose's own composition calls this shared function and then adds buildInvestigation and writeWithinDeadline.
  - No stage's own logic (collectEvidence, judgeHypotheses, resolveAndNarrow, draftAssessment, buildSubject) is duplicated between diagnose's composition and the shared function.
  - A diagnose request that succeeded before this extraction still returns the identical response after it.
  - The response to a diagnose request still leaves only after the investigation is written.
depends_on:
  - task/investigation-telemetry/widen-judgment-and-consolidation-ports
  - task/investigation-telemetry/evidence-collection-measures-elapsed-ms
  - task/investigation-telemetry/diagnose-reports-real-cost-and-durations
implements:
  - rules/investigation/the-response-follows-the-record
  - rules/investigation/a-subject-carries-at-least-one-attribute
  - domain/investigation/subject
  - domain/investigation/evidence
  - domain/investigation/evaluation
  - domain/investigation/assessment
  - domain/investigation/cost
  - domain/investigation/durations
  - domain/knowledge/resolution
  - domain/knowledge/referral
---

## What it is

run-diagnosis.ts's own RunDiagnosisOptions and private helpers are reshaped so stages 1–4 live behind one callable function.
diagnose's own composition still adds buildInvestigation and writeWithinDeadline after calling it.

## Notes

run-diagnosis.ts's current callers (diagnose.factory.ts, production-diagnose.factory.ts) must still compile and behave unchanged after this extraction.
REMAINDER, from the specification — `rules/investigation/a-simulation-writes-no-investigation` is not reached by this task's criteria: this task only extracts diagnose's own stages into a shared function and leaves diagnose's own behavior unchanged; it neither builds nor exercises any simulate composition. Belongs to `no-cache-simulation-composition` and the two `simulate-*-operation` tasks, which build and exercise it.
REMAINDER, from the specification — `rules/investigation/a-subject-attribute-is-drawn-from-the-glossary` is enforced today only inside buildInvestigation, and this task's own criteria explicitly keep buildInvestigation out of the shared function, leaving it as diagnose's own addition called after the shared function returns. Belongs to whichever simulate composition task decides where a simulated subject's own glossary-membership check runs, since simulate never calls buildInvestigation.
