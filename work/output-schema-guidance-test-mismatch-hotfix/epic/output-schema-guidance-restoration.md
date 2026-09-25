---
title: Output schema entry restates what the system reads from it
summary: The capability authoring surface's Output schema entry states again the five fixed claims about what is read from it, closing the gap a prior commit opened between the specification and the code.
covers:
  - rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it
  - rules/integration/an-output-schema-entrys-statement-carries-no-sixth-claim
sources:
  - intake/scope.md
---

## What it is

This epic holds the one correction that makes the capability authoring surface's Output schema
entry state again the five claims the specification fixes about what is read from it.

## Notes

This is a corrective increment: one wrong behavior in code already delivered, named by the human
together with the file it lives in (`frontend/app/src/routes/capability-form-fields.tsx`). The
survey and the decomposition did not run; the candidate set was seeded by
`trace.py --encodes frontend/app src/routes/capability-form-fields.tsx` and closed by
`spec.py --impact`, and the execution-contract-binder returned this epic's `covers` from that
closed set, reading the two rules fresh rather than reading the task that would use them.
