# Scope (evolution of this initiative)

This epic's `covers` already claims three nodes that the one task written so far
(`isolate-invalid-case-from-listing`) deliberately left `uncovered`, scoped out as "outside this
corrective increment's narrow scope":

- `rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case`
- `rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete`
- `rules/knowledge/a-listed-case-version-offers-a-route-to-its-own-manifest`

This scope closes that gap for the manifest-builder surface and the hypothesis-composition
screens it launches.

## The wrong behavior, confirmed live

Creating a case through the front-end authoring flow legitimately starts a draft's manifest
empty (`a-case-has-at-least-one-hypothesis` is a release-time refusal on `remove-hypothesis`,
not a constraint on a freshly authored draft). `validation-runs-at-every-read` then makes that
draft not read back as a case — correct and expected, not the defect (see this initiative's
original `intake/scope.md`).

But every surface a curator would use to *compose* that manifest — and so correct the state —
fails to load instead of offering the correction:

- The version editor (`frontend/app/src/routes/case-version-editor-screen.tsx`,
  `case-version-editor-*` hooks) shows "Unable to load this version right now." with a plain
  Retry button.
- The manifest builder (`frontend/app/src/hooks/use-manifest-builder.ts`'s `useManifestBuilder`,
  rendered by `frontend/app/src/routes/version-manifest-screen.tsx`) shows "Unable to load this
  manifest right now." with a plain Retry button — `use-manifest-builder.ts`'s
  `versionQuery.isError` branch (around line 162) returns the generic `load-error` phase for
  every `GET /v1/cases/:slug/versions/:version` failure, without inspecting the error code.
- The hypothesis-composition screen ("New Hypothesis" /
  `frontend/app/src/routes/new-hypothesis-screen.tsx`, revise-hypothesis at
  `frontend/app/src/routes/revise-hypothesis-screen.tsx`, both rendering
  `hypothesis-revision-screen.tsx`) depends on the same `case-version` query in
  `frontend/app/src/hooks/use-hypothesis-revision-form.ts`'s `useHypothesisRevisionForm`
  (`versionQuery`, used both to prefill the form and to supply `subject` on submit) and shows
  the same generic "Unable to load this form right now." — with no fallback route to compose the
  very manifest entry that would make the version read back as a case.

Confirmed live against `http://localhost:5199`: creating a case at `/cases/new`, then visiting
`/cases/<slug>/versions/1`, `/cases/<slug>/versions/1/manifest`, and
`/cases/<slug>/versions/1/manifest/hypotheses/new` for the newly created case — all three fail
to load, and there is no route left in the front-end to add the case's first hypothesis. The
network responses are `GET /v1/cases/<slug>/versions/1` → 409, refused as
`CaseVersionNotValidError` naming `"the case declares no hypothesis"`.

## What the specification already decided, which this fails to implement

- `a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case` requires the
  explicit statement in place of the generic failure, for any surface presenting one case by
  slug — the version editor, the manifest builder and the hypothesis-composition screens are all
  such a surface, keyed by the `slug` route param.
- `a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete`
  reserves the generic "read did not complete" wording for a refusal code the surface holds no
  presentation of its own for; `CaseVersionNotValidError` is not such a code once the surface is
  given the presentation the node above requires.
- `a-listed-case-version-offers-a-route-to-its-own-manifest`'s own Description states plainly:
  "composing a manifest stays exactly where `case-version` and `a-case-version-is-written-once`
  already put it — freely while draft state holds, never once released." A draft version's
  manifest must be composable — a hypothesis added, revised, moved or removed — regardless of
  whether that same version currently reads back as a case. The corrective act these surfaces
  exist to offer cannot itself depend on the version already being valid.

None of this is a new or contradicted domain fact — no `/analyse` is needed; all three nodes are
sound as written, already bound in the trace, and already answered once for the cases-list
surface by this epic's first task.

## Out of scope

- The write-side (`PUT`/`DELETE .../manifest/...`, `POST .../hypotheses`) already refuses
  correctly by named error (`case-version-not-draft`, `manifest-position-occupied`,
  `manifest-would-hold-no-hypothesis`) — this scope is about the read that gates loading these
  screens at all, not the mutations they already handle.
- Retroactive repair of case data already stuck in this state in a live database (e.g. the
  `ifs-sync-status` case named in this epic's original scope) is a data question, not a code one,
  and stays out of both this task and the epic's original one.
