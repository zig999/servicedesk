---
title: Frontend case-authoring console substrate
summary: The build, lint, style, type and test tooling frontend/app needs before any case-authoring screen exists, under the epic that claims this initiative's territory in the case-authoring domain.
covers:
  - domain/knowledge/case
  - domain/knowledge/case-version
  - domain/knowledge/hypothesis
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/resolution
  - domain/knowledge/referral
  - contracts/system/case-authoring
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
---

## What it is
This epic claims the case-authoring territory a future curator-facing console will surface.
This increment delivers only the tooling substrate frontend/app needs to be built and tested -- no screen exists yet.

## Notes
None.
