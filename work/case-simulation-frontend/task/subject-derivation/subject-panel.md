---
title: Subject region
summary: Renders the subject-type selector, the requester field, the derived required fields, the free-attribute control, and the raw-subject-JSON link.
sources:
  - work/case-simulation-frontend/intake/scope.md
objective: The Subject region renders the subject-type selector, the requester field, one input per derived required field annotated with its asking connector and capability, a control to add a curator-chosen attribute drawn from the subject-attribute glossary, and a link to view the assembled subject as raw JSON.
criteria:
  - The subject type is chosen from the glossary's subject-type vocabulary (domain/glossary/subject-type), never typed as free text.
  - The requester field is shown and its value is part of the region's own state.
  - Each derived required field is labeled with its attribute name and shows, alongside it, the connector and the capability that asked for it.
  - A capability's input_schema hint, where present, is shown next to its required field as plain text, including where it is prose rather than a schema, per the scope's own perfil-mobile-tecnico-reader example.
  - The "add attribute" control offers only attribute names drawn from the subject-attribute glossary (domain/glossary/subject-attribute), satisfying rules/investigation/a-subject-attribute-is-drawn-from-the-glossary — never an arbitrary typed name.
  - A "view subject JSON" control shows the currently assembled subject — its type and its full set of attribute-values — exactly as domain/investigation/subject structures it.
depends_on:
  - task/subject-derivation/use-simulation-subject-hook
reference:
  - layout/simulation-screen.md
implements:
  - domain/investigation/subject
  - domain/investigation/subject-attribute-value
  - domain/glossary/subject-type
  - domain/glossary/subject-attribute
  - domain/integration/capability
  - rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
---

## What it is

The left column of the cockpit's layout, described in the scope's "Subject (D7)" section.

## Notes

The requester's shape and origin is stated at `domain/investigation/investigation.md`, outside this task's candidate set — form only, does not change this task's criteria.
Decision, beyond the covers — stand: `domain/investigation/investigation` is named only to point at where the requester's own shape is stated, never as a fact this task implements.
UNDERDETERMINED, from the specification — nothing in these criteria enforces `rules/investigation/a-subject-carries-at-least-one-attribute` (a subject carries at least one attribute-value), which constrains `domain/investigation/subject`, the very element criterion 6 binds the JSON view to. Every criterion as written is satisfiable by a Subject region whose assembled subject holds zero attribute-values — a version needing no connector-derived field and to which the curator has added none. A test proving this task's criteria must not also prove that empty-subject state as acceptable: `rules/investigation/a-subject-carries-at-least-one-attribute` still forbids it, enforced elsewhere (`use-simulation-subject-hook`'s own readiness gate).
