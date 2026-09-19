---
target: backend
title: Observation load stays top-level, verified against a nested output schema
summary: Confirms citation-validation.ts's declaredFieldsOf and the adapter's observationOf were unaffected
  by the recursive field-semantics change; no source change was needed.
task: sha256:f13e8afeb70567a9ca8b7f322e51ce504d9bcd4a89b7e66ab880f9e5e11518e5
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/recursive-output-schema-field-paths-observation-load-stays-top-level-build
files:
- path: src/investigation/citation-validation.ts
  effect: Not modified. declaredFieldsOf(outputSchema) still reads only Object.keys(parsed.properties)
    -- the output schema's own top-level properties object -- unchanged by the sibling task's recursive
    fieldSemanticsOf; it imports nothing from field-semantics.ts.
- path: src/investigation/http-declarative-observation-source.adapter.ts
  effect: Not modified. observationOf still filters extractResponseFields(responseMap, body) to keys both
    present in the extracted (responseMap-resolved) set and in declaredFieldsOf(capability.output_schema),
    so a field reaches the observation only when its name is at once a responseMap key, a top-level output-schema
    property, and a resolving path. Never references field-semantics.ts.
criteria:
- criterion: For a capability whose output schema declares installations with state beneath its items,
    an observation carries a field named installations where a responseMap key named installations resolves
    in the response body.
  met: true
  how: observationOf's filter keeps a responseMap key exactly when it is both a top-level output-schema
    property (per declaredFieldsOf) and resolves in the body; installations satisfies both regardless
    of what its items schema declares beneath it.
- criterion: That same observation carries no field named installations[].state, whatever the responseMap
    declares.
  met: true
  how: declaredFieldsOf never lists installations[].state as a top-level property (Object.keys(parsed.properties)
    only ever yields installations), so observationOf's filter drops any responseMap key spelled that
    way regardless of whether its own path resolves.
- criterion: A responseMap key naming no key of the output schema's own top-level properties object contributes
    nothing to the observation, and the call still ends ok.
  met: true
  how: observationOf's filter is a set intersection against declaredFieldsOf's top-level keys; a resolving
    responseMap key outside that set is extracted and then dropped by the filter, with the call outcome
    unaffected.
- criterion: An output schema property no responseMap key names is absent from the observation.
  met: true
  how: extractResponseFields only ever produces values for keys the responseMap itself declares; a top-level
    schema property with no responseMap key is never extracted in the first place, so it cannot appear
    in the filtered observation.
nodes:
- node: rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
  how: declaredFieldsOf still reads only the output schema's own top-level properties object, unchanged
    by the sibling task's recursive fieldSemanticsOf; observationOf still filters against exactly that
    set, so a field reaches the observation only when its name is at once a responseMap key, a top-level
    output-schema property, and a resolving path.
- node: scenarios/integration/a-response-map-key-no-output-schema-field-names-observes-nothing
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
  how: A responseMap key resolving a real value in the body but naming no top-level output-schema property
    still contributes nothing to the observation, and the call still ends ok, exactly as this scenario
    states -- unaffected by the recursive reading landing in a sibling module.
---

## What it is

Verification that the observation-loading path stays bounded to the output schema's own top-level properties, deliberately unwidened by the recursive field-semantics reading landing in a sibling module.

## Notes

No file was modified for this task; the build run below is captured to confirm the unchanged tree still builds and passes.
