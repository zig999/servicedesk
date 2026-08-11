---
title: Production Anthropic assessment-consolidator adapter
summary: A new AnthropicAssessmentConsolidator class implements IAssessmentConsolidator by calling @anthropic-ai/sdk
  with a closed, delimited prompt assembled purely from the given evaluations, evidence and consolidation
  register, granting the model no tools and returning its trimmed text alone.
task: sha256:5f97b234684836d4c0fe180febc7ea4bbc5f6d5c1070838282aec849785a2aa7
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/assessment-consolidation-adapter-anthropic-assessment-consolidator-build
files:
- path: src/investigation/anthropic-assessment-consolidator.adapter.ts
  effect: defines AnthropicConsolidatorConfig (model, maxTokens, optional apiKey) and AnthropicAssessmentConsolidator,
    a new concrete class implementing IAssessmentConsolidator against the live Anthropic API — builds
    a system prompt stating the writing task and the register's closed style, one delimited data block
    holding evaluations/evidence/register, calls messages.create with no tools field, and returns the
    trimmed text alone
criteria:
- criterion: The adapter's prompt-assembly step is a pure function of the given evaluations, evidence
    and consolidation register — the same three inputs produce byte-identical prompt content across two
    calls.
  met: true
  how: buildSystemPrompt and buildDataBlock read nothing but their own arguments — no clock, no random
    value, no mutable state; JSON.stringify's output is byte-stable for a given input
- criterion: The provider request grants the model no tools.
  met: true
  how: the messages.create() call names only model, max_tokens, system and messages — no tools key appears
    anywhere
- criterion: The evaluations, the evidence and the register sit inside one delimited data block; no hypothesis's
    own criterion and no case when_to_use enters the prompt.
  met: true
  how: buildDataBlock wraps the three inputs in one <CONSOLIDATION_DATA> block, the sole content of the
    one user message; Evaluation and Evidence declare no criterion or when_to_use field, so neither can
    ever appear, enforced by the parameter types
- criterion: consolidate() returns the text alone — never an outcome, a referral or a determining hypothesis,
    none of which this call is given enough to decide.
  met: true
  how: consolidate()'s return type is Promise<string>, returning exactly textOf(response.content).trim();
    no outcome/referral/determining-hypothesis value is ever constructed
- criterion: The adapter imports @anthropic-ai/sdk for the call and no other HTTP client library.
  met: true
  how: the file's only value import is Anthropic from '@anthropic-ai/sdk'; every other import is type-only
nodes:
- node: domain/investigation/assessment-consolidator
  encoded_at:
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  how: the node's Responsibility is exactly this class's consolidate() signature and behavior — the second,
    live-model implementation of the port, beside the existing fake
- node: constraints/consolidation-runs-behind-a-port
  encoded_at:
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  how: one interchangeable adapter implementing IAssessmentConsolidator, imported by no domain file, so
    the fitness clause ("the investigation domain module imports no LLM client") holds while this is the
    one file that does; the statement's call-site clause belongs to task/diagnose-composition-root/wire-diagnose-runner,
    per this task's own Notes
- node: constraints/the-consolidation-prompt-is-closed
  encoded_at:
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  how: prompt assembly is a pure function of exactly the three inputs, delimited in one data block, no
    tools granted; the register maps to a fixed sentence per closed value, never interpolating free curator
    text
- node: constraints/the-domain-depends-on-no-infrastructure
  encoded_at:
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  how: this file is the one adapter reaching infrastructure, never imported by case.ts, investigation-factory.ts,
    evaluation.ts, evidence.ts, consolidation-register.ts or the port interface, so those domain files
    stay free of any provider-client import
inferences:
- inferred: 'the API key is an optional constructor field (apiKey?: string) falling back to process.env.ANTHROPIC_API_KEY'
  from: STK-11 requires the credential read from the environment, and this codebase's own convention takes
    dependencies through the constructor rather than reading global state directly
- inferred: model and maxTokens are required constructor fields with no default baked into source
  from: the task's explicit instruction that model/config are constructor parameters, and no specification
    node names a default model or token budget
- inferred: the delimited data block's exact shape — an XML-style <CONSOLIDATION_DATA> tag pair wrapping
    one JSON.stringify payload with snake_case consolidation_register
  from: the constraint's own 'delimited data block' phrase names no serialization format; the snake_case
    key mirrors this codebase's own JSON field-naming convention
- inferred: the exact wording of the system prompt's writing instruction and the two register-to-style
    sentences
  from: the port's Responsibility text names what the system prompt must accomplish, not its wording
- inferred: textOf() throws a plain Error when the response carries no text content block; consolidate()
    adds no try/catch around the provider call
  from: no node or criterion states adapter-level failure handling; mirrors this codebase's own existing
    fakes' plain-Error-on-unexpected-shape convention
preserved:
- IAssessmentConsolidator's own three-argument consolidate() signature, unchanged
- FakeAssessmentConsolidator and every existing test exercising it, untouched
- the dependency manifest's existing @anthropic-ai/sdk declaration — this task installed nothing
deferred:
- what: wiring AnthropicAssessmentConsolidator into the composition root, and choosing the concrete model
    name and token budget for a deployment
  why: belongs to task/diagnose-composition-root/wire-diagnose-runner, per this task's own Notes
- what: src/__tests__/unit/investigation/assessment-consolidator-modules.spec.ts's own "ships exactly
    one concrete class" assertion will now find a second matching file
  why: this implementer writes no tests and edits no spec file; flagged for the test-author, since a second
    adapter is this task's own intended objective, not a regression
---

## What it is

One new class implements the existing assessment-consolidator port against a live model.
It sits beside the existing fake adapter, never imported by anything the domain layer itself depends on.

## Notes

constraints/consolidation-runs-behind-a-port's call-site clause is not reached here; it belongs to task/diagnose-composition-root/wire-diagnose-runner.
assessment-consolidator-modules.spec.ts's own single-implementer assertion needs updating now that a second concrete class exists — this task's own intended objective, not a regression.
