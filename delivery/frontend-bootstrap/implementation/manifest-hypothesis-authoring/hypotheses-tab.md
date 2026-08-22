---
title: Hypotheses tab on Case Detail — list, per-hypothesis revision history, Revise entry point
summary: Adds a "Hypotheses" tab beside "Versions" on Case Detail, listing every hypothesis with its total
  revision count and, on selection, that hypothesis's own current/frozen revision history with a Revise->
  link on the current revision.
task: sha256:05a4d4f79264f125da3bcc0768e7f95aa5d80a7e7fcef8c90a7f5f14d92c616f
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/manifest-hypothesis-authoring-onda-4-full-suite
files:
- path: src/hooks/use-case-versions.ts
  effect: New hook. Fetches GET /v1/cases/{slug}/versions and exposes CaseVersionListItem/CaseVersionState/CaseVersionsPage,
    extracted out of case-detail-screen.tsx so both the Versions tab body and the Hypotheses tab's own
    target-version derivation share one fetch and one set of types.
- path: src/hooks/use-case-hypotheses.ts
  effect: New hook. Fetches GET /v1/cases/{slug}/hypotheses and exposes HypothesisIdentity/CaseHypothesesPage
    (name-only items, matching the real backend response).
- path: src/hooks/use-hypothesis-revisions.ts
  effect: New hook. Fetches GET /v1/cases/{slug}/hypotheses/{name}/revisions and exposes the full paginated
    envelope (including `total`). Also exports hypothesisRevisionsQueryOptions(slug, name), the query-config
    builder case-hypotheses-tab.tsx passes to @tanstack/react-query's useQueries to read every listed
    hypothesis's own revision count in one rules-of-hooks-safe call.
- path: src/routes/case-hypotheses-tab.tsx
  effect: New component. Lists every hypothesis GET /v1/cases/{slug}/hypotheses returns, by name, through
    StatusTable; each row's "Revisions" cell is the total from useHypothesisRevisions's own envelope for
    that hypothesis (via useQueries), never a page length. Selecting a row swaps the tab's own content
    into HypothesisRevisionHistory for that hypothesis; loading, load-error-with-retry and empty states
    are handled explicitly (EDG-01, EDG-02, API-04).
- path: src/routes/hypothesis-revision-history.tsx
  effect: New component. Lists every revision GET /v1/cases/{slug}/hypotheses/{name}/revisions returns
    for one hypothesis, each as its own StatusTable row (revision number, a current/frozen status cell,
    criterion, collects). The row holding the highest revision number is "current"; every other one is
    "frozen". Only the current row renders "Revise ->", a router Link to route-tree.tsx's existing "/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName"
    route, addressed at this case's own current version (the highest version number GET /v1/cases/{slug}/versions
    returns), rendered unconditionally regardless of whether that version is a draft.
- path: src/routes/case-detail-screen.tsx
  effect: Modified. Wraps the existing Versions content and the new CaseHypothesesTab in @tui/ui/tabs's
    Tabs/TabsList/TabsTrigger/TabsContent, with "Versions" the default-selected tab. The Versions tab's
    own body (now a VersionsPanel function) is functionally unchanged, other than reading through the
    extracted useCaseVersions hook instead of an inline useQuery call. No sidebar entry is added (app-shell.tsx
    already excludes Hypotheses from SIDEBAR_ENTRIES, from an earlier task in this same wave).
criteria:
- criterion: Case Detail renders a "Hypotheses" tab beside "Versions", using the existing tabs component,
    never as a top-level sidebar entry.
  met: true
  how: case-detail-screen.tsx composes @tui/ui/tabs's Tabs/TabsList/TabsTrigger/TabsContent with a "Versions"
    trigger and a "Hypotheses" trigger; app-shell.tsx's SIDEBAR_ENTRIES (unchanged by this task, already
    excluding Hypotheses) confirms no sidebar entry exists for it.
- criterion: The Hypotheses tab lists every hypothesis GET /v1/cases/{slug}/hypotheses returns for the
    case, by name.
  met: true
  how: case-hypotheses-tab.tsx reads useCaseHypotheses(slug) and renders one StatusTable row per item
    in the response's `data` array, keyed and displayed by `name`.
- criterion: Each listed hypothesis's Revisions count is the total GET /v1/cases/{slug}/hypotheses/{name}/revisions
    reports for that hypothesis, not the length of a single returned page.
  met: true
  how: case-hypotheses-tab.tsx runs one hypothesisRevisionsQueryOptions(slug, name) per listed hypothesis
    through useQueries, and each row's "Revisions" cell reads that hypothesis's own `total` field, never
    `data.length`.
- criterion: Selecting a hypothesis row navigates to, or expands into, that hypothesis's own revision-history
    view.
  met: true
  how: StatusTable's onRowClick sets local state (selectedHypothesis); when set, CaseHypothesesTab renders
    HypothesisRevisionHistory in place of the list -- the "expands into" half of the criterion's either/or,
    an inference disclosed below.
- criterion: The revision-history view lists every revision GET /v1/cases/{slug}/hypotheses/{name}/revisions
    returns for that hypothesis, each rendered as a closed, non-editable block showing its own revision
    number, criterion and collects.
  met: true
  how: hypothesis-revision-history.tsx reads useHypothesisRevisions(slug, name) and renders one StatusTable
    row per revision in the response's `data`, none editable, each showing its own revision number, criterion
    text and a comma-joined collects list.
- criterion: The revision holding the highest revision number is labeled "current"; every other revision
    is labeled "frozen".
  met: true
  how: currentRevisionNumber = Math.max(...revisions.map(r => r.revision)); each row's status cell is
    {color:"bg-success", label:"current"} when its own revision equals that maximum, else {color:"bg-muted-foreground",
    label:"frozen"}.
- criterion: '"Revise ->" is rendered only on the revision labeled "current", and clicking it navigates
    to the Revise route pre-loaded with that hypothesis''s name and that revision''s own criterion, collects
    and resolution.'
  met: true
  how: 'Only the row where isCurrent is true renders a router Link (labeled "Revise →") to "/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName"
    with {slug, version: targetVersion, hypothesisName}. The Revise route''s own already-delivered ReviseHypothesisScreen/useHypothesisRevisionForm
    re-reads this exact hypothesis''s own revisions itself to pre-populate criterion, collects and resolution
    from its current revision, so navigating with just the name and target version already satisfies the
    pre-load.'
nodes:
- node: domain/knowledge/hypothesis
  encoded_at:
  - src/hooks/use-case-hypotheses.ts
  - src/routes/case-hypotheses-tab.tsx
  how: HypothesisIdentity carries exactly the node's own stable identity (its bare `name`); the tab lists
    every hypothesis by that name alone, never by any of its revisions' own content.
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/hooks/use-hypothesis-revisions.ts
  - src/routes/hypothesis-revision-history.tsx
  how: HypothesisRevisionListItem carries every attribute the node declares beyond its own hypothesis
    relationship (revision, criterion, collects, resolution); the revision-history view renders each one
    as its own closed, non-editable row.
- node: domain/knowledge/resolution
  encoded_at:
  - src/hooks/use-hypothesis-revisions.ts
  how: HypothesisRevisionListItem's own `resolution` field is read and carried through (typed via revise-hypothesis-form's
    own HypothesisRevisionFormValues["resolution"], reused rather than re-declared) so a revision's resolution
    reaches the Revise route's own pre-load unchanged; this task's own revision-history table does not
    itself render resolution, since no criterion of this task asks the list view to show it.
- node: contracts/knowledge/case-query
  encoded_at:
  - src/hooks/use-case-hypotheses.ts
  - src/hooks/use-hypothesis-revisions.ts
  - src/hooks/use-case-versions.ts
  how: The three hooks call exactly this contract's list-hypotheses, list-hypothesis-revisions and list-case-versions
    operations and nothing else.
- node: contracts/knowledge/case-lifecycle
  how: This task performs no case-lifecycle operation itself -- it only navigates to the Revise route
    where revise-hypothesis-form's own delivery invokes revise-hypothesis. Per this task's own Notes,
    "Revise ->" is rendered unconditionally regardless of whether the addressed version is actually a
    draft, so this task deliberately does not gate on this contract's own precondition; a curator following
    the link against a released case reaches revise-hypothesis-form's own generic-failure handling for
    the resulting CaseHoldsNoDraftError, not a check added here.
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  encoded_at:
  - src/routes/hypothesis-revision-history.tsx
  how: '"current" is derived as Math.max(...revisions.map(r => r.revision)) -- reading, never assigning,
    a revision number -- because this rule''s own numbering-assignment mechanics are exercised only by
    revise-hypothesis-form''s write path; comparing revision numbers is sufficient because the rule guarantees
    the highest number is always the most recently originated one.'
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  how: 'Honored rather than encoded as a fact of its own: every revision row (current or frozen alike)
    renders as a read-only StatusTable cell with no edit control, so nothing in this UI offers to alter
    a revision in place; the rule''s own guarantee is enforced by the backend, this task''s job is only
    not to contradict it in the UI.'
inferences:
- inferred: The "Revise ->" link's own target version -- required by the existing Revise route's own "/cases/$slug/versions/$version/..."
    path even though this tab is not itself version-scoped -- is the highest version number GET /v1/cases/{slug}/versions
    returns for the case.
  from: 'rules/knowledge/a-case-version-number-is-never-reused ("a case''s next version number is always
    greater than every version number the case has ever held") together with rules/knowledge/a-case-has-at-most-one-draft:
    whenever a draft exists it is always the case''s own highest version number, and absent a draft the
    highest is simply the latest released version -- so this one value is correct either way, and no criterion
    of this task names which version a case-level Revise link should address.'
- inferred: Selecting a hypothesis row swaps the tab's own content into a drill-down revision-history
    view (in place), rather than navigating to a new route.
  from: 'Criterion 4''s own "navigates to, or expands into" either/or; no dedicated per-hypothesis route
    exists in route-tree.tsx, and this delegation''s own instructions warned that touching shared route
    files risks a needless conflict with the concurrently-delivered manifest-builder task (confirmed in
    fact: route-tree.tsx was observed to change on disk, from that other task, partway through this delivery).'
- inferred: The current/frozen status cell's own colors ("bg-success"/"bg-muted-foreground") and the hypotheses
    list's per-row loading ("…")/error ("—") placeholder text for a still-resolving or failed revision
    count.
  from: No node names either. The status colors follow case-detail-screen.tsx's own already-delivered
    STATE_CELL inference for the exact same reason; the placeholder text follows this app's own established
    convention of never leaving a cell blank while data is unresolved.
- inferred: Table column header labels ("Hypothesis", "Revisions", "Revision", "Status", "Criterion",
    "Collects", "Actions").
  from: The domain's own attribute names (hypothesis, revision, criterion, collects) plus the "Actions"
    column convention case-detail-screen.tsx already established -- this task names no `reference`, so
    no mockup or wireframe wording settled these labels.
- inferred: GET /v1/cases/{slug}/versions's own fetch and its CaseVersionListItem/CaseVersionState/CaseVersionsPage
    types are extracted into a shared hook (use-case-versions.ts) rather than re-declared inside the Hypotheses
    tab's own drill-down.
  from: case-detail-screen.tsx's own already-evidenced convention against duplicating a fetch and its
    type once a second call site needs the same page -- this task is the first to introduce that second
    call site.
preserved:
- case-detail-screen.spec.ts's existing coverage of the Versions tab (one row per returned version with
  its color-and-label state cell, "Continue editing" on the draft row only, "New draft" shown/hidden by
  draft presence, the loading and load-error placeholders, and slug URL-encoding) -- the Versions tab's
  own markup and its request shape are unchanged, only relocated inside a TabsContent behind the default-selected
  "versions" tab, which renders on first mount exactly as before.
- route-tree.spec.ts's and app-shell.spec.ts's existing assertions -- route-tree.tsx and app-shell.tsx
  are untouched by this delivery.
- revise-hypothesis-form's own already-delivered route, screen and hook (route-tree.tsx's manifest-hypothesis
  route, revise-hypothesis-screen.tsx, use-hypothesis-revision-form.ts) -- untouched, and this task's
  own Link navigates to that route with exactly the params it already expects.
deferred:
- what: route-tree.tsx still registers a separate "/cases/$slug/hypotheses" route against CaseHypothesesPlaceholder
    (route-placeholders.tsx), now fully superseded by the Hypotheses tab this task builds inside "/cases/$slug"
    -- a stray, reachable dead end showing placeholder text instead of the real tab.
  why: Retiring it is not named by any of this task's own criteria (which speak only to what Case Detail
    itself renders), and route-tree.tsx is a file this delegation was explicitly warned is likely touched
    concurrently by the manifest-builder task -- confirmed in fact partway through this delivery, when
    route-tree.tsx changed on disk from that other task's own edits. Removing the dead route is left to
    a later task or to the merge these two deliveries' file sets undergo after both return.
---

## What it is
The section 2.10 Hypotheses tab the scope describes, over the real list-hypotheses and list-hypothesis-revisions endpoints, which return name-only and revision-content-only payloads respectively with no cross-reference to a case version.
Reuses the existing generic StatusTable for both the hypothesis list and the revision-history rendering.

## Notes
This task is the first to introduce the tabs component into case-detail-screen.tsx, a file Onda 2/3 already delivered and reviewed with a single Versions view.
A hypothesis with zero revisions is impossible by the domain -- every hypothesis is born with revision 1 -- so no empty state is designed for the revision-history view, as the scope itself states.
This task ran concurrently with task/manifest-hypothesis-authoring/manifest-builder (both depend only on revise-hypothesis-form, not on each other); route-tree.tsx changed on disk from that sibling task partway through this delivery, confirmed not to conflict with anything this task itself wrote there (this task does not touch route-tree.tsx at all).
