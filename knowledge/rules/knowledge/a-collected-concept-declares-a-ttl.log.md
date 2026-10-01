---
entries:
- field: statement
  unstated: The material delegates the default ttl to the analysis without naming a value.
  decided: Sixty seconds.
  why: The material itself states a short ttl never produces an error, only less cache efficiency, so the safe default is short; one minute keeps any cached observation fresher than the investigation deadline by a factor of three.
- field: statement
  unstated: 'The rule already states the default ttl a registration stating none takes, but nothing states what a stated ttl of zero or a negative number answers -- domain/glossary/concept declares ttl only `type: integer`, `required: true`, with no floor. The material is siegard-reconcile/backend-investigation-glossary-connector-cluster-code-drift.md, whose judge over register-concept.dto.ts reported the DTO''s own `.positive()` bound as a fact no node states.'
  decided: A stated ttl is a positive integer; zero or less is refused the same way a non-integer one already is, distinct from the absent-ttl default.
  why: 'This specification already reads an identical attribute this exact way: rules/integration/a-capability-declares-its-contract states of a capability''s timeout that "a timeout of zero or less bounds nothing -- there would be no time left for a call to answer in", decided into that rule for the identical reason (decision-log, timeout.type entry) after an earlier reconciliation reported the same `.positive()` pattern on register-capability.dto.ts as unstated. A ttl of zero or less bounds no freshness tolerance at all, the same way a timeout of zero or less bounds no call -- the reasoning transfers without alteration, and reading it the other way here would leave two structurally identical attributes governed by two different rules for the same kind of value.'
---
