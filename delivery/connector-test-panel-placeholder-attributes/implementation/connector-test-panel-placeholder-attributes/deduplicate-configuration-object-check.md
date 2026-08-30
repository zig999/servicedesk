---
title: Deduplicate the well-formed-configuration-object check into one shared primitive
summary: A new shared, exported isPlainRecord primitive under frontend/app/src/shared/services/ replaces
  the two private, identical typeof/null/Array.isArray checks use-test-connector-panel.ts and simulation-subject-derivation.ts
  each declared, with both files' own stale header/JSDoc comments updated to match.
task: sha256:bd49a03c4550ba8d42d1df6d9a11e78361c4fb892bc4970cb460cf493d15f1b3
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-test-panel-placeholder-attributes-deduplicate-configuration-object-check-build-3
files:
- path: src/shared/services/plain-record.ts
  effect: new module exporting isPlainRecord(value) -> value is Record<string, unknown>, the well-formed-JSON-object-check
    primitive (typeof value === "object" && value !== null && !Array.isArray(value)), with a header comment
    tracing why it is shared (two prior private, identical copies) and its mirror-of-the-backend provenance
    (connector-request-resolver.ts's isPlainObject)
- path: src/services/simulation-subject-derivation.ts
  effect: no longer declares its own private isPlainRecord function; imports isPlainRecord from ../shared/services/plain-record
    and calls it unchanged at every existing call site (subjectPlaceholderNamesInStringRecord, subjectPlaceholderNamesInValue,
    subjectPlaceholderNamesInConfiguration). Header comment gains a paragraph stating the check moved
    to shared/services/plain-record.ts and why, replacing the now-obsolete implication that this file
    was the check's sole owner
- path: src/hooks/use-test-connector-panel.ts
  effect: parsesAsConfigurationObject (private, unchanged signature and call site in onAddAttribute) now
    delegates to the shared isPlainRecord after JSON.parse instead of inlining the typeof/null/Array.isArray
    expression itself. Its JSDoc comment is rewritten to drop the obsolete "since it declares no export
    of its own isPlainRecord to reuse; see this task's delivery record" sentence and state instead that
    both files now call the one shared primitive
criteria:
- criterion: A single, exported well-formed-JSON-object-check primitive exists under frontend/app/src/shared/services/,
    and both use-test-connector-panel.ts's parsesAsConfigurationObject and simulation-subject-derivation.ts's
    own equivalent private check are replaced by calls to it, rather than each declaring its own private
    typeof/null/Array.isArray expression.
  met: true
  how: src/shared/services/plain-record.ts exports isPlainRecord as the one well-formed-JSON-object-check
    primitive. simulation-subject-derivation.ts's own private isPlainRecord function declaration is removed
    and every one of its former call sites now calls the imported shared isPlainRecord. use-test-connector-panel.ts's
    parsesAsConfigurationObject no longer inlines the raw expression -- it calls the same imported isPlainRecord
    and stays as a thin, named wrapper local to that file (its one call site, onAddAttribute, reads more
    clearly gated on a function named for what it checks). Neither file declares its own typeof/null/Array.isArray
    expression anymore.
- criterion: connector-test-panel-capability-picker.spec.ts contains at least one test that clicks "Add
    attribute" against a Configuration text embedding a subject-attribute placeholder and asserts the
    resulting row reflects that placeholder, so the file would fail if the reconciliation behavior regressed
    to the old append-one-empty-row behavior.
  met: false
  how: This is a test-authoring criterion, answered by a test written against a spec file rather than
    by any change to non-test source -- this project's own rule holds that writing source and writing
    what proves it are two separate judgments, in two separate contexts, so this record (task-implementer,
    source only) does not touch connector-test-panel-capability-picker.spec.ts. It is answered by the
    proof record's own tests, written next by the test-author against this implementation.
nodes:
- node: domain/integration/connector-configuration
  encoded_at:
  - src/shared/services/plain-record.ts
  how: isPlainRecord's header comment states the shape it checks is exactly the shape this node requires
    a registered configuration's own text to parse to (a well-formed JSON object); the function's own
    logic is unchanged behavior carried over verbatim from the two prior private copies, so this task
    encodes no new fact about the node -- it only relocates where the existing check lives, from two files
    to one.
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  encoded_at:
  - src/shared/services/plain-record.ts
  how: isPlainRecord's header comment cites this rule's own "a null value and an array included" language
    to explain why the check excludes both. The check's logic (typeof/null/Array.isArray) is unchanged
    from the two prior private copies this task deduplicates; this task's own objective is the deduplication,
    not a new encoding of the rule's substance, so this node is honored by the primitive continuing to
    enforce exactly what it already enforced, now from one shared place both files call.
inferences:
- inferred: parsesAsConfigurationObject stays as a thin named wrapper local to use-test-connector-panel.ts
    (calling the shared isPlainRecord) rather than being removed in favor of calling isPlainRecord directly
    at its one call site.
  from: the task's own text leaves the exact shape of the shared primitive and each call site's own wrapping
    to judgment; the wrapper's own name documents at its one call site (onAddAttribute) what is being
    checked (a well-formed configuration object after JSON.parse, not merely "a plain record"), which
    the bare isPlainRecord name does not carry on its own
- inferred: the new shared module is named plain-record.ts, exporting isPlainRecord, rather than a name
    like json-object.ts or a member added to the existing connector-placeholder-token.ts module.
  from: simulation-subject-derivation.ts's own prior local function name (isPlainRecord) is reused as
    the shared export's name so neither file's call sites needed renaming beyond adding the import, and
    a fresh module was chosen over extending connector-placeholder-token.ts because that module is scoped
    to the placeholder-token grammar specifically, a different concern from this predicate's general JSON-shape
    check
preserved:
- 'use-test-connector-panel.ts''s onAddAttribute: parsesAsConfigurationObject must still return false
  for text that fails JSON.parse or that parses to a null, an array, or any non-object value, and true
  only for a plain object -- exactly the prior behavior, since criterion 6 of task/connector-test-panel-placeholder-attributes/reconcile-test-panel-attribute-rows
  (leaving `attributes` untouched when Configuration text does not parse as a well-formed object) depends
  on it and this task changes no observable behavior'
- 'simulation-subject-derivation.ts''s subjectPlaceholderNamesInConfiguration, subjectPlaceholderNamesInStringRecord
  and subjectPlaceholderNamesInValue: each must keep returning an empty read for a non-plain-record input
  at every point isPlainRecord (now imported) gates them, exactly as the prior private isPlainRecord did'
- every existing consumer of subjectPlaceholderNamesInConfiguration and deriveRequiredFields (use-simulation-subject.ts,
  its own spec, simulation-subject-derivation.spec.ts) must see unchanged exports and unchanged return
  values -- isPlainRecord's move out of this file changes nothing exported by it
deferred:
- what: src/http-connector/connector-request-resolver.ts's own private isPlainObject on the backend still
    duplicates the same check.
  why: it sits in a different target (backend) from this frontend initiative's own scope, out of this
    task's reach per its own Notes and the plan's own inventory node recording the same fact
---

## What it is
A new shared, exported isPlainRecord primitive at src/shared/services/plain-record.ts, holding the well-formed-JSON-object-check (typeof/null/Array.isArray) that use-test-connector-panel.ts's parsesAsConfigurationObject and simulation-subject-derivation.ts's own isPlainRecord each used to declare privately and identically.
Both files now import and call this one shared primitive instead, with their own header/JSDoc comments updated to state the new shared location rather than the prior, now-stale explanation of why each declared its own copy.
No observable behavior changed in either file: parsesAsConfigurationObject and the placeholder-derivation functions that gated on isPlainRecord return exactly what they returned before.

## Notes
Criterion 2 of this task (a new test in connector-test-panel-capability-picker.spec.ts) is a test-authoring criterion answered by the proof record, not by this implementation -- writing source and writing what proves it are two separate judgments in two separate contexts, and this record is source only.
