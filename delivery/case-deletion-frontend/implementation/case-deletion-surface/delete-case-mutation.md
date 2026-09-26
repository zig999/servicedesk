---
target: frontend
title: Case-delete client mutation
summary: A useMutation hook that DELETEs /v1/cases/:slug and invalidates the cases-listing query once
  the delete is accepted.
task: sha256:051159349cb46d3ff3ad213e6efc2659140073d6f700a6c218ef298b0de36f39
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/case-deletion-surface-delete-case-mutation-build
files:
- path: src/hooks/use-delete-case.ts
  effect: 'New file. Exports useDeleteCase(), a useMutation whose mutationFn calls apiFetch<void>(`/v1/cases/${encodeURIComponent(slug)}`,
    { method: "DELETE" }) and whose onSuccess invalidates the ["cases-list"] query key. Returns the raw
    UseMutationResult<void, unknown, string> so a consumer reads mutate/isPending/isSuccess/error directly.'
criteria:
- criterion: Invoking the mutation for slug s sends exactly one HTTP DELETE request to /v1/cases/s.
  met: true
  how: mutationFn is a single apiFetch<void> call with method "DELETE" against `/v1/cases/${encodeURIComponent(slug)}`
    and no retry logic of its own; TanStack Query's useMutation issues no automatic retry, so one mutate(slug)
    call sends exactly one request.
- criterion: An HTTP 204 answer with an empty body settles the mutation as succeeded.
  met: true
  how: apiFetch<T> already returns undefined as T for a 204 response rather than throwing; mutationFn's
    declared T is void, so a 204 resolves the mutation's promise and useMutation reports isSuccess true,
    onSuccess fires.
- criterion: A succeeded mutation invalidates the query backing the cases listing.
  met: true
  how: 'onSuccess calls queryClient.invalidateQueries({ queryKey: ["cases-list"] }), the exact key useCasesList()
    registers its query under.'
- criterion: An HTTP 409 answer settles the mutation as failed with an ApiError whose code is CaseHoldsVersionsError.
  met: true
  how: apiFetch throws an ApiError built from the backend's error envelope for any non-2xx response; the
    mutation adds no mapping or filtering of its own, so a 409 whose body names CaseHoldsVersionsError
    reaches useMutation's error state unchanged.
- criterion: An HTTP 404 answer settles the mutation as failed with an ApiError whose code is CaseNotFoundError.
  met: true
  how: same mechanism as the 409 case -- the mutation performs no code-specific branching, so a 404 whose
    body names CaseNotFoundError reaches useMutation's error state unchanged.
nodes:
- node: contracts/knowledge/case-lifecycle
  encoded_at:
  - src/hooks/use-delete-case.ts
  how: The hook exercises exactly the contract's delete operation over a case slug (DELETE /v1/cases/:slug);
    it calls no other operation the contract publishes.
- node: domain/knowledge/case
  encoded_at:
  - src/hooks/use-delete-case.ts
  how: The mutation addresses a case by its slug identity alone; it reads and writes nothing else the
    case holds.
- node: constraints/a-successful-case-deletion-answers-with-no-content
  encoded_at:
  - src/hooks/use-delete-case.ts
  how: mutationFn declares apiFetch<void>, so an accepted delete's 204-with-no-body answer is exactly
    what the mutation expects to resolve with; no body is read or asserted for the success path.
- node: rules/knowledge/a-case-holding-no-version-may-be-deleted
  encoded_at:
  - src/hooks/use-delete-case.ts
  how: The hook sends the delete unconditionally for whatever slug it is given and lets apiFetch/ApiError
    carry the backend's own accept-or-refuse answer through unmodified -- the 204 accepted branch and
    the 409 CaseHoldsVersionsError refusal both reach the caller exactly as the rule states them.
- node: rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
  encoded_at:
  - src/hooks/use-delete-case.ts
  how: 'Only the rule''s reach over this one operation (delete) is answered here: a 404 whose body names
    CaseNotFoundError propagates through the mutation''s error state unchanged, satisfying criterion 5.'
- node: scenarios/knowledge/a-case-holding-no-version-is-deleted
  encoded_at:
  - src/hooks/use-delete-case.ts
  how: This is the client-side half of the scenario's accepted branch -- invoking the mutation for a case
    holding no version sends the DELETE and, once accepted, invalidates ["cases-list"] so the listing
    is read again and the case no longer appears in it.
inferences:
- inferred: '"The query backing the cases listing" (criterion 3) is the ["cases-list"] query key useCasesList()
    registers, and invalidating that key (never calling list-cases directly) is what the criterion asks
    for.'
  from: 'use-cases-list.ts''s own useQuery({ queryKey: ["cases-list"], ... }), and the task''s own advisory
    note that case-query''s list-cases is left out of implements because this task only invalidates it.'
- inferred: The mutation returns the raw UseMutationResult rather than a wrapped { remove, isRemoving
    } shape the way useRemoveGlossaryConcept and useConnectorConfigurationDetail's removeMutation do internally.
  from: The task's own REMAINDER notes, which place the confirmation gate, the landing destination, and
    the refusal telling in later, separate tasks rather than here -- exposing mutate/isPending/isSuccess/error
    directly lets each of them read what it needs without this hook choosing for them.
- inferred: The DELETE path is built with encodeURIComponent(slug) rather than an unescaped template literal.
  from: Every surviving sibling delete call in the codebase (use-connector-configuration-detail.ts, use-glossary-concepts.ts,
    use-case-versions.ts, discard-confirmation.ts) escapes its own path segment the same way; the task's
    own inventory calls the sibling shape the one to follow.
deferred:
- what: The server-side effect of an accepted delete and the 409 refusal's own message/details shape.
  why: Already delivered in case-deletion-backend's delete-case-over-case-lifecycle task; this hook only
    consumes the answer apiFetch already surfaces.
- what: rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused's reach over reads and the
    other case-lifecycle operations, and its details shape.
  why: Belongs to the case-query read surfaces and those operations' own tasks; only the 404-on-delete
    answer is used here.
- what: rules/knowledge/a-case-deletion-takes-a-further-explicit-act-reproducing-the-cases-own-slug's
    confirmation gate.
  why: This mutation sends the delete whenever invoked; the gate belongs to task/case-deletion-surface/case-detail-delete-control.
- what: rules/knowledge/a-successful-case-deletion-lands-on-the-listing-of-every-case's landing destination
    after a successful delete.
  why: This task only invalidates the listing query; navigation belongs to task/case-deletion-surface/case-detail-delete-control.
- what: The deleted/not-deleted telling and the unrecognised-failure notice for any other refusal code.
  why: Belongs to task/case-deletion-surface/case-delete-refusal-presentation; this hook keeps the wire
    code unmapped precisely so that later task can still tell such a refusal apart from the two named
    ones.
---

## What it is
A new hook, useDeleteCase(), placed beside the existing case hooks under frontend/app/src/hooks, exercising the case-lifecycle delete over a slug via apiFetch.

## Notes
None.
