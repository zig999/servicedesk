---
title: Investigation engine's landing area
summary: A greenfield module beside case and capability-registry, consuming the published case-query and capability-registry reads without touching the knowledge context.
area:
  - src/src
modules:
  - name: case-query
    path: src/src/case/case-query.port.ts
    role: depends-on
  - name: case-resolution
    path: src/src/case/case-resolution.ts
    role: depends-on
  - name: case-store
    path: src/src/case/case-store.port.ts
    role: adjacent
  - name: capability-registry
    path: src/src/capability-registry
    role: depends-on
  - name: glossary
    path: src/src/glossary
    role: adjacent
  - name: persistence
    path: src/src/persistence
    role: depends-on
  - name: factories
    path: src/src/factories
    role: depends-on
  - name: errors
    path: src/src/errors
    role: depends-on
  - name: entry-point
    path: src/src/index.ts
    role: touched
sources:
  - intake/scope.md
---

## What it is

No `investigation` module exists anywhere under `src/src` today — `case/`, `capability-registry/`
and `glossary/` are the only bounded modules present, and `index.ts` is still the stated-empty
substrate the plan's tasks are meant to grow.
The knowledge context publishes exactly one synchronous read, `ICaseQuery.readCase`
(`src/src/case/case-query.port.ts`, implemented at `src/src/case/case-query.service.ts`), which
already composes the case store, the glossary and the capability registry behind their own ports
and answers a case whole, validated, and pinned by content hash.
`ICapabilityQuery.readCapability` (`src/src/capability-registry/capability-query.port.ts`) is the
one published lookup from a glossary concept to the capability — name, connector, timeout,
schemas — that currently answers it, one to one with no fallback chain.
The pure resolution behavior a resolved verdict feeds — `collectionPlan`, `requiresEvaluationOf`,
`resolveOutcome` — already lives at `src/src/case/case-resolution.ts` as behavior over the parsed
`Case` aggregate, importing nothing but the aggregate's own types.
Every existing file-backed store shares two helpers, `readJsonFileOrAbsent`/
`readJsonFileWithTextOrAbsent` and `writeJsonFile`, from `src/src/persistence/json-file.ts`, and
every published read is wired by a small factory under `src/src/factories/` that takes data
directories as parameters rather than hardcoding paths.

## Notes

The scope explicitly excludes the knowledge context (glossary) from this change; `glossary/` is
recorded here only as the neighbor the engine must not reach into.
No capability-evaluation, hypothesis-judgment or event-publishing module exists yet anywhere in
the tree — the parallel evidence collection, the `HypothesisEvaluator` port, the fake adapter, the
drafting step, the immutable investigation write with window idempotency, and
`InvestigationCompleted` are all net-new; this survey found no partial prior art for any of them.
There is no messaging, queue or event-bus dependency declared in `src/package.json`; an
`InvestigationCompleted` "event" today has nothing in the tree to publish through beyond a plain
in-process value.
