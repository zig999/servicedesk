---
target: frontend
title: Output-schema entry disclosure, review
summary: What four passes found over the frontend delivery rewriting the Output-schema disclosure paragraph
  and its pinning test to state the recursive path reading.
reviewed:
- src/routes/capability-form-fields.tsx
- src/routes/capability-form-fields-output-schema-guidance.spec.ts
tasks:
- task/output-schema-entry-disclosure/the-entry-states-the-recursive-path-reading
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured suite run over the whole change passed clean, so there was no failure to diagnose
coverage:
- criterion: The paragraph states that the field names read from the entered schema are the paths through
    its own top-level properties object and every properties object and items schema reachable beneath
    it.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
    name: states that the read field names are the paths through the schema own top-level properties object
      and every properties object and items schema reachable beneath it
- criterion: The paragraph states how such a path is built -- each object's own key joined onto its parent's
    path with a dot, and an array's own items joined with brackets.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
    name: states that each object's own key is joined onto its parent's own path with a dot, and an array's
      own items is joined onto its parent's own path with brackets
- criterion: The paragraph states that what is entered there is JSON.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
    name: states that the entered content is JSON
- criterion: The paragraph states that the type and description declared at the node each path reaches,
    where the schema states them, are read as that field's declared semantics.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
    name: states that the type and description declared at the node each path reaches, where the schema
      states them, are read as that field's declared semantics
- criterion: The paragraph states that no other content of the entered schema is read or validated.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
    name: states that no other content of the entered schema is read or validated
- criterion: The paragraph states that a description entered there states what its value means and names
    no decision.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
    name: states that a description entered there states what its value means and names no decision
- criterion: The paragraph makes no claim about what an entered output schema is read for beyond those
    already held by domain/investigation/field-semantics, rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema
    and rules/glossary/a-description-states-meaning-never-policy.
  state: partial
  why: The sentence-splitting regex match is unanchored, so a further claim appended as a clause inside
    an existing sentence still passes; the test also binds the exact prose rather than the claim set (any
    reword/reorder fails it even if it still claims nothing extra).
- criterion: The paragraph carries no worked example of its own -- no concrete field name, path, or schema
    snippet illustrating the path grammar.
  state: partial
  why: No-digit/no-brace are proxies; a concrete field name or illustrative path with neither (e.g. installations[].estado)
    passes untouched.
- criterion: The paragraph contains none of the following, in Portuguese or English -- recusa, rejeição,
    erro, inválido, obrigatório, verificação, checagem, somente leitura, read-only, natureza -- the vocabulary
    the surface own existing disclosure test already forbids.
  state: partial
  why: The regex covers only the Portuguese forms and 'read-only'; the English half (error, invalid, refusal,
    rejection, required, verification, check, nature) has no matching alternative at all.
- criterion: The paragraph renders with the same text beside the Output schema entry on the capability
    create screen and on the capability detail screen.
  state: partial
  why: The sameness half holds; the placement half ('beside the Output schema entry') is unexercised on
    either screen, since the locator scans the whole document body and never relates the paragraph to
    the field.
- criterion: An output schema declaring its properties only beneath a nested items schema is not refused
    by this surface.
  state: partial
  why: Only the Save-disabled attribute is checked; the form is never submitted, and no input in the set
    is one the surface does refuse, so the assertion never demonstrates it can fail.
- criterion: An output schema whose nested node carries neither type nor description is not refused by
    this surface.
  state: partial
  why: Same shape as the preceding criterion.
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
reconciliation: siegard-reconcile/recursive-output-schema-fields-frontend.md
findings:
- pass: standard
  file: src/routes/capability-form-fields.tsx
  where: line 85-88, building the concept Select's options prop
  cites: API-01
  evidence: 'const conceptSelectOptions: SelectOption[] = conceptOptions.map((concept) => ({ value: concept.name,
    label: concept.name }));'
  cost: The concept-options fetched shape is reshaped inline instead of through a named adapter; the sibling
    hook useGlossaryVocabularyOptions does the identical reshaping inside the hook itself, so the same
    fetched-to-prop adaptation is handled two different ways in this codebase. Pre-existing, not introduced
    by this delivery.
  correction: Move the concept-to-SelectOption mapping into a named adapter (e.g. exported from use-concept-options.ts)
    and have CapabilityFormFields consume the already-adapted list.
---

## What it is

The review of the frontend half of the recursive-output-schema-fields initiative: one task rewriting the Output-schema entry's disclosure paragraph and its pinning test to state the recursive path reading.
Coverage, specification conformance (one judge per file) and the project's own standard all ran; the failures pass did not, because the captured suite run passed clean.

## Notes

The specification-conformance pass found no contradiction or unstated fact in either file -- the disclosure paragraph restates exactly the five claims its two bound rules allow, with no sixth claim.
The one standard finding (API-01) is pre-existing code this delivery did not write, surfaced only because the whole file sat in this review's scope.
Coverage came back 6/12 covered and 6/12 partial, each partial naming a concrete gap between what a test checks and what its criterion actually states (unanchored regexes, digit/brace proxies for "no worked example", an English gap in the forbidden-vocabulary list, and non-refusal asserted only as Save-not-disabled with no submission and no input the surface actually refuses).
A certification was attempted for rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema against this file's own tests and came back `uncovered` -- an error in how this review composed its own certifications file, since no test here derives a field-semantics name at all. That node's fact is already correctly certified against the backend delivery (proof/recursive-output-schema-field-paths/field-semantics-reads-nested-paths.md); this frontend review claims no certification of it.
Four plan nodes bound to capability-form-fields.tsx by an earlier delivery (a-capability-declares-well-formed-schemas, a-capability-is-read-only, one-capability-answers-one-concept, the-input-schema-and-output-schema-fields-are-untouched-by-a-schema-drafts-arrival) were read as "held nowhere" in this file and are not rebound by this act; they stand exactly as they stood before this review, per the fold's own bind receipt.
