---
title: Revise-hypothesis's concept-acceptance check reads the draft's own declared subject, never input.subject
summary: Two new integration tests against ReviseHypothesisOperation prove that a caller-supplied input.subject disagreeing with the case's draft version's own declared subject plays no part in the concept-acceptance outcome, in either direction.
implementation: sha256:8b8ab59d982c911f06ff06a4ad5eec90bc76caf48c7bcf5b1fcbcd86135495fd
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/revise-hypothesis-subject-check-corrective-read-the-drafts-own-declared-subject-suite-2
tests:
- file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  name: accepts a revise whose input.subject disagrees with the case's own draft version's declared subject type, deciding the concept-acceptance check by the draft's own subject alone
  proves: Criterion 2 (and, as its observable proxy, criterion 1) — a concept that accepts the draft version's own declared subject type is not refused merely because the caller supplied a different, disagreeing input.subject; the revision is written.
  fails_when: revise-hypothesis.operation.ts reverts to running the concept-acceptance check against input.subject instead of the draft version's own subject — the concept (registered to accept only the draft's own subject) would then be checked against the disagreeing input.subject, wrongly raising ConceptRefusesSubjectTypeError and rejecting a revise that must succeed.
- file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  name: refuses with ConceptRefusesSubjectTypeError naming the case's own draft version's declared subject type — never the caller-supplied input.subject that disagrees with it — when the collected concept refuses that draft's own subject even though it would accept input.subject
  proves: Criterion 2 (and, as its observable proxy, criterion 1) in the opposite direction — a concept that refuses the draft version's own declared subject type is not let through by supplying an input.subject the concept would have accepted; the error's context.subject names the draft's own subject, and no hypothesis row is written.
  fails_when: revise-hypothesis.operation.ts runs the check against input.subject instead of the draft's own subject — the concept (registered to accept only input.subject's value) would then wrongly be treated as accepting, letting the revision proceed and smuggling acceptance for a subject the draft's own declared type actually refuses.
not_applicable:
- edge_case: Absent or empty input.subject
  why: Out of this task's criteria — the defect and its fix concern only which subject value the check reads (the draft's own vs. the caller's), never validation of input.subject's presence or shape, which is unaffected by this task's files.
- edge_case: A range boundary
  why: No numeric or ordinal range is involved in the subject-source decision this task fixes.
- edge_case: A duplicate where uniqueness is claimed
  why: No uniqueness constraint is implicated by which subject value the check reads.
- edge_case: A dependency that fails or answers slowly
  why: Both new tests exercise the real store already wired by the rest of this suite; the defect and its fix are about which in-memory value is compared, not about a dependency's availability or latency.
- edge_case: Two operations against one subject at once
  why: Concurrency over the draft version or the hypothesis row is untouched by this task, which changes only which subject value a single synchronous check reads.
untested:
- Criterion 3 (every existing assertion of revise-hypothesis.operation.ts and findDraftVersion's callers continues to pass unchanged) is a no-regression claim over the existing suite's own tests continuing to hold; it is answered by running the existing suite unmodified, confirmed by this proof's own captured run.
- The implementation record's inferences about findDraftVersion's return-type shape and ReviseHypothesisInput keeping the subject field are structural/signature choices with no independent observable behavior beyond what the two new tests already exercise through the real store.
- The FakeCaseStore.findDraftVersion change in src/__tests__/unit/case/case-query.service.spec.ts is read by no assertion in that file, per the implementation record; that file exercises CaseQueryService rather than ReviseHypothesisOperation, so no test was added there.
---
## What it is

Two new integration tests proving revise-hypothesis's concept-acceptance check reads the draft version's own declared subject exclusively, in both directions (a disagreeing input.subject neither wrongly refuses an acceptable revise nor wrongly lets through one the draft's own subject actually refuses).

## Notes

None.
