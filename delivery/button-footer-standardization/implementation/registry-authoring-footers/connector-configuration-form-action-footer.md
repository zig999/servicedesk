---
title: Connector configuration form action footer
summary: The connector-configuration create screen and detail ready view route their action row through the shared ButtonFooter, carrying Save, a Cancel that abandons authoring without registering, the pre-existing detail Discard, and both outcomes of a submission.
task: sha256:3eacf712c15d69667d5cfca3f89b12f5e904902d338a81ed0a6c25df675eff5f
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/registry-authoring-footers-connector-configuration-form-action-footer-build
files:
- path: src/routes/connector-configuration-form-fields.tsx
  effect: Renders its action row through the shared ButtonFooter instead of a plain end-aligned flex row; still forwards trailingActions after Save, with no second prop introduced.
- path: src/routes/connector-configuration-create-screen.tsx
  effect: Passes a Cancel control, a styled Link to the connector-configurations listing, through the existing trailingActions prop, so the footer carries Save plus Cancel on the create surface.
- path: src/routes/connector-configuration-detail-ready-view.tsx
  effect: Passes a Cancel control alongside the pre-existing Discard dialog and Saved status through trailingActions; renders the connector test panel ahead of the form fields rather than after them, so the footer stays the screen's last scrollable element; the file's rationale comment goes with the edit, this file being delivered whole.
- path: src/hooks/use-connector-configuration-form.ts
  effect: States the registered outcome naming the connector name submitted, on the mutation's own onSuccess; exports saveFailureMessage so the detail hook reuses the same refused-outcome distinction.
- path: src/hooks/use-connector-configuration-detail.ts
  effect: Adds an onError handler to the edit mutation, reusing saveFailureMessage to state a distinguishable refusal the detail surface previously left unstated.
criteria:
- criterion: connector-configuration-form-fields renders its action row through ButtonFooter rather than through its own end-aligned flex row.
  met: true
  how: The div carrying `flex items-center justify-end gap-3` around Save and trailingActions is replaced by ButtonFooter.
- criterion: Whatever a screen passes through the existing `trailingActions` prop is rendered inside the footer beside Save, and no second prop for appending buttons is introduced.
  met: true
  how: ButtonFooter's children are exactly the Save submit followed by trailingActions, unchanged but for the wrapping element, and the props type gained no new field.
- criterion: Submitting the connector-configuration form issues the registration, and where it succeeds the operator is taken to the surface addressed by that configuration's own connector name.
  met: true
  how: 'Preserved and unchanged: on create, the onSaved callback navigates to the connector''s own route using the submitted name; on the detail surface the operator already stands on the surface addressed by that connector name, and a successful edit stays there.'
- criterion: Where the registry answers a submission, the surface states the outcome — that the configuration was registered, naming the connector name submitted, or that nothing was registered and which refusal answered it, a named condition stated apart from a refusal whose condition the surface does not recognise.
  met: true
  how: On create, the mutation now states the success naming the connector submitted, and already stated a refusal through saveFailureMessage, which maps a recognised not-well-formed refusal to its own message and everything else to a generic one. On the detail surface a success is already stated inline beside the heading naming the connector, and a refusal is now stated the same distinguishable way through a new onError reusing that mapping. Neither outcome is stated before the mutation settles, both firing from the mutation's own handlers.
- criterion: On a connector-configuration detail surface whose read answered, the footer offers a control returning every field to the content that read answered, which registers nothing, leaves the operator on that surface, and takes effect only after a further explicit act by the operator.
  met: true
  how: 'Preserved: the pre-existing Discard, confirmed through its dialog''s own confirming close, now renders inside ButtonFooter, unchanged in behaviour — it resets every field to the read''s baseline, issues no register call, and stays on the surface.'
- criterion: The connector-configuration create surface, having read no registration, offers no such discard control.
  met: true
  how: The create screen's trailingActions carries only the new Cancel; no discard element is passed there.
- criterion: The footer carries a Cancel that leaves the authoring without registering anything, creating no configuration and leaving every registered configuration exactly as it stood, and returns the operator to the surface the authoring was reached from.
  met: true
  how: Both surfaces pass a secondary Button wrapping a Link to the connector-configurations listing through trailingActions — a plain navigation, never a submit, so it issues no register call.
- criterion: Every reading of the connector-configuration create surface, and of the detail surface's ready phase, offers the operator a route to the connector-configurations listing.
  met: true
  how: Already satisfied and unchanged by the pre-existing Back to connector configurations link, rendered unconditionally at the top of the create screen and on every phase of the detail screen including ready. This task adds no separate listing-route control, since one already covers both readings the criterion narrows to.
nodes:
- node: rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering
  encoded_at:
  - src/routes/connector-configuration-create-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
  how: The new Cancel on both surfaces is a plain link to the listing, never a form submission, so leaving through it issues no register call and returns the operator to the surface both authoring surfaces are reached from in this app's routing.
- node: rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing
  encoded_at:
  - src/routes/connector-configuration-create-screen.tsx
  how: For the two readings this task's criterion narrows to, the route stands through the pre-existing and untouched Back to connector configurations link. The rule's remaining windows, the detail surface's loading and load-error phases, and its arrival-independence are the depending return-route task's own, as this task's remainder note names.
- node: rules/integration/a-successful-connector-registration-lands-on-the-configurations-own-surface
  encoded_at:
  - src/routes/connector-configuration-create-screen.tsx
  - src/hooks/use-connector-configuration-detail.ts
  how: 'Preserved: create navigates to the connector''s own route using the submitted name, and a successful detail edit leaves the operator on the surface already addressed by that name, in both branches of the create-or-replace.'
- node: rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
  encoded_at:
  - src/hooks/use-connector-configuration-form.ts
  - src/hooks/use-connector-configuration-detail.ts
  - src/routes/connector-configuration-detail-ready-view.tsx
  how: The create path states both outcomes, a new success naming the connector and the existing distinguishable-or-generic refusal; the detail path states the refusal through a new handler reusing the same distinction, and states the registration through the pre-existing inline status beside the connector name its heading already shows. Neither is stated before the mutation settles.
- node: rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
  encoded_at:
  - src/routes/connector-configuration-detail-ready-view.tsx
  - src/routes/connector-configuration-create-screen.tsx
  how: 'Preserved: the Discard stays exclusive to the ready view, now carried inside the footer; the create surface carries no such control, and the detail surface''s loading and load-error phases render no ready view at all, so none is offered there either.'
inferences:
- inferred: Cancel's destination is the connector-configurations listing, read as the surface the authoring was reached from.
  from: route-tree.tsx shows the create route and the connector route are reachable only by navigating from the listing screen, and the already-delivered capability sibling uses the identical link pattern for the same rule on its own side.
- inferred: Cancel and the pre-existing listing-route link are kept as two distinct controls rather than folded into one, though both presently resolve to the same place.
  from: The abandonment rule states its destination as wherever the authoring was reached from, while the route rule states its destination as the listing unconditionally — two different general claims that coincide today only because of this app's current routing topology.
- inferred: The create surface's registered outcome is stated on the mutation's own onSuccess, naming the connector submitted.
  from: The identical already-delivered pattern on the capability side, the outcome rule stating only that the operator must be told and never by which mechanism.
- inferred: The detail surface's registered outcome stays the pre-existing inline status plus its heading naming the connector, rather than adding a second statement.
  from: The same asymmetry already accepted on the capability side, where the detail hook states nothing and the ready view's status carries the confirmation.
- inferred: The connector test panel now renders before the form fields inside the detail ready view, rather than after.
  from: The shared footer's non-overlap guarantee depends on it being the last element of the screen's scrollable content, which the component's own record disclosed as a constraint on its consumers; only this ready view, and not its capability counterpart, had content trailing the form.
preserved:
- The pre-existing Back to connector configurations links on both screens, untouched by this task.
- The pre-existing Discard confirmation dialog and its dirty and submitting gating in the detail ready view.
- The pre-existing inline Saved status text in the detail ready view.
- The pre-existing navigation to the connector's own route on a successful create.
- The pre-existing refusal message distinction in the form hook, now reused by the detail hook rather than duplicated.
deferred:
- what: Removing the top-of-screen Back to connector configurations links and extending the listing route to the detail screen's loading and load-error phases.
  why: The depending connector-configuration-screen-return-route task's own job, as this task's remainder note names it.
- what: The capability clauses of the two shared rules.
  why: They belong to the capability form's own action footer task, already delivered, as this task's remainder note names.
- what: What the connector-configuration registry contract publishes or answers.
  why: 'Advisory per this task''s own note: no criterion here decides it, only what the surface does around calls the implemented rules already name.'
---

## What it is
The connector-configuration create screen and detail ready view reaching their actions through the shared footer, with a Cancel added to both and a refusal outcome added to the detail surface that had none.
The connector test panel moved ahead of the form so the footer is the last thing the screen scrolls.

## Notes
The reorder is the one structural change beyond relocation, and it comes from the component's own delivery, which disclosed that its non-overlap guarantee holds only where nothing in normal flow follows it; this ready view was the one screen of the four with content trailing the form.
Cancel and the route to the listing stay two controls, as on the capability side: their rules state different destinations in general, and the two coincide here only because of this app's present routing.
The detail surface stated nothing at all for a refused save before this delivery, which is the only behaviour change beyond relocation and the reorder; the same named mapping the create surface already used is exported and reused rather than duplicated.
One file lost its rationale comment as part of being delivered whole, under the rule that a session writing a source file delivers it under the comment rule.
