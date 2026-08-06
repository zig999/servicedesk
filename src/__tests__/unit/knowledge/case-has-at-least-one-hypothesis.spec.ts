import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { caseHasAtLeastOneHypothesis } from '../../../knowledge/case-has-at-least-one-hypothesis';
import type { DraftCase } from '../../../knowledge/draft-case';
import type { Hypothesis } from '../../../knowledge/hypothesis';
import type { PublicationCheck } from '../../../knowledge/validation';
import { validate } from '../../../knowledge/validation';

/**
 * Proves `task/case-validator/at-least-one-hypothesis` over
 * `src/knowledge/case-has-at-least-one-hypothesis.ts`.
 *
 * Every name below is a placeholder, chosen only to be distinguishable from
 * the next one. The subject-type, concept, outcome, action and recipient
 * vocabularies are open and the hypothesis names are the case's own; nothing
 * below asserts which members of any vocabulary exist.
 *
 * The binding left the hypothesis definition unbound deliberately: this
 * check counts entries of the hypotheses list and inspects none of them, so
 * every hypothesis built below carries only enough shape to be one entry of
 * that list — its own structure is the neighbouring per-hypothesis checks'
 * concern, not this suite's.
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

/**
 * The rule node's own path and its own stated requirement
 * (rule/knowledge/case-has-at-least-one-hypothesis), quoted rather than
 * reworded — the same values the implementation record cites as what the
 * refusal names.
 */
const RULE_IDENTIFIER = 'rule/knowledge/case-has-at-least-one-hypothesis';
const REFUSAL_TEXT = 'A case MUST declare at least one hypothesis.';

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

describe('caseHasAtLeastOneHypothesis', () => {
  it('refuses a case declaring no hypothesis', () => {
    // arrange
    const draft = draftCase([]);

    // act
    const answered = caseHasAtLeastOneHypothesis(draft);

    // assert
    assert.notEqual(answered.length, 0);
  });

  it('answers a refusal naming the rule that refused and its own stated text, with no position named', () => {
    // arrange
    const draft = draftCase([]);

    // act
    const answered = caseHasAtLeastOneHypothesis(draft);

    // assert
    assert.deepEqual(answered, [{ rule: RULE_IDENTIFIER, text: REFUSAL_TEXT }]);
  });

  it('does not refuse a case declaring exactly one hypothesis', () => {
    // arrange
    const draft = draftCase([hypothesis(FIRST_HYPOTHESIS_NAME)]);

    // act
    const answered = caseHasAtLeastOneHypothesis(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('does not refuse a case declaring several hypotheses', () => {
    // arrange
    const draft = draftCase([
      hypothesis(FIRST_HYPOTHESIS_NAME),
      hypothesis(SECOND_HYPOTHESIS_NAME),
      hypothesis(THIRD_HYPOTHESIS_NAME),
    ]);

    // act
    const answered = caseHasAtLeastOneHypothesis(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('freezes the array it answers with on the refusing path', () => {
    // arrange
    const draft = draftCase([]);

    // act
    const answered = caseHasAtLeastOneHypothesis(draft);

    // assert
    assert.equal(Object.isFrozen(answered), true);
  });

  it('freezes the array it answers with on the passing path', () => {
    // arrange
    const draft = draftCase([hypothesis(FIRST_HYPOTHESIS_NAME)]);

    // act
    const answered = caseHasAtLeastOneHypothesis(draft);

    // assert
    assert.equal(Object.isFrozen(answered), true);
  });

  it('lets a companion check registered beside it still report its own refusal over the same no-hypothesis case', () => {
    // arrange
    //
    // Excludes the binding's UNDERDETERMINED implementation: a check that
    // answers its refusal by throwing or exiting on the no-hypothesis case
    // would prevent validate() from ever reaching the companion below, so
    // the companion's refusal would never be answered — this test fails
    // exactly there, over that shortcut, rather than over the criteria as
    // stated.
    const draft = draftCase([]);
    const companion: PublicationCheck = () => [{ rule: COMPANION_RULE, text: COMPANION_TEXT }];

    // act
    const answered = validate(draft, [caseHasAtLeastOneHypothesis, companion]);

    // assert
    assert.deepEqual(answered, [
      { rule: RULE_IDENTIFIER, hypothesis: undefined, offendedTerm: undefined, text: REFUSAL_TEXT },
      { rule: COMPANION_RULE, hypothesis: undefined, offendedTerm: undefined, text: COMPANION_TEXT },
    ]);
  });
});
