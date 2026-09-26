---
target: frontend
title: Case-delete client mutation proof
summary: Six tests over useDeleteCase pin the wire request it issues, its 204-success settlement and cache
  invalidation, its 409/404 error-code pass-through, and the underdetermined boundary that keeps an unnamed
  refusal's own wire code rather than folding it into CaseNotFoundError.
implementation: sha256:850f9eb18bffbe685d05bad95f32095a3460cb935853961f641912b4be5eae3d
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/case-deletion-surface-delete-case-mutation-suite
tests:
- file: src/hooks/use-delete-case.spec.ts
  name: issues a single DELETE request to /v1/cases/:slug for the slug the mutation was invoked with
  proves: Invoking the mutation for slug s sends exactly one HTTP DELETE request to /v1/cases/s (criterion
    1).
  fails_when: the mutation sends more than one request, sends a request to a URL other than /v1/cases/<the
    given slug>, or sends a method other than DELETE.
- file: src/hooks/use-delete-case.spec.ts
  name: reports isSuccess, with no error and no data, once the DELETE answers 204 with no body
  proves: An HTTP 204 answer with an empty body settles the mutation as succeeded (criterion 2).
  fails_when: the mutation stops reporting isSuccess for a 204-with-no-body answer, or instead reports
    isError, for that answer.
- file: src/hooks/use-delete-case.spec.ts
  name: invalidates the ["cases-list"] query once the delete settles as succeeded
  proves: A succeeded mutation invalidates the query backing the cases listing (criterion 3).
  fails_when: queryClient.invalidateQueries stops being called with queryKey ["cases-list"] once the delete
    succeeds.
- file: src/hooks/use-delete-case.spec.ts
  name: reports isError with an ApiError coded CaseHoldsVersionsError when the DELETE answers 409
  proves: An HTTP 409 answer settles the mutation as failed with an ApiError whose code is CaseHoldsVersionsError
    (criterion 4).
  fails_when: a 409 answer stops settling the mutation as failed, or its error stops being an ApiError
    whose code is CaseHoldsVersionsError.
- file: src/hooks/use-delete-case.spec.ts
  name: reports isError with an ApiError coded CaseNotFoundError when the DELETE answers 404
  proves: An HTTP 404 answer settles the mutation as failed with an ApiError whose code is CaseNotFoundError
    (criterion 5).
  fails_when: a 404 answer stops settling the mutation as failed, or its error stops being an ApiError
    whose code is CaseNotFoundError.
- file: src/hooks/use-delete-case.spec.ts
  name: reports the ApiError's own code, INTERNAL_ERROR, unchanged for an HTTP 500 answer -- never CaseNotFoundError
  proves: UNDERDETERMINED, from the specification -- no criterion says what the mutation settles with
    when the answer is neither 204, 409 nor 404; this test fails over exactly the passing implementation
    the entry names, one that settles every other non-204 answer as CaseNotFoundError.
  fails_when: the mutation maps a non-204, non-409, non-404 answer's error code onto CaseNotFoundError
    (or onto any code other than the wire's own) instead of preserving the wire code unchanged.
not_applicable:
- edge_case: A slug containing characters that would need URL-encoding
  why: No criterion or node states a boundary on what characters a slug may hold; the implementation's
    own choice to build the path with encodeURIComponent is recorded as an inference, not an obligation
    this task must pin with a test.
- edge_case: An empty or otherwise malformed slug argument
  why: The mutation performs no client-side validation of the slug's shape; whatever string it is given
    reaches the URL unchanged, and any refusal the server issues for it is already covered as a representative
    of the non-204/409/404 pass-through the underdetermined test proves.
- edge_case: The underlying fetch rejecting outright (a network failure) rather than resolving with a
    non-2xx response
  why: No criterion names behavior for a transport-level failure; apiFetch's own handling of a rejected
    fetch is not this task's own code, and no node reaches it either.
- edge_case: Two concurrent invocations of the mutation, or a second delete issued while one is still
    pending
  why: No criterion states a concurrency requirement, and useMutation's own single in-flight call semantics
    are TanStack Query's own behavior, not an arrangement this task's file decides.
- edge_case: A 409 answer whose body names an error code other than CaseHoldsVersionsError
  why: No criterion or node states behavior for that combination; the underdetermined test already exercises
    the same pass-through mechanism that would govern this case too.
untested:
- 'contracts/knowledge/case-lifecycle: this node publishes nine operations; this task''s own file exercises
  only delete. No test here decides the node''s own declared operation set whole -- the other eight operations
  are each other tasks'' own to test.'
- 'domain/knowledge/case: this node''s own fact spans the slug identity, the next_version counter''s behavior
  across create-draft and delete, and its survival across a version''s deletion; this task''s own file
  addresses a case only by its slug, for the delete operation alone, and asserts nothing about next_version.
  No test here decides the node whole.'
- 'constraints/a-successful-case-deletion-answers-with-no-content: the node''s own fitness is a server-side
  fact -- that the case-lifecycle''s delete operation, once accepted, actually answers HTTP 204 with no
  body -- already decided by case-deletion-backend''s own delivered proof. This task''s own test (criterion
  2) is narrower: it proves the client settles as succeeded given a 204-with-no-body answer, whichever
  answer the server actually sends.'
- 'rules/knowledge/a-case-holding-no-version-may-be-deleted: the rule''s own statement covers both the
  accepted branch''s server-side cascade and the refused branch''s message/details shape, whole; the task''s
  own REMAINDER notes place both outside this task''s criteria, already delivered by case-deletion-backend.
  This task''s own tests exercise only the wire pass-through of the 204 and 409 answers, which is part
  of the rule, not its whole fact.'
- 'rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused: the rule spans every read and
  lifecycle operation naming a slug or a slug-and-version; this task''s own REMAINDER note places that
  reach outside this task, using only the 404-on-delete branch as one representative. No test here decides
  the rule whole.'
- 'scenarios/knowledge/a-case-holding-no-version-is-deleted: the scenario''s own then-clauses are that
  the deletion is accepted, the case no longer appears in the listing, and a future create-draft naming
  that slug creates a new case as though the deleted one never existed. This task''s own tests reach only
  the first two, via invalidating the listing query; the third reaches no criterion here and is already
  decided whole by case-deletion-backend''s own delivered proof.'
---

## What it is
Unit tests over useDeleteCase in src/hooks/use-delete-case.ts, exercising the wire request, its 204/409/404 settlement and the cases-list invalidation.

## Notes
None.
