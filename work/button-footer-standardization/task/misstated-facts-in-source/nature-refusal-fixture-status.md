---
title: Nature-refusal stand-in status
summary: The stand-in refusal of a capability whose nature is not read-only, built with the status the registry answers that refusal with.
rationale: The scope named one wrong value in one fixture; the task is written as a condition over every stand-in of that error in the frontend suite, because a second stand-in carrying the old value would leave the same contradiction in the tree under a different path.
sources:
- intake/scope-review-corrections.md
objective: The stand-in that refuses a capability save for a nature that is not read-only answers with the status the specification states for that refusal.
criteria:
- The stand-in refusal carrying CapabilityNotReadOnlyError in the capability detail surface's outcome proof responds with HTTP 422.
- No stand-in in the frontend suite builds CapabilityNotReadOnlyError with a status other than 422.
- That proof still asserts the refusal reaches the operator as a statement naming the read-only condition, told apart from a refusal whose condition the surface does not recognise.
implements:
- rules/integration/a-capability-is-read-only
- rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
---

## What it is
One stand-in in the capability detail surface's outcome proof, built today with a status the registry does not answer that refusal with.
The condition is stated over every stand-in of that error in the frontend suite rather than over the one path the scope named.

## Notes
Decision, beyond the covers — this task stands as cut, and the epic's claim is not grown to hold `decision-log`, `domain/integration/capability` or `domain/integration/connector-configuration`: the notes below name `decision-log` to say where the 422 was disclosed and name `domain/integration/capability` and `domain/integration/connector-configuration` to say which elements a rule this task implements constrains, and none of the three is a claim this task delivers anything against, so growing the claim would owe an `uncovered` declaration for each and buy nothing.

ADVISORY, from the specification — `rules/integration/a-capability-is-read-only` states the refusal of a capability whose nature is not read-only as an HTTP 422 response reporting a CapabilityNotReadOnlyError, and the decision-log entry at that node's own location and `statement` field is the entry that decided both the status and the error value.
No entry anywhere in the log relocates, narrows or supersedes it, and no other candidate names this refusal.
The log's own split holds the same way: 422 is recorded for a well-formed request whose content would violate an invariant, and 409 only for an operation the target's current state forbids.
A registration refused for a nature that is not read-only is content violating the invariant, so the 422 the three criteria name is the specification's own value, including for a save that replaces a registration already standing, register-capability being one create-or-replace write over which the rule draws no distinction.
Recorded so the caller can see the succession question was settled from the log rather than from proximity of wording.

ADVISORY, from the specification — `domain/investigation/field-semantics` governs what is read out of a capability's output schema and bears on neither the refusal status nor the refusal statement this task's objective and criteria concern, so this task implements nothing against it and its coverage is answered by this epic's output-schema entry task.

REMAINDER, from the specification — `rules/integration/a-submitted-registration-states-its-outcome-to-the-operator` also requires, of the same surface, that where the registry answers that the registration was made the surface states that it was made and names the capability at the name and version submitted.
No criterion of this task reaches that clause; all three are about the refusal branch alone, and the success branch belongs to the work over the same outcome proof's registered outcome.

REMAINDER, from the specification — that same rule's statement runs over both registries, governing a registration submitted through register-connector and naming the connector configuration under the connector name submitted, and constraining `domain/integration/connector-configuration` as well as `domain/integration/capability`.
No criterion of this task reaches the connector-configuration half, which belongs to the work delivering that surface's outcome statement.

REMAINDER, from the specification — that same rule's statement closes with two further clauses no criterion here reaches: that neither outcome is stated of a submission the registry has not answered, and that the registered and refused outcomes never read alike.
Criterion 3 holds a named condition apart from a refusal whose condition the surface does not recognise, which is a different distinction from either, and both belong to the work over what the capability surface states while a submission stands unanswered.

REMAINDER, from the specification — `rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it` states five claims a surface offering entry of a capability registration's output schema must make at that entry, plus a prohibition on any sixth claim, on a worked example of its own, and on refusing anything on those grounds.
No clause of it reaches any criterion of this task, which concerns only the status of a refusal stand-in and the refusal statement the operator gets; it belongs to this epic's output-schema entry task.

REMAINDER, from the specification — `rules/glossary/a-description-states-meaning-never-policy` reaches no criterion of this task, and its log entry at the output-schema rule's location records expressly that the rule was not widened and keeps its own scope: what a description says, not what a screen says.
It is a source of the new rule's guidance rather than absorbed by it, and it belongs to this epic's output-schema entry task, where its claim is restated to the operator.
