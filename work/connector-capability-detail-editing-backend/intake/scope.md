# Scope — connector-capability-detail-editing (backend)

Backend-target half of a paired initiative (frontend counterpart:
`connector-capability-detail-editing-frontend`). Requested by the human running the delivered
system, evaluated by the assistant against the source before this scope was written.

## 1. Corrective bug — connector configuration read answers the wrong wire type

`GET /v1/connectors/{connector}` (`src/http/read-connector-configuration.dto.ts`'s
`readConnectorConfigurationResponseSchema`) answers `configuration` as a parsed JSON object
(`z.record(z.string(), z.unknown())`), while `domain/integration/connector-configuration`
declares `configuration` as `type: string`, and the write side
(`src/http/dto/register-connector.dto.ts`) already carries it as a JSON string consistent with
that domain type.

This mismatch is why the frontend's Configuration textarea shows "[object Object]" instead of
the JSON text when editing an existing connector configuration (diagnosed against the frontend
target, but the fix belongs here).

The prior delivery record
(`delivery/capability-connector-authoring-backend/implementation/connector-configuration-authoring/read-connector-configuration-route.md`)
claims this response schema carries the domain type's attributes "under the same names ...
already uses" without disclosing the string-to-object divergence — this is a specification
conformance defect in already-delivered code, not a new domain fact.

**Required fix:** the read response must answer `configuration` as the JSON string the domain
model declares, matching the write side and `list-connector-configurations`'s own response
(if that route has the same divergence, it needs the identical fix).

## 2. Corrective bug (diagnosis required) — a capability holds a malformed input_schema

The capability registered under name "perfil-mobile-tecnico-reader" currently holds an
`input_schema` value that is not syntactically valid JSON (free text), violating
`rules/integration/a-capability-declares-well-formed-schemas`.

`src/capability-registry/capability-registry.service.ts`'s `refuseMalformedSchemas` already
runs `JSON.parse` on both schema attributes at every `register-capability` call and would
reject this value were it submitted today. This capability is not present in the seed fixtures
(`src/fixtures/capability/capability.json`).

**Required work:** diagnose how this record came to exist in the running system's store
despite that guard — a bypass of `register-capability`, data predating the guard, a gap in how
the store persists/validates on write, or something else — and correct it. Confirm whether any
additional guard or backfill is needed so persisted data can never diverge from this rule
again.

## 3. New backend read operation — resolve a capability by its own identity

The backend currently publishes `read-capability` only by concept (`GET
/v1/capabilities/:concept`, `contracts/integration/capability-registry`) — there is no read by
the capability's own identity, `(name, version)` (`domain/integration/capability`).

The frontend counterpart initiative needs a dedicated detail/edit screen addressed by
`(name, version)` (a name is not guaranteed unique across versions) that must load directly on
first navigation or page refresh, without depending on `list-capabilities` having already been
fetched into cache.

**Required work:** add a new backend read route resolving a capability by `(name, version)`,
mirroring `read-connector-configuration`'s own shape (path params, response DTO, controller,
wiring into `build-app`). This is additive to the published contract — a new operation
alongside `read-capability`, `list-capabilities`, `register-capability` — not a change to any
existing operation's behavior. Whether and how this is recorded against
`contracts/integration/capability-registry` is for the plan's own judgment (the specification
does not currently state this operation).

## Notes

- Frontend target: `frontend/app` (paired initiative, not this one).
- Backend target: `src`.
- Existing conventions to follow for anything new here: the header comments on
  `read-connector-configuration.routes.ts`, `.controller.ts` and `.dto.ts` document the
  established shape for a read-by-identity route in this codebase.
