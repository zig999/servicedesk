---
target: backend
title: Judgment prompt rendering already carries path-shaped field names verbatim
summary: Verified that anthropic-hypothesis-evaluator.adapter.ts existing field-rendering code passes
  FieldSemantics.name, type and description through unmodified and reads nothing beyond the given evidence
  item, so a path-shaped name such as installations[].state already renders exactly and the file needed
  no change.
task: sha256:c0b26869b61546ee71dbdd62f9249dacf9fe465b093fc1f3462e82cc5151bc4b
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/recursive-output-schema-field-paths-judgment-prompt-carries-path-names-build
files:
- path: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  effect: Unchanged. fieldElement() writes field.name into the <field name="..."> attribute via escapeForXmlAttribute
    with no splitting or reshaping, so a path such as installations[].state comes through exactly as the
    snapshot carries it; the same function emits the type attribute and description text only when the
    FieldSemantics snapshot carries them, independently of each other. buildUserPrompt/evidenceBlock/itemBlock/fieldsBlock
    read only the EvidenceItem[] passed into evaluate(), and the module imports nothing from field-semantics.ts
    beyond the FieldSemantics type and nothing from any capability-registry module.
criteria:
- criterion: An evidence item snapshotting a field named installations[].state renders a field element
    whose declared name is exactly installations[].state.
  met: true
  how: fieldElement() sets the name attribute to escapeForXmlAttribute(field.name) with no transformation
    of the string; escapeForXmlAttribute only rewrites &, <, > and ", none of which a path like installations[].state
    contains.
- criterion: A rendered field carries the type its own snapshot carries, where the snapshot carries one.
  met: true
  how: fieldElement()'s typeAttribute is present exactly when that field's own snapshot carries a type,
    independent of whether name is flat or path-shaped.
- criterion: A rendered field carries the description its own snapshot carries, where the snapshot carries
    one.
  met: true
  how: fieldElement()'s description is present exactly when that field's own snapshot carries a description,
    rendered as the element's text content.
- criterion: The prompt carries no output schema text and no other output-schema content beyond the field
    semantics the evidence item snapshotted.
  met: true
  how: buildUserPrompt/evidenceBlock/itemBlock/fieldsBlock read only properties already present on the
    given EvidenceItem; the file imports only the FieldSemantics type from field-semantics.js, never fieldSemanticsOf
    or any output_schema string.
- criterion: Prompt assembly makes no read of the capability registry.
  met: true
  how: The module's imports carry no capability-registry import anywhere, and evaluate()/buildUserPrompt()
    take criterion, evidence and caseContext purely as parameters with no lookup performed.
nodes:
- node: constraints/the-judgment-prompt-is-closed
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  how: itemBlock/fieldsBlock/fieldElement admit exactly the content this invariant lists, plus buildUserPrompt's
    criterion/current_instant/case title/when_to_use, and requestJudgment() issues the provider call with
    no tools field. None of this grew when field names became paths.
- node: rules/investigation/judgment-reads-the-evidence-snapshot
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  how: evaluate() and buildUserPrompt() read field name/type/description only from the EvidenceItem[]
    passed in, built upstream at collection time from the persisted snapshot, and make no live read of
    the glossary or capability registry from this file.
- node: domain/investigation/field-semantics
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  how: fieldElement renders exactly the value-object's own three attributes with no reinterpretation,
    so whatever path a FieldSemantics element's name now carries flows into the prompt as that same opaque
    string.
---

## What it is

Verification that the judgment prompt's existing rendering already carries a path-shaped field name unchanged -- no source edit was needed, since the rendering treats a field's name as an opaque string throughout.

## Notes

No file was modified for this task; the build run below is captured to confirm the unchanged tree still builds and passes, exactly as a delivery of no diff still must.
