---
title: Glossary browser reads and shows a concept's description, marking legacy concepts awaiting one
summary: use-glossary-concepts.ts now narrows description off the concepts listing, the Concepts tab renders it per concept with a status-dot marker for an empty (legacy) description, and use-concept-options.ts's deliberate omission of description is disclosed as a departure from its sibling's shape.
task: sha256:e63b1b75ef7a0c9f1e879dcca503e012e081e9c0502ba95de342097512c24d94
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/glossary-concept-description-browser-description-and-legacy-marker-build-2
files:
- path: src/hooks/use-glossary-concepts.ts
  effect: 'GlossaryConcept gained readonly description: string (domain/glossary/concept''s fourth attribute), read verbatim off GET /v1/glossary/concepts including an empty string; header comment discloses this narrowing invents nothing about what an empty value means.'
- path: src/hooks/use-concept-options.ts
  effect: No narrowing change — ConceptOption still holds only name/accepts. Header comment extended to disclose, as a deliberate departure from its sibling hook's now-wider shape, that this hook does not narrow description because its one consumer (use-hypothesis-revision-form.ts) never reads it.
- path: src/routes/glossary-concepts-panel.tsx
  effect: 'New file. Extracted the Concepts tab''s entire body (CONCEPTS_COLUMNS, formatTtl, toConceptRow, ConceptsPanel) out of glossary-browser-screen.tsx verbatim, and added a Description column plus toDescriptionCell, which renders a concept''s own description as plain text when non-empty, or as a status-shaped { color: "bg-muted-foreground", label: "Awaiting description" } value when empty.'
- path: src/routes/glossary-browser-screen.tsx
  effect: Rewritten to import and render ConceptsPanel from the new glossary-concepts-panel.tsx instead of defining it inline; the five term-vocabulary tabs and VocabularyPanel are untouched.
- path: src/routes/glossary-browser-screen.test-support.ts
  effect: glossaryConcept() fixture builder gained a default description value, following the builder's existing default/override spread pattern, so it satisfies GlossaryConcept's now-required description field.
criteria:
- criterion: The concept shape use-glossary-concepts narrows carries description read from the concepts listing.
  met: true
  how: 'GlossaryConcept in use-glossary-concepts.ts gained readonly description: string, read off the same GET /v1/glossary/concepts response GlossaryConceptsPage.data already narrows, verbatim.'
- criterion: The Concepts tab renders each concept's description.
  met: true
  how: 'glossary-concepts-panel.tsx''s CONCEPTS_COLUMNS gained a "Description" column, and toConceptRow now sets description: toDescriptionCell(concept.description) per row.'
- criterion: A concept whose description is empty is rendered with a visible marker distinguishing it from described concepts.
  met: true
  how: 'toDescriptionCell returns the plain description string when non-empty, but a status-shaped { color: "bg-muted-foreground", label: "Awaiting description" } value when empty; status-table.tsx''s renderCellContent renders that shape as a token-colored dot plus its label.'
- criterion: A concept whose description is empty renders no invented description text.
  met: true
  how: The empty branch of toDescriptionCell never touches or substitutes the empty string itself — it returns a fixed { color, label } marker literal rather than any text derived from the absent description.
- criterion: The sibling narrowing in use-concept-options continues to omit description, with the omission disclosed in its header comment as a deliberate departure from the sibling shape.
  met: true
  how: use-concept-options.ts's ConceptOption type is unchanged; its header comment gained a paragraph naming use-glossary-concepts.ts's new description field and stating that this hook deliberately does not follow, because its one consumer reads nothing of a concept's description.
nodes:
- node: domain/glossary/concept
  how: 'This task narrows and displays the value-object''s fourth attribute, description (type: string, required: true) — read as always present but not necessarily non-empty.'
  encoded_at:
  - src/hooks/use-glossary-concepts.ts
  - src/routes/glossary-concepts-panel.tsx
- node: rules/glossary/a-concept-with-an-empty-description-is-read-as-awaiting-one
  how: toDescriptionCell in glossary-concepts-panel.tsx is the read-side honest-degradation this invariant states — an empty description renders as a distinct "Awaiting description" marker, never the plain-text cell a described concept gets, and never invented text.
  encoded_at:
  - src/routes/glossary-concepts-panel.tsx
- node: contracts/glossary/glossary-query
  how: This task adds no new operation and changes no endpoint — use-glossary-concepts.ts still calls the same list-concepts operation this contract already publishes; it now narrows one more field of that operation's existing response.
inferences:
- inferred: The "Description" column sits second in CONCEPTS_COLUMNS, right after "Name" and before "Accepts"/"TTL".
  from: No criterion states column order; placing the concept's own meaning-bearing field immediately after its identity is this delivery's own reading choice.
- inferred: The empty-description marker uses the bg-muted-foreground token with the label "Awaiting description".
  from: No criterion names a color or exact copy. bg-muted-foreground is the same neutral-absence token case-simulation-detail-evidence-tab.tsx already keys its "unavailable" result to, since this reading is a gap left for an operator to fill rather than a warning or a refusal.
- inferred: The Concepts tab's body was extracted out of glossary-browser-screen.tsx into a new file, glossary-concepts-panel.tsx.
  from: Adding the Description column and its marker inline would have pushed glossary-browser-screen.tsx past the project's own standard rule MNT-01 (a component file stays within three hundred lines); the extraction follows that rule's own stated remedy and this app's established precedent for splitting a screen's tab body into its own *-panel.tsx file.
- inferred: glossaryConcept()'s fixture default description is a placeholder string ("Tracks a customer-raised dispute over a billing charge.").
  from: The fixture's existing default name and accepts are already domain-flavored placeholder values with no specification backing beyond being a plausible fixture; a matching placeholder description keeps that established fixture style.
preserved:
- use-concept-options.ts's ConceptOption shape, its query key, and its one consumer's subject-type filtering — untouched.
- use-glossary-concepts.ts's existing name/accepts/ttl fields, its query key, and its return shape — only the new description field was added.
- 'ConceptsPanel''s existing behavior verbatim across the extraction: the New concept action, the per-row Edit action, the loading/typed-error-with-retry/explicit-empty branches, and formatTtl''s/accepts-join''s existing formatting.'
- The five term-vocabulary tabs and VocabularyPanel in glossary-browser-screen.tsx — entirely unchanged.
- Every other export in glossary-browser-screen.test-support.ts besides the glossaryConcept() fixture — untouched.
deferred:
- what: The Concept create/edit form (use-concept-form.ts, concept-form-schema.ts, concept-form-fields.tsx) does not read or submit description.
  why: No criterion of this task names the form; a sibling task in this same epic (concept-form-description-field) covers it.
---

## What it is
The read side of the concept's description on the glossary browser, including the marker that tells an operator which legacy concepts still need one.

## Notes
The inventory's risk is that the same endpoint is narrowed under two query keys, so the second narrowing's stance is decided and disclosed rather than left to disagree in cache.
The first build (glossary-concept-description-browser-description-and-legacy-marker-build) failed typecheck: glossary-browser-screen.test-support.ts's glossaryConcept() fixture built a GlossaryConcept without the newly-required description field. Fixed by giving the fixture builder a default description value, following its own existing default/override pattern; build-2 passed clean.
