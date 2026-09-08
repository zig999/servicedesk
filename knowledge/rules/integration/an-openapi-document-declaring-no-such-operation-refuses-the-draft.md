---
type: invariant
statement: A request to draft a connector configuration whose fetched document parses and declares OpenAPI 3.x but declares no operation at the path and HTTP method the request names is refused with an HTTP 422 response reporting an OpenApiOperationNotFoundError, naming that path and that method as the pairing the fetched document declares no operation for; no draft is generated, and a path the document does declare while declaring nothing for the named method under it is that same one refusal rather than a condition of its own.
expression: >-
  For a request naming an OpenAPI document link l, a path p and an HTTP method m, where the
  document fetched from l parses and declares OpenAPI 3.x: where that document's paths hold
  no entry for p, or hold an entry for p that declares no operation for m, the request is
  refused with an HTTP 422 response reporting an OpenApiOperationNotFoundError, the refusal
  names p and m, and no connector-configuration-draft is produced — no configuration text, no
  unresolved item, no generated credential and no method_mismatch. Where that document's paths
  hold an entry for p declaring an operation for m, that operation is the one operation every
  other draft rule reads.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

Everything a draft holds is drawn from one operation: domain/integration/connector-configuration-draft is a candidate configuration generated from one operation of an OpenAPI document, a-connector-configuration-draft-names-subject-placeholders-from-a-registered-capability reads that operation's parameters and request-body fields, a-connector-configuration-draft-names-a-generated-credential-for-a-reducible-security-scheme reads its security schemes, and a-connector-configuration-drafts-method-is-compared-against-what-is-currently-registered compares its own HTTP method. Where the document declares no operation at the named pairing there is no such thing to read, so there is nothing to draft from and the request is refused rather than answered with a draft.

Answering instead with a draft holding nothing resolved would misstate what the draft's own disclosure means: domain/integration/connector-configuration-draft-unresolved-reason's three reasons each name something a chosen operation itself declared and the draft could not honestly turn into a placeholder, so an empty unresolved list over an operation that was never found would read to an operator as an operation with nothing in it, the one misreading that has them apply a configuration drafted from nothing.

The refusal names the path and the method it was given, on its own account, for the reason an-unfetchable-openapi-link-refuses-the-draft and a-malformed-or-unsupported-openapi-document-refuses-the-draft each name theirs: the document here was received and read successfully, so folding this into either of those would tell the operator their link or their document was at fault when what was wrong was the operation they selected. A path declared with the named method absent under it is the same refusal because it is the same thing the operator got wrong — the pairing selects the operation, and neither half of it selects one alone.

HTTP 422 and the OpenApiOperationNotFoundError name follow the same reading a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document already gives the draft operation's other two refusals: the request is well formed and the document was read; what it names — a path and method pairing — is what cannot be drafted from, the same class of refusal the other two already answer under 422, distinguished from them by its own named condition.
