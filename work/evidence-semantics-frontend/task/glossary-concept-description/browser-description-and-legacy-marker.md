---
title: Glossary browser shows the description and marks legacy concepts
summary: The Concepts tab reads the description from the wire, renders it per concept, and visibly marks a concept whose description is empty as awaiting completion.
rationale: The read shape and its display are one task because the two narrowings of the same endpoint are one seam the inventory's risk names, and the legacy marker is the empty state of the same displayed fact rather than a second outcome.
sources:
- intake/scope.md
- intake/material.md
objective: The glossary browser's Concepts tab shows each concept's description and marks a concept whose description is empty as awaiting one.
criteria:
- The concept shape use-glossary-concepts narrows carries description read from the concepts listing.
- The Concepts tab renders each concept's description.
- A concept whose description is empty is rendered with a visible marker distinguishing it from described concepts.
- A concept whose description is empty renders no invented description text.
- The sibling narrowing in use-concept-options continues to omit description, with the omission disclosed in its header comment as a deliberate departure from the sibling shape.
implements:
- domain/glossary/concept
- rules/glossary/a-concept-with-an-empty-description-is-read-as-awaiting-one
- contracts/glossary/glossary-query
---

## What it is
The read side of the concept's description on the glossary browser, including the marker that tells an operator which legacy concepts still need one.

## Notes
The inventory's risk is that the same endpoint is narrowed under two query keys, so the second narrowing's stance is decided and disclosed rather than left to disagree in cache.
