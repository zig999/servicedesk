---
title: Disclose a malformed capability to the composing curator
summary: The Subject region's disclosure of every capability whose stored input schema holds no well-formed
  shape.
rationale: Cut on the panel side of that same seam, so what the curator is told is reviewed apart from
  what the state carries.
sources:
- work/case-simulation-input-requirements/intake/scope.md
objective: Where the pinned version's read names a capability holding no well-formed input schema, the
  Subject region discloses that capability's identity to the person composing the subject.
criteria:
- Each capability the state carries apart from its field set is disclosed by its own name and version
  where the subject is composed.
- The presence of such a capability does not refuse the simulate-case or the simulate-hypothesis dispatch.
- The presence of such a capability removes no input from the presented requirement set.
- A read naming no such capability discloses nothing in its place.
depends_on:
- task/subject-input-requirements/expose-malformed-capability-identities
implements:
- domain/integration/capability
- domain/knowledge/case-input-requirement
- rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability
- scenarios/investigation/a-malformed-capability-is-disclosed-to-the-composing-curator
---

## What it is
The one thing that tells a curator why a concept in this version's plan is asking them for nothing at all.
It is stated as an identity, name and version, which is what an operator needs to find and re-register the capability.

## Notes
rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability states this is a disclosure and not a refusal, so the second and third criteria assert only that this rule refuses and removes nothing.
UNDERDETERMINED, from the specification -- criterion 1 forbids nothing beyond the disclosure itself; domain/knowledge/case-input-requirement states that such a capability is named "apart from the attributes instead, by identity, and that is the whole of what reaches the person composing a subject about it", so a passing implementation must not also show that capability's connector or answered concept beside its name and version -- identity alone is the whole of the disclosure.
UNDERDETERMINED, from the specification -- no criterion names where the disclosed set comes from; a passing implementation must disclose exactly the set the sibling task carried from the case-input-requirements read, never a second, independently-derived set that happens to agree.
REMAINDER, from the specification -- rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability's diagnose limb reaches no criterion of this task, whose criteria name only the simulate-case and simulate-hypothesis dispatches.
Belongs: the subject-assembly surface that precedes a diagnose call.
Advisory: criterion 3 is a preservation condition over the presented requirement set that rules/investigation/a-composed-subject-presents-every-case-input-requirement states, which this task does not implement; the criterion is demonstrable only where that presentation already stands.
Advisory: the objective and criterion 4 both rest on a read this task consumes and does not implement; nothing here states how that answer is produced, and nothing here should.
