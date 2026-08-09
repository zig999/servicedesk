---
title: Proof for case coherence validation
summary: Unit tests over caseCoherenceViolations and validateCaseCoherence against in-memory port fakes, proving every coherence rule, the current-registration read, the one-refusal collection, and both UNDERDETERMINED notes as far as this module's seam allows; extends the shared src/case import audit to sweep the new error module alongside the document-model task's.
implementation: sha256:8cffda5f2616306396afb267d7a3cb90abb7aa12b0af529705ce1265275391dd
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/case-model-case-coherence-validation-suite
tests:
  - file: src/__tests__/unit/case/validate-case-coherence.spec.ts
    name: refuses a case naming a subject type the glossary does not hold, naming the term
    proves: "A case naming a subject type, concept, outcome, action or recipient the glossary does not hold is refused, naming the term."
    fails_when: the subject-type check is dropped, stops calling readVocabularyTerm, or the violation stops naming the subject type
  - file: src/__tests__/unit/case/validate-case-coherence.spec.ts
    name: refuses a case naming an outcome the glossary does not hold, naming the term
    proves: "A case naming a subject type, concept, outcome, action or recipient the glossary does not hold is refused, naming the term."
    fails_when: the outcome check is dropped or a held outcome is treated as absent, or vice versa
  - file: src/__tests__/unit/case/validate-case-coherence.spec.ts
    name: refuses a case naming an action the glossary does not hold, naming the term
    proves: "A case naming a subject type, concept, outcome, action or recipient the glossary does not hold is refused, naming the term."
    fails_when: the action check is dropped or an absent action stops being refused
  - file: src/__tests__/unit/case/validate-case-coherence.spec.ts
    name: refuses a case naming a recipient the glossary does not hold, naming the term
    proves: "A case naming a subject type, concept, outcome, action or recipient the glossary does not hold is refused, naming the term."
    fails_when: the recipient check is dropped or an absent recipient stops being refused
  - file: src/__tests__/unit/case/validate-case-coherence.spec.ts
    name: refuses a case collecting a concept the glossary does not hold, naming the concept
    proves: "A case naming a subject type, concept, outcome, action or recipient the glossary does not hold is refused, naming the term."
    fails_when: readConcept stops being called for a collected concept, or an unheld concept stops producing a violation naming it
  - file: src/__tests__/unit/case/validate-case-coherence.spec.ts
    name: refuses a case whose collected concept does not accept the declared subject type, naming both
    proves: "A case whose collected concept does not accept the declared subject type is refused, naming the concept and the subject type that disagree. — realizes scenarios/knowledge/a-subject-mismatch-refuses-the-case (subject customer, concept equipment-state accepting only contract)"
    fails_when: the accepts comparison is dropped, inverted, or the violation stops naming either the concept or the subject type
  - file: src/__tests__/unit/case/validate-case-coherence.spec.ts
    name: refuses a case collecting a concept no capability currently answers, naming the concept
    proves: "A case collecting a concept no read-only capability currently answers is refused, naming the concept."
    fails_when: an unanswered concept stops producing a violation, or the violation stops naming the concept
  - file: src/__tests__/unit/case/validate-case-coherence.spec.ts
    name: refuses a case whose collected concept is answered only by a mutating capability, naming the concept
    proves: "A case collecting a concept no read-only capability currently answers is refused, naming the concept."
    fails_when: the nature check is dropped, so a mutating capability is accepted as answering the concept
  - file: src/__tests__/unit/case/validate-case-coherence.spec.ts
    name: refuses a case whose answering capability declares no output schema, naming the concept
    proves: the task's first UNDERDETERMINED note — a capability check accepting a read-only capability registered without an output schema is exactly the weaker implementation the note names; this test fails over that implementation
    fails_when: the output-schema clause is removed from the capability answer check, so an empty output schema stops producing a violation
  - file: src/__tests__/unit/case/validate-case-coherence.spec.ts
    name: refuses a case whose answering capability declares a non-integer timeout, naming the concept
    proves: the task's first UNDERDETERMINED note, for the timeout clause — this test fails over an implementation that accepts a read-only capability with no declared integer timeout
    fails_when: the timeout clause is removed from the capability answer check, so a non-integer timeout stops producing a violation
  - file: src/__tests__/unit/case/validate-case-coherence.spec.ts
    name: reads the capability registration as it stands at the moment of validation, not a remembered one
    proves: "The capability check reads the registration as it stands at the moment of validation, so the same case refused before a capability registers is not refused by that check after it registers."
    fails_when: readCapability is cached, memoized, or read once and reused, so the second validation still throws after the registration
  - file: src/__tests__/unit/case/validate-case-coherence.spec.ts
    name: refuses a case violating several coherence rules at once, naming every violation
    proves: "A case violating several coherence rules is refused once, with every violation named."
    fails_when: the three checks stop being concatenated before the throw, or any of the three named violations is dropped from the one thrown error's context
  - file: src/__tests__/unit/case/validate-case-coherence.spec.ts
    name: does not refuse a case that violates no coherence rule
    proves: "A case violating no coherence rule is not refused by these rules."
    fails_when: validateCaseCoherence throws over a case that holds against the glossary and the capability registry alike
  - file: src/__tests__/unit/case/validate-case-coherence.spec.ts
    name: names an absent term once no matter how many positions of the case name it
    proves: the implementation's recorded inference — each distinct term is checked once and yields at most one existence violation, however many positions name it
    fails_when: the same absent action is named by both a hypothesis's resolution and the fallback and the violation list grows to two entries instead of staying at one
  - file: src/__tests__/unit/case/validate-case-coherence.spec.ts
    name: names an unregistered concept once for the glossary and once for the capability, independently
    proves: the implementation's recorded inference — the three rules are checked independently, so one wrong name can be named by more than one violation
    fails_when: the concept-existence and capability-answer checks stop running independently, so an unregistered concept produces only one violation instead of both
  - file: src/__tests__/unit/case/validate-case-coherence.spec.ts
    name: answers violations in the case's declared order — vocabulary terms, then concepts, then capabilities, each in the order named
    proves: the implementation's recorded inference — violations answer in a stable order, each group in the case's declared order
    fails_when: the three groups are concatenated in a different order, or the within-group order stops following the case's declared collection order
  - file: src/__tests__/unit/case/validate-case-coherence.spec.ts
    name: lets a duplicate-concept-answer failure from the capability port reach the caller rather than becoming a violation of the case
    proves: the implementation's recorded inference — a registry holding that answers one concept with more than one capability propagates as the port's own DuplicateConceptAnswerError rather than becoming a coherence violation of the case
    fails_when: the capability check catches the port's rejection and turns it into an ordinary violation string instead of letting it propagate
  - file: src/__tests__/unit/case/case-document-modules.spec.ts
    name: the document model's modules import no framework, no driver and no provider client
    proves: "Criterion 7 — the checks reach the glossary and the registry through ports over the published reads, importing no framework, driver or client into the domain modules. The shared audit's single ERROR_MODULE constant was generalized to an ERROR_MODULES list so incoherent-case.error.ts is swept alongside invalid-case-document.error.ts; validate-case-coherence.ts is already swept by the existing directory read over src/case."
    fails_when: validate-case-coherence.ts or incoherent-case.error.ts imports a forbidden framework, driver or client package
  - file: src/__tests__/unit/case/case-document-modules.spec.ts
    name: the document model's modules import nothing but one another, so no second store is reachable from the aggregate
    proves: criterion 7's relative-import-only half, now reaching incoherent-case.error.ts through the same generalization
    fails_when: either new module imports anything outside the case model's own relative modules
not_applicable:
  - edge_case: an absent or malformed case object
    why: the task's own rationale scopes these coherence checks to a structurally valid case, presupposing the document-model task's parse already ran; that absence is document-model's own proof
  - edge_case: a hypothesis declaring an empty collects list, a case declaring zero hypotheses, or two hypotheses sharing a name
    why: each is forbidden by a structural rule the document-model task enforces before a Case reaches these coherence checks
  - edge_case: two validations of the same case running concurrently
    why: the module holds no state — every call reads the ports fresh — so concurrent calls cannot interact, and no criterion states a concurrency guarantee
  - edge_case: a port that answers slowly rather than failing
    why: no criterion or rule states latency-handling behavior; the only stated dependency-failure behavior is a rejection propagating, which the DuplicateConceptAnswerError test exercises
  - edge_case: boundary values of the timeout integer
    why: no node states a minimum or maximum; the note-1 tests exercise the only stated boundary — integer versus non-integer
untested:
  - the one joint refusal contracts/system/case-authoring promises whole, combining structural problems and coherence violations into a single reading (the task's second UNDERDETERMINED note) — this proof exercises only caseCoherenceViolations's collectability (a plain array, never a throw, over a violating case) and validateCaseCoherence's own single-reading refusal over coherence alone; the composition that joins both lists into one refusal is task/case-model/read-case's to prove
---
## What it is
Eighteen unit tests over the coherence validator against in-memory port fakes, plus two updated entries in the sibling document-model audit — every rule, the current-registration read, the multi-violation single refusal, the scenario, and both UNDERDETERMINED notes answered as far as this task's seam allows.

## Notes
The shared audit at src/__tests__/unit/case/case-document-modules.spec.ts was generalized from a single error module to a list, so it now sweeps incoherent-case.error.ts alongside invalid-case-document.error.ts — the document-model task's own proof is amended with a note disclosing this, since the file is that proof's record.
The second UNDERDETERMINED note is only partly excludable here: this proof shows the collector never throws, which is what lets read-case compose one joint refusal, but the joint refusal itself is read-case's to prove.
