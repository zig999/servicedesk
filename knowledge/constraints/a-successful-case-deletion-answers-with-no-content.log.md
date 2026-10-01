---
entries:
- field: statement
  unstated: No node states the HTTP status or the response body for an accepted delete of a case that holds no case version. contracts/knowledge/case-lifecycle and domain/knowledge/case declare delete, and the api contract class declares no responses. rules/knowledge/a-case-holding-no-version-may-be-deleted states the delete's effect and its HTTP 409 CaseHoldsVersionsError refusal only. scenarios/knowledge/a-case-holding-no-version-is-deleted says only that the deletion is accepted. The intake (work/case-deletion-backend/intake/scope.md) names the refusal's status and never the success's.
  decided: HTTP 204 with no body, stated as a knowledge-scoped constraint over delete's accepted branch alone.
  why: An accepted delete ends the case itself, so nothing is left at the slug to send back. The curator asked for that removal and nothing further, so the status alone is the whole answer and no body is owed. This is the same answer the specification already gives for discard, remove-concept, remove-connector and remove-capability.
---
