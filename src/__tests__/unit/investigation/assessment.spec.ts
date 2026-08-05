import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createAssessment } from '../../../investigation/assessment';

/**
 * Proves `task/published-case/assessment-record` over
 * `src/investigation/assessment.ts`.
 *
 * Every name below is a placeholder, chosen only to be distinguishable from the
 * next one. The outcome, action and recipient vocabularies are open, and this
 * construct binds each of those names by identity and never enumerates or
 * checks one, so no member of any vocabulary is written here and nothing below
 * asserts which names exist. The hypothesis name is a placeholder for the same
 * reason: the assessment holds the hypothesis's identity and nothing else of it.
 */
const CARRIED_OUTCOME = 'outcome-placeholder-a';
const CARRIED_ACTION = 'action-placeholder-a';
const CARRIED_RECIPIENT = 'recipient-placeholder-a';
const CARRIED_HYPOTHESIS = 'hypothesis-placeholder-a';
const OTHER_OUTCOME = 'outcome-placeholder-b';
const OTHER_ACTION = 'action-placeholder-b';

/**
 * Carries leading space, a line break and trailing space, so a text that was
 * trimmed, joined or normalized on the way through reads back different from
 * the one it was constructed with.
 */
const CARRIED_TEXT = '  first line of the text as given\n  second line as given  ';

describe('createAssessment', () => {
  it('reads back the resolution it was constructed with', () => {
    // arrange
    const resolution = {
      outcome: CARRIED_OUTCOME,
      referral: { action: CARRIED_ACTION, recipient: CARRIED_RECIPIENT },
    };

    // act
    const assessment = createAssessment({ resolution, text: CARRIED_TEXT });

    // assert
    assert.deepEqual(assessment.resolution, {
      outcome: CARRIED_OUTCOME,
      referral: { action: CARRIED_ACTION, recipient: CARRIED_RECIPIENT },
    });
  });

  it('carries only one resolution when it is handed a part naming a second one', () => {
    // arrange
    const partsNamingASecondResolution = {
      resolution: {
        outcome: CARRIED_OUTCOME,
        referral: { action: CARRIED_ACTION, recipient: CARRIED_RECIPIENT },
      },
      text: CARRIED_TEXT,
      secondResolution: {
        outcome: OTHER_OUTCOME,
        referral: { action: OTHER_ACTION, recipient: CARRIED_RECIPIENT },
      },
    };

    // act
    const assessment = createAssessment(partsNamingASecondResolution);

    // assert
    const slotsBesideTheTextAndTheHypothesis = Object.keys(assessment).filter(
      (part) => part !== 'text' && part !== 'determiningHypothesis',
    );
    assert.deepEqual(slotsBesideTheTextAndTheHypothesis, ['resolution']);
  });

  it('reads its resolution back as one resolution and not as a collection of them', () => {
    // arrange
    const resolution = {
      outcome: CARRIED_OUTCOME,
      referral: { action: CARRIED_ACTION, recipient: CARRIED_RECIPIENT },
    };

    // act
    const assessment = createAssessment({ resolution, text: CARRIED_TEXT });

    // assert
    assert.ok(
      !Array.isArray(assessment.resolution),
      'the resolution slot holds one resolution, never a collection of them',
    );
  });

  it('reads back the determining hypothesis it was constructed with, by name', () => {
    // arrange
    const resolution = {
      outcome: CARRIED_OUTCOME,
      referral: { action: CARRIED_ACTION, recipient: CARRIED_RECIPIENT },
    };

    // act
    const assessment = createAssessment({
      resolution,
      determiningHypothesis: CARRIED_HYPOTHESIS,
      text: CARRIED_TEXT,
    });

    // assert
    assert.equal(assessment.determiningHypothesis, CARRIED_HYPOTHESIS);
  });

  it('constructs an assessment given no determining hypothesis rather than refusing it', () => {
    // arrange
    const resolution = {
      outcome: CARRIED_OUTCOME,
      referral: { action: CARRIED_ACTION, recipient: CARRIED_RECIPIENT },
    };

    // act
    const constructing = (): unknown => createAssessment({ resolution, text: CARRIED_TEXT });

    // assert
    assert.doesNotThrow(constructing);
  });

  it('reads back no determining hypothesis when it was constructed without one', () => {
    // arrange
    const resolution = {
      outcome: CARRIED_OUTCOME,
      referral: { action: CARRIED_ACTION, recipient: CARRIED_RECIPIENT },
    };

    // act
    const assessment = createAssessment({ resolution, text: CARRIED_TEXT });

    // assert
    assert.equal(assessment.determiningHypothesis, undefined);
  });

  it('reads back the text it was constructed with, character for character', () => {
    // arrange
    const resolution = {
      outcome: CARRIED_OUTCOME,
      referral: { action: CARRIED_ACTION, recipient: CARRIED_RECIPIENT },
    };

    // act
    const assessment = createAssessment({ resolution, text: CARRIED_TEXT });

    // assert
    assert.equal(assessment.text, CARRIED_TEXT);
  });

  it('reads back the outcome it was constructed with after the resolution handed in is changed', () => {
    // arrange
    const resolution = {
      outcome: CARRIED_OUTCOME,
      referral: { action: CARRIED_ACTION, recipient: CARRIED_RECIPIENT },
    };
    const assessment = createAssessment({ resolution, text: CARRIED_TEXT });

    // act
    resolution.outcome = OTHER_OUTCOME;

    // assert
    assert.equal(assessment.resolution.outcome, CARRIED_OUTCOME);
  });

  it('reads back the action it was constructed with after the referral handed in is changed', () => {
    // arrange
    const referral = { action: CARRIED_ACTION, recipient: CARRIED_RECIPIENT };
    const assessment = createAssessment({
      resolution: { outcome: CARRIED_OUTCOME, referral },
      text: CARRIED_TEXT,
    });

    // act
    referral.action = OTHER_ACTION;

    // assert
    assert.equal(assessment.resolution.referral.action, CARRIED_ACTION);
  });
});
