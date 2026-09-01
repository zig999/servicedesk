Corrective increment, stated by the human.

39 (subsequently recounted exactly: 45, across 19 files — see below) backend tests assert the
literal textual content of production-source comments: citations of specification-node
identities, explanatory header paragraphs, and attributions in doc comments. The project's own
rules now forbid source carrying such comments at all ("Source carries no comments" —
CLAUDE.md). These tests impose, in the test suite, a documentation convention the project's rules
have retired. They must be removed. Every behavioral test dividing the same files must stay
intact and unchanged. No production behavior changes.

Named explicitly for whole-file removal, regardless of their own tests' individual shape:
- src/__tests__/unit/domain-depends-on-no-infrastructure-bypass-mention-scan.spec.ts (6 tests) —
  exists only to test the exemption logic for a comment citing a specification-node identity
  inside a domain-boundary substring scan; once comments citing node identities are themselves
  forbidden, nothing can ever need that exemption.
- src/__tests__/unit/vitest-config-migration-replay-headroom.spec.ts (2 tests) — one of its two
  tests asserts the wording of vitest.config.ts's own explanatory comment.

Named for removal of specific tests only, leaving every other test in each file untouched — the
tests named "…own comment cites…", "…header comment names…", the six comment-asserting tests of
status-map.spec.ts, and every other test whose assertion reads a production file's text and
checks specific comment prose (a doc comment, a header/module comment, or an inline comment)
rather than runtime behavior.

An exhaustive, file-by-file enumeration of the individual-test removals (37 tests across 17
files) was derived and verified by rereading every candidate test's body, not its title alone,
and cross-checked against every specification-node identity each asserts a comment must cite —
all 25 distinct identities referenced resolve to specification nodes that presently exist. That
full working list is not restated here; it is this task's own basis and is repeated in the task
file's criteria and in the delivery record this task produces.
