# Fix a crash opening the Detail panel: evidence's capability reference is read as a nested object that never arrives

## Repro

On `/cases/perfil-mobile-tecnico-probe/versions/2/simulate`, with Subject filled (`user-id=MG.ARNANDO`,
requester `Atendente`), clicking "Simulate" on a single hypothesis row (`limitacao-de-hardware`)
dispatches `POST /v1/simulate/hypothesis`, which returns 200 with a valid body. Immediately after,
the Detail panel opened for that hypothesis crashes the whole screen with:

    Something went wrong!
    Cannot read properties of undefined (reading 'name')

## Root cause

`frontend/app/src/routes/case-simulation-cockpit-adapters.ts`'s `toDetailEvidence()` and
`frontend/app/src/routes/case-simulation-detail-evidence-tab.tsx`'s own render site both read one
evidence item's capability reference as a nested object — `item.capability.name` /
`item.capability.version`. Neither simulate wire response ever carries that shape: both
`src/src/http/dto/simulate-case.dto.ts`'s and `src/src/http/dto/simulate-hypothesis.dto.ts`'s own
`evidenceSchema` send it as two flat fields, `capability_name` and `capability_version` — confirmed
against the real response body captured in the browser during the repro above:

    "capability_name":"perfil-mobile-tecnico-reader","capability_version":"1.0.0"

— no `capability` object at all.

The type this traces to is `frontend/app/src/hooks/use-simulate-case.ts`'s own
`SimulateEvidenceItem`, which declares `capability: { name, version }` nested. Its sibling,
`frontend/app/src/hooks/use-simulate-hypothesis.ts`'s own `SimulateEvidenceItem`, declares the two
fields flat and already documents the discrepancy in its own header comment: "evidence's capability
reference travels as two flat fields, `capability_name` and `capability_version`, never nested
under a `capability` object (unlike the sibling use-simulate-case.ts hook's own nested
`capability: {name, version}` convention)".

Because `apiFetch` casts the JSON body to the declared type without runtime validation, the wrong
nested type never fails until `toDetailEvidence` actually dereferences `item.capability.name` on a
real response — which has no `capability` property — throwing at render time.

## Expected behavior

Opening the Detail panel for any hypothesis evaluation — whether produced by a full-case run
(`POST /v1/simulate`) or a single-hypothesis run (`POST /v1/simulate/hypothesis`) — never crashes,
and the Evidence tab's capability/connector line renders the real capability name, version and
connector for each evidence item, read from the two flat fields the wire actually sends.

## Human authorization

The human asked to run this corrective increment now, after being shown the crash, the captured
network exchange, and the root-cause reading above.
