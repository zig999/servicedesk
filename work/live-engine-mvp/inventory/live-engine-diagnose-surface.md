---
title: Diagnose pipeline, its ports, and the HTTP surface it does not yet have
summary: A file-backed investigation service with a complete synchronous pipeline and two unimplemented LLM ports, no HTTP layer, no case fixture, and a dedup layer the specification withdrew today.
area:
  - src/src/investigation/
  - src/src/factories/
  - src/src/persistence/
  - src/src/case/
  - src/src/glossary/
  - src/src/capability-registry/
  - src/src/errors/
  - src/src/index.ts
  - package.json
  - standards/backend-node-service.yaml
modules:
  - name: investigation
    path: src/src/investigation
    role: touched
  - name: factories
    path: src/src/factories
    role: touched
  - name: case
    path: src/src/case
    role: touched
  - name: index-entry
    path: src/src/index.ts
    role: touched
  - name: persistence
    path: src/src/persistence
    role: depends-on
  - name: glossary
    path: src/src/glossary
    role: depends-on
  - name: capability-registry
    path: src/src/capability-registry
    role: depends-on
  - name: errors
    path: src/src/errors
    role: depends-on
conventions:
  - statement: Each module wires its own concrete instances in one factory function under src/factories/, named <resource>.factory.ts, and a service never constructs its own dependency.
    seen_at: src/src/factories/case-query.factory.ts
  - statement: A port declares its interface with no infrastructure import; a fake implementing it is seeded with fixtures ahead of the call and throws a plain error for an unseeded key, never inventing a verdict.
    seen_at: src/src/investigation/fake-hypothesis-evaluator.adapter.ts
  - statement: A file-backed store reads and writes through persistence/json-file.ts's shared readJsonFileOrAbsent/writeJsonFile helpers rather than calling node:fs directly.
    seen_at: src/src/persistence/file-case-store.repository.ts
  - statement: A case is stored as one plain JSON document per version, at <directory>/<slug>/<version>.json, with no separate index file.
    seen_at: src/src/persistence/file-case-store.repository.ts
  - statement: A stage takes now/deadline as explicit parameters and never reads the system clock itself.
    seen_at: src/src/investigation/judgment-stage.ts
must_not_duplicate:
  - what: The synchronous per-call pipeline wiring (file-backed investigation store, glossary-query, capability-query, plus whichever observation/evaluator/consolidator adapters it is given) into one callable runner.
    at: src/src/factories/diagnose.factory.ts (createDiagnoseRunner, wrapping run-diagnosis.ts's own runDiagnosis)
  - what: Plain-JSON-file read/write with absence-as-data and typed-error-on-failure.
    at: src/src/persistence/json-file.ts
  - what: Case document structural parsing/validation and the one-file-per-version storage shape a fixture case must already satisfy.
    at: src/src/case/parse-case-document.ts and src/src/persistence/file-case-store.repository.ts
  - what: Outcome/collection-plan/required-hypothesis resolution over a parsed case.
    at: src/src/case/case-resolution.ts
risks:
  - risk: diagnose.ts, idempotency-lease-store.ts, idempotency-resolution.ts, diagnosis-run-registry.ts and diagnose-entry-point.factory.ts implement a window-based dedup/join rule an /analyse invocation removed from the specification today (the business now requires every diagnose call to run fresh); a real composition root wired directly to run-diagnosis.ts/createDiagnoseRunner would bypass this layer entirely, leaving it live but unreachable or, left wired, would silently keep joining/short-circuiting a rule the specification no longer states.
    consumers:
      - src/src/factories/diagnose-entry-point.factory.ts
      - src/src/__tests__/unit/investigation/diagnose.spec.ts
      - src/src/__tests__/unit/investigation/idempotency-key.spec.ts
      - src/src/__tests__/unit/investigation/idempotency-resolution.spec.ts
      - src/src/__tests__/unit/investigation/idempotency-lease-store.spec.ts
      - src/src/__tests__/unit/investigation/diagnosis-run-registry.spec.ts
  - risk: IHypothesisEvaluator.evaluate(criterion, evidence) has no parameter for the case's title or when_to_use, but the amended constraints/the-judgment-prompt-is-closed now requires both in the prompt; judgment-stage.ts is the port's one caller today, so widening the signature ripples into it and into every fake/test that constructs a call against the current two-argument shape.
    consumers:
      - src/src/investigation/judgment-stage.ts
      - src/src/investigation/fake-hypothesis-evaluator.adapter.ts
      - src/src/__tests__/unit/investigation/judgment-stage.spec.ts
      - src/src/__tests__/unit/investigation/run-diagnosis.spec.ts
  - risk: observation-source.port.ts's own module comment already names the real connector as "this epic's declared remainder" of a different, prior task-set; writing a real IObservationSource under this scope's item (5) risks either duplicating that remainder's ownership or leaving observation the one port still fake while evaluator/consolidator go real, an inconsistency the pipeline's own callers would surface.
    consumers:
      - src/src/investigation/evidence-collection-stage.ts
      - src/src/investigation/fake-observation-source.adapter.ts
  - risk: package.json declares neither @anthropic-ai/sdk (authorized by STK-11) nor any HTTP framework (STK-03 names Fastify as the only one this standard permits), so every task instantiating a real LLM adapter or exposing HTTP is blocked on a manifest edit landing first — and the framework's own concurrent-delivery procedure requires a package-installing task to be delivered alone, never batched with the adapters or the HTTP layer that depend on it.
    consumers:
      - src/src/factories/diagnose.factory.ts
      - src/src/index.ts
sources:
  - work/live-engine-mvp/intake/scope.md
---

## What it is

The investigation/knowledge domain already has a complete, tested synchronous pipeline (run-diagnosis.ts) composing collection, judgment, resolve-and-narrow, drafting and file-backed persistence over an already-resolved case, subject and narrative.
Two of its three infrastructure ports — IHypothesisEvaluator and IAssessmentConsolidator — have only fake adapters; no production adapter using an LLM client exists for either, and no fixture case document exists anywhere in the repository or its fixtures.
diagnose.factory.ts's createDiagnoseRunner already wires the file-backed stores and whatever observation/evaluator/consolidator adapters it is handed into one callable pipeline, but nothing instantiates real adapters or calls it — src/src/index.ts exports nothing, and no HTTP framework is installed.
A second, separate layer (diagnose.ts plus its idempotency/lease/registry files) wraps that pipeline in a window-based dedup rule that the specification stated as of this morning and withdrew later the same day.
The project's own standard (backend-node-service.yaml) already names Fastify as the one HTTP framework this stack permits and @anthropic-ai/sdk as the one path to the model, but package.json declares neither today.

## Notes

None.
