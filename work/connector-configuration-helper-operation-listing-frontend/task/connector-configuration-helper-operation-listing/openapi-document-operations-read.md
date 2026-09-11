---
title: Read a named document's operations
summary: A hook that calls read-openapi-document-operations for an operator-named link and exposes either the document's operations or the single condition the answer named in refusing.
objective: A hook given an operator-named OpenAPI document link exposes that document's operations as path-and-method entries, or the one condition read-openapi-document-operations named in refusing that read.
criteria:
  - The read is issued through the application's api client against the backend's read-openapi-document-operations route.
  - No request is issued from the frontend to the operator-named OpenAPI document link itself.
  - An answer listing a document's operations is exposed as one entry per listed operation, each entry carrying that operation's path and that operation's method.
  - An entry's method is the method the answer named for that operation, the hook applying no case change of its own, so an answer naming POST is exposed as POST.
  - A refusal reporting OpenApiDocumentNotFetchedError is exposed as an outcome naming an unfetchable link and carrying which of network-failure, timeout or status-outside-2xx the answer named.
  - A refusal reporting OpenApiDocumentNotReadableError is exposed as an outcome naming a document that could not be read as OpenAPI 3.x, and never as the unfetchable-link outcome.
  - An answer whose error value is neither of those two, or whose body does not carry the expected shape, is exposed as an unrecognised failure naming neither of the two conditions.
  - An outcome that is any of the refusal conditions exposes no operation entries.
  - Reading a second link exposes that second link's own operations and never the entries the previously read link answered.
implements:
  - domain/integration/openapi-operation
  - domain/integration/openapi-document-operations
  - contracts/integration/openapi-document-operations
  - rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing
  - rules/integration/an-openapi-operations-method-is-upper-cased
  - rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read
  - rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read
  - rules/integration/an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  - rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  - constraints/the-openapi-document-is-fetched-by-the-backend
sources:
  - work/connector-configuration-helper-operation-listing-frontend/intake/scope.md
---

## What it is

A new hook wraps the api client in the same way the existing backend-reading hooks do and is keyed by the link it is asked to read.
It translates the answer into one closed set of outcomes: the operations, an unfetchable link with which failure it was, an unreadable document, and an unrecognised failure.
It is demonstrable on its own with fetch stubbed on the operations-read route, without the backend operation existing.

## Notes

No hook in the surveyed tree yet performs a read keyed by a caller-supplied argument, so the query-key shape for a link-keyed read has no precedent to copy.
UNDERDETERMINED, from the specification — rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document states that OpenApiDocumentNotFetchedError's details carry, beside which of the three fetch failures occurred, the status code the link answered where the failure is status-outside-2xx, and the link the request named exactly as it named it. The criterion for that refusal requires only "which of network-failure, timeout or status-outside-2xx the answer named", so the answered status code and the echoed link reach no criterion of this task; an implementation exposing only the sub-kind and discarding the status code and echoed link satisfies every criterion as written while failing to put the distinguishing status code in front of the operator.
UNDERDETERMINED, from the specification — rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read states the refusal names what failed to parse, or which version was declared, or that the document declares no version at all — that last told apart from both the others and never given as an absent or empty declared version and never as a parse failure. The criterion exposes the OpenApiDocumentNotReadableError refusal as one flat outcome carrying none of those three namings, so an implementation collapsing all three into one undifferentiated outcome satisfies every criterion as written.
REMAINDER, from the specification — rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing has two further clauses this task's criteria do not reach: that the operator names one of the document's operations by choosing one of the listed pairs and never by typing a path or a method, and that the draft request the helper then issues names the chosen pair's own path and its own method. Belongs to: the task that builds the Configuration Helper surface — the one that renders the listed entries as choices and issues the draft request from the chosen entry.
REMAINDER, from the specification — rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read carries clauses about where and when the refusal is raised — refused before any parsing is attempted, the fetch abandoned as a timeout after 60000 milliseconds, no operations read from a document that was never received — which are the backend operation's own conduct. Belongs to: the task implementing the backend read-openapi-document-operations operation of contracts/integration/openapi-document-operations.
REMAINDER, from the specification — rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read likewise carries the parse-stage clauses — read as OpenAPI 3.x in either JSON or YAML, the serialization decided by parsing the fetched text itself and never by any declared content type, no operations read from an unparseable or unsupported document — which no criterion of this task reaches; scenarios/integration/a-swagger-2-document-refuses-the-operations-read demonstrates exactly that backend refusal. Belongs to: the task implementing the backend read-openapi-document-operations operation of contracts/integration/openapi-document-operations.
ADVISORY, from the specification — rules/integration/an-openapi-operations-method-is-upper-cased constrains domain/integration/openapi-operation, the answered value; the criterion has the hook apply no case change of its own, which meets the rule only for as long as the answer conforms to that domain node. The upper-casing guarantee itself is tested in the backend task, not this one.
ADVISORY, from the specification — rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper governs the surface that offers the helper beneath the Configuration field and states that requesting a draft issues no register-connector call; this task delivers a hook, not a surface, so it is left out of implements as a neighbor belonging to the surface task.
ADVISORY, from the specification — rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document scopes its details statement to a request to draft a connector configuration, while rules/integration/an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document states only the status and the two error values for read-openapi-document-operations and nothing of the details. The fetch sub-kind reaches this task through the operations-read rule's own words that these are the same two error values the draft operation's own refusals report; a reviewer who reads that sharing more narrowly should have the operations-read rule restate the details in its own statement.
