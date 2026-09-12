---
type: invariant
statement: >-
  Where an operator names an OpenAPI document link and one of its operations in the Configuration
  Helper of a surface authoring or editing a connector configuration and
  draft-connector-configuration-from-openapi answers that request with a connector configuration
  draft, the surface states that draft to that operator: the drafted configuration text; every
  unresolved item the answer carries, each by the name that answer gave it and by the reason that
  answer named for it, each of those reasons stated apart from every other reason the draft's own
  reason vocabulary holds; every generated credential the answer carries, each by the generated
  name and by the security scheme's own name that answer gave it; every status reading the answer
  carries, each by its status, its ending and what the document declared it as; every response
  field the answer carries, each by its name, its path and the status it was read from and, where
  the answer carries them, its declared type, its declared required listing and the envelope it
  was read through; every reading note the answer carries, each by its kind and its subject and,
  where the answer carries it, its detail, each of those kinds stated apart from every other kind
  the draft's own note-kind vocabulary holds; and, where that answer carries a method mismatch,
  the method it names as currently registered together with the method it names as the drafted
  operation's, neither of the two standing for the other — and where that answer carries no
  method mismatch, no mismatch is stated at all — stating no name, no reason, no generated name,
  no security scheme name, no status, no field, no note and no method the answer did not carry,
  for any of them.
expression: >-
  For an operator requesting a draft through draft-connector-configuration-from-openapi of
  contracts/integration/connector-configuration-draft, from the surface s carrying the
  Configuration Helper a-connector-configuration-authoring-surface-offers-a-configuration-helper
  states: where that request is answered with a domain/integration/connector-configuration-draft
  d, s states d's configuration; for every item of d's unresolved, s states that item's name and that item's
  reason, and the reasons domain/integration/connector-configuration-draft-unresolved-reason
  holds are distinguishable from one another to the operator, none of them presented as another;
  for every item of d's generated_credentials, s states that item's name and that item's
  security_scheme; for every item of d's status_readings, s states that item's status, its ending
  and, where carried, its declared_as; for every item of d's response_fields, s states that
  item's name, path and status and, where carried, its declared_type, its declared_required and
  its envelope; for every item of d's reading_notes, s states that item's kind and subject and,
  where carried, its detail, and the kinds
  domain/integration/connector-configuration-draft-reading-note-kind holds are distinguishable
  from one another to the operator, none of them presented as another; and where d carries
  method_mismatch, s states its registered and its operation, distinguishably from each other,
  while where d carries no method_mismatch s states no mismatch. s states no name, no reason, no
  generated name, no security scheme name, no status, no field, no note and no method that d did
  not carry. The content of the Configuration field of s is identical before and after that
  answer arrives, and changes only through the operator's own act of applying d, which
  applying-a-drafted-configuration-changes-only-the-local-edit and
  an-unsaved-edit-is-not-overwritten-by-applying-a-draft-without-confirmation govern.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

`draft-connector-configuration-from-openapi` of `contracts/integration/connector-configuration-draft` is a call the Configuration Helper makes and waits on, and one of its answers is a draft.
`a-refused-draft-request-states-its-refusal-to-the-operator` states what the operator is told when that call refuses; what the operator is told when it answers with the thing they asked for was stated nowhere.
`domain/integration/connector-configuration-draft`'s own Responsibility is to hold, for review, everything one operation could honestly resolve toward one connector's configuration and to disclose by name and by reason everything it could not — and no review of the second half is possible over parts the surface that asked for them never states.

Every part is stated, rather than the configuration text alone, because that text alone is the one presentation that reads as a finished answer while being an unfinished one.
`a-connector-configuration-draft-names-subject-placeholders-from-a-registered-capability` and `a-connector-configuration-draft-names-a-generated-credential-for-a-reducible-security-scheme` each resolve only what they can honestly resolve and disclose the rest rather than guessing; the drafted statusMap and responseMap are the document's statuses and paths under endings and keys the draft chose by a fixed reading, and the status readings, the response fields and the reading notes are what lets the operator judge each choice against what the document itself declared and see what the draft read past.
A surface stating the text and nothing else hands the operator text designed to be reviewed while withholding the record the review needs, and the operator applies it and submits it as whole.

Each unresolved item carries its name and its reason because the reasons name different things to fix.
`domain/integration/connector-configuration-draft-unresolved-item` pairs one name with exactly one reason, and the reasons `domain/integration/connector-configuration-draft-unresolved-reason` holds send the operator to different places: `no-capability-registered` to registering a capability naming this connector; `security-scheme-not-reducible-to-a-credential` to authoring that part of the call by hand, the scheme having no single value to substitute at all; `drafted-key-occupied-by-another-security-scheme` to a collision between two schemes of the same operation.
A count of unresolved names, or a list of names without their reasons, leaves the operator to guess which applies and to correct an input that was never at fault.
The reading notes are held apart by kind for the same reason: a default response read past, an envelope read through and a field name whose second path was not taken each send the operator to a different act, and a note without its kind is a list of names again.

Each generated credential carries both names for the same reason it carries both in the answer.
`scenarios/integration/an-api-key-scheme-becomes-a-generated-credential` records why the generated name is disclosed at all — the operator has to configure that environment value before the drafted call resolves — and `a-connector-configuration-draft-names-a-generated-credential-for-a-reducible-security-scheme` composes that name from the connector name and the scheme name with every character outside A-Z0-9 replaced and the whole upper-cased, a form from which the operator cannot read back which scheme of the document it answers where an operation requires more than one.
Nothing of a credential's value is stated because the answer carries none: `domain/integration/connector-configuration-draft-generated-credential` holds a generated name and never a value the scheme's own credential resolved to, the same restraint `a-diagnostic-response-masks-a-resolved-credential` holds over the other diagnostic read this context publishes.

The method mismatch is stated where the answer carries one because applying the draft acts on it.
`a-connector-configuration-draft-states-the-chosen-operations-method` puts the chosen operation's own method into the drafted text whether it agrees with what is registered or not, `a-connector-configuration-drafts-method-is-compared-against-what-is-currently-registered` makes the comparison, and `domain/integration/connector-configuration-draft-method-mismatch` names the two side by side, never one silently replacing the other — `scenarios/integration/a-drafts-method-mismatches-what-is-registered` is that case exactly, registered `GET` against drafted `POST`.
A surface holding that back lets the operator apply and submit a change of method they were never shown, which is precisely the silent replacement the element refuses.
Where the answer carries no mismatch nothing is stated, on this specification's standing refusal to state a value an answer did not carry, and a mismatch shown where none was answered would report a disagreement with a registration that need not even exist.

Whether the Configuration field's own content stands untouched by this answer's arrival is `the-configuration-field-is-untouched-by-a-drafts-arrival`'s own.
Which capability fields the drafted responseMap's keys reach is `a-connector-configuration-surface-states-which-response-map-keys-a-registered-capability-reads`'s own, read by the surface and carried by no answer.

Home is an invariant over `domain/integration/connector-configuration-draft`, the placement its refusal-side sibling took: the api contract cannot declare a presentation, and the element declares what a draft is rather than what a surface states about requesting one, which is where every presentation fact of this specification sits.
Nothing here owes the operator a second copy of what they typed: the link, the operation and the connector name the draft was generated for are already standing on the surface they were entered on.
What that surface states while a draft request is outstanding is not decided here, and what applying a draft does stays `applying-a-drafted-configuration-changes-only-the-local-edit`'s and `an-unsaved-edit-is-not-overwritten-by-applying-a-draft-without-confirmation`'s.
It is a fact rather than form on this project's own line, changing what a person can learn and do; which control carries each statement, its wording, its order, its placement and how long it stands are the interface's own, exactly as every other surface rule here leaves them.
