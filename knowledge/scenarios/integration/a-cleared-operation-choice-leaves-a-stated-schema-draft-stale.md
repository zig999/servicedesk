---
subject: rules/integration/a-stated-capability-schema-draft-is-marked-stale-once-what-it-was-generated-for-changes
given:
  - the Schema Helper of a capability authoring surface names the link https://example.test/openapi.json and holds GET /v1/technicians/{userId}/profile chosen from the listing that document answered
  - a capability schema draft generated for that link and that operation stands stated beneath the Input schema and Output schema fields
when:
  - the operator names a different OpenAPI document link in the Schema Helper
  - the operator names https://example.test/openapi.json again, choosing no operation from the listing it answers
then:
  - the Schema Helper holds no chosen operation, the choice standing cleared from the moment the link named ceased to be the one whose listing that operation was chosen from and until one is chosen from the listing the link now answers
  - the stated draft stands marked stale, though the link named is the one it was generated for
  - applying its input_schema and applying its output_schema are each still offered
  - the act requesting a draft is not offered, the surface stating in its place that it waits on a chosen operation
involves:
  - domain/integration/capability-schema-draft
  - rules/integration/a-capability-authoring-surface-offers-a-schema-helper
---

## Description

The operation the helper holds is never anything but an entry of the listing the named link's document answered, so it cannot outlive the link it was chosen under: naming another link leaves the helper with no chosen operation, and typing the first link back does not choose again on the operator's behalf.
A draft standing over a helper that holds no chosen operation describes an operation the surface names nowhere, which is the reading the staleness marking exists to refuse -- the link reading as it did when the draft was generated does not restore the operation the unresolved items beside it describe.
