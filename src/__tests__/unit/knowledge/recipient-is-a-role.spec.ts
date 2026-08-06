import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { PublishedGlossary } from '../../../glossary/lookup';
import { createRecipientIsARoleCheck } from '../../../knowledge/recipient-is-a-role';
import type { DraftCase } from '../../../knowledge/draft-case';
import type { Hypothesis } from '../../../knowledge/hypothesis';
import type { Resolution } from '../../../knowledge/resolution';
import type { PublicationCheck } from '../../../knowledge/validation';
import { validate } from '../../../knowledge/validation';

/**
 * Proves `task/case-validator/recipient-is-a-role` over
 * `src/knowledge/recipient-is-a-role.ts`.
 *
 * Every name below is a placeholder, chosen only to be distinguishable from
 * the next one. The recipient vocabulary is open, and nothing below asserts
 * which members of it exist — each glossary a test hands the check is
 * arranged data standing where a published glossary would stand.
 *
 * The binding left the hypothesis's other fields — collects, confirmsWhen —
 * and the resolutions' outcome, and the case's own title, whenToUse and
 * subjectType unbound: this check reads only each resolution's
 * referral.recipient, so every value built below carries just enough shape
 * to be one case, one hypothesis or one resolution, never asserted on its
 * own.
 */
const DECLARED_SLUG = 'case-slug-placeholder';
const DECLARED_TITLE = 'title placeholder as declared';
const DECLARED_WHEN_TO_USE = 'when to use it, as declared';
const DECLARED_SUBJECT_TYPE = 'subject-type-placeholder';
const DECLARED_CRITERION = 'criterion of the hypothesis, as declared';

const HYPOTHESIS_OUTCOME = 'outcome-placeholder-a';
const HYPOTHESIS_ACTION = 'action-placeholder-a';
const NO_DATA_OUTCOME = 'outcome-placeholder-b';
const NO_DATA_ACTION = 'action-placeholder-b';
const EXHAUSTED_OUTCOME = 'outcome-placeholder-c';
const EXHAUSTED_ACTION = 'action-placeholder-c';

const PUBLISHED_RECIPIENT = 'recipient-placeholder-published';
const OTHER_PUBLISHED_RECIPIENT = 'recipient-placeholder-published-other';
const UNPUBLISHED_RECIPIENT = 'recipient-placeholder-unpublished';

const FIRST_HYPOTHESIS_NAME = 'hypothesis-placeholder-a';
const SECOND_HYPOTHESIS_NAME = 'hypothesis-placeholder-b';

/**
 * The rule node's own path and its own stated requirement
 * (rule/knowledge/case-terms-exist-in-the-glossary), quoted rather than
 * reworded — the same values the implementation record cites as what the
 * refusal names, per its first recorded inference that this check's refusal
 * cites the terms-exist rule rather than recipient-is-a-role.
 */
const RULE_IDENTIFIER = 'rule/knowledge/case-terms-exist-in-the-glossary';
const REFUSAL_TEXT =
  'Every subject type, concept, outcome, action and recipient a case names MUST exist in the glossary.';

const COMPANION_RULE = 'rule-placeholder-companion';
const COMPANION_TEXT = 'text-placeholder-companion';

/**
 * A fresh glossary per call, publishing exactly the recipients handed in and
 * nothing of the other four kinds — this check never reads them.
 */
function glossary(recipients: readonly string[]): PublishedGlossary {
  return { concepts: [], subjectTypes: [], outcomes: [], actions: [], recipients };
}

function resolution(outcome: string, action: string, recipient: string): Resolution {
  return { outcome, referral: { action, recipient } };
}

function hypothesis(name: string, recipient: string): Hypothesis {
  return {
    name,
    collects: [],
    confirmsWhen: DECLARED_CRITERION,
    resolution: resolution(HYPOTHESIS_OUTCOME, HYPOTHESIS_ACTION, recipient),
  };
}

/**
 * A fresh, well-formed draft case per call: the given hypotheses plus both
 * of the case's fallback resolutions, built from whatever recipient the test
 * hands in for each.
 */
function draftCase(
  hypotheses: readonly Hypothesis[],
  noDataFallback: Resolution,
  hypothesesExhaustedFallback: Resolution,
): DraftCase {
  return {
    slug: DECLARED_SLUG,
    title: DECLARED_TITLE,
    whenToUse: DECLARED_WHEN_TO_USE,
    subjectType: DECLARED_SUBJECT_TYPE,
    hypotheses,
    noDataFallback,
    hypothesesExhaustedFallback,
  };
}

/**
 * A draft case built exactly as draft-case.ts documents as admitted on
 * purpose — missing the no-data fallback altogether — built without the
 * field rather than with a value standing in for its absence, so the check
 * under test is exercised against the same malformed shape a check must
 * walk without failing (rule/knowledge/a-validation-answers-with-every-
 * refusal).
 */
function draftCaseMissingNoDataFallback(
  hypotheses: readonly Hypothesis[],
  hypothesesExhaustedFallback: Resolution,
): DraftCase {
  return {
    slug: DECLARED_SLUG,
    title: DECLARED_TITLE,
    whenToUse: DECLARED_WHEN_TO_USE,
    subjectType: DECLARED_SUBJECT_TYPE,
    hypotheses,
    hypothesesExhaustedFallback,
  } as DraftCase;
}

/**
 * The same malformation as above, missing the hypotheses-exhausted fallback
 * instead.
 */
function draftCaseMissingHypothesesExhaustedFallback(
  hypotheses: readonly Hypothesis[],
  noDataFallback: Resolution,
): DraftCase {
  return {
    slug: DECLARED_SLUG,
    title: DECLARED_TITLE,
    whenToUse: DECLARED_WHEN_TO_USE,
    subjectType: DECLARED_SUBJECT_TYPE,
    hypotheses,
    noDataFallback,
  } as DraftCase;
}

/**
 * The most malformed shape the base's own types admit: no hypotheses and
 * neither fallback declared at all.
 */
function draftCaseMissingBothFallbacks(hypotheses: readonly Hypothesis[]): DraftCase {
  return {
    slug: DECLARED_SLUG,
    title: DECLARED_TITLE,
    whenToUse: DECLARED_WHEN_TO_USE,
    subjectType: DECLARED_SUBJECT_TYPE,
    hypotheses,
  } as DraftCase;
}

describe('createRecipientIsARoleCheck', () => {
  it("refuses a case whose hypothesis's referral names a recipient the glossary does not publish", () => {
    // arrange
    const check = createRecipientIsARoleCheck(glossary([PUBLISHED_RECIPIENT]));
    const draft = draftCase(
      [hypothesis(FIRST_HYPOTHESIS_NAME, UNPUBLISHED_RECIPIENT)],
      resolution(NO_DATA_OUTCOME, NO_DATA_ACTION, PUBLISHED_RECIPIENT),
      resolution(EXHAUSTED_OUTCOME, EXHAUSTED_ACTION, PUBLISHED_RECIPIENT),
    );

    // act
    const answered = check(draft);

    // assert
    assert.notEqual(answered.length, 0);
  });

  it("answers the refusal naming the terms-exist rule, the offending hypothesis and recipient, and the rule's own stated text", () => {
    // arrange
    const check = createRecipientIsARoleCheck(glossary([PUBLISHED_RECIPIENT]));
    const draft = draftCase(
      [hypothesis(FIRST_HYPOTHESIS_NAME, UNPUBLISHED_RECIPIENT)],
      resolution(NO_DATA_OUTCOME, NO_DATA_ACTION, PUBLISHED_RECIPIENT),
      resolution(EXHAUSTED_OUTCOME, EXHAUSTED_ACTION, PUBLISHED_RECIPIENT),
    );

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      {
        rule: RULE_IDENTIFIER,
        hypothesis: FIRST_HYPOTHESIS_NAME,
        offendedTerm: UNPUBLISHED_RECIPIENT,
        text: REFUSAL_TEXT,
      },
    ]);
  });

  it('does not refuse a case whose every referral — each hypothesis and both fallbacks — names a recipient the glossary publishes', () => {
    // arrange
    const check = createRecipientIsARoleCheck(
      glossary([PUBLISHED_RECIPIENT, OTHER_PUBLISHED_RECIPIENT]),
    );
    const draft = draftCase(
      [
        hypothesis(FIRST_HYPOTHESIS_NAME, PUBLISHED_RECIPIENT),
        hypothesis(SECOND_HYPOTHESIS_NAME, OTHER_PUBLISHED_RECIPIENT),
      ],
      resolution(NO_DATA_OUTCOME, NO_DATA_ACTION, PUBLISHED_RECIPIENT),
      resolution(EXHAUSTED_OUTCOME, EXHAUSTED_ACTION, OTHER_PUBLISHED_RECIPIENT),
    );

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('refuses a case whose no-data fallback names an unpublished recipient while every hypothesis and the hypotheses-exhausted fallback name published recipients', () => {
    // arrange
    //
    // Excludes the binding's first UNDERDETERMINED implementation: a check
    // reading only the hypotheses-exhausted fallback (or only one fallback,
    // whichever it is not) would answer no refusal here, where the base's
    // rule that every referral's recipient exists in the glossary requires
    // one. Together with the next test, no implementation reading only one
    // of the two fallbacks passes both.
    const check = createRecipientIsARoleCheck(glossary([PUBLISHED_RECIPIENT]));
    const draft = draftCase(
      [hypothesis(FIRST_HYPOTHESIS_NAME, PUBLISHED_RECIPIENT)],
      resolution(NO_DATA_OUTCOME, NO_DATA_ACTION, UNPUBLISHED_RECIPIENT),
      resolution(EXHAUSTED_OUTCOME, EXHAUSTED_ACTION, PUBLISHED_RECIPIENT),
    );

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      {
        rule: RULE_IDENTIFIER,
        hypothesis: undefined,
        offendedTerm: UNPUBLISHED_RECIPIENT,
        text: REFUSAL_TEXT,
      },
    ]);
  });

  it('refuses a case whose hypotheses-exhausted fallback names an unpublished recipient while every hypothesis and the no-data fallback name published recipients', () => {
    // arrange
    //
    // Excludes the binding's first UNDERDETERMINED implementation from the
    // other side: a check reading only the no-data fallback would answer no
    // refusal here. Paired with the previous test, both of the case's
    // fallbacks are shown read independently, which is the crux of that
    // note.
    const check = createRecipientIsARoleCheck(glossary([PUBLISHED_RECIPIENT]));
    const draft = draftCase(
      [hypothesis(FIRST_HYPOTHESIS_NAME, PUBLISHED_RECIPIENT)],
      resolution(NO_DATA_OUTCOME, NO_DATA_ACTION, PUBLISHED_RECIPIENT),
      resolution(EXHAUSTED_OUTCOME, EXHAUSTED_ACTION, UNPUBLISHED_RECIPIENT),
    );

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      {
        rule: RULE_IDENTIFIER,
        hypothesis: undefined,
        offendedTerm: UNPUBLISHED_RECIPIENT,
        text: REFUSAL_TEXT,
      },
    ]);
  });

  it('refuses only the hypothesis whose referral names an unpublished recipient, leaving the hypothesis whose referral names a published recipient unrefused', () => {
    // arrange
    const check = createRecipientIsARoleCheck(glossary([PUBLISHED_RECIPIENT]));
    const draft = draftCase(
      [
        hypothesis(FIRST_HYPOTHESIS_NAME, PUBLISHED_RECIPIENT),
        hypothesis(SECOND_HYPOTHESIS_NAME, UNPUBLISHED_RECIPIENT),
      ],
      resolution(NO_DATA_OUTCOME, NO_DATA_ACTION, PUBLISHED_RECIPIENT),
      resolution(EXHAUSTED_OUTCOME, EXHAUSTED_ACTION, PUBLISHED_RECIPIENT),
    );

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      {
        rule: RULE_IDENTIFIER,
        hypothesis: SECOND_HYPOTHESIS_NAME,
        offendedTerm: UNPUBLISHED_RECIPIENT,
        text: REFUSAL_TEXT,
      },
    ]);
  });

  it('walks a case declaring no hypotheses without throwing, answering no refusal when both fallbacks name published recipients', () => {
    // arrange
    //
    // Excludes the binding's second UNDERDETERMINED implementation over this
    // malformed aspect: a check that throws or halts on a case with no
    // hypotheses would fail this test by raising rather than by answering
    // the wrong value.
    const check = createRecipientIsARoleCheck(glossary([PUBLISHED_RECIPIENT]));
    const draft = draftCase(
      [],
      resolution(NO_DATA_OUTCOME, NO_DATA_ACTION, PUBLISHED_RECIPIENT),
      resolution(EXHAUSTED_OUTCOME, EXHAUSTED_ACTION, PUBLISHED_RECIPIENT),
    );

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('walks a case whose no-data fallback is absent without throwing, answering no refusal for it', () => {
    // arrange
    //
    // Excludes the binding's second UNDERDETERMINED implementation: a check
    // that indexes into the no-data fallback and throws over its absence
    // would fail this test by raising rather than by answering the wrong
    // value.
    const check = createRecipientIsARoleCheck(glossary([PUBLISHED_RECIPIENT]));
    const draft = draftCaseMissingNoDataFallback(
      [hypothesis(FIRST_HYPOTHESIS_NAME, PUBLISHED_RECIPIENT)],
      resolution(EXHAUSTED_OUTCOME, EXHAUSTED_ACTION, PUBLISHED_RECIPIENT),
    );

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('walks a case whose hypotheses-exhausted fallback is absent without throwing, still refusing the unpublished recipient in the no-data fallback that is present', () => {
    // arrange
    //
    // Proves the absent fallback is read as nothing to refuse for rather
    // than as a reason to stop reading the fallback that is present.
    const check = createRecipientIsARoleCheck(glossary([PUBLISHED_RECIPIENT]));
    const draft = draftCaseMissingHypothesesExhaustedFallback(
      [hypothesis(FIRST_HYPOTHESIS_NAME, PUBLISHED_RECIPIENT)],
      resolution(NO_DATA_OUTCOME, NO_DATA_ACTION, UNPUBLISHED_RECIPIENT),
    );

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      {
        rule: RULE_IDENTIFIER,
        hypothesis: undefined,
        offendedTerm: UNPUBLISHED_RECIPIENT,
        text: REFUSAL_TEXT,
      },
    ]);
  });

  it('walks a case whose no-data fallback is absent without throwing, still refusing the unpublished recipient in the hypotheses-exhausted fallback that is present', () => {
    // arrange
    //
    // The symmetric case of the previous test, over the other fallback.
    const check = createRecipientIsARoleCheck(glossary([PUBLISHED_RECIPIENT]));
    const draft = draftCaseMissingNoDataFallback(
      [hypothesis(FIRST_HYPOTHESIS_NAME, PUBLISHED_RECIPIENT)],
      resolution(EXHAUSTED_OUTCOME, EXHAUSTED_ACTION, UNPUBLISHED_RECIPIENT),
    );

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      {
        rule: RULE_IDENTIFIER,
        hypothesis: undefined,
        offendedTerm: UNPUBLISHED_RECIPIENT,
        text: REFUSAL_TEXT,
      },
    ]);
  });

  it('lets a companion check registered beside it still report its own refusal over a case declaring no hypotheses and missing both fallbacks', () => {
    // arrange
    //
    // Directly excludes the binding's second UNDERDETERMINED implementation:
    // a check that answers its own safety over this malformed case by
    // throwing or exiting would prevent validate() from ever reaching the
    // companion below, so the companion's refusal would never be answered
    // — this test fails exactly there, over that shortcut, rather than over
    // the criteria as stated.
    const check = createRecipientIsARoleCheck(glossary([]));
    const draft = draftCaseMissingBothFallbacks([]);
    const companion: PublicationCheck = () => [{ rule: COMPANION_RULE, text: COMPANION_TEXT }];

    // act
    const answered = validate(draft, [check, companion]);

    // assert
    assert.deepEqual(answered, [
      { rule: COMPANION_RULE, hypothesis: undefined, offendedTerm: undefined, text: COMPANION_TEXT },
    ]);
  });
});
