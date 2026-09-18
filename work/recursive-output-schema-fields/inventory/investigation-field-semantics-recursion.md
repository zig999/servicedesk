---
title: Investigation module — field-semantics recursive path reading
summary: The investigation domain module under src/src/investigation, where output_schema field naming
  is read for both citation validation and hypothesis-judgment prompts.
sources:
- work/recursive-output-schema-fields/intake/scope.md
area:
- src/src/investigation
modules:
- name: field-semantics
  path: src/src/investigation/field-semantics.ts
  role: touched
- name: citation-validation
  path: src/src/investigation/citation-validation.ts
  role: depends-on
- name: anthropic-hypothesis-evaluator-adapter
  path: src/src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  role: touched
- name: hypothesis-evaluator-port
  path: src/src/investigation/hypothesis-evaluator.port.ts
  role: depends-on
- name: evidence-collection-stage
  path: src/src/investigation/evidence-collection-stage.ts
  role: depends-on
- name: judgment-stage
  path: src/src/investigation/judgment-stage.ts
  role: depends-on
- name: evidence
  path: src/src/investigation/evidence.ts
  role: depends-on
- name: citation
  path: src/src/investigation/citation.ts
  role: depends-on
- name: http-declarative-observation-source-adapter
  path: src/src/investigation/http-declarative-observation-source.adapter.ts
  role: adjacent
conventions:
- statement: fieldSemanticsOf reads only the top-level properties object of a parsed output_schema today
    (Object.entries(parsed.properties)), returning FieldSemantics entries with optional type/description
    carried only when each is itself a string.
  seen_at: src/src/investigation/field-semantics.ts
- statement: field-semantics.ts imports its JSON-guard helpers (parseJsonOrUndefined, isPlainObject) from
    citation-validation.ts rather than declaring its own, and the spec asserts it never imports declaredFieldsOf
    from citation-validation.ts or anything from capability-input-schema-shape.ts, keeping its own structural
    reading of output_schema independent of both.
  seen_at: src/src/__tests__/unit/investigation/field-semantics.spec.ts
- statement: declaredFieldsOf in citation-validation.ts is a separate, still top-level-only reader (Object.keys(parsed.properties))
    used only by observationOf in http-declarative-observation-source.adapter.ts to filter what an HTTP
    observation carries against responseMap coverage -- a different purpose (load/coverage) than citation
    naming, and scope.md records this file as deliberately left alone.
  seen_at: src/src/investigation/citation-validation.ts
- statement: Judgment-time citation validation (isCitationValid/acceptedCitations, invoked from judgment-stage.ts)
    checks a citation field against the persisted Evidence.fields snapshot (FieldSemantics.name) captured
    at evidence-collection time via evidence-collection-stage.ts calling fieldSemanticsOf(capability.output_schema)
    -- not against the schema afresh -- so field-semantics.ts own output shape is what both the prompt
    and later citation acceptance key on.
  seen_at: src/src/investigation/judgment-stage.ts
- statement: anthropic-hypothesis-evaluator.adapter.ts renders each EvidenceItem fields into a flat <fields><field
    name=... type=...>description</field></fields> block per item, with no path nesting today; SYSTEM_PROMPT
    tells the model a citation field must be copied exactly from one of that item own <field> names.
  seen_at: src/src/investigation/anthropic-hypothesis-evaluator.adapter.ts
- statement: FieldSemantics is a flat type -- { name, type?, description? } -- reused identically by EvidenceItem.fields
    (hypothesis-evaluator.port.ts) and Evidence.fields (evidence.ts), and persisted as JSON in the fields
    column by relational-investigation-store.repository.ts.
  seen_at: src/src/investigation/hypothesis-evaluator.port.ts
must_not_duplicate:
- what: parseJsonOrUndefined and isPlainObject JSON-guard helpers
  at: src/src/investigation/citation-validation.ts
- what: The FieldSemantics type and its name/type/description shape, shared across EvidenceItem and Evidence
  at: src/src/investigation/field-semantics.ts
risks:
- risk: Changing fieldSemanticsOf output name grammar (to a recursive path like installations[].state)
    changes the field names persisted in Evidence.fields and rendered in the judgment prompt <field name=...>;
    the prompt and citation acceptance must key on the new names consistently.
  consumers:
  - src/src/investigation/judgment-stage.ts
  - src/src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/src/persistence/relational-investigation-store.repository.ts
- risk: citation-validation.ts declaredFieldsOf must stay top-level-only (it serves a different purpose
    -- HTTP observation payload filtering against responseMap coverage) even though it lives beside the
    function fieldSemanticsOf recursion changes; the spec test explicitly forbids field-semantics.ts importing
    declaredFieldsOf, so the two must diverge in behavior deliberately, not by oversight.
  consumers:
  - src/src/investigation/http-declarative-observation-source.adapter.ts
---

## What it is

This is the single territory the scope names: the investigation domain module, where fieldSemanticsOf currently reads only top-level output_schema properties and must be extended to read recursively (properties/items) producing dotted/bracket paths such as installations[].state.
The same module holds citation-validation.ts, whose separate declaredFieldsOf function must remain untouched because it serves observation-payload coverage, not citation naming, per scope.md's explicit list of files left intentionally alone.
The judgment prompt builder (anthropic-hypothesis-evaluator.adapter.ts) and the persisted Evidence.fields snapshot (evidence.ts, evidence-collection-stage.ts, relational-investigation-store.repository.ts) are downstream consumers of fieldSemanticsOf's output shape and must accept the new path-shaped names.
The frontend equivalent (capability-form-fields.tsx) is explicitly out of scope per scope.md, since this plan targets backend (src) only.

## Notes

scope.md records that the specification nodes for this change were already written and validated by /analyse in commit 3e7ce67a this same session, so this survey treats that specification work as given context rather than something to re-derive.
field-semantics.spec.ts already encodes two structural-independence assertions (no import of declaredFieldsOf, no import of capability-input-schema-shape) that any recursive implementation must keep satisfying, since a task that adds imports contradicting these existing spec assertions would conflict with checked-in intent.
No existing recursive path-building helper (for array items tuples, dot/bracket concatenation, or dynamic-key rejection) was found elsewhere in src/src/investigation or src/src/capability-registry; capability-input-schema-shape.ts was checked and is a distinct, independently-scoped module, not a reusable recursion helper to draw from.
