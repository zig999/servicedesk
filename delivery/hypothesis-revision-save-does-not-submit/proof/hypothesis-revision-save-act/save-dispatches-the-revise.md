---
title: Save dispatches the revise, mounted against the footer portal the running application actually takes
summary: Proves the save control keeps the screen's own form as its DOM form owner and reaches the revise under the footer-slot
  portal, by mounting the hypothesis revision screen with a FooterSlotContext provider present rather than the bare-Outlet
  harness the earlier specs used.
implementation: sha256:55df83e4c1dfafd8409cfa4c45e2ada0a7f4fc8090ebde3a65ded8adf71519fd
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/hypothesis-revision-save-act-save-dispatches-the-revise-suite-3
tests:
- file: src/routes/hypothesis-revision-screen-footer-portal.spec.ts
  name: the save control's form owner survives the footer portal (criterion 1) > keeps the screen's own form as the Save button's
    form owner even though the button renders outside that form's DOM subtree
  proves: With the footer slot present, so the portal the application takes is taken, the screen's save control has the screen's
    own form as its form owner.
  fails_when: the Save button's DOM form property is not the screen's form, its id not equalling HYPOTHESIS_REVISION_FORM_ID,
    or the button in fact still renders as a descendant of that form — the portal not actually taken, in which case the id
    assertion would pass vacuously without this second check
- file: src/routes/hypothesis-revision-screen-footer-portal.spec.ts
  name: activating save with the footer slot present issues the revise request (criterion 2) > issues POST /v1/cases/{slug}/hypotheses
    for the hypothesis the route names when every field is filled in
  proves: With the footer slot present and every field of the composition filled, activating the save control issues a revise
    request for the hypothesis the route names.
  fails_when: clicking Save under the footer-slot mount issues no POST, issues one to the wrong URL, or the POST body's hypothesis_name
    is not H1, the hypothesis the route names
- file: src/routes/hypothesis-revision-screen-footer-portal.spec.ts
  name: a revise answered with the footer slot present states the saved revision number (criterion 3) > renders the sentence
    naming the hypothesis and the revision number the response answered
  proves: With the footer slot present and a revise answered, the revision number that answer states is stated to the curator.
  fails_when: the sentence naming hypothesis H1 and revision 4 is not rendered after the mocked POST answers that hypothesis_name
    and that revision
- file: src/routes/hypothesis-revision-screen-footer-portal.spec.ts
  name: activating abandon with the footer slot present writes nothing (criterion 4) > issues no POST to the hypotheses endpoint,
    even after every field was filled in
  proves: With the footer slot present, activating the abandon control issues no revise request, leaves the hypothesis's existing
    revisions and its case's draft version exactly as they were, and returns the curator to the screen the composition was
    opened from.
  fails_when: clicking Cancel under the footer-slot mount, after every field was filled, results in any POST to the hypotheses
    endpoint — the screen's only write path, so this stands for the hypothesis's revisions and the draft's manifest being
    left unchanged
- file: src/routes/hypothesis-revision-screen-footer-portal.spec.ts
  name: activating abandon with the footer slot present returns to the opening screen (criterion 4) > navigates back to the
    screen the composition was actually opened from, rather than a fixed destination
  proves: With the footer slot present, activating the abandon control issues no revise request, leaves the hypothesis's existing
    revisions and its case's draft version exactly as they were, and returns the curator to the screen the composition was
    opened from.
  fails_when: clicking Cancel under the footer-slot mount leaves the router anywhere but the simulation path it was opened
    from, including a fixed destination such as the manifest builder
- file: src/routes/hypothesis-revision-screen-footer-portal.spec.ts
  name: a save with the footer slot present that moves the pin forward still offers the manifest-builder route > renders the
    Open Manifest Builder control after answering a revision higher than the one previously pinned
  proves: UNDERDETERMINED, from the specification — no criterion reaches rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move,
    whose statement says a curator who has just revised a hypothesis is offered a route to that case's draft version's manifest
    whenever the revision written is higher than the one that draft's entry pinned immediately before, and whenever that draft's
    manifest holds no entry for the hypothesis at all.
  fails_when: a save control that dispatches the revise and states the revision number while never rendering the Open Manifest
    Builder control, even though the answered revision 3 is higher than the revision 2 the draft's manifest previously pinned
    — exactly the implementation the underdetermined entry names as passing every stated criterion while the specification
    refuses it
- file: src/routes/hypothesis-revision-screen-footer-portal.spec.ts
  name: a save with the footer slot present of a hypothesis absent from the draft's manifest still offers the manifest-builder
    route > renders the Open Manifest Builder control after answering a hypothesis the draft's manifest holds no entry for
  proves: UNDERDETERMINED, from the specification — no criterion reaches rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move,
    whose statement says a curator who has just revised a hypothesis is offered a route to that case's draft version's manifest
    whenever the revision written is higher than the one that draft's entry pinned immediately before, and whenever that draft's
    manifest holds no entry for the hypothesis at all.
  fails_when: a save control that dispatches the revise and states the revision number for a hypothesis the draft's manifest
    holds no entry for, without ever rendering the Open Manifest Builder control — the second branch the same underdetermined
    entry names
- file: src/routes/hypothesis-revision-screen-footer-portal.spec.ts
  name: abandon's availability with the footer slot present does not turn on how much of the composition was filled in > stays
    present and enabled both on a freshly opened, blank form and once every field has been filled in
  proves: UNDERDETERMINED, from the specification — criterion 4 tests only an activated abandon control, and does not reach
    the availability clause of rules/knowledge/an-abandoned-revision-composition-writes-nothing, which states that abandonment
    is available for as long as the composition has not been submitted and turns on nothing else.
  fails_when: the Cancel control is absent, or carries the disabled attribute, either on the freshly opened blank form or
    after every field has been filled in — exactly the implementation the underdetermined entry names as passing criterion
    4 while the rule's availability clause is violated
- file: src/routes/hypothesis-revision-screen-footer-portal.spec.ts
  name: abandon's availability with the footer slot present does not turn on which of the two routes opened the composition
    > is present when the composition was opened to create a new hypothesis
  proves: UNDERDETERMINED, from the specification — criterion 4 tests only an activated abandon control, and does not reach
    the availability clause of rules/knowledge/an-abandoned-revision-composition-writes-nothing, which states that abandonment
    is available for as long as the composition has not been submitted and turns on nothing else.
  fails_when: the Cancel control is absent from the new-hypothesis composition route under the footer-slot mount
- file: src/routes/hypothesis-revision-screen-footer-portal.spec.ts
  name: abandon's availability with the footer slot present does not turn on which of the two routes opened the composition
    > is present when the composition was opened to revise an existing hypothesis
  proves: UNDERDETERMINED, from the specification — criterion 4 tests only an activated abandon control, and does not reach
    the availability clause of rules/knowledge/an-abandoned-revision-composition-writes-nothing, which states that abandonment
    is available for as long as the composition has not been submitted and turns on nothing else.
  fails_when: the Cancel control is absent from the revise-existing-hypothesis composition route under the footer-slot mount
- file: src/routes/hypothesis-revision-screen-footer-portal.spec.ts
  name: save with the footer slot present carries the filled composition's own content, not only the hypothesis name > carries
    criterion, collects and resolution alongside hypothesis_name and the draft's subject in the POST body
  proves: UNDERDETERMINED, from the specification — criterion 2 requires only that activating save issues a revise request
    for the hypothesis the route names, and no criterion states that the request carries the composition's content, which
    rules/knowledge/a-hypothesis-declares-a-criterion, rules/knowledge/a-hypothesis-collects-at-least-one-concept and rules/knowledge/every-position-declares-a-resolution
    state a revise must hold.
  fails_when: 'the POST body dispatched under the footer-slot mount omits or misstates criterion, collects — including the
    pre-populated ConceptB carried over from the hypothesis''s current highest revision alongside the newly checked ConceptA
    — resolution, or subject: exactly the hypothesis-name-only body the underdetermined entry names as passing criterion 2
    while the specification refuses it as a revise'
not_applicable:
- edge_case: two saves activated at once, a double-submit race
  why: no criterion or bound node of this task states a duplicate-dispatch guarantee — the task's own ADVISORY note says what
    a second dispatch does turns on rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased, which no criterion
    here reaches — so a test asserting single-dispatch behavior would assert a guarantee nobody made
- edge_case: a refused revise, answering 409, 422 or 404 from the server
  why: the task's own REMAINDER notes place every refusal clause of the covered Rules outside this task's criteria, and every
    criterion here is stated over a filled composition and an answered revise, so no test exercises a refusal path
- edge_case: abandon activated before the version or revisions query has resolved, while the screen is still loading
  why: no criterion of this task states behavior for the loading phase, and the abandon control this task's criteria describe
    is the one rendered once the composition is ready; the screen's loading-phase rendering is unchanged by this delivery
    and untouched by any criterion here
untested:
- the second underdetermined entry's exact boundary — an abandon control hidden or disabled once fields are filled, versus
  one absent from the DOM outright. The two tests written would already fail over either an absent or a disabled control at
  either fill state, but the entry's own wording suggests a possible third shape, present but non-interactive by some means
  other than the disabled attribute, which a DOM-attribute check does not reach. It is not tested separately because the binder's
  note names no implementation to fail over beyond what is covered, and inventing one would put a guess where the note itself
  stops.
---

## What it is

The proof of one corrective task, written against the DOM shape the running application actually produces rather than the one the delivered specs happened to mount.
Eleven tests: five over the task's four criteria, and six over the three UNDERDETERMINED notes the binder returned, each written to fail over the exact implementation its note names as passing every stated criterion while the specification refuses it.

## Notes

The mount is the whole point of this file's existence.
Every earlier spec of this screen builds its router with a root route of a bare Outlet, so no FooterSlotContext provider stands, so ButtonFooter renders its group inline inside the form and the save control owns that form for reasons the application never has.
A new harness provides the context and the sibling node the portal targets, so these tests exercise the portaled shape, and the form-owner test asserts both halves — that the button's form owner is the screen's form, and that the form does not contain the button — because the first assertion alone would pass vacuously under the old harness.
Two suite runs failed before the one this record points at, and both are on disk under their own names.
The first, suite-2, failed on one assertion of this file: it expected the dispatched collects to hold only the concept the test itself checked, where a revise's composition starts pre-populated from the hypothesis's own current highest-numbered revision, so the body correctly carried that concept as well.
The diagnosis returned cause test, a person settled it against the assertion rather than against the source, and the assertion now states what the specification's own overwrite rule implies.
The second failure was not a run at all: both files carried twenty-seven lines of explanatory comments, which this project's rules forbid in source with two exceptions neither of them was, and which no tool and no review of this project would ever have reported.
Both files were written again without them, and what those comments said is in this record's own proves and fails_when, which is the home the rule names for it.
