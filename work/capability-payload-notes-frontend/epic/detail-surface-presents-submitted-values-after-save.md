---
title: The capability detail surface presents the registry's own answer after a save, not the submission
summary: 'Corrective increment: use-capability-detail.ts''s post-save reset must source the presented
  fields and schema baselines from the registry''s own PUT response, not from the values the submission
  carried.'
rationale: The wrong behavior was observed in delivered code, outside any task's criteria; the claim is
  seeded mechanically from trace.py --encodes over the one file the human named.
sources:
- work/capability-payload-notes-frontend/intake/detail-surface-presents-submitted-values-after-save.md
covers:
- contracts/integration/capability-registry
- domain/integration/capability
- rules/integration/a-capability-declares-its-contract
- rules/integration/a-capability-declares-well-formed-schemas
- rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed
- rules/integration/a-capability-keyed-surface-states-a-successful-registration-without-waiting-for-its-own-read
- rules/integration/a-submitted-capability-edit-stands-in-the-fields-until-that-surfaces-own-read-answers
- rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
- rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
- rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading
- rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
- rules/integration/an-abandoned-capability-registration-entry-registers-nothing
- rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
uncovered:
- node: contracts/integration/capability-registry
  why: This corrective increment answers only the post-save presentation source; this node's other clauses
    reach no criterion of this one-behavior correction.
- node: domain/integration/capability
  why: This corrective increment answers only the post-save presentation source; this node's other clauses
    reach no criterion of this one-behavior correction.
- node: rules/integration/a-capability-declares-its-contract
  why: This corrective increment answers only the post-save presentation source; this node's other clauses
    reach no criterion of this one-behavior correction.
- node: rules/integration/a-capability-declares-well-formed-schemas
  why: This corrective increment answers only the post-save presentation source; this node's other clauses
    reach no criterion of this one-behavior correction.
- node: rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed
  why: This corrective increment answers only the post-save presentation source; this node's other clauses
    reach no criterion of this one-behavior correction.
- node: rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading
  why: This corrective increment answers only the post-save presentation source; this node's other clauses
    reach no criterion of this one-behavior correction.
- node: rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
  why: This corrective increment answers only the post-save presentation source; this node's other clauses
    reach no criterion of this one-behavior correction.
- node: rules/integration/an-abandoned-capability-registration-entry-registers-nothing
  why: This corrective increment answers only the post-save presentation source; this node's other clauses
    reach no criterion of this one-behavior correction.
- node: rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
  why: This corrective increment answers only the post-save presentation source; this node's other clauses
    reach no criterion of this one-behavior correction.
---
## What it is

The mutation's onSuccess callback discards the registry's own PUT response and resets the
surface from the submitted form values instead.

## Notes

None.
