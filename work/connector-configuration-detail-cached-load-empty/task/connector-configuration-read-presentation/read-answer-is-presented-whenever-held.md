---
title: A read connector configuration is presented whenever the read has answered
summary: The connector configuration screen presents the configuration the registry answered, whether that answer
  arrived after the screen mounted or was already held when it mounted.
objective: An operator opening the connector configuration screen for a connector whose read has answered sees the
  connector name and the configuration exactly as the read answered them, with the screen's edit, discard and test
  surfaces resting on that same answer, regardless of whether the answer arrived after the screen mounted or was
  already held by the client when it mounted.
criteria:
- Where the read's answer is already held by the client before the screen's first render, the screen presents the
  connector name and the configuration exactly as the read answered them.
- Where the read's answer arrives only after the screen's first render, the screen presents the connector name and
  the configuration exactly as the read answered them.
- Where the read's answer is already held before the first render and it carries a well-formed JSON object, the
  screen states no malformed-configuration condition.
- Where the read's answer is already held before the first render and the operator has not changed any field away
  from what the read answered, the screen offers no discard act and no register act.
- Where the read's answer is already held before the first render and the operator has changed the configuration
  away from what the read answered, the discard act, once the operator states in a further explicit act that it
  is to be performed, returns the configuration to exactly what the read answered.
- Where the read's answer is already held before the first render, the test surface derives its subject attributes
  from the placeholders of the configuration the read answered.
implements:
- domain/integration/connector-configuration
- rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read
- rules/integration/a-connector-configuration-answer-already-held-stands-presented-while-a-further-read-is-outstanding
- rules/integration/a-presented-connector-configurations-fields-carry-the-answer-from-the-moment-that-reading-is-entered
- rules/integration/a-connector-configuration-surface-judges-its-configuration-fields-content
- rules/integration/a-presented-connector-configuration-with-no-edit-offers-no-discard-and-no-submission
- rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
- rules/integration/a-presented-connector-configurations-test-collects-values-for-the-attributes-the-presented-answer-names
sources:
- intake/scope.md
---

## What it is

The correction of one wrong behavior observed by running the delivered system: the connector configuration screen presents an empty Configuration field, states it malformed, withholds Beautify, Save and Discard, and hands the Test panel an empty registered configuration, when the registry's answer to its read was already held by the client at the moment the screen was first rendered.
The proof owed is a proof that fails when the defect returns, which means mounting the screen with the read's answer already in the query client before the first render, and keeping the case where the answer arrives after mount, which works today and must go on working.

## Notes

UNDERDETERMINED, from the specification — criterion 2 is stated over a screen whose answer arrives only after the screen's first render, so the screen necessarily stands, before that arrival, in the window rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read states over a read that has not yet answered the screen, and no criterion reaches what the screen states there.
Passes: a screen that, from mount until the read answers, presents empty connector and configuration fields and no statement that the configuration is still being read, and fills those fields exactly from the answer when it arrives.

UNDERDETERMINED, from the specification — the clause of rules/integration/a-connector-configuration-answer-already-held-stands-presented-while-a-further-read-is-outstanding that has the screen state nothing to the effect that the configuration is still being read and stand in none of the other three readings reaches no criterion; criteria 1 and 2 constrain only what the fields carry.
Passes: a screen that presents the held answer's connector name and configuration in the fields while also showing the operator that the configuration is still being read, the returned reading and the outstanding reading presented together.

UNDERDETERMINED, from the specification — criterion 5 requires the discard to return the configuration to what the read answered, while rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface states that the act sets every field of the surface to the content that answer carries, the connector-name field included.
Passes: a discard that restores the configuration field to the answer's configuration while leaving the connector-name field holding what the operator typed over it.

UNDERDETERMINED, from the specification — criterion 5's "exactly what the read answered" is read as the answer held before the first render, but rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface returns the fields to the registration the surface last read and grants the held answer that standing only where the surface issued no read of that registration itself; where the screen issued its own further read that has since answered, the held answer is no longer what the act returns to, while rules/integration/a-connector-configuration-read-answering-over-an-unsubmitted-edit-leaves-that-edit-standing keeps the operator's edit in the fields meanwhile.
Passes: a discard that always returns the fields to the answer the screen was first presented holding, even where the surface issued a read of its own that has since answered with different content.

UNDERDETERMINED, from the specification — criterion 3 reaches only the silent half of rules/integration/a-connector-configuration-surface-judges-its-configuration-fields-content, well-formed content and no statement; the half that owes the statement where the field's content is not well-formed JSON object text, distinguishably from the four readings of the read, reaches no criterion, and a held answer's configuration can fall short of the criterion, as that rule's own Description records for configurations registered before the criterion existed.
Passes: a screen that presents a held answer whose configuration is not well-formed JSON object text and states no malformed-configuration condition at all, or states it indistinguishably from the outstanding, failed, refused or returned reading of the read.

REMAINDER, from the specification — the failed-window clause of rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read, that the screen states explicitly that the configuration could not be read, presents no connector or configuration value, and carries an action re-issuing that same read, no read being re-issued except by the operator's act, reaches no criterion of this task.
Belongs: the task covering the readings of this screen in which no answer stands, the failed read and its operator-initiated re-issue, with rules/integration/a-failed-connector-configuration-read-is-reissued-only-on-the-operators-act.

REMAINDER, from the specification — rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface is one policy decided for two registries; its clauses over the capability registered at a name and version, over domain/integration/capability and over register-capability reach no criterion of this task, which is stated only over the connector configuration screen.
Belongs: the task implementing the same discard on the capability surface, over domain/integration/capability.

REMAINDER, from the specification — the second clause of rules/integration/a-presented-connector-configurations-test-collects-values-for-the-attributes-the-presented-answer-names, that where the configuration read at the moment of the test names a set of Subject attributes other than the set collected for, the screen states that the registration changed since the answer being presented and that the test exercised a configuration those values were not collected for, distinguishably from and never in place of what the test answered, reaches no criterion of this task; criterion 6 reaches only the collection at the presented answer.
Belongs: the task covering the act of issuing the test from this screen and what it states back to the operator, not the presentation of the answer at first render.

REMAINDER, from the specification — rules/integration/a-connector-configuration-answer-is-retained-sixty-seconds-past-the-surface-that-read-it is what makes the condition every criterion here is premised on ever obtain, but none of its clauses reaches a criterion: the sixty-second bound from the moment of arrival, the latest arrival being the answer in hand, and a failed or refused read putting nothing in hand are all unreached.
Belongs: the task implementing the client-side retention of a read answer and its sixty-second bound, over rules/integration/a-connector-configuration-answer-is-retained-sixty-seconds-past-the-surface-that-read-it.

ADVISORY, from the specification — the criteria all stop at the first render and its immediate aftermath, so three candidates governing the same screen once a second answer of the same configuration reaches it are unreached: rules/integration/a-further-connector-configuration-answer-becomes-what-a-screen-holding-no-edit-presents, rules/integration/a-connector-configuration-read-answering-over-an-unsubmitted-edit-leaves-that-edit-standing and rules/integration/a-held-connector-configuration-answer-stands-presented-through-a-failed-further-read-but-not-a-refused-one.
Which of them the delivered screen must satisfy follows from a fact the specification does not state and this plan left undecided by the human's decision: whether a surface first presented already holding the answer of an earlier read of that configuration issues a further read of that configuration.

ADVISORY, from the specification — the binder classed the fact just named as unstated on its eleventh reading; the human paused the decided-fact route after twelve facts and had this task composed with that one open, so it is recorded here as a watch item rather than settled downstream, and temp/plan-work-corrective-nonconvergence-report.md carries the eleven rounds, their telemetry and the reasoning.
An executor meeting that fact stops and hands it back rather than deciding it in source.
