---
title: Retire the connector configuration popup form dialog
summary: The connector configuration create/edit dialog and its now-unreferenced form-target type are removed from the tree.
rationale: The planning cut removal apart from the consumer change -- deleting a module and rewiring its last consumer in one task changes an interface and its consumer in the same breath, and the deletion is only demonstrable once nothing constructs a target for it.
sources:
- intake/scope.md
objective: No connector configuration popup create/edit dialog remains in the frontend app, and nothing references one.
criteria:
- The connector configuration form dialog module no longer exists in the tree.
- No module in the frontend app imports the connector configuration form dialog component.
- No spec file references the deleted connector configuration form dialog module.
- The assertion that the currently typed configuration text reaches the connector test panel still stands against a surviving call site of that panel.
- The nullable-identity connector configuration form-target type is no longer declared.
- The connector-configuration create/edit form hook the routed create screen consumes is not deleted.
depends_on:
- task/connector-configuration-create-route/connector-configurations-list-create-action
implements:
- contracts/integration/connector-diagnostics
- contracts/integration/connector-configuration-registry
- rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
---

## What it is
The removal of the dialog component, of the form-target type whose last consumer it was, and of the references either left behind.
The form hook and the form-fields component both survive, because the routed create screen composes them.

## Notes
The inventory names connector-configuration-form-dialog-forwards-configuration-text.spec.ts as the one spec exercising this dialog, and records that deleting the dialog outright without accounting for that spec would silently drop its assertions -- the third criterion is what holds that.
The dialog's edit-mode branch is already unreachable from production navigation, per that file's own header comment, so removing it drops no reachable behavior.
The concept form dialog under the glossary screens is a separate component with its own live consumer and is outside this task.
UNDERDETERMINED, from the specification -- criterion 4 and rules/integration/a-connector-configuration-is-tested-through-a-registered-capability are about two different things and do not conflict as stated: the criterion asserts typed configuration text reaches the connector test panel, feeding the panel's own client-side derivation of subject-attribute rows from placeholders, while the rule governs which configuration the test dispatch itself exercises (the one currently registered, never unsaved authoring text). Nothing in the criteria holds the surviving call site to the first purpose and away from the second.
Passes: preserving the assertion by re-plumbing the surviving call site so the currently typed, unsaved configuration text is both handed to the panel and carried into the test-connector request body (or otherwise made the configuration the dispatch exercises) -- every criterion of this task reads as satisfied, and rules/integration/a-connector-configuration-is-tested-through-a-registered-capability refuses it.
REMAINDER, from the specification -- three clauses of rules/integration/a-connector-configuration-is-tested-through-a-registered-capability's statement reach no criterion here: testing only through a specific already-registered capability naming the connector, the HTTP 404 CapabilityNotRegisteredForTestError refusal (never the identity-keyed read's own reused), and the HTTP 409 CapabilityConnectorMismatchError refusal. This task deletes a popup dialog and preserves a panel call site; it neither dispatches nor refuses.
Belongs: the already-delivered backend test-connector action and the panel's own capability picker, cut and delivered under an earlier initiative's own test-connector debug panel task; no task of this epic reaches them.
Advisory: criterion 6 names "the routed create screen" as the consumer keeping the connector-configuration create/edit form hook alive, but in the tree today the hook's only create-mode consumers are the dialog this task removes and connector-configurations-screen.tsx. Unless the routed create screen lands first, this task leaves the hook declared and unreferenced by any production module -- a seam between this task and whichever task builds that screen, not a specification divergence.
