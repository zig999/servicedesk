# Scope

Corrective increment.

## The wrong behavior

Case-keyed surfaces (the cases list, the version manifest builder) that meet a
`CaseVersionNotValidError` refusal on their read treat it as an undifferentiated, generic load
failure ("Cases could not be loaded." / "Unable to load this manifest right now.", each with a
plain Retry button) instead of the distinct presentation the specification already decided for
this named refusal.

On the cases list, one case whose current version fails validation crashes the fetch for every
case in the list (`use-cases-list.ts`'s `fetchCasesWithSummaries` runs `Promise.all` over
per-case detail fetches with no isolation), so a single invalid case takes the whole `/cases`
screen down.

On the manifest builder, the same undifferentiated failure additionally means the curator is
never offered the route to correct the version.

Confirmed live: `http://localhost:5199/cases` and
`http://localhost:5199/cases/ifs-sync-status/versions/1/manifest`, both broken this way for the
case "ifs-sync-status" version 1 — created via the case-authoring flow, which legitimately
starts a draft's manifest empty; `validation-runs-at-every-read` then makes that draft not read
back as a case, which is itself correct and expected, not the defect.

## What the specification already decided, which this fails to implement

No `/analyse` was needed for this — none of the following is a new or contradicted domain
fact; all three nodes are sound as written and already bound in the trace to the files this
touches.

- `rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case`:
  a surface presenting one case by slug must state explicitly, when the case's current version
  fails a validator rule at that reading, that the current version does not read back as a case
  right now — never presenting a generic failure, and never conflating this with "case holds no
  version" or "the read did not complete." No attribute of the invalid version is presented as
  its content.
- `rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete`:
  the generic "read did not complete, try again" presentation is reserved for a refusal code the
  surface holds no presentation of its own for. `CaseVersionNotValidError` is a refusal the
  surface does hold a presentation for (the rule above), so it must never fall into that generic
  bucket.
- `rules/knowledge/a-listed-case-version-offers-a-route-to-its-own-manifest`: a curator reading
  a listing of a case's versions is offered a route to a version's own manifest for every
  version presented, regardless of that version's state, turning on nothing else — so this
  route must still be offered/reachable even when the version does not currently read back as a
  case.

## Evidence gathered against the current implementation

- `frontend/app/src/services/error-ui-state.ts` already maps `CaseVersionNotValidError` to a
  distinct `UiErrorStateKind` of `"case-not-valid"` (line 60) — the distinguishing information
  already exists at the API-error-mapping layer.
- `frontend/app/src/hooks/use-cases-list.ts`: `fetchCaseSummary`/`fetchCasesWithSummaries` call
  `apiFetch` directly with no error mapping, and `Promise.all` over all cases' summaries means
  one case's `CaseVersionNotValidError` rejects the whole list query.
- `frontend/app/src/routes/cases-list-screen.tsx` (lines ~85-94): `casesQuery.isError` renders
  only "Cases could not be loaded." + Retry, with no distinction for `case-not-valid` and no
  per-row degradation.
- `frontend/app/src/hooks/use-manifest-builder.ts`: imports and uses `errorStateKind` for
  mutation errors (place/remove) but never applies it to `versionQuery`'s own error path (lines
  162-164, `versionQuery.isError` → generic `load-error` phase, no `errorStateKind` call at all
  for this query).
- `frontend/app/src/routes/version-manifest-screen.tsx` (lines ~247-256): `state.phase ===
  "load-error"` renders only "Unable to load this manifest right now." + Retry.
- `trace.py --encodes frontend/app src/routes/cases-list-screen.tsx
  src/routes/version-manifest-screen.tsx src/hooks/use-manifest-builder.ts` confirms all three
  files are already bound to specification nodes; `use-cases-list.ts` has zero bindings (a plain
  data hook, not itself a claim surface) and is not named as a seed file, though the fix touches
  it.

## Scope, deliberately narrow

This increment does not change `validation-runs-at-every-read`, does not change how or when a
case's first hypothesis gets placed (`place-hypothesis` stays the curator's own explicit act),
and does not add any new backend read path. It is purely:

1. Recognize `CaseVersionNotValidError`/the `case-not-valid` ui-error-state distinctly at both
   surfaces instead of falling into the generic load-error bucket.
2. Isolate one case's invalid-version failure from the rest of the cases list so other cases
   still render.
3. Ensure the route to a version's own manifest stays reachable/offered even when that version
   currently fails validation, consistent with `a-listed-case-version-offers-a-route-to-its-own-manifest`.
