---
title: The refused draft request stated as its own condition
summary: The statement a refused outcome makes to the operator -- no draft generated, and which of the three conditions answered, or a failure the surface does not recognise -- with nothing of a draft beside it and no such statement standing before the operation has answered.
rationale: I cut the refusal's statement apart from the draft's, and kept the bound on stating a refusal early inside it, because that bound is falsifiable only against the very statements this task delivers and would otherwise have nothing of its own to be shown against.
sources:
- /home/siegfriedneto/projects/servicedeskn1/work/capability-schema-helper-frontend/intake/scope.md
objective: A refused draft request is stated to the operator as no draft generated under exactly one of four readings -- the three named conditions or an unrecognised failure -- and no such statement stands before the operation answers.
criteria:
- Where the answer reports OpenApiDocumentNotFetchedError, the surface states that no draft was generated and states that condition apart from the other two.
- Where the answer reports OpenApiDocumentNotReadableError, the surface states that no draft was generated and states that condition apart from the other two.
- Where the answer reports OpenApiOperationNotFoundError, the surface states that no draft was generated and states that condition apart from the other two.
- Where the answer names none of those three conditions, the surface states that the request failed for a reason it does not recognise, and states it neither as one of the three conditions nor as a draft.
- No input_schema, no output_schema and no unresolved item stands stated beside any of those four statements.
- While a dispatched request stands unanswered, none of those four statements stands stated.
- Where no request has been dispatched, none of those four statements stands stated.
- Each of the four statements is produced from the answer's own error code by this helper's own disclosure service, and the shared generic error-state table is not extended with these codes.
depends_on:
- task/schema-helper-request-and-statement/helper-offered-on-the-authoring-surface
reference:
- frontend/app/src/services/connector-configuration-draft-disclosure.ts
- frontend/app/src/hooks/use-draft-capability-schema-from-openapi.ts
- frontend/app/src/routes/capability-schema-helper-fields.tsx
implements:
- rules/integration/a-refused-schema-draft-states-its-refusal-to-the-operator
- rules/integration/no-schema-draft-refusal-is-stated-before-the-operation-answers
---

## What it is

The four readings an operator may get back when no draft was generated, each stated as itself and none as any other.
The code-keyed disclosure service is the shape the inventory records for the sibling helper, which keeps these three shared OpenAPI codes out of the generic error table that unrelated screens read.

## Notes

The unrecognised-failure reading is what the surface owes an answer whose code it does not know, including the backend's own generic HTTP 500 fallback.
ADVISORY, from the specification -- Criteria 1-4 key each of the three refusal statements to a specific error code, but the bound rule names the three conditions only by the identities of the rules that fix them; the code-to-condition mapping is held by rules/integration/an-unfetchable-openapi-link-refuses-the-schema-draft, rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-schema-draft and rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-schema-draft, none a candidate here.
Decision, beyond the covers — stand: rules/integration/an-unfetchable-openapi-link-refuses-the-schema-draft, rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-schema-draft and rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-schema-draft are the already-delivered backend increment's own claim; this task reads the codes that increment's HTTP surface already answers with rather than re-deriving the mapping.
REMAINDER, from the specification -- rules/integration/a-pending-schema-draft-request-is-not-dispatched-again's clauses reach no criterion of this task; its Description is explicit that no-schema-draft-refusal-is-stated-before-the-operation-answers stands untouched by it.
REMAINDER, from the specification -- rules/integration/an-answered-schema-draft-request-states-its-draft-to-the-operator's clauses reach no criterion here; criterion 5's prohibition of draft fields is stated by this task's own bound refusal rule.
REMAINDER, from the specification -- rules/integration/a-capability-authoring-surface-offers-a-schema-helper's clauses reach no criterion here.
ADVISORY, from the specification -- constraints/the-openapi-document-is-fetched-by-the-backend is not answered or endangered by this task's criteria, which introduce no fetch of any kind.
ADVISORY, from the specification -- Criterion 8's disclosure-service/generic-table split is answered by no candidate; it reads as a module-structure direction rather than a fact of the business.
