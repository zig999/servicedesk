---
title: One investigation runs synchronously end to end
summary: The composition that runs one fresh investigation — collection, judgment, consolidation and drafting, persistence — synchronously within the declared deadline.
objective: A single composition runs one fresh investigation from a resolved case, subject and narrative through collection, judgment, consolidation/drafting and persistence, returning the assessment only once the investigation is written.
criteria:
  - The composition returns an assessment only after the investigation has been written; no assessment is returned without a corresponding record.
  - When persistence does not conclude within what remains of the declared deadline, the caller receives an error, not an assessment.
  - The whole run responds within the declared total deadline, with each stage receiving no more than the minimum of its nominal budget and what remains at that point.
  - The completed Investigation pins the case by slug, version and hash, together with the model, the prompt version and the evidence.
  - The composition takes now and the deadline as explicit parameters and never reads the system clock internally.
  - The investigation the composition runs is exactly the case the knowledge context published, pinned by content at the start of the request.
depends_on:
  - task/subject-identity-rework/investigation-factory-assembles-and-validates-the-subject
  - task/subject-identity-rework/evidence-collection-stage-subject-passthrough
  - task/assessment-consolidation/draft-assessment-text-consumes-consolidator
  - task/assessment-consolidation/case-coherence-optional-consolidation-register
rationale: No diagnose composition exists on disk yet; wiring one fresh investigation's whole synchronous run is one falsifiable outcome distinct from the payload-shape and dedup decision the next task adds in front of it, and it is demonstrable on its own by invoking it directly with a resolved case, subject and narrative.
implements:
  - contracts/investigation/diagnosis
  - contracts/investigation/case-source
  - domain/investigation/investigation
  - rules/investigation/an-investigation-is-written-once
  - rules/investigation/replay-is-pinned
  - rules/investigation/the-response-follows-the-record
  - rules/investigation/no-stage-aborts-on-its-deadline
  - rules/investigation/an-answer-arrives-within-the-declared-deadline
  - constraints/diagnosis-answers-synchronously
  - constraints/the-deadline-is-an-absolute-propagated-instant
  - scenarios/investigation/no-response-without-a-record
sources:
  - intake/scope.md
---

## What it is

The composition-root function that wires collection, judgment, consolidation/drafting and persistence into one synchronous run.
The propagation of one absolute deadline instant across every stage it composes.

## Notes

No factories/*.ts wires investigation, judgment, drafting or storage together yet, so this composition follows the existing per-context factory convention rather than starting a second wiring style.
REMAINDER, from the specification — none of this task's six criteria reach the dedup/routing content of rules/investigation/an-investigation-is-idempotent-within-a-window (return the completed investigation within the window, join an in-progress one, start no second one, and never match a no-ticket call this way), constraints/in-progress-is-a-lease-not-domain-state, scenarios/investigation/a-repeated-request-returns-the-same-investigation, scenarios/investigation/no-ticket-reference-never-repeats, or the "idempotent within the window when a ticket reference is given" clause of contracts/investigation/diagnosis. This task's objective is scoped to running one already-resolved, fresh investigation; deciding whether to run fresh, join an in-progress investigation, or return a completed one is another task, in front of it. Belongs to task/diagnose-entry-point/diagnose-payload-and-window-dedup.
REMAINDER, from the specification — rules/investigation/no-stage-aborts-on-its-deadline's collection clause ("collection records a timeout result") and judgment clause ("judgment records deadline-exceeded") are not reached by any of this task's criteria; only its persistence clause is, by criterion 2. Belongs to the evidence-collection stage and the judgment stage's own internal deadline-overrun handling — already realized in code delivered under the closed investigation-engine plan, and not reworked by any task in this plan.
