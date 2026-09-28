## Scope

A hypothesis-evaluator test double, seeded with an inconclusive outcome whose reason is
"no-data" — meaning the evaluator's own call was never made for that hypothesis — answers that
seeded outcome with a usage and an elapsed duration attached, as though a call had been made and
had a cost. A test relying on this double cannot construct an outcome whose reason is "no-data"
and whose usage and elapsed duration are both absent, which is the shape a call that never
happened must have.

## Reproduction

Seed the test double with an outcome carrying reason "no-data" and no usage or elapsed_ms of its
own. Call evaluate() against that seed. The answer carries a usage and an elapsed_ms value
rather than none.

## File

src/investigation/fake-hypothesis-evaluator.adapter.ts
