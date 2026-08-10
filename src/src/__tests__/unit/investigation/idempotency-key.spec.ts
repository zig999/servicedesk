// Proof for task/subject-identity-rework/idempotency-key-subject-attributes:
// idempotencyKeyOf's canonical form over the subject's whole attribute-value
// set — carried as `subject: Subject`, the canonical type-plus-attributes
// shape, rather than the retired flat `subjectType`/`subjectId` strings —
// together with case reference and ticket reference. Deterministic wherever
// every one of the four components repeats (subject type, the whole
// attribute-value set, case reference, ticket reference), and distinct the
// moment any one of them differs on its own, so two requests
// rules/investigation/an-investigation-is-idempotent-within-a-window treats
// as different are never confused as one.
import { expect, it } from 'vitest';
import { idempotencyKeyOf, type IdempotencyKey } from '../../../investigation/idempotency-key.js';
import type { Subject } from '../../../investigation/subject.js';

/** A subject with two attribute-value pairs, so a set-level change (an added, removed or altered pair) is distinguishable from a change to a single flat field. */
const A_SUBJECT: Subject = {
  type: 'ont',
  attributes: [
    { attribute: 'id', value: '12345' },
    { attribute: 'phone', value: '555-0100' },
  ],
};

/** A key with every one of its four components distinct from any variant below, so varying exactly one at a time is unambiguous about which changed. */
const A_KEY: IdempotencyKey = {
  subject: A_SUBJECT,
  caseReference: 'case-one',
  ticketRef: 'ticket-one',
};

// ---------------------------------------------------- criterion 1: all four components repeat

it('answers the identical string for two keys carrying the same subject type, the same whole attribute-value set, case reference and ticket reference', () => {
  const repeated: IdempotencyKey = {
    subject: { type: A_SUBJECT.type, attributes: [...A_SUBJECT.attributes] },
    caseReference: A_KEY.caseReference,
    ticketRef: A_KEY.ticketRef,
  };

  expect(idempotencyKeyOf(repeated)).toBe(idempotencyKeyOf(A_KEY));
});

// ------------------------------------------- criterion 2: the attribute-value set differs

it("answers a different string when a subject attribute-value pair's value differs, even sharing the same subject type and case", () => {
  const varied: IdempotencyKey = {
    ...A_KEY,
    subject: {
      type: A_SUBJECT.type,
      attributes: [
        { attribute: 'id', value: '99999' },
        { attribute: 'phone', value: '555-0100' },
      ],
    },
  };

  expect(idempotencyKeyOf(varied)).not.toBe(idempotencyKeyOf(A_KEY));
});

it('answers a different string when the subject carries an extra attribute-value pair, even sharing the same subject type and case', () => {
  const varied: IdempotencyKey = {
    ...A_KEY,
    subject: {
      type: A_SUBJECT.type,
      attributes: [...A_SUBJECT.attributes, { attribute: 'email', value: 'a@example.com' }],
    },
  };

  expect(idempotencyKeyOf(varied)).not.toBe(idempotencyKeyOf(A_KEY));
});

it('answers a different string when the subject carries only a subset of the seeded attribute-value pairs, even sharing the same subject type and case', () => {
  const varied: IdempotencyKey = {
    ...A_KEY,
    subject: {
      type: A_SUBJECT.type,
      attributes: [A_SUBJECT.attributes[0]],
    },
  };

  expect(idempotencyKeyOf(varied)).not.toBe(idempotencyKeyOf(A_KEY));
});

it("answers a different string when an attribute-value pair's attribute name differs while its value stays the same, even sharing the same subject type and case", () => {
  const varied: IdempotencyKey = {
    ...A_KEY,
    subject: {
      type: A_SUBJECT.type,
      attributes: [
        { attribute: 'identifier', value: '12345' },
        { attribute: 'phone', value: '555-0100' },
      ],
    },
  };

  expect(idempotencyKeyOf(varied)).not.toBe(idempotencyKeyOf(A_KEY));
});

// -------------------------------------- inference: no canonical attribute order is applied

it('answers a different string when the same attribute-value pairs appear in a different order, since no canonical order is applied before they are joined', () => {
  const varied: IdempotencyKey = {
    ...A_KEY,
    subject: {
      type: A_SUBJECT.type,
      attributes: [A_SUBJECT.attributes[1], A_SUBJECT.attributes[0]],
    },
  };

  expect(idempotencyKeyOf(varied)).not.toBe(idempotencyKeyOf(A_KEY));
});

// ----------------------------------- inference: subject nests as one Subject, not a flat pair

it('carries the subject as one nested Subject value alongside caseReference and ticketRef, not a flat subjectType or subjectId field', () => {
  expect(Object.keys(A_KEY).sort()).toEqual(['caseReference', 'subject', 'ticketRef']);
});

// ------ the UNDERDETERMINED note's own bad implementation: attributes alone would still pass
// criteria 1 and 2 as literally written. These three tests fail over exactly that
// implementation, which hashes only the attribute-value set and ignores subject type, case
// and ticket reference.

it('answers a different string when only the subject type differs, the whole attribute-value set, case reference and ticket reference held fixed', () => {
  const varied: IdempotencyKey = {
    ...A_KEY,
    subject: { type: 'ope', attributes: A_SUBJECT.attributes },
  };

  expect(idempotencyKeyOf(varied)).not.toBe(idempotencyKeyOf(A_KEY));
});

it('answers a different string when only the case reference differs, the subject and ticket reference held fixed', () => {
  const varied: IdempotencyKey = { ...A_KEY, caseReference: 'case-two' };

  expect(idempotencyKeyOf(varied)).not.toBe(idempotencyKeyOf(A_KEY));
});

it('answers a different string when only the ticket reference differs, the subject and case reference held fixed', () => {
  const varied: IdempotencyKey = { ...A_KEY, ticketRef: 'ticket-two' };

  expect(idempotencyKeyOf(varied)).not.toBe(idempotencyKeyOf(A_KEY));
});

// ---------------------------------------------------------- edge case: no attribute at all

it('composes a stable key for two keys whose subject carries no attribute-value pair at all', () => {
  const zeroAttributeKey: IdempotencyKey = {
    subject: { type: 'ont', attributes: [] },
    caseReference: 'case-one',
    ticketRef: 'ticket-one',
  };
  const repeated: IdempotencyKey = {
    subject: { type: 'ont', attributes: [] },
    caseReference: 'case-one',
    ticketRef: 'ticket-one',
  };

  expect(idempotencyKeyOf(zeroAttributeKey)).toBe(idempotencyKeyOf(repeated));
});
