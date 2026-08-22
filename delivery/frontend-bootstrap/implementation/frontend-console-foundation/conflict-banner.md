---
title: Reusable conflict banner
summary: Adds ConflictBanner, a shared component composed over TUI's Banner primitive at its default frame, taking a title and message; Banner's accent prop is not reused (see the unmet criterion and divergence below).
task: sha256:1369555596e8a33bca9364f97b69f041a292eaa4b9d8b9752251470c8bedbc25
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:154d391b6346febbd273d5806c95730da5db7e6ffa3df544a9792398002295e5
run: run/frontend-console-foundation-onda-1-full-suite-2
files:
  - path: src/shared/components/conflict-banner.tsx
    effect: exports ConflictBanner, a function component rendering TUI's Banner with title and subtitle set to the message prop, at Banner's default frame ("none"), alongside its ConflictBannerProps type
  - path: vite.config.ts
    effect: widens the resolve.alias entry that used to cover only the narrow @/shared/lib/cn specifier into a general @/shared -> TUI's shared root mapping, so any of TUI's internal @/shared/... cross-references (Banner's own import of Panel, and any future one) resolve for the dev server and bundler; @tui/ui and @tui/lib are untouched
  - path: tsconfig.json
    effect: mirrors the same widening in compilerOptions.paths (@/shared/* -> ../tui/frontend/src/shared/*), so the type checker resolves the same internal TUI cross-references the bundler now does
criteria:
  - criterion: ConflictBanner renders through TUI's Banner primitive rather than new banner markup.
    met: true
    how: the component's return is a single <Banner .../> element from @tui/ui/banner with no other markup
  - criterion: ConflictBanner accepts a title and a message and renders both.
    met: true
    how: ConflictBannerProps declares title and message as required strings, and both are passed through to Banner as title and subtitle
  - criterion: ConflictBanner reuses Banner's existing accent prop to signal a conflict, rather than adding a parallel styling mechanism.
    met: false
    how: >-
      Banner's own source (frontend/tui/frontend/src/shared/components/ui/banner/banner.tsx) makes
      accent a documented no-op under frame="none" (void accent;, its own comment reading "accent is
      a no-op here"); the only way to make accent render anything is frame="notched", which
      delegates to Panel and, by Banner's own comment, intentionally double-renders the title as two
      headings and replaces Banner's implicit banner landmark with a plain region. An earlier
      revision of this file used frame="notched" to satisfy this criterion literally; it was
      reverted (see divergence below) because the landmark and the single-heading structure cost
      more than a color accent is worth, and the conflict is already conveyed through the title text
      and the message, never through color alone, the same rule this app already applies in
      status-table.tsx (a status is color and word together, never color alone). No parallel styling
      mechanism was added in its place: the criterion is left genuinely unmet rather than worked
      around.
  - criterion: ConflictBanner is exported from a shared location importable by any future screen, with no screen-specific code inside it.
    met: true
    how: the component and its props type are named exports at src/shared/components/conflict-banner.tsx, taking only generic title/message props with no reference to any specific screen or business wording
inferences:
  - inferred: the alias configuration should widen to the whole @/shared/* family TUI's internal components use to reference each other, rather than adding a second narrow entry for @/shared/components/ui/panel alone.
    from: >-
      a captured typecheck failure: Cannot find module '@/shared/components/ui/panel' from inside
      TUI's own banner.tsx (a vendored internal cross-reference); the existing narrow entry already
      covered one such reference (cn), and nothing said that was the last
divergences:
  - from: >-
      the task's own criterion "ConflictBanner reuses Banner's existing accent prop to signal a
      conflict, rather than adding a parallel styling mechanism"
      (work/frontend-bootstrap/task/frontend-console-foundation/conflict-banner.md)
    departure: >-
      ConflictBanner passes neither accent nor frame to Banner, rendering at Banner's default frame
      ("none"), under which Banner documents accent as a no-op. The criterion is recorded as unmet
      above rather than satisfied by switching to frame="notched".
    why: >-
      frame="notched" does make accent render, but at a cost this task's own objective does not ask
      anyone to pay: Banner's own source states its notched frame intentionally double-renders the
      title as two headings and replaces the implicit banner landmark with a plain region, confirmed
      by a captured test run (screen.getByRole("banner") found nothing, and
      screen.getByRole("heading", {name: title}) matched two elements) after an earlier revision of
      this file tried frame="notched" specifically to satisfy this criterion. Losing the landmark and
      duplicating the heading are both real regressions no criterion asked for, in exchange for a
      color cue this app's own convention (status-table.tsx: a status is color and word together,
      never color alone) says is never load-bearing on its own. This is a decision under the
      standing /goal's delegated authority, documented in temp/frontend-console-decisions.md; the
      criterion stays honestly unmet above rather than the record claiming it was satisfied.
preserved:
  - every other file in the target source root is unchanged except the two alias widenings; the @tui/ui and @tui/lib alias entries are untouched
---

## What it is
The section 2.3 reusable conflict banner the scope asks for, composed over TUI's Banner primitive rather than reimplemented.

## Notes
None.
