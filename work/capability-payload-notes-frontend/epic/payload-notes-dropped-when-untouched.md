---
title: An untouched but previously-declared payload_notes survives resubmission
summary: 'Corrective increment: both capability form hooks must forward an untouched but previously-loaded
  payload_notes value unconditionally on submission, the same as every other declared attribute, instead
  of dropping it from the PUT body whenever the operator did not personally edit it this session.'
rationale: The wrong behavior was observed identically in two delivered files, outside any task's criteria;
  the claim is seeded mechanically from trace.py --encodes over both files the human named.
sources:
- work/capability-payload-notes-frontend/intake/payload-notes-dropped-when-untouched.md
covers:
- contracts/integration/capability-registry
- domain/integration/capability
- domain/integration/capability-registry
- rules/integration/a-capability-declares-its-contract
- rules/integration/a-capability-declares-well-formed-schemas
- rules/integration/a-capability-is-read-only
- rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed
- rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
- rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
- rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading
- rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
- rules/integration/an-abandoned-capability-registration-entry-registers-nothing
- rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
- rules/integration/one-capability-answers-one-concept
uncovered:
- node: contracts/integration/capability-registry
  why: This corrective increment answers only the untouched-payload_notes-forwarding fact; this node's
    other clauses reach no criterion of this one-behavior correction.
- node: domain/integration/capability-registry
  why: This corrective increment answers only the untouched-payload_notes-forwarding fact; this node's
    other clauses reach no criterion of this one-behavior correction.
- node: rules/integration/a-capability-declares-its-contract
  why: This corrective increment answers only the untouched-payload_notes-forwarding fact; this node's
    other clauses reach no criterion of this one-behavior correction.
- node: rules/integration/a-capability-declares-well-formed-schemas
  why: This corrective increment answers only the untouched-payload_notes-forwarding fact; this node's
    other clauses reach no criterion of this one-behavior correction.
- node: rules/integration/a-capability-is-read-only
  why: This corrective increment answers only the untouched-payload_notes-forwarding fact; this node's
    other clauses reach no criterion of this one-behavior correction.
- node: rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed
  why: This corrective increment answers only the untouched-payload_notes-forwarding fact; this node's
    other clauses reach no criterion of this one-behavior correction.
- node: rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
  why: This corrective increment answers only the untouched-payload_notes-forwarding fact; this node's
    other clauses reach no criterion of this one-behavior correction.
- node: rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
  why: This corrective increment answers only the untouched-payload_notes-forwarding fact; this node's
    other clauses reach no criterion of this one-behavior correction.
- node: rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading
  why: This corrective increment answers only the untouched-payload_notes-forwarding fact; this node's
    other clauses reach no criterion of this one-behavior correction.
- node: rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
  why: This corrective increment answers only the untouched-payload_notes-forwarding fact; this node's
    other clauses reach no criterion of this one-behavior correction.
- node: rules/integration/an-abandoned-capability-registration-entry-registers-nothing
  why: This corrective increment answers only the untouched-payload_notes-forwarding fact; this node's
    other clauses reach no criterion of this one-behavior correction.
- node: rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
  why: This corrective increment answers only the untouched-payload_notes-forwarding fact; this node's
    other clauses reach no criterion of this one-behavior correction.
- node: rules/integration/one-capability-answers-one-concept
  why: This corrective increment answers only the untouched-payload_notes-forwarding fact; this node's
    other clauses reach no criterion of this one-behavior correction.
---
## What it is

Both use-capability-form.ts and use-capability-detail.ts gate payload_notes's inclusion in the
submitted PUT body on react-hook-form's dirtyFields, unlike every other declared attribute.

## Notes

None.
