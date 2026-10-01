---
entries:
- field: statement
  unstated: The material did not say whether this new operation's own fetch refusal reuses the sibling draft's error value and timeout, or mints its own.
  decided: Reuse OpenApiDocumentNotFetchedError and the standing 60000-millisecond timeout verbatim, rather than a new error name or a new figure.
  why: a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document and an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document already hold one vocabulary for one condition across two different operations meeting it (the draft and the operations-read); a third operation meeting the identical condition — a named link nothing answered — is the same fact and takes the same name, on the same reasoning a-submitted-registration-states-its-outcome-to-the-operator already gives for deciding one fact once rather than once per caller.
---
