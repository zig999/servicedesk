---
title: "Proof for the subject-type acceptance check"
summary: "Tests proving that the check refuses a case collecting a concept whose accepts list excludes the case's declared subject type, does not refuse where every collected concept accepts it (including a concept accepting several types), reads the glossary through the shared lookup rather than restating it, and stays safe over the three malformed shapes the binding left open."
implementation: sha256:c6edaaa68517e6604b94af54aa5682127aafee1d5e9be2f3636f24978a102b51
tests:
  - file: src/__tests__/unit/knowledge/concept-accepts-the-declared-subject-type.spec.ts
    name: "refuses a case collecting one concept that does not accept the case's declared subject type"
    proves: "A case collecting one concept that does not accept the case's declared subject type is refused by this check."
    fails_when: "the check answers an empty array for a case whose one collected concept's accepts list excludes the declared subject type"
  - file: src/__tests__/unit/knowledge/concept-accepts-the-declared-subject-type.spec.ts
    name: "answers the refusal naming the rule, the offending hypothesis and concept, and the rule's own stated text"
    proves: "the refusal's shape as the implementation record states it — the rule identifier, the collecting hypothesis, the offending concept as offendedTerm, and the rule's own unchanged text"
    fails_when: "the refusal names a different rule identifier, omits or misnames the hypothesis or the offending concept, or carries different text"
  - file: src/__tests__/unit/knowledge/concept-accepts-the-declared-subject-type.spec.ts
    name: "does not refuse a case whose every collected concept accepts the case's declared subject type"
    proves: "A case whose every collected concept accepts the case's declared subject type is not refused by this check."
    fails_when: "the check answers any refusal for a case where every collected concept's accepts list includes the declared subject type"
  - file: src/__tests__/unit/knowledge/concept-accepts-the-declared-subject-type.spec.ts
    name: "does not refuse a case collecting a concept that accepts several subject types including the declared one"
    proves: "A case collecting a concept that accepts several subject types including the declared one is not refused by this check."
    fails_when: "the check refuses a concept whose accepts list holds several subject types merely because the declared one is not the first or only entry"
  - file: src/__tests__/unit/knowledge/concept-accepts-the-declared-subject-type.spec.ts
    name: "refuses only the hypothesis whose collected concept does not accept the subject type, leaving the hypothesis whose concept accepts it unrefused"
    proves: "the check evaluates each hypothesis independently rather than refusing or clearing the whole case from one hypothesis's outcome"
    fails_when: "the check also refuses the accepting hypothesis, or fails to refuse the offending one, once a second hypothesis is present"
  - file: src/__tests__/unit/knowledge/concept-accepts-the-declared-subject-type.spec.ts
    name: "refuses only the concept within one hypothesis that does not accept the subject type, not the concept that does"
    proves: "the check compares each concept a hypothesis collects on its own, rather than refusing or clearing the whole hypothesis from one concept's outcome"
    fails_when: "the check also refuses the accepting concept, or fails to refuse the offending one, once one hypothesis collects both"
  - file: src/__tests__/unit/knowledge/concept-accepts-the-declared-subject-type.spec.ts
    name: "produces one refusal per offending concept, in the order collected, when a hypothesis collects two concepts that both do not accept the subject type"
    proves: "the check never collapses two offending concepts of one hypothesis into a single refusal"
    fails_when: "the check answers one refusal instead of two, or answers them out of the order the hypothesis collected the concepts in"
  - file: src/__tests__/unit/knowledge/concept-accepts-the-declared-subject-type.spec.ts
    name: "produces no refusal for a concept a hypothesis collects that the given glossary does not publish"
    proves: "the implementation's own recorded inference — a concept name the given glossary does not publish produces no refusal from this check, since it has no accepts list to consult and the refusal for an absent term belongs to the terms-exist-in-the-glossary check"
    fails_when: "the check throws, or produces a refusal, for a concept name absent from the given glossary's published concepts"
  - file: src/__tests__/unit/knowledge/concept-accepts-the-declared-subject-type.spec.ts
    name: "freezes the array it answers with on the refusing path"
    proves: "the implementation's own recorded inference that the returned refusals array is frozen, on the path that produced at least one refusal"
    fails_when: "the answered array is mutable on the refusing path"
  - file: src/__tests__/unit/knowledge/concept-accepts-the-declared-subject-type.spec.ts
    name: "freezes the array it answers with on the passing path"
    proves: "the implementation's own recorded inference that the returned refusals array is frozen, on the empty-answer path"
    fails_when: "the answered empty array is mutable"
  - file: src/__tests__/unit/knowledge/concept-accepts-the-declared-subject-type.spec.ts
    name: "walks a case declaring no hypotheses without throwing, answering no refusal"
    proves: "the UNDERDETERMINED entry's excluded implementation is not what was built — over an empty hypotheses list the check answers rather than throwing or halting"
    fails_when: "the check throws, halts, or answers anything but an empty array for a case declaring no hypotheses"
  - file: src/__tests__/unit/knowledge/concept-accepts-the-declared-subject-type.spec.ts
    name: "walks a hypothesis whose collects list is empty without throwing, answering no refusal for it"
    proves: "the UNDERDETERMINED entry's excluded implementation is not what was built — over a hypothesis whose collects list is empty the check answers rather than throwing or halting"
    fails_when: "the check throws, halts, or answers anything but an empty array for a case whose one hypothesis collects nothing"
  - file: src/__tests__/unit/knowledge/concept-accepts-the-declared-subject-type.spec.ts
    name: "walks a case whose declared subject type is empty without throwing, still comparing it against each collected concept"
    proves: "the UNDERDETERMINED entry's excluded implementation is not what was built — an empty subject type is walked as an ordinary value in the comparison rather than causing a throw or halt"
    fails_when: "the check throws, halts, or fails to compare the empty subject type against the collected concept's accepts list"
  - file: src/__tests__/unit/knowledge/concept-accepts-the-declared-subject-type.spec.ts
    name: "lets a companion check registered beside it still report its own refusal over the same case declaring no hypotheses"
    proves: "directly excludes the UNDERDETERMINED entry's named implementation: a check that answers its own safety over the no-hypothesis case by throwing or exiting would prevent validate() from ever reaching the companion, so the companion's refusal would never be answered"
    fails_when: "validate() answers without the companion's refusal, or raises, when this check runs first over a case with no hypotheses"
not_applicable:
  - edge_case: "two hypotheses of a case sharing the same name"
    why: "this check never compares hypothesis names to each other and names a hypothesis only by copying its own name field into the refusal; uniqueness of hypothesis identity is rule/knowledge/unique-hypothesis-names's own sibling check and task, not bound here"
  - edge_case: "two operations validating one case at once"
    why: "the check is a pure function of the glossary it closed over and the case it is handed, with no shared mutable state between calls, so concurrent invocation raises nothing this check's own behavior could disagree about"
  - edge_case: "a slow or failing glossary dependency"
    why: "the glossary is a plain in-memory structure the check is handed, read synchronously through publishedConcept; there is no I/O, network call or failure mode to simulate"
  - edge_case: "a boundary at each end of a numeric range"
    why: "this check has no ordered or numeric parameter — accepts is a membership set, not a range — so no boundary beyond the one-subject-type and several-subject-types cases already covered applies"
  - edge_case: "a concept published with an empty accepts list"
    why: "concept.accepts.includes(subjectType) is false whether the list is empty or simply excludes the subject type, so this is the same code path as the \"does not accept\" tests already written and a dedicated test would add no assertion beyond them"
---

## What it is

The tests proving `src/knowledge/concept-accepts-the-declared-subject-type.ts` against `task/case-validator/concept-accepts-the-subject-type`, read alongside the shared glossary lookup, the validation contract, and the project's existing test conventions.

## Notes

None.
