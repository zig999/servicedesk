---
title: The well-formed-inconclusive test asserts reason not-grounded, not judgment-failure
summary: anthropic-hypothesis-evaluator.adapter.spec.ts's test for a well-formed inconclusive
  model answer is rewritten to assert the reason the production adapter now actually returns.
rationale: The wrong assertion was observed in delivered test code, outside any live task's
  criteria; the claim is seeded mechanically from trace.py --encodes over the one file the
  human named.
sources:
- work/capability-payload-notes/intake/stale-judgment-failure-assertions-for-inconclusive.md
objective: The well-formed-inconclusive test in anthropic-hypothesis-evaluator.adapter.spec.ts
  asserts the reason the production adapter now actually returns for that case.
criteria:
- A test giving the adapter a well-formed model answer of {"verdict":"inconclusive"} asserts
  the resulting outcome carries reason 'not-grounded', not 'judgment-failure'.
- The sibling assertions in the same file for a response that failed to parse at all, that
  parsed into no recognized shape, or that never arrived because the provider call rejected,
  still assert reason 'judgment-failure', unchanged.
implements:
- domain/investigation/evaluation-reason
- rules/investigation/an-inconclusive-evaluation-declares-its-reason
---
## What it is

The one assertion this test file makes for a well-formed but inconclusive model answer must
read the reason the production adapter now returns for that case (`not-grounded`), since
inconclusive-response-not-judgment-failure/distinct-reason's delivery split that case out of
the shared judgment-failure outcome. No other assertion in the file changes.

## Notes

UNDERDETERMINED, from the binder over rules/investigation/an-inconclusive-evaluation-declares-its-reason:
criterion 1's condition (a well-formed inconclusive answer) omits the rule's two attached
qualifications — within the deadline, over evidence that collected ok. Both already hold in
the existing test's own setup (SOME_OK_EVIDENCE, a synchronous mocked resolve with no deadline
manipulation), so the test as it stands satisfies the rule's actual precondition without the
criterion needing to spell it out; a rewrite that drove the same test past its deadline or over
not-ok evidence would answer to a different rule entirely and is out of this correction's scope.

REMAINDER, from the binder over rules/investigation/an-inconclusive-evaluation-declares-its-reason:
the rule's no-data citation clause reaches no criterion here and stays answered by the
collection-timeout work this correction does not touch.
