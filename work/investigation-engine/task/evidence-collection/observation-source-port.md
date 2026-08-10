---
title: Observation-source port and its fake adapter
summary: The port the collection stage calls to observe one concept for one subject, plus a test adapter that returns controlled results without a real connector.
objective: A caller can observe one concept for one subject entirely behind an interface, exercised end to end by a fake adapter that needs no real connector.
criteria:
  - The port's operation accepts a concept, a subject and the requester's own scope, and answers a result exactly as evidence-result enumerates it (ok, unavailable, denied or timeout), never throwing for a non-ok ending.
  - The fake adapter is the only concrete implementation this task ships, driven entirely by test-supplied fixtures, importing no network client and no framework.
  - A unit test drives the fake adapter through each of the four evidence-result endings and asserts the port answers each as data.
rationale: The scope names a fake adapter explicitly only for hypothesis-evaluator; this task extends the same port-plus-fake pattern to collection's own infrastructure dependency, because infrastructure reaches the domain only through ports regardless of which dependency the scope called out by name. Building the real connector behind this port is left to this epic's declared remainder.
implements:
  - domain/investigation/evidence
  - domain/investigation/evidence-result
  - rules/investigation/collection-runs-in-the-requester-scope
  - contracts/investigation/observation-source
  - contracts/integration/concept-observation
  - constraints/the-domain-depends-on-no-infrastructure
sources:
  - intake/scope.md
---

## What it is

The interface between the collection stage and one concept's observation.
A fake adapter that answers controlled fixtures, so the collection stage's own logic is testable without a real connector.

## Notes

UNDERDETERMINED, from the specification — criterion 1 requires the port to answer one of the four evidence-result endings without throwing, but does not itself require an "ok" answer to carry any observed value. Passes: a port/fake-adapter pair whose ok ending returns only the bare result tag with no observation payload — satisfying criteria 1-3 as written while contracts/integration/concept-observation's "answering in the glossary's vocabulary" and evidence-result's "only ok carries a usable observation" both presuppose an actual observed value on the ok path, matching evidence's required observation attribute.
