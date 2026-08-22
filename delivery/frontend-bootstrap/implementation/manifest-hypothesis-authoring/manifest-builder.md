---
title: Manifest Builder screen — reorder and remove over the real manifest endpoints
summary: Replaces VersionManifestPlaceholder with a screen and a hook that render a draft version's manifest
  in declared order and drive isolated PUT/DELETE mutations for reorder and removal, adding the one apiFetch
  fix (204-body handling) both mutations need to work at all, plus a vite.config.ts fix for a real dual-React-copy
  crash this task's own use of TUI's Tooltip/Dialog first exposed.
task: sha256:adf5a8f63ff27c34d66a823e4901bbdcf5ee7965ef6bb43e8a8533c06c06638b
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/manifest-hypothesis-authoring-onda-4-full-suite
files:
- path: src/hooks/use-manifest-builder.ts
  effect: 'New hook. Reads GET /v1/cases/{slug}/versions/{version} through the shared apiFetch/react-query
    cache (query key ["case-version", slug, version], shared with the sibling Version Editor and Revise/New-hypothesis
    hooks), sorts the manifest ascending by its own declared `position`, and exposes one row per entry
    (hypothesis name, revision, up/down eligibility, only-entry flag, an inline move-error message, and
    bound onMoveUp/onMoveDown/onRemove callables). Dispatches one isolated useMutation per action: PUT
    .../manifest/{hypothesis_name} with { revision, position } for reorder, and DELETE .../manifest/{hypothesis_name}
    for removal. Classifies a mutation''s ApiError through the shared error-ui-state.ts table into: a
    sticky isBlocked flag on CaseVersionNotDraftError (either mutation), a per-row inline message on ManifestPositionOccupiedError
    (PUT only), a forced manifest reload on ManifestWouldHoldNoHypothesisError (DELETE only), and a generic
    toast for anything else. Fires telemetry.manifestHypothesisPlaced/manifestHypothesisRemoved on success.'
- path: src/routes/version-manifest-screen.tsx
  effect: 'New screen. Renders the manifest through the shared StatusTable (columns: position, "name ·
    rev N", actions), with a RowActions cluster per row: ghost up/down buttons, and a Remove button behind
    a TUI Dialog confirmation step, itself wrapped in a TUI Tooltip that shows "A case must keep at least
    one hypothesis" exactly when Remove is disabled. Renders the shared ConflictBanner and disables every
    reorder/remove control screen-wide while the hook''s isBlocked or isBusy flag is true. Renders a "+
    Add hypothesis" Link to "/cases/$slug/versions/$version/manifest/hypotheses/new" with the current
    slug/version.'
- path: src/routes/route-tree.tsx
  effect: '"/cases/$slug/versions/$version/manifest" now renders VersionManifestScreen instead of VersionManifestPlaceholder;
    every other route (including the two revise-hypothesis-form added) is untouched.'
- path: src/services/api-client.ts
  effect: apiFetch now returns undefined without calling response.json() when a 2xx response's status
    is 204 -- previously every successful response, including a genuinely empty 204 body, was parsed with
    response.json(), which throws a SyntaxError against an empty body. Every other status (non-2xx, or
    2xx with a real JSON body) is handled exactly as before.
- path: vite.config.ts
  effect: 'Adds explicit react/react-dom (and their subpath) aliases under resolve.alias, and inlines
    any dependency resolved from frontend/tui/frontend/node_modules (test.server.deps.inline: [/\/tui\/frontend\/node_modules\//])
    -- see this record''s own Notes for why.'
criteria:
- criterion: Visiting an existing draft version's manifest route renders every manifest entry from GET
    /v1/cases/{slug}/versions/{version}'s own manifest, ordered by its declared position, each showing
    its own hypothesis name and referenced revision number.
  met: true
  how: useManifestBuilder reads the endpoint through apiFetch, sortByPosition orders every entry ascending
    by its own `position` before any row is built, and version-manifest-screen.tsx's toStatusRow renders
    each row's hypothesis name and revision together as "{hypothesisName} · rev {revision}".
- criterion: The up control is disabled on the entry holding the lowest position, and the down control
    is disabled on the entry holding the highest position.
  met: true
  how: Each ManifestRow carries canMoveUp (index > 0) and canMoveDown (index < lastIndex) computed over
    the position-sorted array; RowActions disables the up Button when !row.canMoveUp and the down Button
    when !row.canMoveDown.
- criterion: Clicking an enabled up or down control issues PUT /v1/cases/{slug}/versions/{version}/manifest/{hypothesis_name}
    naming the target position, and a 204 response re-renders the list in the new order.
  met: true
  how: 'onMoveUp/onMoveDown call moveTo(previous/next), which mutates placeMutation with { revision, position:
    neighbor.position }; onSuccess invalidates the shared ["case-version", slug, version] query, which
    refetches and re-renders the sorted rows in whatever order the server now reports.'
- criterion: Moving a hypothesis onto a position no other entry currently holds succeeds even though that
    position belonged to a different entry before the move; landing on a free position is never treated
    as a collision.
  met: true
  how: No client-side occupancy check exists anywhere in useManifestBuilder; every up/down click issues
    the PUT unconditionally and reads only the response (204 success or 409 refusal) to decide what happened,
    leaving the one authority over whether a position is free to the backend.
- criterion: A 409 ManifestPositionOccupiedError response to that PUT reverts the attempted move and renders
    an inline message on the affected row.
  met: true
  how: placeMutation's onError resolves the error to "manifest-position-occupied" through errorStateKind
    and sets a { hypothesisName, message } state read back only by the matching row's moveErrorMessage;
    since the list is never optimistically reordered before a 204 arrives, the list is already exactly
    what it was before the attempt.
- criterion: The Remove control carries the tooltip "A case must keep at least one hypothesis" and is
    disabled exactly when the manifest holds one entry.
  met: true
  how: REMOVE_DISABLED_TOOLTIP holds that exact string; the Remove Button's disabled prop is row.isOnlyEntry
    || (isBlocked || isBusy), and the wrapping Tooltip's own disabled prop is `!row.isOnlyEntry`, so the
    tooltip is reachable exactly when isOnlyEntry is true.
- criterion: Clicking an enabled Remove control issues DELETE /v1/cases/{slug}/versions/{version}/manifest/{hypothesis_name},
    and a 204 response removes that entry from the list.
  met: true
  how: Clicking Remove opens a confirmation Dialog (EDG-04); confirming calls row.onRemove, which mutates
    removeMutation with { hypothesisName }; onSuccess invalidates the shared manifest query, dropping
    the removed entry from the next render.
- criterion: A 422 ManifestWouldHoldNoHypothesisError response to that DELETE reloads the manifest from
    GET /v1/cases/{slug}/versions/{version} rather than trusting the client's own removed-entry state.
  met: true
  how: removeMutation's onError resolves "manifest-would-hold-no-hypothesis" and calls invalidateManifest()
    (a real refetch of the GET), never removing the row from local state itself.
- criterion: A 409 CaseVersionNotDraftError response to either the PUT or the DELETE renders the conflict
    banner and disables every reorder and remove control on the screen.
  met: true
  how: Both mutations' onError set the same sticky isBlocked state on this kind; the screen renders ConflictBanner
    when state.isBlocked is true and passes rowsDisabled = isBlocked || isBusy into every row's RowActions,
    disabling every up/down/Remove control uniformly.
- criterion: '"+ Add hypothesis" navigates to the New Hypothesis route for the current case and draft
    version.'
  met: true
  how: A Link to "/cases/$slug/versions/$version/manifest/hypotheses/new" with params { slug, version
    } -- the exact route revise-hypothesis-form's own NewHypothesisScreen is wired to in route-tree.tsx.
nodes:
- node: domain/knowledge/manifest-entry
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  - src/routes/version-manifest-screen.tsx
  how: Its two declared facts -- the position and the hypothesis-revision it pins -- are exactly ManifestEntryDto/ManifestRow's
    own fields and what each row renders; every reorder PUT changes only `position`, always resending
    the row's own current `revision` unchanged, matching the node's own "changes only the position...
    never the revision" statement.
- node: domain/knowledge/case-version
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  how: Read whole through GET /v1/cases/{slug}/versions/{version} (case-query's read-case), narrowed here
    to its own `manifest` attribute, the one this screen's objective needs.
- node: domain/knowledge/case-version-state
  how: Never rendered as a status on this screen (no criterion asks for one); honored indirectly -- CaseVersionNotDraftError
    is this vocabulary's own "not draft" half surfacing at the transport boundary, and every control this
    screen offers is blocked the moment that response is seen (criterion 9), rather than the client continuing
    to treat the version as still editable.
- node: domain/knowledge/hypothesis
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  - src/routes/version-manifest-screen.tsx
  how: Its one declared attribute, `name`, is read from hypothesis_revision.hypothesis.name, is what every
    row displays, and is what the PUT/DELETE URLs address by -- never a hypothesis's own criterion/collects,
    which this task's own Notes states is out of scope here.
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  - src/routes/version-manifest-screen.tsx
  how: Its `revision` attribute is read, displayed ("rev N"), and is exactly the value resent unchanged
    on every reorder PUT; no other hypothesis-revision attribute (criterion, collects, resolution) is
    read anywhere in this delivery.
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  how: Never re-enforced client-side -- no local occupancy pre-check exists anywhere in this delivery.
    The hook always issues the PUT and lets the backend's own enforcement (this rule's real authority)
    answer, surfacing its 409 as the inline row message criterion 5 describes.
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  - src/routes/version-manifest-screen.tsx
  how: sortByPosition orders every row ascending by its own declared `position` before render and before
    computing which row's up/down control is disabled or which neighbor a move targets -- the declared
    position is the only thing that decides render order, never a stored array index.
- node: rules/knowledge/a-case-has-at-least-one-hypothesis
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  - src/routes/version-manifest-screen.tsx
  how: isOnlyEntry disables Remove (with its tooltip) client-side whenever the manifest holds one row,
    and the 422 ManifestWouldHoldNoHypothesisError branch (reached only if that guard is somehow bypassed)
    reloads from the real GET rather than trusting a client-removed row.
- node: rules/knowledge/a-case-version-is-written-once
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  - src/routes/version-manifest-screen.tsx
  how: CaseVersionNotDraftError on either mutation sets the sticky isBlocked flag, rendering the conflict
    banner and disabling every reorder/remove control -- once released, this screen stops offering any
    action the backend would refuse anyway.
- node: contracts/knowledge/case-lifecycle
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  how: place-hypothesis and remove-hypothesis are invoked exactly as PUT/DELETE .../manifest/{hypothesis_name},
    one isolated mutation per action, each answering to draft-state and to its own operation-specific
    refusal exactly as the real routes this contract publishes do.
- node: contracts/knowledge/case-query
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  how: read-case (GET /v1/cases/{slug}/versions/{version}) is this screen's only read, and its `manifest`
    field is the entire source of what this screen renders, held in react-query's own cache rather than
    copied into a second store (STA-01).
inferences:
- inferred: Removing a manifest entry requires an explicit confirmation dialog before the DELETE call
    fires, rather than firing on the Remove click itself.
  from: standards/frontend-typescript.yaml's EDG-04 ("An action that destroys or irreversibly changes
    data requires an explicit confirmation step before it executes"); criterion 7's "Clicking an enabled
    Remove control issues DELETE" is read as describing the outcome of the Remove interaction as a whole
    (click, then confirm) rather than mandating the bare click itself synchronously fire the network call.
- inferred: The Remove tooltip is reachable (Tooltip's own `disabled` prop false) exactly when Remove
    is itself disabled (isOnlyEntry), rather than always attached.
  from: The wireframe's own pre-condition text in intake/onda-4-scope.md pairs the tooltip with the disabled
    state itself ("o botão fica desabilitado com tooltip"), never with an enabled Remove that needs no
    explanation.
- inferred: Up/down issues exactly one PUT per click, targeting the row's immediate neighbor's current
    position (by declared order), with no client-side occupancy pre-check and no multi-call maneuver to
    force a swap between two still-occupied positions.
  from: Criterion 3's singular "issues PUT ... naming the target position" and criterion 4's "only a position
    a different hypothesis still holds is refused" together with src/src/case/manifest-composition.operations.ts's
    own refuseOccupiedByAnother and its own proof suite's dedicated "contested evidence" test, which confirms
    the backend itself refuses a bare two-call swap between two already-placed hypotheses.
- inferred: apiFetch must special-case a 204 status and return without ever calling response.json().
  from: The exact two endpoints this task's own criteria call (PUT/DELETE .../manifest/{hypothesis_name})
    both answer 204 with an empty body per src/src/http/place-hypothesis.routes.ts and remove-hypothesis.routes.ts's
    own `reply.code(204).send()`, and response.json() throws a SyntaxError against an empty body per the
    Fetch spec.
- inferred: errorStateKind is imported from use-edit-draft-version-form.ts rather than re-declared in
    the new hook.
  from: That module already exports the exact three-line ApiError -> UiErrorStateKind resolution this
    hook needs, over the same shared error-ui-state.ts table.
- inferred: The conflict banner's title/message text for CaseVersionNotDraftError on this screen is identical
    to case-version-editor-ready-view.tsx's own wording ("This version was released by someone else" /
    "Your changes were not saved. Reload to see the current state, or start a new draft.").
  from: No specification node or task criterion states wording for this outcome; reusing it keeps one
    wording per domain event across screens rather than a second, independently invented string.
- inferred: The disabled Remove Button is wrapped in a plain, non-disabled <span> before it is passed
    to Tooltip's own trigger.
  from: TUI's button.tsx applies `disabled:pointer-events-none`, which stops hover events from reaching
    a disabled button at all; wrapping it in an ordinary sibling element that still receives the pointer
    is the standard way to keep a tooltip reachable over a disabled trigger under that exact CSS constraint.
- inferred: Every up/down/Remove control is additionally disabled while either mutation is pending (isBusy),
    beyond what any criterion states.
  from: use-edit-draft-version-form.ts's own established convention of disabling its own controls while
    its mutation is in flight, so a second click cannot race the first.
- inferred: The manifest is rendered through the shared StatusTable, with hypothesis name and revision
    combined into one "name · rev N" column rather than split across two.
  from: The inventory's own must_not_duplicate entry names StatusTable explicitly for both this screen
    and the Hypotheses tab's table, and the intake wireframe's own row text ("customer-equipment-fault
    · rev 1") already uses this combined form.
divergences:
- from: frontend-manifest-hypotheses-onda-4.md's own module list, which marks frontend/app/src/services/api-client.ts
    as role "depends-on" (reuse as-is, not to be touched).
  departure: apiFetch was edited to add a 204-status branch that returns without calling response.json().
  why: Without this fix, every PUT/DELETE this task's own criteria require (both of which answer 204 with
    an empty body) would throw a SyntaxError on a successful response, making criteria 3, 5, 7 and 8 impossible
    to satisfy through the existing wrapper. The change is additive only -- every existing 200/201 caller
    is unaffected, since none of them ever receives a 204.
- from: vite.config.ts as delivered by task/version-editor/edit-draft-version and task/cases-list-and-detail/dev-proxy-for-backend-api,
    which named no react/react-dom alias and no Vitest deps.inline entry.
  departure: Added explicit resolve.alias entries forcing react/react-dom (and their subpaths) to this
    app's own installed copies, and a test.server.deps.inline entry ([/\/tui\/frontend\/node_modules\//])
    routing every dependency resolved from TUI's own node_modules through Vite's transform/resolve pipeline
    instead of Vitest's default external-SSR-dependency loading.
  why: 'This task is the first in this app to use a TUI component (Tooltip, Dialog) that itself depends
    on a third-party package (@radix-ui/react-tooltip, @radix-ui/react-dialog, and their own transitive
    dependencies -- @floating-ui/react-dom, react-remove-scroll) physically installed inside frontend/tui/frontend/node_modules,
    a separate install from this app''s own. Any such package''s own bare "react"/"react-dom" import resolves,
    by ordinary Node resolution, to that separate copy rather than this app''s -- a real "two React copies
    in one render tree" condition that crashes with "Cannot read properties of null (reading ''useRef'')"
    the instant such a component renders, confirmed by reading the actual stack trace back to frontend/tui/frontend/node_modules/react.
    This is not a test-only artifact: an unfixed production build or dev server would hit the identical
    crash the first time a curator opens this screen and focuses the Remove tooltip or opens its confirmation
    dialog. `resolve.dedupe` (Vite''s own documented mechanism for exactly this monorepo shape) was tried
    first and did not resolve it under Vitest''s own SSR-style module loading; the alias plus deps.inline
    combination above was confirmed, by direct reproduction, to be what actually fixes it.'
preserved:
- Every existing apiFetch() caller that reads a 2xx JSON body (case-version-editor-screen, new-case-draft-screen,
  hypothesis-revision-screen, cases-list-screen, case-detail-screen) keeps receiving that body unwrapped,
  exactly as before -- the 204 branch is additive and runs before the unchanged response.json() line,
  never instead of it for any other status.
- api-client.spec.ts's existing five assertions (2xx unwrap, 404/409 ApiError mapping, details presence/absence,
  unreadable-body fallback) exercise code paths this change does not alter.
- Every one of the other ten already-registered routes in route-tree.tsx keeps its own existing component;
  only "/cases/$slug/versions/$version/manifest" changed which component it renders.
- error-ui-state.ts's already-declared "case-version-not-draft", "manifest-position-occupied" and "manifest-would-hold-no-hypothesis"
  UiErrorStateKinds are read as-is, never redefined or renamed.
- The @tui/ui, @tui/lib and @/shared aliases vite.config.ts already declared are untouched; the new react/react-dom
  aliases and deps.inline entry are additions.
deferred:
- what: A direct one-PUT swap between two positions each already held by a different, already-placed hypothesis
    is refused by the backend itself (manifest-composition.operations.ts's own refuseOccupiedByAnother)
    -- so an up/down click against a tightly packed manifest (e.g. the real seed fixture's own contiguous
    positions 1/2) will commonly hit the 409 path criterion 5 describes on the very first attempt, rather
    than reordering.
  why: Resolving that would need either a backend change (an atomic multi-entry swap operation) or a client-orchestrated
    multi-call maneuver, and this task's own criteria describe exactly one PUT per click with no such
    maneuver -- a product-quality question for a human to weigh, not a fact this task's criteria ask this
    delivery to solve.
- what: Placing a freshly created or not-yet-placed hypothesis onto a manifest (as opposed to reordering
    or removing an entry already there) has no control anywhere in this task's own criteria, and revise-hypothesis-form's
    own delivered "success" screen only offers "Open Manifest Builder", never a place-hypothesis call.
  why: Outside this task's own objective ("reordered ... and pruned"), which never mentions originating
    a new manifest entry; widening this screen to add one would be a second task's worth of criteria this
    task was not cut to answer.
- what: 'Making the vite.config.ts fix''s own environment reconciliation durable across a fresh `npm install`
    inside frontend/tui/frontend: this delivery also replaced frontend/tui/frontend/node_modules/react
    and react-dom with symlinks to this app''s own copies (gitignored, not part of any tracked source),
    which the vite.config.ts alias/inline fix alone did not fully resolve under Vitest''s own module loader.'
  why: A durable fix (an npm workspace joining frontend/app and frontend/tui/frontend, or an npm `overrides`/`resolutions`
    entry) would mean restructuring how the two packages are installed, which is infrastructure work outside
    this task's own criteria; the symlink is disclosed here as the manual step this environment needed,
    and survives this project's own `install` step (`npm ci`, scoped to frontend/app only) but would need
    redoing after any `npm install` run directly inside frontend/tui/frontend.
---

## What it is
The section 2.4 Manifest Builder the scope describes, over the real PUT/DELETE endpoints the scope's own backend-reading confirms.
Reuses the existing ConflictBanner, the TUI tooltip component, and the telemetry hook's already-typed manifestHypothesisPlaced/manifestHypothesisRemoved callables.

## Notes
The up/down-button form (rather than drag-and-drop) is a decision already made in the scope's own material, not this task's to re-decide.
No task here renders the manifest entry's own criterion or collects text; only its hypothesis name and revision number are asserted, since the wave's own material does not confirm the case-version GET response embeds that content and the objective (reorder/remove) does not require it.
The vite.config.ts fix disclosed above as a divergence is a real, environment-level correction: it also applies to (and was verified against) the production build (`npm run build`) and the dev server used by the a11y suite, not only the test suite -- confirmed by running both after the fix landed.
