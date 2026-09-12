---
subject: rules/integration/a-success-response-schemas-single-object-property-is-read-through-as-its-envelope
given:
  - the chosen operation's 200 response declares an application/json schema whose only top-level property is data, an object whose properties are id, installations, syncEvents, failedTransactions, gpsTrail, active and accessGroups
when:
  - a connector configuration draft is generated from that operation
then:
  - the draft's configuration declares a responseMap of seven entries, id at data.id through accessGroups at data.accessGroups
  - the draft declares no responseMap entry keyed data
  - the draft's response_fields carry envelope data for each of the seven
  - the draft's reading_notes name data with kind envelope-read-through
involves:
  - domain/integration/connector-configuration-draft
---

## Description

Read literally the schema declares one field named data, which no capability reads a value from; read through its single object property it declares the seven the operator chooses among.
