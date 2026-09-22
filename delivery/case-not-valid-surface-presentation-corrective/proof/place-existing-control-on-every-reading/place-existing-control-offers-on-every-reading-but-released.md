---
target: frontend
title: The placing control's offer widened to every reading but a released version — proof
summary: Five new spec files prove the twelve criteria of widening PlaceExistingHypothesisControl's offer
  -- and its candidate list, revision/position choice, PUT shape and refusal tellings -- from the ready
  reading alone to the loading, load-error and not-valid readings too, and prove the not-valid statement's
  corrected, version-keyed wording and its freedom from any cached content (including a stale released
  state); one pre-existing sibling file's stale wording constant was corrected so its own two tests assert
  what this task actually delivers rather than the case-keyed wording a prior /review-change had already
  flagged as wrong.
implementation: sha256:8e53cdf4849a318cde58b95b47fdf9301366db1e0ab81fb59f776eb72c740a62
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/place-existing-control-every-reading-suite
tests:
- file: src/routes/place-existing-control-every-reading-offer.spec.ts
  name: renders the placing control's own offer alongside the pending indication, the read-did-not-complete
    statement, the not-valid statement, an empty draft and a non-empty draft, and withholds it only once
    the version reads back released
  proves: criterion 1 (pending indication + control offered), criterion 2 (read-did-not-complete statement,
    Retry button, and control offered), criterion 3 (not-valid statement present alongside the control),
    criterion 11 (withheld once released)
  fails_when: the placing control stops rendering on the loading, load-error, not-valid, empty-draft or
    non-empty-draft readings, or continues rendering once the version reads back released, or either pre-existing
    statement stops appearing alongside it.
  demonstrates: rules/knowledge/a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions
- file: src/routes/place-existing-control-not-valid-cache-leak.spec.ts
  name: states the version-keyed not-valid statement on a fresh refusal without the read-did-not-complete
    text, states the read-did-not-complete text on an unrelated failure without the not-valid text, and
    states only the not-valid text -- offering the placing control still -- when the same read is refused
    after a released version with manifest entries was already cached
  proves: criterion 3 (the explicit, version-keyed statement, distinguishable from the read-did-not-complete
    statement), criterion 4 (no attribute or manifest row presented, fresh or left in the query cache
    from an earlier successful, released read)
  fails_when: the not-valid statement stops appearing or stops naming the version, a manifest row appears
    (fresh or left over in the query cache from an earlier successful read of a released version), the
    not-valid and read-did-not-complete statements stop being mutually exclusive, or a released state
    left over in the cache withholds the placing control on the not-valid reading.
  demonstrates: rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
- file: src/routes/place-existing-control-every-reading-candidates.spec.ts
  name: lists every one of the case's own answered hypotheses as a candidate on each of the three readings,
    whatever failed the version's own read, and states the no-further absence once the case's hypotheses
    read answers empty rather than the still-loading statement it shows while that read is pending
  proves: criterion 5 (candidates on the loading, load-error and not-valid readings are exactly the case's
    own answered hypotheses, none excluded, regardless of what refused the version's own read), criterion
    6 (the explicit no-further-hypothesis statement once that read answers empty, distinguishable from
    the still-loading statement)
  fails_when: the candidate list stops carrying every one of the case's own answered hypotheses on the
    loading, load-error or not-valid reading, excludes one of them, the no-further statement fails to
    appear once the case's hypotheses read answers empty, or that statement (or the candidate Select)
    appears while that read is still pending.
- file: src/routes/place-existing-control-every-reading-placement.spec.ts
  name: issues exactly one PUT carrying the curator's own chosen revision -- pre-selected to the hypothesis's
    own highest but freely overridden -- and the curator's own typed position, on each of the three readings
  proves: criterion 7 (revision and position freely chosen, a default may be pre-selected but is not fixed),
    criterion 8 (exactly one PUT with the same body shape as the ready reading)
  fails_when: a confirmed placement on the not-valid, load-error or loading reading issues zero PUTs or
    more than one, or a body whose revision or position differs from what the curator's own selection
    or typing produced.
- file: src/routes/place-existing-control-every-reading-refusal.spec.ts
  name: states the position-occupied telling against the chosen hypothesis, naming the collision and that
    the manifest stands unchanged, and discloses nothing for a refusal it holds no named telling for,
    on each of the three readings
  proves: criterion 9 (the position-occupied telling, naming the collision and the unchanged manifest,
    identical to the ready reading's own), criterion 10 (nothing disclosed -- no code, message or value
    -- for a refusal this control holds no named telling for)
  fails_when: the position-occupied telling stops naming the chosen hypothesis, the position collision
    or that the manifest stands unchanged on any of the three readings, or a refusal this control holds
    no named telling for shows an alert, its own error code, or its own message on any of the three readings.
- file: src/routes/version-manifest-screen-not-valid.spec.ts
  name: renders the explicit statement and no manifest entry when validation refuses the read, renders
    neither that statement nor any load-error text once the same version reads back as a validated case
    (pre-existing test; its NOT_VALID_TEXT constant was corrected this session from the stale case-keyed
    wording to the version-keyed wording this task now delivers -- no other change)
  proves: criterion 3 (core statement, now asserted against the corrected wording)
  fails_when: the not-valid statement stops reading "Version {version} of this case does not read back
    as a case.", a manifest row or the load-error text appears alongside it, or the statement persists
    once the version reads back validated.
- file: src/routes/version-manifest-screen-not-valid.spec.ts
  name: renders only the not-read-back-as-a-case statement, never a manifest entry left over in the query
    cache from an earlier successful read, once a later reading of the same version is refused for validation
    (pre-existing test; unaffected in substance by this session's constant fix)
  proves: criterion 4 (manifest-row cache-leak guarantee, non-released case)
  fails_when: a manifest row cached from an earlier successful, non-released read appears once the same
    version is later refused for validation.
- file: src/routes/version-manifest-screen-not-valid.spec.ts
  name: a refusal carrying an error code the screen holds no presentation of its own for states only the
    read-did-not-complete statement, disclosing nothing further (pre-existing, untouched this session;
    its assertions do not reference NOT_VALID_TEXT's value)
  proves: criterion 2 (the load-error statement discloses no error code, message or value the refusal
    carries)
  fails_when: the refusal's own error code, its message, or any value or manifest content it carries appears
    on screen instead of the fixed read-did-not-complete statement.
- file: src/routes/place-existing-hypothesis-control.spec.ts
  name: (unmodified this session; its three existing tests -- the candidate-exclusion listing, the loading/no-further
    distinction, and the released-reading withholding)
  proves: criterion 12 (the ready reading's candidate-exclusion filter and empty-state statement are unchanged)
  fails_when: the ready reading's candidate list stops excluding this version's already-placed hypotheses,
    or its no-further/loading statements regress.
- file: src/routes/place-existing-hypothesis-control-placement.spec.ts
  name: (unmodified this session; its four existing tests over the ready reading's PUT body, revision
    override, position and post-placement row/telemetry)
  proves: criterion 12 (the ready reading's placement mechanics are unchanged)
  fails_when: the ready reading's confirmed placement stops sending the curator's own revision/position,
    or the post-placement row or telemetry regresses.
- file: src/routes/place-existing-hypothesis-control-refusal-telling.spec.ts
  name: (unmodified this session; its existing test over the ready reading's own refusal tellings)
  proves: criterion 12 (the ready reading's refusal tellings are unchanged)
  fails_when: the ready reading's position-occupied telling, its distinctness from the remove-hypothesis
    telling, or its silence on an unnamed refusal regresses.
not_applicable:
- edge_case: A second, concurrent placement against the same subject (two curators, or two tabs, placing
    at once)
  why: no criterion of this task and no node it implements names concurrency; the case-version-not-draft/isBlocked
    handling this would exercise is unchanged, pre-existing behavior outside this task's own criteria.
- edge_case: Malformed or missing position/revision input on the widened readings
  why: PlaceExistingHypothesisControl's own form validation (canConfirm, positionIsValid) is unmodified
    this task and no criterion revisits it; it is exercised, unchanged, by the pre-existing sibling proof
    on the ready reading.
- edge_case: A hypothesis appearing twice in the candidate list
  why: candidatesOf's own dedup-by-identity logic is unmodified this task and untouched by any of its
    twelve criteria.
untested:
- contracts/knowledge/case-lifecycle -- publishes the whole backend operation surface; this task's frontend
  tests decide only that place-hypothesis is issued, unchanged, from more readings -- never the contract's
  own whole fact.
- contracts/knowledge/case-query -- publishes the whole set of synchronous reads; this task's tests reuse
  two of them unchanged and decide nothing about the contract as a whole.
- domain/knowledge/case-version -- an aggregate root spanning the whole backend; this task's tests exercise
  only the isReleased-withholding facet, never the aggregate's whole fact.
- domain/knowledge/hypothesis -- a stable identity's uniqueness across every version a case ever holds
  -- not decidable by a finite frontend component test.
- domain/knowledge/hypothesis-revision -- an aggregate root governing content, release and immutability;
  this task's frontend tests forward a chosen revision number and decide nothing about the aggregate's
  own whole fact.
- domain/knowledge/manifest-entry -- its full fact includes that reordering changes only position, never
  the referenced revision -- move/repin logic this task did not touch.
- rules/knowledge/a-first-placements-position-is-the-one-the-curator-declares -- states what position
  is written server-side; a frontend test can show only what the curator typed reaches the PUT body unchanged,
  never what the backend actually persists.
- rules/knowledge/a-placement-into-a-manifest-holding-no-entry-pins-the-revision-the-curator-names --
  same reasoning; states which revision is pinned server-side.
- rules/knowledge/a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for -- its whole
  fact spans place-hypothesis's telling and remove-hypothesis's telling; this task's own tests decide
  only the place-hypothesis half on the three widened readings, since no manifest table exists there.
- rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
  -- governs a case-keyed surface's own fallback statement; this screen is version-keyed and the implementation
  record itself states the node's own obligation does not reach it.
- rules/knowledge/a-placing-offered-on-a-manifest-surface-carries-the-cases-hypotheses-that-version-does-not-already-hold
  -- its general formula spans both the ready reading's non-empty-subtraction case (unchanged, proven
  elsewhere) and the three widened readings' always-empty-subtraction case (proven here); no single test
  in this proof decides the general formula whole across every subtraction state.
---

## What it is
The proof for widening the placing control's offer to every reading but a released version, its corrected not-valid wording, and its freedom from cached content.

## Notes
Suite captured at run/place-existing-control-every-reading-suite.
