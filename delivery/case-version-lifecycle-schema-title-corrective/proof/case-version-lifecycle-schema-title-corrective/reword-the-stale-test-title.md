---
title: Proof for reword-the-stale-test-title
summary: Cites the renamed test's own title and its unchanged arrange/act/assert, plus the file's own unaffected suite, as the evidence for this corrective rename's three criteria.
implementation: sha256:1ab6ed8141e48afa0608c6cc7eba69a505f111df5a3d0ab32c7d71c322994a43
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/case-version-lifecycle-schema-title-corrective-reword-the-stale-test-title-suite
tests:
- file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  name: changes an already-stored hypothesis revision's own columns on an ordinary UPDATE while the revision's own state is still draft
  proves: Criteria 1 and 2 — the it(...) block's own title, read directly from the file, names the revision's own draft state as what makes the row mutable and contains no mention of any case version, its release, or its absence; and the block's arrange (insertCase/insertHypothesis/insertHypothesisRevision with criterion 'Original.'), act (the raw SQL UPDATE ... SET criterion = 'A revised criterion.' ...) and assert (SELECT ... expect(rows[0]?.criterion).toBe('A revised criterion.')) are the same lines this task's own diff preserved byte-for-byte.
  fails_when: This it(...) block's title names a case version's reference to the revision, its release state, or its absence, instead of the revision's own draft state — or any line of its arrange, act or assert differs from the fixture calls, the UPDATE statement, or the closing SELECT/expect.
- file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  name: the file's own full suite — all pre-existing it(...) blocks, including the renamed one, run together
  proves: Criterion 3 — running this file's own full test suite continues to pass with every existing assertion unchanged, since this task's only edit is the one string literal named above; none of the file's other 23 tests has any line touched.
  fails_when: Any assertion, query or fixture anywhere in case-version-lifecycle-schema.spec.ts — including the renamed test's own unchanged assert — fails when npm test runs this file, or the file fails to load or compile at all.
not_applicable:
- edge_case: Absent or empty input, a boundary value, a duplicate-uniqueness case, an operation against forbidden state, a slow or failing dependency, or two concurrent operations against one subject
  why: This task changes one string literal naming an existing it(...) block; it introduces no new input, no new code path, no new state transition and no new concurrency — every SQL statement, every fixture and every expectation in the file is the one this task's own diff left untouched.
---
## What it is

Cites the renamed test itself, plus the unaffected file suite, as proof of the three criteria — no new test is needed since the change is a single string-literal rename.

## Notes

No source-reading meta-test (mirroring domain-depends-on-no-infrastructure.spec.ts's convention) was added: the subject is one string literal in one file changed by exactly one task, already quoted verbatim in the implementation record; such a test's own placement would raise an unresolved TST-04 (tool-decided, path-mirroring) risk this delegation has no shell to check, for no proof value beyond what the existing renamed test and a diff review already show.
