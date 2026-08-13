Corrective increment — one wrong behavior observed in code already delivered, answering to no task's criteria. Surfaced by /reconcile's own conformance judgment, not by running the delivered system directly.

Route: /plan-work's corrective path (no survey, no decomposition). Target: backend (src). Initiative: relational-persistence (live work root).

Scope, as the human stated it:

case-query.port.ts's ReadCaseResult and case-query.service.ts's readCase still return a document
hash that contracts/knowledge/case-query and rules/investigation/replay-is-pinned no longer provide
for — the specification's own decision-log records dropping that content pin as a deliberate
decision ("Dropping the hash leaves slug and version as the whole of the pin"). run-diagnosis.ts's
own module header comment still describes the case this pipeline runs as "pinned by content" at the
start of the request, citing contracts/investigation/case-source, whose own text says the case is
pinned "by slug and version at the start of the request" — not by content.

Fix: drop the hash field from the published read-case return, and rewrite the header comment to say
"pinned by slug and version" rather than "pinned by content".

This was surfaced by /reconcile's own conformance judgment over 13 files carrying stale trace
bindings from closed initiatives (siegard-reconcile/case-and-investigation-closed-plans-drift.md) —
3 of 60 bound nodes did not clear, all for this one underlying reason:

```yaml
- node: contracts/knowledge/case-query
  conforms: false
  how: >-
    case-query.port.ts's own ReadCaseResult still declares `readonly hash: string;`, and
    case-query.service.ts's readCase still returns `{ case: theCase, hash: stored.hash }` -- but
    contracts/knowledge/case-query promises only "a case by slug and version, validated at this
    reading, and read whole", no hash and no document.
  observed_at: [case/case-query.port.ts, case/case-query.service.ts, factories/case-query.factory.ts]
- node: rules/investigation/replay-is-pinned
  conforms: false
  how: >-
    the same stored.hash case-query.service.ts still returns, and run-diagnosis.ts's own module
    header, which still describes the case this pipeline runs as "pinned by content" at the start
    of the request -- contradict rules/investigation/replay-is-pinned's own text: "slug and version
    name one content without a digest over it."
  observed_at: [case/case-query.service.ts, investigation/investigation-factory.ts, investigation/investigation.ts, investigation/run-diagnosis.ts]
- node: contracts/investigation/case-source
  conforms: false
  how: >-
    run-diagnosis.ts's own module header cites this exact node while describing the case as
    "pinned by content"; the node it cites says the investigation runs the case "pinned by slug
    and version at the start of the request" -- not by content.
  observed_at: [investigation/run-diagnosis.ts]
```

It answers to no task's criteria: the tasks that last touched these three files
(case-and-investigation-model's own case-aggregate-shape and investigation-record-shape, and
relational-stores' case-store) were delivered and reviewed before this leftover was found.
