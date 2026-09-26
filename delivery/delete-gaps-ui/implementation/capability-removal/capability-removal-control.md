---
target: frontend
title: Capability removal control behind a further explicit act
summary: Adds a destructive-variant removal control to the capability detail screen's
  ButtonFooter, gated by a confirmation dialog, whose confirm act alone issues the
  DELETE to the capability's own resource path.
task: sha256:ff805764faa36ac944d4831be6c2d25d856914c2036856af66a220fd56a1697b
files:
- path: src/hooks/use-capability-detail.ts
  effect: Adds a deleteMutation (useMutation over apiFetch<void> DELETE /v1/capabilities/:name/:version)
    and exposes isDeleting and onDelete on the ready phase of CapabilityDetailState;
    onDelete only calls deleteMutation.mutate().
- path: src/routes/capability-detail-ready-view.tsx
  effect: Adds a "Remove capability" destructive Button (DialogTrigger) beside the
    existing "Discard changes" control, opening a Dialog whose DialogFooter offers
    a "Cancel" DialogClose with no handler and a destructive "Remove capability" DialogClose
    whose onClick is state.onDelete.
criteria:
- criterion: The capability's surface at /capabilities/:name/:version offers a removal
    control for the capability it presents.
  met: true
  how: CapabilityDetailScreen renders CapabilityDetailReadyView, whose trailingActions
    now include a Remove capability DialogTrigger in the ButtonFooter.
- criterion: Taking the removal control asks whether the capability's removal is to
    be performed.
  met: true
  how: The DialogTrigger opens a Dialog titled "Remove this capability?" with a description
    stating the removal is permanent, before anything is issued.
- criterion: Taking the removal control issues no DELETE request.
  met: true
  how: The DialogTrigger carries no onClick calling onDelete/mutate.
- criterion: Confirming the removal in the further act issues one DELETE request to
    /v1/capabilities/:name/:version carrying the presented capability's name and version.
  met: true
  how: The destructive DialogClose's onClick is state.onDelete, calling deleteMutation.mutate(),
    whose mutationFn issues apiFetch<void> DELETE against the same name/version the
    hook was invoked with.
- criterion: Declining the further act issues no DELETE request.
  met: true
  how: The "Cancel" DialogClose carries no onClick handler.
- criterion: After the further act is declined, the surface still presents the capability
    unchanged under the same name and version.
  met: true
  how: Declining triggers no mutation and no cache invalidation.
- criterion: The further act does not ask the operator to type the capability's name
    or version.
  met: true
  how: The confirmation dialog holds only a description paragraph and two buttons,
    no input field.
nodes:
- node: rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act
  encoded_at:
  - src/routes/capability-detail-ready-view.tsx
  - src/hooks/use-capability-detail.ts
  how: The capability branch is encoded by the Dialog/DialogTrigger/DialogClose gating
    and by onDelete, the only path that calls deleteMutation.mutate(), reachable only
    from the confirm button. The concept and connector-configuration clauses are out
    of this task's reach.
- node: domain/integration/capability
  encoded_at:
  - src/hooks/use-capability-detail.ts
  how: deleteMutation addresses the aggregate by its own identity attributes (name,
    version), reusing the identical closure variables already used by this hook's
    GET and PUT calls.
inferences:
- inferred: The removal control belongs in the ButtonFooter rendered inside CapabilityDetailReadyView
    (via CapabilityFormFields' trailingActions).
  from: 'The screen''s composition: only that ButtonFooter presents the loaded capability''s
    actions.'
- inferred: The confirmation dialog is implemented inline with Radix's own uncontrolled
    open state, not a new standalone controlled-dialog component.
  from: The already-existing "Discard changes" dialog in this same file uses exactly
    that shape.
- inferred: The DELETE endpoint's path is /v1/capabilities/:name/:version, the identical
    resource path this hook's existing GET and PUT calls already address.
  from: The task's own ADVISORY note plus this hook's own existing GET/PUT calls.
- inferred: The Remove capability trigger button is disabled while a delete is already
    pending.
  from: The existing "Discard changes" trigger already disables itself while its own
    action is in flight.
preserved:
- The existing save (PUT) flow, its isDirty/isSubmitting/isSubmitSuccessful state,
  and its toast-based failure disclosure.
- The existing Discard changes confirmation dialog and its onDiscard behavior.
- The existing loading, load-error, and not-registered phases and their ButtonFooter
  actions.
- The existing onCancel navigation.
deferred:
- what: Putting a removal control behind the same further-explicit-act pattern on
    the glossary concept row and the connector-configuration detail screen.
  why: REMAINDER — assigned to the sibling tasks for those two removals.
- what: Stating the removal's outcome to the operator (success or the HTTP 409 CapabilityCitedByEvidenceError
    refusal).
  why: REMAINDER — this task stops once the DELETE is issued.
- what: Landing a successful capability removal on the capabilities listing.
  why: REMAINDER — assigned to a separate task; no onSuccess navigation was added
    here.
- what: Client-side handling of the HTTP 409 CapabilityCitedByEvidenceError refusal.
  why: REMAINDER — belongs to the outcome-disclosure task.
run: run/capability-removal-capability-removal-control-build
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
---

## What it is
A destructive removal control on the capability detail screen, gated behind a Cancel/destructive-confirm dialog with no name typing, issuing DELETE only on confirm.

## Notes
None.
