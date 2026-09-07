---
contract_version: siegard-reconcile/3
title: The ButtonFooter standardization, read whole against every node the trace binds to its files
summary: Seven tasks of the button-footer-standardization initiative introduced a shared ButtonFooter
  component and moved every primary action row of the capability, connector-configuration, hypothesis-revision
  and case-version authoring surfaces into it; removed the standalone Back to capabilities and Back to
  connector configurations links from those screens and carried the route to each listing in the footer
  instead, on every phase; gave the capability and connector-configuration detail screens' loading and
  load-error phases a footer they never had; added a Cancel to the hypothesis revision form and moved
  the case version editor's release conditions out of its dialog onto the surface itself. The implementation
  records for those seven tasks state each file's own effect, the delivery's suite ran green over the
  whole change, and this review reads every file of that change against every node the trace binds to
  it.
target: frontend
files:
- path: src/hooks/use-capability-detail.ts
  change: adds an onError handler to the edit mutation, reusing saveFailureMessage to state a distinguishable
    named condition or the unrecognised message; a refused save on this surface previously stated no outcome
    at all.
- path: src/hooks/use-capability-form.ts
  change: exports saveFailureMessage as one named mapping other capability hooks reuse, and states the
    success outcome naming the submitted name and version, fired only from the mutation's onSuccess.
- path: src/hooks/use-connector-configuration-detail.ts
  change: Adds an onError handler to the edit mutation, reusing saveFailureMessage to state a distinguishable
    refusal the detail surface previously left unstated.
- path: src/hooks/use-connector-configuration-form.ts
  change: States the registered outcome naming the connector name submitted, on the mutation's own onSuccess;
    exports saveFailureMessage so the detail hook reuses the same refused-outcome distinction.
- path: src/hooks/use-edit-draft-version-form.ts
  change: Computes the manifest-pin release condition from the draft's own manifest and each entry's pinned
    revision state, exposing it as the release conditions and the refusal payload as the violations; adds
    a cancel action backed by the router's own history to the ready phase.
- path: src/hooks/use-hypothesis-revision-form.ts
  change: adds a router-backed cancel action to the ready phase of the form state, alongside the existing
    open-manifest and submit actions; nothing else in the hook changed.
- path: src/hooks/use-manifest-pinned-revision-states.ts
  change: Filters out any manifest entry lacking a readable pinned hypothesis name before building either
    query set or the returned state map, so such an entry issues no request and is simply absent from
    the map, which is already the hook's own fallback for not-yet-answered, instead of dereferencing it
    unchecked and crashing the whole editor.
- path: src/hooks/use-new-draft-version-form.ts
  change: Adds the same cancel action to its own pre-creation ready phase, the post-creation phase inheriting
    it by delegation; two prose comments go with the edit, one of them replaced by an explicit early return
    so an empty catch needs no comment to satisfy the linter.
- path: src/routes/capability-create-screen-actions.spec.ts
  change: 'Written or rewritten by the delivery of task/registry-authoring-footers/capability-form-action-footer,
    task/registry-authoring-footers/capability-screen-return-route: its assertions now hold the same facts
    against the shared ButtonFooter''s controls rather than against the controls this initiative replaced.'
- path: src/routes/capability-create-screen-outcome.spec.ts
  change: 'Written or rewritten by the delivery of task/registry-authoring-footers/capability-form-action-footer:
    its assertions now hold the same facts against the shared ButtonFooter''s controls rather than against
    the controls this initiative replaced.'
- path: src/routes/capability-create-screen-save.spec.ts
  change: 'Written or rewritten by the delivery of task/registry-authoring-footers/capability-form-action-footer:
    its assertions now hold the same facts against the shared ButtonFooter''s controls rather than against
    the controls this initiative replaced.'
- path: src/routes/capability-create-screen.spec.ts
  change: 'Written or rewritten by the delivery of task/registry-authoring-footers/capability-screen-return-route:
    its assertions now hold the same facts against the shared ButtonFooter''s controls rather than against
    the controls this initiative replaced.'
- path: src/routes/capability-create-screen.tsx
  change: Removes the standalone Back to capabilities link that sat above the heading on every phase.
    The loading phase now renders a ButtonFooter carrying a Cancel control, a secondary button wrapping
    a link to the listing; the load-error phase's existing Retry now sits inside that same footer alongside
    the same Cancel. The ready phase is untouched, its route already reaching the operator through the
    form fields' own footer.
- path: src/routes/capability-detail-ready-view.tsx
  change: appends a Cancel control after the existing Discard dialog and Saved status inside trailingActions;
    the header comment documenting the Discard button's rationale goes with the edit, this file being
    delivered whole.
- path: src/routes/capability-detail-screen-cancel.spec.ts
  change: 'Written or rewritten by the delivery of task/registry-authoring-footers/capability-form-action-footer:
    its assertions now hold the same facts against the shared ButtonFooter''s controls rather than against
    the controls this initiative replaced.'
- path: src/routes/capability-detail-screen-discard-availability.spec.ts
  change: 'Written or rewritten by the delivery of task/registry-authoring-footers/capability-form-action-footer,
    task/registry-authoring-footers/capability-screen-return-route: its assertions now hold the same facts
    against the shared ButtonFooter''s controls rather than against the controls this initiative replaced.'
- path: src/routes/capability-detail-screen-outcome.spec.ts
  change: 'Written or rewritten by the delivery of task/registry-authoring-footers/capability-form-action-footer:
    its assertions now hold the same facts against the shared ButtonFooter''s controls rather than against
    the controls this initiative replaced.'
- path: src/routes/capability-detail-screen-route.spec.ts
  change: 'Written or rewritten by the delivery of task/registry-authoring-footers/capability-form-action-footer,
    task/registry-authoring-footers/capability-screen-return-route: its assertions now hold the same facts
    against the shared ButtonFooter''s controls rather than against the controls this initiative replaced.'
- path: src/routes/capability-detail-screen.spec.ts
  change: 'Written or rewritten by the delivery of task/registry-authoring-footers/capability-screen-return-route:
    its assertions now hold the same facts against the shared ButtonFooter''s controls rather than against
    the controls this initiative replaced.'
- path: src/routes/capability-detail-screen.tsx
  change: Removes the standalone Back to capabilities link from all three returns. The loading return
    now renders a ButtonFooter carrying a Cancel control in place of the removed link; the load-error
    return's existing Retry now sits inside a ButtonFooter alongside the same Cancel, rather than as a
    bare button beside a bare link. The ready return keeps rendering the detail ready view unchanged,
    whose own footer already carries the route.
- path: src/routes/capability-form-fields-action-footer.spec.ts
  change: 'Written or rewritten by the delivery of task/registry-authoring-footers/capability-form-action-footer:
    its assertions now hold the same facts against the shared ButtonFooter''s controls rather than against
    the controls this initiative replaced.'
- path: src/routes/capability-form-fields.tsx
  change: renders its action row through the shared ButtonFooter, Save plus trailingActions, instead of
    an end-aligned flex div; the JsonTextareaField-guidance comment goes with the edit, this file being
    delivered whole.
- path: src/routes/case-version-editor-ready-view.tsx
  change: Renders Release, Discard, Save changes and Cancel through the shared ButtonFooter as the last
    element of its fragment; adds a persistent Release conditions section outside any dialog listing each
    condition as met, not met or not yet decided; narrows the Release dialog's own content to the refusal
    violations alone; Cancel becomes a button wired to the state's cancel action rather than a link to
    a fixed route; the unused link import and one prose comment go with the edit, this file being delivered
    whole.
- path: src/routes/case-version-editor-screen-action-footer.spec.ts
  change: 'Written or rewritten by the delivery of task/knowledge-authoring-footers/case-version-editor-action-footer:
    its assertions now hold the same facts against the shared ButtonFooter''s controls rather than against
    the controls this initiative replaced.'
- path: src/routes/case-version-editor-screen-cancel.spec.ts
  change: 'Written or rewritten by the delivery of task/knowledge-authoring-footers/case-version-editor-action-footer:
    its assertions now hold the same facts against the shared ButtonFooter''s controls rather than against
    the controls this initiative replaced.'
- path: src/routes/case-version-editor-screen-release-checklist.spec.ts
  change: 'Written or rewritten by the delivery of task/knowledge-authoring-footers/case-version-editor-action-footer:
    its assertions now hold the same facts against the shared ButtonFooter''s controls rather than against
    the controls this initiative replaced.'
- path: src/routes/case-version-editor-screen-release-control.spec.ts
  change: 'Written or rewritten by the delivery of task/knowledge-authoring-footers/case-version-editor-action-footer:
    its assertions now hold the same facts against the shared ButtonFooter''s controls rather than against
    the controls this initiative replaced.'
- path: src/routes/case-version-editor-screen-release-outcomes.spec.ts
  change: 'Written or rewritten by the delivery of task/knowledge-authoring-footers/case-version-editor-action-footer:
    its assertions now hold the same facts against the shared ButtonFooter''s controls rather than against
    the controls this initiative replaced.'
- path: src/routes/connector-configuration-create-screen-cancel.spec.ts
  change: 'Written or rewritten by the delivery of task/registry-authoring-footers/connector-configuration-form-action-footer:
    its assertions now hold the same facts against the shared ButtonFooter''s controls rather than against
    the controls this initiative replaced.'
- path: src/routes/connector-configuration-create-screen-outcome.spec.ts
  change: 'Written or rewritten by the delivery of task/registry-authoring-footers/connector-configuration-form-action-footer:
    its assertions now hold the same facts against the shared ButtonFooter''s controls rather than against
    the controls this initiative replaced.'
- path: src/routes/connector-configuration-create-screen.spec.ts
  change: 'Written or rewritten by the delivery of task/registry-authoring-footers/connector-configuration-screen-return-route:
    its assertions now hold the same facts against the shared ButtonFooter''s controls rather than against
    the controls this initiative replaced.'
- path: src/routes/connector-configuration-create-screen.tsx
  change: Removes the standalone Back to connector configurations link that sat above the heading. This
    screen has one reading only — its hook returns no loading or load-error phase — and that reading already
    carried the route through the form fields' own footer, whose Cancel control is a link to the listing;
    that footer is now the screen's only route there, untouched by this task.
- path: src/routes/connector-configuration-detail-ready-view-cancel.spec.ts
  change: 'Written or rewritten by the delivery of task/registry-authoring-footers/connector-configuration-form-action-footer:
    its assertions now hold the same facts against the shared ButtonFooter''s controls rather than against
    the controls this initiative replaced.'
- path: src/routes/connector-configuration-detail-ready-view-order.spec.ts
  change: 'Written or rewritten by the delivery of task/registry-authoring-footers/connector-configuration-form-action-footer:
    its assertions now hold the same facts against the shared ButtonFooter''s controls rather than against
    the controls this initiative replaced.'
- path: src/routes/connector-configuration-detail-ready-view.tsx
  change: Passes a Cancel control alongside the pre-existing Discard dialog and Saved status through trailingActions;
    renders the connector test panel ahead of the form fields rather than after them, so the footer stays
    the screen's last scrollable element; the file's rationale comment goes with the edit, this file being
    delivered whole.
- path: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
  change: 'Written or rewritten by the delivery of task/registry-authoring-footers/connector-configuration-form-action-footer,
    task/registry-authoring-footers/connector-configuration-screen-return-route: its assertions now hold
    the same facts against the shared ButtonFooter''s controls rather than against the controls this initiative
    replaced.'
- path: src/routes/connector-configuration-detail-screen-outcome.spec.ts
  change: 'Written or rewritten by the delivery of task/registry-authoring-footers/connector-configuration-form-action-footer:
    its assertions now hold the same facts against the shared ButtonFooter''s controls rather than against
    the controls this initiative replaced.'
- path: src/routes/connector-configuration-detail-screen.spec.ts
  change: 'Written or rewritten by the delivery of task/registry-authoring-footers/connector-configuration-screen-return-route:
    its assertions now hold the same facts against the shared ButtonFooter''s controls rather than against
    the controls this initiative replaced.'
- path: src/routes/connector-configuration-detail-screen.tsx
  change: Removes the standalone link from all three returns. The loading return now renders a ButtonFooter
    carrying a Cancel control, a secondary button wrapping a link to the listing, in place of the removed
    link; the load-error return's existing Retry now sits inside that same footer alongside the same Cancel,
    rather than as a bare button beside a bare link. The ready return keeps delegating to the detail ready
    view unchanged, whose own footer already carries the route.
- path: src/routes/connector-configuration-form-fields-action-footer.spec.ts
  change: 'Written or rewritten by the delivery of task/registry-authoring-footers/connector-configuration-form-action-footer,
    task/registry-authoring-footers/connector-configuration-screen-return-route: its assertions now hold
    the same facts against the shared ButtonFooter''s controls rather than against the controls this initiative
    replaced.'
- path: src/routes/connector-configuration-form-fields.tsx
  change: Renders its action row through the shared ButtonFooter instead of a plain end-aligned flex row;
    still forwards trailingActions after Save, with no second prop introduced.
- path: src/routes/hypothesis-revision-form-fields-footer.spec.ts
  change: 'Written or rewritten by the delivery of task/knowledge-authoring-footers/hypothesis-revision-action-footer:
    its assertions now hold the same facts against the shared ButtonFooter''s controls rather than against
    the controls this initiative replaced.'
- path: src/routes/hypothesis-revision-form-fields.tsx
  change: replaces the lone end-aligned flex row around Save with the shared ButtonFooter, and adds an
    optional trailingActions prop rendered after Save inside that footer, mirroring the slot the two registry
    form-fields components already expose.
- path: src/routes/hypothesis-revision-screen-cancel.spec.ts
  change: 'Written or rewritten by the delivery of task/knowledge-authoring-footers/hypothesis-revision-action-footer:
    its assertions now hold the same facts against the shared ButtonFooter''s controls rather than against
    the controls this initiative replaced.'
- path: src/routes/hypothesis-revision-screen.tsx
  change: passes a secondary Cancel button, wired to the state's cancel action, through the form fields'
    new trailingActions slot in the ready phase.
- path: src/routes/new-case-draft-screen-cancel.spec.ts
  change: 'Written or rewritten by the delivery of task/knowledge-authoring-footers/case-version-editor-action-footer:
    its assertions now hold the same facts against the shared ButtonFooter''s controls rather than against
    the controls this initiative replaced.'
- path: src/services/release-checklist.ts
  change: Replaces the three-item checklist builder with a release condition carrying one of three statuses,
    and a function stating the manifest-pin condition as not yet decided while any entry's pinned-revision
    read has not resolved, unmet where any resolved entry is not released, and met otherwise including
    vacuously for an empty manifest; the refusal extraction for the release act is unchanged.
- path: src/shared/components/button-footer.spec.ts
  change: 'Written or rewritten by the delivery of task/shared-action-footer/button-footer-component:
    its assertions now hold the same facts against the shared ButtonFooter''s controls rather than against
    the controls this initiative replaced.'
- path: src/shared/components/button-footer.tsx
  change: Exports ButtonFooter, a component taking children and rendering them, in received order, inside
    a role=group aria-label=Actions sticky bottom-0 flex row aligned to the end.
nodes:
- node: contracts/glossary/glossary-query
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at the three glossary-vocabulary reads wired for\
    \ the fallback's outcome, action and recipient fields — const outcomeOptions = useGlossaryVocabularyOptions(\"\
    outcome\"); const actionOptions = useGlossaryVocabularyOptions(\"action\"); const recipientOptions\
    \ = useGlossaryVocabularyOptions(\"recipient\");\nsrc/hooks/use-new-draft-version-form.ts: held at\
    \ the four glossary-vocabulary hooks assembled for the create form, lines 46-49 — const subjectOptions\
    \ = useGlossaryVocabularyOptions(\"subject-type\");\n  const outcomeOptions = useGlossaryVocabularyOptions(\"\
    outcome\");\n  const actionOptions = useGlossaryVocabularyOptions(\"action\");\n  const recipientOptions\
    \ = useGlossaryVocabularyOptions(\"recipient\");"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-new-draft-version-form.ts
- node: contracts/integration/capability-registry
  conforms: true
  how: "src/hooks/use-capability-detail.ts: held at the query and mutation definitions — queryFn: () =>\n\
    \    apiFetch<Capability>(\n      `/v1/capabilities/${encodeURIComponent(name)}/${encodeURIComponent(version)}`,\n\
    \    ),\n...\nmutationFn: (values: CapabilityFormValues) =>\n    apiFetch<Capability>(\n      `/v1/capabilities/${encodeURIComponent(values.name)}/${encodeURIComponent(values.version)}`,\n\
    \      { method: \"PUT\", ... }\n    ),\nsrc/hooks/use-capability-form.ts: held at the mutationFn's\
    \ PUT call implementing register-capability — apiFetch<Capability>(`/v1/capabilities/${encodeURIComponent(values.name)}/${encodeURIComponent(values.version)}`,\
    \ { method: \"PUT\", ... })\nsrc/routes/capability-create-screen.tsx: held at nowhere in this file\
    \ — the screen calls no registry operation itself; it renders `<CapabilityFormFields form={state.form}\
    \ ... onSubmit={state.onSubmit} .../>` and leaves `register-capability` (and every other operation)\
    \ to `useCapabilityForm`"
  encoded_at:
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-capability-form.ts
  - src/routes/capability-create-screen.tsx
- node: contracts/integration/connector-configuration-registry
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-connector-configuration-detail.ts,
    src/hooks/use-connector-configuration-form.ts, src/routes/connector-configuration-detail-ready-view.tsx,
    and src/routes/connector-configuration-create-screen.tsx read `nowhere` — const state = useConnectorConfigurationForm(null,
    handleSaved); — the file forwards state.onSubmit into the shared form-fields component rather than
    calling register-connector, read-connector-configuration or list-connector-configurations itself —
    a binding asserts the file answers for the node, so the pair that stopped holding it is released by
    `--bind ... --replace`, never restamped here'
  observed_at:
  - src/hooks/use-connector-configuration-detail.ts
  - src/hooks/use-connector-configuration-form.ts
  - src/routes/connector-configuration-create-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at the PATCH and release POST the two mutations\
    \ issue — apiFetch<CaseVersionRecord>(`/v1/cases/${encodeURIComponent(slug)}/versions/${version}`,\
    \ { method: \"PATCH\", headers: { \"Content-Type\": \"application/json\" }, body: JSON.stringify(values)\
    \ })\nsrc/hooks/use-hypothesis-revision-form.ts: held at the reviseMutation's mutationFn, POST-ing\
    \ to the hypotheses collection (revise-hypothesis) — return apiFetch<RevisedHypothesis>(`/v1/cases/${encodeURIComponent(slug)}/hypotheses`,\
    \ {\n        method: \"POST\",\nsrc/hooks/use-new-draft-version-form.ts: held at the createMutation's\
    \ POST to /v1/cases, lines 130-134 — return apiFetch<CreatedDraft>(\"/v1/cases\", {\n        method:\
    \ \"POST\",\n        headers: { \"Content-Type\": \"application/json\" },\n        body: JSON.stringify(body),\n\
    \      });"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-hypothesis-revision-form.ts
  - src/hooks/use-new-draft-version-form.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at the version query's queryFn — apiFetch<CaseVersionRecord>(`/v1/cases/${encodeURIComponent(slug)}/versions/${version}`,)\n\
    src/hooks/use-hypothesis-revision-form.ts: held at versionQuery (read-case by slug+version) and revisionsQuery\
    \ (list-hypothesis-revisions) — apiFetch<CaseVersionSubject>(`/v1/cases/${encodeURIComponent(slug)}/versions/${version}`)\n\
    src/hooks/use-new-draft-version-form.ts: held at the sourceVersionQuery reading one specific version,\
    \ and redirectToExistingDraft listing versions, lines 60-67 and 96-101 — apiFetch<CaseVersionRecord>(\n\
    \        `/v1/cases/${encodeURIComponent(slug)}/versions/${latestReleasedVersionNumber}`,\n      ),\n\
    ...\nconst page = await apiFetch<CaseVersionsPage>(\n      `/v1/cases/${encodeURIComponent(slug)}/versions`,\n\
    \    );"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-hypothesis-revision-form.ts
  - src/hooks/use-new-draft-version-form.ts
- node: domain/glossary/action
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at actionOptions, read and exposed on the ready\
    \ state — const actionOptions = useGlossaryVocabularyOptions(\"action\");\nsrc/hooks/use-hypothesis-revision-form.ts:\
    \ held at actionOptions, sourced from the glossary vocabulary hook and passed through to the ready/success\
    \ state — const actionOptions = useGlossaryVocabularyOptions(\"action\");\nsrc/routes/hypothesis-revision-form-fields.tsx:\
    \ held at the \"Referral action\" field, lines 187-212 — name=\"resolution.referral.action\"\n   \
    \             options={actionOptions.options}"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/glossary/concept
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-hypothesis-revision-form.ts, src/routes/hypothesis-revision-form-fields.tsx,
    and src/hooks/use-edit-draft-version-form.ts read `nowhere` — manifest: record.manifest, — the manifest
    is only passed through opaquely; no concept is ever named directly by this file — a binding asserts
    the file answers for the node, so the pair that stopped holding it is released by `--bind ... --replace`,
    never restamped here'
  observed_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/glossary/outcome
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at outcomeOptions, read and exposed on the ready
    state — const outcomeOptions = useGlossaryVocabularyOptions("outcome");

    src/hooks/use-hypothesis-revision-form.ts: held at outcomeOptions, sourced from the glossary vocabulary
    hook — const outcomeOptions = useGlossaryVocabularyOptions("outcome");

    src/routes/hypothesis-revision-form-fields.tsx: held at the "Resolution outcome" field, lines 161-185
    — options={outcomeOptions.options}'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/glossary/recipient
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at recipientOptions, read and exposed on the ready
    state — const recipientOptions = useGlossaryVocabularyOptions("recipient");

    src/hooks/use-hypothesis-revision-form.ts: held at recipientOptions, sourced from the glossary vocabulary
    hook — const recipientOptions = useGlossaryVocabularyOptions("recipient");

    src/routes/hypothesis-revision-form-fields.tsx: held at the "Referral recipient" field, lines 214-239
    — options={recipientOptions.options}'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/glossary/subject-type
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at record.subject copied into the form and sent\
    \ back as the PATCH body's subject field — subject: record.subject,\nsrc/hooks/use-hypothesis-revision-form.ts:\
    \ held at subjectType, read from the case version's own record and used to filter concepts — const\
    \ subjectType = versionQuery.data.subject;\nsrc/hooks/use-new-draft-version-form.ts: held at the subjectValue\
    \ effect defaulting the form's subject field, lines 79-88 — const subjectValue = subjectOptions.options[0]?.value;\n\
    \  useEffect(() => {\n    if (\n      subjectValue !== undefined &&\n      hasLoadedVersions &&\n\
    \      latestReleasedVersionNumber === undefined\n    ) {\n      createForm.setValue(\"subject\",\
    \ subjectValue);\n    }\n  }, [subjectValue, hasLoadedVersions, latestReleasedVersionNumber]);\nsrc/routes/hypothesis-revision-form-fields.tsx:\
    \ held at the \"Subject type (from draft, fixed)\" field, lines 88-90 — <Input value={subjectType}\
    \ disabled readOnly />"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-hypothesis-revision-form.ts
  - src/hooks/use-new-draft-version-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/integration/capability
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-capability-detail.ts, src/hooks/use-capability-form.ts,
    src/routes/capability-create-screen.tsx, src/routes/capability-form-fields.tsx, and src/routes/capability-detail-screen.tsx
    read `nowhere` — the file''s ready branch renders `<CapabilityDetailReadyView state={state} />` and
    states nothing else; no attribute of the capability (nature, schemas, timeout, connector, concept)
    is declared in this file itself — a binding asserts the file answers for the node, so the pair that
    stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-capability-form.ts
  - src/routes/capability-create-screen.tsx
  - src/routes/capability-detail-screen.tsx
  - src/routes/capability-form-fields.tsx
- node: domain/integration/capability-nature
  conforms: true
  how: "src/routes/capability-form-fields.tsx: held at the Nature select's options, lines 28–31 — const\
    \ NATURE_OPTIONS: SelectOption[] = CAPABILITY_NATURES.map((nature) => ({\n  value: nature,\n  label:\
    \ nature,\n}));"
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: domain/integration/capability-registry
  conforms: true
  how: 'src/hooks/use-capability-form.ts: held at the same PUT call, the registry''s one register-capability
    write — apiFetch<Capability>(`/v1/capabilities/${encodeURIComponent(values.name)}/${encodeURIComponent(values.version)}`,
    { method: "PUT", ... })

    src/routes/capability-create-screen.tsx: held at nowhere in this file — `const state = useCapabilityForm(null,
    handleSaved);` — resolution and registration are the hook''s own operations, not this file''s'
  encoded_at:
  - src/hooks/use-capability-form.ts
  - src/routes/capability-create-screen.tsx
- node: domain/integration/connector-configuration
  conforms: false
  how: "the fact left part of its ground: still held in src/hooks/use-connector-configuration-detail.ts,\
    \ src/hooks/use-connector-configuration-form.ts, src/routes/connector-configuration-detail-ready-view.tsx,\
    \ and src/routes/connector-configuration-create-screen.tsx read `nowhere` — import type { ConnectorConfigurationFormValues\
    \ } from \"../services/connector-configuration-form-schema\"; — only the type is imported; the attributes\
    \ connector/configuration are not declared or validated in this file; src/routes/connector-configuration-detail-screen.tsx\
    \ read `nowhere` — const { connector } = useParams({ from: \"/connectors/$connector\" });\n  const\
    \ state = useConnectorConfigurationDetailView(connector); — a binding asserts the file answers for\
    \ the node, so the pair that stopped holding it is released by `--bind ... --replace`, never restamped\
    \ here"
  observed_at:
  - src/hooks/use-connector-configuration-detail.ts
  - src/hooks/use-connector-configuration-form.ts
  - src/routes/connector-configuration-create-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
  - src/routes/connector-configuration-detail-screen.tsx
- node: domain/integration/connector-configuration-registry
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-connector-configuration-form.ts,
    and src/routes/connector-configuration-create-screen.tsx read `nowhere` — const state = useConnectorConfigurationForm(null,
    handleSaved); — the replace-whole-on-edit registration logic is not present in this file — a binding
    asserts the file answers for the node, so the pair that stopped holding it is released by `--bind
    ... --replace`, never restamped here'
  observed_at:
  - src/hooks/use-connector-configuration-form.ts
  - src/routes/connector-configuration-create-screen.tsx
- node: domain/investigation/field-semantics
  conforms: false
  how: 'src/routes/capability-form-fields.tsx, the help paragraph beneath the Output schema field, lines
    183–186: Para cada campo em <code>properties</code>, a plataforma lê seu próprio{" "} <code>type</code>
    e <code>description</code> como o significado declarado desse campo — nenhum outro conteúdo deste
    schema é lido ou validado. — Which two attributes of a properties entry are read as a field''s declared
    meaning, and that nothing else in the output schema is read or validated, is domain/investigation/field-semantics''
    own statement; it now also lives, translated, as hardcoded copy inside this form component. If that
    node is ever amended — a third attribute read, or the "no other content" boundary narrowed or widened
    — nothing rebinds this paragraph, and every operator who opens this screen keeps being told the rule
    as it stood before the change.'
  observed_at:
  - src/routes/capability-form-fields.tsx
- node: domain/knowledge/case
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at the slug identity threaded through every call\
    \ — `/v1/cases/${encodeURIComponent(slug)}/versions/${version}`\nsrc/hooks/use-new-draft-version-form.ts:\
    \ held at the request body naming the case's own slug, lines 114-117 — const body: CreateDraftRequestBody\
    \ = {\n        slug,\n        authored_at: new Date().toISOString(),\nsrc/routes/case-version-editor-ready-view.tsx:\
    \ held at the `slug` prop, threaded to the manifest table and to the discard slug-confirmation control\
    \ — readonly slug: string;\n...\n<span>Type {slug} to confirm</span>"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-new-draft-version-form.ts
  - src/routes/case-version-editor-ready-view.tsx
- node: domain/knowledge/case-version
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at the attributes resetFormFrom copies from the\
    \ record read by versionQuery — form.reset({ title: record.title, when_to_use: record.when_to_use,\
    \ subject: record.subject, fallback: record.fallback, consolidation_register: record.consolidation_register,\
    \ });\nsrc/hooks/use-hypothesis-revision-form.ts: held at CaseVersionSubject, a narrowed local view\
    \ of the version's subject and manifest — type CaseVersionSubject = {\n  readonly subject: string;\n\
    \  readonly manifest: readonly ManifestEntryDto[];\n};\nsrc/hooks/use-new-draft-version-form.ts: held\
    \ at the CreateDraftRequestBody type and its construction, lines 23-32 and 113-129 (see finding on\
    \ the consolidation_register conditioning) — type CreateDraftRequestBody = {\n  readonly slug: string;\n\
    \  readonly title: string;\n  readonly when_to_use: string;\n  readonly authored_at: string;\n  readonly\
    \ subject: string;\n  readonly fallback: CaseVersionFormValues[\"fallback\"];\n  readonly consolidation_register?:\
    \ CaseVersionFormValues[\"consolidation_register\"];\n  readonly source_version?: number;\n};\nsrc/routes/case-version-editor-ready-view.tsx:\
    \ held at release.version stated in the release dialog title, and state.manifest passed to the manifest\
    \ table — <DialogTitle>Release v{release.version}?</DialogTitle>\nsrc/routes/hypothesis-revision-form-fields.tsx:\
    \ held at the same subjectType field, lines 88-90, surfacing the version's own declared subject read-only\
    \ — <Input value={subjectType} disabled readOnly />\nsrc/routes/hypothesis-revision-screen.tsx: held\
    \ at the `version: number` prop declared on HypothesisRevisionScreenProps and used to identify the\
    \ case's draft version whose subject type is forwarded — readonly version: number;"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-hypothesis-revision-form.ts
  - src/hooks/use-new-draft-version-form.ts
  - src/routes/case-version-editor-ready-view.tsx
  - src/routes/hypothesis-revision-form-fields.tsx
  - src/routes/hypothesis-revision-screen.tsx
- node: domain/knowledge/case-version-state
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at the draft/released comparisons gating release,
    discard and read-only — const canRelease = record.state === "draft" && !isReleased;

    src/hooks/use-new-draft-version-form.ts: held at the literal "released"/"draft" comparisons, lines
    53 and 101 — .filter((item) => item.state === "released")

    ...

    const existingDraft = page.data.find((item) => item.state === "draft");'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-new-draft-version-form.ts
- node: domain/knowledge/consolidation-register
  conforms: true
  how: "src/hooks/use-new-draft-version-form.ts: held at the conditional consolidation_register field\
    \ in the request body, lines 123-128 (see finding) — consolidation_register: values.consolidation_register,\n\
    \            source_version: latestReleasedVersionNumber,"
  encoded_at:
  - src/hooks/use-new-draft-version-form.ts
- node: domain/knowledge/hypothesis
  conforms: true
  how: "src/hooks/use-hypothesis-revision-form.ts: held at hypothesisNameEditable, which locks the name\
    \ once an existing identity is being revised — hypothesisNameEditable: hypothesisName === null,\n\
    src/routes/hypothesis-revision-form-fields.tsx: held at the \"Hypothesis name\" field, lines 80-85\
    \ — {...register(\"hypothesis_name\")}\n            disabled={!hypothesisNameEditable || isSubmitting}"
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: "src/hooks/use-hypothesis-revision-form.ts: held at HypothesisRevisionListItem, and the useEffect\
    \ seeding the form from the latest revision's own record — form.reset({\n      hypothesis_name: hypothesisName,\n\
    \      criterion: latest.criterion,\n      collects: [...latest.collects],\n      resolution: latest.resolution,\n\
    \    });\nsrc/routes/hypothesis-revision-form-fields.tsx: held at the criterion, collects and resolution\
    \ fields together, lines 93-240 — {...register(\"criterion\")}"
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/knowledge/manifest-entry
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at record.manifest passed to the release condition\
    \ and exposed on the ready state — manifest: record.manifest,\nsrc/hooks/use-hypothesis-revision-form.ts:\
    \ held at ManifestEntryDto, and pinnedRevisionFor reading the entry's own reference — const entry\
    \ = manifest.find(\n    (item) => item.hypothesis_revision.hypothesis.name === hypothesisName,\n \
    \ );\n  return entry === undefined ? null : entry.hypothesis_revision.revision;\nsrc/routes/case-version-editor-ready-view.tsx:\
    \ held at toManifestRow, mapping each entry's position and its pinned hypothesis-revision — position:\
    \ entry.position,\n    hypothesis: entry.hypothesis_revision.hypothesis.name,\n    revision: entry.hypothesis_revision.revision,"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/case-version-editor-ready-view.tsx
- node: domain/knowledge/referral
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at carried inside the fallback object reset onto
    the form — fallback: record.fallback,

    src/hooks/use-new-draft-version-form.ts: held at the form''s default fallback.referral value, lines
    74-76 — fallback: { outcome: "", referral: { action: "", recipient: "" } },

    src/routes/hypothesis-revision-form-fields.tsx: held at the nested resolution.referral.action and
    resolution.referral.recipient fields, lines 187-239 — name="resolution.referral.action"'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-new-draft-version-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/knowledge/resolution
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at the fallback field, reset and submitted as a
    whole — fallback: record.fallback,

    src/hooks/use-new-draft-version-form.ts: held at the form''s default fallback value pairing outcome
    with referral, lines 74-76 — fallback: { outcome: "", referral: { action: "", recipient: "" } },

    src/routes/hypothesis-revision-form-fields.tsx: held at the grouping of resolution.outcome with resolution.referral.*,
    lines 160-240 — name="resolution.outcome"'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-new-draft-version-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
- node: rules/glossary/a-description-states-meaning-never-policy
  conforms: false
  how: 'src/routes/capability-form-fields.tsx, the same help paragraph, lines 186–190: Uma description
    declara o que um valor significa (&quot;2 = suspenso por inadimplência&quot;), nunca uma decisão (&quot;quando
    2, confirme a hipótese&quot;). — rules/glossary/a-description-states-meaning-never-policy states this
    same distinction with this same worked example ("2 = suspended for delinquency" / "when 2, confirm
    the financial-block hypothesis"); the component now carries a translated copy of both the policy and
    its example. A later change to the node''s own wording or example leaves this paragraph exactly as
    it is, so the two can read apart from the day the node is next edited, with the UI still teaching
    the retired version.'
  observed_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/a-capability-declares-its-contract
  conforms: false
  how: 'src/hooks/use-capability-form.ts, the SAVE_FAILURE_MESSAGE_BY_KIND map, "incomplete-capability-contract"
    entry (lines 40-41): "This capability does not declare its contract completely; every field of its
    contract is required." — The rule this message stands for carves timeout out of what a registration
    must declare — "a registration that states no timeout takes the default of sixty seconds" — so an
    IncompleteCapabilityContractError is never about a missing timeout. Telling the operator "every field
    of its contract is required" states the opposite of that carve-out for the one condition this message
    is shown to explain, and an operator reading it has no way to learn from this surface that timeout
    is the one field they may leave blank.'
  observed_at:
  - src/hooks/use-capability-form.ts
- node: rules/integration/a-capability-declares-well-formed-schemas
  conforms: true
  how: "src/hooks/use-capability-detail.ts: held at the submit guard and the schema-validity state — if\
    \ (!inputSchemaValid || !outputSchemaValid) {\n      return;\n    }\nsrc/hooks/use-capability-form.ts:\
    \ held at the SAVE_FAILURE_MESSAGE_BY_KIND \"capability-schema-not-well-formed\" entry — \"capability-schema-not-well-formed\"\
    : \"The input schema or the output schema is not syntactically valid JSON.\",\nsrc/routes/capability-detail-ready-view.tsx:\
    \ held at the two schema-validity warning blocks, lines 34-43 — {!state.inputSchema.isValid && (\n\
    \  <p role=\"alert\" className=\"text-sm text-destructive\">\n    {INVALID_INPUT_SCHEMA_WARNING}\n\
    \  </p>\n)}\nsrc/routes/capability-form-fields.tsx: held at the isSaveDisabled expression, line 81–82\
    \ — isSubmitting || !inputSchema.isValid || !outputSchema.isValid || isDirty === false;"
  encoded_at:
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-capability-form.ts
  - src/routes/capability-detail-ready-view.tsx
  - src/routes/capability-form-fields.tsx
- node: rules/integration/a-capability-is-read-only
  conforms: false
  how: "src/routes/capability-detail-screen-outcome.spec.ts, the PUT handler stub for CAPABILITY_PATH,\
    \ lines 26-28: method === \"PUT\"\n            ? errorResponse(\"CapabilityNotReadOnlyError\", 409)\
    \ — A reader treating this fixture as a working example of the registry's own read-only refusal learns\
    \ that CapabilityNotReadOnlyError answers with HTTP 409; the decision log fixes this refusal at HTTP\
    \ 422 (rules/integration/a-capability-is-read-only, and decision-log.md's own split — 422 for \"a\
    \ well-formed request whose content would violate an invariant,\" 409 reserved for \"an operation\
    \ the target's current standing forbids\"). Anyone building a mock server, a contract test, or a status-map\
    \ change against this file's own fixture would embed the wrong status for this exact refusal."
  observed_at:
  - src/hooks/use-capability-form.ts
  - src/routes/capability-form-fields.tsx
- node: rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed
  conforms: false
  how: "src/hooks/use-capability-detail.ts, the phase-selection guards, lines 121-132: if (query.isError\
    \ || isConceptsError) {\n    return {\n      phase: \"load-error\",\n      retryLoad: () => {\n  \
    \      void query.refetch();\n        conceptOptions.refetch();\n      },\n    };\n  }\n  if (query.isLoading\
    \ || isLoadingConcepts || !query.data) {\n    return { phase: \"loading\" };\n  } — A capability read\
    \ that has already answered — successfully — is still shown as \"could not be read\" (or \"still being\
    \ read\") whenever the unrelated concept-options list is the one that failed or has not yet answered,\
    \ since both conditions are folded into the same two phases as the capability's own read state. The\
    \ operator reading this screen cannot tell a capability that loaded fine but whose concept picklist\
    \ failed from a capability whose own identity-keyed read failed, even though the rule requires the\
    \ three presentations to be distinguishable and none of them presented as another."
  observed_at:
  - src/routes/capability-detail-screen.tsx
- node: rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering
  conforms: false
  how: "src/routes/connector-configuration-detail-ready-view.tsx, the Cancel control, lines 88-90: <Button\
    \ variant=\"secondary\" asChild>\n        <Link to=\"/connectors\">Cancel</Link>\n      </Button>\
    \ — An operator who reached this authoring surface from anywhere other than the connectors listing\
    \ — for instance immediately after a successful registration, which a-successful-connector-registration-lands-on-the-configurations-own-surface\
    \ lands them on this very surface for — is sent to the fixed /connectors listing rather than back\
    \ to where they came from, losing the place they were working from with no way back except constructing\
    \ the address themselves."
  observed_at:
  - src/routes/connector-configuration-create-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: false
  how: "src/hooks/use-connector-configuration-detail.ts, isValidConfigurationObject, lines 15-22: function\
    \ isValidConfigurationObject(text: string): boolean {\n  const minified = getJsonTextareaMinifiedValue(text);\n\
    \  if (minified === null) {\n    return false;\n  }\n  const parsed: unknown = JSON.parse(minified);\n\
    \  return typeof parsed === \"object\" && parsed !== null && !Array.isArray(parsed);\n}\n — The object/null/array\
    \ distinction that defines a well-formed connector configuration — the substance rules/integration/a-connector-configuration-holds-a-well-formed-object\
    \ states for the registry's own refusal — is hand-encoded here as a client-side gate that decides\
    \ whether the operator may even submit. If the specification's definition of well-formed ever moves\
    \ (what counts as an object, whether null or an array is ever admitted), nothing forces this predicate\
    \ to move with it: the client would go on admitting or blocking submissions on a criterion the node\
    \ no longer states, silently diverging from the registry it is supposed to pre-empt.\nsrc/hooks/use-connector-configuration-form.ts,\
    \ `isValidConfigurationObject` (lines 15-22) and the `configurationValid` gate inside `submit` (lines\
    \ 96-102): return typeof parsed === \"object\" && parsed !== null && !Array.isArray(parsed); — the\
    \ registry's own definition of a well-formed connector configuration — an object, never null, never\
    \ an array — is re-derived here as the frontend's own authoritative gate before the registry ever\
    \ sees the value; if the registry's own definition of well-formed ever moves (say, to accept an array),\
    \ nothing here follows it, and this gate keeps refusing what the registry would now accept, with no\
    \ single place left to read the current definition from"
  observed_at:
  - src/hooks/use-connector-configuration-detail.ts
  - src/hooks/use-connector-configuration-form.ts
  - src/routes/connector-configuration-detail-ready-view.tsx
  - src/routes/connector-configuration-form-fields.tsx
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  conforms: true
  how: 'src/routes/connector-configuration-detail-ready-view.tsx: held at the ConnectorTestPanel''s configurationText
    prop, fed from the registered text rather than the live edited form — configurationText={state.registeredConfigurationText}'
  encoded_at:
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing
  conforms: false
  how: "src/routes/connector-configuration-create-screen.spec.ts, describe title, line 91: \"ConnectorConfigurationCreateScreen\
    \ -- the footer Cancel link registers nothing before it navigates (UNDERDETERMINED note: a-connector-configuration-surface-offers-a-route-to-the-listing\
    \ leaves open whether the route submits before landing on the listing)\" — A reader trusting this\
    \ note believes the specification leaves the submit-then-navigate ordering of the Cancel route undetermined,\
    \ when the node it names already forecloses it in full — \"Following that route from s issues no register-connector\
    \ call and leaves every registered connector configuration exactly as it stood\" is unconditional,\
    \ not partial. A later change made on the strength of this comment could reintroduce a register-connector\
    \ call ahead of navigation, believing an open question is being resolved rather than a settled one\
    \ being broken.\nsrc/routes/connector-configuration-detail-screen.tsx, the ready-state return (lines\
    \ 41-46), the branch taken once the read has answered: return (\n    <section className=\"flex flex-col\
    \ gap-4\">\n      <h1 className=\"text-lg font-semibold text-foreground\">Connector {connector}</h1>\n\
    \      <ConnectorConfigurationDetailReadyView state={state} connector={connector} />\n    </section>\n\
    \  ); — The node requires the route to the listing on every reading of the surface, turning on nothing\
    \ about whether the read has completed, failed or answered no configuration — yet the loading branch\
    \ (line 18) and the load-error branch (line 34) each carry a `<Link to=\"/connectors\">Cancel</Link>`\
    \ inside a `ButtonFooter`, and this ready branch, the one an operator reaches on a successful read,\
    \ carries none. `connector-configuration-detail-ready-view.tsx` is not among the files the trace binds\
    \ this node to, so the responsibility for this reading is this file's own. An operator who opens a\
    \ configuration successfully is left with no stated way back to the listing, unlike the same operator\
    \ on either of the surface's other two readings."
  observed_at:
  - src/routes/connector-configuration-create-screen.tsx
  - src/routes/connector-configuration-detail-screen.tsx
- node: rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
  conforms: false
  how: 'src/routes/connector-configuration-create-screen.spec.ts, describe title, line 116: "ConnectorConfigurationCreateScreen
    -- carries no discard control (UNDERDETERMINED note: no criterion distinguishes which controls the
    shared footer carries on the create screen)" — A reader trusting this note believes the specification
    leaves open whether the create screen''s shared footer carries a "Discard changes" control, when the
    node governing that exact act already forecloses it for this surface — "d is offered on no surface
    authoring a registration at an identity nothing is currently registered at ... those surfaces holding
    no read registration for d to return the fields to." A future edit could add the control back to the
    create screen believing it fills an undecided gap rather than violates a settled exclusion.'
  observed_at:
  - src/routes/connector-configuration-create-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read
  conforms: false
  how: 'src/routes/connector-configuration-detail-screen.tsx, the loading branch, line 15: <p>Loading
    connector configuration {connector}…</p> — The node''s expression states that while the read has not
    returned the screen "states no value of connector or configuration" — the sibling capability rule
    (`a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed`) explicitly permits an
    outstanding-read message to name the identity being read ("the capability at (n, v) is still being
    read"), but this node''s own text carries no equivalent allowance and instead states the prohibition
    flatly. Here the connector''s own name — one of exactly two attributes `domain/integration/connector-configuration`
    declares — is asserted in the loading message before the registry has answered whether any configuration
    is registered under it at all, which is exactly the value this window is stated to withhold.'
  observed_at:
  - src/routes/connector-configuration-detail-screen.tsx
- node: rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing
  conforms: true
  how: 'src/routes/capability-create-screen.tsx: held at the `Cancel` link rendered in every phase — loading
    (line 35), load-error (line 48) and ready (line 64) — <Link to="/capabilities">Cancel</Link>

    src/routes/capability-detail-screen.tsx: held at the `<Link to="/capabilities">Cancel</Link>` control
    inside `ButtonFooter` in the loading and load-error branches — `<Link to="/capabilities">Cancel</Link>`
    appears in both the loading return (line 20) and the load-error return (line 36)'
  encoded_at:
  - src/routes/capability-create-screen.tsx
  - src/routes/capability-detail-screen.tsx
- node: rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
  conforms: false
  how: "src/hooks/use-connector-configuration-form.ts, `SAVE_FAILURE_MESSAGE_BY_KIND` (lines 42-45) and\
    \ `saveFailureMessage` (lines 47-53): const SAVE_FAILURE_MESSAGE_BY_KIND: Partial<Record<UiErrorStateKind,\
    \ string>> = {\n  \"connector-configuration-not-well-formed\":\n    \"This configuration is not syntactically\
    \ valid JSON.\",\n}; — `rules/integration/a-connector-configuration-holds-a-well-formed-object` (also\
    \ this file's own node) names two distinct refusal conditions for this same registration — a configuration\
    \ that is not well-formed JSON object text, and one that is entirely absent or of the wrong shape\
    \ (`IncompleteConnectorConfigurationError`) — but only the first gets its own message; an operator\
    \ refused for the second falls through `saveFailureMessage` to `GENERIC_SAVE_FAILURE_MESSAGE`, the\
    \ exact same text shown for a refusal this surface does not recognise at all, so the two named conditions\
    \ the operator-facing rule requires be told apart read alike here\nsrc/routes/connector-configuration-detail-ready-view.tsx,\
    \ the justSaved status message, lines 82-87: {state.justSaved && (\n\n        <p role=\"status\" className=\"\
    text-sm text-foreground\">\n          Saved.\n        </p>\n      )} — An operator who just submitted\
    \ a replacement registration is told only \"Saved.\" — nothing here names the connector name that\
    \ now stands registered, and this file states no distinguishable message for a refused submission\
    \ at all, so an operator relying on this surface cannot tell what was registered nor, on a failure,\
    \ which condition answered it; they would have to reload or reread the registry to be sure the write\
    \ they intended is the write that happened."
  observed_at:
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-capability-form.ts
  - src/hooks/use-connector-configuration-detail.ts
  - src/hooks/use-connector-configuration-form.ts
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: rules/integration/a-successful-connector-registration-lands-on-the-configurations-own-surface
  conforms: true
  how: "src/hooks/use-connector-configuration-detail.ts: held at the mutation's onSuccess handler, lines\
    \ 83-90 — it issues no navigation, which is consistent with this hook already presenting the surface\
    \ addressed by the connector's own name — onSuccess: () => {\n  form.reset({ connector });\n  setConfigurationBaseline(configurationValue);\n\
    \  void queryClient.invalidateQueries({ queryKey: [\"connector-configurations\"] });\n  void queryClient.invalidateQueries({\
    \ queryKey: [\"connector-configuration\", connector] });\n},\n\nsrc/routes/connector-configuration-create-screen.tsx:\
    \ held at handleSaved, lines 14-17 — void navigate({ to: \"/connectors/$connector\", params: { connector\
    \ } });"
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  - src/routes/connector-configuration-create-screen.tsx
- node: rules/integration/an-abandoned-capability-registration-entry-registers-nothing
  conforms: false
  how: 'src/routes/capability-create-screen-actions.spec.ts, the second `it` block, lines 30-44 (`navigates
    to the capabilities listing when Cancel is clicked, issuing no PUT`): await waitFor(() => expect(router.state.location.pathname).toBe("/capabilities"));
    — rules/integration/an-abandoned-capability-registration-entry-registers-nothing requires the abandoned
    entry''s operator to land on "the surface the authoring entry was reached from" and says explicitly
    that landing on the listing instead "would be wrong on exactly the readings that matter" for an operator
    who reached the create screen from anywhere other than the listing — the decision log even records
    an earlier draft of this same rule that fixed the destination to the listing being replaced for exactly
    that reason. This test locks the suite''s certification of Cancel''s abandonment behavior to a fixed
    "/capabilities" pathname regardless of origin, so a reader trusting the suite to enforce the specification''s
    return-to-origin rule finds instead a green test for the destination the specification''s own history
    already rejected.

    src/routes/capability-create-screen.tsx, the three `Cancel` links (loading phase line 35, load-error
    phase line 48, ready phase line 64): <Link to="/capabilities">Cancel</Link> — an operator who opened
    this create screen from anywhere other than the capabilities listing — a capability''s own detail
    surface, say, once such a link exists, or a direct navigation — is sent to the listing on Cancel rather
    than back to where they came from; the decision log records this exact value (returning to the listing)
    as an earlier reading of this same node that was replaced because it privileged the listing over the
    reached-from surface, and the code reintroduces precisely that replaced value with no way to recover
    the original surface.'
  observed_at:
  - src/routes/capability-create-screen.tsx
  - src/routes/capability-detail-ready-view.tsx
- node: rules/integration/one-capability-answers-one-concept
  conforms: false
  how: "the fact left part of its ground: still held in src/hooks/use-capability-form.ts, and src/routes/capability-form-fields.tsx\
    \ read `nowhere` — <Select\n  value={field.value}\n  onChange={field.onChange}\n  onBlur={field.onBlur}\n\
    \  options={conceptSelectOptions}\n  disabled={isSubmitting}\n  placeholder=\"Select a concept\" —\
    \ a binding asserts the file answers for the node, so the pair that stopped holding it is released\
    \ by `--bind ... --replace`, never restamped here"
  observed_at:
  - src/hooks/use-capability-form.ts
  - src/routes/capability-form-fields.tsx
- node: rules/knowledge/a-case-has-at-least-one-hypothesis
  conforms: false
  how: 'no named file holds this fact now: src/hooks/use-edit-draft-version-form.ts read `nowhere` — manifest:
    record.manifest, — the manifest is only read and passed through; the file carries no place-hypothesis
    or remove-hypothesis call and no check against an emptied manifest'
  observed_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: rules/knowledge/a-case-has-at-most-one-draft
  conforms: true
  how: "src/hooks/use-new-draft-version-form.ts: held at the onError branch reacting to the case-already-has-draft\
    \ outcome, lines 142-149 — const kind = errorStateKind(error);\n      if (kind === \"case-already-has-draft\"\
    ) {\n        toast.error(`A draft already exists for the case \"${slug}\".`);\n        void redirectToExistingDraft();\n\
    \        return;\n      }"
  encoded_at:
  - src/hooks/use-new-draft-version-form.ts
- node: rules/knowledge/a-case-version-is-written-once
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at isBlocked and isReadOnly, computed off record.state\
    \ — isBlocked: status === \"saving\" || status === \"conflict\" || record.state === \"released\" ||\
    \ isReleased, ... isReadOnly: record.state === \"released\",\nsrc/routes/case-version-editor-ready-view.tsx:\
    \ held at isReadOnly gating the editable form and hiding the Save button, plus the release dialog's\
    \ disclosure — {!isReadOnly && (\n          <Button\n            type=\"submit\"\n            form={CASE_VERSION_EDITOR_FORM_ID}\n\
    \            disabled={state.isBlocked || state.status === \"clean\"}\n          >\n            Save\
    \ changes\n          </Button>\n        )}"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/case-version-editor-ready-view.tsx
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at the case-version-not-draft and case-version-not-draft-at-release
    branches of the two mutations'' onError — if (kind === "case-version-not-draft") { setStatus("conflict");
    ... } ... if (kind === "case-version-not-draft-at-release") { setIsReleaseDialogOpen(false); setReleaseViolations(null);
    ... }'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-hypothesis-revision-form.ts, and
    src/hooks/use-edit-draft-version-form.ts read `nowhere` — the onError branches name only "case-version-not-draft",
    "case-not-found", "case-version-not-releasable" and "case-version-not-draft-at-release"; the file
    never requests a hypothesis-revision, so no concept-subject-type refusal is ever read here — a binding
    asserts the file answers for the node, so the pair that stopped holding it is released by `--bind
    ... --replace`, never restamped here'
  observed_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-hypothesis-revision-form.ts
- node: rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at the loading guard before the record is read,\
    \ and resetFormFrom sourcing every field from it — if (versionQuery.isLoading || isLoadingGlossary\
    \ || !versionQuery.data) { return { phase: \"loading\" }; }\nsrc/hooks/use-hypothesis-revision-form.ts:\
    \ held at the \"loading\" phase branch, gating all content on the record having arrived — if (versionQuery.isLoading\
    \ || !versionQuery.data || isLoadingGlossary || isRevisionsPending) {\n    return { phase: \"loading\"\
    \ };\n  }\nsrc/hooks/use-new-draft-version-form.ts: held at the `if (created) return editState` branch,\
    \ lines 155-159 — const editState = useEditDraftVersionForm(slug, created?.version ?? null);\n\n \
    \ if (created) {\n    return editState;\n  }\nsrc/routes/hypothesis-revision-screen.tsx: held at the\
    \ `loading` and `load-error` branches, which present no case-version attribute at all before an answer\
    \ has arrived or where none ever will — if (state.phase === \"loading\") {\n    return <p>Loading…</p>;\n\
    \  }"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-hypothesis-revision-form.ts
  - src/hooks/use-new-draft-version-form.ts
  - src/routes/hypothesis-revision-screen.tsx
- node: rules/knowledge/a-hypothesis-is-manifested-at-most-once-in-a-case-version
  conforms: true
  how: "src/hooks/use-hypothesis-revision-form.ts: held at pinnedRevisionFor's single .find() over the\
    \ manifest — manifest.find(\n    (item) => item.hypothesis_revision.hypothesis.name === hypothesisName,\n\
    \  )"
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: true
  how: 'src/hooks/use-hypothesis-revision-form.ts: held at the revise body, carrying the draft version''s
    own subject rather than any curator-supplied value — subject: versionQuery.data.subject,'
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown
  conforms: true
  how: 'src/hooks/use-hypothesis-revision-form.ts: held at pinnedRevision, read from the version''s own
    manifest entry rather than from the revisions listing — pinnedRevision: pinnedRevisionFor(versionQuery.data.manifest,
    hypothesisName),'
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
  conforms: false
  how: "src/hooks/use-new-draft-version-form.ts, the useEffect syncing the create form from the source-version\
    \ query, lines 90-94: useEffect(() => {\n    if (sourceVersionQuery.data) {\n      resetFormFrom(createForm,\
    \ sourceVersionQuery.data);\n    }\n  }, [sourceVersionQuery.data]); — rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version\
    \ names one starting move for a new draft — copying its manifest — and its own description calls creating\
    \ a draft \"never a second decision about what the draft starts holding.\" Here a curator opening\
    \ the create form for a case that already holds a released version finds title, when-to-use, subject,\
    \ fallback and even the consolidation register already filled in with that released version's own\
    \ content before they have touched anything. Nothing in the node, or anywhere else in the specification,\
    \ says a new draft's own declared attributes begin as a copy of a prior version — only its manifest\
    \ does — so a reader who checks that node to learn what a new draft starts holding learns about the\
    \ manifest alone and has no way to learn the rest of the form arrives pre-written too."
  observed_at:
  - src/hooks/use-new-draft-version-form.ts
- node: rules/knowledge/a-newly-created-draft-offers-no-act-before-its-own-record-arrives
  conforms: true
  how: "src/hooks/use-new-draft-version-form.ts: held at the same `if (created) return editState` delegation,\
    \ lines 155-159 — const editState = useEditDraftVersionForm(slug, created?.version ?? null);\n\n \
    \ if (created) {\n    return editState;\n  }"
  encoded_at:
  - src/hooks/use-new-draft-version-form.ts
- node: rules/knowledge/a-presented-manifest-entry-states-its-pinned-revisions-state
  conforms: false
  how: "src/hooks/use-manifest-pinned-revision-states.ts, `hasReadableHypothesisName` and the `readableEntries`\
    \ filter it drives, lines 12-14 and 20-49: function hasReadableHypothesisName(entry: CaseVersionManifestEntry):\
    \ boolean {\n  return typeof entry.hypothesis_revision?.hypothesis?.name === \"string\";\n}\n...\n\
    const readableEntries = manifest.filter(hasReadableHypothesisName);\n...\nreadableEntries.forEach((entry,\
    \ index) => {\n  states.set(\n    entry.position,\n    pinnedRevisionStateOf(...),\n  );\n});\nreturn\
    \ states;\n — A manifest entry whose `hypothesis_revision.hypothesis.name` does not read back as a\
    \ string never gets an entry in the returned map at all — no `pending`, no `failed`, no `resolved`\
    \ — so whatever renders the manifest keyed off this map shows that entry with nothing, which is exactly\
    \ the blank the node refuses (\"none of them is the presentation of an entry that carries no state\"\
    ). The next reader who wants to know what governs an entry with an unreadable hypothesis reference\
    \ will look in the specification and find no such carve-out."
  observed_at:
  - src/hooks/use-manifest-pinned-revision-states.ts
  - src/routes/case-version-editor-ready-view.tsx
- node: rules/knowledge/a-release-refusal-with-no-named-violation-says-so
  conforms: true
  how: "src/routes/case-version-editor-ready-view.tsx: held at the empty-violations branch of the release\
    \ dialog's alert — <p className=\"text-sm text-destructive\">\n                      No specific violation\
    \ was returned.\n                    </p>"
  encoded_at:
  - src/routes/case-version-editor-ready-view.tsx
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-edit-draft-version-form.ts, src/routes/case-version-editor-ready-view.tsx,
    src/services/release-checklist.ts, and src/hooks/use-manifest-pinned-revision-states.ts read `nowhere`
    — The hook only builds `ManifestPinnedRevisionStates`, a map from position to a read result (`pending`/`failed`/`resolved`);
    it issues no release call and states no refusal — `return states;` is the whole of what the function
    does. — a binding asserts the file answers for the node, so the pair that stopped holding it is released
    by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-manifest-pinned-revision-states.ts
  - src/routes/case-version-editor-ready-view.tsx
  - src/services/release-checklist.ts
- node: rules/knowledge/a-revise-answers-the-revision-number-it-saved
  conforms: true
  how: 'src/routes/hypothesis-revision-screen.tsx: held at the success-phase message — Hypothesis &quot;{state.hypothesisName}&quot;
    saved as revision {state.revision}.'
  encoded_at:
  - src/routes/hypothesis-revision-screen.tsx
- node: rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move
  conforms: true
  how: "src/hooks/use-hypothesis-revision-form.ts: held at offerManifestBuilder in the success phase —\
    \ offerManifestBuilder: pinnedBeforeSave === null || revision > pinnedBeforeSave,\nsrc/routes/hypothesis-revision-screen.tsx:\
    \ held at the conditionally rendered \"Open Manifest Builder\" button in the success phase — {state.offerManifestBuilder\
    \ && (\n          <Button type=\"button\" onClick={state.onOpenManifestBuilder}>\n            Open\
    \ Manifest Builder\n          </Button>\n        )}"
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-screen.tsx
- node: rules/knowledge/a-surface-offering-release-states-which-release-conditions-the-draft-meets
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at the conditions array handed to the release control\
    \ state — conditions: [releaseCondition],\nsrc/routes/case-version-editor-ready-view.tsx: held at\
    \ the release-conditions section listing each condition's met/unmet/undecided label — {release.conditions.map((condition)\
    \ => (\n              <li key={condition.label}>\n                {RELEASE_CONDITION_STATUS_LABEL[condition.status]}:\
    \ {condition.label}\n              </li>\n            ))}\nsrc/services/release-checklist.ts: held\
    \ at the ReleaseConditionStatus type (line 5) and the status computation in manifestPinReleaseCondition,\
    \ lines 47-51 — const status: ReleaseConditionStatus = hasUnreleasedEntry\n    ? \"unmet\"\n    :\
    \ hasUnreadEntry\n      ? \"undecided\"\n      : \"met\";"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/case-version-editor-ready-view.tsx
  - src/services/release-checklist.ts
- node: rules/knowledge/an-abandoned-case-version-edit-writes-nothing
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at cancelEditing, wired as onCancel — const cancelEditing\
    \ = (): void => { router.history.back(); };\nsrc/hooks/use-new-draft-version-form.ts: held at the\
    \ onCancel handler, lines 219-221 — onCancel: () => {\n        router.history.back();\n      },\n\
    src/routes/case-version-editor-ready-view.tsx: held at the unconditional Cancel control at the end\
    \ of the footer — <Button type=\"button\" variant=\"secondary\" onClick={state.onCancel}>\n      \
    \    Cancel\n        </Button>"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-new-draft-version-form.ts
  - src/routes/case-version-editor-ready-view.tsx
- node: rules/knowledge/an-abandoned-revision-composition-writes-nothing
  conforms: true
  how: "src/hooks/use-hypothesis-revision-form.ts: held at cancelComposition, wired to onCancel, returning\
    \ the curator without writing anything — const cancelComposition = (): void => {\n    router.history.back();\n\
    \  };\nsrc/routes/hypothesis-revision-form-fields.tsx: held at the trailingActions slot rendered in\
    \ ButtonFooter, line 246 — {trailingActions}\nsrc/routes/hypothesis-revision-screen.tsx: held at the\
    \ Cancel control in trailingActions, offered for as long as the composition has not been submitted\
    \ — <Button type=\"button\" variant=\"secondary\" onClick={state.onCancel}>\n            Cancel\n\
    \          </Button>"
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
  - src/routes/hypothesis-revision-screen.tsx
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at the three glossary-vocabulary option reads offered\
    \ alongside the form — outcomeOptions,\n    actionOptions,\n    recipientOptions,\nsrc/hooks/use-hypothesis-revision-form.ts:\
    \ held at the glossary-sourced option hooks (concept/outcome/action/recipient) offered to the curator\
    \ to choose from — const conceptOptions = useConceptOptions();\n  const outcomeOptions = useGlossaryVocabularyOptions(\"\
    outcome\");\nsrc/routes/hypothesis-revision-form-fields.tsx: held at the Select and Checkbox controls,\
    \ which offer only the vocabulary supplied through props rather than free text, lines 130-239 — options={outcomeOptions.options}"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
- node: rules/knowledge/every-position-declares-a-resolution
  conforms: true
  how: 'src/routes/hypothesis-revision-form-fields.tsx: held at the resolution.outcome, resolution.referral.action
    and resolution.referral.recipient fields rendered unconditionally, lines 160-240 — name="resolution.referral.recipient"'
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: rules/knowledge/only-a-draft-case-version-may-be-discarded
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at canDiscard passed into buildDiscardControlState
    — canDiscard: record.state === "draft" && !isReleased,'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: rules/knowledge/releasing-or-discarding-a-draft-case-version-takes-a-further-explicit-act
  conforms: true
  how: "src/routes/case-version-editor-ready-view.tsx: held at the Release dialog (statement-only confirm)\
    \ and the Discard dialog (slug-reproduction confirm) — <Button type=\"button\" loading={release.isConfirming}\
    \ onClick={release.onConfirm}>\n                  Release\n                </Button>\n...\n<Input\n\
    \                    value={discard.slugConfirmation}\n                    onChange={(event) => discard.onSlugConfirmationChange(event.target.value)}"
  encoded_at:
  - src/routes/case-version-editor-ready-view.tsx
- node: scenarios/knowledge/a-release-is-refused-for-manifested-draft-hypothesis-revisions
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at the case-version-not-releasable branch of releaseMutation's\
    \ onError — if (kind === \"case-version-not-releasable\") { setReleaseViolations(extractReleaseViolations(error));\
    \ return; }\nsrc/routes/case-version-editor-ready-view.tsx: held at the same named-violations list\
    \ shown on a refused release — {release.violations.map((violation) => (\n                        <li\
    \ key={violation}>! {violation}</li>\n                      ))}"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/case-version-editor-ready-view.tsx
unstated:
- file: src/hooks/use-new-draft-version-form.ts
  where: the createMutation request-body construction, lines 113-129
  evidence: "...(latestReleasedVersionNumber !== undefined\n          ? {\n              consolidation_register:\
    \ values.consolidation_register,\n              source_version: latestReleasedVersionNumber,\n   \
    \         }\n          : {}),"
  cost: domain/knowledge/case-version declares consolidation_register as an attribute a case version may
    carry, with no stated condition on when it may be authored, and the decision log records it as "not
    required" full stop. Here, a curator authoring a case's very first version — the one case a-new-drafts-manifest-is-copied-from-an-existing-version
    names no source for — has any consolidation register they chose on the form silently dropped before
    the request is sent, with nothing telling them so. A reader of domain/knowledge/case-version or domain/knowledge/consolidation-register
    finds no rule tying this attribute's presence to a prior released version existing.
- file: src/routes/capability-create-screen-outcome.spec.ts
  where: the second `it` block, lines 58-61 (the `waitFor` on the Save button's `disabled` attribute)
  evidence: 'expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true)'
  cost: the requirement that the Save control disables while a capability registration is in flight lives
    only in this assertion; a reader checking the specification for what a submitting surface must do
    before the registry answers finds this question explicitly marked undecided in the decision log for
    the governing rule, so the next reader who looks in the specification for this behavior does not find
    it there
- file: src/routes/capability-create-screen-save.spec.ts
  where: line 114, inside the 'a concept-already-answered refusal is reported without leaving the screen'
    test, lines 97-117
  evidence: expect(router.state.location.pathname).toBe("/capabilities/new");
  cost: 'rules/integration/a-submitted-registration-states-its-outcome-to-the-operator''s own Description
    says exactly the opposite of a decided fact here: ''What follows a stated outcome is no part of this:
    where the surface goes after a registration was made, whether it stays, reloads or leaves, is not
    decided here.'' No sibling rule fills that gap for a refused submission the way a-successful-capability-registration-lands-on-the-capabilitys-own-surface
    fills it for a successful one. This test nonetheless locks the operator''s post-refusal destination
    to the create route as a hard requirement — a future change that reloads or redirects on a named refusal
    (something no node forbids) would fail this test on a question the specification explicitly leaves
    open, and nobody reading the specification would learn this screen must stay put on a refusal.'
- file: src/routes/capability-create-screen-save.spec.ts
  where: the two tests inside the 'blocks dispatch while a declared schema is not valid JSON' describe
    block, lines 74-94
  evidence: 'expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(putCallCount(fetchMock)).toBe(0);

    '
  cost: 'The specification''s own statement on malformed schemas — rules/integration/a-capability-declares-well-formed-schemas
    — is entirely about the registry: ''The registry refuses to register or update a capability whose
    input schema or output schema is not syntactically valid JSON, with an HTTP 422 response.'' Nothing
    in the specification says the operator is blocked from ever submitting such text. This test instead
    pins a client-side gate (Save disabled, zero PUT calls dispatched) as the required behavior. A reader
    who wants to know when Save is unavailable will read the well-formed-schemas rule and find only a
    server-side 422 refusal — the client-side block this test locks in as fact lives nowhere they will
    look, and a later change relying on the registry''s own refusal (per a-submitted-registration-states-its-outcome-to-the-operator)
    instead of a client-side gate would fail this test against a rule the specification never wrote.'
- file: src/routes/capability-create-screen.spec.ts
  where: the describe blocks "a loading state while the concept vocabulary is pending (criterion 6)" and
    "a failure state offering a retry when the concept vocabulary fails to load (criterion 7)", lines
    103-157
  evidence: 'expect(await screen.findByText("Loading…")).toBeTruthy();

    expect(screen.queryByLabelText("Concept")).toBeNull();

    ...

    expect(await screen.findByText("Unable to load concepts.")).toBeTruthy();

    expect(screen.queryByLabelText("Concept")).toBeNull();

    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();

    ...

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByLabelText("Concept")).toBeTruthy();

    '
  cost: The specification already refuses this exact shape — a pending read, a failed read and an answered
    read reading alike, with the failed one recovered only by the operator's own act — four separate times,
    for four separate reads (a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed,
    a-presented-connector-configuration-states-an-outstanding-or-failed-read, a-draft-versions-content-is-presented-only-from-its-own-record,
    a-presented-manifest-entry-states-its-pinned-revisions-state), and each time as a business decision,
    not an engineering default. This test pins the identical three-window disclosure and manual-retry
    discipline for a new read — the concept vocabulary backing capability authoring — that none of those
    rules, and no other node, names. A reader of the specification who wants to know whether this read
    is owed a pending statement, a failure statement, and an operator-triggered retry (as opposed to silence,
    an auto-retry, or a blank interval) will not find that decision anywhere but in this test and the
    component it locks down.
- file: src/routes/capability-detail-screen.spec.ts
  where: the describe block "a route to the listing is offered even for an identity nothing is registered
    at (task's own UNDERDETERMINED note)", its one test, lines 73-86
  evidence: "const fetchMock = createFetchStub({\n  [CAPABILITY_PATH]: () => errorResponse(\"CapabilityIdentityNotFoundError\"\
    , 404),\n});\nawait mountCapabilityDetailScreen(fetchMock);\n\nawait screen.findByRole(\"button\"\
    , { name: \"Retry\" });\n"
  cost: 'rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed is
    the one node that ever puts a reattempt control on this surface, and its own expression carves this
    exact refusal out of that window: "the registry''s own refusal of an identity no capability is currently
    registered at excepted, that refusal being its own answer and not this window." This test locks a
    "Retry" control onto precisely the refusal the node excepts, and the test''s own title concedes the
    point ("task''s own UNDERDETERMINED note") rather than citing a node that settles it. A future reader
    checking what the specification says an operator sees when the identity itself is unregistered finds
    only an exception, never a presentation to point at, while the running suite now locks in one anyway.'
- file: src/routes/case-version-editor-ready-view.tsx
  where: the CONFLICT_BANNER_TITLE / CONFLICT_BANNER_MESSAGE constants (top of file) and their use at
    `state.status === "conflict"`
  evidence: "const CONFLICT_BANNER_TITLE = \"This version was released by someone else\";\nconst CONFLICT_BANNER_MESSAGE\
    \ =\n  \"Your changes were not saved. Reload to see the current state, or start a new draft.\";\n\
    ...\n{state.status === \"conflict\" && (\n  <ConflictBanner title={CONFLICT_BANNER_TITLE} message={CONFLICT_BANNER_MESSAGE}\
    \ />\n)}\n"
  cost: The specification states that a lifecycle operation asked of a version no longer in draft is refused
    (a-case-version-moves-through-its-declared-lifecycle), but it never says what a curator submitting
    an edit against a version somebody else just released is told, or what recovery is offered. This file
    decides both — that the cause is named as "released by someone else" and that the offered way forward
    is to reload or "start a new draft" — as hard-coded copy. A reader who wants to know what the system
    tells a curator in this situation, or whether starting a new draft is the sanctioned recovery, finds
    it only here; a later change to what can produce a "conflict" status (e.g. a concurrent discard, not
    a release) would leave this copy silently naming the wrong cause with no node to catch the disagreement.
- file: src/routes/case-version-editor-screen-release-control.spec.ts
  where: it("disables the Dialog's own Cancel control while a confirm is in flight", ...), lines 106-126
  evidence: expect(releaseCancelButton().hasAttribute("disabled")).toBe(true);
  cost: Withholding Cancel for the duration of the confirmed release's own call is a rule this test enforces
    and no node states; a reader looking to `releasing-or-discarding-a-draft-case-version-takes-a-further-explicit-act`
    for what a curator may do while that further act is outstanding finds nothing about Cancel, so the
    behavior can drift silently.
- file: src/routes/case-version-editor-screen-release-control.spec.ts
  where: it("disables the Release trigger while a Save to the same version is in flight", ...), lines
    51-74
  evidence: "expect(screen.getByRole(\"button\", { name: \"Release…\" }).hasAttribute(\"disabled\")).toBe(\n\
    \        true,\n      );"
  cost: The rule that the Release trigger is withheld for the whole span of an in-flight Save to the same
    version lives only in this assertion; nothing in the specification says these two acts overlap this
    way, so a reader checking the specification for what a curator may do while a save is pending finds
    nothing, and a future change dropping the disablement breaks no rule the specification states.
- file: src/routes/case-version-editor-screen-release-outcomes.spec.ts
  where: '"a 200 response to Release (criterion 5)" — lines 60-77'
  evidence: "expect(screen.queryByRole(\"button\", { name: \"Release…\" })).toBeNull();\nexpect(screen.getByLabelText(\"\
    Title\").hasAttribute(\"disabled\")).toBe(true);\nexpect(screen.getByRole(\"button\", { name: \"Save\
    \ changes\" }).hasAttribute(\"disabled\")).toBe(\n  true,\n);\n"
  cost: The specification's own case-version node says the record is never altered again once released,
    but nothing in the specification says the editor surface must hide the Release control and disable
    every field and Save the moment a release succeeds — the withholding pattern the specification does
    state (rules/knowledge/a-newly-created-draft-offers-no-act-before-its-own-record-arrives) covers only
    the interval before a new draft's record has arrived, not the far end of the lifecycle. A reader who
    wants to know what a released version's editor screen offers will find that answer only in this test
    and the component it exercises, never in the specification.
- file: src/routes/case-version-editor-screen-release-outcomes.spec.ts
  where: '"a 409 CaseVersionNotDraftAtReleaseError response (criterion 7)" — lines 140-164'
  evidence: "it(\"closes the Dialog and re-fetches the version rather than showing a violations list,\
    \ resetting for the next open\", async () => {\n...\n  await waitFor(() => expect(screen.queryByRole(\"\
    dialog\")).toBeNull());\n  await waitFor(() => expect(versionGetCallCount(fetchMock)).toBe(2));\n"
  cost: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle states only the backend's
    refusal shape for this condition — HTTP 409 reporting CaseVersionNotDraftAtReleaseError — and says
    nothing about what the editor screen does in response. This test states a specific recovery behavior
    (the dialog is dismissed and the version is silently re-fetched) that no node governs; the next reader
    who wants to know what a curator sees when their release attempt turns out stale has nowhere in the
    specification to look, only this test and its implementation.
- file: src/routes/case-version-editor-screen-release-outcomes.spec.ts
  where: '"a Release failure outside 409 and 422" — lines 195-214'
  evidence: "it(\"leaves the Dialog open with no violations shown and the confirm control usable again\"\
    , async () => {\n...\n  await waitFor(() => {\n    expect(releaseConfirmButton().hasAttribute(\"disabled\"\
    )).toBe(false);\n  });\n  const dialog = screen.getByRole(\"dialog\");\n  expect(within(dialog).queryByRole(\"\
    alert\")).toBeNull();\n});\n"
  cost: constraints/a-domain-error-unmapped-by-status-is-refused-generically fixes only the backend's
    generic refusal shape (HTTP 500, INTERNAL_ERROR, the fixed message); rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
    states an analogous 'operator is told the outcome' rule for capability and connector-configuration
    registrations but is expressly scoped to those two registries, not to case-version release. No node
    states what a case-version release's own surface does when a submission fails outside 409 and 422
    — this test states that specific recovery contract (dialog stays open, no violations rendered, confirm
    re-enabled) as though it were decided, and it lives only here and in the implementation.
- file: src/routes/connector-configuration-create-screen-outcome.spec.ts
  where: the second `it`, lines 55-58 ("shows no success statement while the registration is still pending")
  evidence: 'expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true)'
  cost: 'the test pins a specific behavior of the create screen while a submission is outstanding -- the
    Save control going disabled -- as a requirement any implementation must satisfy to pass the suite.
    The specification''s own decision log for rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
    lists this exactly, in these words: "Not decided here: what the surface presents while the submission
    is in flight...". A reader who later wants to know what a connector-configuration create screen may
    show while a registration is outstanding will look in the specification, find it explicitly left open,
    and have no way to learn that this test already requires an answer.'
- file: src/routes/connector-configuration-form-fields.tsx
  where: the connector name Input, line 71
  evidence: disabled={isEditingIdentity || isSubmitting}
  cost: the code decides that once an existing connector configuration is loaded for editing, the operator
    can never change the connector name it is registered under from this surface — a restriction on what
    the operator may do with a value object's own identity that the specification, thorough elsewhere
    about this identity (register-connector's create-or-replace keyed on the name, the surfaces addressed
    by that name, abandonment and discard around it), never states; a reader wanting to know whether renaming
    a connector configuration through its edit surface is possible has to read this component instead
    of the specification
- file: src/routes/new-case-draft-screen-cancel.spec.ts
  where: describe block "Cancel on a not-yet-created draft returns to the screen it was opened from (criterion
    3)", lines 67-92 (both its tests)
  evidence: "fireEvent.click(await screen.findByRole(\"button\", CANCEL_BUTTON));\n\nawait waitFor(()\
    \ => {\n  expect(router.state.location.pathname).toBe(openedFrom);\n});\n...\nfireEvent.click(screen.getByRole(\"\
    button\", CANCEL_BUTTON));\n\nexpect(postCallCount(fetchMock)).toBe(0);\n"
  cost: The rule enforced here — that canceling out of the new-case-draft screen before create-draft has
    ever been called returns the curator to the screen the screen was opened from, rather than a fixed
    destination, and issues no create-draft/POST call — lives only in this test. The four abandonment
    rules the specification does state (rules/knowledge/an-abandoned-case-version-edit-writes-nothing,
    rules/knowledge/an-abandoned-revision-composition-writes-nothing, rules/integration/an-abandoned-capability-registration-entry-registers-nothing,
    rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering) each govern
    a different act — editing content that already exists, or an entry/composition already opened toward
    a write that already exists to abandon — never the composition of a not-yet-created case version through
    create-draft. A reader who checks the specification for what an abandoned new-draft composition costs
    will not find it decided anywhere but here, and a later change to this navigation or to whether Cancel
    is wired to issue the call at all would have nothing in the specification to answer to.
unbound:
- src/routes/capability-create-screen-actions.spec.ts
- src/routes/capability-create-screen-outcome.spec.ts
- src/routes/capability-create-screen-save.spec.ts
- src/routes/capability-create-screen.spec.ts
- src/routes/capability-detail-screen-cancel.spec.ts
- src/routes/capability-detail-screen-discard-availability.spec.ts
- src/routes/capability-detail-screen-outcome.spec.ts
- src/routes/capability-detail-screen-route.spec.ts
- src/routes/capability-detail-screen.spec.ts
- src/routes/capability-form-fields-action-footer.spec.ts
- src/routes/case-version-editor-screen-action-footer.spec.ts
- src/routes/case-version-editor-screen-cancel.spec.ts
- src/routes/case-version-editor-screen-release-checklist.spec.ts
- src/routes/case-version-editor-screen-release-control.spec.ts
- src/routes/case-version-editor-screen-release-outcomes.spec.ts
- src/routes/connector-configuration-create-screen-cancel.spec.ts
- src/routes/connector-configuration-create-screen-outcome.spec.ts
- src/routes/connector-configuration-create-screen.spec.ts
- src/routes/connector-configuration-detail-ready-view-cancel.spec.ts
- src/routes/connector-configuration-detail-ready-view-order.spec.ts
- src/routes/connector-configuration-detail-screen-listing-route.spec.ts
- src/routes/connector-configuration-detail-screen-outcome.spec.ts
- src/routes/connector-configuration-detail-screen.spec.ts
- src/routes/connector-configuration-form-fields-action-footer.spec.ts
- src/routes/hypothesis-revision-form-fields-footer.spec.ts
- src/routes/hypothesis-revision-screen-cancel.spec.ts
- src/routes/new-case-draft-screen-cancel.spec.ts
- src/shared/components/button-footer.spec.ts
- src/shared/components/button-footer.tsx
notes: "Judged by 49 delegation(s), one per file; folded mechanically by trace.py --fold from the returns\
  \ under siegard-reconcile/button-footer-standardization-full-scope.returns/.\nStaged by a review over\
  \ files a delivery wrote: no pair was omitted, so the delivery's own claims and every other binding\
  \ of these files were judged alike; the plan's node(s) constraints/no-route-enforces-authentication,\
  \ contracts/integration/capability-registry, contracts/knowledge/case-lifecycle, domain/knowledge/case-version,\
  \ domain/knowledge/hypothesis, domain/knowledge/hypothesis-revision, rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed,\
  \ rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering, rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing,\
  \ rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface, rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read,\
  \ rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing, rules/integration/a-submitted-registration-states-its-outcome-to-the-operator,\
  \ rules/integration/a-successful-capability-registration-lands-on-the-capabilitys-own-surface, rules/integration/a-successful-connector-registration-lands-on-the-configurations-own-surface,\
  \ rules/integration/an-abandoned-capability-registration-entry-registers-nothing, rules/knowledge/a-case-version-moves-through-its-declared-lifecycle,\
  \ rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record, rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft,\
  \ rules/knowledge/a-newly-created-draft-offers-no-act-before-its-own-record-arrives, rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions,\
  \ rules/knowledge/a-revise-answers-the-revision-number-it-saved, rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move,\
  \ rules/knowledge/a-surface-offering-release-states-which-release-conditions-the-draft-meets, rules/knowledge/an-abandoned-case-version-edit-writes-nothing,\
  \ rules/knowledge/an-abandoned-revision-composition-writes-nothing, rules/knowledge/only-a-draft-case-version-may-be-discarded,\
  \ rules/knowledge/releasing-or-discarding-a-draft-case-version-takes-a-further-explicit-act were read\
  \ on every file and answered for, and bound from nowhere here — a binding this record writes is one\
  \ the trace already held.\nA finding in src/routes/case-version-editor-screen-release-checklist.spec.ts\
  \ names rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name, which no file\
  \ of this set is bound to: the it block \"states the manifest-pin condition as Met, vacuously, for a\
  \ manifest holding no entry (this task's own inference)\", lines 55-65: [`GET ${VERSION_PATH}`]: ()\
  \ => jsonResponse({ ...DRAFT_RECORD, manifest: [] }),\n...\nexpect(within(region).getByText(`Met: ${CONDITION_TEXT}`)).toBeTruthy();\
  \ — The test stubs the version's own read endpoint to succeed with a 200 payload carrying an empty manifest,\
  \ and asserts the screen renders that as an ordinary draft whose manifest-pin condition reads Met. `rules/knowledge/a-case-has-at-least-one-hypothesis`\
  \ holds `manifest` to at least one entry, `rules/knowledge/validation-runs-at-every-read` makes every\
  \ stored version — draft or released — read as a case only while every such validator rule holds at\
  \ that reading, and `rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name`\
  \ states that a read naming a version failing one of those rules is refused with an HTTP 409 CaseVersionNotValidError\
  \ rather than answered at all. This test locks in, as passing behavior, a read the specification says\
  \ can never succeed with this content — a maintainer trusting the suite would believe an empty-manifest\
  \ draft is a reachable, normally-rendered state, and code written to keep this test green would be normalizing\
  \ a read the domain refuses outright.. It blocks nothing here; it is owed a route of its own.\nA finding\
  \ in src/shared/components/button-footer.spec.ts names constraints/no-route-enforces-authentication,\
  \ which no file of this set is bound to: the it block \"still shows AppShell's own no-authentication\
  \ disclosure, present and outside the footer's own group\", lines 109-117: expect(within(mainRegion).queryByText(\"\
  No auth in this build\")).toBeNull();\n      expect(screen.getByText(\"No auth in this build\")).toBeTruthy();\
  \ — The node holds that the disclosure's substance — telling every user, on every screen, that this\
  \ build enforces no authentication — is the fact, and states explicitly that \"the exact copy is the\
  \ frontend's own to choose and free to change without this statement moving.\" This test pins that exact\
  \ literal string as a pass/fail condition, so a wording change the node explicitly permits (e.g. rephrasing\
  \ the notice) breaks this suite even though the specification's actual requirement — the substance disclosed\
  \ on every screen — still holds; the next person who touches that copy has to also chase down this test\
  \ rather than reading the node and trusting it says the whole story.. It blocks nothing here; it is\
  \ owed a route of its own.\nCandidates: 24 opened across 11 of 49 delegation(s); each return lists its\
  \ own under `candidates_opened`.\nUnstated: 15 fact(s) the source states that no node holds, over 11\
  \ file(s), listed under `unstated`. They block no binding here and no rebind closes them — the route\
  \ is the analysis that gives each fact a node."
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/button-footer-standardization-full-scope.returns/`, which are the evidence behind every entry above.
