---
title: Response path extractor
summary: A pure extraction function that reads a field-name-to-path mapping over an arbitrary parsed HTTP response body and returns a flat object keyed exactly by that mapping's own field names, supporting a nested object key and an array index in one path.
task: sha256:840dba17b4633dc692c865e91bef945e956e0adb05dfbace01224af6bd8972d3
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/http-observation-runtime-response-path-extractor-build
files:
- path: src/http-connector/response-path-extractor.ts
  effect: exports ResponseFieldPaths (a field-name-to-path mapping) and extractResponseFields(fieldPaths, body), which walks each path over the parsed body one dot-separated segment at a time — a plain object key, optionally followed by one or more bracketed array indices — and returns an object holding exactly the mapping's field names for every path that resolves, leaving out a field whose path does not resolve rather than throwing or substituting a placeholder. Declares no import of and no shared type with ./connector-call-descriptor.ts or ./connector-request-resolver.ts.
criteria:
- criterion: Extracting a path that names a nested object key returns the value found at that nested key.
  met: true
  how: parsePathToken/parsePath turn a dot-separated path into a sequence of key segments, and descend()'s key branch reads current[segment.key] once isPlainObject(current) and the own-property check both hold — e.g. path "a.b" walks body.a then reads .b.
- criterion: Extracting a path that includes an array index returns the value found at that index.
  met: true
  how: parsePathToken splits a bracketed "[<n>]" suffix on a token into one or more index segments (INDEX_SEGMENT_PATTERN), and descend()'s index branch reads current[segment.index] once Array.isArray(current) holds and the index is in bounds — e.g. "readings[0]" or a path opening directly on "[0]" for a top-level array.
- criterion: The object the extractor returns carries exactly the field names the mapping declares — none omitted, none added — for every path that resolves.
  met: true
  how: extractResponseFields iterates exactly Object.entries(fieldPaths) and never touches any other key; it assigns extracted[field] if and only if resolvePath(body, path) answers found:true, so every field name whose path resolves is present with the value found there, and no key outside the mapping's own field names is ever added.
nodes:
- node: constraints/evidence-normalization-is-an-anticorruption-layer
  encoded_at:
  - src/http-connector/response-path-extractor.ts
  how: 'This module is the anti-corruption boundary the constraint names: a caller supplies field names already in the glossary''s vocabulary as fieldPaths'' own keys, and extractResponseFields returns an object keyed exactly by those names. A source-system field name only ever appears inside a path string, used purely as a lookup coordinate to walk the body; it is never copied into the returned object''s own keys, so no field name from a corporate system''s response crosses past this module into anything a domain element could name.'
- node: rules/integration/evidence-arrives-in-the-glossary-vocabulary
  encoded_at:
  - src/http-connector/response-path-extractor.ts
  how: 'The rule''s own translation is what this module performs: the flat object it returns is expressed entirely in the glossary''s vocabulary (the mapping''s own field names), never in the source system''s. This task builds the pure translation only — folding that returned object into an actual Evidence.observation (the node''s own domain/investigation/evidence and domain/glossary/concept, which it constrains) is the sibling task/http-observation-runtime/http-declarative-observation-source''s own wiring, listed there as depending on this one; this delivery does not reach that wiring, only the translation it will call.'
inferences:
- inferred: The path syntax is a dot-separated sequence of plain object-key segments, each optionally followed by one or more bracketed non-negative-integer indices (e.g. "readings[0].value", "matrix[0][1]", "[0].id"), with no escaping for a key containing '.', '[' or ']'.
  from: This task's own Notes, which mark the scope's JSONPath illustration as an explicitly non-binding technical suggestion and state that any notation supporting a nested object key and an array index is equally acceptable; the criteria are written at that behavioral level rather than at path-syntax level.
- inferred: A field whose path does not resolve inside the response body (a missing object key, an out-of-bounds array index, or a segment expecting an object or array where the body holds something else) is left out of the returned object entirely, rather than included with an undefined/null placeholder or causing the whole extraction to throw.
  from: Criterion 3's own conditional phrasing ("for every path that resolves"), which states the exact-key-set guarantee only over paths that do resolve and is silent on what happens to one that does not; and the established convention in src/investigation/citation-validation.ts's declaredFieldsOf, which already answers a malformed or absent input as "nothing found" rather than throwing, for the same kind of arbitrary, possibly foreign structural data.
preserved:
- Nothing pre-existing depends on this module yet; it introduces no change to any existing file's behavior. Both sibling http-connector modules (connector-call-descriptor.ts, connector-request-resolver.ts) continue to compile and behave unchanged, since this file imports nothing from them and they import nothing from it.
deferred:
- what: Growing rules/investigation/a-cited-field-exists-in-the-capability-output-schema's or domain/investigation/citation's own coverage to name this extraction module, or binding a citation's field explicitly to a capability's output_schema through this module's own output.
  why: This task's own Notes record that this extraction is demonstrable as a self-contained pure function regardless of that binding, and that growing either node's claim is left to whichever task actually wires a citation's field to a capability's output schema (task/http-observation-runtime/http-declarative-observation-source) — widening it here would be widening this task past its own objective.
---

## What it is

A pure extraction function turning a field-name-to-path mapping and an arbitrary parsed response body into a flat object keyed exactly by that mapping's own field names.
The one place a source system's own response shape stops and the glossary's vocabulary starts, mirroring the request-side translation the sibling descriptor-placeholder-resolver task already delivers in the opposite direction.

## Notes

The path syntax (dot-separated keys with optional bracketed indices) is this task's own free technical design; the scope's own JSONPath illustration is explicitly non-binding.
This module shares no import and no type with connector-call-descriptor.ts or connector-request-resolver.ts, so the two translation directions compose independently in the sibling adapter task rather than depending on each other's internals.
A path that does not resolve against the given body is simply omitted from the result, never thrown or substituted with a placeholder.
