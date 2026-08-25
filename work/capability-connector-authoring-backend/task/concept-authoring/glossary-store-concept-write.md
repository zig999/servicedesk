---
title: Add a concept write path to the glossary store
summary: A new write method on the glossary store port and its relational implementation, letting a concept be created at a new name or replaced in place at an existing name.
rationale: This task is cut apart from the HTTP route because the store port it changes is typed against by more than this one caller — the inventory names the relational implementation, the factory and the file-backed test double as existing consumers of IGlossaryStore — so the port change is demonstrable and reviewable on its own before any controller depends on it.
sources:
  - work/capability-connector-authoring-backend/intake/scope.md
objective: The glossary store gains a write method for a concept that creates one at a new name or replaces one in place at an existing name, holding its declared subject types and ttl.
criteria:
  - Writing a concept at a name that does not yet exist creates it with its accepts subject types and its ttl.
  - Writing a concept at a name that already exists replaces it in place rather than creating a second entry.
  - The relational implementation persists the same fields the new port method declares.
implements:
  - domain/glossary/concept
  - contracts/glossary/glossary-authoring
---

## What it is

A new write method added to IGlossaryStore.
Its relational implementation in RelationalGlossaryStore, alongside the store's existing read-only readConcepts.
The glossary service method that calls it.

## Notes

None.
