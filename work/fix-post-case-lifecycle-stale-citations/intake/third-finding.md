Third corrective task, same initiative. /reconcile's third pass over the 8-file set
(siegard-reconcile/moved-nodes-post-closure-drift-3.md) found the two stale-citation deliveries
fully resolved the case/hypothesis vs case-version/hypothesis-revision confusion, but surfaced one
unrelated issue:

src/investigation/judgment-stage.ts's judgeOneHypothesis doc comment presents "a hypothesis denied
a slot makes no call, so it costs nothing" as verbatim text of
constraints/hypotheses-are-judged-in-isolated-parallel-calls, but that node's statement and
fitness hold no such sentence. Elsewhere in the same file, this same node is quoted correctly and
verbatim ("the pool bound is configuration"), confirming this is a misquotation rather than a
wrong-node citation.

Documentation-only: no runtime behavior changes, only removing a false verbatim attribution.
