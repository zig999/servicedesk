# Corrective increment: connector network failure must not abort the whole simulation

## Observed wrong behavior

When a connector's HTTP call fails due to real unavailability (connection refused, network
failure — distinct from the already-handled timeout), `src/src/http-connector/connector-http-issuer.ts`'s
`issueConnectorHttpCall` rethrows the fetch error uncaught. It has no domain error identity, and
`src/src/errors/status-map.ts` has no entry for it, so it falls through
`error-handler.middleware.ts`'s generic branch: the whole `POST /v1/simulate` request (case-level
and single-hypothesis) fails with an unnamed `500 INTERNAL_ERROR`, including hypotheses that never
depended on the concept whose collection failed.

## Decided correction

This failure joins the causes `rules/integration/an-unresolvable-observation-ends-unavailable`
already resolves: the collection ends `unavailable`, with a result_detail naming a new domain
error (e.g. `ConnectorUnavailableError`), consistent with the existing degrade-never-fault
discipline for collection failures (timeout, capability-not-resolved, connector-configuration-not-registered,
connector-placeholder-not-resolved all already degrade this way). The hypothesis that depended on
that concept is judged `inconclusive` with `reason: no-data`, citing that evidence
(`rules/investigation/an-inconclusive-evaluation-declares-its-reason`); any hypothesis in the same
case that did not depend on that concept is judged normally
(`constraints/hypotheses-are-judged-in-isolated-parallel-calls`). `POST /v1/simulate` keeps
answering 200; no decided (confirmed/refuted) verdict is ever produced without a citation
(`rules/investigation/a-decided-evaluation-cites-evidence`), so no verdict is built over a data
gap.

The human explicitly considered and rejected refusing the whole simulate request outright, after
seeing that this rejects a design already in place for every other collection-failure cause.

## File the behavior lives in

src/src/investigation/http-declarative-observation-source.adapter.ts — its `issueRequest` method
is where every other collection-failure cause (capability not resolved, connector configuration
not registered, malformed configuration, placeholder not resolved) already gets translated into an
`ObservationOutcome`; a network failure from `issueConnectorHttpCall` (in
`src/src/http-connector/connector-http-issuer.ts`, which the trace binds to no node) is the one
cause this file does not yet translate — it lets the rejection propagate uncaught instead.

## Human authorization (verbatim)

"sim, planeje esta tarefa corretiva, pode implementar, revisar e me avisar só após a revisão"
