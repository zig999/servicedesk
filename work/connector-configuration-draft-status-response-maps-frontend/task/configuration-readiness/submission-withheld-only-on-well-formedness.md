---
title: Readiness statements withhold nothing but the one act well-formedness withholds
summary: The act submitting a registration is withheld exactly while the surface's judgment finds the
  field's content not a well-formed JSON object, and by no other readiness statement.
rationale: Cut as its own task because it is the bound over the four statements rather than one of them,
  and a bound is falsified by what the other statements do rather than by what any one of them says.
objective: The act submitting a registration through register-connector is withheld exactly while the
  surface's own judgment finds the Configuration field's content not well-formed JSON object text.
criteria:
- While the surface's own judgment finds the field's content not well-formed JSON object text, no act
  submitting a registration through register-connector is offered.
- While that act is withheld, the statement that judgment owes stands in the act's place.
- A stated departure from what the HTTP connector requires does not withhold the act submitting a registration.
- A stated subject placeholder no registered capability declares does not withhold the act submitting
  a registration.
- A stated credential placeholder does not withhold the act submitting a registration.
- A stated responseMap key no registered capability reads does not withhold the act submitting a registration.
- A stated output schema property no responseMap key names does not withhold the act submitting a registration.
depends_on:
- task/configuration-readiness/http-departure-statements
- task/configuration-readiness/subject-placeholder-statements
- task/configuration-readiness/credential-placeholder-statement
- task/configuration-readiness/response-map-capability-coverage
sources:
- intake/scope.md
implements:
- rules/integration/a-connector-configuration-surface-offers-no-submission-while-its-content-is-not-well-formed
- rules/integration/a-connector-configuration-surfaces-readiness-statements-carry-no-claim-no-rule-decides
- scenarios/integration/a-status-map-ending-outside-the-vocabulary-is-stated-before-the-write
---

## What it is
The line between a statement and a refusal, drawn once over the whole panel.
Well-formedness is the one outcome certain on the surface, so it is the one act withheld there.

## Notes
A surface that withheld the write over a reading the registry does not itself make would refuse what the registry accepts.
The registry decides a subject placeholder against the capabilities standing at the moment of the write, and accepts a method outside the vocabulary and a key no capability reads.
UNDERDETERMINED, from the specification -- The clause of rules/integration/a-connector-configuration-surfaces-readiness-statements-carry-no-claim-no-rule-decides reading "the surface refusing nothing on any of them" is wider than this task's criteria, which bound only the act submitting a registration through register-connector. Every criterion can hold while the surface refuses or disables some other act it offers over the same content on the strength of one of the four readiness statements, and that clause forbids it.
A surface that keeps the act submitting a registration offered over all four readiness statements -- satisfying criteria 3 through 7 -- but withholds or refuses another act it offers over the same Configuration field content, such as the configuration-helper draft request or a test, while a subject placeholder no registered capability declares, an HTTP-connector departure or a responseMap key no capability reads stands stated, satisfies every criterion as written while the readiness rule refuses it.
REMAINDER, from the specification -- The opening clause of rules/integration/a-connector-configuration-surfaces-readiness-statements-carry-no-claim-no-rule-decides' statement -- that every statement the four rules have a surface make is a condition the registry, the HTTP connector or an observation itself already decides -- reaches no criterion of this task. Belongs to the four sibling tasks of this epic, each of which carries the statement whose criterion that clause holds to an authority the surface does not supply.
ADVISORY, from the specification -- The governing scenario is shared: its second then ("the act submitting the registration stays offered") is this task's criterion 3 verbatim, which is why it is named in implements; its first then, that the surface states the statusMap entry naming an ending outside the vocabulary, is the HTTP-departure task's own, which this task already depends on.
ADVISORY, from the specification -- rules/integration/a-connector-configuration-surface-judges-its-configuration-fields-content is deliberately left out of implements. Its Description expressly holds the withholding question outside itself, and the well-formedness rule returns the partition (what the surface states about the content is the judgment rule's own). This task's objective and criteria take the surface's own judgment and the statement it owes as already standing, so the judgment rule neighbors rather than governs.
