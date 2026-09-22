---
target: frontend
title: Hypothesis composition presents its form on a draft version that does not read
  back as a case
summary: New Hypothesis and Revise Hypothesis keep offering the composition form,
  and a working submit, when the case's draft version read is refused for failing
  validation, while glossary and revisions failures and any other version refusal
  still fall to the generic "did not complete" statement, and no stale cached version
  data leaks through on that refused reading.
task: sha256:ffe759336ae3a7bd347d03263da76225ee2bef4545154eb8412109d4d8660c71
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/case-not-valid-surface-presentation-hypothesis-composition-opens-for-a-version-that-does-not-read-back-build-2
files:
- path: src/hooks/use-hypothesis-revision-form.ts
  effect: 'Classifies the case-version query''s error through the already-shared errorStateKind
    helper. A "case-not-valid" failure falls through both the load-error and loading
    gates and reaches the "ready" phase like a successful read would. A single versionData
    value, computed once as `isVersionNotValid ? undefined : versionQuery.data`, is
    the only source the ready phase and the revise mutation read version content from,
    so a prior successful read left behind in the shared ["case-version", slug, version]
    TanStack Query cache is never surfaced once the current read is refused — subjectType
    is null, collectsOptions is every glossary concept unfiltered, pinnedRevision
    is null, the mutation''s onMutate records no prior pin, and the mutation body
    sends a fixed, server-ignored placeholder subject, all regardless of whatever
    versionQuery.data itself still holds. The revise mutation no longer throws before
    submitting when the draft''s read has not answered.'
- path: src/routes/hypothesis-revision-screen.tsx
  effect: Renders the reused statement "This case's current version does not read
    back as a case." above the composition form whenever the hook reports caseVersionNotValid,
    alongside the pre-existing "View Manifest" link and the form itself, both now
    reachable on that reading exactly as on a successful one.
- path: src/routes/hypothesis-revision-form-fields.tsx
  effect: Accepts a nullable subjectType and renders the "Subject type (from draft,
    fixed)" input blank rather than passing an unread or stale value through, so no
    attribute of the refused draft version is disclosed as the case's current content.
criteria:
- criterion: Opening the New Hypothesis screen for a case's draft version whose read
    is refused because a validator rule of validation-runs-at-every-read does not
    hold for that draft version at that reading presents the hypothesis composition
    form.
  met: true
  how: When versionQuery.isError and errorStateKind(versionQuery.error) === "case-not-valid",
    both the load-error and loading early-returns are skipped regardless of which
    validator rule produced the CaseVersionNotValidError, so the function falls through
    to the same "ready" phase a successful read would produce.
- criterion: A hypothesis composed on that screen and submitted lands in that same
    draft version's manifest, with no read of that draft version having read back
    as a case first.
  met: true
  how: Submission is no longer blocked by the removed guard; the mutation sends the
    server-ignored placeholder subject (computed from versionData, never from a possibly-stale
    versionQuery.data) and succeeds on the same terms as a normal submit. On success
    offerManifestBuilder is true and the curator is offered the route to the draft
    version's own manifest, which the sibling manifest-builder task keeps offering
    the placing act on. Criterion 2's landing is satisfied by keeping this specification-decided
    chain reachable end to end, not by this screen issuing place-hypothesis itself.
- criterion: Opening the Revise Hypothesis screen for a case's draft version in that
    same condition presents the composition form on the same terms as the New Hypothesis
    screen.
  met: true
  how: ReviseHypothesisScreen renders the same HypothesisRevisionScreen over the same
    hook, differing only in hypothesisName, which does not affect the isVersionNotValid
    branch or the versionData masking.
- criterion: A failure of that screen's read of the glossary, or of its read of the
    revisions, still presents the statement the screen makes for a read that did not
    complete, distinct from what it presents for its read of the draft version.
  met: true
  how: isGlossaryError and isRevisionsError are checked first and still route unconditionally
    to the unchanged "load-error" phase, now distinct from the new case-keyed not-valid
    statement.
- criterion: A refusal of that screen's read of the draft version carrying an error
    code the screen holds no presentation of its own for still presents exactly what
    the screen states for a read that did not complete, disclosing neither the error
    code, nor the refusal's message, nor any value the refusal carries.
  met: true
  how: Any versionQuery.isError whose errorStateKind is not "case-not-valid" still
    falls into the unchanged "load-error" phase, whose only rendered content is the
    fixed sentence and a Retry button.
nodes:
- node: rules/knowledge/a-hypothesis-composition-stands-on-a-reading-whose-anchoring-version-does-not-read-back-as-a-case
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-screen.tsx
  how: The isVersionNotValid branch is keyed only on the CaseVersionNotValidError
    code, never on which validator rule produced it, so the composition form and the
    submit act stay presented uniformly; the offered manifest route stays present
    unconditionally in the "ready" phase JSX exactly as on a successful reading.
- node: rules/knowledge/a-hypothesis-composition-states-which-of-its-reads-did-not-complete
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-screen.tsx
  how: Glossary and revisions failures keep presenting the pre-existing generic "did
    not complete" statement, made distinct from the new case-keyed statement, to the
    extent criterion 4 requires; naming which of glossary or revisions failed is not
    reached, matching the task's own disclosed UNDERDETERMINED note.
- node: rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-screen.tsx
  - src/routes/hypothesis-revision-form-fields.tsx
  how: 'caseVersionNotValid is true exactly when the draft version''s read is refused
    with CaseVersionNotValidError, and the screen renders the reused sentence. No
    attribute of that version is disclosed on that reading: versionData is forced
    to undefined whenever caseVersionNotValid holds, so subjectType, the concept filtering,
    and pinnedRevision can never surface a value a prior successful read left behind
    in the shared query cache under the same key — the defect a failure-diagnostician
    found against an earlier version of this same file, now closed by deriving every
    version-derived value from versionData rather than from versionQuery.data directly.'
- node: rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  how: Any versionQuery error kind other than "case-not-valid" is routed to the same
    load-error phase as a read that did not complete, disclosing nothing about the
    refusal.
- node: rules/knowledge/a-revise-reads-its-drafts-declared-subject-type-even-when-that-draft-does-not-read-back-as-a-case
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  how: The client no longer blocks or conditions the revise submission on the draft's
    own read having answered; the request body's subject field carries a placeholder
    constant (from versionData, never a stale versionQuery.data) in that case, leaving
    the server's own check against the draft's stored record untouched by this client-side
    change.
inferences:
- inferred: A fixed, non-domain placeholder string (UNREAD_DRAFT_SUBJECT) is sent
    as the revise-hypothesis request's subject field when the draft version's own
    read has not answered.
  from: rules/knowledge/a-revise-hypothesis-requests-own-subject-type-is-never-read,
    stating the field is accepted and left without effect, together with the wire
    schema's own non-empty requirement.
- inferred: When the draft version's read is refused, the "Collects" concept checklist
    shows every glossary concept unfiltered rather than filtered by the draft's declared
    subject type.
  from: The no-disclosed-attribute reading of a-hypothesis-composition-stands-on-a-reading-whose-anchoring-version-does-not-read-back-as-a-case.
- inferred: The "Subject type (from draft, fixed)" input renders blank, rather than
    any placeholder value, when the draft's read is refused.
  from: The same no-disclosed-attribute reading.
- inferred: Criterion 2's "lands in that same draft version's manifest" is read as
    satisfied by keeping the specification's own offered route reachable end to end,
    rather than by having this screen itself issue a place-hypothesis call.
  from: The task's own Notes together with the node's own Description naming that
    exact route-then-offer chain as already laid by the specification on this same
    reading.
- inferred: Every version-derived value the ready phase and the revise mutation read
    is sourced from a single versionData binding that is forced to undefined whenever
    isVersionNotValid holds, rather than from versionQuery.data directly.
  from: A failure-diagnostician's finding against an earlier version of this file
    (subjectType still showing a cached value from a prior successful read once the
    same key's read was refused), and TanStack Query's own documented behavior of
    retaining the last successful data across a failing refetch on the same key.
divergences:
- from: rules/knowledge/a-hypothesis-composition-states-which-of-its-reads-did-not-complete
  departure: Glossary and revisions read failures share one undifferentiated "did
    not complete" statement, naming neither and not told apart from one another, rather
    than each being explicitly named and distinguished as the node's own expression
    requires.
  why: Criterion 4, as the task states it, requires only that the statement differ
    from what the screen presents for the draft version's own refused read, which
    the phase split delivers; the task's own Notes already carry this exact gap as
    UNDERDETERMINED and accept the narrower reading, so this delivery matches the
    task's own disclosed scope rather than the fuller node.
preserved:
- The ready-phase computation for a draft version whose read genuinely succeeds is
  untouched when isVersionNotValid is false and versionQuery.data is defined, since
  versionData then equals versionQuery.data exactly.
- The generic "load-error" phase's wording, Retry behavior and refetch calls for any
  other versionQuery failure, and for a glossary or revisions failure, are unchanged.
- The "success" phase and its offerManifestBuilder/onOpenManifestBuilder computation
  are unchanged.
- The shared ["case-version", slug, version] query key's meaning to its other consumers
  is untouched — only this hook's own branching on the query's result changed.
- pinnedRevisionFor and latestRevisionOf are unchanged; existing pinned-revision test
  scenarios remain unaffected since versionData equals versionQuery.data on that path.
deferred:
- what: No control anywhere in the frontend lets a curator place an already-composed,
    not-yet-manifested hypothesis revision into a case version's manifest — the manifest
    builder screen's rows only reach entries already in the manifest, and "+ Add hypothesis"
    only navigates back to compose another brand-new hypothesis identity rather than
    placing an existing one.
  why: This gap is pre-existing and applies identically whether or not the draft version's
    read is refused, so it is not something this task's own file set reaches; the
    task's own Notes already flag it under criterion 2 as UNDERDETERMINED and outside
    this task's criteria.
---

## What it is
The New Hypothesis and Revise Hypothesis screens present the composition form, and accept a working submit, when the case's draft version read is refused because a validator rule of validation-runs-at-every-read does not hold for it — reusing the "does not read back as a case" statement and disclosing no attribute of the version, including one a prior successful read left in the shared query cache — while a glossary or revisions failure still falls to the unchanged generic statement.

## Notes
A failure-diagnostician found, on the first suite run, that subjectType was read directly from versionQuery.data, which TanStack Query keeps populated with a prior successful read's value even once the same key's current read is in an error state — leaking a stale attribute of the version onto the refused reading. Fixed by deriving every version-derived value (subjectType, collectsOptions filtering, pinnedRevision, the mutation's subject, pinnedRevisionBeforeSaveRef) from a single versionData binding forced to undefined whenever the version is not valid.
