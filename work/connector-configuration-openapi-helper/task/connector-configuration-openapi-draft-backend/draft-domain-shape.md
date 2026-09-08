---
title: The connector configuration draft's domain shape
summary: The draft value object, its unresolved item, its generated credential, its method mismatch and the closed unresolved-reason vocabulary, declared in the domain with no infrastructure import.
rationale: The scope names five new domain elements without saying how they are cut into work; they are one task because they change for exactly one reason -- the domain model moving -- and every resolution task below reads the same shape, so cutting one task per value object would multiply a single decision into five.
sources:
  - intake/scope.md
objective: The draft's five domain elements stand as declared types and one closed vocabulary that every later draft task builds its answer from.
criteria:
  - The unresolved-reason vocabulary admits exactly no-capability-registered, no-matching-input-schema-property, security-scheme-not-reducible-to-a-credential and drafted-key-occupied-by-another-security-scheme.
  - A value outside that vocabulary is rejected rather than carried as an unresolved reason.
  - A connector configuration draft declares a connector, a configuration, an unresolved list and a generated-credentials list, each of the two lists present and possibly empty.
  - A connector configuration draft admits a method mismatch as an optional element and is valid without one.
  - A connector configuration draft admits any number of capability references, including none.
  - An unresolved item carries a name and exactly one reason drawn from the vocabulary.
  - A generated credential carries the generated name and the security scheme's own name.
  - A method mismatch carries the registered method and the operation's method as two separate named values.
  - No module of the draft's domain shape imports a framework, a driver or a provider client.
implements:
  - constraints/the-domain-depends-on-no-infrastructure
  - domain/integration/connector-configuration-draft
  - domain/integration/connector-configuration-draft-unresolved-item
  - domain/integration/connector-configuration-draft-unresolved-reason
  - domain/integration/connector-configuration-draft-generated-credential
  - domain/integration/connector-configuration-draft-method-mismatch
---

## What it is

The domain-side declaration of what a draft is, before anything generates one.
It is the one place the unresolved reasons are enumerated, so no later task states a reason of its own.

## Notes

The draft's configuration is held as JSON object text, the same way the existing connector-registry holds a configuration payload rather than a native object.
UNDERDETERMINED, from the specification — criterion 3 ("declares... each of the two lists present and possibly empty") was reworded during binding to close a reading where "requires" admitted only non-empty lists; the specification refuses a draft that rejects an operation resolving everything (empty unresolved) or declaring no security scheme (empty generated_credentials). Implementation: a value object where unresolved and generated_credentials are declared arrays that may hold zero items.
REMAINDER, from the specification — every clause governing how the draft's configuration text and its two lists are actually derived from the chosen operation (byte-for-byte matching and unresolved reasons, generated-name composition, upper-cased method, the two always-absent keys, the whole address/query/headers/body/Cookie positioning) reaches no criterion of this task, which declares types only. Belongs to the later tasks that generate a draft's configuration text, unresolved list and generated-credentials list from one chosen operation.
REMAINDER, from the specification — the method_mismatch's presence condition and case folding (rules/integration/a-connector-configuration-drafts-method-is-compared-against-what-is-currently-registered) reach no criterion here. Belongs to the task computing the method mismatch.
REMAINDER, from the specification — rules/integration/a-connector-configuration-draft-registers-nothing's guarantee that generating a draft issues no register-connector call reaches no criterion here, since a declared type performs no act. Belongs to the later generation task and the surface task through which an operator applies a draft.
REMAINDER, from the specification — the draft's four refusals (unfetchable link with its 60000-millisecond bound, malformed/unsupported document, no-such-operation, and their HTTP status/error values) reach no criterion of this task. Belongs to the tasks that fetch the document, read the operation and publish the HTTP surface.
ADVISORY, from the specification — contracts/integration/connector-configuration-draft, constraints/the-openapi-document-is-fetched-by-the-backend and constraints/a-malformed-request-is-refused-with-a-validation-error are candidates this task, declaring domain types only, does not reach.
REMAINDER, from the specification — confirmed unchanged on re-bind after rules/integration/a-connector-configuration-draft-response-carries-no-capability and rules/integration/a-drafted-connector-configuration-is-answered-as-a-read were added to the epic's covers; both govern the operation's answer, and this task declares types only. Belongs to the task that answers draft-connector-configuration-from-openapi.
UNDERDETERMINED, from the specification — criterion 5 ("admits any number of capability references, including none") is satisfiable by a declaration that also serializes the capability set, which rules/integration/a-connector-configuration-draft-response-carries-no-capability would then refuse once that type reaches an answer. Implementation: declare the capability set as a relationship the generator reads to resolve the draft, never as a field the type's own serialization exposes.
