---
title: citation-validation.ts's parseJsonOrUndefined and isPlainObject become importable
summary: citation-validation.ts's own private parseJsonOrUndefined and isPlainObject functions are exported,
  with no change to their own behavior or to any of citation-validation.ts's own existing call sites.
rationale: This task implements no specification node — which module exports a JSON-parsing helper is
  not a domain fact. It is cut ahead of and separate from the two files that will import these helpers
  because widening citation-validation.ts's own exported surface is one change, and each later file replacing
  its own duplicate declaration with an import is a separate change to a separate consumer.
sources:
- intake/standard-conformance-arc01-mnt03.md
objective: citation-validation.ts's own parseJsonOrUndefined and isPlainObject become exported, with no
  change to either function's own behavior or to declaredFieldsOf's own existing behavior.
criteria:
- citation-validation.ts's parseJsonOrUndefined is exported, still parsing text as JSON and answering
  undefined rather than throwing where the text is not valid JSON.
- citation-validation.ts's isPlainObject is exported, still answering whether a parsed value is a non-null,
  non-array object.
- declaredFieldsOf's own existing behavior in citation-validation.ts is unchanged.
- citation-validation.ts's own existing unit spec passes with no assertion or outcome changed.
- npm run typecheck exits 0 for the whole backend target source root.
---

## What it is
Two functions that already exist in citation-validation.ts, now exported rather than module-private, with nothing else in the file changed.

## Notes
None.
