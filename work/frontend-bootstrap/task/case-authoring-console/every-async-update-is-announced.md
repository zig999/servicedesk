---
title: Every async UI update is announced to assistive technology (ACC-07)
summary: >-
  Four in-place UI changes that happen with no page navigation -- Cases List's search-filtered
  row count, the Version Editor's save-status indicator, the Manifest Builder's reorder-error
  message, and the Capabilities Browser's row-selection detail panel -- currently give a
  screen-reader user no signal that anything changed; each gets an aria-live region or an
  explicit focus move.
rationale: >-
  Corrective increment (CLAUDE.md's "one wrong behavior in code already delivered" route): four
  standing ACC-07 findings, disclosed across four separate reviews
  (cases-list-and-detail-onda-2.md, version-editor-onda-3.md,
  manifest-hypothesis-authoring-onda-4.md, glossary-and-capabilities-browser-onda-6.md) and never
  corrected, each naming the same class of omission (a visible-only state change) in a different
  screen. Cut as one task because the fix is the same kind of change in every location --
  `role="alert"`/`aria-live="polite"` on the changed region, or a focus move -- even though each
  location's own exact wiring differs (a paragraph that already exists versus a new panel that
  mounts), and this codebase already has an established role="alert" convention for its own field
  validation errors to extend from.

  Filed under case-authoring-console for the same reason the other two consolidated
  UX-consistency corrective tasks are.

  Sequenced last among the three (after every-load-error-offers-retry and
  every-empty-collection-states-so), since it also touches cases-list-screen.tsx and
  capabilities-browser-screen.tsx -- delivered once those two files' own retry-control edits have
  already landed.
objective: >-
  A screen-reader user is told, without having to go looking, when Cases List's own filtered
  result count changes, when a Version Editor save completes, when a Manifest Builder reorder is
  rejected, or when a Capabilities Browser row's own detail panel appears.
criteria:
  - >-
    Cases List's own filtered row count is exposed through an aria-live region (or an equivalent
    announcement) that updates as the search input's own value changes.
  - >-
    The Version Editor's save-status indicator (the "saved at" text) is exposed through an
    aria-live region that announces its own text once a save completes.
  - >-
    The Manifest Builder's own reorder-error message (moveErrorMessage) carries `role="alert"`,
    matching the role this codebase's own field-validation error messages already use.
  - >-
    The Capabilities Browser's own detail panel, once it mounts after a row is clicked, either
    sits inside an aria-live region or receives focus, so its own appearance is announced.
sources:
  - intake/onda-2-scope.md
  - intake/onda-3-scope.md
  - intake/onda-4-scope.md
  - intake/onda-6-scope.md
---

## What it is
The correction named by four standing ACC-07 findings: `delivery/frontend-bootstrap/review/cases-list-and-detail-onda-2.md`, `delivery/frontend-bootstrap/review/version-editor-onda-3.md`, `delivery/frontend-bootstrap/review/manifest-hypothesis-authoring-onda-4.md`, `delivery/frontend-bootstrap/review/glossary-and-capabilities-browser-onda-6.md`.
This codebase's own field-validation error paragraphs (e.g. `case-version-editor-form-fields.tsx`'s own `FormField`) already use `role="alert"` for exactly this reason; the Manifest Builder's own fix reuses that same convention rather than inventing a second one.

## Notes
None.
