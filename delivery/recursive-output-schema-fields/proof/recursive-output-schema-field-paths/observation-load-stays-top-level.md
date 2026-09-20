---
target: backend
title: Observation load stays top-level under a nested output schema
summary: Two new tests on the existing HTTP declarative observation-source adapter spec pin the top-level
  boundary explicitly against a nested output schema (installations declaring state beneath its items),
  demonstrating both the bounding rule and the response-map-key-names-nothing scenario; the second UNDERDETERMINED
  note is left unresolved with why.
implementation: sha256:41ebf36e3906ea610185a86e3af81cf00e3e0a61e5bcbc150da8110db3fd511c
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/recursive-output-schema-field-paths-observation-load-stays-top-level-suite
tests:
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: keeps the ok observation to installations alone under a nested output schema -- excluding installations[].state
    even though its own responseMap path resolves, a top-level property whose own path never resolves,
    and a top-level property no responseMap key names
  proves: 'Criteria 1, 2, 3 and 4 of the task, exercised together against a nested output schema (installations
    declaring state beneath its own items): installations is carried where its responseMap path resolves;
    installations[].state is never carried even though its own responseMap key resolves a real value,
    because declaredFieldsOf never lists a path-shaped key among the schema''s own top-level properties;
    a top-level property (status) whose own responseMap path never resolves is not carried either; and
    a top-level property (login) no responseMap key names is absent.'
  fails_when: observationOf stops filtering strictly by declaredFieldsOf own top-level keys -- for instance
    if it recognizes installations[].state as reaching the nested state field, or if it drops installations
    even though its own responseMap path resolved, or if it carries status even though its own responseMap
    path never resolved, or if it carries login even though no responseMap key names it.
  demonstrates: rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: carries installations with its resolved value, no field named id and no field named login, ending
    ok -- exactly as the response-map-key-names-nothing scenario states
  proves: 'The whole fact of scenarios/integration/a-response-map-key-no-output-schema-field-names-observes-nothing,
    replicating its given/when/then verbatim: the call ends ok, the observation carries installations
    with the value ["a","b"], and it carries no field named id and no field named login.'
  fails_when: The observation carries a field named id, omits installations or its value differs from
    ["a","b"], carries a field named login, or the call does not end ok.
  demonstrates: scenarios/integration/a-response-map-key-no-output-schema-field-names-observes-nothing
not_applicable:
- edge_case: An output schema whose parsed JSON declares no properties object at all, or is absent/malformed.
  why: None of this task's four criteria states a case where the schema itself is malformed or propertyless;
    declaredFieldsOf's behavior on such input is already exercised elsewhere.
- edge_case: A response body that is absent, non-JSON, or otherwise fails to parse.
  why: Already covered by a pre-existing test in the same spec file; none of this task's four criteria
    concerns body parsing.
- edge_case: Two responseMap keys with the same literal name (a duplicate key).
  why: Not constructible -- responseMap is parsed from a JSON object, and a JS object literal cannot carry
    two properties of the same name.
- edge_case: Concurrent observeConcept calls or a slow/unreachable connector while the top-level filter
    runs.
  why: declaredFieldsOf and observationOf are synchronous, side-effect-free functions over already-resolved
    values.
untested:
- UNDERDETERMINED, from the specification -- "no criterion holds what value a carried field takes; criterion
  1 asks only that the observation carry a field named installations, while the bound scenario states
  it carries the value the responseMap path actually resolved to." This entry names no implementation
  to write a failing test against -- inventing one would put a guess where the binder finding belongs.
  The only test touching this ground asserts the actual resolved value because the scenario itself states
  it, owed to the scenario node rather than to criterion 1; criterion 1 alone remains unpinned on what
  value a carried field takes.
---

## What it is

Two tests pinning the observation-load boundary against a nested output schema, replicating the specification's own scenario and covering all four boundary classes of the governing rule's three-way condition.

## Notes

No production file was modified for this task; only http-declarative-observation-source.adapter.spec.ts gained two new tests.
