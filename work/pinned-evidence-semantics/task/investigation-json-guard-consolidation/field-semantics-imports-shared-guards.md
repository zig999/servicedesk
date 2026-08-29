---
title: field-semantics.ts imports citation-validation.ts's parseJsonOrUndefined and isPlainObject
summary: field-semantics.ts's own byte-identical parseJsonOrUndefined and isPlainObject declarations are
  removed, its own call sites import citation-validation.ts's exported versions instead, and its header/docstring
  comments claiming a deliberate independence from them are corrected to match.
rationale: This task implements no specification node — finding 3 names a duplication between two files,
  and duplication is a code-quality fact, not a domain fact. It depends on export-shared-json-guards because
  it consumes what that task exports, and it is cut separately from the anthropic-hypothesis-evaluator.adapter.ts
  task because it is a different file with its own unit spec, independently demonstrable without that
  task.
sources:
- intake/standard-conformance-arc01-mnt03.md
objective: field-semantics.ts no longer declares its own parseJsonOrUndefined or isPlainObject, importing
  citation-validation.ts's own exported versions instead, with fieldSemanticsOf's and fieldSemanticsFrom's
  own existing behavior unchanged.
criteria:
- field-semantics.ts no longer declares its own parseJsonOrUndefined function.
- field-semantics.ts no longer declares its own isPlainObject function.
- field-semantics.ts imports parseJsonOrUndefined and isPlainObject from citation-validation.ts.
- field-semantics.ts's own header comment and its own isPlainObject-adjacent docstring no longer describe
  restating these helpers as a deliberate independence from citation-validation.ts, since it now imports
  them.
- fieldSemanticsOf's and fieldSemanticsFrom's own existing behavior is unchanged — the existing suite
  passes with no assertion or outcome changed.
- npm run typecheck exits 0 for the whole backend target source root.
depends_on:
- task/investigation-json-guard-consolidation/export-shared-json-guards
---

## What it is
field-semantics.ts's two duplicate helpers replaced by an import of citation-validation.ts's own, and the file's own comments describing the duplication as deliberate corrected to describe the import instead.

## Notes
None.
