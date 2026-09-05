---
title: Narrow hypothesis-revision-release.port.spec.ts's import assertion to the denylist pattern
summary: Replaced the port test's overly strict "no import at all" assertion with the sibling port test's two denylist-based assertions (no driver/framework, no LLM provider client), mirrored verbatim except for the source path.
task: sha256:5912baceb0e4584179969d1c2dc099f454e349f2f79fb9539acc25bbead5ea1b
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/hypothesis-revision-release-port-test-corrective-narrow-the-overly-strict-import-assertion-build
files:
- path: src/__tests__/unit/case/hypothesis-revision-release.port.spec.ts
  effect: Replaced the single "declares no import at all" test with the sibling's exact FORBIDDEN_DRIVERS_AND_FRAMEWORKS / PROVIDER_CLIENT_PACKAGE / importSpecifiersOf / namesOneOf pattern and its two tests, reading hypothesis-revision-release.port.ts's own source via the same relative-path construction the sibling uses.
criteria:
- criterion: The test's assertion checks the port's source for the absence of framework, driver and provider-client import specifiers (mirroring hypothesis-revision-release-state.port.spec.ts's own FORBIDDEN_DRIVERS_AND_FRAMEWORKS / PROVIDER_CLIENT_PACKAGE pattern), never a bare "no import at all" check.
  met: true
  how: The old IMPORT_LINE_PATTERN bare-import check is gone. The file now defines the same FORBIDDEN_DRIVERS_AND_FRAMEWORKS list, the same PROVIDER_CLIENT_PACKAGE constant, the same IMPORT_SPECIFIER_PATTERN regex, and the same importSpecifiersOf/namesOneOf helpers as the sibling, and filters the port's actual import specifiers against them.
- criterion: The test's own title and any prose describing what it proves name the actual rule (no framework/driver/client import), never "no import at all".
  met: true
  how: The two test titles read "imports no database driver, HTTP server or web framework, so a caller depending on this port alone pulls in neither" and "imports no LLM provider client, so a caller depending on this port alone pulls in neither" — identical in wording to the sibling's titles, with no "no import at all" phrasing left anywhere in the file.
- criterion: Running this file's own full test suite continues to pass with every existing assertion unchanged in substance (the port itself still imports nothing today, so the narrowed assertion still passes).
  met: true
  how: hypothesis-revision-release.port.ts declares only an interface with no import statements, so importSpecifiersOf(source) returns an empty array for both tests, making both offenders arrays empty and both expect(offenders).toEqual([]) assertions pass; no change was made to the port file itself.
nodes:
- node: constraints/the-domain-depends-on-no-infrastructure
  encoded_at:
  - src/__tests__/unit/case/hypothesis-revision-release.port.spec.ts
  how: The test now demonstrates the constraint's first clause (no framework, driver or provider-client import) by asserting the port's import specifiers contain none of the enumerated driver/framework or provider-client packages, matching the fitness function's dependency-audit description over this port's own source. The constraint's second clause (infrastructure reaches the domain only through ports) is not exercised here, per the task's own REMAINDER note.
preserved:
- The port file hypothesis-revision-release.port.ts is unchanged; only the test asserting against it was rewritten.
- The test's own file path, import of readFile/fileURLToPath/expect/it, and the async portSource() helper's role are preserved, only its body's regex-construction changed to match the port's own path.
deferred:
- what: constraints/the-domain-depends-on-no-infrastructure's second clause ("infrastructure reaches it only through ports") remains unexercised by any test this task touches.
  why: The task's own Notes record this as REMAINDER, from the specification, belonging to the task that introduced the hypothesis-revision release port and wired its infrastructure adapter — out of this corrective task's scope.
---
## What it is

Rewrites hypothesis-revision-release.port.spec.ts's overly strict "no import at all" assertion to check for the absence of framework, driver and provider-client imports specifically, mirroring the sibling port test's own already-correct pattern.

## Notes

None.
