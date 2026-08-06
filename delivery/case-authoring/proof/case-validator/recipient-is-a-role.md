---
title: "Recipient-is-a-role check, proof"
summary: "Tests over createRecipientIsARoleCheck proving both stated criteria, the recipient-clause refusal shape, that both of a case's fallback resolutions are read independently, and that the check stays safe over a case missing hypotheses or either fallback."
implementation: sha256:fa34648513fa1cef91f5af4d8494d4cdd938705901c57b5d5432f5aebf271451
tests:
  - file: src/__tests__/unit/knowledge/recipient-is-a-role.spec.ts
    name: "refuses a case whose hypothesis's referral names a recipient the glossary does not publish"
    proves: "Criterion 1 — A case whose referral names a recipient the glossary does not publish as an operational role is refused by this check."
    fails_when: "the check answers no refusal for a hypothesis whose resolution's referral names a recipient absent from the given glossary"
  - file: src/__tests__/unit/knowledge/recipient-is-a-role.spec.ts
    name: "answers the refusal naming the terms-exist rule, the offending hypothesis and recipient, and the rule's own stated text"
    proves: "criterion 1's exact refusal shape, and the implementation's recorded inference that the refusal cites rule/knowledge/case-terms-exist-in-the-glossary rather than rule/glossary/recipient-is-a-role"
    fails_when: "the refusal names a different rule identifier, a different or missing hypothesis position, a different offended term, or text other than the rule's own stated sentence"
  - file: src/__tests__/unit/knowledge/recipient-is-a-role.spec.ts
    name: "does not refuse a case whose every referral — each hypothesis and both fallbacks — names a recipient the glossary publishes"
    proves: "Criterion 2 — A case whose every referral names a recipient the glossary publishes as an operational role is not refused by this check."
    fails_when: "the check produces any refusal for a case whose hypotheses and both fallback resolutions all carry published recipients"
  - file: src/__tests__/unit/knowledge/recipient-is-a-role.spec.ts
    name: "refuses a case whose no-data fallback names an unpublished recipient while every hypothesis and the hypotheses-exhausted fallback name published recipients"
    proves: "criterion 3, and directly excludes the task's first UNDERDETERMINED entry: a check reading exactly one fallback (specifically, not the no-data one) would answer no refusal here"
    fails_when: "the check answers no refusal, or answers a different refusal, when only the no-data fallback's recipient is unpublished"
  - file: src/__tests__/unit/knowledge/recipient-is-a-role.spec.ts
    name: "refuses a case whose hypotheses-exhausted fallback names an unpublished recipient while every hypothesis and the no-data fallback name published recipients"
    proves: "criterion 3's other half, and — paired with the previous test — excludes the task's first UNDERDETERMINED entry from the other side: no implementation reading only one of the two fallbacks passes both tests"
    fails_when: "the check answers no refusal, or answers a different refusal, when only the hypotheses-exhausted fallback's recipient is unpublished"
  - file: src/__tests__/unit/knowledge/recipient-is-a-role.spec.ts
    name: "refuses only the hypothesis whose referral names an unpublished recipient, leaving the hypothesis whose referral names a published recipient unrefused"
    proves: "criteria 1 and 2 together, over a case declaring more than one hypothesis — the refusal targets exactly the offending referral"
    fails_when: "the check refuses the hypothesis with the published recipient, fails to refuse the one with the unpublished recipient, or produces more than the one refusal"
  - file: src/__tests__/unit/knowledge/recipient-is-a-role.spec.ts
    name: "walks a case declaring no hypotheses without throwing, answering no refusal when both fallbacks name published recipients"
    proves: "the task's second UNDERDETERMINED entry's exclusion, over the empty-hypotheses malformation it names"
    fails_when: "the check throws, or answers anything other than no refusal, when handed a case whose hypotheses list is empty"
  - file: src/__tests__/unit/knowledge/recipient-is-a-role.spec.ts
    name: "walks a case whose no-data fallback is absent without throwing, answering no refusal for it"
    proves: "the task's second UNDERDETERMINED entry's exclusion, over the absent-fallback malformation it names, and the implementation's recorded inference that an absent fallback is read as nothing to refuse for"
    fails_when: "the check throws indexing into the absent no-data fallback, or answers a refusal for it"
  - file: src/__tests__/unit/knowledge/recipient-is-a-role.spec.ts
    name: "walks a case whose hypotheses-exhausted fallback is absent without throwing, still refusing the unpublished recipient in the no-data fallback that is present"
    proves: "the absent fallback does not stop the check from reading the fallback that is present, over the same malformation the second UNDERDETERMINED entry names"
    fails_when: "the check throws over the absent fallback, or fails to refuse the unpublished recipient still present in the no-data fallback"
  - file: src/__tests__/unit/knowledge/recipient-is-a-role.spec.ts
    name: "walks a case whose no-data fallback is absent without throwing, still refusing the unpublished recipient in the hypotheses-exhausted fallback that is present"
    proves: "the symmetric case of the previous test, over the other fallback"
    fails_when: "the check throws over the absent no-data fallback, or fails to refuse the unpublished recipient still present in the hypotheses-exhausted fallback"
  - file: src/__tests__/unit/knowledge/recipient-is-a-role.spec.ts
    name: "lets a companion check registered beside it still report its own refusal over a case declaring no hypotheses and missing both fallbacks"
    proves: "directly excludes the task's second UNDERDETERMINED entry: a check that throws or halts over this malformed case would stop validate() from ever reaching the companion, so the companion's refusal would go unanswered"
    fails_when: "the companion's refusal is missing from validate()'s answer, or the run raises before reaching the companion"
not_applicable:
  - edge_case: "a recipient differing from a published name only by letter case, trimming or other normalisation"
    why: "the exact-match comparison is isPublished's own behavior (rule/glossary/a-lookup-matches-a-published-name-exactly), proven by task/case-validator/glossary-lookup's own delivered tests; this check only calls that lookup and adds nothing of its own to the comparison, so re-testing it here would test the dependency rather than this check"
  - edge_case: "an empty-string recipient"
    why: "the check applies the identical unpublished-recipient path to any string it is handed, with no special-casing of the empty string — it is the same code path already exercised by the unpublished-recipient tests, not a distinct behavior"
  - edge_case: "two referrals of one case naming the same unpublished recipient"
    why: "no bound node states a uniqueness rule over recipients across a case's referrals, and each referral is refused independently regardless of what any other referral names"
  - edge_case: "a numeric or size boundary"
    why: "this check reads only string identity (a recipient's name against the glossary); nothing it reads has a range or a boundary"
  - edge_case: "an operation attempted against state that forbids it"
    why: "the check is a pure function of a value already handed to it; there is no state transition or forbidden state for it to guard"
  - edge_case: "a dependency that is unavailable, slow, or answers in an unexpected shape"
    why: "the glossary is a value the check closes over synchronously, not a live call that can fail or be slow"
  - edge_case: "two operations against one subject at once"
    why: "the check and the value it reads carry no shared mutable state, so concurrent calls do not interact"
untested:
  - "Whether the check's returned array is frozen (Object.isFrozen) on either the refusing or the passing path. The implementation's own recorded 'how' for criterion 2 mentions answering 'a frozen empty array', but neither criterion 2's text nor any recorded inference or UNDERDETERMINED entry requires frozen output — a non-frozen empty or refusal array would satisfy every stated criterion equally — so this record leaves that particular implementation choice unproven rather than asserting a guarantee no criterion states."
  - "Whether RECIPIENT_KIND is typed as the shared GlossaryKind rather than a bare string literal (the implementation's fourth recorded inference). This is a compile-time fact with no distinguishing runtime behavior, so no test at this level can fail over it either way."
---

## What it is

The tests proving `src/knowledge/recipient-is-a-role.ts` against `task/case-validator/recipient-is-a-role`, exercising every hypothesis's own referral alongside both of the case's fallback referrals independently.

## Notes

None.
