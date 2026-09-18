---
title: The capability detail surface presents a subsequent read's own answer after a save, never the submission
summary: use-capability-detail.ts's onSuccess stops resetting the form and schema baselines from the submitted
  values; the outcome (toast) still fires at the registry's answer, but the presented fields and baselines
  change only once the invalidated identity-keyed query's own refetch has answered.
sources:
- work/capability-payload-notes-frontend/intake/detail-surface-presents-submitted-values-after-save.md
objective: The capability detail surface states a successful save's outcome as soon as the registry answers
  the write, while every attribute it presents continues to be drawn only from a genuine read-capability-by-identity
  answer, never from the submission that produced it.
criteria:
- The outcome statement that the registration was made fires as soon as the registry answers the write,
  unaffected by whether a subsequent identity read has settled.
- After a successful save, once the invalidated identity-keyed query's own refetch has answered, every
  form field's value and both schema baselines equal that refetched answer's own attributes.
- Between the registry's answer to the write and that refetch answering, a field the operator had changed
  away from the prior read's content holds exactly what was submitted for it, never reverted and never
  emptied.
- Where the refetched answer differs from the values just submitted for any attribute, the surface presents
  the refetched answer's value, not the submitted one.
- 'A save that fails leaves the surface exactly as before this task: no field or baseline reset of any
  kind, and the existing failure presentation unchanged.'
implements:
- rules/integration/a-capability-keyed-surface-states-a-successful-registration-without-waiting-for-its-own-read
- rules/integration/a-submitted-capability-edit-stands-in-the-fields-until-that-surfaces-own-read-answers
- rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
- rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
---
## What it is

onSuccess no longer resets the form or the schema baselines from the submitted values; it only
invalidates the identity-keyed query, and the existing sync effect (already reading from
query.data) is what applies the fields once a genuine read-capability-by-identity answer lands.
The toast('registered') call is untouched and still fires at the registry's own answer.

## Notes

UNDERDETERMINED, from the specification -- rules/integration/a-capability-keyed-surface-states-a-successful-registration-without-waiting-for-its-own-read states the outcome statement stands alike whether the subsequent identity read answers, is outstanding, or fails; no criterion of this task holds that standing once the refetch itself fails (as opposed to the write), so an implementation that withdraws the outcome statement on a failed refetch would still pass every criterion as written.
REMAINDER, from the specification -- rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface's clauses on offering the discard act itself, its further explicit confirmation, and the surfaces it is withheld from reach no criterion of this task; only its fixed content of what a discard returns to (the surface's own last read) is what criteria 2 and 3 hold the two schema baselines and the submitted fields to, by contrast.
ADVISORY, from the specification -- criterion 5's "existing failure presentation unchanged" names behavior no candidate here governs (it is rules/integration/a-submitted-registration-states-its-outcome-to-the-operator's own refused-outcome branch); it demands no new behavior, only preservation of what already exists.
