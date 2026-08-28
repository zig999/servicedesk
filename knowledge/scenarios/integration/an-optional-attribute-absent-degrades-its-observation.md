---
subject: rules/integration/an-unresolvable-observation-ends-unavailable
given:
  - a capability's input schema names customer_document in properties but not in required
  - its connector configuration's call embeds a placeholder naming the customer_document Subject attribute
when:
  - an investigation collects that capability's concept for a subject holding no customer_document attribute-value
then:
  - the evidence for that concept records result unavailable, with result_detail naming ConnectorPlaceholderNotResolvedError
  - the collection of every other concept proceeds unaffected
involves:
  - domain/investigation/evidence
  - domain/integration/connector-configuration
---

## Description

customer_document never blocked the diagnose at the door, because a-diagnosed-subject-covers-its-cases-required-attributes only ever holds a subject to what a case's requirements name required; an optional attribute's absence is this scenario's own, recorded ending instead.
