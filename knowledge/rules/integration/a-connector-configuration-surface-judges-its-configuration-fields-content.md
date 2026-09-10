---
type: invariant
statement: >-
  A surface presenting or editing a connector configuration judges, by the criterion
  a-connector-configuration-holds-a-well-formed-object already fixes, whether the content its
  Configuration field currently holds is well-formed JSON object text, and states to the
  operator that the field's content is not a well-formed JSON object exactly where its own
  judgment finds it is not — stating nothing to that effect where its judgment finds it well
  formed, and never stating it as, in place of, or indistinguishably from any of the four
  readings of the read of that configuration.
expression: >-
  For a surface s presenting or editing the connector configuration registered under a
  connector name n, and the content c its Configuration field holds at a given moment —
  whether c arrived from a read that returned, from a draft the operator applied, or from the
  operator's own typing: where c is not syntactically valid JSON object text by the criterion
  rules/integration/a-connector-configuration-holds-a-well-formed-object fixes, unparsable
  text, an empty field, a null value and an array included, s states to the operator that the
  Configuration field's content is not a well-formed JSON object; where c is such text, s
  states nothing to that effect and no such statement stands anywhere on s. s reaches that
  statement from c alone and states nothing about what the registry answered or refused. That
  statement is distinguishable to the operator from each of the four readings
  a-presented-connector-configuration-states-an-outstanding-or-failed-read and
  a-presented-connector-configuration-states-a-connector-name-nothing-is-registered-under
  state, is never presented as one of them, and never stands in place of one. s states it of
  no content its Configuration field does not hold.
constrains:
- domain/integration/connector-configuration
---

## Description

`domain/integration/connector-configuration` is opaque text an operator authors directly, and `a-connector-configuration-holds-a-well-formed-object` states the one thing that text must be — syntactically valid JSON object text, a null value and an array excluded — refused at the registry with an HTTP 422 reporting a ConnectorConfigurationNotWellFormedError.
What the surface the operator authors and edits that text on states about the text in front of them was stated nowhere.
`a-presented-connector-configuration-states-an-outstanding-or-failed-read` and `a-presented-connector-configuration-states-a-connector-name-nothing-is-registered-under` state what that screen states about the read of the configuration in each of its four readings, and neither says anything about the content the field then holds; `a-submitted-registration-states-its-outcome-to-the-operator` states what the operator is told once the registry has answered a submission, which is after the fact this decides; the helper rules — `a-connector-configuration-authoring-surface-offers-a-configuration-helper`, `applying-a-drafted-configuration-changes-only-the-local-edit`, `the-configuration-field-is-untouched-by-a-drafts-arrival` — move content into that field and state nothing about judging it.
So whether the surface judged the field at all, and what it said when it did, fell to whatever the interface happened to render.

The surface judges, because the operator authoring this text is the one person who can still fix it and the only moment they can fix it cheaply is before the write.
A configuration that reads to them as ordinary text is exactly the text `a-connector-configuration-holds-a-well-formed-object`'s own Description says a human can now write and a runtime call would fail on; a surface that says nothing leaves that operator to learn it from a refused submission, or — where the content came back from a read rather than from their own typing — never to learn it at all, while editing over content the registry will not take.
Content a returned read carries can be short of the criterion even now: the criterion admits a registration supplied as an object and answers it as text, and configurations registered before that rule existed were never held to it, exactly the posture `a-capability-input-schema-holds-a-well-formed-object` already takes toward a stored schema written before its own shape was demanded.

It judges by the registry's criterion and by no other, so that the surface promises no check the registry does not perform — the bound `an-output-schema-entrys-statement-carries-no-sixth-claim` holds over the sibling registry's own entry surface, held here for the same reason: a surface that refused what the registry accepts, or accepted what the registry refuses, would be a second home for the well-formedness fact and would state to the operator something no node holds.
Stating nothing where the content is well formed is the other half of one condition and not a second decision: a statement that stands over content the criterion accepts teaches the operator that a configuration the registry will take is somehow wrong, which is the same misreading in the other direction.

It is a fact rather than form on this specification's own line — it changes what the operator can learn about the text they are about to submit, not how that text looks — so which control carries the statement, its wording, how many controls carry it and where they sit are the interface's own, exactly as every surface rule here leaves them.
The statement is held apart from the four readings of the read for the reason those four are held apart from each other by `a-presented-connector-configurations-four-readings-are-mutually-distinguishable`: a surface that reads identically in materially different situations tells its reader nothing about which one they are in, and content that is not well formed is neither a read still outstanding, nor a read that failed, nor a name nothing is registered under — the acts it asks for differ from all three, being an edit of the text itself.

Nothing about the read's own presentation moves.
`a-presented-connector-configuration-states-an-outstanding-or-failed-read` states that a returned read is presented as the answer carried it and that the screen states no value that answer did not carry; a statement about the well-formedness of the field's content is a statement about that content and not a value of connector or configuration, so it stands beside that presentation without altering it.
Whether the surface withholds a submission of content its judgment finds short of the criterion, whether the acts the surface offers over that content are offered on both judgments alike, and what the registry answers a caller, are each no part of this.
An invariant over `domain/integration/connector-configuration`, immediate and inside that one aggregate — the shape and home every sibling fact about this surface already takes, a new rule rather than the api contract, which cannot declare a presentation, or the domain element, which declares what a configuration is and not what a surface states about the text of one.
