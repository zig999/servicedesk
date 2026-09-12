---
title: Pin the observation's output-schema filtering
summary: The tests that hold the HTTP declarative observation source to the fact the specification now
  enunciates about which fields an observation carries.
rationale: Cut as its own task, and as a pinning rather than a change, because the scope states the adapter
  already implements this fact and that touching it would contradict the scope; without a task the newly
  enunciated fact would be answered by nothing in this plan.
sources:
- intake/scope.md
objective: The existing filtering in the HTTP declarative observation source is demonstrated, by test,
  to carry exactly the fields named by both the responseMap and the capability's output schema, with its
  behavior unchanged.
criteria:
- A test shows that a responseMap key naming no top-level property of the producing capability's output
  schema contributes no field to the observation.
- A test shows that an output schema property no responseMap key names is absent from the observation.
- A test shows that a responseMap key whose path does not resolve in the response body contributes no
  field to the observation.
- A test shows that a collection whose responseMap reaches no output schema property is not refused by
  this reading and ends ok with an observation carrying no field.
- The delivery changes no behavior of observationOf in src/src/investigation/http-declarative-observation-source.adapter.ts.
implements:
- rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches
---


## What it is
A read of existing behavior against a fact the specification newly holds, delivered as tests rather than as a change.

## Notes
The adapter reads a capability's declared field names through the existing declaredFieldsOf helper and its paths through the existing response-path extractor, and this task duplicates neither.
UNDERDETERMINED, from the specification — Every criterion asserts an absence; none demonstrates the rule's positive half — that a name which is at once a responseMap key and a top-level output-schema property, whose path resolves in the body, does reach the observation carrying its resolved value. Add a criterion for the qualifying case.
REMAINDER, from the specification — The six sibling drafting rules named as candidates by the epic (statusMap, responseMap, envelope, reading notes, response-carries-no-capability, parameters-read-through) reach no criterion of this task, which governs runtime observation filtering, not draft generation.
ADVISORY, from the specification — Criteria 1 through 4 all presuppose the call ends ok; which node decides that ending (an-http-connector-configuration-declares-its-call, reading the configuration's own statusMap) sits outside this task's candidate set. Setting up an ok ending in the delivered tests rests on a fact this task may not cite directly.
