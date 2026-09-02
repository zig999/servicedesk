---
title: The newer-revision marker on a manifest row's pinned revision
summary: Tests that RevisionSelect's newer-revision marker appears exactly when a row's pinned revision
  trails the highest revision its own hypothesis's revisions listing answered, stays readable with the
  Select closed, tracks each row's own comparison basis, and never becomes an adoption control.
implementation: sha256:5e5de0663edb07d48d5d389fd45f6a7e6da83253476598a3c6bd3c3d3329389e
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/manifest-revision-repin-newer-revision-indicator-suite-2
tests:
- file: src/routes/version-manifest-screen-newer-revision-marker.spec.ts
  name: shows the newer-revision marker when the row's pinned revision is below the highest revision its
    own hypothesis's revisions listing answered
  proves: 'Criterion: A row pinning revision 1 of a hypothesis whose revisions listing answered a highest
    revision of 2 shows the newer-revision marker.'
  fails_when: The marker text is absent (or hasNewerRevision is computed false) when the row's pinned
    revision is below the answered highest.
- file: src/routes/version-manifest-screen-newer-revision-marker.spec.ts
  name: shows no marker when the row's pinned revision is the highest revision its revisions listing answered
  proves: 'Criterion: A row pinning the highest revision its revisions listing answered shows no marker.'
  fails_when: The marker renders even though the row's pinned revision equals the highest the listing
    answered.
- file: src/routes/version-manifest-screen-newer-revision-marker.spec.ts
  name: keeps the marker visible while the row's Select stands closed, without needing it opened
  proves: 'Criterion: The marker is readable while the row''s Select stands closed.'
  fails_when: The marker is absent, or only appears inside the Select's own dropdown content, while the
    listbox has never been opened.
- file: src/routes/version-manifest-screen-newer-revision-marker.spec.ts
  name: decides each row's marker against that row's own hypothesis's answered highest, never against
    another row's revision or pin
  proves: 'Criterion: The highest revision the marker is decided against is the one the revisions listing
    answered for that row''s hypothesis, never the row''s own pinned revision alone.'
  fails_when: A row's marker is decided using a basis other than its own hypothesis's own answered highest.
- file: src/routes/version-manifest-screen-newer-revision-marker.spec.ts
  name: shows no marker on a row whose revisions listing has not yet answered
  proves: 'Criterion: A row whose revisions listing has not yet answered shows no marker.'
  fails_when: The marker renders before useManifestRowRevisions's own isLoading has settled to false.
- file: src/routes/version-manifest-screen-newer-revision-marker.spec.ts
  name: shows no marker once the revisions listing has answered with no revisions at all
  proves: The implementation's own stated behavior for an empty answered page.
  fails_when: The marker renders (or the comparison throws) when the revisions listing has answered with
    zero items.
- file: src/routes/version-manifest-screen-newer-revision-marker.spec.ts
  name: still shows the marker when the row's own pinned revision is absent from the page the listing
    answered but that page's highest exceeds it
  proves: The comparison is computed from the fetched revisions independent of whether the pinned revision
    itself is among them.
  fails_when: The marker fails to render (or the Select/marker crash) when the pinned revision is absent
    from the fetched page even though the page's own highest exceeds it.
- file: src/routes/version-manifest-screen-newer-revision-marker.spec.ts
  name: removes the marker once the row is repinned to the revision the listing already answered as its
    highest
  proves: The marker recomputes reactively from the row's current pinned revision rather than being fixed
    at first render.
  fails_when: The marker keeps showing after a successful repin brings the row's pinned revision up to
    the listing's own already-answered highest.
- file: src/routes/version-manifest-screen-newer-revision-marker.spec.ts
  name: renders the marker inside the same row as the row's own Select trigger, rather than somewhere
    else on the screen
  proves: 'Recorded inference: the marker is placed as a sibling of the row''s Label/Select pair.'
  fails_when: The marker renders outside the row that holds its own Select trigger.
- file: src/routes/version-manifest-screen-newer-revision-marker.spec.ts
  name: stays a plain disclosure with no button or link role, and changes nothing about the row's pin
    when clicked, on a row whose version is released
  proves: UNDERDETERMINED, from the specification — the marker must state existence alone and offer no
    adoption on a released row.
  fails_when: The marker is implemented as (or later changed into) an actionable adopt affordance.
not_applicable:
- edge_case: A pinned revision numerically greater than the answered highest.
  why: hasNewerRevision uses a strict less-than comparison, the same branch already exercised by criterion
    2's exact-equality boundary; the domain never produces a pin exceeding what the listing has answered.
- edge_case: A duplicate revision number appearing twice in the answered listing.
  why: This task's criteria state no uniqueness claim, and highestRevision's max-reduction behavior over
    a duplicate set is already proven at the hook level in use-manifest-row-revisions.spec.ts.
- edge_case: The revisions listing's fetch failing outright.
  why: use-manifest-row-revisions.spec.ts already proves a rejected fetch leaves revisions empty and highestRevision
    undefined — the identical downstream state this proof's own empty-listing test already exercises.
- edge_case: Two repins issued against the same row at once.
  why: The Select disables itself while a repin is pending, proven by the sibling revision-select spec's
    own criterion 5 coverage; hasNewerRevision reads no disabled flag, so this task's own criteria state
    nothing different for that state.
untested:
- 'UNDERDETERMINED, from the specification — criteria 2 and 4 fix the marker''s comparison basis at "the
  highest revision the revisions listing answered" without fixing which page of that listing was read.
  No test was written for this entry: the only lever it names (reading a later page) is fixed entirely
  inside use-hypothesis-revisions.ts''s single, parameterless GET request, reachable from no code this
  task''s own file touches — settling which page is read belongs to whichever task owns the revisions-listing
  fetch itself.'
---

## What it is
Ten tests over the manifest row's newer-revision marker, proving all 5 criteria plus 3 edge cases (empty listing, pin absent from page, repin reaching the highest), the marker's placement inference, and the UNDERDETERMINED no-adoption-on-released-row gap.

## Notes
First delivered against an implementation that nested the marker inside the Label, corrupting getByLabelText lookups in this file and the sibling row-revision-select spec; the implementation was revised to render the marker as a sibling instead, and this proof's suite run confirms both files fully green.
The second UNDERDETERMINED note (which page of the listing) has no code reachable from this task's own file to test against; left untested and named as such, per the task's own Notes pointing it at the task delivering the listing's own answer order.
