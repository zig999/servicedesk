---
title: Map revise-hypothesis's four unmapped errors to typed HTTP statuses
summary: Adds CaseHoldsNoDraftError, ConceptNotInGlossaryError, HypothesisRevisionCollectsNoConceptError
  and ConceptRefusesSubjectTypeError to status-map.ts's STATUS_BY_ERROR_CLASS, so revise-hypothesis's
  typed refusals stop falling through to the generic 500.
sources:
- intake/scope.md
objective: A POST /v1/cases/:slug/hypotheses request that raises CaseHoldsNoDraftError, ConceptNotInGlossaryError,
  HypothesisRevisionCollectsNoConceptError or ConceptRefusesSubjectTypeError responds with the status
  this task assigns it and the standard domain-error envelope, never the generic 500 INTERNAL_ERROR fallback.
criteria:
- statusForError(new CaseHoldsNoDraftError(slug)) returns 409.
- statusForError(new ConceptNotInGlossaryError(slug, hypothesisName, concepts)) returns 404.
- statusForError(new HypothesisRevisionCollectsNoConceptError(slug, hypothesisName)) returns 422.
- statusForError(new ConceptRefusesSubjectTypeError(context)) returns 422.
- 'A POST /v1/cases/:slug/hypotheses request that reaches any of these four refusals responds with that
  status and a body of { error: { code: <the error class''s own name>, message: <its own message>, details:
  <its own context> } }, never the generic 500 INTERNAL_ERROR fallback.'
- status-map.ts's own header comment, which enumerates the members of its 404, 409 and 422 groups, is
  updated to name the four new classes under their correct group.
implements:
- rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
- rules/knowledge/case-terms-exist-in-the-glossary
- rules/knowledge/a-hypothesis-collects-at-least-one-concept
- rules/knowledge/a-concept-accepts-the-declared-subject-type
---

## What it is

A corrective increment: one wrong behavior observed by running the delivered system (a 500
INTERNAL_ERROR on a legitimate hypothesis-revision request), answering to no criterion of any task
under the closed case-management-http-api or revise-hypothesis-draft-gate plans -- both delivered
and reviewed before either exposed the same gap, and both explicitly deferred the fix to a
human-authorized corrective task.

## Notes

REMAINDER, from the specification -- rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft's own first clause, "A hypothesis is revised only while its case holds a draft version," reaches no criterion of this task, which addresses only that same rule's refusal-status clause (HTTP 409, CaseHoldsNoDraftError); it belongs to task/revise-hypothesis-draft-gate/refuse-without-draft.
REMAINDER, from the specification -- the same rule's clause anchoring the concept-acceptance check to "that draft version's declared subject type," case-terms-exist-in-the-glossary's broader existence-governance clause, a-hypothesis-collects-at-least-one-concept's invariant clause, and a-concept-accepts-the-declared-subject-type's invariant clause all reach no criterion of this task, which addresses only each rule's own refusal-status clause; they belong to task/case-lifecycle-operations/revise-hypothesis-operation.
