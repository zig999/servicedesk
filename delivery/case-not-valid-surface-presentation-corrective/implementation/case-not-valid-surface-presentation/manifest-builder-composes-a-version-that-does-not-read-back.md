---
target: frontend
title: Manifest builder states a version that does not read back as a case, offers
  the add-hypothesis act on every reading short of a released one, and tells the curator
  when a remove is refused because it would empty the manifest
summary: use-manifest-builder.ts classifies a refused case-version read via errorStateKind,
  offers the add-hypothesis act on every reading except an answered-released one,
  and now visibly tells the curator when a remove is refused as ManifestWouldHoldNoHypothesisError,
  while every other mutation-refusal handler stays unchanged.
task: sha256:1770ce345ef6b081396df7a6b180d4d3c9d9494f3d5f584e763450f978403b13
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/case-not-valid-surface-presentation-manifest-builder-composes-a-version-that-does-not-read-back-build-3
files:
- path: src/hooks/use-manifest-builder.ts
  effect: 'ManifestBuilderState gains a "not-valid" phase; the versionQuery.isError
    branch calls errorStateKind first and returns { phase: "not-valid" } for "case-not-valid",
    falling through to the generic { phase: "load-error", retryLoad } otherwise. ManifestRow
    gains removeErrorMessage: string | null. removeMutation carries its own removeError
    state (mirroring moveError/revisionError): onError, a refusal classified "manifest-would-hold-no-hypothesis"
    sets removeError to REMOVE_BLOCKED_MESSAGE keyed to the refused hypothesis''s
    name and still calls invalidateManifest(); onSuccess and onRemove clear removeError.'
- path: src/routes/version-manifest-screen.tsx
  effect: AddHypothesisLink is a shared local component rendered unconditionally in
    the loading, load-error and not-valid phases, and in the ready phase gated by
    `!state.isReleased` — offered on every reading except one that answered the version
    released. RowActions now also renders row.removeErrorMessage as its own role="alert"
    paragraph, the same pattern already used for row.moveErrorMessage.
criteria:
- criterion: Opening the manifest builder for a version whose read is refused because
    a validator rule of validation-runs-at-every-read does not hold for that version
    at that reading states explicitly that the version does not read back as a case.
  met: true
  how: use-manifest-builder.ts classifies the refusal via errorStateKind and returns
    phase "not-valid" exactly when that resolves to "case-not-valid"; version-manifest-screen.tsx
    renders the explicit statement for that phase.
- criterion: What that screen states for a version that does not read back as a case
    is distinguishable from what the same screen states for a read of that version
    that did not complete, and neither is presented in place of the other.
  met: true
  how: The hook returns "not-valid" and "load-error" as mutually exclusive branches,
    and the screen renders a different statement for each.
- criterion: On that same reading the screen offers the act of adding a hypothesis
    to that version's manifest, including for a version whose manifest currently holds
    no entry at all.
  met: true
  how: The not-valid branch renders AddHypothesisLink unconditionally. The same act
    is also offered unconditionally on the loading and load-error readings, and correctly
    withheld only on the one reading the node names — the ready phase's read answering
    the version released.
- criterion: A refusal of that screen's read of the version carrying an error code
    the screen holds no presentation of its own for still presents exactly what the
    screen states for a read that did not complete, disclosing neither the error code,
    nor the refusal's message, nor any value the refusal carries.
  met: true
  how: 'Only kind === "case-not-valid" is special-cased on the read; every other error
    code still falls through unchanged to the generic { phase: "load-error", retryLoad
    } branch.'
- criterion: A refusal of a move, a repin or a remove made through that screen still
    presents the statement that screen already holds for that named refusal, unchanged
    by this task.
  met: true
  how: The move refusal (ManifestPositionOccupiedError) and the not-draft refusal
    (isBlocked) are literally unchanged. The remove refusal (ManifestWouldHoldNoHypothesisError)
    is not unchanged — a failure-diagnostician found the screen held no statement
    at all for it; this correction replaced silent invalidateManifest() with a visible
    REMOVE_BLOCKED_MESSAGE alert, which rules/knowledge/a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for
    (already in this task's implements list) requires.
nodes:
- node: rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  - src/routes/version-manifest-screen.tsx
  how: The hook adds the "not-valid" phase carrying no version attribute and no manifest
    entry; the screen's not-valid branch renders only the fixed statement and the
    add-hypothesis act.
- node: rules/knowledge/a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions
  encoded_at:
  - src/routes/version-manifest-screen.tsx
  how: 'AddHypothesisLink is rendered unconditionally on loading, load-error and not-valid,
    and conditionally on the ready phase, gated by `!state.isReleased` — withheld
    on exactly the one condition the node names and offered on every other reading,
    including an answered draft with an empty manifest. This closes both gaps found
    on this node: the earlier pending-reading gap and a failure-diagnostician''s finding
    that the ready phase offered the act even when released.'
- node: rules/knowledge/a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  - src/routes/version-manifest-screen.tsx
  how: Both of the node's two named tellings are now visibly presented. A place-hypothesis
    refused as ManifestPositionOccupiedError still sets moveError and renders MOVE_BLOCKED_MESSAGE,
    unchanged. A remove-hypothesis refused as ManifestWouldHoldNoHypothesisError now
    sets removeError to REMOVE_BLOCKED_MESSAGE, distinct text stating the manifest
    must hold at least one hypothesis and that this entry is still held, rendered
    as its own role="alert" paragraph — replacing the prior silent invalidateManifest()-only
    handling. Every other place/remove refusal still falls to the unchanged GENERIC_FAILURE_MESSAGE
    toast.
- node: rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  - src/routes/version-manifest-screen.tsx
  how: Any refusal of the version read whose code is not case-not-valid still falls
    to the pre-existing generic load-error phase/statement, disclosing no code, message
    or value.
inferences:
- inferred: The "not-valid" phase offers no Retry control, unlike "load-error".
  from: case-version-editor-screen.tsx's own already-delivered "not-valid" branch
    (sibling task).
- inferred: Reused the exact statement text "This case's current version does not
    read back as a case." verbatim.
  from: the task's own Notes instructing reuse of the wording already worded verbatim
    on two delivered screens.
- inferred: The "not-valid", "loading" and "load-error" phases carry no slug/version
    payload of their own in ManifestBuilderState.
  from: version-manifest-screen.tsx already reads slug and version from its own useParams
    call.
- inferred: The repeated add-hypothesis markup was factored into one local AddHypothesisLink({
    slug, version }) component, used at all four phase call sites, with its body later
    collapsed to a single line.
  from: MNT-01's 300-line cap — duplicating the widened act inline, and later adding
    the removeErrorMessage alert block and the release guard, would have pushed the
    file past 300 lines.
- inferred: REMOVE_BLOCKED_MESSAGE reads "This case's manifest must hold at least
    one hypothesis; this entry is still held." — distinct wording from MOVE_BLOCKED_MESSAGE.
  from: 'the coordinator''s correction requiring a statement distinct from MOVE_BLOCKED_MESSAGE,
    and the node''s own text: "this version''s manifest having to declare at least
    one hypothesis and the entry therefore still standing."'
divergences:
- cites: EDG-02
  file: src/routes/version-manifest-screen.tsx
  departure: The not-valid phase presents no Retry control — only the fixed statement
    and the add-hypothesis act.
  why: EDG-02's own reason is a loading state with no failure exit indistinguishable
    from one that is simply slow; the not-valid phase is neither indefinite nor blank.
    Matches the precedent already accepted for case-version-editor-screen.tsx's own
    not-valid branch.
- from: the coordinator's mid-task instruction (first correction) to leave the ready
    phase's own add-hypothesis link and released-state handling untouched
  departure: The ready phase's pre-existing inline <Link> markup for "+ Add hypothesis"
    was replaced with a call to the shared AddHypothesisLink component, and (per the
    coordinator's second, later correction) that call is now gated by `!state.isReleased`.
  why: Widening the act to the loading and load-error phases meant four call sites
    for the same markup, pushing the file past MNT-01's 300-line cap. The later isReleased
    gate was then explicitly requested for that same call site by the coordinator's
    second correction, superseding the first correction's "do not touch" on that one
    point.
- from: criterion 5 of this task ('… unchanged by this task') together with the task's
    own Notes, which stated the write side was out of this scope's reach
  departure: The ManifestWouldHoldNoHypothesisError refusal's presentation was changed
    from a silent invalidateManifest() call to a visible REMOVE_BLOCKED_MESSAGE row
    alert.
  why: A failure-diagnostician reading the red suite found the task's own assumption
    did not hold for this one refusal — the curator saw no telling at all, which the
    node already in this task's implements list requires. The coordinator directed
    the fix land in this same task rather than a separate corrective task.
preserved:
- The case-version-not-draft handling (isBlocked) and the manifest-position-occupied
  handling (MOVE_BLOCKED_MESSAGE) in placeMutation, and the case-version-not-draft
  handling in removeMutation — all literally unchanged.
- The generic GENERIC_FAILURE_MESSAGE toast fallback for every place/remove refusal
  this screen holds no dedicated presentation for.
- The ready phase's rowsDisabled derivation, its ConflictBanner conditional and its
  StatusTable rendering.
- The ["case-version", slug, version] query key's shape and meaning for the five other
  consumers outside this scope.
---

## What it is
The manifest builder distinguishes a version refused for validation from a read that did not complete, keeps a shared "+ Add hypothesis" act offered on every reading short of one answering the version released, and now visibly tells the curator when a remove is refused because it would empty the manifest.

## Notes
Widened and corrected twice mid-task, in response to a sibling task's diagnosed gap and then a failure-diagnostician's own findings on this task's first suite run: the add-hypothesis act's released-reading exclusion was added, and the ManifestWouldHoldNoHypothesisError refusal — previously silent — now carries its own row alert. Both corrections are disclosed above and answer specification nodes already in this task's implements list.
