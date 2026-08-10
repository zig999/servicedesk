---
title: investigation-factory assembles and validates the subject — rewritten proof
summary: Rewrites investigation-factory.spec.ts whole to prove the new async buildInvestigation, which assembles a Subject from raw subjectType/subjectAttributes and checks it against the glossary before constructing anything, while keeping the pre-existing totality/pinning/plain-value proof intact.
implementation: sha256:85f97b3e439da0a105506a26aba243155320c9b3fe12213f1a09c691a36f512f
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/subject-identity-rework-investigation-factory-assembles-and-validates-the-subject-suite
tests:
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: "refuses to build when the subject carries no attribute-value at all, naming the violated invariant"
    proves: "Criterion 1 — an empty attribute-value set is refused, naming a-subject-carries-at-least-one-attribute."
    fails_when: "buildInvestigation stops calling subject.ts's buildSubject (or otherwise stops refusing an empty subjectAttributes array), or SubjectCarriesNoAttributeError's message/context stop naming the type and the invariant."
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: "refuses to build when the subject names an attribute the glossary does not hold, naming the violated policy"
    proves: "Criterion 2 — an attribute the glossary does not hold is refused, naming a-subject-attribute-is-drawn-from-the-glossary."
    fails_when: "refuseAttributesNotInGlossary stops checking the given attribute against the glossary port, or SubjectAttributeNotInGlossaryError's message/context stop naming the type and the offending attribute."
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: "names every attribute the glossary does not hold together, in one refusal"
    proves: "the policy refusal aggregates every distinct missing attribute into one error rather than stopping at the first"
    fails_when: "the refusal names only the first missing attribute, or throws once per missing attribute instead of once total"
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: "names an attribute missing from the glossary once, no matter how many attribute-value pairs of the subject name it"
    proves: "an attribute name repeated across several attribute-value pairs is named once in the refusal, not once per pair"
    fails_when: "the same missing attribute name appears more than once in the error's attributes list"
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: "does not refuse a subject whose every named attribute the glossary holds"
    proves: "a multi-attribute subject whose names the glossary all holds is not refused by the policy check"
    fails_when: "buildInvestigation rejects even though every named attribute is held"
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: "lets a failure from the glossary port reach the caller rather than becoming a subject-attribute-not-in-glossary refusal"
    proves: "edge case — a failing glossary dependency propagates as itself, never masked as a business refusal"
    fails_when: "the glossary port's rejection is swallowed, wrapped, or turned into SubjectAttributeNotInGlossaryError instead of reaching the caller unchanged"
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: "refuses over a subject-attribute-not-in-glossary violation before ever checking evidence or evaluation totality"
    proves: "a subject-policy violation is the refusal that reaches the caller even when the totality checks would independently fail, evidencing that subject validation runs first"
    fails_when: "a build with both a subject-policy violation and an empty evidence/evaluations set is refused with InvestigationNotBuildableError instead of SubjectAttributeNotInGlossaryError"
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: "carries a subject whose type and every attribute-value pair are valid, unchanged, into the built Investigation"
    proves: "Criterion 3 — a valid subject is carried unchanged into the built Investigation's subject field."
    fails_when: "the built investigation's subject drops, reorders or otherwise alters the given type or attribute-value pairs"
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: "evidence/evaluation totality tests (six, plus the joint-violation test) preserved from the pre-existing proof"
    proves: "pre-existing totality behavior (rules/investigation/one-evidence-per-collected-concept, rules/investigation/one-evaluation-per-required-hypothesis) is unchanged by this task, now exercised through the async signature"
    fails_when: "refuseTotalityViolations stops detecting a missing/extraneous/duplicate evidence or evaluation entry, or stops aggregating both checks' violations into one refusal"
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: "pins the case by exactly slug, version and hash, never the whole case"
    proves: "pre-existing replay-pinning behavior (rules/investigation/replay-is-pinned) is unchanged"
    fails_when: "pinned_case carries other case fields, or omits slug/version/hash"
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: "copies model, prompt_version and evidence straight from the given options, unchanged"
    proves: "pre-existing pass-through of the other replay pins is unchanged"
    fails_when: "model, prompt_version or evidence are altered, dropped, or not carried onto the built value"
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: "answers a plain data object carrying no method, so nothing on the value itself could mutate it after construction"
    proves: "pre-existing plain-value shape of Investigation is unchanged"
    fails_when: "the built value carries a prototype other than Object.prototype or exposes a function-valued property"
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: "does not throw when the subject is valid, the evidence covers the collection plan and the evaluations cover the required hypotheses exactly once each"
    proves: "edge case — a fully valid build succeeds"
    fails_when: "buildInvestigation rejects on a wholly valid input"
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: "copies the given evidence and evaluations arrays rather than holding onto them by reference"
    proves: "pre-existing defensive-copy behavior for evidence/evaluations is unchanged"
    fails_when: "the built value's evidence/evaluations array reflects a mutation of the caller's original array after the build"
not_applicable:
  - edge_case: "absent subjectAttributes/subjectType/glossary"
    why: "BuildInvestigationOptions declares these as required fields, so an absent value is a compile-time boundary the type system enforces, not an async runtime path this module decides"
  - edge_case: "an empty collection returned from buildInvestigation itself"
    why: "the only collections it returns (evidence, evaluations) are copies of what was given and already covered by the pre-existing defensive-copy tests; the subject's own attributes array is exercised directly by the criterion 1-3 tests"
  - edge_case: "an operation against state that forbids it"
    why: "buildInvestigation holds no persisted state machine to violate; every refusal here is over the shape of one given input, not over prior state"
  - edge_case: "a dependency answering slowly"
    why: "IGlossaryQuery is read in-process through the given port with no timeout or race logic in this module to observe; there is nothing distinct from correctness-under-rejection (already tested) to assert about slowness"
  - edge_case: "two operations against one subject at once"
    why: "buildInvestigation is a pure orchestration call over its own arguments with no shared mutable state between invocations, so there is no race to exercise"
  - edge_case: "whether subjectType itself is drawn from the glossary's subject-type vocabulary"
    why: "not one of this task's two bound rules (only subject-attribute membership is checked here); subject-type validity is a separate, upstream concern"
untested:
  - "whether the Subject the built Investigation carries is defensively copied from the given subjectAttributes array independently of investigation-factory.ts is not re-asserted here: that copy is buildSubject's own behavior, already the responsibility of task/subject-identity-rework/subject-value-object's own proof, and re-testing it here would duplicate rather than add coverage of this task's own three criteria"
  - "the exact number of times the glossary port is queried per distinct attribute name is not asserted: asserting a call count binds the shape of refuseAttributesNotInGlossary's loop rather than any behavior observable from buildInvestigation's outcome"
---

## What it is

Tests over buildInvestigation proving this task's own three criteria (empty-attribute refusal by reuse, glossary-policy refusal, valid subject carried unchanged), plus the pre-existing totality/pinning/plain-value proof kept intact through the async rewrite, using a FakeGlossaryQuery test double for the consumed port.

## Notes

None.
