# Scope

Corrective increment: one wrong behavior in code already delivered.

## The wrong behavior

At the endpoint `POST /v1/test-connector`, when a connector's saved configuration carries a
relative `address` (not an absolute URL), the outbound call the test attempts is handled
gracefully — `issueOutcome` (`src/src/http/test-connector.controller.ts`) wraps the call in a
try/catch and returns a structured error outcome. But a second, unrelated call to the same
`connectorRequestUrl()` function — used only to build the "echo" of the request in the test
response (`requestEcho`, `src/src/http/test-connector.controller.ts:140`, calling
`connectorRequestUrl` in `src/src/http-connector/connector-http-issuer.ts:33-39`) — carries no
try/catch. The `TypeError [ERR_INVALID_URL]` thrown by `new URL(request.address)` there escapes
uncaught, reaches Fastify's generic error handler
(`src/src/http/error-handler.middleware.ts`, `handleUnexpectedError`), and the console gets a
opaque `500` with body `{"error":{"code":"INTERNAL_ERROR","message":"an unexpected error
occurred"}}` instead of a comprehensible error about the `address`'s validity.

## Expected behavior

The same exception, when it happens while building the response's echoed request, should be
reported to the user the same way the outbound call's own failure already is — a comprehensible
error naming the problem with the `address`, never a generic `INTERNAL_ERROR` 500.

## Reproduction

Live, at `http://localhost:5199/connectors/ifs-failed-transaction-queue-connector` (Case
Authoring Console):

1. A connector configuration is saved with a relative `address`, e.g.
   `"/v1/technicians/${subject:user-id}/sync-status"`.
2. The capability `ifs-failed-transaction-queue-reader (1.0.0)` is selected in the Test panel,
   subject type `technician`, attribute `user-id` filled, a requester filled.
3. Clicking `TEST` sends `POST /v1/test-connector`.
4. The response is `500` with body `{"error":{"code":"INTERNAL_ERROR","message":"an unexpected
   error occurred"}}`.

Confirmed via Chrome DevTools network capture in the same session: requests to
`/v1/test-connector` returned `500` twice (with the relative `address` saved), then `200` twice
after the `address` was corrected to an absolute URL
(`http://127.0.0.1:8787/v1/technicians/${subject:user-id}/sync-status`) — which is the
operational workaround already applied to this one live connector, and is not itself what this
correction is about. This correction is about the endpoint's unhandled-exception behavior when
an `address` is not a valid absolute URL, however that configuration comes to be saved.

## File

`src/src/http/test-connector.controller.ts`
