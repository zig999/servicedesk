---
title: Reconcile the test panel's attribute rows against Configuration's subject-attribute placeholders
summary: useTestConnectorPanel's onAddAttribute now reads Configuration's current text at click time and
  reconciles the attribute/value rows against every currently-present ${subject:<attribute>} placeholder,
  in place of appending one empty row.
task: sha256:83f95cebaf2395c71685b53b2223cce2e4e290f5a0da4771d5bdf3a6c82916f0
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-test-panel-placeholder-attributes-reconcile-test-panel-attribute-rows-build-3
files:
- path: src/hooks/use-test-connector-panel.ts
  effect: onAddAttribute now gates on a fresh JSON.parse/plain-object check of configurationTextRef.current
    (parsesAsConfigurationObject) and, when it parses, calls the already-proven subjectPlaceholderNamesInConfiguration
    (imported from ../services/simulation-subject-derivation) and reconciles the current attribute rows
    against the returned placeholder names through a new pure helper, reconcileAttributeRows, which preserves
    the id/value of a row whose attribute still matches a current placeholder, adds one new empty-valued
    row per unmatched placeholder name, drops a row matching no current placeholder, and collapses a name
    repeated across placeholders or across rows to a single row (first-occurrence order). Configuration
    text that fails the parse/plain-object check leaves attributes untouched (no state update at all).
    The hook's own header comment and the docstrings of the two new private helpers were updated to describe
    this behavior; no exported type, no other handler (onRemoveAttribute, onAttributeChange, onTest) and
    no public signature changed.
criteria:
- criterion: Clicking "Add attribute" adds exactly one row, with an empty value, for each subject-attribute
    name found in Configuration's current text that has no existing row.
  met: true
  how: 'reconcileAttributeRows maps each deduped placeholder name to firstRowByAttribute.get(name) ??
    a freshly created { id: createId(), attribute: name, value: "" } -- a name with no existing row always
    produces exactly one new, empty-valued row.'
- criterion: Clicking "Add attribute" preserves the value already entered in a row whose attribute name
    matches a subject-attribute placeholder still present in Configuration's current text.
  met: true
  how: reconcileAttributeRows returns the existing row object unchanged (existingRow, from firstRowByAttribute)
    for any name still present among placeholderNames, so both its id and its value survive untouched.
- criterion: Clicking "Add attribute" removes any row whose attribute name matches no subject-attribute
    placeholder currently present in Configuration's text.
  met: true
  how: The returned array is built by mapping over dedupedNames (derived from the current placeholder
    read) rather than over currentRows, so a row whose attribute is not among the current placeholder
    names is never included in the result.
- criterion: Clicking "Add attribute" excludes ${requester} and ${credential:...} placeholders from the
    rows it adds, keeping only a placeholder naming a Subject attribute.
  met: true
  how: Satisfied entirely by reusing subjectPlaceholderNamesInConfiguration, which composes isSubjectPlaceholderToken
    (shared/services/connector-placeholder-token.ts) -- a ${requester} token splits to ["requester", undefined]
    and a ${credential:...} token splits to ["credential", argument], both failing kind === "subject"
    and so never reaching this hook's own list of names at all.
- criterion: Clicking "Add attribute" produces at most one row per distinct attribute name even where
    that name's placeholder appears more than once across address, query, headers and body.
  met: true
  how: reconcileAttributeRows first builds dedupedNames via a Set-backed loop over placeholderNames before
    ever producing a row, so a name occurring more than once in subjectPlaceholderNamesInConfiguration's
    own returned list yields exactly one entry in the output.
- criterion: Clicking "Add attribute" when Configuration's current text does not parse as a valid JSON
    object leaves the existing rows exactly as they were before the click.
  met: true
  how: onAddAttribute calls parsesAsConfigurationObject(configurationTextRef.current) first and returns
    immediately (no read, no setAttributes call at all) when it is false -- covering both a JSON.parse
    throw and a value that parses but is not a plain object (null, an array, a primitive).
- criterion: connector-test-panel-subject-and-attributes.spec.ts, connector-test-panel-capability-picker.spec.ts,
    connector-test-panel-dispatch-safety.spec.ts, connector-test-panel-request-response.spec.ts and connector-test-panel.test-support.ts's
    fillTestPanelBasics helper pass against this reconciliation behavior in place of the old append-one-empty-row
    behavior.
  met: false
  how: 'Out of this record''s own scope: updating those five test/fixture files is the test-author''s,
    in a separate delegation, over the proof node this same task also carries -- this record covers only
    src/hooks/use-test-connector-panel.ts, and the suite run captured at the proof step is what actually
    exercises this criterion.'
nodes:
- node: rules/integration/an-http-connector-configuration-declares-its-call
  how: Only constrains this work, and only in part -- the task's own Notes already record that the method/responseMap/statusMap
    well-formedness clause, the IncompleteConnectorCallDescriptorError ending, and the ConnectorPlaceholderNotResolvedError
    ending belong to the backend's own call-assembly (src/http-connector/connector-call-descriptor.ts,
    connector-request-resolver.ts) and are not reached by this frontend task. What this task does honor
    is the placeholder token grammar the node states (${subject:<attribute-name>} vs ${requester} vs ${credential:<name>}),
    read here only through the already-proven shared primitives (connector-placeholder-token.ts, simulation-subject-derivation.ts)
    -- no new parsing of that grammar was written.
- node: domain/integration/connector-configuration
  how: 'Only constrains this work: its Description states the configuration''s text is held as JSON object
    text of unspecified shape. onAddAttribute''s own parsesAsConfigurationObject check reads that same
    fact (a well-formed JSON object, not any particular shape) before reconciling, honoring the node without
    adding any fact about the configuration''s own attributes to the code.'
  encoded_at:
  - src/hooks/use-test-connector-panel.ts
- node: domain/glossary/subject-attribute
  how: 'Only constrains this work: the reconciled row''s own attribute field is exactly one governed subject-attribute
    name, as this glossary entry defines it. No new vocabulary or validation of that name was added here
    -- the existing SubjectAttributeRow/SubjectAttributeValue shape, unchanged by this task, already carries
    it as a plain string.'
- node: domain/investigation/subject-attribute-value
  how: 'Only constrains this work: the row''s attribute/value pairing this task reconciles is exactly
    this value-object''s shape (one governed attribute paired with one free value), already established
    by SubjectAttributeRow/SubjectAttributeValue in this same file before this task, and left unchanged
    here.'
inferences:
- inferred: Configuration text is checked for well-formed-JSON-object-ness with a dedicated JSON.parse/typeof/Array.isArray
    check (parsesAsConfigurationObject) at the top of onAddAttribute, rather than inferring "invalid text"
    from subjectPlaceholderNamesInConfiguration's own returned empty array.
  from: subjectPlaceholderNamesInConfiguration's own header comment and body state it returns [] both
    for text that fails to parse (or parses to a non-object) and for text that parses fine but simply
    embeds zero placeholders -- the task's own sixth criterion requires telling those two cases apart,
    which requires a parse check independent of that function's own defensive swallow.
- inferred: A row whose attribute name still matches a currently-present placeholder keeps its own existing
    id, rather than being assigned a freshly generated one.
  from: The inventory's must_not_duplicate entry on the locally-generated, stable row-id pattern (MNT-04
    in spirit) and the fact that no criterion of this task calls for regenerating a React key on a row
    this click did not otherwise change.
- inferred: Where two existing rows already share one attribute name, or one placeholder name occurs more
    than once, the first occurrence (in currentRows' own array order, and in placeholderNames' own declared
    address/query/headers/body order) is the one kept.
  from: Neither criterion states a tie-break for this case; the choice mirrors deriveRequiredFields's
    own first-wins determinism over its collection plan's declared precedence order (services/simulation-subject-derivation.ts),
    rather than an invented ranking of its own.
- inferred: The reconciled row order follows placeholderNames' own declared order (address, then query,
    then headers, then body, each in its own key order) rather than preserving currentRows' prior order.
  from: No criterion states a required row order; subjectPlaceholderNamesInConfiguration's own declared
    walk order is the only ordering fact available to derive one from, so the reconciliation follows it
    rather than inventing a separate ordering rule.
preserved:
- onRemoveAttribute's filter-by-id behavior, unchanged.
- onAttributeChange's map-by-id-and-field behavior, unchanged.
- hasCompleteAttribute/canTest's gating logic and its read of attributes, unchanged (still requires every
  row to carry a non-empty attribute and value).
- onTest's request-body assembly, which still sends only attribute/value per row (never id) over the wire.
- TestConnectorPanelState's public shape and useTestConnectorPanel's public signature (connector, configurationText)
  => TestConnectorPanelState, unchanged, so ConnectorTestPanel, ConnectorTestPanelFields and ConnectorTestPanelResult
  needed no changes.
- The nextRowIdRef/isDispatchingRef ref-based conventions already established in this file.
deferred:
- what: The five spec/fixture files (connector-test-panel-subject-and-attributes.spec.ts, connector-test-panel-capability-picker.spec.ts,
    connector-test-panel-dispatch-safety.spec.ts, connector-test-panel-request-response.spec.ts, connector-test-panel.test-support.ts)
    still assert the old append-one-empty-row behavior.
  why: Updating those files is the test-author's, in a separate context, over the proof node this same
    task also carries -- writing the implementation and what proves it in one pass would let both agree
    by construction, including where both are wrong.
- what: connector-configuration-form-dialog.tsx's dead edit-mode branch, which still constructs <ConnectorTestPanel
    connector={...} /> with no configurationText source, per the inventory's own risk entry.
  why: Untouched by this task -- it changes onAddAttribute's internal reconciliation logic only, not ConnectorTestPanel's
    props or any of its callers; that branch's own configurationText gap was already left open by the
    prior task (route-configuration-text-to-test-panel) and is outside this task's own objective.
---

## What it is
useTestConnectorPanel's onAddAttribute, changed from appending one empty row to reading Configuration's current text (through the already-proven subjectPlaceholderNamesInConfiguration) and reconciling the displayed attribute/value rows against its subject-attribute placeholders, through a new pure reconcileAttributeRows helper.

## Notes
Two build runs against this record's own files failed before the run this record pins passed, for a cause outside this delivery's own files: the target source root's frontend/tui git submodule was not checked out in this worktree (run/connector-test-panel-placeholder-attributes-reconcile-test-panel-attribute-rows-build failed at typecheck with every @tui/ui/*-aliased module unresolved), and once the submodule was initialized its own frontend/frontend package's node_modules was still absent (run/connector-test-panel-placeholder-attributes-reconcile-test-panel-attribute-rows-build-2 failed at typecheck with react/lucide-react/@radix-ui/*/clsx/tailwind-merge unresolved inside that submodule's own source). Both are the worktree's own environment standing up, not this task's source: every file either run's typecheck log named outside src/hooks/use-test-connector-panel.ts belongs to files this task never touched, and the same two gaps would have failed a typecheck run over the unmodified tree. Initializing the submodule (git submodule update --init --recursive) and installing its own package's dependencies (npm ci under frontend/tui/frontend) is standard worktree/environment setup, not a source or delivery decision, and is disclosed here rather than silently worked around.
