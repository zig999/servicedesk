---
title: Proof for the response path extractor
summary: What proves task/http-observation-runtime/response-path-extractor, judged against its implementation
  record over the tests already on disk, all of which stand.
implementation: sha256:74e83a7bba4e77dfeccd36947386ea4dafffb8ea0598968e842cf4eb27baa293
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/http-observation-runtime-response-path-extractor-suite-2
tests:
- file: src/__tests__/unit/http-connector/response-path-extractor.spec.ts
  name: returns the value found at a nested object key
  proves: Extracting a path that names a nested object key returns the value found at that nested key.
  fails_when: 'walking "a.b" over { a: { b: ''nested-value'' } } stops reading the nested key, or answers
    anything but the value stored there'
- file: src/__tests__/unit/http-connector/response-path-extractor.spec.ts
  name: returns the value found at an array index
  proves: Extracting a path that includes an array index returns the value found at that index.
  fails_when: '"readings[1]" stops answering the element at index 1 — an off-by-one, a first-element-always,
    or index support dropped entirely'
- file: src/__tests__/unit/http-connector/response-path-extractor.spec.ts
  name: carries exactly the field names whose paths resolve, adding none the mapping does not declare
  proves: The object the extractor returns carries exactly the field names the mapping declares — none
    omitted, none added — for every path that resolves.
  fails_when: a declared field whose path resolves goes missing from the result, or any key outside the
    mapping's own field names — a source-system name, a metadata key — appears in it
- file: src/__tests__/unit/http-connector/response-path-extractor.spec.ts
  name: leaves out a field whose path names an object key the body does not carry
  proves: 'the inference the implementation recorded: a path that does not resolve is left out of the
    returned object entirely, rather than included with an undefined/null placeholder or causing the extraction
    to throw — here for a missing object key'
  fails_when: a missing key starts throwing, or the field arrives carrying undefined/null instead of being
    absent as an own property
- file: src/__tests__/unit/http-connector/response-path-extractor.spec.ts
  name: leaves out a field whose path names an array index beyond the array's own bounds
  proves: 'the same omission inference, at the array boundary: an out-of-bounds index is unresolved, while
    the in-bounds sibling still resolves'
  fails_when: '"readings[2]" over a two-element array throws, or lands in the result as undefined instead
    of being omitted'
- file: src/__tests__/unit/http-connector/response-path-extractor.spec.ts
  name: leaves out a field whose path expects an object but meets an array or a primitive instead
  proves: 'the omission inference where a key segment meets a non-object: the shape mismatch is answered
    as not-found, never thrown'
  fails_when: descending a key into an array or a string throws, or fabricates a value where none resolves
- file: src/__tests__/unit/http-connector/response-path-extractor.spec.ts
  name: leaves out a field whose path expects an array but meets a plain object or a primitive instead
  proves: 'the omission inference where an index segment meets a non-array: the mirror shape mismatch,
    answered the same way'
  fails_when: an index segment against a plain object or a string throws, or reads an object property
    named "0" as if it were an array element
- file: src/__tests__/unit/http-connector/response-path-extractor.spec.ts
  name: resolves a path chaining two consecutive bracketed indices into a nested array
  proves: 'the path-syntax inference the implementation recorded: a token may carry more than one bracketed
    index ("matrix[0][1]"), each descending in order'
  fails_when: only the first bracketed index of a token is parsed, or the two indices are applied in the
    wrong order
- file: src/__tests__/unit/http-connector/response-path-extractor.spec.ts
  name: resolves a path that opens directly on a bracketed index for a top-level array body
  proves: 'the path-syntax inference''s opening-index form ("[0].id"): a body whose top level is itself
    an array is addressable'
  fails_when: a token with no key part stops parsing as a bare index, so a top-level-array response becomes
    unreachable
- file: src/__tests__/unit/http-connector/response-path-extractor.spec.ts
  name: returns an empty object when the mapping declares no fields
  proves: 'the empty-input edge of criterion 3''s exact-key-set guarantee: no declared fields means no
    keys at all, whatever the body holds'
  fails_when: an empty mapping throws, or the result picks up any key from the body itself
- file: src/__tests__/unit/http-connector/response-path-extractor.spec.ts
  name: includes a resolved value that is falsy — zero, false, the empty string or null — rather than
    treating it as unresolved
  proves: 'criterion 3''s "for every path that resolves" read strictly: resolution is about the path,
    never the truthiness of the value found, so a resolved null is distinguishable from not-found'
  fails_when: the found/not-found distinction collapses into a truthiness check, dropping 0, false, ''
    or null from the result
- file: src/__tests__/unit/http-connector/response-path-extractor.spec.ts
  name: returns the entire body when a field's path is the empty string
  proves: 'the boundary of the recorded path syntax at its short end: the empty path parses to no segments
    and resolves to the whole body, pinned so the choice is stated rather than incidental'
  fails_when: an empty path starts throwing, resolving to nothing, or answering anything but the body
    itself
not_applicable:
- edge_case: a duplicate field name in the mapping
  why: ResponseFieldPaths is a plain object, so a duplicate key cannot be constructed — the language collapses
    it before the extractor sees it
- edge_case: a dependency that fails or answers slowly
  why: extractResponseFields is a pure function of its two arguments — no store, no network, no clock
    — so there is no dependency to fail
- edge_case: two operations against one subject at once
  why: the function reads its arguments and writes only a fresh local object; there is no shared state
    for concurrent calls to contend over
- edge_case: an operation against state that forbids it
  why: the extractor holds no state and forbids nothing; every input shape is answered as resolved or
    omitted, which the shape-mismatch tests already pin
untested:
- 'A path token whose key literally contains ''.'', ''['' or '']'': the recorded syntax inference states
  there is no escaping for such a key, so a body key spelled "a.b" is unreachable by design, but no test
  states that a path "a.b" reads the nested form and never the literal key.'
- A malformed bracket suffix ("readings[-1]", "readings[abc]") parses to no index segment at all, so the
  path silently resolves to the whole array rather than failing to resolve — behavior no criterion reaches
  and no test pins.
- 'extractResponseFields over a body that is itself null or undefined: the code answers it through the
  same isPlainObject/Array.isArray refusals the primitive-body tests exercise, but no test states it at
  the whole-body boundary.'
- The task's advisory note on the unanchored "response mapping" construct names no implementation the
  criteria admit and the specification refuses — it observes that the construct's natural anchor sits
  outside this task's candidate set — so nothing here excludes an alternative anchoring; binding a citation's
  field to a capability's output schema through this extractor's output remains the sibling adapter task's
  to prove.
---

## What it is

The response-side data transform: a declared mapping of glossary field names to paths, extracted from an external body with omission rather than fabrication wherever a path does not resolve.
The judging author changed no file: every criterion and both recorded inferences already had failing-capable tests on disk.

## Notes

This proof was composed after the delivery's own suite step: at delivery time the tree's suite was red on 2 pre-existing failures outside this change's file set — the closed EXPECTED_MIGRATION_FILENAMES enumeration owned by task/relational-substrate/migration-step of the relational-persistence initiative — and a record over a run that did not pass is refused, so no proof was written then.
That assertion was re-judged whole through the proof-only re-delivery of its owning task, the suite is green, and this record cites its own passing captured run.
