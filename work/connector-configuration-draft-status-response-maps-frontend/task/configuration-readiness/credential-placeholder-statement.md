---
title: The surface promises no check of a credential placeholder
summary: For each ${credential:X} the field's well-formed content embeds, the surface names it and says
  it resolves server-side at a test or an observation and is checked by nothing here.
rationale: Cut apart from the other readiness statements because it is the one statement read from nothing
  at all, and it is what bounds the whole panel against reading as a check that passed.
objective: The surface states, for each credential placeholder the Configuration field's well-formed content
  embeds, where that credential is resolved and that nothing on this surface checks it.
criteria:
- Each ${credential:<name>} the field's well-formed content embeds is named by the statement.
- The statement says the credential is resolved from the server's own configuration at the moment of a
  test or an observation.
- The statement says the credential is checked by nothing on this surface.
- No statement on the surface reports a result of having checked whether a credential placeholder resolves.
sources:
- intake/scope.md
implements:
- rules/integration/a-connector-configuration-surface-promises-no-check-of-a-credential-placeholders-resolution
- rules/integration/a-connector-configuration-surfaces-readiness-statements-carry-no-claim-no-rule-decides
---

## What it is
The named gap in a panel that states everything else it can judge.
Silence over the one thing the surface cannot check reads, beside all the rest, as a check that passed.

## Notes
Where the credential resolves to nothing is met at an observation that ends unavailable, not here.
UNDERDETERMINED, from the specification -- No criterion carries the bound that rules/integration/a-connector-configuration-surfaces-readiness-statements-carry-no-claim-no-rule-decides places on this statement -- that the surface refuses nothing on it and withholds no act submitting a registration over it beyond the one well-formedness withholds. All four criteria are met by a surface that also disables the submission act, or marks the configuration unready, whenever the content embeds a ${credential:<name>} placeholder, and the specification refuses exactly that.
A surface that names each ${credential:<name>} the well-formed content embeds, says it resolves server-side and is checked by nothing here, reports no check result -- and, because a credential placeholder is present, withholds the act submitting the registration until the operator removes it -- satisfies every criterion above while the readiness-bound rule refuses it.
REMAINDER, from the specification -- The remaining clauses of rules/integration/a-connector-configuration-surfaces-readiness-statements-carry-no-claim-no-rule-decides bound the three sibling statements (HTTP-vocabulary departure, subject-placeholder, responseMap-key coverage) and reach no criterion of this task. Belongs to the sibling tasks of this epic implementing those three statements.
ADVISORY, from the specification -- The statement this task writes stands only over content that is well-formed JSON object text, and which content is well formed is judged by rules/integration/a-connector-configuration-surface-judges-its-configuration-fields-content, whose own statement is another task's. No criterion here says what the surface states about credential placeholders while that judgment finds the content not well formed -- the candidate rule's own scope answers it (the statement is owed only of well-formed content), so nothing is missing, but the two statements share one control area on the same surface.
