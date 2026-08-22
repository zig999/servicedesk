---
title: Proof for the reusable ConflictBanner component
summary: Three render-based tests over a real jsdom tree confirm ConflictBanner's title, message and banner landmark; the accent criterion is not tested here because the implementation record already records it as genuinely unmet.
implementation: sha256:1e4713861166c91aee139684d3200eb16056cdaa598264d7daa7f480f2bfd807
run: run/frontend-console-foundation-onda-1-full-suite-2
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:b65918f325b77f594c710dd4a2e790fbd0998b66fc07363b1fd0b01a1ce6d631
tests:
  - file: src/shared/components/conflict-banner.spec.ts
    name: renders the given title as Banner's own heading
    proves: ConflictBanner accepts a title and renders it (the title half of "accepts a title and a message and renders both")
    fails_when: the given title text is not rendered as a heading, or a different string reaches that heading
  - file: src/shared/components/conflict-banner.spec.ts
    name: renders the given message as visible text, carried through as Banner's subtitle
    proves: ConflictBanner accepts a message and renders it (the message half of the same criterion)
    fails_when: the given message text is not present anywhere in the rendered output
  - file: src/shared/components/conflict-banner.spec.ts
    name: renders through Banner's own markup, carrying the banner landmark, rather than bespoke conflict markup
    proves: ConflictBanner renders through TUI's Banner primitive rather than new banner markup, evidenced by the implicit "banner" ARIA landmark that only Banner's frame="none" branch (a bare header, unnested in sectioning content) produces -- bespoke markup built by hand would not reliably produce it
    fails_when: no element carries the "banner" role, which would happen either because bespoke markup replaced Banner, or because a future change moved ConflictBanner to Banner's frame="notched" (a plain "region", not "banner" -- see the implementation record's divergence)
not_applicable:
  - edge_case: a boundary value at each end of a numeric or size-bound range
    why: ConflictBannerProps declares only two required strings (title, message); there is no numeric or size-bound prop
  - edge_case: an empty collection where one comes back
    why: the component takes no collection prop and renders no list
  - edge_case: a duplicate where uniqueness is claimed
    why: no criterion or prop claims any uniqueness over ConflictBanner's inputs
  - edge_case: an operation against state that forbids it
    why: ConflictBanner holds no state of its own -- it is a pure function of its props
  - edge_case: a dependency that fails or answers slowly
    why: the component calls no service, no network and no clock
  - edge_case: two operations against one subject at once
    why: rendering is not a mutating operation and the component holds no shared mutable subject
untested:
  - "\"ConflictBanner reuses Banner's existing accent prop to signal a conflict\" has no test here because the implementation record already records this criterion as met: false, with the reasoning for why it is genuinely unmet rather than satisfiable -- a test could only prove a no-op prop is passed, which proves nothing about signaling a conflict, so no test was written for it."
---

## What it is
Three tests exercising ConflictBanner's rendered output for real, over jsdom: the title heading, the message text, and the "banner" ARIA landmark that only Banner's default frame produces. Written after `test.environment: "jsdom"` and `test.globals: true` were authorized and wired -- the same file previously proved only that the component was a callable export.

## Notes
Supersedes an earlier proof of this task that could only assert "is a callable export", for want of a DOM test environment. That gap is closed as of this record (jsdom now authorized and wired).
