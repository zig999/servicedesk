---
title: Connector-configuration creation surface's abandonment split from its listing route
summary: The creation surface now carries two separate controls — an abandonment that returns to the surface the authoring was reached from, or the connector-configurations listing where none exists, and an unconditional route to that same listing.
task: sha256:30e61dfc04f0d5d8b22622af8530879baecf06e42238363f9f60560f49f8a31f
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/abandonment-and-listing-route-connector-create-build
files:
- path: src/hooks/use-connector-configuration-form.ts
  effect: Adds a router and a navigate to the form hook and computes one onCancel closure — go back through the router's own history where it can, otherwise navigate to the connector-configurations listing — exposed on the returned form state so the abandonment act is available wherever the hook is consumed.
- path: src/routes/connector-configuration-create-screen.tsx
  effect: 'Replaces the single secondary button wrapping a link to the listing with two controls in the trailing-actions slot: a plain button carrying the abandonment, and a secondary button wrapping a link to the connector-configurations listing.'
criteria:
- criterion: Taking the abandonment control lands the operator on the surface the authoring surface was reached from, whichever surface that is, the connector-configurations listing included.
  met: true
  how: onCancel goes back through the router's own history whenever the router reports it can, landing on whatever surface the previous history entry holds — the listing among them, with no destination hardcoded or privileged over another.
- criterion: Taking the abandonment control, where the authoring surface was reached from no surface, lands the operator on the connector-configurations listing.
  met: true
  how: onCancel's other branch, taken exactly when the router reports it cannot go back — the surface was opened at its own address or reloaded at it — navigates to the connector-configurations listing route.
- criterion: Taking the abandonment control issues no register-connector call and leaves every registered connector configuration exactly as it stood.
  met: true
  how: onCancel only ever goes back or navigates; it never references the mutation the hook also returns, so no register-connector call is issued and the registered set is untouched.
- criterion: A control whose destination is the connector-configurations listing renders on the surface.
  met: true
  how: The screen's trailing actions render a secondary button wrapping a router link to the listing, unconditionally alongside the abandonment control; this screen has one reading, so that is the surface's only one.
- criterion: Taking the control whose destination is the connector-configurations listing issues no register-connector call.
  met: true
  how: That control is a plain router link inside the button, which only navigates on click; nothing in its render or click path touches the mutation.
- criterion: No control returning the surface's fields to the content of a read registration renders on the surface.
  met: true
  how: The screen constructs its hook with no existing registration on this route, and neither file defines a discard or reset act; the hook holds no read content for such an act to restore fields from, so none was added.
- criterion: No proof of the connector-configuration creation surface asserts that the abandonment lands the operator at the connector-configurations listing where a reaching surface exists.
  met: true
  how: onCancel branches on whether the router can go back rather than on a fixed listing destination, so no source behaviour exists for a proof to truthfully assert a fixed-listing landing where a reaching surface exists. Authoring the proof is a separate judgment and touches no file this record lists.
nodes:
- node: rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering
  encoded_at:
  - src/hooks/use-connector-configuration-form.ts
  - src/routes/connector-configuration-create-screen.tsx
  how: The abandonment control, wired to onCancel, never issues the register-connector call and lands the operator on the surface the authoring was reached from, leaving the registered set untouched. The Description's extension to authoring that replaces an already-registered configuration is not reached — this task's criteria cover only the creation surface, as the task's own notes record.
- node: rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
  encoded_at:
  - src/hooks/use-connector-configuration-form.ts
  how: 'Answers only the connector-configuration branch this task reaches, at criterion 2: the router''s can-go-back reading distinguishes a surface opened at its own address or reloaded from one reached through navigation, and routes the former to the connector-configurations listing rather than to any identity-keyed surface.'
- node: rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing
  encoded_at:
  - src/routes/connector-configuration-create-screen.tsx
  how: 'Answers only the authoring branch this task reaches, at criteria 4 and 5: the link to the listing renders unconditionally on this screen''s one reading, and is a plain link, so taking it never issues the register-connector call. The detail-surface branches reach no criterion here and are left to this epic''s task over that surface.'
- node: rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
  how: 'Only the exclusion clause reaches this task, at criterion 6: the creation surface always constructs its hook with no existing registration, so it holds no read content for a field-restoring act to return to, and no such act is offered — the absence this clause requires rather than a fact encoded positively anywhere.'
inferences:
- inferred: The abandonment reuses the router-history walk with a can-go-back guard and a fallback navigation to the listing, the shape written for the sibling capability creation surface, rather than the unconditional history walk the two pre-existing knowledge-surface hooks use.
  from: This task's nodes are the same pair that produced that shape on the capability side, and the inventory's must_not_duplicate entry for the unconditional pattern does not fit here because that pattern has no fallback and criterion 2 needs one.
- inferred: The abandonment keeps the label Cancel; the new listing-route control is labelled after the listing rather than reusing Cancel.
  from: The task's own notes state that a control's wording is form the specification leaves to the interface. Cancel preserves the pre-split control's own label and this app's convention for a return-to-origin act, and the listing label is drawn from the listing screen's own heading, the same way the capability sibling drew its own, so the two controls read as distinguishable once split.
preserved:
- The Save submission flow — the submit handler, the mutation, its success toast, the cache invalidation and the navigation to the newly registered configuration's own surface — untouched.
- The connector field's disabled-while-editing-identity behaviour and the JSON-validity gating of Save, both unchanged.
- The form-fields component's trailing-actions slot contract, unchanged in shape; only what the create screen passes into it changed.
- The save-failure message helper and the form state exports, both consumed elsewhere, untouched in signature.
deferred:
- what: Splitting the equivalent control and adding router-history abandonment on the connector-configuration detail surface, and the discard-and-confirm act there.
  why: The task's own notes assign the detail surface's presented-configuration branches, its outstanding and failed windows, and the positive clauses of the discard act to this epic's task over that surface.
- what: Extending the abandonment to authoring that replaces a connector configuration already registered under a connector name.
  why: The task's own notes record that its criteria reach only the creation surface; the replace-in-place authoring case belongs to the work over the edit surface.
- what: Updating the pre-existing specs that assert the old single control by the link role and a fixed address — the create screen's own cancel spec, its screen spec and its test support.
  why: Test authorship is a separate judgment in a separate context; this record covers source only. The inventory's own risk entry already names these files as consumers of exactly this change.
---

## What it is
The one Cancel-as-listing-link on this surface replaced by two controls with two destinations.
The abandonment goes back through the router's own history where there is somewhere to go back to, and to the connector-configurations listing where there is not.

## Notes
Written as the sibling of the capability creation surface's own split, delivered moments before this one against the same pair of rules, and departing from it only where the two registries' nodes differ — which the task's own notes name.
Two inferences, both disclosed: the guard-plus-fallback shape, and the two labels.
The proof step and the suite step did not run, by the caller's own instruction and not by any mode this entry point offers.
Four tasks of this plan change surfaces that seven earlier tasks of the same plan delivered, and those earlier proofs assert the pre-split form across all four; the suite is therefore red on assertions another task owns until those proofs are re-judged in their own contexts.
The caller chose to land every surface's source first and re-deliver the affected proofs once the tree has settled, so this record stands with no proof holding it up and `deliver.py --outstanding` reports exactly that, which is true.
This is not the substrate exemption: that one applies to a task declaring `produces`, and this task declares none.
The build run covered every step the registry declares except the suite, and all seven passed.
