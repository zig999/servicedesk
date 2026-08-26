---
title: Domain-boundary bypass-mention scan no longer flags a cited specification-node identity
summary: The ninth test in domain-depends-on-no-infrastructure.spec.ts narrows its http-connector bare-mention
  scan so a citation of a specification-node identity that merely contains that substring in its own slug
  no longer reports the citing file as an offender, while every other bypass mention still reports, for
  task/domain-boundary-scan-fix/narrow-bypass-mention-scan.
task: sha256:926258ef27b23152a86b9c5f4c856188d9c61f8b93c0a816da7c77cae90976c2
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/domain-boundary-scan-fix-narrow-bypass-mention-scan-build
files:
- path: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
  effect: adds HTTP_CONNECTOR_MENTION (the shared literal), SPECIFICATION_NODE_IDENTITY_PATTERN (matching
    a cited specification-node identity by the grammar (domain|rules|scenarios|contracts)/<slug>/<slug>
    or constraints/<slug>), specificationNodeIdentityRanges (the index ranges those citations span in
    a source text) and everyHttpConnectorMentionIsANodeIdentityCitation (true only when every occurrence
    of http-connector in a module's source sits entirely inside one of those cited-identity ranges). The
    ninth test's offender loop now skips the http-connector mention for a file where that function returns
    true, leaving every other bypass mention and every http-connector occurrence not fully contained in
    a cited identity unchanged — still an offender.
criteria:
- criterion: Given src/investigation/observation-source.port.ts's own existing comment citing rules/integration/an-http-connector-configuration-declares-its-call,
    unchanged, the domain-boundary suite test no longer reports this file as an offender.
  met: true
  how: observation-source.port.ts's only occurrence of http-connector sits entirely inside the cited identity
    rules/integration/an-http-connector-configuration-declares-its-call, which SPECIFICATION_NODE_IDENTITY_PATTERN
    matches in full. everyHttpConnectorMentionIsANodeIdentityCitation finds this one, and only this one,
    inside a matched range, returns true, and the ninth test's loop skips this mention for this file.
    The file itself was not touched, per the criterion's own "unchanged."
- criterion: Given a domain module outside the one legitimate HTTP adapter that imports from, or otherwise
    textually references, the actual http-connector module (not merely a specification-node identity containing
    that substring), the same test still reports it as an offender.
  met: true
  how: A relative import specifier, a dynamic-lookup string or a service-locator key naming the http-connector
    module never matches SPECIFICATION_NODE_IDENTITY_PATTERN, which only matches text beginning with domain/,
    rules/, scenarios/, contracts/ or constraints/. So everyHttpConnectorMentionIsANodeIdentityCitation
    returns false the moment it reaches such an occurrence, and the loop falls through to offenders.push,
    exactly as before this change. The narrowing is per-occurrence, so a file mixing a legitimate citation
    with a real reference still reports.
nodes:
- node: constraints/the-domain-depends-on-no-infrastructure
  encoded_at:
  - src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
  how: This file is the constraint's own fitness check — "a dependency audit over the domain modules'
    imports finds no framework, driver or client package" — extended in its own header comments to also
    cover a bypass mention nothing wrote as a static import. This task corrects that fitness check's ninth
    test, which had been reporting a false positive (a specification-node identity citation, not a real
    coupling) as if it were the infrastructure dependency the constraint forbids. Narrowing the scan keeps
    the constraint enforced against every real reference while no longer requiring, in effect, that a
    domain module's comments avoid citing a rule whose own slug happens to contain http-connector — a
    requirement the constraint's statement never made.
preserved:
- The other nine tests in this file (drivers/frameworks, connection module, LLM provider client, connector-configuration
  store, HTTP client packages, connection-module location, connector-request-resolver imports, connector-placeholder-error
  imports, the http-declarative-observation-source-adapter import check) are untouched and their behavior
  is unchanged.
- The bypass-mention scan still fires on every occurrence of http-connector that falls even partly outside
  a cited specification-node identity, and still fires unchanged on the other four bypass mentions (connector-request-resolver,
  connector-call-descriptor, resolveConnectorRequest, asConnectorCallDescriptor) regardless of where they
  appear.
- The HTTP_DECLARATIVE_OBSERVATION_SOURCE_ADAPTER_KEY exclusion — the one legitimate HTTP adapter skipped
  by the ninth test entirely — is unchanged.
---

## What it is

The domain-boundary suite's bypass-mention scan for "http-connector" no longer flags a specification-node identity cited in a comment, while still catching a real reference to the http-connector module from outside the one legitimate HTTP adapter.

## Notes

None.
