---
title: Glossary Browser screen
summary: Replaces GlossaryPlaceholder with a six-tab, read-only screen — Concepts, Subject types, Subject attributes, Outcomes, Actions, Recipients — each listing its own vocabulary or the concept catalog.
rationale: >-
  I bundled all six tabs into one task rather than splitting further because they share one
  objective (a curator browsing /glossary sees everything the glossary currently publishes) and
  one reason to change (the wireframe's own section 2.8), and each tab is a self-contained read
  panel over an existing or sibling hook that crosses no interface boundary of its own — the same
  per-tab, per-query-component composition case-detail-screen.tsx already establishes, which the
  inventory itself names as "the one worth mirroring for the Glossary Browser's five tabs."
  Splitting per tab would multiply near-identical tasks over what is structurally one screen's six
  homogeneous read panels, none of which is independently more demonstrable than the others.

  I built a new sibling hook preserving each concept's own ttl (the scope's own finding #2) inside
  this task rather than as a separate one, because that hook has no consumer today besides this
  screen's Concepts tab and touches no shared interface — unlike GlossaryVocabulary, widening
  use-concept-options.ts's own ConceptOption type would leak ttl into
  use-hypothesis-revision-form.ts, its one existing consumer, which is exactly why that file's own
  header comment already names a sibling hook as the fork's resolution rather than a widening.

  No pagination controls are built, per the scope's own disclosed, inherited convention (finding
  #3) that both glossary-reading hooks already read only a page's `data`.
objective: Visiting /glossary renders a real, read-only Glossary Browser with one tab per glossary vocabulary and one for concepts, in place of GlossaryPlaceholder.
criteria:
  - Visiting /glossary renders six tabs labeled Concepts, Subject types, Subject attributes, Outcomes, Actions and Recipients.
  - The Concepts tab renders one row per concept GET /v1/glossary/concepts returns, each showing that concept's own name, accepts and ttl.
  - The Subject types tab renders one row per term GET /v1/glossary/subject-type returns, by name.
  - The Subject attributes tab renders one row per term GET /v1/glossary/subject-attribute returns, by name.
  - The Outcomes tab renders one row per term GET /v1/glossary/outcome returns, by name.
  - The Actions tab renders one row per term GET /v1/glossary/action returns, by name.
  - The Recipients tab renders one row per term GET /v1/glossary/recipient returns, by name.
  - No tab renders a control that creates, edits or deletes a glossary term or concept.
  - No tab renders a pagination control.
implements:
  - domain/glossary/action
  - domain/glossary/concept
  - domain/glossary/outcome
  - domain/glossary/recipient
  - domain/glossary/subject-attribute
  - domain/glossary/subject-type
  - contracts/glossary/glossary-query
depends_on:
  - task/glossary-and-capabilities-browser/widen-glossary-vocabulary-union
sources:
  - intake/onda-6-scope.md
---

## What it is
The section 2.8 screen the scope describes, over the two existing glossary-reading hooks (widened to a fifth vocabulary), a new sibling hook preserving each concept's own ttl, and TUI's Tabs primitive composed the same way case-detail-screen.tsx already does.
Depends on the union-widening task because the Subject attributes tab cannot request its own vocabulary through the existing hook until that type accepts it.

## Notes
None.
