---
title: Capability timeout contract refusal
summary: A capability registration declaring a non-integer timeout is refused, consistently, by whichever refusal the specification is read to govern it.
rationale: The scope explicitly leaves open whether a-capability-declares-its-contract's 422 (extended to a declared-but-malformed value) or the system-wide 400 validation refusal governs a non-integer timeout, naming this as the binder's decision rather than one the plan states. I kept this as one epic and one task since only one falsifiable outcome exists at this stage — that the refusal happens and happens consistently — with the choice of node deferred entirely to the binder's implements. I placed a-capability-declares-well-formed-schemas in uncovered since this epic's task does not touch schema validation, only the timeout attribute.
covers:
  - rules/integration/a-capability-declares-its-contract
  - constraints/a-malformed-request-is-refused-with-a-validation-error
  - rules/integration/a-capability-declares-well-formed-schemas
uncovered:
  - node: rules/integration/a-capability-declares-well-formed-schemas
    why: This plan's decision concerns a non-integer timeout value only; capability schema well-formedness is untouched.
sources:
  - intake/scope.md
---

## What it is

A capability registration whose timeout is declared but not an integer is refused, consistently, rather than accepted.

## Notes

Which of the two candidate nodes governs this refusal — and therefore which status and error name it carries — is left to the binder, since no reconciliation and no current specification statement decides between them.
