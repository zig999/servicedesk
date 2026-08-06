---
title: "Proof for terms-exist-in-the-glossary"
summary: "Twenty tests over src/knowledge/case-terms-exist-in-the-glossary.ts proving each of the five term kinds (subject type, concept, outcome, action, recipient) is checked independently against the given glossary, that both fallback resolutions are read for outcome/action/recipient, that the check stays safe over an empty hypotheses list, an absent fallback and an absent subject type, and that refusals are answered in the documented order."
implementation: sha256:1db575fea338bb9f4df59438370d0c404b72fddc49973bb54336dc1d33f0e149
tests:
  - file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts
    name: "refuses a case collecting a concept the glossary does not publish, while every other named term is left unrefused"
    proves: "A case collecting a concept the glossary does not publish is refused by this check."
    fails_when: "the concept a hypothesis collects is not compared against the glossary's published concepts, or the refusal it produces omits the rule, the hypothesis name, the offending concept or the rule's own text"
  - file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts
    name: "refuses a case whose hypothesis's resolution names an outcome the glossary does not publish, while every other named term is left unrefused"
    proves: "A case whose resolution names an outcome the glossary does not publish is refused by this check."
    fails_when: "a hypothesis's resolution outcome is not compared against the glossary's published outcomes, or the resulting refusal's shape is wrong"
  - file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts
    name: "refuses a case whose hypothesis's referral names an action the glossary does not publish, while every other named term is left unrefused"
    proves: "A case whose referral names an action the glossary does not publish is refused by this check."
    fails_when: "a hypothesis's referral action is not compared against the glossary's published actions, or the resulting refusal's shape is wrong"
  - file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts
    name: "refuses a case whose hypothesis's referral names a recipient the glossary does not publish, while every other named term is left unrefused"
    proves: "A case whose referral names a recipient the glossary does not publish is refused by this check."
    fails_when: "a hypothesis's referral recipient is not compared against the glossary's published recipients, or the resulting refusal's shape is wrong"
  - file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts
    name: "refuses a case declaring a subject type the glossary does not publish, while every other named term is left unrefused"
    proves: "A case declaring a subject type the glossary does not publish is refused by this check."
    fails_when: "the case's own subjectType is not compared against the glossary's published subject types, or the resulting refusal names a hypothesis, the wrong offended term, or the wrong text"
  - file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts
    name: "does not refuse a case whose every named term — subject type, collected concept, and every resolution's outcome, action and recipient — the glossary publishes under the kind it is used as"
    proves: "A case whose every named term the glossary publishes under the kind the case uses it as is not refused by this check."
    fails_when: "any single one of the five kinds is refused even though every named term of that kind is published, over a case naming two hypotheses and both fallbacks"
  - file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts
    name: "refuses a case whose no-data fallback names an outcome the glossary does not publish, while every hypothesis and the hypotheses-exhausted fallback are left unrefused"
    proves: "criterion 2 (resolution outcome) read over the no-data fallback specifically, confirming both fallbacks are read rather than only one"
    fails_when: "the no-data fallback's own outcome is not checked, e.g. an implementation reading only the hypotheses-exhausted fallback or only a hypothesis's own resolution"
  - file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts
    name: "refuses a case whose hypotheses-exhausted fallback names an outcome the glossary does not publish, while every hypothesis and the no-data fallback are left unrefused"
    proves: "criterion 2 read over the hypotheses-exhausted fallback specifically, the symmetric case"
    fails_when: "the hypotheses-exhausted fallback's own outcome is not checked, e.g. an implementation reading only the no-data fallback"
  - file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts
    name: "refuses a case whose no-data fallback names an action the glossary does not publish, while every hypothesis and the hypotheses-exhausted fallback are left unrefused"
    proves: "criterion 3 (referral action) read over the no-data fallback specifically"
    fails_when: "the no-data fallback's own action is not checked"
  - file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts
    name: "refuses a case whose hypotheses-exhausted fallback names an action the glossary does not publish, while every hypothesis and the no-data fallback are left unrefused"
    proves: "criterion 3 read over the hypotheses-exhausted fallback specifically"
    fails_when: "the hypotheses-exhausted fallback's own action is not checked"
  - file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts
    name: "refuses a case whose no-data fallback names a recipient the glossary does not publish, while every hypothesis and the hypotheses-exhausted fallback are left unrefused"
    proves: "criterion 4 (referral recipient) read over the no-data fallback specifically"
    fails_when: "the no-data fallback's own recipient is not checked"
  - file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts
    name: "refuses a case whose hypotheses-exhausted fallback names a recipient the glossary does not publish, while every hypothesis and the no-data fallback are left unrefused"
    proves: "criterion 4 read over the hypotheses-exhausted fallback specifically"
    fails_when: "the hypotheses-exhausted fallback's own recipient is not checked"
  - file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts
    name: "produces one refusal per unpublished concept, in the order collected, when a hypothesis collects two concepts the glossary does not publish"
    proves: "the concept loop (criterion 1) checks every collected name independently rather than stopping at the first unpublished one"
    fails_when: "the loop stops after the first unpublished concept, merges the two refusals, or answers them out of collection order"
  - file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts
    name: "walks a case declaring no hypotheses without throwing, answering no refusal when the subject type and both fallbacks name published terms"
    proves: "the check stays safe over an empty hypotheses list, per rule/knowledge/a-validation-answers-with-every-refusal"
    fails_when: "the check throws over an empty hypotheses list, or answers a refusal nothing in the case justifies"
  - file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts
    name: "walks a case whose no-data fallback is absent without throwing, still refusing the unpublished outcome in the hypotheses-exhausted fallback that is present"
    proves: "an absent fallback produces no refusal for the absence itself and does not stop the fallback that is present from being read"
    fails_when: "the check throws when the no-data fallback is absent, or fails to refuse the unpublished outcome in the fallback that is present"
  - file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts
    name: "walks a case whose hypotheses-exhausted fallback is absent without throwing, still refusing the unpublished outcome in the no-data fallback that is present"
    proves: "the symmetric case of the previous test, over the other fallback"
    fails_when: "the check throws when the hypotheses-exhausted fallback is absent, or fails to refuse the unpublished outcome in the no-data fallback that is present"
  - file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts
    name: "walks a case whose declared subject type is absent without throwing, answering no refusal for it"
    proves: "the implementation's own recorded inference that an absent draftCase.subjectType is read as nothing to refuse for, rather than compared against the glossary as an unpublished term"
    fails_when: "the check throws over an absent subject type, or compares `undefined` against the glossary and answers a refusal for it (e.g. one carrying `offendedTerm: undefined`)"
  - file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts
    name: "walks a hypothesis whose collects list is empty without throwing, answering no refusal for its concept clause"
    proves: "the check stays safe over a hypothesis with an empty collects list"
    fails_when: "the check throws over an empty collects list, or answers a refusal nothing in the case justifies"
  - file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts
    name: "lets a companion check registered beside it still report its own refusal over a case declaring no hypotheses and missing both fallbacks"
    proves: "this check's safety over the most malformed shape the base's own types admit does not prevent a validation run from reaching a check registered after it"
    fails_when: "this check throws, exits, or otherwise stops validate() from invoking the companion check over that malformed case"
  - file: src/__tests__/unit/knowledge/case-terms-exist-in-the-glossary.spec.ts
    name: "answers every refusal in the order the case declares its parts: the subject type, then each hypothesis in turn (its collects then its resolution), then the no-data fallback, then the hypotheses-exhausted fallback"
    proves: "the implementation's own recorded inference on refusal ordering (subject type, then per hypothesis in declared order — its collects then its resolution's outcome/action/recipient — then the no-data fallback, then the hypotheses-exhausted fallback)"
    fails_when: "any two of the six independently-unpublished terms built for this test are answered in a different relative order than declared"
not_applicable:
  - edge_case: "two validations of one case run concurrently against the same glossary"
    why: "createCaseTermsExistInTheGlossaryCheck's returned function is a pure, synchronous read of its two immutable arguments (the closed-over glossary and the case under edit) with no shared mutable state across calls, so concurrent invocation raises no question this task's criteria bear on"
  - edge_case: "the glossary is slow to answer, unavailable, or answers in an unexpected shape"
    why: "PublishedGlossary is a plain in-memory value handed to the check, not a live dependency this check calls out to; the criteria that would govern an unavailable or malformed glossary belong to whatever produces PublishedGlossary, outside this task's binding"
  - edge_case: "a hypothesis collects the same concept name twice"
    why: "no bound node claims uniqueness over a hypothesis's collects list, and the concept loop reads each entry independently regardless of duplication — the 'two unpublished concepts' test already shows two distinct entries checked and refused independently, and a duplicate entry would only repeat that same behavior identically"
  - edge_case: "a term differing from a published name only by letter case, or by leading/trailing whitespace"
    why: "the exact-match comparison is rule/glossary/a-lookup-matches-a-published-name-exactly's own behavior, implemented once in src/glossary/lookup.ts and already proved at src/__tests__/unit/glossary/lookup.spec.ts; this check calls that shared function (MNT-03) rather than restating the comparison, so re-testing case-folding here would test the lookup module a second time under this file's name rather than anything this check itself decided"
untested:
  - "whether a real validation run registering both this check and the already-delivered src/knowledge/recipient-is-a-role.ts together produces two independent refusals for one unpublished recipient (rather than one merged or deduplicated refusal) is a composition question the implementation's own 'deferred' section assigns to task/case-validator/validation-run, which assembles the checks list; this proof exercises only this check in isolation and does not stand up that composition"
  - "the two statement clauses of rule/knowledge/a-validation-answers-with-every-refusal that govern composition — that a validation runs every check whatever an earlier one decided, and answers with every refusal produced across the whole checks list — are validation-run's own to prove per the task's own first REMAINDER note; the companion-check test here only shows this one check does not block that composition, not that the composition itself holds"
  - "whether a registered recipient truly names a role rather than a person (rule/glossary/recipient-is-a-role's own clause, a candidate this task's own note says is not bound) is untouched by any test here, consistent with the task's binding"
---

## What it is

The tests proving `src/knowledge/case-terms-exist-in-the-glossary.ts` against `task/case-validator/terms-exist-in-the-glossary`, exercising every one of the five term kinds independently, both fallbacks, and the declared refusal order.

## Notes

None.
