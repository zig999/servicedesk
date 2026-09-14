---
title: IInvestigationRow's durations_writing matches its conditional presence
summary: Retypes durations_writing as optional/nullable in the integration test's own row-reading type.
rationale: 'A /review-change conformance finding over src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  observed that IInvestigationRow types durations_writing as an always-present, non-null number, contradicting
  domain/investigation/durations, which declares writing without required: true — present only when a
  run reaches consolidation.'
sources:
- work/investigation-durations-writing-type-corrective/intake/corrective-durations-writing-type.md
objective: IInvestigationRow's durations_writing field is typed to admit absence, matching domain/investigation/durations's
  own conditional presence for writing.
criteria:
- IInvestigationRow's durations_writing field type admits a value or its absence (optional or nullable),
  never an unconditional number.
- Every existing read of durations_writing in this file that assumed presence is adjusted to read it only
  where the run reached consolidation, or to handle its absence explicitly.
- The file still builds and the full suite still passes.
implements:
- domain/investigation/durations
---
## What it is
IInvestigationRow's durations_writing field stops promising a value domain/investigation/durations does not guarantee.

## Notes
ADVISORY, from the specification — domain/investigation/durations states only that writing is present exactly when a consolidation call happened and absent otherwise; no candidate states how that absence appears in a stored or read-back record row. Criterion 1 accordingly leaves the choice between an optional field and a nullable one open, so either shape satisfies the task and neither is constrained by the specification. If the row shape matters downstream, the caller should fix it rather than let the implementation pick.
