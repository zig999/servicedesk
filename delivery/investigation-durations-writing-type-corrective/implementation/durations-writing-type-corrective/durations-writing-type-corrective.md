---
target: backend
title: IInvestigationRow's durations_writing retyped to admit null
summary: Retypes the integration spec's locally-declared durations_writing field as number | null, matching
  the production repository's own idiom for the same read-back column.
task: sha256:63cae4c077a80e7ff20d0449fa73a2412242e6f365e760d430c6685d0787aa41
run: run/durations-writing-type-corrective-build
files:
- path: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  effect: 'IInvestigationRow''s durations_writing field type changed from number to number | null, matching
    how relational-investigation-store.repository.ts already types the same column. The file''s two pre-existing
    reads of durations_writing were examined: the `?? 0` fallback already treats null and undefined identically,
    and the toBeGreaterThanOrEqual assertion is not constrained by the value''s static type, so neither
    read required a code change. Left otherwise unchanged.'
criteria:
- criterion: IInvestigationRow's durations_writing field type admits a value or its absence (optional
    or nullable), never an unconditional number.
  met: true
  how: Retyped to number | null, matching relational-investigation-store.repository.ts's own typing of
    the same column; pinned by a new type-level test in the proof.
- criterion: Every existing read of durations_writing in this file that assumed presence is adjusted to
    read it only where the run reached consolidation, or to handle its absence explicitly.
  met: true
  how: Both existing reads (the `?? 0`-guarded total calculation and the toBeGreaterThanOrEqual assertion,
    taken in a scenario that always reaches consolidation) already tolerate the widened type without modification;
    no read assumed presence in a way the new type breaks.
- criterion: The file still builds and the full suite still passes.
  met: true
  how: run/durations-writing-type-corrective-build and run/durations-writing-type-corrective-suite both
    pass cleanly with this change in the tree, running every step the project's registry declares.
nodes:
- node: domain/investigation/durations
  encoded_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  how: This file's own locally-declared row-reading type no longer promises writing is unconditionally
    present; it now admits the absence domain/investigation/durations itself declares by omitting required:true
    from writing, unlike collection, judgment and total.
inferences:
- inferred: 'durations_writing was typed as nullable (number | null) rather than optional (durations_writing?:
    number).'
  from: The production repository (relational-investigation-store.repository.ts) already types this same
    column as number | null; matching that idiom keeps one shape for the same fact across the tree. The
    task's own ADVISORY note leaves this choice open and unconstrained by the specification.
---
## What it is
IInvestigationRow's durations_writing field stops promising a value domain/investigation/durations does not guarantee.

## Notes
None.
