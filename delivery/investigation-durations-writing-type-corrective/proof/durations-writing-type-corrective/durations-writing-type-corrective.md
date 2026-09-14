---
target: backend
title: IInvestigationRow's durations_writing retyped to admit null — proof
summary: A type-level test pinning durations_writing's widened type to number | null, with the file's
  two pre-existing reads left unmodified since both already tolerate the widened type.
implementation: sha256:d8b934bff6060897ef953178f9a667c266d47c8a4dc92b8b35ab8bf507abbd7c
run: run/durations-writing-type-corrective-suite-full
tests:
- file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  name: types IInvestigationRow's durations_writing to admit null rather than an unconditional number,
    matching how the production repository's own IInvestigationRow already types this same read-back
    column
  proves: "Criterion 1 — IInvestigationRow's durations_writing field type admits a value or its absence
    (optional or nullable), never an unconditional number — verified as implemented (number | null),
    mirroring relational-investigation-store.repository.ts's own typing of the same column."
  fails_when: durations_writing's declared type in IInvestigationRow stops admitting null — e.g. it
    reverts to an unconditional number, or is changed to anything other than number | null.
- file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  name: persists real, non-zero cost and durations for the judgment and consolidation calls, with
    durations_total exceeding the sum of the three stage figures since it measures the whole pipeline's
    own real elapsed time
  proves: "Criterion 2 — the file's existing reads of durations_writing (the >= assertion, taken in
    a scenario that always reaches consolidation, and the total >= sum calculation already guarded by
    `?? 0`) needed no adjustment once the type widened; this pre-existing test, left unmodified by this
    corrective, is the evidence that both reads still run correctly against the new type."
  fails_when: the widened type breaks this test file's compilation, or written?.durations_writing stops
    producing the value this test asserts once the field is typed as number | null.
not_applicable:
- edge_case: a row read in this file where the pipeline never reached consolidation, so durations_writing
    is genuinely null at runtime
  why: no criterion asks this corrective to add a new integration scenario exercising a no-consolidation
    pipeline run in this file; criterion 1 only asks that the type admit absence, and criterion 2 only
    asks that existing reads be adjusted if the type change requires it — neither existing read required
    adjustment.
- edge_case: two concurrent reads or writes against the investigations table
  why: no criterion or node fact in this task's scope states concurrent behavior; this task is a type
    correction only.
- edge_case: the Notes entry's open choice between an optional field and a nullable one
  why: that entry opens with ADVISORY, not UNDERDETERMINED, from the specification —, so it names no
    test this proof owes; it explicitly leaves the shape unconstrained, and the implementation's choice
    of nullable (matching the production repository's idiom) is an inference about arrangement, not
    behavior, so no test pins it.
untested:
- domain/investigation/durations's fact taken whole — its own attribute requiredness (collection/judgment/total)
  and total's real-elapsed-time semantics — is not decided by any test this proof writes. This task's
  only test touching the node's ground covers a fragment — that a row-level reflection of writing's
  conditional presence, in this file's own locally-declared type, admits absence — which is not the
  node's fact whole, so the node is left as a reading rather than settled by a test here.
---
## What it is
A type-level test pinning durations_writing's corrected type.

## Notes
run/durations-writing-type-corrective-build and run/durations-writing-type-corrective-suite-full both passed cleanly, confirming criterion 3.
