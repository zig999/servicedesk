---
title: One pt-BR home for this surface's operator-facing wording
summary: The wording the Configuration Helper and the configuration form state to the operator is written
  in pt-BR and read from one module rather than inlined at the control that renders it.
rationale: Cut as its own task because wording changes for a reason no statement does, and because this
  area holds no message module today, so leaving each statement to inline its own strings would make the
  wording's home a different decision in every file.
objective: Every operator-facing wording the connector configuration authoring surface and its Configuration
  Helper state is written in pt-BR and read from one message module.
criteria:
- The route components of the Configuration Helper render no operator-facing wording of their own; each
  is read from the message module.
- The route components of the configuration form render no operator-facing wording of their own; each
  is read from the message module.
- Every message the module holds is written in pt-BR.
- No operator-facing wording of this surface is held anywhere under this area but that module.
sources:
- intake/scope.md
---

## What it is
One module holding the text this surface says to the operator, and the removal of that text from the components that render it.
The surface's copy is inline English literals today, in two route components.

## Notes
No i18n framework or message dictionary exists anywhere under this frontend, so this module is a new convention for the project rather than the continuation of one.
ADVISORY, from the specification -- No candidate node governs this task's objective or any of its four criteria. Every candidate that speaks of the Configuration Helper or the configuration form decides what the surface states -- a fact the operator can learn -- and each expressly leaves the wording itself to the interface: rules/integration/an-answered-draft-request-states-its-draft-to-the-operator closes with "which control carries each statement, its wording, its order, its placement and how long it stands are the interface's own"; the remaining surface rules state conditions and acts and say nothing about where a string lives or what language it is in. Neither the language of operator-facing copy nor a single home for it is stated by any candidate, and no candidate contradicts either: the specification has delegated wording rather than been silent on a fact it owes. `implements` is therefore absent, exactly as this task's own rationale anticipates.
UNDERDETERMINED, from the specification -- The criteria constrain only where wording lives and what language it is in, never that distinct facts keep distinct wording, so they do not reach two clauses of rules/integration/an-answered-draft-request-states-its-draft-to-the-operator's statement: each unresolved reason and each reading-note kind stated apart from every other. The same gap sits over rules/integration/the-configuration-helper-states-an-operations-read-outstanding-and-a-document-declaring-no-operation, which requires the outstanding read, the document declaring no operation and every refusal to read apart from one another.
A single pt-BR message module, with no operator-facing string inlined in any Configuration Helper or configuration form route component, that holds one shared message text for all three unresolved reasons (and likewise one shared text across the nine reading-note kinds, and one shared text for the outstanding operations read and the document declaring no operation) meets every criterion as written while the operator cannot tell one reason, one note kind or one helper reading from another.
