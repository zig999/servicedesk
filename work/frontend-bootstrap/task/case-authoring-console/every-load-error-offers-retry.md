---
title: Every load-error state offers a retry control (EDG-02)
summary: >-
  Cases List, Case Detail's Versions tab, and the Capabilities Browser each render a fixed
  failure message on a load error with no way to try again short of leaving the screen; each
  gets a retry control wired to its own query's refetch, matching the pattern this same
  codebase's own Hypotheses tab, Manifest Builder, and every Glossary Browser tab already
  establish.
rationale: >-
  Corrective increment (CLAUDE.md's "one wrong behavior in code already delivered" route): three
  standing EDG-02 findings, disclosed across three separate reviews
  (cases-list-and-detail-onda-2.md, manifest-hypothesis-authoring-onda-4.md,
  glossary-and-capabilities-browser-onda-6.md) and never corrected, naming the exact same
  omission in three different screens. Cut as one task rather than three because the fix is
  mechanically identical in each location (a Retry Button wired to that screen's own already-exposed
  refetch), and this codebase already has several correct examples of the exact pattern to copy
  (CaseHypothesesTab in the same case-detail-screen.tsx file this task also touches; every
  VocabularyPanel/ConceptsPanel in glossary-browser-screen.tsx) rather than a pattern being
  invented here.

  Filed under case-authoring-console (not any of the three screens' own feature epics) because it
  states no domain fact and answers to no specification node -- the same reasoning
  task/case-authoring-console/build-substrate and
  task/case-authoring-console/tailwind-scans-the-tui-submodule already establish for cross-cutting,
  non-domain-fact technical work in this initiative.

  Sequenced first among the three consolidated UX-consistency corrective tasks (this one, then
  every-empty-collection-states-so, then every-async-update-is-announced): all three touch
  overlapping files (case-detail-screen.tsx, cases-list-screen.tsx,
  capabilities-browser-screen.tsx), so they are delivered one at a time rather than concurrently.
objective: >-
  A curator or operator who hits a load failure on Cases List, Case Detail's Versions tab, or the
  Capabilities Browser can retry that same read from the screen itself, without navigating away
  and back.
criteria:
  - >-
    Cases List's own load-error state renders a control that, when activated, re-issues the same
    GET /v1/cases request the screen's own initial load issued.
  - >-
    Case Detail's Versions tab load-error state renders a control that, when activated, re-issues
    the same GET /v1/cases/{slug}/versions request that tab's own initial load issued.
  - >-
    The Capabilities Browser's load-error state renders a control that, when activated, re-issues
    the same GET /v1/capabilities request the screen's own initial load issued.
  - >-
    None of the three retry controls issues any request other than re-running that same screen's
    own already-established read.
sources:
  - intake/onda-2-scope.md
  - intake/onda-4-scope.md
  - intake/onda-6-scope.md
---

## What it is
The correction named by three standing, never-fixed EDG-02 findings: `delivery/frontend-bootstrap/review/cases-list-and-detail-onda-2.md`, `delivery/frontend-bootstrap/review/manifest-hypothesis-authoring-onda-4.md`, `delivery/frontend-bootstrap/review/glossary-and-capabilities-browser-onda-6.md`.
Each of the three screens already exposes a `refetch` from its own read hook; this task wires each one to a visible control rather than inventing a new data-fetching mechanism.

## Notes
Case Detail's own Hypotheses tab (`CaseHypothesesTab`, same file) already implements this exact pattern correctly and is this task's own reference for the Versions tab's fix.
None.
