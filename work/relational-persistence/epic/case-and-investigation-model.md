---
title: The case and investigation shapes follow the specification
summary: The aggregate changes the scope names — hash out of the case and the pin, position onto the hypothesis with precedence read from it, written_at on the investigation, authored_at on the case version — and the read paths that consume them.
rationale: The scope states these shape changes as one list, and they are cut into their own epic because they are decided by the specification's declared attributes alone and are demonstrable without any database; the tasks inside are split along the seams the inventory named, each consumer of a field stopping to read it before the field goes. The claim now reaches the read and submission contracts because the validator refuses at a submission and the replay is the declared exception to validating at every read, and neither fact is reachable from the aggregate elements alone.
sources:
  - intake/scope.md
covers:
  - domain/knowledge/case
  - domain/knowledge/hypothesis
  - domain/investigation/investigation
  - contracts/knowledge/author-case-version
  - contracts/system/case-authoring
  - contracts/knowledge/case-query
  - constraints/a-case-is-read-whole
  - rules/knowledge/validation-runs-at-every-read
  - rules/knowledge/every-case-version-remains-readable
  - rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  - rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  - rules/knowledge/hypotheses-are-ordered-by-precedence
  - rules/knowledge/a-case-has-at-least-one-hypothesis
  - rules/knowledge/a-hypothesis-collects-at-least-one-concept
  - rules/knowledge/a-hypothesis-declares-a-criterion
  - rules/knowledge/every-position-declares-a-resolution
  - rules/knowledge/one-falsifiable-claim-per-criterion
  - rules/investigation/replay-is-pinned
  - scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  - scenarios/knowledge/no-confirmation-falls-back
uncovered:
  - node: rules/knowledge/one-falsifiable-claim-per-criterion
    why: The node states the rule is verified by human review and not by the validator, so no task here decides whether a criterion states one claim or two.
---

## What it is

The domain types and the pure operations over them, brought to what the specification now declares.
A case version carries authored_at and no digest; a hypothesis carries its position and the resolution logic reads precedence from it; an investigation carries written_at and pins its case by slug and version.
The structural validator that parses one submitted version into the aggregate, and the replay that reads a pinned version back, are the two ends this epic holds.

## Notes

The inventory names every consumer of each field, and the tasks here are ordered by dependency so that a consumer stops reading a field before the field is removed from the type it sat on.
Six claims here are held jointly with another epic: the case and hypothesis elements and the two uniqueness invariants with epic/relational-substrate, the read-whole constraint, the case-query contract and every-case-version-remains-readable with epic/relational-stores, and the two authoring contracts and validation-runs-at-every-read with epic/case-authoring.
The replay stays in this epic rather than moving to epic/relational-stores because what changed about it is the pin it resolves by, and it reaches the case through the query service rather than through a store adapter.
The structural validator at src/src/case/parse-case-document.ts, the three pure operations at src/src/case/case-resolution.ts, the composed read-and-replay service at src/src/case/case-query.service.ts and pinnedCaseOf at src/src/investigation/investigation-factory.ts are the existing homes of this work and are changed rather than replaced.
