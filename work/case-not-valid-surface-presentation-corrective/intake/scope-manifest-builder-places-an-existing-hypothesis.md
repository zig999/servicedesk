# Scope: the manifest builder offers placing an already-composed hypothesis, not only composing a new one

## Behavior observed

Composing a hypothesis for a case (via the manifest builder's "+ Add hypothesis" link, which opens
the New Hypothesis screen) creates the hypothesis and its first revision (`revise-hypothesis`), and
on success offers a route back to the same draft version's own manifest — but never itself places
the hypothesis into that manifest (`place-hypothesis`).

Returning to the manifest builder after composing, the curator has no way to place that
just-composed hypothesis into the manifest: the manifest builder's own "+ Add hypothesis" link only
ever opens the New Hypothesis screen again, to compose another new hypothesis identity. There is no
control anywhere in the frontend that lets a curator select an already-composed hypothesis of the
case that is not yet in this version's manifest, and place it there.

## Reproduction

1. Create a case, save a draft version with an empty manifest.
2. From the manifest builder, click "+ Add hypothesis", compose a new hypothesis, save it.
3. Land back on (or navigate to) the same draft version's manifest builder.
4. Observe: the manifest still declares no hypothesis (the version still fails validation for
   "the case declares no hypothesis"), and there is no control to place the hypothesis just
   composed in step 2 into this manifest. The only available act is "+ Add hypothesis", which
   composes yet another new hypothesis rather than placing the existing one.

This was flagged as a deferred, out-of-scope gap by three earlier tasks in this same initiative
(`hypothesis-composition-opens-for-a-version-that-does-not-read-back`,
`manifest-builder-composes-a-version-that-does-not-read-back`, and confirmed live against case
`ifs-sync-status` on 2026-09-21) and is not itself a defect in any of those tasks' own delivered
behavior — the gap is that no task has ever built the placing-an-existing-hypothesis surface at
all.

## Candidate files (frontend/app/src, not exhaustive — for the survey to confirm or widen)

- src/routes/version-manifest-screen.tsx (the manifest builder screen; the "+ Add hypothesis" link)
- src/hooks/use-manifest-builder.ts (the manifest builder's own state/mutations, including the
  existing `placeMutation`)
- src/hooks/use-cases-list.ts or a case-scoped hypotheses-listing hook (for listing the case's own
  hypotheses not yet in this version's manifest)
