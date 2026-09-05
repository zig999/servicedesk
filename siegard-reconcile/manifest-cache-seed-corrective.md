---
contract_version: siegard-reconcile/3
title: Fix the new-draft cache-seed crash on the Manifest screen
summary: task/manifest-cache-seed-corrective/fix-new-draft-cache-seed, delivered under the manifest-cache-seed-corrective
  initiative, removed the partial React Query cache seed a new draft wrote into ["case-version", slug,
  version] and added/corrected the tests proving it.
target: frontend
files:
- path: src/hooks/use-edit-draft-version-form.ts
  change: useEditDraftVersionForm no longer accepts a seedRecord parameter and no longer wires initialData/enabled
    off of one; its versionQuery is now unconditionally enabled whenever a version number is present,
    so it always performs a genuine GET for cache key ["case-version", slug, version] and reports phase
    "loading" (never a partial record) until that GET resolves.
- path: src/hooks/use-new-draft-version-form.ts
  change: useNewDraftVersionForm's post-create local state (created) now holds only the new version's
    number, not a constructed CaseVersionRecord built from the submitted form values; its onSuccess handler
    no longer builds that partial record, and it calls useEditDraftVersionForm(slug, created.version)
    with no seed argument, so the created draft's cache entry is populated only by that hook's own real
    fetch.
- path: src/routes/new-case-draft-screen-save.spec.ts
  change: 'written by the delivery of task/manifest-cache-seed-corrective/fix-new-draft-cache-seed: two
    pre-existing assertions that asserted the old seed-then-no-follow-up-GET behavior were corrected to
    assert the new pending-read behavior.'
- path: src/routes/version-manifest-screen-new-draft-cache.spec.ts
  change: 'written by the delivery of task/manifest-cache-seed-corrective/fix-new-draft-cache-seed: new
    integration test proving the Manifest screen renders real rows instead of crashing, never resolves
    a value missing manifest/state, and shows a pending state while unread.'
nodes:
- node: contracts/glossary/glossary-query
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at the vocabulary/concept option hooks consumed
    for release-checklist building and gating — const outcomeOptions = useGlossaryVocabularyOptions("outcome");
    const actionOptions = useGlossaryVocabularyOptions("action"); const recipientOptions = useGlossaryVocabularyOptions("recipient");

    src/hooks/use-new-draft-version-form.ts: held at the four vocabulary-option hooks used to populate
    subject, outcome, action and recipient choices — const subjectOptions = useGlossaryVocabularyOptions("subject-type");

    const outcomeOptions = useGlossaryVocabularyOptions("outcome");

    const actionOptions = useGlossaryVocabularyOptions("action");

    const recipientOptions = useGlossaryVocabularyOptions("recipient");

    '
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-new-draft-version-form.ts
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at the patch, release and discard mutations — return\
    \ apiFetch<CaseVersionRecord>(`/v1/cases/${encodeURIComponent(slug)}/versions/${version}`, { method:\
    \ \"PATCH\", headers: { \"Content-Type\": \"application/json\" }, body: JSON.stringify(values) })\n\
    src/hooks/use-new-draft-version-form.ts: held at the createMutation's mutationFn, which posts the\
    \ create-draft request — return apiFetch<CreatedDraft>(\"/v1/cases\", {\n  method: \"POST\",\n  headers:\
    \ { \"Content-Type\": \"application/json\" },\n  body: JSON.stringify(body),\n});\n"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-new-draft-version-form.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at the versionQuery fetch — apiFetch<CaseVersionRecord>(`/v1/cases/${encodeURIComponent(slug)}/versions/${version}`)\n\
    src/hooks/use-new-draft-version-form.ts: held at sourceVersionQuery's fetch of one version, and redirectToExistingDraft's\
    \ fetch of the versions list — apiFetch<CaseVersionRecord>(\n  `/v1/cases/${encodeURIComponent(slug)}/versions/${latestReleasedVersionNumber}`,\n\
    )\n"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-new-draft-version-form.ts
- node: domain/glossary/action
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at actionOptions passed through to the release
    checklist and returned in ready state — actionOptions,'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: domain/glossary/concept
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at conceptOptions.concepts passed to buildReleaseChecklist
    — concepts: conceptOptions.concepts,'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: domain/glossary/outcome
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at outcomeOptions passed through to the release
    checklist and returned in ready state — outcomeOptions,'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: domain/glossary/recipient
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at recipientOptions passed through to the release
    checklist and returned in ready state — recipientOptions,'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: domain/glossary/subject-type
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at the form reset from the record''s subject attribute
    — subject: record.subject,

    src/hooks/use-new-draft-version-form.ts: held at the default-subject effect, seeded from the subject
    vocabulary''s own first option — const subjectValue = subjectOptions.options[0]?.value;'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-new-draft-version-form.ts
- node: domain/knowledge/case
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at the case slug used to address every query and
    mutation URL — `/v1/cases/${encodeURIComponent(slug)}/versions/${version}`

    src/hooks/use-new-draft-version-form.ts: held at slug, threaded through the hook as the case''s identity
    for every request — export function useNewDraftVersionForm(slug: string): EditDraftVersionFormState
    {'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-new-draft-version-form.ts
- node: domain/knowledge/case-version
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at resetFormFrom, the state-derived flags, and\
    \ the manifest passthrough — form.reset({ title: record.title, when_to_use: record.when_to_use, subject:\
    \ record.subject, fallback: record.fallback, consolidation_register: record.consolidation_register\
    \ })\nsrc/hooks/use-new-draft-version-form.ts: held at the createForm's defaultValues and the CreateDraftRequestBody\
    \ fields built from them — defaultValues: {\n  title: \"\",\n  when_to_use: \"\",\n  subject: \"\"\
    ,\n  fallback: { outcome: \"\", referral: { action: \"\", recipient: \"\" } },\n},\n"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-new-draft-version-form.ts
- node: domain/knowledge/case-version-state
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at canRelease, isBlocked and isReadOnly gates —
    const canRelease = record.state === "draft" && !isReleased;

    src/hooks/use-new-draft-version-form.ts: held at the released/draft filters over the versions list
    — .filter((item) => item.state === "released")'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-new-draft-version-form.ts
- node: domain/knowledge/consolidation-register
  conforms: true
  how: 'src/hooks/use-new-draft-version-form.ts: held at the conditional inclusion of consolidation_register
    in the create-draft body — consolidation_register: values.consolidation_register,'
  encoded_at:
  - src/hooks/use-new-draft-version-form.ts
- node: domain/knowledge/manifest-entry
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at the manifest exposed to callers unmodified —
    manifest: record.manifest,'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: domain/knowledge/referral
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at nowhere — carried opaquely inside fallback,
    never read or decomposed — fallback: record.fallback,

    src/hooks/use-new-draft-version-form.ts: held at the fallback default''s referral shape — fallback:
    { outcome: "", referral: { action: "", recipient: "" } },'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-new-draft-version-form.ts
- node: domain/knowledge/resolution
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at nowhere — carried opaquely inside fallback,
    never read or decomposed — fallback: record.fallback,

    src/hooks/use-new-draft-version-form.ts: held at the same fallback default, pairing outcome with referral
    — fallback: { outcome: "", referral: { action: "", recipient: "" } },'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-new-draft-version-form.ts
- node: rules/knowledge/a-case-has-at-least-one-hypothesis
  conforms: false
  how: 'no named file holds this fact now: src/hooks/use-edit-draft-version-form.ts read `nowhere` — manifest:
    record.manifest, — exposed read-only; this file has no remove-hypothesis path to refuse'
  observed_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: rules/knowledge/a-case-has-at-most-one-draft
  conforms: true
  how: "src/hooks/use-new-draft-version-form.ts: held at the onError branch that redirects to the case's\
    \ one existing draft — if (kind === \"case-already-has-draft\") {\n  toast.error(`A draft already\
    \ exists for the case \"${slug}\".`);\n  void redirectToExistingDraft();\n  return;\n}\n"
  encoded_at:
  - src/hooks/use-new-draft-version-form.ts
- node: rules/knowledge/a-case-version-is-written-once
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at isReadOnly and isBlocked derived from the released
    state — isReadOnly: record.state === "released",'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at the patch and release onError branches for the
    two named errors — if (kind === "case-version-not-draft") { setStatus("conflict"); ... } ... if (kind
    === "case-version-not-draft-at-release") { setIsReleaseDialogOpen(false); ... }'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: false
  how: 'no named file holds this fact now: src/hooks/use-edit-draft-version-form.ts read `nowhere` — no
    concept/subject-type acceptance check appears in this file; conceptOptions is only forwarded to buildReleaseChecklist'
  observed_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at the loading gate and the reset-from-response\
    \ pattern on both queries and mutations — if (versionQuery.isLoading || isLoadingGlossary || !versionQuery.data)\
    \ { return { phase: \"loading\" }; }\nsrc/hooks/use-new-draft-version-form.ts: held at the delegation\
    \ to useEditDraftVersionForm once created is set, rather than building content from the submitted\
    \ values — const editState = useEditDraftVersionForm(slug, created?.version ?? null);\n\nif (created)\
    \ {\n  return editState;\n}\n"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-new-draft-version-form.ts
- node: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
  conforms: true
  how: "src/hooks/use-new-draft-version-form.ts: held at the conditional source_version in the create-draft\
    \ request body — ...(latestReleasedVersionNumber !== undefined\n      ? {\n          consolidation_register:\
    \ values.consolidation_register,\n          source_version: latestReleasedVersionNumber,\n       \
    \ }\n      : {}),\n"
  encoded_at:
  - src/hooks/use-new-draft-version-form.ts
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at the release onError branch capturing violations
    — if (kind === "case-version-not-releasable") { setReleaseViolations(extractReleaseViolations(error));
    return; }'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: false
  how: 'no named file holds this fact now: src/hooks/use-edit-draft-version-form.ts read `nowhere` — no
    glossary-membership check appears in this file; glossary options are only forwarded for display/checklist
    purposes'
  observed_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: rules/knowledge/only-a-draft-case-version-may-be-discarded
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at the discard control''s canDiscard flag — canDiscard:
    record.state === "draft" && !isReleased,'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: scenarios/knowledge/a-release-is-refused-for-manifested-draft-hypothesis-revisions
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at the same release onError branch as the rule
    it exercises — setReleaseViolations(extractReleaseViolations(error));'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
unstated:
- file: src/routes/new-case-draft-screen-save.spec.ts
  where: the first test, lines 27-60 ("issues POST /v1/cases with slug, the curator's entered content
    and a client-side authored_at timestamp when Save is clicked")
  evidence: const before = Date.now(); ... const authoredAtMillis = new Date(postedAuthoredAt(fetchMock)).getTime();
    expect(authoredAtMillis).toBeGreaterThanOrEqual(before); expect(authoredAtMillis).toBeLessThanOrEqual(after);
  cost: The test fixes, as a fact of the system, that authored_at — the datetime the specification introduced
    specifically so a case version's curation history survives an audit of which procedure was current
    when an old investigation ran — is stamped by the curator's own browser clock at the moment Save is
    clicked, sent to the server as a value the server then trusts, rather than assigned by the server
    at the moment it persists the version. domain/knowledge/case-version says only that authored_at is
    a required datetime; a reader who goes there to learn whether the audited timestamp is trustworthy
    against a skewed or backdated client clock finds nothing, and the next person changing create-draft's
    payload has no node to check this choice against.
unbound:
- src/routes/new-case-draft-screen-save.spec.ts
- src/routes/version-manifest-screen-new-draft-cache.spec.ts
notes: 'Judged by 4 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/manifest-cache-seed-corrective.returns/.

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) constraints/a-case-is-read-whole,
  contracts/knowledge/case-query, domain/knowledge/case-version, domain/knowledge/manifest-entry, rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record,
  rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version were read on every file and
  answered for, and bound from nowhere here — a binding this record writes is one the trace already held.

  Candidates: 1 opened across 1 of 4 delegation(s); each return lists its own under `candidates_opened`.

  Unstated: 1 fact(s) the source states that no node holds, over 1 file(s), listed under `unstated`. They
  block no binding here and no rebind closes them — the route is the analysis that gives each fact a node.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/manifest-cache-seed-corrective.returns/`, which are the evidence behind every entry above.
