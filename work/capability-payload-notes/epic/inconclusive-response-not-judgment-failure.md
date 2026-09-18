---
title: A well-formed inconclusive model answer is not recorded as a judgment failure
summary: 'Corrective increment: outcomeFromModelText must record a well-formed {"verdict":"inconclusive"}
  model response distinctly from a response that could not be parsed, so an infrastructure failure is
  never conflated with a genuine domain answer.'
rationale: The wrong behavior was observed in delivered code, outside any task's criteria; the claim is
  seeded mechanically from trace.py --encodes over the one file the human named, plus domain/investigation/evaluation-reason,
  whose enumeration the fix is expected to touch.
sources:
- work/capability-payload-notes/intake/inconclusive-response-not-judgment-failure.md
covers:
- constraints/judgment-runs-behind-a-port
- constraints/the-judgment-prompt-is-closed
- domain/integration/capability
- domain/investigation/citation
- domain/investigation/evaluation
- domain/investigation/evidence
- domain/investigation/hypothesis-evaluator
- domain/investigation/usage
- rules/investigation/a-cited-field-exists-in-the-capability-output-schema
- rules/investigation/a-decided-evaluation-cites-evidence
- rules/investigation/an-inconclusive-evaluation-declares-its-reason
- rules/investigation/judgment-does-not-infer
- rules/investigation/judgment-reads-the-evidence-snapshot
- scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
- domain/investigation/evaluation-reason
uncovered:
- node: constraints/judgment-runs-behind-a-port
  why: This corrective increment answers only the inconclusive-vs-judgment-failure conflation; this node's
    other clauses reach no criterion of this one-behavior correction.
- node: constraints/the-judgment-prompt-is-closed
  why: This corrective increment answers only the inconclusive-vs-judgment-failure conflation; this node's
    other clauses reach no criterion of this one-behavior correction.
- node: domain/integration/capability
  why: This corrective increment answers only the inconclusive-vs-judgment-failure conflation; this node's
    other clauses reach no criterion of this one-behavior correction.
- node: domain/investigation/citation
  why: This corrective increment answers only the inconclusive-vs-judgment-failure conflation; this node's
    other clauses reach no criterion of this one-behavior correction.
- node: domain/investigation/evaluation
  why: This corrective increment answers only the inconclusive-vs-judgment-failure conflation; this node's
    other clauses reach no criterion of this one-behavior correction.
- node: domain/investigation/evidence
  why: This corrective increment answers only the inconclusive-vs-judgment-failure conflation; this node's
    other clauses reach no criterion of this one-behavior correction.
- node: domain/investigation/hypothesis-evaluator
  why: This corrective increment answers only the inconclusive-vs-judgment-failure conflation; this node's
    other clauses reach no criterion of this one-behavior correction.
- node: domain/investigation/usage
  why: This corrective increment answers only the inconclusive-vs-judgment-failure conflation; this node's
    other clauses reach no criterion of this one-behavior correction.
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  why: This corrective increment answers only the inconclusive-vs-judgment-failure conflation; this node's
    other clauses reach no criterion of this one-behavior correction.
- node: rules/investigation/a-decided-evaluation-cites-evidence
  why: This corrective increment answers only the inconclusive-vs-judgment-failure conflation; this node's
    other clauses reach no criterion of this one-behavior correction.
- node: rules/investigation/judgment-does-not-infer
  why: This corrective increment answers only the inconclusive-vs-judgment-failure conflation; this node's
    other clauses reach no criterion of this one-behavior correction.
- node: rules/investigation/judgment-reads-the-evidence-snapshot
  why: This corrective increment answers only the inconclusive-vs-judgment-failure conflation; this node's
    other clauses reach no criterion of this one-behavior correction.
- node: scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
  why: This corrective increment answers only the inconclusive-vs-judgment-failure conflation; this node's
    other clauses reach no criterion of this one-behavior correction.
---
## What it is

The adapter's outcomeFromModelText folds a well-formed inconclusive model answer into the same
branch as an unparseable response, both recorded under reason "judgment-failure".

## Notes

None.
