---
title: Review — fix the new-draft cache-seed crash on the Manifest screen
summary: Coverage, specification-conformance, standard-conformance and failures passes
  over the manifest-cache-seed-corrective initiative's one delivered task.
reviewed:
- src/hooks/use-edit-draft-version-form.ts
- src/hooks/use-new-draft-version-form.ts
- src/routes/new-case-draft-screen-save.spec.ts
- src/routes/version-manifest-screen-new-draft-cache.spec.ts
tasks:
- task/manifest-cache-seed-corrective/fix-new-draft-cache-seed
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/manifest-cache-seed-corrective) passed cleanly across
    every step; there was no failure to diagnose
coverage:
- criterion: Creating a new draft version for a case whose latest released version
    manifests at least one hypothesis, then immediately opening that draft's Manifest
    screen without any prior edit or save on the draft's own editor screen, renders
    the manifest rows drawn from the backend's own manifest array instead of throwing
    "manifest is not iterable".
  state: partial
  tests:
  - file: src/routes/version-manifest-screen-new-draft-cache.spec.ts
    name: renders the manifest rows drawn from the backend's own record instead of
      throwing when the created draft's manifest holds one hypothesis
  - file: src/routes/version-manifest-screen-new-draft-cache.spec.ts
    name: shows the pending "Loading manifest…" statement rather than an empty, zero-row
      manifest table while the created draft's own record has not yet been read back
  why: 'The outcome half is exercised — a draft is created, the Manifest screen is
    opened with no intervening edit or save, and a row named for the backend''s single
    manifest hypothesis is found, which a throw or a zero-row table would fail. The
    precondition half is not: in every test the case''s version list fixture (GET
    /v1/cases/some-slug/versions) resolves to { data: [] }, so the draft is created
    for a case with no versions at all, in the first-version create mode. No test
    in the set creates a draft for a case whose latest released version exists, let
    alone one manifesting at least one hypothesis, so the copy-from-a-released-source
    creation path the criterion names is never entered; the hypothesis-bearing manifest
    appears only in the follow-up GET fixture for the created version.'
- criterion: Any consumer of the case-version cache entry a draft creation seeds (including
    one requiring state) never observes a resolved value missing manifest or state.
  state: covered
  tests:
  - file: src/routes/version-manifest-screen-new-draft-cache.spec.ts
    name: renders the manifest rows drawn from the backend's own record instead of
      throwing when the created draft's manifest holds one hypothesis
  - file: src/routes/version-manifest-screen-new-draft-cache.spec.ts
    name: reflects the created draft's own state once read back, rather than a missing
      value defaulting to editable
  - file: src/routes/version-manifest-screen-new-draft-cache.spec.ts
    name: shows the pending "Loading manifest…" statement rather than an empty, zero-row
      manifest table while the created draft's own record has not yet been read back
  - file: src/routes/new-case-draft-screen-save.spec.ts
    name: states the draft is still being read, showing none of the just-submitted
      content, until a follow-up GET to the created version's own URL resolves
- criterion: Immediately after creating a new draft, before that draft's own record
    has been read back from the backend, the new-draft editor screen states that the
    draft is still being read rather than presenting the curator's just-submitted
    title, when_to_use, subject, fallback or consolidation_register as the created
    version's content.
  state: partial
  tests:
  - file: src/routes/new-case-draft-screen-save.spec.ts
    name: states the draft is still being read, showing none of the just-submitted
      content, until a follow-up GET to the created version's own URL resolves
  why: 'The stated-as-loading half and the not-presenting half are both asserted for
    title, and by the absence of the editor form for the rest. What is unexercised
    is the consolidation_register clause: every create in the set runs in the first-version
    mode (the versions list fixture is empty), and in that mode no consolidation_register
    is submitted at all, so a just-submitted consolidation_register never exists in
    this set to be wrongly presented.'
findings:
- pass: conformance
  file: src/routes/new-case-draft-screen-save.spec.ts
  where: the first test, lines 27-60 ("issues POST /v1/cases with slug, the curator's
    entered content and a client-side authored_at timestamp when Save is clicked")
  evidence: const before = Date.now(); ... const authoredAtMillis = new Date(postedAuthoredAt(fetchMock)).getTime();
    expect(authoredAtMillis).toBeGreaterThanOrEqual(before); expect(authoredAtMillis).toBeLessThanOrEqual(after);
  cost: The test fixes, as a fact of the system, that authored_at is stamped by the
    curator's own browser clock at the moment Save is clicked and sent to the server
    as a value the server then trusts, rather than assigned by the server at the moment
    it persists the version. domain/knowledge/case-version says only that authored_at
    is a required datetime; a reader who goes there to learn whether the audited timestamp
    is trustworthy against a skewed or backdated client clock finds nothing.
  correction: domain/knowledge/case-version (or the create-draft contract) would need
    to state whether authored_at is supplied by the curator's own client at submission
    or assigned by the server at persistence.
- pass: standard
  cites: TYP-04
  file: src/hooks/use-edit-draft-version-form.ts
  where: EditDraftVersionFormState, the 'ready' variant, lines 48-56
  evidence: 'readonly release?: ReleaseControlState;


    readonly discard?: DiscardControlState;


    readonly isFirstVersion?: boolean;


    readonly isReadOnly?: boolean;


    readonly manifest?: readonly CaseVersionManifestEntry[];'
  cost: The one "ready" shape is shared by both the edit-draft hook (which always
    sets release, discard, isReadOnly and manifest) and the new-draft hook (which
    always sets isFirstVersion and none of the others), but the type lets any caller
    construct a "ready" state mixing isFirstVersion with release, or one with none
    of the mode-defining fields at all — combinations the two producing hooks never
    emit but that a consuming screen has to guard against without the compiler's help.
  correction: Split the "ready" phase into two tagged variants (an edit-mode and a
    create-mode member of the union), each with its own required fields, rather than
    one shape with five independently optional fields.
- pass: standard
  cites: STA-01
  file: src/hooks/use-edit-draft-version-form.ts
  where: releaseMutation's onSuccess handler (setIsReleased) and its readers, canRelease
    and isBlocked
  evidence: "onSuccess: (data) => {\n  resetFormFrom(form, data);\n  setIsReleased(true);\n\
    \  ...\n  void queryClient.invalidateQueries({ queryKey: [\"case-version\", slug,\
    \ version] });\n},\n...\nconst canRelease = record.state === \"draft\" && !isReleased;"
  cost: isReleased is a boolean kept beside the versionQuery cache that answers the
    same question record.state already answers. canRelease and isBlocked already trust
    the separate isReleased flag the instant the mutation resolves, ahead of the invalidated
    query's own refetch. If that refetch ever returns a state other than "released",
    the two disagree and the UI keeps showing the released state anyway.
  correction: Drop isReleased and derive the released condition from record.state
    alone, waiting on the invalidated query rather than mirroring its expected result
    in local state.
- pass: standard
  cites: TYP-04
  file: src/hooks/use-new-draft-version-form.ts
  where: CreateDraftRequestBody, lines 23-32, and its construction in createMutation's
    mutationFn, lines 122-128
  evidence: "readonly consolidation_register?: CaseVersionFormValues[\"consolidation_register\"\
    ];\nreadonly source_version?: number;\n...\n...(latestReleasedVersionNumber !==\
    \ undefined\n  ? { consolidation_register: values.consolidation_register, source_version:\
    \ latestReleasedVersionNumber }\n  : {}),"
  cost: The two optional fields are only ever produced together, but the type admits
    any of the four combinations, including source_version alone or consolidation_register
    alone. A later edit to this mutationFn could drop one of the pair while keeping
    the other and the compiler would not catch that the request body no longer matches
    either shape the API actually expects.
  correction: Model CreateDraftRequestBody as a union of two shapes — one without
    consolidation_register/source_version, one requiring both — instead of two independently
    optional fields.
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
reconciliation: siegard-reconcile/manifest-cache-seed-corrective.md
---

## What it is
The review of the manifest-cache-seed-corrective initiative's one task: whether its tests prove
its criteria, whether its source states only what the specification holds, whether it follows
the project's own standard, and why the captured run failed (it did not).

## Notes
Two coverage entries came back partial rather than covered: criterion 1's precondition (a case
whose latest released version already manifests a hypothesis) is never exercised — every test
creates the first version of a fresh case instead — and criterion 3's consolidation_register
clause has nothing submitted to wrongly present in any test of this set, since every create runs
in first-version mode. Neither is a criterion the delivered tests contradict; both are premises
the test set never puts the code in front of.
The trace over frontend/app: 138 code drift finding(s) stood before this review (30 files, 231
suppressed under the target's edits_freely declaration) plus 4 moved and 0 orphaned, all on
the backend target or on frontend files outside this review's set. This review's own conformance
pass folded 23 of the 26 bound-node pairs on its 2 hook files back to current, left 3 standing
(rules/knowledge/a-case-has-at-least-one-hypothesis, rules/knowledge/a-concept-accepts-the-declared-subject-type,
rules/knowledge/case-terms-exist-in-the-glossary — each file genuinely no longer holds that
node's fact, a pass-through rather than a check), and its bind left 68 sibling bindings on other
files stale as a receipt (carried forward from earlier binds elsewhere in the frontend tree,
unrelated to this change).
