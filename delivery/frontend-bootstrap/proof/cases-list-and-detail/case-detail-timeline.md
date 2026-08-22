---
title: Proof for the Case Detail version timeline
summary: Eight tests prove case-detail-timeline's four criteria plus two of its own disclosed inferences (URL-encoding the slug, the loading/failure placeholders), rendering CaseDetailScreen inside a self-contained test router and QueryClientProvider with a stubbed fetch.
implementation: sha256:33a44e31afaf59ac31ac0709dc01fc2a3cafcdecf4d5b1ec2c43fa74d4019f15
run: run/cases-list-and-detail-onda-2-full-suite-2
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:b65918f325b77f594c710dd4a2e790fbd0998b66fc07363b1fd0b01a1ce6d631
tests:
  - file: src/routes/case-detail-screen.spec.ts
    name: renders one row per returned version, with its number and its state as a color-and-label cell
    proves: Visiting a case's detail route renders one row per version returned by GET /v1/cases/:slug/versions, each showing that version's number and its state as a { color, label } cell.
    fails_when: the rendered table shows a different number of rows than versions returned, a row's version number or state label text does not match, or the state cell's color indicator element is absent for either state
  - file: src/routes/case-detail-screen.spec.ts
    name: shows Continue editing on the draft version's row and not on the released version's row
    proves: A version whose state is draft shows a "Continue editing" action.
    fails_when: '"Continue editing" is missing from the draft row, or present on the released row'
  - file: src/routes/case-detail-screen.spec.ts
    name: renders Continue editing as a router Link to that version's own route
    proves: Clicking "Continue editing" navigates to that version's own route immediately, performing no additional request first.
    fails_when: the "Continue editing" element is not a link, or its href does not equal "/cases/some-slug/versions/7" for that version
  - file: src/routes/case-detail-screen.spec.ts
    name: renders every version the endpoint returns, not only the most recently opened one
    proves: The timeline renders every version the endpoint returns, not only the most recently opened one.
    fails_when: fewer than the four given versions appear as rows, or any one of the version numbers 1 through 4 is missing from its own row
  - file: src/routes/case-detail-screen.spec.ts
    name: URL-encodes the slug before requesting its version list
    proves: the implementation's own inference that the slug is URL-encoded (encodeURIComponent) before being interpolated into the request path
    fails_when: the mocked fetch is called with a request path carrying the decoded, unencoded "&" instead of "%26"
  - file: src/routes/case-detail-screen.spec.ts
    name: renders no data rows when the endpoint returns no versions
    proves: the empty-collection edge case for the same row-per-version mapping the first and fourth criteria establish -- an empty response degrades to an empty table rather than throwing or hanging
    fails_when: an empty versions response renders any data row, or throws
  - file: src/routes/case-detail-screen.spec.ts
    name: shows a loading placeholder before the version list arrives
    proves: 'the implementation''s own inference that a pending query renders "Loading version timeline…" rather than an empty or broken screen'
    fails_when: the loading text is absent while the request is still pending, or the table renders before data arrives
  - file: src/routes/case-detail-screen.spec.ts
    name: shows a failure placeholder when the version list request fails
    proves: 'the implementation''s own inference that a failed query renders "Unable to load this case''s version timeline." rather than an empty or broken screen'
    fails_when: the failure text is absent after the request rejects, or a table renders anyway
not_applicable:
  - edge_case: a boundary at either end of a numeric range
    why: no criterion or node this task implements bounds version numbers or a count of versions; there is no range for a boundary test to sit at
  - edge_case: a duplicate among the returned versions
    why: uniqueness of version numbers is a fact about the store's own invariant (rules/knowledge/every-case-version-remains-readable), not something this read-only screen enforces or is asked to test for
  - edge_case: an operation attempted against state that forbids it
    why: this task ships no write operation -- it is a GET rendered read-only, and "Continue editing" is asserted only as a Link's href, never triggered -- so there is no forbidden-state refusal for this screen to raise
  - edge_case: two operations against one subject at once
    why: there is no mutation in this task's scope for two to race against; the one request this screen issues is a single GET per render
  - edge_case: absent slug input
    why: the route "/cases/$slug" cannot match with no slug segment -- the router itself refuses that path before CaseDetailScreen ever mounts, so there is no absent-slug state for this screen's own render logic to handle
untested:
  - "the inference that each row's id is set to the version number rather than left to StatusTable's fallback JSON.stringify(row) key: this choice has no distinct effect observable through rendered text, roles, or attributes in a single render, and the difference it exists to avoid (a circular-reference risk in the fallback path when a row carries a React element) only bears on an internal reconciliation/key-stability property, not on anything a user-facing query can assert without inspecting React internals"
---

## What it is
Eight tests over CaseDetailScreen, rendered inside a self-contained test router and QueryClientProvider with a stubbed fetch: the four stated criteria plus the loading/failure placeholders and slug-encoding the implementation record discloses as inferences.

## Notes
None.
