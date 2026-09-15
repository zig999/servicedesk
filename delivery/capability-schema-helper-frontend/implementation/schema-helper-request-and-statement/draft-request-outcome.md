---
target: frontend
title: The draft request and its classified outcome for the Capability Schema Helper
summary: A new hook, use-draft-capability-schema-from-openapi, that dispatches the Schema Helper's draft request through the shared apiFetch client to draft-capability-schema-from-openapi and resolves every possible answer into exactly one of six distinguishable outcomes, each drafted or refused outcome carrying the link, path and method it answers.
task: sha256:98848f25f3ad07a4ca28f60a867bda05b8d38532fdbd269361b33f6d38345d6e
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/schema-helper-request-and-statement-draft-request-outcome-build
files:
- path: src/hooks/use-draft-capability-schema-from-openapi.ts
  effect: New file exporting useDraftCapabilitySchemaFromOpenApi(), a React hook that wraps a single useMutation posting { link, path, method } to POST /v1/draft-capability-schema-from-openapi through the shared apiFetch client, exposes an outcome discriminated by kind (idle/pending/drafted/openapi-document-not-fetched/openapi-document-not-readable/openapi-operation-not-found/unrecognized-failure), where the drafted and three named-refusal kinds each carry the link, path and method of the request they answer, and a requestDraft dispatcher guarded by a useRef boolean against a second dispatch while one is in flight.
criteria:
- criterion: The hook dispatches a POST to draft-capability-schema-from-openapi carrying a body of exactly link, path and method, taken from the link the operator named and the operation they chose.
  met: true
  how: 'requestDraft''s own parameter type, DraftCapabilitySchemaFromOpenApiRequest, has exactly the three readonly fields link, path and method; mutationFn calls apiFetch<CapabilitySchemaDraft>(''/v1/draft-capability-schema-from-openapi'', { method:''POST'', ..., body: JSON.stringify(request) }) with that same request object as the body, verbatim and unwrapped.'
- criterion: The request is issued through the existing apiFetch client in frontend/app/src/services/api-client.ts, and no module added by this task builds a fetch of its own or parses a response envelope of its own.
  met: true
  how: the only network call in the file is the single apiFetch<CapabilitySchemaDraft>(...) call inside mutationFn; the file imports apiFetch and ApiError from ../services/api-client and calls no other fetch, Response or JSON-parsing API of its own.
- criterion: No module added by this task issues a request to an OpenAPI document's own URL; the document is reached only through a backend operation.
  met: true
  how: the file's one outbound call targets this backend's own route (/v1/draft-capability-schema-from-openapi); the operator-named OpenAPI link travels only as a string field of that POST body, never as a fetch target of its own.
- criterion: An HTTP 200 answer resolves to a drafted outcome carrying that answer's input_schema, its output_schema, and each unresolved item's name and reason, with no name and no reason the answer did not carry.
  met: true
  how: 'outcomeFromMutation''s ''success'' branch returns { kind:''drafted'', ...mutation.variables, draft: pickCapabilitySchemaDraftFields(mutation.data) }; pickCapabilitySchemaDraftFields builds a fresh object holding exactly input_schema, output_schema and unresolved.map(item => ({ name: item.name, reason: item.reason })).'
- criterion: An answer reporting OpenApiDocumentNotFetchedError resolves to an outcome distinct from the outcome either other refusal code resolves to.
  met: true
  how: refusalKindForError's switch maps 'OpenApiDocumentNotFetchedError' to the literal kind 'openapi-document-not-fetched', one of three distinct string literals in CapabilitySchemaDraftRefusalKind.
- criterion: An answer reporting OpenApiDocumentNotReadableError resolves to an outcome distinct from the outcome either other refusal code resolves to.
  met: true
  how: the same switch maps 'OpenApiDocumentNotReadableError' to the distinct literal 'openapi-document-not-readable', produced by no other branch.
- criterion: An answer reporting OpenApiOperationNotFoundError resolves to an outcome distinct from the outcome either other refusal code resolves to.
  met: true
  how: the same switch maps 'OpenApiOperationNotFoundError' to the distinct literal 'openapi-operation-not-found', produced by no other branch.
- criterion: An answer carrying any other error code resolves to an unrecognised-failure outcome that is neither a drafted outcome nor any of the three named refusal outcomes.
  met: true
  how: refusalKindForError's switch default (and the non-ApiError case) returns undefined, and outcomeFromMutation's 'error' branch then returns { kind:'unrecognized-failure' } -- a fifth literal never produced by any other branch.
- criterion: While a dispatched request stands unanswered, the outcome is the pending one and is neither a drafted outcome nor any refusal outcome.
  met: true
  how: outcomeFromMutation's 'pending' case returns { kind:'pending' } unconditionally, a literal disjoint from 'drafted' and every refusal kind.
- criterion: Where no request has been dispatched, the outcome is the idle one and is neither a drafted outcome nor any refusal outcome.
  met: true
  how: before requestDraft's first call, useMutation's own status is 'idle', and outcomeFromMutation's 'idle' case returns { kind:'idle' } unconditionally.
- criterion: A drafted or refused outcome carries the link, the path and the method of the request it answers, exactly as that request named them.
  met: true
  how: both the 'drafted' branch and the 'error' branch (for the three named refusal kinds) spread ...mutation.variables -- the exact object requestDraft passed to mutation.mutate -- onto the returned outcome, so link, path and method reach the outcome unchanged.
- criterion: A dispatch attempted while a request is in flight issues no second request to the operation.
  met: true
  how: requestDraft checks isDispatchingRef.current first and returns immediately if already true; it is set true before mutation.mutate is called and reset to false only in mutate's onSettled callback.
nodes:
- node: rules/integration/a-capability-authoring-surface-offers-a-schema-helper
  encoded_at:
  - src/hooks/use-draft-capability-schema-from-openapi.ts
  how: this task reaches only the fragment 'requests a capability schema draft generated from the chosen operation' -- requestDraft dispatches exactly that request. The clauses that the helper sits beneath the two schema fields, that the operation is chosen from the fetched document's own listing rather than typed, that the request act is offered only once an operation stands chosen, and that requesting issues no register-capability call are the task's own REMAINDER/UNDERDETERMINED notes and are not reached by this hook.
- node: rules/integration/an-answered-schema-draft-request-states-its-draft-to-the-operator
  encoded_at:
  - src/hooks/use-draft-capability-schema-from-openapi.ts
  how: the hook produces the drafted outcome carrying exactly this node's three disclosed parts (input_schema, output_schema, each unresolved item's name and reason); stating that data to the operator on the surface is this task's own REMAINDER, not reached here.
- node: rules/integration/a-refused-schema-draft-states-its-refusal-to-the-operator
  encoded_at:
  - src/hooks/use-draft-capability-schema-from-openapi.ts
  how: the hook classifies a refused answer into one of the three named, mutually distinct refusal outcomes or the separate unrecognised-failure outcome, and a refusal outcome never carries input_schema, output_schema or unresolved; stating that classification's meaning to the operator is this task's own REMAINDER, not reached here.
- node: rules/integration/no-schema-draft-refusal-is-stated-before-the-operation-answers
  encoded_at:
  - src/hooks/use-draft-capability-schema-from-openapi.ts
  how: a refusal kind is only ever returned from outcomeFromMutation's 'error' case, reached only once the mutationFn's promise has rejected -- once the operation has answered; the 'pending' case, reached for every unanswered dispatch, never returns a refusal kind.
- node: rules/integration/a-pending-schema-draft-request-is-not-dispatched-again
  encoded_at:
  - src/hooks/use-draft-capability-schema-from-openapi.ts
  how: the isDispatchingRef guard in requestDraft suppresses every dispatch attempted while the previous one is still in flight, issuing no call at all for a suppressed attempt and leaving the outstanding request's own mutate() call untouched; released in onSettled. The clause that a suppressed attempt is retried automatically once the outstanding one ends is this task's own UNDERDETERMINED note and is not implemented.
- node: contracts/integration/capability-schema-draft
  encoded_at:
  - src/hooks/use-draft-capability-schema-from-openapi.ts
  how: the hook's one outbound call is the published operation draft-capability-schema-from-openapi, called for its answer only; it never calls register-capability or writes anything, honoring 'a read, never a registration'.
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  encoded_at:
  - src/hooks/use-draft-capability-schema-from-openapi.ts
  how: the hook never issues a request to an OpenAPI document's own URL; the operator-named link travels only as a body field of the POST to this backend operation.
- node: domain/integration/capability-schema-draft
  encoded_at:
  - src/hooks/use-draft-capability-schema-from-openapi.ts
  how: CapabilitySchemaDraft is typed with exactly this value object's three declared attributes (input_schema, output_schema, unresolved), and pickCapabilitySchemaDraftFields constructs the drafted outcome's draft from exactly those three.
- node: domain/integration/capability-schema-draft-unresolved-item
  encoded_at:
  - src/hooks/use-draft-capability-schema-from-openapi.ts
  how: CapabilitySchemaDraftUnresolvedItem is typed with exactly this value object's two declared attributes, name and reason, and pickCapabilitySchemaDraftFields's map rebuilds every unresolved entry as exactly that shape.
- node: domain/integration/capability-schema-draft-unresolved-reason
  how: the node's closed two-value set is not re-encoded at the frontend type level -- reason is typed as string, the same convention the sibling hook's own analogous field already follows -- because the backend's own DTO already enforces the closed set on the wire, and no criterion of this task asks the frontend to re-validate or narrow it; the value is carried through unopened.
inferences:
- inferred: 'the endpoint is POST /v1/draft-capability-schema-from-openapi with link, path and method all in the request body, and the answer body is { input_schema, output_schema, unresolved: [{ name, reason }] }.'
  from: no candidate node states a URL or wire shape (per the task's own ADVISORY notes); read directly off the already-delivered backend HTTP surface record and its DTO file.
- inferred: the three refusal codes map to outcome kinds as OpenApiDocumentNotFetchedError -> openapi-document-not-fetched, OpenApiDocumentNotReadableError -> openapi-document-not-readable, OpenApiOperationNotFoundError -> openapi-operation-not-found, read off ApiError.code.
  from: 'the backend''s own error classes each set this.name to exactly these strings, and error-handler.middleware.ts''s domainEnvelope reports code: error.name; the task''s own Notes name these same three rules as the already-delivered backend''s own claim, read rather than re-derived.'
- inferred: a refusal outcome (the three named kinds) carries no further disclosure beyond kind, link, path and method -- no fetch-failure kind, no HTTP status, no unreadable-document reason.
  from: this task's own REMAINDER notes state that stating the refusal's meaning belongs to sibling rules neither reached by this task's own criteria (which ask only for distinctness among outcomes).
- inferred: the unrecognized-failure outcome carries no link, path or method, unlike the drafted outcome and the three named refusal outcomes.
  from: criteria five through eight's own wording, treating 'the three named refusal outcomes' and 'an unrecognised-failure outcome' as two separate categories.
- inferred: mutation.reset() is called immediately before every mutation.mutate() dispatch, and the in-flight guard is a useRef boolean reset in mutate's onSettled callback.
  from: the task's own Notes state the in-flight guard is drawn from the convention the inventory records at the sibling hook, which follows this exact pattern.
preserved:
- every other hook, route and service in frontend/app/src, none of which this task's one new file imports, re-exports from, or modifies.
- the existing apiFetch/ApiError contract in frontend/app/src/services/api-client.ts, consumed unmodified.
deferred:
- what: stating the drafted outcome's data and the refused outcome's classification to the operator on the capability authoring surface.
  why: this task's own Notes mark these REMAINDER -- its criteria reach only the outcome carrying and classifying that data, never a rendered statement of it; a later task in this plan owns the surface that renders the outcome.
- what: offering the request act only once an operation stands chosen, choosing the operation from the fetched document's own listing, placing the helper beneath the Input schema and Output schema fields, and suppressing the register-capability call as an observable fact of the wider surface.
  why: this task's own Notes mark these REMAINDER; they belong to the fields component and screen wiring this task's own objective does not reach.
- what: automatically re-requesting once a suppressed-in-flight attempt's outstanding request ends, and leaving that outstanding request's own state untouched by the suppressed attempt beyond not dispatching it.
  why: this task's own Notes mark both clauses UNDERDETERMINED against this task's own criterion twelve, which forbids only a second dispatch; automatic re-request on completion is not implemented and is left to whichever caller decides to invoke requestDraft again.
---

## What it is

The frontend's one binding to the already-delivered draft operation, modelled the way the sibling draft hook already models its own: a single mutation read through a status switch into a discriminated outcome, carrying the request it answers.

## Notes

None.
