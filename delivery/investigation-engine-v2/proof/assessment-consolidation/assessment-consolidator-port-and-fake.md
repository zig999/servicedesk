---
title: assessment-consolidator port and fake, proven
summary: Tests for IAssessmentConsolidator and FakeAssessmentConsolidator proving the port's own input/output shape, the closed consolidation-register vocabulary, exactly-one-implementer, and no-infrastructure import purity; the UNDERDETERMINED default-register finding is documented, disclosed and left as a genuinely open gap rather than fixed or retrofitted as a test in this pass.
implementation: sha256:f267fc7482d8c9d75b391d5aa55255f61407cd0ca4f98122de7e0428ca8d1fdb
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/assessment-consolidation-assessment-consolidator-port-and-fake-suite
tests:
  - file: src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
    name: answers the text seeded for the evaluations, evidence and consolidation register a call carries
    proves: "The port's consolidate operation takes every required hypothesis's evaluation (verdict, reason when present, citations), the evidence those citations name, and the pinned case's consolidation register, and returns text alone."
    fails_when: "consolidate() stops accepting the full evaluations/evidence/register triple, or the fake answers anything but the exact text a test seeded for that call"
  - file: src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
    name: answers text alone, never an object carrying an outcome, a referral or a determining hypothesis
    proves: "The consolidator never returns or decides an outcome, a referral or a determining hypothesis."
    fails_when: "consolidate() starts answering anything other than a plain string"
  - file: src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
    name: accepts empty evaluations and evidence arrays without refusing the call
    proves: "the port's own signature places no non-empty constraint on evaluations or evidence"
    fails_when: "the port or fake starts refusing an empty evaluations or evidence array instead of answering the text seeded for it"
  - file: src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
    name: throws naming the unseeded call rather than answering a default text
    proves: "an unseeded consolidate() call is a test-setup fault the fake surfaces rather than papering over with an invented answer"
    fails_when: "the fake answers some default text (or undefined) for a call nothing seeded, instead of throwing"
  - file: src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
    name: matches a call by its content, not by the object reference the fixture was seeded with
    proves: "the inference the implementation recorded — the fake's fixture lookup key is the JSON-serialized whole evaluations/evidence/consolidationRegister triple"
    fails_when: "a fresh but deep-equal evaluations/evidence array stops matching the fixture seeded for its content"
  - file: src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
    name: distinguishes a call by its consolidation register alone, answering each register its own seeded text
    proves: "the consolidationRegister argument participates in the fixture key"
    fails_when: "seeding formal and plain separately stops producing two distinct answers"
  - file: src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
    name: distinguishes a call by its evaluations, throwing for a set nothing was seeded for
    proves: "the evaluations argument participates in the fixture key"
    fails_when: "a call with a different evaluations array than what was seeded stops throwing"
  - file: src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
    name: distinguishes a call by its evidence, throwing for an evidence set nothing was seeded for
    proves: "the evidence argument participates in the fixture key"
    fails_when: "a call with a different evidence array than what was seeded stops throwing"
  - file: src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
    name: a later seed for the same call replaces the earlier one
    proves: "re-seeding an identical evaluations/evidence/register call overwrites rather than accumulates"
    fails_when: "the fake answers the first-seeded text instead of the replacing one"
  - file: src/__tests__/unit/investigation/assessment-consolidator-modules.spec.ts
    name: the assessment-consolidator modules import no LLM or provider client, and no framework or driver beside them
    proves: "The investigation domain module housing the consolidator imports no LLM client."
    fails_when: "any of consolidation-register.ts, assessment-consolidator.port.ts or fake-assessment-consolidator.adapter.ts starts importing an LLM/provider client, a framework, a database driver or a queue/cache client"
  - file: src/__tests__/unit/investigation/assessment-consolidator-modules.spec.ts
    name: the assessment-consolidator modules import nothing from the standard library, so infrastructure cannot be reached from them directly
    proves: "constraints/the-domain-depends-on-no-infrastructure, over this task's own three files"
    fails_when: "any of the three files starts importing a Node built-in module"
  - file: src/__tests__/unit/investigation/assessment-consolidator-modules.spec.ts
    name: "the assessment-consolidator modules import nothing from the case document module, so no field there could carry a hypothesis's own criterion or the case's when_to_use into consolidation"
    proves: "rules/investigation/the-writing-input-is-narrowed's first clause, that this port never receives a Case"
    fails_when: "the port or its fake starts importing src/case/case.ts"
  - file: src/__tests__/unit/investigation/assessment-consolidator-modules.spec.ts
    name: ships exactly one concrete class implementing IAssessmentConsolidator
    proves: "Exactly one concrete class implements the port, matching the existing hypothesis-evaluator-modules.spec.ts fitness pattern."
    fails_when: "a second class anywhere under src/investigation declares implements IAssessmentConsolidator, or FakeAssessmentConsolidator's own declaration is removed"
  - file: src/__tests__/unit/investigation/consolidation-register.spec.ts
    name: declares exactly the two registers formal and plain, nothing else
    proves: "the inference the implementation recorded — ConsolidationRegister is a new standalone vocabulary module declaring the closed two-value set domain/knowledge/consolidation-register names"
    fails_when: "CONSOLIDATION_REGISTERS stops holding exactly formal and plain — a value is added, removed, renamed or reordered"
not_applicable:
  - edge_case: a duplicate evaluation for the same hypothesis within one evaluations array
    why: "uniqueness per hypothesis is rules/investigation/one-evaluation-per-required-hypothesis's own concern, enforced by task/hypothesis-judgment/judgment-stage when it assembles the array before this port ever sees it"
  - edge_case: a boundary at each end of a numeric range
    why: "nothing in consolidate()'s signature is a numeric range. consolidationRegister is a closed two-value enumeration, and both of its values are already exercised by the register-distinguishing test"
  - edge_case: a dependency that is unavailable, slow, or answers in an unexpected shape
    why: "this task ships only the fixture-driven fake, which has no live dependency of its own to fail or stall"
  - edge_case: two operations against one subject at once
    why: "consolidate() carries no subject identity and no mutable state of its own beyond an already-populated fixture map read by a synchronous Map.get() inside one async function"
  - edge_case: an operation attempted against state that forbids it
    why: "the fake holds no lifecycle or state machine a call could violate. The only refusal this port and its fake ever produce is no fixture seeded for this call, already covered by three separate tests"
untested:
  - "the real, LLM-backed adapter behind IAssessmentConsolidator is entirely untested here — it is this epic's own declared remainder, not this task's objective"
  - "which register value (formal, plain, or a third choice) is the correct default when a case's consolidation_register is absent stays unproven — see contested below for the fuller finding"
  - "the three-positional-parameter and thirty-line limits and every other tool-decided rule of the project's standard are proven here only incidentally, by the test files compiling against the shipped signatures"
  - "wiring assessment-consolidator into draft-assessment-text and threading a case's own consolidation_register value into a real call is task/assessment-consolidation/draft-assessment-text-consumes-consolidator's own objective — that task has since been delivered and does thread the case's own declared register through when present (options.case.consolidation_register), but it does not resolve the absent-register case either, since its own consolidator dependency still requires a concrete register on every call; the gap named in contested below is not closed by that delivery"
contested:
  - what: "FakeAssessmentConsolidator (and the port signature behind it) does not honor domain/knowledge/case's statement that, when a case's own consolidation_register is absent, 'the consolidation step keeps whatever register its own adapter defaults to.' consolidationRegister is shipped as a required, always-populated parameter with no internal default logic. A test proving exactly this — 'supplies a default register when none is given, rather than requiring one seeded for the absent value' — was written by this proof's own author, confirmed to fail against the shipped adapter (consolidationRegister is required and the fixture key drops it entirely when absent, so the call simply fails to match), and then withdrawn from the executable suite by the human's own direction: npm test runs the whole project's suite as one command, and every task delivered after this one would have had its own proof refused by bin/deliver.py had this one test stayed red in the tree."
    why: "This is the task's own UNDERDETERMINED note, not a new objection, and per test-author's own governing instructions this is a test it owed rather than a note it could leave in untested — an implementation satisfying every stated criterion of this task while leaving a specification-level obligation unmet. The finding survives only as this contested entry and in the human's own tracking, not as a test a future run re-verifies. task/assessment-consolidation/draft-assessment-text-consumes-consolidator, delivered afterward, threads a case's own declared register through but does not resolve the absent-register default either (see its own untested entry above), so this gap remains genuinely open across the whole delivered initiative — a candidate for a future /analyse (deciding what the real default should be) or /plan-work (assigning a task to implement it), not something this record resolves."
---

## What it is

Tests over IAssessmentConsolidator/FakeAssessmentConsolidator proving the port's own input/output shape, the closed consolidation-register vocabulary, exactly-one-implementer, and import purity — the four stated criteria in full. The task's own UNDERDETERMINED note (default consolidation_register when a case leaves it undeclared) is documented as a genuinely open gap rather than closed, disclosed via `contested`.

## Notes

CORRECTION, added during the initiative's own closing review: this proof was originally not composed at all for this task — its build/suite could not go green while the UNDERDETERMINED test above stayed in the tree, and the human decided at the time to leave the task "implemented, no proof" rather than force the test through. This record closes that gap procedurally (every criterion this task states is now proven), while leaving the substantive UNDERDETERMINED finding open and disclosed exactly as it was found, per `contested` above — it is not resolved by this correction, only properly recorded.
