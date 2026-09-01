---
title: A no-data citation omits field, never an empty-string sentinel
summary: Fixes judgment-stage.ts's noDataEvaluation and anthropic-hypothesis-evaluator.adapter.ts's
  noDataOutcome to construct a no-data citation with concept alone, omitting field entirely, instead
  of filling field with an empty string.
objective: Every citation either function constructs for a no-data evaluation or outcome carries
  concept and no field attribute at all — never field set to an empty string.
criteria:
- judgment-stage.ts's noDataEvaluation constructs each citation for the non-ok evidence it cites
  with concept present and field absent — the citation object carries no field key at all, never
  an empty string.
- 'anthropic-hypothesis-evaluator.adapter.ts''s noDataOutcome constructs each citation the same
  way: concept present, field absent.'
- A confirmed or refuted evaluation's citations are unaffected by this fix and continue to carry
  both concept and field exactly as before.
implements:
- domain/investigation/citation
- rules/investigation/a-cited-field-exists-in-the-capability-output-schema
sources:
- intake/scope.md
---

## What it is

The corrective fix omitting field entirely on a no-data citation, in judgment-stage.ts's
noDataEvaluation and anthropic-hypothesis-evaluator.adapter.ts's noDataOutcome, matching the
specification's own decision that field is absent for this case.

## Notes

Decision, beyond the covers — stand: domain/investigation/evidence was offered as a candidate and
is not named in implements. It grounds the honest-empty reading this fix rests on but no criterion
here constructs, reads or changes an evidence item's attribute, and it sits outside this epic's
covers (domain/investigation/citation, rules/investigation/a-cited-field-exists-in-the-capability-output-schema).
REMAINDER, from the specification — rules/investigation/a-cited-field-exists-in-the-capability-output-schema's
first clause (a citation's field, where present, must exist among its own cited evidence item's
snapshotted field names) reaches no criterion of this task: criterion 3 only holds a decided
citation's shape unchanged, never re-validates its field against the evidence item's snapshot. It
belongs to the already-delivered judgment citation validation, not this corrective increment.
ADVISORY — which evidence items a no-data evaluation's citations name (the selection, not the
shape) is not stated by any candidate node; it rests on the already-delivered behavior
(scenarios/investigation/a-collection-timeout-degrades-to-no-data) and is left untouched by this
fix.
Decision, beyond the covers — stand: scenarios/investigation/a-collection-timeout-degrades-to-no-data
is not claimed in implements; this task changes no selection of which evidence a no-data citation
names, only the shape of the citation itself.
ADVISORY — rules/investigation/a-cited-field-exists-in-the-capability-output-schema's own rationale
for the no-data exemption ("since the evidence it cites snapshotted none") is narrower than the
clause itself: a non-ok evidence item whose capability did resolve (a timeout, a denial) also
snapshotted field names, yet its citation still carries no field under the rule's own unconditional
wording. The objective and criteria stand as written; this is a seam in the specification's own
rationale, not in this task.
