---
title: "Hypothesis names are unique within a case, proof"
summary: "Fourteen tests over hypothesisNameIsUniqueInItsCase proving the three stated criteria, the rule's exact-comparison requirement, and its safety over a case a validation run may still have to walk when malformed."
implementation: sha256:7f47097b5b3a72b7de5966b90702ce96cf4400ac923d7be51c8c58a2f93e0f72
tests:
  - file: src/__tests__/unit/knowledge/hypothesis-name-is-unique-in-its-case.spec.ts
    name: "refuses a case declaring two hypotheses that carry the same name"
    proves: "Hypotheses declared for one case, two of which carry the same name, are refused by this check."
    fails_when: "the check answers an empty array for a case whose two hypotheses share a name"
  - file: src/__tests__/unit/knowledge/hypothesis-name-is-unique-in-its-case.spec.ts
    name: "answers one refusal naming the rule, the repeating hypothesis and the rule's own stated text, leaving the hypothesis that first declared the name unrefused"
    proves: "the exact refusal criterion 1 requires, and the implementation record's inference that a refusal is produced for the second and later hypothesis carrying a repeated name and none for the first"
    fails_when: "the answered array's rule identifier, hypothesis name or text differs from the values the rule node states, or the first-declared hypothesis is also refused, or more or fewer than one refusal is answered for a single duplicate pair"
  - file: src/__tests__/unit/knowledge/hypothesis-name-is-unique-in-its-case.spec.ts
    name: "does not refuse a case declaring no hypotheses at all"
    proves: "the lower boundary of criterion 2 (an empty hypotheses list vacuously has no two hypotheses sharing a name)"
    fails_when: "the check answers a non-empty array for a case with no hypotheses"
  - file: src/__tests__/unit/knowledge/hypothesis-name-is-unique-in-its-case.spec.ts
    name: "does not refuse a case declaring exactly one hypothesis"
    proves: "the lower non-trivial boundary of criterion 2 (a single hypothesis has no second occurrence to collide with)"
    fails_when: "the check answers a non-empty array for a case with exactly one hypothesis"
  - file: src/__tests__/unit/knowledge/hypothesis-name-is-unique-in-its-case.spec.ts
    name: "does not refuse a case whose hypotheses all carry distinct names"
    proves: "Hypotheses declared for one case, all carrying distinct names, are not refused by this check."
    fails_when: "the check answers a non-empty array for a case whose three hypotheses all carry distinct names"
  - file: src/__tests__/unit/knowledge/hypothesis-name-is-unique-in-its-case.spec.ts
    name: "does not refuse two hypothesis names that differ only in letter case"
    proves: "UNDERDETERMINED, from the binding — the criteria never state the comparison the check uses while the bound rule states it exactly, character for character, its example saying onu-offline and ONU-Offline are two names it does not refuse"
    fails_when: "the check compares names case-insensitively or after any normalisation and refuses the rule's own worked example pair, onu-offline and ONU-Offline"
  - file: src/__tests__/unit/knowledge/hypothesis-name-is-unique-in-its-case.spec.ts
    name: "refuses every hypothesis whose name repeats an earlier one, in declared order, without stopping at the first colliding pair"
    proves: "criterion 1 strengthened against a check that stops early or only inspects adjacent positions — two separate duplicate pairs, interleaved rather than adjacent"
    fails_when: "the check answers fewer than the two expected refusals, answers them out of declared order, or refuses a hypothesis other than the second occurrence of each repeated name"
  - file: src/__tests__/unit/knowledge/hypothesis-name-is-unique-in-its-case.spec.ts
    name: "does not refuse a hypothesis name in a case validated after a separate case already declared and validated that same name"
    proves: "Hypotheses declared separately for two cases, one in each carrying the same name, are each not refused by this check."
    fails_when: "the check carries a name it has seen across separate invocations rather than scoping what it has seen to the one case it was handed, so the second case's hypothesis is wrongly refused because the first case's hypothesis already declared that name"
  - file: src/__tests__/unit/knowledge/hypothesis-name-is-unique-in-its-case.spec.ts
    name: "walks a case whose hypotheses list is absent without throwing, answering no refusal"
    proves: "UNDERDETERMINED, from the binding — the every-refusal rule requires every check to be safe over a malformed case, and no criterion exercises a case whose hypotheses list is absent"
    fails_when: "the check assumes a well-formed hypotheses array and throws when the field is absent outright, or answers a non-empty array over it"
  - file: src/__tests__/unit/knowledge/hypothesis-name-is-unique-in-its-case.spec.ts
    name: "walks a case holding a hypothesis whose name is absent without throwing, answering no refusal"
    proves: "the same UNDERDETERMINED entry's second named malformation, a hypothesis lacking a name"
    fails_when: "the check throws when a hypothesis's name field is absent (for example, by calling a string method on it before comparing), or answers a non-empty array over it"
  - file: src/__tests__/unit/knowledge/hypothesis-name-is-unique-in-its-case.spec.ts
    name: "lets a companion check registered beside it still report its own refusal over a case whose hypotheses list is absent"
    proves: "the same UNDERDETERMINED entry, excluded through the every-refusal rule's own observable consequence rather than an internal try/catch: a check unsafe over the malformed case would stop validate() from ever reaching a check registered after it"
    fails_when: "the check throws or otherwise halts validate() over the case whose hypotheses list is absent, so the companion check's refusal is never answered"
  - file: src/__tests__/unit/knowledge/hypothesis-name-is-unique-in-its-case.spec.ts
    name: "freezes the array it answers with on the refusing path"
    proves: "the implementation record's stated file effect that the check answers a frozen array holding a refusal"
    fails_when: "Object.isFrozen returns false for the array answered when the check refuses"
  - file: src/__tests__/unit/knowledge/hypothesis-name-is-unique-in-its-case.spec.ts
    name: "freezes the array it answers with on the passing path"
    proves: "the implementation record's stated file effect that the check answers a frozen empty array when nothing is refused"
    fails_when: "Object.isFrozen returns false for the array answered when the check refuses nothing"
not_applicable:
  - edge_case: "two concurrent validations of one case at once"
    why: "the check is a synchronous, pure function of one DraftCase value with no shared mutable state between calls (proven by the cross-case test above, which is the same property concurrency would stress); no bound node states a concurrency guarantee to test"
  - edge_case: "a dependency that is unavailable, slow, or answers in an unexpected shape"
    why: "this check reads only the in-memory DraftCase it is handed and calls no external dependency"
  - edge_case: "an operation attempted against state that forbids it"
    why: "this check is a read-only structural validation, not a state transition; nothing here writes or forbids a state"
  - edge_case: "a boundary at each end of a numeric range"
    why: "no criterion or bound node states a numeric range this check enforces (it counts nothing, it only compares names)"
untested:
  - "whether the excluded UNDERDETERMINED comparison (case-insensitive or normalised) is also excluded for a normalisation variant beyond letter case — trimming, Unicode normalisation, or similar — since the rule's own worked example gives only a case-difference pair to test against, and inventing a second example would state a domain fact no bound node holds"
  - "what a case with two hypotheses that both lack a name answers — whether an absent name compared against another absent name is treated as a collision (both are `undefined`, and this implementation's plain equality would flag the second as a repeat) is not settled by any bound node or criterion, only by this check's own internal representation, so no test asserts a value there"
---

## What it is

The tests proving `src/knowledge/hypothesis-name-is-unique-in-its-case.ts` against `task/case-validator/unique-hypothesis-names`, including its exact-comparison requirement and its safety over the malformed shapes the binding named.

## Notes

None.
