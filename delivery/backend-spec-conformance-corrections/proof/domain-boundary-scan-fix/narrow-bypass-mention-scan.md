---
title: Bypass-mention scan's specification-node exemption, proven directly against its own extracted logic
summary: Byte-extracts and compiles the ninth test's new HTTP_CONNECTOR_MENTION/everyHttpConnectorMentionIsANodeIdentityCitation
  logic from domain-depends-on-no-infrastructure.spec.ts and exercises the real, deployed function against
  the actual observation-source.port.ts citation and against synthetic real references, proving both criteria
  of task/domain-boundary-scan-fix/narrow-bypass-mention-scan without reimplementing or exporting anything.
implementation: sha256:9d15263498a679409b58fa5b6e20275d45b212dbd46b4239b029c634506580a1
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/domain-boundary-scan-fix-narrow-bypass-mention-scan-suite
tests:
- file: src/__tests__/unit/domain-depends-on-no-infrastructure-bypass-mention-scan.spec.ts
  name: exempts observation-source.port.ts's own real, unchanged citation of rules/integration/an-http-connector-configuration-declares-its-call
  proves: Given src/investigation/observation-source.port.ts's own existing comment citing rules/integration/an-http-connector-configuration-declares-its-call,
    unchanged, the domain-boundary suite test no longer reports this file as an offender.
  fails_when: the real file's http-connector mention stops sitting entirely inside the cited identity's
    matched range, or everyHttpConnectorMentionIsANodeIdentityCitation stops returning true for it
- file: src/__tests__/unit/domain-depends-on-no-infrastructure-bypass-mention-scan.spec.ts
  name: exempts a synthetic comment citing that same specification-node identity, standing alone
  proves: criterion 1, isolated from the real file so a failure points at the exemption logic itself
  fails_when: everyHttpConnectorMentionIsANodeIdentityCitation returns false for a source whose only http-connector
    occurrence sits entirely inside a domain/rules/scenarios/contracts-branch identity citation
- file: src/__tests__/unit/domain-depends-on-no-infrastructure-bypass-mention-scan.spec.ts
  name: exempts a citation using the single-segment constraints/<slug> grammar, when that slug itself
    contains http-connector
  proves: SPECIFICATION_NODE_IDENTITY_PATTERN's second alternation branch (constraints/<slug>) is honored
    the same way the context/slug branch is
  fails_when: everyHttpConnectorMentionIsANodeIdentityCitation returns false for a source whose only http-connector
    occurrence sits entirely inside a constraints/<slug> identity citation
- file: src/__tests__/unit/domain-depends-on-no-infrastructure-bypass-mention-scan.spec.ts
  name: still reports a real reference to the http-connector module, such as a relative import specifier
  proves: Given a domain module outside the one legitimate HTTP adapter that imports from, or otherwise
    textually references, the actual http-connector module (not merely a specification-node identity containing
    that substring), the same test still reports it as an offender.
  fails_when: everyHttpConnectorMentionIsANodeIdentityCitation returns true for a source whose http-connector
    mention is a real import specifier with no specification-node identity around it at all
- file: src/__tests__/unit/domain-depends-on-no-infrastructure-bypass-mention-scan.spec.ts
  name: still reports a real reference sitting beside a legitimate citation in the same source, since
    the exemption is per-occurrence
  proves: criterion 2 in the shape the implementation record's how calls out — a file mixing a legitimate
    citation with a real reference still reports
  fails_when: everyHttpConnectorMentionIsANodeIdentityCitation returns true for a source holding one cited-identity
    occurrence and one separate, real occurrence of http-connector
- file: src/__tests__/unit/domain-depends-on-no-infrastructure-bypass-mention-scan.spec.ts
  name: still reports http-connector sitting beside a slug that does not satisfy the specification-node
    identity grammar
  proves: criterion 2's boundary — the exemption is grammar-strict, not a bare-substring match
  fails_when: everyHttpConnectorMentionIsANodeIdentityCitation returns true for a source whose http-connector
    mention sits beside domain/ with no second segment closing the identity
not_applicable:
- edge_case: calling everyHttpConnectorMentionIsANodeIdentityCitation with an empty source or one containing
    no http-connector mention at all
  why: the ninth test's own offender loop only calls this function after source.includes(HTTP_CONNECTOR_MENTION)
    has already returned true for that occurrence, so this input is unreachable from the deployed scan
- edge_case: a real http-connector reference whose characters straddle the edge of a matched specification-node
    identity, partially inside and partially outside its range
  why: SPECIFICATION_NODE_IDENTITY_PATTERN's slug segments are hyphen-inclusive and greedy, so any lowercase/digit/hyphen
    text immediately following a valid identity prefix is absorbed into that same match rather than left
    dangling outside it; a genuine import specifier never begins by continuing an identity's own slug
    characters with no separator
- edge_case: two calls to everyHttpConnectorMentionIsANodeIdentityCitation running concurrently against
    different sources
  why: it is a pure, synchronous, side-effect-free string function with no shared mutable state between
    the two criteria fixtures
untested:
- the ninth test's own offender-loop wiring inside domain-depends-on-no-infrastructure.spec.ts itself
  is not independently re-driven by this proof; it is exercised only by that test's own execution over
  the real codebase during the delivered suite run, which this proof relies on rather than duplicates
- specificationNodeIdentityRanges' own index arithmetic is exercised only indirectly, through everyHttpConnectorMentionIsANodeIdentityCitation's
  containment decision — no test here asserts the exact start/end pair it returns for a given match
divergences:
- cites: TST-04
  file: src/__tests__/unit/domain-depends-on-no-infrastructure-bypass-mention-scan.spec.ts
  departure: this file does not mirror the path of a src/ unit under test, because there is none — the
    logic it proves is declared inside domain-depends-on-no-infrastructure.spec.ts itself rather than
    in a production module, since the corrective task's own implementation lives inside a test file. It
    sits beside that file, in the same src/__tests__/unit/ directory, named for the specific scanning
    logic it isolates.
  why: TST-04's rule presupposes a production unit with its own path to mirror; this corrective task's
    subject is a test file, so no such path exists to mirror. TST-04 is not currently tool-encoded in
    eslint.config.js, so this departure is disclosed rather than caught by the lint step.
---

## What it is

Six tests, over the real HTTP_CONNECTOR_MENTION/everyHttpConnectorMentionIsANodeIdentityCitation logic extracted and compiled from the fixed file at test time, proving the specification-node citation exemption and the still-catches-a-real-reference guarantee.

## Notes

None.
