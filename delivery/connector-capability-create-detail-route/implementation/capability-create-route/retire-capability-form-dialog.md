---
title: Retire the capability popup form dialog
summary: The capability form dialog component and its nullable-identity form-target type are
  emptied out of the tree and no longer declared, leaving the routed create screen's form hook
  and form-fields component untouched.
task: sha256:3d817d1041cebf2f4f48d50f5ba935b10bb1b7bc23d1e975e8f21a88eec184f9
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/capability-create-route-retire-capability-form-dialog-suite-2
files:
- path: src/routes/capability-form-dialog.tsx
  effect: 'removed from the tree (git rm). The task-implementer delegation, holding no Bash/shell
    tool, first emptied the file to zero bytes -- the CapabilityFormDialog component, its
    CapabilityFormDialogProps type, and all of its imports (Button from @tui/ui/button,
    Dialog/DialogContent/DialogHeader/DialogTitle from @tui/ui/dialog, useCapabilityForm and
    CapabilityFormTarget from the hook, CapabilityFormFields) -- and the path itself was then
    unlinked mechanically by the orchestrating session, which does hold a shell, completing the
    one step the delegation could not perform.'
- path: src/hooks/use-capability-form.ts
  effect: 'the CapabilityFormTarget type declaration (and its own one-line doc comment) is
    removed. Nothing else in this file changed: useCapabilityForm never referenced that type
    internally (its own signature already took `existing: Capability | null` directly), so
    removing it is the only edit this file needed. JsonSchemaFieldState, CapabilityFormState,
    SAVE_FAILURE_MESSAGE_BY_KIND, saveFailureMessage and useCapabilityForm itself are
    byte-for-byte unchanged.'
criteria:
- criterion: The capability form dialog module no longer exists in the tree.
  met: true
  how: 'the module''s entire content -- the component, its props type, and every import -- was
    removed by the task-implementer delegation, and the path itself,
    src/routes/capability-form-dialog.tsx, was then removed from the tree via `git rm` by the
    orchestrating session, completing the one step that delegation''s tool set (Read, Write, Edit,
    Grep, Glob; no Bash) could not perform on its own.'
- criterion: No module in the frontend app imports the capability form dialog component.
  met: true
  how: 'grepping `frontend/app/src` for `CapabilityFormDialog` after this delivery''s edits turns
    up no import anywhere in production source. capabilities-browser-screen.tsx, the only screen
    that used to compose it, already held no import of this component before this task started
    -- delivered by the prior task
    (task/connector-capability-create-detail-route/capabilities-browser-create-action), which
    repointed its "New capability" action to navigate to the routed create screen instead. This
    task verified that fact rather than assuming it, and needed no further production edit to
    satisfy it.'
- criterion: No spec file references the deleted capability form dialog module.
  met: true
  how: 'grepping every `.spec.ts`/`.spec.tsx` file under `frontend/app/src` for
    `capability-form-dialog`, `CapabilityFormDialog` and `CapabilityFormTarget` turns up exactly
    one hit: capability-detail-screen.spec.ts line 84, `it("renders every field
    capability-form-dialog.tsx already composes through CapabilityFormFields, plus the Save
    button", ...)`. That is a test-description string naming the former module by filename, not
    an import statement or a construction of the component or its type -- the file imports
    neither symbol, and nothing in it mounts the dialog. Unlike the connector-configuration
    sibling task''s own dedicated dialog spec (which imported and mounted the dialog directly),
    no spec of this kind exists for the capability dialog: a targeted glob for
    `**/capability-form-dialog*.spec.*` finds nothing. This criterion is met as this delivery
    left the tree, with no further edit needed and nothing for test-author to retire on this
    account -- though the description string''s wording is now stale prose naming a module that
    no longer exists, which is a documentation concern rather than an import this criterion asks
    about.'
- criterion: The nullable-identity capability form-target type is no longer declared.
  met: true
  how: 'CapabilityFormTarget''s declaration in src/hooks/use-capability-form.ts is removed, and
    its declaration inside the now-emptied capability-form-dialog.tsx was never a second
    declaration (that file only imported the type, at its own line 4, and re-exported nothing).
    Grepping src for `CapabilityFormTarget` after both edits finds it only in prose, in
    capabilities-browser-screen.tsx''s own header comment (documenting an earlier, different
    task''s own delivery) -- not a declaration, an import, or a construction of the type;
    deferred below rather than edited, since correcting another task''s own delivered
    documentation reaches past this task''s stated scope.'
- criterion: The capability create/edit form hook the routed create screen consumes is not
    deleted.
  met: true
  how: 'src/hooks/use-capability-form.ts still exports useCapabilityForm, CapabilityFormState and
    JsonSchemaFieldState unchanged; only the CapabilityFormTarget type (never consumed by the
    hook''s own body, only exported for the now-emptied dialog''s callers) was removed.
    capability-create-screen.tsx''s own `useCapabilityForm(null, handleSaved)` call site is
    untouched by this delivery and continues to compile against the hook exactly as before.'
nodes:
- node: contracts/integration/capability-registry
  how: 'this task dispatches no register-capability, read-capability, read-capability-by-identity
    or list-capabilities request of its own; it removes a popup dialog that composed the
    already-implemented create/edit hook, and leaves that hook''s own dispatch (PUT
    /v1/capabilities/{name}/{version}) completely unchanged. The routed create screen this task
    leaves standing (capability-create-screen.tsx, delivered under a sibling task) is what
    already carries this contract''s register-capability operation forward; this task changes
    nothing about how or when it is dispatched.'
inferences:
- inferred: emptying capability-form-dialog.tsx to zero bytes (rather than, say, leaving a stub
    re-export or a comment-only file) was the closest available substitute for deletion given
    this delegation's tool set, pending the path's own removal by a step holding filesystem/git
    access.
  from: the task's own criterion 1 ("no longer exists in the tree") and the absence of any
    file-deletion primitive among the tools this delegation was given; a partial file (e.g. a
    barrel re-export) would have left a live import surface behind, which is exactly what
    criterion 2 forbids.
preserved:
- src/hooks/use-capability-form.ts's own useCapabilityForm, CapabilityFormState,
  JsonSchemaFieldState, SAVE_FAILURE_MESSAGE_BY_KIND and saveFailureMessage -- every export the
  routed create screen (and the now-empty dialog's own former callers) relied on except the one
  type this task retires.
- src/routes/capability-form-fields.tsx, entirely untouched -- both the routed create screen and
  the routed detail/edit screen compose it directly.
- src/routes/capability-create-screen.tsx's own `useCapabilityForm(null, handleSaved)`
  composition, untouched.
deferred:
- what: 'capabilities-browser-screen.tsx''s own header comment still names CapabilityFormDialog
    and CapabilityFormTarget in prose, documenting a different, already-delivered task''s own
    history ("this screen no longer imports either CapabilityFormDialog or CapabilityFormTarget.
    The Dialog component and its type are untouched"). That claim is now stale -- the type is no
    longer declared and the dialog is now empty -- but correcting another task''s own delivered
    documentation reaches past this task''s stated scope (only the dialog module and its
    form-target type are named for removal).'
  why: 'this file is not named by this task''s criteria or objective, and rewriting a sibling
    task''s own delivered narrative widens this task rather than completing it.'
- what: 'capability-detail-screen.spec.ts''s own test description at line 84 still names
    "capability-form-dialog.tsx" in prose, describing a module that is now empty.'
  why: 'writing or rewriting a spec file, including its test names, is test-author''s task, never
    this implementation task''s -- flagged here so the next delegation is not surprised by stale
    wording, though (per criterion 3 above) nothing about this string constitutes an import this
    delivery had to retire.'
---

## What it is
The capability popup form dialog's content is fully removed and its nullable-identity form-target
type is no longer declared anywhere; the form hook and form-fields component the routed create
screen depends on are untouched.

## Notes
The task-implementer delegation held no Bash/shell tool, so it emptied
`src/routes/capability-form-dialog.tsx` of all content but could not unlink the path itself, and
could not compute the `task`/`standard.pin` digests. The orchestrating session, which does hold a
shell, completed both: `git rm` on the emptied file, and `sha256sum` for both pins.
