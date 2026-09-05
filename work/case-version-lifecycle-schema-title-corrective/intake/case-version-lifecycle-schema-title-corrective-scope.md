# Scope

Corrective increment (one wrong behavior, human-named, in code already delivered).

Wrong behavior: `src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts`'s
own test titled `"changes an already-stored hypothesis revision's own columns on an ordinary
UPDATE when no released case version references it"` names a retired governing condition.
Migration 0021 replaced the trigger's guard from a join against
`case_version_hypotheses`/`case_versions` to `OLD.state = 'released'` read off the revision's own
row — the join this title still names is gone by the time this suite runs, and this test itself
never places the hypothesis-revision it exercises into any case version's manifest at all. The
row is mutable here only because `insertHypothesisRevision` leaves `state` at its column default,
`'draft'` — exactly what
`rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased` already states governs
mutability (the revision's own state), never a case version's reference to it. A reader trusting
this title learns a mechanism the schema no longer implements.

Found by `/review-change`'s specification-conformance pass over the `hipotese-release-proprio`
initiative (`delivery/hipotese-release-proprio/review/hipotese-release-proprio.md`, finding at
`src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts`).

File: `src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts`

Correction, as the review already stated it: reword the title to state the condition the trigger
actually reads — the revision's own state — dropping the case-version-reference framing 0021
retired. No assertion, arrange or act in the test's own body changes.

Project root: `/home/siegfriedneto/projects/servicedeskn1/.claude/worktrees/hipotese-release-proprio`
Target: backend
Initiative slug: `case-version-lifecycle-schema-title-corrective` (new slug —
`work/hipotese-release-proprio` holds `closure.md` and is closed)
