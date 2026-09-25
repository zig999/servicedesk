---
target: frontend
title: Restore the Output schema entry's guidance paragraph
summary: Reinserted the removed six-sentence guidance paragraph beside the Output schema JSON code editor
  in CapabilityFormFields, restoring the five system-reads claims and no sixth.
task: sha256:66ebff250cdd08c726bc0e9f11f3b8c7f218813b75417f71b1bbee38568f469b
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/output-schema-guidance-restoration-full
files:
- path: src/routes/capability-form-fields.tsx
  effect: restored the <p className="text-sm text-muted-foreground"> guidance paragraph beside the output_schema
    JsonCodeEditorField, inside the same wrapper div, immediately before CapabilitySchemaHelperFields
    -- the exact text and placement commit f3d4778a removed, stating that entered content is JSON, that
    field names are paths through top-level and nested properties/items, how that path is concatenated,
    that a reached node's type and description are read as declared semantics, that nothing else in the
    schema is read or validated, and that a description states meaning and names no decision
criteria:
- criterion: The Output schema entry surface states that what is entered there is JSON.
  met: true
  how: 'restored paragraph''s first sentence: "O que é inserido aqui é JSON."'
- criterion: The Output schema entry surface states that a field's own name is the path through the schema's
    top-level properties object and every properties object and items schema reachable beneath it.
  met: true
  how: 'second sentence: "Os nomes de campo lidos a partir dele são os caminhos através do objeto properties
    de nível superior deste schema e de todo objeto properties e todo schema items alcançável a partir
    dele."'
- criterion: The Output schema entry surface states that a reached node's own type and description, where
    the schema states them, are read as that field's declared semantics.
  met: true
  how: 'fourth sentence: "O type e a description declarados no nó que cada caminho alcança, onde o schema
    os declara, são lidos como a semântica declarada desse campo."'
- criterion: The Output schema entry surface states that no other content of the entered schema is read
    or validated.
  met: true
  how: 'fifth sentence: "Nenhum outro conteúdo deste schema é lido ou validado."'
- criterion: The Output schema entry surface states that a description entered there states what a value
    means and names no decision.
  met: true
  how: 'sixth sentence: "Uma description aqui declara o que seu valor significa e não nomeia nenhuma decisão."'
- criterion: The Output schema entry surface states no claim beyond these five.
  met: true
  how: 'the restored paragraph carries exactly six sentences: the five claim sentences above plus the
    concatenation-grammar sentence ("Esse caminho é construído concatenando...") that the field-name-path
    claim already covers -- the same six sentences the pre-existing test''s CLAIM_PATTERNS enumerates
    and checks every sentence in the paragraph against; no sentence outside that set was added, no worked
    example (no digit, no brace) and no refusal/check/read-only vocabulary appears'
nodes:
- node: rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it
  how: restored paragraph states all five claims the rule's statement enumerates, at the Output schema
    entry, on both the capability create and capability detail screens via the shared CapabilityFormFields
    component; refuses nothing and checks nothing, matching the rule's "s refuses no entry and checks
    no entered content" clause
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/an-output-schema-entrys-statement-carries-no-sixth-claim
  how: restored paragraph's sentences each match one of the six claim patterns the pre-existing test enumerates
    (all traceable to the three bounding nodes this rule names), carries no worked example, and refuses
    nothing -- no sentence beyond what those nodes already hold
  encoded_at:
  - src/routes/capability-form-fields.tsx
inferences:
- inferred: The exact wording and sentence boundaries of the restored paragraph (including the separate
    concatenation-grammar sentence) reproduce the pre-removal text verbatim rather than a fresh restatement.
  from: the task's own reference to git show f3d4778a^ at this same location, cross-checked sentence-by-sentence
    against the current text of rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it,
    rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema, domain/investigation/field-semantics
    and rules/glossary/a-description-states-meaning-never-policy, which the two implemented rules name
    as the only sources for claims two, three and five and for the no-sixth-claim bound -- the historical
    wording matched each of these nodes' current text with no divergence found, so no rewording was needed
- inferred: No other component renders its own copy of this guidance text, so restoring it once in CapabilityFormFields
    is sufficient for identical text on both the capability create screen and the capability detail screen.
  from: grepped frontend/app/src for the guidance text's opening phrase before the edit (only the spec
    file matched) and confirmed both frontend/app/src/routes/capability-create-screen.tsx and frontend/app/src/routes/capability-detail-ready-view.tsx
    compose the same CapabilityFormFields component rather than each rendering its own Output schema field
preserved:
- capability-form-fields.tsx's existing form structure, all other fields (Concept, Name, Version, Nature,
  Timeout, Connector, Payload notes, Input schema), the schema helper fields, the apply-confirmation dialogs
  and the button footer were left untouched -- only the Output schema entry's wrapper div gained the restored
  paragraph
---

## What it is

The Output schema guidance paragraph commit f3d4778a removed from CapabilityFormFields, restored verbatim in the same wrapper div, closing both the pre-existing test's 8 failures and the specification gap the removal opened.

## Notes

None.
