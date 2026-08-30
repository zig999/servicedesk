---
title: Extract the subject-placeholder token grammar into a shared, feature-neutral module
summary: The placeholder regex, the kind/argument split at the first ':', and the subject-kind filter
  move out of simulation-subject-derivation.ts into a new shared/services/ module that file now composes,
  with its own exported behavior unchanged.
task: sha256:a21ea88fd7187c89162ec9545fd2f952226f29eb85fcc429035a62dad36bba71
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-test-panel-placeholder-attributes-extract-connector-placeholder-parsing-build-3
files:
- path: src/shared/services/connector-placeholder-token.ts
  effect: New module. Exports PLACEHOLDER_PATTERN (the '${...}' regex), splitPlaceholderToken (the kind/argument
    split at the first ':', returning [kind, argument | undefined]), and isSubjectPlaceholderToken (the
    filter narrowing a split token to one naming the "subject" kind with a non-empty argument) -- the
    placeholder-token grammar rules/integration/an-http-connector-configuration-declares-its-call states,
    mirrored from the backend's connector-request-resolver.ts. Also exports the SUBJECT_PLACEHOLDER_KIND
    and PLACEHOLDER_ARGUMENT_SEPARATOR constants the two functions are built from. Holds no React state,
    no configuration-shape or JSON-parsing logic, and no case-simulation-specific naming -- reusable by
    any feature that needs to read this same connector-placeholder grammar (the connector-authoring test
    panel this task's own inventory names as a second, not-yet-written consumer).
- path: src/services/simulation-subject-derivation.ts
  effect: No longer declares PLACEHOLDER_PATTERN, PLACEHOLDER_ARGUMENT_SEPARATOR or SUBJECT_PLACEHOLDER_KIND,
    and no longer inlines the kind/argument split or the subject-kind check. Imports PLACEHOLDER_PATTERN,
    splitPlaceholderToken and isSubjectPlaceholderToken from ../shared/services/connector-placeholder-token
    instead; its local subjectAttributeNameOf now composes splitPlaceholderToken and isSubjectPlaceholderToken
    rather than re-declaring their logic. Every exported symbol (DerivedSubjectField, collectionPlanFromManifest,
    subjectPlaceholderNamesInConfiguration, deriveRequiredFields) and every module-private function's
    observable behavior is otherwise unchanged -- including subjectPlaceholderNamesInConfiguration's own
    JSON.parse/isPlainRecord defensive-empty-read logic, which stays local to this file and is not part
    of what moved. The file's own header comment is updated to point at the new module instead of restating
    the grammar inline.
criteria:
- criterion: A module under frontend/app/src/shared/services/ exports the placeholder regex, the kind/argument
    split at the first ':', and the filter keeping only kind === "subject" that simulation-subject-derivation.ts
    used to declare directly.
  met: true
  how: shared/services/connector-placeholder-token.ts exports PLACEHOLDER_PATTERN (the regex), splitPlaceholderToken
    (the kind/argument split at the first ':'), and isSubjectPlaceholderToken (the filter narrowing a
    split token to kind === "subject" with a non-empty argument) -- exactly the three primitives simulation-subject-derivation.ts
    used to declare as its own module-level constant and inline logic inside subjectAttributeNameOf.
- criterion: simulation-subject-derivation.ts imports these primitives from that new module rather than
    declaring them itself.
  met: true
  how: 'simulation-subject-derivation.ts''s own PLACEHOLDER_PATTERN, PLACEHOLDER_ARGUMENT_SEPARATOR and
    SUBJECT_PLACEHOLDER_KIND declarations, and the inline split/kind-check logic that used to sit inside
    subjectAttributeNameOf, are removed; the file now imports PLACEHOLDER_PATTERN, splitPlaceholderToken
    and isSubjectPlaceholderToken from "../shared/services/connector-placeholder-token", and subjectAttributeNameOf
    composes the last two (splitPlaceholderToken(token) then isSubjectPlaceholderToken(parts) ? parts[1]
    : undefined).'
- criterion: simulation-subject-derivation.spec.ts and use-simulation-subject.spec.ts pass unchanged,
    evidencing subjectPlaceholderNamesInConfiguration's own observable behavior did not change.
  met: true
  how: Neither spec file, nor its own import list, was touched by this delivery -- both import only simulation-subject-derivation.ts's
    and use-simulation-subject.ts's already-exported surface, which nothing here renamed or reshaped.
    The extracted primitives reproduce, field for field, the exact regex, the exact separator, the exact
    kind name, and the exact empty/undefined-argument exclusion the prior inline code held. Both specs
    ran and passed unchanged in the captured suite run.
- criterion: Configuration text that is not valid JSON, or not a plain object, still resolves to no placeholders
    through the extracted primitives, exactly as before the extraction.
  met: true
  how: subjectPlaceholderNamesInConfiguration's own try/JSON.parse-catch-return-empty-array and its isPlainRecord
    guard are untouched -- they stay local to simulation-subject-derivation.ts and never delegate to the
    new module. shared/services/connector-placeholder-token.ts holds only the token-grammar primitives
    (the regex, the split, the subject-kind filter) and no configuration-shape or JSON-parsing logic of
    its own, so the defensive-empty-read behavior the fourth criterion names was never something to move
    and is exactly as it stood before, proven unchanged by the captured suite run.
nodes:
- node: domain/integration/connector-configuration
  how: This task encodes no new fact about this domain model -- it only relocates already-proven parsing
    primitives. simulation-subject-derivation.ts's subjectPlaceholderNamesInConfiguration continues, unchanged,
    to read a connector's configuration as opaque JSON object text at observation time (JSON.parse, never
    a schema this domain model does not state), honoring this node's "its shape is not fixed here... held
    and answered as JSON object text" without the extraction touching that behavior at all.
- node: rules/integration/an-http-connector-configuration-declares-its-call
  encoded_at:
  - src/shared/services/connector-placeholder-token.ts
  - src/services/simulation-subject-derivation.ts
  how: This task reaches only the placeholder token-grammar fragment of this rule -- the literal '${kind}'/'${kind:argument}'
    form, the kind/argument split at the first ':', and recognizing a "subject" kind with a non-empty
    argument (this node's own "a placeholder naming a Subject attribute is written ${subject:<attribute-name>},
    with the attribute name as its argument"). That fragment is now declared once, in shared/services/connector-placeholder-token.ts,
    instead of being duplicated inside simulation-subject-derivation.ts, which composes it unchanged.
    Per this task's own Notes (the REMAINDER entry), everything else this rule states -- method/responseMap/statusMap
    validation, the missing-address and malformed query/headers refusal, the unrecognized-kind and missing-argument
    refusal, the unresolvable Subject-attribute-or-credential ending, and the unavailable-ending result-detail
    errors -- is not reached by this task's four criteria and is not touched here; it belongs to the backend
    HTTP connector implementation this task's own Notes already name.
inferences:
- inferred: The new module's file name (connector-placeholder-token.ts), its constant and function names
    (PLACEHOLDER_PATTERN, splitPlaceholderToken, isSubjectPlaceholderToken, SUBJECT_PLACEHOLDER_KIND,
    PLACEHOLDER_ARGUMENT_SEPARATOR), and the choice to expose the split and the subject-kind filter as
    two separate composable functions rather than one function combining both, as this task's own criteria
    describe the three primitives in prose without naming exports.
  from: The backend's own src/http-connector/connector-request-resolver.ts, which already separates splitPlaceholderToken
    from a distinct filter over the split result (isSubjectAttributeToken there) rather than folding both
    into one function -- the same grammar this project's frontend already mirrors, confirmed identical
    by reading that file (simulation-subject-derivation.ts's own pre-existing header comment), and the
    inventory's own statement that a shared module used by more than one feature composes rather than
    re-derives.
preserved:
- simulation-subject-derivation.ts's own exported surface (DerivedSubjectField, collectionPlanFromManifest,
  subjectPlaceholderNamesInConfiguration, deriveRequiredFields) stays observably identical -- proven by
  simulation-subject-derivation.spec.ts and use-simulation-subject.spec.ts passing unchanged.
- subjectPlaceholderNamesInConfiguration's defensive empty read for configuration text that is not valid
  JSON, or that parses to something other than a plain object.
- use-simulation-subject.ts's own import of deriveRequiredFields from simulation-subject-derivation.ts
  stays the only import path into that module; nothing about its public surface changed.
---

## What it is
The subject-placeholder parsing primitives simulation-subject-derivation.ts already implemented -- the placeholder regex, the kind/argument split at the first ':', and the filter keeping only kind === "subject" -- moved to a new, feature-neutral module, src/shared/services/connector-placeholder-token.ts. simulation-subject-derivation.ts now imports and composes these primitives rather than declaring them itself; its own exported behavior is unchanged, proven by its own existing specs passing unchanged.

## Notes
No frontend/app/src/shared/services/ directory existed before this task; it is new territory this task creates, as the plan's own inventory already recorded.
This worktree's frontend/tui submodule was not checked out and its own frontend/frontend/node_modules was not installed when this delivery began -- both are environment setup this task's own build depends on but that no criterion or node addresses; `git submodule update --init --recursive frontend/tui` and a separate `npm install`/`npm ci` inside frontend/tui/frontend were run once, outside the registry's own declared steps, to bring this worktree's checkout to the state every other delivery in this project's history already assumed (confirmed by an earlier build run recorded elsewhere in this delivery root that passed against the same submodule). Recorded here because it is not this task's own knowledge encoded in source, and a reader of the run history should not read the first build's failure (run/connector-test-panel-placeholder-attributes-extract-connector-placeholder-parsing-build and -build-2, both failed on typecheck) as this delivery's own defect.
