---
title: Tailwind scans TUI's own submodule source, not only frontend/app's own files
summary: >-
  Adds an explicit Tailwind v4 `@source` directive so frontend/app's own build generates a CSS
  rule for every utility class TUI's component source (frontend/tui/frontend/src, a separate git
  submodule) uses internally, even where frontend/app's own source never repeats that class name
  verbatim -- closing a gap a curator found by actually running the delivered system.
rationale: >-
  This is a corrective increment (CLAUDE.md's "one wrong behavior in code already delivered"
  route), stated by the user after visiting a real delivered screen
  (/cases/perfil-mobile-tecnico-probe/versions/1/manifest/hypotheses/limitacao-de-hardware) and
  observing two concrete symptoms: the Checkbox in "Collects" rendering its native, unstyled
  `<input>` visibly beside the intended styled indicator (two checkmarks where TUI's own Storybook
  shows one), and the Select controls' own height/sizing not matching TUI's Storybook. I
  root-caused both to the same build configuration gap before writing this task, rather than
  guessing at two unrelated fixes.

  Root cause, confirmed by inspecting the actual compiled output: `frontend/tui` is a git
  submodule (`.gitmodules`), and Tailwind v4's automatic content-detection (triggered by the bare
  `@import "tailwindcss";` inside TUI's own vendored `theme.css`, itself imported by
  `frontend/app/src/design-system/tokens.css`) never scans into that submodule's own file tree
  from `frontend/app`'s build. Confirmed two ways: `grep "peer sr-only"` and `grep "flex h-9
  w-full"` both find the literal class strings inside the built JS bundle
  (`dist/assets/index-*.js`) -- proving Checkbox's and Select's own component code IS reached and
  bundled -- while `grep "sr-only"` and `grep "h-9"` against the compiled stylesheet
  (`dist/assets/index-*.css`) from that exact same build find nothing: the CSS rules for those two
  classes were never generated at all. Any Tailwind utility class used only inside
  `frontend/tui/frontend/src` and never independently repeated inside `frontend/app`'s own source
  is silently missing from every screen's compiled styles, which is why this affects more than one
  component (Checkbox and Select share nothing but this one gap) and why it was never caught by
  build/lint/test, none of which read computed CSS.

  This is not a domain fact and implements no specification node: no `rules/`, `domain/`, or
  `contracts/` node states anything about how a build tool resolves CSS classes across a submodule
  boundary -- the same reasoning `task/case-authoring-console/build-substrate` already applies to
  every other piece of build/lint/test tooling in this epic.

  The fix belongs entirely inside `frontend/app`'s own files: `frontend/tui` is a separate git
  repository with its own review process, and TUI's own CLAUDE.md marks its `shared/components/
  ui/` and `theme.css` as owned, not to be edited from outside. Tailwind v4's own answer to a
  content root that needs to reach outside its automatically-detected boundary is the `@source`
  directive, added to a CSS file already in this app's own build -- `tokens.css`, the one file
  this app already owns for exactly this purpose (it is where `theme.css` itself is imported).
objective: >-
  frontend/app's own compiled stylesheet contains a CSS rule for every Tailwind utility class
  TUI's component source (frontend/tui/frontend/src) uses internally, whether or not frontend/app's
  own source repeats that same class name, so a TUI component renders with the same computed
  styles inside frontend/app that it renders inside TUI's own Storybook.
criteria:
  - >-
    `npm run build`'s own compiled stylesheet (dist/assets/*.css) declares a `.sr-only` utility
    rule -- the class Checkbox's own hidden native `<input>`
    (frontend/tui/frontend/src/shared/components/ui/checkbox/checkbox.tsx) requires to render
    invisibly, matching TUI's own Storybook, rather than showing a second, unstyled checkbox
    beside the intended indicator.
  - >-
    That same compiled stylesheet declares an `.h-9` utility rule -- the class Select's own
    trigger (frontend/tui/frontend/src/shared/components/ui/select/select.tsx) requires for its
    declared height, matching TUI's own Storybook.
  - >-
    The fix reaches TUI's whole source tree rather than an enumerated list of specific classes or
    files: a third utility class already used only inside a TUI component's own internal styling,
    and not duplicated anywhere in frontend/app's own source, that this task's own two named
    criteria do not already name, also appears in the same compiled stylesheet.
  - >-
    Every screen and component this project already delivers still renders and behaves exactly as
    its own already-recorded criteria describe -- this task adds CSS rules that were previously
    missing; it changes no markup, no component logic, and no existing utility class's own
    definition.
sources:
  - intake/onda-6-scope.md
---

## What it is
A corrective fix to frontend/app's own Tailwind CSS v4 build configuration (`src/design-system/tokens.css`), adding an explicit `@source` directive so content-detection reaches `frontend/tui/frontend/src` (a separate git submodule Tailwind's own automatic detection does not cross into on its own).
Confirmed by direct inspection of a real production build's output, not assumed: the class strings for both named symptoms (`sr-only`, `h-9`) already reach the JS bundle (the components are correctly imported and rendered) but their CSS rules are absent from the compiled stylesheet -- a content-scanning gap, not a component-usage error.

## Notes
`frontend/tui`'s own files (`theme.css`, every component under `shared/components/ui/`) are out of scope for this task -- they are a separate git repository this initiative does not own or review, and TUI's own CLAUDE.md marks them owned, not to be edited from outside.
This gap most likely affects other already-delivered screens too (any TUI-internal-only utility class no screen's own source happens to repeat) -- this task does not audit every prior screen for a specific visual regression this gap may have caused, since no criterion of any prior task named an exact CSS class or computed style; it fixes the build configuration so every future (and every currently-rendered) TUI component gets its own intended styles, and criterion 4 above is the safeguard against this fix breaking anything already recorded as working.
