---
title: Glossary browser description column and legacy marker — proof
summary: Six new tests across three spec files establish that the concept shape carries description, the Concepts tab renders it, an empty description gets a visible non-invented marker, its column placement, and use-concept-options' continued omission of description.
implementation: sha256:acb7399405a94faf8c9fe4116a4701b32f12951a577aaf3b5a81ad43dc9bf3b3
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/glossary-concept-description-browser-description-and-legacy-marker-suite-3
tests:
- file: src/hooks/use-glossary-concepts.spec.ts
  name: reads each concept's own description off the concepts listing verbatim, including an empty string for a legacy concept (criterion 1)
  proves: Criterion 1 — the GlossaryConcept shape use-glossary-concepts narrows carries description read off the concepts listing, including a legacy concept's empty string, never dropped, renamed or coerced.
  fails_when: useGlossaryConcepts stops returning description on each concept, or turns an empty description into null/undefined, or drops/renames the field.
- file: src/hooks/use-concept-options.spec.ts
  name: type-checks that ConceptOption can never carry a description field, unlike its sibling GlossaryConcept (checked by this project's own typecheck step)
  proves: Criterion 5's type-level claim — ConceptOption continues to omit description.
  fails_when: 'ConceptOption is ever widened to declare a description field: the @ts-expect-error directive becomes unused, and this project''s own typecheck step fails on the unused-directive error.'
- file: src/routes/glossary-browser-screen-concept-description.spec.ts
  name: renders the Concepts tab's header row as Name, Description, Accepts, TTL, in that order
  proves: The delivery record's disclosed inference that the Description column sits second, right after Name.
  fails_when: CONCEPTS_COLUMNS' order changes so Description no longer sits immediately after Name.
- file: src/routes/glossary-browser-screen-concept-description.spec.ts
  name: renders each concept's own description text in its own row
  proves: Criterion 2 — the Concepts tab renders each concept's own description.
  fails_when: toConceptRow/toDescriptionCell stops wiring a described concept's own description into its row, or the Description column stops rendering it.
- file: src/routes/glossary-browser-screen-concept-description.spec.ts
  name: shows a described concept's own description as plain text and an empty-description concept as an 'Awaiting description' status-dot marker instead
  proves: Criterion 3 — a concept whose description is empty is rendered with a visible marker distinguishing it from described concepts.
  fails_when: an empty-description concept renders as plain (possibly blank) text instead of the marker, a described concept also shows the marker or dot, or the marker loses its color-dot pairing.
- file: src/routes/glossary-browser-screen-concept-description.spec.ts
  name: renders the identical, fixed 'Awaiting description' marker for two differently-named concepts that share an empty description
  proves: Criterion 4 — an empty description renders no invented, concept-specific text.
  fails_when: the empty-description marker's text varies between two differently-named concepts.
untested:
- 'Criterion 5''s own clause that the omission is disclosed in its header comment as a deliberate departure from the sibling shape is not independently tested: the type-level omission itself is proven, but whether a specific comment exists in the source is documentation content, not observable behavior a test can assert without string-matching source prose.'
not_applicable:
- edge_case: A whitespace-only description (e.g. ' ') as a distinct case from empty.
  why: rules/glossary/a-concept-with-an-empty-description-is-read-as-awaiting-one and every criterion name "empty" specifically, and toDescriptionCell's own check is description === ''; there is no separate bug class to distinguish for a string type, and untrimmed whitespace is out of scope of what any node or criterion states.
- edge_case: Loading, load-error-with-retry and explicit-empty-list states for the Concepts tab.
  why: Untouched by this task (the implementation record's own preserved list states this verbatim) and already proven by the existing glossary-browser-screen.spec.ts.
- edge_case: The Concept create/edit form's own description handling.
  why: Explicitly deferred by this task's own delivery record to a sibling task (concept-form-description-field).
- edge_case: Concurrent/duplicate-submission edge cases.
  why: Unaffected by this task — it adds no new interactive control, only a read-side column and marker.
- edge_case: XSS/markup-safety of an arbitrary description string.
  why: toDescriptionCell returns the string verbatim into a JSX text position, which React escapes by default the same way every other plain-text cell in this table already does.
---

## What it is
Two tests extending the existing table's own test file, proving the new entry the same way every prior single-entry addition to this table was proven.

## Notes
Criterion 5's own clause that the omission is "disclosed in its header comment as a deliberate departure from the sibling shape" is not independently tested: the type-level omission itself is proven, but whether a specific comment exists in the source is documentation content, not observable behavior a test can assert without string-matching source prose. Left as an absence for a reviewer to confirm by reading use-concept-options.ts directly.
The first suite run (glossary-concept-description-browser-description-and-legacy-marker-suite) failed at typecheck: use-concept-options.spec.ts's `@ts-expect-error` directive was followed by a multi-line comment block before the statement it targeted, so this project's tsc treated the directive as unused. Fixed by compressing it to one line, matching this codebase's own working precedent (use-simulate-hypothesis-request.spec.ts's TYP-04 test); suite-2 then failed at lint for the identical class of bug in a multi-line `eslint-disable-next-line` block in glossary-browser-screen-concept-description.spec.ts, fixed the same way; suite-3 passed clean.
