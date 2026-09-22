---
target: frontend
title: Manifest builder places an already-composed hypothesis — proof
summary: One new spec file proves the 16 stated criteria (14 by new tests, one -- the "+ Add hypothesis"
  non-regression guard -- already proven by the pre-existing not-valid spec, one -- no third way of finding
  a revision -- proven jointly by every confirm-flow test's strict fetch stub) and the four node facts
  a finite test can decide whole; three nodes and one inference are left unproven and named, matching
  the task's own disclosed divergences.
implementation: sha256:507ee566b5550819bd1620960639ca792948c579bef751452275b53a36b8eaa8
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/manifest-builder-places-existing-hypothesis-suite-3
tests:
- file: src/routes/place-existing-hypothesis-control.spec.ts
  name: PlaceExistingHypothesisControl — the picker's own choices, once the version and the case's hypotheses
    have both answered (criterion 1, criterion 2) > lists, by hypothesis name, exactly the case's own
    hypotheses this version's manifest does not already hold as a row
  proves: Criterion 1 (the control's choices are the case's already-composed hypotheses, named by hypothesis
    name) and criterion 2 (choices exclude every hypothesis this version's manifest already holds as a
    row)
  fails_when: the candidate listbox stops excluding a hypothesis the manifest already holds a row for,
    or stops offering one it does not, or stops labelling an option by the hypothesis's own name
- file: src/routes/place-existing-hypothesis-control.spec.ts
  name: PlaceExistingHypothesisControl — no further hypothesis to place, told apart from a read that has
    not settled (criterion 3, criterion 4) > shows a loading statement offering no hypothesis and stating
    no absence while the case's hypotheses read has not answered, and switches to an explicit no-further-hypothesis
    statement offering no Select once that read answers leaving nothing beyond this version's own manifest
  proves: Criterion 3 (no hypothesis offered once every composed hypothesis is already manifested) and
    criterion 4 (the case-holds-no-further statement, distinguishable from a read that has not settled)
  fails_when: the two readings stop showing distinct texts, either text appears on the wrong reading,
    or a Select is offered on either reading
- file: src/routes/place-existing-hypothesis-control.spec.ts
  name: PlaceExistingHypothesisControl — withheld on a released version's reading (criterion 13) > renders
    no candidate Select, no loading statement and no no-further-hypothesis statement once the version
    reads back released
  proves: Criterion 13 (the placing control is not offered on a released version's reading)
  fails_when: any part of the control (Select, loading text or no-further text) still renders once the
    version reads back released
- file: src/routes/place-existing-hypothesis-control-placement.spec.ts
  name: PlaceExistingHypothesisControl — the PUT a confirmed placement issues, defaulting the revision
    to the chosen hypothesis's own highest (criteria 5, 6, 7 [default half], 15; domain/knowledge/manifest-entry)
    > issues exactly one PUT to that hypothesis's own manifest endpoint, carrying a body that is exactly
    its highest existing revision paired with the curator's own declared position
  proves: Criterion 5 (exactly one PUT to the placement endpoint), criterion 6 (body carries both revision
    and position, neither omitted), criterion 7's default half (revision defaults to the hypothesis's
    own highest), and criterion 15 (the act goes through the existing placement endpoint, no second call
    site -- the strict fetch stub would reject any other URL)
  fails_when: the confirm act issues zero or more than one PUT, targets a URL other than this hypothesis's
    own manifest endpoint, or the body omits either field, carries an extra field, or does not default
    the revision to the highest one answered
  demonstrates: domain/knowledge/manifest-entry
- file: src/routes/place-existing-hypothesis-control-placement.spec.ts
  name: PlaceExistingHypothesisControl — overriding the default revision before confirming (criterion
    7 [override half]; rules/knowledge/a-placement-into-a-manifest-holding-no-entry-pins-the-revision-the-curator-names)
    > sends exactly the revision the curator switched to, never the hypothesis's own highest the picker
    defaulted to, whatever state either revision carries
  proves: Criterion 7's override half (the revision is changeable to any other of the hypothesis's own
    revisions before confirming) and the node's whole fact (the placement carries exactly the revision
    the curator named, never a substituted one, regardless of either revision's own state)
  fails_when: the placement's body still carries the picker's own default revision, or any revision other
    than the one the curator explicitly chose, after that choice was made
  demonstrates: rules/knowledge/a-placement-into-a-manifest-holding-no-entry-pins-the-revision-the-curator-names
- file: src/routes/place-existing-hypothesis-control-placement.spec.ts
  name: PlaceExistingHypothesisControl — the position a confirmed placement carries (criterion 8; rules/knowledge/a-first-placements-position-is-the-one-the-curator-declares)
    > sends exactly the position the curator typed, even where that number matches neither this version's
    current entry count nor one past it
  proves: Criterion 8 and the node's whole fact (the position is exactly what the curator declared, never
    derived from the manifest's own entry count or any other fact of that manifest)
  fails_when: the placement's body carries a position other than the exact number the curator typed --
    in particular one equal to the manifest's own row count or row count plus one
  demonstrates: rules/knowledge/a-first-placements-position-is-the-one-the-curator-declares
- file: src/routes/place-existing-hypothesis-control-placement.spec.ts
  name: PlaceExistingHypothesisControl — the manifest table after a settled placement (criterion 9) >
    shows the placed hypothesis as a row of the manifest table once the placement settles, with the curator
    never reloading the screen
  proves: Criterion 9 (after a settled placement the manifest builder shows the placed hypothesis as a
    row, without the curator reloading the screen)
  fails_when: the placed hypothesis's row never appears after the placement settles
- file: src/routes/place-existing-hypothesis-control-placement.spec.ts
  name: PlaceExistingHypothesisControl — the telemetry a settled placement emits (criterion 10) > emits
    the manifest placement telemetry event naming this case's slug, this version, the placed hypothesis's
    own name and the position it was placed at
  proves: Criterion 10 (a settled placement emits the manifest placement telemetry event naming slug,
    version, hypothesis name and position)
  fails_when: the telemetry event is not emitted, or is emitted with a slug, version, hypothesis name
    or position other than the ones the placement carried
- file: src/routes/place-existing-hypothesis-control-refusal-telling.spec.ts
  name: PlaceExistingHypothesisControl — its own refusal tellings, distinguishable from the remove-hypothesis
    telling and from the generic notice (criteria 11, 12; rules/knowledge/a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for)
    > states, against the hypothesis just chosen, that a different hypothesis already holds the named
    position and that the manifest stands unchanged; reads distinctly from the remove-hypothesis telling;
    and discloses nothing for a placement refused with a code it holds no presentation for
  proves: Criterion 11 (the position-occupied telling, stated against the chosen hypothesis, naming the
    collision and the manifest's own unchanged state, distinguishable from the remove telling), criterion
    12 (an already-manifested/unrecognised refusal discloses nothing and reads as the generic notice),
    and the node's whole fact (both named refusals distinguishable from each other, and every other refusal
    on either act falling to the same undifferentiated notice)
  fails_when: the position-occupied telling stops naming the collision or the manifest's unchanged state,
    reads identically to the remove-hypothesis telling, the manifest table changes before a refused placement
    settles, or a refusal carrying an unrecognised code discloses its own code, message or any alert text
  demonstrates: rules/knowledge/a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for
not_applicable:
- edge_case: The case itself composing zero hypotheses (the other way H less M can be empty, besides M
    already holding every hypothesis of H)
  why: The bound rule's own text states both ways collapse into the identical statement and identical
    absence of a candidate ("The two ways a case can leave nothing to choose take one statement"); the
    answered-empty scenario already exercised in the criterion 3/4 test is the one representative this
    class needs.
- edge_case: A second Confirm click issued before the first placement settles
  why: No criterion states protection against an overlapping confirm; the disable-while-busy mechanism
    reused by this control is the same one already proven for the manifest builder's other controls, and
    this task introduces no new mechanism for it.
- edge_case: An invalid or boundary position value (non-integer, empty, negative, zero)
  why: No criterion states a client-side validation rule over the value itself, only that whatever the
    curator declares is sent unaltered -- already proven by the position test. Gating Confirm on a valid
    integer is an interface detail, not a stated obligation.
- edge_case: A case's hypotheses or a hypothesis's revisions beyond the first page
  why: The task's own Notes disclose this as an ADVISORY coincidence of today's unpaged hooks, explicitly
    outside this task's own objective.
- edge_case: The revision picker's own loading state before the chosen candidate's own revisions have
    answered
  why: No criterion states a distinct statement for this reading; the disable pattern reused is the one
    already proven for the table's own revision selects.
untested:
- contracts/knowledge/case-lifecycle -- the node declares eight operations; this task issues only place-hypothesis,
  through the manifest builder's existing PUT. No test in this task's own scope can decide the contract's
  whole fact -- the other seven operations are exercised, if at all, by other tasks' own suites.
- contracts/knowledge/case-query -- the node declares five read operations; this task reads only list-hypotheses
  and list-hypothesis-revisions. The contract's whole fact spans the other three, outside this task's
  own scope.
- rules/knowledge/a-placing-offered-on-a-manifest-surface-carries-the-cases-hypotheses-that-version-does-not-already-hold
  -- this delivery renders the candidate list only on the manifest builder's "ready" phase, per the implementation's
  own disclosed divergence and the task's own Notes, UNDERDETERMINED entry 1. The node's own fact also
  requires the candidates carried on a read of the version refused or not yet answered -- readings this
  delivery does not reach. No test decides the node whole; only its ready-phase portion is proven.
- rules/knowledge/a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions
  -- same divergence and same Notes entry (UNDERDETERMINED entry 1). Only the "released withholds it"
  half and the "ready offers it" half are proven; the node also requires the act offered on the loading,
  load-error and not-valid readings, which this delivery does not reach.
- rules/knowledge/a-hypothesis-position-is-unique-within-its-case -- the invariant is enforced server-side;
  a frontend test can only observe the resulting refusal's presentation once the server answers it --
  already proven -- never the invariant itself.
- The implementation's own inference -- a case-hypotheses read that has failed is treated the same as
  one that has not yet answered, rather than as a third, distinct state -- is recorded as an inference
  over a behavior no node or criterion states; no test is written that would pin this specific choice,
  leaving it unproven and open to being read either way.
- UNDERDETERMINED, from the specification, entry 2 -- the exact wording of criterion 11's position-occupied
  telling. The entry itself observes that no criterion quotes the telling word for word; the criterion-11
  test asserts only the semantic content the criterion states, and the exact copy stays unpinned.
---

## What it is
The proof for the place-existing-hypothesis task: place-existing-hypothesis-control.spec.ts covers the candidate list, the empty-state distinction, the confirmed placement's PUT body (default and overridden revision, curator-declared position), the post-placement table refresh and telemetry, the position-occupied telling and the generic fallback for unrecognised refusals, and the released-reading withholding.

## Notes
Suite captured at run/manifest-builder-places-existing-hypothesis-suite.
