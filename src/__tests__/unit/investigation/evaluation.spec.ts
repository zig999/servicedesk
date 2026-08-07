import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Citation } from '../../../investigation/citation';
import type { Evaluation, InconclusiveReason, Verdict } from '../../../investigation/evaluation';
import { createEvaluation } from '../../../investigation/evaluation';

/**
 * Proves `task/published-case/evaluation-record` over
 * `src/investigation/evaluation.ts`, together with the citation round-trip
 * `task/published-case/evaluation-citations` adds to the same constructor.
 *
 * The hypothesis names below are placeholders, chosen only to be
 * distinguishable from one another: an evaluation binds its hypothesis by
 * identity and never checks the name, so nothing here asserts which names
 * exist. The verdict and reason values are not placeholders — both
 * vocabularies are closed and the base's own — and each constant is bound to
 * the exported type it belongs to, so a vocabulary the implementation moved
 * fails to compile here rather than passing against a copy of it.
 *
 * The citation concept and field names below are placeholders too: this
 * constructor never checks a citation against a hypothesis's collects list
 * or a concept's declared fields — that obligation is
 * rule/investigation/a-decided-evaluation-cites-evidence, checked by
 * src/investigation/a-decided-evaluation-cites-evidence.ts and proved in its
 * own spec file — so nothing here asserts which concepts or fields exist.
 */
const DECIDED_HYPOTHESIS = 'hypothesis-placeholder-a';
const EARLIER_CONFIRMED_HYPOTHESIS = 'hypothesis-placeholder-b';
const SECOND_NAMED_HYPOTHESIS = 'hypothesis-placeholder-second';

const CITED_CONCEPT_NAME = 'concept-placeholder-cited';
const OTHER_CITED_CONCEPT_NAME = 'concept-placeholder-cited-other';
const CITED_FIELD_NAME = 'field-placeholder-cited';
const OTHER_CITED_FIELD_NAME = 'field-placeholder-cited-other';

/**
 * A fresh citation per call, so no test's fixture shares an object identity
 * with another's — mutation-resistance tests below need to mutate one
 * instance without disturbing what a different call built.
 */
function citation(concept: string, field: string): Citation {
  return { concept, field };
}

const CONFIRMED_VERDICT: Verdict = 'confirmed';
const REFUTED_VERDICT: Verdict = 'refuted';
const INCONCLUSIVE_VERDICT: Verdict = 'inconclusive';

const NO_DATA_REASON: InconclusiveReason = 'no-data';
const JUDGMENT_FAILURE_REASON: InconclusiveReason = 'judgment-failure';
const DEADLINE_EXHAUSTED_REASON: InconclusiveReason = 'deadline-exhausted';

/**
 * Parts arriving the way an unchecked construction arrives at runtime:
 * through parsing, typed as an evaluation while carrying only whatever the
 * text held. The verdict refusal exists for exactly such a caller — the
 * parameter's own type already requires a verdict of a checked one — and no
 * type assertion stands in for the shape the refusal tests below
 * deliberately withhold.
 */
function parsedEvaluationParts(text: string): Evaluation {
  return JSON.parse(text);
}

describe('createEvaluation', () => {
  it('reads back the name of the one hypothesis it decided', () => {
    // arrange
    const parts = { hypothesis: DECIDED_HYPOTHESIS, verdict: CONFIRMED_VERDICT };

    // act
    const evaluation = createEvaluation(parts);

    // assert
    assert.equal(evaluation.hypothesis, DECIDED_HYPOTHESIS);
  });

  it('carries only one hypothesis name when it is handed a part naming a second one', () => {
    // arrange
    const partsNamingASecondName = {
      hypothesis: DECIDED_HYPOTHESIS,
      verdict: CONFIRMED_VERDICT,
      secondHypothesis: SECOND_NAMED_HYPOTHESIS,
    };

    // act
    const evaluation = createEvaluation(partsNamingASecondName);

    // assert
    const slotsBesideTheVerdictAndItsReason = Object.keys(evaluation).filter(
      (part) => part !== 'verdict' && part !== 'reason',
    );
    assert.deepEqual(slotsBesideTheVerdictAndItsReason, ['hypothesis']);
  });

  it('refuses a construction that gives no verdict, naming the verdict as what is absent', () => {
    // arrange
    const partsGivingNoVerdict = parsedEvaluationParts(
      `{"hypothesis":"${DECIDED_HYPOTHESIS}"}`,
    );

    // act
    const constructing = (): Evaluation => createEvaluation(partsGivingNoVerdict);

    // assert
    assert.throws(
      constructing,
      (thrown: unknown) => thrown instanceof Error && thrown.message.includes('verdict'),
    );
  });

  it('refuses a construction whose parsed verdict is null the same way as one giving none', () => {
    // arrange
    const partsParsedWithANullVerdict = parsedEvaluationParts(
      `{"hypothesis":"${DECIDED_HYPOTHESIS}","verdict":null}`,
    );

    // act
    const constructing = (): Evaluation => createEvaluation(partsParsedWithANullVerdict);

    // assert
    assert.throws(
      constructing,
      (thrown: unknown) => thrown instanceof Error && thrown.message.includes('verdict'),
    );
  });

  it('reads each of the three verdicts back as the verdict it was given', () => {
    // arrange
    const hypothesis = DECIDED_HYPOTHESIS;

    // act
    const confirmed = createEvaluation({ hypothesis, verdict: CONFIRMED_VERDICT });
    const refuted = createEvaluation({ hypothesis, verdict: REFUTED_VERDICT });
    const inconclusive = createEvaluation({
      hypothesis,
      verdict: INCONCLUSIVE_VERDICT,
      reason: NO_DATA_REASON,
    });

    // assert
    assert.deepEqual(
      [confirmed.verdict, refuted.verdict, inconclusive.verdict],
      [CONFIRMED_VERDICT, REFUTED_VERDICT, INCONCLUSIVE_VERDICT],
    );
  });

  it('reads back why it could not decide when the verdict it carries is inconclusive', () => {
    // arrange
    const parts = {
      hypothesis: DECIDED_HYPOTHESIS,
      verdict: INCONCLUSIVE_VERDICT,
      reason: JUDGMENT_FAILURE_REASON,
    };

    // act
    const evaluation = createEvaluation(parts);

    // assert
    assert.equal(evaluation.reason, JUDGMENT_FAILURE_REASON);
  });

  it('reads each of the three declared reasons back as the reason it was given', () => {
    // arrange
    //
    // An absent fact, a failed judgement and an exhausted deadline are three
    // different things and never one
    // (rule/investigation/an-inconclusive-evaluation-declares-its-reason), so
    // each is constructed and read back alone: a construction collapsing two
    // of them reads back a reason no judging produced.
    const declaredReasons = [NO_DATA_REASON, JUDGMENT_FAILURE_REASON, DEADLINE_EXHAUSTED_REASON];

    // act
    const evaluations = declaredReasons.map((reason) =>
      createEvaluation({
        hypothesis: DECIDED_HYPOTHESIS,
        verdict: INCONCLUSIVE_VERDICT,
        reason,
      }),
    );

    // assert
    assert.deepEqual(
      evaluations.map((evaluation) => evaluation.reason),
      declaredReasons,
    );
  });

  it('refuses an inconclusive construction that declares no reason, naming the reason as what is absent', () => {
    // arrange
    const partsGivingNoReason = { hypothesis: DECIDED_HYPOTHESIS, verdict: INCONCLUSIVE_VERDICT };

    // act
    const constructing = (): Evaluation => createEvaluation(partsGivingNoReason);

    // assert
    assert.throws(
      constructing,
      (thrown: unknown) => thrown instanceof Error && thrown.message.includes('reason'),
    );
  });

  it('reads back a reason given beside a confirmed verdict rather than refusing it', () => {
    // arrange
    //
    // Pins the implementation's recorded inference that the reason slot is
    // optional and carried as given: no bound rule reaches a decided
    // verdict's reason, so the constructor neither refuses nor drops one.
    const parts = {
      hypothesis: DECIDED_HYPOTHESIS,
      verdict: CONFIRMED_VERDICT,
      reason: NO_DATA_REASON,
    };

    // act
    const evaluation = createEvaluation(parts);

    // assert
    assert.equal(evaluation.reason, NO_DATA_REASON);
  });

  it('reads back no reason when a confirmed construction gave none', () => {
    // arrange
    const parts = { hypothesis: DECIDED_HYPOTHESIS, verdict: CONFIRMED_VERDICT };

    // act
    const evaluation = createEvaluation(parts);

    // assert
    assert.equal(evaluation.reason, undefined);
  });

  it('reads back the verdict it received when an evaluation of an earlier hypothesis has already confirmed', () => {
    // arrange
    const earlierEvaluation = createEvaluation({
      hypothesis: EARLIER_CONFIRMED_HYPOTHESIS,
      verdict: CONFIRMED_VERDICT,
    });

    // act
    const laterEvaluation = createEvaluation({
      hypothesis: DECIDED_HYPOTHESIS,
      verdict: REFUTED_VERDICT,
    });

    // assert
    assert.deepEqual(
      [earlierEvaluation.verdict, laterEvaluation.verdict],
      [CONFIRMED_VERDICT, REFUTED_VERDICT],
    );
  });

  it('keeps the verdict it received when a later writer attempts to mark it superseded', () => {
    // arrange
    const evaluation = createEvaluation({
      hypothesis: DECIDED_HYPOTHESIS,
      verdict: REFUTED_VERDICT,
    });

    // act
    const markingItSuperseded = (): Evaluation =>
      Object.assign(evaluation, { verdict: CONFIRMED_VERDICT });

    // assert
    assert.throws(markingItSuperseded, TypeError);
    assert.equal(evaluation.verdict, REFUTED_VERDICT);
  });

  it('reads back the verdict it was constructed with after the parts handed in are changed', () => {
    // arrange
    const handedInParts = { hypothesis: DECIDED_HYPOTHESIS, verdict: CONFIRMED_VERDICT };
    const evaluation = createEvaluation(handedInParts);

    // act
    handedInParts.verdict = REFUTED_VERDICT;

    // assert
    assert.equal(evaluation.verdict, CONFIRMED_VERDICT);
  });

  it('reads back at least one citation given to a confirmed evaluation', () => {
    // arrange
    const parts = {
      hypothesis: DECIDED_HYPOTHESIS,
      verdict: CONFIRMED_VERDICT,
      citations: [citation(CITED_CONCEPT_NAME, CITED_FIELD_NAME)],
    };

    // act
    const evaluation = createEvaluation(parts);

    // assert
    assert.deepEqual(evaluation.citations, [citation(CITED_CONCEPT_NAME, CITED_FIELD_NAME)]);
  });

  it('reads back at least one citation given to a refuted evaluation', () => {
    // arrange
    const parts = {
      hypothesis: DECIDED_HYPOTHESIS,
      verdict: REFUTED_VERDICT,
      citations: [citation(CITED_CONCEPT_NAME, CITED_FIELD_NAME)],
    };

    // act
    const evaluation = createEvaluation(parts);

    // assert
    assert.deepEqual(evaluation.citations, [citation(CITED_CONCEPT_NAME, CITED_FIELD_NAME)]);
  });

  it('reads back the concept and the field of a citation, each by the exact name given', () => {
    // arrange
    const parts = {
      hypothesis: DECIDED_HYPOTHESIS,
      verdict: CONFIRMED_VERDICT,
      citations: [citation(CITED_CONCEPT_NAME, CITED_FIELD_NAME)],
    };

    // act
    const evaluation = createEvaluation(parts);

    // assert
    assert.deepEqual(evaluation.citations![0], {
      concept: CITED_CONCEPT_NAME,
      field: CITED_FIELD_NAME,
    });
  });

  it('reads back every citation given, in the order given', () => {
    // arrange
    const first = citation(CITED_CONCEPT_NAME, CITED_FIELD_NAME);
    const second = citation(OTHER_CITED_CONCEPT_NAME, OTHER_CITED_FIELD_NAME);
    const parts = {
      hypothesis: DECIDED_HYPOTHESIS,
      verdict: CONFIRMED_VERDICT,
      citations: [first, second],
    };

    // act
    const evaluation = createEvaluation(parts);

    // assert
    assert.deepEqual(evaluation.citations, [first, second]);
  });

  it('reads back an empty list of citations when a construction gives one, refusing nothing for it', () => {
    // arrange
    //
    // Pins the implementation's own inference: the obligation to carry at
    // least one citation, and every cross-referencing check, is enforced
    // entirely by the standalone rule/investigation/a-decided-evaluation-cites-evidence
    // check rather than here, so this constructor accepts an empty citations
    // list exactly as given rather than refusing it.
    const parts = { hypothesis: DECIDED_HYPOTHESIS, verdict: CONFIRMED_VERDICT, citations: [] };

    // act
    const evaluation = createEvaluation(parts);

    // assert
    assert.deepEqual(evaluation.citations, []);
  });

  it('constructs a confirmed evaluation giving no citations without refusing it', () => {
    // arrange
    //
    // Pins the same inference from the other side: a construction giving no
    // citations at all is not refused either, because the citation
    // obligation is not this constructor's to enforce.
    const constructing = (): Evaluation =>
      createEvaluation({ hypothesis: DECIDED_HYPOTHESIS, verdict: CONFIRMED_VERDICT });

    // act & assert
    assert.doesNotThrow(constructing);
  });

  it('omits the citations key entirely when a construction gives none', () => {
    // arrange
    const parts = { hypothesis: DECIDED_HYPOTHESIS, verdict: CONFIRMED_VERDICT };

    // act
    const evaluation = createEvaluation(parts);

    // assert
    //
    // Pins the implementation's own inference: the already-delivered
    // key-enumeration assertion elsewhere in this file
    // (`Object.keys(evaluation).filter(...)` equalling `['hypothesis']`)
    // keeps holding only because no citations key is added when none is
    // given.
    assert.equal('citations' in evaluation, false);
  });

  it('reads back the citations key when a construction gives citations', () => {
    // arrange
    const parts = {
      hypothesis: DECIDED_HYPOTHESIS,
      verdict: CONFIRMED_VERDICT,
      citations: [citation(CITED_CONCEPT_NAME, CITED_FIELD_NAME)],
    };

    // act
    const evaluation = createEvaluation(parts);

    // assert
    assert.equal('citations' in evaluation, true);
  });

  it('reads back its citations unchanged after the array handed in for them is mutated', () => {
    // arrange
    const handedInCitations = [citation(CITED_CONCEPT_NAME, CITED_FIELD_NAME)];
    const evaluation = createEvaluation({
      hypothesis: DECIDED_HYPOTHESIS,
      verdict: CONFIRMED_VERDICT,
      citations: handedInCitations,
    });

    // act
    handedInCitations.push(citation(OTHER_CITED_CONCEPT_NAME, OTHER_CITED_FIELD_NAME));

    // assert
    assert.deepEqual(evaluation.citations, [citation(CITED_CONCEPT_NAME, CITED_FIELD_NAME)]);
  });

  it('reads back a citation unchanged after the object handed in for it is mutated', () => {
    // arrange
    const handedInCitation = { concept: CITED_CONCEPT_NAME, field: CITED_FIELD_NAME };
    const evaluation = createEvaluation({
      hypothesis: DECIDED_HYPOTHESIS,
      verdict: CONFIRMED_VERDICT,
      citations: [handedInCitation],
    });

    // act
    handedInCitation.concept = OTHER_CITED_CONCEPT_NAME;

    // assert
    assert.deepEqual(evaluation.citations, [
      { concept: CITED_CONCEPT_NAME, field: CITED_FIELD_NAME },
    ]);
  });

  it('refuses a mutation attempt on a citation read back, keeping the value it was constructed with', () => {
    // arrange
    const evaluation = createEvaluation({
      hypothesis: DECIDED_HYPOTHESIS,
      verdict: CONFIRMED_VERDICT,
      citations: [citation(CITED_CONCEPT_NAME, CITED_FIELD_NAME)],
    });

    // act
    const mutating = (): Citation =>
      Object.assign(evaluation.citations![0], { concept: OTHER_CITED_CONCEPT_NAME });

    // assert
    assert.throws(mutating, TypeError);
    assert.equal(evaluation.citations![0].concept, CITED_CONCEPT_NAME);
  });
});
