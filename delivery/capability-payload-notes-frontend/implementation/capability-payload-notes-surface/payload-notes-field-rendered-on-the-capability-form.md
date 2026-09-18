---
target: frontend
title: Payload notes control rendered on the shared capability form fields component, corrected a second
  time against a live dirty-state regression the first correction's own gate exposed
summary: Adds a bare, multi-line Textarea for payload_notes inside capability-form-fields.tsx's existing
  FormField wrapper, gates both capability form hooks' PUT bodies on react-hook-form's own dirtyFields
  rather than on value, and now makes use-capability-form.ts's own render actually subscribe to react-hook-form's
  dirty-state proxy so that gate evaluates against current state instead of a never-refreshed initial
  snapshot.
task: sha256:c1d735cd51907c6989b48d4cfe3495239222057df2155ab774c57c9fa69313da
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/capability-payload-notes-surface-payload-notes-field-rendered-on-the-capability-form-build-3
files:
- path: src/routes/capability-form-fields.tsx
  effect: Imports Textarea from @tui/ui/textarea and renders a new FormField block, placed after the Connector
    field and before the input/output schema grid, binding a Textarea to the form's payload_notes field
    through register("payload_notes", { setValueAs }). Unchanged by this second correction.
- path: src/hooks/use-capability-form.ts
  effect: The PUT body the create-path mutation submits still spreads payload_notes only when form.formState.dirtyFields.payload_notes
    is true. Added `void form.formState.isDirty;` as an unconditional read of the formState proxy in the
    hook's "ready" render path, positioned after the conceptOptions.isError/conceptOptions.isLoading early
    returns and immediately before submit is defined, mirroring where use-capability-detail.ts's own const
    isDirty = form.formState.isDirty || ... sits relative to its own early returns. That read is what
    keeps react-hook-form's formState snapshot refreshed so the mutationFn's later dirtyFields.payload_notes
    read reflects current state instead of a stale initial one.
- path: src/hooks/use-capability-detail.ts
  effect: The same dirtyFields-gated spread replaces the unconditional payload_notes forwarding in the
    edit-path mutation's PUT body. Unchanged by this second correction -- its own pre-existing, unconditional
    isDirty computation already subscribes to the formState proxy on every render.
criteria:
- criterion: capability-form-fields renders a control bound to the form's payload_notes field.
  met: true
  how: register("payload_notes", { setValueAs }) binds the control to CapabilityFormValues.payload_notes,
    the same mechanism used for name, version, connector and timeout. Unaffected by this correction.
- criterion: That control sits inside the same FormField label and error wrapper the component's other
    capability attribute fields use, with no second wrapper introduced beside it.
  met: true
  how: The Textarea is the sole child of the same FormField wrapper already used by Name, Version, Nature,
    Timeout and Connector. Unchanged.
- criterion: The control accepts free text an operator types, and what is typed becomes the form's payload_notes
    value.
  met: true
  how: register("payload_notes", {...}) wires the textarea to react-hook-form; any free text typed passes
    the setValueAs unchanged and becomes the form value. Unaffected.
- criterion: The control accepts text spanning more than one line.
  met: true
  how: The control is TUI's Textarea primitive, rendering a native textarea. Unaffected.
- criterion: The control presents the payload_notes value the form holds, and presents nothing where the
    form holds none.
  met: true
  how: Still an uncontrolled field seeded by the sibling seeding task's defaultValues/reset calls. Unaffected
    by this correction, which only makes the create-path hook's dirty-state read live at submission time.
- criterion: The control is rendered on the capability registration screen's reading of this component.
  met: true
  how: capability-create-screen.tsx composes CapabilityFormFields directly with no excluding prop. This
    correction changes only internal render logic of use-capability-form.ts, not what renders.
- criterion: The control is rendered on the capability detail surface's reading of this component.
  met: true
  how: capability-detail-ready-view.tsx composes the same component. Untouched by this correction, which
    reaches only the create-path hook.
nodes:
- node: domain/integration/capability
  encoded_at:
  - src/routes/capability-form-fields.tsx
  - src/hooks/use-capability-form.ts
  - src/hooks/use-capability-detail.ts
  how: The node declares payload_notes as the one optional, free-text attribute an operator may supply,
    and its Responsibility clause states an absent declaration is a capability that simply has none. Both
    hooks already state payload_notes as absent exactly where the operator declared none, through the
    dirtyFields-gated spread; this correction makes the create path's own dirtyFields read reflect current
    state instead of a stale initial snapshot, so the gate now actually takes effect the way the edit
    path's already did.
- node: rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
  encoded_at:
  - src/routes/capability-form-fields.tsx
  how: Unaffected by this correction, which touches only the two hooks' submission bodies, not what capability-form-fields.tsx
    presents or from where.
inferences:
- inferred: The unconditional formState proxy read belongs after use-capability-form.ts's own early returns,
    immediately before submit is defined.
  from: use-capability-detail.ts's own precedent -- its unconditional isDirty computation sits in the
    identical relative position.
- inferred: The read is discarded with void rather than bound to a named variable.
  from: Nothing on the create path reads or needs an isDirty value today; binding it to an unused name
    would fail the project's @typescript-eslint/no-unused-vars rule.
- inferred: Reading form.formState.isDirty (rather than dirtyFields.payload_notes specifically) is sufficient
    to make the hook's snapshot refresh.
  from: The diagnostician's own correction names either as valid, and use-capability-detail.ts's own precedent
    reads isDirty for this same purpose.
divergences:
- from: task/capability-payload-notes-surface/payload-notes-carried-in-the-submitted-registration
  departure: Modified src/hooks/use-capability-form.ts a second time, owned by a sibling task that already
    delivered and closed against it -- first to gate the PUT body on dirtyFields, and now to make the
    hook's own render actually subscribe to the dirty-state proxy so the gate evaluates live.
  why: A second suite run's failure-diagnostician traced 2 failing tests to this hook's dirtyFields-gated
    spread always evaluating falsy, because nothing in this hook's render path read any formState proxy
    property -- a consequence of this task's own earlier corrective divergence into that file. The fix
    is a narrow, mechanical correction of that consequence; the sibling task's own criteria and every
    other line of its delivered file are left untouched.
- from: task/capability-payload-notes-surface/payload-notes-seeded-from-the-read-answer
  departure: Modified src/hooks/use-capability-detail.ts, owned by a sibling task that already delivered
    and closed against it.
  why: Unchanged from the prior correction -- this round of diagnosis confirmed this hook needs no further
    change, since its own pre-existing isDirty computation already subscribes to the formState proxy on
    every render.
preserved:
- The FormField label/error wrapper and every other field in capability-form-fields.tsx is untouched.
- In use-capability-form.ts, every other piece of hook logic is untouched; only one statement was added.
- use-capability-detail.ts is untouched by this round.
- CapabilityFormState's public shape is left exactly as it stood.
deferred:
- what: Setting payload_notes to the read answer's content on a discard action over the capability detail
    surface.
  why: The task's own Notes record this as a REMAINDER belonging to the discard-act task; this correction
    only makes an already-correct gate evaluate live, adding no discard-specific logic.
- what: The required-attribute, timeout-default and HTTP 422 refusal clauses of the capability contract
    rule over the registration submission path.
  why: The task's own Notes record this as a REMAINDER -- this task renders one optional attribute's control
    and submits nothing on its own account.
- what: Rendering or reasoning about the other eight declared attributes under the presentation rule.
  why: The task's own Notes record this as a REMAINDER, belonging to the tasks covering those attributes.
---
## What it is

capability-form-fields.tsx renders a bare multi-line Textarea for payload_notes, inside the existing FormField wrapper.
Both capability form hooks gate payload_notes's inclusion in the submitted body on react-hook-form's own dirtyFields; use-capability-form.ts now also subscribes to the dirty-state proxy during render so that gate evaluates live.

## Notes

A first suite run (-suite-2) failed 3 pre-existing tests (cause=code, fixed by adding a setValueAs normalizer and gating the sibling hooks' forwarding on dirtyFields). A second suite run (-suite-3) then failed 2 tests -- including this task's own proof test -- diagnosed again as cause=code: the dirtyFields gate in use-capability-form.ts was never live because nothing in that hook's render path subscribed to react-hook-form's formState proxy. Fixed by adding one unconditional formState.isDirty read, mirroring use-capability-detail.ts's own precedent exactly.
