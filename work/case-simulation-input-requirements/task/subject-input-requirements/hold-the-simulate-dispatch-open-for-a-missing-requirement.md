---
title: Hold the simulate dispatch open where a requirement's own input is empty
summary: The cockpit's simulate-case and simulate-hypothesis gate, stripped of every reason to refuse
  that a requirement's own empty input used to give it.
rationale: Cut apart from the derivation because what a field carries and what refuses a dispatch change
  for different reasons, and this outcome is demonstrable against the gate alone once the fields carry
  their flags.
sources:
- work/case-simulation-input-requirements/intake/scope.md
objective: Neither the simulate-case nor the simulate-hypothesis dispatch is refused by this screen because
  a case-input-requirement's own input is empty.
criteria:
- With a requester and at least one attribute-value present, a required requirement's own empty input
  does not refuse the simulate-case dispatch.
- With a requester and at least one attribute-value present, a required requirement's own empty input
  does not refuse the simulate-hypothesis dispatch.
- A requirement's mere presence in the derived set is never a reason either dispatch is refused.
- A subject holding no attribute-value at all does not dispatch.
- The requester's own emptiness still refuses the dispatch, unchanged from what is delivered today.
- A dispatch already running still refuses a second one, unchanged from what is delivered today.
depends_on:
- task/subject-input-requirements/derive-subject-fields-from-input-requirements
implements:
- domain/investigation/subject
- rules/investigation/a-simulated-subject-missing-a-requirement-degrades-not-refuses
- rules/investigation/a-composed-subject-presents-every-case-input-requirement
- rules/investigation/a-simulation-carries-its-requester
- rules/investigation/a-pending-simulation-call-is-not-dispatched-again
- rules/investigation/a-subject-carries-at-least-one-attribute
---

## What it is
The one change to what this screen refuses: readiness stops counting requirement inputs, and keeps counting the requester and the invariant that a subject carries at least one attribute-value.
Both dispatch paths read the same readiness, so the change is made once in the state the cockpit gates on.

## Notes
UNDERDETERMINED, from the specification -- rules/investigation/a-composed-subject-presents-every-case-input-requirement requires each presented input to carry its own requirement's required flag through unchanged; a passing implementation must not remove that flag from what is presented merely because it no longer gates the dispatch.
UNDERDETERMINED, from the specification -- rules/investigation/a-pending-simulation-call-is-not-dispatched-again keys the dispatch guard by the operation and the subject together; a passing implementation must not use one screen-wide pending flag that blocks a simulate-hypothesis dispatch while a simulate-case call is pending (or the reverse), and must not block a dispatch for a differently composed subject.
UNDERDETERMINED, from the specification -- the same rule states the guard releases as soon as the pending call ends, whether it ended in a result or in a refusal; a passing implementation must not leave the operation undispatchable after a call that ended in a refusal.
REMAINDER, from the specification -- rules/investigation/a-composed-subject-presents-every-case-input-requirement's own presentation and disclosure clauses (one input per requirement, naming every asking capability, disclosing an empty requirement set) reach no criterion of this task, which addresses only what refuses a dispatch.
Belongs: the task that presents the pinned case version's case-input-requirement inputs on the simulate composing screen.
REMAINDER, from the specification -- rules/investigation/a-simulated-subject-missing-a-requirement-degrades-not-refuses's own collection-degradation clause reaches no criterion of this task: this screen dispatches, it does not collect.
Belongs: the simulate-case / simulate-hypothesis collection behind contracts/investigation/case-simulation.
REMAINDER, from the specification -- rules/investigation/a-simulation-carries-its-requester locates the requester refusal at the call's own route; this screen's own criterion holds the dispatch back before any request is issued, so the route-side refusal is reached by no criterion here.
Belongs: the backend simulate-case and simulate-hypothesis route.
REMAINDER, from the specification -- rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability reaches no criterion of this task, which addresses only what refuses a dispatch.
Belongs: the task that discloses a malformed capability's identity on the simulate composing screen.
REMAINDER, from the specification -- rules/investigation/a-subject-attribute-is-drawn-from-the-glossary and rules/investigation/a-subject-holds-one-value-per-attribute each state a condition over which attributes a composed subject may name or how a duplicate resolves; no criterion of this task concerns either.
Belongs: the task that assembles the composed subject's attribute-values.
Advisory: a case version whose every case-input-requirement is required and whose every input is left empty is both a subject with no attribute-value and a subject omitting attribute-values requirements name required; rules/investigation/a-subject-carries-at-least-one-attribute makes it no subject at all, so there is no call for rules/investigation/a-simulated-subject-missing-a-requirement-degrades-not-refuses to keep from refusal -- the criteria as cut already avoid the collision by conditioning the first two on at least one attribute-value being present.
