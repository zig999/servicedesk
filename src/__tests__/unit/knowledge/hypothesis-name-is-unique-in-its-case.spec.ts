import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { hypothesisNameIsUniqueInItsCase } from '../../../knowledge/hypothesis-name-is-unique-in-its-case';
import type { DraftCase } from '../../../knowledge/draft-case';
import type { Hypothesis } from '../../../knowledge/hypothesis';
import type { PublicationCheck } from '../../../knowledge/validation';
import { validate } from '../../../knowledge/validation';

/**
 * Proves `task/case-validator/unique-hypothesis-names` over
 * `src/knowledge/hypothesis-name-is-unique-in-its-case.ts`.
 *
 * Every name below is a placeholder, chosen only to be distinguishable from
 * the next one. The subject-type and concept vocabularies are open, and
 * nothing below asserts which members of either exist — this check reads
 * only each hypothesis's own `name`, never resolving a concept or an outcome,
 * so those fields carry just enough shape to be one hypothesis.
 *
 * The binding left the hypothesis's other fields — collects, confirmsWhen and
 * resolution — and the case's own title, whenToUse, subjectType and
 * fallbacks unbound: every value built below carries just enough shape to be
 * one case or one hypothesis, never asserted on its own.
 */
const DECLARED_SLUG = 'case-slug-placeholder';
const DECLARED_TITLE = 'title placeholder as declared';
const DECLARED_WHEN_TO_USE = 'when to use it, as declared';
const DECLARED_SUBJECT_TYPE = 'subject-type-placeholder';
const DECLARED_CONCEPT = 'concept-placeholder';
const DECLARED_CRITERION = 'criterion of the hypothesis, as declared';
const HYPOTHESIS_OUTCOME = 'outcome-placeholder-a';
const HYPOTHESIS_ACTION = 'action-placeholder-a';
const HYPOTHESIS_RECIPIENT = 'recipient-placeholder-a';
const NO_DATA_OUTCOME = 'outcome-placeholder-b';
const NO_DATA_ACTION = 'action-placeholder-b';
const NO_DATA_RECIPIENT = 'recipient-placeholder-b';
const EXHAUSTED_OUTCOME = 'outcome-placeholder-c';
const EXHAUSTED_ACTION = 'action-placeholder-c';
const EXHAUSTED_RECIPIENT = 'recipient-placeholder-c';

const FIRST_HYPOTHESIS_NAME = 'hypothesis-placeholder-a';
const SECOND_HYPOTHESIS_NAME = 'hypothesis-placeholder-b';
const THIRD_HYPOTHESIS_NAME = 'hypothesis-placeholder-c';
const SHARED_HYPOTHESIS_NAME = 'hypothesis-placeholder-shared';

/**
 * The rule's own worked example pair (rule/knowledge/hypothesis-name-is-
 * unique-in-its-case): two names that differ only in letter case, which the
 * rule's own statement says are two distinct names because the comparison is
 * exact, character for character.
 */
const LOWER_CASE_NAME = 'onu-offline';
const MIXED_CASE_NAME = 'ONU-Offline';

/**
 * The rule node's own path and its own stated requirement, quoted rather
 * than reworded — the same values the implementation record cites as what
 * the refusal names.
 */
const RULE_IDENTIFIER = 'rule/knowledge/hypothesis-name-is-unique-in-its-case';
const REFUSAL_TEXT = 'Two hypotheses of the same case MUST NOT carry names equal character for character.';

const COMPANION_RULE = 'rule-placeholder-companion';
const COMPANION_TEXT = 'text-placeholder-companion';

function hypothesis(name: string): Hypothesis {
  return {
    name,
    collects: [DECLARED_CONCEPT],
    confirmsWhen: DECLARED_CRITERION,
    resolution: {
      outcome: HYPOTHESIS_OUTCOME,
      referral: { action: HYPOTHESIS_ACTION, recipient: HYPOTHESIS_RECIPIENT },
    },
  };
}

/**
 * A fresh draft case per call, built from whatever hypotheses the test hands
 * in, so no test's case shares state with another's.
 */
function draftCase(hypotheses: readonly Hypothesis[]): DraftCase {
  return {
    slug: DECLARED_SLUG,
    title: DECLARED_TITLE,
    whenToUse: DECLARED_WHEN_TO_USE,
    subjectType: DECLARED_SUBJECT_TYPE,
    hypotheses,
    noDataFallback: {
      outcome: NO_DATA_OUTCOME,
      referral: { action: NO_DATA_ACTION, recipient: NO_DATA_RECIPIENT },
    },
    hypothesesExhaustedFallback: {
      outcome: EXHAUSTED_OUTCOME,
      referral: { action: EXHAUSTED_ACTION, recipient: EXHAUSTED_RECIPIENT },
    },
  };
}

describe('hypothesisNameIsUniqueInItsCase', () => {
  it('refuses a case declaring two hypotheses that carry the same name', () => {
    // arrange
    const draft = draftCase([hypothesis(SHARED_HYPOTHESIS_NAME), hypothesis(SHARED_HYPOTHESIS_NAME)]);

    // act
    const answered = hypothesisNameIsUniqueInItsCase(draft);

    // assert
    assert.notEqual(answered.length, 0);
  });

  it("answers one refusal naming the rule, the repeating hypothesis and the rule's own stated text, leaving the hypothesis that first declared the name unrefused", () => {
    // arrange
    const draft = draftCase([hypothesis(SHARED_HYPOTHESIS_NAME), hypothesis(SHARED_HYPOTHESIS_NAME)]);

    // act
    const answered = hypothesisNameIsUniqueInItsCase(draft);

    // assert
    assert.deepEqual(answered, [
      { rule: RULE_IDENTIFIER, hypothesis: SHARED_HYPOTHESIS_NAME, text: REFUSAL_TEXT },
    ]);
  });

  it('does not refuse a case declaring no hypotheses at all', () => {
    // arrange
    const draft = draftCase([]);

    // act
    const answered = hypothesisNameIsUniqueInItsCase(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('does not refuse a case declaring exactly one hypothesis', () => {
    // arrange
    const draft = draftCase([hypothesis(FIRST_HYPOTHESIS_NAME)]);

    // act
    const answered = hypothesisNameIsUniqueInItsCase(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('does not refuse a case whose hypotheses all carry distinct names', () => {
    // arrange
    const draft = draftCase([
      hypothesis(FIRST_HYPOTHESIS_NAME),
      hypothesis(SECOND_HYPOTHESIS_NAME),
      hypothesis(THIRD_HYPOTHESIS_NAME),
    ]);

    // act
    const answered = hypothesisNameIsUniqueInItsCase(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('does not refuse two hypothesis names that differ only in letter case', () => {
    // arrange
    //
    // Excludes the binding's first UNDERDETERMINED implementation: a check
    // comparing names case-insensitively or after any normalisation would
    // refuse this exact pair, which the rule's own worked example names as
    // two distinct names because its comparison is exact, character for
    // character.
    const draft = draftCase([hypothesis(LOWER_CASE_NAME), hypothesis(MIXED_CASE_NAME)]);

    // act
    const answered = hypothesisNameIsUniqueInItsCase(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('refuses every hypothesis whose name repeats an earlier one, in declared order, without stopping at the first colliding pair', () => {
    // arrange
    //
    // Two separate duplicate pairs, interleaved rather than adjacent: a
    // check that stopped walking after the first collision would answer only
    // the first of the two refusals below, and one that inspected only
    // adjacent pairs would miss both.
    const draft = draftCase([
      hypothesis(FIRST_HYPOTHESIS_NAME),
      hypothesis(SECOND_HYPOTHESIS_NAME),
      hypothesis(FIRST_HYPOTHESIS_NAME),
      hypothesis(SECOND_HYPOTHESIS_NAME),
    ]);

    // act
    const answered = hypothesisNameIsUniqueInItsCase(draft);

    // assert
    assert.deepEqual(answered, [
      { rule: RULE_IDENTIFIER, hypothesis: FIRST_HYPOTHESIS_NAME, text: REFUSAL_TEXT },
      { rule: RULE_IDENTIFIER, hypothesis: SECOND_HYPOTHESIS_NAME, text: REFUSAL_TEXT },
    ]);
  });

  it('does not refuse a hypothesis name in a case validated after a separate case already declared and validated that same name', () => {
    // arrange
    //
    // Proves the third criterion directly, and is what makes the uniqueness
    // scope falsifiable: a check that carried a name it had seen across
    // separate invocations — rather than scoping what it has seen to the one
    // case it was handed — would refuse the second call below, since the
    // name was already "seen" while validating the first case.
    const firstCase = draftCase([hypothesis(SHARED_HYPOTHESIS_NAME)]);
    const secondCase = draftCase([hypothesis(SHARED_HYPOTHESIS_NAME)]);

    // act
    hypothesisNameIsUniqueInItsCase(firstCase);
    const answeredForSecondCase = hypothesisNameIsUniqueInItsCase(secondCase);

    // assert
    assert.deepEqual(answeredForSecondCase, []);
  });

  it('walks a case whose hypotheses list is absent without throwing, answering no refusal', () => {
    // arrange
    //
    // Excludes the binding's second UNDERDETERMINED implementation: a check
    // that assumes a well-formed hypotheses list and throws on one that is
    // not would fail this test by raising rather than by answering the
    // wrong value. Every criterion as written supplies a declared
    // hypotheses list, so only this test exercises the field being absent
    // outright.
    const draftWithoutHypotheses = {
      slug: DECLARED_SLUG,
      title: DECLARED_TITLE,
      whenToUse: DECLARED_WHEN_TO_USE,
      subjectType: DECLARED_SUBJECT_TYPE,
      noDataFallback: {
        outcome: NO_DATA_OUTCOME,
        referral: { action: NO_DATA_ACTION, recipient: NO_DATA_RECIPIENT },
      },
      hypothesesExhaustedFallback: {
        outcome: EXHAUSTED_OUTCOME,
        referral: { action: EXHAUSTED_ACTION, recipient: EXHAUSTED_RECIPIENT },
      },
    } as unknown as DraftCase;

    // act
    const answered = hypothesisNameIsUniqueInItsCase(draftWithoutHypotheses);

    // assert
    assert.deepEqual(answered, []);
  });

  it('walks a case holding a hypothesis whose name is absent without throwing, answering no refusal', () => {
    // arrange
    //
    // The same binding note additionally names a hypothesis lacking a name
    // as part of the malformed shape a check must be safe over.
    const namelessHypothesis = {
      collects: [DECLARED_CONCEPT],
      confirmsWhen: DECLARED_CRITERION,
      resolution: {
        outcome: HYPOTHESIS_OUTCOME,
        referral: { action: HYPOTHESIS_ACTION, recipient: HYPOTHESIS_RECIPIENT },
      },
    } as unknown as Hypothesis;
    const draft = draftCase([namelessHypothesis]);

    // act
    const answered = hypothesisNameIsUniqueInItsCase(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('lets a companion check registered beside it still report its own refusal over a case whose hypotheses list is absent', () => {
    // arrange
    //
    // Directly excludes the binding's second UNDERDETERMINED implementation
    // through observable behavior rather than an internal try/catch: a
    // check that answers its safety over the malformed case by throwing or
    // exiting would prevent validate() from ever reaching the companion
    // below, so the companion's refusal would never be answered — this test
    // fails exactly there, over that shortcut, rather than over the
    // criteria as stated.
    const draftWithoutHypotheses = {
      slug: DECLARED_SLUG,
      title: DECLARED_TITLE,
      whenToUse: DECLARED_WHEN_TO_USE,
      subjectType: DECLARED_SUBJECT_TYPE,
      noDataFallback: {
        outcome: NO_DATA_OUTCOME,
        referral: { action: NO_DATA_ACTION, recipient: NO_DATA_RECIPIENT },
      },
      hypothesesExhaustedFallback: {
        outcome: EXHAUSTED_OUTCOME,
        referral: { action: EXHAUSTED_ACTION, recipient: EXHAUSTED_RECIPIENT },
      },
    } as unknown as DraftCase;
    const companion: PublicationCheck = () => [{ rule: COMPANION_RULE, text: COMPANION_TEXT }];

    // act
    const answered = validate(draftWithoutHypotheses, [hypothesisNameIsUniqueInItsCase, companion]);

    // assert
    assert.deepEqual(answered, [
      { rule: COMPANION_RULE, hypothesis: undefined, offendedTerm: undefined, text: COMPANION_TEXT },
    ]);
  });

  it('freezes the array it answers with on the refusing path', () => {
    // arrange
    const draft = draftCase([hypothesis(SHARED_HYPOTHESIS_NAME), hypothesis(SHARED_HYPOTHESIS_NAME)]);

    // act
    const answered = hypothesisNameIsUniqueInItsCase(draft);

    // assert
    assert.equal(Object.isFrozen(answered), true);
  });

  it('freezes the array it answers with on the passing path', () => {
    // arrange
    const draft = draftCase([hypothesis(FIRST_HYPOTHESIS_NAME)]);

    // act
    const answered = hypothesisNameIsUniqueInItsCase(draft);

    // assert
    assert.equal(Object.isFrozen(answered), true);
  });
});
