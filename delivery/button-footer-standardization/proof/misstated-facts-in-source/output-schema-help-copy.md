---
title: Output-schema entry guidance rewrite, proven against its ten criteria
summary: Every claim the rewritten output-schema paragraph makes, its absence of a worked example, its silence on any check the two named nodes do not state, its narrower reading over the read-only refusal, the surface's refusal to check on any of these grounds, and both disclosed inferences are each proven by a test that fails over exactly the wording or behaviour it targets.
implementation: sha256:4640f182c9e2074d74060518523c2604821cfd49a5674a4ac70a6f8079987c94
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/misstated-facts-in-source-output-schema-help-copy-suite-2
tests:
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: CapabilityFormFields — the output-schema guidance renders wherever the entry stands (criterion 1) > renders the guidance paragraph beside the create screen's own Output schema editor
  proves: Text stating what the system reads out of an entered output schema renders wherever the capability output-schema entry stands, over the create screen.
  fails_when: The guidance paragraph is removed, reworded away from its distinctive first sentence, or no longer rendered on the routed create screen.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: CapabilityFormFields — the output-schema guidance renders wherever the entry stands (criterion 1) > renders the same guidance paragraph beside the detail screen's own Output schema editor
  proves: The same criterion over the detail screen, which mounts the same component.
  fails_when: The guidance paragraph does not render, or renders different wording, on the routed detail screen.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: CapabilityFormFields — the guidance states that what is entered is JSON (criterion 2) > states that the entered content is JSON
  proves: That text states that what is entered is JSON.
  fails_when: The guidance's first sentence stops naming JSON as what is entered, or is reworded away from this exact claim.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: CapabilityFormFields — the guidance states the read field names are the schema's own top-level properties keys (criterion 3) > states that the read field names are the keys of the schema's own top-level properties object
  proves: That text states that the field names read from the entered schema are the keys of its own top-level properties object.
  fails_when: The guidance no longer names the top-level properties object as the source of the read field names.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: CapabilityFormFields — the guidance states a key's own type and description are read as its declared semantics (criterion 4) > states that each such key's own type and description, where the schema states them, are read as that field's declared semantics
  proves: That text states that such a key's own declared type and description, where the entered schema states them, are read as that field's declared semantics.
  fails_when: The guidance stops naming type and description as the source of a field's declared semantics, or drops the where-stated qualification.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: CapabilityFormFields — the guidance states nothing else in the schema is read or validated (criterion 5) > states that nothing else in the entered schema is read or validated
  proves: That text states that nothing else in the entered schema is read or validated.
  fails_when: The guidance drops or waters down the sentence bounding what else is read or validated.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: CapabilityFormFields — the guidance states a description declares meaning and names no decision (criterion 6) > states that a description entered there states what its value means and names no decision
  proves: That text states that a description entered there states what its value means and names no decision.
  fails_when: The guidance no longer states this exact claim about a description's meaning versus a decision.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: CapabilityFormFields — the guidance carries no worked example (criterion 7) > carries no digit, which every worked example over this schema has so far instantiated as a concrete code
  proves: That text carries no worked example, whether composed for the surface or reproduced from anywhere else.
  fails_when: A worked example instantiated with a numeric code, as the prior copy's removed examples were, is reintroduced into the guidance.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: CapabilityFormFields — the guidance carries no worked example (criterion 7) > carries no brace, which a worked JSON snippet would need to show a concrete shape
  proves: The same criterion against the other shape a worked example takes here.
  fails_when: A worked example shown as an inline JSON snippet, using braces, is reintroduced into the guidance.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: CapabilityFormFields — the guidance states no further claim about what an entered output schema is read for (criterion 8) > states exactly the five claims and no sixth, as five sentences
  proves: That text states no further claim about what an entered output schema is read for.
  fails_when: A sixth sentence or clause is added to the guidance, or one of the five is split into two, changing the sentence count away from five.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: CapabilityFormFields — the guidance promises no check, only what is read (criterion 9) > names no check or refusal vocabulary anywhere in the guidance
  proves: That text promises no check beyond the ones a-capability-declares-its-contract and a-capability-declares-well-formed-schemas state a submitted registration is checked for.
  fails_when: The guidance is reworded to name any refusal, error, requirement or verification outcome, rather than describing only what is read.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: CapabilityFormFields — the guidance promises no check, only what is read (criterion 9) > names no check tied to the capability's own read-only nature
  proves: 'The task''s UNDERDETERMINED note: criterion 9 as first written would have been satisfied by text promising the read-only-nature check, which the registry does perform and which neither of the two nodes the rule names states, so the node''s own narrower bound is what excludes it. This test is that bound.'
  fails_when: The guidance states or implies that the capability's declared nature is checked or grounds a refusal at this entry — text that would satisfy the criterion as first written, and that the node's actual bound refuses.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: CapabilityFormFields — the surface refuses no entry on the grounds the guidance states (criterion 10) > does not disable Save for a syntactically valid output schema with no top-level properties object
  proves: The surface refuses no entry and checks no entered content on any of the grounds that text states, over the absence of a top-level properties object.
  fails_when: A structural check rejecting an output schema lacking a top-level properties object is added, disabling Save for such an entry.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: CapabilityFormFields — the surface refuses no entry on the grounds the guidance states (criterion 10) > does not disable Save for an output schema whose declared key carries neither type nor description
  proves: The same criterion over a key missing type or description.
  fails_when: A structural check rejecting a properties key missing type or description is added, disabling Save for such an entry.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: CapabilityFormFields — the surface refuses no entry on the grounds the guidance states (criterion 10) > does not disable Save for an output schema whose key's description reads as a decision rather than a meaning
  proves: The same criterion over a description reading as a decision.
  fails_when: A semantic check over a description's wording is added, disabling Save for a description that reads as a decision.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: CapabilityFormFields — disclosed inferences the implementation recorded > keeps the guidance in Portuguese, matching the register of the copy it replaced
  proves: The implementation's disclosed inference that the paragraph stays in Portuguese, matching the register of the copy it replaces.
  fails_when: The guidance is rewritten in English or another language, losing the Portuguese phrasing the inference commits to.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: CapabilityFormFields — disclosed inferences the implementation recorded > keeps the guidance as a muted small paragraph inside the div beside the Output schema editor
  proves: The implementation's disclosed inference that the paragraph keeps its existing position, tag and styling.
  fails_when: The guidance moves to a different tag, drops the muted or small-text classes, or is relocated away from the output-schema field's own wrapping div.
not_applicable:
- edge_case: A registration refused by the backend for a reason the guidance text names — an incomplete contract, a nature that is not read-only.
  why: This task's criteria bound only the client surface's own refusal, never the registry's; server-side refusal messaging is pre-existing behaviour this task's files do not touch and is covered by sibling specs outside this delivery.
- edge_case: Two simultaneous submissions, or a race over the guidance's own state.
  why: The guidance is static text carrying no state of its own; nothing this task added is stateful, so no concurrency scenario is raised.
- edge_case: An entirely empty output-schema entry.
  why: The guidance's presence is unconditional on what is entered, including nothing; no criterion asks the guidance to change based on the field's content, and the field's own empty and invalid-JSON handling is pre-existing and untouched.
- edge_case: The concepts read failing, so the form and the guidance inside it never render.
  why: The component renders only once the screen's own phase is ready; that gating is pre-existing screen behaviour this task's files do not touch and no criterion here reaches it.
---

## What it is
Seventeen tests over the rewritten paragraph: one per criterion, two more where a criterion has two shapes worth separating, one for the task's own underdetermined note, and one per disclosed inference.

## Notes
The first suite run, at run/misstated-facts-in-source-output-schema-help-copy-suite, failed at the lint step over three type assertions in this file, before the tests ran at all.
That is a rule the project's standard leaves to a tool, so it went back to the author of these tests rather than to a diagnosis, and the three assertions were replaced with the attribute reading four sibling specs in this tree already use — what each of the three tests asserts is unchanged.
Criterion 7 is proven by two negative tests, over a digit and over a brace, which are the two shapes every worked example over this schema has taken here: a worked example carrying neither would pass both, and each test's own `fails_when` says which shape it catches.
The suite passed on the second run, 1263 tests over 189 files, with every step the registry declares.
