---
title: Non-integer capability timeout is refused
summary: A declared, non-integer capability timeout is refused with one consistent, stated response rather than accepted.
objective: Registering a capability with a timeout that is declared but not an integer is refused, consistently, rather than accepted or answered by the registry's unmapped default.
criteria:
  - Registering a capability whose timeout is a decimal number is refused rather than registered.
  - Registering a capability whose timeout is a numeric string is refused rather than registered.
  - Every non-integer timeout value tested is refused with the same stated HTTP status and the same named error, rather than each falling through to a different or default response.
  - The refusal is distinct from the registry's response to a capability that declares no timeout at all, which still takes the sixty-second default.
rationale: The scope leaves open whether a non-integer timeout is governed by the capability contract's own 422 refusal, extended to cover a declared-but-malformed value, or by the system-wide 400 validation refusal for a request failing its route's declared shape — no reconciliation resolved it and the specification as it stands does not decide between the two readings. I wrote these criteria around the observable refusal alone, without naming a status code or error identifier, so the binder's choice of which node governs settles that through implements rather than through this task's criteria.
implements:
  - rules/integration/a-capability-declares-its-contract
  - constraints/a-malformed-request-is-refused-with-a-validation-error
sources:
  - intake/scope.md
---

## What it is

A capability registration whose timeout attribute is present but not an integer count of milliseconds is refused rather than accepted.
The refusal is the system-wide malformed-request validation response (HTTP 400, VALIDATION_ERROR) — a declared timeout that is not an integer fails the route's declared shape, distinctly from an absent timeout, which the capability contract's own default still answers.

## Notes

REMAINDER, from the specification — rules/integration/a-capability-declares-its-contract's
statement carries a clause this task's criteria do not reach: "an attribute that is absent or an
empty string is undeclared, and a registration leaving any required attribute undeclared is
refused with an HTTP 422 response reporting an IncompleteCapabilityContractError." None of this
task's criteria exercise the absent-or-empty-string path; they exercise only a timeout that is
present but not an integer, which the same node's own wording excludes from "undeclared." It
belongs to the already-delivered task that implements this node's undeclared/absent-or-empty
required-attribute refusal (HTTP 422, IncompleteCapabilityContractError), not this task.
