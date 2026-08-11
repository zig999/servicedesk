---
title: Proof for the production Anthropic-backed assessment-consolidator adapter
summary: New tests exercise AnthropicAssessmentConsolidator against a mocked @anthropic-ai/sdk client,
  proving the no-tools request, the pure and delimited prompt assembly, the trimmed-text-only return,
  the credential and import boundary, and two pre-existing spec files updated to keep the suite green
  now that a second concrete IAssessmentConsolidator legitimately exists.
implementation: sha256:0a848e8aa504f34d24dcb2aa362b0a17ad93d229a7dc5c582ca6205c316ab200
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/assessment-consolidation-adapter-anthropic-assessment-consolidator-suite
tests:
- file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
  name: asks the model with no tools field in the request
  proves: The provider request grants the model no tools.
  fails_when: the request object passed to messages.create carries a tools key
- file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
  name: wraps exactly the given evaluations, evidence and register in one <CONSOLIDATION_DATA> block
  proves: The evaluations, the evidence and the register sit inside one delimited data block; no hypothesis's
    own criterion and no case when_to_use enters the prompt.
  fails_when: the user message content is not exactly the delimited JSON.stringify payload, from a changed
    delimiter, a renamed key, or an extra field
- file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
  name: produces a well-formed, empty data block when given no evaluations and no evidence
  proves: the delimited data block behaves correctly at the empty-collection edge case
  fails_when: consolidate([], [], register) throws, or the parsed data block does not match the given
    inputs
- file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
  name: produces byte-identical prompt content across two calls given the same evaluations, evidence and
    register, even passed as freshly-constructed copies
  proves: The adapter's prompt-assembly step is a pure function of the given evaluations, evidence and
    consolidation register.
  fails_when: the system string or data-block content differs between two calls made with content-equal
    but non-reference-equal inputs
- file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
  name: varies the system prompt with the consolidation register, given the same evaluations and evidence
  proves: the implementation's own inference that each closed register maps to its own writing-style sentence
  fails_when: the system prompt sent for 'formal' equals the one sent for 'plain'
- file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
  name: returns exactly the model's own text content, trimmed of surrounding whitespace
  proves: consolidate() returns the text alone — never an outcome, a referral or a determining hypothesis.
  fails_when: the resolved value is not the trimmed text content, or is some other shape
- file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
  name: rejects with an error rather than answering an empty string when the response carries no text
    content block
  proves: the implementation's own inference that textOf() throws when the response carries no text content
    block
  fails_when: consolidate() resolves instead of rejecting when the content array is empty
- file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
  name: propagates a provider failure rather than swallowing it
  proves: a dependency failure reaches the caller unchanged
  fails_when: a rejection from messages.create is swallowed, replaced, or its message lost
- file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
  name: constructs the Anthropic client with the config-supplied API key when one is given
  proves: the optional constructor apiKey field is honored
  fails_when: the client is constructed with anything other than the given key
- file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
  name: falls back to ANTHROPIC_API_KEY from the environment when the config supplies no apiKey
  proves: the STK-11 credential-from-environment fallback
  fails_when: the client is constructed with an apiKey other than the environment variable's value
- file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
  name: imports @anthropic-ai/sdk for the call
  proves: The adapter imports @anthropic-ai/sdk for the call and no other HTTP client library. (positive
    half)
  fails_when: the adapter's source no longer imports '@anthropic-ai/sdk'
- file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
  name: imports no other HTTP client library beside @anthropic-ai/sdk
  proves: The adapter imports @anthropic-ai/sdk for the call and no other HTTP client library. (negative
    half)
  fails_when: the adapter's source imports any other HTTP client
- file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
  name: assessment-consolidator.port.ts, consolidation-register.ts, evaluation.ts and evidence.ts import
    no LLM or provider client, so the live call sits outside them
  proves: the domain layer stays free of the LLM client
  fails_when: any of those four files imports '@anthropic-ai/sdk'
- file: src/__tests__/unit/investigation/assessment-consolidator-modules.spec.ts
  name: ships exactly two concrete classes implementing IAssessmentConsolidator (updated from the prior
    "exactly one" assertion)
  proves: this task's own intended addition of a second implementation is not a regression
  fails_when: the set of files implementing IAssessmentConsolidator changes from the fake and the live
    adapter
not_applicable:
- edge_case: a boundary at each end of a numeric range (model name length, maxTokens value)
  why: no criterion or specification node states a bound on either
- edge_case: a duplicate where uniqueness is claimed
  why: none of this task's five criteria claim any uniqueness
- edge_case: an operation attempted against state that forbids it
  why: the adapter holds no state machine — consolidate() is a single stateless call
- edge_case: two operations against one subject at once
  why: the class holds no mutable state across calls
- edge_case: absent/missing required input at a boundary
  why: this is an internal port, not an HTTP boundary; TypeScript's required parameters make absence a
    compile-time-refused case
untested:
- the literal wording of the system prompt's writing instruction and the two register-to-style sentences
  is deliberately left untested beyond proving the system prompt varies by register — pinning exact prose
  would test phrasing the record itself says is arbitrary
- that case.ts and investigation-factory.ts stay free of an @anthropic-ai/sdk import is not re-proven
  here — both are already covered by investigation-factory-modules.spec.ts and case-document-modules.spec.ts's
  own pre-existing forbidden-package sweeps
---

## What it is

Fourteen tests over a mocked Anthropic client prove the no-tools request, prompt purity, the text-only return, the credential fallback and the domain import boundary; two pre-existing spec files updated for a legitimately second adapter.

## Notes

observation-source-modules.spec.ts's own forbidden-package sweep (which scans every file directly under src/investigation, unlike its sibling specs) would have flagged this adapter's intended @anthropic-ai/sdk import; added a narrowly-scoped exclusion by file name rather than rescoping the sweep, preserving its incidental coverage of evaluation.ts/evidence.ts.
