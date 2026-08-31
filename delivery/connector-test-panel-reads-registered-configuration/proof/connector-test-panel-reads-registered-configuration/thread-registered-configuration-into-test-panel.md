---
title: Registered configuration threaded into the Test Panel proof
summary: Proves that useConnectorConfigurationDetailView's "ready" phase exposes registeredConfigurationText
  (distinct from configuration.value, re-seeded only at load and at a successful save) and that ConnectorConfigurationDetailReadyView
  forwards it to ConnectorTestPanel, so "Add attribute" reconciliation reads the connector's currently
  registered configuration rather than an unsaved edit.
implementation: sha256:92aa4c0f2d831ac9619c224031ec8ca2aaae376d7eac832adafbcc8241124e29
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-test-panel-reads-registered-configuration-thread-registered-configuration-into-test-panel-suite-2
tests:
- file: src/hooks/use-connector-configuration-detail-view.spec.ts
  name: registeredConfigurationText -- equals the just-loaded configuration text immediately after this
    connector's own record loads
  proves: criterion 1 (the field exists on the "ready" phase and carries the loaded text)
  fails_when: registeredConfigurationText is absent, undefined, or does not carry the text the load GET
    returned.
- file: src/hooks/use-connector-configuration-detail-view.spec.ts
  name: registeredConfigurationText -- stays at the last loaded-or-saved text after an edit that has not
    been saved, diverging from configuration.value's own edited value
  proves: criterion 1's "distinct from configuration.value" clause, and the implementation's disclosed
    inference that configurationBaseline moved from a useRef to a useState so a value read at render time
    carries a fresh snapshot.
  fails_when: registeredConfigurationText mirrors the live, unsaved edit instead of staying at the last
    registered text.
- file: src/hooks/use-connector-configuration-detail-view.spec.ts
  name: registeredConfigurationText -- updates to the just-saved text once a save succeeds
  proves: criterion 1's re-seed-on-save behavior, the data-layer half of criterion 4.
  fails_when: registeredConfigurationText stays at the pre-save text after a successful save.
- file: src/hooks/use-connector-configuration-detail-view.spec.ts
  name: 'registeredConfigurationText -- stays at the last loaded-or-saved text when a save fails, rather
    than the edit that failed to save (edge case: a dependency that fails)'
  proves: the boundary of criterion 4 ("saving" means a successful save) -- a rejected PUT must not advance
    the registered snapshot.
  fails_when: registeredConfigurationText advances to the failed edit's text after the PUT rejects.
- file: src/routes/connector-configuration-detail-ready-view-forwards-configuration-text.spec.ts
  name: ConnectorConfigurationDetailReadyView -- Add attribute reconciles against the registered configuration
    text, not an unsaved edit (criterion 3) -- keeps reconciling against the last registered text after
    Configuration is edited but not saved
  proves: criteria 2 and 3 together, end to end through the real, unmocked ConnectorTestPanel/useTestConnectorPanel
    reconciliation.
  fails_when: the route forwards the live, unsaved edit as configurationText, which would drop the account-id
    row and add a region row instead.
- file: src/routes/connector-configuration-detail-ready-view-forwards-configuration-text.spec.ts
  name: ConnectorConfigurationDetailReadyView -- Add attribute reconciles against the just-saved configuration
    text once a save lands (criterion 4) -- reconciles against the newly saved text the next time Add
    attribute is clicked after a successful save
  proves: criterion 4, end to end -- a successful save must advance what "Add attribute" reconciles against
    to the just-saved text.
  fails_when: a click after a successful save still reconciles against the pre-save text (rows would stay
    ["account-id"] instead of becoming ["region"]).
not_applicable:
- edge_case: Absent/empty configuration text as a fresh edge case of this task
  why: registeredConfigurationText is always seeded from a configuration record that already loaded successfully
    before the "ready" phase exists at all -- there is no new empty/absent-input path this task introduces.
- edge_case: Duplicate or uniqueness edge cases, and the empty-collection-after-reconciliation edge case
  why: these belong to reconcileAttributeRows/onAddAttribute (use-test-connector-panel.ts), which criterion
    5 states is unchanged and which connector-test-panel-attribute-reconciliation.spec.ts already covers
    in full over that unchanged file.
- edge_case: Concurrent operations against one subject at once
  why: no new concurrent-operation surface is introduced by threading a different string into an existing
    prop; the two operations this task's own criteria name (a discard, a save) already run through react-hook-form's/react-query's
    own existing single-flight guards, untouched by this task.
untested:
- Whether the panel refetches or otherwise refreshes registeredConfigurationText against a configuration
  another operator or session registered in the meantime -- disclosed by this task's own UNDERDETERMINED
  note as an accepted, out-of-scope gap; not written to fail, since closing it would require a new network
  read this task was not asked to add.
---

## What it is
Proves useConnectorConfigurationDetailView exposes registeredConfigurationText and that ConnectorConfigurationDetailReadyView forwards it to ConnectorTestPanel, so Add attribute reconciles against the registered configuration rather than an unsaved edit; the full suite passes.

## Notes
This delivery's own first suite attempt failed on seven tests outside its file set, from the closed connector-test-panel-placeholder-attributes initiative, fixed under the sibling corrective delivery connector-test-panel-tests-register-configuration. This record's own run is the attempt taken after that fix landed, and it passed clean.
