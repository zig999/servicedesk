---
title: The surface states what the HTTP connector would refuse in the field's content
summary: Over well-formed configuration text, each departure from the method and status vocabulary, from
  what the call must declare, and from the three placeholder forms is stated by the key that departs.
rationale: Cut per rule rather than per panel block because the scope's blocks group by consequence while
  each statement here is judged by its own criterion and would change only when that criterion does.
objective: Over a Configuration field holding well-formed JSON object text, the surface states each way
  that content departs from what the HTTP connector requires of a configuration it executes.
criteria:
- A method outside the vocabulary is stated as a departure, naming the method key and the methods the
  vocabulary admits.
- A statusMap ending outside the vocabulary is stated as a departure, naming the statusMap key that carries
  it and the endings the vocabulary admits.
- A statusMap that is absent or is not an object is stated as a departure naming the statusMap key.
- A responseMap that is absent, is not an object, or holds a value that is not text is stated as a departure
  naming the responseMap key.
- An address that is absent or holds no text is stated as a departure naming the address key.
- A query or headers the content declares that is not an object of texts is stated as a departure naming
  the key that departs.
- A placeholder written in none of the three forms is stated as a departure naming that placeholder.
- Where the surface's own judgment finds no such departure, no departure is stated anywhere on it.
sources:
- intake/scope.md
implements:
- domain/integration/connector-configuration
- rules/integration/a-connector-configuration-surface-states-what-the-http-connector-would-refuse-in-its-configuration-fields-content
- rules/integration/an-http-connector-configuration-declares-its-method-and-status-vocabulary
- rules/integration/an-http-connector-configuration-declares-its-call
- rules/integration/a-connector-configuration-placeholder-is-written-in-one-of-three-forms
- scenarios/integration/a-status-map-ending-outside-the-vocabulary-is-stated-before-the-write
---

## What it is
The statement that the registry would take this text and the HTTP connector would end every observation through it unavailable.
It is made by the same criteria the connector applies, and by no criterion of the surface's own.

## Notes
An operator who writes a method in lower case or an ending outside the four learns it today from a collection that ended unavailable, or never.
UNDERDETERMINED, from the specification -- No criterion says the submission act stays offered while a stated departure stands, yet rules/integration/a-connector-configuration-surfaces-readiness-statements-carry-no-claim-no-rule-decides states the surface withholds no act submitting a registration beyond the one rules/integration/a-connector-configuration-surface-offers-no-submission-while-its-content-is-not-well-formed withholds, and the governing scenario requires in its second then that the act submitting the registration stays offered.
A surface that states every departure exactly as the eight criteria require and, while a method or statusMap departure stands, does not offer (or disables) the act submitting the registration through register-connector satisfies every criterion here while the readiness bound refuses it.
UNDERDETERMINED, from the specification -- Criterion 2 covers only a statusMap ending outside the vocabulary and criterion 3 only a statusMap that is absent or not an object, but rules/integration/an-http-connector-configuration-declares-its-method-and-status-vocabulary requires a statusMap that is an object mapping an HTTP status to one evidence-result ending, so a key that is not an HTTP status is a departure no criterion names.
A surface that states nothing over a well-formed configuration whose statusMap reads {"notAStatus": "ok"} -- every key an admitted ending, the object present -- satisfies every criterion as written while the HTTP connector would hold that statusMap malformed.
UNDERDETERMINED, from the specification -- Criteria 3, 4 and 5 each name absence as a departure for statusMap, responseMap and address, but criterion 1 speaks only of a method outside the vocabulary, while the governing rule holds a configuration that lacks any of the three -- method included -- to issue no call and end unavailable.
A surface that states no departure over a well-formed configuration declaring no method key at all satisfies criterion 1 as written, since a content with no method declares no method outside the vocabulary.
REMAINDER, from the specification -- The clause of rules/integration/an-http-connector-configuration-declares-its-method-and-status-vocabulary stating that an observation reaching a configuration lacking any of the three issues no call and ends unavailable, with a result detail reporting a MalformedHttpConnectorConfigurationError, reaches no criterion of this task. Belongs to the act that executes an HTTP connector observation and records its evidence result.
REMAINDER, from the specification -- The clauses of rules/integration/an-http-connector-configuration-declares-its-call stating that a placeholder names a credential read from environment configuration at resolution time and that a placeholder is substituted as plain text and never evaluated as code reach no criterion of this task, which judges only the literal forms written in the field's content. Belongs to the act that assembles and issues the HTTP connector's call, resolving its placeholders.
ADVISORY, from the specification -- Criterion 2 requires naming the endings the vocabulary admits, but the governing rule names them only by reference to the evidence-result endings, whose enumeration lives in a node outside this task's candidates; only the governing scenario spells out ok, denied, timeout and unavailable, in a then rather than as a vocabulary declaration.
ADVISORY, from the specification -- The objective is predicated on the Configuration field holding well-formed JSON object text, and the judgment producing that precondition is rules/integration/a-connector-configuration-surface-judges-its-configuration-fields-content's own, not implemented here; the seam between the two judgments is that rule's task.
