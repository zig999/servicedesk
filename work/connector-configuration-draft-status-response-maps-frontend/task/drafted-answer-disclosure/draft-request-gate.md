---
title: A draft is requested only over a named connector and a chosen operation
summary: The act requesting a draft stands only while the Connector field holds a name and an operation
  is chosen, and says which of the two it waits on otherwise.
objective: The act requesting a connector configuration draft is withheld while either the connector name
  or the chosen operation is missing, with a statement of which one in the act's place.
criteria:
- While the Connector field holds no non-empty connector name, no act requesting a draft is offered.
- While no operation stands chosen from the fetched document's listing, no act requesting a draft is offered.
- While the connector name is missing, the surface states that the request waits on it, in the place the
  act would stand.
- While the chosen operation is missing, the surface states that the request waits on it, in the place
  the act would stand.
- With a non-empty connector name and a chosen operation both standing, nothing here withholds the act.
sources:
- intake/scope.md
implements:
- rules/integration/a-draft-request-is-offered-only-over-a-named-connector-and-a-chosen-operation
---

## What it is
The two gates on the Helper's own act, each naming what it waits on rather than leaving the control dead.
An operation is named only through the fetched document's listing, so the gate on it is the gate on that choice.

## Notes
A request made under an empty connector name names every parameter unresolved for a reason that is true about the wrong cause.
UNDERDETERMINED, from the specification -- The governing rule now states the act is offered only while the Connector field holds a connector name that is neither empty nor whitespace alone, and its Description adds that a field holding whitespace alone holds no name and lands in the same wrong cause as an empty one. The task's criteria still speak only of a "non-empty connector name" (criteria 1, 3 and 5) and never of whitespace. Read in the specification's own vocabulary the criteria are consistent with the widened rule, but a plain length-test reading of "non-empty" would offer the act, or state nothing, over a field holding only spaces.
A Configuration Helper that decides the connector precondition by testing the Connector field's raw text for length alone -- offering the draft-requesting act, and stating nothing about waiting on the connector, when the field holds only spaces or tabs -- satisfies criteria 1, 3 and 5 as written while the rule refuses it: a request made over whitespace resolves against no registered capability and names every parameter unresolved with reason no-capability-registered.
ADVISORY, from the specification -- Criterion 2 rests on an operation "standing chosen from the fetched document's listing"; the listing itself, the choosing of one path/method pair rather than typing either, and the drafted request naming the chosen pair's own path and method are stated by rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing, and what the helper states while that read is outstanding or the document declares no operation by rules/integration/the-configuration-helper-states-an-operations-read-outstanding-and-a-document-declaring-no-operation. Neither is implemented here -- this task only withholds the act -- so the two are a seam this task depends on and does not deliver.
