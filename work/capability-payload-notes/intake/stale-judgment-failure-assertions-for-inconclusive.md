## What it is

`src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts` asserts
`reason: 'judgment-failure'` for a well-formed model answer whose own verdict is
`inconclusive` (the test named "maps the model's own well-formed inconclusive answer to
reason judgment-failure", and the two sibling assertions at lines ~648 and ~670 covering the
same well-formed-inconclusive path). Since `task/capability-payload-notes/inconclusive-response-not-judgment-failure/distinct-reason`'s
legitimate delivery, the production adapter now answers that case with
`reason: 'not-grounded'`, so these assertions are false against the tree as it now stands.
The other `judgment-failure` assertions in the same file — for a response that failed to
parse at all, or that parsed into no recognized shape — are unaffected and stay as they are.

## Notes

None.
