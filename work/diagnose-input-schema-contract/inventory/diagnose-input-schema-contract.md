---
title: Capability, connector and diagnose surfaces the input-schema contract touches
summary: The capability and connector-configuration registries, the HTTP connector
  adapter, the diagnose controller, and the case-query read surface, all wired through
  one composition root, where the input-schema shape check, the derived case-input-requirements
  read, the diagnose entry gate, the placeholder degrade fix and the two-point reconciliation
  check land.
area:
- src/src/capability-registry
- src/src/connector-registry
- src/src/http-connector
- src/src/investigation
- src/src/case
- src/src/http
- src/src/factories
- src/src/errors
sources:
- work/diagnose-input-schema-contract/intake/scope.md
modules:
- name: capability-registry
  path: src/src/capability-registry
  role: touched
- name: connector-registry
  path: src/src/connector-registry
  role: touched
- name: http-connector
  path: src/src/http-connector
  role: touched
- name: investigation-http-declarative-observation-source
  path: src/src/investigation/http-declarative-observation-source.adapter.ts
  role: touched
- name: diagnose-http-surface
  path: src/src/http/diagnose.controller.ts
  role: touched
- name: case-query-service
  path: src/src/case/case-query.service.ts
  role: depends-on
- name: case-query-port
  path: src/src/case/case-query.port.ts
  role: touched
- name: build-app-factory
  path: src/src/factories/build-app.factory.ts
  role: touched
- name: status-map
  path: src/src/errors/status-map.ts
  role: touched
- name: connector-request-resolver
  path: src/src/http-connector/connector-request-resolver.ts
  role: depends-on
- name: citation-validation
  path: src/src/investigation/citation-validation.ts
  role: depends-on
---

## What it is
The area a plan for the diagnose input-schema contract lands in: two sibling registries (`capability-registry`, `connector-registry`), the HTTP connector runtime that resolves placeholders and issues calls, the diagnose HTTP surface, the case read surface the diagnose gate must consult, and the one composition root (`build-app.factory.ts`) that currently keeps the two registries as separate, mutually unaware instances.
`capability-registry/capability.ts` and `capability-registry/capability-registry.service.ts` hold the `Capability`/`CapabilityRegistration` types and the `registerCapability` refusal pipeline the new `input_schema` shape check joins.
`connector-registry/connector-configuration-registry.service.ts` holds `registerConnector`'s own refusal pipeline, the placeholder ⊆ properties reconciliation's second registration point.
`http-connector/connector-request-resolver.ts` is where an unresolved placeholder is thrown today (`ConnectorPlaceholderNotResolvedError`), and `investigation/http-declarative-observation-source.adapter.ts` is the one call site (`resolveConnectorRequest` at its `observeConcept` method) that does not currently catch it, so it propagates uncaught to a 500.
`http/diagnose.controller.ts`'s `handleDiagnoseRequest` is the one place the diagnose entry-point gate must sit: after `caseQuery.readCase` and the existing released-state check, before `runDiagnose` is ever called.
`case/case-query.port.ts`'s `ICaseQuery` and `case/case-query.service.ts`'s `CaseQueryService` are the published read the diagnose controller and any new `read-case-input-requirements` route would extend or sit beside; `Case.manifest`/`Hypothesis.collects` (`case/case.ts`) name the concepts a case version's collection-plan draws capabilities from.
`errors/status-map.ts` is the one table (COR-04) every new typed error's HTTP status is added to; it already carries entries for the capability and connector registration refusals this contract extends.

## Notes
None.
