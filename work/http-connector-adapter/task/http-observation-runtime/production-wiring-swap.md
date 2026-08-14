---
title: Production wiring swap
summary: The production diagnose pipeline is rewired to construct the HTTP declarative adapter instead of the fixture-backed fake.
rationale: "Kept as its own task because swapping which already-compliant adapter a factory constructs, and retiring the fixture path it replaces, is a different reason to change than building the adapter itself — and it is where the fake's existing test consumers (the e2e/integration specs the inventory names) actually meet the change. It implements no specification node: which concrete adapter class backs an unchanged port in one wiring point is production topology, not a fact the specification decides — the specification states what the port must answer (the four endings, in scope, in vocabulary, within deadline), and that obligation is what the adapter task's own implements already covers."
sources:
  - intake/scope.md
objective: The production diagnose pipeline is constructed with the HTTP declarative observation-source adapter in place of the fixture-backed fake, and no production code path is left seeding or reading the static observations fixture.
criteria:
  - Building the production diagnose pipeline no longer constructs FakeObservationSource.
  - The production diagnose pipeline's IObservationSource dependency resolves to the HTTP declarative adapter.
  - No production code path still seeds or reads the static observations fixture file.
  - Every environment variable env.ts still declares as required has at least one remaining production consumer once the swap lands.
depends_on:
  - task/http-observation-runtime/http-declarative-observation-source
---

## What it is

The change to diagnose-server.factory.ts (and whatever production-diagnose.factory.ts wires) that constructs the new adapter in place of the fake.
The retirement of observations.json's production role and the reconciliation of OBSERVATIONS_FIXTURE_FILE in env.ts.

## Notes

FakeObservationSource itself is not deleted by this task's criteria; whether it stays available for non-production use (tests, local fixtures) is an implementation choice, not a criterion here.
The e2e/integration specs the inventory names as consumers of the fake-backed production wiring are exactly what this task's own proof has to account for.
The binder found none of the epic's candidate specification nodes demonstrated by this task's own criteria — every one of them conditions the adapter class's own behavior (call shape, timeout, vocabulary translation), which the sibling task http-declarative-observation-source already implements, not which already-built class a factory constructs. It filed the port-identity contracts and the domain/architecture constraints as advisory, and the behavioral rules/scenarios as remainder, pointing at that sibling task.
