# Scope

Corrective increment (one wrong behavior, human-named, in code already delivered).

Wrong behavior: `src/case/revise-hypothesis.operation.ts`'s `refuseWithoutDraft` fetches the
case's draft version (`this.caseStore.findDraftVersion(input.slug)`) only to confirm one exists,
then discards it; the concept-acceptance check
(`refuseInvalidCollects` → `refuseConceptsRefusingSubject`) is run against `input.subject` — a
value the caller supplies independently on the `ReviseHypothesisInput` DTO — rather than against
the draft version's own declared subject.
`rules/knowledge/a-concept-accepts-the-declared-subject-type` states the check is against "the
subject type **the case version declares**", not a value the caller separately asserts. A caller
that supplies a `subject` other than the one the case's own draft version actually declares gets
the acceptance check run against a fabricated subject type, and nothing in this file catches the
mismatch.

Found by `/review-change`'s specification-conformance pass over the `hipotese-release-proprio`
initiative (`delivery/hipotese-release-proprio/review/hipotese-release-proprio.md`, finding at
`src/case/revise-hypothesis.operation.ts`).

File: `src/case/revise-hypothesis.operation.ts`

Correction, as the review already stated it: read the subject type off the draft version returned
by `findDraftVersion` (or otherwise verify `input.subject` against it) before using it in
`conceptsRefusingSubjectOf`, so the check uses the draft version's own declared subject rather
than the caller-supplied value.

Project root: `/home/siegfriedneto/projects/servicedeskn1/.claude/worktrees/hipotese-release-proprio`
Target: backend
Initiative slug: `revise-hypothesis-subject-check-corrective` (new slug —
`work/hipotese-release-proprio` holds `closure.md` and is closed)
