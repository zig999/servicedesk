---
title: read-concept returns a concept's description
summary: Proves that GET /v1/glossary/concepts/{name} carries a held concept's description
  alongside its name, accepts and ttl, and answers the empty string for a legacy concept
  holding none rather than refusing the read.
implementation: sha256:e759560ef22dde4a97fb3b991e9b719e016d1a98c32cac3bf9249a7262d952b1
run: run/pinned-evidence-semantics-full-suite-post-evidence-snapshot-4
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
tests:
- file: src/__tests__/unit/http/read-concept.routes.spec.ts
  name: answers 200 with the concept currently held by the glossary, including its
    accepted subject types and its ttl
  proves: Reading a held concept by name answers its description alongside its name,
    accepts and ttl.
  fails_when: handleReadConceptRequest's returned object stops carrying description,
    or the response body for a held concept no longer deep-equals the resolved concept
    including its description field, or readConceptResponseSchema's own key set stops
    matching what the response actually contains.
- file: src/__tests__/unit/http/read-concept.routes.spec.ts
  name: answers 200 with the empty string for description, when the glossary holds
    a legacy concept with no stored description, never a refusal
  proves: Reading a held concept with no stored description answers the empty string
    for description, never a refusal.
  fails_when: the response for a held concept resolved with description '' stops answering
    200 (a refusal is raised instead), or the description field the response carries
    is anything other than the empty string.
not_applicable:
- edge_case: Two concurrent GET requests reading concepts at once
  why: No criterion or node this task implements states anything about concurrent
    reads; description travels through the same single, already-existing synchronous
    resolution path name, accepts and ttl already used, so concurrency raises no question
    this task's own criteria introduce.
- edge_case: A description string at some length boundary, or holding characters needing
    escaping
  why: readConceptResponseSchema's description field is a plain, unconstrained z.string()
    — no minimum, maximum or pattern is bound to this task's criteria or the nodes
    it implements — so there is no stated boundary to test at this read boundary.
- edge_case: The glossary-query dependency rejecting or answering slowly while resolving
    a concept that would otherwise carry a description
  why: This is the read route's existing dependency-failure (500) behavior, untouched
    by this task and already exercised by the pre-existing test "answers 500 with a
    generic message..."; adding a description field to an already-resolved response
    introduces no new failure mode on that path, so a new test here would prove behavior
    this task did not change.
untested:
- Neither test's own internal edge — a description holding unusual characters, or
  a concept whose description changes between two reads — is exercised; no criterion
  or node this task implements names either as a case to prove.
---

## What it is
handleReadConceptRequest's response carries the held concept's own description, proven by the pre-existing criterion-1 test's full toEqual assertion.
A second test, added here, proves a legacy concept with no stored description answers the empty string rather than a refusal.

## Notes
The second test was added by this proof; both it and the pre-existing criterion-1 test are confirmed passing in the cited run, captured after this task's own source change and the new test both landed.
