---
title: Domain-boundary substring scan false positive
summary: The one corrective task that narrows domain-depends-on-no-infrastructure.spec.ts's raw substring scan so it stops recusing a legitimate specification-node citation as an http-connector dependency.
rationale: A corrective increment cuts no epic through survey/decomposition — this is the structural container the validator still requires, holding exactly the one task's own claim.
covers:
  - constraints/the-domain-depends-on-no-infrastructure
  - rules/integration/an-http-connector-configuration-declares-its-call
  - domain/integration/connector-configuration
uncovered:
  - node: rules/integration/an-http-connector-configuration-declares-its-call
    why: The binder found this node named in the task's own criteria only as the identity string already cited, unchanged, in observation-source.port.ts's existing comment — a fixture the scan must not misfire on, not a statement this task implements or derives behavior from.
  - node: domain/integration/connector-configuration
    why: Reached only transitively through the rule's own constrains field, with no closer bearing on the test-scanning fix; the task changes no fact about a connector configuration.
sources:
  - intake/2026-08-26-domain-boundary-substring-scan-false-positive.md
---

## What it is

A single-task epic for the domain-boundary-scan-fix corrective increment.

## Notes

None.
