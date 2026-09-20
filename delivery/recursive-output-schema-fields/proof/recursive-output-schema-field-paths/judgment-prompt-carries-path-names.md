---
target: backend
title: Judgment prompt renders a path-shaped field name unchanged
summary: Proves the five rendering criteria for path-shaped and ordinary field names against the unmodified
  anthropic-hypothesis-evaluator.adapter.ts, adding the one test the existing suite lacked -- a path-shaped
  name such as installations[].state rendered verbatim.
implementation: sha256:dfc966dd140ff8b789e4b9b5de2d89f761ac89f1db5b96bd45ae646462e287eb
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/recursive-output-schema-field-paths-judgment-prompt-carries-path-names-suite
tests:
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: renders a path-shaped field name exactly as its own evidence item carries it, with no splitting
    or reinterpretation of the path syntax
  proves: An evidence item snapshotting a field named installations[].state renders a field element whose
    declared name is exactly installations[].state.
  fails_when: the rendered field element for a field named installations[].state is anything other than
    exactly the expected <field name="installations[].state" ...> element -- e.g. the path is split on
    . or [], escaped beyond the four reserved XML characters, or otherwise reinterpreted rather than carried
    through opaque.
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: renders each evidence item's own field semantics as its own <field> elements inside its own <fields>,
    each carrying its own name plus its own type attribute and description text exactly where the snapshot
    declared them, and never invented where it declared neither
  proves: A rendered field carries the type its own snapshot carries, where the snapshot carries one,
    and carries the description its own snapshot carries, where the snapshot carries one.
  fails_when: field-one's rendered element stops carrying exactly its own declared type and description
    together, or field-two -- whose snapshot declares neither -- gains an invented type attribute or description
    text.
  demonstrates: domain/investigation/field-semantics
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: renders each evidence item's own field semantics as its own <field> elements inside its own <fields>,
    each carrying its own name plus its own type attribute and description text exactly where the snapshot
    declared them, and never invented where it declared neither
  proves: The prompt carries no output schema text and no other output-schema content beyond the field
    semantics the evidence item snapshotted.
  fails_when: the rendered prompt leaks raw output-schema text -- the assertion that content never contains
    the literal string properties stops holding.
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: renders each evidence item's own field semantics as its own <field> elements inside its own <fields>,
    each carrying its own name plus its own type attribute and description text exactly where the snapshot
    declared them, and never invented where it declared neither
  proves: Prompt assembly makes no read of the capability registry.
  fails_when: field-two, whose own snapshot declares neither type nor description, renders with either
    invented -- the only way that could happen is content sourced from somewhere other than that field
    own snapshot, such as a live capability-registry lookup.
not_applicable:
- edge_case: Two operations against one subject at once (concurrency)
  why: buildUserPrompt/evidenceBlock/itemBlock/fieldsBlock/fieldElement are pure functions of their own
    parameters with no shared mutable state across calls.
- edge_case: A dependency that fails or answers slowly
  why: None of this task's five criteria concern the provider call or its failure handling; prompt assembly
    itself reads no dependency.
- edge_case: An operation attempted against state that forbids it
  why: Prompt rendering is a stateless transformation of a given EvidenceItem[] and CaseContext.
- edge_case: A duplicate where uniqueness is claimed
  why: No criterion here claims uniqueness over field names or evidence items.
- edge_case: An absent, empty, or malformed field-name path
  why: How a field own name comes to be a path is produced by the snapshotting step the sibling task owns;
    this task takes the snapshotted name as given and only renders it.
untested:
- 'constraints/the-judgment-prompt-is-closed: no finite test decides this closure whole. ''No other content
  beyond this list'' is a totality over content nothing enumerates; a byte-exact golden-output test would
  bind to the implementation''s chosen order and formatting rather than to the content the fact actually
  admits. The closure is instead evidenced by a constellation of distinct tests already in the suite,
  none of which decides the invariant as a whole; this task''s own criteria reach only the field-semantics
  slice of it.'
- 'rules/investigation/judgment-reads-the-evidence-snapshot: the ''reads only ... never re-reads the glossary
  or the capability registry'' fact is a totality over an absence, and this adapter is wired with no glossary
  or capability-registry dependency to vary at runtime -- no behavioral test can distinguish ''no read
  occurs'' from ''nothing is wired to read from'' without asserting on the module''s own imports.'
- 'The task''s own UNDERDETERMINED note (that an implementation could satisfy these five criteria while
  dropping observed_at, ttl, concept_description, capability_payload_notes, current_instant, case title/when_to_use
  or the no-tools guarantee) names nothing this proof must additionally test: this task made no source
  change, so whatever already covers that remaining content in the tree from the delivery that introduced
  it is what still holds it, not this proof.'
---

## What it is

Tests proving the judgment prompt already renders a path-shaped field name correctly, with no source change needed, plus citation of the pre-existing tests that already decide type/description carry-through, schema-content closure and registry-absence.

## Notes

Three proof-table rows share one test body, since that single test demonstrates three of the five criteria together (type/description carry-through, schema-content closure, and registry-absence via the untouched field).
