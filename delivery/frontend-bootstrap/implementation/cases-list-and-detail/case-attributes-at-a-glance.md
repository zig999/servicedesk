---
title: Case attributes at a glance
summary: Adds a third "Attributes" view to Case Detail that reads the case's current version whole through
  read-case and renders one state-sensitive action, including an explicit refusal state distinct from
  a generic load error.
task: sha256:66626fcbd5d69f1d52c2da6823d8be47302eeb621afab3c699779bb0e72b0d38
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/cases-list-and-detail-case-attributes-at-a-glance-build-3
files:
- path: src/hooks/use-case-attributes-at-a-glance.ts
  effect: new hook that resolves "the case's current version" (its own draft version when one exists,
    otherwise the highest-numbered/latest-released version) from the shared ["case-versions", slug] list
    already used by the Versions tab, then reads that one version whole via read-case (GET /v1/cases/{slug}/versions/{version})
    under the same ["case-version", slug, version] cache key the Version Editor already uses; returns
    a discriminated CaseAttributesAtAGlanceState of "loading" | "no-version" | "load-error" | "case-not-valid"
    | "ready"
- path: src/routes/case-attributes-tab.tsx
  effect: 'new "Attributes" tab component (CaseAttributesTab) composed by CaseDetailScreen; renders the
    resolved version''s title, when_to_use, subject, fallback outcome/referral and consolidation_register
    (AttributesSummary), and the one state-sensitive action for the resolved state (CurrentVersionAction:
    "Continue editing" for a draft, or both "View released vX" and "New draft from vX" for a released
    version), plus the "no-version" and "case-not-valid" explicit states'
- path: src/routes/case-detail-screen.tsx
  effect: adds a third TabsTrigger/TabsContent ("Attributes", delegating to CaseAttributesTab) alongside
    the existing "Versions" and "Hypotheses" tabs; only its header comment and the Tabs markup changed,
    VersionsPanel and the rest of the file are otherwise unchanged
- path: src/routes/route-tree.tsx
  effect: adds an optional "sourceVersion" search schema (validateSearch, a zod object with one optional
    coerced-positive-integer field) to the existing "/cases/$slug/versions/new" route, so a navigation
    into the New Draft flow can be addressed by the version it originates from; the route's path, its
    component and every other route are unchanged
- path: src/services/error-ui-state.ts
  effect: adds a distinct "case-not-valid" member to UiErrorStateKind and maps CaseNotValidError to it
    (previously folded into the shared "generic-error" fallback alongside three other unmapped classes),
    so a version that fails read-case's own coherence check resolves to its own kind instead of an undifferentiated
    5xx-shaped state
criteria:
- criterion: Case Detail renders a third view, alongside Versions and Hypotheses, surfacing the case's
    current version's own title, when_to_use, subject, fallback outcome/referral and consolidation_register.
  met: true
  how: case-detail-screen.tsx now renders a third TabsTrigger/TabsContent ("Attributes") beside "Versions"
    and "Hypotheses", delegating to CaseAttributesTab; its "ready" branch renders AttributesSummary, which
    shows title, when_to_use, subject, fallback.outcome, fallback.referral.action, fallback.referral.recipient
    and consolidation_register (or "Not set") as labeled rows.
- criterion: The current version resolved for that view is the case's own draft version when it holds
    one, otherwise its latest released version.
  met: true
  how: use-case-attributes-at-a-glance.ts computes `current = draft ?? highestNumbered(versions)` from
    the same list-case-versions page the Versions tab reads -- `draft` is the list item whose state is
    "draft"; `highestNumbered` is the item with the greatest version number, which (absent a draft) is
    the case's latest released version per rules/knowledge/a-case-summary-is-derived-from-its-existing-versions's
    own reasoning.
- criterion: Where the current version is a draft, the view's action reads "Continue editing" and navigates
    to that draft's own route.
  met: true
  how: CurrentVersionAction's `versionState === "draft"` branch renders a router Link reading "Continue
    editing" to "/cases/$slug/versions/$version" with that version's own number, the same client-side-only
    navigation convention the Versions tab already uses.
- criterion: Where the current version is released, the view renders "View released vX" (X its own version
    number) navigating to that version's own read-only route, and "New draft from vX" navigating into
    the New Draft flow, addressed by that same version's own number.
  met: true
  how: 'CurrentVersionAction''s else branch renders both links -- "View released v{version}" to "/cases/$slug/versions/$version"
    (the same route view-released-version-read-only will render read-only), and "New draft from v{version}"
    to "/cases/$slug/versions/new" with `search={{ sourceVersion: version }}`, a new optional search field
    route-tree.tsx now declares on that route so the navigation itself is addressed by the source version''s
    own number.'
- criterion: Where the current version's own read via read-case itself refuses -- e.g. a draft whose manifest
    currently holds no hypothesis -- the view renders that refusal as its own explicit named state, distinguishable
    from a generic load error, offering the same "Continue editing" link the draft's own state would otherwise
    show.
  met: true
  how: error-ui-state.ts now maps CaseNotValidError to its own "case-not-valid" kind (previously folded
    into "generic-error"); the hook's `versionQuery.isError` branch checks `errorStateKind(...) === "case-not-valid"`
    and returns a distinct "case-not-valid" phase (carrying the version number) before falling through
    to the generic "load-error" phase for any other failure; case-attributes-tab.tsx renders that phase
    with its own explanatory sentence and a "Continue editing" Link to that same version's own route.
nodes:
- node: domain/knowledge/case
  encoded_at:
  - src/hooks/use-case-attributes-at-a-glance.ts
  - src/routes/case-attributes-tab.tsx
  how: the view is scoped to one case's identity (its slug, read from the route) and used to address every
    list-case-versions, read-case and New-Draft-flow URL this tab issues.
- node: domain/knowledge/case-version
  encoded_at:
  - src/hooks/use-case-attributes-at-a-glance.ts
  - src/routes/case-attributes-tab.tsx
  how: the resolved current version's own declared attributes (title, when_to_use, subject, fallback,
    consolidation_register) are read via read-case and rendered by AttributesSummary exactly as returned.
- node: domain/knowledge/case-version-state
  encoded_at:
  - src/hooks/use-case-attributes-at-a-glance.ts
  - src/routes/case-attributes-tab.tsx
  how: the resolved version's own draft/released state (case-version-state's two values) selects which
    action CurrentVersionAction renders -- "Continue editing" for draft, "View released vX" plus "New
    draft from vX" for released.
- node: domain/knowledge/consolidation-register
  encoded_at:
  - src/routes/case-attributes-tab.tsx
  how: rendered as its own labeled row (AttributesSummary), "Not set" standing in for a version whose
    curator left it absent.
- node: domain/knowledge/resolution
  encoded_at:
  - src/routes/case-attributes-tab.tsx
  how: the fallback (one outcome paired with one referral) is rendered as its own outcome row plus the
    referral's own two rows, never as a single opaque value.
- node: domain/knowledge/referral
  encoded_at:
  - src/routes/case-attributes-tab.tsx
  how: the fallback's referral (action, recipient) is rendered as its own two labeled rows, "Fallback
    referral (action)" and "Fallback referral (recipient)".
- node: contracts/knowledge/case-query
  encoded_at:
  - src/hooks/use-case-attributes-at-a-glance.ts
  how: the hook issues read-case (GET /v1/cases/{slug}/versions/{version}) to read the resolved current
    version whole, the same call and case-version-record.ts shape the Version Editor already established,
    rather than relying only on list-case-versions' own metadata.
- node: rules/knowledge/every-case-version-remains-readable
  encoded_at:
  - src/routes/case-attributes-tab.tsx
  how: '"View released vX" links to that specific released version''s own route by number even though
    it is not the "current" version this view is otherwise surfacing -- a superseded version stays individually
    addressable, never folded away once a draft exists on top of it.'
- node: constraints/a-case-is-read-whole
  encoded_at:
  - src/hooks/use-case-attributes-at-a-glance.ts
  - src/routes/case-attributes-tab.tsx
  how: the current version's attributes are read only through read-case's own whole-version assembly,
    never pieced together from list-case-versions' partial metadata; a version that fails that whole read
    is answered with the explicit "case-not-valid" phase rather than a partially populated summary.
- node: rules/knowledge/validation-runs-at-every-read
  encoded_at:
  - src/hooks/use-case-attributes-at-a-glance.ts
  - src/services/error-ui-state.ts
  how: every mount reissues read-case's own validated read (via react-query), and a version that no longer
    reads back as coherent (e.g. an empty-manifest draft) is answered by the dedicated "case-not-valid"
    phase rather than a stale or partial render -- no separate field marks the version "not ready"; failing
    the read itself is what says so, per this rule's own Description.
- node: domain/knowledge/case-summary
  encoded_at:
  - src/hooks/use-case-attributes-at-a-glance.ts
  how: this task does not render the case-summary value object itself (cases-list-screen's own concern)
    but reuses its own current_state derivation -- the state of the case's highest-numbered version --
    from a second call site, to resolve "the current version" criterion 2 names.
- node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  encoded_at:
  - src/hooks/use-case-attributes-at-a-glance.ts
  how: the hook's `draft ?? highestNumbered(versions)` resolution is exactly this policy's own reasoning
    (the highest-numbered version a case holds is always the most recently authored one, whichever of
    draft or released its state is), applied to answer criterion 2's "the case's own draft version when
    it holds one, otherwise its latest released version".
inferences:
- inferred: The read-only "Attributes at a glance" view renders its own plain, non-form markup (AttributeRow/AttributesSummary)
    rather than reusing CaseVersionEditorFormFields, the Version Editor's shared react-hook-form-bound
    field markup.
  from: no criterion of this task asks for an editable control or a Save action, and the inventory's own
    risk explicitly names that shared component as bound to one react-hook-form `form` plus a Save button
    with no distinct "read-only, no actions at all" path -- reusing it here would mount controls this
    task's own "at a glance" objective does not call for; that reuse is left to the sibling task (view-released-version-read-only)
    whose own criteria actually ask for a disabled rendering of that same field set.
- inferred: '"New draft from vX" addresses the New Draft flow by adding an optional "sourceVersion" search
    field to the existing "/cases/$slug/versions/new" route, rather than a new route or a required parameter.'
  from: this task's own Notes state the criterion is "navigation only, addressed by the version's own
    number, independently demonstrable" of whichever task (if any) ever reads the value back; making the
    field optional keeps new-draft-creation's own existing, source-version-free "New draft" Link resolving
    to the exact same route unaffected.
- inferred: The current-version resolution (`draft ?? highestNumbered(versions)`) treats "the case's own
    draft version" as a single, well-defined item to pick.
  from: this task's own Notes (ADVISORY) name rules/knowledge/a-case-has-at-most-one-draft as the node
    this presupposes; that node is outside this task's own candidate set, so the code exercises but does
    not itself state or enforce that uniqueness.
- inferred: A case currently holding no version at all resolves to its own "no-version" phase, rendering
    the exact sentence ("This case currently holds no version.") the Versions tab already established
    for the same fact, rather than staying indefinitely "loading".
  from: the project standard's API-04 ("an empty response is never treated as loading or absent") and
    EDG-02 ("a view that fails to load degrades to a typed state ... rather than an indefinite loading
    state"), balanced against this task's own Notes explicitly declining to introduce a new closure of
    scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly -- reusing the sentence case-detail-timeline
    already earned for this exact fact adds no new domain wording of its own.
- inferred: Fallback outcome/referral and subject are rendered as the raw string values read-case returns,
    with no glossary-label resolution.
  from: no criterion of this task names resolving any of these through the glossary, and the sibling task
    reading the same fields off the same endpoint for a released version (view-released-version-read-only)
    renders them the same way, "exactly as the backend already validated and returned them".
- inferred: The new tab's own trigger is labeled "Attributes".
  from: no specification node names UI wording for a tab label; "Attributes" follows the existing "Versions"/"Hypotheses"
    tab-trigger naming convention (a short noun) already established in case-detail-screen.tsx.
preserved:
- The Versions tab's existing loading/error/empty/populated rendering and its "Continue editing" / "New
  draft" links (VersionsPanel in case-detail-screen.tsx) are unchanged.
- The Hypotheses tab (case-hypotheses-tab.tsx) is unchanged.
- use-edit-draft-version-form.ts's own error handling, which branches only on "case-not-found" and falls
  through to the same generic "load-error" phase for every other kind, behaves identically despite CaseNotValidError's
  kind changing from "generic-error" to "case-not-valid" -- that hook never checked for either kind by
  name.
- use-new-draft-version-form.ts's own error handling, which branches only on "case-already-has-draft",
  is unaffected by the same mapping change for the same reason.
- The existing plain "New draft" Link (no search) in the Versions tab keeps resolving to the same href,
  since the new "sourceVersion" search field on that route is optional.
- route-tree.tsx's own twelve registered route paths and components are unchanged; only validateSearch
  was added to an existing route.
deferred:
- what: Rendering a released version's own full stored content (fields disabled, plus its complete manifest)
    at "/cases/$slug/versions/$version" when that version's state is released.
  why: that is task/version-editor/view-released-version-read-only's own objective; this task's "View
    released vX" link only navigates to that pre-existing route, and this task does not depend on that
    sibling task per its own rationale.
- what: Pre-populating the New Draft form from a named source version, and widening its create-draft POST
    body with consolidation_register and source_version.
  why: that is task/version-editor/seed-new-draft-from-latest-released's own objective; the "sourceVersion"
    search field this task adds is not read by NewCaseDraftScreen, matching this task's own Notes that
    the criterion here is navigation only.
- what: Enforcing or verifying that a case holds at most one draft version at a time.
  why: rules/knowledge/a-case-has-at-most-one-draft is presupposed (per this task's own ADVISORY note)
    but not exercised -- no task in this epic originates or contends over a draft, including this one,
    which only reads whichever draft or released version already exists.
- what: Closing scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly as its own criterion
    for this new view.
  why: the task's own Notes explicitly decline to extend this task to that scenario; the "no-version"
    phase reuses wording case-detail-timeline already established rather than treating this as a newly
    delivered closure.
---

## What it is
Case Detail's third view (alongside Versions and Hypotheses), reading the case's current version whole via read-case rather than only list-case-versions' own metadata.
It resolves "the current version" as the case's own draft when one exists, otherwise its latest released version, reusing the highest-numbered-version reasoning cases-list-screen's own case-summary derivation already established.
It renders one state-sensitive action -- "Continue editing" for a draft, or both "View released vX" and "New draft from vX" for a released version -- and an explicit "case-not-valid" state, distinct from a generic load error, for a version whose whole read fails read-case's own coherence check.

## Notes
error-ui-state.ts's UiErrorStateKind gains a "case-not-valid" member; CaseNotValidError was previously folded into the shared "generic-error" fallback, so this changes what use-edit-draft-version-form.ts's and use-new-draft-version-form.ts's own error handling would classify that error as -- both are unaffected since neither branches on "generic-error" or "case-not-valid" by name (see preserved).
route-tree.tsx's "/cases/$slug/versions/new" route gains an optional "sourceVersion" search field so "New draft from vX" can address the New Draft flow by the version it originates from; the criterion here is navigation only, and no reader of that search value is added by this task (deferred to task/version-editor/seed-new-draft-from-latest-released).
This task's own resolution of "the case's own draft version" as a single well-defined item presupposes rules/knowledge/a-case-has-at-most-one-draft, a node the task's ADVISORY note names as outside this task's own candidate set; the code exercises but does not itself state or enforce that uniqueness.
The scope named three action labels for one state-sensitive action whose stated conditions overlapped; per the task's own rationale, both "View released vX" and "New draft from vX" render together for a released current version rather than choosing one over the other -- a decomposition choice left open for the human reviewer to correct if a single control was intended.
The first two build attempts (run/cases-list-and-detail-case-attributes-at-a-glance-build and -build-2) failed on typecheck for reasons outside this task's own files: this worktree's frontend/tui git submodule was not yet initialized, and once initialized its own vendored package.json/node_modules had never been installed either -- neither is anything this delivery's source wrote or could fix by editing a file, so both were environment setup gaps, resolved by `git submodule update --init --recursive` and `npm ci` under frontend/tui/frontend before the third attempt passed clean.
