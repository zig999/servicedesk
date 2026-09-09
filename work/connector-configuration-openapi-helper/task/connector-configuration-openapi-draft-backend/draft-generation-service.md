---
title: Generate one connector configuration draft
summary: The service that composes the fetch, the document reading, the subject resolution, the credential generation and the method comparison into one draft -- configuration text, unresolved list, generated credentials, any mismatch -- and writes nothing.
rationale: The scope states the operation without saying where composition sits; I cut it apart from the HTTP surface so the draft's own content is demonstrable without a route, and apart from the resolvers so each of those stays demonstrable without the whole.
sources:
  - intake/scope.md
depends_on:
  - task/connector-configuration-openapi-draft-backend/draft-domain-shape
  - task/connector-configuration-openapi-draft-backend/openapi-document-fetch
  - task/connector-configuration-openapi-draft-backend/openapi-3x-operation-reading
  - task/connector-configuration-openapi-draft-backend/subject-placeholder-resolution
  - task/connector-configuration-openapi-draft-backend/generated-credential-placeholders
  - task/connector-configuration-openapi-draft-backend/registered-method-comparison
objective: One connector name, one document link and one chosen operation yield one connector configuration draft whose configuration, unresolved list, generated credentials and method mismatch are all as the resolutions decided, with nothing registered.
criteria:
  - The draft's configuration is well-formed JSON object text.
  - The draft's configuration declares a method whose value is the chosen operation's own HTTP method, upper-cased.
  - The draft's configuration's address is composed from the first entry of the servers array in effect for the operation (the operation's own, else its path item's, else the document's top level), with any trailing slash removed, followed by the operation's own path -- or the path alone where no servers array is in effect or it holds no entry.
  - The draft's configuration holds query, headers and body where the operation's parameters or request body declare them, each part placed at the position rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it fixes for its own location (path, query, header, cookie or body).
  - The draft's configuration states no responseMap key.
  - The draft's configuration states no statusMap key.
  - The draft's configuration embeds every subject placeholder the resolution placed, each at the position of the parameter or request-body field it was placed for.
  - The draft's configuration embeds every credential placeholder the generation produced, each at the position the security scheme declared or, for a scheme with no location of its own, in the headers as that rule fixes.
  - An unresolved parameter or field still stands at its own position, holding its own name in the document's brace form.
  - The draft's unresolved list holds every parameter, request-body field and security scheme the operation named that resolved to no placeholder, and nothing else, each carrying the reason the resolving task assigned it.
  - The draft's generated_credentials holds every generated credential the credential-generation task produced, each paired with its security scheme's own name.
  - The draft's method_mismatch is exactly as the method-comparison task computed it, present or absent.
  - The draft names the connector it was generated for.
  - A draft where nothing at all resolved is still generated and returned rather than refused.
  - Generating a draft issues no register-connector call.
  - Every connector configuration registered before a draft is generated stands byte-identical after it.
implements:
  - constraints/the-domain-depends-on-no-infrastructure
  - contracts/integration/connector-configuration-draft
  - domain/integration/connector-configuration
  - domain/integration/connector-configuration-draft
  - domain/integration/connector-configuration-draft-unresolved-item
  - rules/integration/a-connector-configuration-draft-never-states-a-responsemap-or-a-statusmap
  - rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
  - rules/integration/a-connector-configuration-draft-registers-nothing
  - rules/integration/a-connector-configuration-draft-states-the-chosen-operations-method
  - scenarios/integration/an-unconfigured-connector-leaves-every-parameter-unresolved
---

## What it is

The one place a draft is assembled, drawn from a document and from whatever is currently registered.
It is a read: an operator applies and submits a draft later, through the registry's own one write.

## Notes

Both maps are absent rather than empty, because an OpenAPI document states neither an evidence-result ending for a status nor a field path for a response.
The shape this task composes into (method/address/query/headers/body) is fixed by rules/integration/an-http-connector-configuration-declares-its-call, not among this task's own candidates but restated inside domain/integration/connector-configuration-draft and the placement rule's own prose — nothing here needed a fact from outside the candidates.
Decision, beyond the covers — stand: rules/integration/an-http-connector-configuration-declares-its-call is named only descriptively (the rule is pre-existing, already implemented, and unchanged by this epic); no criterion of this task claims to implement it, so the epic's claim is not grown for a mention that decides nothing.
REMAINDER, from the specification — the method-comparison rule's own presence condition and case-folding are composed here as given by the method-comparison task, not re-decided; criterion 12 states that composition rather than the comparison rule's own clauses.
REMAINDER, from the specification — the subject-resolution and credential-generation rules' own matching/composition clauses are composed here as given by those tasks, not re-decided; criteria 7, 9, 10 and 11 state that composition rather than those rules' own clauses.
REMAINDER, from the specification — the draft's four refusals (fetch failure, document unreadable, no-such-operation, and their HTTP status/error values) reach no criterion of this task, which states only that a draft where nothing resolved is generated rather than refused. Belongs to the fetch, document-reading and HTTP-surface tasks.
ADVISORY, from the specification — constraints/the-openapi-document-is-fetched-by-the-backend and constraints/a-malformed-request-is-refused-with-a-validation-error hold over the frontend module and the HTTP route rather than over this composing service, so they are not named here.
REMAINDER, from the specification — confirmed unchanged on re-bind after rules/integration/a-connector-configuration-draft-response-carries-no-capability and rules/integration/a-drafted-connector-configuration-is-answered-as-a-read were added to the epic's covers; both govern the wire answer draft-operation-http-surface serializes, and this composing service produces the draft value, not that answer — the answer's field set may legitimately differ from what this service holds, since domain/integration/connector-configuration-draft still declares a capability reference this service may read without it reaching the answer. Belongs to the sibling task draft-operation-http-surface.
UNDERDETERMINED, from the specification — no criterion of this task states what it does when the named link cannot be fetched, when the fetched document does not parse as OpenAPI 3.x, or when the document declares no operation at the named path and method, though the summary places the fetch and the document reading inside this service and criteria 3, 4, 10 and 12 read the fetched document directly; criterion 14 ("a draft where nothing at all resolved is still generated and returned rather than refused") is written broadly enough to also cover these three refusal conditions, which rules/integration/an-unfetchable-openapi-link-refuses-the-draft, rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft and rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft instead refuse outright. Implementation: this service delegates to the fetch and document-reading tasks first and propagates their refusal without generating any draft; criterion 14's "nothing at all resolved" is scoped to an operation that was found and read, where every parameter, field and security scheme still failed to resolve — never to a fetch or parse failure.
UNDERDETERMINED, from the specification — no criterion states that a parameter, a request-body schema or a security scheme declared through a $ref is read through to its target before this service composes the draft, nor that a path-item-level parameter an operation does not restate is still read; criterion 4 defers positions to rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it by identity but not its reading clauses. Implementation: this service reads only what the operation-reading task (openapi-3x-operation-reading) already resolved through $ref and path-item merging, and introduces no second reading of the raw document.
UNDERDETERMINED, from the specification — criterion 16 ("every connector configuration registered before a draft is generated stands byte-identical after it") does not on its own exclude storing the generated draft as a new connector configuration under a name nothing was registered under; rules/integration/a-connector-configuration-draft-registers-nothing's middle clause ("no connector configuration is created") reaches no criterion here. Implementation: generating a draft creates no connector configuration record under any name, registered or not.
