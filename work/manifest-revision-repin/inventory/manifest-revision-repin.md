---
title: Manifest revision repin — existing hooks, screen and select component
summary: The manifest screen, its builder hook, the hypothesis-revisions query and
  the reusable Select component the repin control must build on.
sources:
- intake/scope.md
area:
- frontend/app/src/hooks/use-manifest-builder.ts
- frontend/app/src/routes/version-manifest-screen.tsx
- frontend/app/src/hooks/use-hypothesis-revision-form.ts
- frontend/app/src/routes/hypothesis-revision-form-fields.tsx
- frontend/tui/frontend/src/shared/components/ui/select
modules:
- name: use-manifest-builder
  path: frontend/app/src/hooks/use-manifest-builder.ts
  role: touched
- name: version-manifest-screen
  path: frontend/app/src/routes/version-manifest-screen.tsx
  role: touched
- name: use-hypothesis-revision-form
  path: frontend/app/src/hooks/use-hypothesis-revision-form.ts
  role: depends-on
- name: hypothesis-revision-form-fields
  path: frontend/app/src/routes/hypothesis-revision-form-fields.tsx
  role: adjacent
- name: tui-select
  path: frontend/tui/frontend/src/shared/components/ui/select/select.tsx
  role: depends-on
- name: use-edit-draft-version-form
  path: frontend/app/src/hooks/use-edit-draft-version-form.ts
  role: depends-on
- name: use-telemetry
  path: frontend/app/src/hooks/use-telemetry.ts
  role: depends-on
conventions:
- statement: placeMutation already PUTs {revision, position} to /v1/cases/:slug/versions/:version/manifest/:hypothesisName
    and its onSuccess telemetry call already carries a hypothesis_revision-shaped
    payload; today every call site passes the row's own unchanged revision.
  seen_at: frontend/app/src/hooks/use-manifest-builder.ts:75-96,157-163
- statement: Mutation error handling reads a typed kind via errorStateKind(error)
    imported from use-edit-draft-version-form and branches on 'case-version-not-draft'
    (sets isBlocked, surfaced by ConflictBanner) vs a generic toast.error(GENERIC_FAILURE_MESSAGE);
    'manifest-position-occupied' is handled only for placeMutation.
  seen_at: frontend/app/src/hooks/use-manifest-builder.ts:97-111
- statement: 'A hypothesis''s revision list is fetched with useQuery({queryKey: [''hypothesis-revisions'',
    slug, hypothesisName], queryFn: () => apiFetch<HypothesisRevisionsPage>(`/v1/cases/${slug}/hypotheses/${hypothesisName}/revisions`)});
    the query is only enabled when hypothesisName is non-null.'
  seen_at: frontend/app/src/hooks/use-hypothesis-revision-form.ts:89-96
- statement: 'The revisions endpoint returns {data: [{revision, criterion, collects,
    resolution}, ...]}; ''latest'' is derived client-side by reducing to the max revision
    (no server-side latest field).'
  seen_at: frontend/app/src/hooks/use-hypothesis-revision-form.ts:23-32,64-71
- statement: '@tui/ui/select''s Select is a controlled component: value: string |
    null, onChange: (value: string) => void, options: SelectOption[] ({value, label,
    disabled?}); it renders its own placeholder for a null value and needs no wrapping
    FormField/Label to be usable standalone.'
  seen_at: frontend/tui/frontend/src/shared/components/ui/select/select.types.ts:3-16
- statement: Every existing Select usage in this codebase is wired through react-hook-form's
    Controller (field.value/field.onChange/field.onBlur), never used as a bare controlled
    component reading external state directly.
  seen_at: frontend/app/src/routes/hypothesis-revision-form-fields.tsx:162-234
- statement: VersionManifestScreen renders StatusTable rows built by a pure toStatusRow(row,
    disabled) mapper; the Hypothesis cell is currently the literal string `${row.hypothesisName}
    · rev ${row.revision}` with no JSX, and the disabled flag (state.isBlocked ||
    state.isBusy) is threaded into RowActions the same way it would need to reach
    a new Select.
  seen_at: frontend/app/src/routes/version-manifest-screen.tsx:101-108,131-132
- statement: Per-row inline errors are tracked in useManifestBuilder as a single {hypothesisName,
    message} state slot compared against each row's own hypothesisName (moveError/moveErrorMessage),
    not per-row state — one row's action clears/overwrites the shared slot.
  seen_at: frontend/app/src/hooks/use-manifest-builder.ts:60-63,106,161,172
must_not_duplicate:
- what: The revisions-for-a-hypothesis fetch, its query key ['hypothesis-revisions',
    slug, hypothesisName] and its HypothesisRevisionsPage/HypothesisRevisionListItem
    shape
  at: frontend/app/src/hooks/use-hypothesis-revision-form.ts:23-32,89-96
- what: The placeMutation PUT call, its variables shape {hypothesisName, revision,
    position}, and its onSuccess telemetry + invalidateManifest / onError case-version-not-draft+generic-toast
    handling
  at: frontend/app/src/hooks/use-manifest-builder.ts:75-111
- what: The @tui/ui/select controlled Select component and its SelectOption/SelectProps
    contract
  at: frontend/tui/frontend/src/shared/components/ui/select/select.tsx and select.types.ts
- what: The 'latest revision' reduction over a revisions list
  at: frontend/app/src/hooks/use-hypothesis-revision-form.ts:64-71 (latestRevisionOf)
risks:
- risk: Populating the new revision-select from the shared ['hypothesis-revisions',
    slug, hypothesisName] query key means an invalidation triggered from the manifest
    screen's own revision swap (or a stale cache) can also affect HypothesisRevisionScreen's
    form defaults, since both consumers key off the same cache entry.
  consumers:
  - frontend/app/src/hooks/use-hypothesis-revision-form.ts
  - frontend/app/src/routes/version-manifest-screen.tsx
- risk: 'placeMutation''s shared moveError/isBlocked state is keyed only by hypothesisName
    and reused for move-up/move-down/remove-adjacent flows; wiring the new revision-select
    through the same placeMutation without a distinct error/telemetry path risks presenting
    a revision-swap failure as a ''move'' error to the curator, or conflating its
    telemetry with reorder telemetry (moved: true is currently hardcoded in onSuccess).'
  consumers:
  - frontend/app/src/hooks/use-manifest-builder.ts
  - frontend/app/src/routes/version-manifest-screen.tsx
---

## What it is
The area surveyed is the hook that already wraps the manifest PUT/DELETE mutations, the screen that renders the manifest table, the hook and query key already fetching a hypothesis's revisions elsewhere, and the reusable Select component with one existing consumer.
`useManifestBuilder`'s `placeMutation` already sends `{revision, position}` to the exact endpoint the scope names, called today only with each row's own unchanged revision for reordering.
`useHypothesisRevisionForm` already queries `["hypothesis-revisions", slug, hypothesisName]`, returning `{data: [{revision, criterion, collects, resolution}]}`, and already derives "latest revision" client-side.
`VersionManifestScreen` renders the Hypothesis column as a plain string built by `toStatusRow`, with no revision control, and threads a single `disabled` flag into row actions.
`@tui/ui/select` is a controlled `{value, onChange, options}` component with no built-in form binding; its one example usage in `hypothesis-revision-form-fields.tsx` wires it through react-hook-form's `Controller` rather than as a bare controlled component.

## Notes
The revisions query key is shared across two hooks in two different screens, so any cache write from the new control is visible to the hypothesis-revision form too.
`useManifestBuilder`'s error and telemetry handling is shaped for move/remove, not distinctly for a revision swap, and reusing it as-is blurs the two.
No existing code already computes "is a newer revision available than the pinned one" — the indicator described in the scope has no current implementation to reuse; the `latestRevisionOf` reduction in `use-hypothesis-revision-form.ts` is the one existing helper for finding the latest revision and should not be reimplemented.
