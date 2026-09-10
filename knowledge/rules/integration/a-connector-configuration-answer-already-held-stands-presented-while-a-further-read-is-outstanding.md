---
type: invariant
statement: >-
  An operator-facing screen presenting the connector configuration registered under one
  named connector that already holds the answer of an earlier read of that configuration at
  the moment it is first presented stands in the reading a read that returned stands in
  rather than the reading an outstanding read stands in, and presents the connector name and
  the configuration exactly as that held answer carries them, for as long as a further read
  of that same configuration is outstanding.
expression: >-
  For a connector name n and a screen s presenting the connector configuration registered
  under n through read-connector-configuration: where s holds, at the moment it is first
  presented, the answer of an earlier read of the configuration registered under n, and a
  further read of that same configuration is outstanding, s stands in the returned reading
  a-presented-connector-configuration-states-an-outstanding-or-failed-read states and in
  none of the other three readings of that read, states connector and configuration as that
  held answer carries them and no value that answer did not carry, and states nothing to the
  effect that the configuration is still being read; no screen holding such an answer stands
  in the outstanding reading.
constrains:
- domain/integration/connector-configuration
---

## Description

`read-connector-configuration` of `contracts/integration/connector-configuration-registry` can reach this screen a second time over the same connector name: the configuration was read a moment ago, its answer is still held, and the screen is first presented already holding it while a further read of that same configuration is outstanding.
`a-presented-connector-configuration-states-an-outstanding-or-failed-read` states three windows over "the read" and `a-presented-connector-configuration-states-a-connector-name-nothing-is-registered-under` a fourth, and none of the four was written for a screen holding one answer while another read of the same configuration is outstanding: read strictly, the outstanding reading claims that screen, a read of that configuration having not returned, and the returned reading claims it too, a read of that configuration having returned and its answer being what the screen holds.
One situation claimed by two readings is exactly what `a-presented-connector-configurations-four-readings-are-mutually-distinguishable` forbids the operator to be shown, so which reading they met — and whether they were shown the configuration at all — fell to whatever the interface happened to render.

It is the returned reading, because the outstanding reading exists for an interval this screen is not in.
`a-presented-connector-configuration-states-an-outstanding-or-failed-read`'s own Description names that window as the one in which nothing about the configuration is known, and tells it apart from the failed window because the operator's next act differs across them — an outstanding read settles on its own and is worth waiting for, a failed one settles only if made again.
A screen holding an earlier answer knows what the registry answered and asks the operator neither act; nothing about the configuration is unknown to it, so the premise the outstanding window rests on is absent.

The held answer is presented, because withholding it puts a blank where the registry answered.
That is the one misreading both neighbouring rules refuse in terms: a connector configuration is opaque text an operator authors and edits, so a blank reads to them exactly like a configuration holding nothing.
Here it is worse than in either window those rules cover, because the operator can act on the blank: `domain/integration/connector-configuration` is replaced whole on every edit, so an operator who edits over a blank the registry never answered and submits it replaces a configuration that was standing with content the registry did answer for.
Stating that the configuration is still being read over an answer the screen holds would in the same act present the returned reading as the outstanding one, which `a-presented-connector-configurations-four-readings-are-mutually-distinguishable` refuses.

This decides which reading that screen stands in and what it presents there, and nothing beyond it.
Whether the screen states to the operator at all that a further read is under way — a statement of its own, no part of the four readings — is no part of this; what the screen presents once that further read answers, fails or is refused stays the neighbouring rules' own, each stated over the read that then answers; the well-formedness statement `a-connector-configuration-surface-judges-its-configuration-fields-content` owes is reached from the field's content alone and is untouched; and which control carries anything, its wording and its placement stay the interface's own, exactly as every surface rule here leaves them.
An invariant over `domain/integration/connector-configuration`, immediate and inside that one aggregate — the home and shape every sibling fact about this surface already takes, a new rule rather than the api contract, which cannot declare a presentation, or the domain element, which declares what a configuration is and not what a screen states about reading one.
