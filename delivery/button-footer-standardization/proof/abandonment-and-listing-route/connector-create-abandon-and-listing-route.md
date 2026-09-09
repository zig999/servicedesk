---
target: frontend
title: Connector-configuration creation surface's abandonment and listing route
summary: Proves the create screen's split abandonment — a button going back through history or falling back to the listing — and its separate listing-route link against all seven criteria, correcting three pre-existing specs the delivered split falsified.
implementation: sha256:c879138385c816ea53c79742b0576769fad2838c585b91ad20d73aaa0e2e7e40
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/abandonment-and-listing-route-four-surfaces-suite-2
tests:
- file: src/routes/connector-configuration-create-screen-cancel.spec.ts
  name: navigates back to the connector detail screen it was opened from, rather than a fixed destination
  proves: Criterion 1 — taking the abandonment lands the operator on the surface the authoring surface was reached from, whichever surface that is. Mounted with two history entries, taking the control must land back on the first rather than on any fixed route; this criterion had no test at all before this proof, every existing spec exercising only the single-entry fallback.
  fails_when: onCancel stops walking back through the router's own history — always navigating to a fixed address, or the history-walk guard removed — so the control lands somewhere other than the previous history entry.
- file: src/routes/connector-configuration-create-screen-cancel.spec.ts
  name: navigates back to the connector-configurations listing when that is the surface authoring was reached from, going back through history rather than treating the listing as a privileged fixed destination
  proves: The same criterion's the-listing-included clause, and criterion 7 — paired with the previous test, this shows the listing is reached the identical way, by walking back through history, as any other surface, never asserted as a hardcoded destination.
  fails_when: onCancel treats the listing as a special destination it lands on regardless of history, rather than reaching it only because history itself resolves there.
- file: src/routes/connector-configuration-create-screen-cancel.spec.ts
  name: issues no PUT and returns to the connector-configurations listing when Cancel is clicked, even after the form was filled in
  proves: 'Criteria 2 and 3 — where the authoring surface was reached from no surface the abandonment lands on the listing, and taking it issues no register-connector call. Corrected from the link role to the button role: the delivered split renders the abandonment as a plain button. The assertion itself, over the call count and the destination, was never false and is unchanged.'
  fails_when: The abandonment control is no longer reachable as a button of that name, or taking it issues the register-connector call, or it fails to land on the listing when there is no history to return to.
- file: src/routes/connector-configuration-create-screen.spec.ts
  name: renders the footer's Connectors link to /connectors
  proves: 'Criterion 4 — a control whose destination is the connector-configurations listing renders on the surface. Corrected from querying an accessible name of Cancel to the listing control''s own name: the split moved the listing route off the Cancel control entirely, onto its own link, whose name is drawn from the listing screen''s own heading, which is the implementation record''s own second inference.'
  fails_when: No link resolving to the listing renders in the Actions footer, or its accessible name is not the listing's.
- file: src/routes/connector-configuration-create-screen.spec.ts
  name: navigates to /connectors on Connectors without issuing any PUT request
  proves: Criterion 5 — taking the control whose destination is the listing issues no register-connector call. Corrected the same way, querying the link by its actual accessible name rather than the pre-split one.
  fails_when: Taking the listing link issues a register call, or fails to land on the listing.
- file: src/routes/connector-configuration-create-screen.spec.ts
  name: renders the footer's Connectors link when the screen is loaded directly at /connectors/new, carrying no navigation state recording arrival from the listing
  proves: Criterion 4's unconditional rendering — the listing-route control renders on this screen's one reading regardless of how the operator arrived. Corrected to query it by its post-split name.
  fails_when: The listing link renders only conditioned on some arrival state, for instance only when reached from the listing, rather than unconditionally.
- file: src/routes/connector-configuration-form-fields-action-footer.spec.ts
  name: renders the create screen's own Cancel and Connectors controls beside Save, inside the Actions group
  proves: 'That component''s own criterion 2 — whatever a screen passes through its trailing actions renders beside Save inside the same group — as it actually holds once this task split the create screen''s single Cancel link into a Cancel button and a separate listing link: both must still render inside the same group. Corrected from a single link-role assertion to one button-role assertion and one link-role assertion.'
  fails_when: Either control fails to render inside the group named Actions, the abandonment renders as a link rather than a button, or the listing control's accessible name is not the listing's.
- file: src/routes/connector-configuration-form-fields-action-footer.spec.ts
  name: renders exactly one link on the screen, the footer's Connectors link, resolving to /connectors
  proves: That component's own criteria that the create screen renders exactly one link and that link is the listing route. The link count is unaffected by the split — the abandonment is now a button, not a second link — only its accessible name moved.
  fails_when: More than one link renders on the screen, for instance if the abandonment reverted to being a link; the sole link is not the listing's; or it does not resolve to the listing.
- file: src/routes/connector-configuration-create-screen-cancel.spec.ts
  name: renders no Discard changes control
  proves: 'Criterion 6 — no control returning the surface''s fields to the content of a read registration renders on the surface. Pre-existing and untouched: the split changes nothing about this control''s absence, so this test still stands as this criterion''s proof.'
  fails_when: A field-restoring discard control renders on the create screen.
- file: src/routes/connector-configuration-create-screen.spec.ts
  name: renders no Discard changes control
  proves: The same criterion 6, from the create screen's own full spec file — also pre-existing and untouched.
  fails_when: A field-restoring discard control renders on the create screen.
not_applicable:
- edge_case: A dependency that fails or answers slowly
  why: Neither control issues a network call before navigating — the abandonment walks the router's own in-memory history and the listing control is a plain router link — so there is no dependency whose failure or latency either control's behaviour could depend on.
- edge_case: Absent or empty input to the form
  why: Both destinations depend only on router history, never on form contents; this is exercised directly by the criterion-1 tests against an untouched form and by the pre-existing test that takes the abandonment after the form was filled in. Both land the same way, so emptiness raises no distinct behaviour to isolate.
- edge_case: Two operations against one subject at once, such as rapidly double-activating either control
  why: Each performs a single synchronous navigation with no shared mutable resource or mutation in flight; nothing in the criteria or the implementation record states a debounce or guard, and no criterion is stated in terms of it.
- edge_case: A duplicate or an empty collection
  why: Neither control renders or operates over a collection; this task's behaviour is confined to two navigation controls on a single-record authoring surface.
untested:
- 'The shared form-fields spec''s own detail-surface assertion was left uncorrected by this proof: it queried the listing control by the link role and the pre-split name, and the connector-configuration detail surface — rewritten by a different task of this same plan — now names that control after the listing, exactly as the create screen does. That correction belongs to that surface''s own task and its own test-author pass, which is where it was in fact made.'
- Navigation driven by the browser's own back and forward controls, as opposed to the in-app router history the abandonment walks, is not exercised — every test here drives navigation only through the router's memory history and the screen's own controls.
---

## What it is
Ten tests over the split: the abandonment's three destinations demonstrated over two history shapes, the listing route's presence and its registering nothing, and the shared form-fields component's own claim about what this screen passes through its trailing actions.

## Notes
The run this record points at is shared with the three sibling proofs of this epic, and that is the only honest option rather than a convenience.
The four surfaces' specs are mutually entangled — the two shared form-fields specs each carry a create-surface case and a detail-surface case, and each surface's split falsified assertions in files the others also touch — so no per-task suite run could have been green while any of the other three surfaces' specs still stood against the pre-split form.
One run over all four, after all four sets of tests existed, is what actually validates each of them.

Files earlier tasks of this plan own were corrected by this proof, which is not the route the framework offers.
That route is a proof-only re-delivery over the owning task, and it was attempted: its own precondition requires the owning task's implementation not to have moved, and later tasks of this plan had already rewritten those files, so the mode refused for every one of the four owning tasks.
The caller was told this twice — once as a stop that ended a delivery without a proof, and once when the guard refused — and chose to have each surface's own test author correct the assertions on its own surface instead.
Every test touched is named in `tests` above, so the diff and this record say the same thing.

This proof records no divergence of its own, though it corrected files earlier tasks own — its sibling over the capability creation surface disclosed the same act as one.
The asymmetry is the two producers' to hold, not this record's to smooth: what both did is named in `tests`, and the paragraph above states it plainly for both.
