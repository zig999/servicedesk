---
target: frontend
title: Connector configuration removal control behind a further explicit act
summary: Adds a Remove connector configuration control to the detail screen's footer
  that asks for confirmation and issues one DELETE to /v1/connectors/:connector only
  when the operator confirms.
task: sha256:e273fd31968ee1100dc7313e1c661a3043c1084f6e26c79a682b3d805a77f714
files:
- path: src/hooks/use-connector-configuration-detail.ts
  effect: Adds a removeMutation (DELETE /v1/connectors/:connector, invalidating the
    connector-configurations list and this configuration's own query on success) and
    exposes onRemove and isRemoving on the ready phase.
- path: src/routes/connector-configuration-detail-ready-view.tsx
  effect: Adds a "Remove connector configuration" destructive control to the ready
    view's trailing actions, gated behind an uncontrolled Dialog (Cancel "Keep configuration"
    / destructive "Remove connector configuration") that calls state.onRemove only
    when confirmed.
criteria:
- criterion: The connector configuration's surface at /connectors/:connector offers
    a removal control for the configuration it presents.
  met: true
  how: ConnectorConfigurationDetailReadyView's trailing actions now always include
    a Remove connector configuration button.
- criterion: Taking the removal control asks whether the configuration's removal is
    to be performed.
  met: true
  how: The control is a DialogTrigger; taking it opens a Dialog with a description
    stating the removal cannot be undone.
- criterion: Taking the removal control issues no DELETE request.
  met: true
  how: The trigger button carries no onClick; removeMutation.mutate() is reachable
    only from the destructive DialogClose.
- criterion: Confirming the removal in the further act issues one DELETE request to
    /v1/connectors/:connector carrying the presented configuration's connector name.
  met: true
  how: The destructive DialogClose's onClick calls state.onRemove -> removeMutation.mutate(),
    whose mutationFn issues DELETE against /v1/connectors/:connector.
- criterion: Declining the further act issues no DELETE request.
  met: true
  how: The "Keep configuration" button is a plain DialogClose with no onClick.
- criterion: After the further act is declined, the surface still presents the configuration
    unchanged under the same connector name.
  met: true
  how: Declining touches no form, query, or configuration state; only a successful
    removal invalidates the cache.
- criterion: The further act does not ask the operator to type the connector's name.
  met: true
  how: The confirmation dialog offers only two buttons, no text input.
- criterion: The removal control is not withheld where a capability names the connector
    as its own.
  met: true
  how: The control's rendering is unconditional on the ready phase alone; it performs
    no capability lookup.
nodes:
- node: domain/integration/connector-configuration
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  - src/routes/connector-configuration-detail-ready-view.tsx
  how: The removal control and its DELETE both address the connector configuration
    solely by its connector name.
- node: rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  - src/routes/connector-configuration-detail-ready-view.tsx
  how: Implements the connector-configuration branch — a control that asks before
    removing, issues remove-connector only on a further explicit confirm, and leaves
    the configuration unchanged on any non-confirm outcome.
- node: rules/integration/removing-a-connector-configuration-is-unconditional
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  - src/routes/connector-configuration-detail-ready-view.tsx
  how: The control is rendered and enabled without testing any precondition, and the
    DELETE mutation carries no guard clause before issuing the request.
inferences:
- inferred: The control and its dialog live in the ready view's trailingActions.
  from: The screen's existing composition, which already places Discard changes, Cancel
    and the Connectors link there.
- inferred: Reused the uncontrolled Dialog+DialogTrigger+DialogClose shape already
    implemented for Discard changes.
  from: The inventory's note naming connector-configuration-apply-confirmation-dialog.tsx
    as the pattern to reuse.
- inferred: onRemove and isRemoving reach the ready view through the same spread that
    already forwards onCancel.
  from: The existing pass-through convention in the detail-view hook.
- inferred: Added onSuccess cache invalidation on the two query keys the adjacent
    PUT mutation already invalidates.
  from: The identical invalidation the adjacent PUT mutation already performs.
- inferred: Dismissing the confirmation by any means other than the explicit destructive
    button never calls onRemove.
  from: The task's own UNDERDETERMINED note; the stricter reading matches the rule's
    wording that removal is issued only on a further explicit act.
- inferred: Confirmation copy was authored without specification guidance, mirroring
    the file's own existing Discard changes wording.
  from: The rule's own statement that it fixes what the control gates, never its wording.
preserved:
- The existing PUT/save flow.
- The existing Discard changes dialog and its onDiscard behavior.
- The loading and load-error phases' own ButtonFooter controls.
- Cancel and the Connectors link's navigation behavior.
deferred:
- what: Stating the removal's outcome on the detail surface.
  why: REMAINDER — belongs to the outcome-disclosure task.
- what: Landing on the connector configurations listing after a successful removal.
  why: REMAINDER — belongs to the landing task.
run: run/connector-configuration-removal-connector-configuration-removal-control-build
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
---

## What it is
A removal control on the connector configuration detail screen, gated behind a Cancel/destructive-confirm dialog with no name typing.

## Notes
None.
