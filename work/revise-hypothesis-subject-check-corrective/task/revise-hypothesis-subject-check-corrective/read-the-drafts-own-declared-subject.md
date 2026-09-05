---
title: Read the draft version's own declared subject for revise-hypothesis's concept-acceptance check
summary: revise-hypothesis.operation.ts's refuseWithoutDraft fetches the draft version only to discard it, and the concept-acceptance check runs against a caller-supplied subject instead of the draft version's own declared one.
rationale: A wrong behavior found by review-change over the hipotese-release-proprio initiative, in code this project already delivered.
sources:
- intake/revise-hypothesis-subject-check-corrective-scope.md
objective: revise-hypothesis's concept-acceptance check runs against the case's draft version's own declared subject type exclusively, never against any subject type a caller supplies on the request.
criteria:
- findDraftVersion (or an equivalent read) returns the draft version's own declared subject type, and refuseInvalidCollects/refuseConceptsRefusingSubject use that value — never input.subject — when checking whether a collected concept accepts the subject.
- 'A revise-hypothesis request whose input.subject disagrees with the case''s own draft version''s declared subject type is neither refused nor influenced by that disagreement: the concept-acceptance check''s outcome (refused with ConceptRefusesSubjectTypeError, or accepted) is decided solely by the draft version''s own declared subject type, and input.subject is read nowhere in that decision.'
- Every existing test of revise-hypothesis.operation.ts and of findDraftVersion's callers continues to pass with every existing assertion unchanged, except where an assertion itself asserted the defect (using input.subject instead of the draft's own subject) as correct — such an assertion is corrected to match the fixed behavior, not preserved.
implements:
- domain/knowledge/case-version
- rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
- rules/knowledge/a-concept-accepts-the-declared-subject-type
---
## What it is

Fixes revise-hypothesis.operation.ts's concept-acceptance check to read the draft version's own declared subject type instead of the caller-supplied input.subject, matching the specification's own decided disposition of that field (accepted, never compared, never a ground for refusal).

## Notes

REMAINDER, from the specification — rules/knowledge/a-concept-accepts-the-declared-subject-type's HTTP 422 status clause is not exercised by any criterion here, since this task is confined to revise-hypothesis.operation.ts and not its HTTP endpoint; it belongs to the task delivering the revise-hypothesis endpoint and its error-to-status mapping.
REMAINDER, from the specification — the same rule's manifest-wide invariant clause is not exercised by any criterion here, confined to the revise-hypothesis enforcement point alone; it belongs to the tasks delivering place-hypothesis and release over the case version's manifest.
ADVISORY, from the specification — criterion 2 is held to rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft, which owns which version anchors the check and the disposition of a caller-supplied subject type; a-concept-accepts-the-declared-subject-type owns only the check itself and its error.
