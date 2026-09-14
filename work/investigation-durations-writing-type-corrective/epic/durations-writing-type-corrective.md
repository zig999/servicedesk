---
title: IInvestigationRow's durations_writing matches its conditional presence
summary: The one corrective task retyping durations_writing as optional/nullable in the integration test's
  own row-reading type.
rationale: A corrective increment cuts no epic through survey/decomposition — this is the structural container
  the validator still requires, holding exactly the one task's own claim, seeded from trace.py --encodes
  over src/__tests__/integration/factories/diagnose-server.factory.spec.ts.
sources:
- work/investigation-durations-writing-type-corrective/intake/corrective-durations-writing-type.md
covers:
- domain/investigation/durations
- domain/knowledge/hypothesis-revision
- domain/knowledge/hypothesis-revision-state
- rules/investigation/a-measured-duration-below-one-millisecond-is-zero
- rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
- rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
uncovered:
- node: domain/knowledge/hypothesis-revision
  why: Unrelated to durations_writing's type; this file's use of that element is unchanged by this correction.
- node: domain/knowledge/hypothesis-revision-state
  why: Unrelated to durations_writing's type; unchanged by this correction.
- node: rules/investigation/a-measured-duration-below-one-millisecond-is-zero
  why: Governs a different fact (a measured duration below 1ms reads as zero) than whether durations_writing
    may be absent; unchanged by this correction.
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  why: Unrelated to durations_writing's type; unchanged by this correction.
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  why: Unrelated to durations_writing's type; unchanged by this correction.
---
## What it is
The one corrective task retyping IInvestigationRow's durations_writing field.

## Notes
None.
