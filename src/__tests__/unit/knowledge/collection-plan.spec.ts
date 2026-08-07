import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Case } from '../../../knowledge/case';
import { createCase } from '../../../knowledge/case';
import { collectionPlan } from '../../../knowledge/collection-plan';
import type { Hypothesis } from '../../../knowledge/hypothesis';

/**
 * Proves `task/published-case/collection-plan` over
 * `src/knowledge/collection-plan.ts`.
 *
 * Every name below is a placeholder, chosen only to be distinguishable from
 * the next one. The subject-type and concept vocabularies are open, and this
 * suite binds every name by identity and never enumerates or checks a
 * vocabulary, so no member of any vocabulary is written here and nothing
 * below asserts which names exist.
 *
 * Concept names are declared out of alphabetical order across hypotheses on
 * purpose, so an answer sorted or reordered on the way through would
 * disagree with the order-preserving assertions below rather than passing by
 * coincidence.
 */
const DECLARED_SLUG = 'case-slug-placeholder';
const DECLARED_TITLE = 'title placeholder as declared';
const DECLARED_WHEN_TO_USE = 'when to use it, as declared';
const DECLARED_SUBJECT_TYPE = 'subject-type-placeholder';
const DECLARED_VERSION = 'version-placeholder';
const DECLARED_CONTENT_HASH = 'content-hash-placeholder';
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

const CONCEPT_ONLY_FIRST = 'concept-placeholder-z';
const CONCEPT_SHARED = 'concept-placeholder-m';
const CONCEPT_ONLY_SECOND = 'concept-placeholder-a';
const CONCEPT_NEVER_COLLECTED = 'concept-placeholder-uncollected';

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
 * A fresh set of case parts per call, built from whatever hypotheses and
 * curator notes the test hands in, so no test's published case shares state
 * with another's.
 */
function caseParts(hypotheses: readonly Hypothesis[], curatorNotes?: string): Case {
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
    curatorNotes,
    version: DECLARED_VERSION,
    contentHash: DECLARED_CONTENT_HASH,
  };
}

describe('collectionPlan', () => {
  it('includes a concept collected by exactly one hypothesis of the case', () => {
    // arrange
    const publishedCase = createCase(
      caseParts([hypothesis(FIRST_HYPOTHESIS_NAME, [CONCEPT_ONLY_FIRST])]),
    );

    // act
    const plan = collectionPlan(publishedCase);

    // assert
    assert.ok(plan.includes(CONCEPT_ONLY_FIRST));
  });

  it('includes a concept collected by two hypotheses exactly once', () => {
    // arrange
    const publishedCase = createCase(
      caseParts([
        hypothesis(FIRST_HYPOTHESIS_NAME, [CONCEPT_SHARED]),
        hypothesis(SECOND_HYPOTHESIS_NAME, [CONCEPT_SHARED]),
      ]),
    );

    // act
    const plan = collectionPlan(publishedCase);

    // assert
    assert.equal(plan.filter((concept) => concept === CONCEPT_SHARED).length, 1);
  });

  it("answers with every concept every hypothesis collects, when the hypotheses' collected sets are disjoint", () => {
    // arrange
    const publishedCase = createCase(
      caseParts([
        hypothesis(FIRST_HYPOTHESIS_NAME, [CONCEPT_ONLY_FIRST]),
        hypothesis(SECOND_HYPOTHESIS_NAME, [CONCEPT_ONLY_SECOND]),
        hypothesis(THIRD_HYPOTHESIS_NAME, [CONCEPT_SHARED]),
      ]),
    );

    // act
    const plan = collectionPlan(publishedCase);

    // assert
    assert.deepEqual(
      [...plan].sort(),
      [CONCEPT_ONLY_FIRST, CONCEPT_ONLY_SECOND, CONCEPT_SHARED].sort(),
    );
  });

  it("answers with no concept absent from every hypothesis of the case", () => {
    // arrange
    const publishedCase = createCase(
      caseParts([hypothesis(FIRST_HYPOTHESIS_NAME, [CONCEPT_ONLY_FIRST])]),
    );

    // act
    const plan = collectionPlan(publishedCase);

    // assert
    assert.equal(plan.includes(CONCEPT_NEVER_COLLECTED), false);
  });

  it('answers with the same set of concepts for two cases whose structured hypotheses are identical and whose body text differs', () => {
    // arrange
    //
    // Two distinct Case values sharing the same structured hypotheses but
    // declaring different curator notes — the case's own free-text field
    // (rule/knowledge/the-body-does-not-change-what-is-collected). One
    // declares no notes at all, the other a non-empty passage, so the body
    // moves as far as it can between the two.
    const hypotheses = [
      hypothesis(FIRST_HYPOTHESIS_NAME, [CONCEPT_ONLY_FIRST]),
      hypothesis(SECOND_HYPOTHESIS_NAME, [CONCEPT_SHARED]),
    ];
    const caseWithNoNotes = createCase(caseParts(hypotheses));
    const caseWithNotes = createCase(
      caseParts(hypotheses, 'curator notes that say something entirely different'),
    );

    // act
    const planWithoutNotes = collectionPlan(caseWithNoNotes);
    const planWithNotes = collectionPlan(caseWithNotes);

    // assert
    assert.deepEqual(planWithoutNotes, planWithNotes);
  });

  it('answers with no entries for a case declaring no hypotheses', () => {
    // arrange
    //
    // createCase does not refuse a case declaring no hypotheses (checked in
    // case.spec.ts); the empty case is representable input here too.
    const publishedCase = createCase(caseParts([]));

    // act
    const plan = collectionPlan(publishedCase);

    // assert
    assert.deepEqual(plan, []);
  });

  it("does not repeat a concept named twice within one hypothesis's own collects", () => {
    // arrange
    //
    // The dedup guard is a single running set over the whole walk, so a
    // repetition inside one hypothesis's own list has to be caught the same
    // way a repetition across two hypotheses is (the criterion above) —
    // this is the case where both occurrences come from the same
    // hypothesis rather than from two.
    const publishedCase = createCase(
      caseParts([hypothesis(FIRST_HYPOTHESIS_NAME, [CONCEPT_SHARED, CONCEPT_SHARED])]),
    );

    // act
    const plan = collectionPlan(publishedCase);

    // assert
    assert.equal(plan.filter((concept) => concept === CONCEPT_SHARED).length, 1);
  });

  it('stands its entries in the order concepts are first encountered, across hypotheses in the order the case declares them', () => {
    // arrange
    //
    // Pins the implementation's recorded inference that the answer preserves
    // first-encounter order (the case's declared hypothesis order, then each
    // hypothesis's declared collects order) rather than sorting the result.
    // The concept and hypothesis names disagree with lexicographic order on
    // purpose, so a sorted answer fails this assertion rather than passing
    // by coincidence.
    const publishedCase = createCase(
      caseParts([
        hypothesis(FIRST_HYPOTHESIS_NAME, [CONCEPT_ONLY_FIRST, CONCEPT_SHARED]),
        hypothesis(SECOND_HYPOTHESIS_NAME, [CONCEPT_ONLY_SECOND, CONCEPT_SHARED]),
      ]),
    );

    // act
    const plan = collectionPlan(publishedCase);

    // assert
    assert.deepEqual(plan, [CONCEPT_ONLY_FIRST, CONCEPT_SHARED, CONCEPT_ONLY_SECOND]);
  });
});
