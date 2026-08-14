---
title: Request-assembly translation from Subject data and a stored credential
summary: A translation step that turns a Subject's attribute-values, the collection's requester identity and a separately-sourced credential into the concrete address, query, headers and body of an outbound HTTP request, without executing configuration as code.
rationale: "This task was re-cut twice. The first two cuts (as descriptor-placeholder-resolver) asserted a connector-descriptor schema, a placeholder syntax, a credential-sourcing policy and a fail-closed rule that no specification node states anywhere in the tree — domain/integration/capability's connector field is deliberately opaque (decision-log: \"an opaque string keeps vendors out of the model\"), and domain/investigation/subject states that a connector \"resolves internally... which of the attributes it needs and how to derive its call from them,\" i.e. this derivation is deliberately kept opaque to the domain. This cut keeps the same real, falsifiable engineering criteria — no eval, credential sourced from an environment variable rather than plain-stored text, fail-closed on a missing attribute, no domain-layer import — because the scope still needs them built, but claims specification backing only for what a node actually states: that the requester identity travels alongside a Subject-drawn value into a connector's own configuration (collection-runs-in-the-requester-scope), that the translation module sits outside the domain layer's own dependencies (the-domain-depends-on-no-infrastructure), and the three contracts naming this generic, connector-resolved, external consumption. The descriptor's own shape, its placeholder syntax, and the credential-sourcing/fail-closed mechanics are the implementer's free technical choice, exactly as the scope itself frames them."
sources:
  - intake/scope.md
objective: A Subject's attribute-values, the collection's requester identity, and a connector's own call configuration can be translated into the concrete address, query, headers and body of an outbound HTTP request, together with a separately-sourced credential, without ever executing the configuration as code.
criteria:
  - A value drawn from the Subject the collection stage passed in can appear in any part of the assembled request (address, query, headers or body) that the connector's configuration designates, through template substitution rather than by evaluating the configuration as executable code — no eval, Function constructor, or equivalent dynamic-code-execution path places it there.
  - A credential a connector's call needs is read from an environment variable or an equivalent secret source by name at resolution time, never from a plain-text value stored in the same row as the rest of the connector's configuration.
  - Resolution over an attribute the Subject the collection stage assembled does not carry is refused before any request is sent, rather than proceeding with a missing or empty value substituted in its place.
  - The requester identity the collection call carries is available to the connector's configuration for placement into the assembled request through the same substitution mechanism as a Subject-drawn value, so that giving one connector's call a requester-scoped parameter is a change to that connector's own configuration, never a change to the resolution mechanism itself.
  - No module under the domain layer (case behavior, investigation factory, evaluation, vocabulary) imports this translation module, its secret-reading mechanism, or any HTTP-request-building package directly.
implements:
  - contracts/integration/concept-observation
  - contracts/system/corporate-records
  - contracts/integration/corporate-records-source
  - domain/integration/capability
  - rules/investigation/collection-runs-in-the-requester-scope
  - constraints/the-domain-depends-on-no-infrastructure
---

## What it is

A pure translation step that reads a Subject's attribute-values, the collection's requester identity, and a connector's own call configuration, and produces the concrete address, query, headers and body of one outbound HTTP request, plus wherever a credential the call needs is placed.
A substitution mechanism that never executes the configuration as code, sources a credential only from an environment variable or equivalent secret store by name, and refuses rather than guesses when a designated Subject attribute is absent.

## Notes

The descriptor format, placeholder syntax and algorithm the scope sketches are its own explicitly non-binding technical suggestion; another technique meeting the five criteria above is equally acceptable. No specification node models the connector's own call configuration as a structure with address/query/headers/body templates or a credential-reference field — nothing contradicts that shape, but nothing authorizes or constrains it either, so it stays entirely the implementer's design.
Criterion 5 requires only that no domain module hold a static import of this translation module, its secret-reading mechanism, or an HTTP package; it does not by itself rule out domain code reaching this translation through a dynamic lookup, a global registry, or a string-keyed service locator with no domain-defined port anywhere in the codebase — which would satisfy the criterion's literal wording while still violating constraints/the-domain-depends-on-no-infrastructure's "infrastructure reaches it only through ports" clause. A test should confirm an actual port/interface exists at the domain boundary, not merely the absence of a static import.
Three clauses reach no criterion of this task and belong elsewhere: contracts/integration/concept-observation's "answering in the glossary's vocabulary" and corporate-records-source's "no source-system vocabulary crosses further in" belong to the response-normalization task (rules/integration/evidence-arrives-in-the-glossary-vocabulary, constraints/evidence-normalization-is-an-anticorruption-layer); "within the capability's timeout" belongs to the dispatch/budget task (rules/investigation/collection-has-its-own-budget-within-the-total, rules/investigation/no-stage-aborts-on-its-deadline); and the read-only assertion common to all three contracts belongs to whichever task fixes or dispatches a connector's HTTP method, since this task never mentions one.
