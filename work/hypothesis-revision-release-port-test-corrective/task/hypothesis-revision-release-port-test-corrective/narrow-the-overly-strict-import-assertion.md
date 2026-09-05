---
title: Narrow hypothesis-revision-release.port.spec.ts's overly strict import assertion
summary: The test asserts the port declares no import at all, stricter than the constraint actually requires (no framework, driver or provider-client import); its sibling port test already asserts the correct, narrower rule.
rationale: A wrong behavior found by review-change over the hipotese-release-proprio initiative, in code this project already delivered.
sources:
- intake/hypothesis-revision-release-port-test-corrective-scope.md
objective: hypothesis-revision-release.port.spec.ts asserts the same rule constraints/the-domain-depends-on-no-infrastructure actually states — no framework, driver or provider-client import — never a stricter zero-import rule the specification does not hold.
criteria:
- The test's assertion checks the port's source for the absence of framework, driver and provider-client import specifiers (mirroring hypothesis-revision-release-state.port.spec.ts's own FORBIDDEN_DRIVERS_AND_FRAMEWORKS / PROVIDER_CLIENT_PACKAGE pattern), never a bare "no import at all" check.
- The test's own title and any prose describing what it proves name the actual rule (no framework/driver/client import), never "no import at all".
- Running this file's own full test suite continues to pass with every existing assertion unchanged in substance (the port itself still imports nothing today, so the narrowed assertion still passes).
implements:
- constraints/the-domain-depends-on-no-infrastructure
---
## What it is

Rewrites hypothesis-revision-release.port.spec.ts's overly strict "no import at all" assertion to check for the absence of framework, driver and provider-client imports specifically, mirroring the sibling port test's own already-correct pattern.

## Notes

REMAINDER, from the specification — constraints/the-domain-depends-on-no-infrastructure's second clause ("infrastructure reaches it only through ports") is not exercised by any criterion here; it belongs to the task that introduced the hypothesis-revision release port and wired its infrastructure adapter.
ADVISORY, from the specification — the constraint's own fitness describes a dependency audit over the whole import set; the criteria pin the assertion to a finite denylist mirroring the sibling test, which demonstrates the constraint only for the enumerated packages, not as a general audit.
