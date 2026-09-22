# Scope: the place-existing-hypothesis control does not appear on the readings where it is needed most

## Behavior observed

The manifest builder's "place an existing hypothesis" control (delivered in this same initiative)
renders only when `useManifestBuilder`'s phase is `"ready"`. On `http://localhost:5199/cases/ifs-sync-status/versions/1/manifest`,
where the version's own manifest read is refused (`CaseVersionNotValidError`, because the manifest
declares no hypothesis), the screen falls to the `"not-valid"` phase and shows only "This case's
current version does not read back as a case." plus "+ Add hypothesis" — the new placing control
does not appear at all.

This is exactly the reading the control is needed on: a draft whose manifest declares no hypothesis
fails validation at every read, so the curator composing a hypothesis and then trying to place it
hits this reading immediately. The already-composed hypothesis `ifs-failed-transactions` exists (it
was composed in an earlier step) but there is no way to place it into this version's manifest,
because the control that would do so never renders on this reading.

## Reproduction

1. Case `ifs-sync-status`, version 1, manifest empty — the version's own read is refused as
   `CaseVersionNotValidError` ("the case declares no hypothesis").
2. Compose a hypothesis for this case (already done: `ifs-failed-transactions`, revision 1).
3. Navigate to `http://localhost:5199/cases/ifs-sync-status/versions/1/manifest`.
4. Observe: the screen shows the not-valid statement and "+ Add hypothesis" only. No control lets
   the curator place `ifs-failed-transactions` into this version's manifest.

## Files

- `frontend/app/src/routes/version-manifest-screen.tsx` — gates `PlaceExistingHypothesisControl` on
  `state.phase === "ready"` only.
- `frontend/app/src/hooks/use-manifest-builder.ts` — `candidatesOf`/`candidateHypotheses` are
  computed only inside the `"ready"` phase branch.
