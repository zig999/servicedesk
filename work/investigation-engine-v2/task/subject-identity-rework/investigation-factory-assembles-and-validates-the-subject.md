---
title: investigation-factory assembles and validates the subject
summary: investigation-factory builds an investigation's subject against its governing invariants when it builds an investigation.
objective: investigation-factory builds a Subject from the raw entry input and refuses to build an investigation whose subject violates a-subject-carries-at-least-one-attribute or a-subject-attribute-is-drawn-from-the-glossary.
criteria:
  - Building an investigation whose subject carries no attribute-value at all is refused, naming the violated invariant.
  - Building an investigation whose subject names an attribute the glossary does not hold is refused, naming the violated policy.
  - A subject whose type and every attribute-value pair are valid is carried unchanged into the built Investigation.
depends_on:
  - task/subject-identity-rework/subject-value-object
rationale: Building and validating a subject is one reason to change — what makes an assembled investigation valid — separate from the port task and the key task, which change for their own reasons. An earlier fourth criterion asserted that every structural violation is collected and thrown together in one error; no candidate bound to this task states that aggregation behavior (the analogous "all refusals at once" promise belongs to contracts/system/case-authoring, a different context not among this task's candidates), so it was dropped rather than left asserting a fact none of the bound nodes hold.
implements:
  - domain/investigation/subject
  - domain/investigation/subject-attribute-value
  - domain/glossary/subject-attribute
  - rules/investigation/a-subject-carries-at-least-one-attribute
  - rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  - contracts/investigation/glossary-source
  - constraints/the-domain-depends-on-no-infrastructure
sources:
  - intake/scope.md
---

## What it is

investigation-factory turns the raw entry input's subject fields into a Subject value object as part of building an Investigation.
It enforces that the resulting subject carries at least one attribute-value pair, per a-subject-carries-at-least-one-attribute.
It enforces that every attribute the subject names is one the glossary holds, per a-subject-attribute-is-drawn-from-the-glossary.
A subject that satisfies both is carried into the built Investigation unchanged.

## Notes

None.
