---
title: Connector test panel reads the registered configuration
summary: The connector Test Panel's Add attribute reconciliation is threaded the connector's
  registered configuration text instead of the edit form's live, unsaved textarea state.
sources:
- intake/scope.md
covers:
- rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
- domain/integration/connector-configuration
- domain/investigation/subject-attribute-value
- rules/integration/an-http-connector-configuration-declares-its-call
uncovered:
- node: domain/investigation/subject-attribute-value
  why: The execution-contract-binder read this fresh and found it governs the shape of each
    attribute row (one glossary-drawn attribute paired with one free value), which this task
    neither creates nor changes -- it only changes which configuration text the existing
    reconciliation reads. Already reached by the delivered
    connector-test-panel-placeholder-attributes/reconcile-test-panel-attribute-rows task.
- node: rules/integration/an-http-connector-configuration-declares-its-call
  why: The binder found no clause of this rule reaches a criterion of this task -- its
    placeholder-grammar clause is already the delivered parsing this task's own criterion 5
    holds unchanged, and its remaining clauses are observation-time facts about executing a
    call, which this frontend task never performs.
---

## What it is
Fixes one wrong behavior in already-delivered code: ConnectorConfigurationDetailReadyView threads the connector-configuration edit form's own live, unsaved configuration text into ConnectorTestPanel, so Add attribute reconciles against a draft rather than against what is actually registered under the connector's name -- exactly what rules/integration/a-connector-configuration-is-tested-through-a-registered-capability refuses.

## Notes
None.
