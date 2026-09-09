---
title: Save dispatches the capability registration, proven under the footer portal the running application actually takes
summary: Tests that mount the capability authoring screen with the footer slot present, so ButtonFooter's createPortal is
  actually taken, proving the Save control's restored form ownership, its whole-contract dispatch, its success landing and
  the abandon control's writes-nothing behavior, plus one test closing the refusal-handling gap the task's own notes flagged.
implementation: sha256:038c6905d916f88f12c0f2154aabbf9a3091b112575c5e6a5aac4ab41370e039
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/capability-registration-save-act-save-dispatches-the-registration-suite
tests:
- file: src/routes/capability-create-screen-footer-portal.spec.ts
  name: the save control's form owner survives the footer portal (criterion 1) > keeps the screen's own form as the Save button's
    form owner even though the button renders outside that form's DOM subtree
  proves: With the footer slot present, so the portal the application takes is taken, the screen's save control has the screen's
    own form as its form owner.
  fails_when: the Save button's form property is null or names a different form, so form ownership was not restored; or the
    button's form contains the button, meaning the footer slot was never actually taken and the test reverted to the vacuous
    portal-less DOM shape the reproduction describes. It also states the implementation's own inferred choice, pairing CAPABILITY_FORM_ID
    between the form and the button, since the assertion compares against that exported constant rather than a hardcoded literal.
- file: src/routes/capability-create-screen-footer-portal.spec.ts
  name: activating save with the footer slot present issues the register-capability request carrying the whole contract (criterion
    2) > issues PUT /v1/capabilities/{name}/{version} carrying nature, both schemas, timeout, connector and concept, with
    no declared attribute dropped
  proves: With the footer slot present and every field of the entry filled, activating the save control issues a register-capability
    request carrying the whole contract the entry declares — its name, its version, its nature, both of its schemas, its timeout,
    its connector and its concept — with no declared attribute dropped.
  fails_when: no request is dispatched at all, which is the portal defect returning; the request is issued at a URL not keyed
    by the typed name and version; or the parsed body is missing any of nature, input_schema, output_schema, timeout, connector
    or concept, or carries an attribute besides them.
- file: src/routes/capability-create-screen-footer-portal.spec.ts
  name: a registration answered as made with the footer slot present lands the operator on the capability's own surface (criterion
    3) > navigates to the capability's identity surface once the registry answers success, rather than leaving the operator
    on the authoring surface
  proves: With the footer slot present and the registry answering that the registration was made, the operator is taken to
    the surface addressed by the name and version the entry carried, and not left on the authoring surface.
  fails_when: the operator stays on the authoring address after a successful registration, or is navigated anywhere other
    than the surface keyed by the entry's own name and version.
- file: src/routes/capability-create-screen-footer-portal.spec.ts
  name: activating abandon with the footer slot present writes nothing (criterion 4) > issues no register-capability request,
    even after every field of the entry was filled in
  proves: With the footer slot present, an entry composed, and the authoring reached from another surface, activating the
    abandon control issues no register-capability request, leaves the set of registered capabilities exactly as it was, and
    returns the operator to the surface the authoring was reached from.
  fails_when: a request to the mocked register-capability endpoint is dispatched after the abandon control is activated on
    a fully filled entry.
- file: src/routes/capability-create-screen-footer-portal.spec.ts
  name: activating abandon with the footer slot present returns to the surface authoring was reached from (criterion 4) >
    navigates back to the surface the create screen was reached from, once an entry was composed
  proves: With the footer slot present, an entry composed, and the authoring reached from another surface, activating the
    abandon control issues no register-capability request, leaves the set of registered capabilities exactly as it was, and
    returns the operator to the surface the authoring was reached from.
  fails_when: activating the abandon control leaves the operator on the authoring address, or lands them anywhere other than
    the surface the create screen was opened from.
- file: src/routes/capability-create-screen-footer-portal.spec.ts
  name: a refusal answered with the footer slot present states the outcome rather than leaving the entry unanswered > shows
    a message naming the refusal and keeps the operator on the authoring surface, rather than dispatching in silence
  proves: UNDERDETERMINED, from the specification — no criterion reaches what the save control does when the registry refuses
    the submission, though rules/integration/a-submitted-registration-states-its-outcome-to-the-operator states that the submitting
    surface states that nothing was registered and which refusal answered it. This test is written to fail over the implementation
    that entry names as passing every stated criterion. It also exercises the duplicate-concept refusal under the real footer-slot
    DOM shape rather than the portal-less one the delivered suite used before this task.
  fails_when: nothing is stated to the operator on a refusal, which is the implementation the underdetermined entry names,
    or the operator is navigated away from the authoring surface on a refusal.
- file: src/routes/capability-create-screen-cancel.spec.ts
  name: CapabilityCreateScreen — the abandonment control lands on the capabilities listing where no surface was reached from
    (criterion 2) > navigates to the capabilities listing when the create screen was opened at its own address, with no history
    to return to
  proves: UNDERDETERMINED, from the specification — criterion 4 conditions the abandon control on the authoring having been
    reached from another surface, so no criterion reaches an abandonment on an authoring surface opened at its own address
    or reloaded, where no reached-from surface exists. This test already stood in the suite, is unaffected by this delivery
    — the abandon path is preserved and its control is a type=button the portal never reached — and already fails over exactly
    the implementation that entry names, so no second test was written for it. It is listed here because it is what holds
    that entry up.
  fails_when: activating the abandon control with no back-history leaves the operator on the authoring address, or navigates
    to a read keyed on the entry's own unregistered name and version instead of the registry's listing.
not_applicable:
- edge_case: an absent or invalid schema entry disabling Save
  why: the control's disabled attribute prevents the activation regardless of its DOM position or form ownership, so it is
    independent of the footer-portal defect this task corrects, and it is already covered without the footer slot by capability-create-screen-save.spec.ts's
    existing tests over a declared schema that is not valid JSON.
- edge_case: a numeric or enumeration boundary on timeout or nature
  why: no criterion of this task states a validation boundary; that is the form schema's own concern, untouched by this delivery
    and reached separately by the validation tests already in the suite.
- edge_case: an empty collection rendered by this screen
  why: the capability authoring screen presents no list or collection view, so there is nothing here for an empty-collection
    state to apply to.
- edge_case: two operations against the same entry at once — a concurrent double activation of Save, or Save and abandon together
  why: the double-dispatch guard is preserved logic this delivery does not touch, unrelated to DOM form ownership, and no
    criterion of this task states concurrent-activation behavior.
- edge_case: the network failing or answering slowly, independent of a named registry refusal
  why: the generic-failure fallback is preserved, untouched logic; no criterion distinguishes it from the refusal case, and
    the underdetermined entry is answered by proving that a named condition is stated rather than by exhausting every unrelated
    failure mode.
untested:
- 'The replace branch of register-capability — editing an already-registered capability''s contract through capability-detail-ready-view.tsx,
  which shares the corrected file and therefore gains the identical form ownership — is not exercised by this task''s own
  tests, because the intake scopes this correction to the registration screen only. Consequently no test here demonstrates
  the whole of rules/integration/a-successful-capability-registration-lands-on-the-capabilitys-own-surface or rules/integration/an-abandoned-capability-registration-entry-registers-nothing,
  both of which state their fact alike across the create-or-replace branches: only the create branch is proven.'
- The wording shown for a refusal the registry answers with no named condition — the generic fallback — is not independently
  tested here; only the named condition is exercised with the footer slot present. That wiring is preserved, untouched logic
  outside this task's criteria.
---

## What it is

The proof of the second corrective increment: six tests written against a harness that provides the footer slot, so the portal the application takes is actually taken, plus one test already standing in the suite that holds up the second of the task's two underdetermined entries.
Four criteria and both entries are answered; what stays unproven is named above rather than left to a reader to notice.

## Notes

The harness this file needs was built by the sibling correction of this same initiative and is reused rather than reinvented, one file per screen.
The form-owner test asserts both halves — that the control's form owner is the screen's form, and that the form does not contain the control — because the first assertion alone passes vacuously under the app-shell-less mount every delivered spec of this screen uses, which is exactly how the defect shipped.
The second underdetermined entry is held up by a test this delivery did not write: the abandon path is preserved here, its control is a type=button the portal never reached, and the existing test already fails over the implementation that entry names, so writing a second one would have proved the same fact twice.
One consequence of the correction reaches a screen this proof does not cover, and the untested list names it: the capability detail surface composes the same corrected component to edit a registered capability's contract.
