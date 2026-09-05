---
title: Hypothesis-revision-release port test correction
summary: Corrects hypothesis-revision-release.port.spec.ts, a file this project already delivered, so its assertion matches the domain-depends-on-no-infrastructure constraint's actual scope rather than a stricter, unstated rule.
rationale: A wrong behavior found by review-change over the hipotese-release-proprio initiative, in code this project already delivered — the corrective route, per this framework, gets its own epic rather than reopening a delivered one.
sources:
- intake/hypothesis-revision-release-port-test-corrective-scope.md
covers:
- constraints/the-domain-depends-on-no-infrastructure
---
## What it is

The one-behavior correction to hypothesis-revision-release.port.spec.ts's own overly strict import assertion, found by /review-change's specification-conformance pass over the hipotese-release-proprio initiative's captured delivery.

## Notes

None.
