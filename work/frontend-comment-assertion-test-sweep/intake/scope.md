Corrective increment, stated by the human.

Observed by running `npm test` (vitest) in frontend/app after commit 88f60ff ("comment sweep
frontend: prose removed, token-equivalence proven"): 2 test files / 7 tests fail out of 152
files / 1044 tests.

The following two test files assert on the literal prose text of a source-code comment, read via
`readFileSync` from the .tsx file under test. The comment sweep removed the comments they
depended on (expected, under "Source carries no comments" -- CLAUDE.md), so both now read an
empty string and every `toContain` assertion on that text fails:

1. frontend/app/src/routes/cases-list-screen-comment-cites-the-current-nodes.spec.ts (5 tests) --
   reads frontend/app/src/routes/cases-list-screen.tsx, extracts the JSDoc comment that used to
   precede `type CaseSummary = `, and asserts that its prose cites domain/knowledge/case-summary
   and rules/knowledge/a-case-summary-is-derived-from-its-existing-versions. That JSDoc no longer
   exists in the source.

2. frontend/app/src/routes/case-simulation-detail-panel-comment-cites-the-current-nodes.spec.ts
   (3 of its tests) -- reads frontend/app/src/routes/case-simulation-detail-panel.tsx, extracts
   the prose between the literal markers "Criterion 6" and "Criterion 7" that used to sit inside a
   comment, and asserts that it cites domain/investigation/evaluation and
   domain/investigation/investigation. That comment block no longer exists in the source.

Both files test a comment's prose as their subject, never runtime behavior. The human decided:
remove these two test files in full, rather than re-home the assertions elsewhere. No production
source changes, and no other test file changes. This was verified by running the full frontend
suite (excluding the slow `.build.spec.ts`): 150 files / 1037 tests pass; only these 2 files / 7
tests fail, both for the reason above.
