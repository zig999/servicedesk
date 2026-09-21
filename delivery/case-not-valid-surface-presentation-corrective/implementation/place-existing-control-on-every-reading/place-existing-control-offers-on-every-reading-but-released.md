---
target: frontend
title: The manifest builder's place-existing-hypothesis control offers on every reading but a released
  version
summary: version-manifest-screen.tsx and use-manifest-builder.ts stop gating PlaceExistingHypothesisControl
  and its candidate list to the "ready" phase, so the control and the case's own unplaced hypotheses are
  offered on the loading, load-error and not-valid readings too, and the not-valid statement now names
  the version rather than reusing case-keyed wording.
task: sha256:00a865d0dc65480fc67a5985b47e78879996d888a83eb967bb02bf8e24d24326
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/place-existing-control-every-reading-build
files:
- path: src/hooks/use-manifest-builder.ts
  effect: Computes the placing-offer fields (candidateHypotheses, candidatesAnswered, placeExistingError,
    onPlaceExisting, isBusy, isBlocked) once per call, from caseHypothesesQuery and hook-local mutation
    state alone -- never from versionQuery.data -- and returns them on the loading, load-error and not-valid
    phases exactly as it already did on ready; candidatesOf(hypotheses, []) is reused unchanged for the
    three early phases since none of them answers a manifest to exclude against. The not-valid branch
    still returns before ever reading versionQuery.data, so no title, state or manifest row -- fresh or
    left in the TanStack Query cache under ["case-version", slug, version] -- reaches the returned state.
    placeExisting and isBusy were hoisted above the phase branches so all four phases can reference them.
- path: src/routes/version-manifest-screen.tsx
  effect: Builds one placingControl element per render from the widened hook state and renders it on the
    loading, load-error and not-valid branches alongside their existing statements, in addition to the
    unchanged ready-branch placement. The not-valid branch's statement now reads "Version {version} of
    this case does not read back as a case." instead of the case-keyed "This case's current version does
    not read back as a case."
criteria:
- criterion: On the manifest builder's loading reading (the version's own read has not yet answered),
    the screen still indicates the version read is pending, and the placing control is offered alongside
    that indication.
  met: true
  how: The "loading" branch keeps its unchanged "Loading manifest…" paragraph and now also renders {placingControl},
    sourced from the widened hook state's loading-phase fields.
- criterion: On the manifest builder's load-error reading (the version's own read failed with a code the
    screen holds no presentation of its own for), the screen still states that read as one that did not
    complete and still offers the existing act to retry it, disclosing no error code, message or value
    the refusal carries, and the placing control is offered alongside that statement.
  met: true
  how: The "load-error" branch keeps its unchanged static "Unable to load this manifest right now." text
    and Retry button (which only calls state.retryLoad, never reading anything off the refusal itself),
    and now also renders {placingControl}.
- criterion: On the manifest builder's not-valid reading (the version's own read was refused because a
    validator rule of validation-runs-at-every-read does not hold), the screen states explicitly that
    the version named — this slug together with this version number — does not read back as a case, distinct
    from the wording a case-keyed surface (one addressed by slug alone) uses for a case whose current
    version does not read back as a case, and the placing control is offered alongside that statement.
  met: true
  how: The "not-valid" branch's statement now reads "Version {version} of this case does not read back
    as a case." -- naming the version number the reader addressed this version-keyed surface by -- distinct
    from the case-keyed text used on surfaces addressed by slug alone; {placingControl} now renders alongside
    it.
- criterion: On the not-valid reading, the screen presents no attribute of the named version and no entry
    of that version's manifest as its current content — no title, no state, no manifest row, whether read
    fresh or left in the query cache from an earlier successful read of the same version — beside the
    version-keyed statement and the placing control.
  met: true
  how: In useManifestBuilder, the not-valid branch returns before any code in the function reads versionQuery.data;
    the offer is built solely from caseHypothesesQuery.data and hook-local mutation state (a separate
    query key, ["case-hypotheses", slug]), so nothing this branch returns can carry a title, state or
    manifest row from the ["case-version", slug, version] cache entry, fresh or stale.
- criterion: On each of those three readings, the control's candidates are exactly the case's own already-composed
    hypotheses that read answered, with none excluded (since none of those readings answers a manifest
    to exclude against), turning on nothing about which validator rule failed over the version, where
    the reading is the not-valid one.
  met: true
  how: candidateHypotheses is computed once as candidatesOf(caseHypothesesQuery.data?.data ?? [], [])
    -- the same helper the ready reading uses, called with an empty rows array -- and is identical across
    the loading, load-error and not-valid phases; it never inspects errorStateKind or which validator
    rule failed.
- criterion: On each of those three readings, once the case's own hypotheses read has answered and leaves
    no candidate, the control states explicitly that the case holds no hypothesis that is not already
    in this version's manifest, distinguishable from what it shows while that read has not yet answered.
  met: true
  how: PlaceExistingHypothesisControl (unmodified this task) already branches on candidatesAnswered and
    candidates.length, showing NO_FURTHER_HYPOTHESES_MESSAGE only once answered-and-empty and LOADING_CANDIDATES_MESSAGE
    while unanswered; both are now threaded onto all three widened phases.
- criterion: On each of those three readings, the control still lets the curator choose the revision and
    declare the position exactly as it does on the ready reading — a default may be pre-selected, but
    neither value is fixed or derived from anything other than the curator's own choice before confirming.
  met: true
  how: PlaceExistingHypothesisControl's own RevisionPicker and Position Input, both unmodified this task,
    are the same component instance reused unchanged on all four phases via placingControl.
- criterion: Confirming a placement on any of those three readings still issues exactly one PUT to /v1/cases/{slug}/versions/{version}/manifest/{hypothesisName},
    with the same body shape (revision, position) as on the ready reading.
  met: true
  how: 'placeExisting (hoisted above the phase branches, logic unchanged) is the one function referenced
    as onPlaceExisting on every phase; it always calls placeMutation.mutate({ hypothesisName, revision,
    position, kind: "place-existing" }), whose mutationFn issues one PUT with body { revision, position
    } -- phase-independent and unmodified.'
- criterion: A placement confirmed on any of those three readings and refused because the position is
    already occupied states the same telling, against the chosen hypothesis, that the ready reading's
    control already states for that refusal — naming the collision and that the manifest stands unchanged
    — not the generic unrecognised-failure notice.
  met: true
  how: placeExistingError state and the setPlaceExistingError call inside placeMutation's onError (unchanged)
    were always declared at the hook's top level, independent of phase; they are now surfaced via offer.placeExistingError
    on the three widened phases.
- criterion: A placement confirmed on any of those three readings and refused because the hypothesis is
    already manifested in this version, or for any other reason this control holds no named telling for,
    discloses neither the refusal's own error code, its message, nor any value it carries.
  met: true
  how: Any other errorStateKind falls through to the unchanged toast.error(GENERIC_FAILURE_MESSAGE) in
    placeMutation's onError, a fixed string disclosing nothing about the refusal, phase-independent.
- criterion: On a reading that answered the version released, the placing control stays withheld, exactly
    as it already is.
  met: true
  how: The ready branch's guard {!state.isReleased && placingControl} is the same withholding condition
    as before; the three widened phases are, by construction, exactly the readings where the version has
    not been read as released.
- criterion: On the ready reading (draft, whether the manifest holds entries or none), the control's own
    behavior — the candidate-exclusion filter, the empty-state statement, the refusal tellings — is unchanged
    from what the prior task already delivered.
  met: true
  how: The ready branch's own logic (rows, isBlocked, isBusy, isReleased, candidateHypotheses via candidatesOf(hyps,
    rows), candidatesAnswered, placeExistingError, onPlaceExisting) is untouched.
nodes:
- node: contracts/knowledge/case-lifecycle
  how: Constrains what place-hypothesis does over the wire; this task changes only which readings can
    reach it, never the call itself.
- node: contracts/knowledge/case-query
  how: Constrains the reads this screen makes (read-case via versionQuery, list-hypotheses via useCaseHypotheses);
    both are reused unchanged across the widened phases.
- node: domain/knowledge/case-version
  encoded_at:
  - src/routes/version-manifest-screen.tsx
  how: Governs manifest composition and its own state narrowing the placing offer; the ready branch's
    isReleased-based withholding is unchanged, and the widened phases never claim released state.
- node: domain/knowledge/hypothesis
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  how: A hypothesis's stable identity is what caseHypothesesQuery answers and candidatesOf filters against;
    reused unchanged on all phases.
- node: domain/knowledge/hypothesis-revision
  how: The curator's chosen revision flows through PlaceExistingHypothesisControl's RevisionPicker (unmodified)
    into placeExisting's revision argument on every phase.
- node: domain/knowledge/manifest-entry
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  how: The position/revision pin the PUT body carries is unchanged; this task only widens which readings
    can issue that PUT.
- node: rules/knowledge/a-first-placements-position-is-the-one-the-curator-declares
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  how: placeExisting forwards the position argument PlaceExistingHypothesisControl's own Input collected,
    untouched, into the PUT body on every phase.
- node: rules/knowledge/a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  - src/routes/version-manifest-screen.tsx
  how: ManifestPositionOccupiedError still resolves to PLACE_EXISTING_POSITION_BLOCKED_MESSAGE against
    the chosen hypothesis, and every other code still falls to the generic notice, both now reachable
    on the loading, load-error and not-valid phases.
- node: rules/knowledge/a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  - src/routes/version-manifest-screen.tsx
  how: This is the node the task closes. The offer is now rendered on loading, load-error and not-valid
    alongside ready, and withheld only where state.isReleased is true.
- node: rules/knowledge/a-placement-into-a-manifest-holding-no-entry-pins-the-revision-the-curator-names
  how: Governs PlaceExistingHypothesisControl's own revision-pinning behavior, unmodified this task; honored
    by reuse on every phase.
- node: rules/knowledge/a-placing-offered-on-a-manifest-surface-carries-the-cases-hypotheses-that-version-does-not-already-hold
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  how: The other node the task closes. candidatesOf(caseHypothesesQuery.data?.data ?? [], []) computes
    H less nothing on all three early phases, and the empty/loading distinction now runs there too.
- node: rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
  how: This screen is version-keyed, not case-keyed, so this node's own statement obligation does not
    reach it directly; honored only by contrast -- the corrected not-valid wording is deliberately distinct
    from this node's case-keyed statement and never reused on this surface.
- node: rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
  encoded_at:
  - src/routes/version-manifest-screen.tsx
  - src/hooks/use-manifest-builder.ts
  how: The not-valid branch now states "Version {version} of this case does not read back as a case."
    -- naming the version the reader addressed -- and presents no attribute of the version and no manifest
    row beside it, because the branch returns before versionQuery.data is ever read.
inferences:
- inferred: The exact not-valid wording "Version {version} of this case does not read back as a case."
  from: The task's own Notes, which give this as example wording, and the node's own leeway ("Which control
    carries the statement, how it is worded... are form and belong to the interface").
- inferred: The disabled prop passed to the placing control on the loading/load-error/not-valid phases
    is state.isBlocked || state.isBusy, omitting isReleased (which does not exist on those phases).
  from: a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions's own
    reasoning that only the released state narrows the offer, and the ready branch's existing rowsDisabled
    combination, which reduces to the same value once isReleased is false -- the only value the control's
    own disabled prop can ever observe, since it is withheld outright when isReleased is true.
- inferred: PlaceExistingHypothesisControl needs no TooltipProvider wrapper on the three widened phases.
  from: Reading place-existing-hypothesis-control.tsx's own imports, which include no Tooltip component.
divergences:
- cites: MNT-01
  file: src/routes/version-manifest-screen.tsx
  departure: The file now stands at 316 lines, past the standard's 300-line ceiling for a component file.
  why: The file already exceeded the limit before this task (310 lines, from the prior task's own delivery)
    -- a pre-existing overage this corrective task did not introduce. The net addition was kept to 6 lines
    by sharing one placingControl element and a placingDisabled constant across every phase. Extracting
    a further subcomponent into a new file would bring the count under 300, but the task named exactly
    two files to correct; introducing a third file to resolve a pre-existing, only marginally worsened
    overage reaches past this corrective task's own scope.
preserved:
- The ready reading's manifest composition -- rows, move/repin/remove mutations and their refusal tellings
  (MOVE_BLOCKED_MESSAGE, REVISION_FAILURE_MESSAGE, REMOVE_BLOCKED_MESSAGE), the isBlocked ConflictBanner,
  and isReleased withholding both AddHypothesisLink and the placing control.
- The loading and load-error branches' existing static statements and the load-error branch's Retry button,
  calling only state.retryLoad.
- PlaceExistingHypothesisControl's own internal behavior (candidate loading/empty-state messages, RevisionPicker's
  pre-selection effect, the Position input) -- file untouched this task.
- The exact PUT shape ({ revision, position } to /v1/cases/{slug}/versions/{version}/manifest/{hypothesisName})
  and the manifestHypothesisPlaced telemetry call on a successful placement.
deferred:
- what: version-manifest-screen.tsx's pre-existing MNT-01 overage (310 lines before this task) is not
    brought under 300.
  why: Resolving it requires extracting a subcomponent into a new file, which reaches past the two files
    this corrective task named; that restructuring belongs to its own task.
- what: ConflictBanner is not surfaced on the loading, load-error or not-valid phases, only on ready.
  why: None of this task's 12 criteria, nor the nodes it implements, speak to the ConflictBanner on those
    phases.
---

## What it is
Widens the place-existing-hypothesis control to every reading but a released version, and corrects the not-valid branch's case-keyed wording to name the version instead.

## Notes
Build (install/typecheck/lint/style/build/a11y/secret-scan) captured clean at run/place-existing-control-every-reading-build.
