---
title: Judgment prompt observation semantics and temporal context
summary: The single corrective task that clarifies, in the hypothesis-judgment system prompt, that an
  evidence item's observation is the data validated against the criterion (with fields/concept_description/capability_payload_notes
  as interpretive aids and multiple items evaluated in isolation), and carries the current UTC time and
  each item's own observed-at/ttl into the judgment_input so recency- and staleness-dependent criteria
  become judgeable.
rationale: A corrective increment cuts no epic through survey/decomposition — this is the structural container
  the validator still requires, holding only the one task claim. Its covers is seeded mechanically from
  trace.py --encodes over the corrected file, closed one hop in both directions exactly as the situate
  step closes any impact set — not by reading, which is why it reaches far more of the specification than
  this single task implements. Three nodes joined covers later, once an unstated-fact-decider stated three
  facts the increment surfaced as missing.
covers:
- constraints/judgment-runs-behind-a-port
- constraints/the-judgment-prompt-is-closed
- domain/glossary/concept
- domain/integration/capability
- domain/integration/capability-nature
- domain/integration/connector-configuration-draft
- domain/investigation/assessment
- domain/investigation/citation
- domain/investigation/evaluation
- domain/investigation/evaluation-reason
- domain/investigation/evidence
- domain/investigation/evidence-result
- domain/investigation/field-semantics
- domain/investigation/hypothesis-evaluator
- domain/investigation/investigation
- domain/investigation/usage
- domain/investigation/verdict
- domain/knowledge/case-input-requirement
- rules/glossary/a-registered-concept-is-never-removed
- rules/integration/a-capability-authoring-surface-offers-a-schema-helper
- rules/integration/a-capability-declares-its-contract
- rules/integration/a-capability-declares-well-formed-schemas
- rules/integration/a-capability-input-schema-holds-a-well-formed-object
- rules/integration/a-capability-is-read-only
- rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed
- rules/integration/a-capability-keyed-surface-states-a-successful-registration-without-waiting-for-its-own-read
- rules/integration/a-capability-listing-routes-presence-turns-on-nothing-further
- rules/integration/a-connector-configuration-draft-names-subject-placeholders-from-a-registered-capability
- rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
- rules/integration/a-connector-configuration-surface-states-a-subject-placeholder-no-registered-capability-declares
- rules/integration/a-connector-configuration-surface-states-which-response-map-keys-a-registered-capability-reads
- rules/integration/a-connector-placeholder-is-declared-by-its-capability
- rules/integration/a-connector-placeholder-refusal-reports-every-orphaned-placeholder
- rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
- rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
- rules/integration/a-refused-schema-draft-states-its-refusal-to-the-operator
- rules/integration/a-registration-outcome-is-never-stated-before-the-registry-answers
- rules/integration/a-return-to-origin-routes-presence-turns-on-nothing-further
- rules/integration/a-return-to-origin-with-no-surface-to-return-to-lands-on-the-registrys-listing
- rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing
- rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading
- rules/integration/a-submitted-capability-edit-stands-in-the-fields-until-that-surfaces-own-read-answers
- rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
- rules/integration/a-successful-capability-registration-lands-on-the-capabilitys-own-surface
- rules/integration/a-surface-holding-no-read-registration-offers-no-discard
- rules/integration/an-abandoned-capability-registration-entry-registers-nothing
- rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
- rules/integration/an-abandonment-with-no-surface-to-return-to-registers-nothing
- rules/integration/an-answered-schema-draft-request-states-its-draft-to-the-operator
- rules/integration/an-authoring-surface-includes-an-unsubmitted-edit-of-a-standing-registration
- rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches
- rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it
- rules/integration/an-output-schema-entrys-statement-carries-no-sixth-claim
- rules/integration/an-unresolvable-observation-ends-unavailable
- rules/integration/applying-a-drafted-capability-schema-changes-only-the-local-edit
- rules/integration/evidence-arrives-in-the-glossary-vocabulary
- rules/integration/one-capability-answers-one-concept
- rules/integration/the-input-schema-and-output-schema-fields-are-untouched-by-a-schema-drafts-arrival
- rules/investigation/a-citation-stays-within-the-hypothesis-collects
- rules/investigation/a-cited-field-exists-in-the-capability-output-schema
- rules/investigation/a-composed-subject-presents-every-case-input-requirement
- rules/investigation/a-composed-subjects-input-names-every-capability-that-asks-for-it
- rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability
- rules/investigation/a-composed-subjects-interface-discloses-an-empty-requirement-set
- rules/investigation/a-decided-evaluation-cites-evidence
- rules/investigation/a-judgment-failure-records-the-last-call-made
- rules/investigation/a-measured-duration-below-one-millisecond-is-zero
- rules/investigation/a-simulation-carries-its-requester
- rules/investigation/a-simulation-result-is-stale-once-its-source-changes
- rules/investigation/an-inconclusive-evaluation-declares-its-reason
- rules/investigation/collection-runs-in-the-requester-scope
- rules/investigation/judgment-does-not-infer
- rules/investigation/judgment-reads-the-evidence-snapshot
- rules/investigation/no-stage-aborts-on-its-deadline
- rules/investigation/one-evaluation-per-required-hypothesis
- rules/investigation/one-evidence-per-collected-concept
- rules/investigation/presentation-reads-the-evidence-snapshot
- rules/knowledge/a-case-versions-input-requirements-are-derived
- rules/knowledge/a-concept-answered-by-none-or-several-capabilities-contributes-no-input-requirement
- rules/knowledge/every-collected-concept-has-a-read-only-capability
- rules/knowledge/the-contract-check-reads-the-current-registration
- scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused
- scenarios/integration/a-mismatched-parameter-name-resolves-regardless
- scenarios/integration/a-response-map-key-no-output-schema-field-names-observes-nothing
- scenarios/integration/a-response-map-key-the-capability-does-not-read-is-stated-beside-the-field-it-expects
- scenarios/integration/an-optional-attribute-absent-degrades-its-observation
- scenarios/investigation/a-collection-timeout-degrades-to-no-data
- scenarios/investigation/a-foreign-citation-is-refused
- scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
- scenarios/investigation/a-malformed-capability-is-disclosed-to-the-composing-curator
- scenarios/investigation/a-queued-judgment-is-deadline-exceeded
- scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
- scenarios/investigation/a-simulated-subject-omitting-a-required-attribute-degrades
- scenarios/investigation/a-simulation-never-enters-the-cache
- scenarios/investigation/a-single-hypothesis-is-simulated
- scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
- scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
- rules/investigation/an-observation-is-recorded-as-json-object-text
- rules/investigation/an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation
- rules/investigation/an-evidence-items-observed-at-is-a-utc-instant
- rules/investigation/judgment-reads-the-current-instant-fresh
uncovered:
- node: constraints/judgment-runs-behind-a-port
  why: States that judgment runs behind a port with the LLM as one interchangeable adapter; this task
    changes what one adapter (AnthropicHypothesisEvaluator) sends, never the port abstraction or its interchangeability.
- node: domain/glossary/concept
  why: A value type domain/investigation/evidence already declares; this task adds no new attribute to
    evidence and changes no field's own shape, so the type it is declared as is untouched.
- node: domain/integration/capability
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: domain/integration/capability-nature
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: domain/integration/connector-configuration-draft
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: domain/investigation/assessment
  why: The consolidation act's own record, downstream of an evaluation; this task does not touch consolidation.
- node: domain/investigation/evaluation
  why: Names the evaluation an evaluate call returns or how its cost/duration is recorded; this task changes
    what the prompt going into that call carries, never the shape of the evaluation coming out of it or
    how its own duration is measured.
- node: domain/investigation/evaluation-reason
  why: Names the evaluation an evaluate call returns or how its cost/duration is recorded; this task changes
    what the prompt going into that call carries, never the shape of the evaluation coming out of it or
    how its own duration is measured.
- node: domain/investigation/evidence-result
  why: A value type domain/investigation/evidence already declares; this task adds no new attribute to
    evidence and changes no field's own shape, so the type it is declared as is untouched.
- node: domain/investigation/field-semantics
  why: A value type domain/investigation/evidence already declares; this task adds no new attribute to
    evidence and changes no field's own shape, so the type it is declared as is untouched.
- node: domain/investigation/investigation
  why: The aggregate holding evidence and evaluations together; reached only as the container of the two,
    not itself changed by how one evidence item's own snapshot is read into a prompt.
- node: domain/investigation/usage
  why: Names the evaluation an evaluate call returns or how its cost/duration is recorded; this task changes
    what the prompt going into that call carries, never the shape of the evaluation coming out of it or
    how its own duration is measured.
- node: domain/knowledge/case-input-requirement
  why: Reached only through the same capability-registry closure, onward into how a case's input requirements
    are composed and checked against the registry; this correction does not touch subject composition
    or input-requirement derivation, only how an already-collected item's judgment prompt is assembled.
- node: rules/glossary/a-registered-concept-is-never-removed
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/a-capability-authoring-surface-offers-a-schema-helper
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/a-capability-declares-its-contract
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/a-capability-declares-well-formed-schemas
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/a-capability-input-schema-holds-a-well-formed-object
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/a-capability-is-read-only
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/a-capability-keyed-surface-states-a-successful-registration-without-waiting-for-its-own-read
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/a-capability-listing-routes-presence-turns-on-nothing-further
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/a-connector-configuration-draft-names-subject-placeholders-from-a-registered-capability
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/a-connector-configuration-surface-states-a-subject-placeholder-no-registered-capability-declares
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/a-connector-configuration-surface-states-which-response-map-keys-a-registered-capability-reads
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/a-connector-placeholder-refusal-reports-every-orphaned-placeholder
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/a-refused-schema-draft-states-its-refusal-to-the-operator
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/a-registration-outcome-is-never-stated-before-the-registry-answers
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/a-return-to-origin-routes-presence-turns-on-nothing-further
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/a-return-to-origin-with-no-surface-to-return-to-lands-on-the-registrys-listing
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/a-submitted-capability-edit-stands-in-the-fields-until-that-surfaces-own-read-answers
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/a-successful-capability-registration-lands-on-the-capabilitys-own-surface
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/a-surface-holding-no-read-registration-offers-no-discard
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/an-abandoned-capability-registration-entry-registers-nothing
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/an-abandonment-with-no-surface-to-return-to-registers-nothing
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/an-answered-schema-draft-request-states-its-draft-to-the-operator
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/an-authoring-surface-includes-an-unsubmitted-edit-of-a-standing-registration
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/an-output-schema-entrys-statement-carries-no-sixth-claim
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/applying-a-drafted-capability-schema-changes-only-the-local-edit
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/evidence-arrives-in-the-glossary-vocabulary
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/one-capability-answers-one-concept
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/integration/the-input-schema-and-output-schema-fields-are-untouched-by-a-schema-drafts-arrival
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  why: Governs which concepts a citation may name against the hypothesis's own collects list; this task
    changes what the prompt states about citations' fields, never which concepts a citation may be drawn
    from.
- node: rules/investigation/a-composed-subject-presents-every-case-input-requirement
  why: Reached only through the same capability-registry closure, onward into how a case's input requirements
    are composed and checked against the registry; this correction does not touch subject composition
    or input-requirement derivation, only how an already-collected item's judgment prompt is assembled.
- node: rules/investigation/a-composed-subjects-input-names-every-capability-that-asks-for-it
  why: Reached only through the same capability-registry closure, onward into how a case's input requirements
    are composed and checked against the registry; this correction does not touch subject composition
    or input-requirement derivation, only how an already-collected item's judgment prompt is assembled.
- node: rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability
  why: Reached only through the same capability-registry closure, onward into how a case's input requirements
    are composed and checked against the registry; this correction does not touch subject composition
    or input-requirement derivation, only how an already-collected item's judgment prompt is assembled.
- node: rules/investigation/a-composed-subjects-interface-discloses-an-empty-requirement-set
  why: Reached only through the same capability-registry closure, onward into how a case's input requirements
    are composed and checked against the registry; this correction does not touch subject composition
    or input-requirement derivation, only how an already-collected item's judgment prompt is assembled.
- node: rules/investigation/a-judgment-failure-records-the-last-call-made
  why: Names the evaluation an evaluate call returns or how its cost/duration is recorded; this task changes
    what the prompt going into that call carries, never the shape of the evaluation coming out of it or
    how its own duration is measured.
- node: rules/investigation/a-measured-duration-below-one-millisecond-is-zero
  why: Names the evaluation an evaluate call returns or how its cost/duration is recorded; this task changes
    what the prompt going into that call carries, never the shape of the evaluation coming out of it or
    how its own duration is measured.
- node: rules/investigation/a-simulation-carries-its-requester
  why: Governs collection's own requester scope, deadline handling or per-concept cardinality, or a simulation
    result's staleness against its own sources — all upstream of judgment and untouched by how the judgment
    prompt built from an already-collected item is worded.
- node: rules/investigation/a-simulation-result-is-stale-once-its-source-changes
  why: Governs collection's own requester scope, deadline handling or per-concept cardinality, or a simulation
    result's staleness against its own sources — all upstream of judgment and untouched by how the judgment
    prompt built from an already-collected item is worded.
- node: rules/investigation/collection-runs-in-the-requester-scope
  why: Governs collection's own requester scope, deadline handling or per-concept cardinality, or a simulation
    result's staleness against its own sources — all upstream of judgment and untouched by how the judgment
    prompt built from an already-collected item is worded.
- node: rules/investigation/judgment-does-not-infer
  why: Its no-inference instruction is already fixed in the system prompt this task rewrites, but no criterion
    of this task restates or re-demonstrates it — recorded instead as this task's own ADVISORY note, since
    a rewrite dropping that instruction would otherwise pass every criterion as written.
- node: rules/investigation/no-stage-aborts-on-its-deadline
  why: Governs collection's own requester scope, deadline handling or per-concept cardinality, or a simulation
    result's staleness against its own sources — all upstream of judgment and untouched by how the judgment
    prompt built from an already-collected item is worded.
- node: rules/investigation/one-evaluation-per-required-hypothesis
  why: Names the evaluation an evaluate call returns or how its cost/duration is recorded; this task changes
    what the prompt going into that call carries, never the shape of the evaluation coming out of it or
    how its own duration is measured.
- node: rules/investigation/one-evidence-per-collected-concept
  why: Governs collection's own requester scope, deadline handling or per-concept cardinality, or a simulation
    result's staleness against its own sources — all upstream of judgment and untouched by how the judgment
    prompt built from an already-collected item is worded.
- node: rules/investigation/presentation-reads-the-evidence-snapshot
  why: Governs an operator-facing surface's own read of the evidence snapshot, a second and separate consumer
    from judgment; this task touches only judgment's own prompt, never the presentation surface.
- node: rules/knowledge/a-case-versions-input-requirements-are-derived
  why: Reached only through the same capability-registry closure, onward into how a case's input requirements
    are composed and checked against the registry; this correction does not touch subject composition
    or input-requirement derivation, only how an already-collected item's judgment prompt is assembled.
- node: rules/knowledge/a-concept-answered-by-none-or-several-capabilities-contributes-no-input-requirement
  why: Reached only through the same capability-registry closure, onward into how a case's input requirements
    are composed and checked against the registry; this correction does not touch subject composition
    or input-requirement derivation, only how an already-collected item's judgment prompt is assembled.
- node: rules/knowledge/every-collected-concept-has-a-read-only-capability
  why: Reached only through the same capability-registry closure, onward into how a case's input requirements
    are composed and checked against the registry; this correction does not touch subject composition
    or input-requirement derivation, only how an already-collected item's judgment prompt is assembled.
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  why: Reached only through the same capability-registry closure, onward into how a case's input requirements
    are composed and checked against the registry; this correction does not touch subject composition
    or input-requirement derivation, only how an already-collected item's judgment prompt is assembled.
- node: scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: scenarios/integration/a-mismatched-parameter-name-resolves-regardless
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: scenarios/integration/a-response-map-key-no-output-schema-field-names-observes-nothing
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: scenarios/integration/a-response-map-key-the-capability-does-not-read-is-stated-beside-the-field-it-expects
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: scenarios/integration/an-optional-attribute-absent-degrades-its-observation
  why: Reached only through domain/investigation/evidence's reference to domain/integration/capability
    and that node's own dense reverse edges into capability/connector registration, authoring and configuration
    surfaces; this correction touches no registration, authoring, schema-draft or connector-configuration
    surface.
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  why: A concrete case anchored to a rule, element or contract this task does not implement (collection
    timeout, deadline, cache, capability re-registration, or a legacy concept's own description) — reached
    only through domain/investigation/evidence's closure, not exercised by this task's own criteria.
- node: scenarios/investigation/a-foreign-citation-is-refused
  why: A concrete case anchored to a rule, element or contract this task does not implement (collection
    timeout, deadline, cache, capability re-registration, or a legacy concept's own description) — reached
    only through domain/investigation/evidence's closure, not exercised by this task's own criteria.
- node: scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
  why: A concrete case anchored to a rule, element or contract this task does not implement (collection
    timeout, deadline, cache, capability re-registration, or a legacy concept's own description) — reached
    only through domain/investigation/evidence's closure, not exercised by this task's own criteria.
- node: scenarios/investigation/a-malformed-capability-is-disclosed-to-the-composing-curator
  why: A concrete case anchored to a rule, element or contract this task does not implement (collection
    timeout, deadline, cache, capability re-registration, or a legacy concept's own description) — reached
    only through domain/investigation/evidence's closure, not exercised by this task's own criteria.
- node: scenarios/investigation/a-queued-judgment-is-deadline-exceeded
  why: A concrete case anchored to a rule, element or contract this task does not implement (collection
    timeout, deadline, cache, capability re-registration, or a legacy concept's own description) — reached
    only through domain/investigation/evidence's closure, not exercised by this task's own criteria.
- node: scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
  why: A concrete case anchored to a rule, element or contract this task does not implement (collection
    timeout, deadline, cache, capability re-registration, or a legacy concept's own description) — reached
    only through domain/investigation/evidence's closure, not exercised by this task's own criteria.
- node: scenarios/investigation/a-simulated-subject-omitting-a-required-attribute-degrades
  why: A concrete case anchored to a rule, element or contract this task does not implement (collection
    timeout, deadline, cache, capability re-registration, or a legacy concept's own description) — reached
    only through domain/investigation/evidence's closure, not exercised by this task's own criteria.
- node: scenarios/investigation/a-simulation-never-enters-the-cache
  why: A concrete case anchored to a rule, element or contract this task does not implement (collection
    timeout, deadline, cache, capability re-registration, or a legacy concept's own description) — reached
    only through domain/investigation/evidence's closure, not exercised by this task's own criteria.
- node: scenarios/investigation/a-single-hypothesis-is-simulated
  why: A concrete case anchored to a rule, element or contract this task does not implement (collection
    timeout, deadline, cache, capability re-registration, or a legacy concept's own description) — reached
    only through domain/investigation/evidence's closure, not exercised by this task's own criteria.
- node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  why: A concrete case anchored to a rule, element or contract this task does not implement (collection
    timeout, deadline, cache, capability re-registration, or a legacy concept's own description) — reached
    only through domain/investigation/evidence's closure, not exercised by this task's own criteria.
- node: scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  why: A concrete case anchored to a rule, element or contract this task does not implement (collection
    timeout, deadline, cache, capability re-registration, or a legacy concept's own description) — reached
    only through domain/investigation/evidence's closure, not exercised by this task's own criteria.
sources:
- intake/scope.md
- intake/proposal.md

---

## What it is

A single-task epic for the corrective increment judgment-prompt-temporal-context.

## Notes

None.
