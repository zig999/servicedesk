---
title: Concept create and edit form on the Glossary screen's Concepts tab
summary: Adds create and edit to the Glossary screen's Concepts tab for a concept's name, accepted subject types and ttl.
sources:
  - work/capability-connector-authoring-frontend/intake/scope.md
objective: An operator can create a new concept and edit an existing one, including its accepted subject types and ttl, from the Glossary screen's Concepts tab.
criteria:
  - The Concepts tab offers a "New concept" action that opens a form for name, accepts and ttl.
  - Each concept in the Concepts tab offers an edit action that opens the same form pre-filled with that concept's current name, accepts and ttl.
  - The accepts field lets the operator select more than one subject type and persists exactly the selected set, no more and no fewer.
  - Submitting the form with no subject type selected in accepts is blocked, accepts being a required field.
  - A successful create or edit registers the concept at the given name, and the Concepts tab reflects the change afterward.
implements:
  - domain/glossary/concept
  - contracts/glossary/glossary-authoring
---

## What it is

Create and edit for a concept — name, accepts (a multi-select of subject types) and ttl — added to the Glossary screen's existing, currently read-only Concepts tab.

## Notes

None.
