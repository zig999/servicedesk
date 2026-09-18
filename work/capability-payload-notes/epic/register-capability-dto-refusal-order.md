---
title: register-capability reaches the registry contract-completeness refusal
summary: 'Corrective increment: a required-attribute absence or empty string in a register-capability
  submission must reach the registry''s own completeness check and its HTTP 422 refusal, not stop at the
  DTO''s HTTP 400 shape validation.'
rationale: The wrong behavior was observed in delivered code, outside any task's criteria; the claim is
  seeded mechanically from trace.py --encodes over the one file the human named.
sources:
- work/capability-payload-notes/intake/register-capability-dto-refusal-order.md
covers:
- constraints/a-malformed-request-is-refused-with-a-validation-error
- contracts/integration/capability-registry
- domain/integration/capability
- rules/integration/a-capability-declares-its-contract
uncovered:
- node: contracts/integration/capability-registry
  why: It declares register-capability among the registry's published operations and states nothing about how a submission is refused; this correction changes only the refusal path, not the operation's existence or shape.
---
## What it is

register-capability.dto.ts's Zod schemas currently enforce non-emptiness on every required
attribute, so an incomplete submission never reaches the registry's own 422 refusal.

## Notes

None.
