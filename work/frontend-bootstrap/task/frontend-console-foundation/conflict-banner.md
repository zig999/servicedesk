---
title: Reusable conflict banner
summary: A reusable conflict banner composed over TUI's Banner primitive (frame, accent, titleLevel, action slots), distinct from Alert's inline role, for the proposal's section 2.3 conflict messaging.
rationale: >-
  Kept as its own task because the conflict banner is a single reusable visual component with
  one reason to change -- its own composition over Banner -- independent of the API client, the
  error table, the shell and every other reusable component this wave builds; nothing else in
  the wave needs it to exist first. The binder confirmed no candidate governs this task: it
  takes title/message as generic props and carries no fixed business wording of its own.
objective: A reusable ConflictBanner component renders a titled, accented conflict message composed over TUI's Banner primitive, reusable by any screen without bespoke markup.
criteria:
  - ConflictBanner renders through TUI's Banner primitive rather than new banner markup.
  - ConflictBanner accepts a title and a message and renders both.
  - ConflictBanner reuses Banner's existing accent prop to signal a conflict, rather than adding a parallel styling mechanism.
  - ConflictBanner is exported from a shared location importable by any future screen, with no screen-specific code inside it.
sources:
  - intake/onda-1-scope.md
---

## What it is
The section 2.3 reusable conflict banner the scope asks for, composed over TUI's Banner primitive rather than reimplemented.

## Notes
None.
