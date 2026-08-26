---
title: Integration and glossary read paths behind the four conformance corrections
summary: The observation adapter, capability and connector registries, the shared status map, and the glossary store/service pair the scope's four behaviors touch, all under src/src.
area:
  - src/src/investigation
  - src/src/capability-registry
  - src/src/connector-registry
  - src/src/errors
  - src/src/http
  - src/src/glossary
  - src/src/persistence
  - src/src/case
modules:
  - name: investigation
    path: src/src/investigation
    role: touched
  - name: capability-registry
    path: src/src/capability-registry
    role: touched
  - name: connector-registry
    path: src/src/connector-registry
    role: touched
  - name: errors
    path: src/src/errors
    role: touched
  - name: http
    path: src/src/http
    role: touched
  - name: glossary
    path: src/src/glossary
    role: touched
  - name: relational-glossary-store
    path: src/src/persistence/relational-glossary-store.repository.ts
    role: touched
  - name: case
    path: src/src/case
    role: depends-on
must_not_duplicate:
  - what: declaredFieldsOf, the capability output_schema field filter observationOf (http-declarative-observation-source.adapter.ts) already reuses rather than re-deriving
    at: src/src/investigation/citation-validation.ts
  - what: toReadConnectorConfigurationResponse, the one projection from ConnectorConfiguration to its wire shape, exported for list-connector-configurations.controller.ts's own reuse
    at: src/src/http/read-connector-configuration.controller.ts
  - what: STATUS_BY_ERROR_CLASS, the one table every domain-error-to-transport-status decision belongs in
    at: src/src/errors/status-map.ts
  - what: issueConnectorHttpCall, the one HTTP-issuance mechanism both the observation adapter and test-connector.controller.ts call rather than each running its own fetch/timeout logic
    at: src/src/http-connector/connector-http-issuer.ts
risks:
  - risk: Making resolveCapability/readCapability answer an unavailable ending instead of throwing for an unresolved or duplicate-answered concept changes what every other reader of ICapabilityQuery.readCapability receives for the same conditions.
    consumers:
      - src/src/investigation/judgment-stage.ts
      - src/src/case/validate-case-coherence.ts
      - src/src/http/read-capability.controller.ts
  - risk: Widening ObservationOutcome (or observeConcept's signature) to carry a result_detail and a remaining-budget bound is a port change every IObservationSource implementer and every direct caller of observeConcept must follow, not a change local to the HTTP adapter.
    consumers:
      - src/src/investigation/evidence-collection-stage.ts
      - src/src/investigation/fake-observation-source.adapter.ts
      - src/src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
      - src/src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  - risk: Changing what wellFormedConfiguration/refuseRegistrationDepartures classify as IncompleteConnectorConfigurationError versus ConnectorConfigurationNotWellFormedError changes the refusal register-connector.controller.ts propagates for the same malformed request bodies.
    consumers:
      - src/src/http/register-connector.controller.ts
  - risk: Changing ConnectorConfiguration.configuration from a stored object back to stored text touches every reader that currently treats it as a plain object.
    consumers:
      - src/src/http/read-connector-configuration.controller.ts
      - src/src/http/list-connector-configurations.controller.ts
      - src/src/http/test-connector.controller.ts
      - src/src/investigation/http-declarative-observation-source.adapter.ts
sources:
  - intake/scope.md
---

## What it is

A Node/TypeScript backend arranged in ports/services/adapters, all under `src/src` (the
git-tracked package root sits one level below the target root `src`). `investigation` holds
the observation port, the collection stage and the production HTTP adapter behavior 1
corrects. `capability-registry` holds `capability-registry.service.ts` (behaviors 2 and 3, and
a comment correction in behavior 4) and `capability.ts`'s `CAPABILITY_NATURES`/
`REQUIRED_REGISTRATION_ATTRIBUTES` data (behavior 4's last item). `connector-registry` holds
`connector-configuration-registry.service.ts` (behavior 2's three divergences and one comment
correction in behavior 4). `errors` holds `status-map.ts`, the one status-mapping table
(behaviors 2 and 4), plus one file per typed domain error. `http` holds
`read-capability-by-identity.controller.ts` and `read-connector-configuration.controller.ts`,
both named for their own comment corrections in behavior 4, plus `register-connector.controller.ts`,
`test-connector.controller.ts` and `list-connector-configurations.controller.ts`, which read the
same services and the same `ConnectorConfiguration.configuration` field but are not themselves
named by the scope. `glossary` and `relational-glossary-store.repository.ts` hold the four
task-path citations of behavior 4's last item. `case` (`judgment-stage.ts`,
`validate-case-coherence.ts`) is not named by the scope but consumes
`ICapabilityQuery.readCapability`, the same method behavior 1 changes.

## Notes

Behavior 1's `resolveCapability` calls `capabilities.readCapability`, whose
`DuplicateConceptAnswerError` is already thrown today — the fix has to decide whether that
throw moves into an unavailable ending at the adapter boundary alone or changes `readCapability`
itself, which `judgment-stage.ts` and `validate-case-coherence.ts` also call directly.

`ObservationOutcome` has no field to carry an error-class name for a non-ok ending today;
`EvidenceEnding` already has an optional `resultDetail` it does not yet receive from
`observeConcept`'s own outcome — behavior 1's fix likely widens `ObservationOutcome`, not the
adapter file alone.

`observeConcept`'s signature takes no remaining-budget parameter today; the collection stage
computes `effectiveBoundMsFor(capability, stageCeilingMs)` itself and only uses it for the
race's own external timeout — clamping `capability.timeout` inside the adapter needs that value
threaded through the port, which every `IObservationSource` implementer must then accept.

`ConnectorConfiguration.configuration` is read as a plain object by three other call sites the
scope does not name — `read-connector-configuration.controller.ts`, `list-connector-configurations.controller.ts`
and `test-connector.controller.ts` — so behavior 2's third divergence touches all three even
though only the service file is named.

`capability-registry.service.ts`'s `contractProblems` (behavior 3) is the one place
`IncompleteCapabilityContractError` and a non-integer timeout are both raised today;
`constraints/a-malformed-request-is-refused-with-a-validation-error`'s route-level 400 is a
different layer the scope leaves as the binder's open decision.

`knowledge/contracts/integration/capability-registry.md` already lists `read-capability-by-identity`
among its four published operations, confirming the comment behavior 4 names
(`capability-registry.service.ts` l.95-99) is the stale reading, not an open question.

Every service in this area carries its own private, unexported `pageCountOf` with an identical
body and an identical MNT-03-disclosed comment — an established convention, not one of the four
behaviors to touch.
