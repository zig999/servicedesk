---
title: Tailwind content-detection extended to TUI's own submodule source
summary: Adds a Tailwind v4 @source directive to tokens.css so frontend/app's compiled stylesheet generates
  CSS rules for utility classes TUI's own component source uses internally, closing the submodule content-scanning
  gap that left Checkbox's sr-only and Select's h-9 (and every other TUI-internal-only class) without
  compiled CSS.
task: sha256:1603ce0b3dd69c031e5a045a12732237298795122edae996e251cd12da5654b8
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/tailwind-submodule-scan-full-suite
files:
- path: src/design-system/tokens.css
  effect: Now carries, immediately after the existing `@import "../../../tui/frontend/src/theme.css";`
    line, an explicit `@source "../../../tui/frontend/src";` directive (Tailwind v4's own documented at-rule
    for extending automatic content detection past a boundary it would not cross on its own). The path
    is relative to this file, in the same style as the pre-existing @import line above it, and names TUI's
    whole source directory rather than an enumerated list of files or classes, so Tailwind's content-scanner
    walks every file under frontend/tui/frontend/src for utility classes to generate CSS rules for --
    including ones no file in frontend/app's own source repeats. No selector, no existing utility's own
    definition, and no other line of this file changed.
criteria:
- criterion: '`npm run build`''s own compiled stylesheet (dist/assets/*.css) declares a `.sr-only` utility
    rule -- the class Checkbox''s own hidden native `<input>` (frontend/tui/frontend/src/shared/components/ui/checkbox/checkbox.tsx)
    requires to render invisibly, matching TUI''s own Storybook, rather than showing a second, unstyled
    checkbox beside the intended indicator.'
  met: true
  how: 'Confirmed empirically after this record''s own author re-ran `npm run build`: dist/assets/*.css
    contains `.sr-only{clip-path:inset(50%);white-space:nowrap;border-width:0;width:1px;height:1px;margin:-1px;padding:0;position:absolute;overflow:hidden}`.'
- criterion: That same compiled stylesheet declares an `.h-9` utility rule -- the class Select's own trigger
    (frontend/tui/frontend/src/shared/components/ui/select/select.tsx) requires for its declared height,
    matching TUI's own Storybook.
  met: true
  how: 'Confirmed empirically: dist/assets/*.css contains `.h-9{height:calc(var(--spacing) * 9)}`.'
- criterion: 'The fix reaches TUI''s whole source tree rather than an enumerated list of specific classes
    or files: a third utility class already used only inside a TUI component''s own internal styling,
    and not duplicated anywhere in frontend/app''s own source, that this task''s own two named criteria
    do not already name, also appears in the same compiled stylesheet.'
  met: true
  how: 'The implementer picked `max-h-60` (select.tsx''s own dropdown list, capping the open option list''s
    height), confirmed not duplicated anywhere in frontend/app/src. Confirmed empirically: dist/assets/*.css
    contains `.max-h-60{max-height:calc(var(--spacing) * 60)}`.'
- criterion: Every screen and component this project already delivers still renders and behaves exactly
    as its own already-recorded criteria describe -- this task adds CSS rules that were previously missing;
    it changes no markup, no component logic, and no existing utility class's own definition.
  met: true
  how: 'The only change is one additive @source line in tokens.css -- no component file, markup, vite.config.ts
    wiring, or existing selector/@theme token changed. Confirmed empirically: npm run typecheck, npm run
    lint, and the full npm test suite (231/231, including the five new tests this delivery''s own proof
    adds) all pass clean, captured at run/tailwind-submodule-scan-full-suite.'
inferences:
- inferred: A bare directory path (`@source "../../../tui/frontend/src";`), not a narrower glob scoped
    to specific extensions or subfolders, is the right shape for this directive.
  from: The task's own instruction to point at "TUI's own source tree" rather than "an enumerated list
    of specific files or classes," and Tailwind v4's documented @source semantics, under which a directory
    argument is scanned recursively using the same file-type heuristics automatic detection already uses
    elsewhere in the project.
- inferred: '`max-h-60` is an acceptable answer to criterion 3''s third-class requirement.'
  from: Direct inspection of select.tsx (its dropdown <ul> is the only place max-h-60 appears in either
    component this task's rationale names) and a grep of frontend/app/src confirming no file there repeats
    that class name.
preserved:
- Every already-generated Tailwind utility CSS rule frontend/app's build currently produces, and its exact
  definition.
- frontend/tui's own files (theme.css, every file under shared/components/ui/) -- untouched.
- vite.config.ts's existing plugin registration, resolve aliases and dedupe/inline wiring for the TUI
  submodule -- untouched.
- Every screen and component already delivered in this project, and its already-recorded criteria.
deferred:
- what: Auditing every already-delivered screen for a specific visual regression this content-scan gap
    may have caused (any TUI-internal-only utility class no screen's own source happens to repeat, beyond
    the three named/identified here).
  why: No criterion of any prior task named an exact CSS class or computed style, so there is no stated
    regression to audit against; this task fixes the build configuration itself, and criterion 4 is the
    stated safeguard against this fix breaking anything already recorded as working.
---

## What it is
A corrective fix to frontend/app's own Tailwind CSS v4 build configuration (src/design-system/tokens.css), adding an explicit @source directive so content-detection reaches frontend/tui/frontend/src (a separate git submodule Tailwind's own automatic detection does not cross into on its own).
Confirmed by direct inspection of a real production build's output, not assumed: the class strings for both named symptoms (sr-only, h-9) already reached the JS bundle before this fix (the components were correctly imported and rendered) but their CSS rules were absent from the compiled stylesheet -- a content-scanning gap, not a component-usage error.

## Notes
Broadening the scan surfaced one new, harmless build WARNING (not an error, build still succeeds): "Unexpected token Delim('*')" while Tailwind's naive text-scanner parses a class-shaped string it found inside a code COMMENT in frontend/tui/frontend/src/shared/components/ui/date-picker/date-picker.tsx (`// - Dropped \`rounded-[var(--radius-*)]\` everywhere...`) -- the string is never a real className anywhere, only mentioned in that comment documenting a class the TUI team already removed. Disclosed rather than suppressed: Tailwind's scanner cannot distinguish a comment's text from real usage, and no mechanism exists to exclude comments without excluding the whole file (which would reintroduce the original bug for that file's real classes).
frontend/tui's own files (theme.css, every component under shared/components/ui/) were out of scope -- a separate git repository this initiative does not own or review.
