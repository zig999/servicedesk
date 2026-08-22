---
title: Proof for the typed fetch client over the backend's error envelope
summary: Tests apiFetch()'s 2xx pass-through and its parsing of a non-2xx response into a typed ApiError, including the malformed-body case the implementation record infers.
implementation: sha256:27e5b28e5d5374e2f0ff1b26d63e7362ed0309267decb4ad7d050525baf76168
run: run/frontend-console-foundation-onda-1-full-suite-2
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:b65918f325b77f594c710dd4a2e790fbd0998b66fc07363b1fd0b01a1ce6d631
tests:
  - file: src/services/api-client.spec.ts
    name: resolves with a 2xx response's JSON body unwrapped
    proves: A successful (2xx) response reaches the caller without being wrapped as an ApiError.
    fails_when: apiFetch() stops returning the 2xx response's parsed body verbatim -- wraps it, alters it, or throws for a 2xx response
  - file: src/services/api-client.spec.ts
    name: rejects with an ApiError carrying the envelope's own code and message for a non-2xx response
    proves: 'A non-2xx response whose body matches the envelope is parsed into an ApiError exposing code, message and details; ApiError.code holds exactly the thrown error''s class name string as the backend sends it, never a re-derived enum value.'
    fails_when: apiFetch() stops rejecting with an ApiError for a non-2xx response, or the rejected ApiError's code/message differ from the envelope's own error.code/error.message
  - file: src/services/api-client.spec.ts
    name: carries the envelope's details on the parsed ApiError when the response includes them
    proves: ApiError.details is present on the parsed ApiError only when the response envelope's details field is present (the present-details half)
    fails_when: the ApiError's details no longer equals the envelope's own error.details object, or details is dropped for a non-2xx response that carried one
  - file: src/services/api-client.spec.ts
    name: leaves details absent as an own property when the response envelope carries none
    proves: ApiError.details is present on the parsed ApiError only when the response envelope's details field is present (the absent-details half)
    fails_when: the constructed ApiError carries a details own property (even as undefined) when the envelope's error object had no details field at all
  - file: src/services/api-client.spec.ts
    name: rejects with a typed ApiError, never a raw parse error, when a non-2xx response's body is not valid JSON
    proves: the task's criteria and objective together, that a failed call never surfaces a raw Response or a generic/parse error -- exercised through a real Response whose response.json() itself rejects (SyntaxError) rather than a mocked json() method
    fails_when: the SyntaxError from response.json() propagates unwrapped instead of becoming an ApiError with code "UNREADABLE_RESPONSE", or the code differs
  - file: src/services/api-client.spec.ts
    name: surfaces an ApiError with code UNREADABLE_RESPONSE when a non-2xx response's JSON body does not carry the error envelope shape
    proves: 'the inference the implementation recorded: a non-2xx body that is not JSON, or is JSON that does not carry error.code/error.message as strings, is still surfaced as an ApiError (code "UNREADABLE_RESPONSE") rather than left to throw a raw parse error or a generic Error'
    fails_when: a non-2xx response whose valid JSON body lacks a matching error.code/error.message pair either throws something other than an ApiError, or the resulting ApiError's code is not "UNREADABLE_RESPONSE"
not_applicable:
  - edge_case: two apiFetch() calls against the same subject running at once
    why: apiFetch() holds no shared mutable state across invocations -- each call constructs its own Response handling from its own arguments
  - edge_case: the boundary between a 2xx and non-2xx status code (e.g. 200 vs 299 vs 300)
    why: apiFetch() reads response.ok, which the platform's own Response implementation computes; testing exactly where that boundary sits would test the Fetch API's native semantics rather than logic this task wrote
  - edge_case: a successful (2xx) response whose body is not valid JSON
    why: no stated criterion describes behavior for a malformed 2xx body -- criterion 4 only requires a 2xx response's parsed body to reach the caller unwrapped
  - edge_case: an empty collection returned by a 2xx response
    why: apiFetch<T>() is a generic pass-through with no criterion-stated handling specific to collection shapes
untested:
  - "apiFetch()'s behavior when fetch() itself rejects outright (a network failure before any Response exists) is unproven -- no criterion states what should happen, and api-client.ts has no try/catch around the fetch() call itself, only around response handling once a Response is obtained."
  - "\"The client is the one fetch wrapper this wave's code calls the backend through; no second envelope-parsing path exists\" is a claim about the rest of the codebase, not api-client.ts's own runtime behavior -- a spec file exercising apiFetch() cannot observe the absence of a second path elsewhere in the tree."
---

## What it is
Six tests over apiFetch()/ApiError: 2xx pass-through, non-2xx envelope parsing (code/message, details present, details absent), and two malformed-body paths (non-JSON body, JSON without the envelope shape) both surfacing UNREADABLE_RESPONSE rather than a raw error.

## Notes
None.
