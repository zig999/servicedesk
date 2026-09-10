---
type: invariant
statement: >-
  An operator-facing surface presenting the connector configuration registered under one
  named connector, first presented already holding the answer of an earlier read of that
  configuration, issues a further read of that configuration on being first presented, the
  held answer standing presented meanwhile.
expression: >-
  For a connector name n and a surface s presenting the connector configuration registered
  under n, where s holds at the moment it is first presented the answer of an earlier read of
  that configuration: s issues one further read-connector-configuration of the configuration
  registered under n at that moment, whichever surface obtained the held answer and however
  long ago it arrived, and presents the held answer while that further read is outstanding.
constrains:
- domain/integration/connector-configuration
---

## Description

A surface presenting the connector configuration registered under a connector name can be first presented already holding the answer an earlier read obtained, and no node said whether such a surface reads again or rests on what it holds.

It reads again, because the answer it holds is content the registry may have replaced since it arrived, and nothing on the surface says whether it has.
`register-connector` is create-or-replace and `domain/integration/connector-configuration` is replaced whole on every edit, so an operator who edits from an answer the registry no longer holds and submits writes older content back over newer in one total write; the further read is what puts the current registration in front of them before that can happen.
How long an answer stays in hand beyond the surface that read it is decided by no node, so the further read is issued on every such presentation, however fresh the held answer.

This decides that the further read is issued, and when, and nothing beyond it.
Which reading the surface stands in while that read is outstanding, and what it presents once the read answers, fails or is refused, are the sibling rules' own; whether the surface states that a further read is under way is stated by no node; and which control carries anything, its wording and its placement are the interface's own.
