---
title: anthropic-hypothesis-evaluator.adapter.ts imports citation-validation.ts's isPlainObject in place
  of its own isRecord
summary: anthropic-hypothesis-evaluator.adapter.ts's own isRecord function is removed and its call sites
  import citation-validation.ts's exported isPlainObject instead; its own fence-stripping parseJsonOrUndefined
  is left declared locally, exactly as it is.
rationale: This task implements no specification node — finding 4 names a duplicated guard function, and
  duplication is a code-quality fact, not a domain fact. It depends on export-shared-json-guards because
  it consumes what that task exports, and it is cut separately from the field-semantics.ts task because
  it is a different file with its own unit spec, independently demonstrable without that task. Finding
  4's own wording names only "the same ... guard" (isRecord), narrower than finding 3's wording about
  field-semantics.ts's two helpers, and the inventory's own risk note records that this adapter's parseJsonOrUndefined
  differs behaviorally (it strips a markdown code fence first); this task's own criteria keep that function
  untouched for that reason.
sources:
- intake/standard-conformance-arc01-mnt03.md
objective: anthropic-hypothesis-evaluator.adapter.ts no longer declares its own isRecord, importing citation-validation.ts's
  own exported isPlainObject in its place at every call site, with its own parseJsonOrUndefined and every
  other function's own behavior unchanged.
criteria:
- anthropic-hypothesis-evaluator.adapter.ts no longer declares its own isRecord function.
- anthropic-hypothesis-evaluator.adapter.ts imports isPlainObject from citation-validation.ts and uses
  it at every site that called isRecord.
- anthropic-hypothesis-evaluator.adapter.ts's own parseJsonOrUndefined is unchanged — still declared locally,
  still stripping a wrapping markdown code fence before JSON.parse.
- parseJudgment's and isCitation's own existing behavior is unchanged — the existing suite passes with
  no assertion or outcome changed.
- npm run typecheck exits 0 for the whole backend target source root.
depends_on:
- task/investigation-json-guard-consolidation/export-shared-json-guards
---

## What it is
anthropic-hypothesis-evaluator.adapter.ts's own isRecord replaced by an import of citation-validation.ts's isPlainObject, with the adapter's own fence-stripping JSON parser left exactly as it is.

## Notes
None.
