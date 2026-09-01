---
type: invariant
statement: An investigation's ticket_ref never holds the empty string — a ticket reference given as an empty string in a diagnose call is the absence of a ticket reference, recorded as none and read back as none, and the call is not refused for it.
constrains:
  - domain/investigation/investigation
---

## Description

ticket_ref is optional: not every diagnose call carries a ticket (domain/investigation/investigation), and its whole role is correlation with the ticketing system for traceability and audit, never a matching key (contracts/investigation/diagnosis).
An empty string correlates with nothing, so admitting it as a value would leave two encodings of the same nothing — a record holding no ticket reference and a record holding an empty one — that an audit would have to distinguish while neither reaches a ticket.
This is the reading the specification already gives an empty attribute elsewhere: a-capability-declares-its-contract calls an attribute that is absent or an empty string undeclared, a-connector-configuration-names-its-connector treats an empty string as no name at all, and a-diagnosed-subject-covers-its-cases-required-attributes and a-simulation-carries-its-requester each read "or an empty one" as the absence of the value.
Unlike those, ticket_ref is optional, so the reading ends at absence rather than at a refusal: nothing is missing when a call carries no ticket.
