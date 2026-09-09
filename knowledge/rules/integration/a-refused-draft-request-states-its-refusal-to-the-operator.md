---
type: invariant
statement: >-
  Where an operator names an OpenAPI document link and one of its operations in the Configuration
  Helper of a surface authoring or editing a connector configuration and
  draft-connector-configuration-from-openapi refuses that request, the surface states to that
  operator that no draft was generated and which refusal answered it: where the answer names a
  condition, the surface states that condition apart from every other condition that operation can
  name — a named link that could not be fetched, together with which of network-failure, timeout or
  status-outside-2xx the answer named and, where it named status-outside-2xx, the status the link
  answered; a fetched document that could not be read as OpenAPI 3.x; and a path and method pairing
  the fetched document declares no operation for — and where the answer names none of those
  conditions, the surface states that the request failed for a reason it does not recognise, never as
  one of them and never as a draft, no part of a draft standing beside that statement: no
  configuration text, no unresolved item, no generated credential and no method mismatch stated as
  that request's answer.
expression: >-
  For an operator requesting a draft through draft-connector-configuration-from-openapi of
  contracts/integration/connector-configuration-draft, from the surface s carrying the Configuration
  Helper a-connector-configuration-authoring-surface-offers-a-configuration-helper states: where that
  request is refused, s states that no draft was generated and states which refusal answered it.
  Where the refusal reports OpenApiDocumentNotFetchedError, s states that the link the request named
  could not be fetched and states which of network-failure, timeout or status-outside-2xx that answer
  named, and where that answer named status-outside-2xx, the status the link answered. Where the
  refusal reports OpenApiDocumentNotReadableError, s states that the fetched document could not be
  read as an OpenAPI 3.x document. Where the refusal reports OpenApiOperationNotFoundError, s states
  that the fetched document declares no operation for the path and method the request named. Those
  three statements are distinguishable from one another to the operator, and none of them is presented
  as either of the other two. Where the refusal reports none of those three conditions, s states that
  the request failed for a reason it does not recognise, never as one of the three and never as a
  draft. In every one of those readings s states no configuration text, no unresolved item, no
  generated credential and no method mismatch as that request's answer, and the content of the
  Configuration field of s is identical before and after the refusal. Where the operation has not
  answered the request, s states no refusal of it.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

`draft-connector-configuration-from-openapi` of `contracts/integration/connector-configuration-draft` is a call the Configuration Helper makes and waits on, and three of its answers are refusals: `an-unfetchable-openapi-link-refuses-the-draft` and `a-malformed-or-unsupported-openapi-document-refuses-the-draft`, whose statuses and error values `a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document` states, and `an-openapi-document-declaring-no-such-operation-refuses-the-draft`, which states its own.
What each answers its caller is stated; what the operator who asked for the draft is told was stated nowhere.
Left unstated, a refusal reads to that operator exactly like a helper that did nothing — and the operator who cannot tell those apart reissues the same request unchanged, or goes on to author the Configuration field by hand believing the document they named held nothing worth drafting from.

The refusal is stated, and the condition carried with it, because the operator's next act differs across the three: a link nobody answered is corrected by naming another link or by going to fix the far end publishing the document; a document that cannot be read as OpenAPI 3.x is corrected at the document; a pairing the document declares no operation for is corrected by choosing another path and method, the document itself having been read successfully.
`a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document` already gave exactly this reason for two error values rather than one, and for carrying which of the three fetch failures occurred to the caller rather than holding it server-side, where it would sit in a log the authoring operator cannot read; a surface that receives that distinction and states none of it puts it back in that log and leaves the two rules that draw it drawing nothing.
`an-openapi-document-declaring-no-such-operation-refuses-the-draft` reasons the same way about its own condition — folding it into either of the others would tell the operator their link or their document was at fault when what was wrong was the operation they selected — and a surface that merges the three commits precisely that error on the operator's behalf.

A refusal whose condition the surface does not recognise is stated as exactly that.
`constraints/a-domain-error-unmapped-by-status-is-refused-generically` answers a domain error nothing named with a fixed message that discloses nothing, and `constraints/a-malformed-request-is-refused-with-a-validation-error` answers a request the route's own shape refuses; neither carries one of the three conditions.
`a-submitted-registration-states-its-outcome-to-the-operator` decided this same branch for a registration's refusal, on the reasoning `scenarios/knowledge/releasing-an-already-released-revision-tells-the-curator-so` and `a-release-refusal-with-no-named-violation-says-so` record: a named condition and an unrecognised failure teach opposite things, one saying what to change and the other that the outcome is unknown, so an unrecognised failure dressed as a named condition sends the operator to correct an input that was never at fault.
Decided the same way here so that one specification does not answer one question twice.

That rule's shape is followed and its reason is not, because a draft request is a different act.
Nothing is registered by one: `a-connector-configuration-draft-registers-nothing` holds that generating a draft issues no `register-connector` call, so none of the hazards that rule reasons from — a total create-or-replace write an operator cannot see the effect of, a resubmission over a registration already made, an abandonment indistinguishable from a submission — is present here.
What makes the statement owed is only that the operator asked for something and the answer is otherwise invisible to them.
This states no act: a refused draft request is asked again by the operator naming a link and an operation in the helper that is already standing there, which is not the case of `a-presented-connector-configuration-states-an-outstanding-or-failed-read`, where the failed read is the surface's own and the operator has nothing to type.
The link the fetch refusal echoes back is the operator's own input, standing in the field they typed it into, so nothing here owes them a second copy of it.

No part of a draft stands beside the refusal.
For the request just refused there is nothing of the kind to state — `an-openapi-document-declaring-no-such-operation-refuses-the-draft` states that no `connector-configuration-draft` is produced at all, no configuration text, no unresolved item, no generated credential and no `method_mismatch` — so what could stand there is an earlier request's draft, and standing beside this refusal it would read as this request's answer.
This specification has refused a presentation that reads alike in materially different situations every time it has met one, `a-presented-connector-configuration-states-an-outstanding-or-failed-read` over three windows of one read and `a-presented-connector-configuration-states-a-connector-name-nothing-is-registered-under` over a fourth, and the misreading is worse here than a blank: `domain/integration/connector-configuration-draft-unresolved-reason`'s reasons each name something the chosen operation itself declared, so an unresolved list drawn from another operation is a disclosure about an operation the operator did not select, and applying the configuration text beside it applies text drafted from nothing.
Whether the Configuration field's own content stands untouched by this refusal's arrival is `the-configuration-field-is-untouched-by-a-drafts-arrival`'s own.

Whether a refusal is ever stated of a request the operation has not answered is `no-draft-refusal-is-stated-before-the-operation-answers`'s own.

Home is a new invariant over `domain/integration/connector-configuration-draft`: the api contract cannot declare a presentation, and the element declares what a draft is rather than what a surface states about requesting one, which is the placement every presentation fact of this specification has taken.
It adds no attribute to that element, publishes no operation and refuses no call — what each of the three routes answers its caller stays `a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document`'s and `an-openapi-document-declaring-no-such-operation-refuses-the-draft`'s own, and `a-connector-configuration-authoring-surface-offers-a-configuration-helper` keeps stating what the helper is and where it sits.
It is a fact rather than form on this project's own line, changing what a person can learn and do rather than how it looks; which control carries each statement, its wording, its placement and how long it stands are the interface's own, exactly as every other surface rule here leaves them.
