---
type: invariant
statement: >-
  An operator-facing screen presenting the connector configuration that a read of the
  configuration registered under one named connector answered holds, in the fields the
  operator edits and submits a registration from, exactly the connector name and the
  configuration content that answer carries — no field standing absent, standing empty
  or holding content drawn from anything but that answer — from the first moment that
  reading is entered and for as long as it stands, until the operator themselves changes
  them.
expression: >-
  For a connector name n and a screen s presenting the connector configuration registered
  under n that read-connector-configuration of
  contracts/integration/connector-configuration-registry answered: the field of s the
  operator edits the connector name in holds exactly the connector value that answer
  carries, and the field of s the operator edits the configuration in holds exactly the
  configuration value that answer carries, both from the first moment s stands in the
  reading a-presented-connector-configuration-states-an-outstanding-or-failed-read states
  for a read that returned and not from some later moment inside it — whether that answer
  was in hand before s was first presented or arrived after it. While s stands in that
  reading and until the operator changes a field themselves, neither field stands empty,
  stands absent, nor holds a value drawn from any source other than that answer: not a
  page of list-connector-configurations the caller already held, not a connector
  configuration draft, and not the content a register-connector submission carried. An
  edit the operator makes to a field is theirs and is no content of this reading; what
  this states is what those fields hold before and apart from any such edit, and what the
  arrival of a further read's answer does over such an edit stays
  a-connector-configuration-read-answering-over-an-unsubmitted-edit-leaves-that-edit-standing's
  own. Nothing here turns on how s was reached, on which control carries either field, or
  on that control's wording and placement.
constrains:
  - domain/integration/connector-configuration
---

## Description

`read-connector-configuration` of `contracts/integration/connector-configuration-registry` answers the configuration standing under a connector name, and `a-presented-connector-configuration-states-an-outstanding-or-failed-read` states that where that read returned the screen presents the connector name and the configuration exactly as the answer carried them and states no value that answer did not carry, while `a-connector-configuration-answer-already-held-stands-presented-while-a-further-read-is-outstanding` places a screen first presented already holding an earlier answer of that same configuration in that same returned reading.
Neither of them says that the fields the operator works in — the fields `register-connector` is submitted from, the fields `a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface` returns to the content the surface last read, the Configuration field `a-connector-configuration-surface-judges-its-configuration-fields-content` reaches its judgment from — are where that content stands, nor from which moment inside that reading they stand there.
`a-presented-connector-configuration-with-no-edit-offers-no-discard-and-no-submission` reasons from a condition in which every field of the screen holds exactly what that answer carried, without any node stating that the condition ever obtains; `a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface` presupposes fields the operator has changed away from what the read answered; `a-connector-configuration-surface-judges-its-configuration-fields-content` judges whatever content the field holds at a given moment and states expressly nothing about how it came to hold it.
So whether the operator's own fields ever carry the answer the screen is held to presenting, and from when, fell to whatever the interface happened to render.

The fields carry it, because on this screen the presentation and the authoring are the same fields.
`a-presented-connector-configuration-with-no-edit-offers-no-discard-and-no-submission` records that plainly — the screen presenting the answer is the same screen the operator edits and submits from — so a presentation satisfied anywhere but in those fields leaves the operator working in a blank while the screen shows a configuration the registry answered.
`domain/integration/connector-configuration` is replaced whole on every edit and `register-connector` is create-or-replace, so an operator editing over a blank and submitting replaces a configuration that was standing with content the registry never answered: exactly the harm `a-connector-configuration-answer-already-held-stands-presented-while-a-further-read-is-outstanding` refuses when it insists the held answer be presented rather than withheld, and exactly the harm `a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface` names in the opaque text an operator cannot retype from memory.

They carry it from the first moment that reading is entered, because the reading is entered only on the strength of an answer that already carries the values.
A field filled at some later moment inside it leaves the reading, for as long as that interval lasts, indistinguishable to the operator from the window in which nothing about the configuration is known — the one confusion `a-presented-connector-configurations-four-readings-are-mutually-distinguishable` holds these readings apart to prevent, and the confusion whose worse form the answer-already-held rule already refuses by name.
An empty Configuration field is worse than a blank here: `a-connector-configuration-surface-judges-its-configuration-fields-content` reaches its statement from the field's content alone, so a field that never received the answer draws the surface's own statement that the content is not a well-formed JSON object over a configuration the registry answered and holds well formed, telling the operator something untrue about the registration in front of them; and the acts that stand on those fields — the discard, the submission, and the values `a-presented-connector-configurations-test-collects-values-for-the-attributes-the-presented-answer-names` has collected against the answer being presented — all read a screen holding nothing where the registry answered.
The operator's own change ends it, because from that point the content is theirs: `a-connector-configuration-read-answering-over-an-unsubmitted-edit-leaves-that-edit-standing` has an arriving answer change no field of an edit the operator composed, and this states what those fields hold before and apart from any such edit.

The sibling registry's answer is the answer taken here.
`a-presented-capability-states-its-declared-attributes-as-the-read-answered-them` decides this same half for the capability surface in these very terms — every declared attribute carried from the moment the presentation begins, none standing absent, empty or otherwise sourced at any point in it, unless the operator has themselves changed the field — and these two registries' surfaces are governed together on the record, `a-submitted-registration-states-its-outcome-to-the-operator` and `a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface` each deciding one fact for both.
Answering it differently for a connector configuration than for a capability would give one specification two answers to one question.

Nothing else about this screen moves.
Which of the four readings the screen stands in stays `a-presented-connector-configuration-states-an-outstanding-or-failed-read`'s, `a-presented-connector-configuration-states-a-connector-name-nothing-is-registered-under`'s and `a-connector-configuration-answer-already-held-stands-presented-while-a-further-read-is-outstanding`'s own; whether the screen states at all that a further read is under way is no part of this; the well-formedness statement stays reached from the field's content alone; the edit's standing under an arriving answer, the discard and its further explicit act, what a submission states and where a successful one lands are each their own rules'; and what acts the surface offers over the content those fields hold, and what any of them does to it — the helper, an applied draft under `applying-a-drafted-configuration-changes-only-the-local-edit`, the test — are equally untouched.
Which control carries either field, its label, its order and its placement are form and belong to the interface, exactly as every surface rule here leaves them.

An invariant over `domain/integration/connector-configuration`, immediate and inside that one aggregate — the home and shape every sibling fact about this surface already takes, a new rule rather than the api contract, which cannot declare a presentation, or the domain element, which declares what a configuration is and not what a screen does with an answer about one.

Disclosed as this route requires: the scope material under `work/connector-configuration-detail-cached-load-empty/intake/scope.md` describes an already delivered frontend and names its source files, so it is in part derived from code already written; read as data it reports the empty Configuration field over a read already answered at mount as an error and reports that read answering with the full configuration, which corroborates this value without founding it — the reasoning above rests on this specification's own standing rules, and a reviewer who rejects it rejects that reasoning.
