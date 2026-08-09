---
type: invariant
statement: Collection runs in the authorization scope of the requester, never of the service.
constrains:
  - domain/investigation/investigation
  - domain/investigation/evidence
---

## Description

If what the attendant may see is limited, the collection must respect it; retrofitting later means rewriting every connector.
