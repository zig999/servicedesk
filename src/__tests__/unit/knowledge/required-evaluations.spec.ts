import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Case } from '../../../knowledge/case';
import { createCase } from '../../../knowledge/case';
import type { Hypothesis } from '../../../knowledge/hypothesis';
import { requiredEvaluations } from '../../../knowledge/required-evaluations';

/**
 * Proves `task/published-case/required-evaluations` over
 * `src/knowledge/required-evaluations.ts`.
 *
 * Every name below is a placeholder, chosen only to be distinguishable from
 * the next one. The subject-type and concept vocabularies are open, the
 * hypothesis names are the case's own, and this suite binds every one of
 * those names by identity and never enumerates or checks a vocabulary, so no
 * member of any vocabulary is written here and nothing below asserts which
 * names exist.
 *
 * The three declared hypothesis names disagree with lexicographic order on
 * purpose — first is 'b', second is 'a', third is 'c' — so an answer sorted
 * on the way through fails the order tests below rather than passing by
 * coincidence (rule/knowledge/hypotheses-are-ordered-by-precedence).
 */
const DECLARED_SLUG = 'case-slug-placeholder';
const DECLARED_TITLE = 'title placeholder as declared';
const DECLARED_WHEN_TO_USE = 'when to use it, as declared';
const DECLARED_SUBJECT_TYPE = 'subject-type-placeholder';
const DECLARED_VERSION = 'version-placeholder';
const DECLARED_CONTENT_HASH = 'content-hash-placeholder';
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

const FIRST_DECLARED_HYPOTHESIS = 'hypothesis-placeholder-b';
const SECOND_DECLARED_HYPOTHESIS = 'hypothesis-placeholder-a';
const THIRD_DECLARED_HYPOTHESIS = 'hypothesis-placeholder-c';

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
 * A fresh set of case parts per call, built from whatever hypotheses the
 * test hands in, so no test's published case shares state with another's.
 */
function caseParts(hypotheses: readonly Hypothesis[]): Case {
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
    version: DECLARED_VERSION,
    contentHash: DECLARED_CONTENT_HASH,
  };
}

describe('requiredEvaluations', () => {
  it('answers with a name for every hypothesis the case declares', () => {
    // arrange
    const publishedCase = createCase(
      caseParts([
        hypothesis(FIRST_DECLARED_HYPOTHESIS),
        hypothesis(SECOND_DECLARED_HYPOTHESIS),
        hypothesis(THIRD_DECLARED_HYPOTHESIS),
      ]),
    );

    // act
    const answered = requiredEvaluations(publishedCase);

    // assert
    assert.ok(answered.includes(FIRST_DECLARED_HYPOTHESIS));
    assert.ok(answered.includes(SECOND_DECLARED_HYPOTHESIS));
    assert.ok(answered.includes(THIRD_DECLARED_HYPOTHESIS));
  });

  it("answers with no name absent from the case's declared hypotheses", () => {
    // arrange
    const publishedCase = createCase(
      caseParts([hypothesis(FIRST_DECLARED_HYPOTHESIS), hypothesis(SECOND_DECLARED_HYPOTHESIS)]),
    );

    // act
    const answered = requiredEvaluations(publishedCase);

    // assert
    for (const name of answered) {
      assert.ok(
        name === FIRST_DECLARED_HYPOTHESIS || name === SECOND_DECLARED_HYPOTHESIS,
        `unexpected name in the answer: ${name}`,
      );
    }
  });

  it('answers with exactly one entry for a case declaring one hypothesis', () => {
    // arrange
    const publishedCase = createCase(caseParts([hypothesis(FIRST_DECLARED_HYPOTHESIS)]));

    // act
    const answered = requiredEvaluations(publishedCase);

    // assert
    assert.equal(answered.length, 1);
  });

  it('carries the hypothesis name that identifies it within its case, on each entry', () => {
    // arrange
    const publishedCase = createCase(caseParts([hypothesis(FIRST_DECLARED_HYPOTHESIS)]));

    // act
    const answered = requiredEvaluations(publishedCase);

    // assert
    assert.equal(answered[0], FIRST_DECLARED_HYPOTHESIS);
  });

  it('stands the entries in the order the case declares its hypotheses', () => {
    // arrange
    //
    // The declared order disagrees with the lexicographic order of the names
    // on purpose, so an answer sorted on the way through fails here.
    const publishedCase = createCase(
      caseParts([
        hypothesis(FIRST_DECLARED_HYPOTHESIS),
        hypothesis(SECOND_DECLARED_HYPOTHESIS),
        hypothesis(THIRD_DECLARED_HYPOTHESIS),
      ]),
    );

    // act
    const answered = requiredEvaluations(publishedCase);

    // assert
    assert.deepEqual(answered, [
      FIRST_DECLARED_HYPOTHESIS,
      SECOND_DECLARED_HYPOTHESIS,
      THIRD_DECLARED_HYPOTHESIS,
    ]);
  });

  it('reorders its entries the same way across two published cases whose declared orders differ', () => {
    // arrange
    //
    // Two distinct Case values, never one case reordered in place: the base
    // identifies a case by slug, version and content hash, so mutating a
    // published case's declared order and re-answering would be answering
    // for a different published case, not demonstrating this criterion over
    // one (the task's own UNDERDETERMINED note).
    const forwardOrderCase = createCase(
      caseParts([hypothesis(FIRST_DECLARED_HYPOTHESIS), hypothesis(SECOND_DECLARED_HYPOTHESIS)]),
    );
    const reversedOrderCase = createCase(
      caseParts([hypothesis(SECOND_DECLARED_HYPOTHESIS), hypothesis(FIRST_DECLARED_HYPOTHESIS)]),
    );

    // act
    const forwardAnswer = requiredEvaluations(forwardOrderCase);
    const reversedAnswer = requiredEvaluations(reversedOrderCase);

    // assert
    assert.deepEqual(forwardAnswer, [FIRST_DECLARED_HYPOTHESIS, SECOND_DECLARED_HYPOTHESIS]);
    assert.deepEqual(reversedAnswer, [SECOND_DECLARED_HYPOTHESIS, FIRST_DECLARED_HYPOTHESIS]);
  });

  it('answers with no entries for a case declaring no hypotheses', () => {
    // arrange
    //
    // createCase does not refuse a case declaring no hypotheses (checked in
    // case.spec.ts); the empty case is representable input here too.
    const publishedCase = createCase(caseParts([]));

    // act
    const answered = requiredEvaluations(publishedCase);

    // assert
    assert.deepEqual(answered, []);
  });

  it('does not deduplicate two hypotheses that share a declared name', () => {
    // arrange
    //
    // createCase does not refuse two hypotheses sharing a name (checked in
    // case.spec.ts); the answer is the total list over the case's declared
    // hypotheses, so a shared name still names two evaluations owed, never
    // collapsed to one.
    const publishedCase = createCase(
      caseParts([hypothesis(FIRST_DECLARED_HYPOTHESIS), hypothesis(FIRST_DECLARED_HYPOTHESIS)]),
    );

    // act
    const answered = requiredEvaluations(publishedCase);

    // assert
    assert.deepEqual(answered, [FIRST_DECLARED_HYPOTHESIS, FIRST_DECLARED_HYPOTHESIS]);
  });

  it('freezes the array it answers with', () => {
    // arrange
    //
    // Pins the implementation's recorded inference that the returned array
    // is frozen before it is handed back.
    const publishedCase = createCase(caseParts([hypothesis(FIRST_DECLARED_HYPOTHESIS)]));

    // act
    const answered = requiredEvaluations(publishedCase);

    // assert
    assert.equal(Object.isFrozen(answered), true);
  });
});
