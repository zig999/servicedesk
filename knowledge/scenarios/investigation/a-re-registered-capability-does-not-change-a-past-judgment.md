---
subject: rules/investigation/judgment-reads-the-evidence-snapshot
given:
  - a hypothesis's evidence for one concept was collected against capability lookup-account at version 1.0.0, snapshotting that version's own field semantics
  - after collection, an operator registers a capability at the same name and version, replacing the held record with different field descriptions
when:
  - the hypothesis is judged
then:
  - the judgment prompt carries the field semantics snapshotted at collection, unchanged by the later registration
  - the citation check still holds the evaluator's answer to those same snapshotted field names
involves:
  - domain/investigation/evidence
  - domain/integration/capability
---

## Description

The registry answers a name-and-version identity by whatever it currently holds, never by what it held when this evidence was collected; the snapshot is what keeps a judgment already grounded from silently reading differently the moment somebody edits the registry.
