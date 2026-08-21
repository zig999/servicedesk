---
title: Build frontend app substrate
summary: The manifest, compiler, lint, build, style and end-to-end test configuration the frontend standard presupposes and the empty frontend/app tree does not hold, plus the minimal shell that proves the TUI import chain resolves.
rationale: >-
  No specification node holds a manifest or a build/lint/style/test configuration, and none
  should -- the specification is what the business decided, and how this project is built is
  not. The standard's registry presupposes seven artifacts absent from frontend/app; one task
  builds all of them because they are one decision about how this project is built, falsified
  by the same install-then-run criteria. The scope also asks for a minimal shell
  (main.tsx/App.tsx) rendering a TUI catalog component through the @tui/ui/* alias as proof the
  alias and the tokens.css import actually resolve -- folded into this same task rather than
  split into a second one, because without a file that imports through the alias, "the build
  succeeds" is true of an empty src/ and proves the wiring nothing; the shell is what makes
  that criterion falsifiable at all, not a second objective. The binder confirmed, with the
  epic's covered nodes all declared uncovered, that no candidate governs this task -- every
  criterion is a tooling fact, none a status, refusal, or anything the business decided.
objective: frontend/app can be installed, built and have its standard-declared suite run, with a real TUI catalog component and TUI's own tokens reaching the bundle through the @tui/ui/* alias and the app's own tokens.css.
criteria:
  - 'package.json declares "type": "module" at its top level.'
  - package.json declares the typecheck, lint, lint:css, build, test:a11y, secret-scan and test scripts the standard's commands run as.
  - package.json declares every dependency those scripts require, each drawn from the standard's authorized dependency list.
  - tsconfig.json declares strict mode and a module resolution setting compatible with Vite's bundler resolution.
  - eslint.config.js is a flat config declaring the TypeScript parser, the jsx-a11y plugin, the testing-library plugin, and a non-empty rule set.
  - vite.config.ts declares the React plugin, resolves @tui/ui/* and @tui/lib/* to frontend/tui/frontend/src/shared, and configures the Vitest test environment.
  - playwright.config.ts declares the pages the a11y step renders and a touch-width viewport.
  - stylelint.config.js declares a non-empty ruleset.
  - src/design-system/tokens.css contains only an @import of frontend/tui/frontend/src/theme.css and declares no second color, spacing or duration value of its own.
  - A minimal shell under src/ (main.tsx, App.tsx) renders a component imported through the @tui/ui/* alias, so the alias and the tokens import chain are exercised rather than merely configured.
  - npm ci followed by each of the standard's declared typecheck, lint, style, build, a11y, secret-scan and test steps completes on the tree as produced.
produces:
  - package.json
  - tsconfig.json
  - eslint.config.js
  - vite.config.ts
  - playwright.config.ts
  - stylelint.config.js
  - src/design-system/tokens.css
sources:
  - intake/scope.md
---

## What it is
The one task the scope's substrate description asks for and no specification node governs: the seven artifacts the standard's registry presupposes, absent because frontend/app is an empty tree, plus the minimal shell that proves the @tui/ui/* alias and the tokens.css import actually resolve.
It takes no dependency edges from any other task; every task this plan later adds waits on it through the implement-task refusal over an absent substrate.

## Notes
None.
