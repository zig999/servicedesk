---
title: Capability detail surface's return to origin split from its listing route, with the unregistered-identity refusal told apart from a failed read
summary: The detail surface's single Cancel link is split into an origin-aware return act and an unconditional route to the capabilities listing, both present on every reading, and the registry's own refusal of an identity nothing is registered at is carved out of the failed-read reading into a reading of its own that withholds the reattempt.
task: sha256:50b8fddba2a7c9d4dd4fa30168fb86e1ce9b2ddd965ec763e613e204b848f525
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/abandonment-and-listing-route-capability-detail-build
files:
- path: src/hooks/use-capability-detail.ts
  effect: 'Adds a router-based abandonment act exposed on every reading — go back where the router can, otherwise navigate to the capabilities listing — with no dependency on the form''s dirty state or on which surface the screen was reached from. Splits the former single error branch: a capability read refused because nothing is registered at that identity now returns a reading of its own, carrying the abandonment and no reattempt, while every other read failure keeps the load-error reading with both.'
- path: src/hooks/use-capability-detail-view.ts
  effect: Widens the pass-through half of the view state's union to carry the new reading, so it forwards through this hook untouched exactly as the two existing pre-ready readings already do.
- path: src/routes/capability-detail-screen.tsx
  effect: Renders the abandonment control and a link to the capabilities listing in the loading and load-error readings, replacing the single Cancel-as-listing-link, and adds a branch for the new reading that renders the same paragraph as load-error, the same two controls, and no reattempt.
- path: src/routes/capability-detail-ready-view.tsx
  effect: Adds the abandonment control beside the existing field-restoring dialog inside the trailing actions, and relabels the existing listing link so the two acts read as two distinct controls.
criteria:
- criterion: Taking the return-to-origin control, on a surface reached from a surface that exists, lands the operator on that surface, demonstrated over an origin that is not the capabilities listing.
  met: true
  how: onCancel goes back through the router's own history whenever the router reports it can, landing on whatever surface preceded the detail screen in that history, regardless of which surface it was.
- criterion: Taking the return-to-origin control, where the detail surface was reached from no surface and no field has been edited, lands the operator on the capabilities listing, demonstrated in each of the four readings of the surface.
  met: true
  how: onCancel's other branch, taken when the router reports it cannot go back, always navigates to the capabilities listing; onCancel is wired to the abandonment control in all four readings and never inspects the form's dirty state.
- criterion: Taking the return-to-origin control, where the detail surface was reached from no surface and a field has been edited away from what the read answered, lands the operator on the capabilities listing.
  met: true
  how: The same onCancel serves whether or not the form is dirty — it reads only whether the router can go back — so an edited ready reading with no reached-from surface takes the identical navigation as an unedited one.
- criterion: A return-to-origin control renders while the read of the named capability's identity is outstanding.
  met: true
  how: The loading branch of the screen renders the abandonment control wired to onCancel.
- criterion: A return-to-origin control renders once that read has failed.
  met: true
  how: The load-error branch of the screen renders the abandonment control wired to onCancel, alongside the pre-existing reattempt.
- criterion: A return-to-origin control renders once the capability has been read and is shown.
  met: true
  how: The ready view's trailing actions render the abandonment control wired to onCancel.
- criterion: A return-to-origin control renders where that read answered that no capability is registered at that name and version.
  met: true
  how: The new nothing-registered branch of the screen renders the abandonment control wired to onCancel, identically to the load-error branch except for the absent reattempt.
- criterion: The presence of the return-to-origin control and the presence of the capabilities-listing control turn on nothing about which surface the detail surface was reached from, demonstrated over two origins that differ and over the capabilities listing itself.
  met: true
  how: Both controls are rendered unconditionally in every reading's markup, and onCancel's own body reads only whether the router can go back, never which surface that entry is — so neither control's presence, only the act's destination, could vary with the origin.
- criterion: Taking the return-to-origin control issues no register-capability call and leaves every registered capability exactly as it stood, in membership and in every registration's own declared contract, in each of the four readings and on both destinations the act may land on.
  met: true
  how: onCancel's entire body is a history walk or a navigation, with no fetch call of any kind, so no register-capability call is ever issued by this control, whichever reading it is taken from and whichever destination it lands on.
- criterion: A control whose destination is the capabilities listing renders in each of those same four readings.
  met: true
  how: The link to the capabilities listing renders in loading, load-error and nothing-registered on the screen, and in the ready view's trailing actions.
- criterion: Taking the control whose destination is the capabilities listing issues no register-capability call.
  met: true
  how: That control is a plain router link, a client-side navigation with no fetch attached.
- criterion: The outstanding-read reading states that the capability at that name and version is still being read.
  met: true
  how: Unchanged pre-existing text in the loading branch, which names the capability being read by its own name and version.
- criterion: Neither the outstanding-read reading nor the failed-read reading presents the nature, the input schema, the output schema, the timeout, the connector or the concept of any capability as the content standing at that name and version.
  met: true
  how: The loading and load-error branches render only a paragraph and the footer's controls; the form fields component, where every one of those attributes is rendered, is reached only from the ready branch.
- criterion: The reading standing on a read that failed other than by the registry's refusal of an identity no capability is registered at states that the capability at that name and version could not be read.
  met: true
  how: Carving the registry's unregistered-identity refusal out into its own reading leaves the load-error reading covering exactly a failure other than that refusal, and that branch's pre-existing text states for that reading that the capability could not be read.
- criterion: That same reading carries a control whose one effect is to issue that same read again, and no other reading of the surface carries that control.
  met: true
  how: The reattempt appears only in the load-error branch; the loading, nothing-registered and ready branches render no such control, and the hook exposes the reattempt only on the load-error phase's own state.
- criterion: The surface issues the read of that name and version again only where the operator takes that control, and on no initiative of its own.
  met: true
  how: The refetch inside the reattempt is called only from that control's own click; no effect and no timer reissues the read on the surface's own initiative — unchanged from the pre-existing behaviour.
- criterion: The outstanding-read reading, the reading standing on a read that failed other than by that refusal, and the reading that shows the capability are each distinguishable from the other two to the operator, and none of the three is rendered as either of the others.
  met: true
  how: 'Unchanged: the loading branch''s own text, the load-error branch''s text with its reattempt, and the ready branch''s full form remain three distinct renderings. This criterion names only those three readings, not the new one.'
- criterion: No control returning the surface's fields to the content of a read registration renders in the outstanding-read reading, in the reading standing on a read that failed other than by that refusal, or in the reading where that read answered that no capability is registered at that name and version.
  met: true
  how: The field-restoring control is rendered only inside the ready view's trailing actions, reached only from the ready branch; the loading, load-error and nothing-registered branches render no such control.
nodes:
- node: rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading
  encoded_at:
  - src/hooks/use-capability-detail.ts
  - src/routes/capability-detail-screen.tsx
  - src/routes/capability-detail-ready-view.tsx
  how: onCancel is the one act this node states — landing on the reached-from surface where one exists, registering nothing — and it is exposed and rendered on all four readings, turning on nothing about the read's state, the operator's edits, or which surface it was reached from.
- node: rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
  encoded_at:
  - src/hooks/use-capability-detail.ts
  how: onCancel's fallback branch, taken when the router cannot go back, navigates to the capabilities listing — the destination this node names where no reached-from surface exists — and it does so whether or not the operator holds an unsubmitted edit, which is what the node's widened predicate now asks for.
- node: rules/integration/an-abandoned-capability-registration-entry-registers-nothing
  encoded_at:
  - src/hooks/use-capability-detail.ts
  how: The single onCancel serves the ready reading's own unsubmitted-edit branch without a second act and without a dirty check; its body issues no register-capability call, so an abandoned edit is never sent and every registered capability's own declared contract stands exactly as it stood.
- node: rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing
  encoded_at:
  - src/routes/capability-detail-screen.tsx
  - src/routes/capability-detail-ready-view.tsx
  how: The link to the capabilities listing renders on every reading and issues no register-capability call, turning on nothing about the read's state — which is both halves of what the node states for a surface presenting one registered capability.
- node: rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed
  encoded_at:
  - src/hooks/use-capability-detail.ts
  - src/routes/capability-detail-screen.tsx
  how: The hook now tells the registry's own unregistered-identity refusal apart from every other read failure, so the failed-window text and the reattempt apply only to the latter — which is the node's statement excepting that refusal from its failed window, and which its expression does not enumerate. The outstanding and shown windows' pre-existing distinguishing text is untouched.
- node: rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
  encoded_at:
  - src/routes/capability-detail-screen.tsx
  how: 'Only the node''s negative clause is answered: the field-restoring control renders in none of the loading, load-error or nothing-registered readings, only inside the ready reading''s own view. The positive clause predates this task and is untouched, and belongs to separate work over that act.'
inferences:
- inferred: A fourth reading of the surface, distinguishing the registry's refusal of an identity nothing is registered at from every other read failure.
  from: 'This task''s own criteria force it: criterion 14 states the failed-read text for a failure other than that refusal, and criterion 15 puts the reattempt in that reading and in no other reading of the surface — so a single reading serving both the refusal and other failures cannot satisfy both. The condition the new reading detects is the exact refusal constraints/the-capability-identity-read-refuses-an-unregistered-identity states.'
- inferred: The new reading renders the same paragraph the load-error reading renders, omitting only the reattempt.
  from: The task's own advisory note records that no node states what this reading presents and that rendering it exactly as the failed-read reading satisfies every criterion as written, no candidate over this surface refusing that. Reusing existing wording rather than composing new wording for a reading no node describes is what keeps this delivery from stating a fact no node holds.
- inferred: The abandonment control and the listing-route control keep the labels this epic's already-delivered sibling surfaces gave the same two acts.
  from: The counterpart on the other registry, delivered moments before this one, names the same two controls the same way; every node here leaves a control's wording to the interface, so this follows the one convention this epic has already set for this two-act shape.
- inferred: The abandonment's own shape — a guarded history walk with a fallback navigation, and no dependency on dirty state — is taken from the counterpart's own act rather than from the unconditional walk the inventory names.
  from: The counterpart hook on the other registry, and the inventory's convention entry describing the abandon-to-opening-surface pattern already proven elsewhere in this codebase, which carries no fallback and so would not satisfy criteria 2 and 3.
divergences:
- from: rules/integration/a-presented-connector-configuration-states-a-connector-name-nothing-is-registered-under
  departure: The new reading states that the capability could not be read, which is the wording the load-error reading uses, on a reading where the read did in fact answer.
  why: 'No node states what this surface presents on that reading — the decision log records that silence twice as noticed and not decided — so the alternative was composing wording for it, which would be stating a fact no node holds. Reusing the neighbouring reading''s text states nothing new. It is disclosed against the sibling registry''s own node because that node, written today over the connector surface, refuses exactly this presentation there: it states that such a reading presents nothing to the effect that the configuration could not be read. That node governs the connector screen and not this one, and this plan''s epic declares it uncovered deliberately — so nothing here contradicts a node that reaches this surface, and this entry exists so a reader meets the asymmetry rather than discovering it.'
preserved:
- The register-capability mutation flow in the hook, unchanged.
- The field-restoring act and its confirmation dialog in the ready view, unchanged.
- The pre-existing distinguishing text for the outstanding and the generic-failed readings, and the ready reading's full form, unchanged.
- The dirty computation and the concept-vocabulary loading and failure handling, unchanged.
- The reattempt's refetch-both-reads behaviour for the load-error reading, unchanged.
deferred:
- what: What the new reading states to the operator, beyond reusing the neighbouring reading's wording.
  why: No node holds it, the decision log records the silence as noticed and not decided, and composing wording here would be stating a fact the specification does not hold.
---

## What it is
The one Cancel-as-listing-link this surface rendered in each of its readings, replaced by two controls with two destinations, both standing in all four.
And a fourth reading: the registry's refusal of an identity nothing is registered at, told apart from every other read failure, carrying both controls and no reattempt.

## Notes
The fourth reading was not a choice about presentation; this task's own criteria force it.
Criterion 14 states the failed-read text for a failure other than that refusal, and criterion 15 puts the reattempt in that reading and in no other reading of the surface, so one reading serving both cannot satisfy both — which is the asymmetry this task carries and its connector counterpart does not, resting on the node's statement rather than on its expression.
What that reading states is a different matter and is the one thing here worth a reader's eye: no node holds it, so the delivery reused the neighbouring reading's wording rather than composing any, and that wording says the capability could not be read on a reading where the read did answer.
That is disclosed as a divergence against the sibling registry's own node, which refuses exactly that presentation on the connector surface and which this plan's epic declares uncovered — so nothing here contradicts a node that reaches this surface, and the asymmetry is stated rather than left to be found.
The proof step and the suite step did not run, by the caller's own instruction and not by any mode this entry point offers.
Four tasks of this plan change surfaces that seven earlier tasks of the same plan delivered, and those earlier proofs assert the pre-split form across all four, so the suite is red on assertions another task owns until those proofs are re-judged in their own contexts.
The caller chose to land every surface's source first and re-deliver the affected proofs once the tree has settled, so this record stands with no proof holding it up and `deliver.py --outstanding` reports exactly that, which is true.
This is not the substrate exemption: that one applies to a task declaring `produces`, and this task declares none.
The build run covered every step the registry declares except the suite, and all seven passed.
