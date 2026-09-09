---
type: invariant
statement: >-
  Where draft-connector-configuration-from-openapi answers a request with a generated
  connector configuration draft rather than with one of the refusals its own rules state,
  that answer carries an HTTP 200 status. It is never HTTP 201, generating a draft creating
  no connector configuration and no record of any kind; never HTTP 204, the draft being the
  whole of what the request asked for; and never HTTP 202, the draft standing in the answer
  to the request that asked for it.
expression: >-
  For a request naming a connector name c, an OpenAPI document link l and a path and method
  pairing p, where the document fetched from l parses as OpenAPI 3.x and declares an
  operation at p: the answer draft-connector-configuration-from-openapi returns holds status
  200 and the draft generated for c. No generated draft is answered under any other status,
  whatever it left unresolved, whichever credentials it generated, and whether or not it
  states a method_mismatch.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

What this operation answers when it refuses is already stated: `a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document` states HTTP 422 and two error values for a link that could not be fetched and a document that cannot be read as OpenAPI 3.x, and `an-openapi-document-declaring-no-such-operation-refuses-the-draft` states HTTP 422 and its own error value for a path and method pairing the document declares no operation for. What the surface answers when a draft is generated was stated by nothing. Because `constraints/the-openapi-document-is-fetched-by-the-backend` puts the fetch and the generation inside the backend operation, this answer is that operation's own answer to its caller, exactly as its three refusals are.

HTTP 200 and never HTTP 201. `a-connector-configuration-draft-registers-nothing` states that generating a draft issues no register-connector call, creates no connector configuration, and leaves every registered configuration exactly as it stood; 201 asserts to the caller that the request created something, which is what that invariant denies. Nothing here stores a draft or publishes a read of one — `contracts/integration/connector-configuration-draft` publishes the one operation and no read — so there is no created thing for a created status to be about. This is what makes the status a fact this specification holds rather than one it can leave to convention: for this operation the conventional candidate would state a creation the specification refuses.

Never HTTP 204 and never HTTP 202. A status carrying no body cannot answer the draft at all, while `a-connector-configuration-draft-response-carries-no-capability` holds the answer to one field per attribute `domain/integration/connector-configuration-draft` declares — the configuration text, the unresolved items and the generated credentials that element's own Responsibility exists to disclose by name and by reason. 202 would state that the answer is not yet the draft; every rule of this operation reads the operator's request as answered with a draft or with a named refusal, and `a-refused-draft-request-states-its-refusal-to-the-operator` states no refusal of a request the operation has not answered, so there is no third, unanswered condition for an accepted status to name.

Reach. This states the status of this operation's own successful answer and nothing else. The successful statuses of the other operations this specification publishes stay unstated, and none of them is decided here: over those, either conventional status contradicts no node, which is why they remain conventional and this does not. It decides nothing about the draft's refusals, nothing about what the answer's body carries, and nothing about what any surface states to the operator, each of which stays its own rule's.

Home. A new rule rather than `contracts/integration/connector-configuration-draft`, which as an api declares the operations it publishes and can declare no answer at all, and rather than `a-connector-configuration-draft-response-carries-no-capability`, whose identity is what the answer's body may not carry and whose own Description holds this operation's other surface answers to their own rules — the same split `a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document` already made in taking the refusal statuses into one house of their own. An invariant over `domain/integration/connector-configuration-draft`, immediate and inside that one element: the condition is decidable from one answer alone.
