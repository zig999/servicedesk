---
title: Capability form action footer
summary: The capability create and detail-ready surfaces render Save, Discard, Cancel and trailingActions through the shared ButtonFooter, and both surfaces state a registered or refused outcome only once the registry has answered.
task: sha256:534e7b4d0175e359ef670d0e9ab0e1521a07173f13b8f2967acf282f479dd606
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/registry-authoring-footers-capability-form-action-footer-build
files:
- path: src/routes/capability-form-fields.tsx
  effect: renders its action row through the shared ButtonFooter, Save plus trailingActions, instead of an end-aligned flex div; the JsonTextareaField-guidance comment goes with the edit, this file being delivered whole.
- path: src/routes/capability-create-screen.tsx
  effect: passes a Cancel control, a secondary Button wrapping a Link to the capabilities listing, through the existing trailingActions prop, so the ready-phase footer carries Save and Cancel.
- path: src/routes/capability-detail-ready-view.tsx
  effect: appends a Cancel control after the existing Discard dialog and Saved status inside trailingActions; the header comment documenting the Discard button's rationale goes with the edit, this file being delivered whole.
- path: src/hooks/use-capability-form.ts
  effect: exports saveFailureMessage as one named mapping other capability hooks reuse, and states the success outcome naming the submitted name and version, fired only from the mutation's onSuccess.
- path: src/hooks/use-capability-detail.ts
  effect: adds an onError handler to the edit mutation, reusing saveFailureMessage to state a distinguishable named condition or the unrecognised message; a refused save on this surface previously stated no outcome at all.
criteria:
- criterion: capability-form-fields renders its action row through ButtonFooter rather than through its own end-aligned flex row.
  met: true
  how: The closing div carrying `flex items-center justify-end gap-3` around Save and trailingActions was replaced with ButtonFooter.
- criterion: Whatever a screen passes through the existing `trailingActions` prop is rendered inside the footer beside Save, and no second prop for appending buttons is introduced.
  met: true
  how: trailingActions is still the only prop CapabilityFormFieldsProps declares for appending controls, rendered as ButtonFooter's second child after Save. Cancel on both surfaces and the pre-existing Discard and Saved content all reach the footer exclusively through it.
- criterion: Submitting the capability form issues the registration, and where it succeeds the operator is taken to the surface addressed by that capability's own name and version.
  met: true
  how: 'Unchanged behaviour: the create screen''s mutation onSuccess still calls onSaved, which navigates to the capability''s own name and version route with the submitted values; on the detail screen the identity fields are disabled during an edit, so a successful write never moves the identity and the operator already stands on the surface addressed by it.'
- criterion: Where the registry answers a submission, the surface states the outcome — that the capability was registered, naming the name and version submitted, or that nothing was registered and which refusal answered it, a named condition stated apart from a refusal whose condition the surface does not recognise.
  met: true
  how: On the create surface, onSuccess now states the success naming the submitted name and version, and onError already stated a refusal through saveFailureMessage, which names a specific condition for four known refusals and a distinguishable generic message otherwise. On the detail surface the pre-existing Saved status with role status, together with the persistent heading carrying name and version, already stated the success and its identity; the missing half, a refusal outcome, is added by the new onError reusing the same mapping. Both handlers fire only once the mutation settles, so neither outcome is stated before the registry has answered.
- criterion: On a capability detail surface whose read answered, the footer offers a control returning every field to the content that read answered, which registers nothing, leaves the operator on that surface, and takes effect only after a further explicit act by the operator.
  met: true
  how: 'Unchanged behaviour, relocated: the Discard dialog still resets every field including both JSON schemas to the last read baseline, issues no register call, keeps the operator on the surface, and confirms through the dialog''s own destructive close. It now renders inside ButtonFooter through trailingActions, and only within CapabilityDetailReadyView, which is to say only once the read has answered, never in the detail screen''s loading or load-error branches.'
- criterion: The capability create surface, having read no registration, offers no such discard control.
  met: true
  how: capability-create-screen.tsx's trailingActions carries only the new Cancel control; no discard was added there.
- criterion: The footer carries a Cancel that leaves the authoring without submitting it, registering nothing and replacing no registered capability, and returns the operator to the surface the authoring was reached from.
  met: true
  how: 'Both surfaces render a Cancel as a secondary Button wrapping a Link, reusing the composition the inventory names from case-version-editor-ready-view. It issues no submit and no mutation, being a plain navigation link to the capabilities listing, which route-tree.tsx shows is the only navigation source reaching either authoring surface: the New capability button and a listing row click.'
- criterion: Every reading of the capability create surface, and of the capability detail surface's ready phase, offers the operator a route to the capabilities listing.
  met: true
  how: 'Pre-existing and untouched: capability-create-screen.tsx renders one Back to capabilities link unconditionally, ahead of its phase branches, and capability-detail-screen.tsx renders its own in each of its three returns. This control is kept deliberately separate from the new Cancel: the same eventual destination under this app''s current routing, but a different fact of a different rule, present under different conditions, so the two are never collapsed into one control.'
nodes:
- node: contracts/integration/capability-registry
  encoded_at:
  - src/hooks/use-capability-form.ts
  - src/hooks/use-capability-detail.ts
  how: register-capability is the write both hooks' mutations already issue; this task's facts sit on top of that call, stating its outcome and offering an abandonment route, without adding, moving or renaming any operation.
- node: rules/integration/an-abandoned-capability-registration-entry-registers-nothing
  encoded_at:
  - src/routes/capability-create-screen.tsx
  - src/routes/capability-detail-ready-view.tsx
  how: Cancel is a plain navigation link carrying no submit and no mutation, present both on the surface authoring a new identity and on the surface authoring at an identity already registered, landing the operator back on the listing in both cases, which route-tree.tsx shows is the surface each authoring was reached from.
- node: rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing
  how: 'Governed the work without adding a fact of its own: the pre-existing per-branch Back to capabilities links already satisfy this rule''s every-reading requirement, including the outstanding and failed windows, and this task left them untouched rather than collapsing them into the new Cancel.'
- node: rules/integration/a-successful-capability-registration-lands-on-the-capabilitys-own-surface
  how: 'Governed the work without a new fact: the create screen''s existing navigate-on-success and the detail screen''s disabled identity fields already put a successful registration''s landing at the surface the identity-keyed read answers, and this task changed neither.'
- node: rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
  encoded_at:
  - src/hooks/use-capability-form.ts
  - src/hooks/use-capability-detail.ts
  how: The success statement on the create surface and the existing Saved status with the heading on the detail surface state a registration and name it; the refusal statement on both surfaces names a distinguishable condition for four known refusals or an explicitly unrecognised message otherwise. Both fire only from onSuccess and onError, so only once the registry has answered.
- node: rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
  how: 'Governed the work without a new fact: the pre-existing Discard dialog already resets to the last read content, issues no register call, stays on the surface and gates on a further explicit confirm, and renders only once the read has answered. This task relocated it into the footer without changing its behaviour.'
inferences:
- inferred: Cancel's destination on both surfaces is the fixed capabilities listing route.
  from: route-tree.tsx shows the create route and the identity route are each reachable from exactly one place, the New capability button and a listing row click, both at the listing; and the inventory's must_not_duplicate entry names the Cancel-as-styled-Link composition from case-version-editor-ready-view, a hard-coded link rather than history-based back navigation, as the pattern to reuse.
- inferred: The mechanism for stating a registration's outcome is form left to the interface, and the existing toast convention was followed for both the new success statement and the newly added detail-surface refusal.
  from: The rule's own text, which leaves which control carries either statement to the interface, and use-capability-form.ts's pre-existing refusal toast.
- inferred: The detail surface's existing Saved status together with the always-present heading already jointly states the success outcome and what was registered, so no wording changed there.
  from: Existing tests pinning the exact Saved text and its role; changing it would be a redo of settled, tested behaviour rather than a correction of form.
preserved:
- The form-id-plus-external-submit pattern is untouched, this task reaching neither case-version-editor file.
- capability-form-fields.tsx's trailingActions prop signature and both its consumers keep the same shape, with no second prop introduced.
- The existing Back to capabilities links in the create screen and in all three branches of the detail screen keep working, none removed, moved or repointed.
- The Discard dialog's trigger and portal behaviour, its disabled gating, its confirm and keep-editing buttons, and the reset-to-last-saved baseline are unchanged; only their JSX position moved into the footer.
- The Saved status text, its role and the tests pinning its wording keep working; no new success text was added on the detail surface.
- The create-surface refusal mapping and its existing refusal statement keep working; the function was only exported so a second hook reuses the same named mapping rather than duplicating it.
- AppShell's own main scroll region was not edited, and none of the edited files introduces an intervening overflow or transform context that would break the footer's sticky bottom.
deferred:
- what: The connector configuration form's own action footer is untouched.
  why: The connector-side clauses of the two shared rules, the four connector rules and the connector registry contract are this task's own remainder and advisory notes, and belong to that family's own task.
- what: The loading and load-error windows' own chrome for both capability surfaces, including the reattempt control in the failed window, was left as found.
  why: The remainder note assigns every clause of the read-window rule to the capability screen return route task, which delivers those windows.
- what: use-capability-form.ts's `existing` parameter and its identity-editing branch remain unreached by any caller.
  why: Unifying the two parallel capability-form hook implementations is a refactor this task's criteria do not ask for and would widen scope well past the footer, Cancel, discard and outcome facts this task implements.
---

## What it is
The capability create screen and the capability detail ready view reaching their actions through the shared footer, with a Cancel added to both and a refusal outcome added to the detail surface that had none.
The route to the listing and the Cancel stay two controls with two conditions, which is what the task's own notes warn a single control would violate.

## Notes
Three binders reported on this epic that a screen's Cancel and its route to a listing have different destinations and cannot be one control; this delivery keeps both, and the criterion answering the route is met by links that already existed rather than by anything written here.
The detail surface stated no outcome at all for a refused save before this delivery, which is the one behaviour change beyond relocation: the same named mapping the create surface already used is now exported and reused rather than duplicated.
Two files lost a comment as part of being delivered whole, under the rule that a session writing a source file delivers it under the comment rule; what those comments said about the Discard button's rationale is in this record and in the specification nodes the task implements.
The footer's sticky bottom rests on AppShell's main staying the nearest scrolling ancestor, and none of the edited files introduces an overflow or transform context between them.
