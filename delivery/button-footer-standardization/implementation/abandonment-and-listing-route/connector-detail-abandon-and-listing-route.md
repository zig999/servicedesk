---
title: Connector-configuration detail surface's return to origin split from its listing route
summary: The detail surface's single Cancel link is split into a return-to-origin act carried by the router's own history and an unconditional route to the connector-configurations listing, both rendered on every reading, with neither control's presence turning on how the surface was reached.
task: sha256:625455e464f0ee3e0d059459769cee1d9cde135664ba27448e9671bc6892b312
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/abandonment-and-listing-route-connector-detail-build
files:
- path: src/hooks/use-connector-configuration-detail.ts
  effect: Adds a router-history-based return-to-origin act to the detail state, exposed on all three phases — go back where the router can, otherwise navigate to the connector-configurations listing — never reading the form's dirty state, so the act behaves identically whether or not the operator has edited.
- path: src/routes/connector-configuration-detail-screen.tsx
  effect: Renders both the abandonment control and a link to the connector-configurations listing in the loading and load-error phases' footer, replacing the single Cancel-as-listing-link that stood there before.
- path: src/routes/connector-configuration-detail-ready-view.tsx
  effect: Adds the abandonment control beside the existing link to the listing in the ready phase's trailing actions, so the ready phase now renders both controls rather than the listing link alone.
criteria:
- criterion: Taking the return-to-origin control, on a surface reached from a surface that exists, lands the operator on that surface, demonstrated over an origin that is not the connector-configurations listing.
  met: true
  how: onCancel goes back through the router's own history whenever the router reports it can, landing wherever that history entry holds regardless of which surface it is — the implementation places no restriction on which origin it returns to.
- criterion: Taking the return-to-origin control, where the detail surface was reached from no surface and the configuration has not been edited, lands the operator on the connector-configurations listing, demonstrated in each of the four readings of the surface.
  met: true
  how: Where the router reports it cannot go back, onCancel navigates to the connector-configurations listing unconditionally; that same onCancel is exposed and wired on all three phase branches, which together host all four readings, the refusal because nothing is registered under the name sitting inside the load-error phase as this surface presents it today.
- criterion: Taking the return-to-origin control, where the detail surface was reached from no surface and the configuration has been edited away from what the read answered, lands the operator on the connector-configurations listing.
  met: true
  how: onCancel's body never reads the form's dirty state or any form value, so the same fallback branch fires identically whether the ready-phase form has been edited or is untouched.
- criterion: A return-to-origin control renders while the read of the named connector's configuration is outstanding.
  met: true
  how: The loading branch of the screen renders the abandonment control, wired to onCancel, inside its footer.
- criterion: A return-to-origin control renders once that read has failed.
  met: true
  how: The load-error branch of the screen renders the same abandonment control, wired to onCancel.
- criterion: A return-to-origin control renders once the configuration has been read and is shown.
  met: true
  how: The ready view's trailing actions render the abandonment control, wired to onCancel, in the ready phase.
- criterion: A return-to-origin control renders where that read was refused because nothing is registered under that connector name.
  met: true
  how: That refusal is presented under the existing load-error phase on this surface today, so the load-error branch's abandonment control covers the reading without a fourth branch being authored — which this task deliberately does not author, the rule stating what that reading presents being the one node this plan's epic declares uncovered.
- criterion: The presence of the return-to-origin control and the presence of the listing-route control turn on nothing about which surface the detail surface was reached from, demonstrated over two origins that differ and over the connector-configurations listing itself.
  met: true
  how: Neither the screen nor the ready view inspects router history or navigation state in what it renders; the abandonment control and the listing link are unconditional siblings in every phase branch, so their presence never varies with origin.
- criterion: Taking the return-to-origin control issues no register-connector call and leaves every registered connector configuration exactly as it stood, in membership and in every registration's own content, in each of the four readings and on both destinations the act may land on.
  met: true
  how: onCancel's whole body is either a history walk or a navigation; neither calls the mutation that performs register-connector, nor any fetch at all, in any phase and on either destination.
- criterion: A control whose destination is the connector-configurations listing renders in each of those same four readings.
  met: true
  how: The link to the connector-configurations listing renders in all three phase branches, covering all four readings by way of the load-error phase hosting both the failed read and the refusal.
- criterion: Taking the control whose destination is the connector-configurations listing issues no register-connector call.
  met: true
  how: That control is a plain router link inside a secondary button; it navigates only, calling no mutation and no fetch.
- criterion: The outstanding-read reading states that the configuration is still being read.
  met: true
  how: 'Preserved and unchanged by this task: the loading phase''s own status line still states that the named connector''s configuration is being read, with no connector or configuration field beside it.'
- criterion: Neither the outstanding-read reading nor the failed-read reading states a connector or configuration value.
  met: true
  how: 'Preserved: neither the loading branch nor the load-error branch renders the form fields or any connector or configuration text; only the phase''s own status line and the footer''s controls render.'
- criterion: The reading standing on a read that failed other than by the refusal answered because nothing is registered under that connector name states that the configuration could not be read.
  met: true
  how: 'Preserved: the load-error phase''s own failure line is unchanged and identical whatever the failure''s cause, so it holds for the other-than-refusal case exactly as it did before.'
- criterion: That same reading carries a control that issues the read of the named connector's configuration again.
  met: true
  how: 'Preserved: the load-error phase''s reattempt control, which refetches the read, is unchanged.'
- criterion: The surface issues that read again only where the operator takes that control, and on no initiative of its own.
  met: true
  how: 'Preserved: the reattempt is invoked only from that control''s own click; no effect and no timer reissues the read on the surface''s own initiative.'
- criterion: The reading that shows the configuration states the connector and the configuration as the read answered them, and states no value that answer did not carry.
  met: true
  how: 'Preserved: the ready view renders the form and the configuration, both sourced from the read''s own answer through the hook''s effect, unchanged by this task.'
- criterion: The outstanding-read reading, the reading standing on a read that failed other than by that refusal, and the reading that shows the configuration are each distinguishable from the other two to the operator, and none of the three is rendered as either of the others.
  met: true
  how: 'Preserved: the three phase branches keep their own distinct text and markup — the loading status line, the failure line with its reattempt, the ready form. This task added the same two footer controls uniformly to all three, changing nothing that would make one read as another.'
- criterion: No control returning the surface's fields to the content of a read registration renders in the outstanding-read reading, in the reading standing on a read that failed other than by that refusal, or in the reading where that read was refused because nothing is registered under that connector name.
  met: true
  how: The field-restoring control exists only inside the ready view's trailing actions; the screen's loading and load-error branches — which together host the outstanding reading, the failed-other-than-refusal reading and the refusal — render no such control, unchanged by this task.
nodes:
- node: rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  - src/routes/connector-configuration-detail-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
  how: The return-to-origin act — a history walk where the router can, otherwise a navigation to the listing — is exposed on all three phases of the detail state and wired to a control rendered unconditionally in every phase, turning on nothing about the read's state, the operator's edits, or how the surface was reached. This is the connector-keyed half of the node's clauses; its capability-keyed half is the sibling task's.
- node: rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing
  encoded_at:
  - src/routes/connector-configuration-detail-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
  how: 'The link to the connector-configurations listing renders unconditionally on every phase branch, issuing no register-connector call and leaving every registration untouched. Read as universal rather than as the enumeration its own statement gives, per this task''s own advisory note: the node''s every-reading clause is what backs the control on the failed reading, which its enumeration does not name.'
- node: rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  how: The fallback branch, taken when the router cannot go back, navigates to the listing of the registry this surface presents, applied uniformly whether or not the operator holds an unsubmitted edit, since the act never reads the form's dirty state — which is what the node's widened predicate now asks for.
- node: rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  how: 'Only the destination clause reaches here, as this task''s own remainder note records: a ready-phase surface holding an unsubmitted edit of a standing registration reuses the same history-or-listing destination as any other reading, rather than a second act beside it. The authoring surface itself is out of this task''s reach.'
- node: rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
  encoded_at:
  - src/routes/connector-configuration-detail-screen.tsx
  how: 'Only the negative clause reaches here, as the task''s own remainder note records: the loading and load-error branches, which also host the refusal, render no field-restoring control, unchanged by this task. The positive clauses — the restore act, its dialog, its further explicit act — belong to the work over that act and were not touched.'
- node: rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read
  how: 'Honoured rather than encoded: this task asserts nothing about the fourth reading, which the epic declares uncovered, and leaves the three-window statement exactly as it stood — the outstanding line, the failure line with its reattempt, and the shown form. The node''s own exception, which makes the refusal a reading of its own rather than the failed window, is what decided which phase branch received the two new controls without a fourth presentation being authored.'
inferences:
- inferred: The two controls' shape — an abandonment running a guarded history walk with a fallback navigation to the listing, and a separate link to the listing — reuses the pattern this epic's two creation surfaces established moments ago, rather than the unconditional history walk the inventory names at the two knowledge-surface hooks.
  from: The already-delivered sibling files of this same epic, read directly; the unconditional pattern carries no listing fallback and so does not satisfy criteria 2 and 3.
- inferred: The act belongs on the base detail hook, beside the reattempt, rather than on the view hook, so it is available on all three phases without further wiring.
  from: The reattempt's own placement on the same base hook for the same reason, and the view hook's existing pass-through of the loading and load-error phases unchanged.
preserved:
- The loading phase's outstanding-read status line and its absence of any connector or configuration field.
- The load-error phase's failure line, its absence of any connector or configuration field, and its reattempt control's own refetch, issued only on click.
- The ready phase's presentation of connector and configuration exactly as the read answered them.
- The ready phase's field-restoring control, its confirmation dialog and its own further-explicit-act requirement, and its gating while clean or submitting.
- The status line shown after a successful save.
- The connector test panel's read-only configuration text, sourced from the registered configuration rather than the edited one.
- The Save control's mutation wiring and its dirty-and-valid gating.
deferred:
- what: The capability detail surface still carries the single Cancel-as-listing-link this task replaces on the connector-configuration side.
  why: The capability-keyed half of these same nodes belongs to this epic's sibling task over that surface, as this task's own remainder note records.
- what: The restore-to-read-content act and its confirmation dialog were left exactly as found.
  why: Only the negative clause of that node reaches this task; its positive clauses belong to separate work over that act.
- what: The fourth presentation — what this surface states when the read is refused because nothing is registered under the name.
  why: 'The specification now holds a rule for it and this plan''s epic declares that rule uncovered deliberately: delivering it is a fourth presentation where the surface holds three, which the scope does not ask for. The reading is left exactly as delivered, and the two controls this task owes there stand on the presentation the surface already uses.'
---

## What it is
The one Cancel-as-listing-link this surface rendered in each of its three phases, replaced by two controls with two destinations, both standing in all three.
The return-to-origin act goes back through the router's own history where there is somewhere to go back to, and to the connector-configurations listing where there is not — and it does so whether or not the operator has edited, which is what the widened abandonment rule now asks for.

## Notes
No fourth presentation was authored, deliberately.
The refusal because nothing is registered under the name is presented under this surface's existing failure phase today, and the rule stating what that reading should present is the one node this plan's epic declares uncovered — so the two controls this task owes on that reading stand on the presentation the surface already uses, and nothing here states what it says.
Two inferences, both disclosed: the guard-plus-fallback shape, taken from this epic's two creation surfaces rather than from the unconditional walk the inventory names, and placing the act on the base hook beside the reattempt.
One node is answered without any `encoded_at`: the three-window statement was honoured rather than changed, and its own exception is what decided which phase branch received the new controls.
The proof step and the suite step did not run, by the caller's own instruction and not by any mode this entry point offers.
Four tasks of this plan change surfaces that seven earlier tasks of the same plan delivered, and those earlier proofs assert the pre-split form across all four, so the suite is red on assertions another task owns until those proofs are re-judged in their own contexts.
The caller chose to land every surface's source first and re-deliver the affected proofs once the tree has settled, so this record stands with no proof holding it up and `deliver.py --outstanding` reports exactly that, which is true.
This is not the substrate exemption: that one applies to a task declaring `produces`, and this task declares none.
The build run covered every step the registry declares except the suite, and all seven passed.
