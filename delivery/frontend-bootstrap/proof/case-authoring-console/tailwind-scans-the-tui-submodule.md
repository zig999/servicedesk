---
title: Tailwind's compiled output for TUI's own utility classes
summary: A single, dedicated real-build spec proves that frontend/app's compiled stylesheet declares sr-only,
  h-9, and a third TUI-only class (max-h-60) after tokens.css's added @source directive, and that the
  fix leaves frontend/app's own already-detected classes compiling unchanged.
implementation: sha256:cafa5d2ff5cab0fb2d54532562c351f14f15c8e2a37483320f7352e09d2eb379
run: run/tailwind-submodule-scan-full-suite
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
tests:
- file: src/design-system/tailwind-tui-source-scan.build.spec.ts
  name: emits at least one compiled stylesheet under dist/assets
  proves: 'the edge case this behavior raises on its own: dist/assets/*.css (the glob every other test
    in this file reads from) could come back empty from a build that nonetheless "succeeds" in the sense
    of not throwing'
  fails_when: a real npm run build from this file's own beforeAll writes zero .css files under dist/assets
- file: src/design-system/tailwind-tui-source-scan.build.spec.ts
  name: declares a `.sr-only` utility rule -- the class Checkbox's own hidden native <input> requires
    to render invisibly
  proves: criterion 1 -- npm run build's own compiled stylesheet (dist/assets/*.css) declares a `.sr-only`
    utility rule
  fails_when: a real production build's own compiled CSS contains no `.sr-only` selector -- e.g. the @source
    line in tokens.css is removed, mistyped, or points at the wrong relative path
- file: src/design-system/tailwind-tui-source-scan.build.spec.ts
  name: declares an `.h-9` utility rule -- the class Select's own trigger requires for its declared height
  proves: criterion 2 -- the compiled stylesheet declares an `.h-9` utility rule
  fails_when: a real production build's own compiled CSS contains no `.h-9` selector
- file: src/design-system/tailwind-tui-source-scan.build.spec.ts
  name: declares a `.max-h-60` utility rule -- a third class used only inside TUI's own component source
  proves: 'criterion 3 -- a third utility class this task''s own two named criteria do not already name,
    used only inside a TUI component''s own internal styling and never duplicated in frontend/app''s own
    source (confirmed directly: max-h-60 appears only in frontend/tui/frontend/src/shared/components/ui/select/select.tsx
    and multi-combobox.tsx, and nowhere under frontend/app/src), also appears in the compiled stylesheet'
  fails_when: the compiled CSS contains no `.max-h-60` selector, which would mean the fix reaches only
    the two enumerated classes rather than TUI's whole source tree
- file: src/design-system/tailwind-tui-source-scan.build.spec.ts
  name: still declares a `.min-h-screen` utility rule for a class frontend/app's own source already used
    directly
  proves: the part of criterion 4 this task's own change could plausibly disturb -- that the added @source
    directive extends content-detection rather than replacing frontend/app's own automatic detection of
    frontend/app/src, so a class frontend/app's own markup already uses directly (min-h-screen, in src/shared/components/app-shell.tsx)
    still compiles
  fails_when: the compiled CSS stops containing a rule for a class frontend/app's own source already used
    before this change, which would mean the @source addition disturbed rather than extended the app's
    own existing content-detection
not_applicable:
- edge_case: absent or empty runtime input
  why: this behavior is a build-time content-detection config, not an entry point that accepts input at
    runtime
- edge_case: a boundary at each end of a stated range
  why: no criterion states a numeric range this behavior operates over
- edge_case: a duplicate where uniqueness is claimed
  why: no criterion claims any class name, file, or path is unique
- edge_case: an operation against state that forbids it
  why: a CSS content-detection directive has no state machine or forbidden-state transition to violate
- edge_case: two operations against one subject at once (e.g. concurrent builds)
  why: no criterion states anything about concurrent builds, and this task changes no runtime concurrency
    behavior -- only a static build-time scan path
- edge_case: a dependency that fails or answers slowly (the TUI submodule not checked out locally)
  why: tokens.css's pre-existing @import "../../../tui/frontend/src/theme.css"; already requires the submodule's
    presence before this task; this task's own @source line introduces no new failure mode there, only
    a new scan path once the same dependency is already present
untested:
- 'The full breadth of criterion 4 -- "every screen and component this project already delivers still
  renders and behaves exactly as its own already-recorded criteria describe" -- is proven by the pre-existing
  226-spec suite, unmodified by this task, not by anything written here: this task changes no markup and
  no component logic, so a new behavioral test over already-working screens would only describe the arrangement
  that already exists and pass by construction. This proof adds one test targeting the one thing this
  task''s own change could plausibly disturb rather than restating what the existing suite already covers.'
- 'The harmless "Unexpected token Delim(''*'')" build warning Tailwind''s own text-based scanner now produces
  while reading a code comment in frontend/tui/frontend/src/shared/components/ui/date-picker/date-picker.tsx
  (documenting a removed class, rounded-[var(--radius-*)], never a real className) is left unasserted,
  by design: it is a known, harmless limitation of the scanner this task''s fix relies on -- it cannot
  distinguish a comment''s text from real usage -- not a behavior any criterion describes, and pinning
  a test to that comment''s exact wording would fail the day someone edits unrelated prose.'
- 'Whether a TUI component actually renders with the same computed, on-screen styles inside frontend/app
  that it renders inside TUI''s own Storybook (the rationale''s own framing) is not tested: no criterion
  or reproduction supplied a way to compare rendered/computed styles across the two separate apps from
  this suite, only that the compiled stylesheet declares the same utility rule text.'
---

## What it is
Five tests in one dedicated real-build spec file, proving the compiled stylesheet declares the three named TUI-internal-only utility classes and that an already-detected app-owned class still compiles.

## Notes
This spec spawns a real npm run build inside its own beforeAll (dist/ is gitignored, so no test may depend on a pre-existing build artifact); it is included in the default npm test run (the project's own include glob, src/**/*.spec.{ts,tsx}, matches it, and no fast/slow test-suite split exists in this project to route it into instead).
