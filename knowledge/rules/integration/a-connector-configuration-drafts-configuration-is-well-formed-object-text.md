---
type: invariant
statement: >-
  A connector configuration draft's configuration is always well-formed JSON object text —
  text that parses, and parses to a JSON object rather than to a null, an array, a string,
  a number or a boolean — for every operation of every document a draft is generated from,
  an operation declaring no responses, no parameters, no request body and no security
  requirement included.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

A draft exists to be applied into the one field a connector configuration carries, and that field is only ever registered as well-formed JSON object text; a draft handing the operator anything else would be material no registration could take and no reader could open by key.
Everything a draft states about the call it read stands as a key of this text — the method and the address, the two maps drafted even where they hold no entry, and the query, the headers and the body the operation's own parts occupy — so text that did not parse to an object would state none of it, and every rule that fixes where one of those parts sits reads this as its premise rather than stating it.

This is a guarantee of generation rather than a refusal, and it is not the registry's own well-formedness judgment repeated over something the registry never sees: a draft registers nothing, the two conditions under which no draft is stated at all belong to a-malformed-or-unsupported-openapi-document-refuses-the-draft, and a document too sparse to draft object text does not exist — an operation declaring nothing but its path is still drafted with a method, an address and two empty maps.
What this buys is that every reader of a stated draft — the surface that discloses it, the confirmation that asks before it replaces an unsubmitted edit — may parse the configuration it carries without first asking whether it parses, and so never owes the operator an account of a draft it could not read.
