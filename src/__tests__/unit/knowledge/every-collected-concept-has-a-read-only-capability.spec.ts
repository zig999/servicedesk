import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Capability } from '../../../integration/capability';
import type { ObservationField } from '../../../glossary/observation-field';
import { createEveryCollectedConceptHasAReadOnlyCapabilityCheck } from '../../../knowledge/every-collected-concept-has-a-read-only-capability';
import type { DraftCase } from '../../../knowledge/draft-case';
import type { Hypothesis } from '../../../knowledge/hypothesis';

/**
 * Proves `task/case-validator/read-only-capability` over
 * `src/knowledge/every-collected-concept-has-a-read-only-capability.ts`.
 *
 * Every name below is a placeholder, chosen only to be distinguishable from
 * the next one. The subject-type and concept vocabularies are open, and
 * nothing below asserts which members of either exist — each capabilities
 * list a test hands the check is arranged data standing where a registry of
 * capabilities would stand.
 *
 * The binding left the hypothesis's other fields — confirmsWhen and
 * resolution — and the case's own title, whenToUse and fallbacks unbound:
 * this check reads only draftCase.hypotheses[].collects and the given
 * capabilities' own concept, nature, timeout and outputSchema, so every value
 * built below carries just enough shape to be one case, one hypothesis or one
 * capability, never asserted on its own.
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

const FIRST_HYPOTHESIS_NAME = 'hypothesis-placeholder-a';
const SECOND_HYPOTHESIS_NAME = 'hypothesis-placeholder-b';

const ANSWERED_CONCEPT_NAME = 'concept-placeholder-answered';
const OTHER_ANSWERED_CONCEPT_NAME = 'concept-placeholder-answered-other';
const CASE_VARIANT_OF_ANSWERED_CONCEPT_NAME = 'Concept-Placeholder-Answered';
const UNANSWERED_CONCEPT_NAME = 'concept-placeholder-unanswered';
const SECOND_UNANSWERED_CONCEPT_NAME = 'concept-placeholder-unanswered-second';
const NAMED_BY_UNRELATED_CAPABILITY_CONCEPT_NAME = 'concept-placeholder-unrelated';

const DECLARED_CAPABILITY_NAME = 'capability-placeholder-name';
const OTHER_CAPABILITY_NAME = 'capability-placeholder-name-other';
const DECLARED_CAPABILITY_VERSION = 'version-placeholder-1';

const NEUTRAL_TIMEOUT = 1;
const ZERO_TIMEOUT = 0;
const NEUTRAL_OUTPUT_SCHEMA: readonly ObservationField[] = [{ name: 'field-placeholder-a' }];
const EMPTY_OUTPUT_SCHEMA: readonly ObservationField[] = [];

/**
 * The rule node's own path and its own stated requirement
 * (rule/knowledge/every-collected-concept-has-a-read-only-capability), quoted
 * rather than reworded — the same values the implementation record cites as
 * what the refusal names.
 */
const RULE_IDENTIFIER = 'rule/knowledge/every-collected-concept-has-a-read-only-capability';
const REFUSAL_TEXT =
  'A case MUST NOT be published while any concept it names has no registered read-only capability declaring an output schema and a timeout.';

/**
 * A fully-declaring, read-only capability for the given concept — name,
 * version, nature, timeout and output schema all present — overridable field
 * by field so a test can knock out exactly one declaring clause without
 * restating the rest.
 */
function readOnlyCapability(concept: string, overrides: Partial<Capability> = {}): Capability {
  return {
    name: DECLARED_CAPABILITY_NAME,
    version: DECLARED_CAPABILITY_VERSION,
    concept,
    nature: 'read-only',
    timeout: NEUTRAL_TIMEOUT,
    outputSchema: NEUTRAL_OUTPUT_SCHEMA,
    ...overrides,
  };
}

/**
 * A capability record exactly as a registry might hold one whose nature was
 * recorded as something other than read-only — the base's own registry rule
 * refuses this at registration time, but this check reads the field on the
 * record it was actually handed rather than trusting what the type promises,
 * the same caution the ttl-declaring sibling check takes.
 */
function nonReadOnlyCapability(concept: string): Capability {
  return readOnlyCapability(concept, {
    nature: 'not-read-only-placeholder' as unknown as Capability['nature'],
  });
}

/**
 * A capability record built without an outputSchema field at all: every
 * field the Capability shape otherwise requires, but this one omitted
 * outright rather than set to a value standing in for its absence — this
 * check reads presence on the record, so the fixture omits the field the
 * same way the ttl sibling's `conceptWithNoTtl` does.
 */
function readOnlyCapabilityWithNoOutputSchema(concept: string): Capability {
  return {
    name: DECLARED_CAPABILITY_NAME,
    version: DECLARED_CAPABILITY_VERSION,
    concept,
    nature: 'read-only',
    timeout: NEUTRAL_TIMEOUT,
  } as Capability;
}

/**
 * A capability record built without a timeout field at all, the same
 * omission as above but over the other declaring clause.
 */
function readOnlyCapabilityWithNoTimeout(concept: string): Capability {
  return {
    name: DECLARED_CAPABILITY_NAME,
    version: DECLARED_CAPABILITY_VERSION,
    concept,
    nature: 'read-only',
    outputSchema: NEUTRAL_OUTPUT_SCHEMA,
  } as Capability;
}

/**
 * A capability record that is itself callable and throws when called — no
 * real registration takes this shape, and it exists only to make an
 * invocation of the capability observable. A Proxy over a plain function,
 * rather than properties assigned onto the function directly, because a
 * function's own `name` descriptor is not writable and assigning over it
 * would throw for a reason this test does not mean to exercise; the `get`
 * and `has` traps below answer every field read and every `in` check exactly
 * as the ordinary fixture would, so a check that only reads them decides the
 * same way it would over an ordinary record, and only a check that calls the
 * proxy as a function reaches the `apply` trap and fails this test on that
 * throw.
 */
function capabilityThatThrowsIfInvoked(concept: string): Capability {
  const fields: Record<string, unknown> = { ...readOnlyCapability(concept) };
  const target = function (): void {
    // never reached other than through the apply trap below
  };
  return new Proxy(target, {
    get(currentTarget, property, receiver): unknown {
      if (Object.prototype.hasOwnProperty.call(fields, property)) {
        return fields[property as string];
      }
      return Reflect.get(currentTarget, property, receiver);
    },
    has(currentTarget, property): boolean {
      return (
        Object.prototype.hasOwnProperty.call(fields, property) ||
        Reflect.has(currentTarget, property)
      );
    },
    apply(): never {
      throw new Error('the capability record was invoked as a function');
    },
  }) as unknown as Capability;
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

/**
 * A draft case built the same way as `draftCase`, except its declared
 * subjectType is a getter that throws when read. Deciding this check never
 * derives anything from the case's subject, so a check that read it anyway
 * fails this fixture's tests on that throw rather than on a wrong answer.
 */
function draftCaseWithGuardedSubjectType(hypotheses: readonly Hypothesis[]): DraftCase {
  const withoutSubjectType: Record<string, unknown> = { ...draftCase(hypotheses) };
  delete withoutSubjectType.subjectType;
  Object.defineProperty(withoutSubjectType, 'subjectType', {
    enumerable: true,
    get(): never {
      throw new Error('the case\'s declared subject type was read');
    },
  });
  return withoutSubjectType as DraftCase;
}

describe('createEveryCollectedConceptHasAReadOnlyCapabilityCheck', () => {
  it('refuses a case collecting a concept when no capability is registered at all', () => {
    // arrange
    const check = createEveryCollectedConceptHasAReadOnlyCapabilityCheck([]);
    const draft = draftCase([hypothesis(FIRST_HYPOTHESIS_NAME, [UNANSWERED_CONCEPT_NAME])]);

    // act
    const answered = check(draft);

    // assert
    assert.notEqual(answered.length, 0);
  });

  it('refuses a case collecting a concept that no registered capability names', () => {
    // arrange
    const unrelated = readOnlyCapability(NAMED_BY_UNRELATED_CAPABILITY_CONCEPT_NAME);
    const check = createEveryCollectedConceptHasAReadOnlyCapabilityCheck([unrelated]);
    const draft = draftCase([hypothesis(FIRST_HYPOTHESIS_NAME, [UNANSWERED_CONCEPT_NAME])]);

    // act
    const answered = check(draft);

    // assert
    assert.notEqual(answered.length, 0);
  });

  it('refuses a case collecting a concept whose only naming capability is not read-only', () => {
    // arrange
    const notReadOnly = nonReadOnlyCapability(ANSWERED_CONCEPT_NAME);
    const check = createEveryCollectedConceptHasAReadOnlyCapabilityCheck([notReadOnly]);
    const draft = draftCase([hypothesis(FIRST_HYPOTHESIS_NAME, [ANSWERED_CONCEPT_NAME])]);

    // act
    const answered = check(draft);

    // assert
    assert.notEqual(answered.length, 0);
  });

  it("refuses a case collecting a concept whose only naming capability is read-only but declares no output schema, proving the check reads the rule's full statement rather than the read-only half alone", () => {
    // arrange
    //
    // Directly excludes the binding's first UNDERDETERMINED implementation:
    // a check that accepted any read-only capability regardless of its
    // declaring clauses would answer no refusal here, where the rule's own
    // statement still refuses.
    const missingOutputSchema = readOnlyCapabilityWithNoOutputSchema(ANSWERED_CONCEPT_NAME);
    const check = createEveryCollectedConceptHasAReadOnlyCapabilityCheck([missingOutputSchema]);
    const draft = draftCase([hypothesis(FIRST_HYPOTHESIS_NAME, [ANSWERED_CONCEPT_NAME])]);

    // act
    const answered = check(draft);

    // assert
    assert.notEqual(answered.length, 0);
  });

  it("refuses a case collecting a concept whose only naming capability is read-only but declares no timeout, over the other declaring clause the rule states", () => {
    // arrange
    //
    // The same exclusion as the output-schema test above, over the
    // timeout half of the rule's declaring clauses.
    const missingTimeout = readOnlyCapabilityWithNoTimeout(ANSWERED_CONCEPT_NAME);
    const check = createEveryCollectedConceptHasAReadOnlyCapabilityCheck([missingTimeout]);
    const draft = draftCase([hypothesis(FIRST_HYPOTHESIS_NAME, [ANSWERED_CONCEPT_NAME])]);

    // act
    const answered = check(draft);

    // assert
    assert.notEqual(answered.length, 0);
  });

  it('does not refuse a case whose every collected concept is answered by a registered read-only capability declaring both an output schema and a timeout', () => {
    // arrange
    const answering = readOnlyCapability(ANSWERED_CONCEPT_NAME);
    const otherAnswering = readOnlyCapability(OTHER_ANSWERED_CONCEPT_NAME);
    const check = createEveryCollectedConceptHasAReadOnlyCapabilityCheck([
      answering,
      otherAnswering,
    ]);
    const draft = draftCase([
      hypothesis(FIRST_HYPOTHESIS_NAME, [ANSWERED_CONCEPT_NAME]),
      hypothesis(SECOND_HYPOTHESIS_NAME, [OTHER_ANSWERED_CONCEPT_NAME]),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('does not refuse a concept whose answering capability declares a timeout of zero, deciding on presence rather than the value', () => {
    // arrange
    //
    // Zero is falsy in JavaScript; a check that tested the timeout's
    // truthiness instead of its presence would wrongly refuse a capability
    // that did declare one.
    const zeroTimeout = readOnlyCapability(ANSWERED_CONCEPT_NAME, { timeout: ZERO_TIMEOUT });
    const check = createEveryCollectedConceptHasAReadOnlyCapabilityCheck([zeroTimeout]);
    const draft = draftCase([hypothesis(FIRST_HYPOTHESIS_NAME, [ANSWERED_CONCEPT_NAME])]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('does not refuse a concept whose answering capability declares an empty output schema, deciding on presence rather than its contents', () => {
    // arrange
    const emptySchema = readOnlyCapability(ANSWERED_CONCEPT_NAME, {
      outputSchema: EMPTY_OUTPUT_SCHEMA,
    });
    const check = createEveryCollectedConceptHasAReadOnlyCapabilityCheck([emptySchema]);
    const draft = draftCase([hypothesis(FIRST_HYPOTHESIS_NAME, [ANSWERED_CONCEPT_NAME])]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('refuses a concept differing from a registered capability\'s declared concept only by letter case, matching by exact character comparison', () => {
    // arrange
    //
    // Directly excludes the binding's second UNDERDETERMINED implementation:
    // a check that matched case-insensitively would answer this concept as
    // answered, where the base's exact-name identity refuses that match.
    const answering = readOnlyCapability(ANSWERED_CONCEPT_NAME);
    const check = createEveryCollectedConceptHasAReadOnlyCapabilityCheck([answering]);
    const draft = draftCase([
      hypothesis(FIRST_HYPOTHESIS_NAME, [CASE_VARIANT_OF_ANSWERED_CONCEPT_NAME]),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.notEqual(answered.length, 0);
  });

  it("answers the refusal naming the rule, the offending hypothesis and concept, and the rule's own stated text", () => {
    // arrange
    const check = createEveryCollectedConceptHasAReadOnlyCapabilityCheck([]);
    const draft = draftCase([hypothesis(FIRST_HYPOTHESIS_NAME, [UNANSWERED_CONCEPT_NAME])]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      {
        rule: RULE_IDENTIFIER,
        hypothesis: FIRST_HYPOTHESIS_NAME,
        offendedTerm: UNANSWERED_CONCEPT_NAME,
        text: REFUSAL_TEXT,
      },
    ]);
  });

  it('refuses only the hypothesis whose collected concept has no answering capability, leaving the hypothesis whose concept is answered unrefused', () => {
    // arrange
    const answering = readOnlyCapability(ANSWERED_CONCEPT_NAME);
    const check = createEveryCollectedConceptHasAReadOnlyCapabilityCheck([answering]);
    const draft = draftCase([
      hypothesis(FIRST_HYPOTHESIS_NAME, [ANSWERED_CONCEPT_NAME]),
      hypothesis(SECOND_HYPOTHESIS_NAME, [UNANSWERED_CONCEPT_NAME]),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      {
        rule: RULE_IDENTIFIER,
        hypothesis: SECOND_HYPOTHESIS_NAME,
        offendedTerm: UNANSWERED_CONCEPT_NAME,
        text: REFUSAL_TEXT,
      },
    ]);
  });

  it('refuses only the concept within one hypothesis that has no answering capability, not the concept that is answered', () => {
    // arrange
    const answering = readOnlyCapability(ANSWERED_CONCEPT_NAME);
    const check = createEveryCollectedConceptHasAReadOnlyCapabilityCheck([answering]);
    const draft = draftCase([
      hypothesis(FIRST_HYPOTHESIS_NAME, [ANSWERED_CONCEPT_NAME, UNANSWERED_CONCEPT_NAME]),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      {
        rule: RULE_IDENTIFIER,
        hypothesis: FIRST_HYPOTHESIS_NAME,
        offendedTerm: UNANSWERED_CONCEPT_NAME,
        text: REFUSAL_TEXT,
      },
    ]);
  });

  it('produces one refusal per offending concept, in the order collected, when a hypothesis collects two concepts that are both unanswered', () => {
    // arrange
    const check = createEveryCollectedConceptHasAReadOnlyCapabilityCheck([]);
    const draft = draftCase([
      hypothesis(FIRST_HYPOTHESIS_NAME, [
        UNANSWERED_CONCEPT_NAME,
        SECOND_UNANSWERED_CONCEPT_NAME,
      ]),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      {
        rule: RULE_IDENTIFIER,
        hypothesis: FIRST_HYPOTHESIS_NAME,
        offendedTerm: UNANSWERED_CONCEPT_NAME,
        text: REFUSAL_TEXT,
      },
      {
        rule: RULE_IDENTIFIER,
        hypothesis: FIRST_HYPOTHESIS_NAME,
        offendedTerm: SECOND_UNANSWERED_CONCEPT_NAME,
        text: REFUSAL_TEXT,
      },
    ]);
  });

  it('produces one refusal per occurrence when a hypothesis collects the same unanswered concept twice', () => {
    // arrange
    //
    // Two identical offending names collected side by side: a check that
    // deduplicated by concept name would answer one refusal here where each
    // occurrence is its own position.
    const check = createEveryCollectedConceptHasAReadOnlyCapabilityCheck([]);
    const draft = draftCase([
      hypothesis(FIRST_HYPOTHESIS_NAME, [UNANSWERED_CONCEPT_NAME, UNANSWERED_CONCEPT_NAME]),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, [
      {
        rule: RULE_IDENTIFIER,
        hypothesis: FIRST_HYPOTHESIS_NAME,
        offendedTerm: UNANSWERED_CONCEPT_NAME,
        text: REFUSAL_TEXT,
      },
      {
        rule: RULE_IDENTIFIER,
        hypothesis: FIRST_HYPOTHESIS_NAME,
        offendedTerm: UNANSWERED_CONCEPT_NAME,
        text: REFUSAL_TEXT,
      },
    ]);
  });

  it('does not refuse a concept when one of two registered capabilities naming it is not fully declaring but the other is', () => {
    // arrange
    //
    // Two capabilities are registered for the same concept: the first is
    // read-only but declares no output schema, the second declares both. A
    // check that stopped at the first match rather than finding some
    // answering capability would wrongly refuse here.
    const partiallyDeclaring = readOnlyCapabilityWithNoOutputSchema(ANSWERED_CONCEPT_NAME);
    const fullyDeclaring = readOnlyCapability(ANSWERED_CONCEPT_NAME, {
      name: OTHER_CAPABILITY_NAME,
    });
    const check = createEveryCollectedConceptHasAReadOnlyCapabilityCheck([
      partiallyDeclaring,
      fullyDeclaring,
    ]);
    const draft = draftCase([hypothesis(FIRST_HYPOTHESIS_NAME, [ANSWERED_CONCEPT_NAME])]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('walks a case declaring no hypotheses without throwing, answering no refusal', () => {
    // arrange
    const check = createEveryCollectedConceptHasAReadOnlyCapabilityCheck([]);
    const draft = draftCase([]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('walks a hypothesis whose collects list is empty without throwing, answering no refusal for it', () => {
    // arrange
    const check = createEveryCollectedConceptHasAReadOnlyCapabilityCheck([]);
    const draft = draftCase([hypothesis(FIRST_HYPOTHESIS_NAME, [])]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it('freezes the array it answers with on the refusing path', () => {
    // arrange
    const check = createEveryCollectedConceptHasAReadOnlyCapabilityCheck([]);
    const draft = draftCase([hypothesis(FIRST_HYPOTHESIS_NAME, [UNANSWERED_CONCEPT_NAME])]);

    // act
    const answered = check(draft);

    // assert
    assert.equal(Object.isFrozen(answered), true);
  });

  it('freezes the array it answers with on the passing path', () => {
    // arrange
    const answering = readOnlyCapability(ANSWERED_CONCEPT_NAME);
    const check = createEveryCollectedConceptHasAReadOnlyCapabilityCheck([answering]);
    const draft = draftCase([hypothesis(FIRST_HYPOTHESIS_NAME, [ANSWERED_CONCEPT_NAME])]);

    // act
    const answered = check(draft);

    // assert
    assert.equal(Object.isFrozen(answered), true);
  });

  it('decides the check without invoking the capability record, even where the record could be invoked as a function', () => {
    // arrange
    //
    // Proves criterion 4 the way an assertion that merely reads well cannot:
    // the capability record given here is itself a callable that throws when
    // called. No real registration takes this shape — it exists only to make
    // an invocation observable. If the check ever called it as a function
    // rather than merely reading its declared fields, this test fails on
    // that throw rather than on a wrong answer.
    const invokableCapability = capabilityThatThrowsIfInvoked(ANSWERED_CONCEPT_NAME);
    const check = createEveryCollectedConceptHasAReadOnlyCapabilityCheck([invokableCapability]);
    const draft = draftCase([hypothesis(FIRST_HYPOTHESIS_NAME, [ANSWERED_CONCEPT_NAME])]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, []);
  });

  it("decides the check without reading the case's declared subject type", () => {
    // arrange
    //
    // The other half of criterion 4's own recorded reasoning — no derivation
    // from the case's subject. subjectType is a getter here that throws when
    // read, so a check that consulted it for any reason fails this test on
    // that throw rather than on a wrong answer.
    const answering = readOnlyCapability(ANSWERED_CONCEPT_NAME);
    const check = createEveryCollectedConceptHasAReadOnlyCapabilityCheck([answering]);
    const draft = draftCaseWithGuardedSubjectType([
      hypothesis(FIRST_HYPOTHESIS_NAME, [ANSWERED_CONCEPT_NAME]),
    ]);

    // act
    const answered = check(draft);

    // assert
    assert.deepEqual(answered, []);
  });
});
