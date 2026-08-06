import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Concept } from '../../../glossary/concept';
import type { PublishedGlossary } from '../../../glossary/lookup';
import { createCaseTermsExistInTheGlossaryCheck } from '../../../knowledge/case-terms-exist-in-the-glossary';
import type { DraftCase } from '../../../knowledge/draft-case';
import type { Hypothesis } from '../../../knowledge/hypothesis';
import type { Resolution } from '../../../knowledge/resolution';
import type { PublicationCheck } from '../../../knowledge/validation';
import { validate } from '../../../knowledge/validation';

/**
 * Proves `task/case-validator/terms-exist-in-the-glossary` over
 * `src/knowledge/case-terms-exist-in-the-glossary.ts`.
 *
 * Every name below is a placeholder, chosen only to be distinguishable from
 * the next one. All five vocabularies (subject type, concept, outcome,
 * action, recipient) are open, and nothing below asserts which members of
 * any of them exist — each glossary a test hands the check is arranged data
 * standing where a published glossary would stand.
 *
 * The baseline case and baseline glossary below name every term this check
 * reads and publish every one of them; each test below then unpublishes
 * exactly one term (or leaves a structural part of the case absent) so a
 * failure of the resulting test can be read back to exactly what changed.
 */
const DECLARED_SLUG = 'case-slug-placeholder';
const DECLARED_TITLE = 'title placeholder as declared';
const DECLARED_WHEN_TO_USE = 'when to use it, as declared';
const DECLARED_CRITERION = 'criterion of the hypothesis, as declared';

const PUBLISHED_SUBJECT_TYPE = 'subject-type-placeholder-published';
const UNPUBLISHED_SUBJECT_TYPE = 'subject-type-placeholder-unpublished';

const PUBLISHED_CONCEPT_NAME = 'concept-placeholder-published';
const UNPUBLISHED_CONCEPT_NAME = 'concept-placeholder-unpublished';
const SECOND_UNPUBLISHED_CONCEPT_NAME = 'concept-placeholder-unpublished-second';

const HYPOTHESIS_OUTCOME = 'outcome-placeholder-hypothesis';
const HYPOTHESIS_ACTION = 'action-placeholder-hypothesis';
const HYPOTHESIS_RECIPIENT = 'recipient-placeholder-hypothesis';

const NO_DATA_OUTCOME = 'outcome-placeholder-no-data';
const NO_DATA_ACTION = 'action-placeholder-no-data';
const NO_DATA_RECIPIENT = 'recipient-placeholder-no-data';

const EXHAUSTED_OUTCOME = 'outcome-placeholder-exhausted';
const EXHAUSTED_ACTION = 'action-placeholder-exhausted';
const EXHAUSTED_RECIPIENT = 'recipient-placeholder-exhausted';

const UNPUBLISHED_OUTCOME = 'outcome-placeholder-unpublished';
const UNPUBLISHED_ACTION = 'action-placeholder-unpublished';
const UNPUBLISHED_RECIPIENT = 'recipient-placeholder-unpublished';

const FIRST_HYPOTHESIS_NAME = 'hypothesis-placeholder-a';
const SECOND_HYPOTHESIS_NAME = 'hypothesis-placeholder-b';

/**
 * The rule node's own path and its own stated requirement
 * (rule/knowledge/case-terms-exist-in-the-glossary), quoted rather than
 * reworded — the same values the implementation record cites as what every
 * refusal this check produces names.
 */
const RULE_IDENTIFIER = 'rule/knowledge/case-terms-exist-in-the-glossary';
const REFUSAL_TEXT =
  'Every subject type, concept, outcome, action and recipient a case names MUST exist in the glossary.';

const COMPANION_RULE = 'rule-placeholder-companion';
const COMPANION_TEXT = 'text-placeholder-companion';

/**
 * A fresh concept record per call, carrying only the field this check reads
 * (name) plus the fields the Concept shape still requires, filled with
 * neutral values this check never inspects.
 */
function concept(name: string): Concept {
  return { name, accepts: [PUBLISHED_SUBJECT_TYPE], ttl: 1, observationFields: [] };
}

/**
 * A fresh glossary per call, publishing exactly what each test hands in for
 * each of the five kinds.
 */
function glossary(parts: {
  concepts?: readonly Concept[];
  subjectTypes?: readonly string[];
  outcomes?: readonly string[];
  actions?: readonly string[];
  recipients?: readonly string[];
}): PublishedGlossary {
  return {
    concepts: parts.concepts ?? [],
    subjectTypes: parts.subjectTypes ?? [],
    outcomes: parts.outcomes ?? [],
    actions: parts.actions ?? [],
    recipients: parts.recipients ?? [],
  };
}

/**
 * The glossary that publishes every term the baseline case below names —
 * the subject type, the one concept, and the outcome/action/recipient of
 * the hypothesis's own resolution and both fallbacks. A test that wants an
 * unpublished term simply omits that one name from its own glossary.
 */
function baselineGlossary(): PublishedGlossary {
  return glossary({
    concepts: [concept(PUBLISHED_CONCEPT_NAME)],
    subjectTypes: [PUBLISHED_SUBJECT_TYPE],
    outcomes: [HYPOTHESIS_OUTCOME, NO_DATA_OUTCOME, EXHAUSTED_OUTCOME],
    actions: [HYPOTHESIS_ACTION, NO_DATA_ACTION, EXHAUSTED_ACTION],
    recipients: [HYPOTHESIS_RECIPIENT, NO_DATA_RECIPIENT, EXHAUSTED_RECIPIENT],
  });
}

function resolution(outcome: string, action: string, recipient: string): Resolution {
  return { outcome, referral: { action, recipient } };
}

function hypothesis(
  name: string,
  collects: readonly string[],
  hypothesisResolution: Resolution,
): Hypothesis {
  return { name, collects, confirmsWhen: DECLARED_CRITERION, resolution: hypothesisResolution };
}

/**
 * A hypothesis naming every term the baseline glossary publishes, so a test
 * can build one and change exactly one of its terms.
 */
function baselineHypothesis(name: string): Hypothesis {
  return hypothesis(
    name,
    [PUBLISHED_CONCEPT_NAME],
    resolution(HYPOTHESIS_OUTCOME, HYPOTHESIS_ACTION, HYPOTHESIS_RECIPIENT),
  );
}

function baselineNoDataFallback(): Resolution {
  return resolution(NO_DATA_OUTCOME, NO_DATA_ACTION, NO_DATA_RECIPIENT);
}

function baselineExhaustedFallback(): Resolution {
  return resolution(EXHAUSTED_OUTCOME, EXHAUSTED_ACTION, EXHAUSTED_RECIPIENT);
}

function draftCase(
  subjectType: string,
  hypotheses: readonly Hypothesis[],
  noDataFallback: Resolution,
  hypothesesExhaustedFallback: Resolution,
): DraftCase {
  return {
    slug: DECLARED_SLUG,
    title: DECLARED_TITLE,
    whenToUse: DECLARED_WHEN_TO_USE,
    subjectType,
    hypotheses,
    noDataFallback,
    hypothesesExhaustedFallback,
  };
}

/**
 * A fresh, well-formed draft case per call: the given hypotheses over the
 * published subject type, plus both baseline fallbacks.
 */
function baselineDraftCase(hypotheses: readonly Hypothesis[]): DraftCase {
  return draftCase(
    PUBLISHED_SUBJECT_TYPE,
    hypotheses,
    baselineNoDataFallback(),
    baselineExhaustedFallback(),
  );
}

/**
 * A draft case built exactly as draft-case.ts documents as admitted on
 * purpose — missing the no-data fallback altogether — built without the
 * field rather than with a value standing in for its absence.
 */
function draftCaseMissingNoDataFallback(
  hypotheses: readonly Hypothesis[],
  hypothesesExhaustedFallback: Resolution,
): DraftCase {
  return {
    slug: DECLARED_SLUG,
    title: DECLARED_TITLE,
    whenToUse: DECLARED_WHEN_TO_USE,
    subjectType: PUBLISHED_SUBJECT_TYPE,
    hypotheses,
    hypothesesExhaustedFallback,
  } as DraftCase;
}

/** The same malformation as above, missing the hypotheses-exhausted fallback instead. */
function draftCaseMissingHypothesesExhaustedFallback(
  hypotheses: readonly Hypothesis[],
  noDataFallback: Resolution,
): DraftCase {
  return {
    slug: DECLARED_SLUG,
    title: DECLARED_TITLE,
    whenToUse: DECLARED_WHEN_TO_USE,
    subjectType: PUBLISHED_SUBJECT_TYPE,
    hypotheses,
    noDataFallback,
  } as DraftCase;
}

/** A draft case missing its own declared subject type altogether. */
function draftCaseMissingSubjectType(
  hypotheses: readonly Hypothesis[],
  noDataFallback: Resolution,
  hypothesesExhaustedFallback: Resolution,
): DraftCase {
  return {
    slug: DECLARED_SLUG,
    title: DECLARED_TITLE,
    whenToUse: DECLARED_WHEN_TO_USE,
    hypotheses,
    noDataFallback,
    hypothesesExhaustedFallback,
  } as DraftCase;
}

/** The most malformed shape the base's own types admit: no hypotheses and neither fallback declared. */
function draftCaseMissingBothFallbacks(hypotheses: readonly Hypothesis[]): DraftCase {
  return {
    slug: DECLARED_SLUG,
    title: DECLARED_TITLE,
    whenToUse: DECLARED_WHEN_TO_USE,
    subjectType: PUBLISHED_SUBJECT_TYPE,
    hypotheses,
  } as DraftCase;
}

describe('createCaseTermsExistInTheGlossaryCheck', () => {
  it('refuses a case collecting a concept the glossary does not publish, while every other named term is left unrefused', () => {
    // arrange
    const draft = baselineDraftCase([
      hypothesis(
        FIRST_HYPOTHESIS_NAME,
        [UNPUBLISHED_CONCEPT_NAME],
        resolution(HYPOTHESIS_OUTCOME, HYPOTHESIS_ACTION, HYPOTHESIS_RECIPIENT),
      ),
    ]);
    const check = createCaseTermsExistInTheGlossaryCheck(baselineGlossary());

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      {
        rule: RULE_IDENTIFIER,
        hypothesis: FIRST_HYPOTHESIS_NAME,
        offendedTerm: UNPUBLISHED_CONCEPT_NAME,
        text: REFUSAL_TEXT,
      },
    ]);
  });

  it("refuses a case whose hypothesis's resolution names an outcome the glossary does not publish, while every other named term is left unrefused", () => {
    // arrange
    const draft = baselineDraftCase([
      hypothesis(
        FIRST_HYPOTHESIS_NAME,
        [PUBLISHED_CONCEPT_NAME],
        resolution(UNPUBLISHED_OUTCOME, HYPOTHESIS_ACTION, HYPOTHESIS_RECIPIENT),
      ),
    ]);
    const check = createCaseTermsExistInTheGlossaryCheck(baselineGlossary());

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      {
        rule: RULE_IDENTIFIER,
        hypothesis: FIRST_HYPOTHESIS_NAME,
        offendedTerm: UNPUBLISHED_OUTCOME,
        text: REFUSAL_TEXT,
      },
    ]);
  });

  it("refuses a case whose hypothesis's referral names an action the glossary does not publish, while every other named term is left unrefused", () => {
    // arrange
    const draft = baselineDraftCase([
      hypothesis(
        FIRST_HYPOTHESIS_NAME,
        [PUBLISHED_CONCEPT_NAME],
        resolution(HYPOTHESIS_OUTCOME, UNPUBLISHED_ACTION, HYPOTHESIS_RECIPIENT),
      ),
    ]);
    const check = createCaseTermsExistInTheGlossaryCheck(baselineGlossary());

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      {
        rule: RULE_IDENTIFIER,
        hypothesis: FIRST_HYPOTHESIS_NAME,
        offendedTerm: UNPUBLISHED_ACTION,
        text: REFUSAL_TEXT,
      },
    ]);
  });

  it("refuses a case whose hypothesis's referral names a recipient the glossary does not publish, while every other named term is left unrefused", () => {
    // arrange
    const draft = baselineDraftCase([
      hypothesis(
        FIRST_HYPOTHESIS_NAME,
        [PUBLISHED_CONCEPT_NAME],
        resolution(HYPOTHESIS_OUTCOME, HYPOTHESIS_ACTION, UNPUBLISHED_RECIPIENT),
      ),
    ]);
    const check = createCaseTermsExistInTheGlossaryCheck(baselineGlossary());

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      {
        rule: RULE_IDENTIFIER,
        hypothesis: FIRST_HYPOTHESIS_NAME,
        offendedTerm: UNPUBLISHED_RECIPIENT,
        text: REFUSAL_TEXT,
      },
    ]);
  });

  it('refuses a case declaring a subject type the glossary does not publish, while every other named term is left unrefused', () => {
    // arrange
    const draft = draftCase(
      UNPUBLISHED_SUBJECT_TYPE,
      [baselineHypothesis(FIRST_HYPOTHESIS_NAME)],
      baselineNoDataFallback(),
      baselineExhaustedFallback(),
    );
    const check = createCaseTermsExistInTheGlossaryCheck(baselineGlossary());

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      {
        rule: RULE_IDENTIFIER,
        hypothesis: undefined,
        offendedTerm: UNPUBLISHED_SUBJECT_TYPE,
        text: REFUSAL_TEXT,
      },
    ]);
  });

  it('does not refuse a case whose every named term — subject type, collected concept, and every resolution\'s outcome, action and recipient — the glossary publishes under the kind it is used as', () => {
    // arrange
    const draft = baselineDraftCase([
      baselineHypothesis(FIRST_HYPOTHESIS_NAME),
      baselineHypothesis(SECOND_HYPOTHESIS_NAME),
    ]);
    const check = createCaseTermsExistInTheGlossaryCheck(baselineGlossary());

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('refuses a case whose no-data fallback names an outcome the glossary does not publish, while every hypothesis and the hypotheses-exhausted fallback are left unrefused', () => {
    // arrange
    const draft = draftCase(
      PUBLISHED_SUBJECT_TYPE,
      [baselineHypothesis(FIRST_HYPOTHESIS_NAME)],
      resolution(UNPUBLISHED_OUTCOME, NO_DATA_ACTION, NO_DATA_RECIPIENT),
      baselineExhaustedFallback(),
    );
    const check = createCaseTermsExistInTheGlossaryCheck(baselineGlossary());

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      { rule: RULE_IDENTIFIER, hypothesis: undefined, offendedTerm: UNPUBLISHED_OUTCOME, text: REFUSAL_TEXT },
    ]);
  });

  it('refuses a case whose hypotheses-exhausted fallback names an outcome the glossary does not publish, while every hypothesis and the no-data fallback are left unrefused', () => {
    // arrange
    const draft = draftCase(
      PUBLISHED_SUBJECT_TYPE,
      [baselineHypothesis(FIRST_HYPOTHESIS_NAME)],
      baselineNoDataFallback(),
      resolution(UNPUBLISHED_OUTCOME, EXHAUSTED_ACTION, EXHAUSTED_RECIPIENT),
    );
    const check = createCaseTermsExistInTheGlossaryCheck(baselineGlossary());

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      { rule: RULE_IDENTIFIER, hypothesis: undefined, offendedTerm: UNPUBLISHED_OUTCOME, text: REFUSAL_TEXT },
    ]);
  });

  it('refuses a case whose no-data fallback names an action the glossary does not publish, while every hypothesis and the hypotheses-exhausted fallback are left unrefused', () => {
    // arrange
    const draft = draftCase(
      PUBLISHED_SUBJECT_TYPE,
      [baselineHypothesis(FIRST_HYPOTHESIS_NAME)],
      resolution(NO_DATA_OUTCOME, UNPUBLISHED_ACTION, NO_DATA_RECIPIENT),
      baselineExhaustedFallback(),
    );
    const check = createCaseTermsExistInTheGlossaryCheck(baselineGlossary());

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      { rule: RULE_IDENTIFIER, hypothesis: undefined, offendedTerm: UNPUBLISHED_ACTION, text: REFUSAL_TEXT },
    ]);
  });

  it('refuses a case whose hypotheses-exhausted fallback names an action the glossary does not publish, while every hypothesis and the no-data fallback are left unrefused', () => {
    // arrange
    const draft = draftCase(
      PUBLISHED_SUBJECT_TYPE,
      [baselineHypothesis(FIRST_HYPOTHESIS_NAME)],
      baselineNoDataFallback(),
      resolution(EXHAUSTED_OUTCOME, UNPUBLISHED_ACTION, EXHAUSTED_RECIPIENT),
    );
    const check = createCaseTermsExistInTheGlossaryCheck(baselineGlossary());

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      { rule: RULE_IDENTIFIER, hypothesis: undefined, offendedTerm: UNPUBLISHED_ACTION, text: REFUSAL_TEXT },
    ]);
  });

  it('refuses a case whose no-data fallback names a recipient the glossary does not publish, while every hypothesis and the hypotheses-exhausted fallback are left unrefused', () => {
    // arrange
    const draft = draftCase(
      PUBLISHED_SUBJECT_TYPE,
      [baselineHypothesis(FIRST_HYPOTHESIS_NAME)],
      resolution(NO_DATA_OUTCOME, NO_DATA_ACTION, UNPUBLISHED_RECIPIENT),
      baselineExhaustedFallback(),
    );
    const check = createCaseTermsExistInTheGlossaryCheck(baselineGlossary());

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      { rule: RULE_IDENTIFIER, hypothesis: undefined, offendedTerm: UNPUBLISHED_RECIPIENT, text: REFUSAL_TEXT },
    ]);
  });

  it('refuses a case whose hypotheses-exhausted fallback names a recipient the glossary does not publish, while every hypothesis and the no-data fallback are left unrefused', () => {
    // arrange
    const draft = draftCase(
      PUBLISHED_SUBJECT_TYPE,
      [baselineHypothesis(FIRST_HYPOTHESIS_NAME)],
      baselineNoDataFallback(),
      resolution(EXHAUSTED_OUTCOME, EXHAUSTED_ACTION, UNPUBLISHED_RECIPIENT),
    );
    const check = createCaseTermsExistInTheGlossaryCheck(baselineGlossary());

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      { rule: RULE_IDENTIFIER, hypothesis: undefined, offendedTerm: UNPUBLISHED_RECIPIENT, text: REFUSAL_TEXT },
    ]);
  });

  it('produces one refusal per unpublished concept, in the order collected, when a hypothesis collects two concepts the glossary does not publish', () => {
    // arrange
    //
    // Proves the concept loop reads every collected name independently
    // rather than stopping at the first one that is not published.
    const draft = baselineDraftCase([
      hypothesis(
        FIRST_HYPOTHESIS_NAME,
        [UNPUBLISHED_CONCEPT_NAME, SECOND_UNPUBLISHED_CONCEPT_NAME],
        resolution(HYPOTHESIS_OUTCOME, HYPOTHESIS_ACTION, HYPOTHESIS_RECIPIENT),
      ),
    ]);
    const check = createCaseTermsExistInTheGlossaryCheck(baselineGlossary());

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      {
        rule: RULE_IDENTIFIER,
        hypothesis: FIRST_HYPOTHESIS_NAME,
        offendedTerm: UNPUBLISHED_CONCEPT_NAME,
        text: REFUSAL_TEXT,
      },
      {
        rule: RULE_IDENTIFIER,
        hypothesis: FIRST_HYPOTHESIS_NAME,
        offendedTerm: SECOND_UNPUBLISHED_CONCEPT_NAME,
        text: REFUSAL_TEXT,
      },
    ]);
  });

  it('walks a case declaring no hypotheses without throwing, answering no refusal when the subject type and both fallbacks name published terms', () => {
    // arrange
    //
    // Excludes an implementation that throws or halts on a case with no
    // hypotheses: such an implementation would fail this test by raising
    // rather than by answering the wrong value.
    const draft = draftCase(
      PUBLISHED_SUBJECT_TYPE,
      [],
      baselineNoDataFallback(),
      baselineExhaustedFallback(),
    );
    const check = createCaseTermsExistInTheGlossaryCheck(baselineGlossary());

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('walks a case whose no-data fallback is absent without throwing, still refusing the unpublished outcome in the hypotheses-exhausted fallback that is present', () => {
    // arrange
    //
    // Proves the absent fallback is read as nothing to refuse for rather
    // than as a reason to stop reading the fallback that is present.
    const draft = draftCaseMissingNoDataFallback(
      [baselineHypothesis(FIRST_HYPOTHESIS_NAME)],
      resolution(UNPUBLISHED_OUTCOME, EXHAUSTED_ACTION, EXHAUSTED_RECIPIENT),
    );
    const check = createCaseTermsExistInTheGlossaryCheck(baselineGlossary());

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      { rule: RULE_IDENTIFIER, hypothesis: undefined, offendedTerm: UNPUBLISHED_OUTCOME, text: REFUSAL_TEXT },
    ]);
  });

  it('walks a case whose hypotheses-exhausted fallback is absent without throwing, still refusing the unpublished outcome in the no-data fallback that is present', () => {
    // arrange
    //
    // The symmetric case of the previous test, over the other fallback.
    const draft = draftCaseMissingHypothesesExhaustedFallback(
      [baselineHypothesis(FIRST_HYPOTHESIS_NAME)],
      resolution(UNPUBLISHED_OUTCOME, NO_DATA_ACTION, NO_DATA_RECIPIENT),
    );
    const check = createCaseTermsExistInTheGlossaryCheck(baselineGlossary());

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      { rule: RULE_IDENTIFIER, hypothesis: undefined, offendedTerm: UNPUBLISHED_OUTCOME, text: REFUSAL_TEXT },
    ]);
  });

  it('walks a case whose declared subject type is absent without throwing, answering no refusal for it', () => {
    // arrange
    //
    // Proves the implementation's own recorded inference: an absent subject
    // type is read as nothing to refuse for, rather than compared against
    // the glossary and refused as an unpublished term. An implementation
    // that compared `undefined` against the glossary's published names would
    // fail this test by refusing here (with `offendedTerm: undefined`)
    // instead of answering an empty list.
    const draft = draftCaseMissingSubjectType(
      [baselineHypothesis(FIRST_HYPOTHESIS_NAME)],
      baselineNoDataFallback(),
      baselineExhaustedFallback(),
    );
    const check = createCaseTermsExistInTheGlossaryCheck(baselineGlossary());

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('walks a hypothesis whose collects list is empty without throwing, answering no refusal for its concept clause', () => {
    // arrange
    const draft = baselineDraftCase([
      hypothesis(
        FIRST_HYPOTHESIS_NAME,
        [],
        resolution(HYPOTHESIS_OUTCOME, HYPOTHESIS_ACTION, HYPOTHESIS_RECIPIENT),
      ),
    ]);
    const check = createCaseTermsExistInTheGlossaryCheck(baselineGlossary());

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('lets a companion check registered beside it still report its own refusal over a case declaring no hypotheses and missing both fallbacks', () => {
    // arrange
    //
    // Proves this check's safety over the most malformed shape the base's
    // own types admit does not stop validate() from reaching a check
    // registered after it: an implementation that answers its own safety by
    // throwing or exiting would prevent the companion's refusal from ever
    // being answered, so this test fails exactly there.
    const check = createCaseTermsExistInTheGlossaryCheck(baselineGlossary());
    const draft = draftCaseMissingBothFallbacks([]);
    const companion: PublicationCheck = () => [{ rule: COMPANION_RULE, text: COMPANION_TEXT }];

    // act
    const answered = validate(draft, [check, companion]);

    // assert
    assert.deepEqual(answered, [
      { rule: COMPANION_RULE, hypothesis: undefined, offendedTerm: undefined, text: COMPANION_TEXT },
    ]);
  });

  it('answers every refusal in the order the case declares its parts: the subject type, then each hypothesis in turn (its collects then its resolution), then the no-data fallback, then the hypotheses-exhausted fallback', () => {
    // arrange
    //
    // Proves the implementation's own recorded inference about ordering.
    // Six distinct, otherwise-unrelated terms are made unpublished, one per
    // position, so a reordering of any two positions makes this assertion
    // fail rather than merely reordering an already-passing list.
    const orderSubjectType = 'subject-type-placeholder-order-unpublished';
    const orderConcept = 'concept-placeholder-order-unpublished';
    const orderFirstHypothesisOutcome = 'outcome-placeholder-order-first-hypothesis';
    const orderSecondHypothesisAction = 'action-placeholder-order-second-hypothesis';
    const orderNoDataRecipient = 'recipient-placeholder-order-no-data';
    const orderExhaustedOutcome = 'outcome-placeholder-order-exhausted';

    const draft = draftCase(
      orderSubjectType,
      [
        hypothesis(
          FIRST_HYPOTHESIS_NAME,
          [orderConcept],
          resolution(orderFirstHypothesisOutcome, HYPOTHESIS_ACTION, HYPOTHESIS_RECIPIENT),
        ),
        hypothesis(
          SECOND_HYPOTHESIS_NAME,
          [PUBLISHED_CONCEPT_NAME],
          resolution(HYPOTHESIS_OUTCOME, orderSecondHypothesisAction, HYPOTHESIS_RECIPIENT),
        ),
      ],
      resolution(NO_DATA_OUTCOME, NO_DATA_ACTION, orderNoDataRecipient),
      resolution(orderExhaustedOutcome, EXHAUSTED_ACTION, EXHAUSTED_RECIPIENT),
    );
    const check = createCaseTermsExistInTheGlossaryCheck(baselineGlossary());

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      { rule: RULE_IDENTIFIER, hypothesis: undefined, offendedTerm: orderSubjectType, text: REFUSAL_TEXT },
      {
        rule: RULE_IDENTIFIER,
        hypothesis: FIRST_HYPOTHESIS_NAME,
        offendedTerm: orderConcept,
        text: REFUSAL_TEXT,
      },
      {
        rule: RULE_IDENTIFIER,
        hypothesis: FIRST_HYPOTHESIS_NAME,
        offendedTerm: orderFirstHypothesisOutcome,
        text: REFUSAL_TEXT,
      },
      {
        rule: RULE_IDENTIFIER,
        hypothesis: SECOND_HYPOTHESIS_NAME,
        offendedTerm: orderSecondHypothesisAction,
        text: REFUSAL_TEXT,
      },
      { rule: RULE_IDENTIFIER, hypothesis: undefined, offendedTerm: orderNoDataRecipient, text: REFUSAL_TEXT },
      { rule: RULE_IDENTIFIER, hypothesis: undefined, offendedTerm: orderExhaustedOutcome, text: REFUSAL_TEXT },
    ]);
  });
});
