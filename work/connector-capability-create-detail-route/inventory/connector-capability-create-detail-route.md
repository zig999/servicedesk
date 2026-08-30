---
title: Routed detail/edit screens and popup create dialogs for connector configurations and capabilities
summary: The area the create-as-detail-route scope lands in -- the two routed edit screens, the two popup
  create/edit Dialogs they must replace, the list screens that open them, and the shared form-state hooks
  and field components both paths already reuse.
sources:
- intake/scope.md
area:
- src/routes
- src/hooks
modules:
- name: route-tree
  path: src/routes/route-tree.tsx
  role: touched
- name: connector-configuration-detail-screen
  path: src/routes/connector-configuration-detail-screen.tsx
  role: touched
- name: capability-detail-screen
  path: src/routes/capability-detail-screen.tsx
  role: touched
- name: connector-configuration-detail-ready-view
  path: src/routes/connector-configuration-detail-ready-view.tsx
  role: touched
- name: capability-detail-ready-view
  path: src/routes/capability-detail-ready-view.tsx
  role: touched
- name: connector-configurations-screen
  path: src/routes/connector-configurations-screen.tsx
  role: touched
- name: capabilities-browser-screen
  path: src/routes/capabilities-browser-screen.tsx
  role: touched
- name: connector-configuration-form-dialog
  path: src/routes/connector-configuration-form-dialog.tsx
  role: touched
- name: capability-form-dialog
  path: src/routes/capability-form-dialog.tsx
  role: touched
- name: connector-configuration-form-fields
  path: src/routes/connector-configuration-form-fields.tsx
  role: depends-on
- name: capability-form-fields
  path: src/routes/capability-form-fields.tsx
  role: depends-on
- name: use-connector-configuration-form
  path: src/hooks/use-connector-configuration-form.ts
  role: depends-on
- name: use-capability-form
  path: src/hooks/use-capability-form.ts
  role: depends-on
- name: use-connector-configuration-detail
  path: src/hooks/use-connector-configuration-detail.ts
  role: depends-on
- name: use-connector-configuration-detail-view
  path: src/hooks/use-connector-configuration-detail-view.ts
  role: depends-on
- name: use-capability-detail
  path: src/hooks/use-capability-detail.ts
  role: depends-on
- name: use-capability-detail-view
  path: src/hooks/use-capability-detail-view.ts
  role: depends-on
- name: connector-test-panel
  path: src/routes/connector-test-panel.tsx
  role: adjacent
must_not_duplicate:
- what: connector-configuration-form-fields.tsx / capability-form-fields.tsx -- the field markup, already
    parametrized by isEditingIdentity/isDirty/trailingActions for both the Dialog and the routed-screen
    shapes; a create route must compose these, not a third copy.
  at: src/routes/connector-configuration-form-fields.tsx, src/routes/capability-form-fields.tsx
- what: use-connector-configuration-form.ts / use-capability-form.ts -- the create(null)/edit(existing)
    nullable-target hook shape, already the shared source of create-mode submission, validation-gating
    and save-failure-message mapping; a routed create screen's own state should reuse or extend this shape
    rather than re-deriving it from use-connector-configuration-detail.ts's edit-only shape.
  at: src/hooks/use-connector-configuration-form.ts, src/hooks/use-capability-form.ts
- what: ConnectorConfigurationFormTarget / CapabilityFormTarget -- the nullable-identity mode type already
    distinguishing create from edit; a routing-based create/edit distinction should key off the same vocabulary
    rather than inventing a second one.
  at: src/hooks/use-connector-configuration-form.ts, src/hooks/use-capability-form.ts
- what: getJsonTextareaMinifiedValue / JsonTextareaField -- the one parse/minify/validity boundary every
    configuration and schema field already goes through.
  at: src/shared/components/json-textarea-field.tsx
risks:
- risk: Removing the popup Dialogs' create action from connector-configurations-screen.tsx / capabilities-browser-screen.tsx
    without keeping ConnectorConfigurationFormTarget's / CapabilityFormTarget's edit-mode variant intact would
    break the type these Dialog components still declare and consume.
  consumers:
  - src/routes/connector-configuration-form-dialog.tsx
  - src/routes/capability-form-dialog.tsx
- risk: connector-configuration-form-dialog.tsx's edit-mode branch is described in its own header comment
    as unreachable from current production navigation but is still exercised by a named spec file; deleting
    the Dialog outright without checking spec coverage would silently drop that test's own assertions.
  consumers:
  - src/routes/connector-configuration-form-dialog-forwards-configuration-text.spec.ts
- risk: Both routed detail hooks (use-connector-configuration-detail.ts, use-capability-detail.ts) and
    their view-layer wrappers currently assume an existing record (always issue a GET by identity, always
    disable the identity field); extending the route to create mode without a corresponding branch in
    these hooks would break the "ready" phase's own assumptions that every consumer screen currently relies
    on.
  consumers:
  - src/routes/connector-configuration-detail-screen.tsx
  - src/routes/capability-detail-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
  - src/routes/capability-detail-ready-view.tsx
- risk: route-tree.tsx sorts by specificity, not registration order, and both existing detail routes are
    dynamic segments ("/connectors/$connector", "/capabilities/$name/$version"); a create route added as
    a sibling literal segment (e.g. "/connectors/new") must follow the same static-segment-ranks-over-dynamic-segment
    convention newCaseVersionRoute and newManifestHypothesisRoute already establish, or it risks being shadowed
    by or shadowing the existing dynamic route.
  consumers:
  - src/routes/route-tree.tsx
---

## What it is
The two routed detail/edit screens (ConnectorConfigurationDetailScreen at "/connectors/$connector", CapabilityDetailScreen at "/capabilities/$name/$version"), each backed by a phase-union view hook composed over a data-layer hook, edit an existing record only -- neither offers a create branch today.
The two popup Dialogs (ConnectorConfigurationFormDialog, CapabilityFormDialog) are the only current entry point for creation, opened by the list screens' "New connector configuration" / "New capability" buttons, and are shared with a now-unreachable edit-mode branch the routed screens already superseded.
Both list screens (connector-configurations-screen.tsx, capabilities-browser-screen.tsx) hold a formTarget state of a nullable-identity union type (ConnectorConfigurationFormTarget, CapabilityFormTarget, each { mode: "create" } or { mode: "edit", <record> }) that already selects create vs. edit mode for the shared create/edit hook and Dialog.
Both create/edit hooks (use-connector-configuration-form.ts, use-capability-form.ts) accept a nullable existing record -- null selects create mode, a real record selects edit mode -- and disable the identity field(s) in edit mode rather than merely pre-filling them, because both registries' PUT operations are create-or-replace-by-identity.
The routed detail hooks (use-connector-configuration-detail.ts, use-capability-detail.ts) are edit-only today: they always issue their own GET by identity and always disable the identity field, with no branch for an identity that does not yet exist.
Both routed screens navigate back to their list via a Link rendered in every phase; both list screens navigate into the detail route from StatusTable's onRowClick, reading the clicked row's own identity field(s) and calling useNavigate.
Both form-fields components (connector-configuration-form-fields.tsx, capability-form-fields.tsx) already accept isEditingIdentity, isDirty (optional) and trailingActions (optional ReactNode) so the same markup composes both the popup Dialog's plain footer and the routed screen's discard/saved-acknowledgement footer.

## Notes
route-tree.tsx's own header comments on both existing detail routes state explicitly that the popup Dialog's "New connector configuration" / "New capability" creation path was deliberately left untouched when those routes were added -- this scope is what closes that gap.
ConnectorTestPanel is rendered by both the routed connector-configuration screen (always, scoped to the URL's own connector identity) and the popup Dialog's edit-mode branch (now unreachable in production navigation, per that file's own header comment) -- a create-mode routed screen has no registered connector identity yet, so this panel's applicability to a create branch is a design question the scope does not answer; not asserted as a fact here.
connector-configuration-form-dialog-forwards-configuration-text.spec.ts and capability-detail-screen.spec.ts are the only spec files whose names reference the Dialog/detail-screen composition directly; no spec name references connector-configurations-screen.tsx or capabilities-browser-screen.tsx list-screen behavior around formTarget beyond what type-checking would catch.
