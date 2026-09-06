Corrective increment. One wrong behavior observed by running the delivered system, at
frontend/app (target: frontend).

Reproduction: create a new draft version for a case (POST /v1/cases succeeds), then navigate to
that draft's Manifest screen (/cases/$slug/versions/$version/manifest) before any edit/save
happens on the draft's own editor screen. The screen crashes to the app's error boundary with
"manifest is not iterable".

Root cause traced in session: `useNewDraftVersionForm`'s `onSuccess`
(frontend/app/src/hooks/use-new-draft-version-form.ts) builds a `CaseVersionRecord` seed
containing only the submitted form fields (title, when_to_use, subject, fallback,
consolidation_register) — no `manifest`, no `state` — and passes it as `seedRecord` into
`useEditDraftVersionForm(slug, created.version, created.record)`. There
(frontend/app/src/hooks/use-edit-draft-version-form.ts, the `versionQuery` around line 99-107),
this seed becomes the query's `initialData` for cache key `["case-version", slug, version]`, and
the query is deliberately `enabled: version !== null && seedRecord === undefined` — i.e. disabled
whenever a seed is present, so the real record (which does carry `manifest`) is never fetched by
that screen.

`useManifestBuilder` (frontend/app/src/hooks/use-manifest-builder.ts) runs a second, independent
`useQuery` observer against the exact same cache key `["case-version", slug, version]`, with no
`enabled` guard and no `initialData`, expecting `manifest` to be a required, always-present array
(its local `ManifestVersionRecord` type declares `manifest: readonly ManifestEntryDto[]` as
required, unlike `CaseVersionRecord`'s optional `manifest?:`). React Query serves this second
observer the same shared cache entry seeded by the first, incomplete write. On the very first
synchronous render, `sortByPosition` in use-manifest-builder.ts spreads
`[...versionQuery.data.manifest]` where `manifest` is `undefined`, throwing `TypeError: manifest
is not iterable` and crashing the render tree — before the background refetch (if any) can
resolve.

Confirmed during the session: the backend and database are correct — `GET
/v1/cases/{slug}/versions/{version}` for the freshly created draft already returns a well-formed
`manifest` array copied from the source version. This is purely a frontend cache-seeding defect:
two hooks share one React Query cache key with two different, incompatible expectations about
`manifest`'s presence, and the seed writer has no way to declare an authoritative shape that
satisfies both.

The file the wrong behavior lives in: frontend/app/src/hooks/use-edit-draft-version-form.ts —
this is the file that decides what a consumer of cache key ["case-version", slug, version] sees
(the `enabled`/`initialData` wiring), and is the one held to the trace's --encodes for the
epic's covers.

Scope for the corrective task: make the draft's initial React Query cache entry for
`["case-version", slug, version]` never appear "loaded" to any consumer (including
`useManifestBuilder`) without a `manifest` value drawn from the actual created/source record, OR
ensure a consumer requiring `manifest` always triggers a real fetch rather than trusting a
partial seed — whichever fix keeps `useEditDraftVersionForm`'s existing "avoid a redundant fetch
right after create" intent while never leaving `manifest`/`state` unresolved for any other reader
of that same cache key. No specification node governs this — it is purely an
implementation/cache-correctness defect in already-delivered frontend code, not a domain fact.
