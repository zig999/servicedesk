---
title: Frontend console cross-cutting foundation
summary: The app shell, router skeleton, typed API client, error-to-UI-state mapping, and the shared components (conflict banner, telemetry hook, reusable status table, query client and toaster) that this wave builds before any case-authoring, glossary or capabilities screen exists.
rationale: >-
  The plan-node contract requires an epic to declare at least one covered node, and this
  epic's own subject is cross-cutting plumbing rather than a business screen -- there is no
  node whose territory is "infrastructure". I claim the same seven-node territory the sibling
  case-authoring-console epic already claims, since that is the territory both it and a future
  Glossary/Capabilities epic will build screens against using what this epic delivers, and I
  declare all seven uncovered because no task here authors or displays any of these domain
  concepts. Two epics covering the same nodes is shared scope declared, not an error, per the
  contract.
covers:
  - domain/knowledge/case
  - domain/knowledge/case-version
  - domain/knowledge/hypothesis
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/resolution
  - domain/knowledge/referral
  - contracts/system/case-authoring
  - constraints/no-route-enforces-authentication
uncovered:
  - node: domain/knowledge/case
    why: This wave builds only navigation, transport and shared-component plumbing; no task names a case's identity or its next_version counter on any screen.
  - node: domain/knowledge/case-version
    why: No task composes, corrects or releases a draft's manifest or attributes; routes for a case-version screen exist only as unlayouted placeholders.
  - node: domain/knowledge/hypothesis
    why: No task names or revises a hypothesis; the reusable components this wave ships carry no hypothesis-specific content.
  - node: domain/knowledge/hypothesis-revision
    why: No task authors a revision's criterion, collects list or resolution; the error-to-UI-state table maps transport errors, not hypothesis content.
  - node: domain/knowledge/resolution
    why: No task pairs an outcome with a referral on any screen; the conflict banner and reusable table this wave ships are generic, not resolution-specific.
  - node: domain/knowledge/referral
    why: No task names an action or a recipient; nothing in this wave's components carries referral content.
  - node: contracts/system/case-authoring
    why: The capability itself is not implemented by any task in this wave; the wave delivers only the shell, router, client and shared components a future case-authoring screen will be built on top of.
sources:
  - intake/onda-1-scope.md
---

## What it is
This epic claims the case-authoring territory the app shell, router, API client and shared components will eventually surface, without surfacing any of it itself.
It is used by the existing case-authoring-console epic's future screens and by a future Glossary/Capabilities epic, both of which build on this foundation rather than duplicate it.

## Notes
None.
