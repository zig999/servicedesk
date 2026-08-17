---
title: Proof for GET /v1/glossary/{vocabulary}/{name}
summary: Ten Fastify-injected tests over GET /v1/glossary/{vocabulary}/{name}, proving both criteria,
  all five term vocabularies, and the closed-enum validation boundary.
implementation: sha256:816b9d58ad3efafb71d198f0fa86f318af718ade2f3c8078b2909595d9e2da51
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/read-routes-batch-suite-2
tests:
- file: src/__tests__/unit/http/read-vocabulary-term.routes.spec.ts
  name: answers 200 with the term currently held by the named vocabulary, exactly as the glossary holds
    it
  proves: Criterion 1
  fails_when: the route answers a status other than 200, a body that is not the resolved term's own shape,
    or a body carrying any field beyond readVocabularyTermResponseSchema.
- file: src/__tests__/unit/http/read-vocabulary-term.routes.spec.ts
  name: resolves the term exactly as the path spelled it, case and hyphenation preserved, never normalized
  proves: Criterion 1's 'exactly' half.
  fails_when: the route lowercases, trims or otherwise alters :name before calling readVocabularyTerm.
- file: src/__tests__/unit/http/read-vocabulary-term.routes.spec.ts
  name: answers each of two requests naming different terms with that request's own resolution, never
    a cached or joined value
  proves: Criterion 1, each request's own answer.
  fails_when: the second response repeats the first term's name.
- file: src/__tests__/unit/http/read-vocabulary-term.routes.spec.ts
  name: resolves a term of each of the five vocabularies through readVocabularyTerm, and answers with
    what it holds
  proves: every one of the five term vocabularies reaches readVocabularyTerm with its own name unchanged.
  fails_when: any one of the five vocabulary segments fails validation or is not forwarded correctly.
- file: src/__tests__/unit/http/read-vocabulary-term.routes.spec.ts
  name: refuses with the status the status map assigns VocabularyTermNotHeldError, when the named vocabulary
    does not currently hold the term
  proves: Criterion 2
  fails_when: the route answers any status other than 404, an error code other than VocabularyTermNotHeldError,
    or details that drop the vocabulary/name.
- file: src/__tests__/unit/http/read-vocabulary-term.routes.spec.ts
  name: answers 400 for a :vocabulary segment naming none of the five term vocabularies, never reaching
    the glossary query
  proves: an unknown :vocabulary segment is refused at the validation boundary.
  fails_when: an unrecognized vocabulary segment reaches readVocabularyTerm.
- file: src/__tests__/unit/http/read-vocabulary-term.routes.spec.ts
  name: answers 404 for a request naming no term segment at all, never reaching the glossary query
  proves: EDG-01 absent input.
  fails_when: the route matches an empty :name segment and calls readVocabularyTerm.
- file: src/__tests__/unit/http/read-vocabulary-term.routes.spec.ts
  name: answers 500 with a generic message, never the rejected call's own error text, when the glossary
    query itself rejects
  proves: SEC-04/EDG-08.
  fails_when: the response carries anything but 500, or its body contains the rejected error's own text.
not_applicable:
- edge_case: two concurrent reads against the same vocabulary/term
  why: no bound node states a concurrency guarantee for a pure resolution against current state.
- edge_case: an empty or whitespace-only :vocabulary segment reached via a doubled path separator
  why: exercises the identical Fastify route-matching mechanism already proven by the empty-:name test.
- edge_case: a :name segment that is present but consists only of whitespace
  why: neither the DTO nor any bound node treats whitespace as absence.
untested:
- the real glossary-query resolution behind IGlossaryQuery.readVocabularyTerm is stood in by a mock here
  and proved separately against the actual implementation.
- this route's registration inside build-app.ts is task/case-lifecycle-http/register-routes-in-build-app,
  still outstanding at the time of this proof.
---

## What it is

Eight Fastify-injected tests plus vocabulary-coverage cases, proving both criteria over a locally-assembled app.

## Notes

None.
