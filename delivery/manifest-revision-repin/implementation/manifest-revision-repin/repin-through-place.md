---
title: Repinning a manifest entry through the existing place-hypothesis mutation
summary: useManifestBuilder now exposes a per-row repin action that reuses placeMutation with the row's
  own unchanged position, reports its success without signalling a move, and reports its own failure against
  the row it was attempted on rather than through the move error path.
task: sha256:498160ca965b2166a5653d62f63aa7b96dd50c1794dd1985b97aa4c53d1d20fd
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/manifest-revision-repin-repin-through-place-build
files:
- path: src/hooks/use-manifest-builder.ts
  effect: 'placeMutation''s variables now carry a discriminant kind: "move" | "repin", set by the two
    call sites that invoke it. A new repinTo(chosenRevision) function per row calls placeMutation.mutate
    with the row''s own current entry.position (unchanged) and the chosen revision, with kind "repin";
    moveTo keeps sending the row''s own unchanged revision with a new position, now tagged kind "move".
    onSuccess emits manifestHypothesisPlaced with moved: vars.kind === "move" (false for a repin) and
    re-reads the manifest through the unchanged invalidateManifest() (which touches only the ["case-version",
    slug, version] key, never ["hypothesis-revisions", ...]). onError keeps the existing case-version-not-draft
    -> setIsBlocked(true) and manifest-position-occupied -> moveError branches unchanged, and for any
    other failure now also sets a new revisionError state (parallel to moveError, keyed by hypothesisName)
    with a revision-worded message before falling through to the same toast.error(GENERIC_FAILURE_MESSAGE)
    both move and repin failures already raised. ManifestRow gains revisionErrorMessage and onRepin: (revision:
    number) => void, exposed to a future consumer (the row''s revision Select). Both moveTo and repinTo
    now clear moveError and revisionError together before mutating, so a stale message from the other
    action never lingers on the same row.'
criteria:
- criterion: Repinning a row issues exactly one PUT to /v1/cases/:slug/versions/:version/manifest/:hypothesisName,
    carrying the chosen revision and a position.
  met: true
  how: onRepin(revision) is repinTo, which calls placeMutation.mutate exactly once; placeMutation's mutationFn
    is the pre-existing single PUT to that exact endpoint, unchanged, with a JSON body of {revision, position}.
- criterion: The position that request carries is the row's own position as it stood before the repin,
    unchanged.
  met: true
  how: 'repinTo passes position: entry.position — the same sorted manifest entry''s own position the row
    was rendered from, never a target position as moveTo uses.'
- criterion: The revision that request carries is the chosen revision's own number, as the revisions listing
    answered it.
  met: true
  how: onRepin/repinTo takes the chosenRevision parameter verbatim from its caller and passes it straight
    through as vars.revision; the hook does not substitute or recompute it.
- criterion: After a successful repin, every manifest entry's position reads exactly as it did before
    the repin.
  met: true
  how: The request sends only the repinned entry's own unchanged position, so no other manifest entry's
    position is touched by this write; the server-side invariant (a-hypothesis-position-is-unique-within-its-case)
    is what makes this hold, and the frontend never sends a position for any entry but the one being repinned.
- criterion: After a successful repin, the only manifest fact that differs is the repinned entry's referenced
    revision.
  met: true
  how: The PUT body carries the row's own unchanged position and the newly chosen revision, so the only
    field the write asks the server to change is the referenced revision.
- criterion: A successful repin re-reads the case version's manifest from the server rather than patching
    the shown row in place.
  met: true
  how: onSuccess calls the pre-existing invalidateManifest(), which invalidates the ["case-version", slug,
    version] query and lets useQuery refetch; no code path writes the mutation's own response into the
    row state directly.
- criterion: A successful repin does not invalidate the hypothesis-revisions listing.
  met: true
  how: invalidateManifest() invalidates only the ["case-version", slug, version] key; no onSuccess path
    touches ["hypothesis-revisions", slug, hypothesisName], for either a move or a repin.
- criterion: A repin answered with HTTP 409 CaseVersionNotDraftError puts the screen into the same blocked
    state the existing ConflictBanner reads.
  met: true
  how: onError's first branch (kind === "case-version-not-draft" via the shared errorStateKind mapping)
    calls setIsBlocked(true) unconditionally, for a repin exactly as it already did for a move or a remove;
    VersionManifestScreen reads that same isBlocked flag to render ConflictBanner.
- criterion: A repin answered with HTTP 409 CaseVersionNotDraftError leaves the shown manifest reading
    exactly as it did before the attempt.
  met: true
  how: The case-version-not-draft branch only calls setIsBlocked(true) and returns; it never calls invalidateManifest()
    or writes to the versionQuery cache, so the cached manifest data is untouched by the failed attempt.
- criterion: A repin failing for any other reason raises the existing generic-failure toast that the move
    actions already raise.
  met: true
  how: The onError fallthrough still ends in the same unconditional toast.error(GENERIC_FAILURE_MESSAGE)
    call move and remove failures already reach; the new repin-only revisionError branch runs before it
    and does not return, so the toast still fires.
- criterion: A repin's own failure is reported against the row it was attempted on, and its message names
    the revision change rather than a move of the entry.
  met: true
  how: A new revisionError state, structured like moveError ({hypothesisName, message}), is set only for
    vars.kind === "repin" in the onError fallthrough, keyed by vars.hypothesisName — the row the repin
    was attempted on — and worded with the new REVISION_FAILURE_MESSAGE ("Could not switch to that revision.
    Try again."), distinct from and never mentioning MOVE_BLOCKED_MESSAGE's "position" wording. It is
    exposed per row as revisionErrorMessage, looked up the same way moveErrorMessage already is.
- criterion: The success signal a repin emits does not report the entry as having moved.
  met: true
  how: 'onSuccess''s telemetry.manifestHypothesisPlaced call now computes moved: vars.kind === "move",
    so a repin (kind "repin") emits moved: false; a move keeps emitting moved: true, unchanged.'
nodes:
- node: contracts/knowledge/case-lifecycle
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  how: The repin write reuses the place-hypothesis operation's existing PUT wiring in placeMutation verbatim
    — no new endpoint or method is introduced for a repin.
- node: contracts/knowledge/case-query
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  how: A successful repin re-reads through invalidateManifest(), which refetches the case version via
    the same versionQuery this hook already reads case-query's read-case operation through, rather than
    the mutation response patching the row.
- node: domain/knowledge/case-version
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  how: The CaseVersionNotDraftError branch answers for the case version's own state (draft vs not) by
    blocking further writes; a repin is only ever attempted against a draft version's manifest, consistent
    with "while in draft, its manifest may be freely composed."
- node: domain/knowledge/manifest-entry
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  how: repinTo sends the manifest entry's own unchanged position paired with the newly chosen revision,
    matching "pin one hypothesis-revision at one position" — reordering never happens here, only the referenced
    revision changes.
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  how: The chosen revision's own number is carried through to the PUT body unmodified; the hook itself
    makes no claim about that revision's content, only that it is the one now referenced.
- node: rules/knowledge/a-case-version-is-written-once
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  how: The frontend never attempts a repin write outside what the server accepts; the CaseVersionNotDraftError
    refusal path is how this rule's "never altered again" half reaches the frontend for any operation
    other than release, repin included.
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  how: The onError branch answers exactly the CaseVersionNotDraftError refusal this rule states for a
    non-release lifecycle operation asked of a version not in draft state.
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  how: repinTo always sends the row's own current entry.position, never a different one, so the ManifestPositionOccupiedError
    this rule's refusal describes cannot arise from a repin — the rule is honored by construction rather
    than by handling a refusal.
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  how: Because repinTo never changes an entry's position, the declared precedence order every manifest
    entry's position states is left untouched by a repin, only the referenced revision changes.
- node: constraints/a-case-is-read-whole
  how: A repin is exactly the independent manifest-entry write this constraint permits outside the whole-transaction
    diagnosis read; it needs no client-side reassembly of the whole case version, only the existing place-hypothesis
    PUT and a re-read of the case version's own manifest.
inferences:
- inferred: The repin action is named onRepin on ManifestRow, taking the chosen revision number as its
    one argument, with an internal repinTo(chosenRevision) implementation mirroring moveTo's shape.
  from: No node or the task's own criteria fix a name; the sibling task row-revision-select.md (not yet
    delivered) describes its consumer criterion as "invokes the repin action for that row with the chosen
    revision," which fixes the shape without fixing a name — onRepin was chosen to match the existing
    onMoveUp/onMoveDown/onRemove naming convention on the same type.
- inferred: A repin's own failure (any reason other than CaseVersionNotDraftError) is reported through
    a new, distinct per-row revisionError state, worded around "that revision" rather than reusing moveError's
    position-based MOVE_BLOCKED_MESSAGE — in addition to, not instead of, the existing generic-failure
    toast.
  from: The task's own ADVISORY note that criteria 10-12's wording is left to the frontend's own copy,
    plus the inventory's own risk entry warning that reusing placeMutation's shared moveError/telemetry
    path as-is "risks presenting a revision-swap failure as a 'move' error to the curator" — a distinct
    per-row error path is what the inventory names as needed to avoid exactly that conflation.
- inferred: The exact wording of REVISION_FAILURE_MESSAGE ("Could not switch to that revision. Try again.")
    is this delivery's own copy choice.
  from: The task's own ADVISORY note stating that how a repin's own message is worded is left to the frontend's
    own copy, the same way the specification elsewhere leaves a disclosure's exact wording open.
preserved:
- 'The move-up and move-down actions still send the row''s own unchanged revision with a new target position,
  tagged kind "move", and still emit moved: true on success.'
- The remove action, its own error handling (case-version-not-draft and manifest-would-hold-no-hypothesis
  branches), and its telemetry are untouched.
- moveError's existing manifest-position-occupied handling and MOVE_BLOCKED_MESSAGE wording for move/remove
  flows are unchanged.
- isBlocked/ConflictBanner behavior for any mutation's CaseVersionNotDraftError response is unchanged.
- invalidateManifest()'s query key and scope are unchanged.
deferred:
- what: Wiring a Select control at the row's Hypothesis cell to actually invoke onRepin with a curator's
    chosen revision.
  why: Out of this task's scope by its own stated cut ("the write path only"); belongs to the sibling
    task row-revision-select, which consumes this hook's onRepin/revisionErrorMessage.
---

## What it is
useManifestBuilder gains a per-row repinTo(chosenRevision) action, exposed as onRepin, that PUTs the row's own unchanged position and a chosen revision to the existing place-hypothesis endpoint.
Success re-reads the manifest and reports moved: false; failure lands in the existing ConflictBanner-blocked state for CaseVersionNotDraftError, or a new per-row revisionError plus the existing generic-failure toast for anything else.

## Notes
This task delivers the write path only; wiring a Select to call onRepin is the sibling task row-revision-select's, deferred here.
A repin's own failure message and its exact wording are this delivery's own copy choice, disclosed as inferences since no node states either.
