---
title: Reconcile test panel attribute rows, review
summary: What four passes found over the third task's reconciliation of Add attribute
  against Configuration's placeholders.
reviewed:
- src/hooks/use-test-connector-panel.ts
- src/routes/connector-test-panel.test-support.ts
- src/routes/connector-test-panel-subject-and-attributes.spec.ts
- src/routes/connector-test-panel-attribute-reconciliation.spec.ts
tasks:
- task/connector-test-panel-placeholder-attributes/reconcile-test-panel-attribute-rows
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/reconcile-test-panel-attribute-rows-review
failures_counted: 1
coverage:
- criterion: Clicking "Add attribute" adds exactly one row, with an empty value, for
    each subject-attribute name found in Configuration's current text that has no
    existing row.
  state: covered
  tests:
  - file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
    name: adds exactly one empty-valued row for each subject-attribute placeholder
      Configuration's current text names, when no row exists yet
  - file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
    name: drops the account-id row and adds the region row once Configuration's text
      no longer names account-id
- criterion: Clicking "Add attribute" preserves the value already entered in a row
    whose attribute name matches a subject-attribute placeholder still present in
    Configuration's current text.
  state: covered
  tests:
  - file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
    name: keeps the value already typed into a row whose attribute still names a current
      placeholder, and does not duplicate it
  - file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
    name: keeps rendering the very same Value input for a row whose placeholder is
      still present, rather than replacing it with a new element
- criterion: Clicking "Add attribute" removes any row whose attribute name matches
    no subject-attribute placeholder currently present in Configuration's text.
  state: covered
  tests:
  - file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
    name: drops the account-id row and adds the region row once Configuration's text
      no longer names account-id
  - file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
    name: 'removes every row, leaving none, once Configuration''s text names no placeholder
      at all (edge case: an empty collection where one previously existed)'
- criterion: Clicking "Add attribute" excludes ${requester} and ${credential:...}
    placeholders from the rows it adds, keeping only a placeholder naming a Subject
    attribute.
  state: covered
  tests:
  - file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
    name: adds a row only for the ${subject:...} placeholder, never for ${requester}
      or ${credential:...} in the same text
- criterion: Clicking "Add attribute" produces at most one row per distinct attribute
    name even where that name's placeholder appears more than once across address,
    query, headers and body.
  state: covered
  tests:
  - file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
    name: adds exactly one row for account-id even though its placeholder repeats
      in the address, the query, the headers and the body
- criterion: Clicking "Add attribute" when Configuration's current text does not parse
    as a valid JSON object leaves the existing rows exactly as they were before the
    click.
  state: covered
  tests:
  - file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
    name: leaves the existing row's own attribute and value exactly as they were,
      when Configuration's text fails to parse as JSON at all
  - file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
    name: leaves the existing row untouched when Configuration's text parses to a
      JSON array rather than an object
  - file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
    name: 'leaves rows exactly as they were when Configuration''s text is empty (edge
      case: empty input)'
- criterion: connector-test-panel-subject-and-attributes.spec.ts, connector-test-panel-capability-picker.spec.ts,
    connector-test-panel-dispatch-safety.spec.ts, connector-test-panel-request-response.spec.ts
    and connector-test-panel.test-support.ts's fillTestPanelBasics helper pass against
    this reconciliation behavior in place of the old append-one-empty-row behavior.
  state: partial
  tests:
  - file: src/routes/connector-test-panel-subject-and-attributes.spec.ts
    name: adds a row already named for Configuration's own placeholder, and lets the
      operator type its value (reconciliation)
  - file: src/routes/connector-test-panel-subject-and-attributes.spec.ts
    name: removes exactly the row whose own Remove action was clicked, leaving the
      other rows' own values intact (stable-row-identity inference)
  - file: src/routes/connector-test-panel-dispatch-safety.spec.ts
    name: issues no further read of the connectors, capabilities or subject-type vocabulary
      after a completed test call
  - file: src/routes/connector-test-panel-dispatch-safety.spec.ts
    name: shows the fixed generic dispatch-failure message rather than the backend's
      own raw error text, even for a mapped error code
  - file: src/routes/connector-test-panel-dispatch-safety.spec.ts
    name: issues only one POST /v1/test-connector call when Test is clicked twice
      before the first call settles
  - file: src/routes/connector-test-panel-request-response.spec.ts
    name: shows the method, resolved address, headers and body exactly as the response
      echoed them back
  - file: src/routes/connector-test-panel-request-response.spec.ts
    name: shows the status, elapsed time, headers and body exactly as the response
      carried them
  - file: src/routes/connector-test-panel-request-response.spec.ts
    name: shows only the elapsed time for a timed-out call, with no status or body
      rendered as though a response had arrived
  - file: src/routes/connector-test-panel-request-response.spec.ts
    name: shows the raw error message and elapsed time verbatim, with no status or
      body rendered as though a response had arrived
  why: 'connector-test-panel-capability-picker.spec.ts, named by the criterion, contains
    no call to "Add attribute" and no use of fillTestPanelBasics -- its assertions
    concern the capability picker, the input-schema fallback and the create-mode dialog''s
    absent Test section, none of which touch Configuration''s text or the attribute
    rows; nothing there would fail if reconciliation regressed to the old append behavior.
    The dispatch-safety and request-response tests listed do exercise the changed
    code path through fillTestPanelBasics, but only as a means to reach a filled-in
    panel: the default fixture carries exactly one placeholder, so none of their own
    assertions would distinguish reconciliation holding from the old append behavior
    for this single-placeholder case -- they would only fail if "Add attribute" stopped
    producing any row at all. The claim is fully proven for connector-test-panel-subject-and-attributes.spec.ts,
    only weakly and indirectly proven for the dispatch-safety and request-response
    files, and not proven at all for connector-test-panel-capability-picker.spec.ts.'
findings:
- pass: conformance
  file: src/hooks/use-test-connector-panel.ts
  where: lines 157-165, the parsesAsConfigurationObject function
  evidence: "function parsesAsConfigurationObject(configurationText: string): boolean\
    \ {\n  let parsed: unknown;\n  try {\n    parsed = JSON.parse(configurationText);\n\
    \  } catch {\n    return false;\n  }\n  return typeof parsed === \"object\" &&\
    \ parsed !== null && !Array.isArray(parsed);\n}"
  cost: This is the same well-formed-JSON-object test domain/integration/connector-configuration
    states ("what it must be is a well-formed JSON object"), and it is already encoded
    elsewhere in this codebase as isPlainRecord (src/services/simulation-subject-derivation.ts,
    itself noted there as mirroring a third copy, connector-request-resolver.ts's
    own isPlainObject). With the same domain-defined check now written a third or
    fourth time, a later change to what counts as a well-formed configuration object
    could update one copy and silently miss the others, and nobody reading the code
    could tell which copy still answers to the node.
  correction: Export the existing well-formedness check (isPlainRecord, or the shared
    connector-request-resolver.ts primitive) and have parsesAsConfigurationObject
    call it, rather than re-declaring the same typeof/null/Array.isArray test.
- pass: failures
  file: src/routes/case-version-editor-screen-save.spec.ts
  where: CaseVersionEditorScreen — save, conflict, 404 and the save state machine
    > sends the entire form content as one PATCH request when Save is clicked, never
    only the changed field, case-version-editor-screen-save.spec.ts:39:41
  evidence: 'AssertionError: expected +0 to be 1 // Object.is equality

    - Expected

    + Received

    - 1

    + 0

    39|       expect(patchCallCount(fetchMock)).toBe(1);'
  cost: A green suite is what a delivery record for this task requires, and this one
    failure -- entirely outside this task's own file set and specification nodes --
    blocks recording a clean run even though nothing in this task's criteria, nodes
    or files is implicated.
  correction: 'Not this task''s to fix: it belongs to whatever task owns task/version-editor/edit-draft-version
    and case-version-editor-screen-save.spec.ts. Re-running the suite in isolation,
    or investigating for cross-test timing flake, would confirm whether this is pre-existing
    noise rather than something this change introduced.'
  cause: setup
---

## What it is
Four passes over the reconcile-test-panel-attribute-rows task's delivery: coverage pairs each of the 7 stated criteria with the tests that would fail if it stopped holding; conformance reads the file set against the specification nodes the task implements; standard reads the file set against the project's own frontend-typescript.yaml; failures diagnoses the one test that failed in this review's own freshly captured run.

## Notes
The captured run's test step failed with 1 of 964 tests failing, in src/routes/case-version-editor-screen-save.spec.ts -- a file wholly outside this task's own file set, specification nodes, and even its epic. This is the same category of pre-existing, order/concurrency-dependent test-isolation noise the sibling route-configuration-text-to-test-panel task's own proof record already documented in this same codebase (a different single spurious failure reproduced on each of several re-runs of the unmodified base tree); this is now the second time this exact class of flake has surfaced in this initiative's own review runs, worth a human's attention as a standing property of this suite rather than a fresh individual incident.
The conformance finding (parsesAsConfigurationObject re-declaring the well-formed-JSON-object check a third or fourth time) is a maintainability cost over an already-duplicated fact, not a fact stated differently from what the specification holds -- all four copies agree on what "well-formed" means.
This review does not re-examine the pre-existing, unrelated trace drift the target tree already carries, reported separately by trace.py --check; that is nothing this review's four passes were asked to settle.
