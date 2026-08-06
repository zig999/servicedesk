import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Concept } from '../../../glossary/concept';
import type { GlossaryKind, PublishedGlossary } from '../../../glossary/lookup';
import { isPublished, publishedConcept } from '../../../glossary/lookup';

/**
 * Proves `task/case-validator/glossary-lookup` over `src/glossary/lookup.ts`.
 *
 * Every name below is a placeholder, chosen only to be distinguishable from
 * the next one. The concept, subject-type, outcome, action and recipient
 * vocabularies are open and their members are the published glossary's own
 * content, so no member of any vocabulary is written here: each glossary
 * these tests hand the lookup is arranged data standing where a glossary the
 * lookup was given would stand, and nothing below asserts which names exist.
 *
 * The five kind spellings are not placeholders: they are the base's node
 * slugs, which is the one spelling the implementation records as an
 * inference, and passing them as literals is what pins that choice.
 *
 * The case-variant and whitespace-variant terms differ from a published name
 * only by letter case and only by surrounding space, so a lookup that folds
 * case, trims or normalises before comparing answers them as published where
 * the exact-lookup rule answers them as another term entirely.
 */
const PUBLISHED_CONCEPT_NAME = 'concept-placeholder-a';
const CASE_VARIANT_OF_CONCEPT_NAME = 'Concept-Placeholder-A';
const WHITESPACE_VARIANT_OF_CONCEPT_NAME = ' concept-placeholder-a ';
const BARE_CONCEPT_NAME = 'concept-placeholder-b';
const ACCEPTED_SUBJECT_TYPE = 'subject-type-placeholder-b';
const PUBLISHED_SUBJECT_TYPE = 'subject-type-placeholder-a';
const PUBLISHED_OUTCOME = 'outcome-placeholder-a';
const PUBLISHED_ACTION = 'action-placeholder-a';
const PUBLISHED_RECIPIENT = 'recipient-placeholder-a';
const UNPUBLISHED_TERM = 'term-placeholder-unpublished';
const EMPTY_TERM = '';
const DECLARED_FIELD_NAME = 'field-placeholder-a';

/**
 * Carried exactly as recorded and never interpreted, so any distinguishable
 * integer serves; nothing below reads meaning into it.
 */
const RECORDED_TTL = 47;

/**
 * Every kind a term can be looked up as, spelled as the base's node slugs.
 * The list is this file's own and the compiler holds each entry to
 * GlossaryKind, though not the list to completeness: a kind added to the
 * union later would not be swept by the every-kind tests until added here.
 */
const EVERY_KIND: readonly GlossaryKind[] = [
  'concept',
  'subject-type',
  'outcome',
  'action',
  'recipient',
];

/**
 * A fresh concept record per call, so no test reads an object another test
 * arranged. It carries all four declared parts, each distinguishable, so a
 * yield that dropped or rewrote one reads back different from the record.
 */
function recordedConcept(): Concept {
  return {
    name: PUBLISHED_CONCEPT_NAME,
    accepts: [ACCEPTED_SUBJECT_TYPE],
    ttl: RECORDED_TTL,
    observationFields: [{ name: DECLARED_FIELD_NAME }],
  };
}

/**
 * A fresh glossary per call, publishing one entry of each of the five kinds,
 * every name distinguishable from every other so an answer read from the
 * wrong kind's list cannot accidentally agree with the right one.
 */
function publishedGlossary(): PublishedGlossary {
  return {
    concepts: [recordedConcept()],
    subjectTypes: [PUBLISHED_SUBJECT_TYPE],
    outcomes: [PUBLISHED_OUTCOME],
    actions: [PUBLISHED_ACTION],
    recipients: [PUBLISHED_RECIPIENT],
  };
}

/**
 * A glossary publishing nothing at all, for the answers-from-what-it-was-given
 * tests: anything this one answers as published is a term the lookup holds of
 * its own.
 */
function glossaryPublishingNothing(): PublishedGlossary {
  return {
    concepts: [],
    subjectTypes: [],
    outcomes: [],
    actions: [],
    recipients: [],
  };
}

/**
 * The kinds the given glossary answers the term as published under — the
 * whole answer surface of one term, so a test over "not published under any
 * kind" fails naming exactly the kinds that wrongly answered.
 */
function kindsAnsweringPublished(
  glossary: PublishedGlossary,
  term: string,
): readonly GlossaryKind[] {
  return EVERY_KIND.filter((kind: GlossaryKind): boolean =>
    isPublished(glossary, term, kind),
  );
}

describe('isPublished', () => {
  it('answers a term the glossary publishes as a concept as published when looked up as a concept', () => {
    // arrange
    const glossary = publishedGlossary();

    // act
    const answered = isPublished(glossary, PUBLISHED_CONCEPT_NAME, 'concept');

    // assert
    assert.equal(answered, true);
  });

  it('answers a term the glossary publishes no entry for as not published under any kind', () => {
    // arrange
    //
    // The glossary publishes an entry of every kind, so an answer reading the
    // wrong list — or all lists — still finds nothing spelling this term.
    const glossary = publishedGlossary();

    // act
    const answeredPublishedUnder = kindsAnsweringPublished(glossary, UNPUBLISHED_TERM);

    // assert
    assert.deepEqual(answeredPublishedUnder, []);
  });

  it('answers a term the glossary publishes as an outcome as not published when looked up as an action', () => {
    // arrange
    const glossary = publishedGlossary();

    // act
    const answered = isPublished(glossary, PUBLISHED_OUTCOME, 'action');

    // assert
    assert.equal(answered, false);
  });

  it('answers a term the glossary publishes as an outcome as published when looked up as an outcome', () => {
    // arrange
    //
    // The positive half the outcome-as-action test leans on: were the outcome
    // list never consulted at all, that test would pass with nothing proven.
    const glossary = publishedGlossary();

    // act
    const answered = isPublished(glossary, PUBLISHED_OUTCOME, 'outcome');

    // assert
    assert.equal(answered, true);
  });

  it('answers a term the glossary publishes as an action as published when looked up as an action', () => {
    // arrange
    const glossary = publishedGlossary();

    // act
    const answered = isPublished(glossary, PUBLISHED_ACTION, 'action');

    // assert
    assert.equal(answered, true);
  });

  it('answers a term the glossary publishes as a subject type as published when looked up as a subject type', () => {
    // arrange
    const glossary = publishedGlossary();

    // act
    const answered = isPublished(glossary, PUBLISHED_SUBJECT_TYPE, 'subject-type');

    // assert
    assert.equal(answered, true);
  });

  it('answers a term the glossary publishes as a recipient as published when looked up as a recipient', () => {
    // arrange
    const glossary = publishedGlossary();

    // act
    const answered = isPublished(glossary, PUBLISHED_RECIPIENT, 'recipient');

    // assert
    assert.equal(answered, true);
  });

  it('answers a term the glossary publishes only as a concept as published under the concept kind alone', () => {
    // arrange
    const glossaryPublishingOnlyAConcept: PublishedGlossary = {
      ...glossaryPublishingNothing(),
      concepts: [recordedConcept()],
    };

    // act
    const answeredPublishedUnder = kindsAnsweringPublished(
      glossaryPublishingOnlyAConcept,
      PUBLISHED_CONCEPT_NAME,
    );

    // assert
    assert.deepEqual(answeredPublishedUnder, ['concept']);
  });

  it('answers a term differing from a published concept name only in letter case as not published', () => {
    // arrange
    const glossary = publishedGlossary();

    // act
    const answered = isPublished(glossary, CASE_VARIANT_OF_CONCEPT_NAME, 'concept');

    // assert
    assert.equal(answered, false);
  });

  it('answers a term differing from a published concept name only by surrounding whitespace as not published', () => {
    // arrange
    const glossary = publishedGlossary();

    // act
    const answered = isPublished(glossary, WHITESPACE_VARIANT_OF_CONCEPT_NAME, 'concept');

    // assert
    assert.equal(answered, false);
  });

  it("answers a declared observation field's name as not published under any kind", () => {
    // arrange
    //
    // The published concept declares the field, so the name is in the given
    // glossary — inside the concept's own record. The fields are the
    // concept's own rather than a vocabulary, so the name answers no lookup.
    const glossary = publishedGlossary();

    // act
    const answeredPublishedUnder = kindsAnsweringPublished(glossary, DECLARED_FIELD_NAME);

    // assert
    assert.deepEqual(answeredPublishedUnder, []);
  });

  it('answers the empty string as not published under any kind of a populated glossary', () => {
    // arrange
    const glossary = publishedGlossary();

    // act
    const answeredPublishedUnder = kindsAnsweringPublished(glossary, EMPTY_TERM);

    // assert
    assert.deepEqual(answeredPublishedUnder, []);
  });

  it('answers nothing as published from a glossary publishing nothing', () => {
    // arrange
    //
    // Every name another glossary publishes, looked up under every kind
    // against a glossary publishing none of them: any published answer here
    // is a term the lookup holds of its own.
    const glossary = glossaryPublishingNothing();
    const termsAnotherGlossaryPublishes = [
      PUBLISHED_CONCEPT_NAME,
      PUBLISHED_SUBJECT_TYPE,
      PUBLISHED_OUTCOME,
      PUBLISHED_ACTION,
      PUBLISHED_RECIPIENT,
    ];

    // act
    const answeredPublished = termsAnotherGlossaryPublishes.flatMap(
      (term: string): readonly GlossaryKind[] => kindsAnsweringPublished(glossary, term),
    );

    // assert
    assert.deepEqual(answeredPublished, []);
  });

  it('answers one term differently from two glossaries, published exactly where the given one publishes it', () => {
    // arrange
    const glossaryPublishingTheTerm = publishedGlossary();
    const glossaryWithoutTheTerm = glossaryPublishingNothing();

    // act
    const answeredFromThePublishingGlossary = isPublished(
      glossaryPublishingTheTerm,
      PUBLISHED_CONCEPT_NAME,
      'concept',
    );
    const answeredFromTheOtherGlossary = isPublished(
      glossaryWithoutTheTerm,
      PUBLISHED_CONCEPT_NAME,
      'concept',
    );

    // assert
    assert.equal(answeredFromThePublishingGlossary, true);
    assert.equal(answeredFromTheOtherGlossary, false);
  });
});

describe('publishedConcept', () => {
  it('yields the published concept as the glossary records it, with its name, accepted subject types, ttl and observation fields', () => {
    // arrange
    const glossary = publishedGlossary();

    // act
    const yielded = publishedConcept(glossary, PUBLISHED_CONCEPT_NAME);

    // assert
    assert.deepEqual(yielded, {
      name: PUBLISHED_CONCEPT_NAME,
      accepts: [ACCEPTED_SUBJECT_TYPE],
      ttl: RECORDED_TTL,
      observationFields: [{ name: DECLARED_FIELD_NAME }],
    });
  });

  it("yields the glossary's own concept record rather than a copy of it", () => {
    // arrange
    const recordTheGlossaryHolds = recordedConcept();
    const glossary: PublishedGlossary = {
      ...glossaryPublishingNothing(),
      concepts: [recordTheGlossaryHolds],
    };

    // act
    const yielded = publishedConcept(glossary, PUBLISHED_CONCEPT_NAME);

    // assert
    assert.equal(yielded, recordTheGlossaryHolds);
  });

  it('yields the absent value for a term the glossary publishes no concept for', () => {
    // arrange
    const glossary = publishedGlossary();

    // act
    const yielded = publishedConcept(glossary, UNPUBLISHED_TERM);

    // assert
    assert.equal(yielded, undefined);
  });

  it("yields the absent value for a term differing from a published concept's name only in letter case", () => {
    // arrange
    const glossary = publishedGlossary();

    // act
    const yielded = publishedConcept(glossary, CASE_VARIANT_OF_CONCEPT_NAME);

    // assert
    assert.equal(yielded, undefined);
  });

  it('yields a concept recorded with no accepted subject type and no observation field exactly as recorded', () => {
    // arrange
    //
    // The base declares both minimums of the glossary's registration, and the
    // implementation records the inference that a reader never enforces them:
    // a record below the minimums is yielded as the glossary holds it, never
    // repaired and never refused.
    const bareConcept: Concept = {
      name: BARE_CONCEPT_NAME,
      accepts: [],
      ttl: RECORDED_TTL,
      observationFields: [],
    };
    const glossary: PublishedGlossary = {
      ...glossaryPublishingNothing(),
      concepts: [bareConcept],
    };

    // act
    const yielded = publishedConcept(glossary, BARE_CONCEPT_NAME);

    // assert
    assert.deepEqual(yielded, {
      name: BARE_CONCEPT_NAME,
      accepts: [],
      ttl: RECORDED_TTL,
      observationFields: [],
    });
  });
});
