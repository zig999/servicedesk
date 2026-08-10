---
title: evidence-collection-stage's subject passthrough is already unfiltered
summary: Verifies, with no source change, that evidence-collection-stage.ts already dispatches every concept's observe-concept call with the whole canonical Subject by reference, unfiltered, satisfying all three of this task's criteria through the two dependency tasks' already-delivered propagation.
task: sha256:84e0a81b78fbb35582291c2eb15ed7161f9856d0eff4a8115083009d6584e0ab
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/subject-identity-rework-evidence-collection-stage-subject-passthrough-build
files:
  - path: src/investigation/evidence-collection-stage.ts
    effect: "unmodified by this task. collectEvidence resolves the case's collection plan and, for every concept, calls collectOneEvidence with the same subject: Subject reference it received in CollectEvidenceOptions; collectOneEvidence in turn calls observationSource.observeConcept(concept, subject, requester) with that same reference, and serializeInputs JSON.stringify's it whole for evidence.inputs. Subject is imported as the type re-exported by observation-source.port.ts, which the subject-value-object and observation-source-subject-shape tasks already rebuilt as the canonical type-plus-attributes shape. Neither function here destructures, maps, filters or selects any of subject.attributes at any point, so the file already answers this task's three criteria exactly as written, before this task's own session touched anything."
criteria:
  - criterion: "Each concept's observe-concept call in a collection run receives the subject's governed type and its whole attribute-value set."
    met: true
    how: "collectOneEvidence passes the same subject: Subject value — carrying both type and the whole attributes array — as the second positional argument to observationSource.observeConcept(concept, subject, requester) for every concept the collection plan names, since collectEvidence forwards the one subject it received in CollectEvidenceOptions to every collectOneEvidence call via Promise.all."
  - criterion: "No attribute is filtered from the subject before any concept's call is dispatched."
    met: true
    how: "the only two places evidence-collection-stage.ts reads subject at all are the observeConcept call itself and serializeInputs's JSON.stringify, both of which take the whole object by reference. There is no destructuring of subject.attributes, no filter/map narrowing it, and no per-concept subset logic anywhere between CollectEvidenceOptions and the dispatched call."
  - criterion: "Existing per-concept collection results untouched by the shape change — one evidence per concept, current deadline behavior — are unaffected."
    met: true
    how: "collectionPlan's one-concept-per-entry dispatch, the stage-ceiling computation, effectiveBoundMsFor, raceObservation's timeout race, and settledEvidence's ok/denied/timeout/unavailable mapping all treat subject as an opaque value passed straight through; none of them branches on or reads any field of Subject's own shape, so none of this logic differs between the old bare-id shape and the new type-plus-attributes shape."
nodes:
  - node: domain/investigation/subject
    encoded_at:
      - src/investigation/evidence-collection-stage.ts
    how: "this task's own slice of the node — no attribute is filtered out for any one concept, every capability's connector receives the whole set — is realized by evidence-collection-stage.ts's existing, unmodified dispatch: every concept's observe-concept call carries the identical subject: Subject reference the stage itself received, with no attribute selected out. The type's own shape and construction-time invariant remain subject.ts's own canonical declaration, unedited here; this file only consumes it."
  - node: constraints/the-domain-depends-on-no-infrastructure
    how: "honored, not independently encoded: evidence-collection-stage.ts's only imports are the capability-registry port and its data type, domain case modules, and its own sibling investigation modules — no framework, driver or provider-client package anywhere in the file, before or after this task. This addresses the task's own UNDERDETERMINED note (its three criteria alone would not demonstrate import-freedom): the file's actual, unmodified import list already satisfies the constraint regardless."
inferences:
  - inferred: "this task requires no modification to src/investigation/evidence-collection-stage.ts, or to any other file, to satisfy its three stated criteria."
    from: "reading evidence-collection-stage.ts's current content — CollectEvidenceOptions.subject is already typed Subject, imported from observation-source.port.ts's re-export, and neither collectEvidence nor collectOneEvidence destructures or filters subject.attributes anywhere — together with subject-value-object's and observation-source-subject-shape's own already-validated delivery records, both of which explicitly list evidence-collection-stage.ts's own untouched passthrough of the whole Subject to observeConcept among what they preserved."
---

## What it is

No source change: evidence-collection-stage.ts's existing, unmodified passthrough of the whole canonical Subject to observation-source already satisfies this task's three criteria, established by the two dependency tasks it builds on.

## Notes

None.
