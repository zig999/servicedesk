---
title: Observe-concept and the fake's fixture key carry the subject's whole attribute-value set
summary: Extends src/__tests__/unit/investigation/observation-source.port.spec.ts, previously carrying only single-attribute fixtures, with tests that make an extra pair, a second pair, an attribute name, a pair's order and the governed type each independently change the fake adapter's composed fixture key, proving the port and its fake pass and key on the subject's whole attribute-value set rather than any subset or a bare id.
implementation: sha256:fc768fd42e9b873dcfc7f1049dcb41a9da636b83896047ad387a6f3f7223ba83
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/subject-identity-rework-observation-source-subject-shape-suite
tests:
  - file: src/__tests__/unit/investigation/observation-source.port.spec.ts
    name: answers the ok ending carrying the actual observation seeded for the pair, not the bare tag alone
    proves: "the preserved fact this task's rebuild must not disturb — FakeObservationSource.observeConcept resolves the ok ending's own observation from the whole Subject it was given (criterion 1's parameter carrying the subject through unmodified)"
    fails_when: observeConcept fails to resolve the fixture seeded for SUBJECT_ONE, or returns anything but the exact seeded observation
  - file: src/__tests__/unit/investigation/observation-source.port.spec.ts
    name: answers the unavailable ending as data, without throwing
    proves: the preserved evidence-result contract — a non-ok ending is answered as data, not thrown
    fails_when: observeConcept throws for the unavailable ending instead of answering it as data
  - file: src/__tests__/unit/investigation/observation-source.port.spec.ts
    name: answers the denied ending as data, without throwing
    proves: the preserved evidence-result contract — a non-ok ending is answered as data, not thrown
    fails_when: observeConcept throws for the denied ending instead of answering it as data
  - file: src/__tests__/unit/investigation/observation-source.port.spec.ts
    name: answers the timeout ending as data, without throwing
    proves: the preserved evidence-result contract — a non-ok ending is answered as data, not thrown
    fails_when: observeConcept throws for the timeout ending instead of answering it as data
  - file: src/__tests__/unit/investigation/observation-source.port.spec.ts
    name: answers the outcome seeded for this subject, not the one seeded for a different subject of the same concept
    proves: "criterion 3, basic form — the composed fixture key is sensitive to which subject was supplied, not indifferent to it"
    fails_when: the fake answers with SUBJECT_TWO's seeded outcome when asked about SUBJECT_ONE, i.e. the two collide onto one fixture key
  - file: src/__tests__/unit/investigation/observation-source.port.spec.ts
    name: answers the outcome seeded for this concept, not the one seeded for a different concept of the same subject
    proves: "criterion 3 — the concept participates in the composed key alongside the subject"
    fails_when: the fake conflates two different concepts seeded against the same subject
  - file: src/__tests__/unit/investigation/observation-source.port.spec.ts
    name: a later seed for the same concept and subject replaces the earlier one
    proves: the preserved seed()/observeConcept() override semantics, unaffected by this task's rebuild of fixtureKey's authorship and documentation
    fails_when: seeding twice for the same concept and subject leaves the earlier outcome in place instead of the later one
  - file: src/__tests__/unit/investigation/observation-source.port.spec.ts
    name: throws naming the concept rather than answering a default for a concept-and-subject pair nothing seeded
    proves: the preserved refusal for an unseeded pair — a test-setup fault, not a fifth evidence-result ending
    fails_when: observeConcept answers instead of throwing for a pair nothing seeded, or throws without naming the concept
  - file: src/__tests__/unit/investigation/observation-source.port.spec.ts
    name: answers the outcome seeded for the subset itself, not the outcome later seeded for a subject carrying an extra attribute-value pair
    proves: "criterion 3 — composed from every attribute-value pair: an extra pair in the whole set changes the composed key, so seeding the superset after the subset does not overwrite the subset's own fixture"
    fails_when: the extra pair is dropped from the key composition, so the superset's seed collides with and overwrites the subset's, and the subset's own lookup returns the superset's outcome
  - file: src/__tests__/unit/investigation/observation-source.port.spec.ts
    name: throws for a subject carrying only a subset of the attribute-value pairs seeded for the whole set, rather than matching the subset to it
    proves: "criteria 2 and 3 together — the whole attribute-value set, not a subset, is what the fake's lookup key is built from"
    fails_when: the subset's composed key collides with the whole set's, so the subset resolves instead of throwing as unseeded
  - file: src/__tests__/unit/investigation/observation-source.port.spec.ts
    name: "answers the outcome seeded for a subject's own second attribute-value pair, not the outcome later seeded for one sharing only its first pair"
    proves: "criterion 3 — every attribute-value pair, not only the first, composes the key"
    fails_when: the second, non-first pair is dropped from the key, so the variant sharing only the first pair collides with and overwrites the first variant's own seed
  - file: src/__tests__/unit/investigation/observation-source.port.spec.ts
    name: answers the outcome seeded for its own attribute name, not the outcome later seeded for a different attribute name carrying the same value
    proves: domain/investigation/subject-attribute-value's node answer that a pair's attribute name, not only its value, contributes to the composed key
    fails_when: the attribute name is dropped from the key, so two subjects carrying the same value under different attribute names collide and the later seed overwrites the earlier
  - file: src/__tests__/unit/investigation/observation-source.port.spec.ts
    name: throws when a subject supplies the same attribute-value pairs as a seeded one but in a different order, since no canonical ordering is applied before they are joined
    proves: the implementation's own recorded inference that fixtureKey applies no canonical or sorted attribute order, so the caller's own order stays significant
    fails_when: fixtureKey starts canonicalizing or sorting the attribute-value pairs before joining, so a subject supplying the same pairs in a different order resolves instead of throwing as unseeded
  - file: src/__tests__/unit/investigation/observation-source.port.spec.ts
    name: answers the outcome seeded for its own governed type, not the outcome later seeded for a different type sharing the same attribute-value set
    proves: "criterion 1 — the subject's governed type, alongside its whole attribute-value set, reaches and differentiates the composed key"
    fails_when: the subject's type is dropped from the key, so two subjects of different types sharing one attribute-value set collide and the later seed overwrites the earlier
  - file: src/__tests__/unit/investigation/observation-source.port.spec.ts
    name: seeds and answers for a subject carrying no attribute-value pair at all, composing a fixture key from concept and type alone
    proves: "criterion 2 — no attribute is added, required or otherwise specially handled by this port or its fake; a zero-attribute subject still reaches observeConcept and composes a key exactly the same way as any other"
    fails_when: the fake refuses, throws for an unrelated reason, or treats a zero-attribute subject differently from the same fixtureKey composition every other subject goes through
not_applicable:
  - edge_case: refusing a subject carrying no attribute-value pair at all
    why: "REMAINDER per the task's own Notes — rules/investigation/a-subject-carries-at-least-one-attribute is enforced by buildSubject in subject.ts, not by this port or its fake, which are required only to pass the whole set through unfiltered; the zero-attribute test above proves exactly that passthrough rather than a refusal"
  - edge_case: validating that a named attribute is drawn from the glossary
    why: "REMAINDER per the task's own Notes — rules/investigation/a-subject-attribute-is-drawn-from-the-glossary belongs to investigation-factory-assembles-and-validates-the-subject; this port and its fake perform no glossary lookup"
  - edge_case: the repeat-request idempotency key colliding or not across two calls within a window
    why: "REMAINDER per the task's own Notes — an-investigation-is-idempotent-within-a-window constrains the repeat-request key computed elsewhere, not observe-concept's parameter or the fake's fixture key"
  - edge_case: a subject's attribute-value set containing the same attribute name twice with different values
    why: no domain node states whether an attribute name may repeat within one subject's set, so asserting a specific outcome for it would assert a guarantee nobody made; the second-pair and pair-order tests already prove every pair independently reaches the key regardless of which attribute names are involved
  - edge_case: two concurrent observeConcept calls against the same fake instance
    why: observeConcept only reads the fixtures map — seed() is the only writer — so no state is mutated during observation and concurrent calls raise no race a test could observe
  - edge_case: the real observation-source connector's own dependency failing, answering slowly, or in an unexpected shape
    why: this task ships only the fake adapter; the real connector is this epic's own declared remainder, and the fake performs no I/O of its own that could fail or delay
  - edge_case: a maximum bound on the number of attribute-value pairs a subject may carry
    why: no criterion or bound node states such a maximum for a test to assert against
untested:
  - "that observeConcept's declared parameter type itself refuses anything narrower than the canonical Subject (e.g. a bare id string) is a compile-time TypeScript fact, enforced by the project's own strict typecheck step rather than by any runtime assertion a spec file can make"
  - "whether IObservationSource's and fixtureKey's own doc-comment additions actually read, to a person, as stating the whole-set/no-filtering fact explicitly — a documentation claim, not a runtime behavior"
  - "whether every caller upstream of observeConcept (the entry point, investigation-factory, evidence-collection-stage) itself supplies the whole attribute-value set unfiltered before the call — this proof exercises only the port and its fake in isolation"
---

## What it is

Extends observation-source.port.spec.ts's own pre-existing fixtures (previously single-attribute, patched only for compile compatibility by the dependency task) with new subjects and tests proving this task's own four criteria — an extra pair, a second pair, an attribute name, an order, and a governed type each made to matter to the composed fixture key.

## Notes

None.
