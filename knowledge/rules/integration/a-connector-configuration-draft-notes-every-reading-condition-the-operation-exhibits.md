---
type: invariant
statement: >-
  A connector configuration draft names in its reading_notes one note, by kind and by subject, for
  every condition domain/integration/connector-configuration-draft-reading-note-kind names that the
  chosen operation's responses exhibit, and names no note for a condition they do not exhibit.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

A drafted statusMap or responseMap can honestly be shorter than the document — a default response, a status range, a non-JSON success body, a field name repeated under two paths — or can have been read through an envelope or across variants, and an operator shown the maps alone cannot tell a short map from a short document.
Each note names the condition and the thing it was met at, so the operator knows what the draft read past, what it read through and what remains theirs to write by hand.
