---
type: invariant
statement: >-
  Where an operator names an OpenAPI document link in the Configuration Helper of a surface authoring or
  editing a connector configuration and read-openapi-document-operations refuses the read of that document's
  operations, the surface states to that operator that no operations were listed and which refusal answered
  it: where the answer names a condition, the surface states that condition apart from the other condition
  that operation can name — a named link that could not be fetched, together with which of network-failure,
  timeout or status-outside-2xx the answer named and, where it named status-outside-2xx, the status the link
  answered; and a fetched document that could not be read as OpenAPI 3.x — and where the answer names neither
  of those conditions, the surface states that the read failed for a reason it does not recognise, never as
  either of them.
expression: >-
  For an operator reading a document's operations through read-openapi-document-operations of
  contracts/integration/openapi-document-operations, from the surface s carrying the Configuration Helper
  a-connector-configuration-authoring-surface-offers-a-configuration-helper states: where that read is
  refused, s states that no operations were listed and states which refusal answered it. Where the refusal
  reports OpenApiDocumentNotFetchedError, s states that the link the request named could not be fetched and
  states which of network-failure, timeout or status-outside-2xx that answer named, and where that answer
  named status-outside-2xx, the status the link answered. Where the refusal reports
  OpenApiDocumentNotReadableError, s states that the fetched document could not be read as an OpenAPI 3.x
  document. Those two statements are distinguishable from one another to the operator, and neither of them is
  presented as the other. Where the refusal reports neither of those two conditions, s states that the read
  failed for a reason it does not recognise, never as either of the two.
constrains:
  - domain/integration/openapi-document-operations
---

## Description

`read-openapi-document-operations` of `contracts/integration/openapi-document-operations` is a call the Configuration Helper makes and waits on before it has anything for the operator to choose from, and two of its answers are refusals: `an-unfetchable-openapi-link-refuses-the-operations-read` and `a-malformed-or-unsupported-openapi-document-refuses-the-operations-read`, whose status and error values `an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document` states.
What each of those answers its caller is stated; what the operator who typed the link is told was stated nowhere.
`a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing` leaves that operator no other way to name an operation, so a refusal stated nowhere leaves the helper standing with nothing to choose from and reads exactly like a document that declares no operations at all — and the operator who cannot tell those apart retypes the same link unchanged, or abandons the helper and authors the Configuration field by hand believing the document they named held nothing worth drafting from.

The refusal is stated, and the condition carried with it, because the operator's next act differs across the two: a link nobody answered is corrected by naming another link or by going to fix the far end publishing the document; a document that cannot be read as OpenAPI 3.x is corrected at the document, that link having answered.
`an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document` already gave exactly this reason for two error values rather than one, and `an-unfetchable-openapi-link-refuses-the-operations-read` names which of network-failure, timeout or status-outside-2xx occurred rather than holding it server-side, where it would sit in a log the authoring operator cannot read; a surface that receives that distinction and states none of it puts it back in that log and leaves the two rules that draw it drawing nothing.

Two conditions here and not the three the draft's own refusal carries: `an-openapi-document-declaring-no-such-operation-refuses-the-draft` has no counterpart in this read, which names no path and no method — it is the call that produces the pairings the operator then chooses one of.

A refusal whose condition the surface does not recognise is stated as exactly that.
`constraints/a-domain-error-unmapped-by-status-is-refused-generically` answers a domain error nothing named with a fixed message that discloses nothing, and `constraints/a-malformed-request-is-refused-with-a-validation-error` answers a request the route's own shape refuses; neither carries either of the two conditions.
`a-refused-draft-request-states-its-refusal-to-the-operator` decided this same branch for the sibling call on the reasoning `a-submitted-registration-states-its-outcome-to-the-operator` records — a named condition and an unrecognised failure teach opposite things, one saying what to change and the other that the outcome is unknown, so an unrecognised failure dressed as a named condition sends the operator to correct an input that was never at fault.
Answered the same way here so that one specification does not answer one question twice.

Home is a new invariant over `domain/integration/openapi-document-operations`: the api contract cannot declare a presentation, and the element declares what a fetched document's operations are rather than what a surface states about reading them, which is the placement every presentation fact of this specification has taken.
It adds no attribute to that element, publishes no operation and refuses no call — what the read answers its caller stays `an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document`'s own, and `a-connector-configuration-authoring-surface-offers-a-configuration-helper` keeps stating what the helper is and where it sits.
It is a fact rather than form on this project's own line, changing what a person can learn and do rather than how it looks; which control carries each statement, its wording, its placement and how long it stands are the interface's own, exactly as every other surface rule here leaves them.
