# Increment — drop the removed retention node from the epic's claim

## The ask, as the human stated it

On 2026-09-10 the human reviewed the twelve facts the plan-work decided-fact route had written
that day (temp/decided-facts-review-2026-09-10.md) and rejected one in full:
`rules/integration/a-connector-configuration-answer-is-retained-sixty-seconds-past-the-surface-that-read-it`.
`/analyse` removed it in commit `1191a5e1`. The epic `connector-configuration-read-presentation`
still names that node in `covers` and in `uncovered`, and `plan.py --check` refuses the plan:

```
epic/connector-configuration-read-presentation: covers[4] names rules/integration/a-connector-configuration-answer-is-retained-sixty-seconds-past-the-surface-that-read-it, which the specification does not hold
epic/connector-configuration-read-presentation: uncovered[2].node names rules/integration/a-connector-configuration-answer-is-retained-sixty-seconds-past-the-surface-that-read-it, which the specification does not hold
```

## Scope

Drop that node from the epic's `covers` and `uncovered`. Nothing else changes: the task
`read-answer-is-presented-whenever-held` is delivered and untouched, and its REMAINDER note
naming the removed node stays as the record of what the binder said when the node existed.

## What this increment is not

Not a corrective increment, not a scope with tasks. The same `/analyse` also decided the fact the
task's ADVISORY note left open, as `a-connector-configuration-surface-first-presented-holding-an-answer-issues-a-further-read`;
that node is not added to this epic's claim, because the delivered task's criteria never reached
it and re-binding a delivered task is not this increment's ask.
