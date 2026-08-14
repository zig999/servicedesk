---
title: Generic HTTP adapter answering the observation-source port for any registered connector
summary: The one adapter behind IObservationSource that executes a registered connector's HTTP call and resolves it to one of the four evidence-result endings, in the glossary's vocabulary, within scope and timeout.
rationale: "One criterion previously asserted a specific default status-classification policy (an HTTP status absent from a mapping resolving to 'unavailable') that no specification node states — domain/investigation/evidence-result enumerates the four endings without per-value semantics or a stated default, and the scope itself marks its status_map illustration non-binding. That criterion is replaced with the totality property the port's own never-throw contract actually requires: every reachable status resolves to one of the four endings, leaving which of the four any particular status produces to the implementer's own classification design. Every other criterion here restates only what the port, the referenced rules, the two scenarios and the two constraints already state, at the granularity this adapter can be held to."
sources:
  - intake/scope.md
objective: HttpDeclarativeObservationSource answers IObservationSource for any capability whose connector is registered, by issuing one real HTTP call and resolving it to exactly one of the four evidence-result endings, in the glossary's vocabulary, within the requester's scope and inside the capability's own timeout budget.
criteria:
  - The adapter implements observeConcept(concept, subject, requester) at the existing IObservationSource port, requiring no change to the port's signature or to evidence-collection-stage.ts's call site.
  - Each observeConcept invocation issues exactly one outbound call to the external system, never more than one per concept per collection attempt.
  - Which external system a call reaches is resolved entirely from the calling capability's own connector value at call time; no external system's name, host or shape is hard-coded in the adapter's source, so a newly registered connector is reachable without a new deploy.
  - A call that completes resolves to exactly one of the four evidence-result endings (ok, unavailable, denied, timeout); ok is the only one of the four that carries an observation.
  - Every HTTP response status the external system can return resolves to exactly one of the four evidence-result endings the adapter can produce; no status value falls through unclassified or causes a thrown exception in place of one of the four.
  - A call that has not completed by its own bound elapsing resolves to the timeout ending, recorded as evidence, rather than raising an exception that would abort the collection stage.
  - The client-side timeout the adapter applies to its own call is never greater than the calling capability's own declared timeout, so a capability's own timeout can never hold the collection stage's seven-second budget hostage past what that budget still allows.
  - The requester passed into observeConcept is available to the call the adapter constructs, never substituted by a service-level identity, for a connector whose call needs it for scoping.
  - The observation returned on the ok ending is keyed by the calling capability's own output_schema property names, never by a field name taken verbatim from the external response's own structure.
  - The adapter and any HTTP client package it uses live outside the domain layer, and no domain module imports either directly.
  - The translation from the external response's own structure into the returned observation happens entirely inside the adapter, never inside evidence-collection-stage.ts or any other domain module, so no source-system field name crosses past the adapter.
depends_on:
  - task/http-observation-runtime/descriptor-placeholder-resolver
  - task/http-observation-runtime/response-path-extractor
  - task/connector-registration/connector-configuration-persistence
implements:
  - contracts/investigation/observation-source
  - contracts/integration/concept-observation
  - contracts/system/corporate-records
  - contracts/integration/corporate-records-source
  - domain/investigation/evidence-result
  - domain/integration/capability
  - rules/investigation/no-stage-aborts-on-its-deadline
  - rules/investigation/collection-has-its-own-budget-within-the-total
  - rules/investigation/collection-runs-in-the-requester-scope
  - rules/integration/evidence-arrives-in-the-glossary-vocabulary
  - scenarios/investigation/a-collection-timeout-degrades-to-no-data
  - constraints/the-domain-depends-on-no-infrastructure
  - constraints/evidence-normalization-is-an-anticorruption-layer
---

## What it is

The one new adapter class (the scope's HttpDeclarativeObservationSource) implementing the unchanged IObservationSource port.
The orchestration of capability lookup, connector-configuration lookup, request build, HTTP call, status classification and response extraction into one of the four endings.

## Notes

The status-to-ending classification mechanism (which specific ending an unmapped status resolves to) is the implementer's free technical choice; only the totality of the classification (every status lands on one of the four) and the never-throw contract are held as criteria.
The descriptor format, request-template syntax and JSONPath extraction syntax the scope illustrates are non-binding, per the scope's own statement.
Testability with a fake HTTP client and fixture descriptors, so no unit test makes a real network call, is the scope's own stated expectation for this adapter.
An earlier binder pass over criterion 7 (the client-side timeout bound) flagged, as underdetermined, that an adapter applying a small fixed timeout far below any capability's declared timeout would satisfy the criterion's literal wording while no longer letting the capability's own declared timeout actually govern the call, against rules/investigation/collection-has-its-own-budget-within-the-total's "a capability's own declared timeout governs a single call." The final binder pass (run after domain/integration/capability was added to this task's candidates) did not repeat the note, but it is carried forward here for the test-author's benefit: a test should confirm the adapter's applied timeout tracks the capability's own declared value, not a fixed constant unrelated to it.
scenarios/investigation/a-collection-timeout-degrades-to-no-data is claimed here because criterion 6 directly demonstrates its "the evidence for equipment-state records result timeout" clause; its other two clauses (the evaluation's own inconclusive/no-data outcome, and the investigation proceeding within the total deadline) reach no criterion of this task and belong to the evaluation/judgment stage and the overall investigation orchestration, both outside this plan.
Three specification clauses reach no criterion of this task and belong elsewhere, already built or governed outside this plan: rules/investigation/no-stage-aborts-on-its-deadline's "judgment records deadline-exceeded" clause (the judgment/evaluation stage's own task), its "persistence as the single declared exception" clause (the persistence stage's own task), and rules/investigation/collection-has-its-own-budget-within-the-total's seven-second collection-wide budget and remaining-time clamp (evidence-collection-stage.ts's existing, unchanged orchestration, since this task's own criterion 1 leaves that call site untouched).
