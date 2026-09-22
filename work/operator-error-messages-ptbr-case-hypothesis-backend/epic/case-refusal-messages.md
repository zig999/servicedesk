---
title: PT-br messages for the case-domain refusals the backend returns
summary: The eleven case-domain error classes under src/src/errors whose message text the HTTP error envelope
  hands the operator, rewritten in PT-br.
rationale: The nineteen classes the scope names split at the aggregate root they speak about — a case
  and its versions here, a hypothesis revision and a manifest there — and no message in one group reads
  or restates a value from the other, so the two groups carry no seam between them and are cut as two
  epics.
sources:
- /home/siegfriedneto/projects/servicedeskn1/work/operator-error-messages-ptbr-case-hypothesis-backend/intake/scope.md
covers:
- domain/knowledge/case
- domain/knowledge/case-version
- rules/knowledge/a-case-version-is-written-once
- rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
- rules/knowledge/a-case-has-at-most-one-draft
- rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
- rules/investigation/only-a-released-case-version-is-diagnosed
- rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
- rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
- rules/knowledge/a-release-refusal-with-no-named-violation-says-so
- rules/knowledge/a-case-version-written-under-an-already-stored-slug-and-version-is-refused
- constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
- constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
- domain/knowledge/case-summary
- constraints/a-case-is-read-whole
- constraints/a-domain-error-unmapped-by-status-is-refused-generically
- constraints/a-malformed-request-is-refused-with-a-validation-error
- rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
- rules/knowledge/a-case-listing-states-a-current-version-that-does-not-read-back-in-that-cases-entry-alone
- rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record
- rules/knowledge/a-presented-case-version-states-its-own-declared-attributes
- rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading
- rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
- rules/knowledge/a-surface-offering-release-states-which-release-conditions-the-draft-meets
- rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
- constraints/a-successful-capability-removal-answers-with-no-content
- constraints/a-successful-concept-removal-answers-with-no-content
- constraints/a-successful-connector-configuration-removal-answers-with-no-content
- constraints/every-screen-discloses-that-authentication-is-unenforced
- constraints/no-route-enforces-authentication
- constraints/listings-are-paged
- constraints/the-capability-identity-read-is-rate-limited
- constraints/the-capability-identity-read-refuses-an-unregistered-identity
- constraints/the-diagnosis-and-simulation-routes-are-rate-limited
- constraints/the-connection-pool-is-bounded-by-configuration
- constraints/the-pool-bounds-are-positive-integers
- constraints/the-database-is-externally-provisioned
- constraints/the-system-persists-to-one-relational-database
- constraints/the-schema-replays-from-its-scripts
- constraints/the-stored-schema-mirrors-the-declared-model
- constraints/the-domain-depends-on-no-infrastructure
- constraints/the-openapi-document-is-fetched-by-the-backend
- constraints/the-register-capability-route-defers-completeness-to-the-registry
- constraints/the-register-capability-route-defers-the-nature-vocabulary-to-the-registry
uncovered:
- node: rules/knowledge/a-case-version-is-written-once
  why: It holds a released version and its manifest entries unaltered and keeps revising composing the
    next draft; no message this epic's tasks rewrite states or contradicts that guarantee — the new
    a-case-version-written-under-an-already-stored-slug-and-version-is-refused node, not this one, governs
    CaseVersionAlreadyStoredError's message.
- node: domain/knowledge/case-summary
  why: No message among the eleven names a case summary or any attribute a summary carries.
- node: constraints/a-case-is-read-whole
  why: It decides what a read assembles before it answers, and none of the eleven messages states what
    a read assembled.
- node: constraints/a-domain-error-unmapped-by-status-is-refused-generically
  why: It governs errors status-map.ts does not name and holds that the error's own message never reaches
    the caller; all eleven classes are named by status-map.ts, so none of them is ever read under it.
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  why: It words the shape refusal a route raises before any domain error exists, and no class under src/src/errors
    carries that message.
- node: rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
  why: It states what a frontend surface tells its reader, and the frontend is not this scope's target.
- node: rules/knowledge/a-case-listing-states-a-current-version-that-does-not-read-back-in-that-cases-entry-alone
  why: It states what a frontend listing tells its reader, and the frontend is not this scope's target.
- node: rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record
  why: It governs which record a surface presents content from, and no refusal message presents content.
- node: rules/knowledge/a-presented-case-version-states-its-own-declared-attributes
  why: It governs a presented version's attributes on a surface, not the text of a refusal.
- node: rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading
  why: It governs a route offered on a surface, not the text of a refusal.
- node: rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
  why: It expressly forbids the surface disclosing a refusal's own message, so no wording change on the
    wire can be observed through it.
- node: rules/knowledge/a-surface-offering-release-states-which-release-conditions-the-draft-meets
  why: It states a disclosure made before any release is attempted, and a refusal message is what arrives
    after one.
- node: rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
  why: It states what a frontend surface tells its reader, and the frontend is not this scope's target.
- node: constraints/a-successful-capability-removal-answers-with-no-content
  why: It words a successful answer that carries no message at all.
- node: constraints/a-successful-concept-removal-answers-with-no-content
  why: It words a successful answer that carries no message at all.
- node: constraints/a-successful-connector-configuration-removal-answers-with-no-content
  why: It words a successful answer that carries no message at all.
- node: constraints/every-screen-discloses-that-authentication-is-unenforced
  why: It governs a frontend screen's disclosure, and the frontend is not this scope's target.
- node: constraints/no-route-enforces-authentication
  why: It decides what a route enforces, and no refusal among the eleven reports authentication.
- node: constraints/listings-are-paged
  why: It shapes a listing answer, and none of the eleven classes is raised by paging.
- node: constraints/the-capability-identity-read-is-rate-limited
  why: It bounds a route of the integration surface, which raises none of the eleven classes.
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  why: It names a refusal of the integration domain, not of the case domain this epic rewrites.
- node: constraints/the-diagnosis-and-simulation-routes-are-rate-limited
  why: It bounds how often a route may be called and names no domain error class.
- node: constraints/the-connection-pool-is-bounded-by-configuration
  why: It governs infrastructure the domain error classes never touch.
- node: constraints/the-pool-bounds-are-positive-integers
  why: It governs infrastructure the domain error classes never touch.
- node: constraints/the-database-is-externally-provisioned
  why: It governs infrastructure the domain error classes never touch.
- node: constraints/the-system-persists-to-one-relational-database
  why: It governs infrastructure the domain error classes never touch.
- node: constraints/the-schema-replays-from-its-scripts
  why: It governs the stored schema, which no message wording reaches.
- node: constraints/the-stored-schema-mirrors-the-declared-model
  why: It governs the stored schema, which no message wording reaches.
- node: constraints/the-domain-depends-on-no-infrastructure
  why: It is a standing bound the tasks stay inside rather than an outcome any of them delivers, since
    every message stays a literal in the domain error class it already sits in.
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  why: It decides where a document is fetched and names no case-domain refusal.
- node: constraints/the-register-capability-route-defers-completeness-to-the-registry
  why: It governs a route of the integration surface, which raises none of the eleven classes.
- node: constraints/the-register-capability-route-defers-the-nature-vocabulary-to-the-registry
  why: It governs a route of the integration surface, which raises none of the eleven classes.
---
## What it is
The eleven case-domain error classes named by the scope, each rewritten so the message the envelope hands the operator is PT-br.
Every one of these classes is named by src/src/errors/status-map.ts and so reaches the operator as its own message rather than as the generic fallback.
The epic changes message text only: no class name, no status mapping, no context object and no envelope shape.

## Notes
The three tasks below cut the eleven classes by what refuses the operator, not by which file they live in.
The impact set reaches well past the case domain because the scope names the HTTP error envelope, which every route shares; what that envelope decides for a request other than a case request is declared uncovered above.
A large majority of the rules in this epic's slice state what a frontend surface tells its reader, and two of them forbid that surface repeating a refusal's message at all, so translating the backend text is unobservable through them.
