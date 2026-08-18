---
title: GET /v1/glossary/{vocabulary} — proof
summary: Proves the list-vocabulary-terms route answers a paginated page for a recognized vocabulary and
  refuses an unrecognized one with a 400 validation envelope, never reaching the glossary query.
implementation: sha256:53c1aca9f50baa9e9c1657e3d440659d04e783bd8686df0404a7b29f35ccd509
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/list-route-batch2-suite
tests:
- file: src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
  name: answers 200 with the paginated page of every term the named vocabulary currently holds, for a
    request naming its own offset and limit
  proves: criterion 1 — a valid request against a recognized vocabulary returns a paginated page
  fails_when: the route/controller drops, reshapes, or fails to forward the resolved page unchanged onto
    the response body
- file: src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
  name: passes the request's own vocabulary and pagination window through to listVocabularyTerms unchanged
  proves: the path segment and the offset/limit window reach the domain call exactly as the request stated
    them
  fails_when: the controller mutates, drops or mis-parses the vocabulary or the pagination window before
    calling listVocabularyTerms
- file: src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
  name: resolves a page of each of the five TERM_VOCABULARIES entries through listVocabularyTerms, and
    answers with what it holds
  proves: criterion 1 holds for each of the five recognized term vocabularies, not just one
  fails_when: any one of the five vocabularies is refused, mis-routed, or its resolved page is not returned
    as-is
- file: src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
  name: answers each of two requests against different vocabularies with that request's own resolved page,
    never a cached or joined value
  proves: two operations against the route in sequence are answered independently — no caching or cross-request
    leakage
  fails_when: a second request's answer reuses, merges with, or is contaminated by the first request's
    resolved page
- file: src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
  name: answers 400 for a :vocabulary segment naming none of the five term vocabularies, never reaching
    listVocabularyTerms
  proves: criterion 2 — an unrecognized vocabulary is refused before the domain operation is ever reached
  fails_when: an unrecognized vocabulary segment is accepted, forwarded to listVocabularyTerms, or answered
    with any status other than 400/VALIDATION_ERROR
- file: src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
  name: defaults offset to 0 when the request names none
  proves: the controller's inferred pagination resolution defaults an absent offset to 0
  fails_when: an absent offset is forwarded as anything other than 0
- file: src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
  name: resolves an absent limit against the configured defaultLimit rather than leaving it unbounded
  proves: an absent limit is bounded by the route's own configured defaultLimit (API-04)
  fails_when: an absent limit is forwarded as undefined, zero, or any value other than the configured
    defaultLimit
- file: src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
  name: clamps a limit above the configured maxLimit down to maxLimit rather than refusing the request
  proves: an oversized limit is silently bounded rather than rejected
  fails_when: an oversized limit is forwarded unclamped, or the request is refused instead of served at
    maxLimit
- file: src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
  name: passes a limit exactly equal to the configured maxLimit through unclamped
  proves: the maxLimit boundary itself is not mistakenly reduced
  fails_when: a limit equal to maxLimit is clamped to a smaller value
- file: src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
  name: answers the paginated envelope with an empty data array and a total of zero, unchanged, when a
    recognized vocabulary currently holds no term
  proves: a recognized-but-empty vocabulary answers an empty page rather than an error or an absent value
    (API-02)
  fails_when: an empty vocabulary is refused, or its empty page is reshaped/dropped before reaching the
    response
- file: src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
  name: accepts an offset of exactly zero, the lower boundary of the nonnegative range, without refusing
    it
  proves: the nonnegative range's own lower boundary is accepted, not off-by-one refused
  fails_when: offset=0 is refused with 400
- file: src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
  name: accepts a limit of exactly 1, the lower boundary of the positive range, without refusing it
  proves: the positive range's own lower boundary is accepted
  fails_when: limit=1 is refused with 400
- file: src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
  name: answers 400 for a non-numeric offset, without ever reaching listVocabularyTerms
  proves: a malformed (present but non-numeric) offset is refused at the DTO boundary (EDG-01)
  fails_when: a non-numeric offset is coerced to some value and forwarded, or answered with a status other
    than 400
- file: src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
  name: answers 400 for a non-numeric limit, without ever reaching listVocabularyTerms
  proves: a malformed limit is refused at the DTO boundary
  fails_when: a non-numeric limit is coerced and forwarded, or answered with a status other than 400
- file: src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
  name: answers 400 for a negative offset, one below the nonnegative range the schema declares, without
    ever reaching listVocabularyTerms
  proves: the nonnegative range's lower boundary is enforced, not merely documented
  fails_when: offset=-1 is accepted and forwarded
- file: src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
  name: answers 400 for a limit of zero, one below the positive range the schema declares, without ever
    reaching listVocabularyTerms
  proves: the positive range's lower boundary is enforced
  fails_when: limit=0 is accepted and forwarded
- file: src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
  name: answers 500 with a generic message, never the rejected call's own error text, when the glossary
    query itself rejects
  proves: a dependency failure is handled as a generic 500 rather than leaking internal detail (SEC-04)
    or crashing the process (EDG-08)
  fails_when: the rejected error's own text reaches the response body, or the process throws unhandled
    instead of answering 500
not_applicable:
- edge_case: a duplicate where uniqueness is claimed
  why: listing every term of one vocabulary asserts no uniqueness constraint of its own; IGlossaryQuery.listVocabularyTerms's
    own contract states it runs no validation of its own beyond what assembling the vocabulary already
    does.
- edge_case: an operation attempted against state that forbids it
  why: this is a read-only listing route with no state machine of its own; nothing about the request's
    own history or the resource's own state can forbid it.
- edge_case: an absent :vocabulary path segment entirely
  why: criterion 2 names a vocabulary the glossary does not recognize, not an absent segment; an absent
    required path parameter is a route-matching question Fastify itself resolves, a different mechanism
    from this DTO's z.enum refusal.
contested:
- what: 'The task''s own ## Notes state that criterion 2''s refusal ''reuses'' the typed error read-vocabulary-term
    raises for an unrecognized vocabulary, resolved through task/case-lifecycle-http/status-map.'
  why: Reading read-vocabulary-term.dto.ts, .routes.ts and its own spec file shows that sibling route
    does not raise a typed error for an unrecognized vocabulary either — it refuses through the identical
    z.enum(TERM_VOCABULARIES) DTO-boundary mechanism this task's own implementation uses, and status-map.ts
    carries no entry for any 'unrecognized vocabulary' error at all. This proof tests the criterion as
    the implementation and its precedent actually satisfy it — a 400/VALIDATION_ERROR answer, never reaching
    listVocabularyTerms — rather than asserting a typed-error/status-map path that no route in this codebase,
    including the one the Notes cite as precedent, actually exercises.
---

## What it is

Seventeen Fastify-injection tests over createListVocabularyTermsRoutesPlugin, with a mocked IGlossaryQuery.

## Notes

The contested finding above matches the implementation's own disclosed divergence — two independent passes (implementation, proof) reached the same conclusion about the task's Notes. Verified by running the whole suite (run/list-route-batch2-suite): all files passing, including the 21 tests in this file directly.
