---
target: frontend
title: Case-creation screen and route, wired from the cases list
summary: Adds a /cases/new route and screen backed by create-draft, and makes the cases list's own "Create case" control a real, always-offered entrance to it.
task: sha256:5e39d14b2d6ddef2d08744e7e24b02807253739f8a7b66746d72d36e3eff3fd5
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/case-creation-screen-corrective-wire-case-creation-to-a-real-screen-and-route-build
files:
- path: src/routes/cases-list-screen.tsx
  effect: 'The "Create case" control moved out of the empty-state block into the screen''s own header, rendered unconditionally by a new renderBody() split (mirroring capabilities-browser-screen.tsx''s own pattern) so it is present on every reading of the listing rather than only when zero cases exist; it is no longer disabled and now calls navigate({ to: "/cases/new" }). Two pre-existing prose comments in the file this edit touches were removed rather than carried forward.'
- path: src/routes/route-tree.tsx
  effect: Registers a new static /cases/new route rendering CaseCreationScreen, declared alongside the existing /cases and /cases/$slug routes.
- path: src/routes/case-creation-screen.tsx
  effect: New route component for /cases/new. Composes useCaseCreationForm's loading/load-error/ready states and CaseCreationFormFields, mirroring capability-create-screen.tsx's own structure.
- path: src/routes/case-creation-form-fields.tsx
  effect: New form-fields component rendering Slug, Title, When to use, Subject, Consolidation register and the Fallback (outcome/action/recipient) fields, each labeled and aria-linked to its own error; renders a "Still needed…" statement and disables the submit control while any of create-draft's required content (slug, title, when_to_use, subject, fallback) is absent from the fields, without consolidation_register ever entering that gate.
- path: src/hooks/use-case-creation-form.ts
  effect: New hook loading the outcome/action/recipient glossary vocabularies, building the react-hook-form + zod-resolved creation form, computing which required fields are still absent from the live-watched values, and calling create-draft (POST /v1/cases) on submit; on success, navigates to /cases/$slug/versions/$version keyed on the slug and version the response itself names; on failure, shows a mapped toast through the existing error-ui-state.ts convention.
- path: src/services/case-creation-form-schema.ts
  effect: New schema module. caseCreationFormSchema extends the existing case-version-form-schema with a required slug. stillAbsentRequiredFields(values) is the pure function naming, against each field, whether slug/title/when_to_use/subject/fallback.outcome/fallback.referral.action/fallback.referral.recipient is currently absent; consolidation_register is not in that list.
criteria:
- criterion: The cases list screen no longer renders a permanently disabled "Create case" control; the control is enabled and navigates to a case-creation screen.
  met: true
  how: cases-list-screen.tsx's header now renders an always-enabled Button with no disabled/title attributes, whose onClick navigates to "/cases/new".
- criterion: A /cases/new route exists in the frontend route tree and renders the case-creation screen.
  met: true
  how: route-tree.tsx registers caseCreateRoute at path "/cases/new" with component CaseCreationScreen, added to the router's children.
- criterion: Submitting the case-creation screen with the information the case domain requires creates a new case and takes the user to that case, without the user needing an existing slug beforehand.
  met: true
  how: The slug is a field the curator fills in directly (never derived, never read from an existing case); use-case-creation-form.ts's mutation posts it verbatim with the version-1 content to POST /v1/cases, and onSuccess navigates to /cases/$slug/versions/$version using the slug and version the response names.
- criterion: The case-creation screen never offers its submitting act while the information the case domain requires is absent from its fields; it states, in the act's place, which required information is still absent, named against the field that would carry it, and no case is created.
  met: true
  how: 'case-creation-form-fields.tsx disables the submit Button whenever stillAbsentRequiredFields (computed live from the watched form values) is non-empty, and renders a "Still needed before this case can be created: …" statement naming each currently-absent field''s label in that control''s place; consolidation_register is excluded from the required list and never gates the act. Because the same required fields are also what caseCreationFormSchema enforces, the mutation is never invoked with any of them missing, so no case is created while any is absent.'
nodes:
- node: contracts/knowledge/case-query
  how: This task adds no new list-cases or read-case call site. The cases listing (list-cases) is the same, already-delivered read cases-list-screen.tsx already performed; the destination this task's landing rule sends the curator to (/cases/$slug/versions/$version) is the already-delivered CaseVersionEditorScreen, which reads that version through read-case, unmodified by this task.
- node: domain/knowledge/case
  encoded_at:
  - src/services/case-creation-form-schema.ts
  - src/hooks/use-case-creation-form.ts
  how: 'The creation form requires the curator to type the case''s own slug (caseCreationFormSchema''s slug: z.string().min(1)) and the mutation carries it verbatim into create-draft''s request body, never deriving or generating it. next_version is a write-side counter this screen neither reads nor presents.'
- node: domain/knowledge/case-version
  encoded_at:
  - src/services/case-creation-form-schema.ts
  - src/routes/case-creation-form-fields.tsx
  how: caseCreationFormSchema extends the pre-existing case-version-form-schema, so title, when_to_use, subject and fallback (outcome, referral.action, referral.recipient) stay required exactly as that schema already declared them, and consolidation_register stays optional; the fields component renders exactly this set.
- node: contracts/knowledge/case-lifecycle
  encoded_at:
  - src/hooks/use-case-creation-form.ts
  how: The mutation invokes create-draft by POSTing to /v1/cases with the curator's slug and the first version's declared content; the response's own slug and version are what the screen navigates from afterward.
- node: rules/knowledge/a-case-listing-offers-a-route-to-author-a-new-case-on-every-reading
  encoded_at:
  - src/routes/cases-list-screen.tsx
  how: The "Create case" control now sits in the screen's header, rendered unconditionally ahead of renderBody()'s pending/error/empty/table branches, so it is offered on every reading of the listing including one still outstanding, one that failed, and one that answered no case at all -- the same, already-delivered pattern capabilities-browser-screen.tsx and connector-configurations-screen.tsx use for their own "New capability" and "New connector configuration" actions. This task's own Notes flag that criterion 1's text does not itself name those three readings; this source answers the rule's full statement anyway, since an established, low-risk convention for exactly this concern already exists in this codebase.
- node: rules/knowledge/a-case-authoring-surface-offers-no-submission-while-required-content-is-absent
  encoded_at:
  - src/services/case-creation-form-schema.ts
  - src/routes/case-creation-form-fields.tsx
  how: stillAbsentRequiredFields names exactly the content create-draft requires (slug, title, when_to_use, subject, fallback's three parts) and excludes consolidation_register; the fields component disables the submit control while that list is non-empty and states, in the control's own place, which of that content is still absent, named against each field's own label.
- node: rules/knowledge/a-successful-case-version-creation-lands-on-the-created-versions-own-surface
  encoded_at:
  - src/hooks/use-case-creation-form.ts
  how: onSuccess navigates to /cases/$slug/versions/$version using data.slug and data.version -- the identity the completed creation itself names -- and never to /cases, never to a versions listing, and never back onto the creation form.
- node: rules/knowledge/a-case-is-created-by-the-first-create-draft-naming-its-slug
  encoded_at:
  - src/services/case-creation-form-schema.ts
  - src/hooks/use-case-creation-form.ts
  how: The screen requires and carries the curator's own typed slug verbatim to create-draft, never deriving one, and the case's coming into existence is the backend act's own consequence of that call. This task's Notes record as REMAINDER that the rule's write-side clauses -- numbering the first version 1, leaving next_version at 2, and originating an existing case's next draft when the slug is already held -- belong to the create-draft write-side task and are neither implemented nor duplicated here; a slug that already has an open draft surfaces through the same case-already-has-draft error mapping already used elsewhere in this app, without special-casing the already-held-slug path this frontend does not own.
inferences:
- inferred: The "on every reading" clause of rules/knowledge/a-case-listing-offers-a-route-to-author-a-new-case-on-every-reading should be answered in full (button unconditional across loading/error/empty/table), even though criterion 1's own text, per this task's UNDERDETERMINED note, does not name the three readings.
  from: The rule's own statement, plus the already-delivered, in-code precedent in capabilities-browser-screen.tsx and connector-configurations-screen.tsx, which already implement exactly this unconditional-rendering pattern for the equivalent "New X" action and document the same rationale in their own comments.
- inferred: POST /v1/cases responds with { slug, version }, and the created version's number is read from that response rather than computed locally.
  from: The task's own ADVISORY note that no candidate node states create-draft's response shape, combined with use-new-draft-version-form.ts's own CreatedDraft type already consuming that same endpoint's response this way.
- inferred: The wording, placement (a role="alert" paragraph beside the submit control, linked to it via aria-describedby) and styling of the "still absent" statement are form left to the interface, following this app's own existing FormField/role="alert" convention rather than introducing a new pattern.
  from: The rule's own commentary that wording and placement of the withholding statement belong to the interface, and the FormField error-paragraph convention already used throughout case-version-editor-form-fields.tsx, capability-form-fields.tsx and connector-configuration-form-fields.tsx.
- inferred: The Subject field renders as free text (not a glossary-backed Select), and no subject-type glossary vocabulary is fetched for this screen.
  from: case-version-editor-form-fields.tsx's own already-delivered rendering of the identical case-version attribute as a plain Input despite a subject-type vocabulary existing.
- inferred: On a case-already-has-draft refusal (the typed slug already has an open draft), the screen shows a toast naming the conflict and does not auto-redirect to that existing draft.
  from: This task's own REMAINDER note, which hands the already-held-slug write-side semantics to a different (write-side) task; the redirect behavior use-new-draft-version-form.ts implements for its own, narrower "next draft of a known case" scenario is not replicated here to avoid widening this task past its own criteria.
preserved:
- The cases list's search-by-slug input, its ACC-07 aria-live filtered-row-count announcement, its "No cases yet — create the first one" empty-state copy, its Retry control and error text on a failed read, and its row-click navigation to /cases/$slug all keep working exactly as before this task, unchanged in behavior.
- Every other, already-delivered route (including /cases/$slug/versions/new and its own create-draft-based "next draft" flow) is untouched.
deferred:
- what: cases-list-screen.spec.ts's existing test "renders the empty-state message and a Create case action instead of a table when GET /v1/cases returns zero cases" asserts that the Create case button carries a disabled attribute and a non-empty title -- the very placeholder behavior this task corrects. Several other tests in the same file and in cases-list-screen-retry.spec.ts / cases-list-screen-aria-live.spec.ts count buttons via screen.findAllByRole("button")/getAllByRole("button"), and that count now also includes the header's always-rendered Create case button.
  why: Writing or editing a proof is not this delivery's role; these pre-existing assertions encode the corrected behavior and need updating by the task that authors this correction's own proof.
- what: Whether a curator who types a slug some case already holds, and that case currently has no open draft, should see any distinct confirmation before landing on that case's newly originated next draft (rather than the brand-new-case case, which looks identical to the curator on this screen).
  why: The write-side fact that this is the same act either way is this task's own REMAINDER, owned by the create-draft write-side task; this frontend deliberately presents both outcomes identically since nothing in this task's own criteria or the candidate nodes distinguishes them for the curator.
---
## What it is

Adds `/cases/new` with a case-creation screen backed by `create-draft`, and turns the cases
list's placeholder "Create case" control into a real, always-offered entrance to it.

## Notes

The two ADVISORY seams the task's own Notes carried are both settled: the pending deliverable's response shape carries { slug, version } (matching use-new-draft-version-form.ts's own already-delivered use of the same endpoint), and this task is bound only to reaching the created version's own surface, not to that surface's own presentation, which stands unmodified.
REMAINDER — the write-side clauses of rules/knowledge/a-case-is-created-by-the-first-create-draft-naming-its-slug (numbering the first version 1, leaving next_version at 2, and originating an existing case's next draft when the slug is already held) are the create-draft write-side task's own, and are neither implemented nor duplicated here; a slug that already has an open draft surfaces through this app's existing case-already-has-draft error mapping.
Deferred: cases-list-screen.spec.ts's own pre-existing tests assert the placeholder disabled-button behavior this task corrects, and several sibling specs count buttons in a way this task's own header button now changes; updating those assertions is the proof step's, not this implementation's.
