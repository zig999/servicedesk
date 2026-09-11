---
target: frontend
title: Frontend hook reading an OpenAPI document's operations
summary: A new query-backed hook, useOpenApiDocumentOperations, calls the backend's read-openapi-document-operations
  route keyed by an operator-named link and exposes a closed outcome of operations, one of the named refusals
  (including a document declaring no version, told apart from a generic parse/version failure), or an
  unrecognised failure.
task: sha256:f1d6c7c0c6170982558685ae47bf7818e7a1d5c544e5c4c1676039068ff573fb
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/openapi-document-operations-read-build-2
files:
- path: src/hooks/use-openapi-document-operations.ts
  effect: New hook module. Exports OpenApiOperation ({path, method}), the discriminated union OpenApiDocumentOperationsReadOutcome
    (idle | pending | operations | openapi-document-not-fetched | openapi-document-not-readable | openapi-document-declares-no-version
    | unrecognized-failure), and useOpenApiDocumentOperations(link), which wraps apiFetch in a useQuery
    keyed by ["read-openapi-document-operations", link], enabled only once link is non-empty, issuing
    a GET against /v1/read-openapi-document-operations?link=<encoded link>. Translates ApiError.code into
    the outcome union the same way use-draft-connector-configuration-from-openapi.ts does for its own
    two shared error values; for OpenApiDocumentNotReadableError it further reads a `reason` field on
    the error details and exposes a distinct openapi-document-declares-no-version outcome when that reason
    is "no-version-declared", falling back to the generic openapi-document-not-readable outcome for every
    other reason (a parse failure, an unsupported version, or an unrecognised/absent details shape). Defaults
    an unrecognised error code or an unparseable fetch-failure details body to {kind:"unrecognized-failure"}.
criteria:
- criterion: The read is issued through the application's api client against the backend's read-openapi-document-operations
    route.
  met: true
  how: useOpenApiDocumentOperations's queryFn calls apiFetch<ReadOpenApiDocumentOperationsResponse>, the
    same wrapper every other backend-reading hook in this tree uses, against /v1/read-openapi-document-operations.
- criterion: No request is issued from the frontend to the operator-named OpenAPI document link itself.
  met: true
  how: The only fetch this module issues targets the app's own backend route; the operator-named link
    is passed as a query-string value to that route (encodeURIComponent(link)), never as a fetch target
    of its own.
- criterion: An answer listing a document's operations is exposed as one entry per listed operation, each
    entry carrying that operation's path and that operation's method.
  met: true
  how: 'On query success, outcomeFromQuery returns {kind:"operations", operations: query.data.operations},
    re-exposing the response''s own operations array of {path, method} entries unchanged.'
- criterion: An entry's method is the method the answer named for that operation, the hook applying no
    case change of its own, so an answer naming POST is exposed as POST.
  met: true
  how: The operations array is passed straight through from the parsed response; no .toUpperCase()/.toLowerCase()
    or other transform is applied anywhere in this module.
- criterion: A refusal reporting OpenApiDocumentNotFetchedError is exposed as an outcome naming an unfetchable
    link and carrying which of network-failure, timeout or status-outside-2xx the answer named.
  met: true
  how: outcomeForRefusal maps ApiError.code === "OpenApiDocumentNotFetchedError" to outcomeForNotFetchedError,
    which parses details.kind into the reused OpenApiDocumentFetchFailure (network-failure | timeout |
    status-outside-2xx with its status) and returns {kind:"openapi-document-not-fetched", failure, link?};
    the sub-kind classification does not depend on link being present.
- criterion: A refusal reporting OpenApiDocumentNotReadableError is exposed as an outcome naming a document
    that could not be read as OpenAPI 3.x, and never as the unfetchable-link outcome.
  met: true
  how: outcomeForNotReadableError returns {kind:"openapi-document-not-readable"} (or the distinct no-version
    variant below), structurally disjoint from openapi-document-not-fetched; the switch in outcomeForRefusal
    never routes this error code to the fetch-failure branch.
- criterion: An answer whose error value is neither of those two, or whose body does not carry the expected
    shape, is exposed as an unrecognised failure naming neither of the two conditions.
  met: true
  how: The switch's default branch returns {kind:"unrecognized-failure"} for any other ApiError.code and
    for a non-ApiError error; outcomeForNotFetchedError also falls back to unrecognized-failure when details
    is not a plain record or its kind/status do not match one of the three known fetch-failure shapes.
- criterion: An outcome that is any of the refusal conditions exposes no operation entries.
  met: true
  how: OpenApiDocumentOperationsReadOutcome is a discriminated union; only the "operations" variant carries
    an operations field, so no refusal variant (including the new openapi-document-declares-no-version
    one) can structurally hold one.
- criterion: Reading a second link exposes that second link's own operations and never the entries the
    previously read link answered.
  met: true
  how: The query key is ["read-openapi-document-operations", link]; TanStack Query keeps a separate cache
    entry per distinct key with no placeholderData configured, so a changed link starts a fresh pending/success
    cycle rather than exposing the prior link's data.
nodes:
- node: domain/integration/openapi-operation
  encoded_at:
  - src/hooks/use-openapi-document-operations.ts
  how: Modeled as the exported OpenApiOperation type ({path, method}, both required strings), exposed
    verbatim from the answered response.
- node: domain/integration/openapi-document-operations
  encoded_at:
  - src/hooks/use-openapi-document-operations.ts
  how: 'Modeled as ReadOpenApiDocumentOperationsResponse ({operations: OpenApiOperation[]}) and surfaced
    as the "operations" outcome variant, answered whole rather than paged.'
- node: contracts/integration/openapi-document-operations
  encoded_at:
  - src/hooks/use-openapi-document-operations.ts
  how: The hook is this contract's sole frontend caller for its read-openapi-document-operations operation,
    issuing the read through apiFetch against the backend route and never generating a draft or calling
    register-connector.
- node: rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing
  encoded_at:
  - src/hooks/use-openapi-document-operations.ts
  how: Honored only for the part this task reaches — the hook supplies the fetched document's operations
    as the listing an operator later chooses from; the choosing interaction and the draft request it issues
    are REMAINDER, belonging to the task building the Configuration Helper surface, per this task's own
    Notes.
- node: rules/integration/an-openapi-operations-method-is-upper-cased
  encoded_at:
  - src/hooks/use-openapi-document-operations.ts
  how: The hook applies no case transform of its own to method, so it stays upper-cased for exactly as
    long as the answer conforms to domain/integration/openapi-operation; the upper-casing guarantee itself
    is the backend's, per this task's own ADVISORY note.
- node: rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read
  encoded_at:
  - src/hooks/use-openapi-document-operations.ts
  how: Honored on the frontend side only — the hook exposes an "openapi-document-not-fetched" outcome
    once the backend reports OpenApiDocumentNotFetchedError; the fetch/timeout conduct itself is REMAINDER
    belonging to the backend read-openapi-document-operations task, per this task's own Notes.
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read
  encoded_at:
  - src/hooks/use-openapi-document-operations.ts
  how: Honored more fully than this task's own literal criterion required — outcomeForNotReadableError
    now exposes a distinct "openapi-document-declares-no-version" outcome when the answered details name
    reason "no-version-declared", told apart from the generic "openapi-document-not-readable" outcome
    that a parse failure or an unsupported-version answer (or any other/unrecognised reason) still receives;
    the parse-stage conduct itself, and the finer naming of "what failed to parse" versus "which version
    was declared" (which this rule does not require distinguished from each other), remain REMAINDER belonging
    to the backend task.
- node: rules/integration/an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  encoded_at:
  - src/hooks/use-openapi-document-operations.ts
  how: outcomeForRefusal's switch keeps OpenApiDocumentNotFetchedError and OpenApiDocumentNotReadableError
    as disjoint outcome families, an unrecognised code as a third, and never maps one onto the other.
- node: rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  encoded_at:
  - src/hooks/use-openapi-document-operations.ts
  how: Reached only through the shared vocabulary this rule and the operations-read rule both name — the
    reused OpenApiDocumentFetchFailure type (network-failure/timeout/status-outside-2xx with its status)
    and an optional echoed link; this rule's own statement is scoped to the draft operation's surface,
    so it is honored here only to the depth the task's own ADVISORY note describes.
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  encoded_at:
  - src/hooks/use-openapi-document-operations.ts
  how: The module's only network call targets the backend's own /v1/read-openapi-document-operations route;
    no fetch to the operator-named link's own URL exists anywhere in this file.
inferences:
- inferred: The route path and verb — GET /v1/read-openapi-document-operations, with link carried as an
    encoded query-string parameter — since no node names an exact path or HTTP method and the backend
    operation does not yet exist.
  from: The operation's own kebab-case name (read-openapi-document-operations), and the two existing GET-based
    reading hooks (use-capabilities.ts's fixed route, use-glossary-vocabulary.ts's argument-keyed route),
    which the task's "What it is" describes this hook as wrapping "in the same way the existing backend-reading
    hooks do".
- inferred: The query-key shape (["read-openapi-document-operations", link]) and an enabled:link !== ""
    guard producing an "idle" outcome for an empty link.
  from: use-glossary-vocabulary.ts's argument-keyed queryKey is the closest precedent the inventory names,
    adapted for a caller-supplied, open-ended link rather than a closed vocabulary enum — the inventory's
    own note that no link-keyed precedent exists.
- inferred: The "idle" and "pending" outcome variants, which no criterion of this task names.
  from: A hook driven by an asynchronous query must return something before an answer arrives; this is
    hook-lifecycle plumbing rather than a domain fact, the same two states use-draft-connector-configuration-from-openapi.ts's
    outcome union already carries for its own mutation.
- inferred: The "openapi-document-not-fetched" outcome carries an optional link and the full OpenApiDocumentFetchFailure
    (including the status code for status-outside-2xx), and its parsing succeeds without requiring link
    to be present, even though criterion 5 requires only the sub-kind.
  from: The task's own UNDERDETERMINED note 1, which flags that discarding the status code and echoed
    link would satisfy the criterion as written but foreclose rules/integration/a-refused-operations-read-states-its-refusal-to-the-operator
    (outside this task, but downstream of this hook's outcome shape) from ever being satisfiable; carrying
    the richer, reused shape keeps that later rule satisfiable without revisiting this hook.
- inferred: A distinct "openapi-document-declares-no-version" outcome, keyed off a `reason` field on OpenApiDocumentNotReadableError's
    details equal to "no-version-declared", added after a red run showed a proof (use-openapi-document-operations.spec.ts,
    not authored by this delivery) asserting the no-version case must read differently from a generic
    parse/version failure.
  from: The task's own UNDERDETERMINED note 2 together with rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read's
    own text ("naming that the document declares no version, that naming told apart from both the others
    and never given ... as a parse failure"), which settles the distinction at the rule level independent
    of what this task's literal criteria enumerated; the `reason` field name itself is inferred from the
    proof's own stubbed response shape, since neither this task's nodes nor the sibling backend task (work/connector-configuration-helper-operation-listing-backend/task/openapi-document-operations-read/read-operations-http-operation.md,
    whose own Notes admit "no criterion holds the 'declares no version' naming distinct ... at the HTTP
    surface") fix an exact field name for the not-yet-built backend route — the backend and this hook
    will need to agree on that field when the backend is built.
- inferred: The fetch-failure-parsing helpers (fetchFailureFromDetails, outcomeForNotFetchedError) are
    written fresh in this file rather than imported, reusing only the exported OpenApiDocumentFetchFailure
    type from use-draft-connector-configuration-from-openapi.ts.
  from: Those helpers are private (unexported) in that file, and this task does not need to touch it;
    duplicating the small, self-contained parsing logic avoids widening this task to a file it has no
    criterion reaching.
- inferred: The success response body's shape (data.operations) is trusted from apiFetch's generic cast
    rather than independently re-validated at runtime.
  from: The same convention use-draft-connector-configuration-from-openapi.ts and use-capabilities.ts
    already follow for their own successful response bodies.
deferred:
- what: Composing this hook into useConnectorConfigurationHelper (or a sibling state hook), wiring the
    operator-typed link to it, and letting an operator choose one of the exposed operations rather than
    typing a path/method by hand.
  why: Belongs to the sibling task helper-operation-choice-state.md, named in this task's own REMAINDER
    notes as the task that builds the Configuration Helper's choosing surface.
- what: Rendering the exposed operations as selectable choices (a Select control) and disabling free-text
    path/method entry.
  why: Belongs to the sibling task operation-choice-fields.md.
- what: Stating the refusal (which condition, and the fetch sub-kind/status where applicable, and the
    no-version-declared distinction) to the operator on the Configuration Helper surface, and withholding
    any such statement while the read is still outstanding.
  why: Belongs to the sibling task operations-read-refusal-disclosure.md, which answers rules/integration/a-refused-operations-read-states-its-refusal-to-the-operator
    and rules/integration/no-operations-read-refusal-is-stated-before-the-operation-answers — neither
    in this task's implements list.
- what: The backend's own read-openapi-document-operations operation — its fetch/timeout/parse conduct,
    its HTTP route, method, and exact response/detail shape, including the field name and value it actually
    uses to report a document declaring no version.
  why: REMAINDER per this task's own Notes, belonging to the backend task implementing contracts/integration/openapi-document-operations;
    that task's own Notes confirm no node fixes the HTTP-surface field name for this distinction, so it
    must be reconciled with this hook's `reason`/"no-version-declared" assumption once the backend is
    built.
---

## What it is

A new query-backed hook, useOpenApiDocumentOperations, calls the backend's read-openapi-document-operations route keyed by an operator-named link and exposes a closed outcome of operations, one of the named refusals (including a document declaring no version, told apart from a generic parse/version failure), or an unrecognised failure.

## Notes

The implementation record was rewritten after a red suite: the first version collapsed a document declaring no version into the same outcome as a generic parse failure, which the failure-diagnostician judged a code defect against rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read's own explicit text, not a test error; the fix adds the openapi-document-declares-no-version outcome described above.
