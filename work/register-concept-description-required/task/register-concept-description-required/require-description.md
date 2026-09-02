---
title: RegisterConceptBodyDto's exported type requires description
summary: Widens RegisterConceptBodyDto's exported TypeScript type to require description, matching domain/glossary/concept's
  own required attribute, without touching registerConceptBodySchema's runtime parsing behavior.
objective: RegisterConceptBodyDto's exported type states description as required, and every runtime behavior
  of register-concept.dto.ts and the registration it feeds -- what a request with no description or an
  empty one gets refused with, and what a request with a non-empty description does -- stays exactly what
  it is today.
criteria:
- RegisterConceptBodyDto's exported type declares description as a required string, not optional, matching
  domain/glossary/concept's required attribute.
- 'registerConceptBodySchema''s runtime parsing of description is unchanged: a request body with the key
  absent, or with an empty-string value, still passes safeParse and reaches the controller and service
  exactly as it does today.'
- A registration request with no description, or an empty one, is still refused with an HTTP 422 response
  reporting ConceptDescriptionRequiredError -- unchanged from today's behavior.
- A registration request carrying a non-empty description continues to validate and register exactly as
  it does today.
- ttl remains optional in both the runtime schema and the exported type, unchanged by this fix.
implements:
- domain/glossary/concept
sources:
- intake/scope.md
- intake/scope-refinement.md
---

## What it is

Widens RegisterConceptBodyDto's exported type to require description, matching
domain/glossary/concept's own required attribute, while leaving registerConceptBodySchema's
runtime parsing -- and therefore every HTTP response the registry already gives -- unchanged.

## Notes

ADVISORY, from the binder — criteria 2 through 4 preserve behavior stated by rules/glossary/a-concept-declares-its-description, scenarios/glossary/a-concept-with-no-description-is-refused and rules/glossary/a-concept-with-an-empty-description-is-read-as-awaiting-one, none of which is a candidate of this task.
Decision, beyond the covers — stand: rules/glossary/a-concept-declares-its-description is not claimed in implements — this task changes no refusal behavior that node states; it only widens a type, and criterion 3 asserts that node's own behavior stays unchanged.
Decision, beyond the covers — stand: scenarios/glossary/a-concept-with-no-description-is-refused is not claimed in implements — this task changes nothing that scenario demonstrates.
Decision, beyond the covers — stand: rules/glossary/a-concept-with-an-empty-description-is-read-as-awaiting-one is not claimed in implements — this task touches only registration, not the read path that rule governs.
ADVISORY, from the binder — criterion 5's ttl carve-out rests on rules/knowledge/a-collected-concept-declares-a-ttl, which is not a candidate of this task.
Decision, beyond the covers — stand: rules/knowledge/a-collected-concept-declares-a-ttl is not claimed in implements — this task does not change ttl's registration-time optionality; criterion 5 only asserts it stays as it is.
