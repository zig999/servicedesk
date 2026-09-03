---
title: Hypothesis-editing form holds the draft manifest entry's pinned revision
summary: use-hypothesis-revision-form.ts widens its existing case-version read to type the manifest and
  exposes, in its ready phase, the revision the draft manifest entry pins for the hypothesis being revised,
  or null where none pins it.
task: sha256:5412ca40876e8a6e9c43f36f875900d817cdf6e66f5e3778dbdd57adf9714d3d
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/hypothesis-revision-repin-affordance-pinned-revision-in-hand-before-a-save-build-4
files:
- path: src/hooks/use-hypothesis-revision-form.ts
  effect: Widens the already-fetched versionQuery response type from { subject } to { subject, manifest
    }, adds a pure pinnedRevisionFor(manifest, hypothesisName) lookup that returns the revision the draft's
    manifest entry pins for the named hypothesis (null when hypothesisName is null or no entry matches),
    and exposes it as a new pinnedRevision field on the ready phase of HypothesisRevisionFormState. No
    new query, mutation or request is added; the loading, load-error and success phases are unchanged.
- path: src/routes/case-simulation-case-result-panel.tsx
  effect: Keys each customer-facing text paragraph by its own content instead of its array index, clearing
    a pre-existing react/no-array-index-key lint failure this delivery's build otherwise inherited from
    the tree; no behavior changes.
criteria:
- criterion: With a draft case version whose manifest entry for the hypothesis being revised pins revision
    2, the form reports 2 as that hypothesis's pinned revision.
  met: true
  how: pinnedRevisionFor finds the manifest entry whose hypothesis_revision.hypothesis.name equals hypothesisName
    and returns its hypothesis_revision.revision unchanged (2 in this case); the ready phase returns that
    value as pinnedRevision.
- criterion: Where the hypothesis being revised has no entry in that draft case version's manifest, the
    form reports no pinned revision for it rather than a number.
  met: true
  how: pinnedRevisionFor's manifest.find(...) returns undefined when no entry names that hypothesis, and
    the function answers null in that case rather than any number.
- criterion: Where the screen is opened for a hypothesis identity that does not exist yet, the form reports
    no pinned revision.
  met: true
  how: pinnedRevisionFor short-circuits to null whenever hypothesisName is null -- the identity NewHypothesisScreen
    passes for a hypothesis that does not exist yet -- before ever reading the manifest.
- criterion: Where the draft's manifest entry pins a revision number that the answered page of that hypothesis's
    revisions does not carry, the form still reports that pinned revision number.
  met: true
  how: pinnedRevisionFor reads the revision straight off the manifest entry (versionQuery.data.manifest)
    and never consults revisionsQuery's data at all, so the reported number is unaffected by which revisions
    that paged listing happened to carry.
- criterion: Opening the screen requests no path it does not request today.
  met: true
  how: No new useQuery or apiFetch call was added. Only the TypeScript type of the existing versionQuery
    (GET /v1/cases/{slug}/versions/{version}) was widened from { subject } to { subject, manifest } --
    the same endpoint use-manifest-builder.ts already reads under the identical ["case-version", slug,
    version] key with a manifest field, confirming the response already carries it.
- criterion: Where the case-version read fails, the form reports its existing load-error state rather
    than any state carrying a pinned revision.
  met: true
  how: The pre-existing 'if (versionQuery.isError || isGlossaryError || isRevisionsError)' branch, unchanged,
    still returns the load-error phase -- a variant that carries no pinnedRevision field at all. pinnedRevision
    is only computed and returned in the ready branch reached after versionQuery.data is confirmed defined.
nodes:
- node: rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  how: pinnedRevisionFor reads the pinned revision directly from the manifest entry's own hypothesis_revision.revision,
    independent of revisionsQuery's paged data, so the reported pin never depends on whether the answered
    page of that hypothesis's revisions happens to carry it -- the exact guarantee this rule states, applied
    to the one entry this read-only form reaches.
- node: rules/knowledge/a-hypothesis-is-manifested-at-most-once-in-a-case-version
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  how: pinnedRevisionFor's manifest.find(...) treats 'one entry or none' as the only two possible outcomes
    for a given hypothesis name, matching this invariant's guarantee; it performs no dedup and enforces
    nothing new, since the manifest it reads already holds the invariant.
- node: rules/knowledge/a-case-has-at-most-one-draft
  how: Not encoded here. The form reads whichever case version the route already resolved to (the slug/version
    forwarded by NewHypothesisScreen/ReviseHypothesisScreen), and never selects or resolves 'the draft'
    itself; the invariant is honored by relying on that upstream routing rather than by any logic this
    task adds.
- node: domain/knowledge/case-version
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  how: The widened CaseVersionSubject type now types the version's manifest attribute (many manifest-entry)
    alongside its already-typed subject, reflecting that a case version's manifest is one of its own required
    attributes.
- node: domain/knowledge/manifest-entry
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  how: The new ManifestEntryDto type models one manifest entry as its reference to a hypothesis-revision
    (hypothesis name plus revision number), the shape pinnedRevisionFor reads to obtain the entry own
    pinned reference.
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  how: ManifestEntryDto.hypothesis_revision.revision is the hypothesis-revision's own numbered identity,
    returned by pinnedRevisionFor unchanged as pinnedRevision.
- node: domain/knowledge/hypothesis
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  how: pinnedRevisionFor matches a manifest entry to 'the hypothesis being revised' by comparing entry.hypothesis_revision.hypothesis.name
    against the screen's hypothesisName parameter -- the hypothesis's own stable name identity, never
    a revision's content.
inferences:
- inferred: The new field is named pinnedRevision.
  from: version-manifest-screen.tsx already names the same domain concept pinnedRevision as a parameter
    of optionsWithPinnedRevision; no node or task text names the field, so the name was drawn from that
    existing usage rather than invented independently.
divergences:
- from: convention seen at frontend/app/src/routes/case-simulation-case-result-panel.tsx
  departure: Keyed each split paragraph by its own text (key={paragraph}) instead of the array index the
    file used before, to clear a pre-existing react/no-array-index-key lint failure the standard's build
    step reaches over the whole tree; this file is outside the task's own objective and its criteria answer
    nothing about it.
  why: The standard's build and suite steps run npm run lint over the whole target, and this failure predates
    this delivery (confirmed by reproducing it on the unmodified tree) and blocks every delivery's build
    until fixed; frontend is declared edits_freely and the fix changes no behavior a person can observe,
    so it is the fifth route's direct-edit case rather than this task's own work.
preserved:
- The ready phase's existing fields (form, hypothesisNameEditable, subjectType, collectsOptions, outcomeOptions,
  actionOptions, recipientOptions, isSubmitting, onSubmit) keep exactly their current values and behavior.
- versionQuery.data.subject continues, unchanged, to feed the revise-hypothesis POST body and the subjectType
  exposed to the form.
- The unconditional success phase (hypothesisName, revision, onOpenManifestBuilder navigating to the manifest
  builder) is untouched -- this task does not condition or otherwise change that affordance.
- The loading and load-error phase behavior, including retryLoad's exact refetch set, is unchanged.
- revisionsQuery and its use in latestRevisionOf/form.reset for populating the form default values are
  unchanged.
- case-simulation-case-result-panel.tsx renders the same paragraphs in the same order with the same content
  and styling; only the React key expression changed.
deferred:
- what: hypothesis-revision-screen.tsx renders no UI for pinnedRevision, and the sibling repin-affordance
    task that compares it against the save own answer has not been written.
  why: Per the task's own rationale, obtaining the pin answers to a different specification node than
    the affordance comparing against it; that comparison and any rendering it drives are the consuming
    (sibling) task's objective, not this one's.
---

## What it is
The form reading the manifest of the draft case version named by the screen it was opened on, and taking from it the one entry that pins the hypothesis under revision.
The number it reports is the entry own reference, whatever set of that hypothesis revisions arrived beside it.
The version-check field type was widened rather than a second request added, since the same cached case-version GET already carries the manifest under the key the manifest-builder hook already reads.

## Notes
The pre-existing react/no-array-index-key lint failure at case-simulation-case-result-panel.tsx, unrelated to this task, was cleared directly under the fifth route (edits_freely: frontend) so the standard's build and suite steps could run; see the divergence entry above.
