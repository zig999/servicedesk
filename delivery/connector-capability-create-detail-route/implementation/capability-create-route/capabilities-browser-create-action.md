---
title: Capabilities browser create action navigates to the routed create screen
summary: CapabilitiesBrowserScreen's "New capability" button now navigates to route-tree.tsx's "/capabilities/new"
  instead of opening the popup CapabilityFormDialog in create mode, and the screen's own formTarget state
  that hosted that dialog's create path is removed.
task: sha256:c4cd5924ccd018391b469af2f3483c38a7ef67b028d642b5a3fa8cc41ae2141d
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/capability-create-route-capabilities-browser-create-action-build
files:
- path: src/routes/capabilities-browser-screen.tsx
  effect: 'New capability now calls navigate({ to: "/capabilities/new" }) instead of setFormTarget({ mode:
    "create" }); the formTarget useState, the conditional CapabilityFormDialog render, and the now-unused
    useState/CapabilityFormTarget/CapabilityFormDialog imports are all removed. handleRowClick, renderBody()''s
    loading/error/empty branches, and the button''s unconditional placement ahead of renderBody() are
    all untouched.'
criteria:
- criterion: Activating "New capability" on the capabilities browser navigates to the create route.
  met: true
  how: 'The button''s onClick now reads () => void navigate({ to: "/capabilities/new" }), the same route-tree.tsx
    path capabilityCreateRoute (component CapabilityCreateScreen) the sibling delivered task wired in.'
- criterion: Activating "New capability" opens no dialog over the capabilities browser.
  met: true
  how: The formTarget state and the conditional CapabilityFormDialog render it gated are both removed
    from this file entirely.
- criterion: The capabilities browser screen holds no create/edit form-target state of its own.
  met: true
  how: The useState<CapabilityFormTarget | null>(null) declaration is deleted along with its imports.
- criterion: The "New capability" action renders while the list is loading, while it has failed to load,
    and while it is empty, as it does today.
  met: true
  how: The button's JSX position is unchanged -- it still sits in the header row, ahead of and outside
    renderBody()'s isLoading/isError/empty-length branches.
- criterion: Clicking a row on the capabilities browser still navigates to that capability's own detail
    route.
  met: true
  how: 'handleRowClick is untouched -- it still reads the clicked row''s name/version and calls navigate({
    to: "/capabilities/$name/$version", params: { name, version } }).'
nodes:
- node: contracts/integration/capability-registry
  how: This task's own change is purely which screen the operator is sent to; it does not encode any fact
    of this contract, and register-capability is dispatched only by the routed CapabilityCreateScreen
    (a separate, already-delivered task), never by this file.
preserved:
- Clicking a row still navigates to /capabilities/$name/$version via handleRowClick, unchanged.
- '"New capability" still renders unconditionally in the header row across the loading, error and empty
  states of renderBody().'
- The loading, error (with Retry) and empty renderBody() branches are all untouched.
deferred:
- what: capability-form-dialog.tsx's own header comment states "capabilities-browser-screen.tsx renders
    this component only while a target is set" -- after this change, this screen never renders CapabilityFormDialog
    at all, so that comment is now stale.
  why: the task explicitly scopes this delivery to the browser screen's own state and button, with the
    Dialog component itself not to be touched -- its edit-mode reachability is a separate task's concern.
- what: capabilities-browser-screen-detail.spec.ts and capabilities-browser-screen-capability-form-save.spec.ts
    (and their own openFilledCreateDialog/openNewCapabilityDialog helpers) assert that clicking "New capability"
    opens a Dialog -- that assertion no longer holds after this change.
  why: writing or updating tests is a separate producer's (test-author's) judgment in this framework's
    own delivery split; as task-implementer only the source the task's criteria require is written, not
    its proof.
---

## What it is
CapabilitiesBrowserScreen's "New capability" button now navigates to "/capabilities/new" instead of opening the popup Dialog, and the screen no longer holds create/edit form-target state.

## Notes
None.
