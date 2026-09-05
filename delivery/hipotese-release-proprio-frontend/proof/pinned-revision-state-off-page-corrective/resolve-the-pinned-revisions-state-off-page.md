---
title: Off-page pinned-revision-state resolution, proven at both presentation surfaces and in the shared hooks beneath them
summary: Proves that a manifest entry's pinned-revision-state badge and table cell resolve the pin's own state across every page of its hypothesis's revisions listing on both the version-manifest builder screen and the case-version editor's released-view table, and that the pending/failed/resolved windows stay distinct and correctly attributed to their own entry whichever read (default or off-page) is still outstanding or has failed.
implementation: sha256:d2da192b43be93efc0fe5f3ffea426817161b8f1982edcb1fbcfcedefe74f308
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/pinned-revision-state-off-page-corrective-resolve-the-pinned-revisions-state-off-page-suite-3
tests:
- file: src/hooks/use-pinned-revision-state.spec.ts
  name: keeps walking forward by each page's own offset and limit until the pinned revision turns up two pages past the default one
  proves: Criterion 1 ("a manifest row's pinned-revision-state badge states the pinned revision's own state whatever page ... including a hypothesis holding more revisions than the listing's own configured maximum page size"), at the shared hook both screens compose, and the implementation's own inference that resolution pages forward by offset/limit rather than requesting one larger page or assuming a revision-number/position relationship.
  fails_when: the off-page resolution stops after one extra page, requests one larger page instead of walking by offset/limit, or assumes a revision's number equals its position in the listing.
- file: src/hooks/use-pinned-revision-state.spec.ts
  name: states the pin could not be read once the default page's own total shows every revision has already been read without finding it
  proves: The implementation's own inference that an off-page search exhausting every page without finding the pin is treated as failed rather than left pending forever or rendered blank.
  fails_when: an exhausted search instead returns pending forever, or renders no window at all instead of "could not be read".
- file: src/hooks/use-pinned-revision-state.spec.ts
  name: still states the pin could not be read instead of retrying the same offset forever
  proves: resolveOffPageState's own termination safeguard against a further page answering with a zero limit -- the read still settles to an explicit "could not be read" rather than hanging.
  fails_when: the zero-limit guard is removed and the loop keeps re-requesting the same offset without ever settling (the test itself would time out).
- file: src/hooks/use-pinned-revision-state.spec.ts
  name: states the pin is still being read while this task's own further-page request has not yet answered
  proves: Criterion 5 ("While any read this presentation depends on ... has not yet completed -- whether ... the default revisions listing or this task's own off-page resolution -- the entry states explicitly that this pin's state is still being read"), for the off-page path specifically.
  fails_when: the off-page query's own pending state stops being reported as pending, or a different (resolved/blank) state shows before the further page has answered.
- file: src/hooks/use-pinned-revision-state.spec.ts
  name: states the pin could not be read when this task's own further-page request answers with an error
  proves: Criterion 6 ("Where a read this presentation depends on ... fails -- whether ... the default listing or this task's own off-page resolution -- the entry states explicitly that this pin's state could not be read"), for the off-page path specifically.
  fails_when: an off-page request's own error stops producing the failed status.
- file: src/hooks/use-pinned-revision-state.spec.ts
  name: renders four distinct, non-blank presentations for pending, failed, resolved-draft and resolved-released
  proves: Criterion 7 ("The three presentations ... are distinguishable from one another, and none of them is indistinguishable from an entry that carries no state at all").
  fails_when: any two of the four presentations share a label, or any label is empty.
- file: src/hooks/use-pinned-revision-state.spec.ts
  name: renders the could-not-be-read presentation instead of guessing a draft or released label
  proves: The implementation's own inference that pinnedRevisionStateCell falls back to the failed cell when a resolved item's own state value is outside draft/released, and criterion 4 ("No entry states an incorrect or stale value in place of the once-missing one").
  fails_when: pinnedRevisionStateCell instead renders a draft or released label (or throws) for a state value outside that vocabulary.
- file: src/hooks/use-manifest-pinned-revision-states.spec.ts
  name: carries the on-page entry's own state and the off-page entry's own state without either borrowing the other's value
  proves: Criterion 2 ("an entry states its pinned revision's own state whatever page ... carries that revision") together with criterion 4's "never defaulted or carried over from another entry", for the batched multi-entry hook the released-view table composes.
  fails_when: the off-page entry's own resolved state is missing, wrong, or copies the other entry's state.
- file: src/hooks/use-manifest-pinned-revision-states.spec.ts
  name: keeps the still-loading entry pending while a different entry in the same manifest has already resolved
  proves: The same criteria's independence across a batch -- one entry's pending window never leaks into or overwrites another entry's already-resolved state.
  fails_when: the pending entry instead shows a resolved or blank value, or the resolved entry's value changes because of the other entry's pending state.
- file: src/routes/version-manifest-screen-pinned-revision-state.spec.ts
  name: states the pinned revision's own state once found on a later page of a hypothesis holding more revisions than the listing's own configured maximum page size
  proves: Criterion 1, literally, at the version-manifest builder screen itself (this test replaces a prior test in this file that asserted the pre-fix defect -- no state statement for an off-page pin -- as correct). Awaits the badge's own eventual text (findByText) rather than sampling it synchronously right after the default page's own trigger resolves, since the off-page fetch this criterion depends on settles later.
  fails_when: the badge disappears or shows the wrong state when the pin sits on a page after the default one.
- file: src/routes/version-manifest-screen-pinned-revision-state.spec.ts
  name: states explicitly that the pin's state is still being read on a row whose revisions listing has not yet answered
  proves: Criterion 5 and criterion 3's "same terms" claim, for the default-listing path at this screen (this test replaces a prior test in this file that asserted the pre-fix defect -- no state statement while pending -- as correct).
  fails_when: the row instead shows nothing (as it did before this task) or a resolved value while the default listing is still pending.
- file: src/routes/version-manifest-screen-pinned-revision-state.spec.ts
  name: states explicitly that the pin's state could not be read, without crashing, on a row whose revisions listing answered with an error
  proves: Criterion 6, for the default-listing path at this screen (this test replaces a prior test in this file that asserted the pre-fix defect -- no state statement on error -- as correct).
  fails_when: the row instead shows nothing or crashes when the default listing errors.
- file: src/routes/case-version-editor-screen-view-released-pinned-revision-state.spec.ts
  name: states the pinned revision's own state once found on a later page of a hypothesis holding more revisions than the listing's own configured maximum page size
  proves: Criterion 2, literally, at the case-version editor's released-view manifest table. Awaits the cell's own eventual text (findByText) rather than sampling it synchronously right after the row is found by name, since the off-page fetch this criterion depends on settles later.
  fails_when: the table's state cell for that entry stays blank or wrong when the pin sits on a page after the default one.
not_applicable:
- edge_case: A duplicate manifest position, or two entries racing to overwrite one map key.
  why: Position uniqueness is guaranteed upstream by the manifest builder this task does not touch; this task's own criteria assert nothing about that uniqueness.
- edge_case: Two operations against the same subject at once (e.g. a concurrent write while the pin is being read).
  why: This is a read-only presentation feature with no user-triggered write path; nothing here races against itself.
- edge_case: An empty manifest, or the manifest request itself failing to load.
  why: Unchanged by this task and already covered by pre-existing, untouched tests (e.g. case-version-editor-screen-view-released.spec.ts's empty-manifest test); this task introduces no new behavior over that path.
- edge_case: constraints/listings-are-paged's own numeric clauses -- the default/maximum page size, their clamping, and the fitness test over them.
  why: The task's own Notes state this belongs to the backend work implementing list-hypothesis-revisions, not to this frontend presentation task; this proof consumes the paged shape without asserting those clauses.
untested:
- case-version-editor-ready-view.tsx's toManifestRow falls back to a pending cell for a manifest position absent from the resolved-states map. This is unreachable through the rendering surface this proof exercises, since useManifestPinnedRevisionStates always populates every manifest position from the first render onward; proving it directly would require calling the non-exported toManifestRow or fabricating an incomplete resolved-states map, neither of which a test through the public rendering surface can do.
---
## What it is

Twelve tests across four files prove the seven criteria, plus the implementation's own recorded off-page-strategy, exhaustion, and defensive-fallback inferences.

## Notes

Two of this proof's own tests originally raced the off-page resolution's own asynchrony (a synchronous assertion sampled before the further fetch settled); fixed to await the eventual text instead. A separate, real regression in the implementation (RevisionSelect's loading gate depending on the pin-state query's mount lifecycle, breaking 16 tests across 5 files) was diagnosed and fixed by the task-implementer in parallel; suite-3 is the first fully green run after both fixes landed.
