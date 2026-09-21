---
title: Backend surface for remove-connector, remove-capability, remove-concept
summary: The discard/remove-hypothesis route-controller-dto-operation split, the read-modify-write
  registry services, and the upsert-only relational stores the three new DELETE routes
  must extend.
sources:
- intake/scope.md
area:
- src/src/http
- src/src/http/dto
- src/src/case
- src/src/connector-registry
- src/src/capability-registry
- src/src/glossary
- src/src/persistence
- src/src/errors
- src/src/factories
---

## What it is
The four-file separation (route/controller/dto/operation) is established twice: `discard.routes.ts` / `discard.controller.ts` / `dto/discard.dto.ts` / `case/discard.operation.ts` for case-version discard, and `remove-hypothesis.routes.ts` / `remove-hypothesis.controller.ts` / `dto/remove-hypothesis.dto.ts` / the `removeHypothesis` function inside `case/manifest-composition.operations.ts`.
Both routes are `app.delete(...)`, parse path params with a zod schema via `safeParse`, and on success return `reply.code(204).send()` with no body; a validation failure returns 400 with a `VALIDATION_ERROR` envelope, and the controller re-throws whatever the operation throws for the Fastify error handler (`error-handler.middleware.ts`) to catch and map via `status-map.ts`.
`ConnectorConfigurationRegistryService.registerConnector`, `CapabilityRegistryService.registerCapability` and `GlossaryService.registerConcept` all follow a read-modify-write shape: read the whole collection, filter out the entry matching identity, then call the store's `write*` method with the kept-plus-new list.
The three stores backing those services — `RelationalConnectorConfigurationStore.writeConnectorConfigurations`, `RelationalCapabilityStore.writeCapabilities`, `RelationalGlossaryStore.writeConcepts` — issue only `INSERT ... ON CONFLICT (...) DO UPDATE`; none of them ever issues a `DELETE` for a row that is absent from the list passed in, so the `write*` path cannot remove a persisted row.
The case-store's `discardDraft` and `deleteManifestEntry` (`persistence/relational-case-store.repository.ts`, around line 833 and 857-861) are the only existing writers that issue a literal `DELETE FROM ... WHERE` statement, run inside `runInTransaction`, guarded by `refuseUnlessDraft` before the delete executes.
Capability identity is the composite `(name, version)` (see `sameIdentity` in `capability-registry.service.ts` and the `(name, version)` primary key implied by the `ON CONFLICT (name, version)` upsert in `relational-capability-store.repository.ts`), matching the `GET /v1/capabilities/:name/:version` route shape in `read-capability-by-identity.routes.ts`. Connector identity is the single `connector` string (`ON CONFLICT (connector)`); concept identity is the single `name` string (`ON CONFLICT (name)`), with a second table `concept_accepts` keyed by `concept_name`.
`status-map.ts` holds a flat `Map` from domain error class to HTTP status, populated by 404/409/422/500 groupings; a "removal refused" error for these three entities is a new class added to that map, following the pattern of `ManifestWouldHoldNoHypothesisError` (422, extends `Error`, sets `this.name`, carries a typed `context`).
`build-app.ts` registers one route plugin per entry in `routePluginFactories`/`BuildAppDependencies`; `build-app.factory.ts` composes the concrete dependencies per route family (`lifecycleDependencies`, `registrationDependencies`, etc.) from `case-lifecycle.factory.ts`, `capability-registry.factory.ts`, `connector-configuration-registry.factory.ts` and `glossary.factory.ts`, each of which wraps a `Relational*Store` with its service class.

## Notes
`writeConnectorConfigurations`/`writeCapabilities`/`writeConcepts` are upsert-only and never delete a row, so a naive remove-connector/remove-capability/remove-concept built on "read, filter, call write*" will silently fail to remove the row from Postgres even though the in-memory list looks correct — a true DELETE requires a new store method mirroring `deleteManifestEntry`'s literal `DELETE FROM ... WHERE` inside `runInTransaction`.
None of `IConnectorConfigurationStore`, `ICapabilityStore` or `IGlossaryStore` currently declares any delete-shaped method, so the port interfaces need a new method each (e.g. `deleteConnectorConfiguration(connector)`, `deleteCapability(name, version)`, `deleteConcept(name)`) before a repository implementation can exist.
Deleting a concept also implies deciding whether to delete its `concept_accepts` rows (compare `deleteConceptAcceptsStatement`, already used inside `writeConcepts` before re-inserting), since `concept_accepts.concept_name` has no `ON DELETE CASCADE` visible in the repository code read here.
No relational `DELETE ... RETURNING` or `DELETE` at all currently protects against a missing row for connector-configuration/capability/concept; the guard-then-throw pattern (`refuseUnlessDraft` before `deleteManifestEntry`'s statement) is the model to reuse for a not-found or refusal check before issuing the delete.
`register-connector.routes.ts` uses `PUT /v1/connectors/:connector`; `register-concept.routes.ts` uses `PUT /v1/glossary/concepts/:name`; capability identity read uses `GET /v1/capabilities/:name/:version` — these give the path shapes a `DELETE /v1/connectors/:connector`, `DELETE /v1/glossary/concepts/:name`, `DELETE /v1/capabilities/:name/:version` would mirror.
