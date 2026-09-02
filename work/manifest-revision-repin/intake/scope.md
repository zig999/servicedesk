# Scope

Add a revision selector to the case draft manifest screen (VersionManifestScreen), so a curator
can repin an already-manifested hypothesis to a different (e.g. newer) revision without removing
and re-adding it.

## Context / problem

The manifest already stores, per position, which hypothesis-revision it points to (domain:
manifest-entry pins one hypothesis-revision; case-version.md: "a hypothesis may be placed at a
position, pointing at any of that hypothesis's own revisions"). The backend already supports
this: `PUT /v1/cases/:slug/versions/:version/manifest/:hypothesisName` accepts
`{ revision, position }` and runs the existing `placeHypothesis` operation. But no UI path lets a
curator choose a different revision for an already-placed hypothesis: `VersionManifestScreen`
only offers move up/down and remove; `useManifestBuilder`'s `placeMutation` is only ever invoked
with the row's current (unchanged) revision, for reordering. Revising a hypothesis
(`HypothesisRevisionScreen`) only creates the new revision
(`POST /v1/cases/:slug/hypotheses`) and sends the curator back to the manifest screen, where
there is still no way to adopt it.

This was found by simulating a case whose manifest pinned hypothesis "push-desabilitado" at
revision 1 while revision 2 already existed — the simulation correctly used the pinned revision 1
(expected domain behavior), but there is no way in the UI to repin it to revision 2.

## Agreed UI proposal to implement

- In `VersionManifestScreen`'s Hypothesis column (currently plain text
  "hypothesisName · rev N"), replace the fixed revision text with a Select (`@tui/ui/select`,
  consistent with its use elsewhere e.g. `hypothesis-revision-form-fields.tsx`) populated with
  that hypothesis's revisions, fetched via the existing
  `GET /v1/cases/:slug/hypotheses/:name/revisions` endpoint/query key
  `["hypothesis-revisions", slug, hypothesisName]` (same one `use-hypothesis-revision-form.ts`
  already uses, so the cache is shared).
- Selecting a different revision calls the existing `placeMutation` in `use-manifest-builder.ts`
  (`PUT /manifest/:hypothesisName`) with the chosen revision and the row's unchanged position —
  no new backend endpoint needed.
- Add a discrete indicator on the pinned revision label whenever a newer revision exists
  (`revision < latest`) — e.g. "rev 1 · nova revisão disponível" — visible before opening the
  dropdown, so a curator is never silently stuck on a stale pinned revision.
- Reuse existing error/conflict handling already wired for the move actions:
  `case-version-not-draft` -> existing `ConflictBanner`, generic failure -> existing toast
  pattern. `manifest-position-occupied` does not apply since position does not change on a
  revision swap.
- Out of scope: `HypothesisRevisionScreen` / the revise flow itself stays unchanged — creating a
  revision remains separate from adopting it into the manifest, which stays a deliberate curator
  action on the manifest screen.

## Authorization

The human's own words: "sim, leve como está" — in response to being asked whether to take this
UI proposal to `/plan-work`.
