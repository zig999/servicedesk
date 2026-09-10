---
type: invariant
statement: >-
  An operator-facing screen presenting the connector configuration registered under one
  connector name collects the operator's test values for exactly the Subject attributes named
  by the ${subject:<attribute-name>} placeholders the configuration carries as the answer of
  the read that screen is presenting states it — never as the screen's own Configuration
  field holds it where an unsubmitted edit or an applied draft has moved that field away from
  that answer — and, where the configuration the test read at the moment of the test names a
  set of Subject attributes other than the set those values were collected for, states to the
  operator that the configuration registered under that connector name changed since the
  answer being presented and that the test exercised a configuration those values were not
  collected for, stated distinguishably from and never in place of what the test itself
  answered.
expression: >-
  For a connector name n, a screen s presenting the connector configuration registered under
  n through read-connector-configuration of
  contracts/integration/connector-configuration-registry on the reading where that read
  returned, and A(c) the set of distinct Subject attribute names the
  ${subject:<attribute-name>} placeholders embedded in a configuration c name: s collects one
  test value per member of A(a), where a is the configuration the answer s presents carries,
  and collects a value for no name outside A(a), whatever content s's own Configuration field
  holds at that moment; and where t is the configuration read at the moment of the test s
  issued through test-connector of contracts/integration/connector-diagnostics and A(t) is
  not A(a), s states to the operator that the configuration registered under n changed since
  the answer s presents and that the test exercised a configuration those values were not
  collected for, that statement standing distinguishable from what the test answered and
  never in place of it. Nothing here turns on how s was reached, on whether that answer was
  in hand before s was first presented or arrived after it, or on which control carries the
  collection or the statement.
constrains:
  - domain/integration/connector-configuration
---

## Description

`read-connector-configuration` of `contracts/integration/connector-configuration-registry` answers the configuration standing under a connector name, and that answer is what this screen presents. `a-presented-connector-configuration-offers-its-test-on-the-reading-that-answered` puts the test act on that one reading, and `a-connector-configuration-is-tested-through-a-registered-capability` fixes what the act exercises: the configuration currently registered under that connector name, read at the moment of the test, with a subject carrying exactly the Subject attributes that configuration's own `${subject:<attribute-name>}` placeholders name, one value per distinct attribute, each value supplied by the operator with the request and each name read rather than authored. Two statements of the same configuration are therefore in play whenever the operator supplies those values — the answer the screen is presenting, and the configuration the test itself reads — and no node said which of them the screen reads the names from, nor what it states where the two name different attributes. Left unstated, an operator could be asked for values against either one, and a divergence between them reached them as nothing at all.

It is the answer being presented, because at the moment the values are collected there is no other statement to read: the configuration the test reads is read only once the request those values travel in has been made, so a screen collecting from it would have to ask for the values after already sending them. The presentation is held to that same answer's own values by `a-presented-connector-configuration-states-an-outstanding-or-failed-read` and, for a screen first presented already holding an earlier answer, by `a-connector-configuration-answer-already-held-stands-presented-while-a-further-read-is-outstanding`, so collecting for names drawn from anywhere else would ask the operator for values about a configuration the same screen is not showing them.

Never the field's own content, because on this screen the field may stand away from that answer and the test never exercises what it then holds: `a-connector-configuration-read-answering-over-an-unsubmitted-edit-leaves-that-edit-standing` keeps an unsubmitted edit in the field over an arriving answer, `applying-a-drafted-configuration-changes-only-the-local-edit` puts drafted text there without registering it, and `a-connector-configuration-is-tested-through-a-registered-capability` refuses to exercise text no write was ever held to. Reading the names from that content would collect values for attributes the tested configuration never resolves while collecting none for attributes it does, which is the one pairing the placeholder check for the pairing under test cannot be about.

The divergence is owed a statement because nothing else answers it. No refusal meets a test whose collected set has gone stale: an attribute the tested configuration's placeholders do not name is no part of the subject the test assembles, and a Subject-attribute placeholder that resolves to nothing issues no call and ends unavailable (`an-incomplete-or-unresolvable-connector-call-descriptor-ends-unavailable`), so a set collected against an answer that has since been replaced reaches the operator as an ending indistinguishable from a connector that is genuinely down. The operator's next act differs across those two — re-read the configuration and collect again, or go look at the connector — and that is the same reason `a-presented-connector-configurations-four-readings-are-mutually-distinguishable` refuses one presentation for materially different situations. The statement stands beside what the test answered rather than suppressing it, so nothing the diagnostic did report is withheld.

Not decided here: what the diagnostic's own answer carries back, which stays `contracts/integration/connector-diagnostics`' own and `a-diagnostic-response-masks-a-resolved-credential`'s own; whether the screen re-reads the configuration before offering or after issuing the test; which capability and which configuration the act exercises and what subject it assembles, all `a-connector-configuration-is-tested-through-a-registered-capability`'s own; the four readings of the read and the acts the screen owes or withholds on each, untouched here; and which control carries the collection or the statement, its wording, its count and its placement, which are form and belong to the interface exactly as every other surface rule of this specification leaves them.

An invariant over `domain/integration/connector-configuration`, immediate and inside that one aggregate — the home every sibling fact about this surface already takes, a new rule rather than the api contract, which cannot declare a presentation, or the domain element, which declares what a configuration is and not what a screen collects over reading one.

Disclosed as this route requires: the scope material under `work/connector-configuration-detail-cached-load-empty/intake/` describes a frontend already delivered and reports the Test panel being handed the screen's own configuration text — empty, in the defect it reports — so it exhibits a panel fed from the screen's field rather than stating which statement the attribute names are read from, and it says nothing at all about two statements naming different attributes. The reasoning here rests on this specification's own standing rules, and a reviewer who rejects it rejects that reasoning.
