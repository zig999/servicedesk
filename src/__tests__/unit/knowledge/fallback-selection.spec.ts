import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Evaluation, InconclusiveReason, Verdict } from '../../../investigation/evaluation';
import type { Evidence, EvidenceResult } from '../../../investigation/evidence';
import type { Case } from '../../../knowledge/case';
import { createCase } from '../../../knowledge/case';
import { selectFallback } from '../../../knowledge/fallback-selection';

/**
 * Proves `task/published-case/fallback-selection` over
 * `src/knowledge/fallback-selection.ts`.
 *
 * Every name below is a placeholder, chosen only to be distinguishable from
 * the next one. The subject-type, concept, outcome, action and recipient
 * vocabularies are open, the hypothesis names are the case's own, and this
 * suite binds every one of those names by identity and never enumerates or
 * checks a vocabulary, so no member of any vocabulary is written here and
 * nothing below asserts which names exist. The verdict and result values are
 * not placeholders — both vocabularies are closed and the base's own — and
 * each is bound to the exported type it belongs to, so a vocabulary the
 * implementation moved fails to compile here rather than passing against a
 * copy of it.
 *
 * The two declared fallback resolutions carry distinct outcomes, actions and
 * recipients on purpose, so a selection wired to the wrong slot or composing
 * a resolution from parts of both fails wherever its test looks.
 */
const DECLARED_SLUG = 'case-slug-placeholder';
const DECLARED_TITLE = 'title placeholder as declared';
const DECLARED_WHEN_TO_USE = 'when to use it, as declared';
const DECLARED_SUBJECT_TYPE = 'subject-type-placeholder';
const DECLARED_VERSION = 'version-placeholder';
const DECLARED_CONTENT_HASH = 'content-hash-placeholder';
const DECLARED_CONCEPT = 'concept-placeholder';
const DECLARED_CRITERION = 'criterion of the hypothesis, as declared';
const HYPOTHESIS_NAME = 'hypothesis-placeholder';
const HYPOTHESIS_OUTCOME = 'outcome-placeholder-hypothesis';
const HYPOTHESIS_ACTION = 'action-placeholder-hypothesis';
const HYPOTHESIS_RECIPIENT = 'recipient-placeholder-hypothesis';
const NO_DATA_OUTCOME = 'outcome-placeholder-no-data';
const NO_DATA_ACTION = 'action-placeholder-no-data';
const NO_DATA_RECIPIENT = 'recipient-placeholder-no-data';
const EXHAUSTED_OUTCOME = 'outcome-placeholder-exhausted';
const EXHAUSTED_ACTION = 'action-placeholder-exhausted';
const EXHAUSTED_RECIPIENT = 'recipient-placeholder-exhausted';

const FIRST_EVALUATED_HYPOTHESIS = 'hypothesis-placeholder-first';
const SECOND_EVALUATED_HYPOTHESIS = 'hypothesis-placeholder-second';
const THIRD_EVALUATED_HYPOTHESIS = 'hypothesis-placeholder-third';

/**
 * A fresh set of case parts per call, so no test's published case shares
 * state with another's.
 */
function caseParts(): Case {
  return {
    slug: DECLARED_SLUG,
    title: DECLARED_TITLE,
    whenToUse: DECLARED_WHEN_TO_USE,
    subjectType: DECLARED_SUBJECT_TYPE,
    hypotheses: [
      {
        name: HYPOTHESIS_NAME,
        collects: [DECLARED_CONCEPT],
        confirmsWhen: DECLARED_CRITERION,
        resolution: {
          outcome: HYPOTHESIS_OUTCOME,
          referral: { action: HYPOTHESIS_ACTION, recipient: HYPOTHESIS_RECIPIENT },
        },
      },
    ],
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

function publishedCase(): Case {
  return createCase(caseParts());
}

function makeEvaluation(
  hypothesis: string,
  verdict: Verdict,
  reason?: InconclusiveReason,
): Evaluation {
  return reason === undefined ? { hypothesis, verdict } : { hypothesis, verdict, reason };
}

function makeEvidence(concept: string, result: EvidenceResult): Evidence {
  return { concept, result };
}

describe('selectFallback', () => {
  it('resolves to the hypotheses-exhausted fallback the case declares when no hypothesis confirms and every evidence carries ok', () => {
    // arrange
    const theCase = publishedCase();
    const evaluations = [
      makeEvaluation(FIRST_EVALUATED_HYPOTHESIS, 'refuted'),
      makeEvaluation(SECOND_EVALUATED_HYPOTHESIS, 'inconclusive', 'no-data'),
    ];
    const evidence = [
      makeEvidence('concept-placeholder-a', 'ok'),
      makeEvidence('concept-placeholder-b', 'ok'),
    ];

    // act
    const resolution = selectFallback(theCase, evaluations, evidence);

    // assert
    assert.deepEqual(resolution, theCase.hypothesesExhaustedFallback);
  });

  it('resolves to the no-data fallback the case declares when no hypothesis confirms and its evidence carries a timeout', () => {
    // arrange
    const theCase = publishedCase();
    const evaluations = [makeEvaluation(FIRST_EVALUATED_HYPOTHESIS, 'refuted')];
    const evidence = [makeEvidence('concept-placeholder-a', 'timeout')];

    // act
    const resolution = selectFallback(theCase, evaluations, evidence);

    // assert
    assert.deepEqual(resolution, theCase.noDataFallback);
  });

  it('resolves to the no-data fallback the case declares when no hypothesis confirms and its evidence carries an unavailability', () => {
    // arrange
    const theCase = publishedCase();
    const evaluations = [makeEvaluation(FIRST_EVALUATED_HYPOTHESIS, 'refuted')];
    const evidence = [makeEvidence('concept-placeholder-a', 'unavailable')];

    // act
    const resolution = selectFallback(theCase, evaluations, evidence);

    // assert
    assert.deepEqual(resolution, theCase.noDataFallback);
  });

  it('resolves to the no-data fallback the case declares when no hypothesis confirms and its evidence carries a denial', () => {
    // arrange
    const theCase = publishedCase();
    const evaluations = [makeEvaluation(FIRST_EVALUATED_HYPOTHESIS, 'refuted')];
    const evidence = [makeEvidence('concept-placeholder-a', 'denied')];

    // act
    const resolution = selectFallback(theCase, evaluations, evidence);

    // assert
    assert.deepEqual(resolution, theCase.noDataFallback);
  });

  it('resolves to the no-data fallback the case declares when only one of several evidences carries a result other than ok', () => {
    // arrange
    //
    // Three of the four evidences carry ok and only one carries denied. An
    // implementation that demands every evidence be non-ok before answering
    // with the no-data fallback would instead answer with the
    // hypotheses-exhausted one here, because not every evidence failed —
    // this is exactly the scenario that tells the two implementations apart.
    const theCase = publishedCase();
    const evaluations = [makeEvaluation(FIRST_EVALUATED_HYPOTHESIS, 'refuted')];
    const evidence = [
      makeEvidence('concept-placeholder-a', 'ok'),
      makeEvidence('concept-placeholder-b', 'ok'),
      makeEvidence('concept-placeholder-c', 'denied'),
      makeEvidence('concept-placeholder-d', 'ok'),
    ];

    // act
    const resolution = selectFallback(theCase, evaluations, evidence);

    // assert
    assert.deepEqual(resolution, theCase.noDataFallback);
  });

  it('returns the hypotheses-exhausted fallback object itself rather than a resolution composed anew, when every evidence carries ok', () => {
    // arrange
    const theCase = publishedCase();
    const evaluations = [makeEvaluation(FIRST_EVALUATED_HYPOTHESIS, 'refuted')];
    const evidence = [makeEvidence('concept-placeholder-a', 'ok')];

    // act
    const resolution = selectFallback(theCase, evaluations, evidence);

    // assert
    //
    // Reference equality, not just equal fields: an implementation composing
    // `{ outcome: ..., referral: {...} }` afresh from the case's own values
    // would still pass a deepEqual check but fail this one, because it
    // would hand back a different object carrying the same values.
    assert.equal(resolution, theCase.hypothesesExhaustedFallback);
  });

  it('returns the no-data fallback object itself rather than a resolution composed anew, when an evidence carries a result other than ok', () => {
    // arrange
    const theCase = publishedCase();
    const evaluations = [makeEvaluation(FIRST_EVALUATED_HYPOTHESIS, 'refuted')];
    const evidence = [makeEvidence('concept-placeholder-a', 'unavailable')];

    // act
    const resolution = selectFallback(theCase, evaluations, evidence);

    // assert
    assert.equal(resolution, theCase.noDataFallback);
  });

  it('yields no fallback when the one evaluated hypothesis confirms', () => {
    // arrange
    const theCase = publishedCase();
    const evaluations = [makeEvaluation(FIRST_EVALUATED_HYPOTHESIS, 'confirmed')];
    const evidence = [makeEvidence('concept-placeholder-a', 'ok')];

    // act
    const resolution = selectFallback(theCase, evaluations, evidence);

    // assert
    assert.equal(resolution, undefined);
  });

  it('yields no fallback when a later evaluation among several confirms, even though every evidence carries ok', () => {
    // arrange
    //
    // The confirmed evaluation sits last, not first, so an implementation
    // that only inspects the first entry of the list passes this by
    // accident while an implementation checking the whole list is the one
    // actually being proven.
    const theCase = publishedCase();
    const evaluations = [
      makeEvaluation(FIRST_EVALUATED_HYPOTHESIS, 'refuted'),
      makeEvaluation(SECOND_EVALUATED_HYPOTHESIS, 'inconclusive', 'judgment-failure'),
      makeEvaluation(THIRD_EVALUATED_HYPOTHESIS, 'confirmed'),
    ];
    const evidence = [makeEvidence('concept-placeholder-a', 'ok')];

    // act
    const resolution = selectFallback(theCase, evaluations, evidence);

    // assert
    assert.equal(resolution, undefined);
  });

  it('yields no fallback when an evaluation confirms, even though an evidence carries a result other than ok', () => {
    // arrange
    //
    // Proves the confirmed check takes precedence over the evidence check:
    // an implementation that looked at the evidence results before the
    // evaluations would answer with the no-data fallback here instead of
    // yielding nothing.
    const theCase = publishedCase();
    const evaluations = [makeEvaluation(FIRST_EVALUATED_HYPOTHESIS, 'confirmed')];
    const evidence = [makeEvidence('concept-placeholder-a', 'timeout')];

    // act
    const resolution = selectFallback(theCase, evaluations, evidence);

    // assert
    assert.equal(resolution, undefined);
  });

  it('yields no fallback when more than one evaluation confirms', () => {
    // arrange
    const theCase = publishedCase();
    const evaluations = [
      makeEvaluation(FIRST_EVALUATED_HYPOTHESIS, 'confirmed'),
      makeEvaluation(SECOND_EVALUATED_HYPOTHESIS, 'confirmed'),
    ];
    const evidence = [makeEvidence('concept-placeholder-a', 'ok')];

    // act
    const resolution = selectFallback(theCase, evaluations, evidence);

    // assert
    assert.equal(resolution, undefined);
  });

  it('answers with undefined rather than throwing, when some hypothesis confirmed', () => {
    // arrange
    //
    // Pins the implementation's recorded inference: this selection reports
    // "no fallback" as the absence of a value, the same convention already
    // used for Case#curatorNotes and Assessment#determiningHypothesis,
    // rather than by throwing or by a sentinel object.
    const theCase = publishedCase();
    const evaluations = [makeEvaluation(FIRST_EVALUATED_HYPOTHESIS, 'confirmed')];
    const evidence = [makeEvidence('concept-placeholder-a', 'ok')];
    let resolution: unknown;

    // act
    const selecting = (): void => {
      resolution = selectFallback(theCase, evaluations, evidence);
    };

    // assert
    assert.doesNotThrow(selecting);
    assert.equal(typeof resolution, 'undefined');
  });

  it('resolves to the hypotheses-exhausted fallback when no hypothesis confirms and there is no evidence at all', () => {
    // arrange
    //
    // An empty evidence list is representable — a case whose hypotheses
    // collect no concepts at all — and Array.prototype.every reads true
    // vacuously over it; this selection must answer with a real fallback
    // for that input rather than refusing or misreading it as failure.
    const theCase = publishedCase();
    const evaluations = [makeEvaluation(FIRST_EVALUATED_HYPOTHESIS, 'refuted')];
    const evidence: Evidence[] = [];

    // act
    const resolution = selectFallback(theCase, evaluations, evidence);

    // assert
    assert.deepEqual(resolution, theCase.hypothesesExhaustedFallback);
  });

  it('resolves to the no-data fallback when there are no evaluations at all and an evidence carries a result other than ok', () => {
    // arrange
    //
    // An empty evaluations list means no hypothesis confirmed, vacuously —
    // this must read the same as an explicit non-confirming verdict rather
    // than as an unanswerable case.
    const theCase = publishedCase();
    const evaluations: Evaluation[] = [];
    const evidence = [makeEvidence('concept-placeholder-a', 'denied')];

    // act
    const resolution = selectFallback(theCase, evaluations, evidence);

    // assert
    assert.deepEqual(resolution, theCase.noDataFallback);
  });
});
