---
type: invariant
statement: >-
  The document fetched for a connector configuration draft is read as OpenAPI 3.x in either of
  the two serializations the OpenAPI format itself defines -- JSON and YAML -- with the
  serialization decided by parsing the fetched text itself and never by any content type the
  response declared, a document served as YAML read exactly as one served as JSON holding the
  same version check, the same refusals and the same draft resolved from it; and a request to
  draft a connector configuration whose fetched document parses as neither of those two
  serializations, or parses as one of them but is not a well-formed OpenAPI document, or whose
  declared version is not OpenAPI 3.x -- a Swagger 2.0 document among them -- is refused, naming
  what failed to parse or which version was declared and, where the document parses but declares
  no version at all -- neither an OpenAPI version nor a Swagger one -- naming that the document
  declares no version, that naming told apart from both the others and never given as an absent
  or empty declared version and never as a parse failure, no draft generated from an unparseable
  or unsupported document.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

Only OpenAPI 3.x is read: an earlier Swagger 2.0 document names its operations, parameters and security schemes differently, and reading one as though it were 3.x would misname what the draft resolves rather than refuse honestly. A document that does not parse at all is the same refusal for the same reason a-connector-configuration-holds-a-well-formed-object already gives a registration that does not parse: nothing partial is worth drafting from text nobody can read.

Both serializations are read because they are the two the OpenAPI format defines for one and the same document, and every construct the draft rules read -- an operation at a path and method, its parameters, its request body's media types, its security schemes -- is the same object model whichever of the two carried it, so the serialization decides nothing about what a draft resolves. Refusing a document because it arrived as YAML would refuse most of what an operator can name while nothing about the text was in fact unreadable. The serialization is decided by parsing the text rather than by a declared content type because the only thing an-unfetchable-openapi-link-refuses-the-draft reads of the response is its status; reading a content type instead would add a refusal this rule does not hold, for a document that parses perfectly and was merely served under a type whatever publishes it chose. Text that parses as neither serialization is text nobody can read as OpenAPI, which is the refusal this rule already gives — the same unreadable-document refusal `a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document` states, never a fetch failure and never a condition of its own — so it takes no third condition and no third error value.

A document that parses but declares no version at all is that same unreadable-document refusal and not a further one, and what it names is the absence itself: nothing about the text failed to parse, and no version stands there to be named. The operator whose link answered a 2.0 document goes looking for the 3.x document of the same api; the operator whose link answered a document declaring no version has most often been answered by something that is not an OpenAPI document, or not the document they meant. A refusal naming an empty version, or naming a parse failure over text that parsed perfectly, sends each of them after the other's correction.
