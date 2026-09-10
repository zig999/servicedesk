---
type: invariant
statement: >-
  An operator-facing screen presenting the connector configuration registered under one
  named connector, first presented already holding the answer of an earlier read of that
  configuration and holding no field the operator has changed away from that held answer,
  goes on presenting the connector name and the configuration exactly as that held answer
  carries them and stands in the reading a read that returned stands in where a further
  read of that same configuration fails, and stands instead in the reading a read refused
  because nothing is registered under that connector name stands in, presenting no
  connector or configuration value, where that further read is refused because nothing is
  registered under that connector name.
expression: >-
  For a connector name n and a screen s presenting the connector configuration registered
  under n through read-connector-configuration of
  contracts/integration/connector-configuration-registry, where the answer s presents is
  the answer of an earlier read of the configuration registered under n that s held at the
  moment it was first presented and every field of s holds exactly what that held answer
  carried: where a further read of that same configuration fails, s stands in the returned
  reading a-presented-connector-configuration-states-an-outstanding-or-failed-read states
  and in none of the other three readings of that read, states connector and configuration
  as that held answer carries them and no value that answer did not carry, and states
  nothing to the effect that the configuration could not be read; where that further read
  is instead refused because nothing is registered under n — the refusal
  a-connector-configuration-read-by-an-unregistered-name-is-refused states — s stands in
  the reading
  a-presented-connector-configuration-states-a-connector-name-nothing-is-registered-under
  states and in none of the other three readings of that read, states that nothing is
  registered under n, and states no value of connector or configuration, that held answer
  being presented no further. Nothing here turns on how that further read came to be
  issued, on how it failed, or on which control carries anything.
constrains:
- domain/integration/connector-configuration
---

## Description

`read-connector-configuration` of `contracts/integration/connector-configuration-registry` can be issued a second time over one connector name while this screen is already presenting an answer of that same configuration, and that further read need not answer: it can fail, and it can come back refused because nothing is registered under that connector name.
`a-connector-configuration-answer-already-held-stands-presented-while-a-further-read-is-outstanding` places a screen first presented already holding an earlier answer of that configuration in the returned reading presenting that held answer while such a further read is outstanding, and expressly leaves what the screen presents once that further read fails or is refused to be stated elsewhere; `a-further-connector-configuration-answer-becomes-what-a-screen-holding-no-edit-presents` decides only the case in which that further read answers and says in terms that the failed and refused cases are no part of it, as does `a-connector-configuration-read-answering-over-an-unsubmitted-edit-leaves-that-edit-standing`; and the failed window of `a-presented-connector-configuration-states-an-outstanding-or-failed-read` is stated over "the read", written for a screen that holds no answer at all, so read strictly it claimed this screen while the returned reading claimed it too, a read of that configuration having returned and its answer being what the screen holds.
One situation claimed by two readings is exactly what `a-presented-connector-configurations-four-readings-are-mutually-distinguishable` forbids the operator to be shown, so whether they went on seeing the registered configuration or met a screen reporting a read that could not be made fell to whatever the interface happened to render.

A failed further read leaves the held answer presented, and the screen in the returned reading, because a failure is not an answer about the configuration.
`a-presented-connector-configuration-states-an-outstanding-or-failed-read`'s own Description names its failed window as the one in which nothing about the configuration ever will be known unless the read is made again, and tells it from the outstanding window because the operator's next act differs across them.
A screen holding an earlier answer of that configuration knows what the registry answered; nothing about the configuration is unknown to it, so the premise that window rests on is as absent here as it is in the outstanding case the answer-already-held rule already decided on exactly this reasoning, and the same narrowing is owed the failed window as was owed that one.
Withholding the held answer there puts a blank where the registry answered: a connector configuration is opaque text an operator authors and edits, so a blank reads to them as a configuration holding nothing, and since `domain/integration/connector-configuration` is replaced whole on every edit and `register-connector` is create-or-replace, an operator who edits over that blank and submits replaces a standing configuration with content the registry never answered.
That the operator loses the offer to re-issue a read the failed window would have carried costs them nothing they need: `a-failed-connector-configuration-read-is-reissued-only-on-the-operators-act` keeps a failed read the operator's own to ask for and is untouched, and the screen is showing the configuration rather than nothing while it waits to be asked.

A refused further read is the other case, because the refusal is the registry's own definite answer that nothing is registered under that connector name.
`a-presented-connector-configuration-states-a-connector-name-nothing-is-registered-under` states that refusal as a reading of its own precisely because it settles nothing to make the read again — the registry answers it for as long as nothing is registered under that name — and `a-presented-connector-configuration-offers-its-test-on-the-reading-that-answered` reads it the same way, as the reading on which the name holds nothing.
Going on presenting the held answer there shows the operator, as the registration in front of them, content the registry no longer holds: the harm `a-further-connector-configuration-answer-becomes-what-a-screen-holding-no-edit-presents` names in terms, worse here because `register-connector` is create-or-replace, so an operator editing from that answer and submitting writes back a registration the registry has answered it does not hold, and because the test that same screen offers on the returned reading would exercise a configuration nothing is registered under.
Presenting connector and configuration values while the registry answers that the name holds nothing would in the same act present the refused reading as the returned one, which `a-presented-connector-configurations-four-readings-are-mutually-distinguishable` refuses; and no blank is left unexplained, that reading stating explicitly that nothing is registered under the name.

This decides which reading that screen stands in and what it presents there, and nothing beyond it.
The half in which the operator has changed a field away from the held answer is no part of this — what a screen holding an unsubmitted edit presents where a further read fails or is refused stays to be stated, `a-connector-configuration-read-answering-over-an-unsubmitted-edit-leaves-that-edit-standing` deciding only what an arriving answer does to such an edit.
Whether the screen states to the operator at all that a further read was made, failed or was refused — a statement of its own, no part of the four readings — is no part of this, exactly as the answer-already-held rule leaves the statement that a further read is under way; what the screen presents where that further read answers stays `a-further-connector-configuration-answer-becomes-what-a-screen-holding-no-edit-presents`'s own; what the route answers a caller stays `a-connector-configuration-read-by-an-unregistered-name-is-refused`'s own; the acts each reading owes — the route to the listing, the return to origin, the discard, the submission and the test — stay their own rules', reached from their own conditions; the well-formedness statement `a-connector-configuration-surface-judges-its-configuration-fields-content` owes is reached from the field's content alone and is untouched; and which control carries anything, its wording and its placement stay the interface's own, exactly as every surface rule here leaves them.

An invariant over `domain/integration/connector-configuration`, immediate and inside that one aggregate — the home and shape every sibling fact about this surface already takes, a new rule rather than the api contract, which cannot declare a presentation, or the domain element, which declares what a configuration is and not what a screen states about reading one.

Disclosed as this route requires: the scope material under `work/connector-configuration-detail-cached-load-empty/intake/scope.md` describes an already delivered frontend and names its source files, so it is in part derived from code already written; read as data it reports an answer already held at mount being presented empty as an error and reports that read answering HTTP 200 with the full configuration, and it says nothing at all about a further read failing or being refused — the reasoning above rests on this specification's own standing rules, and a reviewer who rejects it rejects that reasoning.
