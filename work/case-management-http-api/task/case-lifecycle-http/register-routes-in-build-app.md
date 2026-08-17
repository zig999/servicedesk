---
title: build-app.ts registers every route this initiative delivers
summary: Establishes one aggregation convention in build-app.ts and registers each of the eighteen route plugins this initiative delivers, so every one of them is actually reachable through the running server.
rationale: No specification node states how a route reaches the running server — this is the project's own wiring convention, not a domain fact the specification governs. The gap this task closes was disclosed live, as `deferred`, by capability-registry-http/read-capability-route's own delivery record, and the inventory had already named it as an unaddressed risk during planning.
objective: build-app.ts follows one stated convention for registering a route plugin, and every route plugin this initiative's other four epics deliver is registered through it, so each is reachable by a real request against the built app.
criteria:
  - build-app.ts declares one convention for registering a route plugin (a list, a loop, or an explicit sequence of calls — the implementer's own choice, stated once rather than repeated per route).
  - Every route plugin file this initiative delivered by the time this task runs is registered through that convention, and a request against each one reaches its own controller rather than answering 404 for a route that exists in source but was never wired in.
  - The existing diagnose route's own registration is preserved exactly as it already answers, unchanged in shape or behavior.
depends_on:
  - task/capability-registry-http/read-capability-route
  - task/capability-registry-http/list-capabilities-route
  - task/case-lifecycle-http/create-draft-route
  - task/case-lifecycle-http/update-draft-route
  - task/case-lifecycle-http/release-route
  - task/case-lifecycle-http/discard-route
  - task/case-lifecycle-http/revise-hypothesis-route
  - task/case-lifecycle-http/place-hypothesis-route
  - task/case-lifecycle-http/remove-hypothesis-route
  - task/case-query-http/read-case-route
  - task/case-query-http/list-cases-route
  - task/case-query-http/list-case-versions-route
  - task/case-query-http/list-hypotheses-route
  - task/case-query-http/list-hypothesis-revisions-route
  - task/glossary-query-http/read-vocabulary-term-route
  - task/glossary-query-http/list-vocabulary-terms-route
  - task/glossary-query-http/read-concept-route
  - task/glossary-query-http/list-concepts-route
sources:
  - intake/http-surface-wiring.md
---

## What it is

The one task, cut mid-delivery, that makes every one of this initiative's eighteen HTTP routes actually reachable — nothing here is a domain fact, and every one of its dependencies is a route task from one of the other four epics.

## Notes

None.
