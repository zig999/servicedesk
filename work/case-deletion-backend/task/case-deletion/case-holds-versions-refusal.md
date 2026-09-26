---
title: CaseHoldsVersionsError refusal
summary: The named refusal a delete meets over a case still holding a version, and
  its mapping to an HTTP answer.
rationale: The scope states no cut. The refusal's wording and status mapping would
  change for different reasons than the store logic that raises it, so it gets its
  own task that the removal builds on.
sources:
- intake/scope.md
objective: A CaseHoldsVersionsError naming a case slug reaches its caller as an HTTP
  409 refusal that carries that slug and a Brazilian-Portuguese message.
criteria:
- A CaseHoldsVersionsError raised from a route handler is answered with HTTP 409.
- The response to a CaseHoldsVersionsError carries the error code CaseHoldsVersionsError.
- The message of a CaseHoldsVersionsError names the case slug it was raised for.
- The details of a CaseHoldsVersionsError carry the case slug it was raised for.
- The details of a CaseHoldsVersionsError carry no field other than the case slug.
- The message of a CaseHoldsVersionsError is written in Brazilian Portuguese.
- The message of a CaseHoldsVersionsError names the case by the word "caso".
- The message of a CaseHoldsVersionsError contains no occurrence of the English word
  "case" for the case.
implements:
- rules/knowledge/a-case-holding-no-version-may-be-deleted
- constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
- constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
- constraints/the-domain-depends-on-no-infrastructure
---

## What it is

The domain error a delete raises over a case holding any version, draft or released.
Its registration in the status map at 409, beside the other case-lifecycle conflicts.

## Notes

UNDERDETERMINED, from the specification — criteria 6-8 hold only the noun "caso" and the ban on the English word "case"; constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word also fixes "versão" for a case version, "rascunho" for draft and "liberada" for released, and forbids their English words and any raw lifecycle token, none of which any criterion here checks. Passes: a message such as "O caso <slug> ainda possui versions draft e não pode ser excluído" satisfies every criterion as written while the constraint refuses it for "versions" and "draft".
UNDERDETERMINED, from the specification — no criterion says which layer attaches the HTTP 409 to CaseHoldsVersionsError, and constraints/the-domain-depends-on-no-infrastructure bars the domain layer from importing any framework. Passes: CaseHoldsVersionsError defined as a subclass of a web framework's own HTTP error type, carrying status 409 itself and raised directly from case behavior, satisfies every criterion here while breaching that constraint.
REMAINDER, from the specification — the accept/refuse condition itself ("asked of a case that holds no case version, is accepted..."; "asked of a case holding any version... it is refused") reaches no criterion of this task. Belongs to task/case-deletion/delete-case-over-case-lifecycle and task/case-deletion/store-deletes-a-versionless-case, which decide whether to accept or refuse and raise this error in the refused branch.
ADVISORY, from the specification — constraints/a-successful-case-deletion-answers-with-no-content is a candidate but governs only the accepted branch, not this refusal; it belongs with the delete operation task.
ADVISORY, from the specification — no candidate names the key the slug sits under inside CaseHoldsVersionsError's details; follow the key the delivered error envelope already uses for the slug in other case refusals.
