---
title: Connector-configuration detail surface's return-to-origin split, proved, and its earlier-task specs repaired
summary: New tests establish the return-to-origin control's history-walk-with-listing-fallback behaviour and its coexistence with the listing-route control across every reading and origin this task's criteria name, and four specs earlier tasks delivered are corrected to query the control each assertion now actually reaches.
implementation: sha256:d47c4ea476fd1a61ed6b435faf2b2e7ad82a700f25bf97a3170960e021ed5f6c
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/abandonment-and-listing-route-four-surfaces-suite-2
tests:
- file: src/routes/connector-configuration-detail-ready-view-cancel.spec.ts
  name: issues no PUT and returns to the connector-configurations listing when Cancel is clicked, even with unsaved edits -- a Cancel wired to submit before navigating would fail this
  proves: Criterion 3 — taking the return-to-origin control where the surface was reached from no surface and the configuration has been edited away from what the read answered lands the operator on the listing, issuing no register-connector call. Corrected from an earlier task's test that queried this same behaviour against the link role; the act is now a button, and the assertion is otherwise unchanged.
  fails_when: The control stops falling back to the listing when there is no history to return to, or a register call is issued before or instead of that navigation, or the control stops rendering as a button.
- file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
  name: renders the footer's Connectors link to /connectors while the read is still outstanding -- an implementation that withholds the route until the read answers would fail this
  proves: Criterion 10 — the listing-route control renders in the outstanding-read reading, resolving to the listing. Corrected from an earlier task's test that queried the same address assertion under the pre-split name, which the split moved onto the listing link once the return act became a separate button.
  fails_when: The listing link stops rendering during the loading phase, or its address stops resolving to the listing.
- file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
  name: renders the footer's Connectors link when the screen is loaded directly at its own address, carrying no navigation state recording arrival from the listing -- an implementation that renders the route only on an arrival-from-listing state would fail this
  proves: The listing-route control's presence turns on nothing about how the surface was reached, over a direct load carrying no arrival state — part of criterion 8's own claim, on the listing-route control's half. Corrected the same way as the previous entry.
  fails_when: The listing link renders only when navigation state records arrival from the listing.
- file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
  name: renders exactly one link, the footer's Connectors link, during the loading phase
  proves: Criterion 10 in the outstanding-read reading, and that the return act renders as a button rather than a second link. The name was corrected only; the underlying assertion, that exactly one link renders, was never wrong — only its own description of which control that link is.
  fails_when: A second link renders during the loading phase, or the sole link stops being the listing link.
- file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
  name: renders exactly one link, the footer's Connectors link, during the load-error phase
  proves: Criterion 10 in the failed-read reading, the same way as the previous entry.
  fails_when: A second link renders during the load-error phase, or the sole link stops being the listing link.
- file: src/routes/connector-configuration-detail-screen.spec.ts
  name: navigates back to the connector-configurations list when the footer's Connectors link is clicked
  proves: Criterion 10 in the shown reading, and that the listing-route control actually navigates there. Corrected from an earlier task's test that took a link of the pre-split name, which the split moved onto the button carrying the return act; the navigation assertion itself is unchanged.
  fails_when: Taking the listing link in the ready phase stops navigating to the listing, or the link stops rendering.
- file: src/routes/connector-configuration-detail-screen.spec.ts
  name: 'keeps the same control available when the load fails (edge case: a dependency that fails)'
  proves: Criterion 10 in the failed-read reading, alongside the reattempt — a dependency that fails still leaves the listing route reachable. Corrected the same way as the previous entry.
  fails_when: The load-error phase's footer stops carrying either the reattempt or the listing link.
- file: src/routes/connector-configuration-detail-screen.spec.ts
  name: issues no PUT request when the footer's Connectors link is clicked -- an implementation that submits register-connector before navigating would fail this
  proves: Criterion 11 — taking the listing-route control issues no register-connector call. Corrected the same way as the previous two entries.
  fails_when: Taking the listing link issues a register call before or instead of navigating.
- file: src/routes/connector-configuration-detail-screen.spec.ts
  name: renders exactly one link, the ready view's Connectors link, during the ready phase
  proves: Criterion 10 in the shown reading, and that the return act renders as a button rather than a second link. Name corrected only, matching the two exactly-one-link entries above.
  fails_when: A second link renders during the ready phase, or the sole link stops being the listing link.
- file: src/routes/connector-configuration-form-fields-action-footer.spec.ts
  name: renders the detail surface's own Discard and Cancel controls beside Save, inside the same Actions group
  proves: This shared component's own criterion 2 — whatever this surface passes through its trailing actions renders beside Save inside the Actions group — holding for this surface's field-restoring and return-to-origin controls without pinning a role that criterion never claimed. Corrected from a query pinning the return act to the link role, which the split moved off it onto the separate listing link; the corrected query reaches the control by its accessible text instead, leaving the choice of role to this surface's own criteria and this proof's other tests. Only that one query, in that one test, was touched — the create-surface case above it, already corrected by that surface's own test author, and every other test in the file, are unchanged.
  fails_when: The detail surface's Save, field-restoring or return-to-origin control stops rendering inside the Actions group, or the group stops being passed this surface's own trailing actions at all.
- file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
  name: navigates back to the origin surface it was reached from, rather than the connector-configurations listing, and issues no PUT
  proves: Criterion 1 — taking the return act on a surface reached from a surface that exists lands the operator on that surface, demonstrated over an origin that is not the listing — and part of criterion 9's claim over the origin-landing destination, that no register call is issued.
  fails_when: Taking the control with a real history entry to return to navigates to the listing, or anywhere other than that entry, or issues a register call.
- file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
  name: renders both controls when reached from one surface that is not the listing
  proves: Criterion 8 — the presence of both controls turns on nothing about which surface the detail surface was reached from, demonstrated over one differing origin.
  fails_when: Either control fails to render, or renders conditionally on this particular origin.
- file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
  name: renders both controls when reached from a different surface that is not the listing
  proves: Criterion 8, over a second, differing origin, so the previous entry's result is not an accident of that one origin.
  fails_when: Either control fails to render, or renders conditionally on this particular origin.
- file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
  name: renders both controls when reached from the connector-configurations listing itself
  proves: Criterion 8, over the listing itself as the origin — the one origin a naive implementation might special-case.
  fails_when: Either control fails to render, or renders conditionally on the listing being the origin.
- file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
  name: navigates to /connectors and issues no PUT when Cancel is clicked while the read is still outstanding
  proves: Criterion 2 in the outstanding-read reading, criterion 4's rendering claim, criterion 9's no-register claim in this reading, and the implementation's disclosed inference that the act exposes a fallback to the listing rather than an unconditional history walk — an unconditional walk with no fallback would not land here.
  fails_when: The control stops rendering during the loading phase, or taking it fails to land on the listing, or a register call is issued.
- file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
  name: navigates to /connectors and issues no PUT when Cancel is clicked once the read has failed for a reason other than the refusal
  proves: Criterion 2 in the failed-read reading, criterion 5's rendering claim, and criterion 9's no-register claim in this reading.
  fails_when: The control stops rendering during the load-error phase, or taking it fails to land on the listing, or a register call is issued.
- file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
  name: navigates to /connectors and issues no PUT when Cancel is clicked once the read was refused because nothing is registered under that connector name
  proves: Criterion 2 in the refused reading, criterion 7's rendering claim, and criterion 9's no-register claim in this reading — demonstrated over the actual refusal, the code this registry's own backend maps that refusal to, rather than a generic failure, and without asserting anything the surface states on that reading.
  fails_when: The control stops rendering on this reading, or taking it fails to land on the listing, or a register call is issued.
- file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
  name: navigates to /connectors and issues no PUT when Cancel is clicked with no edits once the configuration is shown
  proves: Criterion 2 in the shown reading, the unedited case distinct from the already-existing edited case, criterion 6's rendering claim, and criterion 9's no-register claim in this reading.
  fails_when: The control stops rendering during the ready phase, or taking it without any edit fails to land on the listing, or a register call is issued.
- file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
  name: renders the return-to-origin control and the listing-route control, and renders no field-restoring control
  proves: 'Criteria 7, 10 and 19 together, exactly as this task''s own bound frames them: on the reading where the read was refused because nothing is registered under the connector name, the two controls this task owes stand and the field-restoring control does not — asserting nothing about what that reading itself states.'
  fails_when: Either control fails to render on this reading, or a field-restoring control renders there.
not_applicable:
- edge_case: A duplicate where uniqueness is claimed
  why: No criterion claims uniqueness over a collection; criterion 9's in-membership clause is a non-mutation claim, proved by the no-register assertions rather than by any duplicate-detection scenario.
- edge_case: A boundary at each end of a stated range
  why: No criterion states a numeric range; the criteria concern which control renders in which reading and where each navigates.
- edge_case: An empty collection where one comes back
  why: This task's criteria describe a single-configuration surface's two navigation controls, never a collection view.
- edge_case: Two operations against one subject at once
  why: No criterion states behaviour for a concurrent save, reattempt or return race; both acts this task adds are read-only navigations that call no mutation, so no criterion needs one demonstrated against the other.
- edge_case: Absent or empty input
  why: This task introduces no user-typed input field; the surface's existing input edge cases belong to an earlier task and are untouched here.
untested:
- Criterion 9's on-both-destinations clause is demonstrated for the origin-landing destination in one reading only, the shown reading, rather than in all four readings crossed with both destinations. The act's own logic never reads the read's phase before choosing a destination, so this is not expected to vary by reading, but no test here demonstrates the origin landing from the outstanding, failed or refused readings directly.
- The implementation record's second disclosed inference — that the return act is placed on the base detail hook rather than the view hook — has no test distinguishing it from every alternative placement. The criterion-level tests here would pass identically under a view-hook placement that also wired the loading and load-error branches correctly; they only catch a placement wiring the act to the ready phase alone. Which hook the act is defined in is not observable from outside the component tree, so no test asserts it beyond what the criteria already require.
- Criteria 12 through 18 are preserved rather than changed by this task and remain proved by tests an earlier task already wrote and this proof did not need to touch — none of them queried the removed single control, so none was falsified by the split, and no new test was written over unchanged behaviour.
---

## What it is
Nineteen tests over the split: the return act's two destinations across all four readings, the origin-independence of both controls demonstrated over three origins including the listing itself, and four corrections inside specs earlier tasks of this plan own.

## Notes
The run this record points at is shared with the three sibling proofs of this epic, and that is the only honest option rather than a convenience.
The four surfaces' specs are mutually entangled — the two shared form-fields specs each carry a create-surface case and a detail-surface case, and each surface's split falsified assertions in files the others also touch — so no per-task suite run could have been green while any of the other three surfaces' specs still stood against the pre-split form.
One run over all four, after all four sets of tests existed, is what actually validates each of them.

Files earlier tasks of this plan own were corrected by this proof, which is not the route the framework offers.
That route is a proof-only re-delivery over the owning task, and it was attempted: its own precondition requires the owning task's implementation not to have moved, and later tasks of this plan had already rewritten those files, so the mode refused for every one of the four owning tasks.
The caller was told this twice — once as a stop that ended a delivery without a proof, and once when the guard refused — and chose to have each surface's own test author correct the assertions on its own surface instead.
Every test touched is named in `tests` above, so the diff and this record say the same thing.

One test deliberately does not exist here: nothing asserts what the reading whose read was refused because nothing is registered under the connector name presents to the operator.
The specification does hold a rule for it, written today, and this plan's epic declares that rule uncovered on purpose — so the tests over that reading ask only that the two controls stand and the field-restoring control does not, which is exactly what this task's criteria cover.
