---
subject: rules/investigation/a-simulation-result-is-stale-once-its-source-changes
given:
- a case-simulation result is shown from a prior run
when:
- the curator edits the case version, or a hypothesis-revision it manifests, and returns to the cockpit
then:
- the shown result is marked stale
- the curator is told the result may no longer reflect the version's current content
involves:
- domain/knowledge/case-version
- contracts/investigation/case-simulation
---

## Description

The concrete case behind the rule: the curator never leaves the cockpit to edit anything else, so "returns to the cockpit" is the one moment this closes over, whichever of the version's own screens the edit happened on.
