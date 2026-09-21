---
title: Refusal-rule dependencies for remove-capability and remove-concept
summary: Where the "cited by evidence" and "answered/collected/cited" guard conditions
  the scope names would have to read their evidence from, based on what the capability
  and connector services already read across module boundaries.
sources:
- intake/scope.md
area:
- src/src/capability-registry
- src/src/connector-registry
- src/src/glossary
- src/src/case
---

## What it is
`CapabilityRegistryService` already depends on a cross-module reader port (`IConnectorConfigurationsReader`, defaulted to `NO_REGISTERED_CONNECTOR_CONFIGURATIONS`) to check placeholder orphaning against connector configurations, and `ConnectorConfigurationRegistryService` symmetrically depends on `ICapabilitiesReader`; both default to an empty-returning stub when no reader is supplied, and both readers are wired via `build-app.factory.ts`'s `composeResources` (`createCapabilitiesReader`, `createConnectorConfigurationsReader`).
This reader-port pattern is the existing precedent for "read another module's data to decide a refusal without owning that module's store" — the same shape a remove-capability guard (evidence citing capability by name+version) or a remove-concept guard (capability answering it, evidence/citation naming it, hypothesis-revision collects listing it) would need against the case/investigation module's evidence and manifest data, which currently has no reader port exposed to `capability-registry` or `glossary`.
`manifest-composition.operations.ts`'s `removeHypothesis` shows the closest existing precedent for a removal guarded by a cross-cutting condition inside the same store (`refuseEmptiedManifest` reads the assembled version's manifest before calling `store.removeManifestEntry`), but it reads its own store, not another module's.

## Notes
No existing reader port from `capability-registry` or `glossary` into case/investigation evidence data was found in the files surveyed; supplying "evidence cites this capability/concept" or "a hypothesis-revision's collects lists this concept" will need either a new reader port (mirroring `ICapabilitiesReader`/`IConnectorConfigurationsReader`) or a lookup added to an existing case/investigation store, since the guard rules named in the scope are evaluated against manifested and unmanifested hypothesis-revisions, not something the capability/glossary services can currently see.
This node is kept separate from the routes/controllers/DTOs/stores inventory above because it names a missing dependency between modules (capability-registry/glossary → case/investigation evidence) that a change to the route-layer inventory cannot reach through — the guard's data source is a distinct territory from the file-separation pattern the routes mirror.
