---
title: Narrowed import assertion in hypothesis-revision-release.port.spec.ts
summary: The two rewritten tests mirror the sibling port test's denylist pattern verbatim (except source path), replacing the prior bare "no import at all" check and passing because the port itself imports nothing.
implementation: sha256:0d103c5c0c60fc0f2d00b0c108a565807cd41d0ec90f54a322ec5657016b6a5f
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/hypothesis-revision-release-port-test-corrective-narrow-the-overly-strict-import-assertion-suite
tests:
- file: src/__tests__/unit/case/hypothesis-revision-release.port.spec.ts
  name: imports no database driver, HTTP server or web framework, so a caller depending on this port alone pulls in neither
  proves: The test's assertion checks the port's source for the absence of framework/driver import specifiers via FORBIDDEN_DRIVERS_AND_FRAMEWORKS, mirroring the sibling test's pattern instead of a bare "no import at all" check, and the title names the actual rule rather than "no import at all".
  fails_when: The port file gains an import of any package on FORBIDDEN_DRIVERS_AND_FRAMEWORKS (e.g. 'fastify' or 'pg'), or the assertion/regex is reverted to a bare import-line check that would reject any import including a legitimate domain one.
- file: src/__tests__/unit/case/hypothesis-revision-release.port.spec.ts
  name: imports no LLM provider client, so a caller depending on this port alone pulls in neither
  proves: The test's assertion checks the port's source for the absence of the provider-client import specifier (PROVIDER_CLIENT_PACKAGE), mirroring the sibling test's pattern, and the title names the actual rule rather than "no import at all".
  fails_when: The port file gains an import of '@anthropic-ai/sdk' (or a subpath of it), or the assertion is reverted to a bare "no import at all" check.
untested:
- constraints/the-domain-depends-on-no-infrastructure's second clause (infrastructure reaches the domain only through ports) — the task's own REMAINDER note assigns this to the task that introduced the port and its adapter, out of this corrective task's scope; no test here exercises it.
---
## What it is

Cites the two rewritten tests as proof that the port's import assertion now matches the constraint's actual scope, not a stricter unstated rule.

## Notes

None.
