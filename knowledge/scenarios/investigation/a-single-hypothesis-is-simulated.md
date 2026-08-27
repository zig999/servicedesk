---
subject: contracts/investigation/case-simulation
given:
  - a case version whose manifest holds more than one hypothesis
when:
  - a simulation of one named hypothesis is requested
then:
  - only the concepts that hypothesis's revision collects are observed
  - exactly one evaluation returns
  - no outcome and no assessment are resolved
involves:
  - domain/knowledge/hypothesis-revision
  - domain/investigation/evaluation
---

## Description

Precedence and totality both presuppose every required hypothesis is in play; naming one and asking only for its own judgment sits deliberately outside that machinery, and this is the case that shows the narrower read is what `simulate-hypothesis` promises, not an accident of a manifest that happens to hold only one.
