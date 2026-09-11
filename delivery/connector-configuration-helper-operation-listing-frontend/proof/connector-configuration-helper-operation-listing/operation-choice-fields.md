---
target: frontend
title: Configuration Helper offers operations as a Select, tests over the choice control and the upper-casing
  invariant
summary: connector-configuration-helper-fields-operation-select.spec.ts (with one existing test's input
  data corrected to a lower-case method so it actually decides the case-invariance it already claimed
  to cover) carries all eight criteria of operation-choice-fields.md, the underdetermined entry, and the
  two domain nodes a finite test can decide whole; the two rule nodes this task only partially implements
  are left untested with why, per the task's own REMAINDER notes.
implementation: sha256:d42db6c2b902902b1a3880562d28ffac26099f148b6f95877e90a19960664599
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/connector-configuration-helper-operation-listing-operation-choice-fields-suite-3
tests:
- file: src/routes/connector-configuration-helper-fields-operation-select.spec.ts
  name: ConnectorConfigurationHelperFields -- the Select offers every operation the state lists, none
    dropped (criterion 1, domain/integration/openapi-document-operations) > opens onto exactly one option
    per entry in state.operations, both entries represented
  proves: Criterion 1 -- the component renders a Select whose options are the entries the state offers,
    one option per entry.
  fails_when: The Select's options stop being a 1:1 mapping of state.operations -- an entry is dropped,
    paged out, deduplicated, or an option is rendered that no entry in state.operations names.
  demonstrates: domain/integration/openapi-document-operations
- file: src/routes/connector-configuration-helper-fields-operation-select.spec.ts
  name: ConnectorConfigurationHelperFields -- an option's label states both the entry's path and its method,
    upper-cased, together (criterion 2, domain/integration/openapi-operation) > shows the entry's own
    path and its own method together on the option, upper-cased even though the entry names it lower-case
  proves: Criterion 2 -- an option's label states both the entry's path and the entry's method.
  fails_when: The rendered option label stops containing the entry's own path, or stops containing its
    method upper-cased, for an entry whose own method is lower-case -- the original test used an already-upper-case
    method ("POST"), which would still pass even if the label interpolated the raw field verbatim; the
    input was changed to a lower-case method ("post") so the assertion actually turns on the upper-casing,
    not on the fixture happening to already be upper-case.
  demonstrates: domain/integration/openapi-operation
- file: src/routes/connector-configuration-helper-fields-operation-select.spec.ts
  name: ConnectorConfigurationHelperFields -- choosing an option calls the state's operation choice with
    that exact entry (criterion 3) > invokes onChooseOperation once with the chosen entry, not a distractor
    sharing the same path
  proves: Criterion 3 -- choosing an option calls the state's operation choice with that entry.
  fails_when: onChooseOperation is not called, is called more than once, or is called with an entry other
    than the one whose option was chosen (including a distractor entry that shares the chosen entry's
    path but not its method).
- file: src/routes/connector-configuration-helper-fields-operation-select.spec.ts
  name: ConnectorConfigurationHelperFields -- no free-text control for an operation path is rendered (criterion
    4) > renders no textbox whose accessible name refers to a path
  proves: Criterion 4 -- the component renders no input accepting typed text for an operation path.
  fails_when: A textbox whose accessible name refers to a path is rendered anywhere in the component's
    tree.
- file: src/routes/connector-configuration-helper-fields-operation-select.spec.ts
  name: ConnectorConfigurationHelperFields -- no free-text control for an operation method is rendered
    (criterion 5) > renders no textbox whose accessible name refers to a method
  proves: Criterion 5 -- the component renders no input accepting typed text for an operation method.
  fails_when: A textbox whose accessible name refers to a method is rendered anywhere in the component's
    tree.
- file: src/routes/connector-configuration-helper-fields-operation-select.spec.ts
  name: ConnectorConfigurationHelperFields -- no path or method value can be supplied when the state offers
    no entries (criterion 6) > opens onto no selectable option at all when state.operations is empty
  proves: Criterion 6 -- where the state offers no entries, no path or method value can be supplied through
    the component at all.
  fails_when: The Select's listbox offers a selectable option, or any other control accepting a path or
    method value appears, when state.operations is empty.
- file: src/routes/connector-configuration-helper-fields-operation-select.spec.ts
  name: ConnectorConfigurationHelperFields -- the OpenAPI document link field and the draft request control
    stay on the surface (criterion 7) > still renders the OpenAPI document link input and the Request
    Draft button
  proves: Criterion 7 -- the OpenAPI document link field and the draft request control remain rendered
    on the same surface as before.
  fails_when: The OpenAPI document link input or the Request Draft button stops being rendered on the
    surface.
- file: src/routes/connector-configuration-helper-fields-operation-select.spec.ts
  name: ConnectorConfigurationHelperFields -- a listed operation's method is not upper-cased when the
    state's own entry names it lower-case (UNDERDETERMINED, from rules/integration/an-openapi-operations-method-is-upper-cased)
    > states the method upper-cased on the option regardless of the case the entry itself holds
  proves: The UNDERDETERMINED entry -- a Select whose option labels interpolate the entry's method verbatim
    satisfies every criterion as written but violates rules/integration/an-openapi-operations-method-is-upper-cased.
  fails_when: The implementation named by the entry -- a Select whose option label interpolates operation.method
    verbatim, without upper-casing it -- is what runs; here that would render "get" rather than "GET"
    for a document whose own path-item key names the operation lower-case.
  demonstrates: rules/integration/an-openapi-operations-method-is-upper-cased
- file: src/routes/connector-configuration-helper-fields.spec.ts
  name: ConnectorConfigurationHelperFields -- idle renders neither a refusal nor a draft > shows no drafting
    line, no alert and no drafted disclosure while idle
  proves: Criterion 8 (connector-configuration-helper-fields.spec.ts half) -- this suite's hand-written
    baseState() literal is built from the state shape this task leaves (link, onLinkChange, operations,
    operationsOutcome, onChooseOperation, path, onPathChange, method, onMethodChange, onRequestDraft,
    outcome) and the suite passes against the component this task delivers.
  fails_when: baseState()'s literal stops matching ConnectorConfigurationHelperState as this task leaves
    it (a field renamed, removed, retyped, or newly required goes unsupplied), which would fail this suite
    to compile or to pass.
- file: src/routes/connector-configuration-helper-fields-apply.spec.ts
  name: ConnectorConfigurationHelperFields -- clicking Apply carries the draft's own configuration text,
    unmodified (criterion 1, callback half) > invokes onApply exactly once with the draft's own configuration
    text
  proves: Criterion 8 (connector-configuration-helper-fields-apply.spec.ts half) -- this suite's hand-written
    baseState() literal is likewise built from the state shape this task leaves, and the suite passes
    against the component this task delivers.
  fails_when: baseState()'s literal in this file stops matching ConnectorConfigurationHelperState as this
    task leaves it, which would fail this suite to compile or to pass.
not_applicable:
- edge_case: Two entries in state.operations sharing the exact same path and method (a true duplicate).
  why: No criterion or node states a deduplication or distinct-rendering requirement for a duplicate pair;
    the "one option per entry" obligation is already decided by two distinct entries (criterion 1's test),
    and a dimension that does not change what the obligation requires is not multiplied.
- edge_case: A selected value that matches no entry in state.operations.
  why: Unreachable through the rendered UI -- the Select only ever offers values built from state.operations
    itself -- and no criterion or node states a behavior or refusal for it. The component's onOperationSelected
    guard against this is an internal safeguard against an impossible state, not a behavior any obligation
    states.
- edge_case: A slow or failing network dependency behind the operations read.
  why: This component receives already-resolved state (operations, path, method) and issues no fetch of
    its own; the read and its refusals are REMAINDER in this task's own notes, belonging to the sibling
    task that wires the helper state to the backend operations read.
- edge_case: Two operation choices made concurrently, or in flight at once.
  why: Choosing an option is a single synchronous call to state.onChooseOperation; nothing in this component
    models an asynchronous choice this could race with, and no criterion states a behavior for concurrent
    selection.
untested:
- rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing -- its
  statement has three clauses (the helper offers the pairs once fetched; the operator names one by choosing,
  never typing; the draft request then names the chosen pair's own path and method). This task's own REMAINDER
  notes assign the opening clause to the task wiring the helper's read of the document's operations, and
  the closing clause to the sibling task helper-operation-choice-state; only the middle clause is this
  task's to test, and criteria 3-6's tests exercise only that middle clause. No test in this proof decides
  the rule's statement whole, since two of its three clauses are implemented elsewhere.
- rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper -- its statement
  covers the whole authoring surface offering a helper (naming a link and an operation, requesting a draft)
  and states that requesting a draft issues no register-connector call. This task's own REMAINDER notes
  assign the register-connector clause to the already-delivered draft-request task, and this task's own
  criteria only hold that the link field and the draft request control remain rendered (criterion 7).
  No test in this proof decides the rule's full statement whole.
---

## What it is

Cites connector-configuration-helper-fields-operation-select.spec.ts (with one test's fixture strengthened to a lower-case method so it actually decides the upper-casing invariant), plus the two composition-level suites' baseState() literals, as what proves this task's 8 criteria.

## Notes

Deferred: the sibling proof-only re-delivery this task's own implementation record already named (rewriting the three orphaned specs) has since been delivered as its own task (reconcile-orphaned-configuration-helper-tests/rewrite-orphaned-specs), which is what makes the suite this proof cites green.
