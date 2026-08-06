---
title: "Proof for the concept-declares-a-ttl check"
summary: "Tests proving that the check refuses a case collecting a concept whose glossary record declares no ttl, does not refuse where every collected concept declares one, decides on presence alone rather than the ttl's value or a comparison between concepts, and stays safe over the malformed shapes the binding left open."
implementation: sha256:1f7e958495c33f20c6630fb4f56d68fe0260c5c3792328b855cf8af835cd897e
tests:
  - file: src/__tests__/unit/knowledge/every-collected-concept-declares-a-ttl.spec.ts
    name: "refuses a case collecting one concept that declares no ttl"
    proves: "A case collecting one concept that declares no ttl is refused by this check."
    fails_when: "the check answers an empty array for a case whose one collected concept's glossary record carries no ttl field"
  - file: src/__tests__/unit/knowledge/every-collected-concept-declares-a-ttl.spec.ts
    name: "answers the refusal naming the rule, the offending hypothesis and concept, and the rule's own stated text"
    proves: "the refusal's shape as the implementation record states it — the rule identifier, the collecting hypothesis, the offending concept as offendedTerm, and the rule's own unchanged text"
    fails_when: "the refusal names a different rule identifier, omits or misnames the hypothesis or the offending concept, or carries different text"
  - file: src/__tests__/unit/knowledge/every-collected-concept-declares-a-ttl.spec.ts
    name: "does not refuse a case whose every collected concept declares a ttl"
    proves: "A case whose every collected concept declares a ttl is not refused by this check."
    fails_when: "the check answers any refusal for a case where every collected concept's glossary record carries a ttl field"
  - file: src/__tests__/unit/knowledge/every-collected-concept-declares-a-ttl.spec.ts
    name: "does not refuse a case collecting a concept whose declared ttl is zero, deciding on presence rather than the value"
    proves: "the third criterion's presence-only reading — the check decides on the presence of the declared ttl, not on the value it holds"
    fails_when: "the check tests the ttl's truthiness instead of its presence, so a concept declaring a ttl of zero is wrongly refused"
  - file: src/__tests__/unit/knowledge/every-collected-concept-declares-a-ttl.spec.ts
    name: "does not refuse a case whose collected concepts declare different ttl values, proving the check never compares one concept's ttl against another's"
    proves: "the third criterion's second half — the check compares no ttl against another"
    fails_when: "the check refuses a concept because its declared ttl differs from another concept's, or from some implied threshold, where the criteria give it no reason to"
  - file: src/__tests__/unit/knowledge/every-collected-concept-declares-a-ttl.spec.ts
    name: "refuses only the hypothesis whose collected concept declares no ttl, leaving the hypothesis whose concept declares one unrefused"
    proves: "the check evaluates each hypothesis independently rather than refusing or clearing the whole case from one hypothesis's outcome"
    fails_when: "the check also refuses the declaring hypothesis, or fails to refuse the offending one, once a second hypothesis is present"
  - file: src/__tests__/unit/knowledge/every-collected-concept-declares-a-ttl.spec.ts
    name: "refuses only the concept within one hypothesis that declares no ttl, not the concept that does"
    proves: "the check inspects each concept a hypothesis collects on its own, rather than refusing or clearing the whole hypothesis from one concept's outcome"
    fails_when: "the check also refuses the declaring concept, or fails to refuse the offending one, once one hypothesis collects both"
  - file: src/__tests__/unit/knowledge/every-collected-concept-declares-a-ttl.spec.ts
    name: "produces one refusal per offending concept, in the order collected, when a hypothesis collects two concepts that both declare no ttl"
    proves: "the check never collapses two offending concepts of one hypothesis into a single refusal"
    fails_when: "the check answers one refusal instead of two, or answers them out of the order the hypothesis collected the concepts in"
  - file: src/__tests__/unit/knowledge/every-collected-concept-declares-a-ttl.spec.ts
    name: "produces no refusal for a concept a hypothesis collects that the given glossary does not publish"
    proves: "the implementation's own recorded inference — a concept name the given glossary does not publish produces no refusal from this check, since it has no ttl declaration to find one way or the other and the refusal for an absent term belongs to the terms-exist-in-the-glossary check"
    fails_when: "the check throws, or produces a refusal, for a concept name absent from the given glossary's published concepts"
  - file: src/__tests__/unit/knowledge/every-collected-concept-declares-a-ttl.spec.ts
    name: "freezes the array it answers with on the refusing path"
    proves: "the implementation's own recorded inference that the returned refusals array is frozen, on the path that produced at least one refusal"
    fails_when: "the answered array is mutable on the refusing path"
  - file: src/__tests__/unit/knowledge/every-collected-concept-declares-a-ttl.spec.ts
    name: "freezes the array it answers with on the passing path"
    proves: "the implementation's own recorded inference that the returned refusals array is frozen, on the empty-answer path"
    fails_when: "the answered empty array is mutable"
  - file: src/__tests__/unit/knowledge/every-collected-concept-declares-a-ttl.spec.ts
    name: "walks a case declaring no hypotheses without throwing, answering no refusal"
    proves: "the UNDERDETERMINED entry's excluded implementation is not what was built — over an empty hypotheses list the check answers rather than throwing or halting"
    fails_when: "the check throws, halts, or answers anything but an empty array for a case declaring no hypotheses"
  - file: src/__tests__/unit/knowledge/every-collected-concept-declares-a-ttl.spec.ts
    name: "walks a hypothesis whose collects list is empty without throwing, answering no refusal for it"
    proves: "the UNDERDETERMINED entry's excluded implementation, read over the one degenerate shape the base's own types admit (a hypothesis whose collects array is present but holds zero entries) — the check answers rather than throwing or halting"
    fails_when: "the check throws, halts, or answers anything but an empty array for a case whose one hypothesis collects nothing"
  - file: src/__tests__/unit/knowledge/every-collected-concept-declares-a-ttl.spec.ts
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
  - edge_case: "an operation attempted against state that forbids it"
    why: "this check is a pure read of a case and a glossary, both handed in whole; there is no state machine and no forbidden state to attempt an operation against"
  - edge_case: "a numeric boundary of the ttl's declared value beyond presence versus absence (negative, fractional, or very large ttl values)"
    why: "criterion 3 states the check never reads what the ttl holds; the zero-ttl test already proves presence is read rather than truthiness, and the differing-values test already proves no value of one concept's ttl is weighed against another's, so a further boundary on the value itself would exercise no code path these two do not already reach"
  - edge_case: "a hypothesis collecting the same non-declaring concept name twice"
    why: "no bound node claims uniqueness over a hypothesis's collects entries or dedup of refusals, and the ordering test already shows each entry inspected independently; repeating one name would repeat that same inspection without exercising a different path"
untested:
  - "A hypothesis whose collects field is structurally absent — undefined rather than a present, empty array — is not tested. Hypothesis (src/knowledge/hypothesis.ts) declares collects as a required array with no optional variant, and no bound node admits a hypothesis lacking that field altogether the way draft-case.ts explicitly admits a case with zero hypotheses; the task's own note names this malformation as 'a hypothesis whose collects list is absent', and I read that as the one degenerate shape the base's types do admit — a present collects array holding zero entries, the same wording the sibling task (concept-accepts-the-subject-type) uses and the implementation's own inference reads it as. Under that reading the malformed-safety tests above hold. Under the literal reading — collects itself missing from the object — the shipped check's inner for-of would throw a TypeError rather than answer, and I did not write a test asserting that behavior because constructing that fixture requires overriding the Hypothesis type outright for a shape no node states can occur; whether the check must also tolerate that stronger malformation is left open rather than guessed at."
  - "Whether the refusal's offendedTerm is specifically concept.name, the record the glossary lookup handed back, rather than the raw string named in the hypothesis's own collects entry, is not distinguishable by any test against the shipped code: publishedConcept only ever yields a record whose name compares equal to the exact term looked up, so the two readings produce an identical value in every case a test can construct, and a test asserting one is indistinguishable from a test asserting the other."
---

## What it is

The tests proving `src/knowledge/every-collected-concept-declares-a-ttl.ts` against `task/case-validator/concept-declares-a-ttl`, read alongside the shared glossary lookup, the validation contract, and the project's existing test conventions.

## Notes

None.
