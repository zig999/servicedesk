---
title: A fieldless citation is not rejected as an undeclared field
summary: citesADeclaredField in citation-validation.ts stops requiring a field match when the citation
  carries no field at all.
objective: A citation carrying no field is accepted by isCitationValid/acceptedCitations instead of being
  rejected as though it named a field the cited evidence does not have.
criteria:
- A citation whose concept is collected and which carries no field is accepted by isCitationValid, whatever
  field names the cited evidence item snapshotted.
- A citation naming a field is still rejected by isCitationValid when that field is not among the cited
  evidence item's own snapshotted field names.
sources:
- intake/wrong-behavior.md
implements:
- rules/investigation/a-cited-field-exists-in-the-capability-output-schema
- domain/investigation/citation
---

## What it is

A corrective increment fixing citesADeclaredField's unconditional field-match check so a
fieldless citation -- the no-data-verdict case -- is not rejected.

## Notes

UNDERDETERMINED, from the specification -- Criterion 1 accepts a fieldless citation on the sole precondition that its concept is collected, saying nothing about the verdict the citation grounds. domain/investigation/citation states field is present when the citation grounds a confirmed or refuted verdict and absent when it names only which evidence a no-data verdict cites; rules/investigation/a-cited-field-exists-in-the-capability-output-schema ties the fieldless case to a citation grounding a no-data verdict. Neither criterion holds the fix to that condition, so as cut the task permits a check that would admit a fieldless citation attached to a confirmed or refuted verdict. isCitationValid's own signature (a Citation plus the evidence context) carries no verdict to condition on -- the verdict lives on the Evaluation that holds the citation, one level up in judgment-stage.ts -- so this task does not plumb it through; the domain invariant that a confirmed/refuted verdict's citation carries a field is enforced at whichever evaluator constructs that citation, not by this function, and stands unenforced by this fix.
ADVISORY, from the specification -- Criterion 1's precondition "whose concept is collected" exercises the other arm of isCitationValid, whose fact is rules/investigation/a-citation-stays-within-the-hypothesis-collects. This task changes nothing there; it is not in implements.
