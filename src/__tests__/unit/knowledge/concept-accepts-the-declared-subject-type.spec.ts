import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Concept } from '../../../glossary/concept';
import type { PublishedGlossary } from '../../../glossary/lookup';
import { createConceptAcceptsTheDeclaredSubjectTypeCheck } from '../../../knowledge/concept-accepts-the-declared-subject-type';
import type { DraftCase } from '../../../knowledge/draft-case';
import type { Hypothesis } from '../../../knowledge/hypothesis';
import type { PublicationCheck } from '../../../knowledge/validation';
import { validate } from '../../../knowledge/validation';

/**
 * Proves `task/case-validator/concept-accepts-the-subject-type` over
 * `src/knowledge/concept-accepts-the-declared-subject-type.ts`.
 *
 * Every name below is a placeholder, chosen only to be distinguishable from
 * the next one. The subject-type and concept vocabularies are open, and
 * nothing below asserts which members of either exist — each glossary a test
 * hands the check is arranged data standing where a published glossary would
 * stand.
 *
 * The binding left the hypothesis's other fields — confirmsWhen and
 * resolution — and the case's own title, whenToUse and fallbacks unbound:
 * this check reads only draftCase.subjectType and
 * draftCase.hypotheses[].collects, so every value built below carries just
 * enough shape to be one case or one hypothesis, never asserted on its own.
 */
const DECLARED_SLUG = 'case-slug-placeholder';
const DECLARED_TITLE = 'title placeholder as declared';
const DECLARED_WHEN_TO_USE = 'when to use it, as declared';
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

const DECLARED_SUBJECT_TYPE = 'subject-type-placeholder-declared';
const OTHER_SUBJECT_TYPE = 'subject-type-placeholder-other';
const THIRD_SUBJECT_TYPE = 'subject-type-placeholder-third';
const EMPTY_SUBJECT_TYPE = '';

const ACCEPTING_CONCEPT_NAME = 'concept-placeholder-accepting';
const NON_ACCEPTING_CONCEPT_NAME = 'concept-placeholder-non-accepting';
const SECOND_NON_ACCEPTING_CONCEPT_NAME = 'concept-placeholder-non-accepting-second';
const MULTI_ACCEPTS_CONCEPT_NAME = 'concept-placeholder-multi-accepts';
const UNPUBLISHED_CONCEPT_NAME = 'concept-placeholder-unpublished';

const FIRST_HYPOTHESIS_NAME = 'hypothesis-placeholder-a';
const SECOND_HYPOTHESIS_NAME = 'hypothesis-placeholder-b';

const NEUTRAL_TTL = 1;

/**
 * The rule node's own path and its own stated requirement
 * (rule/knowledge/concept-accepts-the-declared-subject-type), quoted rather
 * than reworded — the same values the implementation record cites as what
 * the refusal names.
 */
const RULE_IDENTIFIER = 'rule/knowledge/concept-accepts-the-declared-subject-type';
const REFUSAL_TEXT = 'Every concept a case collects MUST accept the type of subject that case declares.';

const COMPANION_RULE = 'rule-placeholder-companion';
const COMPANION_TEXT = 'text-placeholder-companion';

/**
 * A fresh concept record per call, carrying only the fields this check
 * reads (name, accepts) plus the two the Concept shape still requires
 * (ttl, observationFields), filled with neutral values this check never
 * inspects.
 */
function concept(name: string, accepts: readonly string[]): Concept {
  return { name, accepts, ttl: NEUTRAL_TTL, observationFields: [] };
}

/**
 * A fresh glossary per call, publishing exactly the concepts handed in and
 * nothing of the other four kinds — this check never reads them.
 */
function glossary(concepts: readonly Concept[]): PublishedGlossary {
  return { concepts, subjectTypes: [], outcomes: [], actions: [], recipients: [] };
}

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
 * A fresh draft case per call, built from whatever subject type and
 * hypotheses the test hands in, so no test's case shares state with
 * another's.
 */
function draftCase(subjectType: string, hypotheses: readonly Hypothesis[]): DraftCase {
  return {
    slug: DECLARED_SLUG,
    title: DECLARED_TITLE,
    whenToUse: DECLARED_WHEN_TO_USE,
    subjectType,
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

describe('createConceptAcceptsTheDeclaredSubjectTypeCheck', () => {
  it("refuses a case collecting one concept that does not accept the case's declared subject type", () => {
    // arrange
    const nonAccepting = concept(NON_ACCEPTING_CONCEPT_NAME, [OTHER_SUBJECT_TYPE]);
    const check = createConceptAcceptsTheDeclaredSubjectTypeCheck(glossary([nonAccepting]));
    const draft = draftCase(DECLARED_SUBJECT_TYPE, [
      hypothesis(FIRST_HYPOTHESIS_NAME, [NON_ACCEPTING_CONCEPT_NAME]),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.notEqual(answered.length, 0);
  });

  it('answers the refusal naming the rule, the offending hypothesis and concept, and the rule\'s own stated text', () => {
    // arrange
    const nonAccepting = concept(NON_ACCEPTING_CONCEPT_NAME, [OTHER_SUBJECT_TYPE]);
    const check = createConceptAcceptsTheDeclaredSubjectTypeCheck(glossary([nonAccepting]));
    const draft = draftCase(DECLARED_SUBJECT_TYPE, [
      hypothesis(FIRST_HYPOTHESIS_NAME, [NON_ACCEPTING_CONCEPT_NAME]),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      {
        rule: RULE_IDENTIFIER,
        hypothesis: FIRST_HYPOTHESIS_NAME,
        offendedTerm: NON_ACCEPTING_CONCEPT_NAME,
        text: REFUSAL_TEXT,
      },
    ]);
  });

  it("does not refuse a case whose every collected concept accepts the case's declared subject type", () => {
    // arrange
    const accepting = concept(ACCEPTING_CONCEPT_NAME, [DECLARED_SUBJECT_TYPE]);
    const check = createConceptAcceptsTheDeclaredSubjectTypeCheck(glossary([accepting]));
    const draft = draftCase(DECLARED_SUBJECT_TYPE, [
      hypothesis(FIRST_HYPOTHESIS_NAME, [ACCEPTING_CONCEPT_NAME]),
      hypothesis(SECOND_HYPOTHESIS_NAME, [ACCEPTING_CONCEPT_NAME, ACCEPTING_CONCEPT_NAME]),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('does not refuse a case collecting a concept that accepts several subject types including the declared one', () => {
    // arrange
    const multiAccepts = concept(MULTI_ACCEPTS_CONCEPT_NAME, [
      OTHER_SUBJECT_TYPE,
      DECLARED_SUBJECT_TYPE,
      THIRD_SUBJECT_TYPE,
    ]);
    const check = createConceptAcceptsTheDeclaredSubjectTypeCheck(glossary([multiAccepts]));
    const draft = draftCase(DECLARED_SUBJECT_TYPE, [
      hypothesis(FIRST_HYPOTHESIS_NAME, [MULTI_ACCEPTS_CONCEPT_NAME]),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('refuses only the hypothesis whose collected concept does not accept the subject type, leaving the hypothesis whose concept accepts it unrefused', () => {
    // arrange
    const accepting = concept(ACCEPTING_CONCEPT_NAME, [DECLARED_SUBJECT_TYPE]);
    const nonAccepting = concept(NON_ACCEPTING_CONCEPT_NAME, [OTHER_SUBJECT_TYPE]);
    const check = createConceptAcceptsTheDeclaredSubjectTypeCheck(
      glossary([accepting, nonAccepting]),
    );
    const draft = draftCase(DECLARED_SUBJECT_TYPE, [
      hypothesis(FIRST_HYPOTHESIS_NAME, [ACCEPTING_CONCEPT_NAME]),
      hypothesis(SECOND_HYPOTHESIS_NAME, [NON_ACCEPTING_CONCEPT_NAME]),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      {
        rule: RULE_IDENTIFIER,
        hypothesis: SECOND_HYPOTHESIS_NAME,
        offendedTerm: NON_ACCEPTING_CONCEPT_NAME,
        text: REFUSAL_TEXT,
      },
    ]);
  });

  it('refuses only the concept within one hypothesis that does not accept the subject type, not the concept that does', () => {
    // arrange
    const accepting = concept(ACCEPTING_CONCEPT_NAME, [DECLARED_SUBJECT_TYPE]);
    const nonAccepting = concept(NON_ACCEPTING_CONCEPT_NAME, [OTHER_SUBJECT_TYPE]);
    const check = createConceptAcceptsTheDeclaredSubjectTypeCheck(
      glossary([accepting, nonAccepting]),
    );
    const draft = draftCase(DECLARED_SUBJECT_TYPE, [
      hypothesis(FIRST_HYPOTHESIS_NAME, [ACCEPTING_CONCEPT_NAME, NON_ACCEPTING_CONCEPT_NAME]),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      {
        rule: RULE_IDENTIFIER,
        hypothesis: FIRST_HYPOTHESIS_NAME,
        offendedTerm: NON_ACCEPTING_CONCEPT_NAME,
        text: REFUSAL_TEXT,
      },
    ]);
  });

  it('produces one refusal per offending concept, in the order collected, when a hypothesis collects two concepts that both do not accept the subject type', () => {
    // arrange
    const firstNonAccepting = concept(NON_ACCEPTING_CONCEPT_NAME, [OTHER_SUBJECT_TYPE]);
    const secondNonAccepting = concept(SECOND_NON_ACCEPTING_CONCEPT_NAME, [OTHER_SUBJECT_TYPE]);
    const check = createConceptAcceptsTheDeclaredSubjectTypeCheck(
      glossary([firstNonAccepting, secondNonAccepting]),
    );
    const draft = draftCase(DECLARED_SUBJECT_TYPE, [
      hypothesis(FIRST_HYPOTHESIS_NAME, [
        NON_ACCEPTING_CONCEPT_NAME,
        SECOND_NON_ACCEPTING_CONCEPT_NAME,
      ]),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      {
        rule: RULE_IDENTIFIER,
        hypothesis: FIRST_HYPOTHESIS_NAME,
        offendedTerm: NON_ACCEPTING_CONCEPT_NAME,
        text: REFUSAL_TEXT,
      },
      {
        rule: RULE_IDENTIFIER,
        hypothesis: FIRST_HYPOTHESIS_NAME,
        offendedTerm: SECOND_NON_ACCEPTING_CONCEPT_NAME,
        text: REFUSAL_TEXT,
      },
    ]);
  });

  it('produces no refusal for a concept a hypothesis collects that the given glossary does not publish', () => {
    // arrange
    //
    // Proves the implementation's own recorded inference: an unpublished
    // concept has no accepts list to consult, and the refusal for an absent
    // term belongs to the terms-exist-in-the-glossary check, not this one.
    const check = createConceptAcceptsTheDeclaredSubjectTypeCheck(glossary([]));
    const draft = draftCase(DECLARED_SUBJECT_TYPE, [
      hypothesis(FIRST_HYPOTHESIS_NAME, [UNPUBLISHED_CONCEPT_NAME]),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('freezes the array it answers with on the refusing path', () => {
    // arrange
    const nonAccepting = concept(NON_ACCEPTING_CONCEPT_NAME, [OTHER_SUBJECT_TYPE]);
    const check = createConceptAcceptsTheDeclaredSubjectTypeCheck(glossary([nonAccepting]));
    const draft = draftCase(DECLARED_SUBJECT_TYPE, [
      hypothesis(FIRST_HYPOTHESIS_NAME, [NON_ACCEPTING_CONCEPT_NAME]),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.equal(Object.isFrozen(answered), true);
  });

  it('freezes the array it answers with on the passing path', () => {
    // arrange
    const accepting = concept(ACCEPTING_CONCEPT_NAME, [DECLARED_SUBJECT_TYPE]);
    const check = createConceptAcceptsTheDeclaredSubjectTypeCheck(glossary([accepting]));
    const draft = draftCase(DECLARED_SUBJECT_TYPE, [
      hypothesis(FIRST_HYPOTHESIS_NAME, [ACCEPTING_CONCEPT_NAME]),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.equal(Object.isFrozen(answered), true);
  });

  it('walks a case declaring no hypotheses without throwing, answering no refusal', () => {
    // arrange
    //
    // Excludes the binding's UNDERDETERMINED implementation over this
    // malformed aspect: a check that throws or halts on a case with no
    // hypotheses would fail this test by raising rather than by answering
    // the wrong value.
    const check = createConceptAcceptsTheDeclaredSubjectTypeCheck(glossary([]));
    const draft = draftCase(DECLARED_SUBJECT_TYPE, []);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('walks a hypothesis whose collects list is empty without throwing, answering no refusal for it', () => {
    // arrange
    //
    // Excludes the binding's UNDERDETERMINED implementation over this
    // malformed aspect: a check that throws or halts on an empty collects
    // list would fail this test by raising rather than by answering the
    // wrong value.
    const check = createConceptAcceptsTheDeclaredSubjectTypeCheck(glossary([]));
    const draft = draftCase(DECLARED_SUBJECT_TYPE, [
      hypothesis(FIRST_HYPOTHESIS_NAME, []),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('walks a case whose declared subject type is empty without throwing, still comparing it against each collected concept', () => {
    // arrange
    //
    // Excludes the binding's UNDERDETERMINED implementation over this
    // malformed aspect: a check that throws or halts on an empty subject
    // type would fail this test by raising rather than by answering the
    // wrong value. The empty string is not published by any concept's
    // accepts list built below, so the comparison still proceeds and
    // refuses exactly as it would for any other subject type this
    // concept's accepts list excludes.
    const nonAccepting = concept(NON_ACCEPTING_CONCEPT_NAME, [OTHER_SUBJECT_TYPE]);
    const check = createConceptAcceptsTheDeclaredSubjectTypeCheck(glossary([nonAccepting]));
    const draft = draftCase(EMPTY_SUBJECT_TYPE, [
      hypothesis(FIRST_HYPOTHESIS_NAME, [NON_ACCEPTING_CONCEPT_NAME]),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      {
        rule: RULE_IDENTIFIER,
        hypothesis: FIRST_HYPOTHESIS_NAME,
        offendedTerm: NON_ACCEPTING_CONCEPT_NAME,
        text: REFUSAL_TEXT,
      },
    ]);
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
    const check = createConceptAcceptsTheDeclaredSubjectTypeCheck(glossary([]));
    const draft = draftCase(DECLARED_SUBJECT_TYPE, []);
    const companion: PublicationCheck = () => [{ rule: COMPANION_RULE, text: COMPANION_TEXT }];

    // act
    const answered = validate(draft, [check, companion]);

    // assert
    assert.deepEqual(answered, [
      { rule: COMPANION_RULE, hypothesis: undefined, offendedTerm: undefined, text: COMPANION_TEXT },
    ]);
  });
});
