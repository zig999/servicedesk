---
title: Retire the capability popup form dialog
summary: The capability create/edit dialog and its now-unreferenced form-target type are removed from the tree.
rationale: The planning cut removal apart from the consumer change -- deleting a module and rewiring its last consumer in one task changes an interface and its consumer in the same breath, and the deletion is only demonstrable once nothing constructs a target for it.
sources:
- intake/scope.md
objective: No capability popup create/edit dialog remains in the frontend app, and nothing references one.
criteria:
- The capability form dialog module no longer exists in the tree.
- No module in the frontend app imports the capability form dialog component.
- No spec file references the deleted capability form dialog module.
- The nullable-identity capability form-target type is no longer declared.
- The capability create/edit form hook the routed create screen consumes is not deleted.
depends_on:
- task/capability-create-route/capabilities-browser-create-action
implements:
- contracts/integration/capability-registry
---

## What it is
The removal of the dialog component, of the form-target type whose last consumer it was, and of the references either left behind.
The form hook and the form-fields component both survive, because the routed create screen composes them.

## Notes
capability-detail-screen.spec.ts names this dialog inside a test description rather than importing it, so the third criterion reaches that wording without touching what that spec asserts.
The dialog's edit-mode branch is already unreachable from production navigation, per the browser screen's own header comment, so removing it drops no reachable behavior.
UNDERDETERMINED, from the specification -- no criterion of this task holds the edit path the popup dialog carried: contracts/integration/capability-registry publishes register-capability as create-or-replace at an identity, and the decision log records the identity-keyed read as gained for a frontend detail/edit screen addressed by a capability's own (name, version) identity, but an implementation satisfying every criterion can still leave the app with no such screen if no sibling task of this epic delivers one.
Passes: delete the capability form dialog module and the nullable-identity form-target type, keep the routed create screen and its form hook, and leave the frontend app with no screen addressed by a capability's (name, version) identity -- so an already-registered capability can no longer be opened for editing anywhere in the app.
Reviewer note (not the binder's, the caller's): this appears moot in practice -- the capability detail screen at "/capabilities/$name/$version" already serves editing today, delivered by a prior initiative's own capability-detail-route task, outside this epic entirely; the binder could not see this from the specification and decision log alone, which is why it is reported here rather than silently dismissed.
REMAINDER, from the specification -- the statement of rules/integration/one-capability-answers-one-concept reaches no criterion of this task in any of its three clauses; this task deletes a frontend module and a type and states no registration or resolution behavior at all.
Belongs: the task delivering the capability registration and concept-read surface, not this deletion task.
Advisory: criteria 1 through 4 are demonstrated against the tree alone (a module absent, no importer, no spec file reference, a type undeclared); no candidate speaks to how capability authoring is presented in the frontend, so contracts/integration/capability-registry is reached by criterion 5 alone.
Advisory: domain/integration/capability-registry also names register-capability among its operations, but the decision log records the identity-keyed read as consistently a contract-level surface over this domain-service rather than one of its own declared operations, so the contract, not the domain-service, is the node this task is bound against.
