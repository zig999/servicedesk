---
title: The cockpit's types state what a record actually carries
summary: Four TypeScript declarations in the case-simulation cockpit disagree with the
  specification about presence — optional where an attribute is required, unconditional
  where a whole record is conditional, three values where the enumeration declares four,
  and absent where a rule requires a total — and each is corrected together with the
  readers and fixtures that lock the wrong reading in.
covers:
- contracts/investigation/case-simulation
- contracts/investigation/assessment-reviewed
- domain/glossary/concept
- domain/glossary/outcome
- domain/integration/capability
- domain/investigation/assessment
- domain/investigation/cost
- domain/investigation/durations
- domain/investigation/evaluation
- domain/investigation/evaluation-reason
- domain/investigation/evidence
- domain/investigation/evidence-result
- domain/investigation/field-semantics
- domain/investigation/investigation
- domain/investigation/usage
- domain/knowledge/consolidation-register
- domain/knowledge/hypothesis-revision
- domain/knowledge/referral
- rules/glossary/a-registered-concept-is-never-removed
- rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches
- rules/integration/evidence-arrives-in-the-glossary-vocabulary
- rules/investigation/a-cited-field-exists-in-the-capability-output-schema
- rules/investigation/a-measured-duration-below-one-millisecond-is-zero
- rules/investigation/a-presented-consolidation-prompt-is-shown-whole
- rules/investigation/a-presented-evidence-items-inputs-are-shown-with-a-resolved-credential-masked
- rules/investigation/a-simulated-hypothesis-returns-the-runs-cost-and-durations
- rules/investigation/a-simulation-carries-its-requester
- rules/investigation/a-simulation-result-is-stale-once-its-source-changes
- rules/investigation/a-simulation-session-retains-its-runs-and-shows-one
- rules/investigation/an-evidence-item-that-sent-no-inputs-records-an-empty-object
- rules/investigation/an-evidence-item-whose-result-is-not-ok-records-an-empty-observation
- rules/investigation/an-evidence-items-observed-at-is-a-utc-instant
- rules/investigation/an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation
- rules/investigation/an-observation-is-recorded-as-json-object-text
- rules/investigation/collection-runs-in-the-requester-scope
- rules/investigation/judgment-reads-the-evidence-snapshot
- rules/investigation/no-stage-aborts-on-its-deadline
- rules/investigation/one-evidence-per-collected-concept
- rules/investigation/presentation-reads-the-evidence-snapshot
- rules/investigation/the-consolidation-answer-states-its-register
- rules/investigation/the-customer-sees-only-the-text
- rules/investigation/the-outcome-comes-from-the-case
- rules/investigation/the-writing-input-is-narrowed
- scenarios/integration/a-response-map-key-no-output-schema-field-names-observes-nothing
- scenarios/integration/an-optional-attribute-absent-degrades-its-observation
- scenarios/investigation/a-citation-names-a-nested-output-schema-field
- scenarios/investigation/a-collection-timeout-degrades-to-no-data
- scenarios/investigation/a-draft-case-version-is-simulated
- scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
- scenarios/investigation/a-nested-output-schema-property-is-named-by-its-full-path
- scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
- scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result
- scenarios/investigation/a-simulate-screen-presents-an-undetected-required-attribute
- scenarios/investigation/a-simulated-subject-omitting-a-required-attribute-degrades
- scenarios/investigation/a-simulation-never-enters-the-cache
- scenarios/investigation/a-single-hypothesis-is-simulated
- scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
- scenarios/investigation/an-in-place-revision-edit-stales-the-shown-result
- scenarios/knowledge/no-confirmation-falls-back
- scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
uncovered:
- node: contracts/investigation/assessment-reviewed
  why: An operator's later judgment of an assessment is a published event with no surface
    in the simulation cockpit; nothing here emits, receives or types it.
- node: domain/glossary/concept
  why: The concept description these corrections stop treating as optional is the evidence
    item's own snapshot; no glossary read is issued and no concept attribute is touched.
- node: domain/glossary/outcome
  why: What an outcome is and how it is named are unchanged; only whether the record
    holding one is present at all moves.
- node: domain/integration/capability
  why: No capability registration, registry read or output schema is reached by any
    of these four type corrections.
- node: domain/investigation/evaluation
  why: The evaluation's own attributes — verdict, citations, usage, elapsed_ms and prompt
    — are untouched; only the vocabulary its reason is drawn from is widened.
- node: domain/investigation/evidence-result
  why: The four endings and their display already stand; nothing here changes how a
    result is typed or rendered.
- node: domain/investigation/field-semantics
  why: What one field-semantics entry carries and how it renders is unchanged; only
    whether the list may be absent at all changes, which the evidence element itself states.
- node: domain/investigation/investigation
  why: A simulation writes no investigation; no type in this plan describes one.
- node: domain/investigation/usage
  why: The per-call usage figure already reaches the cockpit; the total this plan adds
    to a hypothesis run is the cost element's own, not this one.
- node: domain/knowledge/consolidation-register
  why: The two register values and their meaning are untouched; only whether the record
    stating one is present at all moves.
- node: domain/knowledge/hypothesis-revision
  why: No revision, its collects, its criterion or its release is read or typed here.
- node: domain/knowledge/referral
  why: The action and recipient a referral names are unchanged; only its presence within
    the run type moves.
- node: rules/glossary/a-registered-concept-is-never-removed
  why: Glossary registry behavior, decided backend-side and reached by nothing on this
    screen.
- node: rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches
  why: Decides which fields an observation carries at the integration edge; the cockpit
    types the observation as received.
- node: rules/integration/evidence-arrives-in-the-glossary-vocabulary
  why: Normalization happens at the integration edge; the frontend receives vocabulary
    already normalized.
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  why: Citation admission is decided where the evaluator answer is validated, backend-side;
    no type here admits a citation.
- node: rules/investigation/a-measured-duration-below-one-millisecond-is-zero
  why: Fixes what a measured figure records; these corrections change presence, never
    a recorded number.
- node: rules/investigation/a-presented-consolidation-prompt-is-shown-whole
  why: The prompt is already shown whole from inside the consolidation-call branch, and
    stays in the branch the assessment fields are moved into.
- node: rules/investigation/a-presented-evidence-items-inputs-are-shown-with-a-resolved-credential-masked
  why: Masking and the inputs display already stand; no criterion here touches inputs.
- node: rules/investigation/a-simulation-carries-its-requester
  why: The requester the screen already sends with a simulate call is unchanged by every
    one of these four corrections.
- node: rules/investigation/a-simulation-result-is-stale-once-its-source-changes
  why: Staleness detection and its marking already stand and are untouched; nothing here
    changes when a shown result goes stale.
- node: rules/investigation/an-evidence-item-that-sent-no-inputs-records-an-empty-object
  why: Fixes what inputs record; the two attributes this plan makes required are fields
    and concept_description.
- node: rules/investigation/an-evidence-item-whose-result-is-not-ok-records-an-empty-observation
  why: Fixes what observation records; no correction here reaches the observation string.
- node: rules/investigation/an-evidence-items-observed-at-is-a-utc-instant
  why: observed_at is already declared and carried; its reading is untouched.
- node: rules/investigation/an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation
  why: ttl is already declared and carried; its unit and its anchor are untouched.
- node: rules/investigation/an-observation-is-recorded-as-json-object-text
  why: The observation's parse-then-render path already stands and is reused unchanged.
- node: rules/investigation/collection-runs-in-the-requester-scope
  why: Collection is backend work; nothing typed here decides an authorization scope.
- node: rules/investigation/judgment-reads-the-evidence-snapshot
  why: Binds what a judgment may read; the presentation counterpart is presentation-reads-the-evidence-snapshot,
    which this epic's evidence task answers instead.
- node: rules/investigation/no-stage-aborts-on-its-deadline
  why: A backend stage obligation; the cockpit types whatever ending the stage recorded.
- node: rules/investigation/one-evidence-per-collected-concept
  why: The evidence set is assembled backend-side; no type here composes one.
- node: rules/investigation/the-customer-sees-only-the-text
  why: Draws the disclosure boundary; every surface these corrections touch already sits
    on the operational side of it.
- node: rules/investigation/the-outcome-comes-from-the-case
  why: Resolution happens in the pinned case version, backend-side; this plan only stops
    the run type from demanding those three fields where no resolution happened.
- node: rules/investigation/the-writing-input-is-narrowed
  why: Bounds what consolidation is given, backend-side; no type here assembles a consolidation
    input.
- node: scenarios/integration/a-response-map-key-no-output-schema-field-names-observes-nothing
  why: A connector-configuration case decided backend-side; no frontend type turns on it.
- node: scenarios/integration/an-optional-attribute-absent-degrades-its-observation
  why: A collection-time degradation; the cockpit types the degraded item like any other.
- node: scenarios/investigation/a-citation-names-a-nested-output-schema-field
  why: A citation-admission case decided backend-side; nothing here admits a citation.
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  why: A collection-stage case; the resulting item is typed by machinery already in place.
- node: scenarios/investigation/a-draft-case-version-is-simulated
  why: Grounds that a draft may be simulated at all; no correction here turns on the
    pinned version's state.
- node: scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
  why: Concerns what the judgment prompt carries for an empty snapshot; the presentation
    counterpart of that same emptiness is what this epic's evidence task states instead.
- node: scenarios/investigation/a-nested-output-schema-property-is-named-by-its-full-path
  why: A schema-walk case at collection; the frontend carries whatever names the item
    snapshotted.
- node: scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
  why: A judgment-side snapshot case; nothing here issues a registry read or touches
    judgment.
- node: scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result
  why: The staleness marking on return from editing already stands and is untouched.
- node: scenarios/investigation/a-simulate-screen-presents-an-undetected-required-attribute
  why: A subject-composer case; no type these corrections touch reaches the composer.
- node: scenarios/investigation/a-simulated-subject-omitting-a-required-attribute-degrades
  why: A collection-time degradation already delivered backend-side; the cockpit types
    the unavailable item like any other.
- node: scenarios/investigation/a-simulation-never-enters-the-cache
  why: A cache-admission case; the frontend holds no evidence cache and this plan adds
    none.
- node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  why: A collection-budget case decided backend-side; the cockpit carries the recorded
    timeout and elapsed figure.
- node: scenarios/investigation/an-in-place-revision-edit-stales-the-shown-result
  why: The in-place-edit staleness case already stands and is untouched.
- node: scenarios/knowledge/no-confirmation-falls-back
  why: Resolution and the fallback happen backend-side; determiningHypothesis is already
    optional within the assessment and stays so.
- node: scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  why: Precedence is resolved backend-side; no type here chooses a determining hypothesis.
rationale: 'The scope enumerates four findings and names no epic, so this grouping is
  mine: all four are one kind of disagreement — a type stating a presence the specification
  does not state — and they change for one reason, which is why they are one epic rather
  than four. It is a new epic rather than growth of evidence-detail or case-run-record
  because those two answer what the curator learns, while this one answers only that
  the types say what the record says; the two existing epics claim some of the same nodes,
  which is deliberate and not a conflict, since an epic''s covers is validated against
  its own tasks alone. The long uncovered list is the deliberate remainder of an impact
  set drawn against four type-only corrections in a frontend-only tree.'
sources:
- work/case-simulation-debug-expansion-frontend/intake/review-findings-1-to-4.md
---

## What it is
The ring of shared type declarations the case-simulation cockpit reads a simulate response through, held against what the specification declares each value carries.
Four disagreements live there: two evidence attributes typed optional that are required with an honest-empty value, a whole assessment typed unconditional that is conditional on a writing call, an enumeration carrying three of its four values, and a run total the specification requires that no type declares.
Each is corrected together with the adapters, render sites and test fixtures that read it, because the inventory records every one of them as reading the wrong shape today.

## Notes
The inventory records that none of the four corrections has a single shared reuse point: nine independently declared run builders, three separately declared reason unions plus a fourth in the table-row file, and two evidence types neither of which imports the other.
It also records two shared fixture builders that stop compiling the moment a field becomes required — testEvidenceItem for SimulationEvidenceItem and simulateHypothesisResult for SimulateHypothesisResult — which is why each correction carries its own builder fix rather than leaving one behind.
contracts/investigation/case-simulation is claimed here as well as by case-run-record, because the sentence it states about what simulate-hypothesis narrows is what two of these four corrections rest on.
