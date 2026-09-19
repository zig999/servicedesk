---
title: The evidence record faced to the curator
summary: What one collected evidence item shows on the simulate screen, from the wire
  types through the adapter to both Debug surfaces that render it.
covers:
- contracts/investigation/case-simulation
- rules/investigation/a-presented-evidence-items-inputs-are-shown-with-a-resolved-credential-masked
- rules/investigation/an-evidence-item-that-sent-no-inputs-records-an-empty-object
- rules/investigation/an-evidence-item-whose-result-is-not-ok-records-an-empty-observation
- rules/investigation/a-simulation-session-retains-its-runs-and-shows-one
- domain/investigation/evidence
- rules/investigation/an-evidence-items-observed-at-is-a-utc-instant
- rules/investigation/an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation
- rules/investigation/presentation-reads-the-evidence-snapshot
- domain/investigation/evidence-result
- domain/investigation/field-semantics
- domain/investigation/hypothesis-evaluator
- domain/glossary/concept
- domain/integration/capability
- domain/integration/connector-configuration-draft-status-reading
- rules/investigation/a-cited-field-exists-in-the-capability-output-schema
- rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema
- rules/investigation/an-observation-is-recorded-as-json-object-text
- rules/investigation/collection-runs-in-the-requester-scope
- rules/investigation/judgment-reads-the-current-instant-fresh
- rules/investigation/judgment-reads-the-evidence-snapshot
- rules/investigation/no-stage-aborts-on-its-deadline
- rules/investigation/one-evidence-per-collected-concept
- rules/glossary/a-description-states-meaning-never-policy
- rules/glossary/a-registered-concept-is-never-removed
- rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches
- rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it
- rules/integration/an-output-schema-entrys-statement-carries-no-sixth-claim
- rules/integration/an-unclassified-status-ends-unavailable
- rules/integration/an-unreachable-connector-ends-unavailable
- rules/integration/an-unresolvable-observation-ends-unavailable
- rules/integration/evidence-arrives-in-the-glossary-vocabulary
- rules/knowledge/a-collected-concept-declares-a-ttl
- scenarios/integration/a-response-map-key-no-output-schema-field-names-observes-nothing
- scenarios/integration/an-optional-attribute-absent-degrades-its-observation
- scenarios/investigation/a-citation-names-a-nested-output-schema-field
- scenarios/investigation/a-collection-timeout-degrades-to-no-data
- scenarios/investigation/a-foreign-citation-is-refused
- scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
- scenarios/investigation/a-nested-output-schema-property-is-named-by-its-full-path
- scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
- scenarios/investigation/a-simulated-subject-omitting-a-required-attribute-degrades
- scenarios/investigation/a-simulation-never-enters-the-cache
- scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
- constraints/evidence-normalization-is-an-anticorruption-layer
- constraints/hypotheses-are-judged-in-isolated-parallel-calls
- constraints/judgment-runs-behind-a-port
- constraints/the-capability-identity-read-is-rate-limited
- constraints/the-capability-identity-read-refuses-an-unregistered-identity
- constraints/the-concept-read-refuses-an-unanswered-concept
- constraints/the-evidence-cache-admits-only-ok-results
- constraints/the-judgment-prompt-is-closed
- constraints/the-openapi-document-is-fetched-by-the-backend
- constraints/the-register-capability-route-defers-completeness-to-the-registry
- constraints/the-register-capability-route-defers-the-nature-vocabulary-to-the-registry
uncovered:
- node: domain/investigation/evidence-result
  why: The four endings and the status dot that presents them already stand on the
    evidence tab; this plan adds fields beside them and changes nothing about how
    a result is shown.
- node: domain/investigation/field-semantics
  why: A field semantics entry already reaches the evidence display from the item's
    own snapshot; no task here changes what one carries or how it is rendered.
- node: domain/investigation/hypothesis-evaluator
  why: The judgment port runs backend-side; the scope excludes every backend change
    and no task calls or alters it.
- node: domain/glossary/concept
  why: The concept and its snapshotted description are already presented; this plan
    issues no glossary read and adds no concept field.
- node: domain/integration/capability
  why: The payload notes this plan surfaces are the evidence item's own snapshot of
    them; no capability registration, registry read or output schema is touched.
- node: domain/integration/connector-configuration-draft-status-reading
  why: A connector-configuration authoring concern; no surface in this plan reads
    or writes a connector configuration.
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  why: Citation admission is decided where the evaluator answer is validated, backend-side;
    the screen displays the citations it receives and admits none.
- node: rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema
  why: The field names displayed arrive already walked in the response; this plan
    performs no walk of an output schema.
- node: rules/investigation/an-observation-is-recorded-as-json-object-text
  why: The observation's parse-then-pretty-print rendering already stands on the evidence
    tab and is reused rather than re-derived, so nothing here implements this reading
    anew.
- node: rules/investigation/collection-runs-in-the-requester-scope
  why: Collection is backend work; the requester the screen already sends with a simulate
    call is unchanged by this plan.
- node: rules/investigation/judgment-reads-the-current-instant-fresh
  why: Binds prompt assembly at judgment time, backend-side; the screen displays the
    prompt the response carries.
- node: rules/investigation/judgment-reads-the-evidence-snapshot
  why: Binds what a judgment may read; the presentation counterpart is presentation-reads-the-evidence-snapshot,
    which this epic's tasks answer instead.
- node: rules/investigation/no-stage-aborts-on-its-deadline
  why: A backend stage obligation; the screen presents whatever ending the stage recorded.
- node: rules/investigation/one-evidence-per-collected-concept
  why: The response's evidence set is assembled backend-side; the display shows one
    entry per item it receives and composes no set of its own.
- node: rules/glossary/a-description-states-meaning-never-policy
  why: Binds what a description states where one is authored; no description is authored
    on this screen.
- node: rules/glossary/a-registered-concept-is-never-removed
  why: Glossary registry behavior, backend-side and outside this scope.
- node: rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches
  why: Decides which fields an observation carries at the integration edge; this plan
    displays the observation as received.
- node: rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it
  why: Binds the capability-registration authoring surface, a different screen entirely.
- node: rules/integration/an-output-schema-entrys-statement-carries-no-sixth-claim
  why: Bounds that same registration surface's statement; no task here stands beside
    an output schema entry.
- node: rules/integration/an-unclassified-status-ends-unavailable
  why: Decides an ending at the connector edge; the evidence display presents the
    ending already recorded.
- node: rules/integration/an-unreachable-connector-ends-unavailable
  why: Decides an ending and its result detail at the connector edge; nothing here
    classifies a call outcome.
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  why: Decides an ending where no call could be assembled; the screen presents the
    recorded result and detail unchanged.
- node: rules/integration/evidence-arrives-in-the-glossary-vocabulary
  why: Normalization happens at the integration edge; the frontend receives vocabulary
    already normalized.
- node: rules/knowledge/a-collected-concept-declares-a-ttl
  why: Governs the ttl a concept registration declares; the ttl this plan displays
    is the evidence item's own recorded figure.
- node: scenarios/integration/a-response-map-key-no-output-schema-field-names-observes-nothing
  why: A connector-configuration case decided backend-side; no frontend behavior turns
    on it.
- node: scenarios/integration/an-optional-attribute-absent-degrades-its-observation
  why: A collection-time degradation; the screen presents the degraded item like any
    other.
- node: scenarios/investigation/a-citation-names-a-nested-output-schema-field
  why: A citation-admission case, decided backend-side; the screen renders accepted
    citations as it already does.
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  why: A collection-stage case; the resulting timeout item is presented by machinery
    already in place.
- node: scenarios/investigation/a-foreign-citation-is-refused
  why: An evaluator-response validation case, backend-side and untouched here.
- node: scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
  why: Concerns what the judgment prompt carries for an empty snapshot; the presentation
    counterpart of that emptiness is stated in this epic's own display tasks instead.
- node: scenarios/investigation/a-nested-output-schema-property-is-named-by-its-full-path
  why: A schema-walk case at collection; the frontend displays whatever names the
    item snapshotted.
- node: scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
  why: A judgment-side snapshot case; this plan changes nothing about judgment and
    issues no registry read.
- node: scenarios/investigation/a-simulated-subject-omitting-a-required-attribute-degrades
  why: A collection-time degradation on the simulate route, already delivered backend-side;
    the screen presents the unavailable item like any other.
- node: scenarios/investigation/a-simulation-never-enters-the-cache
  why: A cache-admission case; the frontend holds no evidence cache and this plan
    introduces none.
- node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  why: A collection-budget case decided backend-side; the screen presents the recorded
    timeout and elapsed figure.
- node: constraints/evidence-normalization-is-an-anticorruption-layer
  why: A backend structural obligation at the integration edge; the scope excludes
    every backend change.
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  why: A backend execution obligation; nothing on this screen decides how judgment
    calls are issued.
- node: constraints/judgment-runs-behind-a-port
  why: A backend structural obligation about where judgment is invoked from.
- node: constraints/the-capability-identity-read-is-rate-limited
  why: Binds a capability route this screen never calls.
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  why: Binds a capability route this screen never calls.
- node: constraints/the-concept-read-refuses-an-unanswered-concept
  why: Binds a concept route this screen never calls, and presentation-reads-the-evidence-snapshot
    is why this plan adds no such read.
- node: constraints/the-evidence-cache-admits-only-ok-results
  why: Binds a cache adapter backend-side; no cache is read or written by this plan.
- node: constraints/the-judgment-prompt-is-closed
  why: Binds judgment prompt assembly backend-side; the per-hypothesis Debug displays
    the prompt the response carries and assembles none.
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  why: Concerns connector drafting from an OpenAPI document, a different surface entirely.
- node: constraints/the-register-capability-route-defers-completeness-to-the-registry
  why: Binds the capability registration route, which this screen never calls.
- node: constraints/the-register-capability-route-defers-the-nature-vocabulary-to-the-registry
  why: Binds that same registration route, untouched by this plan.
rationale: 'The scope states three parts and names no epics, so this grouping is mine:
  the evidence record faced to the curator changes for one reason (what one collected
  item discloses) and the case-level run record for another (what one whole run discloses),
  which is why they are two epics and not one. contracts/investigation/case-simulation
  is claimed by the case-run-record epic alone so the two epics claim no node in common,
  even though both answer halves of the same contract sentence. The long uncovered
  list is the deliberate remainder of an impact set drawn against a frontend-only
  scope that excludes every backend change.'
sources:
- work/case-simulation-debug-expansion-frontend/intake/scope.md
---

## What it is
Everything that decides what the curator learns about one collected evidence item on the case-simulation screen.
It runs from the two wire types the simulate responses are typed as, through the one adapter that narrows them, to the per-hypothesis Debug's Evidence tab and the new case-level Debug's evidence display.
Its tasks add the attributes domain/investigation/evidence already declares required and the frontend drops today: observed_at, ttl, inputs and capability_payload_notes.

## Notes
The inventory records that toDetailEvidence is the single conversion point both Debug surfaces consume, which is why widening it is cut as its own task between the wire types and either display.
The evidence type is duplicated in full between use-simulate-case.ts and use-simulate-hypothesis.ts with neither importing the other, so the wire-field task carries both.
contracts/investigation/case-simulation was added to this epic's covers after the first binding pass: two tasks rested on the response carrying the whole evidence record, a fact this contract states in combination with domain/investigation/evidence's own declared attributes, but the contract sat outside the original candidate set — a cut problem rather than a silence, answered by growing the claim and re-binding every task under this epic.
