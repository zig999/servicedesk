---
target: backend
title: PT-br message tests for the three manifest-composition refusals
summary: Unit tests over HypothesisNotInManifestError, ManifestPositionOccupiedError and ManifestWouldHoldNoHypothesisError
  proving each message's Brazilian-Portuguese content, fixed vocabulary, mutual distinguishability, shared
  case/version wording, unchanged name and unchanged context.
implementation: sha256:8b91d64aba1db201c10bac030a77c6358166b0917b90a20a8793f8734260e50a
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/hypothesis-refusal-messages-manifest-composition-messages-suite
tests:
- file: src/__tests__/unit/errors/hypothesis-not-in-manifest.error.spec.ts
  name: states its message in Brazilian Portuguese, naming the hypothesis, the case slug and the version
    number whose manifest does not hold it
  proves: HypothesisNotInManifestError's message is in PT-br and names the hypothesis, the case slug and
    the version number whose manifest does not hold it.
  fails_when: the message stops naming hypothesis/slug/version in PT-br.
- file: src/__tests__/unit/errors/hypothesis-not-in-manifest.error.spec.ts
  name: names a hypothesis as "hipótese", a case as "caso", a case version as "versão" and its manifest
    as "manifesto", using no English domain noun
  proves: the message uses the fixed PT-br nouns and no English domain noun.
  fails_when: the message drops a fixed word or an English domain noun appears.
- file: src/__tests__/unit/errors/hypothesis-not-in-manifest.error.spec.ts
  name: keeps its own class-name string unchanged
  proves: the name property still holds its unchanged class-name string.
  fails_when: error.name stops being 'HypothesisNotInManifestError'.
- file: src/__tests__/unit/errors/hypothesis-not-in-manifest.error.spec.ts
  name: carries exactly the hypothesis, slug and version in context, with no value moved into or out of
    it
  proves: the context property holds exactly the properties and values it held before.
  fails_when: context gains, loses or changes a value.
- file: src/__tests__/unit/errors/hypothesis-not-in-manifest.error.spec.ts
  name: is distinguishable from ManifestPositionOccupiedError by text alone, for the same case and version
  proves: the three messages are distinguishable from one another by their text alone (pair 1/2).
  fails_when: the two messages become textually identical.
- file: src/__tests__/unit/errors/hypothesis-not-in-manifest.error.spec.ts
  name: is distinguishable from ManifestWouldHoldNoHypothesisError by text alone, for the same case and
    version
  proves: the three messages are distinguishable from one another by their text alone (pair 1/3).
  fails_when: the two messages become textually identical.
- file: src/__tests__/unit/errors/hypothesis-not-in-manifest.error.spec.ts
  name: keeps ManifestPositionOccupiedError distinguishable from ManifestWouldHoldNoHypothesisError by
    text alone, for the same case and version
  proves: the three messages are distinguishable from one another by their text alone (pair 2/3).
  fails_when: the two messages become textually identical.
- file: src/__tests__/unit/errors/hypothesis-not-in-manifest.error.spec.ts
  name: names the case and the version in the same order and with the same PT-br wording across all three
    manifest-composition refusals
  proves: the three messages name the case and the version in the same order and with the same PT-br wording
    as one another.
  fails_when: any message stops containing the identical shared substring.
- file: src/__tests__/unit/errors/manifest-position-occupied.error.spec.ts
  name: states its message in Brazilian Portuguese, naming the case slug, the version number and the occupied
    position, and stating that a manifest position is unique within its case version
  proves: ManifestPositionOccupiedError's message is in PT-br, names slug/version/position and states
    the uniqueness fact.
  fails_when: the message stops stating those facts.
- file: src/__tests__/unit/errors/manifest-position-occupied.error.spec.ts
  name: names a case as "caso", a case version as "versão", a hypothesis as "hipótese", a manifest as
    "manifesto" and a manifest position as "posição", using no English domain noun
  proves: the message uses the fixed PT-br nouns and no English domain noun.
  fails_when: a fixed word is dropped or an English domain noun appears.
- file: src/__tests__/unit/errors/manifest-position-occupied.error.spec.ts
  name: keeps its own class-name string unchanged
  proves: the name property still holds its unchanged class-name string.
  fails_when: error.name stops being 'ManifestPositionOccupiedError'.
- file: src/__tests__/unit/errors/manifest-position-occupied.error.spec.ts
  name: carries exactly the slug, version and position in context, with no value moved into or out of
    it
  proves: the context property holds exactly the properties and values it held before.
  fails_when: context gains, loses or changes a value.
- file: src/__tests__/unit/errors/manifest-would-hold-no-hypothesis.error.spec.ts
  name: states its message in Brazilian Portuguese, naming the case slug and the version number, and stating
    that removing the entry would leave the manifest holding no hypothesis and that a manifest declares
    at least one entry
  proves: ManifestWouldHoldNoHypothesisError's message is in PT-br, names slug/version and states both
    facts.
  fails_when: the message stops stating those facts.
- file: src/__tests__/unit/errors/manifest-would-hold-no-hypothesis.error.spec.ts
  name: names a case as "caso", a case version as "versão", a hypothesis as "hipótese" and its manifest
    as "manifesto", using no English domain noun
  proves: the message uses the fixed PT-br nouns and no English domain noun.
  fails_when: a fixed word is dropped or an English domain noun appears.
- file: src/__tests__/unit/errors/manifest-would-hold-no-hypothesis.error.spec.ts
  name: keeps its own class-name string unchanged
  proves: the name property still holds its unchanged class-name string.
  fails_when: error.name stops being 'ManifestWouldHoldNoHypothesisError'.
- file: src/__tests__/unit/errors/manifest-would-hold-no-hypothesis.error.spec.ts
  name: carries exactly the slug and version in context, with no value moved into or out of it
  proves: the context property holds exactly the properties and values it held before.
  fails_when: context gains, loses or changes a value.
not_applicable:
- edge_case: Absent or empty slug, version, hypothesis name or position reaching one of the three constructors
  why: typed non-optional parameters already validated at the route/DTO boundary this task does not touch.
- edge_case: A numeric boundary in version or position (zero, negative, very large)
  why: the message interpolates the number as-is regardless of magnitude; no criterion changes wording
    at any boundary.
- edge_case: A duplicate manifest position, or a removal that would empty the manifest, actually occurring
    and being detected
  why: that enforcement belongs to the already-delivered place-hypothesis/remove-hypothesis act, a REMAINDER
    of this task.
- edge_case: Two operations racing against the same manifest
  why: governs whether the refusal is raised, the same out-of-scope enforcement; these three classes carry
    no state.
- edge_case: A dependency failing or answering slowly while one of these three errors is being raised
  why: these three classes take no dependency and perform no I/O.
untested:
- constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese -- system-wide fitness over
  roughly sixty classes; this task's tests decide only the three it rewrites.
- constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word -- same system-wide
  totality.
- rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused -- its routing fact is
  unaffected by this message-only edit and is already decided whole by the untouched simulate-hypothesis-pipeline.spec.ts.
- rules/knowledge/a-hypothesis-position-is-unique-within-its-case -- its enforcement fact is the task's
  REMAINDER exclusion, already decided whole by the untouched place-hypothesis.routes.spec.ts.
- rules/knowledge/a-case-has-at-least-one-hypothesis -- its enforcement fact is likewise a REMAINDER exclusion,
  already decided whole by the untouched remove-hypothesis.routes.spec.ts.
- Criterion 'no message states a fact its English original did not state...' compares against a prior
  English text no longer in the tree; not decidable by a runtime test.
- Criterion 'status-map.ts is unchanged...' is already decided whole by the untouched status-map.spec.ts.
- Criterion 'the suite under src/src/__tests__ passes with no test file changed' is a whole-suite, whole-run
  fact evidenced by the captured build, not by a unit test.
---
## What it is
Unit tests proving the three manifest-composition refusals' PT-br message content, vocabulary,
mutual distinguishability, shared case/version wording, and preserved name/context.

## Notes
None.
