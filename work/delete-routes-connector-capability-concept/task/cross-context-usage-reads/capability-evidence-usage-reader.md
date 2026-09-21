---
title: A reader answering whether collected evidence names a capability identity
summary: A port in the capability registry, with its relational implementation, answering whether any
  collected evidence item names a given capability name and version.
rationale: Cut as its own task, ahead of the operation that consumes it, because it introduces an interface
  across the integration/investigation boundary and the seam is where the split belongs. Kept separate
  from the concept usage reader because it answers one condition of one rule over one store, while the
  concept reader answers four conditions over three.
sources:
- intake/scope.md
objective: Whether a capability identity is still named by an investigation's own collected evidence is
  readable from the capability registry through a port, without the registry owning the investigation
  store.
criteria:
- The port takes a capability identity as name and version together, the composite identity a capability
  is registered at.
- Given a stored evidence item recording that name and version as what produced it, the reader answers
  that the identity is named.
- Given no stored evidence item recording that name and version, the reader answers that the identity
  is not named.
- Given a stored evidence item recording the same name at a different version, the reader answers that
  the queried identity is not named.
- The port is declared in the capability-registry module and the adapter answering it reads the recorded
  evidence through the relational store that holds it, the capability-registry module importing no database
  driver to obtain the answer.
- The adapter is constructible from the same composition point that already builds the capability registry's
  other cross-module reader.
reference:
- inventory/refusal-guard-rule-evidence.md
- src/src/capability-registry/connector-configurations-reader.port.ts
- src/src/connector-registry/capabilities-reader.port.ts
- src/src/persistence/relational-investigation-store.repository.ts
- src/src/factories/build-app.factory.ts
implements:
- domain/investigation/evidence
- domain/integration/capability
- constraints/the-domain-depends-on-no-infrastructure
---

## What it is
The missing read the capability removal's guard needs, in the shape this codebase already uses when one module must decide a refusal against another module's data.
It answers one question about one identity and decides nothing.

## Notes
ADVISORY, from the specification — the objective's premise, that the capability registry needs this read at all, is held by rules/integration/a-registered-capability-cited-by-evidence-is-never-removed, which sits outside this task's own candidate set; the candidates give the data this reader answers with but not the reason it exists.
Decision, beyond the covers — stand: rules/integration/a-registered-capability-cited-by-evidence-is-never-removed is implemented by task/capability-removal/remove-capability-operation, this reader's own consumer; growing this reader task's claim to include it would duplicate a fact already governed there, so the reference stands as context rather than as a new claim.
ADVISORY, from the specification — domain/investigation/citation and domain/knowledge/hypothesis-revision are candidates but govern nothing here: the identity this reader answers about lives on domain/investigation/evidence's own capability reference, and neither citation nor hypothesis-revision carries a capability name or version.
ADVISORY, from the specification — the last criterion (constructible from the same composition point as the registry's other cross-module reader) rests on wiring and composition structure no candidate names; this is implementation structure the specification's own classes do not admit, not a silence to close.
ADVISORY, from the specification — domain/investigation/evidence's own capability relationship sanctions an observation whose capability never resolved, so the adapter's read must tolerate a stored item recording no capability name or version; no criterion depends on this, since "no stored evidence item recording that name and version" already answers not-named for such rows.
