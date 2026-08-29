---
title: Duplicated JSON-guard helpers across investigation/ adapters
summary: field-semantics.ts and anthropic-hypothesis-evaluator.adapter.ts each declare a byte-identical
  parseJsonOrUndefined/isPlainObject (or isRecord) pair already declared in citation-validation.ts, and
  the same guard shape recurs independently in at least five more files outside investigation/.
area:
- src/investigation
modules:
- name: citation-validation
  path: src/investigation/citation-validation.ts
  role: touched
- name: field-semantics
  path: src/investigation/field-semantics.ts
  role: touched
- name: anthropic-hypothesis-evaluator-adapter
  path: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  role: touched
- name: evidence-collection-stage
  path: src/investigation/evidence-collection-stage.ts
  role: depends-on
- name: judgment-stage
  path: src/investigation/judgment-stage.ts
  role: depends-on
- name: http-declarative-observation-source-adapter
  path: src/investigation/http-declarative-observation-source.adapter.ts
  role: depends-on
conventions:
- statement: 'field-semantics.ts''s own header comment states its duplicate parseJsonOrUndefined/isPlainObject
    are a deliberate, already-recorded independence decision (''this task''s own inference, recorded in
    the delivery record''), not an oversight: it names itself ''the third structural output_schema reader
    in this codebase, deliberately independent of ... declaredFieldsOf and ... declaredInputSchemaShape
    ... rather than importing either'' and its own isPlainObject docstring repeats ''restated here rather
    than imported (this module''s own deliberate independence, see this file''s own header)''.'
  seen_at: src/investigation/field-semantics.ts
- statement: 'anthropic-hypothesis-evaluator.adapter.ts''s own parseJsonOrUndefined docstring likewise
    frames its duplication as a documented adaptation (''the same discipline citation-validation.ts''s
    own parseJsonOrUndefined keeps''), and its own version differs in behavior, not just name: it first
    strips a wrapping markdown code fence before JSON.parse, which citation-validation.ts''s and field-semantics.ts''s
    versions do not do.'
  seen_at: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
- statement: 'The identical non-null/non-array-object guard recurs, independently named isPlainObject
    or isRecord, in at least five files outside investigation/ as well: http-connector/connector-request-resolver.ts,
    http-connector/response-path-extractor.ts, case/parse-case-document.ts, capability-registry/capability-input-schema-shape.ts,
    connector-registry/connector-configuration-registry.service.ts — none of them named by this scope''s
    findings.'
  seen_at: src/http-connector/connector-request-resolver.ts
must_not_duplicate:
- what: parseJsonOrUndefined — parse-and-swallow of a JSON string, answering undefined rather than throwing
  at: src/investigation/citation-validation.ts
- what: isPlainObject — the non-null, non-array Record<string, unknown> guard
  at: src/investigation/citation-validation.ts
risks:
- risk: citation-validation.ts's own parseJsonOrUndefined/isPlainObject are private (unexported) module-local
    functions; consolidating field-semantics.ts's and anthropic-hypothesis-evaluator.adapter.ts's copies
    onto them requires exporting them from citation-validation.ts (or extracting a shared module), which
    changes citation-validation.ts's own public surface and the module every future duplicate-checker
    in this tree would then point at.
  consumers:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/judgment-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- risk: anthropic-hypothesis-evaluator.adapter.ts's own parseJsonOrUndefined is not behaviorally identical
    to citation-validation.ts's and field-semantics.ts's — it strips a markdown code fence first — so
    a naive consolidation of parseJsonOrUndefined across all three would silently change this adapter's
    own fence-tolerant parsing (or field-semantics.ts's/citation-validation.ts's own fence-intolerant
    parsing) unless the consolidation keeps the fence-stripping step local to the adapter and only unifies
    isPlainObject/isRecord, the guard the finding's own wording (finding 4) in fact confines itself to.
  consumers:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
sources:
- intake/standard-conformance-arc01-mnt03.md
---

## What it is
citation-validation.ts's own private parseJsonOrUndefined and isPlainObject, and the two later byte-identical (isPlainObject) or near-identical (parseJsonOrUndefined) copies the scope's findings 3 and 4 name in field-semantics.ts and anthropic-hypothesis-evaluator.adapter.ts.
Both duplicate sites carry their own header/docstring comments stating the duplication was a deliberate, already-recorded design choice rather than an accident, which the decomposition will need to reconcile against MNT-03's demand to consolidate.

## Notes
anthropic-hypothesis-evaluator.adapter.ts's parseJsonOrUndefined is not byte-identical to the other two — only its isRecord guard is, matching finding 4's own narrower wording ("a third independent copy of the same ... guard") rather than finding 3's wording about field-semantics.ts's two helpers.
The same guard shape independently recurs at five more sites outside investigation/ that this scope's findings do not name; consolidating only the three investigation/ sites is consistent with the scope as stated, but the broader duplication exists and is visible to anyone auditing MNT-03 across the tree.
