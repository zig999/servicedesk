---
title: Frontend app substrate landing zone
summary: frontend/app is an empty greenfield tree; the only relevant existing material is the vendored, read-only TUI submodule the scope requires composing through a @tui/ui/* alias.
area:
  - frontend/app
  - frontend/tui/frontend/src/shared/components/ui
  - frontend/tui/frontend/src/theme.css
modules:
  - name: tui-ui-catalog
    path: frontend/tui/frontend/src/shared/components/ui
    role: depends-on
  - name: tui-theme-tokens
    path: frontend/tui/frontend/src/theme.css
    role: depends-on
conventions:
  - statement: TUI's design tokens are declared once in a Tailwind v4 CSS-first @theme block, layered base (raw values, never referenced directly) -> semantic (purpose-named, the only tier components may reference) -> component (per-variant, must reference semantic).
    seen_at: frontend/tui/frontend/src/theme.css
  - statement: Border color and border width live in two separate custom-property namespaces (--color-border-* vs --border-*); using the wrong one silently drops the border.
    seen_at: frontend/tui/frontend/src/theme.css
  - statement: Each shared TUI component ships as a three-file unit (component.tsx, component.types.ts, index.ts) under its own folder, e.g. button/, card/, dialog/.
    seen_at: frontend/tui/frontend/src/shared/components/ui/button
must_not_duplicate:
  - what: The ~30-component shared primitive catalog (alert, banner, breadcrumb, button, card, checkbox, date-picker, dialog, divider, empty, input, kbd, label, link, multi-combobox, panel, person-picker, progress, radio-group, select, sheet, skeleton, stat-panel, status-bar, switch, table, and more) that ARC-01/ARC-04/MNT-03 require composing rather than reimplementing.
    at: frontend/tui/frontend/src/shared/components/ui
  - what: The visual token set (color, spacing, radius, typography, motion) that ARC-05 requires reading from a single source rather than a second palette.
    at: frontend/tui/frontend/src/theme.css
risks:
  - risk: The @tui/ui/* and @tui/lib/* aliases resolve raw source inside a sibling git submodule rather than a published package; a path or export layout change on the TUI side breaks resolution for every screen the app will later compose.
    consumers:
      - frontend/app/vite.config.ts
      - every future frontend/app/src/**/*.tsx importing @tui/ui/*
  - risk: TUI's own theme.css is Tailwind v4 CSS-first (@theme, no tailwind.config.ts); the app's tokens.css must import it rather than restate any token, or ARC-05 is violated the first time only one of the two is edited.
    consumers:
      - frontend/app/src/design-system/tokens.css
      - the standard's MNT-02/ACC-09 stylelint and a11y steps, which read tokens.css
sources:
  - work/frontend-bootstrap/intake/scope.md
---

## What it is
frontend/app is currently empty: no package.json, no config of any kind, no src/ tree.
The only pre-existing material the scope's substrate task can lean on sits outside the target root, in the vendored TUI submodule.
That submodule ships a ready component catalog and a single CSS token file the standard (ARC-01, ARC-04, ARC-05) requires the new app to compose and read from rather than duplicate.

## Notes
frontend/tui carries its own CLAUDE.md, its own orchestration tooling under .claude/, and its own conventions document — all of that is the submodule's internal material, vendored and read-only from this project's point of view, and none of it states a fact for this project's specification or plan.
No specification node and no code under frontend/app exists yet to record as a module in its own right; the "modules" above are the reuse dependency, not something the change touches.
