---
title: Manifest builder area for placing an existing hypothesis
summary: The manifest builder screen and hook, the case-hypotheses/hypothesis-revisions reads, and
  the backend place-hypothesis contract, surveyed to add placing an already-composed hypothesis.
sources:
- work/case-not-valid-surface-presentation-corrective/intake/scope-manifest-builder-places-an-existing-hypothesis.md
area:
- src/routes/version-manifest-screen.tsx
- src/hooks/use-manifest-builder.ts
- src/hooks/use-manifest-row-revisions.ts
- src/routes/hypothesis-revision-screen.tsx
- src/hooks/use-hypothesis-revision-form.ts
- src/routes/case-hypotheses-tab.tsx
- src/hooks/use-case-hypotheses.ts
- src/hooks/use-hypothesis-revisions.ts
modules:
- name: version-manifest-screen
  path: src/routes/version-manifest-screen.tsx
  role: touched
- name: use-manifest-builder
  path: src/hooks/use-manifest-builder.ts
  role: touched
- name: use-case-hypotheses
  path: src/hooks/use-case-hypotheses.ts
  role: depends-on
- name: use-hypothesis-revisions
  path: src/hooks/use-hypothesis-revisions.ts
  role: depends-on
- name: case-hypotheses-tab
  path: src/routes/case-hypotheses-tab.tsx
  role: adjacent
- name: hypothesis-revision-screen
  path: src/routes/hypothesis-revision-screen.tsx
  role: adjacent
- name: use-hypothesis-revision-form
  path: src/hooks/use-hypothesis-revision-form.ts
  role: adjacent
conventions:
- statement: 'Selecting among a small list of named items uses the shared @tui/ui/select <Select> component,
    taking value, onChange, options: SelectOption[], disabled, placeholder.'
  seen_at: src/routes/version-manifest-screen.tsx (the revision picker), reused across a dozen other route
    files
- statement: A manifest-builder mutation reports state-specific failures (blocked-by-release, position-occupied)
    by inspecting errorStateKind(error) and setting row-scoped error state keyed by hypothesis name, falling
    back to a generic toast.
  seen_at: src/hooks/use-manifest-builder.ts, placeMutation.onError
- statement: A successful manifest mutation calls a dedicated telemetry event, then invalidates the [case-version,
    slug, version] query to refresh the manifest.
  seen_at: src/hooks/use-manifest-builder.ts, placeMutation.onSuccess
- statement: 'place-hypothesis''s wire body is exactly { revision: number, position: number }, both mandatory
    even for a first-time placement; the hypothesis name is a URL segment.'
  seen_at: src/http/dto/place-hypothesis.dto.ts and src/http/place-hypothesis.controller.ts (backend),
    already matched by use-manifest-builder.ts's existing placeMutation body shape
- statement: 'Listing a case''s own hypotheses (GET /v1/cases/{slug}/hypotheses, returning { data: { name
    }[] }) combined per-name with hypothesisRevisionsQueryOptions to find each hypothesis''s latest revision
    is an established pattern.'
  seen_at: src/hooks/use-case-hypotheses.ts + src/hooks/use-hypothesis-revisions.ts, already assembled
    in src/hooks/use-manifest-row-revisions.ts and src/routes/case-hypotheses-tab.tsx
must_not_duplicate:
- what: The PUT /v1/cases/{slug}/versions/{version}/manifest/{hypothesisName} call with { revision, position
    } body.
  at: src/hooks/use-manifest-builder.ts, placeMutation
- what: The pattern of fetching a case's hypothesis identities then, per name, fetching that hypothesis's
    revisions to find the latest one.
  at: src/hooks/use-case-hypotheses.ts + src/hooks/use-hypothesis-revisions.ts + use-hypothesis-revision-form.ts's
    latestRevisionOf, already assembled once in src/hooks/use-manifest-row-revisions.ts and again in src/routes/case-hypotheses-tab.tsx
- what: The shared <Select> combobox component for choosing among named options.
  at: '@tui/ui/select, consumed in src/routes/version-manifest-screen.tsx'
risks:
- risk: A new placeMutation call kind for placing an existing hypothesis needs its own onError branch
    (position-occupied, hypothesis-already-manifested) or a manifest-position-occupied response would
    silently miss the row-scoped message the existing move/repin kinds already get.
  consumers:
  - src/hooks/use-manifest-builder.ts placeMutation.onError
- risk: useCaseHypotheses returns every hypothesis of the case regardless of whether it is already in
    this version's manifest; the new control's option list must be filtered against the manifest's current
    rows or it could offer placing an already-placed hypothesis.
  consumers:
  - src/routes/version-manifest-screen.tsx
  - src/hooks/use-manifest-builder.ts (state.rows)
- risk: use-hypothesis-revision-form.ts's post-compose "Open Manifest Builder" affordance assumes the
    curator will separately place the hypothesis; nothing today pre-selects the just-composed hypothesis
    when landing back on the manifest builder.
  consumers:
  - src/routes/hypothesis-revision-screen.tsx
  - src/hooks/use-hypothesis-revision-form.ts
---

## What it is
The frontend surface and supporting hooks for the manifest builder, the hypothesis-composition screen, the case-detail hypotheses tab, and the case-lifecycle backend contract for place-hypothesis, surveyed to add a control that places an already-composed hypothesis into a draft version's manifest.

## Notes
None.
