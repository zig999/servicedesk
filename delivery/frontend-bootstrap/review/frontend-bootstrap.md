---
title: Frontend bootstrap, first review
summary: What four passes found over the frontend/app substrate delivered for task/case-authoring-console/build-substrate.
reviewed:
- package.json
- package-lock.json
- tsconfig.json
- eslint.config.js
- vite.config.ts
- playwright.config.ts
- stylelint.config.js
- stylelint-rules/vis-02-cubic-bezier-range.js
- stylelint-rules/vis-03-min-line-height.js
- stylelint-rules/vis-04-min-font-size.js
- src/design-system/tokens.css
- src/main.tsx
- src/app.tsx
- index.html
- .gitignore
tasks:
- task/case-authoring-console/build-substrate
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/frontend-bootstrap) passed every declared step; there is no failure to
    diagnose
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:fc2cab113bd7d538edf870fd20d947cfce281dc21c798d075db4a781e2e6a1ec
coverage:
- criterion: 'package.json declares "type": "module" at its top level.'
  state: uncovered
  why: 'the test set is empty; nothing exercises package.json''s top-level fields, so a regression removing
    "type": "module" would go undetected'
- criterion: package.json declares the typecheck, lint, lint:css, build, test:a11y, secret-scan and test
    scripts the standard's commands run as.
  state: uncovered
  why: the test set is empty; no test invokes or asserts on any of these seven declared scripts, so their
    presence or naming is unproven
- criterion: package.json declares every dependency those scripts require, each drawn from the standard's
    authorized dependency list.
  state: uncovered
  why: the test set is empty; nothing checks the dependency list against what the scripts require or against
    the standard's authorized list
- criterion: tsconfig.json declares strict mode and a module resolution setting compatible with Vite's
    bundler resolution.
  state: uncovered
  why: the test set is empty; no test reads tsconfig.json's strict flag or its moduleResolution setting
- criterion: eslint.config.js is a flat config declaring the TypeScript parser, the jsx-a11y plugin, the
    testing-library plugin, and a non-empty rule set.
  state: uncovered
  why: the test set is empty; nothing exercises the flat config's shape, its parser, its two named plugins,
    or that its rule set is non-empty
- criterion: vite.config.ts declares the React plugin, resolves @tui/ui/* and @tui/lib/* to frontend/tui/frontend/src/shared,
    and configures the Vitest test environment.
  state: uncovered
  why: the test set is empty; nothing asserts the React plugin is present, that both aliases resolve to
    the stated path, or that the Vitest test environment is configured
- criterion: playwright.config.ts declares the pages the a11y step renders and a touch-width viewport.
  state: uncovered
  why: the test set is empty; nothing checks which pages the config renders for the a11y step or that
    the configured viewport is touch-width
- criterion: stylelint.config.js declares a non-empty ruleset.
  state: uncovered
  why: the test set is empty; nothing checks that the ruleset is present or non-empty
- criterion: src/design-system/tokens.css contains only an @import of frontend/tui/frontend/src/theme.css
    and declares no second color, spacing or duration value of its own.
  state: uncovered
  why: the test set is empty; nothing asserts the file holds only that single @import or that it declares
    no additional color, spacing or duration value
- criterion: A minimal shell under src/ (main.tsx, App.tsx) renders a component imported through the @tui/ui/*
    alias, so the alias and the tokens import chain are exercised rather than merely configured.
  state: uncovered
  why: the test set is empty; nothing renders the shell or asserts that a component reached through the
    @tui/ui/* alias actually appears, so the alias and tokens-import chain remain unexercised by any test
    even though the source itself may exercise them at build time
- criterion: npm ci followed by each of the standard's declared typecheck, lint, style, build, a11y, secret-scan
    and test steps completes on the tree as produced.
  state: uncovered
  why: the test set is empty; no test captures or asserts on a run of npm ci and the seven declared steps
    completing on the tree as produced

---

## What it is
The first review of the frontend-bootstrap initiative: everything task/case-authoring-console/build-substrate delivered, held to all four passes over a fresh captured run of the whole registry (install, typecheck, lint, style, build, a11y, secret-scan, test), all eight steps passing.
Coverage is uncovered across all 11 criteria, correctly: this is a pure-substrate task with no proof record, so nothing here is a gap introduced by omission -- it is the shape the framework gives a task with nothing to prove.
Conformance found nothing: the only business-facing-looking strings in the file set (the h1 "Case Authoring Console", the Divider label "Substrate", the page title) are scaffolding naming echoing the initiative and the task slug, not a domain fact the specification should hold.
Standard conformance found nothing: 22 reading-decided rules were in scope (ARC-01, ARC-03, ARC-04, ARC-05, STA-01, STA-03, API-01, API-02, API-04, EDG-01 through EDG-04, ACC-04, ACC-06, ACC-07, ACC-08, ACC-11, ENV-02, SEC-05, PRF-02, PRF-04), and the minimal shell has no construct any of them reach (no data fetch, form, async state, destructive action or color-only state).

## Notes
The failures pass did not run because there was no failure: the captured run at run/frontend-bootstrap passed every one of the eight declared steps.
The standard's own dependencies section authorizes 27 packages; the 21 rules a tool decides ran as steps of the captured run (a11y 2, lint 21, secret-scan 1, style 8, typecheck 1 -- note some rules are counted under more than one step) and all passed, so no tool-decided rule surfaced a departure either.
trace.py --check frontend/app reports 6 pre-existing code-drift findings, all under the backend target (src/src/case/author-case-version.service.ts and src/src/factories/author-case-version.factory.ts, both gone) -- unrelated to this change, not a finding of any pass here, and this review takes no position on them; 0 orphaned, 0 moved. frontend/app itself holds zero trace bindings, consistent with this task implementing no specification node.
This review does not judge whether the delivery is good enough, ready, or should be merged -- that is a person's reading of the four passes above, plus the one criterion (playwright.config.ts's "declares the pages" half) already recorded unmet in the implementation record.
