---
title: Frontend case-authoring console substrate
summary: The build, lint, style, type and test tooling frontend/app needs before any case-authoring screen exists, under the epic that claims this initiative's territory in the case-authoring domain -- grown to also hold cross-cutting corrective work no single feature epic owns.
rationale: >-
  Grown twice after the original build-substrate cut. First for
  task/case-authoring-console/tailwind-scans-the-tui-submodule (a build-tooling correction,
  implementing no specification node -- the same reasoning that already put build-substrate here
  applies). Second for a consolidated sweep of standing, never-corrected EDG-02/API-04/ACC-07
  findings across six already-delivered reviews: every-load-error-offers-retry and
  every-async-update-is-announced implement no node (pure interaction/accessibility additions over
  already-specified reads), but every-empty-collection-states-so's own two criteria surfaced facts
  the specification did not state -- what a curator reads when a case's own version listing is
  empty, and what a curator reads when a release refusal names no specific violation -- each
  decided by its own unstated-fact-decider, blind to the task, into a new scenario
  (scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly) and a new rule
  (rules/knowledge/a-release-refusal-with-no-named-violation-says-so).

  I covered both new nodes here rather than splitting the task across cases-list-and-detail (which
  owns case-detail-screen.tsx, where the scenario's own fix lands) and version-editor (which owns
  the Release Dialog, where the rule's own fix lands): the task itself is one coherent corrective
  sweep with one objective (an empty result always says so explicitly), and this epic already
  claims domain/knowledge/case and domain/knowledge/case-version broadly -- the scenario's own
  `involves` names exactly those two -- as the one epic in this initiative that exists precisely to
  hold work belonging to the case-authoring domain at large without being any one screen's own
  feature epic.
covers:
  - domain/knowledge/case
  - domain/knowledge/case-version
  - domain/knowledge/hypothesis
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/resolution
  - domain/knowledge/referral
  - contracts/system/case-authoring
  - scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly
  - rules/knowledge/a-release-refusal-with-no-named-violation-says-so
uncovered:
  - node: domain/knowledge/case
    why: This increment delivers only the build, lint and test substrate for frontend/app; no task authors a screen or client model composing a case's own identity or its next_version counter.
  - node: domain/knowledge/case-version
    why: No task in this increment composes a draft's manifest, edits its declared attributes, or releases it; the increment stops before any case-version screen exists.
  - node: domain/knowledge/hypothesis
    why: No task names or revises a hypothesis; the increment produces no hypothesis-authoring surface.
  - node: domain/knowledge/hypothesis-revision
    why: No task authors a revision's criterion, collects list or resolution; the increment produces no such editor.
  - node: domain/knowledge/resolution
    why: No task pairs an outcome with a referral on any screen; the increment stops before any resolution-authoring or resolution-display surface exists.
  - node: domain/knowledge/referral
    why: No task names an action or a recipient on any screen; the increment produces no referral-authoring surface.
  - node: contracts/system/case-authoring
    why: The capability itself -- composing a case version freely as a draft and releasing it once every validator rule answers together -- is not implemented by any task; this increment delivers only the tooling a future console needs to be built and tested against.
sources:
  - intake/scope.md
  - intake/onda-2-scope.md
  - intake/onda-3-scope.md
  - intake/onda-4-scope.md
---

## What it is
This epic claims the case-authoring territory a future curator-facing console will surface.
This increment delivers only the tooling substrate frontend/app needs to be built and tested -- no screen exists yet.

## Notes
None.
