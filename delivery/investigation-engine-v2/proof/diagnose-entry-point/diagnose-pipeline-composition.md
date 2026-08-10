---
title: Diagnose pipeline composition
summary: Proof for run-diagnosis.ts, composing an already-resolved case/subject/narrative through collection, judgment, drafting and persistence, proving the composition's six criteria against fresh fakes for every port it wires — and one documented, non-executable disagreement over a total-deadline requirement the delivered composition does not actually meet.
implementation: sha256:b044311a193ebb7909f4327efd565e3ccfa271c7d2e04f750198202fa8df37fe
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/diagnose-entry-point-diagnose-pipeline-composition-suite-2
tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: "does not resolve until persistence has actually written the investigation, then resolves with the written investigation's own assessment"
    proves: "The composition returns an assessment only after the investigation has been written; no assessment is returned without a corresponding record."
    fails_when: "runDiagnosis resolves before a store whose write is still pending settles, or resolves with anything other than the written investigation's own assessment"
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: "propagates a genuine persistence failure instead of returning an assessment or reframing it as a deadline error"
    proves: "The composition returns an assessment only after the investigation has been written; no assessment is returned without a corresponding record."
    fails_when: "a rejected store.write() is swallowed into a resolved assessment, or reframed as InvestigationWriteDeadlineExceededError instead of propagating unmodified"
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: "propagates the store's own refusal when an investigation with this id is already stored, rather than returning an assessment"
    proves: "the operation-against-state-that-forbids-it edge case, over rules/investigation/an-investigation-is-written-once"
    fails_when: "a write against an already-occupied id resolves with an assessment instead of propagating InvestigationAlreadyStoredError"
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: "propagates a genuine failure from a composed stage, never masking it as an assessment"
    proves: "the dependency-that-fails edge case, extended to an upstream stage's own genuine rejection"
    fails_when: "a rejection from a composed port (here, observation-source) is swallowed into a resolved assessment instead of propagating"
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: "refuses the second of two concurrent runs for the same investigation id once the first has already written it, never producing two assessments for one record"
    proves: "rules/investigation/an-investigation-is-written-once, as this composition honors it — the two-operations-against-one-subject edge case"
    fails_when: "two concurrent runs for the same id both resolve with an assessment, or both reject"
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: "raises InvestigationWriteDeadlineExceededError instead of resolving, when persistence does not conclude within what remains of the declared deadline"
    proves: "When persistence does not conclude within what remains of the declared deadline, the caller receives an error, not an assessment."
    fails_when: "the call resolves with an assessment instead of rejecting, or rejects with anything other than InvestigationWriteDeadlineExceededError carrying id and remainingMs:800"
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: "bounds persistence at the nominal two-second budget, never waiting the whole of an ample remaining deadline"
    proves: "The whole run responds within the declared total deadline, with each stage receiving no more than the minimum of its nominal budget and what remains at that point — persistence half, nominal-budget branch"
    fails_when: "persistence waits longer than 2000ms before timing out, or reports a remainingMs other than 2000, when the declared deadline leaves far more than 2000ms"
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: "bounds persistence at what remains of the declared deadline when that is smaller than the nominal two-second budget"
    proves: "the persistence half, remaining-deadline branch of the minimum"
    fails_when: "persistence times out at anything other than exactly 300ms when only 300ms of the declared deadline remains"
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: "clamps persistence's own bound to zero rather than negative, once the given deadline has already elapsed relative to now"
    proves: "the boundary of criterion 3's own minimum formula (Math.max(0, deadline-now)) at an already-elapsed deadline"
    fails_when: "persistence's own bound is computed as negative or hangs instead of failing immediately with remainingMs:0"
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: "tightens judgment's own deadline to no more than the nominal five-second budget, even where the declared deadline leaves far more room"
    proves: "the judgment half, nominal-budget branch"
    fails_when: "judgment's own hung evaluate() call is not degraded to deadline-exceeded by 5000ms, when the declared deadline leaves far more than 5000ms"
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: "tightens judgment's own deadline to no more than what remains of the declared deadline, when that is smaller than the nominal five-second budget"
    proves: "the judgment half, remaining-deadline branch"
    fails_when: "judgment is not degraded to deadline-exceeded by 1500ms when only 1500ms of the declared deadline remains"
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: "forwards its own (now, deadline) pair into collection unmodified, letting a call finish just under a tight propagated deadline"
    proves: "the collection half — the composition forwards (now, deadline) unshrunk, letting evidence-collection-stage.ts's own unmodified budgeting decide"
    fails_when: "a call that legitimately completes at 190ms of a 200ms propagated deadline is instead recorded as a timeout"
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: "bounds judgment concurrency at exactly the given poolSize, rather than a hardcoded pool of its own"
    proves: "the recorded inference that poolSize is taken as a caller/factory-given dependency with no hardcoded default value"
    fails_when: "two hypotheses' evaluate() calls are ever in flight at once despite poolSize:1"
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: "pins the case by slug, version and hash, the model, the prompt version and the evidence this run actually collected, in the written investigation"
    proves: "The completed Investigation pins the case by slug, version and hash, together with the model, the prompt version and the evidence."
    fails_when: "the written document's pinned_case, model, prompt_version, evidence or id differ from what this call was given or actually collected"
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: "reads no system clock anywhere in its own body: no Date.now(), bare new Date() or performance.now() call appears in run-diagnosis.ts"
    proves: "The composition takes now and the deadline as explicit parameters and never reads the system clock internally — the structural half"
    fails_when: "run-diagnosis.ts's own source text contains a Date.now(), bare new Date() or performance.now() call"
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: "computes the persistence deadline from the given now/deadline pair alone, unaffected by the real system clock"
    proves: "the behavioral half, together with the other now/deadline-bound tests above, which each show the effective bound tracking the given pair"
    fails_when: "the timeout's remainingMs or its timing differs from what the given now/deadline pair states, once the real system clock is set to an unrelated instant"
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: "runs and pins exactly the case object given to each call, never a case any other source might have published"
    proves: "The investigation the composition runs is exactly the case the knowledge context published, pinned by content at the start of the request — behavioral half"
    fails_when: "either call's written pinned_case.hash differs from the hash of the Case object that call itself was given"
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: "imports no case-fetching port — case-query and case-store are absent from its own module, so nothing inside it could re-resolve the case itself"
    proves: "the structural half"
    fails_when: "run-diagnosis.ts imports a module whose specifier names case-query or case-store"
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: "consolidates in the pinned case's own declared register, ignoring the given default, when the case declares one"
    proves: "the recorded inference that defaultConsolidationRegister is used only via options.case.consolidation_register falling back to options.defaultConsolidationRegister"
    fails_when: "the given defaultConsolidationRegister is used instead of the case's own declared consolidation_register, causing FakeAssessmentConsolidator to reject an unseeded call"
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: "forwards the given cost and durations unchanged into the written investigation, computing neither itself"
    proves: "the recorded inference that cost and durations arrive as explicit, caller-given fields, forwarded unchanged"
    fails_when: "the written document's cost or durations differ from what this call was given"
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: "exports exactly RunDiagnosisOptions and runDiagnosis, keeping every internal helper — including its own evidence-by-hypothesis matching — private to this module"
    proves: "the recorded inference that evidenceByHypothesisOf is a private, unexported helper"
    fails_when: "run-diagnosis.ts exports any top-level declaration other than RunDiagnosisOptions and runDiagnosis"
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: "fails fast on an empty subject attribute set before collecting any evidence, judging any hypothesis or writing anything"
    proves: "the recorded inference that the subject is built once, early, to fail fast on an empty attribute set before spending any collection/judgment budget"
    fails_when: "an empty subject attribute set does not refuse before collection, judgment or persistence are ever reached"
not_applicable:
  - edge_case: a case declaring zero hypotheses
    why: "rules/knowledge/a-case-has-at-least-one-hypothesis makes this unconstructible upstream of this composition; run-diagnosis.ts receives an already-resolved, already-valid Case"
  - edge_case: absent or empty narrative/requester strings
    why: "no node this task implements states a refusal over these fields at this composition's own level; validating the request's shape is diagnose-payload-and-window-dedup's own objective"
  - edge_case: "evidence-collection-stage.ts's and judgment-stage.ts's own isolated deadline-boundary edge cases"
    why: "both modules are unmodified by this task and already carry their own exhaustive boundary tests; this proof exercises them only through the composition's own contribution"
untested:
  - "drafting/consolidation's own deadline compliance: draft-assessment-text.ts's DraftAssessmentOptions takes no now/deadline field at all, so a hung consolidator call would make the whole run hang past the declared deadline with neither an assessment nor an error. This is the implementation's own disclosed deferred gap; no test here proves a bound the code does not implement."
  - "whether a caller's own cost/durations values are measured accurately — this proof only shows they are forwarded unchanged, never that they are correct"
  - "concurrency serialization is proven only at poolSize=1; the pool's own behavior at larger sizes is judgment-stage.ts's own, already unit-tested elsewhere"
  - "the total-deadline compounding gap named in contested below is no longer backed by an executable test: it was written and traced by hand to fail against the current implementation, then removed from the suite at the coordinator's direction so that a deliberately red test does not block deliver.py's refusal of a proof over a run that did not pass. The finding survives only as the contested entry, not as a test a future run re-verifies."
contested:
  - what: "Criterion 3 — the whole run responds within the declared total deadline, with each stage receiving no more than the minimum of its nominal budget and what remains at that point — is marked met in the implementation record, but the delivered run-diagnosis.ts does not actually hold the first half of that sentence. Each stage's own what-remains is computed once from the single, static (now, deadline) pair given to the whole call and reused unchanged for every stage; but judgment-stage.ts's own deadline guard and this composition's own writeWithinDeadline each arm a relative setTimeout of that duration at whatever real instant that stage actually begins — not at the original now. Real time a prior stage genuinely spent is never subtracted from a later stage's own window: a later stage can still consume its own full tightened share on top of what was already spent, and the composed run can settle after the declared deadline instant has already passed. A collection call that legitimately takes 900 of a 1000ms declared total, followed by a judgment call that then hangs, does not settle until real time 1900 — nearly double the declared deadline."
    why: "The gap is closable without contradicting criterion 5 (never read the system clock) in principle, but constraints/the-deadline-is-an-absolute-propagated-instant's own Description literally requires dynamic real-time rebalancing between stages (a late one takes from those that follow) — which some layer of the call chain would need to read real elapsed time to enforce, and criterion 5 forbids doing that in this composition. The test that stated what criterion 3 requires was written, confirmed by hand to fail against the current code, then removed from the executable suite at the coordinator's direction, because npm test runs the whole project's suite as one command and deliver.py refuses any proof over a run that did not pass. Confirmed by the human's own review as real and well-reasoned, and accepted as a documented gap for this pass; left to a future /analyse or /plan-work to reconcile criterion 5's clock-read ban with the constraint's own dynamic-rebalancing language."
---

## What it is

Tests over runDiagnosis proving the composition's six criteria — write-before-return, persistence-deadline refusal, per-stage budget tightening, replay pinning, explicit now/deadline with no clock reads, and exactly-the-given-case — against fresh fakes for every port it wires.

## Notes

A genuine gap between criterion 3 and criterion 5, surfaced by careful reading against constraints/the-deadline-is-an-absolute-propagated-instant's own dynamic-rebalancing language, is recorded in `contested` rather than fixed in this pass — reviewed and accepted by the human, to be reconciled by a future /analyse or /plan-work.
