import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createCase } from '../../../knowledge/case';

/**
 * Proves `task/published-case/case-structure` over `src/knowledge/case.ts`.
 *
 * Every name below is a placeholder, chosen only to be distinguishable from
 * the next one. The subject-type, concept, outcome, action and recipient
 * vocabularies are open, the hypothesis names are the case's own, and this
 * construct binds every one of those names by identity and never enumerates
 * or checks a vocabulary, so no member of any vocabulary is written here and
 * nothing below asserts which names exist. The content hash is a placeholder
 * for the same reason: the construction carries the declared hash and
 * computes nothing — the computation belongs to the act of publishing,
 * outside this plan (rule/knowledge/the-content-hash-covers-the-whole-file).
 *
 * The prose values — the when-to-use guidance, a hypothesis's criterion and
 * the curator notes — carry leading space, a line break and trailing space,
 * so a text that was trimmed, joined or normalized on the way through reads
 * back different from the one it was declared with.
 */
const DECLARED_SLUG = 'case-slug-placeholder';
const DECLARED_TITLE = 'title placeholder as declared';
const DECLARED_WHEN_TO_USE = '  when to use it, first line as given\n  second line as given  ';
const DECLARED_VERSION = 'version-placeholder';
const DECLARED_CONTENT_HASH = 'content-hash-placeholder';
const DECLARED_CURATOR_NOTES = '  curator notes, first line as given\n  second line as given  ';
const DECLARED_SUBJECT_TYPE = 'subject-type-placeholder';

/**
 * The declared order of the hypotheses, and of the first hypothesis's
 * collected concepts, deliberately disagrees with the lexicographic order of
 * their names: a list that was sorted on the way through reads back different
 * from the one declared (rule/knowledge/hypotheses-are-ordered-by-precedence).
 */
const FIRST_DECLARED_HYPOTHESIS = 'hypothesis-placeholder-b';
const SECOND_DECLARED_HYPOTHESIS = 'hypothesis-placeholder-a';
const FIRST_DECLARED_CRITERION = '  criterion of the first hypothesis, as given\n  second line as given  ';
const SECOND_DECLARED_CRITERION = 'criterion of the second hypothesis, as given';
const FIRST_DECLARED_CONCEPT = 'concept-placeholder-b';
const SECOND_DECLARED_CONCEPT = 'concept-placeholder-a';
const THIRD_DECLARED_CONCEPT = 'concept-placeholder-c';
const CHANGED_CONCEPT = 'concept-placeholder-changed';
const UNCOLLECTED_CONCEPT = 'concept-placeholder-uncollected';

/**
 * The four declared resolutions — one per hypothesis and the two fallbacks —
 * all differ from one another on purpose: a construction wiring two slots to
 * one declaration reads back wrong in whichever slot's test it reaches.
 */
const FIRST_HYPOTHESIS_OUTCOME = 'outcome-placeholder-a';
const FIRST_HYPOTHESIS_ACTION = 'action-placeholder-a';
const FIRST_HYPOTHESIS_RECIPIENT = 'recipient-placeholder-a';
const SECOND_HYPOTHESIS_OUTCOME = 'outcome-placeholder-b';
const SECOND_HYPOTHESIS_ACTION = 'action-placeholder-b';
const SECOND_HYPOTHESIS_RECIPIENT = 'recipient-placeholder-b';
const NO_DATA_OUTCOME = 'outcome-placeholder-c';
const NO_DATA_ACTION = 'action-placeholder-c';
const NO_DATA_RECIPIENT = 'recipient-placeholder-c';
const EXHAUSTED_OUTCOME = 'outcome-placeholder-d';
const EXHAUSTED_ACTION = 'action-placeholder-d';
const EXHAUSTED_RECIPIENT = 'recipient-placeholder-d';
const CHANGED_OUTCOME = 'outcome-placeholder-changed';
const UNDECLARED_PART = 'undeclared-part-placeholder';

function firstDeclaredHypothesis() {
  return {
    name: FIRST_DECLARED_HYPOTHESIS,
    collects: [FIRST_DECLARED_CONCEPT, SECOND_DECLARED_CONCEPT],
    confirmsWhen: FIRST_DECLARED_CRITERION,
    resolution: {
      outcome: FIRST_HYPOTHESIS_OUTCOME,
      referral: { action: FIRST_HYPOTHESIS_ACTION, recipient: FIRST_HYPOTHESIS_RECIPIENT },
    },
  };
}

function secondDeclaredHypothesis() {
  return {
    name: SECOND_DECLARED_HYPOTHESIS,
    collects: [THIRD_DECLARED_CONCEPT],
    confirmsWhen: SECOND_DECLARED_CRITERION,
    resolution: {
      outcome: SECOND_HYPOTHESIS_OUTCOME,
      referral: { action: SECOND_HYPOTHESIS_ACTION, recipient: SECOND_HYPOTHESIS_RECIPIENT },
    },
  };
}

/**
 * A fresh set of declared parts per call, so a test that changes a value
 * after construction changes no other test's arrangement. Curator notes are
 * not declared here, because a case may be declared without them; a test
 * that declares them spreads them in.
 */
function caseParts() {
  return {
    slug: DECLARED_SLUG,
    title: DECLARED_TITLE,
    whenToUse: DECLARED_WHEN_TO_USE,
    subjectType: DECLARED_SUBJECT_TYPE,
    hypotheses: [firstDeclaredHypothesis(), secondDeclaredHypothesis()],
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

describe('createCase', () => {
  it('reads back the slug it was declared with', () => {
    // arrange
    const parts = caseParts();

    // act
    const publishedCase = createCase(parts);

    // assert
    assert.equal(publishedCase.slug, DECLARED_SLUG);
  });

  it('reads back the title it was declared with', () => {
    // arrange
    const parts = caseParts();

    // act
    const publishedCase = createCase(parts);

    // assert
    assert.equal(publishedCase.title, DECLARED_TITLE);
  });

  it('reads back the when-to-use guidance it was declared with, character for character', () => {
    // arrange
    const parts = caseParts();

    // act
    const publishedCase = createCase(parts);

    // assert
    assert.equal(publishedCase.whenToUse, DECLARED_WHEN_TO_USE);
  });

  it('reads back the version it was declared with', () => {
    // arrange
    const parts = caseParts();

    // act
    const publishedCase = createCase(parts);

    // assert
    assert.equal(publishedCase.version, DECLARED_VERSION);
  });

  it('reads back the content hash it was declared with', () => {
    // arrange
    const parts = caseParts();

    // act
    const publishedCase = createCase(parts);

    // assert
    assert.equal(publishedCase.contentHash, DECLARED_CONTENT_HASH);
  });

  it('reads back the curator notes it was declared with, character for character', () => {
    // arrange
    const parts = { ...caseParts(), curatorNotes: DECLARED_CURATOR_NOTES };

    // act
    const publishedCase = createCase(parts);

    // assert
    assert.equal(publishedCase.curatorNotes, DECLARED_CURATOR_NOTES);
  });

  it('reads back no curator notes when it was declared without them', () => {
    // arrange
    const parts = caseParts();

    // act
    const publishedCase = createCase(parts);

    // assert
    assert.equal(publishedCase.curatorNotes, undefined);
  });

  it('reads back the subject type it declares', () => {
    // arrange
    const parts = caseParts();

    // act
    const publishedCase = createCase(parts);

    // assert
    assert.equal(publishedCase.subjectType, DECLARED_SUBJECT_TYPE);
  });

  it('lists its hypotheses back in the order it declared them', () => {
    // arrange
    //
    // The declared order disagrees with the lexicographic order of the names
    // on purpose, so a list sorted on the way through fails here.
    const parts = caseParts();

    // act
    const publishedCase = createCase(parts);

    // assert
    assert.deepEqual(
      publishedCase.hypotheses.map((hypothesis) => hypothesis.name),
      [FIRST_DECLARED_HYPOTHESIS, SECOND_DECLARED_HYPOTHESIS],
    );
  });

  it('reads back the name that identifies a hypothesis within its case', () => {
    // arrange
    const parts = caseParts();

    // act
    const publishedCase = createCase(parts);

    // assert
    const [firstHypothesis] = publishedCase.hypotheses;
    assert.equal(firstHypothesis?.name, FIRST_DECLARED_HYPOTHESIS);
  });

  it('reads back the criterion a hypothesis was declared with, character for character', () => {
    // arrange
    const parts = caseParts();

    // act
    const publishedCase = createCase(parts);

    // assert
    const [firstHypothesis] = publishedCase.hypotheses;
    assert.equal(firstHypothesis?.confirmsWhen, FIRST_DECLARED_CRITERION);
  });

  it('reads back the concepts a hypothesis collects, in their declared order', () => {
    // arrange
    //
    // The declared order disagrees with the lexicographic order of the names
    // on purpose, so a list sorted on the way through fails here.
    const parts = caseParts();

    // act
    const publishedCase = createCase(parts);

    // assert
    const [firstHypothesis] = publishedCase.hypotheses;
    assert.deepEqual(firstHypothesis?.collects, [FIRST_DECLARED_CONCEPT, SECOND_DECLARED_CONCEPT]);
  });

  it('reads back the resolution that follows a hypothesis when it holds', () => {
    // arrange
    const parts = caseParts();

    // act
    const publishedCase = createCase(parts);

    // assert
    const [firstHypothesis] = publishedCase.hypotheses;
    assert.deepEqual(firstHypothesis?.resolution, {
      outcome: FIRST_HYPOTHESIS_OUTCOME,
      referral: { action: FIRST_HYPOTHESIS_ACTION, recipient: FIRST_HYPOTHESIS_RECIPIENT },
    });
  });

  it('reads back the resolution it declares as its no-data fallback', () => {
    // arrange
    //
    // All four declared resolutions differ, so this slot wired to the other
    // fallback, to a hypothesis's resolution or to any shared declaration
    // reads back wrong here on its own.
    const parts = caseParts();

    // act
    const publishedCase = createCase(parts);

    // assert
    assert.deepEqual(publishedCase.noDataFallback, {
      outcome: NO_DATA_OUTCOME,
      referral: { action: NO_DATA_ACTION, recipient: NO_DATA_RECIPIENT },
    });
  });

  it('reads back the resolution it declares as its hypotheses-exhausted fallback', () => {
    // arrange
    //
    // The mirror of the no-data test: each fallback is asserted alone, so a
    // construction wiring both slots to one resolution fails one of the two.
    const parts = caseParts();

    // act
    const publishedCase = createCase(parts);

    // assert
    assert.deepEqual(publishedCase.hypothesesExhaustedFallback, {
      outcome: EXHAUSTED_OUTCOME,
      referral: { action: EXHAUSTED_ACTION, recipient: EXHAUSTED_RECIPIENT },
    });
  });

  it('reads a declared resolution back with both its outcome and its referral', () => {
    // arrange
    const parts = caseParts();

    // act
    const publishedCase = createCase(parts);

    // assert
    const [, secondHypothesis] = publishedCase.hypotheses;
    assert.equal(secondHypothesis?.resolution.outcome, SECOND_HYPOTHESIS_OUTCOME);
    assert.deepEqual(secondHypothesis?.resolution.referral, {
      action: SECOND_HYPOTHESIS_ACTION,
      recipient: SECOND_HYPOTHESIS_RECIPIENT,
    });
  });

  it('reads a declared referral back with both its action and its recipient', () => {
    // arrange
    const parts = caseParts();

    // act
    const publishedCase = createCase(parts);

    // assert
    const { referral } = publishedCase.hypothesesExhaustedFallback;
    assert.equal(referral.action, EXHAUSTED_ACTION);
    assert.equal(referral.recipient, EXHAUSTED_RECIPIENT);
  });

  it('carries the declared parts under their declared names and nothing beside them', () => {
    // arrange
    //
    // Pins the implementation's recorded inference that the base's snake_case
    // attribute names are carried as these camelCase fields, and that nothing
    // handed in beyond what a case declares is carried along.
    const partsNamingAnUndeclaredPart = {
      ...caseParts(),
      curatorNotes: DECLARED_CURATOR_NOTES,
      undeclaredPart: UNDECLARED_PART,
    };

    // act
    const publishedCase = createCase(partsNamingAnUndeclaredPart);

    // assert
    assert.deepEqual(Object.keys(publishedCase).sort(), [
      'contentHash',
      'curatorNotes',
      'hypotheses',
      'hypothesesExhaustedFallback',
      'noDataFallback',
      'slug',
      'subjectType',
      'title',
      'version',
      'whenToUse',
    ]);
  });

  it('lists back the hypotheses it was declared with after the list handed in is changed', () => {
    // arrange
    const parts = caseParts();
    const handedInHypotheses = parts.hypotheses;
    const publishedCase = createCase(parts);

    // act
    handedInHypotheses.reverse();

    // assert
    assert.deepEqual(
      publishedCase.hypotheses.map((hypothesis) => hypothesis.name),
      [FIRST_DECLARED_HYPOTHESIS, SECOND_DECLARED_HYPOTHESIS],
    );
  });

  it('reads back the concepts it was declared with after the collects list handed in is changed', () => {
    // arrange
    const handedInCollects = [FIRST_DECLARED_CONCEPT, SECOND_DECLARED_CONCEPT];
    const parts = {
      ...caseParts(),
      hypotheses: [{ ...firstDeclaredHypothesis(), collects: handedInCollects }],
    };
    const publishedCase = createCase(parts);

    // act
    handedInCollects[0] = CHANGED_CONCEPT;

    // assert
    const [firstHypothesis] = publishedCase.hypotheses;
    assert.deepEqual(firstHypothesis?.collects, [FIRST_DECLARED_CONCEPT, SECOND_DECLARED_CONCEPT]);
  });

  it('reads back the no-data fallback it was declared with after the resolution handed in is changed', () => {
    // arrange
    const handedInFallback = {
      outcome: NO_DATA_OUTCOME,
      referral: { action: NO_DATA_ACTION, recipient: NO_DATA_RECIPIENT },
    };
    const parts = { ...caseParts(), noDataFallback: handedInFallback };
    const publishedCase = createCase(parts);

    // act
    handedInFallback.outcome = CHANGED_OUTCOME;

    // assert
    assert.equal(publishedCase.noDataFallback.outcome, NO_DATA_OUTCOME);
  });

  it('reads back the concepts each hypothesis collects unchanged when the curator notes name another concept', () => {
    // arrange
    //
    // rule/knowledge/the-body-does-not-change-what-is-collected: the notes
    // are for whoever edits the case and never change what is collected. The
    // notes here name a concept no hypothesis collects, so a construction
    // deriving the collection from the prose as well as from the structured
    // hypotheses reads back a list the case never declared.
    const notesNamingAnUncollectedConcept = `these notes mention ${UNCOLLECTED_CONCEPT} and change nothing`;
    const parts = { ...caseParts(), curatorNotes: notesNamingAnUncollectedConcept };

    // act
    const publishedCase = createCase(parts);

    // assert
    assert.deepEqual(
      publishedCase.hypotheses.map((hypothesis) => hypothesis.collects),
      [[FIRST_DECLARED_CONCEPT, SECOND_DECLARED_CONCEPT], [THIRD_DECLARED_CONCEPT]],
    );
  });

  /**
   * The three constructions below are ones the base refuses to publish — a
   * case declares at least one hypothesis, a hypothesis collects at least one
   * concept, and two hypotheses of a case never share a name. Those refusals
   * run over the whole case in the act of publishing and are the validator
   * epic's checks, outside this module. Each test pins the implementation's
   * recorded inference that construction itself checks nothing and refuses
   * nothing, so the choice is stated rather than incidental; none of the
   * three asserts that such a case is publishable.
   */
  it('constructs a case declaring no hypotheses rather than refusing it', () => {
    // arrange
    const parts = { ...caseParts(), hypotheses: [] };

    // act
    const constructing = (): unknown => createCase(parts);

    // assert
    assert.doesNotThrow(constructing);
  });

  it('constructs a hypothesis collecting no concepts rather than refusing it', () => {
    // arrange
    const parts = {
      ...caseParts(),
      hypotheses: [{ ...firstDeclaredHypothesis(), collects: [] }],
    };

    // act
    const constructing = (): unknown => createCase(parts);

    // assert
    assert.doesNotThrow(constructing);
  });

  it('constructs two hypotheses sharing a name rather than refusing them', () => {
    // arrange
    const parts = {
      ...caseParts(),
      hypotheses: [
        firstDeclaredHypothesis(),
        { ...secondDeclaredHypothesis(), name: FIRST_DECLARED_HYPOTHESIS },
      ],
    };

    // act
    const constructing = (): unknown => createCase(parts);

    // assert
    assert.doesNotThrow(constructing);
  });
});
