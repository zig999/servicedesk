import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Concept } from '../../../glossary/concept';
import type { PublishedGlossary } from '../../../glossary/lookup';
import { createEveryCollectedConceptDeclaresATtlCheck } from '../../../knowledge/every-collected-concept-declares-a-ttl';
import type { DraftCase } from '../../../knowledge/draft-case';
import type { Hypothesis } from '../../../knowledge/hypothesis';
import type { PublicationCheck } from '../../../knowledge/validation';
import { validate } from '../../../knowledge/validation';

/**
 * Proves `task/case-validator/concept-declares-a-ttl` over
 * `src/knowledge/every-collected-concept-declares-a-ttl.ts`.
 *
 * Every name below is a placeholder, chosen only to be distinguishable from
 * the next one. The subject-type and concept vocabularies are open, and
 * nothing below asserts which members of either exist — each glossary a test
 * hands the check is arranged data standing where a published glossary would
 * stand.
 *
 * The binding left the hypothesis's other fields — confirmsWhen and
 * resolution — and the case's own title, whenToUse, subjectType and
 * fallbacks unbound: this check reads only draftCase.hypotheses[].collects
 * and, through the glossary lookup, whether a collected concept's record
 * carries a ttl field at all, so every value built below carries just enough
 * shape to be one case or one hypothesis, never asserted on its own.
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

const NEUTRAL_ACCEPTS: readonly string[] = [];
const NEUTRAL_TTL = 1;
const SMALL_TTL = 1;
const LARGE_TTL = 1_000_000;
const ZERO_TTL = 0;

const DECLARING_CONCEPT_NAME = 'concept-placeholder-declaring';
const OTHER_DECLARING_CONCEPT_NAME = 'concept-placeholder-declaring-other';
const NOT_DECLARING_CONCEPT_NAME = 'concept-placeholder-not-declaring';
const SECOND_NOT_DECLARING_CONCEPT_NAME = 'concept-placeholder-not-declaring-second';
const ZERO_TTL_CONCEPT_NAME = 'concept-placeholder-zero-ttl';
const UNPUBLISHED_CONCEPT_NAME = 'concept-placeholder-unpublished';

const FIRST_HYPOTHESIS_NAME = 'hypothesis-placeholder-a';
const SECOND_HYPOTHESIS_NAME = 'hypothesis-placeholder-b';

/**
 * The rule node's own path and its own stated requirement
 * (rule/knowledge/every-collected-concept-declares-a-ttl), quoted rather than
 * reworded — the same values the implementation record cites as what the
 * refusal names.
 */
const RULE_IDENTIFIER = 'rule/knowledge/every-collected-concept-declares-a-ttl';
const REFUSAL_TEXT = 'Every concept a case names MUST declare a ttl in the glossary.';

const COMPANION_RULE = 'rule-placeholder-companion';
const COMPANION_TEXT = 'text-placeholder-companion';

/**
 * A fresh concept record per call, declaring the ttl this check must find
 * present, plus the two fields the Concept shape still requires (accepts,
 * observationFields) filled with neutral values this check never inspects.
 */
function conceptWithTtl(name: string, ttl: number): Concept {
  return { name, accepts: NEUTRAL_ACCEPTS, ttl, observationFields: [] };
}

/**
 * A concept record exactly as a glossary might publish one whose ttl was
 * never declared: every field the Concept shape requires except ttl itself,
 * built without it rather than set to a value that stands in for its
 * absence — this check reads presence on the record, so the fixture omits
 * the field outright, the way the implementation's own note treats the
 * type's declared ttl as what a well-formed registration holds rather than
 * as a guarantee this check may lean on.
 */
function conceptWithNoTtl(name: string): Concept {
  return { name, accepts: NEUTRAL_ACCEPTS, observationFields: [] } as Concept;
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

describe('createEveryCollectedConceptDeclaresATtlCheck', () => {
  it('refuses a case collecting one concept that declares no ttl', () => {
    // arrange
    const notDeclaring = conceptWithNoTtl(NOT_DECLARING_CONCEPT_NAME);
    const check = createEveryCollectedConceptDeclaresATtlCheck(glossary([notDeclaring]));
    const draft = draftCase([
      hypothesis(FIRST_HYPOTHESIS_NAME, [NOT_DECLARING_CONCEPT_NAME]),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.notEqual(answered.length, 0);
  });

  it("answers the refusal naming the rule, the offending hypothesis and concept, and the rule's own stated text", () => {
    // arrange
    const notDeclaring = conceptWithNoTtl(NOT_DECLARING_CONCEPT_NAME);
    const check = createEveryCollectedConceptDeclaresATtlCheck(glossary([notDeclaring]));
    const draft = draftCase([
      hypothesis(FIRST_HYPOTHESIS_NAME, [NOT_DECLARING_CONCEPT_NAME]),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      {
        rule: RULE_IDENTIFIER,
        hypothesis: FIRST_HYPOTHESIS_NAME,
        offendedTerm: NOT_DECLARING_CONCEPT_NAME,
        text: REFUSAL_TEXT,
      },
    ]);
  });

  it('does not refuse a case whose every collected concept declares a ttl', () => {
    // arrange
    const declaring = conceptWithTtl(DECLARING_CONCEPT_NAME, NEUTRAL_TTL);
    const check = createEveryCollectedConceptDeclaresATtlCheck(glossary([declaring]));
    const draft = draftCase([
      hypothesis(FIRST_HYPOTHESIS_NAME, [DECLARING_CONCEPT_NAME]),
      hypothesis(SECOND_HYPOTHESIS_NAME, [DECLARING_CONCEPT_NAME, DECLARING_CONCEPT_NAME]),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('does not refuse a case collecting a concept whose declared ttl is zero, deciding on presence rather than the value', () => {
    // arrange
    //
    // Proves the third criterion's presence-only reading: zero is falsy in
    // JavaScript, so a check that tested truthiness instead of presence
    // would wrongly refuse a concept that did declare a ttl of zero.
    const zeroTtl = conceptWithTtl(ZERO_TTL_CONCEPT_NAME, ZERO_TTL);
    const check = createEveryCollectedConceptDeclaresATtlCheck(glossary([zeroTtl]));
    const draft = draftCase([
      hypothesis(FIRST_HYPOTHESIS_NAME, [ZERO_TTL_CONCEPT_NAME]),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it("does not refuse a case whose collected concepts declare different ttl values, proving the check never compares one concept's ttl against another's", () => {
    // arrange
    //
    // Proves the third criterion's second half: a small and a very large
    // declared ttl standing side by side are both simply present, and a
    // check that compared one against the other — or against some implied
    // threshold — would have a reason to refuse one of them here where the
    // criteria give it none.
    const small = conceptWithTtl(DECLARING_CONCEPT_NAME, SMALL_TTL);
    const large = conceptWithTtl(OTHER_DECLARING_CONCEPT_NAME, LARGE_TTL);
    const check = createEveryCollectedConceptDeclaresATtlCheck(glossary([small, large]));
    const draft = draftCase([
      hypothesis(FIRST_HYPOTHESIS_NAME, [DECLARING_CONCEPT_NAME, OTHER_DECLARING_CONCEPT_NAME]),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('refuses only the hypothesis whose collected concept declares no ttl, leaving the hypothesis whose concept declares one unrefused', () => {
    // arrange
    const declaring = conceptWithTtl(DECLARING_CONCEPT_NAME, NEUTRAL_TTL);
    const notDeclaring = conceptWithNoTtl(NOT_DECLARING_CONCEPT_NAME);
    const check = createEveryCollectedConceptDeclaresATtlCheck(
      glossary([declaring, notDeclaring]),
    );
    const draft = draftCase([
      hypothesis(FIRST_HYPOTHESIS_NAME, [DECLARING_CONCEPT_NAME]),
      hypothesis(SECOND_HYPOTHESIS_NAME, [NOT_DECLARING_CONCEPT_NAME]),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      {
        rule: RULE_IDENTIFIER,
        hypothesis: SECOND_HYPOTHESIS_NAME,
        offendedTerm: NOT_DECLARING_CONCEPT_NAME,
        text: REFUSAL_TEXT,
      },
    ]);
  });

  it('refuses only the concept within one hypothesis that declares no ttl, not the concept that does', () => {
    // arrange
    const declaring = conceptWithTtl(DECLARING_CONCEPT_NAME, NEUTRAL_TTL);
    const notDeclaring = conceptWithNoTtl(NOT_DECLARING_CONCEPT_NAME);
    const check = createEveryCollectedConceptDeclaresATtlCheck(
      glossary([declaring, notDeclaring]),
    );
    const draft = draftCase([
      hypothesis(FIRST_HYPOTHESIS_NAME, [DECLARING_CONCEPT_NAME, NOT_DECLARING_CONCEPT_NAME]),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      {
        rule: RULE_IDENTIFIER,
        hypothesis: FIRST_HYPOTHESIS_NAME,
        offendedTerm: NOT_DECLARING_CONCEPT_NAME,
        text: REFUSAL_TEXT,
      },
    ]);
  });

  it('produces one refusal per offending concept, in the order collected, when a hypothesis collects two concepts that both declare no ttl', () => {
    // arrange
    const firstNotDeclaring = conceptWithNoTtl(NOT_DECLARING_CONCEPT_NAME);
    const secondNotDeclaring = conceptWithNoTtl(SECOND_NOT_DECLARING_CONCEPT_NAME);
    const check = createEveryCollectedConceptDeclaresATtlCheck(
      glossary([firstNotDeclaring, secondNotDeclaring]),
    );
    const draft = draftCase([
      hypothesis(FIRST_HYPOTHESIS_NAME, [
        NOT_DECLARING_CONCEPT_NAME,
        SECOND_NOT_DECLARING_CONCEPT_NAME,
      ]),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      {
        rule: RULE_IDENTIFIER,
        hypothesis: FIRST_HYPOTHESIS_NAME,
        offendedTerm: NOT_DECLARING_CONCEPT_NAME,
        text: REFUSAL_TEXT,
      },
      {
        rule: RULE_IDENTIFIER,
        hypothesis: FIRST_HYPOTHESIS_NAME,
        offendedTerm: SECOND_NOT_DECLARING_CONCEPT_NAME,
        text: REFUSAL_TEXT,
      },
    ]);
  });

  it('produces no refusal for a concept a hypothesis collects that the given glossary does not publish', () => {
    // arrange
    //
    // Proves the implementation's own recorded inference: an unpublished
    // concept has no ttl declaration to find one way or the other, and the
    // refusal for an absent term belongs to the terms-exist-in-the-glossary
    // check, not this one.
    const check = createEveryCollectedConceptDeclaresATtlCheck(glossary([]));
    const draft = draftCase([
      hypothesis(FIRST_HYPOTHESIS_NAME, [UNPUBLISHED_CONCEPT_NAME]),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('freezes the array it answers with on the refusing path', () => {
    // arrange
    const notDeclaring = conceptWithNoTtl(NOT_DECLARING_CONCEPT_NAME);
    const check = createEveryCollectedConceptDeclaresATtlCheck(glossary([notDeclaring]));
    const draft = draftCase([
      hypothesis(FIRST_HYPOTHESIS_NAME, [NOT_DECLARING_CONCEPT_NAME]),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.equal(Object.isFrozen(answered), true);
  });

  it('freezes the array it answers with on the passing path', () => {
    // arrange
    const declaring = conceptWithTtl(DECLARING_CONCEPT_NAME, NEUTRAL_TTL);
    const check = createEveryCollectedConceptDeclaresATtlCheck(glossary([declaring]));
    const draft = draftCase([
      hypothesis(FIRST_HYPOTHESIS_NAME, [DECLARING_CONCEPT_NAME]),
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
    const check = createEveryCollectedConceptDeclaresATtlCheck(glossary([]));
    const draft = draftCase([]);

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
    // wrong value. Hypothesis (src/knowledge/hypothesis.ts) declares collects
    // as a required array with no optional variant, and no bound node admits
    // a hypothesis lacking that field altogether — the empty array is the
    // one degenerate shape the base's own types admit below the collected
    // minimum, the same one the sibling check's own task states this
    // malformation as.
    const check = createEveryCollectedConceptDeclaresATtlCheck(glossary([]));
    const draft = draftCase([hypothesis(FIRST_HYPOTHESIS_NAME, [])]);

    // act
    const answered = check(draft);

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
    const check = createEveryCollectedConceptDeclaresATtlCheck(glossary([]));
    const draft = draftCase([]);
    const companion: PublicationCheck = () => [{ rule: COMPANION_RULE, text: COMPANION_TEXT }];

    // act
    const answered = validate(draft, [check, companion]);

    // assert
    assert.deepEqual(answered, [
      { rule: COMPANION_RULE, hypothesis: undefined, offendedTerm: undefined, text: COMPANION_TEXT },
    ]);
  });
});
