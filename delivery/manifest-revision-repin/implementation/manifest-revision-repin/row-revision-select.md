---
title: The revision Select on the manifest row's Hypothesis cell
summary: Replaces the manifest row's plain "hypothesisName · rev N" text with a controlled @tui/ui/select
  over that hypothesis's revisions, always showing the row's own pinned revision, disabling proactively
  on a released version, and linking a repin failure's message to the actual focusable trigger.
task: sha256:da7cbe67571d4afdab5f7da6f1da76ef60a9a81431855621703de9237724e561
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/manifest-revision-repin-row-revision-select-build-3
files:
- path: src/routes/version-manifest-screen.tsx
  effect: 'RevisionSelect reads {revisions, isLoading} from useManifestRowRevisions and, while that row''s
    own revisions query is still pending, renders a plain <span>{hypothesisName}</span> (no labelled control)
    instead of the Select. Once loaded, optionsWithPinnedRevision(revisions, pinnedRevision) builds the
    options from the fetched revisions and, only if the row''s own pinned revision is absent from that
    list, appends it as one more option, so @tui/ui/select''s own value-match always finds it. A new useTriggerAriaLinkage(containerRef,
    isInvalid, describedById) hook takes a ref attached to the Select''s own outer wrapping element and,
    in an effect, imperatively sets or removes aria-invalid/aria-describedby directly on the nested button[role="combobox"]
    it queries for — working around @tui/ui/select''s own outer <div> being the only element its spread
    props reach. toStatusRow/VersionManifestScreen otherwise unchanged from the prior delivery except
    rowsDisabled, which also folds in state.isReleased: `state.isBlocked || state.isBusy || state.isReleased`.'
- path: src/hooks/use-manifest-builder.ts
  effect: 'ManifestVersionRecord now also reads an optional `state?: "draft" | "released"` from the case
    version the hook already fetches. The "ready" phase now also computes and returns `isReleased: versionQuery.data.state
    === "released"`, exposed alongside the existing isBlocked/isBusy.'
- path: src/hooks/use-manifest-row-revisions.ts
  effect: 'ManifestRowRevisions now also exposes `isLoading: revisionsQuery.isLoading`, the signal RevisionSelect''s
    loading gate reads.'
criteria:
- criterion: The cell renders a Select holding one option per revision obtained for that row, each labelled
    by its revision number.
  met: true
  how: optionsWithPinnedRevision maps every item useManifestRowRevisions answered into one SelectOption
    per revision, labelled by nothing but that bare number; the loading gate ensures this mapping only
    ever runs once that answer has actually arrived.
- criterion: The Select's value is the revision the row's manifest entry currently pins, shown before
    any choice is made.
  met: true
  how: The Select's `value` is `String(row.revision)`; optionsWithPinnedRevision guarantees an option
    carrying that exact value always exists (synthesized when the fetched page didn't carry it).
- criterion: Choosing a revision other than the row's pinned revision invokes the repin action for that
    row with the chosen revision.
  met: true
  how: repinIfChanged still calls row.onRepin(chosenRevision) whenever the chosen value differs from row.revision.
- criterion: Choosing the revision the row already pins issues no manifest request.
  met: true
  how: repinIfChanged's guard (`chosenRevision !== row.revision`) still gates the only path to row.onRepin.
- criterion: The Select is disabled exactly when that row's existing move and remove actions are disabled.
  met: true
  how: toStatusRow still threads one identical `disabled` value into both RevisionSelect and RowActions;
    that value now also includes state.isReleased.
- criterion: The Select is the shared @tui/ui/select component driven as a controlled component from the
    row's pinned revision, with no second select implementation added.
  met: true
  how: Still the one @tui/ui/select import, still value/onChange/options; useTriggerAriaLinkage does not
    render or reimplement any select markup.
- criterion: Choosing a revision on one row leaves every other row's shown revision unchanged.
  met: true
  how: Each row's own useManifestRowRevisions call is keyed by that row's own hypothesisName, and a repin
    only invalidates and refetches the shared case-version query.
nodes:
- node: domain/knowledge/manifest-entry
  encoded_at:
  - src/routes/version-manifest-screen.tsx
  how: The Select's value/onChange pair still shows the entry's currently pinned revision and invokes
    its own repin action on a different choice, position untouched.
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/routes/version-manifest-screen.tsx
  how: Options are still built one-for-one from the numbered revisions answered for that row's hypothesis.
- node: domain/knowledge/case-version
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  - src/routes/version-manifest-screen.tsx
  how: Encodes "Once released ... every manifest entry's position and referenced revision, stay exactly
    as they were at the moment of release" by reading the version's own `state` and exposing isReleased;
    the screen folds it into rowsDisabled, disabling the Select proactively.
- node: rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown
  encoded_at:
  - src/routes/version-manifest-screen.tsx
  how: optionsWithPinnedRevision guarantees the pinned revision is always a matchable option, synthesized
    when the row's own answered page omits it, so the Select's shown value is never the placeholder.
- node: rules/knowledge/a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis
  how: This rule's own "a higher revision exists" statement still reaches no criterion here and is bounded
    only negatively.
inferences:
- inferred: While a row's own useManifestRowRevisions query is still pending, RevisionSelect renders a
    plain, unlabelled <span>{hypothesisName}</span> instead of the real Select.
  from: The observed failure evidence (a listbox opening with zero, not-yet-loaded options).
- inferred: '"The case version itself is known not to be a draft" is read as a positive-knowledge check
    (`state === "released"`), not a fail-closed one.'
  from: use-edit-draft-version-form.ts's own existing computation over the same CaseVersionRecord.state
    shape.
- inferred: aria-invalid/aria-describedby are attached to the Select's rendered trigger button imperatively,
    via a ref on the Select's own outer element plus a DOM querySelector for button[role="combobox"],
    rather than passed as JSX props to <Select .../>.
  from: A failure-diagnostician's own reading of frontend/tui/frontend/src/shared/components/ui/select/select.tsx
    (spreads unknown props only onto the outer wrapping <div>, never onto the nested trigger button) —
    confirmed by the observed evidence, combined with frontend/tui being a separate submodule outside
    this task's own target source root and standard.
divergences:
- from: rules/knowledge/a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis
  departure: 'This task''s own describe block "the Select''s disabled state for a possibly-already-released
    row" (in version-manifest-screen-revision-select.spec.ts, which this delivery may not edit) asserts
    the trigger carries `disabled` on a fixture that is, field for field, identical to three other describe
    blocks in the same file that require the trigger to be enabled, and none of the four ever sets a `state`
    field. A second, independent failure-diagnostician pass confirmed the fixture never sets `state: "released"`,
    so this implementation''s fail-open reading is correct and the test itself carries the disagreement
    — reported to the human rather than changed here. This describe block is expected to remain failing
    after this delivery.'
  why: Regressing seven already-passing-or-fixed tests to turn one red is a strictly worse outcome by
    every measure available to this delivery, the fixture gap is not something a source-only fix can close
    without touching the spec file (forbidden), and a second, independent diagnostician pass has since
    confirmed the fail-open reading is the correct one.
preserved:
- RowActions' own move/remove disabled wiring and its moveErrorMessage rendering, plus the ConflictBanner's
  own isBlocked-only condition — isReleased was deliberately kept out of the banner's own trigger.
- The existing placeMutation/onRepin behavior in use-manifest-builder.ts, and the ["hypothesis-revisions",
  slug, hypothesisName] query key/shape and latestRevisionOf reduction read through useManifestRowRevisions
  — untouched by this delivery.
- '@tui/ui/select itself (frontend/tui) — left unmodified; the aria-invalid/aria-describedby gap is closed
  from the outside, in version-manifest-screen.tsx, rather than by editing the shared component.'
deferred:
- what: Making "the Select's disabled state for a possibly-already-released row" describe block pass without
    regressing the other same-fixture tests in its own file.
  why: Requires either a distinguishing fact in that test's own fixture (it has none) or editing version-manifest-screen-revision-select.spec.ts,
    both outside what this delivery may change. A second, independent failure-diagnostician pass has confirmed
    this is a genuine test/implementation disagreement to be reported to the human, not a code defect.
---

## What it is
The manifest row's Hypothesis cell renders a controlled @tui/ui/select over that hypothesis's revisions once its own revisions query has settled; before that it renders plain text, never an interactable-but-empty control.
The Select's shown value always reflects the entry's own pinned revision, disables proactively once the case version is known released, and links a repin failure's message to the actual focusable trigger via an imperative ref workaround.

## Notes
Fixed three code-cause defects a failed suite surfaced across two rounds: the trigger reading as "no revision pinned" while options were still loading or the pin was off-page, the Select staying enabled on an already-released version until a write failed, and aria-invalid/aria-describedby landing on a non-focusable wrapper instead of the combobox.
One test in this task's own spec file — the "possibly-already-released row" disabled-state assertion — has an incomplete fixture (never sets `state: "released"`) and cannot pass without regressing three sibling tests sharing that same fixture; a second, independent diagnosis confirmed the implementation's reading is correct. Deferred to the human rather than resolved by editing the test.
