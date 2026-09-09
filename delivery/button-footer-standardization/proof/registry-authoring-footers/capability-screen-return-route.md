---
target: frontend
title: Capability screen return route proof
summary: The three specs still querying the removed Back to capabilities link are rewritten against the footer's Cancel control on every phase it now appears on, closing the task's one criterion the implementation could not satisfy alone without dropping any phase's route coverage.
implementation: sha256:1f8c97ef8a0e0146beac2aa9efe9c7d2ed6f7842207216f8b3b8db24a8ad2c77
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/registry-authoring-footers-capability-screen-return-route-suite
tests:
- file: src/routes/capability-create-screen.spec.ts
  name: a failure state offering a retry when the concept vocabulary fails to load > keeps a Cancel route to the capabilities listing available while the load has failed
  proves: capability-create-screen offers the operator a route to the capabilities listing on every reading, in the load-error phase, and does so without any spec querying the removed link.
  fails_when: The load-error phase's footer stops carrying a link named Cancel addressed at the capabilities listing.
- file: src/routes/capability-create-screen.spec.ts
  name: a Cancel route back to the capabilities list on every reading > renders Cancel as a link to the capabilities listing once the form is ready
  proves: The same criterion in the ready phase, carried through the Cancel control rather than the removed link.
  fails_when: The ready phase's Actions footer stops carrying a link named Cancel addressed at the listing.
- file: src/routes/capability-create-screen.spec.ts
  name: a Cancel route back to the capabilities list on every reading > renders the same Cancel route while the concept vocabulary is still loading
  proves: The same criterion in the loading phase, which carried no footer at all before this task.
  fails_when: The loading phase's footer stops carrying a link named Cancel addressed at the listing.
- file: src/routes/capability-detail-screen.spec.ts
  name: a control returns to the list > navigates back to the capabilities list when Cancel is clicked
  proves: capability-detail-screen's ready phase offers the route through Cancel, and the click actually navigates, without querying the removed link.
  fails_when: Clicking the Actions footer's Cancel stops navigating the router to the capabilities listing.
- file: src/routes/capability-detail-screen.spec.ts
  name: a control returns to the list > keeps a Cancel route to the capabilities listing available when the load fails
  proves: The same criterion in the load-error phase, alongside Retry.
  fails_when: The load-error phase's footer stops carrying a link named Cancel addressed at the listing.
- file: src/routes/capability-detail-screen.spec.ts
  name: a route to the listing is offered even for an identity nothing is registered at > keeps a Cancel route to the capabilities listing when the read fails because the identity itself is unregistered
  proves: The task's underdetermined note over the fourth reading the route rule expressly includes, the read that answered no capability at that identity. That refusal can only surface as this hook's existing load-error phase, confirmed at the hook level by its own spec, and this test proves that phase still carries the route.
  fails_when: An unregistered identity's read is rendered as a distinct reading, separate from the ordinary load-error phase, carrying no link to the listing.
- file: src/routes/capability-detail-screen-route.spec.ts
  name: a route to the listing is offered while the read is still outstanding > renders a Cancel route to the capabilities listing while the capability read is still pending
  proves: capability-detail-screen's loading phase offers the route, a phase that carried no footer at all before this task, now reached through Cancel rather than the removed link.
  fails_when: The loading phase's footer stops carrying a link named Cancel addressed at the listing.
- file: src/routes/capability-create-screen-actions.spec.ts
  name: a Cancel control returns to the listing without registering anything > renders Cancel as a link addressed at the capabilities listing
  proves: 'A pre-existing test, untouched by this pass, that the create screen''s ready-phase Cancel is a plain link fixed at the listing, which is exactly the task''s underdetermined note about the footer''s route being the only leaving control on that screen: a static destination asserted with no dependence on how the screen was reached is that hazard as built.'
  fails_when: Cancel's destination on the create screen stops being the fixed listing route, for instance becoming conditional on where the operator navigated from.
- file: src/routes/capability-detail-screen-discard-availability.spec.ts
  name: the Discard control is withheld while the read is outstanding, and once the read has failed > renders no Discard control in either window
  proves: Pre-existing tests, untouched by this pass, proving the task's underdetermined note that this task rewrites the three readings the discard rule withholds that act from; both show the new loading and load-error footers carry no Discard.
  fails_when: A Discard changes control appears in the loading or the load-error phase's footer.
not_applicable:
- edge_case: Absent or empty input, a boundary at either end of a range, a duplicate where uniqueness is claimed, an operation against forbidden state, or two operations against one subject at once.
  why: The behaviour this pass proves is a static navigation control rendered per screen phase; none of these describes an input, a range, a uniqueness constraint, a state machine forbidding an operation, or a resource two callers could race over.
untested:
- 'Four criteria name behaviour the implementation record itself describes as unchanged and only repositioned: the loading phase''s own statement by name and version, the load-error phase''s statement and its one-effect retry, the loading phase''s absence of a reattempt, and the absence of any capability attribute in either phase. No test anywhere in the tree, before or after this pass, asserts those exact texts or those absences. Since this task rearranges already-working behaviour there, no new pinning test was manufactured now; the absence predates this task and is recorded rather than invented.'
- 'The task''s underdetermined note that no criterion holds the registry''s refusal of an unregistered identity apart from the load-error phase names exactly the implementation this delivery carries, and nothing in the two screen files can exclude or confirm it: that fold is decided entirely inside a hook this task does not touch, so nothing here excludes the hazard the note names.'
- The note about the shared footer's route being pointed at one listing wherever it is rendered cannot be settled by the two capability screen files either; the connector-configuration screens are a different file set, named as the sibling return-route task's own remainder.
- The implementation record's inference that the footer component carries no destination and that each screen supplies its own target is a type-level guarantee rather than an observable runtime fact; jsdom renders no compile error, so no query here distinguishes it from a component that also accepted a destination nobody happened to pass.
- Whether the newly added loading and load-error footers stay pinned to the bottom of the scroll region is a layout fact jsdom does not compute; nothing in this pass or the existing suite renders and measures it.
---

## What it is
The repair of three specs that asserted against a control this delivery removed, rewritten against the control that now carries the same fact.
Two further tests are named without being touched, because they already prove two of the task's own underdetermined notes.

## Notes
The three rewritten specs are the one thing the implementation could not do for itself, its criterion over test files being unsatisfiable by a pass that writes no test; that criterion was re-answered against the tree once this pass had run.
One of the three, capability-detail-screen-route.spec.ts, was written by an earlier delivery of this same initiative to prove the route exists while the read is outstanding — the fact it proves is unchanged, and only the control carrying it moved.
No assertion was dropped: every phase that asserted a route to the listing still asserts one.
