---
title: Response path extractor
summary: A pure extraction engine that turns an arbitrary parsed HTTP response body into a flat object keyed exactly by a response mapping's declared fields.
rationale: Kept apart from the placeholder resolver because it performs the opposite translation (foreign response into glossary vocabulary, not collect-side attributes into a request) and apart from the HTTP adapter because it is independently demonstrable as a pure function over fixture JSON, with no network involved. Criteria are written at the behavioral level (nested-key and array-index support, exact key-set fidelity) rather than at path-syntax level, since the scope marks its own JSONPath notation as a non-binding technical suggestion.
sources:
  - intake/scope.md
objective: Given a mapping from field name to an extraction path and an arbitrary parsed response body, the extractor produces a flat object whose keys are exactly that mapping's field names, with each value read from wherever the path points inside the body.
criteria:
  - Extracting a path that names a nested object key returns the value found at that nested key.
  - Extracting a path that includes an array index returns the value found at that index.
  - The object the extractor returns carries exactly the field names the mapping declares — none omitted, none added — for every path that resolves.
implements:
  - constraints/evidence-normalization-is-an-anticorruption-layer
  - rules/integration/evidence-arrives-in-the-glossary-vocabulary
---

## What it is

An extraction function that reads a response mapping's paths out of any parsed JSON body and returns a flat, glossary-keyed object.
The one place a source system's own response shape stops and the glossary's vocabulary starts.

## Notes

The exact path syntax (the scope's simplified JSONPath, including its array-index example) is a non-binding technical suggestion; another notation supporting the same two shapes (nested key, array index) is equally acceptable.
The binder found this task's objective itself resting on "a response mapping" construct no specification node declares by that name, and noted its natural anchor (domain/integration/capability's output_schema, domain/investigation/citation's field-existence check) sits outside this task's candidate set; the task remains demonstrable as a self-contained pure function regardless, so this stood as advisory rather than blocking.
Decision, beyond the covers — stand: domain/investigation/citation is named only as background for that advisory note, never as a fact this task implements; growing the epic's claim for it was left to whichever task actually binds a citation's field to a capability's output schema, since this extractor never reads or validates a citation.
