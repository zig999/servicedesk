---
title: A well-formed inconclusive model response is recorded distinctly from a judgment failure
summary: outcomeFromModelText records a well-formed {"verdict":"inconclusive"} response with reason not-grounded,
  never under the same "judgment-failure" reason a parse failure or a malformed response uses.
sources:
- work/capability-payload-notes/intake/inconclusive-response-not-judgment-failure.md
objective: A hypothesis evaluation the model itself answered inconclusive, in a well-formed response,
  is recorded with reason not-grounded, distinguishable from an evaluation whose response could not be
  parsed or understood at all.
criteria:
- A well-formed model response of exactly {"verdict":"inconclusive"} yields an evaluation whose reason
  is "not-grounded".
- A model response that cannot be parsed as JSON, or whose shape this adapter does not recognize, still
  yields an evaluation whose reason is "judgment-failure".
- A well-formed {"verdict":"confirmed",...} or {"verdict":"refuted",...} response is unaffected by this
  change and yields the same verdict and citations as before.
implements:
- rules/investigation/an-inconclusive-evaluation-declares-its-reason
- domain/investigation/evaluation-reason
---
## What it is

outcomeFromModelText's branch for a parsed but inconclusive verdict now returns reason
"not-grounded", separated from its branch for a response that failed to parse or did not match
a recognized shape, which still returns "judgment-failure".

## Notes

UNDERDETERMINED, from the specification -- rules/investigation/an-inconclusive-evaluation-declares-its-reason conditions not-grounded on the judgment call having returned within its deadline over evidence that collected ok; this task's criteria carry neither condition explicitly. Within outcomeFromModelText's own scope this is moot: the adapter is invoked only for a call the caller already made within budget, over evidence judgment-stage.ts has already gathered, so the deadline-exceeded and no-data cases are handled by the caller before this adapter is ever reached -- outcomeFromModelText itself has no way to observe either condition and cannot be asked to branch on them.
REMAINDER, from the specification -- rules/investigation/an-inconclusive-evaluation-declares-its-reason's clause that a no-data reason cites the evidence whose result is not ok reaches no criterion of this task; that clause governs the evidence-collection path recording a no-data evaluation, not this adapter's response parsing.
