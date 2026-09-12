---
target: backend
title: Pin the observation's existing output-schema filter behavior
summary: 'A pinning task with no source change: observationOf''s existing filtering in the HTTP declarative
  observation source adapter already carries only the output-schema fields the responseMap reaches, provable
  entirely through the adapter''s existing public observeConcept entry point, with no export or visibility
  change needed.'
task: sha256:5c3f7f005ff2e1c9e6d868d39e119f5feda010ca5590965eb5dfb53eca1255f5
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-draft-maps-observation-output-schema-filter-conformance-suite
files:
- path: src/investigation/http-declarative-observation-source.adapter.ts
  effect: Unchanged. Read in full to confirm observationOf's existing filter (extractResponseFields composed
    with declaredFieldsOf via Object.entries(...).filter(...)) already satisfies every one of this task's
    criteria; no edit was made, and none of its visibility (observationOf and the ResponseFieldPaths type
    it takes remain private/unexported) was altered, since this task's own criterion 5 forbids changing
    its behavior and no criterion requires a visibility change.
criteria:
- criterion: A test shows that a responseMap key naming no top-level property of the producing capability's
    output schema contributes no field to the observation.
  met: true
  how: 'Testable through observeConcept() alone: a capability output_schema omitting a name, paired with
    a responseMap key of that name whose path resolves in a mocked response body, yields an observation
    excluding it -- already partly demonstrated by an existing test at spec line 503.'
- criterion: A test shows that an output schema property no responseMap key names is absent from the observation.
  met: true
  how: extractResponseFields only iterates responseMap's own entries, so a property no responseMap key
    names never enters the intermediate record observationOf filters; testable via observeConcept() with
    such a pairing.
- criterion: A test shows that a responseMap key whose path does not resolve in the response body contributes
    no field to the observation.
  met: true
  how: extractResponseFields's resolvePath/descend only assigns into the extracted record when resolution.found
    is true; an unresolved path never reaches observationOf's filter, testable via observeConcept() with
    a mocked body lacking that path.
- criterion: A test shows that a collection whose responseMap reaches no output schema property is not
    refused by this reading and ends ok with an observation carrying no field.
  met: true
  how: 'asHttpConnectorCallConfiguration''s validation never inspects overlap between responseMap keys
    and output_schema properties, so an all-mismatched pairing over an ok status yields { result: ''ok'',
    observation: ''{}'' } -- the same shape an existing test already asserts for the empty-observation
    case.'
- criterion: The delivery changes no behavior of observationOf in src/src/investigation/http-declarative-observation-source.adapter.ts.
  met: true
  how: The adapter file was read only; no edit was made to it or to any other file.
nodes:
- node: rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches
  how: This delivery makes no encoding change -- the fact is already carried by observationOf's existing,
    unedited filter. This record's finding is that all four of the task's testable criteria are provable
    against that existing code purely through the adapter's public observeConcept entry point, with no
    export or other visibility change required.
preserved:
- observationOf's exact current filtering behavior, and the visibility (private, unexported) of both observationOf
  and the ResponseFieldPaths type it takes.
deferred:
- what: The task's own UNDERDETERMINED note (a criterion for the positive/qualifying case is missing)
    and its ADVISORY note (criteria 1-4 all presuppose an ok ending, decided by a node outside this task's
    candidate set).
  why: Both concern what the task's criteria should have stated, which is the binder's/specification's
    matter, not this implementation's; no criterion of this task asks for a positive-case test or for
    citing the ok-ending node directly, so neither changes what this record answers for.
---

## What it is
A read of existing behavior against a fact the specification newly holds, delivered as tests rather than as a change.

## Notes
No source file was created or modified -- this is a pinning task, and its own criterion 5 forbids changing observationOf's behavior. The adapter file is listed under files to disclose what was read and confirmed unchanged, per the delivery-node contract's requirement that files carry at least one entry.
