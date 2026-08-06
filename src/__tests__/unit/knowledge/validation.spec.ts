import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { DraftCase } from '../../../knowledge/draft-case';
import type { Refusal } from '../../../knowledge/refusal';
import type { PublicationCheck } from '../../../knowledge/validation';
import { validate } from '../../../knowledge/validation';

/**
 * Proves `task/case-validator/validation-run` over
 * `src/knowledge/validation.ts`.
 *
 * Every name below is a placeholder, chosen only to be distinguishable from
 * the next one. The rule identifiers, subject-type, concept, outcome, action
 * and recipient vocabularies are open, the hypothesis names are the case's
 * own, and the run binds every one of those names by identity and never
 * enumerates or checks a vocabulary, so no member of any vocabulary is
 * written here and nothing below asserts which names exist.
 *
 * Every check registered below is written for this demonstration, as the
 * task's notes provide: a check is a parameter of the run, the checks the
 * plan delivers are other tasks' work, and none of these stands in for
 * delivered business logic — what is asserted is the run's composition,
 * never any check's judgment.
 *
 * The curator texts carry leading space, a line break and trailing space, so
 * a text that was trimmed, joined or normalized on the way through reads
 * back different from the one the check produced.
 */
const DECLARED_SLUG = 'case-slug-placeholder';
const DECLARED_TITLE = 'title placeholder as declared';
const DECLARED_WHEN_TO_USE = 'when to use it, as declared';
const DECLARED_SUBJECT_TYPE = 'subject-type-placeholder';
const DECLARED_CONCEPT = 'concept-placeholder';
const DECLARED_CRITERION = 'criterion of the hypothesis, as declared';
const FIRST_DECLARED_HYPOTHESIS = 'hypothesis-placeholder-a';
const SECOND_DECLARED_HYPOTHESIS = 'hypothesis-placeholder-b';
const HYPOTHESIS_OUTCOME = 'outcome-placeholder-a';
const HYPOTHESIS_ACTION = 'action-placeholder-a';
const HYPOTHESIS_RECIPIENT = 'recipient-placeholder-a';
const NO_DATA_OUTCOME = 'outcome-placeholder-b';
const NO_DATA_ACTION = 'action-placeholder-b';
const NO_DATA_RECIPIENT = 'recipient-placeholder-b';
const EXHAUSTED_OUTCOME = 'outcome-placeholder-c';
const EXHAUSTED_ACTION = 'action-placeholder-c';
const EXHAUSTED_RECIPIENT = 'recipient-placeholder-c';

/**
 * The rule the first-produced refusal names comes after the second's in
 * lexicographic order on purpose: an answer sorted on the way through reads
 * back in an order no check produced
 * (the run answers in registration order, then production order).
 */
const FIRST_PRODUCED_RULE = 'rule-placeholder-b';
const SECOND_PRODUCED_RULE = 'rule-placeholder-a';
const THIRD_PRODUCED_RULE = 'rule-placeholder-c';
const FIRST_OFFENDED_TERM = 'offended-term-placeholder-a';
const SECOND_OFFENDED_TERM = 'offended-term-placeholder-b';
const FIRST_REFUSAL_TEXT = '  text for the curator, first refusal as produced\n  second line as produced  ';
const SECOND_REFUSAL_TEXT = 'text for the curator, second refusal as produced';
const THIRD_REFUSAL_TEXT = 'text for the curator, third refusal as produced';
const CHANGED_REFUSAL_TEXT = 'text-placeholder-changed';

/**
 * A fresh case under edit per call, so a test that changes a value changes
 * no other test's arrangement. The run copies nothing of the case and reads
 * none of its parts, so the parts here only have to be a whole case; the
 * whole-case test compares what a check saw against a fresh one of these.
 */
function draftCaseParts() {
  return {
    slug: DECLARED_SLUG,
    title: DECLARED_TITLE,
    whenToUse: DECLARED_WHEN_TO_USE,
    subjectType: DECLARED_SUBJECT_TYPE,
    hypotheses: [
      {
        name: FIRST_DECLARED_HYPOTHESIS,
        collects: [DECLARED_CONCEPT],
        confirmsWhen: DECLARED_CRITERION,
        resolution: {
          outcome: HYPOTHESIS_OUTCOME,
          referral: { action: HYPOTHESIS_ACTION, recipient: HYPOTHESIS_RECIPIENT },
        },
      },
      {
        name: SECOND_DECLARED_HYPOTHESIS,
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
  };
}

/**
 * The refusals the demonstration checks produce, each carrying the whole
 * construct — the rule that refused, the position where it sits, the text
 * for the curator — fresh per call so no test reads another's object.
 */
function firstProducedRefusal() {
  return {
    rule: FIRST_PRODUCED_RULE,
    hypothesis: FIRST_DECLARED_HYPOTHESIS,
    offendedTerm: FIRST_OFFENDED_TERM,
    text: FIRST_REFUSAL_TEXT,
  };
}

function secondProducedRefusal() {
  return {
    rule: SECOND_PRODUCED_RULE,
    hypothesis: SECOND_DECLARED_HYPOTHESIS,
    offendedTerm: SECOND_OFFENDED_TERM,
    text: SECOND_REFUSAL_TEXT,
  };
}

function thirdProducedRefusal() {
  return {
    rule: THIRD_PRODUCED_RULE,
    hypothesis: FIRST_DECLARED_HYPOTHESIS,
    offendedTerm: SECOND_OFFENDED_TERM,
    text: THIRD_REFUSAL_TEXT,
  };
}

function refusingNothing(): PublicationCheck {
  return () => [];
}

function producing(...refusals: Refusal[]): PublicationCheck {
  return () => refusals;
}

describe('validate', () => {
  it('answers no refusal for a case when no check is registered', () => {
    // arrange
    const draft = draftCaseParts();
    const checks: PublicationCheck[] = [];

    // act
    const answered = validate(draft, checks);

    // assert
    assert.deepEqual(answered, []);
  });

  it('answers no refusal when every registered check refuses nothing', () => {
    // arrange
    const draft = draftCaseParts();
    const checks = [refusingNothing(), refusingNothing()];

    // act
    const answered = validate(draft, checks);

    // assert
    assert.deepEqual(answered, []);
  });

  it('refuses the case it is given when its one registered check refuses it', () => {
    // arrange
    const draft = draftCaseParts();
    const checks = [producing(firstProducedRefusal())];

    // act
    const answered = validate(draft, checks);

    // assert
    assert.notEqual(answered.length, 0);
  });

  it('reports both refusals when two registered checks both refuse the case', () => {
    // arrange
    const draft = draftCaseParts();
    const checks = [producing(firstProducedRefusal()), producing(secondProducedRefusal())];

    // act
    const answered = validate(draft, checks);

    // assert
    assert.deepEqual(answered, [firstProducedRefusal(), secondProducedRefusal()]);
  });

  it('reports no refusal that no registered check produced', () => {
    // arrange
    //
    // Checks refusing nothing surround the one refusing check, so anything in
    // the answer beyond the one refusal produced is a refusal the run invented.
    const draft = draftCaseParts();
    const checks = [refusingNothing(), producing(firstProducedRefusal()), refusingNothing()];

    // act
    const answered = validate(draft, checks);

    // assert
    assert.deepEqual(answered, [firstProducedRefusal()]);
  });

  it('reports the two refusals one check produced at two positions as two, never one', () => {
    // arrange
    //
    // One rule and one text at two positions: the two-positions rule makes
    // these two refusals, so an answer that merged, deduplicated or collapsed
    // what one check produced reads back one where two were produced.
    const atFirstPosition = {
      rule: FIRST_PRODUCED_RULE,
      hypothesis: FIRST_DECLARED_HYPOTHESIS,
      offendedTerm: FIRST_OFFENDED_TERM,
      text: FIRST_REFUSAL_TEXT,
    };
    const atSecondPosition = {
      rule: FIRST_PRODUCED_RULE,
      hypothesis: SECOND_DECLARED_HYPOTHESIS,
      offendedTerm: SECOND_OFFENDED_TERM,
      text: FIRST_REFUSAL_TEXT,
    };
    const checks = [producing(atFirstPosition, atSecondPosition)];

    // act
    const answered = validate(draftCaseParts(), checks);

    // assert
    assert.deepEqual(answered, [atFirstPosition, atSecondPosition]);
  });

  it('keeps two interchangeable refusals produced by two checks as two, one per production', () => {
    // arrange
    //
    // A refusal is a value object, so these two are field-for-field the same
    // refusal; the every-refusal rule has the count answered equal the count
    // produced, so an answer deduplicating by value reads back one.
    const checks = [producing(firstProducedRefusal()), producing(firstProducedRefusal())];

    // act
    const answered = validate(draftCaseParts(), checks);

    // assert
    assert.deepEqual(answered, [firstProducedRefusal(), firstProducedRefusal()]);
  });

  it('answers a refusal carrying the rule that refused, the position where it sits, and the text for the curator', () => {
    // arrange
    const checks = [producing(firstProducedRefusal())];

    // act
    const answered = validate(draftCaseParts(), checks);

    // assert
    assert.deepEqual(answered[0], {
      rule: FIRST_PRODUCED_RULE,
      hypothesis: FIRST_DECLARED_HYPOTHESIS,
      offendedTerm: FIRST_OFFENDED_TERM,
      text: FIRST_REFUSAL_TEXT,
    });
  });

  it('answers the collected refusals themselves as the whole of its answer', () => {
    // arrange
    //
    // Pins the implementation's recorded inference that the answer is the
    // refusal list and nothing beside it — the case is refused exactly when
    // that list is non-empty, and no separate verdict value is answered.
    const checks = [producing(firstProducedRefusal())];

    // act
    const answered = validate(draftCaseParts(), checks);

    // assert
    assert.deepEqual(answered, [firstProducedRefusal()]);
  });

  it('hands each registered check the whole case under edit it was given', () => {
    // arrange
    const draft = draftCaseParts();
    const casesSeen: DraftCase[] = [];
    const recording: PublicationCheck = (candidate) => {
      casesSeen.push(candidate);
      return [];
    };

    // act
    validate(draft, [recording, recording]);

    // assert
    assert.deepEqual(casesSeen, [draftCaseParts(), draftCaseParts()]);
  });

  it('answers refusals in check-registration order and, within one check, in the order produced', () => {
    // arrange
    //
    // Within the first check the produced order disagrees with the
    // lexicographic order of the rule names, so an answer sorted on the way
    // through fails here on its own; a second check pins registration order.
    const checks = [
      producing(firstProducedRefusal(), secondProducedRefusal()),
      producing(thirdProducedRefusal()),
    ];

    // act
    const answered = validate(draftCaseParts(), checks);

    // assert
    assert.deepEqual(
      answered.map((refusal) => refusal.rule),
      [FIRST_PRODUCED_RULE, SECOND_PRODUCED_RULE, THIRD_PRODUCED_RULE],
    );
  });

  it('reads back the refusal a check produced even after the value the check returned is changed', () => {
    // arrange
    const producedRefusal = {
      rule: FIRST_PRODUCED_RULE,
      hypothesis: FIRST_DECLARED_HYPOTHESIS,
      offendedTerm: FIRST_OFFENDED_TERM,
      text: FIRST_REFUSAL_TEXT,
    };
    const answered = validate(draftCaseParts(), [producing(producedRefusal)]);

    // act
    producedRefusal.text = CHANGED_REFUSAL_TEXT;

    // assert
    assert.equal(answered[0]?.text, FIRST_REFUSAL_TEXT);
  });

  it('answers the refusal a check produced over a case declaring no hypothesis at all', () => {
    // arrange
    //
    // The malformed case every check must walk is representable as validation
    // input — the implementation's disclosed divergence from the draft-case
    // node's one-hypothesis minimum — and a refusal over it names no
    // position, so both position parts stay exactly as produced: absent.
    const caseWithoutHypotheses = { ...draftCaseParts(), hypotheses: [] };
    const positionlessRefusal = { rule: FIRST_PRODUCED_RULE, text: FIRST_REFUSAL_TEXT };
    const checks = [producing(positionlessRefusal)];

    // act
    const answered = validate(caseWithoutHypotheses, checks);

    // assert
    assert.deepEqual(answered, [
      {
        rule: FIRST_PRODUCED_RULE,
        hypothesis: undefined,
        offendedTerm: undefined,
        text: FIRST_REFUSAL_TEXT,
      },
    ]);
  });
});
