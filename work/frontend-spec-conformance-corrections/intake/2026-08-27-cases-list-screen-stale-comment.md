Found by siegard-reconcile/post-case-summary-optional-analyse-drift.md's judgment over
cases-list-screen.tsx, reconciling delivered code against the specification rather than any
task's own criteria:

The JSDoc above the CaseSummary type (lines 82-93) reads:

  domain/knowledge/case-summary, computed per
  rules/knowledge/a-case-summary-is-derived-from-its-existing-versions.
  currentState and lastUpdated are undefined only where the case currently
  holds no version at all -- an edge no governing node addresses
  (case-store.port.ts's own listCaseVersions header: "a case row survives
  the discarding of every version it ever held", so a case can reach zero
  versions by every draft it ever held being discarded before release).
  This screen renders an explicit absence for that edge rather than
  inventing a state or a timestamp neither node states; this task's own
  inference, disclosed in its delivery record.

That comment was accurate when written. An /analyse since (knowledge/decision-log.md, committed
as c9b7594) amended both nodes it names to state the zero-version case directly:
domain/knowledge/case-summary now declares current_state and last_updated present only where the
case currently holds at least one version, and
rules/knowledge/a-case-summary-is-derived-from-its-existing-versions's own statement was extended:
"a case currently holding no version has version_count zero and neither current_state nor
last_updated, there being no version to derive either from." The behavior the comment describes
already matches both nodes exactly — nothing in fetchCaseSummary or the CaseSummary type needs to
change. What is stale is the comment's own two claims: that this is "an edge no governing node
addresses", and that the zero-version handling is "this task's own inference" rather than a fact
the specification now states.

Scope: correct the comment's own two stale claims to cite what domain/knowledge/case-summary and
rules/knowledge/a-case-summary-is-derived-from-its-existing-versions now state, in place of the
"no governing node addresses" and "this task's own inference" framing. No behavior change.
