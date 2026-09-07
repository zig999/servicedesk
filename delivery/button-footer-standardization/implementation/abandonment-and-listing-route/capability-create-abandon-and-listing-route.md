---
title: Capability creation surface's abandonment split from its listing route
summary: The creation surface now carries two separate controls in every phase — an abandonment that returns to the surface the authoring was reached from, or the capabilities listing where none exists, and an unconditional route to the capabilities listing.
task: sha256:bf78a984bfe3c735767173b89d0981c0abbfbbdbfb180cef32a9888b5f7d1745
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/abandonment-and-listing-route-capability-create-build
files:
- path: src/hooks/use-capability-form.ts
  effect: Adds a router and a navigate to useCapabilityForm and computes one onCancel closure — go back through the router's own history where it can, otherwise navigate to the capabilities listing — exposed on all three branches of the form state, so the abandonment act is available and identically wired on every reading of the surface.
- path: src/routes/capability-create-screen.tsx
  effect: 'Replaces the single secondary button wrapping a link to the listing, repeated once per phase, with two controls rendered in every phase: a plain button carrying the abandonment, and a secondary button wrapping a link to the capabilities listing. Both stand in the loading footer, in the load-error footer beside Retry, and in the ready phase''s trailing actions.'
criteria:
- criterion: Taking the abandonment control lands the operator on the surface the authoring entry was reached from, whichever surface that is, the capabilities listing included.
  met: true
  how: onCancel goes back through the router's own history whenever the router reports it can, which lands on whatever surface the previous history entry holds — the listing among them, with no privilege given to it.
- criterion: Taking the abandonment control, where the authoring surface was reached from no surface, lands the operator on the capabilities listing.
  met: true
  how: onCancel's other branch, taken exactly when the router reports it cannot go back — the surface was opened at its own address or reloaded at it — navigates to the capabilities listing.
- criterion: Taking the abandonment control issues no register-capability call and leaves every registered capability exactly as it stood.
  met: true
  how: onCancel only ever goes back or navigates; it never references the mutation, so no register-capability call is issued and the registered set is untouched.
- criterion: A control whose destination is the capabilities listing renders while the read of the concepts the surface offers is outstanding.
  met: true
  how: The loading branch of the screen renders the link to the capabilities listing inside its own footer.
- criterion: A control whose destination is the capabilities listing renders once that read of the concepts has failed.
  met: true
  how: The load-error branch renders the same link beside Retry and the abandonment control.
- criterion: A control whose destination is the capabilities listing renders once the surface is ready to author.
  met: true
  how: The ready branch passes the same link into the form fields component's trailing-actions slot, rendered inside its footer.
- criterion: Taking the control whose destination is the capabilities listing issues no register-capability call.
  met: true
  how: The listing control is a plain router link, which only navigates; nothing in its render path touches the mutation.
- criterion: No control returning the surface's fields to the content of a read registration renders on the surface.
  met: true
  how: Neither file defines a discard or reset act anywhere; the hook is always constructed with no existing registration on this route, so it holds no read content for such an act to restore fields from, and none was added.
- criterion: No proof of the capability creation surface asserts that the abandonment lands the operator at the capabilities listing where a reaching surface exists.
  met: true
  how: onCancel branches on whether the router can go back rather than on a fixed listing destination, so no source behaviour exists for a proof to assert a fixed-listing landing where a reaching surface exists. Authoring the proof is a separate judgment and touches no file this record lists.
nodes:
- node: rules/integration/an-abandoned-capability-registration-entry-registers-nothing
  encoded_at:
  - src/hooks/use-capability-form.ts
  - src/routes/capability-create-screen.tsx
  how: The abandonment control, wired to onCancel in every phase, never issues the register-capability call and lands the operator on the surface the authoring was reached from, leaving the registered set untouched and the listing holding no special privilege among the possible destinations.
- node: rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
  encoded_at:
  - src/hooks/use-capability-form.ts
  how: 'Answers only the capability half this task reaches, at criterion 2: the router''s can-go-back reading distinguishes a surface opened at its own address or reloaded — where no entry exists to go back to — from one reached through navigation, and routes the former to the capabilities listing, never to the identity-keyed surface itself.'
- node: rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing
  encoded_at:
  - src/routes/capability-create-screen.tsx
  how: 'Answers only the authoring half this task reaches, at criteria 4 through 7: the link to the capabilities listing renders unconditionally in all three phases — outstanding read, failed read, ready to author — and is a plain link, so taking it never issues the register-capability call.'
- node: rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
  how: 'Only the final clause reaches this task, at criterion 8: the creation surface never holds a read registration, so no field-restoring act is offered — the files declare none, which is the absence this clause requires rather than a fact encoded positively anywhere.'
inferences:
- inferred: The abandonment reuses the router-history shape the inventory already names as this project's abandon-to-opening-surface convention, extended with a can-go-back guard and a fallback navigation to the capabilities listing.
  from: The inventory's must_not_duplicate entry naming that pattern at the two knowledge-surface hooks, plus the router history's own can-go-back reading, which is false exactly when the current entry is the first — the surface opened at its own address or reloaded. The two adjacent hooks' rule does not need that fallback and this task's own node does.
- inferred: The abandonment keeps the label Cancel; the new listing-route control is labelled Capabilities rather than reusing Cancel.
  from: The task's own notes state that wording is form and unconstrained by any node. Cancel preserves the pre-split control's own label and this app's existing convention for a return-to-origin act, and Capabilities is drawn from the listing screen's own heading so the two controls read as distinguishable once split.
- inferred: The abandonment renders in every phase rather than only once ready to author.
  from: The task's own advisory note records that both readings satisfy it, since no candidate states whether a creation surface offers the abandonment while its own read is outstanding or has failed; rendering in every phase matches the pre-existing arrangement, where the single unsplit control already stood in all three.
preserved:
- The Save submission flow — the submit handler, the mutation, its success toast, the cache invalidation and the navigation to the newly registered capability's own surface — untouched.
- The Retry control on the load-error phase, still refetching the concepts read exactly as before.
- The form fields component's trailing-actions slot contract, unchanged in shape; only what the create screen passes into it changed.
- The save-failure message helper and the JSON schema field state, both exported from the hook and consumed elsewhere, untouched.
deferred:
- what: Splitting the same control on the capability detail surface, the connector-configuration creation surface and the connector-configuration detail surface, and adding router-history abandonment to their own hooks.
  why: The task's own remainder notes assign each of those surfaces to another task of this epic; none of their clauses reaches a criterion of this task.
- what: Factoring the two-entry-history mount helper the existing cancel specs duplicate, and updating the create screen's own action spec and test support for the new control split.
  why: Test authorship is a separate judgment in a separate context; this record covers source only.
---

## What it is
The one Cancel-as-listing-link this surface rendered three times, once per phase, replaced by two controls with two destinations, both standing in all three phases.
The abandonment goes back through the router's own history where there is somewhere to go back to, and to the capabilities listing where there is not.

## Notes
The can-go-back guard is the whole of what criterion 2 needed and the whole of what the two adjacent knowledge-surface hooks did not: they go back unconditionally, which on a surface opened at its own address does nothing at all.
Three inferences, all disclosed: the guard-plus-fallback shape, the two labels, and rendering the abandonment in every phase rather than only once ready.
The third rests on the task's own advisory note, which records that no candidate states whether a creation surface offers the abandonment while its own read is outstanding — so both readings satisfy the task, and this one matches what the surface already did before the split.
The build run covered every step the registry declares except the suite, and all seven passed.
