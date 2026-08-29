---
title: Investigation's JSON-parse-and-guard helpers converge on one declaration
summary: citation-validation.ts's own private parseJsonOrUndefined and isPlainObject become importable,
  and field-semantics.ts's byte-identical pair and anthropic-hypothesis-evaluator.adapter.ts's byte-identical
  isRecord guard are replaced by imports of them, with anthropic-hypothesis-evaluator.adapter.ts's own
  fence-stripping parseJsonOrUndefined left exactly as it is.
rationale: The scope names two MNT-03 findings against two different files, both duplicating citation-validation.ts's
  own pre-existing private helpers. The inventory's own risk note records that citation-validation.ts's
  helpers are unexported, so consolidating requires exporting them first — a change to what citation-validation.ts's
  own module exposes, which its own two later consumers depend on rather than share the same breath with,
  so exporting is cut as its own task ahead of both consumer tasks. The two consumer tasks stay separate
  because they are two different files, two different findings (finding 3's exact-duplicate pair versus
  finding 4's narrower "guard only" wording), and each independently demonstrable without the other. `covers`
  names the two architecture-constraint nodes this scope's own situate step read as the closest candidates
  before finding neither governs either finding; both are declared entirely `uncovered` because the specification
  is silent on which module declares a JSON-parsing helper, and this epic's tasks are a standard-conformance/code-quality
  correction, not a domain fact.
covers:
- constraints/the-system-persists-to-one-relational-database
- constraints/the-domain-depends-on-no-infrastructure
uncovered:
- node: constraints/the-system-persists-to-one-relational-database
  why: This constraint states where a record lands and through which connection; none of this epic's tasks
    touch how or where a record is stored — they consolidate the declaration site of a helper that parses
    a string already in memory, a concern this constraint's own statement and fitness (no file-backed
    store, one connection per record) does not reach.
- node: constraints/the-domain-depends-on-no-infrastructure
  why: This constraint states that the domain layer imports no framework, driver or provider client, reaching
    infrastructure only through ports. The parseJsonOrUndefined/isPlainObject/isRecord helpers this epic's
    tasks consolidate parse a string already in memory into a plain object; no task adds or removes an
    import of a driver, a framework or a provider client in any file it touches — consolidating which
    of three identical declarations is the one importable copy changes no module's dependency on infrastructure.
sources:
- intake/standard-conformance-arc01-mnt03.md
---

## What it is
citation-validation.ts's own parseJsonOrUndefined and isPlainObject becoming importable, and field-semantics.ts's and anthropic-hypothesis-evaluator.adapter.ts's own duplicate declarations replaced by imports of them.
anthropic-hypothesis-evaluator.adapter.ts's own parseJsonOrUndefined, which strips a markdown code fence before parsing, is left declared locally and untouched — only its isRecord guard, byte-identical to isPlainObject, is consolidated.

## Notes
The identical non-null/non-array-object guard also recurs, independently named isPlainObject or isRecord, in at least five files outside investigation/ (http-connector/connector-request-resolver.ts, http-connector/response-path-extractor.ts, case/parse-case-document.ts, capability-registry/capability-input-schema-shape.ts, connector-registry/connector-configuration-registry.service.ts); this epic's tasks touch only the three investigation/ sites the scope's two findings name, and those five sites are left exactly as they are — a follow-up scope may want the same consolidation extended to them.
