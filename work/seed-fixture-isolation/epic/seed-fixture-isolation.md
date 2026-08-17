---
title: seed.spec.ts release-tolerance hotfix
summary: The one corrective task that fixes seed.spec.ts's own beforeAll failing against a permanently-released fixture case.
rationale: A corrective increment cuts no epic through survey/decomposition — this is the structural container the validator still requires, holding exactly the one task's own claim.
covers:
  - domain/knowledge/case-version
  - rules/knowledge/a-case-version-is-written-once
  - domain/knowledge/hypothesis-revision
  - domain/glossary/outcome
  - rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
uncovered:
  - node: domain/glossary/outcome
    why: This node defines what an outcome is and names the two non-conclusion outcomes, but states nothing about release-immutability propagating permanence onto an outcome row; the task's own tolerance rests on domain/knowledge/hypothesis-revision and rules/knowledge/a-case-version-is-written-once instead, which the task's own implements already names.
  - node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
    why: This rule states the two non-conclusion outcomes exist before the first case version validates — a global seeding guarantee owned by vitest-global-setup.ts's own suite-wide glossary seed, never by this file. This task's own beforeAll only tolerates a row release-immutability elsewhere already made permanent; it does not implement or re-decide when these two outcomes first come to exist.
sources:
  - intake/scope.md
---

## What it is

A single-task epic for the seed-fixture-isolation corrective increment.

## Notes

None.
