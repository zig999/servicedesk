---
title: Proof that applying a drafted configuration writes only the Configuration field's local edit
summary: Two spec files -- one isolated at ConnectorConfigurationHelperFields proving the Apply
  affordance's own presence rule and callback, one end-to-end through ConnectorConfigurationCreateScreen
  with a real router, query client and fetch stub -- together establish all seven criteria.
implementation: sha256:de294a597ed241f506ec93aba4e231cfaab481f39d3e1199c566550662961096
standard:
  at: ../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/connector-configuration-openapi-draft-frontend-draft-apply-to-local-edit-suite
tests:
  - file: src/routes/connector-configuration-helper-fields-apply.spec.ts
    name: "ConnectorConfigurationHelperFields -- no Apply is offered while idle (criterion 7) > renders no Apply button while the outcome is idle"
    proves: "Criterion 7: No apply is offered where no draft has been answered (idle outcome)."
    fails_when: The Apply button renders regardless of outcome kind, or the "none" disclosure branch is changed to render it.
  - file: src/routes/connector-configuration-helper-fields-apply.spec.ts
    name: "ConnectorConfigurationHelperFields -- no Apply is offered while a request is pending (criterion 7) > renders no Apply button while the outcome is pending"
    proves: "Criterion 7: No apply is offered where no draft has been answered (pending outcome)."
    fails_when: The Apply button, or any equivalent affordance, renders while the outcome is still pending.
  - file: src/routes/connector-configuration-helper-fields-apply.spec.ts
    name: "ConnectorConfigurationHelperFields -- no Apply is offered over a refused request (criterion 7) > renders no Apply button when the outcome is a refusal"
    proves: "Criterion 7: No apply is offered where no draft has been answered (a refusal outcome)."
    fails_when: The Apply button renders alongside a refusal's alert.
  - file: src/routes/connector-configuration-helper-fields-apply.spec.ts
    name: "ConnectorConfigurationHelperFields -- Apply is offered once a draft has been answered (criterion 7) > renders an Apply button once the outcome is drafted"
    proves: "Criterion 7's positive half: an answered draft does offer Apply."
    fails_when: No Apply button renders for a drafted outcome, e.g. the button is removed or mislabeled.
  - file: src/routes/connector-configuration-helper-fields-apply.spec.ts
    name: "ConnectorConfigurationHelperFields -- clicking Apply carries the draft's own configuration text, unmodified (criterion 1, callback half) > invokes onApply exactly once with the draft's own configuration text"
    proves: "Criterion 1's callback half: clicking Apply calls onApply with exactly the answered draft's own configuration text, not a copy, a default or another field's text."
    fails_when: onApply is never called, is called more than once, or is called with any value other than the draft's own configuration string.
  - file: src/routes/connector-configuration-helper-fields-apply.spec.ts
    name: "ConnectorConfigurationHelperFields -- a prior drafted Apply affordance is withdrawn once a later request is refused (criterion 7, stale-draft edge case) > stops offering Apply once the outcome moves from drafted to a refusal"
    proves: The task's own inference that a refused later request withdraws a prior drafted Apply affordance rather than leaving it standing beside the refusal, since the outcome mechanics replace one status outright.
    fails_when: The Apply button (or the drafted disclosure it sits in) survives a rerender that carries a refusal outcome after a prior drafted one.
  - file: src/routes/connector-configuration-create-screen-apply-draft.spec.ts
    name: "ConnectorConfigurationCreateScreen -- applying an answered draft writes its configuration text into the Configuration field (criterion 1) > shows the drafted configuration text in the Configuration field after Apply"
    proves: "Criterion 1, full path: through the real create-screen hook chain, applying an answered draft sets the Configuration field's own rendered, local value to the draft's configuration text."
    fails_when: The Configuration field's value after Apply is not exactly the drafted text -- left unchanged, blank, or altered by anything other than JsonTextareaField's own no-op reformat.
  - file: src/routes/connector-configuration-create-screen-apply-draft.spec.ts
    name: "ConnectorConfigurationCreateScreen -- applying an answered draft dispatches no save request, so every registered connector configuration stands unchanged (criteria 2 and 3) > issues no PUT to the registry when Apply is clicked"
    proves: "Criteria 2 and 3: applying invokes no save mutation and dispatches no request, so nothing registered is created, removed or changed -- observed as zero PUT calls against the real fetch stub."
    fails_when: Any PUT request reaches the fetch stub after Apply is clicked.
  - file: src/routes/connector-configuration-create-screen-apply-draft.spec.ts
    name: "ConnectorConfigurationCreateScreen -- applying an answered draft leaves the operator on the same, unsubmitted surface (criterion 4) > stays on /connectors/new with the applied text still held rather than submitted"
    proves: "Criterion 4: the operator remains on the same route after Apply, with the applied text still present and held rather than submitted."
    fails_when: The router's location changes away from /connectors/new after Apply, e.g. a navigation is triggered.
  - file: src/routes/connector-configuration-create-screen-apply-draft.spec.ts
    name: "ConnectorConfigurationCreateScreen -- applying an answered draft leaves the Connector field exactly as it stood (criterion 5) > keeps the typed connector name unchanged after Apply"
    proves: "Criterion 5: applying an answered draft leaves the Connector field's value exactly as it stood."
    fails_when: The Connector field's value differs from what was typed before Apply -- cleared, overwritten, or altered.
  - file: src/routes/connector-configuration-create-screen-apply-draft.spec.ts
    name: "ConnectorConfigurationCreateScreen -- applying a draft whose text is not a well-formed object leaves Save disabled (criterion 6, recomputed rather than trusted) > keeps Save disabled after applying non-object JSON text, despite the wiring passing a valid hint"
    proves: "Criterion 6: the Configuration field's own validity reading is recomputed from the applied text itself, rather than trusted from the `true` hint the apply wiring passes -- a syntactically valid but non-object applied text still leaves Save disabled."
    fails_when: Save becomes enabled after applying non-well-formed text, showing the wiring's `true` argument was trusted instead of the text being independently revalidated.
  - file: src/routes/connector-configuration-create-screen-apply-draft.spec.ts
    name: "ConnectorConfigurationCreateScreen -- applying a well-formed draft's text enables Save, recomputed from the drafted content itself (criterion 6, recomputed from real content) > flips Save from disabled to enabled once a well-formed draft is applied to a field that started invalid and empty"
    proves: "Criterion 6's complementary direction: the same recomputation that can keep Save disabled can also enable it, from an initially invalid, empty field, once well-formed drafted text is applied -- proving genuine content-based recomputation rather than a one-directional guard."
    fails_when: Save remains disabled after applying well-formed configuration text, or was already enabled before Apply for a reason unrelated to this flow.
not_applicable:
  - edge_case: Applying a draft whose configuration text is empty.
    why: An empty applied text is simply another instance of "not a well-formed object" -- the same isValidConfigurationObject / JsonTextareaField code path the non-well-formed test (criterion 6, "42") already exercises, with no additional branch an empty-string variant would reach.
  - edge_case: Clicking Apply while a save is already submitting (a concurrent apply/save race).
    why: No criterion of this task states behavior for this interleaving, and the task's own Notes explicitly defer any confirmation or interaction guard around applying to the sibling unsaved-edit-apply-confirmation task. Testing it here would test a rule this task's own criteria do not claim.
  - edge_case: Requesting a second draft while a first draft's Apply is still being processed (two operations against one subject at once).
    why: Apply's onClick body is a single synchronous local state update (configuration.onChange) with no awaited step, so there is no window in which a second UI event can interleave with it in this single-threaded render -- there is no such state to reach.
untested:
  - "The identical onApply wiring is exercised end-to-end only through ConnectorConfigurationCreateScreen (use-connector-configuration-form.ts's hook chain). ConnectorConfigurationFormFields and ConnectorConfigurationHelper are the same, unmodified components when reached through ConnectorConfigurationDetailScreen (use-connector-configuration-detail.ts), but no test in this record mounts that screen and applies a draft against it -- a defect specific to use-connector-configuration-detail.ts's own onChange/isDirty handling, left unmodified by this task, would not be caught here."
  - "Criterion 6's literal wording (\"recomputed ... the same way it is for text typed by hand\") is proven here by observing that the applied path genuinely revalidates from content in both directions (criterion 6's two tests), not by a single test that puts a hand-typed edit and an applied draft through the identical assertion to show they reach the same function reference. That the two paths share one ConfigurationFieldState.onChange is established by reading use-connector-configuration-form.ts and use-connector-configuration-detail.ts (both unmodified by this task), not by an assertion in this record."
---

## What it is

Proof that the Apply affordance writes only the Configuration field's local edit and nothing else.

## Notes

None.
