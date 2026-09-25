---
title: Restore the Output schema entry's guidance statement
summary: Capability form fields' Output schema entry states again what the system reads from it, matching what the pre-existing test already proves and a commit removed from the source.
objective: The surface offering entry of a capability's Output schema states, at that entry, the five claims the specification already fixes about what is read from it, and no sixth claim.
criteria:
  - The Output schema entry surface states that what is entered there is JSON.
  - The Output schema entry surface states that a field's own name is the path through the schema's top-level properties object and every properties object and items schema reachable beneath it.
  - The Output schema entry surface states that a reached node's own type and description, where the schema states them, are read as that field's declared semantics.
  - The Output schema entry surface states that no other content of the entered schema is read or validated.
  - The Output schema entry surface states that a description entered there states what a value means and names no decision.
  - The Output schema entry surface states no claim beyond these five.
implements:
  - rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it
  - rules/integration/an-output-schema-entrys-statement-carries-no-sixth-claim
sources:
  - intake/scope.md
---

## What it is

The wrong behavior: `frontend/app/src/routes/capability-form-fields.tsx` had its Output schema
explanatory paragraph removed by commit `f3d4778a` ("feat(frontend): theme sonner toasts, add
error emphasis, remove output-schema help text", 2026-09-22). The pre-existing test
`frontend/app/src/routes/capability-form-fields-output-schema-guidance.spec.ts` was never
updated and still requires that paragraph, so it fails with 8 failures on a clean tree — not a
regression from any other work in flight, confirmed by stashing and re-running in isolation.

The two rules this task implements already fix the five claims the statement must carry and bar
a sixth; restoring the removed paragraph so it states exactly those five, word for word or in an
equivalent restatement the rules' own wording licenses, is what closes both the test and the
specification gap the removal opened.

## Notes

ADVISORY, from the execution-contract-binder — non-blocking, carried forward rather than acted
on, since none of the four fall inside this task's own criteria:

- Claims two, three and five, and criterion six's limit, take their content from three nodes the
  two implemented rules name as the only permitted source: domain/investigation/field-semantics,
  rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema and
  rules/glossary/a-description-states-meaning-never-policy. They are not in this task's
  `implements` because this task does not implement the schema walk or the description policy,
  only restates them at the entry; the executor reads them through the two implemented rules,
  which cite them by identity. The wording, which control carries the statement, and where it
  sits are left to the interface.

Decision, beyond the covers — domain/investigation/field-semantics: this epic's `covers` does
not claim it; the task stands without growing the claim or moving, since restoring the removed
paragraph only restates what this node already fixes through the two rules this task does
implement, and implements nothing of it directly.

Decision, beyond the covers — rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema:
this epic's `covers` does not claim it; the task stands without growing the claim or moving, for
the same reason.

Decision, beyond the covers — rules/glossary/a-description-states-meaning-never-policy: this
epic's `covers` does not claim it; the task stands without growing the claim or moving, for the
same reason.
- Three further UNDERDETERMINED notes from the binder describe conditions this task's six
  criteria do not reach — whether a worked example beside the statement is itself a barred
  "sixth claim", whether client-side checking of the entered schema against the five claims is
  barred as behavior rather than statement, and whether the statement must appear alike on an
  authoring surface and an editing surface of an already-registered capability. None of the
  three is a contradiction between this task's criteria and the specification, and none is
  something the restored paragraph (which said all this once already, before removal) bears on
  differently than it did before. They are recorded here rather than acted on, since acting on
  them would decide facts this corrective increment was not asked to decide.
