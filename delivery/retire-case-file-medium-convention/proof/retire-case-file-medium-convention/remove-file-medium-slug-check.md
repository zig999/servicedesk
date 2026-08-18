---
title: Test fallout from retiring the case file-medium slug convention
summary: Fixes the five test files broken by parseCaseDocument's fileName-to-slug signature change and
  CASE_DOCUMENT_ENDING's removal, removes the one test that exercised the retired slug-equals-file-name
  refusal, repurposes another into a genuine proof of the new no-equality-check behavior, and adds one
  test closing criterion 2's previously untested claim.
implementation: sha256:bbd2196694a62e6b0ad27f51d9b1ed0bd57ca67e2fbec4d436f4f61278ed0b0d
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/retire-case-file-medium-convention-remove-file-medium-slug-check-suite
tests:
- file: src/__tests__/unit/case/parse-case-document.spec.ts
  name: parses a document declaring every attribute into the one case aggregate, splitting each manifest
    entry into its own position and nested hypothesis-revision
  proves: the worked example parses whole once parseCaseDocument's second argument is a plain slug rather
    than a file name
  fails_when: parseCaseDocument stops accepting a bare slug as its second argument, or the parsed aggregate
    stops matching the worked example
- file: src/__tests__/unit/case/parse-case-document.spec.ts
  name: parses a document whose declared slug shares nothing with the second argument, since no equality
    check runs between them any longer
  proves: Reading a case version through case-query.service.ts's readCase no longer refuses it for any
    relationship between the case's slug and a file name — parse-case-document.ts's structural parse takes
    no fileName argument and runs no slug-equals-file-name check.
  fails_when: parseCaseDocument reintroduces any equality check between its second argument and the document's
    own declared slug, or the returned case's slug stops reflecting the document's own declared slug
- file: src/__tests__/unit/case/parse-case-document.spec.ts
  name: refuses an empty slug with exactly one problem
  proves: an empty slug is reported once (slug is empty) with no second, now-impossible mismatch problem
    alongside it
  fails_when: an empty slug is reported with more or fewer than exactly one problem, or with a different
    problem than 'slug is empty'
- file: src/__tests__/unit/case/parse-case-document.spec.ts
  name: refuses a document violating several structural rules once, naming every violation
  proves: a document failing several structural rules at once is refused with exactly those violations
    and no extra one, now that a slug/file-name mismatch can never be among them
  fails_when: the refusal's problem count or contents drift from the five structural violations this fixture
    actually declares
- file: src/__tests__/unit/case/case-document-modules.spec.ts
  name: case.ts exports no CASE_DOCUMENT_ENDING or any other file-name-medium constant, CASE_VERSION_STATES
    the only runtime value it declares
  proves: case.ts declares no CASE_DOCUMENT_ENDING export or any other file-name-medium constant.
  fails_when: case.ts reintroduces CASE_DOCUMENT_ENDING or declares any other runtime export beyond CASE_VERSION_STATES
- file: src/__tests__/unit/fixtures/case-fixture-shape.spec.ts
  name: all seven existing tests in this file, unchanged in assertion, now calling parseCaseDocument(raw,
    SLUG)
  proves: the curated fixture case still parses correctly once its own loader passes a bare slug rather
    than a file-name-shaped string
  fails_when: parseCaseDocument stops accepting SLUG as a plain string, or any of this file's own pre-existing
    structural/shape assertions regress
- file: src/__tests__/unit/fixtures/case-fixture-observations.spec.ts
  name: both existing tests in this file, unchanged in assertion, now calling parseCaseDocument(raw, SLUG)
  proves: the fixture's canned-observation coverage still loads correctly through the updated loadFixtureCase()
  fails_when: loadFixtureCase() stops working with a plain slug argument
- file: src/__tests__/unit/fixtures/case-fixture-glossary-and-capability-coverage.spec.ts
  name: all five existing tests in this file, unchanged in assertion, now calling parseCaseDocument(raw,
    SLUG)
  proves: the fixture's glossary/capability coverage checks still load correctly through the updated loadFixtureCase()
  fails_when: loadFixtureCase() stops working with a plain slug argument
untested:
- 'Criteria 3 and 4 (case-query.service.ts''s structuralCase and release.operation.ts''s structuralOutcome
  pass the case''s own already-known slug, never a synthesized file name) are not proven by any runtime
  behavioral test in case-query.service.spec.ts or release.operation.spec.ts. In both files'' fixtures,
  AssembledCaseVersion.slug is always constructed identical to the slug the caller queried by, so no fixture
  can produce an observable difference between ''the bare slug was passed to parseCaseDocument'' and ''some
  string derived from that same slug was passed instead''. Verified instead by reading the source: both
  call sites now import case.js as type-only (CASE_DOCUMENT_ENDING is gone, so no runtime value could
  be synthesized even if a call site tried), and parse-case-document.spec.ts''s own repurposed test proves
  the layer underneath tolerates any second argument at all, mismatched or not.'
divergences:
- from: The task's own instructions, which named the stale-citation fix only for case-document-modules.spec.ts's
    header comment
  departure: Also fixed the identical stale citation of the retired constraints/a-case-is-stored-as-one-json-document
    and rules/knowledge/the-slug-matches-the-file-name in case-fixture-shape.spec.ts's own header comment.
  why: The same category of stale citation the task explicitly asked to be fixed in a sibling file; leaving
    this file's identical citation untouched would leave a domain fact the specification no longer holds
    stated in a test file, which this project's own rules forbid regardless of which file it sits in.
---

## What it is

Fixes to five pre-existing test files, one test removed, one repurposed, one added — proving the corrective task's four criteria at the unit level.

## Notes

Independently verified by the orchestrating session: typecheck, lint and secret-scan all pass; the six directly affected unit spec files (101 tests) pass when run in isolation; the full suite is captured at run/retire-case-file-medium-convention-remove-file-medium-slug-check-suite.
