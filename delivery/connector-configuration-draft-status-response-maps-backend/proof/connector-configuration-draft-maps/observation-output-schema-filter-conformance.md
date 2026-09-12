---
target: backend
title: Pin the observation's existing output-schema filter behavior -- proof
summary: Tests through observeConcept() alone hold the unmodified HttpDeclarativeObservationSource to
  the fact that an ok observation carries exactly the fields both named by the connector's responseMap
  and declared as a top-level property of the capability's output schema, with a resolving path -- and
  nothing else.
implementation: sha256:50a10df89ea240b9231320d19e5d9201c5b39551f68dd55ff9d51d8dc70ac279
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-draft-maps-observation-output-schema-filter-conformance-suite
tests:
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: keys the ok observation by the capability's own output_schema property names, dropping a response-map
    field the schema does not declare, and never surfacing the response's own raw field name
  proves: A test shows that a responseMap key naming no top-level property of the producing capability's
    output schema contributes no field to the observation.
  fails_when: the ok observation's exact JSON string stops equaling {"equipment_state":"operational"}
    -- in particular if the responseMap key 'unwanted_extra' (naming no top-level output-schema property)
    ever contributed a field despite its own path resolving in the body. Pre-existing test; cited rather
    than duplicated because it already exercises this criterion in full.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: excludes an output-schema property from the ok observation when no responseMap key names it, even
    though the response body happens to carry a same-named field
  proves: A test shows that an output schema property no responseMap key names is absent from the observation.
  fails_when: the ok observation ever carries an 'untouched_field' entry -- a declared output-schema property
    no responseMap key names -- even though the raw response body happens to carry a same-named field.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: carries no field for a responseMap key that is itself a declared output-schema property when its
    own path does not resolve in the response body
  proves: A test shows that a responseMap key whose path does not resolve in the response body contributes
    no field to the observation.
  fails_when: the ok observation ever carries a 'status' entry when the responseMap's own path for it
    resolves nowhere in the response body.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: ends ok with an empty observation, refusing nothing at read time, when every responseMap key names
    no output-schema property at all
  proves: A test shows that a collection whose responseMap reaches no output schema property is not refused
    by this reading and ends ok with an observation carrying no field.
  fails_when: 'the call is refused for a total mismatch between responseMap keys and output-schema properties,
    or the ok observation ever carries a ''vendor_status'' field despite it naming no output-schema property.
    Written new rather than citing the existing ''not valid JSON'' test: that test''s empty observation
    comes from a malformed body making every path unresolved, a different mechanism than this criterion
    names.'
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: carries an observation on the ok ending
  proves: The task's UNDERDETERMINED note -- that no criterion demonstrates the rule's positive half,
    that a name at once a responseMap key and a top-level output-schema property, whose path resolves,
    does reach the observation carrying its resolved value.
  fails_when: an observationOf implementation satisfying every stated absence-only criterion vacuously
    (e.g. always returning an empty record) would still satisfy criteria 1-4 but fails this test. Pre-existing
    test; cited rather than duplicated, since it already carries exactly this qualifying case.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: carries exactly the field whose name is at once a responseMap key and a declared output-schema
    property with a resolving path, excluding a schema-only property, a responseMap-only key and a key
    whose own path fails to resolve, all present in the same call
  proves: the node's whole filtering fact -- decided in one input against one expected result spanning
    all four of its named classes at once -- beyond what any single criterion-scoped test shows in isolation.
  fails_when: the resulting ok observation's exact JSON string stops equaling {"matched_field":"resolved-value"}
    -- whether a schema-only property, a responseMap-only key, or an unresolved-path key leaks in, or
    the one qualifying field's value is anything but its own resolved value.
  demonstrates: rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches
not_applicable:
- edge_case: an empty responseMap object ({}) or an output schema declaring zero properties
  why: no criterion of this task states a distinct boundary at zero entries; the zero-overlap shape is
    already what the criterion-4 test exercises, and Object.entries(...).filter(...) over an empty collection
    is not a code path this task's fact singles out from the one already tested.
- edge_case: two responseMap keys naming the same output-schema property, or duplicate keys within one
    responseMap
  why: a parsed JSON object cannot carry two keys of the same name; no criterion of this task addresses
    collision.
- edge_case: concurrent observeConcept calls filtering different capabilities' observations
  why: concurrency is already established generically elsewhere in this same spec file; the filtering
    this task's criteria state is a pure function of one call's own capability, responseMap and body,
    unaffected by another call in flight.
- edge_case: a non-ok status ending, a timed-out call, or an unreachable/misconfigured connector
  why: per the task's own ADVISORY note, all four criteria presuppose the call already ends ok; which
    node decides that ending sits outside what this task implements.
- edge_case: a nested (non-top-level) property inside the capability's output schema colliding with a
    responseMap key
  why: the node's fact is scoped to the output schema's own top-level properties; which names count as
    declared is declaredFieldsOf's own behavior, and the task's own Notes say this task duplicates neither
    that helper nor its tests.
- edge_case: a resolved field's own value being null, a number, or an array rather than a string
  why: the filtering rule turns on which name is present, never on the resolved value's own type; varying
    it multiplies no obligation the task states.
- edge_case: verifying, by test, that the delivery changed no behavior of observationOf (the task's criterion
    5)
  why: this is a claim about the delivery process -- that the adapter file was read and not edited --
    not an observable runtime behavior a test could assert differently; it is answered by the implementation
    record's files entry and by there being no diff to the adapter file, not by a test in this proof.
---

## What it is
Proof that the existing, unedited observation filtering already satisfies the specification's newly-held fact.

## Notes
Suite passed clean on the first attempt; no source file needed a build-fix round since none was touched.
