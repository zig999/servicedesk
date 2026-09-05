---
title: A hypothesis-revision's own release
summary: The curator's release taken directly against a hypothesis-revision, and the published operation
  that carries it.
rationale: The planning cut the release action away from the state it moves because the domain transition
  and the HTTP surface that exposes it are one interface and its consumer — the transition is demonstrable
  against the operation alone, and the surface answers to the published contract and the request-shape
  constraints rather than to the state machine.
sources:
- work/hipotese-release-proprio/intake/scope.md
covers:
- rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
- scenarios/knowledge/a-hypothesis-revision-is-released-independently-of-any-manifest
- domain/knowledge/hypothesis-revision
- contracts/knowledge/case-lifecycle
- contracts/system/case-authoring
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/no-route-enforces-authentication
---

## What it is

The one forward transition a hypothesis-revision's own lifecycle holds, taken by a curator against that revision and answering to no case version and no manifest.
It holds the refusal a second release attempt meets, and the published operation `release-hypothesis` through which a curator reaches the transition.

## Notes

None.
