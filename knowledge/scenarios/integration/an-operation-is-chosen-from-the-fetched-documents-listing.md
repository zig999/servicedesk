---
subject: rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing
given:
  - an OpenAPI document link answers a document declaring one path /items with a get operation and a post operation
when:
  - the Configuration Helper lists the document's operations
  - the operator chooses the entry naming /items and POST
then:
  - the draft request names /items as its path
  - the draft request names POST as its method
---

## Description

The operator never types /items or POST: both come from the entry chosen off the list the document's own fetch produced.
