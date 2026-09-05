---
title: Connector observation failure classification
summary: A connector call that fails from real network unavailability, not a config
  or resolution problem, is classified the same way every other collection-failure
  cause already is.
covers:
- rules/integration/an-unresolvable-observation-ends-unavailable
- rules/integration/an-unreachable-connector-ends-unavailable
- domain/investigation/evidence-result
- rules/investigation/an-inconclusive-evaluation-declares-its-reason
- rules/investigation/one-evaluation-per-required-hypothesis
- rules/investigation/a-simulated-subject-missing-a-requirement-degrades-not-refuses
- constraints/evidence-normalization-is-an-anticorruption-layer
- constraints/the-domain-depends-on-no-infrastructure
- contracts/integration/concept-observation
- contracts/integration/corporate-records-source
- contracts/investigation/observation-source
- contracts/system/corporate-records
- domain/integration/capability
- rules/integration/an-http-connector-configuration-declares-its-call
- rules/integration/an-unclassified-status-ends-unavailable
- rules/integration/evidence-arrives-in-the-glossary-vocabulary
- rules/investigation/collection-has-its-own-budget-within-the-total
- rules/investigation/collection-runs-in-the-requester-scope
- rules/investigation/no-stage-aborts-on-its-deadline
- scenarios/integration/an-optional-attribute-absent-degrades-its-observation
- scenarios/investigation/a-collection-timeout-degrades-to-no-data
- scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
uncovered:
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  why: Already implemented by the existing degrade-rather-than-fault behavior for a call
    that never issues (capability not resolved, duplicate concept answer, connector
    configuration not registered, placeholder not resolved); this task adds a sibling
    node for a distinct cause and transcribes no new claim over this rule itself.
- node: constraints/evidence-normalization-is-an-anticorruption-layer
  why: This correction touches only how a network-unreachable connector call is classified;
    it changes nothing else this file already answers to.
- node: constraints/the-domain-depends-on-no-infrastructure
  why: This correction touches only how a network-unreachable connector call is classified;
    it changes nothing else this file already answers to.
- node: contracts/integration/concept-observation
  why: This correction touches only how a network-unreachable connector call is classified;
    it changes nothing else this file already answers to.
- node: contracts/integration/corporate-records-source
  why: This correction touches only how a network-unreachable connector call is classified;
    it changes nothing else this file already answers to.
- node: contracts/investigation/observation-source
  why: This correction touches only how a network-unreachable connector call is classified;
    it changes nothing else this file already answers to.
- node: contracts/system/corporate-records
  why: This correction touches only how a network-unreachable connector call is classified;
    it changes nothing else this file already answers to.
- node: domain/integration/capability
  why: This correction touches only how a network-unreachable connector call is classified;
    it changes nothing else this file already answers to.
- node: rules/integration/an-http-connector-configuration-declares-its-call
  why: Already implemented by the connector-configuration validation and request-assembly
    work; this task's criterion 1 only requires that the endings that rule already names
    (MalformedHttpConnectorConfigurationError, IncompleteConnectorCallDescriptorError) stay
    unrelabeled, transcribing no new claim over the rule itself.
- node: rules/investigation/a-simulated-subject-missing-a-requirement-degrades-not-refuses
  why: Already implemented by the existing degrade-rather-than-refuse behavior for a simulate
    call; this task's criterion 6 only requires that behavior remain unbroken by this
    correction, transcribing no new claim over the rule itself.
- node: rules/integration/an-unclassified-status-ends-unavailable
  why: This correction touches only how a network-unreachable connector call is classified;
    it changes nothing else this file already answers to.
- node: rules/integration/evidence-arrives-in-the-glossary-vocabulary
  why: This correction touches only how a network-unreachable connector call is classified;
    it changes nothing else this file already answers to.
- node: rules/investigation/collection-has-its-own-budget-within-the-total
  why: This correction touches only how a network-unreachable connector call is classified;
    it changes nothing else this file already answers to.
- node: rules/investigation/collection-runs-in-the-requester-scope
  why: This correction touches only how a network-unreachable connector call is classified;
    it changes nothing else this file already answers to.
- node: rules/investigation/no-stage-aborts-on-its-deadline
  why: This correction touches only how a network-unreachable connector call is classified;
    it changes nothing else this file already answers to.
- node: scenarios/integration/an-optional-attribute-absent-degrades-its-observation
  why: This correction touches only how a network-unreachable connector call is classified;
    it changes nothing else this file already answers to.
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  why: This correction touches only how a network-unreachable connector call is classified;
    it changes nothing else this file already answers to.
- node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  why: This correction touches only how a network-unreachable connector call is classified;
    it changes nothing else this file already answers to.
sources:
- intake/scope.md
---

## What it is
An epic scoped to one corrective increment: how HttpDeclarativeObservationSource classifies a connector call that fails from real network unavailability.

## Notes
None.
