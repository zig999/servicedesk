import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Evaluation, InconclusiveReason, Verdict } from '../../../investigation/evaluation';
import type { Evidence, EvidenceResult } from '../../../investigation/evidence';
import type { Case } from '../../../knowledge/case';
import { createCase } from '../../../knowledge/case';
import type { Hypothesis } from '../../../knowledge/hypothesis';
import { resolveOutcome } from '../../../knowledge/outcome-resolution';
import type { Resolution } from '../../../knowledge/resolution';

/**
 * Proves `task/published-case/outcome-resolution` over
 * `src/knowledge/outcome-resolution.ts`.
 *
 * Every name below is a placeholder, chosen only to be distinguishable from
 * the next one. The subject-type, concept, outcome, action and recipient
 * vocabularies are open, the hypothesis names are the case's own, and this
 * suite binds every one of those names by identity and never enumerates or
 * checks a vocabulary, so no member of any vocabulary is written here and
 * nothing below asserts which names exist. The verdict and result values are
 * not placeholders — both vocabularies are closed and the base's own.
 *
 * Every resolution declared across a case — each hypothesis's own, and the
 * two fallbacks — carries a distinct outcome, action and recipient on
 * purpose, so an answer wired to the wrong slot, or composed from parts of
 * more than one, fails wherever its test looks rather than passing by
 * coincidence.
 */
const DECLARED_SLUG = 'case-slug-placeholder';
const DECLARED_TITLE = 'title placeholder as declared';
const DECLARED_WHEN_TO_USE = 'when to use it, as declared';
const DECLARED_SUBJECT_TYPE = 'subject-type-placeholder';
const DECLARED_VERSION = 'version-placeholder';
const DECLARED_CONTENT_HASH = 'content-hash-placeholder';
const DECLARED_CONCEPT = 'concept-placeholder';
const DECLARED_CRITERION = 'criterion of the hypothesis, as declared';

const HYPOTHESIS_A = 'hypothesis-placeholder-a';
const HYPOTHESIS_B = 'hypothesis-placeholder-b';
const HYPOTHESIS_C = 'hypothesis-placeholder-c';
const UNDECLARED_HYPOTHESIS = 'hypothesis-placeholder-not-in-the-case';

const A_OUTCOME = 'outcome-placeholder-a';
const A_ACTION = 'action-placeholder-a';
const A_RECIPIENT = 'recipient-placeholder-a';
const B_OUTCOME = 'outcome-placeholder-b';
const B_ACTION = 'action-placeholder-b';
const B_RECIPIENT = 'recipient-placeholder-b';
const C_OUTCOME = 'outcome-placeholder-c';
const C_ACTION = 'action-placeholder-c';
const C_RECIPIENT = 'recipient-placeholder-c';
const NO_DATA_OUTCOME = 'outcome-placeholder-no-data';
const NO_DATA_ACTION = 'action-placeholder-no-data';
const NO_DATA_RECIPIENT = 'recipient-placeholder-no-data';
const EXHAUSTED_OUTCOME = 'outcome-placeholder-exhausted';
const EXHAUSTED_ACTION = 'action-placeholder-exhausted';
const EXHAUSTED_RECIPIENT = 'recipient-placeholder-exhausted';

function makeResolution(outcome: string, action: string, recipient: string): Resolution {
  return { outcome, referral: { action, recipient } };
}

function makeHypothesis(name: string, resolution: Resolution): Hypothesis {
  return {
    name,
    collects: [DECLARED_CONCEPT],
    confirmsWhen: DECLARED_CRITERION,
    resolution,
  };
}

function makeCase(
  hypotheses: Hypothesis[],
  noDataFallback: Resolution = makeResolution(NO_DATA_OUTCOME, NO_DATA_ACTION, NO_DATA_RECIPIENT),
  hypothesesExhaustedFallback: Resolution = makeResolution(
    EXHAUSTED_OUTCOME,
    EXHAUSTED_ACTION,
    EXHAUSTED_RECIPIENT,
  ),
): Case {
  return createCase({
    slug: DECLARED_SLUG,
    title: DECLARED_TITLE,
    whenToUse: DECLARED_WHEN_TO_USE,
    subjectType: DECLARED_SUBJECT_TYPE,
    hypotheses,
    noDataFallback,
    hypothesesExhaustedFallback,
    version: DECLARED_VERSION,
    contentHash: DECLARED_CONTENT_HASH,
  });
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

describe('resolveOutcome', () => {
  it('names the sole confirmed hypothesis as determining', () => {
    // arrange
    const theCase = makeCase([makeHypothesis(HYPOTHESIS_A, makeResolution(A_OUTCOME, A_ACTION, A_RECIPIENT))]);
    const evaluations = [makeEvaluation(HYPOTHESIS_A, 'confirmed')];

    // act
    const answer = resolveOutcome(theCase, evaluations, []);

    // assert
    assert.equal(answer.determiningHypothesis, HYPOTHESIS_A);
  });

  it('names the confirmed hypothesis the case lists earliest as determining, when two confirm', () => {
    // arrange
    //
    // The case declares A before B; the evaluations list B before A, so an
    // implementation reading precedence from the evaluations' own order
    // rather than the case's declared order is told apart from one reading
    // the case's order.
    const theCase = makeCase([
      makeHypothesis(HYPOTHESIS_A, makeResolution(A_OUTCOME, A_ACTION, A_RECIPIENT)),
      makeHypothesis(HYPOTHESIS_B, makeResolution(B_OUTCOME, B_ACTION, B_RECIPIENT)),
    ]);
    const evaluations = [
      makeEvaluation(HYPOTHESIS_B, 'confirmed'),
      makeEvaluation(HYPOTHESIS_A, 'confirmed'),
    ];

    // act
    const answer = resolveOutcome(theCase, evaluations, []);

    // assert
    assert.equal(answer.determiningHypothesis, HYPOTHESIS_A);
  });

  it('names the confirmed hypothesis the case lists earliest as determining, when three or more confirm', () => {
    // arrange
    //
    // This is the case the task's binding names as UNDERDETERMINED by
    // criteria 1 and 2 alone: an implementation that special-cases exactly
    // one or two confirmations, and falls back to picking any other
    // confirmed hypothesis once three or more confirm, satisfies every
    // criterion the task states in words while still failing this. The
    // case declares A, B, C in that order; all three confirm, and the
    // evaluations list them in the opposite order, so neither the
    // evaluations' own order nor "whichever confirmed hypothesis a walk
    // happens to land on last" can pass this by coincidence — only the
    // hypothesis the case lists earliest, A, is the right answer.
    const theCase = makeCase([
      makeHypothesis(HYPOTHESIS_A, makeResolution(A_OUTCOME, A_ACTION, A_RECIPIENT)),
      makeHypothesis(HYPOTHESIS_B, makeResolution(B_OUTCOME, B_ACTION, B_RECIPIENT)),
      makeHypothesis(HYPOTHESIS_C, makeResolution(C_OUTCOME, C_ACTION, C_RECIPIENT)),
    ]);
    const evaluations = [
      makeEvaluation(HYPOTHESIS_C, 'confirmed'),
      makeEvaluation(HYPOTHESIS_B, 'confirmed'),
      makeEvaluation(HYPOTHESIS_A, 'confirmed'),
    ];

    // act
    const answer = resolveOutcome(theCase, evaluations, []);

    // assert
    assert.equal(answer.determiningHypothesis, HYPOTHESIS_A);
  });

  it('carries the resolution the case declared for the sole confirmed hypothesis', () => {
    // arrange
    const resolution = makeResolution(A_OUTCOME, A_ACTION, A_RECIPIENT);
    const theCase = makeCase([makeHypothesis(HYPOTHESIS_A, resolution)]);
    const evaluations = [makeEvaluation(HYPOTHESIS_A, 'confirmed')];

    // act
    const answer = resolveOutcome(theCase, evaluations, []);

    // assert
    assert.deepEqual(answer.resolution, resolution);
  });

  it('carries the resolution declared for the determining hypothesis, not the other confirmed one, when two confirm', () => {
    // arrange
    const resolutionA = makeResolution(A_OUTCOME, A_ACTION, A_RECIPIENT);
    const resolutionB = makeResolution(B_OUTCOME, B_ACTION, B_RECIPIENT);
    const theCase = makeCase([
      makeHypothesis(HYPOTHESIS_A, resolutionA),
      makeHypothesis(HYPOTHESIS_B, resolutionB),
    ]);
    const evaluations = [
      makeEvaluation(HYPOTHESIS_A, 'confirmed'),
      makeEvaluation(HYPOTHESIS_B, 'confirmed'),
    ];

    // act
    const answer = resolveOutcome(theCase, evaluations, []);

    // assert
    assert.deepEqual(answer.resolution, resolutionA);
    assert.notDeepEqual(answer.resolution, resolutionB);
  });

  it('carries the case\'s no-data fallback when no hypothesis confirms and the fallback selection yields it', () => {
    // arrange
    const theCase = makeCase([
      makeHypothesis(HYPOTHESIS_A, makeResolution(A_OUTCOME, A_ACTION, A_RECIPIENT)),
    ]);
    const evaluations = [makeEvaluation(HYPOTHESIS_A, 'refuted')];
    const evidence = [makeEvidence('concept-placeholder-x', 'timeout')];

    // act
    const answer = resolveOutcome(theCase, evaluations, evidence);

    // assert
    assert.deepEqual(answer.resolution, theCase.noDataFallback);
  });

  it('carries the case\'s hypotheses-exhausted fallback when no hypothesis confirms and the fallback selection yields it', () => {
    // arrange
    const theCase = makeCase([
      makeHypothesis(HYPOTHESIS_A, makeResolution(A_OUTCOME, A_ACTION, A_RECIPIENT)),
    ]);
    const evaluations = [makeEvaluation(HYPOTHESIS_A, 'refuted')];
    const evidence = [makeEvidence('concept-placeholder-x', 'ok')];

    // act
    const answer = resolveOutcome(theCase, evaluations, evidence);

    // assert
    assert.deepEqual(answer.resolution, theCase.hypothesesExhaustedFallback);
  });

  it('names no determining hypothesis when no hypothesis confirms', () => {
    // arrange
    const theCase = makeCase([
      makeHypothesis(HYPOTHESIS_A, makeResolution(A_OUTCOME, A_ACTION, A_RECIPIENT)),
    ]);
    const evaluations = [makeEvaluation(HYPOTHESIS_A, 'refuted')];
    const evidence = [makeEvidence('concept-placeholder-x', 'ok')];

    // act
    const answer = resolveOutcome(theCase, evaluations, evidence);

    // assert
    assert.equal(answer.determiningHypothesis, undefined);
  });

  it('carries only the outcome of the resolution that was resolved, and no other outcome the case holds, on the confirmed path', () => {
    // arrange
    //
    // Four resolutions exist on this case, each with a distinct outcome:
    // the two hypotheses' own and the two fallbacks'. Only A's outcome may
    // appear in the answer.
    const theCase = makeCase(
      [
        makeHypothesis(HYPOTHESIS_A, makeResolution(A_OUTCOME, A_ACTION, A_RECIPIENT)),
        makeHypothesis(HYPOTHESIS_B, makeResolution(B_OUTCOME, B_ACTION, B_RECIPIENT)),
      ],
      makeResolution(NO_DATA_OUTCOME, NO_DATA_ACTION, NO_DATA_RECIPIENT),
      makeResolution(EXHAUSTED_OUTCOME, EXHAUSTED_ACTION, EXHAUSTED_RECIPIENT),
    );
    const evaluations = [makeEvaluation(HYPOTHESIS_A, 'confirmed')];

    // act
    const answer = resolveOutcome(theCase, evaluations, []);

    // assert
    assert.equal(answer.resolution.outcome, A_OUTCOME);
    assert.notEqual(answer.resolution.outcome, B_OUTCOME);
    assert.notEqual(answer.resolution.outcome, NO_DATA_OUTCOME);
    assert.notEqual(answer.resolution.outcome, EXHAUSTED_OUTCOME);
  });

  it('carries only the outcome of the resolution that was resolved, and no other outcome the case holds, on the fallback path', () => {
    // arrange
    const theCase = makeCase(
      [
        makeHypothesis(HYPOTHESIS_A, makeResolution(A_OUTCOME, A_ACTION, A_RECIPIENT)),
        makeHypothesis(HYPOTHESIS_B, makeResolution(B_OUTCOME, B_ACTION, B_RECIPIENT)),
      ],
      makeResolution(NO_DATA_OUTCOME, NO_DATA_ACTION, NO_DATA_RECIPIENT),
      makeResolution(EXHAUSTED_OUTCOME, EXHAUSTED_ACTION, EXHAUSTED_RECIPIENT),
    );
    const evaluations = [
      makeEvaluation(HYPOTHESIS_A, 'refuted'),
      makeEvaluation(HYPOTHESIS_B, 'refuted'),
    ];
    const evidence = [makeEvidence('concept-placeholder-x', 'ok')];

    // act
    const answer = resolveOutcome(theCase, evaluations, evidence);

    // assert
    assert.equal(answer.resolution.outcome, EXHAUSTED_OUTCOME);
    assert.notEqual(answer.resolution.outcome, A_OUTCOME);
    assert.notEqual(answer.resolution.outcome, B_OUTCOME);
    assert.notEqual(answer.resolution.outcome, NO_DATA_OUTCOME);
  });

  it('carries only the referral of the resolution that was resolved, and no other referral the case holds, on the confirmed path', () => {
    // arrange
    const theCase = makeCase(
      [
        makeHypothesis(HYPOTHESIS_A, makeResolution(A_OUTCOME, A_ACTION, A_RECIPIENT)),
        makeHypothesis(HYPOTHESIS_B, makeResolution(B_OUTCOME, B_ACTION, B_RECIPIENT)),
      ],
      makeResolution(NO_DATA_OUTCOME, NO_DATA_ACTION, NO_DATA_RECIPIENT),
      makeResolution(EXHAUSTED_OUTCOME, EXHAUSTED_ACTION, EXHAUSTED_RECIPIENT),
    );
    const evaluations = [makeEvaluation(HYPOTHESIS_A, 'confirmed')];

    // act
    const answer = resolveOutcome(theCase, evaluations, []);

    // assert
    assert.deepEqual(answer.resolution.referral, { action: A_ACTION, recipient: A_RECIPIENT });
    assert.notDeepEqual(answer.resolution.referral, { action: B_ACTION, recipient: B_RECIPIENT });
    assert.notDeepEqual(answer.resolution.referral, {
      action: NO_DATA_ACTION,
      recipient: NO_DATA_RECIPIENT,
    });
    assert.notDeepEqual(answer.resolution.referral, {
      action: EXHAUSTED_ACTION,
      recipient: EXHAUSTED_RECIPIENT,
    });
  });

  it('carries only the referral of the resolution that was resolved, and no other referral the case holds, on the fallback path', () => {
    // arrange
    const theCase = makeCase(
      [
        makeHypothesis(HYPOTHESIS_A, makeResolution(A_OUTCOME, A_ACTION, A_RECIPIENT)),
        makeHypothesis(HYPOTHESIS_B, makeResolution(B_OUTCOME, B_ACTION, B_RECIPIENT)),
      ],
      makeResolution(NO_DATA_OUTCOME, NO_DATA_ACTION, NO_DATA_RECIPIENT),
      makeResolution(EXHAUSTED_OUTCOME, EXHAUSTED_ACTION, EXHAUSTED_RECIPIENT),
    );
    const evaluations = [
      makeEvaluation(HYPOTHESIS_A, 'refuted'),
      makeEvaluation(HYPOTHESIS_B, 'refuted'),
    ];
    const evidence = [makeEvidence('concept-placeholder-x', 'timeout')];

    // act
    const answer = resolveOutcome(theCase, evaluations, evidence);

    // assert
    assert.deepEqual(answer.resolution.referral, {
      action: NO_DATA_ACTION,
      recipient: NO_DATA_RECIPIENT,
    });
    assert.notDeepEqual(answer.resolution.referral, { action: A_ACTION, recipient: A_RECIPIENT });
    assert.notDeepEqual(answer.resolution.referral, { action: B_ACTION, recipient: B_RECIPIENT });
    assert.notDeepEqual(answer.resolution.referral, {
      action: EXHAUSTED_ACTION,
      recipient: EXHAUSTED_RECIPIENT,
    });
  });

  it("still reads back the later-listed confirmed hypothesis's evaluation with its confirming verdict, once the answer is produced", () => {
    // arrange
    const theCase = makeCase([
      makeHypothesis(HYPOTHESIS_A, makeResolution(A_OUTCOME, A_ACTION, A_RECIPIENT)),
      makeHypothesis(HYPOTHESIS_B, makeResolution(B_OUTCOME, B_ACTION, B_RECIPIENT)),
    ]);
    const evaluations = [
      makeEvaluation(HYPOTHESIS_A, 'confirmed'),
      makeEvaluation(HYPOTHESIS_B, 'confirmed'),
    ];
    const evaluationsBeforeCall = evaluations.map((evaluation) => ({ ...evaluation }));

    // act
    resolveOutcome(theCase, evaluations, []);

    // assert
    assert.deepEqual(evaluations, evaluationsBeforeCall);
    const laterListed = evaluations.find((evaluation) => evaluation.hypothesis === HYPOTHESIS_B);
    assert.equal(laterListed?.verdict, 'confirmed');
  });

  it('marks no hypothesis of the case as superseded when producing the answer', () => {
    // arrange
    const theCase = makeCase([
      makeHypothesis(HYPOTHESIS_A, makeResolution(A_OUTCOME, A_ACTION, A_RECIPIENT)),
      makeHypothesis(HYPOTHESIS_B, makeResolution(B_OUTCOME, B_ACTION, B_RECIPIENT)),
    ]);
    const hypothesesBeforeCall = theCase.hypotheses.map((hypothesis) => ({ ...hypothesis }));
    const evaluations = [
      makeEvaluation(HYPOTHESIS_A, 'confirmed'),
      makeEvaluation(HYPOTHESIS_B, 'confirmed'),
    ];

    // act
    resolveOutcome(theCase, evaluations, []);

    // assert
    assert.deepEqual(theCase.hypotheses, hypothesesBeforeCall);
    assert.ok(
      theCase.hypotheses.every((hypothesis) => !('superseded' in hypothesis)),
      'no hypothesis carries a superseded marker after the answer is produced',
    );
  });

  it('sets determiningHypothesis explicitly to undefined on the fallback path, rather than omitting the key', () => {
    // arrange
    //
    // Pins the implementation's recorded inference: a later consumer reading
    // this key by name — the way Object.keys or a spread would — sees it
    // present with an absent value, the same shape createAssessment already
    // produces for a constructed assessment with no determining hypothesis,
    // rather than a shape missing the key entirely.
    const theCase = makeCase([
      makeHypothesis(HYPOTHESIS_A, makeResolution(A_OUTCOME, A_ACTION, A_RECIPIENT)),
    ]);
    const evaluations = [makeEvaluation(HYPOTHESIS_A, 'refuted')];
    const evidence = [makeEvidence('concept-placeholder-x', 'ok')];

    // act
    const answer = resolveOutcome(theCase, evaluations, evidence);

    // assert
    assert.ok(
      Object.prototype.hasOwnProperty.call(answer, 'determiningHypothesis'),
      'determiningHypothesis is present as an own key even though its value is absent',
    );
    assert.equal(answer.determiningHypothesis, undefined);
  });

  it('throws rather than silently answering, when an evaluation confirms a hypothesis the case does not declare and so no hypothesis of the case confirms and the fallback selection yields nothing', () => {
    // arrange
    //
    // Pins the implementation's recorded inference over a state the base's
    // own invariants (one-evaluation-per-hypothesis, and hypothesis names
    // unique within a case) rule out upstream: an evaluation confirming a
    // hypothesis name absent from this case's own hypotheses. No case
    // hypothesis is found as determining, and the fallback selection reads
    // "some evaluation confirmed" from that same evaluation and yields no
    // fallback either, leaving nothing this module can answer with.
    const theCase = makeCase([
      makeHypothesis(HYPOTHESIS_A, makeResolution(A_OUTCOME, A_ACTION, A_RECIPIENT)),
    ]);
    const evaluations = [
      makeEvaluation(HYPOTHESIS_A, 'refuted'),
      makeEvaluation(UNDECLARED_HYPOTHESIS, 'confirmed'),
    ];

    // act
    const resolving = (): unknown => resolveOutcome(theCase, evaluations, []);

    // assert
    assert.throws(resolving);
  });

  it('answers with a real resolution rather than throwing or misreading it, when there are no evaluations at all', () => {
    // arrange
    //
    // An empty evaluations list means no hypothesis confirmed, vacuously —
    // this must read the same as an explicit non-confirming verdict on
    // every hypothesis rather than as an unanswerable case.
    const theCase = makeCase([
      makeHypothesis(HYPOTHESIS_A, makeResolution(A_OUTCOME, A_ACTION, A_RECIPIENT)),
    ]);
    const evaluations: Evaluation[] = [];
    const evidence = [makeEvidence('concept-placeholder-x', 'ok')];

    // act
    const answer = resolveOutcome(theCase, evaluations, evidence);

    // assert
    assert.deepEqual(answer.resolution, theCase.hypothesesExhaustedFallback);
    assert.equal(answer.determiningHypothesis, undefined);
  });
});
