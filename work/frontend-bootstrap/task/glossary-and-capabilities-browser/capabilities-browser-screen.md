---
title: Capabilities Browser screen
summary: Replaces CapabilitiesPlaceholder with a table listing every registered capability and a client-side row-selection detail panel showing that same row's own schema, with no second network read.
rationale: >-
  I bundled the table render and the row-selection detail panel into one task rather than
  splitting them because they share one objective (an operator inspecting the capability registry
  through a single read call) and one reason to change, and the interaction reuses StatusTable's
  own existing onRowClick prop rather than introducing a new interface — the same shape
  task/cases-list-and-detail/cases-list-screen's own rationale already established for bundling a
  table render with its own row interaction in this plan. Splitting table from detail panel would
  make the detail-panel half undemonstrable on its own, since it has no route or state of its own
  apart from a row already rendered by the table half.

  I built a new hook, use-capabilities.ts, inside this task rather than as a separate one: GET
  /v1/capabilities has no existing frontend consumer at all (the inventory's own finding), so
  writing it touches no shared interface the way GlossaryVocabulary's union does — it only needs to
  mirror use-glossary-vocabulary.ts's and use-concept-options.ts's own apiFetch/queryKey/`data`-only
  convention, which this task's own criteria hold it to.

  No task in this epic calls GET /v1/capabilities/:concept: the scope's own finding #5 confirms the
  listing alone carries every field the wireframe's detail panel shows, so the "clicking a row swaps
  the detail panel" interaction the wireframe describes is client-side selection over an
  already-loaded row, never a second read — this is the decomposition consequence of that finding,
  not a restatement of it.
objective: Visiting /capabilities renders a real, read-only Capabilities Browser listing every registered capability and letting an operator inspect any one's full contract by clicking its row, with no second network read.
criteria:
  - Visiting /capabilities renders one row per capability GET /v1/capabilities returns, each row showing that capability's own name, nature, connector, concept and timeout.
  - Before any row is selected, the screen renders no capability's detail panel.
  - Clicking a capability's row renders a detail panel showing that same row's own version, input_schema and output_schema exactly as GET /v1/capabilities already returned them.
  - Clicking a different row swaps the detail panel to that row's own version, input_schema and output_schema.
  - Selecting a row issues no network request beyond the one GET /v1/capabilities call the table's own listing already made.
  - No control on the screen creates, edits or deletes a capability, or changes a capability's nature.
implements:
  - domain/integration/capability
  - domain/integration/capability-nature
  - contracts/integration/capability-registry
sources:
  - intake/onda-6-scope.md
---

## What it is
The section 2.9 screen the scope describes, over a new sibling hook (use-capabilities.ts) mirroring the two existing glossary hooks' own conventions, and StatusTable's existing onRowClick prop composed as this codebase's first click-row/detail-panel-below pattern.
Independent of the Glossary Browser and the union-widening task: distinct hook, distinct route, distinct data.

## Notes
None.
