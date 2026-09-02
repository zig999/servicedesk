---
title: Proof for repinning a manifest entry through the existing place-hypothesis mutation
summary: Twelve tests drive useManifestBuilder's new onRepin action directly through renderHook, proving
  the exact PUT it sends, the state a successful and a refused repin leave behind, and that its telemetry
  and failure reporting never read as a move.
implementation: sha256:975205f404ee73779780a3b781a295e9386cef0345acaf3f27c4295350a4d2a2
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/manifest-revision-repin-repin-through-place-suite
tests:
- file: src/hooks/use-manifest-builder-repin.spec.ts
  name: issues exactly one PUT to that hypothesis's own manifest endpoint when onRepin is called
  proves: Criterion 1 ("Repinning a row issues exactly one PUT to /v1/cases/:slug/versions/:version/manifest/:hypothesisName")
    and the recorded inference that onRepin is exposed per row taking the chosen revision as its one argument.
  fails_when: onRepin issues zero, two, or more PUT calls, or issues its one PUT against any URL other
    than the exact manifest-entry endpoint for that hypothesis.
- file: src/hooks/use-manifest-builder-repin.spec.ts
  name: carries the row's own unchanged position paired with the newly chosen revision
  proves: Criterion 2 ("The position that request carries is the row's own position as it stood before
    the repin, unchanged") and criterion 3 ("The revision that request carries is the chosen revision's
    own number, as the revisions listing answered it").
  fails_when: The PUT body carries a position other than the row's own current position, or a revision
    other than the exact number passed to onRepin.
- file: src/hooks/use-manifest-builder-repin.spec.ts
  name: reads exactly as it did before the repin for every manifest entry, once the re-read manifest arrives
  proves: Criterion 4 ("After a successful repin, every manifest entry's position reads exactly as it
    did before the repin").
  fails_when: Any row's position, after the re-read manifest following a successful repin, differs from
    its position before the repin.
- file: src/hooks/use-manifest-builder-repin.spec.ts
  name: changes only the repinned entry's own referenced revision, leaving every other entry's revision
    untouched
  proves: Criterion 5 ("After a successful repin, the only manifest fact that differs is the repinned
    entry's referenced revision").
  fails_when: A row other than the one repinned shows a changed revision after the re-read manifest.
- file: src/hooks/use-manifest-builder-repin.spec.ts
  name: issues a second GET and shows the revision that GET answered, even though the PUT itself answered
    no body
  proves: Criterion 6 ("A successful repin re-reads the case version's manifest from the server rather
    than patching the shown row in place") — the PUT answers 204 with no data to patch from, so the updated
    revision shown can only have come from the second GET.
  fails_when: No second GET is issued after a successful repin, or the row's shown revision never reflects
    what that second GET answered.
- file: src/hooks/use-manifest-builder-repin.spec.ts
  name: does not invalidate a hypothesis-revisions query cached under a different key
  proves: Criterion 7 ("A successful repin does not invalidate the hypothesis-revisions listing") — proved
    against a real, actively-observed ["hypothesis-revisions", slug, hypothesisName] query sharing the
    same QueryClient, whose own fetcher is asserted to run only once even after the repin's re-read completes.
  fails_when: The hypothesis-revisions query's own fetcher runs a second time after a successful repin.
- file: src/hooks/use-manifest-builder-repin.spec.ts
  name: sets isBlocked, the same flag the existing ConflictBanner reads
  proves: Criterion 8 ("A repin answered with HTTP 409 CaseVersionNotDraftError puts the screen into the
    same blocked state the existing ConflictBanner reads").
  fails_when: isBlocked stays false after the repin's PUT answers 409 CaseVersionNotDraftError.
- file: src/hooks/use-manifest-builder-repin.spec.ts
  name: leaves every row reading exactly as it did before the attempt, issuing no further GET
  proves: Criterion 9 ("A repin answered with HTTP 409 CaseVersionNotDraftError leaves the shown manifest
    reading exactly as it did before the attempt").
  fails_when: A second GET fires after the 409, or the repinned row's position or revision differs from
    what it held before the attempt.
- file: src/hooks/use-manifest-builder-repin.spec.ts
  name: raises the existing generic-failure toast, the same one the move actions already raise
  proves: Criterion 10 ("A repin failing for any other reason raises the existing generic-failure toast
    that the move actions already raise").
  fails_when: toast.error is not called, or is called with a message other than the existing generic-failure
    text, when the repin's PUT fails for an unrecognized reason.
- file: src/hooks/use-manifest-builder-repin.spec.ts
  name: reports the failure against the row it was attempted on, worded around the revision rather than
    a move, leaving the other row untouched
  proves: Criterion 11 ("A repin's own failure is reported against the row it was attempted on, and its
    message names the revision change rather than a move of the entry") and the disclosed inference fixing
    REVISION_FAILURE_MESSAGE's exact wording.
  fails_when: The repinned row's revisionErrorMessage is not exactly "Could not switch to that revision.
    Try again.", or the other row's revisionErrorMessage is set by an attempt made against a different
    row.
- file: src/hooks/use-manifest-builder-repin.spec.ts
  name: still raises the generic-failure toast on the same failure that sets the row's own revisionErrorMessage
  proves: The disclosed inference that a repin's own revisionError state is set in addition to, not instead
    of, the existing generic-failure toast.
  fails_when: The generic-failure toast stops firing once the new revisionError branch is reached, i.e.
    the two effects turn out to be mutually exclusive rather than both firing for the same failure.
- file: src/hooks/use-manifest-builder-repin.spec.ts
  name: 'emits moved: false, never reporting the entry as having moved'
  proves: Criterion 12 ("The success signal a repin emits does not report the entry as having moved").
  fails_when: The manifestHypothesisPlaced telemetry event emitted after a successful repin carries moved
    true, or omits/misstates any other field of that payload.
not_applicable:
- edge_case: A second repin or move attempted on the same row while a first repin is still in flight.
  why: onRepin and moveTo dispatch through the same pre-existing placeMutation object this task did not
    change the busy/disabled handling of; that mechanism is already exercised by the existing move-in-flight
    test in version-manifest-screen-reorder.spec.ts, and no criterion of this task asks for a repin-specific
    rendering of it — the row's UI trigger for onRepin is deferred to the sibling task, so there is no
    control to double-click yet.
- edge_case: Repinning to the revision the row already holds (a no-op revision change).
  why: No criterion distinguishes this from any other chosen revision; repinTo passes vars.revision through
    verbatim regardless of what the row currently shows, so the write path's behavior is identical to
    any other chosen value.
- edge_case: An empty manifest, or repinning a manifest's only entry.
  why: The business rule enforced elsewhere (a case must keep at least one hypothesis) makes a zero-entry
    manifest unreachable; repinning the sole entry sends the same fixed position value any other entry
    count would, so it is not a distinct code path.
- edge_case: An invalid or out-of-range chosen revision number.
  why: Criterion 3 states the revision carried is "the chosen revision's own number, as the revisions
    listing answered it" — validating that number is the concern of the sibling task supplying it (row-revision-select)
    and of the server, not of this write path, which is only obliged to pass it through unmodified.
untested:
- 'The onError branch''s behavior if a repin''s own PUT were ever answered with 409 ManifestPositionOccupiedError:
  the shared onError handler would route it into setMoveError (not the new setRevisionError), attributing
  a revision-swap refusal to the move-error UI text. The task''s own REMAINDER note treats this as structurally
  unreachable for a repin (repinTo always sends the row''s own unchanged position), so no test forces
  it, but the mismatch exists in the code as written and is not proved either way here.'
- 'That a move still emits moved: true through the mutation''s new vars.kind === "move" computation. The
  behavior itself is unchanged and preserved by this task, and its telemetry payload is not asserted by
  any existing spec — per the framework''s own rule against writing new behavioral tests over a rearrangement
  of what already works, this absence is recorded here rather than covered by a new test.'
- Any end-to-end path from the rendered VersionManifestScreen to onRepin, since no control in that screen
  invokes it yet — wiring a Select to call onRepin is the sibling task row-revision-select's, deferred
  by this task's own Notes. Every test here calls onRepin directly through renderHook.
---

## What it is
Twelve behavioral tests over useManifestBuilder's new onRepin action, driven directly through renderHook, proving all 12 criteria: the exact PUT sent, the manifest re-read (not a local patch), the blocked/generic-failure/per-row-error responses to a refusal, and telemetry that never reports a repin as a move.

## Notes
The onError branch's behavior for a hypothetical ManifestPositionOccupiedError on a repin is left untested — structurally unreachable per the task's own REMAINDER note, but the mismatch in the code (it would route into the move-error UI text) is disclosed rather than silently assumed safe.
Every test calls onRepin directly; no test yet exercises it from a rendered control, since that control belongs to the sibling task row-revision-select.
