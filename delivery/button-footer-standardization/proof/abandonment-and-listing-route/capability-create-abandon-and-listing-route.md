---
target: frontend
title: Capability create screen's abandonment and listing-route controls
summary: Tests prove the split creation-surface controls — an abandonment that goes back through router history, or falls to the listing with none to return to, and issues no register call, and an unconditional route to the listing on every reading that also issues none — correct three pre-existing specs on this surface that asserted the pre-split fixed-link behaviour, and correct one assertion in a sibling task's spec that pinned the control's role.
implementation: sha256:7ced0072ed0d2f158859d5a41d44a2c07858fbe49624b2432ae74f94b87f784e
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/abandonment-and-listing-route-four-surfaces-suite-2
tests:
- file: src/routes/capability-create-screen-cancel.spec.ts
  name: navigates back to the capability detail screen it was opened from, rather than a fixed destination
  proves: Criterion 1 — taking the abandonment lands on the surface authoring was reached from, distinguishing that from an implementation that always navigates to a fixed destination.
  fails_when: onCancel ignores router history and always navigates to a fixed address instead of the surface last visited, or the can-go-back branch is missing so it never goes back at all.
- file: src/routes/capability-create-screen-cancel.spec.ts
  name: navigates back to the capabilities listing when that is the surface authoring was reached from, going back through history rather than treating the listing as a privileged destination
  proves: Criterion 1's explicit the-capabilities-listing-included clause, and criterion 9 — the landing is derived from the previous history entry being the listing rather than from the listing being asserted as a fixed or privileged destination.
  fails_when: onCancel does not go back through router history when the previous entry is the capabilities listing, for instance by special-casing the listing and refusing to go back to it, or by landing anywhere else.
- file: src/routes/capability-create-screen-cancel.spec.ts
  name: navigates to the capabilities listing when the create screen was opened at its own address, with no history to return to
  proves: Criterion 2 — where the authoring surface was reached from no surface, the abandonment lands on the capabilities listing.
  fails_when: onCancel walks history unconditionally, as the two sibling knowledge-surface hooks do, instead of falling back to the listing when the router cannot go back, leaving the operator stuck on the create route.
- file: src/routes/capability-create-screen-cancel.spec.ts
  name: issues no PUT when the abandonment is taken after the form was filled in, leaving the registered set untouched
  proves: Criterion 3 — taking the abandonment issues no register-capability call and leaves every registered capability exactly as it stood.
  fails_when: onCancel is wired to also call the mutation, or any register-capability request is issued as a side effect of taking it.
- file: src/routes/capability-create-screen-cancel.spec.ts
  name: renders Cancel while the concept vocabulary is still loading
  proves: The disclosed inference that the abandonment renders in every phase rather than only once ready to author, for the loading phase.
  fails_when: The loading-phase branch of the screen stops rendering the abandonment control.
- file: src/routes/capability-create-screen-cancel.spec.ts
  name: renders Cancel once the concept vocabulary has failed to load
  proves: The same disclosed inference, for the load-error phase.
  fails_when: The load-error branch stops rendering the abandonment control.
- file: src/routes/capability-create-screen-cancel.spec.ts
  name: renders Cancel once the surface is ready to author
  proves: The same disclosed inference, for the ready phase, and the precondition criteria 1 through 3 depend on.
  fails_when: The ready-phase trailing actions stop including the abandonment control.
- file: src/routes/capability-create-screen-listing-route.spec.ts
  name: renders a Capabilities link addressed at the listing while the concept vocabulary is still loading
  proves: Criterion 4 — the control whose destination is the capabilities listing renders while the read of the concepts is outstanding.
  fails_when: The loading branch stops rendering a link to the listing, or renders it addressed elsewhere.
- file: src/routes/capability-create-screen-listing-route.spec.ts
  name: renders the Capabilities link beside Retry once the concept vocabulary fails to load
  proves: Criterion 5 — the same control renders once the read has failed.
  fails_when: The load-error branch stops rendering the link, or removes or mis-addresses it.
- file: src/routes/capability-create-screen-listing-route.spec.ts
  name: renders the Capabilities link once the concept vocabulary has loaded and the form is ready
  proves: Criterion 6 — the same control renders once the surface is ready to author.
  fails_when: The ready-phase trailing actions stop including the link to the listing.
- file: src/routes/capability-create-screen-listing-route.spec.ts
  name: navigates to the capabilities listing when Capabilities is clicked, issuing no PUT even with a valid form filled in
  proves: Criterion 7 — taking the control whose destination is the capabilities listing issues no register-capability call.
  fails_when: The listing control is wired to also dispatch the save mutation, or the click issues a register call before or during navigation.
- file: src/routes/capability-create-screen-listing-route.spec.ts
  name: keeps the Capabilities link rendered while a save is pending -- an implementation offering the route on only the three readings the criteria name, and dropping it on every other reading, would fail this
  proves: 'The task''s UNDERDETERMINED note: the route node owes the listing route on every reading of the surface, not only the three criteria 4 through 6 enumerate; an implementation rendering it only on those three and dropping it elsewhere — a submission in flight being the note''s own example — satisfies the criteria as written while leaving that reading without the route the node owes.'
  fails_when: The trailing-actions listing link is gated on a submission not being in flight, or on any other condition scoping it to only the three named readings, so it disappears while a save is pending.
- file: src/routes/capability-create-screen-actions.spec.ts
  name: renders no Discard changes control anywhere on the create surface
  proves: Criterion 8 — no control returning the surface's fields to the content of a read registration renders on the surface.
  fails_when: Any control labelled or behaving as a field-restoring discard is added to the create screen.
- file: src/routes/capability-create-screen.spec.ts
  name: 'keeps a route to the capabilities listing available while the load has failed (edge case: a dependency that fails)'
  proves: Corroborates criterion 5. Corrected from asserting the pre-split control, a link named Cancel, to the listing link the split introduced.
  fails_when: The load-error footer stops rendering a link named Capabilities addressed at the listing.
- file: src/routes/capability-create-screen.spec.ts
  name: renders Capabilities as a link to /capabilities once the form is ready
  proves: Corroborates criterion 6, corrected the same way.
  fails_when: The ready-phase footer stops rendering a link named Capabilities addressed at the listing.
- file: src/routes/capability-create-screen.spec.ts
  name: renders the same Capabilities route while the concept vocabulary is still loading
  proves: Corroborates criterion 4, corrected the same way.
  fails_when: The loading-phase footer stops rendering a link named Capabilities addressed at the listing.
- file: src/routes/capability-form-fields-action-footer.spec.ts
  name: renders the create screen's own Cancel control beside Save, inside the Actions group
  proves: Criterion 2 of the owning task, proof/registry-authoring-footers/capability-form-action-footer — a control named Cancel stands beside Save inside the Actions group. Corrected here because that owning task's implementation has since been rewritten by later tasks of this plan and its own proof-only re-delivery route refused on that precondition; the assertion previously pinned Cancel to the link role, which both abandonment nodes leave to the interface, while this task's own node conditions the abandonment's destination on navigation history, which a static link cannot express. The corrected assertion accepts either role and requires only the accessible name within the Actions group.
  fails_when: No element named Cancel, of either the button or the link role, is found inside the Actions group beside Save — the create screen's abandonment control removed or renamed, whatever role it takes.
not_applicable:
- edge_case: Taking the abandonment or the listing-route control while a save mutation is already in flight
  why: No criterion and no specification note conditions either control's behaviour on a concurrent in-flight mutation; both only navigate and neither touches the mutation, so nothing about a pending save changes what they do. The underdetermined test already exercises that state to confirm the listing link still renders in it; no criterion asks what happens to the in-flight request itself.
- edge_case: Rapid double-activation of either control
  why: Both are pure navigation with no request in flight to race against, and neither carries a debounce or guard any criterion states. A second activation after the screen has navigated away is not an interaction this screen remains mounted to receive.
- edge_case: Absent or empty input to either control
  why: Neither takes user input beyond the activation itself; there is no field or argument for absence or emptiness to apply to.
- edge_case: A boundary at each end of a numeric or length range
  why: No criterion of this task involves a range-bounded value; the abandonment's behaviour is a two-valued branch — history to go back to, or not — already exercised at both values.
- edge_case: An empty collection rendered where one is expected, and a duplicate where uniqueness is claimed
  why: This task adds no collection-rendering or uniqueness-constrained behaviour; both belong to the concept-vocabulary and save-flow behaviour already covered outside this task's own criteria.
untested:
- Whether a mutation already dispatched before either control is taken — a save in flight when the operator navigates away — still resolves, errors silently, or is meant to be aborted. No criterion of this task states an expectation, and no test exercises it.
- Whether the abandonment control is reachable and activatable by keyboard alone beyond its being a native button element; accessibility of native controls is this standard's tool-decided rules, not a rendered-behaviour test this proof authors.
- Whether double-activating either control in rapid succession produces any observable anomaly, per the not-applicable entry above.
divergences:
- from: The framework's ordinary route for a failing spec owned by a delivered task — a proof-only re-delivery over the owning task, proof/registry-authoring-footers/capability-form-action-footer
  departure: 'src/routes/capability-form-fields-action-footer.spec.ts, a file that task owns and this task did not deliver, is corrected here instead — one assertion''s role query loosened from the link role to either role for the name Cancel — because the ordinary route''s own precondition, the owning implementation unchanged, was already refused: three of that implementation''s five files have since been rewritten by later tasks of this plan. The caller was told this and directed each surface''s own test author to correct the specs on its own surface instead.'
  why: The failure is this task's own surface's doing — the abandonment the create screen renders is a button rather than a link, which the owning criterion's own closing line leaves to the interface, and this task's own node makes the destination conditional on navigation history a static link cannot express. Recorded here so a reader can see that a file another task owns was rewritten by this delivery, and why.
---

## What it is
Seventeen tests over the split: the abandonment's three destinations, its presence in every phase, the listing route's presence in each of the three readings the criteria name, one for the task's own underdetermined note, and one correction inside a spec the shared form-fields component's own task owns.

## Notes
The run this record points at is shared with the three sibling proofs of this epic, and that is the only honest option rather than a convenience.
The four surfaces' specs are mutually entangled — the two shared form-fields specs each carry a create-surface case and a detail-surface case, and each surface's split falsified assertions in files the others also touch — so no per-task suite run could have been green while any of the other three surfaces' specs still stood against the pre-split form.
One run over all four, after all four sets of tests existed, is what actually validates each of them.

Files earlier tasks of this plan own were corrected by this proof, which is not the route the framework offers.
That route is a proof-only re-delivery over the owning task, and it was attempted: its own precondition requires the owning task's implementation not to have moved, and later tasks of this plan had already rewritten those files, so the mode refused for every one of the four owning tasks.
The caller was told this twice — once as a stop that ended a delivery without a proof, and once when the guard refused — and chose to have each surface's own test author correct the assertions on its own surface instead.
Every test touched is named in `tests` above, so the diff and this record say the same thing.
