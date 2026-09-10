---
type: invariant
statement: >-
  The answer a read of the connector configuration registered under one named connector
  returned is retained beyond the operator-facing surface that obtained it for sixty
  seconds from the moment it arrived and no longer, so that a surface presenting the
  configuration registered under that same connector name is first presented already
  holding that answer where it is first presented inside that interval and is first
  presented holding no answer of any read of that configuration where it is first
  presented outside every such interval, what a surface already presenting that answer
  goes on presenting being untouched.
expression: >-
  For a connector name n and an answer a that a read of the configuration registered
  under n through read-connector-configuration of
  contracts/integration/connector-configuration-registry returned at moment t: a is in
  hand at every moment from t up to sixty seconds after t and at no moment later than
  that, whichever operator-facing surface issued the read that a answered and whether or
  not that surface still stands. An operator-facing surface presenting the configuration
  registered under n that is first presented at a moment inside that interval holds a at
  the moment it is first presented — the condition
  a-connector-configuration-answer-already-held-stands-presented-while-a-further-read-is-outstanding
  and
  a-held-connector-configuration-answer-stands-presented-through-a-failed-further-read-but-not-a-refused-one
  are each stated over, and the case
  a-presented-connector-configurations-fields-carry-the-answer-from-the-moment-that-reading-is-entered
  names as an answer in hand before the surface was first presented. An operator-facing
  surface presenting the configuration registered under n that is first presented at a
  moment inside no such interval of any answer of that configuration holds the answer of
  no read of it at the moment it is first presented, and stands in the reading
  a-presented-connector-configuration-states-an-outstanding-or-failed-read states for a
  read that has not yet answered until a read of that configuration answers it. Where
  more than one answer of the configuration registered under n has arrived, each answer's
  interval runs from its own arrival and the answer in hand is the one that arrived
  latest. A read that failed and a read refused because nothing is registered under n
  each return no answer, so neither puts anything in hand. What a surface that is already
  presenting a in the reading that read returned goes on presenting is not bounded here
  and stays that rule's own; whether anything other than the passing of that interval puts
  an answer already in hand out of hand, and whether any further read of that
  configuration is issued at a surface first presented already holding one, are no part of
  this. Nothing here turns on how either surface was reached, on which control carries
  anything, or on that control's wording and placement.
constrains:
- domain/integration/connector-configuration
---

## Description

Four standing rules over the surface that presents the connector configuration registered under one connector name are each written for a screen "first presented already holding the answer of an earlier read of that configuration", and no node states that an answer of `read-connector-configuration` of `contracts/integration/connector-configuration-registry` is ever in hand at all beyond the surface whose read obtained it, or for how long it stays there.
`a-connector-configuration-answer-already-held-stands-presented-while-a-further-read-is-outstanding` places such a screen in the returned reading and its Description asserts in prose that the case arises — the configuration read a moment ago, its answer still held, the screen first presented already holding it — without any node stating that an answer outlives the surface that read it; `a-held-connector-configuration-answer-stands-presented-through-a-failed-further-read-but-not-a-refused-one` is stated over the same held answer; `a-presented-connector-configurations-fields-carry-the-answer-from-the-moment-that-reading-is-entered` distinguishes an answer "in hand before s was first presented" from one that arrived after it without saying how an answer comes to be in hand before; and `a-presented-connector-configuration-states-an-outstanding-or-failed-read` reasons that the window in which nothing about the configuration is known is the window in which no read has yet answered the screen, which a screen holding an earlier answer is outside.
So whether an operator returning to a configuration they read a moment ago meets its content or the window in which nothing is known, and whether one who returns hours later meets content nothing has checked since, fell to whatever the interface happened to retain — the same silence `a-presented-connector-configuration-with-no-edit-offers-no-discard-and-no-submission` was found to reason from, a condition four rules govern that no node states ever obtains.

The answer is retained beyond the surface that obtained it, because the four rules that presuppose it govern nothing otherwise.
Each of them was written to keep the operator from meeting a blank or a pending notice where the registry has already answered, and refusing the retention would leave every one of them a conditional whose antecedent this specification never permits — while costing the operator, on the movement this surface is reached by most, the interval in which nothing about the configuration is known: `a-connector-configuration-surface-offers-a-route-to-the-listing` owes a route from this surface to the listing on every reading, `a-connector-configuration-listing-routes-presence-turns-on-nothing-further` keeps that route unconditional, and `a-successful-connector-registration-lands-on-the-configurations-own-surface` and `an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing` move the operator between the listing and one configuration's own surface as the ordinary course.
It is keyed on the connector name, because that is what the read is keyed on: `domain/integration/connector-configuration` holds, by name, whatever configuration a connector currently answers to, and an answer of one name says nothing about another.

The retention is bounded, because an answer in hand without limit is content the registry may long since have replaced, presented as the registration in front of the operator.
`a-further-connector-configuration-answer-becomes-what-a-screen-holding-no-edit-presents` names that harm in terms: `register-connector` is create-or-replace and `domain/integration/connector-configuration` is replaced whole on every edit, so an operator editing from a configuration the registry has since replaced and submitting writes the older content back over the newer in one total write, having been shown nothing that told them the registration had moved.
An unbounded retention would have `a-connector-configuration-answer-already-held-stands-presented-while-a-further-read-is-outstanding` put a surface into the returned reading, presenting values as the registry's answer, on the strength of a read made at any distance in the past — turning that rule's own reason, that the operator never works over content the registry did not answer, against itself.

The bound is sixty seconds, because it is the freshness bound this specification already fixed for a retained read answer when it had to choose one, and because at that length the retention costs a read at worst while a longer one costs correctness.
`a-collected-concept-declares-a-ttl` takes sixty seconds as the bound a retained answer keeps where nothing states another, on its own reasoning that without such a bound a retention has none to respect, and this log's own entry for that value records that a short bound produces no error but only a read that could have been avoided.
Sixty seconds covers the movement this retention exists for — the listing reached and the same connector reopened, the surface reached again through the browser's own history — which an operator makes in seconds, and it does not cover a surface opened after the operator has been elsewhere long enough for a registration to have been made under that name by anyone.

This decides for how long an answer is in hand and nothing beyond it.
Which of the four readings a surface holding one stands in, and what it presents there, stay `a-presented-connector-configuration-states-an-outstanding-or-failed-read`'s, `a-presented-connector-configuration-states-a-connector-name-nothing-is-registered-under`'s, the answer-already-held rule's and the failed-further-read rule's own; what a surface already presenting an answer goes on presenting stays `a-presented-connector-configurations-fields-carry-the-answer-from-the-moment-that-reading-is-entered`'s own, unbounded by this and holding for as long as that reading stands; what an arriving further answer does stays `a-further-connector-configuration-answer-becomes-what-a-screen-holding-no-edit-presents`'s and `a-connector-configuration-read-answering-over-an-unsubmitted-edit-leaves-that-edit-standing`'s own; whether a surface first presented already holding an answer issues a further read at all is stated by no node and is not stated here, `a-failed-connector-configuration-read-is-reissued-only-on-the-operators-act` keeping only the failed window's reattempt the operator's own act; whether anything other than the passing of the interval puts an answer out of hand is no part of this; the well-formedness statement `a-connector-configuration-surface-judges-its-configuration-fields-content` owes is reached from the field's content alone and is untouched; and which control carries anything, its wording and its placement stay the interface's own, exactly as every surface rule here leaves them.

An invariant over `domain/integration/connector-configuration`, immediate and inside that one aggregate — the home and shape every sibling fact about this surface already takes, a new rule rather than the api contract, which cannot declare how long its answer stays in hand, or the domain element, which declares what a configuration is and not what becomes of an answer about one.

Disclosed as this route requires: the scope material under `work/connector-configuration-detail-cached-load-empty/intake/scope.md` describes an already delivered frontend and names its source files, so it is in part derived from code already written; read as data it reports that the delivered screen does receive the answer already at mount when "the listing was visited and the same connector reopened within the cache's lifetime, or the screen is reached by the browser's history", which corroborates the retention half without founding it, and it names no lifetime, no duration and no bound of any kind — the sixty seconds and the reasoning above rest on this specification's own standing rules, and a reviewer who rejects them rejects that reasoning.
