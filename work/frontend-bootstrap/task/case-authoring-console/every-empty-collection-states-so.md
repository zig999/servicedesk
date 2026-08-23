---
title: Every empty collection renders an explicit message (API-04)
summary: >-
  Case Detail's Versions tab renders a header-only table with no explanatory text when a case
  holds zero versions, and the Release Dialog's violations view renders a blank alert region
  when a 422 carries an empty violations array; each gets an explicit empty-state sentence,
  matching the pattern this same codebase's own Hypotheses tab already establishes.
rationale: >-
  Corrective increment (CLAUDE.md's "one wrong behavior in code already delivered" route): the
  Versions-tab finding is one standing API-04 finding disclosed across three separate reviews
  (cases-list-and-detail-onda-2.md, version-editor-onda-3.md,
  manifest-hypothesis-authoring-onda-4.md) and never corrected -- the same one location, restated
  three times because nothing fixed it. The Release-Dialog finding is a second, distinct instance
  of the same rule disclosed once (version-editor-onda-5.md). Cut as one task because both are the
  identical omission (a collection that came back empty renders nothing saying so) and this
  codebase already has a correct example to copy: CaseHypothesesTab, in the very file the first
  instance also lives in.

  Filed under case-authoring-console for the same reason every-load-error-offers-retry is: no
  domain fact, no specification node answers for it.

  Sequenced second among the three consolidated UX-consistency corrective tasks, after
  every-load-error-offers-retry (which also touches case-detail-screen.tsx) and before
  every-async-update-is-announced -- delivered one at a time to avoid two tasks editing the same
  file's own load/render branches concurrently.
objective: >-
  A curator who reaches an empty result -- a case with no versions, or a Release attempt whose
  422 named no specific violation -- reads an explicit sentence saying so, never a table or a
  region that looks like it rendered nothing.
criteria:
  - >-
    Case Detail's Versions tab renders an explicit empty-state sentence, rather than a header-only
    table, when GET /v1/cases/{slug}/versions returns zero versions.
  - >-
    The Release Dialog's violations view renders an explicit sentence stating no specific
    violation was returned, rather than an empty alert region, when a 422
    CaseVersionNotReleasableError response's own `violations` array is empty.
implements:
  - scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly
  - rules/knowledge/a-release-refusal-with-no-named-violation-says-so
sources:
  - intake/onda-2-scope.md
  - intake/onda-3-scope.md
  - intake/onda-4-scope.md
  - intake/onda-5-scope.md
---

## What it is
The correction named by four standing API-04 findings (one location restated three times, one distinct second location): `delivery/frontend-bootstrap/review/cases-list-and-detail-onda-2.md`, `delivery/frontend-bootstrap/review/version-editor-onda-3.md`, `delivery/frontend-bootstrap/review/manifest-hypothesis-authoring-onda-4.md`, `delivery/frontend-bootstrap/review/version-editor-onda-5.md`.

## Notes
Case Detail's own Hypotheses tab (`CaseHypothesesTab`, same file) already implements this exact pattern correctly for the same list shape and is this task's own reference for the Versions tab's fix.
None.
