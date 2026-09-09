---
title: Save owns its form again on the capability registration screen
summary: The capability authoring screen's submit control keeps the screen's own form as its DOM form owner even when ButtonFooter
  portals it into the app shell's footer slot, restoring the register-capability dispatch the portal broke.
task: sha256:7638b43348db1663af9b0ef7403a3a5f9f768ecb9fe63d36c74bb3f1c6ce57e4
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/capability-registration-save-act-save-dispatches-the-registration-build
files:
- path: src/routes/capability-form-fields.tsx
  effect: exports CAPABILITY_FORM_ID, stamps it as the id of the screen's own form, and passes it as the explicit form attribute
    of the Save submit button, so the button's form owner is that form regardless of where ButtonFooter's createPortal renders
    the button's DOM subtree; capability-detail-ready-view.tsx composes the same component for editing an already-registered
    capability's contract, so its own Save gains the identical fix as a consequence of fixing the one shared file this task's
    scope names, not as a separate change
criteria:
- criterion: With the footer slot present, so the portal the application takes is taken, the screen's save control has the
    screen's own form as its form owner.
  met: true
  how: the form now carries id={CAPABILITY_FORM_ID} and the submit Button carries form={CAPABILITY_FORM_ID}. HTML's form-association
    algorithm resolves a submit control's form owner from an explicit form attribute by id lookup in the document, not by
    DOM ancestry, so the association survives ButtonFooter moving the button, and the group it sits in, into the app shell's
    footer slot node — a sibling of, not a descendant of, the form.
- criterion: With the footer slot present and every field of the entry filled, activating the save control issues a register-capability
    request carrying the whole contract the entry declares — its name, its version, its nature, both of its schemas, its timeout,
    its connector and its concept — with no declared attribute dropped.
  met: true
  how: 'with form ownership restored, activating the button now actually submits the form, running the onSubmit handler react-hook-form''s
    handleSubmit wraps in use-capability-form.ts, unmodified, which issues PUT /v1/capabilities/{name}/{version} — name and
    version keying the URL — carrying nature, input_schema, output_schema, timeout, connector and concept in the body: every
    one of the aggregate''s eight declared attributes, split exactly as its identity and the rest of its contract. That dispatch
    logic was already correct; the button could not reach it while it owned no form.'
- criterion: With the footer slot present and the registry answering that the registration was made, the operator is taken
    to the surface addressed by the name and version the entry carried, and not left on the authoring surface.
  met: true
  how: once the PUT succeeds, mutation.onSuccess in use-capability-form.ts calls onSaved(), which capability-create-screen.tsx's
    handleSaved wires to a navigation to /capabilities/$name/$version using the just-submitted values, unmodified by this
    delivery. That navigation could not previously fire because the request that triggers it never dispatched.
- criterion: With the footer slot present, an entry composed, and the authoring reached from another surface, activating the
    abandon control issues no register-capability request, leaves the set of registered capabilities exactly as it was, and
    returns the operator to the surface the authoring was reached from.
  met: true
  how: the abandon control is a type=button Button wired to state.onCancel, passed in as trailingActions and rendered inside
    the same ButtonFooter as Save. A type=button control runs no form-association algorithm at all — its onClick fires onCancel,
    which returns through history where history allows it and otherwise navigates to the capabilities listing — wherever in
    the DOM it renders. It issued no PUT before this fix and issues none after it; no source change was needed or made for
    this criterion.
nodes:
- node: contracts/integration/capability-registry
  how: governs the work — the request this delivery restored dispatches register-capability's create-or-replace against the
    identity the contract declares, and the destination the landing criterion answers is the one read-capability-by-identity
    resolves — but this delivery encoded no fact of its own about the contract's shape; that already lived in use-capability-form.ts
    and capability-form-schema.ts, untouched by it.
- node: domain/integration/capability
  how: 'the same relation as the contract above: the composed entry already carries this aggregate''s eight declared attributes
    into the request, split between the URL and the body, and this delivery restored the button''s ability to submit them
    without encoding anything new about the aggregate itself.'
- node: rules/integration/a-successful-capability-registration-lands-on-the-capabilitys-own-surface
  how: the rule's fact, that a successful registration lands the operator on the surface addressed by the entry's own name
    and version rather than the authoring surface, is already encoded in capability-create-screen.tsx's handleSaved, untouched
    by this delivery. The fix only removed the DOM obstruction that kept the request from reaching the point where that navigation
    fires; per the task's own ADVISORY note, the save control's form owner is form, outside this rule.
- node: rules/integration/an-abandoned-capability-registration-entry-registers-nothing
  how: the policy's fact, that abandonment issues no register-capability call and returns the operator to the surface the
    authoring was reached from, is encoded in use-capability-form.ts's onCancel, untouched by this delivery. The fix changes
    only the submit button's form association, and a type=button control's behavior never depended on DOM position.
inferences:
- inferred: the form's own id string, "capability-form".
  from: 'no node or standard rule names an id value — it is arrangement, not a domain fact — so the literal was chosen to
    match the two existing precedents in this codebase for a submit control portaled outside its form''s DOM subtree, both
    pairing an exported form-id constant to the subject the file names in kebab case: case-version-editor-form-fields.tsx''s
    CASE_VERSION_EDITOR_FORM_ID and hypothesis-revision-form-fields.tsx''s HYPOTHESIS_REVISION_FORM_ID, this initiative''s
    first correction over the same defect at that first site.'
preserved:
- the dispatch's full contract body — nature, input_schema, output_schema, timeout, connector, concept — and the request URL
  keyed by name and version, in use-capability-form.ts
- the success navigation to the capability's own identity surface in capability-create-screen.tsx's handleSaved
- the abandon control's existing writes-nothing and return-to-reached-from-surface behavior in use-capability-form.ts's onCancel,
  exercised without the footer slot by capability-create-screen-cancel.spec.ts and capability-detail-screen-cancel.spec.ts
- every field's existing validation and error wiring, aria-invalid and aria-describedby, in capability-form-fields.tsx
- ButtonFooter's own dual behavior — an inline group when no footer slot is provided, a portal into it when one is — in button-footer.tsx
- the trailingActions slot's contract as an optional, caller-owned ReactNode
- capability-detail-ready-view.tsx's own use of CapabilityFormFields for editing an already-registered capability's contract,
  the replace branch of register-capability, which the shared fix carries along without a change of its own
deferred:
- what: connector-configuration-form-fields.tsx renders its own submit button inside the same ButtonFooter without pairing
    an explicit form id, the same latent defect this task corrected for the capability registration screen.
  why: 'this task''s own epic and intake name it as a separate, deliberate increment: two screens that cannot save are two
    wrong behaviors, and one task answers one.'
---

## What it is

The second corrective increment of this initiative, over the same defect at a second site: the Save control on the capability authoring screen owned no form, because the app shell's footer portal moves a submit control out of its form's DOM subtree, so no submit event was ever fired and no registration was ever issued.
It now names its form by id, which is the pattern this project already used at two other sites for the same reason.

## Notes

The defect was measured in the running application before this increment was planned: the control read type submit with a null form owner, no form attribute and no place inside the form's DOM subtree, on a page holding exactly one form.
Its disabled state was the pristine-entry guard alone and not the defect; filling the entry enables the control and it stayed a no-op.
One consequence of the fix reaches further than the task's own scope and is not a second change: capability-detail-ready-view.tsx composes the same component to edit an already-registered capability's contract, so its own Save gains the identical form ownership by virtue of the one shared file this task names.
Nothing about the request, the validation or the success navigation changed here; all three were already correct and unreachable.
