---
title: observation-source and its fake receive the subject's whole attribute-value set
summary: fixtureKey in the fake adapter is rebuilt (and documented) as this task's own delivery — composed from concept, the subject's governed type and every attribute-value pair — replacing the disclosed compile-compatibility patch left by the dependency task, with the port interface's own doc comment now stating the same unfiltered-passthrough fact explicitly.
task: sha256:ee2f69d6cc2667bdaab7a1558e1f4225fa761fc22743f774ec34efe1f72b87d1
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/subject-identity-rework-observation-source-subject-shape-build
files:
  - path: src/investigation/fake-observation-source.adapter.ts
    effect: "fixtureKey's own doc comment and observeConcept's doc comment now name this task's criteria 1 through 3 explicitly, documenting the fixture key as composed from concept, the subject's governed type and every attribute-value pair in its whole set, joined with '::'. This supersedes task/subject-identity-rework/subject-value-object's own disclosed compile-compatibility patch to this same function, now authored and claimed as this task's real criterion-3 delivery. The join computation's own body is unchanged: on inspection it already matched this composition exactly, so no behavioral difference exists — only the authorship, documentation and claim over it."
  - path: src/investigation/observation-source.port.ts
    effect: "observeConcept's own doc comment now states explicitly that subject carries the whole attribute-value set the entry point assembled, with no narrower parameter for a subset, naming this task's criteria 1 and 2. No exported type, signature or runtime behavior changed."
criteria:
  - criterion: "observe-concept's parameter carries the subject's governed type and its whole attribute-value set, not a bare id."
    met: true
    how: "IObservationSource.observeConcept's subject parameter is typed as the canonical Subject (type plus attributes: readonly SubjectAttributeValue[]), imported and re-exported from subject.ts; FakeObservationSource.observeConcept and seed() accept the same canonical Subject. No bare id parameter exists anywhere in either file."
  - criterion: "No attribute is selected or dropped before the call reaches the port; the whole set the caller supplied is what the port receives."
    met: true
    how: "observeConcept's signature takes the whole subject: Subject object by reference in both the interface and the fake; neither file destructures, filters or selects individual attributes before the call. In the fake, the one place subject.attributes is read is fixtureKey, which flatMaps over every pair (both attribute name and value) rather than a subset."
  - criterion: "The fake adapter's fixture key is composed from every attribute-value pair, following the existing '::'-joined composite-key convention, rather than from a bare id."
    met: true
    how: "fixtureKey(concept, subject) joins concept, subject.type and, for every attribute-value pair in subject.attributes, both its attribute name and its value, into one array, then joins with '::'. This mirrors idempotencyKeyOf's and capabilityOutputSchemaKey's own established multi-field '::'-join convention, reused rather than reinvented. No bare id is read anywhere in the function."
  - criterion: "Exactly one concrete class implements the port, matching the existing hypothesis-evaluator-modules.spec.ts fitness pattern."
    met: true
    how: "FakeObservationSource remains the only class under src/investigation declaring implements IObservationSource; this task adds no second implementer and no new file. The existing observation-source-modules.spec.ts already asserts exactly one concrete class implementing IObservationSource over the whole directory, mirroring hypothesis-evaluator-modules.spec.ts's own pattern."
nodes:
  - node: domain/investigation/subject
    encoded_at:
      - src/investigation/fake-observation-source.adapter.ts
    how: "this task's own slice of the node — the whole attribute-value set reaching the observation side unfiltered — is what fixtureKey encodes: it draws concept, subject.type and every one of subject.attributes' pairs into the lookup key, never a subset. The type's own shape and construction-time invariant are subject.ts's own canonical declaration, left unedited here."
  - node: domain/investigation/subject-attribute-value
    encoded_at:
      - src/investigation/fake-observation-source.adapter.ts
    how: "each SubjectAttributeValue pair in subject.attributes is read in full by fixtureKey — both its attribute name and its value contribute to the key, so no pair is read partially or dropped."
  - node: contracts/investigation/observation-source
    encoded_at:
      - src/investigation/fake-observation-source.adapter.ts
      - src/investigation/observation-source.port.ts
    how: "observe-concept's one call per concept, for one subject, within the requester's own scope, is realized by IObservationSource.observeConcept (whose doc comment this task extends to state the whole-set/no-filtering fact explicitly) and by FakeObservationSource.observeConcept, whose fixtureKey this task rebuilds and claims to draw on the subject's whole attribute-value set — the piece task/subject-identity-rework/subject-value-object's own answer for this same node explicitly left unclaimed."
  - node: contracts/integration/concept-observation
    how: "this task's edits honor the upstream, published operation's own shape without restating or altering it: the consumed port's three-argument call is unchanged, and the whole attribute-value set this task ensures travels through unfiltered keeps the consumed shape aligned with the published one. No new fact about the published contract itself is encoded by this task."
  - node: constraints/the-domain-depends-on-no-infrastructure
    how: "fake-observation-source.adapter.ts still imports only its sibling module — no framework, driver, provider client or standard-library import was added. observation-source.port.ts likewise gained no new import. Enforced automatically by the existing, unedited observation-source-modules.spec.ts directory-wide sweep."
inferences:
  - inferred: "fixtureKey's existing composition — concept, then subject.type, then every attribute-value pair's attribute name and value flattened in the array's own order, all joined with '::' — is kept as this task's own final composition, rather than replaced with a per-pair attribute=value tagged segment or a sorted/canonicalized attribute order."
    from: "the criterion's own wording is satisfied exactly by a flat '::'-join, matching idempotencyKeyOf and capabilityOutputSchemaKey, both of which join a fixed set of string fields the same way, with no per-field key/value tagging and no sorting. Neither domain node states a canonical ordering for the attribute-value set, so imposing one would be a decision neither the specification nor this task's criteria ask for."
  - inferred: "observation-source.port.ts needed no functional edit for this task's criteria 1 and 2 — only a documentation addition — since the dependency task already replaced the port's inline Subject duplicate with the canonical, whole-attribute-value type before this task began, and observeConcept's signature already took the whole Subject object."
    from: "reading src/investigation/observation-source.port.ts as it stood before this delivery, and task/subject-identity-rework/subject-value-object's own delivery record, whose own criterion 4 and its contracts/investigation/observation-source node answer already claim exactly that replacement."
preserved:
  - "IObservationSource.observeConcept's three-parameter signature returning Promise<ObservationOutcome>, and the re-exported canonical Subject type, both unchanged in shape by this task."
  - "FakeObservationSource's seed()/observeConcept() fixture-driven behavior: answers exactly what a test seeded, throws (naming the concept) for a concept-and-subject pair nothing seeded, and never throws for any of the four evidence-result endings — unchanged."
  - "fixtureKey's own computed key string for any subject already exercised by existing tests is unchanged bit-for-bit, since its join logic was not altered, only its documentation — every existing seed()/observeConcept() pairing in observation-source.port.spec.ts, evidence-collection-stage.spec.ts and subject.spec.ts still resolves to the same key it did before this task."
  - "observation-source-modules.spec.ts's own directory-wide sweep — neither edited file gained a new import, and FakeObservationSource remains the sole implementer."
  - "evidence-collection-stage.ts's own untouched passthrough of the whole Subject to observeConcept — this task's port/fake documentation changes require no change there."
---

## What it is

fixtureKey in the fake adapter claimed and documented as this task's own delivery (its join logic was already correct, left over from the dependency task's disclosed scaffolding patch); the port interface's own doc comment extended to state the unfiltered whole-attribute-value-set passthrough explicitly.

## Notes

None.
