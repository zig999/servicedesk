---
target: frontend
title: Manifest builder places an already-composed hypothesis
summary: Adds a candidate-hypotheses picker to the version manifest builder that places an existing, already-composed
  hypothesis through the existing placeMutation, with its own position-occupied telling.
task: sha256:e37014b7f6c9bc88ab42e51c630bdda4dc29674ade2514315ac34b6dd3bcf989
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/manifest-builder-places-existing-hypothesis-build
files:
- path: src/hooks/use-manifest-builder.ts
  effect: adds candidateHypotheses/candidatesAnswered (the case's own hypotheses, via useCaseHypotheses,
    less the version's current manifest rows), a placeExistingError state scoped by hypothesis name, a
    new "place-existing" placeMutation call kind with its own ManifestPositionOccupiedError branch (falling
    through to the existing generic toast for every other refusal, including one for a hypothesis already
    manifested), and an onPlaceExisting dispatcher -- all exposed on the "ready" phase of ManifestBuilderState.
- path: src/routes/place-existing-hypothesis-control.tsx
  effect: new component. Renders the candidate-hypothesis Select, a RevisionPicker subcomponent (reusing
    useManifestRowRevisions, defaulting to the hypothesis's highest revision but changeable), a free-entry
    position Input, and a Confirm button that calls the hook's onPlaceExisting with exactly the chosen
    hypothesis name, revision and position; states the loading and no-further-candidates conditions distinguishably,
    and shows the position-occupied refusal against the chosen hypothesis without resetting it.
- path: src/routes/version-manifest-screen.tsx
  effect: renders PlaceExistingHypothesisControl beside the manifest table on every non-released "ready"
    reading, wired to the hook's new candidate/error/dispatch state; nothing else in the file's rendering
    changed.
criteria:
- criterion: On a draft version's manifest builder whose version record has arrived, the surface offers
    a control whose choices are the case's already-composed hypotheses, named by hypothesis name.
  met: true
  how: PlaceExistingHypothesisControl is rendered once state.phase === "ready" (the version record has
    arrived), with its Select's options built from state.candidateHypotheses, each option's value/label
    the hypothesis's own name.
- criterion: That control's choices exclude every hypothesis this version's manifest already holds as
    a row.
  met: true
  how: candidatesOf() in use-manifest-builder.ts filters the case-hypotheses read against a Set of the
    current rows' hypothesisName, so a manifested hypothesis is never a candidate.
- criterion: When every already-composed hypothesis of the case is already held by this version's manifest,
    the control offers no hypothesis to place.
  met: true
  how: candidatesOf() returns an empty array in that case, and the component's candidates.length === 0
    branch renders no Select at all.
- criterion: On that same reading the surface states that the case holds no further composed hypothesis
    to place, distinguishable from a choice list whose own read has not settled.
  met: true
  how: candidatesAnswered (caseHypothesesQuery.isSuccess) gates two distinct texts -- LOADING_CANDIDATES_MESSAGE
    while not yet answered, NO_FURTHER_HYPOTHESES_MESSAGE once answered with nothing left.
- criterion: Choosing a hypothesis and confirming the placement issues exactly one PUT to /v1/cases/{slug}/versions/{version}/manifest/{hypothesisName}
    for that placement.
  met: true
  how: handleConfirm calls onPlace once, which calls the hook's placeExisting(), which calls placeMutation.mutate()
    once against the same PUT endpoint every other kind already uses; the Confirm button disables once
    isBusy/rowsDisabled is true, so a second click before the first settles is refused by the control.
- criterion: That request's body carries both revision and position, neither omitted, for a placement
    into a manifest that does not yet hold the hypothesis.
  met: true
  how: 'JSON.stringify({ revision: vars.revision, position: vars.position }) is unchanged and always populated;
    canConfirm requires both a chosen revision and a valid integer position before Confirm is enabled
    at all.'
- criterion: The revision carried is the revision of the chosen hypothesis the curator selected on the
    placing control, defaulting to that hypothesis's highest existing revision but changeable to any other
    of its own revisions before confirming.
  met: true
  how: RevisionPicker seeds its parent-held revision state from useManifestRowRevisions' highestRevision
    the first time it is unset, and every subsequent Select choice overwrites it via onChange before Confirm
    reads it.
- criterion: The position carried is one the curator declares on the placing control, and is never derived
    from how many entries this version's current manifest holds or from any other fact of that manifest.
  met: true
  how: positionText is a free-entry Input starting empty; the only value ever passed to onPlace is Number(positionText),
    with no reference anywhere to rows.length or any row's position.
- criterion: After a settled placement the manifest builder shows the placed hypothesis as a row of the
    manifest table without the curator reloading the screen.
  met: true
  how: placeMutation's onSuccess (unchanged) calls invalidateManifest(), refetching the case-version query
    the table's rows are derived from.
- criterion: A settled placement emits the manifest placement telemetry event naming the case slug, the
    version, the hypothesis name and the position, as the builder's existing move and repin placements
    do.
  met: true
  how: telemetry.manifestHypothesisPlaced in onSuccess is unchanged and fires for every kind, "place-existing"
    included, with the same slug/version/hypothesis_name/position fields.
- criterion: A placement refused because the position is already occupied states, against the chosen hypothesis
    on the placing control, that this version's manifest already places a different hypothesis at the
    position that placement named and that this version's manifest stands exactly as it stood before the
    act — not only as the builder's generic save-failure toast — distinguishable from the telling the
    builder already states for a remove-hypothesis refused because the manifest would then hold no hypothesis.
  met: true
  how: onError's manifest-position-occupied branch, for vars.kind === "place-existing", sets placeExistingError
    keyed to that hypothesis name and returns before the generic toast; PLACE_EXISTING_POSITION_BLOCKED_MESSAGE
    states both facts and is worded distinctly from REMOVE_BLOCKED_MESSAGE; the control keeps its selected
    hypothesisName unchanged on submit so the error stays matched to it.
- criterion: A placement refused because the hypothesis is already manifested in this version discloses
    neither the refusal's own error code, its message, nor any value it carries, and is presented as the
    same notice the builder already shows for a place or a remove refused with a code it holds no named
    presentation for.
  met: true
  how: no error code is mapped to this outcome in error-ui-state.ts, so errorStateKind returns null/generic-error
    for it, which falls through every named branch in placeMutation's onError to the same toast.error(GENERIC_FAILURE_MESSAGE)
    already shown for any other unrecognised refusal.
- criterion: On a released version's reading the placing control is not offered, as the composing route
    already is not.
  met: true
  how: PlaceExistingHypothesisControl is wrapped in {!state.isReleased && (...)} in version-manifest-screen.tsx,
    the same gate AddHypothesisLink already uses.
- criterion: The existing "+ Add hypothesis" route to the New Hypothesis screen stays offered on every
    reading of the manifest builder that offers it today.
  met: true
  how: AddHypothesisLink's own rendering in the loading/load-error/not-valid/ready phases is untouched
    by this delivery.
- criterion: The placement goes through use-manifest-builder.ts's existing placeMutation, and the frontend
    holds no second call site issuing PUT over a manifest entry.
  met: true
  how: placeExisting() calls the same placeMutation.mutate() every other placing act uses; no new apiFetch
    PUT call was added anywhere.
- criterion: The control's choices are derived from the existing case-hypotheses listing query and the
    existing hypothesis-revisions query, and the frontend gains no third way of finding a hypothesis's
    latest revision.
  met: true
  how: candidateHypotheses is built from useCaseHypotheses; RevisionPicker's default is useManifestRowRevisions'
    highestRevision (itself built on useHypothesisRevisions + latestRevisionOf); neither hook nor the
    "find the latest revision" pattern was reimplemented.
nodes:
- node: contracts/knowledge/case-lifecycle
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  how: this task issues no operation of this contract other than place-hypothesis, through the same PUT
    call every other manifest-builder kind already used, now shared by a third call kind.
- node: contracts/knowledge/case-query
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  - src/routes/place-existing-hypothesis-control.tsx
  how: list-hypotheses (useCaseHypotheses) and list-hypothesis-revisions (useHypothesisRevisions via useManifestRowRevisions)
    are the only two reads the candidate list and its revision default are built from; no new read is
    added.
- node: domain/knowledge/manifest-entry
  encoded_at:
  - src/routes/place-existing-hypothesis-control.tsx
  - src/hooks/use-manifest-builder.ts
  how: the placing control gathers exactly one position and one hypothesis-revision reference per confirm,
    matching this value object's shape, and writes nothing else.
- node: rules/knowledge/a-placing-offered-on-a-manifest-surface-carries-the-cases-hypotheses-that-version-does-not-already-hold
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  - src/routes/place-existing-hypothesis-control.tsx
  how: candidatesOf computes H less M from the case-hypotheses read and the version's own held rows; the
    surface states the no-further-hypothesis absence only once candidatesAnswered is true, distinguishable
    from the loading text shown while it is not. A divergence below records that this delivery reaches
    only the "ready" phase rather than every reading the node names.
- node: rules/knowledge/a-placement-into-a-manifest-holding-no-entry-pins-the-revision-the-curator-names
  encoded_at:
  - src/routes/place-existing-hypothesis-control.tsx
  - src/hooks/use-manifest-builder.ts
  how: the revision sent is exactly RevisionPicker's own held value (the curator's default or override),
    never re-derived at the call site or anywhere in placeMutation.
- node: rules/knowledge/a-first-placements-position-is-the-one-the-curator-declares
  encoded_at:
  - src/routes/place-existing-hypothesis-control.tsx
  how: the position field starts empty and is only ever set by the curator typing into it; onPlace forwards
    that number unchanged, with no reference to rows.length or any row's own position.
- node: rules/knowledge/a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions
  encoded_at:
  - src/routes/version-manifest-screen.tsx
  how: the control is withheld exactly when state.isReleased is true, and offered on the reading this
    task's own criteria reach. A divergence below records that the loading/load-error/not-valid readings,
    which the node also names, are not reached by this task.
- node: rules/knowledge/a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  - src/routes/place-existing-hypothesis-control.tsx
  how: the place-hypothesis half of this node -- ManifestPositionOccupiedError stated against the chosen
    hypothesis, naming the occupying placement and that the manifest stands unchanged -- is implemented
    for the new "place-existing" call kind. The remove-hypothesis half is left to the prior task that
    already delivered it, recorded as a REMAINDER divergence below.
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  how: this task adds no collision logic of its own; it extends the existing ManifestPositionOccupiedError
    branch in placeMutation.onError with a place-existing-specific telling, while the invariant itself
    is enforced server-side exactly as before.
inferences:
- inferred: a case-hypotheses read that has failed (isError) is treated the same as one that has not yet
    answered -- the placing control shows the loading text, offers no candidate and states no absence
    -- rather than as a third, distinct state.
  from: the bound rule states only a two-way split ("answered" vs "has not answered"), and its own description
    treats the parallel manifest-of-the-version read the same way ("refused ... or not yet having answered"
    both leave M empty), so a refused read of the case's hypotheses is read as another form of "has not
    answered".
- inferred: the position field on the new placing control starts empty, with no pre-filled number, rather
    than defaulting to any value.
  from: a-first-placements-position-is-the-one-the-curator-declares says the position is "never derived
    ... from any other fact of that manifest" and states no default of its own; an empty field forcing
    an explicit entry introduces nothing the node did not state.
- inferred: placing an existing hypothesis needs no confirmation dialog before it executes, unlike the
    existing Remove act.
  from: 'the manifest builder''s own established convention: move, repin and (via this task) place-existing
    act immediately, while only Remove -- which can empty the manifest -- is gated behind a confirmation
    dialog; no bound node requires a confirmation for placing.'
divergences:
- from: rules/knowledge/a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions
    and rules/knowledge/a-placing-offered-on-a-manifest-surface-carries-the-cases-hypotheses-that-version-does-not-already-hold
  departure: the placing control and its candidate list are rendered only on the manifest builder's "ready"
    phase; they are absent on the loading, load-error and not-valid readings, where both nodes require
    the act offered with every one of the case's own hypotheses as a candidate.
  why: the task's own criteria are written over the "ready" phase alone and are satisfied by this narrower
    rendering; the task's Notes name this exact gap as UNDERDETERMINED and stop at the criteria's own
    scope rather than closing the specification's fuller requirement, so this delivery follows the criteria
    and discloses the narrowing rather than widening the task.
- from: rules/knowledge/a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for
  departure: this delivery adds no telling for a remove-hypothesis refused as ManifestWouldHoldNoHypothesisError.
  why: the task's Notes name that telling as a REMAINDER belonging to the builder's existing remove act,
    already delivered by a prior task (REMOVE_BLOCKED_MESSAGE in removeMutation), and outside this task's
    own scope of placing an existing hypothesis.
- from: contracts/knowledge/case-query (constraints/listings-are-paged, via list-hypotheses and list-hypothesis-revisions)
  departure: candidate hypotheses and each candidate's default revision are computed from the single page
    useCaseHypotheses and useHypothesisRevisions/useManifestRowRevisions request, not from the case's
    whole hypotheses or a hypothesis's whole revision history.
  why: the task's Notes disclose this as an ADVISORY coincidence -- today's hooks request no offset or
    limit, so within this task's own scope the paged and unpaged reads answer alike; implementing paging
    is outside this task's objective.
- from: the manifest builder's existing move/repin telemetry convention (use-manifest-builder.ts, placeMutation.onSuccess)
    -- no specification node backs a telemetry criterion
  departure: the placement telemetry event for the new "place-existing" call kind is implemented purely
    as a non-regression match to the existing move/repin convention, not as encoding any bound specification
    node.
  why: the task's Notes disclose that this project's specification holds no telemetry vocabulary, so the
    telemetry criterion is read as a convention this task follows rather than a node it implements.
- from: the hypothesis-composition route already delivered by a prior task (AddHypothesisLink in version-manifest-screen.tsx)
  departure: this delivery leaves the "+ Add hypothesis" link's rendering conditions untouched.
  why: the task's Notes name that criterion as a non-regression guard over a route already delivered by
    a prior task, not new work for this task's own implementation of a-hypothesis-composition-stands-on-a-reading-whose-anchoring-version-does-not-read-back-as-a-case.
preserved:
- the existing move/repin placements (placeMutation kind "move" | "repin") and their own row-scoped tellings
  (MOVE_BLOCKED_MESSAGE, REVISION_FAILURE_MESSAGE).
- the existing remove act (removeMutation) and REMOVE_BLOCKED_MESSAGE telling, untouched.
- the "+ Add hypothesis" link's existing rendering across the loading, load-error, not-valid and ready
  (non-released) phases.
- the manifest table's existing rows, revision-repin control, and remove confirmation dialog.
- the isBlocked conflict banner and the case-version-not-draft handling shared by every mutation.
deferred:
- what: use-hypothesis-revision-form.ts's post-compose "Open Manifest Builder" affordance does not pre-select
    the just-composed hypothesis on the new placing control when the curator lands back on the manifest
    builder.
  why: named by the inventory as a risk but outside this task's own objective, which is only that an existing
    hypothesis can be placed at all; wiring a hand-off between the two screens is a separate task.
- what: the candidate list and revision defaults read only the first page of the case's hypotheses and
    of a hypothesis's revisions.
  why: already recorded above as a divergence from case-query's paging constraint; implementing paging
    reaches past this task's own scope and matches today's whole-codebase convention of unpaged reads.
---

## What it is
Adds a candidate-hypotheses picker to the version manifest builder that places an already-composed hypothesis of the case into the draft version's manifest, reusing the existing placeMutation with a new call kind and its own position-occupied telling.

## Notes
Build (install/typecheck/lint/style/build/a11y/secret-scan) captured clean at run/manifest-builder-places-existing-hypothesis-build.
