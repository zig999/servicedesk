---
type: invariant
statement: >-
  Where an operator-facing screen presenting the connector configuration registered
  under one named connector holds no field the operator has changed away from the
  answer it is presenting, the answer of a further read of that same configuration
  arriving there carrying content different from that answer becomes the answer the
  screen presents, so that the fields the operator edits and submits a registration
  from hold the connector name and the configuration exactly as that arriving answer
  carries them from the moment it arrives, and no part of the screen goes on
  presenting the answer it replaced.
expression: >-
  For a connector name n and a screen s presenting the connector configuration
  registered under n through read-connector-configuration of
  contracts/integration/connector-configuration-registry on the reading
  a-presented-connector-configuration-states-an-outstanding-or-failed-read states for a
  read that returned, where every field of s holds exactly what the answer s is
  presenting carried: the arrival at s of the answer of a further read of the
  configuration registered under n whose connector or configuration value differs from
  that presented answer's makes that arriving answer the answer s presents, so from the
  moment it arrives the field of s the operator edits the connector name in holds
  exactly the connector value that arriving answer carries, the field of s the operator
  edits the configuration in holds exactly the configuration value that arriving answer
  carries, s states no value that arriving answer did not carry, and neither those
  fields nor any other part of s goes on presenting a value of the answer it replaced.
  s stands in that same returned reading throughout, and every field of s then holds
  exactly what that arriving answer carried and no content the operator put there.
  Nothing here turns on how s was reached, on whether the answer s was presenting was in
  hand before s was first presented or arrived after it, on how that further read came
  to be issued, on which of the two values differs or by how much, or on which control
  carries either field.
constrains:
- domain/integration/connector-configuration
---

## Description

`read-connector-configuration` of `contracts/integration/connector-configuration-registry` can answer at this screen more than once over one connector name, and no node said which of two answers of the same configuration the screen presents once the second arrives.
`a-connector-configuration-answer-already-held-stands-presented-while-a-further-read-is-outstanding` places a screen first presented already holding an earlier answer in the returned reading presenting that held answer, and expressly leaves what it presents once that further read answers to be stated elsewhere; `a-presented-connector-configuration-states-an-outstanding-or-failed-read` states the returned reading over "the read", written for one answer and silent on which of two is the one presented; `a-presented-connector-configurations-fields-carry-the-answer-from-the-moment-that-reading-is-entered` holds the operator's own fields to the answer the screen presents from the first moment that reading is entered without deciding which answer that is once a second has arrived; and `a-connector-configuration-read-answering-over-an-unsubmitted-edit-leaves-that-edit-standing` decides only the other half, the screen whose fields the operator has changed away from the answer.
So the half in which the operator has changed nothing fell to whatever the interface happened to render: the same screen could go on presenting content the registry has since replaced, or take the newer answer, with the operator given nothing to tell which they were looking at.

The arriving answer is taken, because on this screen nothing is lost by taking it.
The reason the edited half goes the other way is stated there in terms: an unsubmitted edit exists on the screen and nowhere else, this specification publishes no operation that can answer it back, and so an edit overwritten is an edit gone.
Where no field has been changed away from the presented answer there is no such content anywhere on the screen — every field holds what a read answered — and the answer being replaced is either content the registry still holds, which a further read answers again for the asking, or content the registry no longer holds, which is precisely what the operator must not be shown as the registration in front of them.

Going on presenting the superseded answer is not neutral.
`register-connector` is create-or-replace and `domain/integration/connector-configuration` is replaced whole on every edit, so an operator editing from a configuration the registry has since replaced and submitting writes the older content back over the newer, in one total write, having been shown nothing that told them the registration had moved — the same harm `a-connector-configuration-answer-already-held-stands-presented-while-a-further-read-is-outstanding` and `a-presented-connector-configurations-fields-carry-the-answer-from-the-moment-that-reading-is-entered` each refuse when they insist the fields never carry content the registry did not answer, and the content `a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface` would then restore as the registration the surface last read.
The diagnostic compounds it: `a-presented-connector-configurations-test-collects-values-for-the-attributes-the-presented-answer-names` collects the operator's test values for exactly the Subject attributes the presented answer's placeholders name and owes a statement where the configuration read at the moment of the test names another set, so a screen keeping a superseded answer while a fresher one lies unread beside it manufactures that very divergence and sends the operator to the wrong act over a configuration it could have shown them.
A screen that refuses its own read's answer while nothing stands in its way leaves the read doing nothing at all: this screen never holds the configuration it presents, and everything it presents is drawn from a read issued to the registry.

Nothing else about this screen moves.
Which of the four readings the screen stands in stays `a-presented-connector-configuration-states-an-outstanding-or-failed-read`'s, `a-presented-connector-configuration-states-a-connector-name-nothing-is-registered-under`'s and `a-connector-configuration-answer-already-held-stands-presented-while-a-further-read-is-outstanding`'s own — the screen stands in the returned reading before and after; whether the screen states to the operator at all that a further read is under way, and what it presents where such a further read fails or is refused over an answer it is already presenting, are no part of this; the arriving answer over an edit the operator composed stays `a-connector-configuration-read-answering-over-an-unsubmitted-edit-leaves-that-edit-standing`'s own, and no act is created here, this asking the operator for nothing; because every field again holds exactly what the answer the screen presents carried, whether the discard and the submission are offered stays `a-presented-connector-configuration-with-no-edit-offers-no-discard-and-no-submission`'s own, reached from that condition of its own force; the well-formedness statement `a-connector-configuration-surface-judges-its-configuration-fields-content` owes stays reached from the field's content alone; and the helper, an applied draft under `applying-a-drafted-configuration-changes-only-the-local-edit` and the test are equally untouched.
Which control carries either field, its label, its order and its placement are form and belong to the interface, exactly as every surface rule here leaves them.

An invariant over `domain/integration/connector-configuration`, immediate and inside that one aggregate — the home and shape every sibling fact about this surface already takes, a new rule rather than the api contract, which cannot declare a presentation, or the domain element, which declares what a configuration is and not what a screen does with an answer about one.

Disclosed as this route requires: the scope material under `work/connector-configuration-detail-cached-load-empty/intake/scope.md` describes an already delivered frontend and names its source files, so it is in part derived from code already written; read as data it reports a read already answered at mount being presented empty as an error and reports that read answering with the full configuration, and it says nothing at all about a second answer carrying different content — the reasoning above rests on this specification's own standing rules, and a reviewer who rejects it rejects that reasoning.
