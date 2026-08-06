import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { hypothesisCollectsAtLeastOneConcept } from '../../../knowledge/hypothesis-collects-at-least-one-concept';
import type { DraftCase } from '../../../knowledge/draft-case';
import type { Hypothesis } from '../../../knowledge/hypothesis';
import type { PublicationCheck } from '../../../knowledge/validation';
import { validate } from '../../../knowledge/validation';

/**
 * Proves `task/case-validator/hypothesis-collects-a-concept` over
 * `src/knowledge/hypothesis-collects-at-least-one-concept.ts`.
 *
 * Every name below is a placeholder, chosen only to be distinguishable from
 * the next one. The subject-type and concept vocabularies are open, and
 * nothing below asserts which members of either exist — this check reads
 * only the length of each hypothesis's own `collects` list, never resolving
 * a named concept, so a concept name here is only ever a string this check
 * counts, never looked up.
 *
 * The binding left the hypothesis's other fields — confirmsWhen and
 * resolution — and the case's own title, whenToUse, subjectType and
 * fallbacks unbound: every value built below carries just enough shape to be
 * one case or one hypothesis, never asserted on its own.
 */
const DECLARED_SLUG = 'case-slug-placeholder';
const DECLARED_TITLE = 'title placeholder as declared';
const DECLARED_WHEN_TO_USE = 'when to use it, as declared';
const DECLARED_SUBJECT_TYPE = 'subject-type-placeholder';
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

const DECLARED_CONCEPT = 'concept-placeholder-a';
const OTHER_DECLARED_CONCEPT = 'concept-placeholder-b';

const FIRST_HYPOTHESIS_NAME = 'hypothesis-placeholder-a';
const SECOND_HYPOTHESIS_NAME = 'hypothesis-placeholder-b';
const THIRD_HYPOTHESIS_NAME = 'hypothesis-placeholder-c';

/**
 * The rule node's own path and its own stated requirement
 * (rule/knowledge/hypothesis-collects-at-least-one-concept), quoted rather
 * than reworded — the same values the implementation record cites as what
 * the refusal names.
 */
const RULE_IDENTIFIER = 'rule/knowledge/hypothesis-collects-at-least-one-concept';
const REFUSAL_TEXT = 'A hypothesis MUST collect at least one concept.';

const COMPANION_RULE = 'rule-placeholder-companion';
const COMPANION_TEXT = 'text-placeholder-companion';

function hypothesis(name: string, collects: readonly string[]): Hypothesis {
  return {
    name,
    collects,
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

describe('hypothesisCollectsAtLeastOneConcept', () => {
  it('refuses a case holding one hypothesis that collects no concept', () => {
    // arrange
    const draft = draftCase([hypothesis(FIRST_HYPOTHESIS_NAME, [])]);

    // act
    const answered = hypothesisCollectsAtLeastOneConcept(draft);

    // assert
    assert.notEqual(answered.length, 0);
  });

  it("answers a refusal naming the rule and the offending hypothesis, with no offended term and the rule's own stated text", () => {
    // arrange
    const draft = draftCase([hypothesis(FIRST_HYPOTHESIS_NAME, [])]);

    // act
    const answered = hypothesisCollectsAtLeastOneConcept(draft);

    // assert
    assert.deepEqual(answered, [
      { rule: RULE_IDENTIFIER, hypothesis: FIRST_HYPOTHESIS_NAME, text: REFUSAL_TEXT },
    ]);
  });

  it('does not refuse a case whose only hypothesis collects exactly one concept', () => {
    // arrange
    const draft = draftCase([hypothesis(FIRST_HYPOTHESIS_NAME, [DECLARED_CONCEPT])]);

    // act
    const answered = hypothesisCollectsAtLeastOneConcept(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('does not refuse a hypothesis that collects several concepts, proving the guard reads "at least one" rather than "exactly one"', () => {
    // arrange
    const draft = draftCase([
      hypothesis(FIRST_HYPOTHESIS_NAME, [DECLARED_CONCEPT, OTHER_DECLARED_CONCEPT]),
    ]);

    // act
    const answered = hypothesisCollectsAtLeastOneConcept(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('does not refuse a case whose every hypothesis collects at least one concept', () => {
    // arrange
    const draft = draftCase([
      hypothesis(FIRST_HYPOTHESIS_NAME, [DECLARED_CONCEPT]),
      hypothesis(SECOND_HYPOTHESIS_NAME, [OTHER_DECLARED_CONCEPT]),
      hypothesis(THIRD_HYPOTHESIS_NAME, [DECLARED_CONCEPT, OTHER_DECLARED_CONCEPT]),
    ]);

    // act
    const answered = hypothesisCollectsAtLeastOneConcept(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('refuses the failing hypothesis when it is not the one declared first', () => {
    // arrange
    //
    // Proves the third criterion directly: only the last-declared hypothesis
    // fails, so a check that inspected only the earliest hypothesis it
    // reaches would answer no refusal here where one is due.
    const draft = draftCase([
      hypothesis(FIRST_HYPOTHESIS_NAME, [DECLARED_CONCEPT]),
      hypothesis(SECOND_HYPOTHESIS_NAME, [OTHER_DECLARED_CONCEPT]),
      hypothesis(THIRD_HYPOTHESIS_NAME, []),
    ]);

    // act
    const answered = hypothesisCollectsAtLeastOneConcept(draft);

    // assert
    assert.deepEqual(answered, [
      { rule: RULE_IDENTIFIER, hypothesis: THIRD_HYPOTHESIS_NAME, text: REFUSAL_TEXT },
    ]);
  });

  it('produces one refusal per failing hypothesis, in declared order, when more than one hypothesis collects nothing', () => {
    // arrange
    //
    // Strengthens the third criterion: a check that stopped at the first
    // failing hypothesis would answer only the first refusal below, and one
    // that reached every hypothesis but out of declared order would answer
    // the same two refusals in the wrong sequence.
    const draft = draftCase([
      hypothesis(FIRST_HYPOTHESIS_NAME, [DECLARED_CONCEPT]),
      hypothesis(SECOND_HYPOTHESIS_NAME, []),
      hypothesis(THIRD_HYPOTHESIS_NAME, []),
    ]);

    // act
    const answered = hypothesisCollectsAtLeastOneConcept(draft);

    // assert
    assert.deepEqual(answered, [
      { rule: RULE_IDENTIFIER, hypothesis: SECOND_HYPOTHESIS_NAME, text: REFUSAL_TEXT },
      { rule: RULE_IDENTIFIER, hypothesis: THIRD_HYPOTHESIS_NAME, text: REFUSAL_TEXT },
    ]);
  });

  it('freezes the array it answers with on the refusing path', () => {
    // arrange
    const draft = draftCase([hypothesis(FIRST_HYPOTHESIS_NAME, [])]);

    // act
    const answered = hypothesisCollectsAtLeastOneConcept(draft);

    // assert
    assert.equal(Object.isFrozen(answered), true);
  });

  it('freezes the array it answers with on the passing path', () => {
    // arrange
    const draft = draftCase([hypothesis(FIRST_HYPOTHESIS_NAME, [DECLARED_CONCEPT])]);

    // act
    const answered = hypothesisCollectsAtLeastOneConcept(draft);

    // assert
    assert.equal(Object.isFrozen(answered), true);
  });

  it('walks a case declaring no hypotheses without throwing, answering no refusal', () => {
    // arrange
    //
    // Excludes the binding's UNDERDETERMINED implementation: a check that
    // throws or halts on a case with no hypotheses would fail this test by
    // raising rather than by answering the wrong value.
    const draft = draftCase([]);

    // act
    const answered = hypothesisCollectsAtLeastOneConcept(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('lets a companion check registered beside it still report its own refusal over the same case declaring no hypotheses', () => {
    // arrange
    //
    // Directly excludes the binding's UNDERDETERMINED implementation: a
    // check that answers its own safety over the no-hypothesis case by
    // throwing or exiting would prevent validate() from ever reaching the
    // companion below, so the companion's refusal would never be answered
    // — this test fails exactly there, over that shortcut, rather than over
    // the criteria as stated.
    const draft = draftCase([]);
    const companion: PublicationCheck = () => [{ rule: COMPANION_RULE, text: COMPANION_TEXT }];

    // act
    const answered = validate(draft, [hypothesisCollectsAtLeastOneConcept, companion]);

    // assert
    assert.deepEqual(answered, [
      {
        rule: COMPANION_RULE,
        hypothesis: undefined,
        offendedTerm: undefined,
        text: COMPANION_TEXT,
      },
    ]);
  });
});
