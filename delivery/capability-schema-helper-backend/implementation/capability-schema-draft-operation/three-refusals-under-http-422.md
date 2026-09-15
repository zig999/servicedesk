---
target: backend
title: Link disclosure for the capability schema draft's HTTP 422 refusals
summary: Verifies the three OpenAPI refusal conditions for draft-capability-schema-from-openapi already ride the shared status-map/error-handler machinery under HTTP 422, and adds the one missing disclosure this operation's own rule requires -- the operator-named link beside an OpenApiDocumentNotReadableError refusal -- without touching the shared reader, the shared error class, or either sibling operation.
task: sha256:e1fa94236aa7e376c59ded8b49de786d2c02f0bcf3d7782066499c23abf6864b
files:
- path: src/connector-registry/capability-schema-draft-generation.ts
  effect: 'generateCapabilitySchemaDraft now calls a new private readOperationDisclosingLink(location, link) in place of a bare readOpenApiOperation(...) call. It still calls readOpenApiOperation(location.documentText, location.path, location.method) unchanged; on an OpenApiDocumentNotReadableError it rethrows readableErrorDisclosingLink(error, link), which constructs a new OpenApiDocumentNotReadableError whose context is { ...error.context, link } (the same kind-specific reason fields plus the request''s own link, with { cause: error } preserving the original as the cause chain) and lets every other thrown error (OpenApiDocumentNotFetchedError, OpenApiOperationNotFoundError, anything else) pass through untouched. No other file changed.'
criteria:
- criterion: a network failure reaching the named link is answered with HTTP 422 reporting an OpenApiDocumentNotFetchedError.
  met: true
  how: 'unaffected by this task''s edit -- OpenApiDocumentFetcher.issuedResponse''s catch throws OpenApiDocumentNotFetchedError(link, { kind:''network-failure'' }, { cause: error }) on a non-abort rejection, propagates uncaught through generateCapabilitySchemaDraft''s unguarded await and the route''s unguarded await, and is mapped to 422 by status-map.ts''s STATUS_BY_ERROR_CLASS via Fastify''s app-level handleUnexpectedError.'
- criterion: a response outside the 2xx range from the named link is answered with HTTP 422 reporting an OpenApiDocumentNotFetchedError.
  met: true
  how: 'unaffected -- fetchOpenApiDocument throws OpenApiDocumentNotFetchedError(link, { kind:''status-outside-2xx'', status: response.status }) when !response.ok, same 422 mapping and propagation path as above.'
- criterion: the fetch is abandoned as a timeout where the named link has not answered within 60000 milliseconds of that fetch beginning, and that abandonment is answered with HTTP 422 reporting an OpenApiDocumentNotFetchedError.
  met: true
  how: 'unaffected -- issuedResponse''s setTimeout(() => controller.abort(), OPENAPI_DOCUMENT_FETCH_TIMEOUT_MS) with OPENAPI_DOCUMENT_FETCH_TIMEOUT_MS = 60_000 aborts the in-flight fetch; outcomeForRejection reports { kind: ''timeout'' } when the signal is aborted, thrown as the same error class, mapped the same way.'
- criterion: no parsing is attempted on a link that could not be fetched.
  met: true
  how: unaffected -- generateCapabilitySchemaDraft awaits documentFetcher.fetchOpenApiDocument(link) before calling readOperationDisclosingLink; a thrown fetch error exits the async function before readOpenApiOperation (and therefore readOpenApiDocument's parse) is ever called.
- criterion: a fetched document that does not parse in either of the two serializations OpenAPI 3.x defines is answered with HTTP 422 reporting an OpenApiDocumentNotReadableError.
  met: true
  how: 'unaffected in kind -- readOpenApiDocument''s parsedAsJsonOrYaml/parsedAsYaml throws OpenApiDocumentNotReadableError({ kind: ''unparseable'', detail }) for text that is neither valid JSON nor valid YAML (or parses to something other than a plain object); readOperationDisclosingLink now catches this and rethrows it carrying the link, still mapped to 422 by the same shared status-map.'
- criterion: a fetched document whose declared version is not OpenAPI 3.x is answered with HTTP 422 reporting an OpenApiDocumentNotReadableError.
  met: true
  how: 'unaffected in kind -- refuseUnsupportedVersion throws OpenApiDocumentNotReadableError({ kind: ''unsupported-version'', declaredVersion }) whenever document.openapi or document.swagger is a string not starting with ''3.''; caught and re-disclosed with the link the same way.'
- criterion: a fetched document declaring no version at all is answered with HTTP 422 reporting an OpenApiDocumentNotReadableError.
  met: true
  how: 'unaffected in kind -- refuseUnsupportedVersion throws OpenApiDocumentNotReadableError({ kind: ''no-version-declared'' }) when neither openapi nor swagger is a string; caught and re-disclosed with the link the same way.'
- criterion: a fetched document that parses and declares OpenAPI 3.x but declares no operation at the path and method the request names is answered with HTTP 422 reporting an OpenApiOperationNotFoundError.
  met: true
  how: unaffected -- operationEntry throws OpenApiOperationNotFoundError(path, method) once parsing and the version check both succeed and the resolved path item has no entry at method.toLowerCase(); readOperationDisclosingLink's catch only intercepts OpenApiDocumentNotReadableError, so this class rethrows unchanged and is mapped to 422 the same way.
- criterion: that OpenApiOperationNotFoundError names the path and the method the request named.
  met: true
  how: unaffected -- the DTO passes path/method straight through (draftCapabilitySchemaFromOpenApiRequestSchema requires non-empty strings, no transform), generateCapabilitySchemaDraft forwards them unchanged into readOperationDisclosingLink's location object, and operationEntry throws OpenApiOperationNotFoundError(path, method) with those exact values as its context.
- criterion: the fetch refusal and the readability refusal are answered under the same HTTP status.
  met: true
  how: unaffected -- status-map.ts's STATUS_BY_ERROR_CLASS maps both OpenApiDocumentNotFetchedError and OpenApiDocumentNotReadableError to 422; this task's edit constructs a new instance of the same OpenApiDocumentNotReadableError class, so it is still resolved by the same instanceof entry.
- criterion: the fetch refusal and the readability refusal never report one and the same error value.
  met: true
  how: 'unaffected -- error-handler.middleware.ts''s domainEnvelope reports code: error.name, and the two classes set distinct name values (''OpenApiDocumentNotFetchedError'' vs ''OpenApiDocumentNotReadableError'') in their own constructors, which this task''s edit does not touch.'
- criterion: neither the fetch refusal nor the readability refusal is ever reported as the other.
  met: true
  how: unaffected -- the two error classes are never instances of one another (pinned by openapi-operation-reader.spec.ts), and this task's edit only ever constructs a new OpenApiDocumentNotReadableError from an existing OpenApiDocumentNotReadableError caught by an instanceof OpenApiDocumentNotReadableError guard, never crossing into the other class.
- criterion: neither the fetch refusal nor the readability refusal is ever answered as a refusal carrying no named condition.
  met: true
  how: unaffected -- both error classes always carry a context property (readableErrorDisclosingLink's rethrown instance included), so error-handler.middleware.ts's hasContext check always routes them through domainEnvelope's { code, message, details } shape rather than the codeless generic 500 fallback.
- criterion: the OpenApiDocumentNotFetchedError refusal discloses, beside that error value, which of the three fetch failures occurred, and, where it named status-outside-2xx, the status the link answered, together with the link the request named, exactly as it named it.
  met: true
  how: unaffected -- OpenApiDocumentNotFetchedError's constructor sets this.context = { link, ...outcome }, where outcome is exactly one of { kind:'network-failure' }, { kind:'timeout' } or { kind:'status-outside-2xx', status }; nothing else is ever added to that context, and this task touches neither this class nor its call sites.
- criterion: the OpenApiDocumentNotReadableError refusal discloses, beside that error value, the link the request named, exactly as it named it.
  met: true
  how: this is the one criterion this task's edit closes. Previously OpenApiDocumentNotReadableError's context only ever held its kind-specific reason fields (no link, since readOpenApiDocument/readOpenApiOperation never receive one). readOperationDisclosingLink now catches this error and rethrows readableErrorDisclosingLink(error, link), whose context is { ...error.context, link } -- the same kind (plus detail, or declaredVersion, or nothing more, depending on which reason fired) with exactly the request's own link string added, nothing else.
- criterion: no refusal answer carries an input_schema.
  met: true
  how: unaffected -- every 422/500 refusal is built by error-handler.middleware.ts's domainEnvelope or the fixed 500 literal, neither of which ever includes an input_schema key; that key only ever appears on the 200 success path's reply.code(200).send(draft), a branch never reached once an error is thrown.
- criterion: no refusal answer carries an output_schema.
  met: true
  how: same reasoning as above -- output_schema is only ever present on the 200 success-path draft object, never on any error envelope.
- criterion: no refusal answer carries an unresolved item.
  met: true
  how: same reasoning again -- unresolved is only ever assembled inside generateCapabilitySchemaDraft's own return value after readOperationDisclosingLink, draftedInputSchema and draftedOutputSchema all succeed; a thrown error at any earlier point means that return value, and its unresolved array, is never constructed or sent.
- criterion: an error the status map does not name is answered with HTTP 500 whose error code is INTERNAL_ERROR and whose message is the fixed text "an unexpected error occurred", disclosing neither that error's own message nor any context it carries.
  met: true
  how: 'unaffected -- handleUnexpectedError''s final branch replies reply.code(500).send({ error: { code: ''INTERNAL_ERROR'', message: ''an unexpected error occurred'' } }) whenever statusForError(error) is undefined; the literal carries no reference to the thrown error''s own message or context, and this route reaches that same shared handler exactly like every other route.'
nodes:
- node: contracts/integration/capability-schema-draft
  how: this task's refusals never call register-capability and never persist anything -- generateCapabilitySchemaDraft's error paths return nothing, they only throw -- so the 'a read, never a registration' contract this node states is honored on every refusal path exactly as it already was on the success path; no new fact of this node reached the code.
- node: domain/integration/capability-schema-draft
  how: the value object's three attributes never appear on a refusal answer (criteria above); this is a fact about the error-handling machinery (error-handler.middleware.ts, unmodified) rather than about this value object's own shape, so the node is honored without a new fact of its own reaching this task's edit.
- node: rules/integration/an-unfetchable-openapi-link-refuses-the-schema-draft
  how: fully satisfied by the pre-existing OpenApiDocumentFetcher/status-map wiring this task's Notes call out as already committed; this task's edit does not touch the fetch path at all, so this rule is honored by reuse rather than by anything newly encoded here.
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-schema-draft
  encoded_at:
  - src/connector-registry/capability-schema-draft-generation.ts
  how: the core refusal (OpenApiDocumentNotReadableError under 422 for unparseable, unsupported-version and no-version-declared) is unchanged, reused as-is from openapi-document-reader.ts/openapi-operation-reader.ts; this rule states nothing about disclosure content, so it is satisfied independently of this task's link-disclosure edit.
- node: rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-schema-draft
  how: unaffected by this task's edit -- operationEntry's OpenApiOperationNotFoundError(path, method) throw is untouched, is not intercepted by readOperationDisclosingLink's catch (which only matches OpenApiDocumentNotReadableError), and continues to run only after a successful parse and version check, so no draft is ever produced on this path.
- node: rules/integration/a-schema-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  encoded_at:
  - src/connector-registry/capability-schema-draft-generation.ts
  how: the fetch-refusal half (link + failure kind + status, nothing else of that fetch) was already satisfied by OpenApiDocumentNotFetchedError's existing context; the readable-refusal half (the link, and nothing else of the document) was not -- readOperationDisclosingLink/readableErrorDisclosingLink now closes it by attaching exactly the request's own link to the existing kind-specific reason, with no other addition. Both refusals remain two distinct classes under the same 422 status and neither is ever reported as the other or as a contextless refusal.
- node: constraints/a-domain-error-unmapped-by-status-is-refused-generically
  how: reused unchanged from error-handler.middleware.ts's final branch; this route reaches it the same way every other route does, since neither the controller nor the route wraps the call in a try/catch that would swallow an error before it reaches Fastify's app-level handler.
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  how: unaffected and out of this task's reach -- the fetch still runs only inside documentFetcher.fetchOpenApiDocument, called from this backend's own generateCapabilitySchemaDraft; this task touches no frontend file, matching its own Notes that the frontend half of this constraint is this backend task's REMAINDER.
inferences:
- inferred: the link is attached to the OpenApiDocumentNotReadableError refusal by catching it inside capability-schema-draft-generation.ts and rethrowing a new instance of the same class carrying { ...error.context, link }, rather than by changing the shared OpenApiDocumentNotReadableError class's constructor or its two shared throw sites (openapi-document-reader.ts, openapi-operation-reader.ts).
  from: the sibling rules never require this error's disclosure to carry a link, and the sibling connector-configuration-draft route's own existing tests assert body.error.details toEqual an object with no link field for exactly this error; widening the shared class or its shared throw sites would change behavior those two other operations' own specification and tests do not ask for. The inventory's own must_not_duplicate note also holds openapi-document-reader.ts/openapi-operation-reader.ts's fetch/parse/error-throw machinery as reuse-only, so the addition is scoped to this operation's own composition module instead.
- inferred: 'the rethrown error''s cause is set to the original OpenApiDocumentNotReadableError ({ cause: error }), preserving whatever cause chain the original already carried (e.g. an underlying YAML parse error).'
  from: 'no node states what an error''s internal cause chain should hold; this mirrors the existing pattern already used at openapi-document-reader.ts''s own notReadable(detail, cause) and openapi-document-fetcher.adapter.ts''s own { cause: error } usage, and .cause is never read or serialized by error-handler.middleware.ts''s domainEnvelope, so it reaches no client response.'
preserved:
- the sibling connector-configuration-draft and read-openapi-document-operations routes' own OpenApiDocumentNotReadableError disclosure (no link field), and their existing passing tests asserting an exact details object without one -- left untouched since the edit is scoped to capability-schema-draft-generation.ts alone.
- the shared openapi-document-reader.ts, openapi-operation-reader.ts and openapi-document-fetcher.adapter.ts fetch/parse/error-throw machinery, and the shared status-map.ts/error-handler.middleware.ts 422/500 mapping -- untouched, reused as-is by this route exactly as before.
- this route's existing HTTP 200 success-path behavior (input_schema/output_schema/unresolved derivation) and the six passing draft-capability-schema-from-openapi.routes.spec.ts cases already covering it.
- draft-capability-schema-from-openapi.routes.spec.ts's own source-inspection assertions on capability-schema-draft-generation.ts -- that it still imports exactly { readOpenApiOperation } from './openapi-operation-reader.js' and contains neither 'JSON.parse' nor 'js-yaml'.
---

## What it is

The three refusal conditions of draft-capability-schema-from-openapi, each answered under HTTP 422 via the existing shared status-map/error-handler machinery, and the one operation-specific gap closed: the operator-named link disclosed beside an OpenApiDocumentNotReadableError refusal.

## Notes

Every criterion but one was already satisfied by the pre-existing shared fetch/read/error-handling machinery this operation's own route (delivered by the sibling task) already reuses unmodified; the single gap -- the link disclosure this operation's own rule requires beside OpenApiDocumentNotReadableError -- is closed by a small catch-and-rethrow inside capability-schema-draft-generation.ts alone, leaving the shared error class and its two other throw sites (and both sibling operations' own disclosure and tests) untouched.
