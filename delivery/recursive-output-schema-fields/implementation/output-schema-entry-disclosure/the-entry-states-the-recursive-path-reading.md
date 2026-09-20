---
target: frontend
title: Recursive-path reading stated at the Output schema entry
summary: Rewrites the Output-schema disclosure paragraph to state the full recursive path through every
  nested properties object and items schema, in place of the top-level-only reading it stated before.
task: sha256:afef26efe4507c3d5c1bee05701ee21d0a64b973942cb48016023b1c6b9a01f0
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/output-schema-entry-disclosure-the-entry-states-the-recursive-path-reading-build
files:
- path: src/routes/capability-form-fields.tsx
  effect: 'Replaces the <p className="text-sm text-muted-foreground"> beside the JsonCodeEditorField with
    id="output_schema" (same position, same classes, same div) with six sentences stating: what is entered
    is JSON; field names are the paths through the schema own top-level properties object and every properties
    object and items schema reachable beneath it; how such a path is built (an object own key joined onto
    its parent path with a dot, an array own items joined with brackets, described in prose with no literal
    dot or bracket characters used as a worked example); that the type and description declared at the
    node each path reaches, where the schema states them, are read as that field declared semantics; that
    no other content is read or validated; and that a description states meaning and names no decision.
    Carries no concrete field name, path or schema snippet, and none of the forbidden-vocabulary terms.'
criteria:
- criterion: The paragraph states that the field names read from the entered schema are the paths through
    its own top-level properties object and every properties object and items schema reachable beneath
    it.
  met: true
  how: Sentence 2 states this near-verbatim from the covering rule's own statement.
- criterion: The paragraph states how such a path is built -- each object's own key joined onto its parent's
    path with a dot, and an array's own items joined with brackets.
  met: true
  how: Sentence 3 states the concatenation rule in prose, describing "ponto" and "colchetes" without using
    the literal characters as a worked example.
- criterion: The paragraph states that what is entered there is JSON.
  met: true
  how: Sentence 1, unchanged from the prior implementation's own wording.
- criterion: The paragraph states that the type and description declared at the node each path reaches,
    where the schema states them, are read as that field's declared semantics.
  met: true
  how: Sentence 4, rewritten to say "no nó que cada caminho alcança" rather than "por cada uma dessas
    chaves de nível superior".
- criterion: The paragraph states that no other content of the entered schema is read or validated.
  met: true
  how: Sentence 5, unchanged from the prior wording.
- criterion: The paragraph states that a description entered there states what its value means and names
    no decision.
  met: true
  how: Sentence 6, unchanged from the prior wording.
- criterion: The paragraph makes no claim about what an entered output schema is read for beyond those
    already held by domain/investigation/field-semantics, rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema
    and rules/glossary/a-description-states-meaning-never-policy.
  met: true
  how: Every sentence maps onto one of the five claims those three nodes hold; six sentences carry exactly
    those five claims (the path claim split across two sentences), adding nothing else.
- criterion: The paragraph carries no worked example of its own -- no concrete field name, path, or schema
    snippet illustrating the path grammar.
  met: true
  how: No digits, no braces, and no concrete field name or path appears anywhere; only the generic JSON
    Schema vocabulary (properties, items, type, description) the covering nodes themselves use to state
    the rule abstractly.
- criterion: The paragraph contains none of the following, in Portuguese or English -- recusa, rejeição,
    erro, inválido, obrigatório, verificação, checagem, somente leitura, read-only, natureza -- the vocabulary
    the surface own existing disclosure test already forbids.
  met: true
  how: None of the terms or their stems appear anywhere in the new wording.
- criterion: The paragraph renders with the same text beside the Output schema entry on the capability
    create screen and on the capability detail screen.
  met: true
  how: Both screens compose the single shared CapabilityFormFields component and its one <p>; no second
    copy exists anywhere.
- criterion: An output schema declaring its properties only beneath a nested items schema is not refused
    by this surface.
  met: true
  how: JsonCodeEditorField's validity (and Save's enabled state) is decided purely by JSON.parse success,
    never by walking the schema's structure, so this shape was never refused and the copy change does
    not touch that logic.
- criterion: An output schema whose nested node carries neither type nor description is not refused by
    this surface.
  met: true
  how: Same reasoning as the prior criterion -- validity is JSON-syntax-only.
nodes:
- node: rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it
  encoded_at:
  - src/routes/capability-form-fields.tsx
  how: The five claims this rule requires the entry to state are exactly the six sentences the paragraph
    now carries, with no refusal or check added anywhere in the surface.
- node: rules/integration/an-output-schema-entrys-statement-carries-no-sixth-claim
  encoded_at:
  - src/routes/capability-form-fields.tsx
  how: The paragraph adds no claim beyond the three bound nodes and carries no worked example of its own.
- node: rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema
  encoded_at:
  - src/routes/capability-form-fields.tsx
  how: The paragraph now states the recursive-walk path definition and its concatenation grammar (dot
    for an object own key, brackets for an array own items) this rule holds, in place of the prior top-level-only
    reading.
inferences:
- inferred: Six sentences (splitting the recursive-path claim across two sentences -- what the path is,
    and how it is built) rather than five, since the previous five-sentence shape is form the task Notes
    say may change.
  from: The task's own Notes -- "the paragraph's five-sentence shape ... is form the previous implementation
    chose and disclosed, not facts the covered rules hold; a rewrite may keep or change the sentence count
    as long as no sixth claim appears."
deferred:
- what: The collection-time recursive walk into domain/investigation/field-semantics itself, and the clauses
    of a-field-semantics-name-is-its-path-through-the-output-schema this surface-disclosure task does
    not reach.
  why: The task's own Notes mark this REMAINDER, belonging to the task implementing the collection-time
    walk (already delivered in the backend), not this surface-disclosure task.
---

## What it is

The disclosure paragraph beside the Output schema entry, rewritten from the top-level-only reading the specification no longer holds to the recursive path reading it now holds.

## Notes

The existing spec file pinning this paragraph's wording sentence-by-sentence still pins the OLD wording as of this record; it is deliberately left untouched here and rewritten separately, since it is this task's own proof and this record is not the place two producers' work merges.
