import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Concept } from '../../../glossary/concept';
import type { PublishedGlossary } from '../../../glossary/lookup';
import { isRefusedForItsCitations } from '../../../investigation/a-decided-evaluation-cites-evidence';
import type { Citation } from '../../../investigation/citation';
import type { Evaluation } from '../../../investigation/evaluation';
import { createEvaluation } from '../../../investigation/evaluation';
import type { Hypothesis } from '../../../knowledge/hypothesis';

/**
 * Proves `task/published-case/evaluation-citations` over
 * `src/investigation/a-decided-evaluation-cites-evidence.ts`.
 *
 * Every hypothesis, concept and field name below is a placeholder, chosen
 * only to be distinguishable from the next one: this check reads a
 * hypothesis's collects list and a concept's declared observation fields by
 * exact name comparison, and nothing here asserts which names the base
 * itself would ever publish.
 *
 * `isRefusedForItsCitations` trusts that the given hypothesis is the one the
 * evaluation names — matching that name back to the case that declared the
 * hypothesis is the judging act's own concern, outside this module — so most
 * fixtures below name the evaluation's hypothesis and the hypothesis
 * parameter with the same placeholder purely for readability, and one test
 * deliberately gives them different names to prove the check never compares
 * the two.
 */
const DECIDED_HYPOTHESIS = 'hypothesis-placeholder-decided';
const OTHER_HYPOTHESIS = 'hypothesis-placeholder-other';
const DECLARED_CRITERION = 'criterion of the hypothesis, as declared';
const HYPOTHESIS_OUTCOME = 'outcome-placeholder-a';
const HYPOTHESIS_ACTION = 'action-placeholder-a';
const HYPOTHESIS_RECIPIENT = 'recipient-placeholder-a';

const COLLECTED_CONCEPT_NAME = 'concept-placeholder-collected';
const OTHER_COLLECTED_CONCEPT_NAME = 'concept-placeholder-collected-other';
const UNCOLLECTED_CONCEPT_NAME = 'concept-placeholder-uncollected';
const UNPUBLISHED_CONCEPT_NAME = 'concept-placeholder-unpublished';

const DECLARED_FIELD_NAME = 'field-placeholder-declared';
const OTHER_DECLARED_FIELD_NAME = 'field-placeholder-declared-other';
const UNDECLARED_FIELD_NAME = 'field-placeholder-undeclared';

const NEUTRAL_ACCEPTS: readonly string[] = [];
const NEUTRAL_TTL = 1;

/**
 * A fresh citation per call, naming the concept and the field it cites.
 */
function citation(concept: string, field: string): Citation {
  return { concept, field };
}

/**
 * A fresh concept record per call, declaring exactly the observation fields
 * named — the accepts list and ttl are filled with neutral values this check
 * never inspects.
 */
function concept(name: string, fields: readonly string[]): Concept {
  return {
    name,
    accepts: NEUTRAL_ACCEPTS,
    ttl: NEUTRAL_TTL,
    observationFields: fields.map((field) => ({ name: field })),
  };
}

/**
 * A fresh glossary per call, publishing exactly the concepts handed in and
 * nothing of the other four kinds — this check never reads them.
 */
function glossary(concepts: readonly Concept[]): PublishedGlossary {
  return { concepts, subjectTypes: [], outcomes: [], actions: [], recipients: [] };
}

/**
 * A fresh hypothesis per call, collecting exactly the concept names handed
 * in — the criterion and the resolution are filled with neutral values this
 * check never inspects.
 */
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
 * A confirmed evaluation of DECIDED_HYPOTHESIS, carrying exactly the
 * citations handed in — or none, where the caller gives none at all, which
 * is what a construction naming no citations key looks like at runtime.
 */
function confirmedEvaluation(citations?: readonly Citation[]): Evaluation {
  return createEvaluation({
    hypothesis: DECIDED_HYPOTHESIS,
    verdict: 'confirmed',
    ...(citations === undefined ? {} : { citations }),
  });
}

function refutedEvaluation(citations?: readonly Citation[]): Evaluation {
  return createEvaluation({
    hypothesis: DECIDED_HYPOTHESIS,
    verdict: 'refuted',
    ...(citations === undefined ? {} : { citations }),
  });
}

function inconclusiveEvaluation(citations?: readonly Citation[]): Evaluation {
  return createEvaluation({
    hypothesis: DECIDED_HYPOTHESIS,
    verdict: 'inconclusive',
    reason: 'no-data',
    ...(citations === undefined ? {} : { citations }),
  });
}

describe('isRefusedForItsCitations', () => {
  it('refuses a confirmed evaluation carrying no citation', () => {
    // arrange
    const evaluation = confirmedEvaluation();
    const decidingHypothesis = hypothesis(DECIDED_HYPOTHESIS, [COLLECTED_CONCEPT_NAME]);

    // act
    const refused = isRefusedForItsCitations(evaluation, decidingHypothesis, glossary([]));

    // assert
    assert.equal(refused, true);
  });

  it('refuses a refuted evaluation carrying no citation', () => {
    // arrange
    const evaluation = refutedEvaluation();
    const decidingHypothesis = hypothesis(DECIDED_HYPOTHESIS, [COLLECTED_CONCEPT_NAME]);

    // act
    const refused = isRefusedForItsCitations(evaluation, decidingHypothesis, glossary([]));

    // assert
    assert.equal(refused, true);
  });

  it('refuses a confirmed evaluation whose citations list is explicitly empty, the same as one carrying none at all', () => {
    // arrange
    const evaluation = confirmedEvaluation([]);
    const decidingHypothesis = hypothesis(DECIDED_HYPOTHESIS, [COLLECTED_CONCEPT_NAME]);

    // act
    const refused = isRefusedForItsCitations(evaluation, decidingHypothesis, glossary([]));

    // assert
    assert.equal(refused, true);
  });

  it('does not refuse an inconclusive evaluation carrying no citation', () => {
    // arrange
    const evaluation = inconclusiveEvaluation();
    const decidingHypothesis = hypothesis(DECIDED_HYPOTHESIS, [COLLECTED_CONCEPT_NAME]);

    // act
    const refused = isRefusedForItsCitations(evaluation, decidingHypothesis, glossary([]));

    // assert
    assert.equal(refused, false);
  });

  it('does not refuse an inconclusive evaluation for this rule, whatever its citations hold, proving the obligation is asymmetric', () => {
    // arrange
    //
    // Gives the inconclusive evaluation a citation that would fail every
    // cross-referencing check a decided evaluation is held to — a concept
    // the hypothesis does not collect at all — to prove the exemption for
    // an inconclusive verdict holds regardless of what it carries, not only
    // where it carries nothing.
    const evaluation = inconclusiveEvaluation([
      citation(UNCOLLECTED_CONCEPT_NAME, UNDECLARED_FIELD_NAME),
    ]);
    const decidingHypothesis = hypothesis(DECIDED_HYPOTHESIS, [COLLECTED_CONCEPT_NAME]);

    // act
    const refused = isRefusedForItsCitations(evaluation, decidingHypothesis, glossary([]));

    // assert
    assert.equal(refused, false);
  });

  it('refuses an evaluation citing a concept its hypothesis does not collect', () => {
    // arrange
    //
    // The cited value is not the exact name the hypothesis collects, which
    // is also what a citation "carrying an identifier" reduces to in this
    // base: concept and field are named and never carried any other way, so
    // a reference that is not the declared name simply fails this same
    // match.
    const evaluation = confirmedEvaluation([
      citation(UNCOLLECTED_CONCEPT_NAME, DECLARED_FIELD_NAME),
    ]);
    const decidingHypothesis = hypothesis(DECIDED_HYPOTHESIS, [COLLECTED_CONCEPT_NAME]);
    const publishedGlossary = glossary([concept(UNCOLLECTED_CONCEPT_NAME, [DECLARED_FIELD_NAME])]);

    // act
    const refused = isRefusedForItsCitations(evaluation, decidingHypothesis, publishedGlossary);

    // assert
    assert.equal(refused, true);
  });

  it('refuses an evaluation citing a field the cited concept does not declare', () => {
    // arrange
    //
    // The cited field is not the exact name the concept declares, which is
    // the same "not the declared name" refusal a carried identifier would
    // fail on, since a field is named and never carried any other way.
    const evaluation = confirmedEvaluation([
      citation(COLLECTED_CONCEPT_NAME, UNDECLARED_FIELD_NAME),
    ]);
    const decidingHypothesis = hypothesis(DECIDED_HYPOTHESIS, [COLLECTED_CONCEPT_NAME]);
    const publishedGlossary = glossary([concept(COLLECTED_CONCEPT_NAME, [DECLARED_FIELD_NAME])]);

    // act
    const refused = isRefusedForItsCitations(evaluation, decidingHypothesis, publishedGlossary);

    // assert
    assert.equal(refused, true);
  });

  it('is not refused by this rule when every citation names a collected concept and a field that concept declares', () => {
    // arrange
    const evaluation = confirmedEvaluation([
      citation(COLLECTED_CONCEPT_NAME, DECLARED_FIELD_NAME),
      citation(OTHER_COLLECTED_CONCEPT_NAME, OTHER_DECLARED_FIELD_NAME),
    ]);
    const decidingHypothesis = hypothesis(DECIDED_HYPOTHESIS, [
      COLLECTED_CONCEPT_NAME,
      OTHER_COLLECTED_CONCEPT_NAME,
    ]);
    const publishedGlossary = glossary([
      concept(COLLECTED_CONCEPT_NAME, [DECLARED_FIELD_NAME]),
      concept(OTHER_COLLECTED_CONCEPT_NAME, [OTHER_DECLARED_FIELD_NAME]),
    ]);

    // act
    const refused = isRefusedForItsCitations(evaluation, decidingHypothesis, publishedGlossary);

    // assert
    assert.equal(refused, false);
  });

  it('refuses an evaluation where only one of several citations is invalid, one bad citation being enough', () => {
    // arrange
    const evaluation = confirmedEvaluation([
      citation(COLLECTED_CONCEPT_NAME, DECLARED_FIELD_NAME),
      citation(UNCOLLECTED_CONCEPT_NAME, DECLARED_FIELD_NAME),
    ]);
    const decidingHypothesis = hypothesis(DECIDED_HYPOTHESIS, [COLLECTED_CONCEPT_NAME]);
    const publishedGlossary = glossary([
      concept(COLLECTED_CONCEPT_NAME, [DECLARED_FIELD_NAME]),
      concept(UNCOLLECTED_CONCEPT_NAME, [DECLARED_FIELD_NAME]),
    ]);

    // act
    const refused = isRefusedForItsCitations(evaluation, decidingHypothesis, publishedGlossary);

    // assert
    assert.equal(refused, true);
  });

  it('is not refused by this rule for citing a concept the given glossary does not publish', () => {
    // arrange
    //
    // Pins the implementation's own recorded inference: an unpublished
    // concept has no declared field to fail against one way or the other,
    // and the refusal for an absent term belongs to the
    // terms-exist-in-the-glossary check, not this one — the same convention
    // its sibling case-validator checks already follow.
    const evaluation = confirmedEvaluation([
      citation(UNPUBLISHED_CONCEPT_NAME, UNDECLARED_FIELD_NAME),
    ]);
    const decidingHypothesis = hypothesis(DECIDED_HYPOTHESIS, [UNPUBLISHED_CONCEPT_NAME]);

    // act
    const refused = isRefusedForItsCitations(evaluation, decidingHypothesis, glossary([]));

    // assert
    assert.equal(refused, false);
  });

  it('reads the given hypothesis parameter for its collects list rather than checking its name against the evaluation', () => {
    // arrange
    //
    // Pins the implementation's own recorded inference: the evaluation names
    // DECIDED_HYPOTHESIS, but the hypothesis parameter handed in is named
    // OTHER_HYPOTHESIS and collects the cited concept. A check that
    // compared the two names before trusting the collects list would refuse
    // this evaluation; this one does not.
    const evaluation = confirmedEvaluation([citation(COLLECTED_CONCEPT_NAME, DECLARED_FIELD_NAME)]);
    const mismatchedHypothesis = hypothesis(OTHER_HYPOTHESIS, [COLLECTED_CONCEPT_NAME]);
    const publishedGlossary = glossary([concept(COLLECTED_CONCEPT_NAME, [DECLARED_FIELD_NAME])]);

    // act
    const refused = isRefusedForItsCitations(evaluation, mismatchedHypothesis, publishedGlossary);

    // assert
    assert.equal(refused, false);
  });
});
