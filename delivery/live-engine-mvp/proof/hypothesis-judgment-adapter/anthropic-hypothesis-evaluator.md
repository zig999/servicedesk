---
title: Proof for the production Anthropic hypothesis-evaluator adapter
summary: Mocks @anthropic-ai/sdk as a boundary to prove the no-data short-circuit, prompt purity and content,
  the no-tools request, response parsing across all three verdicts and every failure path, and the apiKey/maxTokens/model
  inferences the implementation recorded — and updates two sibling module-audit specs (single-implementer
  count, and the shared forbidden-package sweep) for a second, legitimate infrastructure adapter.
implementation: sha256:0c8860b76a360ef805fe5c8b573b2b9a3c5f3b784b289e735424ed3990aba572
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/hypothesis-judgment-adapter-anthropic-hypothesis-evaluator-suite-3
tests:
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: answers inconclusive with reason no-data, citing exactly the evidence items whose result is not
    ok
  proves: an inconclusive/no-data reason must cite exactly the evidence whose result is not ok, not an
    empty citations array
  fails_when: the adapter omits a non-ok evidence item from the no-data citations, includes an ok item
    among them, or answers no-data with an empty citations array
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: never calls the provider when the evidence carries any non-ok result
  proves: the no-data short-circuit itself
  fails_when: messages.create is called even though the evidence carries a non-ok result
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: sends byte-identical prompt content across two calls carrying the same criterion, evidence and
    case context
  proves: prompt assembly is a pure function of the same four inputs
  fails_when: the two calls' prompt content differ
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: carries the given criterion, evidence observation, case title and case when_to_use inside one
    delimited block
  proves: all four permitted facts enter the one <judgment_input> block
  fails_when: any of the four given facts is missing from the prompt, or the outer wrapper is absent
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: escapes reserved XML characters in the criterion so the closed data block cannot be broken out
    of
  proves: the wire format's escaping of reserved characters in inserted content
  fails_when: a raw '<', '>' or '&' from the criterion reaches the prompt unescaped
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: declares no tools field on the provider request
  proves: the provider request grants the model no tools
  fails_when: the request sent to messages.create carries a tools key at all
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: parses a well-formed confirmed answer into the confirmed verdict with its citations
  proves: a decided verdict is returned with its citations
  fails_when: a well-formed confirmed model answer is not returned as confirmed with exactly its own citations
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: parses a well-formed refuted answer into the refuted verdict with its citations
  proves: the refuted path
  fails_when: a well-formed refuted model answer is not returned as refuted with exactly its own citations
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: maps the model's own well-formed inconclusive answer to reason judgment-failure
  proves: the model's own inconclusive answer maps to judgment-failure, never no-data or deadline-exceeded
  fails_when: a well-formed inconclusive model answer is mapped to any other reason, or is thrown
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: answers inconclusive with reason judgment-failure when the model response is not valid JSON
  proves: the adapter never throws, demoting an unparseable answer to inconclusive/judgment-failure
  fails_when: a non-JSON model response throws, or is answered as anything but inconclusive/judgment-failure
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: answers inconclusive with reason judgment-failure when the model response is valid JSON but matches
    none of the three declared shapes
  proves: a malformed but valid-JSON answer never becomes a decided verdict or an unrecognized reason
  fails_when: a JSON value matching none of the three declared shapes is accepted as a verdict, or throws
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: answers inconclusive with reason judgment-failure when a confirmed answer carries no citations
  proves: a decided verdict is never accepted without at least one citation
  fails_when: a confirmed or refuted answer with an empty citations array is accepted as decided rather
    than demoted
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: answers inconclusive with reason judgment-failure, never throwing, when the provider call itself
    rejects
  proves: a provider failure never throws out of evaluate()
  fails_when: a rejected provider call throws out of evaluate(), or is answered as anything but inconclusive/judgment-failure
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: reads the credential from ANTHROPIC_API_KEY when the constructor is given no apiKey
  proves: apiKey defaults to process.env.ANTHROPIC_API_KEY
  fails_when: the client is constructed with an apiKey other than the environment value when none was
    configured
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: defaults the token ceiling to 1024 when the caller configures none
  proves: maxTokens defaults to 1024
  fails_when: the request's max_tokens is anything other than 1024 by default
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: sends the caller's own configured token ceiling instead of the default
  proves: the maxTokens option actually reaches the request
  fails_when: an explicitly configured maxTokens does not reach the request
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: sends exactly the model the caller configured, not a hardcoded default
  proves: the configured model flows through unmodified
  fails_when: the request's model field is anything other than the caller's own configured model string
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator-modules.spec.ts
  name: imports exactly one external package — @anthropic-ai/sdk — and no other HTTP client library
  proves: the adapter imports @anthropic-ai/sdk for the call and no other HTTP client library
  fails_when: the file imports any external package other than @anthropic-ai/sdk
- file: src/__tests__/unit/investigation/hypothesis-evaluator-modules.spec.ts
  name: IHypothesisEvaluator is implemented only by its own adapters — the fake and the production Anthropic
    adapter — and nothing else in the shared directory
  proves: constraints/judgment-runs-behind-a-port's own fitness, updated to admit this task's own second,
    legitimate implementer
  fails_when: a class other than the fake or the Anthropic adapter implements IHypothesisEvaluator, or
    either stops implementing it
not_applicable:
- edge_case: two evaluate() calls against the port running concurrently
  why: the cross-call isolation guarantee belongs to constraints/hypotheses-are-judged-in-isolated-parallel-calls,
    owned by the judgment stage above this port; this adapter carries no shared mutable state across calls
    beyond immutable construction-time configuration
- edge_case: a provider call that answers slowly, or a deadline expiring during it
  why: evaluate()'s own signature carries no deadline parameter, and reason 'deadline-exceeded' is never
    produced anywhere in this file's code
- edge_case: a duplicate concept name across two evidence items
  why: no node or criterion this task implements claims evidence concepts are unique within one call
untested:
- whether an empty evidence array (no concepts collected at all, as opposed to one whose result is not
  ok) is treated as no-data or sent to the model as an empty block — no criterion or Notes entry addresses
  evidence cardinality, only the per-item result
- escaping of reserved characters at the other three insertion points (evidence observation text, evidence
  concept attribute, case title/when_to_use text) — only the criterion insertion point is exercised; all
  four route through the same two shared helpers, so this is a narrower risk than an independently-implemented
  per-field escape, but remains unexercised for those three
---

## What it is

A mocked-SDK suite proves the no-data short-circuit, prompt purity and content, the no-tools request, and every verdict/failure path; two sibling module-audit specs updated for a second legitimate infrastructure adapter.

## Notes

observation-source-modules.spec.ts's own KNOWN_INFRASTRUCTURE_ADAPTERS exclusion list (already grown once by the sibling anthropic-assessment-consolidator task) grew again to admit this adapter's own intended @anthropic-ai/sdk import.
